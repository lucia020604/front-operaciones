// =================================================
// DESCARGA-GASTOS.JS
// Construcción de los reportes de Gastos (Alimentos/Movilidad/Días a Bordo)
// en Excel real (ExcelJS) y PDF (HTML imprimible) — calcan las plantillas
// de Intertek (carpeta raíz del proyecto). Compartido entre la web
// (Registro de Gastos Operativos, ícono de ojo de la grilla) y el móvil
// (Reportes > Descargar): los operadores descargan desde acá el mismo
// archivo que ve el supervisor, con la misma marca de agua de "descargado
// desde este sistema" — un solo lugar para no mantener la plantilla dos
// veces. Requiere ExcelJS cargado por CDN y data-gastos.js/data-tablas-generales.js
// ya cargados antes que este archivo.
// =================================================

function nombreColaboradorGastos(usuario) {
  const u = obtenerUsuarioPorNombre(usuario);
  return u ? `${u.nombre} ${u.apellido}` : usuario;
}

function fechaHoraActualGastos() {
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(ahora.getDate())}/${pad(ahora.getMonth() + 1)}/${ahora.getFullYear()} ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}

/* =================================================
   DESCARGA por usuario + tipo de reporte + rango — Excel o PDF. Junta los
   gastos de TODOS los períodos del usuario+tipo que caigan dentro del rango
   elegido (la web pasa el rango que cubre todos sus períodos; el móvil pasa
   directo el período activo, un solo rango).
================================================= */
// Orden y etiquetas de columnas para la descarga — calcan la planilla real
// de Intertek (no el orden que usa la grilla en pantalla, CONFIG_TIPO_GASTO
// en detalle-gastos.js, que sigue siendo el de siempre). "comida" (Alimentos)
// y "cliente" (Días a Bordo) son datos propios del sistema que la planilla
// de referencia no tenía — se agregan al final de cada tabla, no reemplazan
// ninguna columna de la plantilla original.
// "costoTotal" (Alimentos) es una columna sintética, no un campo real del
// dato: en la planilla original TOTAL es una fórmula que solo repite COSTO
// (=J15) — acá se resuelve igual, leyendo "costo" (ver valorColumnaGasto).
const DESCARGA_COLUMNAS_GASTO = {
  Alimentos: [['fecha', 'FECHA'], ['lugar', 'LUGAR'], ['cliente', 'CLIENTE'], ['operacionPer', 'OPERACIÓN / PER'], ['hora', 'HORAS'], ['comida', 'COMIDA'], ['costo', 'COSTO'], ['costoTotal', 'TOTAL']],
  Movilidad: [['fecha', 'FECHA'], ['empresa', 'EMPRESA'], ['distritoPartida', 'DISTRITO DE PARTIDA'], ['distritoDestino', 'DISTRITO DE DESTINO'], ['motivo', 'MOTIVO'], ['importeDia', 'IMPORTE / DÍA'], ['totalDia', 'TOTAL / DÍA']],
  'Días a Bordo': [['dia', 'DÍA'], ['fecha', 'FECHA'], ['lugar', 'LUGAR'], ['operacion', 'OPERACIÓN'], ['operacionPer', 'ITS REF.'], ['buque', 'BUQUE'], ['cliente', 'CLIENTE'], ['detalle', 'DETALLE'], ['monto', 'MONTO']]
};
// Campo cuya suma arma "TOTAL GENERAL" — siempre la última columna de cada
// tabla de arriba, igual que en la planilla de referencia.
const DESCARGA_CAMPO_TOTAL_GASTO = { Alimentos: 'costoTotal', Movilidad: 'totalDia', 'Días a Bordo': 'monto' };
// Columnas de monto (alineadas a la derecha, con formato S/) por tipo — las
// mismas que DESCARGA_CAMPO_TOTAL_GASTO más las intermedias que también son
// plata (ej. Movilidad tiene Importe/Día Y Total/Día).
const DESCARGA_COLUMNAS_MONTO = { costo: true, costoTotal: true, importeDia: true, totalDia: true, monto: true };
// Valor de una celda de dato: "costoTotal" no existe en el objeto real, se
// resuelve leyendo "costo" (ver nota arriba).
function valorColumnaGasto(filaDato, key) {
  return key === 'costoTotal' ? filaDato.costo : filaDato[key];
}
const CENTRO_COSTO_GASTOS = '1101'; // estático, igual que en la planilla de referencia (ver nota en la reunión: el dato real todavía no está modelado en el sistema)

