// @ts-check
import { defineConfig } from 'astro/config';

// La dirección pública se fija con la variable SITE_URL al publicar.
// Mientras no exista, las URL absolutas (vista previa, calendario, cita) apuntan a localhost.
const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
});
