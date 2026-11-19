import type { APIRoute } from 'astro';
import { claveCorrecta, csv, enHorario, env, hayAlmacen, leerVotos, vigentes } from '../../../lib/brasa';

export const prerender = false;

const json = (datos: unknown, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

/** Todas las valoraciones, con nombres y comentarios. Solo con la clave (cabecera x-clave). */
export const GET: APIRoute = async ({ request, url }) => {
  if (!env('BRASA_CLAVE')) return json({ error: 'Falta configurar la variable BRASA_CLAVE en el servidor.' }, 503);
  if (!claveCorrecta(request.headers.get('x-clave'))) return json({ error: 'Clave incorrecta.' }, 401);
  if (!hayAlmacen()) return json({ error: 'La actividad no está conectada a su base de datos.' }, 503);
  try {
    const votos = await leerVotos();
    if (url.searchParams.get('formato') === 'csv') {
      return new Response(csv(votos), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="brasa-humo-chicha.csv"', 'Cache-Control': 'no-store' },
      });
    }
    const actuales = new Set(vigentes(votos).map((v) => v.id));
    return json({ votos: votos.map((v) => ({ ...v, enHorario: enHorario(v), vigente: actuales.has(v.id) })).reverse() });
  } catch {
    return json({ error: 'No se pudieron leer las valoraciones.' }, 502);
  }
};
