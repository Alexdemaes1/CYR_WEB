import type { APIRoute } from 'astro';
import { respuestaIcs } from '../../../lib/cita';
import { cargarEntradas, type Entrada } from '../../../lib/entradas';

// El mismo calendario en inglés: /en/activities/<nombre>.ics
export async function getStaticPaths() {
  return (await cargarEntradas()).filter((e) => e.exacta).map((entrada) => ({ params: { slug: entrada.slug }, props: { entrada } }));
}

export const GET: APIRoute = ({ props, site }) => respuestaIcs(props.entrada as Entrada, 'en', site);
