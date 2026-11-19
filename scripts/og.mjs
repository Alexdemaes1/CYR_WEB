// Genera public/og.png, la imagen que sale al pegar un enlace de la web en WhatsApp o Instagram.
// Es solo la gráfica: un atractor de Lorenz en rojo sobre papel, sin texto.
// Uso: npm run og
import sharp from 'sharp';
import { CAJA, EJES, escalaX, escalaZ, trazoLorenz } from '../src/lib/lorenz.ts';

const X0 = 19.11; // 19 de noviembre: el día en que se hizo la web
const marcas = [
  ...EJES.marcasX.map((x) => `M${escalaX(x)} ${CAJA.abajo}v-5M${escalaX(x)} ${CAJA.arriba}v5`),
  ...EJES.marcasZ.map((z) => `M${CAJA.izq} ${escalaZ(z)}h5M${CAJA.der} ${escalaZ(z)}h-5`),
].join('');

// La gráfica (374 x 244 unidades) se escala x2,3 y se centra en 1200 x 630.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fffefa"/>
  <g transform="translate(${600 - 2.3 * (CAJA.izq + CAJA.der) / 2} ${315 - 2.3 * (CAJA.arriba + CAJA.abajo) / 2}) scale(2.3)" fill="none">
    <rect x="${CAJA.izq}" y="${CAJA.arriba}" width="${CAJA.der - CAJA.izq}" height="${CAJA.abajo - CAJA.arriba}" stroke="#1e1e1e" stroke-width="0.8"/>
    <path d="${marcas}" stroke="#1e1e1e" stroke-width="0.8"/>
    <path d="${trazoLorenz(X0)}" stroke="#ff3228" stroke-width="0.9" stroke-linejoin="round" stroke-linecap="round"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og.png');
console.log('public/og.png');
