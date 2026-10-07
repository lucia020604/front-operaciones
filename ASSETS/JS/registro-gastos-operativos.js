// =================================================
// REGISTRO-GASTOS-OPERATIVOS.JS
// Precintos > Registro de Gastos Operativos: grilla principal (una fila por
// operador — no hay aprobación/estado, el supervisor puede editar en
// cualquier momento), filtro de búsqueda (operador/tipo/rango), vista previa
// + descarga desde el ícono de ojo, y el modal de "Configuración de Límites
// para Gastos". La lógica de los 3 modales de Detalle (Alimentos/Movilidad/
// Días a Bordo) vive en detalle-gastos.js.
// =================================================

document.addEventListener('DOMContentLoaded', () => {
  poblarFiltroUsuarioGastos();
  renderTablaGastosOperativos();
  actualizarAlertaFeriadoEspecial();
});

/* =================================================
   FILTRO DE BÚSQUEDA DE LA GRILLA — por nombre/apellido, operador, tipo de
   reporte y rango de fechas (contra los períodos de cada operador). Ya no
   alimenta una descarga: la descarga real vive en el ícono de ojo de cada
   fila (ver VISTA PREVIA DESDE LA GRILLA más abajo).
================================================= */
function poblarFiltroUsuarioGastos() {
  const select = document.getElementById('filterGastosUsuario');
  if (!select) return;
  const usuarios = [...new Set(GASTOS_OPERATIVOS_DEMO
    .map(g => obtenerDetalleGastoPorTipo(g.tipo, g.id)?.firmaTrabajador)
    .filter(Boolean))];
  select.innerHTML = '<option value="">Todos</option>' +
    usuarios.map(u => `<option value="${u}">${nombreColaboradorGastos(u)}</option>`).join('');
}

function filtrarGastosOperativos() {
  const texto = document.getElementById('searchGastosOperativos').value.trim().toLowerCase();
  const usuario = document.getElementById('filterGastosUsuario').value;
  const tipo = document.getElementById('filterGastosTipo').value;
  const desde = document.getElementById('filterGastosDesde').value;
  const hasta = document.getElementById('filterGastosHasta').value;

  const grupos = agruparGastosPorOperador().filter(grupo => {
    // Además de nombre/apellido, busca por código de jornada, PER y cliente
    // dentro de los registros de sus 3 reportes (mismos campos que ya ve el
    // móvil en "Reportes").
    if (texto) {
      const matchNombre = `${grupo.nombre} ${grupo.apellido}`.toLowerCase().includes(texto);
      const matchDetalle = grupo.reportes.some(r => {
        const detalle = obtenerDetalleGastoPorTipo(r.tipo, r.id);
        if (!detalle) return false;
        return detalle.grilla.some(f => {
          const campos = [f.codigoJornada, f.codigo, f.operacionPer, f.cliente, f.per].filter(Boolean).join(' ').toLowerCase();
          return campos.includes(texto);
        });
      });
      if (!matchNombre && !matchDetalle) return false;
    }
    if (usuario && grupo.usuario !== usuario) return false;
    if (tipo && !grupo.reportes.some(r => r.tipo === tipo)) return false;
    if (desde || hasta) {
      const dentroDelRango = grupo.reportes.some(r => {
        const rDesde = fechaDDMMYYYYaISO(r.fechaDesde);
        const rHasta = fechaDDMMYYYYaISO(r.fechaHasta);
        if (desde && rHasta < desde) return false;
        if (hasta && rDesde > hasta) return false;
        return true;
      });
      if (!dentroDelRango) return false;
    }
    return true;
  });

  renderTablaGastosOperativos(grupos);
}

function limpiarFiltrosGastosOperativos() {
  document.getElementById('searchGastosOperativos').value = '';
  document.getElementById('filterGastosUsuario').value = '';
  document.getElementById('filterGastosTipo').value = '';
  document.getElementById('filterGastosDesde').value = '';
  document.getElementById('filterGastosHasta').value = '';
  renderTablaGastosOperativos();
}

/* =================================================
   GRILLA PRINCIPAL — una fila por operador (no hay aprobación/estado que
   cerrar, el supervisor solo ve y descarga). "Ver" abre el resumen de sus 3
   reportes del período actual (Alimentos/Movilidad/Días a Bordo), cada uno
   descargable; "Historial" abre el histórico por tipo+período.
================================================= */
function agruparGastosPorOperador() {
  const grupos = new Map();
  GASTOS_OPERATIVOS_DEMO.forEach(g => {
    const detalle = obtenerDetalleGastoPorTipo(g.tipo, g.id);
    const usuario = detalle ? detalle.firmaTrabajador : null;
    const clave = usuario || `${g.nombre}|${g.apellido}`;
    if (!grupos.has(clave)) {
      grupos.set(clave, { clave, usuario, nombre: g.nombre, apellido: g.apellido, area: g.area, reportes: [] });
    }
    grupos.get(clave).reportes.push(g);
  });
  return [...grupos.values()];
}

// Rango que cubre todos los períodos de un tipo de reporte del operador —
// lo usan por igual el listado de "Ver" y la descarga.
function rangoReportesOperador(reportes) {
  return {
    desde: reportes.map(r => fechaDDMMYYYYaISO(r.fechaDesde)).sort()[0],
    hasta: reportes.map(r => fechaDDMMYYYYaISO(r.fechaHasta)).sort().at(-1)
  };
}

// La fila más reciente de un operador (por fechaHasta, entre sus 3 tipos de
// reporte) — "Último período" de la grilla.
function ultimaCargaOperador(grupo) {
  return grupo.reportes.reduce((mas, r) =>
    (!mas || fechaDDMMYYYYaISO(r.fechaHasta) > fechaDDMMYYYYaISO(mas.fechaHasta)) ? r : mas, null);
}

// Descarga el reporte (período) con el id dado — lo usan el Historial y el
// modal de "elegir formato".
async function descargarReportePorId(reporteId, formato) {
  const r = GASTOS_OPERATIVOS_DEMO.find(g => g.id === reporteId);
  if (!r) return;
  const detalle = obtenerDetalleGastoPorTipo(r.tipo, r.id);
  const usuario = detalle ? detalle.firmaTrabajador : null;
  if (!usuario) { mostrarToast('Este operador no tiene un usuario del sistema asociado; no se puede generar el reporte.'); return; }

  const desde = fechaDDMMYYYYaISO(r.fechaDesde);
  const hasta = fechaDDMMYYYYaISO(r.fechaHasta);
  const d = prepararDescargaGastos({ usuario, tipo: r.tipo, desde, hasta });
  if (!d) return;

  if (formato === 'excel') await descargarWorkbookGastos(d);
  else abrirVentanaReporteGastos(d, { imprimir: true });

  registrarUltimaDescargaGastos(usuario, r.tipo, desde, hasta);
}

