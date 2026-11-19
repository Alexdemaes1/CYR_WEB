import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'La hora va entre comillas y con formato "18:00"');

// Una entrada = un fichero en src/content/entradas/. Ver _plantilla.md.
const entradas = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/entradas' }),
  // Estricto: un campo mal escrito ("cancelada", "precisión") da error en vez de ignorarse.
  schema: z.strictObject({
    titulo: z.string().min(3),
    tipo: z.enum(['evento', 'actividad', 'salida', 'proyecto', 'juego']),
    fecha: z
      .date({ error: 'La fecha va sin comillas y como AAAA-MM-DD, por ejemplo 2026-12-01' })
      .refine((d) => d.getUTCHours() === 0 && d.getUTCMinutes() === 0, 'La fecha va sin hora; la hora se pone en el campo "hora"'),
    // 'dia' = fecha exacta; 'mes' = solo se conoce el mes; 'curso' = solo el curso
    precision: z.enum(['dia', 'mes', 'curso']).default('dia'),
    hora: hora.optional(),
    fin: hora.optional(),
    lugar: z.string().optional(),
    resumen: z.string().min(10),
    para_quien: z.string().optional(),
    hay_que: z.string().optional(),
    inscripcion: z.url().optional(),
    // Botón propio de la entrada mientras sigue en pie (por ejemplo, abrir un juego): texto y ruta o URL
    accion_texto: z.string().optional(),
    accion_url: z.string().optional(),
    aviso: z.string().optional(),
    cancelado: z.boolean().default(false),
    // Pies de foto opcionales: nombre de fichero -> pie
    pies: z.record(z.string(), z.string()).default({}),
  }),
});

// Versión en inglés: mismo nombre de fichero en src/content/entradas-en/.
// Solo los textos; fechas, horas y enlaces se toman de la entrada en español.
const entradasEn = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/entradas-en' }),
  schema: z.strictObject({
    titulo: z.string().min(3),
    resumen: z.string().min(10),
    lugar: z.string().optional(),
    para_quien: z.string().optional(),
    hay_que: z.string().optional(),
    aviso: z.string().optional(),
    accion_texto: z.string().optional(),
    pies: z.record(z.string(), z.string()).default({}),
  }),
});

export const collections = { entradas, entradasEn };
