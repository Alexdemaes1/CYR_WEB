import { existsSync, readdirSync } from 'node:fs';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/ui';
import { hoyMadrid, isoDia, ultimoDia } from './fechas';

export interface Entrada {
  /** Nombre público en la URL: el del fichero sin la fecha delante. */
  slug: string;
  /** Número de referencia [n]: orden cronológico, la más antigua es [1]. */
  numero: number;
  /** Día de la entrada, 'AAAA-MM-DD'. */
  dia: string;
  /** Último día en que sigue siendo "próxima": el propio día, o el fin del mes o del curso. */
  hasta: string;
  /** Todavía no ha pasado, al compilar. En el navegador lo corrige el script de Paper.astro. */
  proxima: boolean;
  /** Tiene día exacto (lleva calendario y "hoy / mañana"). */
  exacta: boolean;
  es: CollectionEntry<'entradas'>;
  en?: CollectionEntry<'entradasEn'>;
}

const sinFecha = (id: string) => id.replace(/^\d{4}-\d{2}-\d{2}-/, '');

const CARPETAS = ['src/content/entradas', 'src/content/entradas-en'];
const RAIZ_FOTOS = 'src/assets/fotos';

// Lo que Astro ignoraría en silencio se convierte en error con explicación.
function comprobarFicheros(slugs: Set<string>) {
  for (const carpeta of CARPETAS) {
    if (!existsSync(carpeta)) continue;
    for (const f of readdirSync(carpeta, { withFileTypes: true })) {
      if (f.name.startsWith('_') || f.name.startsWith('.')) continue;
      if (f.isDirectory() || !f.name.endsWith('.md')) {
        throw new Error(`${carpeta}/${f.name} no se va a publicar: las entradas son ficheros .md sueltos en esa carpeta.`);
      }
    }
  }
  if (!existsSync(RAIZ_FOTOS)) return;
  for (const f of readdirSync(RAIZ_FOTOS, { withFileTypes: true })) {
    if (f.isDirectory() && !slugs.has(f.name)) {
      throw new Error(`La carpeta de fotos "${RAIZ_FOTOS}/${f.name}" no corresponde a ninguna actividad. Nombres válidos: ${[...slugs].join(', ')}.`);
    }
  }
}

let cache: Promise<Entrada[]> | undefined;

/** Todas las entradas, de la más antigua a la más reciente. */
export function cargarEntradas(): Promise<Entrada[]> {
  cache ??= (async () => {
    const [es, en] = await Promise.all([getCollection('entradas'), getCollection('entradasEn')]);
    const hoy = hoyMadrid();
    const ordenadas = [...es].sort(
      (a, b) => a.data.fecha.getTime() - b.data.fecha.getTime() || (a.data.hora ?? '').localeCompare(b.data.hora ?? '') || a.id.localeCompare(b.id),
    );
    const vistos = new Set<string>();
    const lista = ordenadas.map((entrada, i): Entrada => {
      const slug = sinFecha(entrada.id);
      if (vistos.has(slug)) throw new Error(`Dos entradas comparten el nombre público "${slug}". Cambia el nombre de uno de los ficheros.`);
      vistos.add(slug);
      const hasta = ultimoDia(entrada.data.fecha, entrada.data.precision);
      return {
        slug,
        numero: i + 1,
        dia: isoDia(entrada.data.fecha),
        hasta,
        proxima: hasta >= hoy,
        exacta: entrada.data.precision === 'dia',
        es: entrada,
        en: en.find((e) => e.id === entrada.id),
      };
    });
    for (const e of en) {
      if (!es.some((x) => x.id === e.id)) throw new Error(`entradas-en/${e.id} no tiene entrada en español con el mismo nombre de fichero.`);
    }
    comprobarFicheros(vistos);
    const sinIngles = lista.filter((e) => !e.en).map((e) => e.es.id);
    if (sinIngles.length) console.warn(`[entradas] Sin versión en inglés: ${sinIngles.join(', ')}`);
    return lista;
  })();
  return cache;
}

/** Próximas, de la que antes caduca a la que más tarda. */
export function ordenProximas(entradas: Entrada[]): Entrada[] {
  return entradas.filter((e) => e.proxima).sort((a, b) => a.hasta.localeCompare(b.hasta) || a.numero - b.numero);
}

const CAMPOS = ['titulo', 'resumen', 'lugar', 'para_quien', 'hay_que', 'aviso'] as const;
type Campo = (typeof CAMPOS)[number];

/** Textos de una entrada en el idioma pedido; lo que falte en inglés cae al español. */
export function textos(entrada: Entrada, lang: Lang) {
  const es = entrada.es.data;
  const en = lang === 'en' ? entrada.en?.data : undefined;
  const valor = (campo: Campo) => en?.[campo] ?? es[campo];
  return {
    titulo: valor('titulo') as string,
    resumen: valor('resumen') as string,
    lugar: valor('lugar'),
    para_quien: valor('para_quien'),
    hay_que: valor('hay_que'),
    aviso: valor('aviso'),
    pies: { ...es.pies, ...(en?.pies ?? {}) } as Record<string, string>,
    /** 'es' si en la página inglesa ese campo sale en español (para el atributo lang). */
    idioma: (campo: Campo): 'es' | undefined => (lang === 'en' && en?.[campo] === undefined && es[campo] !== undefined ? 'es' : undefined),
  };
}

// Fotos: se sueltan en src/assets/fotos/<slug>/ y aparecen solas. "portada.*" va la primera.
const ficheros = import.meta.glob<{ default: ImageMetadata }>('/src/assets/fotos/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}', { eager: true });
const MAX_FOTOS = 12;

export interface Foto {
  nombre: string;
  imagen: ImageMetadata;
}

export function fotosDe(slug: string): Foto[] {
  const prefijo = `/src/assets/fotos/${slug}/`;
  const esPortada = (n: string) => (/^portada\./i.test(n) ? 0 : 1);
  return Object.entries(ficheros)
    .filter(([ruta]) => ruta.startsWith(prefijo))
    .map(([ruta, modulo]) => ({ nombre: ruta.slice(prefijo.length), imagen: modulo.default }))
    .sort((a, b) => esPortada(a.nombre) - esPortada(b.nombre) || a.nombre.localeCompare(b.nombre))
    .slice(0, MAX_FOTOS);
}