// Arma los datos comunes a Excel y PDF a partir de usuario+tipo+rango —
// devuelve null (con el toast correspondiente) si falta algo o no hay
// resultados, así ambos exportadores solo tienen que preocuparse del
// formato de salida.
function prepararDescargaGastos({ usuario, tipo, desde, hasta }) {
  if (!usuario) { mostrarToast('Selecciona un usuario.'); return null; }
  if (!desde || !hasta) { mostrarToast('Selecciona un rango de fechas válido.'); return null; }

  const reportes = GASTOS_OPERATIVOS_DEMO.filter(g => {
    if (g.tipo !== tipo) return false;
    const detalle = obtenerDetalleGastoPorTipo(g.tipo, g.id);
    return detalle && detalle.firmaTrabajador === usuario;
  });

  const columnas = DESCARGA_COLUMNAS_GASTO[tipo];
  const campoTotal = DESCARGA_CAMPO_TOTAL_GASTO[tipo];
  const filas = [];
  reportes.forEach(g => {
    // Días a Bordo se regenera antes de armar la descarga (§1.2) — así un
    // cambio de tarifa/tipo de cambio se refleja aunque nadie haya abierto
    // el Detalle antes de descargar.
    if (tipo === 'Días a Bordo') regenerarDiasABordo(g.id);
    const detalle = obtenerDetalleGastoPorTipo(g.tipo, g.id);
    detalle.grilla.forEach(fila => {
      const fechaISO = fechaDDMMYYYYaISO(fila.fecha);
      if (fechaISO < desde || fechaISO > hasta) return;
      filas.push(fila);
    });
  });

  if (!filas.length) { mostrarToast('No se encontraron registros con estos filtros.'); return null; }

  const colaborador = reportes.length ? COLABORADOR_GASTOS_DEMO[reportes[0].id] || {} : {};
  const nombreCompleto = reportes.length ? `${reportes[0].nombre} ${reportes[0].apellido}` : nombreColaboradorGastos(usuario);
  const area = reportes.length ? reportes[0].area : '—';
  // "N°" de la planilla de referencia: el/los código(s) de reporte (RA/RM/RD)
  // que caen en el rango elegido — puede ser más de uno si el rango cruza
  // varios períodos mensuales.
  const numero = [...new Set(reportes.map(g => obtenerDetalleGastoPorTipo(g.tipo, g.id)?.numero).filter(Boolean))].join(' / ') || '—';
  const totalGeneral = filas.reduce((acc, fila) => acc + (Number(valorColumnaGasto(fila, campoTotal)) || 0), 0);
  const tituloTipo = tipo === 'Días a Bordo'
    ? `Días a Bordo del ${fechaISOaDDMMYYYY(desde)} al ${fechaISOaDDMMYYYY(hasta)}`
    : `PLANILLA DE GASTO DE ${tipo.toUpperCase()} - TRABAJADOR`;

  return { usuario, tipo, desde, hasta, columnas, campoTotal, filas, colaborador, nombreCompleto, area, numero, totalGeneral, tituloTipo };
}

/* =================================================
   EXCEL (.xlsx real, vía ExcelJS cargado en el <head>) — calca la planilla
   de referencia de Intertek: membrete Razón social/RUC/N°/Fecha de
   emisión/Centro de costo/Área, tabla con encabezado dorado, TOTAL GENERAL,
   Firma del Trabajador + Revisado/Autorizado (Alimentos y Movilidad) o
   NOMBRE + Autorizado por/Recibí conforme (Días a Bordo), y Base Legal.
   No soporta marca de agua gráfica diagonal (Excel no la tiene sin plugins)
   — el aviso de "descargado del sistema" queda como primera fila de texto.
================================================= */
// Colores exactos leídos de las planillas .xlsx reales de Intertek (no
// aproximados): dorado de encabezado FFC000, crema de celdas de dato FFF8DD.
const EXCEL_COLOR_GOLD = 'FFFFC000';
const EXCEL_COLOR_CREAM = 'FFFFF8DD';
const EXCEL_BORDE = { style: 'thin', color: { argb: 'FF999999' } };
const EXCEL_BORDES_TODOS = { top: EXCEL_BORDE, left: EXCEL_BORDE, bottom: EXCEL_BORDE, right: EXCEL_BORDE };

// Aviso de "descargado del sistema" que encabeza los 3 formatos (Excel,
// vista previa y PDF) — texto compartido para no repetir el formateo de
// fecha en cada lugar que lo usa.
function textoDescargadoDesdeGastos() {
  return `DESCARGADO DESDE PROCESOS OPERACIONES — INTERTEK CALEB BRETT — ${new Date().toLocaleString('es-PE')}`;
}

// Escribe una celda por coordenadas numéricas (fila, columna — ambas desde
// 1) en vez de referencias tipo "A1": evita errores de conversión letra/
// número a mano en una hoja con bastantes celdas armadas una por una.
function celdaExcelGastos(sheet, fila, col, valor, opciones = {}) {
  const cell = sheet.getRow(fila).getCell(col);
  if (valor !== undefined) cell.value = valor;
  cell.font = { bold: !!opciones.bold, size: opciones.size || 10, color: opciones.colorTexto ? { argb: opciones.colorTexto } : undefined };
  if (opciones.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: opciones.fill } };
  cell.alignment = { horizontal: opciones.align || 'left', vertical: 'middle', wrapText: !!opciones.wrap };
  if (opciones.borde !== false) cell.border = EXCEL_BORDES_TODOS;
  if (opciones.formato) cell.numFmt = opciones.formato;
  return cell;
}