// Resumen de un reporte puntual (un período de uno de los 3 tipos): N° de
// reporte, cuántos gastos cargó el operario y el monto total.
function resumenReporteGasto(r) {
  // Días a Bordo se regenera antes de resumir (§1.2: "se regenera al abrir"
  // — acá se ve en el selector "Editar Gastos del Operador" sin tener que
  // entrar al Detalle primero).
  if (r.tipo === 'Días a Bordo') regenerarDiasABordo(r.id);
  const detalle = obtenerDetalleGastoPorTipo(r.tipo, r.id);
  if (!detalle) return { numero: '—', cantidad: 0, total: 0 };
  const cfg = CONFIG_TIPO_GASTO[r.tipo];
  const total = detalle.grilla.reduce((acc, fila) => acc + (Number(fila[cfg.campoMonto]) || 0), 0);
  return { numero: detalle.numero, cantidad: detalle.grilla.length, total };
}

function renderTablaGastosOperativos(gruposFiltrados) {
  const grupos = gruposFiltrados || agruparGastosPorOperador();
  const tbody = document.getElementById('tbodyGastosOperativos');

  if (!grupos.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="submodulo-tabla-vacio">No se encontraron registros de gastos operativos.</td></tr>`;
    return;
  }

  tbody.innerHTML = grupos.map(grupo => {
    const ultima = ultimaCargaOperador(grupo);
    return `
    <tr>
      <td>${grupo.nombre}</td>
      <td>${grupo.apellido}</td>
      <td>${grupo.area}</td>
      <td>${ultima ? `${ultima.fechaDesde} al ${ultima.fechaHasta}` : '—'}</td>
      <td class="ultima-descarga-cell">${grupo.usuario ? textoUltimaDescargaGastosOperador(grupo.usuario) : 'Sin descargas registradas'}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver" onclick="abrirSelectorPreviewGastos('${grupo.clave}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="btn-accion btn-ver" title="Historial" onclick="abrirSelectorEditarGastos('${grupo.clave}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 3"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

/* =================================================
   "VER" — resumen de los 3 reportes del operador (Alimentos/Movilidad/Días
   a Bordo); cada uno abre el Detalle real de su período más reciente, donde
   vive el botón "Descargar" (abre el modal de "elegir formato" Excel/PDF).
================================================= */
function abrirSelectorPreviewGastos(clave) {
  const grupo = agruparGastosPorOperador().find(g => g.clave === clave);
  if (!grupo) return;
  if (!grupo.usuario) { mostrarToast('Este operador no tiene un usuario del sistema asociado; no se puede generar el reporte.'); return; }

  document.getElementById('previewGastosOperadorNombre').textContent = `${grupo.nombre} ${grupo.apellido}`;
  renderPreviewGastosLista(grupo);
  abrirModal('modalPreviewGastos');
}

function renderPreviewGastosLista(grupo) {
  const cont = document.getElementById('previewGastosLista');
  const iconoOjo = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>';

  cont.innerHTML = TIPOS_GASTO_PREVIEW.map(tipo => {
    const reportes = grupo.reportes.filter(r => r.tipo === tipo);
    if (!reportes.length) {
      return `<div class="preview-gastos-opcion preview-gastos-opcion-vacia">
        <span class="preview-gastos-opcion-info">
          <span class="preview-gastos-opcion-titulo">${tipo}</span>
          <span class="preview-gastos-opcion-sub">Sin reportes registrados</span>
        </span>
      </div>`;
    }

    const { desde, hasta } = rangoReportesOperador(reportes);
    const ultimo = ultimoReporteDeTipo(reportes);
    return `<div class="preview-gastos-opcion">
      <span class="preview-gastos-opcion-info">
        <span class="preview-gastos-opcion-titulo">${tipo}</span>
        <span class="preview-gastos-opcion-sub">${reportes.length} período${reportes.length === 1 ? '' : 's'} · ${fechaISOaDDMMYYYY(desde)} al ${fechaISOaDDMMYYYY(hasta)}</span>
        <span class="preview-gastos-opcion-descarga">${textoUltimaDescargaGastos(grupo.usuario, tipo)}</span>
      </span>
      <span class="preview-gastos-opcion-acciones">
        <button type="button" class="btn-accion btn-ver" title="Ver" onclick="cerrarModal('modalPreviewGastos'); abrirDetalleGasto(${ultimo.id})">${iconoOjo}</button>
      </span>
    </div>`;
  }).join('');
}

// El reporte (período) más reciente de un tipo dado, por fechaHasta — "Ver"
// abre el Detalle de ese período.
function ultimoReporteDeTipo(reportes) {
  return reportes.reduce((mas, r) =>
    (!mas || fechaDDMMYYYYaISO(r.fechaHasta) > fechaDDMMYYYYaISO(mas.fechaHasta)) ? r : mas, null);
}

/* =================================================
   MODAL "ELEGIR FORMATO" — el botón "Descargar" del Detalle y de Historial
   abren este modal chico (Excel/PDF) en vez de duplicar botones;
   pendienteReporteId guarda qué reporte se va a descargar hasta elegir.
================================================= */
let pendienteReporteId = null;

function abrirElegirFormatoDescargaReporte(reporteId) {
  pendienteReporteId = reporteId;
  abrirModal('modalElegirFormatoDescarga');
}

async function confirmarFormatoDescargaElegido(formato) {
  if (!pendienteReporteId) return;
  const reporteId = pendienteReporteId;
  pendienteReporteId = null;
  cerrarModal('modalElegirFormatoDescarga');

  await descargarReportePorId(reporteId, formato);

  renderTablaGastosOperativos();
  if (editarGastosOperadorClave) renderTablaEditarGastosOperador();
  mostrarToast(`Reporte descargado correctamente (${formato === 'excel' ? 'Excel' : 'PDF'}).`);
}

/* =================================================
   HISTORIAL — 3 pestañas (Alimentos/Movilidad/Días a Bordo) del operador que
   abrió el modal, cada una lista sus períodos; búsqueda por N° de gasto
   (mismo nombre que la columna) + rango Desde/Hasta. "Ver" abre el Detalle
   real; el ícono de descarga abre el modal de "elegir formato".
================================================= */
let editarGastosOperadorClave = null;
let editarGastosOperadorTab = 'Alimentos';
let verGastosBusquedaFiltro = '';
let verGastosDesdeFiltro = '';
let verGastosHastaFiltro = '';

function abrirSelectorEditarGastos(clave) {
  const grupo = agruparGastosPorOperador().find(g => g.clave === clave);
  if (!grupo) return;

  editarGastosOperadorClave = clave;
  editarGastosOperadorTab = 'Alimentos';
  document.getElementById('editarGastosOperadorNombre').textContent = `${grupo.nombre} ${grupo.apellido}`;
  document.querySelectorAll('#modalEditarGastosOperador .limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.tab === 'Alimentos'));
  limpiarFiltrosVerGastosOperador();
  abrirModal('modalEditarGastosOperador');
}

function cambiarTabEditarGastosOperador(tipo) {
  editarGastosOperadorTab = tipo;
  document.querySelectorAll('#modalEditarGastosOperador .limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.tab === tipo));
  renderTablaEditarGastosOperador();
}

function filtrarVerGastosOperador() {
  verGastosBusquedaFiltro = document.getElementById('verGastosBusqueda').value.trim().toLowerCase();
  verGastosDesdeFiltro = document.getElementById('verGastosDesde').value;
  verGastosHastaFiltro = document.getElementById('verGastosHasta').value;
  renderTablaEditarGastosOperador();
}

function limpiarFiltrosVerGastosOperador() {
  verGastosBusquedaFiltro = ''; verGastosDesdeFiltro = ''; verGastosHastaFiltro = '';
  document.getElementById('verGastosBusqueda').value = '';
  document.getElementById('verGastosDesde').value = '';
  document.getElementById('verGastosHasta').value = '';
  renderTablaEditarGastosOperador();
}

// Un período coincide con la búsqueda si su N° de gasto (resumen.numero)
// calza — mismo campo que muestra la columna "N°".
function periodoCoincideBusqueda(resumen, texto) {
  if (!texto) return true;
  return String(resumen.numero).toLowerCase().includes(texto);
}

function periodoDentroDeRango(r) {
  if (!verGastosDesdeFiltro && !verGastosHastaFiltro) return true;
  const rDesde = fechaDDMMYYYYaISO(r.fechaDesde);
  const rHasta = fechaDDMMYYYYaISO(r.fechaHasta);
  if (verGastosDesdeFiltro && rHasta < verGastosDesdeFiltro) return false;
  if (verGastosHastaFiltro && rDesde > verGastosHastaFiltro) return false;
  return true;
}

function renderTablaEditarGastosOperador() {
  const grupo = agruparGastosPorOperador().find(g => g.clave === editarGastosOperadorClave);
  const tbody = document.getElementById('tbodyEditarGastosOperador');
  if (!grupo || !tbody) return;

  const todosDelTipo = grupo.reportes.filter(r => r.tipo === editarGastosOperadorTab);
  const reportes = todosDelTipo
    .filter(r => periodoDentroDeRango(r))
    .map(r => ({ r, resumen: resumenReporteGasto(r) }))
    .filter(({ resumen }) => periodoCoincideBusqueda(resumen, verGastosBusquedaFiltro))
    .sort((a, b) => fechaDDMMYYYYaISO(b.r.fechaDesde).localeCompare(fechaDDMMYYYYaISO(a.r.fechaDesde)));

  if (!reportes.length) {
    const hayFiltrosActivos = verGastosBusquedaFiltro || verGastosDesdeFiltro || verGastosHastaFiltro;
    tbody.innerHTML = todosDelTipo.length && hayFiltrosActivos
      ? `<tr><td colspan="5" class="submodulo-tabla-vacio">Sin períodos para los filtros elegidos.</td></tr>`
      : `<tr><td colspan="5" class="submodulo-tabla-vacio">Este operador no tiene reportes de ${editarGastosOperadorTab}.</td></tr>`;
    return;
  }

  tbody.innerHTML = reportes.map(({ r, resumen }) => `
    <tr>
      <td>${r.fechaDesde} al ${r.fechaHasta}</td>
      <td>${resumen.numero}</td>
      <td>${resumen.cantidad}</td>
      <td>S/ ${resumen.total.toFixed(2)}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver" onclick="abrirDetalleGasto(${r.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="btn-accion btn-editar" title="Descargar" onclick="abrirElegirFormatoDescargaReporte(${r.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

/* =================================================
   RESUMEN TOTAL DE DÍAS A BORDO (§1.4) — un solo archivo con TODOS los
   operadores del rango elegido, calcando "RESUMEN TOTAL DIAS A BORDO...xlsx":
   cabecera con "MONTOS ESTABLECIDOS" (tomados de la configuración vigente),
   una fila por operador (Feriados/Dom. Lima/Dom. Prov./Días a Bordo, en
   días y soles) y totales. Botón "Resumen Total" de la barra, para
   supervisores — el móvil no genera este reporte (ver §2 del prompt).
================================================= */
function abrirModalResumenTotal() {
  const hoy = new Date();
  const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 10);
  const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 9);
  const aISO = d => d.toISOString().slice(0, 10);
  document.getElementById('resumenTotalDesde').value = aISO(desde);
  document.getElementById('resumenTotalHasta').value = aISO(hasta);

  const ultima = ULTIMA_DESCARGA_GASTOS['resumen-total|Resumen Total'];
  document.getElementById('resumenTotalUltimaDescarga').textContent = ultima
    ? textoUltimaDescargaGastos('resumen-total', 'Resumen Total')
    : 'Sin descargas registradas';

  abrirModal('modalResumenTotal');
}

// Arma los datos del Resumen Total a partir del rango elegido — una fila
// por operador con actividad (ver operadoresConDiasABordo, data-gastos.js),
// ordenadas alfabéticamente por apellido, con N° correlativo 1..N.
function prepararResumenTotal(desde, hasta) {
  if (!desde || !hasta) { mostrarToast('Selecciona un rango de fechas.'); return null; }

  const operadores = operadoresConDiasABordo(desde, hasta)
    .map(({ usuario, resumen }) => {
      const u = obtenerUsuarioPorNombre(usuario);
      return { usuario, nombre: u ? `${u.apellido} ${u.nombre}` : usuario, resumen };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((op, i) => ({ ...op, numero: i + 1 }));

  if (!operadores.length) { mostrarToast('No se encontraron operadores con Días a Bordo en este rango.'); return null; }

  const cfg = LIMITES_GASTOS_DEMO.diasABordo;
  const totales = operadores.reduce((acc, op) => ({
    feriadoDias: acc.feriadoDias + op.resumen.feriadoDias,
    domLimaDias: acc.domLimaDias + op.resumen.domLimaDias,
    domProvDias: acc.domProvDias + op.resumen.domProvDias,
    bordoDias: acc.bordoDias + op.resumen.bordoDias,
    total: acc.total + op.resumen.total
  }), { feriadoDias: 0, domLimaDias: 0, domProvDias: 0, bordoDias: 0, total: 0 });

  return {
    desde, hasta, operadores, totales,
    montoFeriadoUSD: cfg.feriadosEspeciales.length ? cfg.feriadosEspeciales[0].montoUSD : 70,
    montoDomingo: cfg.domingo, montoDiaNormal: cfg.diaNormal,
    tituloPeriodo: `Del 10 de ${MESES_GASTOS[new Date(desde + 'T00:00:00').getMonth()].toUpperCase()} ${new Date(desde + 'T00:00:00').getFullYear()} al 09 ${MESES_GASTOS[new Date(hasta + 'T00:00:00').getMonth()].toUpperCase()} ${new Date(hasta + 'T00:00:00').getFullYear()}`,
    fechaEmision: fechaHoraActualGastos(),
    hayPendientes: operadores.some(op => op.resumen.pendiente)
  };
}

function construirHojaExcelResumenTotal(sheet, r) {
  aplicarMarcaAguaExcel(sheet);
  sheet.columns = [{ width: 4 }, { width: 28 }, { width: 16 }, { width: 12 },
    { width: 9 }, { width: 11 }, { width: 9 }, { width: 11 }, { width: 9 }, { width: 11 }, { width: 9 }, { width: 11 },
    { width: 13 }, { width: 16 }, { width: 12 }];

  sheet.mergeCells(1, 1, 1, 15);
  sheet.getRow(1).height = 60;
  const logoId = sheet.workbook.addImage({ base64: LOGO_INTERTEK_BASE64, extension: 'png' });
  sheet.addImage(logoId, { tl: { col: 0, row: 0.1 }, ext: { width: 180, height: 120 } });

  sheet.mergeCells(2, 2, 2, 15);
  celdaExcelGastos(sheet, 2, 2, 'RESUMEN TOTAL DE PAGO', { bold: true, size: 14, align: 'center', borde: false });

  celdaExcelGastos(sheet, 4, 11, 'MONTOS ESTABLECIDOS (S/.):', { bold: true, borde: false });
  celdaExcelGastos(sheet, 6, 2, 'PARA:', { bold: true, borde: false });
  celdaExcelGastos(sheet, 6, 11, 'DÍA FERIADO LABORADO (US$)', { bold: true, borde: false });
  celdaExcelGastos(sheet, 6, 15, r.montoFeriadoUSD, { bold: true, align: 'right', borde: false });
  celdaExcelGastos(sheet, 7, 2, 'DE:', { bold: true, borde: false });
  celdaExcelGastos(sheet, 7, 11, 'DÍA DOMINGO LABORADO EN LIMA', { bold: true, borde: false });
  celdaExcelGastos(sheet, 7, 15, r.montoDomingo, { bold: true, align: 'right', borde: false });
  celdaExcelGastos(sheet, 8, 2, 'REF:', { bold: true, borde: false });
  celdaExcelGastos(sheet, 8, 3, 'PAGO POR DIA LABORADO EN BUQUES', { bold: true, borde: false });
  celdaExcelGastos(sheet, 8, 11, 'DÍA DOMINGO LABORADO EN PROV.', { bold: true, borde: false });
  celdaExcelGastos(sheet, 8, 15, r.montoDomingo, { bold: true, align: 'right', borde: false });
  celdaExcelGastos(sheet, 9, 2, 'FECHA:', { bold: true, borde: false });
  celdaExcelGastos(sheet, 9, 3, r.tituloPeriodo, { bold: true, borde: false });
  celdaExcelGastos(sheet, 9, 11, 'DÍA A BORDO', { bold: true, borde: false });
  celdaExcelGastos(sheet, 9, 15, r.montoDiaNormal, { bold: true, align: 'right', borde: false });

  let f = 11;
  const headers1 = ['N°', 'APELLIDO Y NOMBRE', 'BUQUE', 'PER', 'Feriados Lab. (días)', 'Feriados Lab. (S/.)', 'Dom. Lab. Lima (días)', 'Dom. Lab. Lima (S/.)', 'Dom. Lab. Prov. (días)', 'Dom. Lab. Prov. (S/.)', 'Días a Bordo (días)', 'Días a Bordo (S/.)', 'TOTAL A COBRAR', 'FECHA DE FACTURACIÓN', 'CENTRO DE COSTOS'];
  headers1.forEach((label, i) => celdaExcelGastos(sheet, f, i + 1, label, { bold: true, align: 'center', fill: EXCEL_COLOR_GOLD, wrap: true }));
  f++;
  const filaInicioDatos = f;

  r.operadores.forEach(op => {
    const s = op.resumen;
    const valores = [op.numero, op.nombre, s.buque, s.per, s.feriadoDias || '', s.feriadoSoles || '', s.domLimaDias || '', s.domLimaSoles || '', s.domProvDias || '', s.domProvSoles || '', s.bordoDias || '', s.bordoSoles || '', s.total, r.fechaEmision, CENTRO_COSTO_GASTOS];
    valores.forEach((v, i) => {
      const esMonto = [5, 7, 9, 11, 12].includes(i);
      celdaExcelGastos(sheet, f, i + 1, v, { align: (i === 0 || esMonto) ? 'right' : 'left', formato: esMonto ? '"S/" #,##0.00' : undefined, fill: EXCEL_COLOR_CREAM });
    });
    f++;
  });
  const filaFinDatos = f - 1;

  celdaExcelGastos(sheet, f, 2, 'TOTALES', { bold: true, fill: EXCEL_COLOR_GOLD });
  [5, 7, 9, 11, 13].forEach(col => {
    celdaExcelGastos(sheet, f, col, { formula: `SUM(${sheet.getColumn(col).letter}${filaInicioDatos}:${sheet.getColumn(col).letter}${filaFinDatos})` }, { bold: true, align: 'right', fill: EXCEL_COLOR_GOLD, formato: col === 13 ? '"S/" #,##0.00' : undefined });
  });
  f += 2;

  sheet.mergeCells(f, 2, f, 15);
  celdaExcelGastos(sheet, f, 2, 'FAVOR DEPOSITAR LA CANTIDAD DE SOLES INDICADAS SEGÚN EL ACUERDO POR DÍAS LABORADOS', { bold: true, borde: false, align: 'center' });
  f += 3;

  const firmas = [['Revisado por:', 2], ['Autorizado por:', 6], ['Aprobado por:', 11]];
  firmas.forEach(([label, col]) => celdaExcelGastos(sheet, f, col, label, { bold: true, borde: false, align: 'center' }));
  f += 3;
  const pies = [['Área Solicitante', 2], ['Coordinador de RRHH', 6], ['Gerente General', 11]];
  pies.forEach(([label, col]) => celdaExcelGastos(sheet, f, col, label, { bold: true, borde: false, align: 'center' }));
}

function construirHTMLResumenTotal(r) {
  const filasHTML = r.operadores.map(op => {
    const s = op.resumen;
    return `<tr>
      <td>${op.numero}</td><td>${op.nombre}</td><td>${s.buque}</td><td>${s.per}</td>
      <td>${s.feriadoDias || ''}</td><td style="text-align:right;">${s.feriadoSoles ? 'S/ ' + s.feriadoSoles.toFixed(2) : ''}</td>
      <td>${s.domLimaDias || ''}</td><td style="text-align:right;">${s.domLimaSoles ? 'S/ ' + s.domLimaSoles.toFixed(2) : ''}</td>
      <td>${s.domProvDias || ''}</td><td style="text-align:right;">${s.domProvSoles ? 'S/ ' + s.domProvSoles.toFixed(2) : ''}</td>
      <td>${s.bordoDias || ''}</td><td style="text-align:right;">${s.bordoSoles ? 'S/ ' + s.bordoSoles.toFixed(2) : ''}</td>
      <td style="text-align:right;font-weight:700;">S/ ${s.total.toFixed(2)}</td>
      <td>${r.fechaEmision}</td><td>${CENTRO_COSTO_GASTOS}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Resumen Total de Días a Bordo</title>
    <style>
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 9px; margin: 18px; color: #111; }
      .marca img { width: 170px; height: auto; display: block; margin-bottom: 8px; }
      h1 { font-size: 15px; text-align: center; text-transform: uppercase; margin: 4px 0 12px; }
      .cab-grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 10px; font-size: 10px; }
      .cab-grid div { line-height: 1.6; }
      .montos-tabla { border-collapse: collapse; font-size: 9.5px; }
      .montos-tabla td { padding: 2px 8px; font-weight: 700; }
      table.datos { width: 100%; border-collapse: collapse; margin-top: 8px; }
      table.datos th { background: #FFC000; padding: 4px 3px; font-size: 7px; text-transform: uppercase; border: 1px solid #999; text-align: center; }
      table.datos td { padding: 3px; border: 1px solid #ddd; background: #FFF8DD; font-size: 8px; }
      .fila-total td { font-weight: 700; background: #FFC000; border: 1px solid #999; }
      .leyenda { font-weight: 700; text-align: center; margin: 10px 0; font-size: 9.5px; }
      .firmas { display: flex; justify-content: space-around; margin-top: 50px; text-align: center; font-size: 9px; }
      .firmas div { border-top: 1px solid #111; padding-top: 4px; width: 160px; }
      @media print { @page { margin: 12mm; size: landscape; } }
    </style>
  </head><body>
    <div class="marca"><img src="data:image/png;base64,${LOGO_INTERTEK_BASE64}" alt="Intertek"></div>
    <h1>Resumen Total de Pago</h1>
    <div class="cab-grid">
      <div><strong>PARA:</strong> Operadores con Días a Bordo<br><strong>DE:</strong><br><strong>REF:</strong> Pago por día laborado en buques<br><strong>FECHA:</strong> ${r.tituloPeriodo}</div>
      <table class="montos-tabla">
        <tr><td>Día feriado laborado (US$)</td><td>${r.montoFeriadoUSD.toFixed(2)}</td></tr>
        <tr><td>Día domingo laborado en Lima</td><td>${r.montoDomingo.toFixed(2)}</td></tr>
        <tr><td>Día domingo laborado en provincia</td><td>${r.montoDomingo.toFixed(2)}</td></tr>
        <tr><td>Día a bordo</td><td>${r.montoDiaNormal.toFixed(2)}</td></tr>
      </table>
    </div>
    <table class="datos">
      <thead><tr>
        <th>N°</th><th>Apellido y Nombre</th><th>Buque</th><th>PER</th>
        <th colspan="2">Feriados Lab.</th><th colspan="2">Dom. Lab. Lima</th><th colspan="2">Dom. Lab. Prov.</th><th colspan="2">Días a Bordo</th>
        <th>Total a Cobrar</th><th>Fecha de Facturación</th><th>Centro de Costos</th>
      </tr></thead>
      <tbody>${filasHTML}</tbody>
      <tfoot><tr class="fila-total">
        <td colspan="4">TOTALES</td>
        <td>${r.totales.feriadoDias || ''}</td><td></td>
        <td>${r.totales.domLimaDias || ''}</td><td></td>
        <td>${r.totales.domProvDias || ''}</td><td></td>
        <td>${r.totales.bordoDias || ''}</td><td></td>
        <td>S/ ${r.totales.total.toFixed(2)}</td><td colspan="2"></td>
      </tr></tfoot>
    </table>
    <p class="leyenda">FAVOR DEPOSITAR LA CANTIDAD DE SOLES INDICADAS SEGÚN EL ACUERDO POR DÍAS LABORADOS</p>
    <div class="firmas">
      <div>Revisado por:<br>Área Solicitante</div>
      <div>Autorizado por:<br>Coordinador de RRHH</div>
      <div>Aprobado por:<br>Gerente General</div>
    </div>
  </body></html>`;
}

async function descargarResumenTotalExcel(r) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Resumen Total');
  construirHojaExcelResumenTotal(sheet, r);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Resumen-Total-Dias-A-Bordo-${r.desde}-al-${r.hasta}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function descargarResumenTotalPDF(r) {
  const win = window.open('', '_blank', 'width=1200,height=700');
  win.document.write(construirHTMLResumenTotal(r));
  win.document.close();
  win.focus();
  win.print();
}

async function confirmarDescargarResumenTotal(formato) {
  const desde = document.getElementById('resumenTotalDesde').value;
  const hasta = document.getElementById('resumenTotalHasta').value;
  const r = prepararResumenTotal(desde, hasta);
  if (!r) return;
  if (r.hayPendientes) mostrarToast('Ojo: hay operadores con Feriados especiales sin tipo de cambio registrado — ese monto queda en 0 hasta que se registre.');

  if (formato === 'excel') await descargarResumenTotalExcel(r);
  else descargarResumenTotalPDF(r);

  registrarUltimaDescargaGastos('resumen-total', 'Resumen Total', desde, hasta);
  cerrarModal('modalResumenTotal');
  document.getElementById('downloadDropdownResumenTotal')?.classList.remove('open');
  mostrarToast(`Resumen Total descargado correctamente (${formato === 'excel' ? 'Excel' : 'PDF'}).`);
}

function toggleDescargaResumenTotalDropdown() {
  document.getElementById('downloadDropdownResumenTotal').classList.toggle('open');
}

/* =================================================
   MODAL: CONFIGURACIÓN DE LÍMITES PARA GASTOS
================================================= */
function cambiarTabLimites(tab) {
  document.querySelectorAll('.limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.tab === tab));
  document.getElementById('limitesPanelAlimentos').classList.toggle('activo', tab === 'alimentos');
  document.getElementById('limitesPanelMovilidad').classList.toggle('activo', tab === 'movilidad');
  document.getElementById('limitesPanelDiasABordo').classList.toggle('activo', tab === 'diasABordo');
  document.getElementById('limitesPanelJornada').classList.toggle('activo', tab === 'jornada');
}

// =================================================
// FERIADOS ESPECIALES (tipo de cambio) — mismo patrón de alta/baja que
// "Días Especiales" para la fecha (día+mes recurrente) y el monto, salvo que
// acá el monto está en dólares: lo que hace falta además es el tipo de
// cambio del día exacto, que se registra una sola vez desde
// renderAlertaTipoCambioHoy/guardarTipoCambioHoy (ver data-gastos.js >
// registrarTipoCambioFeriadoEspecial), para saber a cuánto equivale en soles.
// =================================================
function poblarSelectsFeriadoEspecial() {
  const selectDia = document.getElementById('nuevoFeriadoEspecialDia');
  const selectMes = document.getElementById('nuevoFeriadoEspecialMes');
  if (!selectDia || !selectMes) return;

  selectDia.innerHTML = Array.from({ length: 31 }, (_, i) => i + 1)
    .map(d => `<option value="${d}">${d}</option>`).join('');
  selectMes.innerHTML = MESES_GASTOS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
}

/* =================================================
   FERIADOS OFICIALES (calendario oficial peruano, PROMPT_GASTOS_CONFIG_
   SPRINT4 §2) — se pagan todos al mismo monto fijo (cfg.feriadoOficial,
   ver "Montos fijos"); esta lista solo define QUÉ fechas cuentan como
   feriado oficial (Día, Mes, Descripción, Año opcional — con año = fecha
   puntual de un año concreto, p.ej. Jueves/Viernes Santo; sin año = se
   repite cada año). Mismo patrón visual que Feriados Especiales de abajo,
   sin la parte de tipo de cambio (acá el monto ya es fijo en soles).
================================================= */
function poblarSelectsFeriado() {
  const selectDia = document.getElementById('nuevoFeriadoDia');
  const selectMes = document.getElementById('nuevoFeriadoMes');
  if (!selectDia || !selectMes) return;

  selectDia.innerHTML = Array.from({ length: 31 }, (_, i) => i + 1)
    .map(d => `<option value="${d}">${d}</option>`).join('');
  selectMes.innerHTML = MESES_GASTOS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
}

function renderTablaFeriados() {
  const tbody = document.getElementById('tbodyFeriados');
  if (!tbody) return;
  const fechas = (LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales || [])
    .slice()
    .sort((a, b) => (a.mes - b.mes) || (a.dia - b.dia));
  tbody.innerHTML = fechas.length
    ? fechas.map(f => `
      <tr>
        <td>${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')}${f.anio ? `/${f.anio}` : ''} <span class="dia-especial-nota">${f.anio ? `(solo ${f.anio})` : '(todos los años)'}</span></td>
        <td>${f.descripcion || '—'}</td>
        <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarFeriado(${f.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button></td>
      </tr>`).join('')
    : `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron Feriados Oficiales.</td></tr>`;
}

function agregarFeriado() {
  const diaInput = document.getElementById('nuevoFeriadoDia');
  const mesInput = document.getElementById('nuevoFeriadoMes');
  const descripcionInput = document.getElementById('nuevoFeriadoDescripcion');
  const anioInput = document.getElementById('nuevoFeriadoAnio');
  const dia = parseInt(diaInput.value, 10);
  const mes = parseInt(mesInput.value, 10);
  const descripcion = descripcionInput.value.trim();
  const anio = anioInput.value.trim() ? parseInt(anioInput.value, 10) : null;

  if (!descripcion) { mostrarErrorCampo(descripcionInput, 'Ingresa una descripción'); return; }
  if (anioInput.value.trim() && (isNaN(anio) || anio < 2020)) { mostrarErrorCampo(anioInput, 'Año inválido'); return; }

  const lista = LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales || (LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales = []);
  const duplicada = lista.some(f => f.dia === dia && f.mes === mes && f.anio === anio);
  if (duplicada) { mostrarToast('Esa fecha ya está registrada como Feriado Oficial.'); return; }
  const esEspecial = LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.some(f => f.dia === dia && f.mes === mes);
  if (esEspecial) { mostrarToast('Esa fecha ya está registrada como Feriado Especial: ese prevalece, no se puede duplicar como Oficial.'); return; }

  const nuevoId = (Math.max(0, ...lista.map(f => f.id)) || 0) + 1;
  lista.push({ id: nuevoId, dia, mes, descripcion, anio });
  guardarLimitesGastos();

  diaInput.value = '1';
  mesInput.value = '1';
  descripcionInput.value = '';
  anioInput.value = '';
  renderTablaFeriados();
}

function quitarFeriado(id) {
  LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales = LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales.filter(f => f.id !== id);
  guardarLimitesGastos();
  renderTablaFeriados();
}

function renderTablaFeriadosEspeciales() {
  const tbody = document.getElementById('tbodyFeriadosEspeciales');
  const fechas = LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales;
  tbody.innerHTML = fechas.length
    ? fechas.map(f => `
      <tr>
        <td>${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')} <span class="dia-especial-nota">(todos los años)</span></td>
        <td>US$ ${Number(f.montoUSD).toFixed(2)}</td>
        <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarFeriadoEspecial(${f.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button></td>
      </tr>`).join('')
    : `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron Feriados Especiales.</td></tr>`;
}

function agregarFeriadoEspecial() {
  const diaInput = document.getElementById('nuevoFeriadoEspecialDia');
  const mesInput = document.getElementById('nuevoFeriadoEspecialMes');
  const montoInput = document.getElementById('nuevoFeriadoEspecialMonto');
  const dia = parseInt(diaInput.value, 10);
  const mes = parseInt(mesInput.value, 10);
  const montoUSD = parseFloat(montoInput.value);

  if (isNaN(montoUSD) || montoUSD <= 0) { mostrarErrorCampo(montoInput, 'Ingresa un monto en dólares válido, mayor a cero'); return; }

  const duplicada = LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.some(f => f.dia === dia && f.mes === mes);
  if (duplicada) { mostrarToast('Esa fecha ya está registrada como Feriado Especial.'); return; }

  const nuevoId = (Math.max(0, ...LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.map(f => f.id)) || 0) + 1;
  LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.push({ id: nuevoId, dia, mes, montoUSD });
  guardarLimitesGastos();

  diaInput.value = '1';
  mesInput.value = '1';
  montoInput.value = '';
  renderTablaFeriadosEspeciales();
  renderAlertaTipoCambioHoy();
  actualizarAlertaFeriadoEspecial();
}

function quitarFeriadoEspecial(id) {
  LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales = LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.filter(f => f.id !== id);
  guardarLimitesGastos();
  renderTablaFeriadosEspeciales();
  renderAlertaTipoCambioHoy();
  actualizarAlertaFeriadoEspecial();
}

function renderTablaTiposCambioFeriados() {
  const tbody = document.getElementById('tbodyTiposCambioFeriados');
  const lista = TIPOS_CAMBIO_FERIADOS_DEMO;
  tbody.innerHTML = lista.length
    ? lista.map(t => `
      <tr>
        <td>${t.fecha}</td>
        <td>US$ ${Number(t.montoUSD).toFixed(2)}</td>
        <td>${Number(t.tipoCambio).toFixed(3)}</td>
        <td>S/ ${Number(t.montoSoles).toFixed(2)}</td>
        <td>${nombreColaboradorGastos(t.agregadoPor)}</td>
      </tr>`).join('')
    : `<tr><td colspan="5" class="submodulo-tabla-vacio">Todavía no se registró ningún tipo de cambio.</td></tr>`;
}

// Solo se muestra el día exacto de un Feriado Especial sin tipo de cambio
// registrado todavía, y solo si quien tiene la sesión abierta puede
// registrarlo (ver usuarioPuedeRegistrarTipoCambio en data-gastos.js) — para
// cualquier otro caso (no es Feriado Especial hoy, ya se registró, o no
// tiene permiso) la banda queda oculta.
function renderAlertaTipoCambioHoy() {
  const caja = document.getElementById('alertaTipoCambioHoy');
  if (!caja) return;
  const sesion = obtenerUsuarioActual();
  const puede = sesion && usuarioPuedeRegistrarTipoCambio(sesion.usuario);
  const feriado = obtenerFeriadoEspecialDeHoy();
  const mostrar = feriado && !obtenerTipoCambioDeHoy() && puede;
  caja.style.display = mostrar ? '' : 'none';
  if (mostrar) {
    document.getElementById('nuevoTipoCambioHoy').value = '';
    document.getElementById('alertaTipoCambioMontoUSD').textContent = `US$ ${Number(feriado.montoUSD).toFixed(2)}`;
  }
}

function guardarTipoCambioHoy() {
  const input = document.getElementById('nuevoTipoCambioHoy');
  const valor = parseFloat(input.value);
  if (isNaN(valor) || valor <= 0) { mostrarErrorCampo(input, 'Ingresa un tipo de cambio válido, mayor a cero'); return; }

  const sesion = obtenerUsuarioActual();
  const resultado = registrarTipoCambioFeriadoEspecial(valor, sesion.usuario);
  if (!resultado.ok) { mostrarToast(resultado.motivo); return; }

  renderAlertaTipoCambioHoy();
  renderTablaTiposCambioFeriados();
  mostrarToast('Tipo de cambio registrado correctamente.');
}

// Monto Máximo por Día de Alimentos ya no se edita a mano: se recalcula
// solo como Desayuno + Almuerzo + Cena (el campo queda bloqueado en el
// HTML) — se llama al abrir el modal y en cada oninput de los 3 montos.
function recalcularLimAlimentosMaximoDia() {
  const desayuno = parseFloat(document.getElementById('limAlimentosDesayuno').value) || 0;
  const almuerzo = parseFloat(document.getElementById('limAlimentosAlmuerzo').value) || 0;
  const cena = parseFloat(document.getElementById('limAlimentosCena').value) || 0;
  document.getElementById('limAlimentosMaximoDia').value = (desayuno + almuerzo + cena).toFixed(2);
}

function abrirModalConfiguracionLimites() {
  const cfg = LIMITES_GASTOS_DEMO;
  const u = obtenerUsuarioPorNombre(cfg.modificadoPor);
  document.getElementById('limitesModificadoPor').textContent = u ? `${u.nombre} ${u.apellido}` : cfg.modificadoPor;
  document.getElementById('limitesFechaModificacion').textContent = cfg.fechaModificacion;

  document.getElementById('limAlimentosDesayuno').value = cfg.alimentos.desayuno;
  document.getElementById('limAlimentosDesayunoAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorDesayuno).toFixed(2)}`;
  document.getElementById('limAlimentosAlmuerzo').value = cfg.alimentos.almuerzo;
  document.getElementById('limAlimentosAlmuerzoAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorAlmuerzo).toFixed(2)}`;
  document.getElementById('limAlimentosCena').value = cfg.alimentos.cena;
  document.getElementById('limAlimentosCenaAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorCena).toFixed(2)}`;
  recalcularLimAlimentosMaximoDia();

  document.getElementById('limMovilidadMaximoDia').value = cfg.movilidad.montoMaximoDia;
  document.getElementById('limMovilidadMaximoDiaAnterior').textContent = `S/ ${Number(cfg.movilidad.montoAnteriorDia).toFixed(2)}`;
  document.getElementById('limMovilidadMaximoViaje').value = cfg.movilidad.montoMaximoViaje;
  document.getElementById('limMovilidadMaximoViajeAnterior').textContent = `S/ ${Number(cfg.movilidad.montoAnteriorViaje).toFixed(2)}`;

  document.getElementById('limDiasBordoNormal').value = cfg.diasABordo.diaNormal;
  document.getElementById('limDiasBordoNormalAnterior').textContent = `S/ ${Number(cfg.diasABordo.montoAnteriorDiaNormal).toFixed(2)}`;
  document.getElementById('limDiasBordoDomingo').value = cfg.diasABordo.domingo;
  document.getElementById('limDiasBordoDomingoAnterior').textContent = `S/ ${Number(cfg.diasABordo.montoAnteriorDomingo).toFixed(2)}`;
  document.getElementById('limDiasBordoFeriadoOficial').value = cfg.diasABordo.feriadoOficial;
  document.getElementById('limDiasBordoFeriadoOficialAnterior').textContent = `S/ ${Number(cfg.diasABordo.montoAnteriorFeriadoOficial).toFixed(2)}`;

  // Jornada (PROMPT_GASTOS_JORNADA_SPRINT4 §1/§3/§5) — vive en
  // CONFIG_JORNADA_DEMO (data-movil.js), no en LIMITES_GASTOS_DEMO: son
  // parámetros de la Jornada, no tarifas de Gastos, pero se editan desde
  // el mismo modal de Configuración por pedido del cliente.
  if (typeof CONFIG_JORNADA_DEMO === 'object') {
    document.getElementById('limJornadaCorteDesayuno').value = CONFIG_JORNADA_DEMO.horaLimiteInicioDesayuno;
    document.getElementById('limJornadaCorteAlmuerzo').value = CONFIG_JORNADA_DEMO.horaLimiteInicioAlmuerzo;
    document.getElementById('limJornadaPlazoOlvido').value = CONFIG_JORNADA_DEMO.plazoOlvidoHoras;
    document.getElementById('limJornadaHorasMinDiasBordo').value = CONFIG_JORNADA_DEMO.horasMinimasDiaABordo;
    document.getElementById('limJornadaUmbralDesvio').value = CONFIG_JORNADA_DEMO.umbralDesvioMin;
    document.getElementById('limJornadaRecordatorioActivo').checked = CONFIG_JORNADA_DEMO.recordatorioOlvidosActivo;
    document.getElementById('limJornadaHoraRecordatorio').value = CONFIG_JORNADA_DEMO.horaRecordatorioOlvidos;
    const modU = CONFIG_JORNADA_DEMO.modificadoPor ? obtenerUsuarioPorNombre(CONFIG_JORNADA_DEMO.modificadoPor) : null;
    document.getElementById('limJornadaRecordatorioModificado').textContent = CONFIG_JORNADA_DEMO.fechaModificacion
      ? `Último cambio por ${modU ? modU.nombre + ' ' + modU.apellido : CONFIG_JORNADA_DEMO.modificadoPor} el ${CONFIG_JORNADA_DEMO.fechaModificacion}`
      : '';
  }

  poblarSelectsFeriado();
  renderTablaFeriados();
  poblarSelectsFeriadoEspecial();
  renderTablaFeriadosEspeciales();
  renderAlertaTipoCambioHoy();
  renderTablaTiposCambioFeriados();

  cambiarTabLimites('alimentos');
  abrirModal('modalConfiguracionLimites');
}

function guardarConfiguracionLimites() {
  // Monto Máximo por Día de Alimentos queda fuera de esta validación: ya no
  // se edita a mano, se deriva de Desayuno+Almuerzo+Cena (ver
  // recalcularLimAlimentosMaximoDia) — validar esos 3 ya lo cubre.
  const campos = [
    document.getElementById('limAlimentosDesayuno'), document.getElementById('limAlimentosAlmuerzo'),
    document.getElementById('limAlimentosCena'),
    document.getElementById('limMovilidadMaximoDia'), document.getElementById('limMovilidadMaximoViaje'),
    document.getElementById('limDiasBordoNormal'), document.getElementById('limDiasBordoDomingo'),
    document.getElementById('limDiasBordoFeriadoOficial')
  ];

  for (const campo of campos) {
    const valor = parseFloat(campo.value);
    if (isNaN(valor) || valor <= 0) {
      mostrarErrorCampo(campo, 'Debe ser mayor a cero');
      campo.focus();
      return;
    }
  }

  const cfg = LIMITES_GASTOS_DEMO;
  cfg.alimentos.montoAnteriorDesayuno = cfg.alimentos.desayuno;
  cfg.alimentos.montoAnteriorAlmuerzo = cfg.alimentos.almuerzo;
  cfg.alimentos.montoAnteriorCena = cfg.alimentos.cena;
  cfg.alimentos.desayuno = parseFloat(document.getElementById('limAlimentosDesayuno').value);
  cfg.alimentos.almuerzo = parseFloat(document.getElementById('limAlimentosAlmuerzo').value);
  cfg.alimentos.cena = parseFloat(document.getElementById('limAlimentosCena').value);
  cfg.alimentos.montoMaximoDia = cfg.alimentos.desayuno + cfg.alimentos.almuerzo + cfg.alimentos.cena;

  cfg.movilidad.montoAnteriorDia = cfg.movilidad.montoMaximoDia;
  cfg.movilidad.montoAnteriorViaje = cfg.movilidad.montoMaximoViaje;
  cfg.movilidad.montoMaximoDia = parseFloat(document.getElementById('limMovilidadMaximoDia').value);
  cfg.movilidad.montoMaximoViaje = parseFloat(document.getElementById('limMovilidadMaximoViaje').value);

  cfg.diasABordo.montoAnteriorDiaNormal = cfg.diasABordo.diaNormal;
  cfg.diasABordo.montoAnteriorDomingo = cfg.diasABordo.domingo;
  cfg.diasABordo.montoAnteriorFeriadoOficial = cfg.diasABordo.feriadoOficial;
  cfg.diasABordo.diaNormal = parseFloat(document.getElementById('limDiasBordoNormal').value);
  cfg.diasABordo.domingo = parseFloat(document.getElementById('limDiasBordoDomingo').value);
  cfg.diasABordo.feriadoOficial = parseFloat(document.getElementById('limDiasBordoFeriadoOficial').value);

  // Jornada: validación propia (hora/horas/minutos, no "mayor a cero" como
  // los montos de arriba) antes de guardar en CONFIG_JORNADA_DEMO.
  if (typeof CONFIG_JORNADA_DEMO === 'object') {
    const corteDesayunoInput = document.getElementById('limJornadaCorteDesayuno');
    const corteAlmuerzoInput = document.getElementById('limJornadaCorteAlmuerzo');
    const plazoOlvidoInput = document.getElementById('limJornadaPlazoOlvido');
    const horasMinInput = document.getElementById('limJornadaHorasMinDiasBordo');
    const umbralDesvioInput = document.getElementById('limJornadaUmbralDesvio');
    const recordatorioActivoInput = document.getElementById('limJornadaRecordatorioActivo');
    const horaRecordatorioInput = document.getElementById('limJornadaHoraRecordatorio');

    if (!corteDesayunoInput.value) { mostrarErrorCampo(corteDesayunoInput, 'Campo obligatorio'); corteDesayunoInput.focus(); return; }
    if (!corteAlmuerzoInput.value) { mostrarErrorCampo(corteAlmuerzoInput, 'Campo obligatorio'); corteAlmuerzoInput.focus(); return; }
    if (!horaRecordatorioInput.value) { mostrarErrorCampo(horaRecordatorioInput, 'Campo obligatorio'); horaRecordatorioInput.focus(); return; }
    const camposJornadaNumericos = [plazoOlvidoInput, horasMinInput, umbralDesvioInput];
    for (const campo of camposJornadaNumericos) {
      const valor = parseFloat(campo.value);
      if (isNaN(valor) || valor < 0) { mostrarErrorCampo(campo, 'Debe ser un número válido'); campo.focus(); return; }
    }

    const huboCambioRecordatorio = CONFIG_JORNADA_DEMO.recordatorioOlvidosActivo !== recordatorioActivoInput.checked
      || CONFIG_JORNADA_DEMO.horaRecordatorioOlvidos !== horaRecordatorioInput.value;

    CONFIG_JORNADA_DEMO.horaLimiteInicioDesayuno = corteDesayunoInput.value;
    CONFIG_JORNADA_DEMO.horaLimiteInicioAlmuerzo = corteAlmuerzoInput.value;
    CONFIG_JORNADA_DEMO.plazoOlvidoHoras = parseFloat(plazoOlvidoInput.value);
    CONFIG_JORNADA_DEMO.horasMinimasDiaABordo = parseFloat(horasMinInput.value);
    CONFIG_JORNADA_DEMO.umbralDesvioMin = parseFloat(umbralDesvioInput.value);
    CONFIG_JORNADA_DEMO.recordatorioOlvidosActivo = recordatorioActivoInput.checked;
    CONFIG_JORNADA_DEMO.horaRecordatorioOlvidos = horaRecordatorioInput.value;
    if (huboCambioRecordatorio) {
      const sesionCfg = obtenerUsuarioActual();
      CONFIG_JORNADA_DEMO.modificadoPor = sesionCfg ? sesionCfg.usuario : CONFIG_JORNADA_DEMO.modificadoPor;
      CONFIG_JORNADA_DEMO.fechaModificacion = fechaHoraActualGastos();
    }
    guardarConfigJornada();
  }

  const sesion = obtenerUsuarioActual();
  cfg.modificadoPor = sesion ? sesion.usuario : cfg.modificadoPor;
  cfg.fechaModificacion = fechaHoraActualGastos();
  guardarLimitesGastos();

  cerrarModal('modalConfiguracionLimites');
  mostrarToast('La configuración de límites fue guardada correctamente.');
}

// Cierra el desplegable Excel/PDF del Resumen Total si se hace clic afuera
// (mismo patrón que ya usa Reporte de Precintos para su propio dropdown).
document.addEventListener('click', e => {
  if (!e.target.closest('#modalResumenTotal .btn-download-wrap')) {
    const dd = document.getElementById('downloadDropdownResumenTotal');
    if (dd) dd.classList.remove('open');
  }
});
