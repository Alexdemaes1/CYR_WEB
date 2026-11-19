// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';

// En local, las variables de .env (clave del panel, base de datos) pasan a process.env,
// que es donde las lee el servidor igual que en Vercel. Lo ya definido en el entorno manda.
for (const [clave, valor] of Object.entries(loadEnv('', process.cwd(), ''))) process.env[clave] ??= valor;

// La dirección pública se fija con la variable SITE_URL al publicar. En Vercel, si no está,
// se usa el dominio de producción del proyecto. Sin ninguna de las dos, las URL absolutas
// (vista previa, calendario, cita) apuntan a localhost.
const deVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined;
const site = process.env.SITE_URL || deVercel || 'http://localhost:4321';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // La web es estática. Solo /api/brasa/* se ejecuta en el servidor (guardar y leer valoraciones).
  adapter: vercel(),
});