function construirHojaExcelAlimentosMovilidad(sheet, d) {
  sheet.columns = [{ width: 18 }, { width: 22 }, { width: 18 }, { width: 16 }, { width: 16 }, { width: 14 }, { width: 14 }];

  sheet.mergeCells(1, 1, 1, 7);
  celdaExcelGastos(sheet, 1, 1, textoDescargadoDesdeGastos(), { bold: true, align: 'center', borde: false });

  // Logo a tamaño legible (~150-200px de ancho, proporción real 3000x2000 =
  // 1.5 — 180x120 no lo deforma ni lo deja pixelado).
  sheet.getRow(2).height = 92;
  const logoId = sheet.workbook.addImage({ base64: LOGO_INTERTEK_BASE64, extension: 'png' });
  sheet.addImage(logoId, { tl: { col: 0, row: 1.05 }, ext: { width: 180, height: 120 } });

  sheet.mergeCells(3, 1, 3, 7);
  celdaExcelGastos(sheet, 3, 1, d.tituloTipo, { bold: true, size: 12, align: 'center', borde: false });

  let f = 5;
  sheet.mergeCells(f, 2, f, 4);
  celdaExcelGastos(sheet, f, 1, 'Razón social:', { bold: true });
  celdaExcelGastos(sheet, f, 2, EMPRESA_GASTOS.razonSocial.toUpperCase(), { fill: EXCEL_COLOR_CREAM });
  celdaExcelGastos(sheet, f, 5, 'N°', { bold: true, align: 'center' });
  sheet.mergeCells(f, 6, f, 7);
  celdaExcelGastos(sheet, f, 6, d.numero, { fill: EXCEL_COLOR_CREAM, align: 'center' });
  f++;

  sheet.mergeCells(f, 2, f, 4);
  celdaExcelGastos(sheet, f, 1, 'RUC :', { bold: true });
  celdaExcelGastos(sheet, f, 2, EMPRESA_GASTOS.ruc, { fill: EXCEL_COLOR_CREAM });
  celdaExcelGastos(sheet, f, 5, 'Fecha de emisión:', { bold: true, align: 'center' });
  sheet.mergeCells(f, 6, f, 7);
  celdaExcelGastos(sheet, f, 6, fechaHoraActualGastos(), { fill: EXCEL_COLOR_CREAM, align: 'center' });
  f++;

  sheet.mergeCells(f, 2, f, 4);
  celdaExcelGastos(sheet, f, 1, 'Nombres y apellidos', { bold: true });
  celdaExcelGastos(sheet, f, 2, d.nombreCompleto, { fill: EXCEL_COLOR_CREAM });
  celdaExcelGastos(sheet, f, 5, 'Centro de costo:', { bold: true, align: 'center' });
  sheet.mergeCells(f, 6, f, 7);
  celdaExcelGastos(sheet, f, 6, CENTRO_COSTO_GASTOS, { fill: EXCEL_COLOR_CREAM, align: 'center' });
  f++;

  celdaExcelGastos(sheet, f, 1, 'Cargo', { bold: true });
  celdaExcelGastos(sheet, f, 2, d.colaborador.cargo || '—', { fill: EXCEL_COLOR_CREAM });
  celdaExcelGastos(sheet, f, 3, 'Doc. Identidad:', { bold: true, align: 'center' });
  celdaExcelGastos(sheet, f, 4, d.colaborador.docIdentidad || '—', { fill: EXCEL_COLOR_CREAM, align: 'center' });
  celdaExcelGastos(sheet, f, 5, 'Área:', { bold: true, align: 'center' });
  sheet.mergeCells(f, 6, f, 7);
  celdaExcelGastos(sheet, f, 6, d.area, { fill: EXCEL_COLOR_CREAM, align: 'center' });
  f += 2;

  celdaExcelGastos(sheet, f, 1, 'ASIGNACIÓN ESPECÍFICA', { bold: true, borde: false });
  sheet.mergeCells(f, 4, f, 7);
  celdaExcelGastos(sheet, f, 4, `PERÍODO DEL ${fechaISOaDDMMYYYY(d.desde).toUpperCase()} AL ${fechaISOaDDMMYYYY(d.hasta).toUpperCase()}`, { bold: true, align: 'right', borde: false });
  f++;

  const filaHeaderTabla = f;
  d.columnas.forEach(([, label], i) => celdaExcelGastos(sheet, filaHeaderTabla, i + 1, label, { bold: true, fill: EXCEL_COLOR_GOLD, align: 'center' }));
  f++;

  d.filas.forEach(filaDato => {
    d.columnas.forEach(([key], i) => {
      const esMonto = !!DESCARGA_COLUMNAS_MONTO[key];
      const valor = valorColumnaGasto(filaDato, key);
      celdaExcelGastos(sheet, f, i + 1, esMonto ? (Number(valor) || 0) : (valor ?? ''), {
        align: esMonto ? 'right' : 'left', formato: esMonto ? '"S/" #,##0.00' : undefined, fill: EXCEL_COLOR_CREAM
      });
    });
    f++;
  });

  const colTotal = d.columnas.findIndex(([key]) => key === d.campoTotal) + 1;
  sheet.mergeCells(f, 1, f, colTotal - 1);
  celdaExcelGastos(sheet, f, 1, 'TOTAL GENERAL', { bold: true, align: 'right', fill: EXCEL_COLOR_GOLD });
  celdaExcelGastos(sheet, f, colTotal, d.totalGeneral, { bold: true, align: 'right', fill: EXCEL_COLOR_GOLD, formato: '"S/" #,##0.00' });
  f += 3;

  celdaExcelGastos(sheet, f, 1, 'Firma del Trabajador:', { bold: true, borde: false });
  f += 3;

  sheet.mergeCells(f, 1, f, 2);
  celdaExcelGastos(sheet, f, 1, 'Revisado:', { bold: true, fill: EXCEL_COLOR_CREAM, align: 'center' });
  sheet.mergeCells(f, 5, f, 6);
  celdaExcelGastos(sheet, f, 5, 'Autorizado :', { bold: true, fill: EXCEL_COLOR_CREAM, align: 'center' });
  f++;
  sheet.mergeCells(f, 1, f, 2);
  celdaExcelGastos(sheet, f, 1, '', { fill: EXCEL_COLOR_CREAM });
  sheet.mergeCells(f, 5, f, 6);
  celdaExcelGastos(sheet, f, 5, '', { fill: EXCEL_COLOR_CREAM });
  f++;
  sheet.mergeCells(f, 1, f, 2);
  celdaExcelGastos(sheet, f, 1, 'Jefe Inmediato', { bold: true, align: 'center', borde: false });
  sheet.mergeCells(f, 5, f, 6);
  celdaExcelGastos(sheet, f, 5, 'Gerente de Área', { bold: true, align: 'center', borde: false });
  f += 2;

  celdaExcelGastos(sheet, f, 1, 'BASE LEGAL:', { bold: true, size: 8, borde: false });
  f++;
  sheet.mergeCells(f, 1, f, 7);
  celdaExcelGastos(sheet, f, 1, BASE_LEGAL_GASTOS, { size: 8, borde: false, wrap: true });
}

