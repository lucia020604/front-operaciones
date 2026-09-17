// =================================================
// REPORTE-PRECINTOS.JS
// Precintos > Reporte de Precintos.
// =================================================

document.addEventListener('DOMContentLoaded', () => {
  renderTablaReportePrecintos();
});

// PER cuyas filas están expandidas (mostrando el detalle de sus precintos)
// — persiste mientras se filtra/busca, así una fila que el usuario abrió a
// mano no se cierra sola al re-renderizar.
let filasExpandidasReporte = new Set();

// Resume en un solo estado dónde va el pipeline de firmas de un Detalle
// (Revisado → Autorizado → Finalizado → firma del operario en el móvil),
// con el mismo mapeo de color que ya usa calcularEstadoLote en Control de
// Precintos (gris = nada hecho, ámbar = en curso, azul = cerrado del lado
// oficina y a la espera de otra persona, verde = completo).
function estadoValidacionGrp(detalleGrp) {
  if (!detalleGrp) return { texto: '—', clase: 'badge-gris' };
  if (!detalleGrp.revisadoPor) return { texto: 'Por revisar', clase: 'badge-gris' };
  if (!detalleGrp.autorizadoPor || detalleGrp.estado !== 'Finalizado') return { texto: 'En revisión', clase: 'badge-por-vencer' };
  if (!detalleGrp.operarioFirmaPor) return { texto: 'Pendiente firma operario', clase: 'badge-finalizado' };
  return { texto: 'Firmado', clase: 'badge-vigente' };
}

// Completitud de una Asignación: cuántos de sus precintos ya fueron
// reportados como usados, y si quedó atrasada (pasó su fecha fin sin que el
// registro esté Finalizado) — mismo cálculo que ya hace renderTablaReportePrecintos
// para la celda "Precintos", centralizado acá para reusarlo en el filtro y
// en la exportación.
function calcularCompletitudReporte(r) {
  const asignacion = obtenerAsignacionPorId(r.asignacionId);
  const asignados = asignacion ? asignacion.precintos.length : 0;
  const detalleGrp = obtenerGenerarRegistroPorAsignacion(r.asignacionId);
  const reportados = detalleGrp ? detalleGrp.detalle.length : 0;
  const completo = asignados > 0 && reportados >= asignados;
  const hoy = new Date().toISOString().slice(0, 10);
  const atrasado = r.estado !== 'finalizado' && !!r.fechaFin && fechaDDMMYYYYaISO(r.fechaFin) < hoy;
  return { asignados, reportados, completo, atrasado };
}

// Estado de un precinto puntual, para la fila de detalle expandible de cada
// PER (usado por renderTablaReportePrecintos y por la exportación).
const ESTADO_PRECINTO_BADGE = {
  usado: { texto: 'Usado', clase: 'badge-vigente' },
  asignado: { texto: 'Sin reportar', clase: 'badge-por-vencer' },
  disponible: { texto: 'Disponible', clase: 'badge-gris' }
};

// Un precinto de un PER cumple el filtro de "Consultar precinto" (Filtros
// avanzados) si matchea el N° de Precinto ingresado y/o el Estado del
// precinto elegido — se usa tanto para filtrar filas de PER (¿tiene algún
// precinto que cumpla?) como para resaltar/expandir cuál es dentro del
// detalle.
function precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto) {
  if (precintoTexto && !f.precinto.toLowerCase().includes(precintoTexto)) return false;
  if (estadoPrecinto === 'disponible' && f.estado !== 'disponible') return false;
  if (estadoPrecinto === 'sin-reportar' && f.estado !== 'asignado') return false;
  if (estadoPrecinto === 'usado' && f.estado !== 'usado') return false;
  return true;
}

function filasReportePrecintosFiltradas(todosPrecintos) {
  const texto = document.getElementById('searchReportePrecintos').value.trim().toLowerCase();
  const precintoTexto = document.getElementById('filterAvzRepPrecinto').value.trim().toLowerCase();
  const estadoPrecinto = document.getElementById('filterAvzRepEstadoPrecinto').value;
  const desde = document.getElementById('filterAvzRepFechaDesde').value;
  const hasta = document.getElementById('filterAvzRepFechaHasta').value;
  const estado = document.getElementById('filterAvzRepEstado').value;
  const completitud = document.getElementById('filterAvzRepCompletitud').value;

  return REPORTES_PRECINTOS_DEMO.filter(r => {
    const asignacion = obtenerAsignacionPorId(r.asignacionId);
    const codigoAsignacion = asignacion ? asignacion.codigo : '';
    if (texto && !codigoAsignacion.toLowerCase().includes(texto)) return false;

    // "Consultar precinto": la Asignación solo queda si alguno de sus
    // precintos cumple el N° de Precinto y/o Estado del precinto pedidos.
    if (precintoTexto || estadoPrecinto) {
      const precintosDeLaAsignacion = todosPrecintos.filter(f => f.asignacion && f.asignacion.id === r.asignacionId);
      if (!precintosDeLaAsignacion.some(f => precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto))) return false;
    }

    if (estado && r.estado !== estado) return false;
    if (desde && fechaDDMMYYYYaISO(r.fechaInicio) < desde) return false;
    if (hasta && r.fechaFin && fechaDDMMYYYYaISO(r.fechaFin) > hasta) return false;
    if (completitud) {
      const c = calcularCompletitudReporte(r);
      if (completitud === 'completo' && !c.completo) return false;
      if (completitud === 'incompleto' && c.completo) return false;
      if (completitud === 'atrasado' && !c.atrasado) return false;
    }
    return true;
  });
}

