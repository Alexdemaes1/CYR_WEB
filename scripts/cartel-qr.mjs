// Genera carteles/brasa-qr.pdf: un A4 con el QR que lleva a "Brasa, humo o chicha".
// Uso: npm run cartel            (usa la dirección publicada)
//      npm run cartel -- https://otra-direccion/brasa/
// Necesita Edge o Chrome instalados (se usan sin ventana para imprimir el HTML a PDF).
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import QRCode from 'qrcode';

const URL_ACTIVIDAD = process.argv[2] ?? 'https://cyrweb.vercel.app/brasa/';
const SALIDA = 'carteles';
const NOMBRE = 'brasa-qr';

// Nivel Q: el QR se sigue leyendo aunque se tape o se estropee una cuarta parte.
const qr = await QRCode.toString(URL_ACTIVIDAD, { type: 'svg', margin: 3, errorCorrectionLevel: 'Q', color: { dark: '#1d1916', light: '#ffffff' } });

const fuente = async (paquete, fichero) => `data:font/woff2;base64,${(await readFile(`node_modules/@fontsource/${paquete}/files/${fichero}`)).toString('base64')}`;
const f = {
  brasa: await fuente('big-shoulders', 'big-shoulders-latin-900-normal.woff2'),
  humo: await fuente('cormorant-garamond', 'cormorant-garamond-latin-300-italic.woff2'),
  humo400: await fuente('cormorant-garamond', 'cormorant-garamond-latin-400-italic.woff2'),
  chicha: await fuente('gloock', 'gloock-latin-400-normal.woff2'),
  texto: await fuente('hanken-grotesk', 'hanken-grotesk-latin-500-normal.woff2'),
  textoNegrita: await fuente('hanken-grotesk', 'hanken-grotesk-latin-700-normal.woff2'),
};

const visible = URL_ACTIVIDAD.replace(/^https?:\/\//, '').replace(/\/$/, '');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Brasa, humo o chicha · QR</title>
<style>
@font-face { font-family: "Big Shoulders"; font-weight: 900; src: url(${f.brasa}) format("woff2"); }
@font-face { font-family: "Cormorant Garamond"; font-weight: 300; font-style: italic; src: url(${f.humo}) format("woff2"); }
@font-face { font-family: "Cormorant Garamond"; font-weight: 400; font-style: italic; src: url(${f.humo400}) format("woff2"); }
@font-face { font-family: "Gloock"; font-weight: 400; src: url(${f.chicha}) format("woff2"); }
@font-face { font-family: "Hanken Grotesk"; font-weight: 500; src: url(${f.texto}) format("woff2"); }
@font-face { font-family: "Hanken Grotesk"; font-weight: 700; src: url(${f.textoNegrita}) format("woff2"); }
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 210mm; height: 297mm; }
body { font-family: "Hanken Grotesk", Arial, sans-serif; font-weight: 500; color: #1d1916; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; overflow: hidden; position: relative; }
.estraza { position: absolute; inset: 0 0 auto 0; height: 121mm; background: #d7b98a; }
.hoja { position: relative; height: 297mm; padding: 12mm 17mm 10mm; display: flex; flex-direction: column; }
.sobre { font-weight: 700; font-size: 9.5pt; letter-spacing: 0.09em; text-transform: uppercase; }
h1 { margin-top: 5mm; font-weight: 400; line-height: 1; }
h1 span { display: block; width: fit-content; }
.brasa { font-family: "Big Shoulders"; font-weight: 900; font-size: 37mm; line-height: 0.78; text-transform: uppercase; color: #e8590c; }
.humo { font-family: "Cormorant Garamond"; font-weight: 300; font-style: italic; font-size: 37mm; line-height: 0.74; color: #5d6f7b; margin: 3mm 0 0 36mm; }
.chicha { font-family: "Gloock"; font-size: 31mm; line-height: 0.92; letter-spacing: -0.02em; color: #b4232a; margin-top: 2mm; }
.chicha i { font-family: "Cormorant Garamond"; font-weight: 400; font-size: 0.5em; color: #1d1916; margin-right: 0.18em; }
.comanda { position: relative; align-self: center; margin-top: 6mm; width: 116mm; background: #fff; border: 0.6mm solid #1d1916; padding: 6mm 7mm 5mm; text-align: center; box-shadow: 2.4mm 2.6mm 0 rgba(29, 25, 22, 0.22); }
.comanda .rotulo { font-family: "Gloock"; font-size: 17pt; line-height: 1; }
.comanda svg { display: block; width: 94mm; height: 94mm; margin: 3mm auto 2mm; }
.corte { border: 0; border-top: 0.5mm dashed #1d1916; opacity: 0.5; margin: 0 -2mm 4mm; }
.direccion { font-weight: 700; font-size: 17pt; letter-spacing: 0.01em; }
.pasos { margin-top: 8mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; }
.paso { display: grid; grid-template-columns: 9mm 1fr; gap: 3mm; align-items: start; font-size: 11.5pt; line-height: 1.28; }
.paso b { display: grid; place-items: center; width: 9mm; height: 9mm; border-radius: 50%; background: #1d1916; color: #fff; font-family: "Gloock"; font-weight: 400; font-size: 13pt; }
.pie { margin-top: auto; padding-top: 4mm; border-top: 0.7mm solid #1d1916; font-size: 10pt; display: flex; justify-content: space-between; gap: 8mm; }
</style>
</head>
<body>
<div class="estraza"></div>
<div class="hoja">
  <p class="sobre">V Forum Europeo de Inteligencia Artificial · ADDA, Alicante · 20 de noviembre</p>
  <h1><span class="brasa">Brasa,</span><span class="humo">humo</span><span class="chicha"><i>o</i>chicha</span></h1>
  <div class="comanda">
    <p class="rotulo">Ponle un sello a cada charla</p>
    ${qr}
    <hr class="corte">
    <p class="direccion">${visible}</p>
  </div>
  <div class="pasos">
    <p class="paso"><b>1</b><span>Escanea el código con la cámara del móvil.</span></p>
    <p class="paso"><b>2</b><span>Pon tu nombre y tu correo de la universidad.</span></p>
    <p class="paso"><b>3</b><span>Cuando una charla va acabando, elige sello y cuenta por qué.</span></p>
  </div>
  <p class="pie"><span>Club de Ciencia y Redes · Universidad Europea de Valencia</span><span>La hora la apunta la máquina.</span></p>
</div>
</body>
</html>`;

await mkdir(SALIDA, { recursive: true });
const rutaHtml = resolve(SALIDA, `${NOMBRE}.html`);
const rutaPdf = resolve(SALIDA, `${NOMBRE}.pdf`);
const rutaPng = resolve(SALIDA, `${NOMBRE}.png`);
await writeFile(rutaHtml, html, 'utf8');

const navegador = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((ruta) => existsSync(ruta));
if (!navegador) throw new Error(`No encuentro Edge ni Chrome. El HTML está en ${rutaHtml}: ábrelo y usa Imprimir > Guardar como PDF.`);

const ejecutar = promisify(execFile);
const comunes = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=4000'];
const origen = pathToFileURL(rutaHtml).href;
await ejecutar(navegador, [...comunes, '--no-pdf-header-footer', `--print-to-pdf=${rutaPdf}`, origen]);
// Además, una imagen para mandar por WhatsApp o proyectar (A4 a 2x: 1588 x 2246 px).
await ejecutar(navegador, [...comunes, '--force-device-scale-factor=2', '--window-size=794,1123', `--screenshot=${rutaPng}`, origen]);

console.log(`${rutaPdf}\n${rutaPng}\nQR -> ${URL_ACTIVIDAD}`);
