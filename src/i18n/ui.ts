export type Lang = 'es' | 'en';

export const LOCALE: Record<Lang, string> = { es: 'es-ES', en: 'en-GB' };

const ui = {
  es: {
    actividades: 'Actividades',
    club: 'El club',
    avisos: 'Avisos',
    otroIdioma: 'English',
    revisado: 'Revisado el',
    resumen: 'Resumen.',
    proxima: 'Próxima actividad',
    tambien: 'También con fecha',
    nadaConFecha: 'Nada con fecha todavía. Cuando lo haya, lo decimos por WhatsApp.',
    anteriores: 'Actividades anteriores',
    todas: 'Todas las actividades',
    proximamente: 'Próximamente',
    curso: 'Curso',
    cuando: 'Cuándo',
    donde: 'Dónde',
    paraQuien: 'Para quién',
    hayQue: 'Hay que',
    recibirAvisos: 'Recibir avisos por WhatsApp',
    avisosWhatsapp: 'Avisos por WhatsApp',
    verActividad: 'Ver la actividad',
    calendario: 'Añadir al calendario',
    apuntarme: 'Apuntarme',
    cancelado: 'Cancelado',
    aviso: 'Aviso.',
    figura: 'Figura',
    foto: 'Fotografía',
    comoCitar: 'Cómo citar',
    soloEspanol: 'El texto completo solo está en español por ahora.',
    notaGrupo: 'Se abre WhatsApp. Es un grupo: quien esté dentro verá tu número de teléfono.',
    notaCanal: 'Se abre WhatsApp. Es un canal: solo escribe el club y nadie ve tu número.',
    escanea: 'Escanea el código con el móvil para abrir WhatsApp.',
    enlaceDirecto: 'Si el botón no abre WhatsApp, copia este enlace:',
    pieClub: 'Club de estudiantes de la Universidad Europea de Valencia. Web hecha por el club.',
    avisoLegal: 'Aviso legal',
    inicio: 'Inicio',
    sinFotoProxima: 'Todavía no hay foto porque todavía no ha pasado.',
    sinFotoPasada: 'Sin fotos por ahora.',
    lorenz: 'En su lugar, un atractor de Lorenz con',
    lorenzFecha: 'la fecha de la actividad',
    lorenzAlt: 'Gráfica de un atractor de Lorenz en el plano x–z',
    noEncontrado: 'Resultado no reproducible',
    noEncontradoTexto: 'Esta página no existe o ha cambiado de sitio.',
    hoy: 'hoy',
    manana: 'mañana',
    enDias: 'en {n} días',
    tipos: { evento: 'Evento', actividad: 'Actividad', salida: 'Salida', proyecto: 'Proyecto', juego: 'Juego' },
    descripcion: 'Club de estudiantes de divulgación científica de la Universidad Europea de Valencia: actividades, salidas y avisos.',
  },
  en: {
    actividades: 'Activities',
    club: 'The club',
    avisos: 'Updates',
    otroIdioma: 'Español',
    revisado: 'Revised',
    resumen: 'Abstract.',
    proxima: 'Coming up',
    tambien: 'Also scheduled',
    nadaConFecha: 'Nothing scheduled yet. When there is, we announce it on WhatsApp.',
    anteriores: 'Past activities',
    todas: 'All activities',
    proximamente: 'Coming up',
    curso: 'Academic year',
    cuando: 'When',
    donde: 'Where',
    paraQuien: 'Who for',
    hayQue: 'You need to',
    recibirAvisos: 'Get updates on WhatsApp',
    avisosWhatsapp: 'WhatsApp updates',
    verActividad: 'See the activity',
    calendario: 'Add to calendar',
    apuntarme: 'Sign up',
    cancelado: 'Cancelled',
    aviso: 'Notice.',
    figura: 'Figure',
    foto: 'Photograph',
    comoCitar: 'How to cite',
    soloEspanol: 'The full text is only available in Spanish for now.',
    notaGrupo: 'Opens WhatsApp. It is a group: everyone in it will see your phone number.',
    notaCanal: 'Opens WhatsApp. It is a channel: only the club posts and nobody sees your number.',
    escanea: 'Scan the code with your phone to open WhatsApp.',
    enlaceDirecto: 'If the button does not open WhatsApp, copy this link:',
    pieClub: 'Student club of Universidad Europea de Valencia. Website made by the club.',
    avisoLegal: 'Legal notice',
    inicio: 'Home',
    sinFotoProxima: 'No photo yet, because it has not happened yet.',
    sinFotoPasada: 'No photos for now.',
    lorenz: 'Instead, a Lorenz attractor with',
    lorenzFecha: 'the date of the activity',
    lorenzAlt: 'Plot of a Lorenz attractor in the x–z plane',
    noEncontrado: 'Result not reproducible',
    noEncontradoTexto: 'This page does not exist or has moved.',
    hoy: 'today',
    manana: 'tomorrow',
    enDias: 'in {n} days',
    tipos: { evento: 'Event', actividad: 'Activity', salida: 'Outing', proyecto: 'Project', juego: 'Game' },
    descripcion: 'Science outreach student club at Universidad Europea de Valencia: activities, outings and updates.',
  },
} as const;

export function t(lang: Lang) {
  return ui[lang];
}

type Clave = 'inicio' | 'actividades' | 'avisos' | 'legal';

const RUTAS: Record<Lang, Record<Clave, string>> = {
  es: { inicio: '/', actividades: '/actividades/', avisos: '/whatsapp/', legal: '/aviso-legal/' },
  en: { inicio: '/en/', actividades: '/en/activities/', avisos: '/en/whatsapp/', legal: '/en/legal/' },
};

export function ruta(lang: Lang, clave: Clave): string {
  return RUTAS[lang][clave];
}

export function rutaFicha(lang: Lang, slug: string): string {
  return `${RUTAS[lang].actividades}${slug}/`;
}

/** Fichero de calendario de una entrada, en su idioma. */
export function rutaIcs(lang: Lang, slug: string): string {
  return `${RUTAS[lang].actividades}${slug}.ics`;
}

export function otro(lang: Lang): Lang {
  return lang === 'es' ? 'en' : 'es';
}
