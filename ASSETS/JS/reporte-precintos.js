// =================================================
// REPORTE-PRECINTOS.JS
// Precintos > Reporte de Precintos.
// =================================================

document.addEventListener('DOMContentLoaded', () => {
  renderTablaReportePrecintos();
});

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
    tbody.innerHTML = `<tr><td colspan="6" class="submodulo-tabla-vacio">No se encontraron reportes de precintos.</td></tr>`;
    return;
  }

  tbody.innerHTML = filas.map((r, i) => {
    const badgeClase = r.estado === 'finalizado' ? 'badge-gris' : 'badge-por-vencer';
    const etiquetaEstado = r.estado === 'finalizado' ? 'Finalizado' : 'Pendiente';
    return `
    <tr>
      <td>${i + 1}</td>
      <td>${r.per}</td>
      <td>${r.fechaInicio}</td>
      <td>${r.fechaFin || '—'}</td>
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
