// Datos del club. REGLA: aquí solo entra lo que el club ha aportado.
// Lo que esté vacío no se pinta en la web; nunca se rellena con texto inventado.

export const CLUB = {
  nombre: 'Club de Ciencia y Redes',
  afiliacion: 'Universidad Europea de Valencia',
};

// Enlace de avisos por WhatsApp. Al pasar del grupo al canal, se cambia aquí y nada más.
// tipo 'grupo': quien entra ve los números de los demás, y la web lo avisa.
// tipo 'canal': solo escribe el club y nadie ve el número de nadie.
export const WHATSAPP: { url: string; tipo: 'grupo' | 'canal' } = {
  url: 'https://chat.whatsapp.com/HlPS4hhrZHxAXxiICHcAp8',
  tipo: 'grupo',
};

export const INSTAGRAM = 'https://www.instagram.com/club_ciencia_y_redes_uev/';

// Resumen del club para la portada (dos o tres frases, con palabras del club).
// Vacío = la portada sale sin el bloque "Resumen".
export const RESUMEN: Record<'es' | 'en', string> = {
  es: '',
  en: '',
};

// Página "El club". Vacío = ni la página ni su enlace existen.
// Cuando haya texto: rellenar aquí y crear src/pages/club.astro y src/pages/en/club.astro.
export const TEXTO_CLUB: Record<'es' | 'en', string> = {
  es: '',
  en: '',
};
