// "Brasa, humo o chicha": la actividad para valorar las charlas de un evento.
// Para reutilizarla en otro evento basta con cambiar este fichero.

export type Categoria = 'brasa' | 'humo' | 'chicha';

export interface Sesion {
  /** Identificador corto y estable; es lo que se guarda con cada valoración. */
  id: string;
  /** Hora de inicio y fin en Madrid, "HH:MM". */
  inicio: string;
  fin?: string;
  titulo: string;
  ponentes: string[];
  sala?: string;
}

export const EVENTO = {
  nombre: 'V Forum Europeo de Inteligencia Artificial',
  lugar: 'ADDA, Alicante',
  /** Día del evento en Madrid. */
  dia: '2026-11-20',
  /** Una charla se puede valorar desde estos minutos antes de su hora de fin (no antes). */
  antes: 5,
  /** Minutos tras el final de una charla en que la valoración cuenta como "en horario". */
  margen: 30,
  /** Longitud mínima del comentario obligatorio. */
  comentarioMin: 15,
  /** Pedir además una nota de 1 a 5. */
  conNota: true,
};

export const CATEGORIAS: Record<Categoria, { nombre: string; lema: string; definicion: string }> = {
  chicha: {
    nombre: 'Chicha',
    lema: 'Aquí hay chicha',
    definicion: 'Está bien. Aquí había contenido de verdad.',
  },
  humo: {
    nombre: 'Humo',
    lema: 'Puro humo',
    definicion: 'Te han vendido humo. Cuentos, y gente hablando de IA sin tener ni idea.',
  },
  brasa: {
    nombre: 'Brasa',
    lema: 'Menuda brasa',
    definicion: 'Te han dado la brasa.',
  },
};

const dosCifras = (n: number) => String(n).padStart(2, '0');

/** Hora ("HH:MM") desde la que se puede valorar una charla: poco antes de que acabe. */
export function abreA(sesion: Sesion): string {
  const [h, m] = (sesion.fin ?? sesion.inicio).split(':').map(Number);
  const total = h * 60 + m + (sesion.fin ? -EVENTO.antes : 25);
  return `${dosCifras(Math.floor(total / 60))}:${dosCifras(total % 60)}`;
}

// Programa del día. Vacío = los asistentes escriben el título de la charla a mano.
//
// Fuente: programa oficial en https://www.encuentrosnow.es/ (consultado el 19-nov-2026).
// El programa solo publica la hora de INICIO; la de fin es el inicio del punto siguiente.
// No se incluyen la apertura, las entregas de premios, la pausa ni el cierre.
export const SESIONES: Sesion[] = [
  { id: 'keynote', inicio: '09:25', fin: '10:05', titulo: 'Keynote', ponentes: ['Michael I. Jordan', 'Nuria Oliver'] },
  { id: 's1', inicio: '10:15', fin: '10:45', titulo: 'La IA redefine la medicina', ponentes: ['Ignacio H. Medrano', 'Olga Blanco Poves'] },
  { id: 's2', inicio: '11:15', fin: '11:45', titulo: 'Los neuroderechos y el gemelo digital', ponentes: ['Vicente Magro', 'Manuel Bonilla'] },
  { id: 's3', inicio: '11:45', fin: '12:15', titulo: 'Retos de las nuevas infraestructuras ante la IA', ponentes: ['José Capmany', 'Montse Guardia', 'Leonardo Salom'] },
  { id: 's4', inicio: '12:15', fin: '12:40', titulo: 'De la revolución digital a la geoestrategia tecnológica del siglo XXI', ponentes: ['Mateo Valero Cortés', 'Javier Pérez de Vargas'] },
  { id: 's5', inicio: '12:40', fin: '13:05', titulo: 'Ciencia sin científicos: descubrimientos de la IA', ponentes: ['Javier García Martínez', 'Toni Cabot'] },
  { id: 's6', inicio: '13:05', fin: '13:35', titulo: 'La hibridación de la IA y otras tecnologías', ponentes: ['Ricardo Vinuesa', 'Concepción Monje', 'Óscar Lucía'] },
  { id: 's7', inicio: '13:35', fin: '13:55', titulo: 'La IA marca las nuevas reglas de la competitividad empresarial', ponentes: ['Diego Quintanilla', 'Toni Cabot'] },
  { id: 's8', inicio: '13:55', fin: '14:25', titulo: 'La disrupción de la IA en la universidad', ponentes: ['Juan Manuel Corpa', 'Juan Carlos Trujillo', 'Vicent Gassó', 'Manuel Bonilla'] },
  { id: 's9', inicio: '14:25', fin: '14:35', titulo: 'The Mind Guardian, la IA para las personas', ponentes: ['David Alonso'] },
  { id: 's10', inicio: '14:35', fin: '14:55', titulo: 'La IA sube al escenario: de la conversación a la acción', ponentes: ['Javier Ideami'] },
];
