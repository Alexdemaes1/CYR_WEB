# Web del Club de Ciencia y Redes

Web del Club de Ciencia y Redes, club de estudiantes de la Universidad Europea de Valencia. Es un sitio estático hecho con [Astro](https://astro.build): no tiene base de datos, ni cookies, ni formularios.

## Verla en tu ordenador

```
npm install
npm run dev
```

Se abre en `http://localhost:4321`.

## Añadir una actividad

1. Copia `src/content/entradas/_plantilla.md` y llámalo `AAAA-MM-DD-nombre-corto.md`.
2. Rellena los datos de arriba y escribe el texto debajo.
3. Haz lo mismo, en inglés y con el mismo nombre, en `src/content/entradas-en/`.
4. Si hay fotos, déjalas en `src/assets/fotos/nombre-corto/` y ejecuta `npm run fotos`.

La web decide sola si la actividad es próxima o pasada, la numera y la coloca en su sitio.

## Cambiar el enlace de WhatsApp

En `src/config.ts`, `WHATSAPP.url`. Si el enlace es de un canal, cambia también `tipo` a `'canal'` para que el aviso que acompaña al botón diga la verdad.

## Publicar

`npm run build` genera la web en `dist/`. Cualquier hosting de estáticos sirve.

La web está preparada para Vercel (la actividad "Brasa, humo o chicha" necesita un servidor para guardar las valoraciones):

1. En Vercel, **Add New > Project** e importa este repositorio. No hay que tocar nada: detecta Astro.
2. En el proyecto, pestaña **Storage > Create Database > Upstash for Redis** (plan gratuito) y conéctala al proyecto. Vercel añade sola las variables de la base de datos.
3. En **Settings > Environment Variables** añade `BRASA_CLAVE` (la clave del panel privado; invéntala larga) y, si tienes dominio propio, `SITE_URL`.
4. **Deployments > Redeploy** para que la web arranque con esas variables.

El panel con todas las valoraciones está en `/brasa/panel/`.

## Tipografía

Computer Modern, de Donald Knuth, en su versión Unicode (CMU), con licencia SIL Open Font License. La licencia está en `public/fonts/OFL.txt`.
