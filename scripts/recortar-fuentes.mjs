// Recorta Computer Modern (paquete npm "computer-modern", licencia OFL) a los
// caracteres de español e inglés y deja los WOFF2 en public/fonts/.
// Uso: npm run fuentes   (solo hace falta si se cambian las fuentes)
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import subsetFont from 'subset-font';

const ORIGEN = 'node_modules/computer-modern/fonts/';
const DESTINO = 'public/fonts/';
const FUENTES = [
  ['cmu-serif-500-roman', 'cmu-serif-roman'],
  ['cmu-serif-500-italic', 'cmu-serif-italic'],
  ['cmu-serif-700-roman', 'cmu-serif-bold'],
  ['cmu-typewriter-text-500-roman', 'cmu-typewriter'],
];

let texto = '';
for (let c = 0x20; c <= 0x7e; c++) texto += String.fromCharCode(c);
for (let c = 0xa0; c <= 0xff; c++) texto += String.fromCharCode(c);
texto += '–—‘’“”„…·•€′″←→↑↓−×≈≤≥†‡§ŒœŠšŽžŸ';

await mkdir(DESTINO, { recursive: true });
for (const [entrada, salida] of FUENTES) {
  const original = await readFile(`${ORIGEN}${entrada}.ttf`);
  const recortada = await subsetFont(original, texto, { targetFormat: 'woff2' });
  await writeFile(`${DESTINO}${salida}.woff2`, recortada);
  console.log(`${salida}.woff2  ${(recortada.length / 1024).toFixed(1)} KB`);
}
await copyFile('node_modules/computer-modern/OFL.txt', `${DESTINO}OFL.txt`);