// Plantilla real: 2 tablas lado a lado, una por quincena (10→25 y 26→09),
// cada una con su propio título y total, más "Total del Mes" = la suma de
// ambas ("Hoja por quincena") — se arma acá partiendo d.filas (ya
// filtradas por usuario+rango en prepararDescargaGastos) con
// quincenaDeFecha (data-gastos.js). Columnas I-K quedan angostas como
// separador visual entre las 2 tablas, igual que en la planilla.
const COLUMNAS_QUINCENA_DIAS_BORDO = [['dia', 'DÍA'], ['fecha', 'FECHA'], ['lugar', 'LUGAR'], ['operacion', 'OPERACIÓN'], ['operacionPer', 'ITS REF.'], ['buque', 'BUQUE'], ['detalle', 'DETALLE'], ['monto', 'MONTO']];

function construirHojaExcelDiasABordo(sheet, d) {
  const anchoCol = { width: 13 };
  sheet.columns = [anchoCol, anchoCol, anchoCol, anchoCol, anchoCol, anchoCol, anchoCol, anchoCol,
    { width: 3 }, { width: 3 }, { width: 3 },
    anchoCol, anchoCol, anchoCol, anchoCol, anchoCol, anchoCol, anchoCol, anchoCol];

  sheet.mergeCells(1, 1, 1, 19);
  celdaExcelGastos(sheet, 1, 1, textoDescargadoDesdeGastos(), { bold: true, align: 'center', borde: false });

  // Logo a tamaño legible (~150-200px de ancho, proporción real 3:2).
  sheet.getRow(2).height = 92;
  const logoId = sheet.workbook.addImage({ base64: LOGO_INTERTEK_BASE64, extension: 'png' });
  sheet.addImage(logoId, { tl: { col: 0, row: 1.05 }, ext: { width: 180, height: 120 } });

  const q1 = d.filas.filter(f => quincenaDeFecha(f.fecha) === 1).sort((a, b) => fechaDDMMYYYYaISO(a.fecha).localeCompare(fechaDDMMYYYYaISO(b.fecha)));
  const q2 = d.filas.filter(f => quincenaDeFecha(f.fecha) === 2).sort((a, b) => fechaDDMMYYYYaISO(a.fecha).localeCompare(fechaDDMMYYYYaISO(b.fecha)));
  const quincenas = quincenasDelPeriodo(fechaISOaDDMMYYYY(d.desde), fechaISOaDDMMYYYY(d.hasta));
  const tituloQ1 = `DÍAS A BORDO DEL ${fechaISOaDDMMYYYY(quincenas.primeraQuincena.desde)} AL ${fechaISOaDDMMYYYY(quincenas.primeraQuincena.hasta)}`.toUpperCase();
  const tituloQ2 = `DÍAS A BORDO DEL ${fechaISOaDDMMYYYY(quincenas.segundaQuincena.desde)} AL ${fechaISOaDDMMYYYY(quincenas.segundaQuincena.hasta)}`.toUpperCase();

  sheet.mergeCells(3, 1, 3, 8);
  celdaExcelGastos(sheet, 3, 1, tituloQ1, { bold: true, size: 12, align: 'center', borde: false });
  sheet.mergeCells(3, 12, 3, 19);
  celdaExcelGastos(sheet, 3, 12, tituloQ2, { bold: true, size: 12, align: 'center', borde: false });

  let f = 5;
  celdaExcelGastos(sheet, f, 1, 'NOMBRE:', { bold: true });
  sheet.mergeCells(f, 2, f, 8);
  celdaExcelGastos(sheet, f, 2, d.nombreCompleto, { bold: true });
  celdaExcelGastos(sheet, f, 12, 'NOMBRE:', { bold: true });
  sheet.mergeCells(f, 13, f, 19);
  celdaExcelGastos(sheet, f, 13, d.nombreCompleto, { bold: true });
  f += 2;

  const filaHeaderTabla = f;
  COLUMNAS_QUINCENA_DIAS_BORDO.forEach(([, label], i) => {
    celdaExcelGastos(sheet, filaHeaderTabla, i + 1, label, { bold: true, align: 'center', fill: EXCEL_COLOR_GOLD });
    celdaExcelGastos(sheet, filaHeaderTabla, i + 12, label, { bold: true, align: 'center', fill: EXCEL_COLOR_GOLD });
  });
  f++;

  const maxFilas = Math.max(q1.length, q2.length, 1);
  for (let i = 0; i < maxFilas; i++) {
    COLUMNAS_QUINCENA_DIAS_BORDO.forEach(([key], c) => {
      const esMonto = key === 'monto';
      const v1 = q1[i] ? (esMonto ? (Number(q1[i][key]) || 0) : (q1[i][key] ?? '')) : '';
      const v2 = q2[i] ? (esMonto ? (Number(q2[i][key]) || 0) : (q2[i][key] ?? '')) : '';
      celdaExcelGastos(sheet, f, c + 1, v1, { align: esMonto ? 'right' : 'left', formato: esMonto ? '"S/" #,##0.00' : undefined, fill: EXCEL_COLOR_CREAM });
      celdaExcelGastos(sheet, f, c + 12, v2, { align: esMonto ? 'right' : 'left', formato: esMonto ? '"S/" #,##0.00' : undefined, fill: EXCEL_COLOR_CREAM });
    });
    f++;
  }

  const totalQ1 = q1.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);
  const totalQ2 = q2.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);
  celdaExcelGastos(sheet, f, 7, 'TOTAL', { bold: true, align: 'right', fill: EXCEL_COLOR_GOLD });
  celdaExcelGastos(sheet, f, 8, totalQ1, { bold: true, align: 'right', fill: EXCEL_COLOR_GOLD, formato: '"S/" #,##0.00' });
  celdaExcelGastos(sheet, f, 18, 'TOTAL', { bold: true, align: 'right', fill: EXCEL_COLOR_GOLD });
  celdaExcelGastos(sheet, f, 19, totalQ2, { bold: true, align: 'right', fill: EXCEL_COLOR_GOLD, formato: '"S/" #,##0.00' });
  f += 2;

  celdaExcelGastos(sheet, f, 17, 'Total del Mes', { bold: true, align: 'right', borde: false });
  celdaExcelGastos(sheet, f, 19, totalQ1 + totalQ2, { bold: true, align: 'right', borde: false, formato: '"S/" #,##0.00' });
  f += 3;

  celdaExcelGastos(sheet, f, 1, 'AUTORIZADO POR', { align: 'center', borde: false });
  celdaExcelGastos(sheet, f, 7, 'RECIBÍ CONFORME', { align: 'center', borde: false });
  celdaExcelGastos(sheet, f, 12, 'AUTORIZADO POR', { align: 'center', borde: false });
  celdaExcelGastos(sheet, f, 18, 'RECIBÍ CONFORME', { align: 'center', borde: false });
}

