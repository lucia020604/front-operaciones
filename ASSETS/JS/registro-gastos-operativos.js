// =================================================
// REGISTRO-GASTOS-OPERATIVOS.JS
// Precintos > Registro de Gastos Operativos: grilla principal + filtros,
// y el modal de "Configuración de Límites para Gastos".
// La lógica de los 3 modales de Detalle (Alimentos/Movilidad/Días a Bordo)
// vive en detalle-gastos.js.
// =================================================

let rangoDiasSeleccionados = [];   // días marcados en "Agregar rango" (Días a Bordo, aún sin guardar)

document.addEventListener('DOMContentLoaded', () => {
  poblarSelectsMesAnioGastos();
  poblarSelectAreaGastos();
  renderTablaGastosOperativos();

  // Deep link desde la notificación de la campana (ver notificarOperadorRevisionGasto
  // en detalle-gastos.js): abre directo el Detalle del reporte avisado.
  const params = new URLSearchParams(window.location.search);
  const gastoId = params.get('gastoId');
  if (gastoId && typeof abrirDetalleGasto === 'function') abrirDetalleGasto(gastoId);
});

// Mes/Año son el filtro principal (no van en Filtros avanzados): cada
// reporte de Gastos es siempre un mes calendario completo (ver
// asegurarReporteGasto en data-gastos.js), así que navegar por mes/año es
// más natural acá que un rango de fechas libre.
function poblarSelectsMesAnioGastos() {
  const selectMes = document.getElementById('filterMesGastos');
  const selectAnio = document.getElementById('filterAnioGastos');
  if (!selectMes || !selectAnio) return;

  selectMes.innerHTML = '<option value="">Todos</option>' +
    MESES_GASTOS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');

  const anios = [...new Set(GASTOS_OPERATIVOS_DEMO.map(g => Number(g.fechaDesde.split('/')[2])))];
  const anioActual = new Date().getFullYear();
  if (!anios.includes(anioActual)) anios.push(anioActual);
  anios.sort((a, b) => b - a);
  selectAnio.innerHTML = '<option value="">Todos</option>' + anios.map(a => `<option value="${a}">${a}</option>`).join('');
}

// Área (Filtros avanzados) — lista las que de verdad aparecen en los datos,
// para no mostrar opciones que hoy no tienen ningún operador.
function poblarSelectAreaGastos() {
  const select = document.getElementById('filterAreaGastos');
  if (!select) return;
  const areas = [...new Set(GASTOS_OPERATIVOS_DEMO.map(g => g.area))].sort();
  select.innerHTML = '<option value="">Todas</option>' + areas.map(a => `<option value="${a}">${a}</option>`).join('');
}

/* =================================================
   GRILLA PRINCIPAL — una fila por operador + período (agrupa sus reportes
   de Alimentos/Movilidad/Días a Bordo), expandible para ver el detalle de
   cada tipo. Mismo patrón que la fila expandible de Reporte de Precintos.
================================================= */
const BADGE_POR_ESTADO_GASTO = { pendiente: 'badge-gris', revisadoSupervisor: 'badge-por-vencer', revisado: 'badge-vigente' };
const ETIQUETA_POR_ESTADO_GASTO = { pendiente: 'Pendiente', revisadoSupervisor: 'Revisado por Supervisor', revisado: 'Revisado' };

let filasGastosExpandidas = new Set(); // claves de grupo (operador+período) expandidas

// Estado del grupo en una sola fracción ("3/3 Revisados" en verde cuando los
// 3 tipos ya cerraron el período, "X/3 Revisados" en ámbar mientras siga
// habiendo alguno pendiente) — mismo patrón que la columna "Precintos" de
// Reporte de Precintos (reportados/asignados). El tooltip abre el detalle de
// los 3 sin tener que expandir la fila. Un período en 3/3 queda cerrado: no
// se le sigue agregando nada y el próximo mes abre como grupo aparte (ver
// asegurarReporteGasto en data-gastos.js, que ya solo crea reportes nuevos
// para el mes en curso).
function celdaEstadoGrupoGasto(grupo) {
  const total = grupo.reportes.length;
  const revisados = grupo.reportes.filter(r => r.estado === 'revisado').length;
  const clase = revisados === total ? 'badge-vigente' : 'badge-por-vencer';
  const tooltip = grupo.reportes.map(r => `${r.tipo}: ${ETIQUETA_POR_ESTADO_GASTO[r.estado]}`).join(' · ');
  return `<span class="badge ${clase}" title="${tooltip}"><span class="badge-dot"></span>${revisados}/${total} Revisados</span>`;
}

