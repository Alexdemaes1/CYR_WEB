import type { APIRoute } from 'astro';
import { actividadCerrada, ahoraServidor, env, hayAlmacen, horaMadrid, leerVotos, marcador, registrar, validar } from '../../../lib/brasa';

// Se ejecuta en el servidor (el resto de la web es estática).
export const prerender = false;

const json = (datos: unknown, status = 200) =>
  new Response(JSON.stringify(datos), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

const SIN_ALMACEN = 'La actividad todavía no está conectada a su base de datos. Avisa a quien la organiza.';

/** Recuento público por charla: solo números. */
export const GET: APIRoute = async () => {
  if (!hayAlmacen()) return json({ error: SIN_ALMACEN }, 503);
  try {
    // todoAbierto solo es cierto en pruebas (BRASA_ABIERTO=1): la página desbloquea todas las charlas.
    const cuerpo = { ...marcador(await leerVotos()), todoAbierto: env('BRASA_ABIERTO') === '1', cerrada: actividadCerrada(horaMadrid(ahoraServidor())) };
    // Cien móviles preguntan cada 20 segundos. La red de Vercel guarda la respuesta 10 segundos y la
    // reparte a todos, así la base de datos recibe unas pocas consultas por minuto y no una por móvil.
    return new Response(JSON.stringify(cuerpo), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=20' },
    });
  } catch {
    return json({ error: 'No se pudo leer el marcador.' }, 502);
  }
};

/** Guarda una valoración. La hora la pone el servidor; la del móvil no se usa. */
export const POST: APIRoute = async ({ request }) => {
  if (!hayAlmacen()) return json({ error: SIN_ALMACEN }, 503);
  let cuerpo: Record<string, unknown>;
  try {
    const texto = await request.text();
    if (texto.length > 4000) return json({ error: 'Demasiado texto.' }, 413);
    cuerpo = JSON.parse(texto);
  } catch {
    return json({ error: 'Petición mal formada.' }, 400);
  }
  // Campo trampa: las personas no lo ven; si llega relleno es un bot.
  if (cuerpo.web) return json({ error: 'Petición rechazada.' }, 400);

  const resultado = validar(cuerpo);
  if (!resultado.ok) return json({ error: resultado.error }, 422);
  try {
    const guardado = await registrar(resultado.voto, resultado.sesion);
    if ('error' in guardado) return json({ error: guardado.error }, 409);
    const { voto, numero } = guardado;
    return json({ ok: true, numero, id: voto.id, hora: voto.hora, sesion: voto.sesion, titulo: voto.titulo, categoria: voto.categoria, nota: voto.nota ?? null }, 201);
  } catch {
    return json({ error: 'No se pudo guardar. Vuelve a intentarlo en un momento.' }, 502);
  }
};