// Arma el workbook y dispara la descarga del .xlsx — la usa tanto el ícono
// de ojo de la grilla (web) como "Reportes > Descargar" (móvil).
async function descargarWorkbookGastos(d) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(d.tipo.slice(0, 30));

  if (d.tipo === 'Días a Bordo') construirHojaExcelDiasABordo(sheet, d);
  else construirHojaExcelAlimentosMovilidad(sheet, d);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${d.tipo.replace(/\s+/g, '-')}-${d.usuario}-${fechaISOaDDMMYYYY(d.desde).replace(/\//g, '')}-${fechaISOaDDMMYYYY(d.hasta).replace(/\//g, '')}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* =================================================
   PDF (impresión) — mismo contenido y layout que el Excel de arriba, con la
   diferencia de que acá sí se puede mostrar una marca de agua gráfica
   diagonal real (algo que un .xlsx no soporta sin plugins).
================================================= */
function marcaAguaGastosHTML() {
  const texto = 'PROCESOS OPERACIONES — INTERTEK CALEB BRETT';
  const repeticiones = Array.from({ length: 24 }, () => `<span>${texto}</span>`).join('');
  return `<div class="marca-agua">${repeticiones}</div>`;
}

// Mismas 2 tablas lado a lado (una por quincena) que construirHojaExcelDiasABordo
// — el PDF debe verse igual que el Excel, no una versión "parecida".
function tablaDiasABordoQuincenasHTML(d) {
  const q1 = d.filas.filter(f => quincenaDeFecha(f.fecha) === 1).sort((a, b) => fechaDDMMYYYYaISO(a.fecha).localeCompare(fechaDDMMYYYYaISO(b.fecha)));
  const q2 = d.filas.filter(f => quincenaDeFecha(f.fecha) === 2).sort((a, b) => fechaDDMMYYYYaISO(a.fecha).localeCompare(fechaDDMMYYYYaISO(b.fecha)));
  const quincenas = quincenasDelPeriodo(fechaISOaDDMMYYYY(d.desde), fechaISOaDDMMYYYY(d.hasta));
  const tituloQ1 = `DÍAS A BORDO DEL ${fechaISOaDDMMYYYY(quincenas.primeraQuincena.desde)} AL ${fechaISOaDDMMYYYY(quincenas.primeraQuincena.hasta)}`.toUpperCase();
  const tituloQ2 = `DÍAS A BORDO DEL ${fechaISOaDDMMYYYY(quincenas.segundaQuincena.desde)} AL ${fechaISOaDDMMYYYY(quincenas.segundaQuincena.hasta)}`.toUpperCase();
  const totalQ1 = q1.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);
  const totalQ2 = q2.reduce((acc, x) => acc + (Number(x.monto) || 0), 0);

  const filasQuincenaHTML = lista => lista.length
    ? lista.map(f => `<tr>${COLUMNAS_QUINCENA_DIAS_BORDO.map(([key]) => {
        const esMonto = key === 'monto';
        return `<td${esMonto ? ' style="text-align:right;"' : ''}>${esMonto ? 'S/ ' + Number(f[key] || 0).toFixed(2) : (f[key] ?? '—')}</td>`;
      }).join('')}</tr>`).join('')
    : `<tr><td colspan="${COLUMNAS_QUINCENA_DIAS_BORDO.length}" style="text-align:center;color:#888;">Sin días en esta quincena.</td></tr>`;

  const unaQuincenaHTML = (titulo, lista, total) => `
    <table class="quincena-tabla">
      <caption>${titulo}</caption>
      <thead><tr>${COLUMNAS_QUINCENA_DIAS_BORDO.map(([, label]) => `<th>${label}</th>`).join('')}</tr></thead>
      <tbody>${filasQuincenaHTML(lista)}</tbody>
      <tfoot><tr class="fila-total"><td colspan="${COLUMNAS_QUINCENA_DIAS_BORDO.length - 1}">TOTAL</td><td>S/ ${total.toFixed(2)}</td></tr></tfoot>
    </table>`;

  return `
    <div class="quincenas-wrap">
      ${unaQuincenaHTML(tituloQ1, q1, totalQ1)}
      ${unaQuincenaHTML(tituloQ2, q2, totalQ2)}
    </div>
    <p class="total-del-mes">Total del Mes: <strong>S/ ${(totalQ1 + totalQ2).toFixed(2)}</strong></p>`;
}

// Arma el HTML del reporte a partir de "d" (ver prepararDescargaGastos) —
// lo usan tanto la descarga en PDF (descarga + imprime, con la marca de
// agua diagonal que un PDF sí soporta) como la vista previa ("modoExcel":
// un aviso de texto plano en vez de la marca de agua, para calcar el
// encabezado del .xlsx real).
function construirHTMLReporteGastos(d, modoExcel) {
  const { tipo, desde, hasta, columnas, campoTotal, filas, colaborador, nombreCompleto, area, numero, totalGeneral, tituloTipo } = d;

  const filasHTML = filas.map(fila => `
    <tr>${columnas.map(([key]) => {
      const esMonto = !!DESCARGA_COLUMNAS_MONTO[key];
      const valor = valorColumnaGasto(fila, key);
      return `<td${esMonto ? ' style="text-align:right;"' : ''}>${esMonto ? 'S/ ' + Number(valor || 0).toFixed(2) : (valor ?? '')}</td>`;
    }).join('')}</tr>`).join('');

  const colTotalIndex = columnas.findIndex(([key]) => key === campoTotal);
  const esDiasABordo = tipo === 'Días a Bordo';

  const bloqueEncabezadoInfo = esDiasABordo
    ? `<table class="info-tabla"><tr><th style="width:90px;">NOMBRE:</th><td colspan="8">${nombreCompleto}</td></tr></table>`
    : `<table class="info-tabla">
        <tr><th>Razón social:</th><td colspan="2">${EMPRESA_GASTOS.razonSocial.toUpperCase()}</td><th>N°</th><td>${numero}</td></tr>
        <tr><th>RUC :</th><td colspan="2">${EMPRESA_GASTOS.ruc}</td><th>Fecha de emisión:</th><td>${fechaHoraActualGastos()}</td></tr>
        <tr><th>Nombres y apellidos</th><td colspan="2">${nombreCompleto}</td><th>Centro de costo:</th><td>${CENTRO_COSTO_GASTOS}</td></tr>
        <tr><th>Cargo</th><td>${colaborador.cargo || '—'}</td><th>Doc. Identidad:</th><td>${colaborador.docIdentidad || '—'}</td><th>Área:</th><td>${area}</td></tr>
      </table>
      <div class="asignacion-fila"><strong>ASIGNACIÓN ESPECÍFICA</strong><span>PERÍODO DEL ${fechaISOaDDMMYYYY(desde).toUpperCase()} AL ${fechaISOaDDMMYYYY(hasta).toUpperCase()}</span></div>`;

  const bloqueFirmas = esDiasABordo
    ? `<div class="firma-fila-doble">
        <div class="firma-linea-doble">AUTORIZADO POR</div>
        <div class="firma-linea-doble"><strong>${nombreCompleto}</strong><br>RECIBÍ CONFORME</div>
      </div>`
    : `<p class="firma-label">Firma del Trabajador:<span class="firma-raya"></span></p>
      <div class="revisado-fila">
        <div class="revisado-box"><div class="revisado-titulo">Revisado:</div><div class="revisado-valor"></div><div class="revisado-pie">Jefe Inmediato</div></div>
        <div class="revisado-box"><div class="revisado-titulo">Autorizado :</div><div class="revisado-valor"></div><div class="revisado-pie">Gerente de Área</div></div>
      </div>
      <p class="base-legal"><strong>BASE LEGAL:</strong> ${BASE_LEGAL_GASTOS}</p>`;

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>${tipo} — ${nombreCompleto}</title>
    <style>
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
      body  { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; color: #111; position: relative; }
      .marca { margin-bottom: 10px; }
      .marca img { width: 170px; height: auto; display: block; }
      h2    { font-size: 13px; text-align: center; text-transform: uppercase; letter-spacing: .05em; margin: 10px 0; }
      .info-tabla { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
      .info-tabla th, .info-tabla td { border: 1px solid #999; padding: 4px 8px; font-size: 9px; }
      .info-tabla th { text-align: left; background: #fff; font-weight: 700; white-space: nowrap; }
      .info-tabla td { background: #FFF8DD; }
      .asignacion-fila { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; margin: 10px 0 6px; }
      table.datos { width: 100%; border-collapse: collapse; }
      table.datos th { background: #FFC000; color: #111; padding: 6px 8px; text-align: center;
              font-size: 8.5px; text-transform: uppercase; letter-spacing: .03em; border: 1px solid #999; }
      table.datos.sin-color th { background: #fff; border: 1px solid #111; }
      table.datos td { padding: 5px 8px; border: 1px solid #ddd; background: #FFF8DD; }
      table.datos.sin-color td { background: #fff; }
      .fila-total td { font-weight: 700; background: #FFC000; text-align: right; border: 1px solid #999; }
      .firma-label { margin-top: 36px; font-weight: 700; font-size: 10px; }
      .firma-raya { display: inline-block; width: 220px; border-bottom: 1px solid #111; margin-left: 8px; }
      .revisado-fila { display: flex; justify-content: space-between; margin-top: 26px; gap: 40px; }
      .revisado-box { flex: 1; border: 1px solid #999; text-align: center; }
      .revisado-titulo { background: #FFF8DD; font-weight: 700; font-size: 9px; padding: 4px; border-bottom: 1px solid #999; }
      .revisado-valor { height: 24px; background: #FFF8DD; }
      .revisado-pie { font-weight: 700; font-size: 9px; padding: 3px; }
      .base-legal { font-size: 8px; color: #333; margin-top: 14px; }
      .firma-fila-doble { display: flex; justify-content: space-around; margin-top: 60px; text-align: center; }
      .firma-linea-doble { border-top: 1px solid #111; padding-top: 4px; font-size: 9px; width: 220px; }
      .pie-codigo { display: flex; justify-content: space-between; font-size: 7.5px; color: #777; margin-top: 20px; }
      .quincenas-wrap { display: flex; gap: 14px; align-items: flex-start; }
      .quincena-tabla { flex: 1; width: 50%; border-collapse: collapse; }
      .quincena-tabla caption { font-size: 9.5px; font-weight: 700; text-align: center; padding: 4px 0 6px; caption-side: top; }
      .quincena-tabla th { background: #FFC000; color: #111; padding: 4px 5px; text-align: center; font-size: 7.5px; text-transform: uppercase; border: 1px solid #999; }
      .quincena-tabla td { padding: 4px 5px; border: 1px solid #ddd; background: #FFF8DD; font-size: 8px; }
      .quincena-tabla .fila-total td { font-weight: 700; background: #FFC000; text-align: right; border: 1px solid #999; }
      .total-del-mes { text-align: right; font-size: 11px; font-weight: 700; margin-top: 10px; }
      .marca-agua {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-wrap: wrap; align-content: space-around; justify-content: space-around;
        transform: rotate(-30deg); transform-origin: center;
        opacity: .09; font-size: 16px; font-weight: 700; color: #000;
        pointer-events: none; z-index: 1; overflow: hidden;
      }
      .marca-agua span { margin: 18px 26px; white-space: nowrap; }
      .aviso-descarga { font-size: 10px; font-weight: 700; text-align: center; margin-bottom: 10px; }
      .hoja { position: relative; z-index: 2; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    ${modoExcel ? `<div class="aviso-descarga">${textoDescargadoDesdeGastos()}</div>` : marcaAguaGastosHTML()}
    <div class="hoja">
      <div class="marca"><img src="data:image/png;base64,${LOGO_INTERTEK_BASE64}" alt="Intertek"></div>
      ${esDiasABordo ? '' : `<h2>${tituloTipo}</h2>`}${bloqueEncabezadoInfo}
      ${esDiasABordo ? tablaDiasABordoQuincenasHTML(d) : `
      <table class="datos">
        <thead><tr>${columnas.map(([, label]) => `<th>${label}</th>`).join('')}</tr></thead>
        <tbody>${filasHTML}</tbody>
        <tfoot><tr class="fila-total">${(() => {
          const restantes = columnas.length - colTotalIndex - 2;
          return `<td colspan="${colTotalIndex}">TOTAL GENERAL</td><td>S/ ${totalGeneral.toFixed(2)}</td>${restantes > 0 ? `<td colspan="${restantes}"></td>` : ''}`;
        })()}</tr></tfoot>
      </table>`}
      ${bloqueFirmas}
    </div>
  </body></html>`;

  return html;
}

// Abre el reporte en una ventana nueva, solo para verlo — no dispara ni
// descarga ni impresión por sí sola. "imprimir" además abre el diálogo de
// impresión (descarga PDF real); "modoExcel" cambia el encabezado para
// calcar el .xlsx en vez del PDF (ver construirHTMLReporteGastos).
function abrirVentanaReporteGastos(d, { imprimir = false, modoExcel = false } = {}) {
  const win = window.open('', '_blank', 'width=1000,height=700');
  win.document.write(construirHTMLReporteGastos(d, modoExcel));
  win.document.close();
  win.focus();
  if (imprimir) win.print();
}

/* =================================================
   ÚLTIMA DESCARGA — igual que "Última Descarga" de Precintos: {fecha, por,
   desde, hasta} por usuario+tipo, persistido. La usan tanto la grilla web
   (columna "Última Descarga") como, si hiciera falta, el móvil.
================================================= */
const TIPOS_GASTO_PREVIEW = ['Alimentos', 'Movilidad', 'Días a Bordo'];

const ULTIMA_DESCARGA_GASTOS = tgCargarCatalogo('ultimaDescargaGastosData', {});
function claveUltimaDescargaGastos(usuario, tipo) { return `${usuario}|${tipo}`; }

// Migración: navegadores con el formato viejo (string ISO suelto) se quedan
// con "por"/"desde"/"hasta" en null, sin perder la fecha ya registrada.
Object.keys(ULTIMA_DESCARGA_GASTOS).forEach(clave => {
  if (typeof ULTIMA_DESCARGA_GASTOS[clave] === 'string') {
    ULTIMA_DESCARGA_GASTOS[clave] = { fecha: ULTIMA_DESCARGA_GASTOS[clave], por: null, desde: null, hasta: null };
  }
});

function registrarUltimaDescargaGastos(usuario, tipo, desde, hasta) {
  const sesion = obtenerUsuarioActual();
  ULTIMA_DESCARGA_GASTOS[claveUltimaDescargaGastos(usuario, tipo)] = {
    fecha: new Date().toISOString(), por: sesion ? sesion.usuario : null, desde: desde || null, hasta: hasta || null
  };
  tgGuardarCatalogo('ultimaDescargaGastosData', ULTIMA_DESCARGA_GASTOS);
}

function obtenerUltimaDescargaGastos(usuario, tipo) {
  return ULTIMA_DESCARGA_GASTOS[claveUltimaDescargaGastos(usuario, tipo)] || null;
}

function textoUltimaDescargaGastos(usuario, tipo) {
  const registro = obtenerUltimaDescargaGastos(usuario, tipo);
  if (!registro) return 'Sin descargas registradas';
  const f = new Date(registro.fecha);
  const fechaHora = `${f.toLocaleDateString('es-PE')} ${f.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  const porTexto = registro.por ? ` por ${nombreColaboradorGastos(registro.por)}` : '';
  const periodoTexto = (registro.desde && registro.hasta) ? ` — período ${fechaISOaDDMMYYYY(registro.desde)} al ${fechaISOaDDMMYYYY(registro.hasta)}` : '';
  return `Última descarga: ${fechaHora}${porTexto}${periodoTexto}`;
}

// Más reciente de los 3 tipos (Alimentos/Movilidad/Días a Bordo) de un
// operador — columna "Última Descarga" de la grilla principal.
function textoUltimaDescargaGastosOperador(usuario) {
  const registros = TIPOS_GASTO_PREVIEW
    .map(tipo => obtenerUltimaDescargaGastos(usuario, tipo))
    .filter(Boolean)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  if (!registros.length) return 'Sin descargas registradas';
  const f = new Date(registros[0].fecha);
  const porTexto = registros[0].por ? ` por ${nombreColaboradorGastos(registros[0].por)}` : '';
  return `${f.toLocaleDateString('es-PE')} ${f.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}${porTexto}`;
}
