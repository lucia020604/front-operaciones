// =================================================
// RELACIONES-PORTUARIAS.JS
// Vista de Puerto → Terminal → Muelle organizada en tarjetas por puerto
// (una tarjeta = un puerto, con sus terminales y, dentro de cada uno, sus
// muelles) — pensada como guía de lectura de arriba hacia abajo, en vez
// del diagrama de 3 columnas con líneas que usaba la primera versión.
// =================================================

function relTexto() {
  return (document.getElementById('relBuscar')?.value || '').toLowerCase().trim();
}

function relPoblarFiltroPuerto() {
  const select = document.getElementById('relFiltroPuerto');
  if (!select) return;
  const actual = select.value;
  select.innerHTML = '<option value="">Todos</option>' +
    tgCargarCatalogo('puertosData', PUERTOS_DEMO).map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');
  if ([...select.options].some(o => o.value === actual)) select.value = actual;
}

// Arma la lista de puertos con sus terminales y muelles ya anidados y
// filtrados, aplicando en orden: estado del puerto, puerto puntual elegido,
// inclusión de inactivos en los niveles hijos y, por último, el texto
// buscado (que si coincide con un terminal o muelle deja el puerto igual
// visible, pero acota esa tarjeta a lo que coincide para guiar la lectura).
function relConstruirArbol() {
  const incluirInactivos = document.getElementById('relMostrarInactivos')?.checked;
  const puertoFiltro = document.getElementById('relFiltroPuerto')?.value || '';
  const estadoFiltro = document.getElementById('relFiltroEstado')?.value || 'todos';
  const texto = relTexto();

  const puertosTodos = tgCargarCatalogo('puertosData', PUERTOS_DEMO);
  const terminalesTodos = tgCargarCatalogo('terminalesPuertoData', TERMINAL_PUERTO_DEMO);
  const muellesTodos = tgCargarCatalogo('muellesData', MUELLE_DEMO);

  return puertosTodos
    .filter(p => !puertoFiltro || p.nombre === puertoFiltro)
    .filter(p => estadoFiltro === 'todos' || p.estado === estadoFiltro)
    .map(p => {
      const terminales = terminalesTodos
        .filter(t => t.puerto === p.nombre && (incluirInactivos || t.estado === 'activo'))
        .map(t => ({
          ...t,
          muelles: muellesTodos.filter(m => m.terminal === t.nombre && (incluirInactivos || m.estado === 'activo'))
        }));
      return { ...p, terminales };
    })
    .filter(p => {
      if (!texto) return true;
      if (p.nombre.toLowerCase().includes(texto)) return true;
      return p.terminales.some(t => t.nombre.toLowerCase().includes(texto) || t.muelles.some(m => m.nombre.toLowerCase().includes(texto)));
    })
    .map(p => {
      if (!texto || p.nombre.toLowerCase().includes(texto)) return p;
      const terminales = p.terminales
        .map(t => {
          const coincideTerminal = t.nombre.toLowerCase().includes(texto);
          const muelles = coincideTerminal ? t.muelles : t.muelles.filter(m => m.nombre.toLowerCase().includes(texto));
          return { ...t, muelles };
        })
        .filter(t => t.nombre.toLowerCase().includes(texto) || t.muelles.length);
      return { ...p, terminales };
    });
}

function relBadge(estado) {
  return estado === 'inactivo'
    ? '<span class="badge badge-inactivo"><span class="badge-dot"></span>Inactivo</span>'
    : '<span class="badge badge-activo"><span class="badge-dot"></span>Activo</span>';
}

function relMuelleChipHtml(m) {
  return `<span class="rel-muelle-chip${m.estado === 'inactivo' ? ' rel-muelle-chip-inactivo' : ''}">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"/><path d="M4 20v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><path d="M12 12V4"/><path d="M8 4h8"/></svg>
    ${m.nombre}
  </span>`;
}

