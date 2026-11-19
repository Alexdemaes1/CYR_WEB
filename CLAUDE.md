# Web del Club de Ciencia y Redes (UEV)

Sitio estático en Astro. Lo mantiene una persona con ayuda de un asistente. Ver también `AGENTS.md` (servidor de desarrollo y documentación de Astro).

## Regla de contenido (la más importante)

**La web solo contiene lo que el club ha aportado o aprobado.** Nada de datos reconstruidos de internet, textos de relleno, eslóganes, cifras ni ejemplos.

- Si falta un dato (hora, aula, inscripción…), se pregunta o se omite el campo. Nunca se inventa.
- Lo que esté vacío en `src/config.ts` no se pinta. No hay textos por defecto.
- Los textos de las entradas se copian tal cual del documento que pase el club. `titulo`, `resumen` y `lugar` se redactan solo con lo que dice ese documento.
- La traducción al inglés de un texto del club no es contenido inventado: se hace siempre y debe ser fiel.
- Lo único que genera el sistema sale de datos reales: fecha de revisión, numeración, "hoy / mañana", la gráfica de Lorenz, el `.ics` y el BibTeX.

## Estilo

La web está maquetada como un artículo científico en LaTeX, y esa estructura es la de la web: bloque de título, resumen, secciones numeradas, tablas con filetes, figuras con pie, notas al pie, referencias `[n]` y "Cómo citar".

- Una sola familia tipográfica: Computer Modern (`public/fonts/`, licencia OFL). Sin sans, sin iconos, sin emojis.
- Papel `#fffefa`, tinta `#1e1e1e` y un único color: el rojo `#ff3228` de Universidad Europea (enlaces con recuadro, botón, línea de las figuras). Rojo en texto pequeño: `#da0a00`.
- Sin sombras, sin esquinas redondeadas, sin degradados, sin animaciones.
- Un botón rojo por pantalla como máximo. Lo demás son enlaces con recuadro.
- Palabras llanas ("Actividades", "Próxima actividad"). La forma es de paper; el vocabulario, no.
- La universidad aparece solo en la línea de afiliación, en el rojo y en su logo del pie.

## Añadir una actividad

1. Copiar `src/content/entradas/_plantilla.md` como `src/content/entradas/AAAA-MM-DD-nombre-corto.md`. La dirección pública será `/actividades/nombre-corto/` (sin la fecha, para que aplazar no rompa enlaces).
2. Rellenar la cabecera y pegar el texto. Cada `## Título` se numera solo.
3. Crear la versión inglesa con el **mismo nombre de fichero** en `src/content/entradas-en/` (solo `titulo`, `resumen`, textos traducibles y el cuerpo).
4. Fotos, si hay: en `src/assets/fotos/nombre-corto/`. `portada.jpg` va la primera. Antes de subirlas: `npm run fotos` (las baja a 2000 px y les quita los metadatos). Máximo 12. Pies opcionales en el campo `pies`.
5. `npm run build` y revisar.

Próximo o pasado se decide solo por la fecha. Si la entrada no tiene fotos, su figura es un atractor de Lorenz con `x0 = día,mes`; el pie de figura lo explica y debe seguir siendo verdad (ver `src/lib/lorenz.ts`).

## Dónde está cada cosa

- `src/config.ts`: enlace de WhatsApp (y si es grupo o canal), Instagram, resumen y texto del club.
- `src/i18n/ui.ts`: todos los textos fijos de la interfaz, en español e inglés, y las rutas.
- `src/vistas/`: una vista por tipo de página; `src/pages/` solo las enlaza en cada idioma.
- `src/layouts/Paper.astro`: cabecera, pie, metadatos y el script que corrige los estados por fecha (`data-hasta`, `data-desde`, `data-dia`).
- `src/styles/paper.css`: todo el estilo.

## Pendiente del club

- Pasar de grupo a canal de WhatsApp: cambiar `url` y `tipo` en `src/config.ts`.
- Resumen del club y página "El club": hoy vacíos; al rellenar `TEXTO_CLUB` hay que crear `src/pages/club.astro` y `src/pages/en/club.astro`.
- Logo original del club: el micrófono de `src/components/Micro.astro` y `public/favicon.svg` es un redibujo provisional.
- Dirección pública: variable `SITE_URL` al publicar.

## Comandos

- `npm run dev` (ver `AGENTS.md`), `npm run build`, `npm run preview`
- `npm run fotos`, `npm run og` (imagen de vista previa), `npm run fuentes` (recorte de Computer Modern)
