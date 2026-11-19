// Prepara las fotos de src/assets/fotos/ antes de subirlas al repositorio:
// lado mayor a 2000 px como máximo y sin metadatos (fuera la posición GPS del móvil).
// Uso: npm run fotos
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const RAIZ = 'src/assets/fotos';
const MAX = 2000;

for (const entrada of await readdir(RAIZ, { recursive: true, withFileTypes: true })) {
  if (!entrada.isFile() || entrada.name.startsWith('.')) continue;
  const ruta = join(entrada.parentPath, entrada.name);
  if (!/\.(jpe?g|png|webp)$/i.test(entrada.name)) {
    console.warn(`${ruta}  NO se va a publicar: la web solo usa .jpg, .png y .webp (conviértela primero)`);
    continue;
  }
  const original = await readFile(ruta);
  const m = await sharp(original).metadata();
  // Se decide por contenido, no por peso: una foto pequeña con GPS también hay que limpiarla.
  const conMetadatos = Boolean(m.exif || m.xmp || m.iptc || (m.orientation ?? 1) !== 1);
  const grande = Math.max(m.width ?? 0, m.height ?? 0) > MAX;
  if (!conMetadatos && !grande) {
    console.log(`${ruta}  ya estaba lista`);
    continue;
  }
  // rotate() aplica la orientación antes de que se pierdan los metadatos al reescribir.
  const limpia = await sharp(original).rotate().resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true }).toBuffer();
  await writeFile(ruta, limpia);
  console.log(`${ruta}  ${(original.length / 1024).toFixed(0)} KB -> ${(limpia.length / 1024).toFixed(0)} KB${conMetadatos ? ', metadatos quitados' : ''}`);
}