function renderTablaReportePrecintos() {
  const precintoTexto = document.getElementById('filterAvzRepPrecinto').value.trim().toLowerCase();
  const estadoPrecinto = document.getElementById('filterAvzRepEstadoPrecinto').value;
  const todosPrecintos = obtenerTodosLosPrecintosConEstado();
  const filas = filasReportePrecintosFiltradas(todosPrecintos);
  const tbody = document.getElementById('tbodyReportePrecintos');

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="submodulo-tabla-vacio">No se encontraron reportes de precintos.</td></tr>`;
    actualizarBotonExpandirTodos([]);
    return;
  }

  tbody.innerHTML = filas.map((r) => {
    const asignacion = obtenerAsignacionPorId(r.asignacionId);
    // Cuántos de los precintos de esta Asignación ya fueron reportados como
    // usados (por la app móvil o por "Agregar uso de precinto" del Detalle)
    // — mismo cálculo que renderCompletitudDetalle, resumido acá para ver de
    // un vistazo a qué Asignación le falta reporte sin abrir el Detalle.
    const detalleGrp = obtenerGenerarRegistroPorAsignacion(r.asignacionId);
    const { asignados, reportados, atrasado } = calcularCompletitudReporte(r);
    const precintosCelda = asignados && reportados < asignados
      ? `<span class="detalle-completitud-alerta">${reportados}/${asignados}</span>`
      : `${reportados}/${asignados}`;

    // "Atrasado" (pasó la fecha fin y el registro sigue sin Finalizar) pisa
    // el badge normal de Estado — es la señal que más le importa a un
    // supervisor de un vistazo, por encima de si sigue "Pendiente" a tiempo.
    const badgeClase = atrasado ? 'badge-vencida' : (r.estado === 'finalizado' ? 'badge-gris' : 'badge-por-vencer');
    const etiquetaEstado = atrasado ? 'Atrasado' : (r.estado === 'finalizado' ? 'Finalizado' : 'Pendiente');

    // Todo el pipeline de firmas en una sola columna (Revisado → Autorizado
    // → Finalizado → firma del operario en el móvil), no solo el último
    // paso — antes había que abrir el Detalle uno por uno para saber en qué
    // parte del proceso estaba. Mismo formato de badge que "Estado".
    const validacion = estadoValidacionGrp(detalleGrp);

    // "Entregado por" ya es un campo directo de la Asignación (relación 1 a
    // 1 con este Reporte), no hace falta buscarlo entre varias.
    const supervisorCelda = asignacion ? nombreColaborador(asignacion.entregadoPor) : '—';

    // Detalle de los precintos de esta Asignación (código, estado real,
    // quién y cuándo lo usó) para la fila expandible — responde tanto "en
    // qué operación se usó este precinto" como "cuáles quedaron sin reportar".
    const precintosDeLaAsignacion = todosPrecintos
      .filter(f => f.asignacion && f.asignacion.id === r.asignacionId)
      .sort((a, b) => numeroDePrecinto(a.precinto) - numeroDePrecinto(b.precinto));

    // Si "Consultar precinto" (Filtros avanzados) está en uso, la fila se
    // expande sola — así no hay que abrirla a mano para ver cuál de sus
    // precintos fue el que hizo match.
    if ((precintoTexto || estadoPrecinto) && precintosDeLaAsignacion.some(f => precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto))) {
      filasExpandidasReporte.add(r.asignacionId);
    }
    const expandido = filasExpandidasReporte.has(r.asignacionId);

    const botonExpandir = precintosDeLaAsignacion.length
      ? `<button type="button" class="btn-expandir-fila${expandido ? ' expandido' : ''}" title="${expandido ? 'Contraer' : 'Expandir'} precintos" onclick="toggleFilaDetallePrecintosReporte(${r.asignacionId})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>`
      : '';

    const filaDetalle = precintosDeLaAsignacion.length ? `
    <tr class="fila-detalle-precintos" style="display:${expandido ? '' : 'none'}">
      <td colspan="10">
        <div class="precintos-anidados-marco">
          <table class="tabla-precintos-anidada">
            <thead><tr><th>Precinto</th><th>Estado</th><th>Colaborador</th><th>N° Viaje</th><th>Fecha</th></tr></thead>
            <tbody>
              ${precintosDeLaAsignacion.map(f => {
                const badge = ESTADO_PRECINTO_BADGE[f.estado];
                const resaltado = (precintoTexto || estadoPrecinto) && precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto)
                  ? ' class="precinto-resaltado"' : '';
                return `<tr${resaltado}>
                  <td>${f.precinto}</td>
                  <td><span class="badge ${badge.clase}"><span class="badge-dot"></span>${badge.texto}</span></td>
                  <td>${f.uso ? nombreColaborador(f.uso.colaborador) : '—'}</td>
                  <td>${f.uso ? f.uso.viaje : '—'}</td>
                  <td>${f.uso ? f.uso.fecha : '—'}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </td>
    </tr>` : '';

    return `
    <tr>
      <td class="celda-expandir">${botonExpandir}</td>
      <td class="codigo-col">${detalleGrp ? detalleGrp.numero : '—'}</td>
      <td>${asignacion ? asignacion.codigo : '—'}</td>
      <td>${supervisorCelda}</td>
      <td>${r.fechaInicio}</td>
      <td>${r.fechaFin || '—'}</td>
      <td>${precintosCelda}</td>
      <td><span class="badge ${validacion.clase}"><span class="badge-dot"></span>${validacion.texto}</span></td>
      <td><span class="badge ${badgeClase}"><span class="badge-dot"></span>${etiquetaEstado}</span></td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver" onclick="abrirModalVerEtiquetasPorAsignacion(${r.asignacionId})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>${filaDetalle}`;
  }).join('');

  actualizarBotonExpandirTodos(filas);
}

function toggleFilaDetallePrecintosReporte(asignacionId) {
  if (filasExpandidasReporte.has(asignacionId)) filasExpandidasReporte.delete(asignacionId);
  else filasExpandidasReporte.add(asignacionId);
  renderTablaReportePrecintos();
}

// Solo cuentan para "Expandir/Contraer todos" las Asignaciones que de verdad
// tienen precintos (las que no, no tienen flecha ni fila que expandir).
function actualizarBotonExpandirTodos(filas) {
  const btn = document.getElementById('btnExpandirTodosReporte');
  const label = document.getElementById('btnExpandirTodosLabel');
  if (!btn || !label) return;
  const conPrecintos = filas.filter(r => (obtenerAsignacionPorId(r.asignacionId)?.precintos.length || 0) > 0);
  const todosExpandidos = conPrecintos.length > 0 && conPrecintos.every(r => filasExpandidasReporte.has(r.asignacionId));
  label.textContent = todosExpandidos ? 'Contraer todos' : 'Expandir todos';
  btn.disabled = conPrecintos.length === 0;
  btn.style.opacity = conPrecintos.length === 0 ? '.5' : '1';
}

function toggleExpandirTodasFilasReporte() {
  const todosPrecintos = obtenerTodosLosPrecintosConEstado();
  const filas = filasReportePrecintosFiltradas(todosPrecintos).filter(r => (obtenerAsignacionPorId(r.asignacionId)?.precintos.length || 0) > 0);
  const todosExpandidos = filas.length > 0 && filas.every(r => filasExpandidasReporte.has(r.asignacionId));
  filas.forEach(r => todosExpandidos ? filasExpandidasReporte.delete(r.asignacionId) : filasExpandidasReporte.add(r.asignacionId));
  renderTablaReportePrecintos();
}

function filtrarReportePrecintos() {
  renderTablaReportePrecintos();
  repActualizarBotonFiltrosAvanzados();
}

function limpiarFiltrosReportePrecintos() {
  document.getElementById('searchReportePrecintos').value = '';
  repLimpiarCamposFiltrosAvanzados();
  filtrarReportePrecintos();
}

/* =================================================
   FILTROS AVANZADOS — mismo patrón que Seguimiento de Operaciones
   (seguimiento-operaciones.js): modal lateral + badge con la cantidad de
   filtros activos. "Consultar precinto" (N° de Precinto + Estado del
   precinto) vive acá para no saturar la barra de filtros principal.
================================================= */
const REP_IDS_FILTROS_AVANZADOS = [
  'filterAvzRepPrecinto', 'filterAvzRepEstadoPrecinto',
  'filterAvzRepEstado', 'filterAvzRepCompletitud',
  'filterAvzRepFechaDesde', 'filterAvzRepFechaHasta'
];

function repLimpiarCamposFiltrosAvanzados() {
  REP_IDS_FILTROS_AVANZADOS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function repContarFiltrosAvanzadosActivos() {
  return REP_IDS_FILTROS_AVANZADOS.reduce((acc, id) => acc + (document.getElementById(id)?.value ? 1 : 0), 0);
}

function repActualizarBotonFiltrosAvanzados() {
  const btn = document.getElementById('btnFiltrosAvanzadosRep');
  const badge = document.getElementById('filtrosAvanzadosRepBadge');
  if (!btn || !badge) return;
  const activos = repContarFiltrosAvanzadosActivos();
  btn.classList.toggle('activo', activos > 0);
  badge.style.display = activos > 0 ? '' : 'none';
  badge.textContent = activos;
}

function abrirModalFiltrosAvanzadosRep() {
  abrirModal('modalFiltrosAvanzadosRep');
}

function aplicarFiltrosAvanzadosModalRep() {
  cerrarModal('modalFiltrosAvanzadosRep');
  filtrarReportePrecintos();
}

function limpiarFiltrosAvanzadosModalRep() {
  repLimpiarCamposFiltrosAvanzados();
  cerrarModal('modalFiltrosAvanzadosRep');
  filtrarReportePrecintos();
}

/* =================================================
   DESCARGA: Excel (CSV) y PDF — mismo patrón que Control de Precintos
   (control-precintos.js), exportando las filas ya filtradas de la grilla.
================================================= */
function toggleDownloadDropdownReportePrecintos() {
  document.getElementById('downloadDropdownReportePrecintos').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.btn-download-wrap')) {
    const dd = document.getElementById('downloadDropdownReportePrecintos');
    if (dd) dd.classList.remove('open');
  }
});

function obtenerFilasExportReportePrecintos() {
  const todosPrecintos = obtenerTodosLosPrecintosConEstado();
  return filasReportePrecintosFiltradas(todosPrecintos).map(r => {
    const asignacion = obtenerAsignacionPorId(r.asignacionId);
    const detalleGrp = obtenerGenerarRegistroPorAsignacion(r.asignacionId);
    const c = calcularCompletitudReporte(r);
    const validacion = estadoValidacionGrp(detalleGrp);
    return {
      codigo: detalleGrp ? detalleGrp.numero : '—',
      asignacion: asignacion ? asignacion.codigo : '—',
      supervisor: asignacion ? nombreColaborador(asignacion.entregadoPor) : '—',
      fechaInicio: r.fechaInicio,
      fechaFin: r.fechaFin || '—',
      precintos: `${c.reportados}/${c.asignados}`,
      validacion: validacion.texto,
      estado: c.atrasado ? 'Atrasado' : (r.estado === 'finalizado' ? 'Finalizado' : 'Pendiente')
    };
  });
}

function exportarReportePrecintosExcel() {
  const filas = obtenerFilasExportReportePrecintos();
  const headers = ['Código', 'Asignación', 'Supervisor', 'Fecha inicio', 'Fecha Fin', 'Precintos', 'Validación', 'Estado'];

  const csv = [headers, ...filas.map(f => [f.codigo, f.asignacion, f.supervisor, f.fechaInicio, f.fechaFin, f.precintos, f.validacion, f.estado])]
    .map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom  = '﻿'; // BOM para que Excel abra UTF-8 correctamente
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'reporte-precintos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  document.getElementById('downloadDropdownReportePrecintos').classList.remove('open');
  mostrarToast('Exportación Excel descargada correctamente.');
}

function exportarReportePrecintosPDF() {
  const filas = obtenerFilasExportReportePrecintos();
  const filasHTML = filas.map(f => `
    <tr>
      <td>${f.codigo}</td>
      <td>${f.asignacion}</td>
      <td>${f.supervisor}</td>
      <td>${f.fechaInicio}</td>
      <td>${f.fechaFin}</td>
      <td>${f.precintos}</td>
      <td>${f.validacion}</td>
      <td>${f.estado}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Reporte de Precintos</title>
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
    <h2>Reporte de Precintos</h2>
    <table>
      <thead>
        <tr><th>Código</th><th>Asignación</th><th>Supervisor</th><th>Fecha inicio</th><th>Fecha Fin</th><th>Precintos</th><th>Validación</th><th>Estado</th></tr>
      </thead>
      <tbody>${filasHTML}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();

  document.getElementById('downloadDropdownReportePrecintos').classList.remove('open');
}
