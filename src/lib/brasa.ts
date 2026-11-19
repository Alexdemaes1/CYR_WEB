// Servidor de "Brasa, humo o chicha": guardar y leer valoraciones.
// Solo lo usan los endpoints de src/pages/api/brasa/.
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { timingSafeEqual } from 'node:crypto';
import { EVENTO, SESIONES, abreA, type Categoria, type Sesion } from '../data/brasa';

export interface Voto {
  id: string;
  /** Instante en que el SERVIDOR recibió la valoración, ISO UTC. Es la hora que cuenta. */
  ts: string;
  /** La misma hora, en Madrid: "2026-11-20 10:42:17". */
  hora: string;
  nombre: string;
  correo: string;
  /** Id de la sesión del programa, u "otra" si el título se escribió a mano. */
  sesion: string;
  titulo: string;
  categoria: Categoria;
  comentario: string;
  nota?: number;
}

const CLAVE_LISTA = `brasa:${EVENTO.dia}`;
const MAX_VOTOS = 5000;

export const env = (nombre: string): string | undefined => process.env[nombre] || undefined;

// ---- Almacén: Redis de Upstash por REST en producción; un fichero local al desarrollar ----

function redis(): { url: string; token: string } | undefined {
  const url = env('KV_REST_API_URL') ?? env('UPSTASH_REDIS_REST_URL');
  const token = env('KV_REST_API_TOKEN') ?? env('UPSTASH_REDIS_REST_TOKEN');
  return url && token ? { url, token } : undefined;
}