// "periodoCodigo" (ver data-gastos.js) identifica de forma única a un
// operador+período y lo comparten sus 3 tipos — se usa tal cual como clave
// del grupo, en vez de una concatenación de nombre+apellido+fechas.
function agruparGastosPorPeriodo() {
  const grupos = new Map();
  GASTOS_OPERATIVOS_DEMO.forEach(g => {
    const clave = g.periodoCodigo;
    if (!grupos.has(clave)) {
      grupos.set(clave, { clave, periodoCodigo: g.periodoCodigo, nombre: g.nombre, apellido: g.apellido, area: g.area, fechaDesde: g.fechaDesde, fechaHasta: g.fechaHasta, reportes: [] });
    }
    grupos.get(clave).reportes.push(g);
  });
  return [...grupos.values()];
}

// Un reporte cae en el mes/año elegido si su fechaDesde (siempre el día 01
// del período, ver asegurarReporteGasto) coincide — más simple y correcto
// que comparar rangos, porque el período completo es ese mes calendario.
function gastoCoincideMesAnio(fechaDesde, mes, anio) {
  const [, m, y] = fechaDesde.split('/');
  if (mes && Number(m) !== Number(mes)) return false;
  if (anio && Number(y) !== Number(anio)) return false;
  return true;
}

function gruposGastosFiltrados() {
  const texto = document.getElementById('searchGastos').value.trim().toLowerCase();
  const mes = document.getElementById('filterMesGastos').value;
  const anio = document.getElementById('filterAnioGastos').value;
  const tipo = document.getElementById('filterTipoGastos').value;
  const estado = document.getElementById('filterEstadoGastos').value;
  const periodo = document.getElementById('filterPeriodoGastos').value;
  const area = document.getElementById('filterAreaGastos').value;
  const montoMin = parseFloat(document.getElementById('filterMontoMinGastos').value);
  const montoMax = parseFloat(document.getElementById('filterMontoMaxGastos').value);

  return agruparGastosPorPeriodo().filter(grupo => {
    if (texto && !`${grupo.nombre} ${grupo.apellido}`.toLowerCase().includes(texto)) return false;
    if (!gastoCoincideMesAnio(grupo.fechaDesde, mes, anio)) return false;
    if (tipo && !grupo.reportes.some(r => r.tipo === tipo)) return false;
    if (estado && !grupo.reportes.some(r => r.estado === estado)) return false;
    if (area && grupo.area !== area) return false;
    if (periodo) {
      const cerrado = grupo.reportes.every(r => r.estado === 'revisado');
      if (periodo === 'cerrado' && !cerrado) return false;
      if (periodo === 'vigente' && cerrado) return false;
    }
    if (!isNaN(montoMin) || !isNaN(montoMax)) {
      const montoGrupo = grupo.reportes.reduce((acc, r) => acc + resumenReporteGasto(r).total, 0);
      if (!isNaN(montoMin) && montoGrupo < montoMin) return false;
      if (!isNaN(montoMax) && montoGrupo > montoMax) return false;
    }
    return true;
  });
}

// filasGastosFiltradas (plano, un elemento por reporte) sigue siendo la base
// de la exportación (obtenerFilasExportGastos) — una fila por tipo tiene más
// sentido en una planilla que agrupada. "Estado del Período" y "Monto Total"
// no aplican acá (son propiedades del grupo, no de un reporte puntual).
function filasGastosFiltradas() {
  const texto = document.getElementById('searchGastos').value.trim().toLowerCase();
  const mes = document.getElementById('filterMesGastos').value;
  const anio = document.getElementById('filterAnioGastos').value;
  const tipo = document.getElementById('filterTipoGastos').value;
  const estado = document.getElementById('filterEstadoGastos').value;
  const area = document.getElementById('filterAreaGastos').value;

  return GASTOS_OPERATIVOS_DEMO.filter(g => {
    if (texto && !`${g.nombre} ${g.apellido}`.toLowerCase().includes(texto)) return false;
    if (tipo && g.tipo !== tipo) return false;
    if (estado && g.estado !== estado) return false;
    if (area && g.area !== area) return false;
    if (!gastoCoincideMesAnio(g.fechaDesde, mes, anio)) return false;
    return true;
  });
}

