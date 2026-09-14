// =================================================
// REPORTE-PRECINTOS.JS
// Precintos > Reporte de Precintos.
// =================================================

document.addEventListener('DOMContentLoaded', () => {
  renderTablaReportePrecintos();
});

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

function renderTablaReportePrecintos() {
  const texto = document.getElementById('searchReportePrecintos').value.trim().toLowerCase();
  const desde = document.getElementById('filterFechaDesdeReporte').value;
  const hasta = document.getElementById('filterFechaHastaReporte').value;
  const estado = document.getElementById('filterEstadoReporte').value;

  const filas = REPORTES_PRECINTOS_DEMO.filter(r => {
    if (texto && !r.per.toLowerCase().includes(texto)) return false;
    if (estado && r.estado !== estado) return false;
    if (desde && fechaDDMMYYYYaISO(r.fechaInicio) < desde) return false;
    if (hasta && r.fechaFin && fechaDDMMYYYYaISO(r.fechaFin) > hasta) return false;
    return true;
  });

  const tbody = document.getElementById('tbodyReportePrecintos');

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="submodulo-tabla-vacio">No se encontraron reportes de precintos.</td></tr>`;
    return;
  }

  tbody.innerHTML = filas.map((r) => {
    const badgeClase = r.estado === 'finalizado' ? 'badge-gris' : 'badge-por-vencer';
    const etiquetaEstado = r.estado === 'finalizado' ? 'Finalizado' : 'Pendiente';

    // Cuántos de los precintos asignados a este PER ya fueron reportados
    // como usados (por la app móvil o por "Agregar uso de precinto" del
    // Detalle) — mismo cálculo que renderCompletitudDetalle, resumido acá
    // para ver de un vistazo a qué PER le falta reporte sin abrir el Detalle.
    const asignados = obtenerPrecintosAsignadosPorPer(r.per).size;
    const detalleGrp = obtenerGenerarRegistroPorPer(r.per);
    const reportados = detalleGrp ? detalleGrp.detalle.length : 0;
    const precintosCelda = asignados && reportados < asignados
      ? `<span class="detalle-completitud-alerta">${reportados}/${asignados}</span>`
      : `${reportados}/${asignados}`;

    // Todo el pipeline de firmas en una sola columna (Revisado → Autorizado
    // → Finalizado → firma del operario en el móvil), no solo el último
    // paso — antes había que abrir el Detalle uno por uno para saber en qué
    // parte del proceso estaba. Mismo formato de badge que "Estado".
    const validacion = estadoValidacionGrp(detalleGrp);

    // "Entregado por" de la Asignación es justamente el rol Supervisor (ver
    // poblarSelectEntregadoPorAsignacion en control-precintos.js) — un PER
    // puede repetirse en más de una Asignación, así que se juntan todos sin
    // duplicar.
    const supervisores = [...new Set(
      ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.pers.includes(r.per)).map(a => a.entregadoPor)
    )];
    const supervisorCelda = supervisores.length ? supervisores.map(nombreColaborador).join(', ') : '—';

    return `
    <tr>
      <td class="codigo-col">${detalleGrp ? detalleGrp.numero : '—'}</td>
      <td>${r.per}</td>
      <td>${supervisorCelda}</td>
      <td>${r.fechaInicio}</td>
      <td>${r.fechaFin || '—'}</td>
      <td>${precintosCelda}</td>
      <td><span class="badge ${validacion.clase}"><span class="badge-dot"></span>${validacion.texto}</span></td>
      <td><span class="badge ${badgeClase}"><span class="badge-dot"></span>${etiquetaEstado}</span></td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver" onclick="abrirModalVerEtiquetasPorPer('${r.per}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

function filtrarReportePrecintos() {
  renderTablaReportePrecintos();
}

function limpiarFiltrosReportePrecintos() {
  document.getElementById('searchReportePrecintos').value = '';
  document.getElementById('filterFechaDesdeReporte').value = '';
  document.getElementById('filterFechaHastaReporte').value = '';
  document.getElementById('filterEstadoReporte').value = '';
  renderTablaReportePrecintos();
}
