import type { APIRoute } from 'astro';
import { respuestaIcs } from '../../lib/cita';
import { cargarEntradas, type Entrada } from '../../lib/entradas';

// Un fichero de calendario por entrada con día exacto: /actividades/<nombre>.ics
export async function getStaticPaths() {
  return (await cargarEntradas()).filter((e) => e.exacta).map((entrada) => ({ params: { slug: entrada.slug }, props: { entrada } }));
}

export const GET: APIRoute = ({ props, site }) => respuestaIcs(props.entrada as Entrada, 'es', site);