// Resumen de un reporte puntual (uno de los 3 tipos de un grupo) para la
// fila de detalle expandible: N° de reporte, cuántos gastos cargó el
// operario y el monto total — así la grilla principal ya da una idea del
// contenido sin tener que abrir cada modal.
function resumenReporteGasto(r) {
  const detalle = obtenerDetalleGastoPorTipo(r.tipo, r.id);
  if (!detalle) return { numero: '—', cantidad: 0, total: 0 };
  const cfg = CONFIG_TIPO_GASTO[r.tipo];
  const total = detalle.grilla.reduce((acc, fila) => acc + (Number(fila[cfg.campoMonto]) || 0), 0);
  return { numero: detalle.numero, cantidad: detalle.grilla.length, total };
}

// Resumen impreso de los 3 reportes de un operador — solo disponible una vez
// que los 3 están Revisados (mismo criterio que descargarReporteGasto en
// detalle-gastos.js para cada reporte individual).
function descargarResumenOperadorGastos(clave) {
  const grupo = agruparGastosPorPeriodo().find(g => g.clave === clave);
  if (!grupo) return;

  const total = grupo.reportes.length;
  const revisados = grupo.reportes.filter(r => r.estado === 'revisado').length;
  if (revisados !== total) {
    mostrarToast('Los 3 reportes deben estar Revisados para poder descargar el resumen.');
    return;
  }

  const filasHTML = grupo.reportes.map(r => {
    const resumen = resumenReporteGasto(r);
    return `<tr><td>${r.tipo}</td><td>${resumen.numero}</td><td>${resumen.cantidad}</td><td>S/ ${resumen.total.toFixed(2)}</td></tr>`;
  }).join('');
  const totalGeneral = grupo.reportes.reduce((acc, r) => acc + resumenReporteGasto(r).total, 0);

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Resumen de Gastos — ${grupo.nombre} ${grupo.apellido}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 4px; }
      p    { font-size: 11px; color: #555; margin: 0 0 14px; }
      .membrete { font-size: 10px; color: #777; margin-bottom: 10px; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 7px 10px; text-align: left;
             font-size: 9px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 7px 10px; border-bottom: 1px solid #eee; }
      tfoot td { font-weight: 700; border-bottom: none; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <p class="membrete">${EMPRESA_GASTOS.razonSocial} — RUC ${EMPRESA_GASTOS.ruc}</p>
    <h2>Resumen de Gastos — ${grupo.nombre} ${grupo.apellido}</h2>
    <p>${grupo.area} · ${grupo.fechaDesde} al ${grupo.fechaHasta}</p>
    <table>
      <thead><tr><th>Tipo</th><th>Código</th><th>Registros</th><th>Monto Total</th></tr></thead>
      <tbody>${filasHTML}</tbody>
      <tfoot><tr><td colspan="3">Total general</td><td>S/ ${totalGeneral.toFixed(2)}</td></tr></tfoot>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function renderTablaGastosOperativos() {
  const tipo = document.getElementById('filterTipoGastos').value;
  const estado = document.getElementById('filterEstadoGastos').value;
  const grupos = gruposGastosFiltrados();
  const tbody = document.getElementById('tbodyGastosOperativos');

  if (!grupos.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="submodulo-tabla-vacio">No se encontraron registros de gastos operativos.</td></tr>`;
    actualizarBotonExpandirTodosGastos([]);
    return;
  }

  tbody.innerHTML = grupos.map((grupo) => {
    // Si el filtro Tipo y/o Estado hizo match con un reporte puntual del
    // grupo (no con todos), esa fila se expande sola para mostrar cuál fue.
    if ((tipo || estado) && grupo.reportes.some(r => (!tipo || r.tipo === tipo) && (!estado || r.estado === estado))) {
      filasGastosExpandidas.add(grupo.clave);
    }
    const expandido = filasGastosExpandidas.has(grupo.clave);

    const botonExpandir = `<button type="button" class="btn-expandir-fila${expandido ? ' expandido' : ''}" title="${expandido ? 'Contraer' : 'Expandir'} reportes" onclick="toggleFilaGrupoGastos('${grupo.clave}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>`;

    const filaDetalle = `
    <tr class="fila-detalle-precintos" style="display:${expandido ? '' : 'none'}">
      <td colspan="9">
        <div class="precintos-anidados-marco">
          <table class="tabla-precintos-anidada">
            <thead><tr><th style="width:130px;">Tipo</th><th style="width:140px;">Código</th><th style="width:90px;">Registros</th><th style="width:120px;">Monto Total</th><th style="width:180px;">Estado</th><th style="width:90px;">Opciones</th></tr></thead>
            <tbody>
              ${grupo.reportes.map(r => {
                const resaltado = (tipo || estado) && (!tipo || r.tipo === tipo) && (!estado || r.estado === estado)
                  ? ' class="precinto-resaltado"' : '';
                const resumen = resumenReporteGasto(r);
                const cerrado = r.estado === 'revisado';
                return `<tr${resaltado}>
                  <td>${r.tipo}</td>
                  <td>${resumen.numero}</td>
                  <td>${resumen.cantidad}</td>
                  <td>S/ ${resumen.total.toFixed(2)}</td>
                  <td><span class="badge ${BADGE_POR_ESTADO_GASTO[r.estado]}"><span class="badge-dot"></span>${ETIQUETA_POR_ESTADO_GASTO[r.estado]}</span></td>
                  <td class="opciones">
                    <button class="btn-accion btn-editar" title="Editar" onclick="abrirDetalleGasto(${r.id})">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
                    </button>
                    <button class="btn-accion btn-descargar-gasto" title="${cerrado ? 'Descargar' : 'Disponible una vez que el reporte esté Revisado'}" ${cerrado ? `onclick="descargarReporteGasto('${r.tipo}', ${r.id})"` : 'disabled'}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </td>
    </tr>`;

    const total = grupo.reportes.length;
    const revisados = grupo.reportes.filter(r => r.estado === 'revisado').length;
    const grupoCerrado = revisados === total;

    return `
    <tr>
      <td class="celda-expandir">${botonExpandir}</td>
      <td class="codigo-col">${grupo.periodoCodigo}</td>
      <td>${grupo.nombre}</td>
      <td>${grupo.apellido}</td>
      <td>${grupo.area}</td>
      <td>${grupo.fechaDesde}</td>
      <td>${grupo.fechaHasta}</td>
      <td>${celdaEstadoGrupoGasto(grupo)}</td>
      <td class="opciones">
        <button class="btn-accion btn-descargar-gasto" title="${grupoCerrado ? 'Descargar resumen' : 'Disponible cuando los 3 reportes estén Revisados'}" ${grupoCerrado ? `onclick="descargarResumenOperadorGastos('${grupo.clave}')"` : 'disabled'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </td>
    </tr>${filaDetalle}`;
  }).join('');

  actualizarBotonExpandirTodosGastos(grupos);
}

function toggleFilaGrupoGastos(clave) {
  if (filasGastosExpandidas.has(clave)) filasGastosExpandidas.delete(clave);
  else filasGastosExpandidas.add(clave);
  renderTablaGastosOperativos();
}

function actualizarBotonExpandirTodosGastos(grupos) {
  const btn = document.getElementById('btnExpandirTodosGastos');
  const label = document.getElementById('btnExpandirTodosGastosLabel');
  if (!btn || !label) return;
  const todosExpandidos = grupos.length > 0 && grupos.every(g => filasGastosExpandidas.has(g.clave));
  label.textContent = todosExpandidos ? 'Contraer todos' : 'Expandir todos';
  btn.disabled = grupos.length === 0;
  btn.style.opacity = grupos.length === 0 ? '.5' : '1';
}

function toggleExpandirTodasFilasGastos() {
  const grupos = gruposGastosFiltrados();
  const todosExpandidos = grupos.length > 0 && grupos.every(g => filasGastosExpandidas.has(g.clave));
  grupos.forEach(g => todosExpandidos ? filasGastosExpandidas.delete(g.clave) : filasGastosExpandidas.add(g.clave));
  renderTablaGastosOperativos();
}

function filtrarGastosOperativos() {
  renderTablaGastosOperativos();
  gastosActualizarBotonFiltrosAvanzados();
}

function limpiarFiltrosGastos() {
  document.getElementById('searchGastos').value = '';
  document.getElementById('filterMesGastos').value = '';
  document.getElementById('filterAnioGastos').value = '';
  gastosLimpiarCamposFiltrosAvanzados();
  filtrarGastosOperativos();
}

/* =================================================
   FILTROS AVANZADOS — mismo patrón que Reporte de Precintos / Seguimiento
   de Operaciones: modal lateral + badge con la cantidad de filtros activos.
================================================= */
const GASTOS_IDS_FILTROS_AVANZADOS = [
  'filterPeriodoGastos', 'filterAreaGastos', 'filterTipoGastos', 'filterEstadoGastos',
  'filterMontoMinGastos', 'filterMontoMaxGastos'
];

function gastosLimpiarCamposFiltrosAvanzados() {
  GASTOS_IDS_FILTROS_AVANZADOS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function gastosContarFiltrosAvanzadosActivos() {
  return GASTOS_IDS_FILTROS_AVANZADOS.reduce((acc, id) => acc + (document.getElementById(id)?.value ? 1 : 0), 0);
}

function gastosActualizarBotonFiltrosAvanzados() {
  const btn = document.getElementById('btnFiltrosAvanzadosGastos');
  const badge = document.getElementById('filtrosAvanzadosGastosBadge');
  if (!btn || !badge) return;
  const activos = gastosContarFiltrosAvanzadosActivos();
  btn.classList.toggle('activo', activos > 0);
  badge.style.display = activos > 0 ? '' : 'none';
  badge.textContent = activos;
}

function abrirModalFiltrosAvanzadosGastos() {
  abrirModal('modalFiltrosAvanzadosGastos');
}

function aplicarFiltrosAvanzadosModalGastos() {
  cerrarModal('modalFiltrosAvanzadosGastos');
  filtrarGastosOperativos();
}

function limpiarFiltrosAvanzadosModalGastos() {
  gastosLimpiarCamposFiltrosAvanzados();
  cerrarModal('modalFiltrosAvanzadosGastos');
  filtrarGastosOperativos();
}

/* =================================================
   DESCARGA: Excel (CSV) y PDF — mismo patrón que Control/Reporte de
   Precintos, exportando las filas ya filtradas de la grilla.
================================================= */
function toggleDownloadDropdownGastos() {
  document.getElementById('downloadDropdownGastos').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.btn-download-wrap')) {
    const dd = document.getElementById('downloadDropdownGastos');
    if (dd) dd.classList.remove('open');
  }
});

function obtenerFilasExportGastos() {
  return filasGastosFiltradas().map((g, i) => ({
    n: i + 1,
    nombre: g.nombre,
    apellido: g.apellido,
    area: g.area,
    fechaDesde: g.fechaDesde,
    fechaHasta: g.fechaHasta,
    tipo: g.tipo,
    estado: ETIQUETA_POR_ESTADO_GASTO[g.estado]
  }));
}

function exportarGastosExcel() {
  const filas = obtenerFilasExportGastos();
  const headers = ['N°', 'Nombre', 'Apellido', 'Área', 'Fecha Desde', 'Fecha Hasta', 'Tipo', 'Estado'];

  const csv = [headers, ...filas.map(f => [f.n, f.nombre, f.apellido, f.area, f.fechaDesde, f.fechaHasta, f.tipo, f.estado])]
    .map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom  = '﻿'; // BOM para que Excel abra UTF-8 correctamente
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'registro-gastos-operativos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  document.getElementById('downloadDropdownGastos').classList.remove('open');
  mostrarToast('Exportación Excel descargada correctamente.');
}

function exportarGastosPDF() {
  const filas = obtenerFilasExportGastos();
  const filasHTML = filas.map(f => `
    <tr>
      <td>${f.n}</td>
      <td>${f.nombre}</td>
      <td>${f.apellido}</td>
      <td>${f.area}</td>
      <td>${f.fechaDesde}</td>
      <td>${f.fechaHasta}</td>
      <td>${f.tipo}</td>
      <td>${f.estado}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Registro de Gastos Operativos</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 12px; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 7px 10px; text-align: left;
             font-size: 9px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 7px 10px; border-bottom: 1px solid #eee; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <h2>Registro de Gastos Operativos</h2>
    <table>
      <thead>
        <tr><th>N°</th><th>Nombre</th><th>Apellido</th><th>Área</th><th>Fecha Desde</th><th>Fecha Hasta</th><th>Tipo</th><th>Estado</th></tr>
      </thead>
      <tbody>${filasHTML}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();

  document.getElementById('downloadDropdownGastos').classList.remove('open');
}

/* =================================================
   MODAL: CONFIGURACIÓN DE LÍMITES PARA GASTOS
================================================= */
function cambiarTabLimites(tab) {
  document.querySelectorAll('.limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.tab === tab));
  document.getElementById('limitesPanelAlimentos').classList.toggle('activo', tab === 'alimentos');
  document.getElementById('limitesPanelMovilidad').classList.toggle('activo', tab === 'movilidad');
  document.getElementById('limitesPanelDiasABordo').classList.toggle('activo', tab === 'diasABordo');
}

function renderChipsDiasSemana() {
  const cont = document.getElementById('diasSemanaChipsNuevoRango');
  // Un día que ya pertenece a otro rango no se puede volver a seleccionar
  // (antes solo se avisaba recién al intentar guardar, ver agregarRangoDiasABordo).
  const diasYaUsados = LIMITES_GASTOS_DEMO.diasABordo.rangos.flatMap(r => r.dias);

  cont.innerHTML = DIAS_SEMANA.map(dia => {
    const usado = diasYaUsados.includes(dia);
    const seleccionado = rangoDiasSeleccionados.includes(dia);
    return `
    <button type="button" class="dia-chip${seleccionado ? ' seleccionado' : ''}"
      ${usado ? 'disabled title="Este día ya pertenece a otro rango"' : `onclick="toggleDiaSeleccionado('${dia}')"`}>
      ${seleccionado ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>' : ''}
      ${dia}
    </button>`;
  }).join('');
}

function toggleDiaSeleccionado(dia) {
  if (rangoDiasSeleccionados.includes(dia)) {
    rangoDiasSeleccionados = rangoDiasSeleccionados.filter(d => d !== dia);
  } else {
    rangoDiasSeleccionados.push(dia);
  }
  renderChipsDiasSemana();
}

function renderListaRangosDiasABordo() {
  const cont = document.getElementById('listaRangosDiasABordo');
  const rangos = LIMITES_GASTOS_DEMO.diasABordo.rangos;
  cont.innerHTML = rangos.length
    ? rangos.map(r => `
      <div class="rango-dias-row">
        <span class="rango-dias-lista">${r.dias.join(', ')}</span>
        <span class="rango-dias-monto">S/ ${Number(r.monto).toFixed(2)}</span>
        <button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarRangoDiasABordo(${r.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>`).join('')
    : `<p class="submodulo-tabla-vacio">Aún no se agregaron rangos.</p>`;
}

function agregarRangoDiasABordo() {
  const montoInput = document.getElementById('nuevoRangoMonto');
  const monto = parseFloat(montoInput.value);

  if (!rangoDiasSeleccionados.length) { mostrarToast('Selecciona al menos un día de la semana.'); return; }
  if (isNaN(monto) || monto <= 0) { mostrarToast('Ingresa un monto de rango válido, mayor a cero.'); return; }

  // Un mismo día de la semana no puede pertenecer a más de un rango a la vez.
  const diasYaUsados = LIMITES_GASTOS_DEMO.diasABordo.rangos.flatMap(r => r.dias);
  const conflicto = rangoDiasSeleccionados.find(d => diasYaUsados.includes(d));
  if (conflicto) { mostrarToast(`El día "${conflicto}" ya pertenece a otro rango.`); return; }

  const nuevoId = (Math.max(0, ...LIMITES_GASTOS_DEMO.diasABordo.rangos.map(r => r.id)) || 0) + 1;
  LIMITES_GASTOS_DEMO.diasABordo.rangos.push({ id: nuevoId, dias: [...rangoDiasSeleccionados], monto });

  rangoDiasSeleccionados = [];
  montoInput.value = '';
  renderChipsDiasSemana();
  renderListaRangosDiasABordo();
}

function quitarRangoDiasABordo(id) {
  LIMITES_GASTOS_DEMO.diasABordo.rangos = LIMITES_GASTOS_DEMO.diasABordo.rangos.filter(r => r.id !== id);
  renderChipsDiasSemana();
  renderListaRangosDiasABordo();
}

// "Día" (1-31) y "Mes" del selector — se repoblán cada vez que se abre el
// modal (ver abrirModalConfiguracionLimites) igual que renderChipsDiasSemana.
function poblarSelectsDiaEspecial() {
  const selectDia = document.getElementById('nuevoDiaEspecialDia');
  const selectMes = document.getElementById('nuevoDiaEspecialMes');
  if (!selectDia || !selectMes) return;

  selectDia.innerHTML = Array.from({ length: 31 }, (_, i) => i + 1)
    .map(d => `<option value="${d}">${d}</option>`).join('');
  selectMes.innerHTML = MESES_GASTOS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
}

function renderTablaDiasEspeciales() {
  const tbody = document.getElementById('tbodyDiasEspeciales');
  const dias = LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales;
  tbody.innerHTML = dias.length
    ? dias.map(d => `
      <tr>
        <td>${String(d.dia).padStart(2, '0')}/${String(d.mes).padStart(2, '0')} <span class="dia-especial-nota">(todos los años)</span></td>
        <td>S/ ${Number(d.monto).toFixed(2)}</td>
        <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarDiaEspecial(${d.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button></td>
      </tr>`).join('')
    : `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron días especiales.</td></tr>`;
}

function agregarDiaEspecial() {
  const diaInput = document.getElementById('nuevoDiaEspecialDia');
  const mesInput = document.getElementById('nuevoDiaEspecialMes');
  const montoInput = document.getElementById('nuevoDiaEspecialMonto');
  const dia = parseInt(diaInput.value, 10);
  const mes = parseInt(mesInput.value, 10);
  const monto = parseFloat(montoInput.value);

  if (isNaN(monto) || monto <= 0) { mostrarToast('Ingresa un monto válido, mayor a cero.'); return; }

  const duplicada = LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales.some(d => d.dia === dia && d.mes === mes);
  if (duplicada) { mostrarToast('Ese día ya está registrado como día especial.'); return; }

  const nuevoId = (Math.max(0, ...LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales.map(d => d.id)) || 0) + 1;
  LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales.push({ id: nuevoId, dia, mes, monto });

  diaInput.value = '1';
  mesInput.value = '1';
  montoInput.value = '';
  renderTablaDiasEspeciales();
}

function quitarDiaEspecial(id) {
  LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales = LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales.filter(d => d.id !== id);
  renderTablaDiasEspeciales();
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
  document.getElementById('limAlimentosMaximoDia').value = cfg.alimentos.montoMaximoDia;

  document.getElementById('limMovilidadMaximoDia').value = cfg.movilidad.montoMaximoDia;
  document.getElementById('limMovilidadMaximoDiaAnterior').textContent = `S/ ${Number(cfg.movilidad.montoAnteriorDia).toFixed(2)}`;
  document.getElementById('limMovilidadMaximoViaje').value = cfg.movilidad.montoMaximoViaje;
  document.getElementById('limMovilidadMaximoViajeAnterior').textContent = `S/ ${Number(cfg.movilidad.montoAnteriorViaje).toFixed(2)}`;

  rangoDiasSeleccionados = [];
  renderChipsDiasSemana();
  renderListaRangosDiasABordo();
  poblarSelectsDiaEspecial();
  renderTablaDiasEspeciales();

  cambiarTabLimites('alimentos');
  abrirModal('modalConfiguracionLimites');
}

function guardarConfiguracionLimites() {
  const campos = [
    document.getElementById('limAlimentosDesayuno'), document.getElementById('limAlimentosAlmuerzo'),
    document.getElementById('limAlimentosCena'), document.getElementById('limAlimentosMaximoDia'),
    document.getElementById('limMovilidadMaximoDia'), document.getElementById('limMovilidadMaximoViaje')
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
  cfg.alimentos.montoMaximoDia = parseFloat(document.getElementById('limAlimentosMaximoDia').value);

  cfg.movilidad.montoAnteriorDia = cfg.movilidad.montoMaximoDia;
  cfg.movilidad.montoAnteriorViaje = cfg.movilidad.montoMaximoViaje;
  cfg.movilidad.montoMaximoDia = parseFloat(document.getElementById('limMovilidadMaximoDia').value);
  cfg.movilidad.montoMaximoViaje = parseFloat(document.getElementById('limMovilidadMaximoViaje').value);

  const sesion = obtenerUsuarioActual();
  cfg.modificadoPor = sesion ? sesion.usuario : cfg.modificadoPor;
  cfg.fechaModificacion = fechaHoraActualGastos();

  cerrarModal('modalConfiguracionLimites');
  mostrarToast('La configuración de límites fue guardada correctamente.');
}

function fechaHoraActualGastos() {
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(ahora.getDate())}/${pad(ahora.getMonth() + 1)}/${ahora.getFullYear()} ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}
