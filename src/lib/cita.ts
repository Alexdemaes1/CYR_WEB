import { CLUB } from '../config';
import { rutaFicha, type Lang } from '../i18n/ui';
import { textos, type Entrada } from './entradas';
import { madridAUtc } from './fechas';

const MESES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const escaparTex = (s: string) => s.replace(/([&%#_$])/g, '\\$1');

/** Bloque BibTeX de una entrada, hecho solo con sus datos reales. */
export function bibtex(entrada: Entrada, titulo: string, url: string): string {
  const fecha = entrada.es.data.fecha;
  const anio = fecha.getUTCFullYear();
  // La clave lleva el nombre público entero, que ya es único, para que dos entradas no choquen.
  const nombre = entrada.slug.normalize('NFD').replace(/[^a-z0-9-]/gi, '');
  const campos: [string, string][] = [
    ['author', `{{${escaparTex(CLUB.nombre)}}}`],
    ['title', `{${escaparTex(titulo)}}`],
    ['year', `{${anio}}`],
  ];
  if (entrada.es.data.precision !== 'curso') campos.push(['month', MESES[fecha.getUTCMonth()]]);
  campos.push(['howpublished', `{\\url{${url}}}`], ['note', `{${escaparTex(CLUB.afiliacion)}}`]);
  const ancho = Math.max(...campos.map(([k]) => k.length));
  return `@misc{cyr${anio}-${nombre},\n${campos.map(([k, v]) => `  ${k.padEnd(ancho)} = ${v}`).join(',\n')}\n}`;
}

const escaparIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// Las líneas de un .ics no pueden pasar de 75 octetos: se parten con salto y espacio.
function plegar(linea: string): string {
  const bytes = new TextEncoder();
  const trozos: string[] = [];
  let actual = '';
  for (const c of linea) {
    if (bytes.encode(actual + c).length > (trozos.length ? 74 : 75)) {
      trozos.push(actual);
      actual = c;
    } else actual += c;
  }
  trozos.push(actual);
  return trozos.join('\r\n ');
}

const compacta = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const diaSiguiente = (dia: string) => {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10);
};

/** Fichero de calendario de una entrada con día exacto, en el idioma pedido. */
export function ics(entrada: Entrada, lang: Lang, site: URL | undefined): string {
  const tx = textos(entrada, lang);
  const url = new URL(rutaFicha(lang, entrada.slug), site).href;
  const { hora, fin } = entrada.es.data;
  const dia = entrada.dia;
  const lineas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Club de Ciencia y Redes//Web//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT'];
  lineas.push(`UID:${entrada.slug}@${new URL(url).hostname}`);
  lineas.push(`DTSTAMP:${compacta(new Date())}`);
  if (hora) {
    const inicio = madridAUtc(dia, hora);
    lineas.push(`DTSTART:${compacta(inicio)}`);
    if (fin) {
      // Si acaba pasada la medianoche (18:00 a 01:00), el final es del día siguiente.
      let final = madridAUtc(dia, fin);
      if (final <= inicio) final = madridAUtc(diaSiguiente(dia), fin);
      lineas.push(`DTEND:${compacta(final)}`);
    }
  } else {
    lineas.push(`DTSTART;VALUE=DATE:${dia.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${diaSiguiente(dia).replace(/-/g, '')}`);
  }
  lineas.push(`SUMMARY:${escaparIcs(tx.titulo)}`, `DESCRIPTION:${escaparIcs(`${tx.resumen}\n${url}`)}`);
  if (tx.lugar) lineas.push(`LOCATION:${escaparIcs(tx.lugar)}`);
  lineas.push(`URL:${url}`);
  if (entrada.es.data.cancelado) lineas.push('STATUS:CANCELLED');
  lineas.push('END:VEVENT', 'END:VCALENDAR');
  return lineas.map(plegar).join('\r\n') + '\r\n';
}

export function respuestaIcs(entrada: Entrada, lang: Lang, site: URL | undefined): Response {
  return new Response(ics(entrada, lang, site), { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
