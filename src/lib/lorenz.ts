// Atractor de Lorenz: la figura de las entradas que todavía no tienen foto.
// Se calcula al compilar; no hay JavaScript en el navegador.
//
//   dx/dt = σ(y − x)      dy/dt = x(ρ − z) − y      dz/dt = xy − βz
//   σ = 10, ρ = 28, β = 8/3. Condición inicial (x0, 1, 20), con x0 = día,mes.
//
// El pie de figura afirma exactamente esto, así que no se debe cambiar una cosa sin la otra.

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.01;
const TRANSITORIO = 150; // pasos iniciales que no se dibujan (la caída hacia el atractor)
const PASOS = 2200;

// Ventana de datos fija, para que los ejes signifiquen lo mismo en todas las figuras.
export const EJES = { xMin: -24, xMax: 24, zMin: 0, zMax: 52, marcasX: [-20, -10, 0, 10, 20], marcasZ: [10, 20, 30, 40, 50] };

// Geometría del SVG (viewBox 0 0 420 292): margen para las etiquetas de los ejes.
// Es pequeño a propósito: en un móvil se ve casi a escala 1 y los números se leen.
export const CAJA = { ancho: 420, alto: 292, izq: 40, der: 414, arriba: 6, abajo: 250 };

type Punto = [number, number, number];

function derivada([x, y, z]: Punto): Punto {
  return [SIGMA * (y - x), x * (RHO - z) - y, x * y - BETA * z];
}

function paso(p: Punto): Punto {
  const suma = (a: Punto, b: Punto, k: number): Punto => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
  const k1 = derivada(p);
  const k2 = derivada(suma(p, k1, DT / 2));
  const k3 = derivada(suma(p, k2, DT / 2));
  const k4 = derivada(suma(p, k3, DT));
  return [
    p[0] + (DT / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
    p[1] + (DT / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
    p[2] + (DT / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
  ];
}

export function escalaX(x: number): number {
  return CAJA.izq + ((x - EJES.xMin) / (EJES.xMax - EJES.xMin)) * (CAJA.der - CAJA.izq);
}

export function escalaZ(z: number): number {
  return CAJA.abajo - ((z - EJES.zMin) / (EJES.zMax - EJES.zMin)) * (CAJA.abajo - CAJA.arriba);
}

/** x0 de una fecha: el día y el mes como número decimal (26 de noviembre -> 26.11). */
export function x0DeFecha(fecha: Date): number {
  return fecha.getUTCDate() + (fecha.getUTCMonth() + 1) / 100;
}

/** Trayectoria proyectada en el plano x–z, como atributo `d` de un <path>. */
export function trazoLorenz(x0: number): string {
  let p: Punto = [x0, 1, 20];
  for (let i = 0; i < TRANSITORIO; i++) p = paso(p);
  const trozos: string[] = [];
  for (let i = 0; i < PASOS; i++) {
    trozos.push(`${i === 0 ? 'M' : 'L'}${escalaX(p[0]).toFixed(1)} ${escalaZ(p[2]).toFixed(1)}`);
    p = paso(p);
  }
  return trozos.join('');
}