async function orden<T>(comando: (string | number)[]): Promise<T> {
  const r = redis()!;
  const res = await fetch(r.url, { method: 'POST', headers: { Authorization: `Bearer ${r.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(comando) });
  if (!res.ok) throw new Error(`Almacén: ${res.status}`);
  return ((await res.json()) as { result: T }).result;
}

const FICHERO_LOCAL = '.datos/brasa.jsonl';

/** ¿Hay dónde guardar? En producción sin base de datos, no: y se dice, no se pierde en silencio. */
export function hayAlmacen(): boolean {
  return Boolean(redis()) || import.meta.env.DEV;
}

export async function leerVotos(): Promise<Voto[]> {
  if (redis()) return (await orden<string[]>(['LRANGE', CLAVE_LISTA, 0, -1])).map((v) => JSON.parse(v) as Voto);
  try {
    return (await readFile(FICHERO_LOCAL, 'utf8')).split('\n').filter(Boolean).map((l) => JSON.parse(l) as Voto);
  } catch {
    return [];
  }
}

/** Cuántas valoraciones hay, sin traerlas todas. */
export async function contarVotos(): Promise<number> {
  if (redis()) return orden<number>(['LLEN', CLAVE_LISTA]);
  return (await leerVotos()).length;
}

/**
 * La hora del servidor. Solo al desarrollar en local se puede fingir con BRASA_AHORA
 * (por ejemplo 2026-11-20T09:42:00Z) para probar los horarios; publicada, es siempre la real.
 */
export function ahoraServidor(): Date {
  const fingida = import.meta.env.DEV ? env('BRASA_AHORA') : undefined;
  return fingida ? new Date(fingida) : new Date();
}

export async function guardarVoto(voto: Voto): Promise<number> {
  if (redis()) return orden<number>(['RPUSH', CLAVE_LISTA, JSON.stringify(voto)]);
  await mkdir('.datos', { recursive: true });
  await appendFile(FICHERO_LOCAL, JSON.stringify(voto) + '\n', 'utf8');
  return (await leerVotos()).length;
}

// ---- Hora ----

export function horaMadrid(instante: Date): string {
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(instante);
  const v = (t: string) => p.find((x) => x.type === t)!.value;
  return `${v('year')}-${v('month')}-${v('day')} ${v('hour')}:${v('minute')}:${v('second')}`;
}

const minutos = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** ¿Ha terminado ya el plazo de toda la actividad? `hora` es la del servidor en Madrid. */
export function actividadCerrada(hora: string): boolean {
  return env('BRASA_ABIERTO') !== '1' && hora.split(' ')[0] >= EVENTO.cierra;
}

/**
 * ¿Se puede valorar ya esta charla? Desde que lleva EVENTO.abreAl de su duración prevista,
 * y ya no se vuelve a cerrar hasta el cierre de la actividad.
 * `hora` es la del servidor en Madrid ("AAAA-MM-DD HH:MM:SS"). BRASA_ABIERTO=1 lo abre todo (pruebas).
 */
export function sesionAbierta(sesion: Sesion, hora: string): boolean {
  if (env('BRASA_ABIERTO') === '1') return true;
  const [dia, reloj] = hora.split(' ');
  if (dia !== EVENTO.dia) return dia > EVENTO.dia;
  return minutos(reloj) >= minutos(abreA(sesion));
}

/**
 * ¿Se envió durante el tramo final de la charla o poco después (margen de cortesía)?
 * 'si' | 'no' | '' cuando no se puede saber (charla escrita a mano).
 */
export function enHorario(voto: Voto): 'si' | 'no' | '' {
  const sesion = SESIONES.find((s) => s.id === voto.sesion);
  if (!sesion) return '';
  const [dia, reloj] = voto.hora.split(' ');
  if (dia !== EVENTO.dia) return 'no';
  const m = minutos(reloj);
  const fin = sesion.fin ? minutos(sesion.fin) : minutos(sesion.inicio) + 30;
  return m >= minutos(abreA(sesion)) && m <= fin + EVENTO.margen ? 'si' : 'no';
}

// ---- Validación ----

// Caracteres de control (menos el salto de línea) que no deben guardarse.
const CONTROL = new RegExp('[\\u0000-\\u0008\\u000b-\\u001f\\u007f]', 'g');
const limpiar = (s: unknown, max: number) => String(s ?? '').replace(CONTROL, '').replace(/\s+/g, ' ').trim().slice(0, max);
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Resultado = { ok: true; voto: Omit<Voto, 'id' | 'ts' | 'hora'>; sesion?: Sesion } | { ok: false; error: string };

export function validar(cuerpo: Record<string, unknown>): Resultado {
  const nombre = limpiar(cuerpo.nombre, 80);
  if (nombre.length < 5 || !nombre.includes(' ')) return { ok: false, error: 'Escribe tu nombre y apellidos.' };

  const correo = limpiar(cuerpo.correo, 120).toLowerCase();
  if (!CORREO.test(correo)) return { ok: false, error: 'Escribe tu correo de la universidad.' };

  const categoria = String(cuerpo.categoria) as Categoria;
  if (!['brasa', 'humo', 'chicha'].includes(categoria)) return { ok: false, error: 'Elige brasa, humo o chicha.' };

  const comentario = String(cuerpo.comentario ?? '').replace(CONTROL, '').trim().slice(0, 600);
  if (comentario.length < EVENTO.comentarioMin) return { ok: false, error: `El comentario es obligatorio: al menos ${EVENTO.comentarioMin} letras.` };

  const idSesion = limpiar(cuerpo.sesion, 40);
  const sesion = SESIONES.find((s) => s.id === idSesion);
  const titulo = sesion ? sesion.titulo : limpiar(cuerpo.titulo, 160);
  if (!sesion && titulo.length < 4) return { ok: false, error: 'Di qué charla es.' };

  let nota: number | undefined;
  if (EVENTO.conNota && cuerpo.nota !== undefined && cuerpo.nota !== null && cuerpo.nota !== '') {
    nota = Number(cuerpo.nota);
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) return { ok: false, error: 'La nota va de 1 a 5.' };
  }

  return { ok: true, sesion, voto: { nombre, correo, sesion: sesion ? sesion.id : 'otra', titulo, categoria, comentario, ...(nota ? { nota } : {}) } };
}

export async function registrar(datos: Omit<Voto, 'id' | 'ts' | 'hora'>, sesion?: Sesion): Promise<{ voto: Voto; numero: number } | { error: string }> {
  const ahora = ahoraServidor();
  const hora = horaMadrid(ahora);
  if (actividadCerrada(hora)) return { error: 'La actividad ya está cerrada. Gracias por participar.' };
  if (sesion && !sesionAbierta(sesion, hora)) return { error: `Esa charla se puede valorar a partir de las ${abreA(sesion)}.` };
  if ((await contarVotos()) >= MAX_VOTOS) return { error: 'La actividad ya no admite más valoraciones.' };
  const voto: Voto = { id: crypto.randomUUID().slice(0, 8), ts: ahora.toISOString(), hora, ...datos };
  const numero = await guardarVoto(voto);
  return { voto, numero };
}

// ---- Lecturas ----

const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** De cada persona (por su correo) y charla cuenta solo su última valoración. */
export function vigentes(votos: Voto[]): Voto[] {
  const ultimo = new Map<string, Voto>();
  for (const v of votos) ultimo.set(`${v.correo ?? sinTildes(v.nombre)}|${v.sesion === 'otra' ? sinTildes(v.titulo) : v.sesion}`, v);
  return [...ultimo.values()];
}

export interface Marcador {
  /** Hora del servidor, para que el móvil no dependa de su propio reloj. */
  ahora: string;
  total: number;
  sesiones: Record<string, Record<Categoria, number>>;
}

/** Recuento público: solo números por charla del programa. Ni nombres, ni correos, ni comentarios. */
export function marcador(votos: Voto[]): Marcador {
  const sesiones: Marcador['sesiones'] = {};
  const validos = vigentes(votos).filter((v) => v.sesion !== 'otra');
  for (const v of validos) {
    sesiones[v.sesion] ??= { brasa: 0, humo: 0, chicha: 0 };
    sesiones[v.sesion][v.categoria]++;
  }
  return { ahora: ahoraServidor().toISOString(), total: validos.length, sesiones };
}

export function claveCorrecta(recibida: string | null): boolean {
  const buena = env('BRASA_CLAVE');
  if (!buena || !recibida) return false;
  const a = Buffer.from(recibida);
  const b = Buffer.from(buena);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Un texto que empieza por = + - @ se abriría en Excel como fórmula: se le antepone un apóstrofo.
const FORMULA = new RegExp('^[=+@\\t\\r-]');
const celda = (v: unknown) => {
  const texto = String(v ?? '');
  return `"${(FORMULA.test(texto) ? `'${texto}` : texto).replace(/"/g, '""')}"`;
};

/** CSV para Excel en español: separado por punto y coma y con BOM. */
export function csv(votos: Voto[]): string {
  const actuales = new Set(vigentes(votos).map((v) => v.id));
  const filas = [['hora_servidor', 'nombre', 'correo', 'charla', 'categoria', 'nota', 'comentario', 'en_horario', 'vigente', 'id'].join(';')];
  for (const v of votos) {
    filas.push([v.hora, v.nombre, v.correo, v.titulo, v.categoria, v.nota ?? '', v.comentario, enHorario(v), actuales.has(v.id) ? 'si' : 'no', v.id].map(celda).join(';'));
  }
  return '﻿' + filas.join('\r\n') + '\r\n';
}
