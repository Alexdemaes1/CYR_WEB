import { LOCALE, type Lang } from '../i18n/ui';

// Las fechas de las entradas son días de calendario (sin hora) y se leen siempre en UTC,
// que es como las entrega el YAML. La zona del club es Europe/Madrid.
const ZONA = 'Europe/Madrid';

export type Precision = 'dia' | 'mes' | 'curso';

/** 'YYYY-MM-DD' del día de calendario de una fecha de entrada. */
export function isoDia(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

/** Último día que cubre una entrada según su precisión: el propio día, el fin del mes o el 31 de agosto del curso. */
export function ultimoDia(fecha: Date, precision: Precision): string {
  const anio = fecha.getUTCFullYear();
  const mes = fecha.getUTCMonth();
  if (precision === 'mes') return isoDia(new Date(Date.UTC(anio, mes + 1, 0)));
  if (precision === 'curso') return `${mes >= 8 ? anio + 1 : anio}-08-31`;
  return isoDia(fecha);
}

/**
 * ¿Está oculto hoy un elemento con ventana de fechas? Misma regla que el script de Paper.astro:
 * `desde` = visible a partir del día siguiente; `hasta` = visible hasta ese día incluido.
 */
export function fueraDeVentana(desde?: string, hasta?: string, hoy: string = hoyMadrid()): boolean {
  return !((!desde || desde < hoy) && (!hasta || hasta >= hoy));
}

/** 'YYYY-MM-DD' de hoy en Madrid. */
export function hoyMadrid(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
}

/** Curso académico al que pertenece una fecha: de septiembre a agosto. '2026-27'. */
export function curso(fecha: Date): string {
  const anio = fecha.getUTCFullYear();
  const inicio = fecha.getUTCMonth() >= 8 ? anio : anio - 1;
  return `${inicio}-${String((inicio + 1) % 100).padStart(2, '0')}`;
}

function mayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** 'Jueves, 26 de noviembre de 2026' · 'Noviembre de 2026' · 'Curso 2026-27'. */
export function fechaLarga(fecha: Date, precision: Precision, lang: Lang): string {
  if (precision === 'curso') return `${lang === 'es' ? 'Curso' : 'Academic year'} ${curso(fecha)}`;
  const opciones: Intl.DateTimeFormatOptions =
    precision === 'mes'
      ? { month: 'long', year: 'numeric', timeZone: 'UTC' }
      : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
  return mayuscula(new Intl.DateTimeFormat(LOCALE[lang], opciones).format(fecha));
}

/** 'Jueves, 26 de noviembre': para lo próximo, donde el año sobra. */
export function fechaSinAnio(fecha: Date, lang: Lang): string {
  return mayuscula(new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(fecha));
}

/** '26 nov 2026' · 'nov 2026' · 'curso 2026-27'. */
export function fechaCorta(fecha: Date, precision: Precision, lang: Lang): string {
  if (precision === 'curso') return `${lang === 'es' ? 'curso' : 'year'} ${curso(fecha)}`;
  const opciones: Intl.DateTimeFormatOptions =
    precision === 'mes'
      ? { month: 'short', year: 'numeric', timeZone: 'UTC' }
      : { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(LOCALE[lang], opciones).format(fecha).replace(/\./g, '');
}

/** Fecha de la última compilación, en Madrid: '19 de noviembre de 2026'. */
export function fechaRevision(lang: Lang, ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA }).format(ahora);
}

/** Convierte un día y una hora de Madrid al instante UTC correspondiente. */
export function madridAUtc(dia: string, hora: string): Date {
  const [a, m, d] = dia.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  const supuesto = Date.UTC(a, m - 1, d, h, min);
  // Dos pasadas: el desfase se mide primero en el instante supuesto y luego en el corregido,
  // para acertar también en la madrugada del cambio de hora.
  const primero = supuesto - desfaseMadrid(supuesto);
  return new Date(supuesto - desfaseMadrid(primero));
}

/** Milisegundos que Madrid va por delante de UTC en un instante dado. */
function desfaseMadrid(instante: number): number {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date(instante));
  const v = (tipo: string) => Number(partes.find((p) => p.type === tipo)!.value);
  return Date.UTC(v('year'), v('month') - 1, v('day'), v('hour'), v('minute')) - instante;
}