function relTerminalHtml(t) {
  return `
  <div class="rel-terminal${t.estado === 'inactivo' ? ' rel-terminal-inactivo' : ''}">
    <div class="rel-terminal-header">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/></svg>
      <span class="rel-terminal-nombre">${t.nombre}</span>
      ${t.estado === 'inactivo' ? '<span class="rel-tag-inactivo">Inactivo</span>' : ''}
    </div>
    <div class="rel-muelles">
      ${t.muelles.length
        ? t.muelles.map(relMuelleChipHtml).join('')
        : '<span class="rel-vacio-inline">Sin muelles registrados</span>'}
    </div>
  </div>`;
}

function relTarjetaHtml(p) {
  const totalMuelles = p.terminales.reduce((acc, t) => acc + t.muelles.length, 0);
  return `
  <div class="rel-card${p.estado === 'inactivo' ? ' rel-card-inactivo' : ''}">
    <div class="rel-card-header">
      <div class="rel-card-icono">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>
      </div>
      <div class="rel-card-titulo-wrap">
        <div class="rel-card-titulo">${p.nombre}</div>
        <div class="rel-card-desc">${p.descripcion || 'Sin descripción'}</div>
      </div>
      ${relBadge(p.estado)}
    </div>
    <div class="rel-card-stats">
      <span>${p.terminales.length} terminal${p.terminales.length === 1 ? '' : 'es'}</span>
      <span class="rel-card-stats-sep">·</span>
      <span>${totalMuelles} muelle${totalMuelles === 1 ? '' : 's'}</span>
    </div>
    <div class="rel-card-body">
      ${p.terminales.length
        ? p.terminales.map(relTerminalHtml).join('')
        : '<div class="rel-vacio">Este puerto todavía no tiene terminales registrados.</div>'}
    </div>
  </div>`;
}

function relKpiCard(label, valor, color, iconoPath) {
  return `
    <div class="kpi-card">
      <div class="kpi-value">${valor}</div>
      <div class="kpi-label">${label}</div>
      <div class="kpi-icon-box" style="background:${color}1A; color:${color};">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconoPath}</svg>
      </div>
    </div>`;
}

function relPintarKpis(puertos) {
  const cont = document.getElementById('relKpiGrid');
  if (!cont) return;
  const totalTerminales = puertos.reduce((acc, p) => acc + p.terminales.length, 0);
  const totalMuelles = puertos.reduce((acc, p) => acc + p.terminales.reduce((a, t) => a + t.muelles.length, 0), 0);
  const sinTerminales = puertos.filter(p => p.terminales.length === 0).length;

  cont.innerHTML =
    relKpiCard('Puertos', puertos.length, '#111111', '<path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>') +
    relKpiCard('Terminales', totalTerminales, '#1D4ED8', '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/>') +
    relKpiCard('Muelles', totalMuelles, '#16A34A', '<path d="M2 20h20"/><path d="M4 20v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"/><path d="M12 12V4"/><path d="M8 4h8"/>') +
    relKpiCard('Puertos sin terminal', sinTerminales, '#DC2626', '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>');
}

function relPintarGrid(puertos) {
  const grid = document.getElementById('relGrid');
  const sinResultados = document.getElementById('relSinResultados');
  if (!grid) return;
  grid.innerHTML = puertos.map(relTarjetaHtml).join('');
  const vacio = puertos.length === 0;
  grid.style.display = vacio ? 'none' : '';
  if (sinResultados) sinResultados.style.display = vacio ? '' : 'none';
}

function relPintarTodo() {
  relPoblarFiltroPuerto();
  const puertos = relConstruirArbol();
  relPintarKpis(puertos);
  relPintarGrid(puertos);
}

function relLimpiarFiltros() {
  document.getElementById('relBuscar').value = '';
  document.getElementById('relFiltroPuerto').value = '';
  document.getElementById('relFiltroEstado').value = 'activo';
  document.getElementById('relMostrarInactivos').checked = false;
  relPintarTodo();
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('relGrid')) return;
  relPintarTodo();
});
