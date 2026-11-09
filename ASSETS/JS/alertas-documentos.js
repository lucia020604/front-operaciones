// =================================================
// DATOS DEL SISTEMA
// Todo sale de registros que ya existen en el sistema:
//  - Documentos: información profesional de los colaboradores (contrato, cursos,
//    certificaciones, idiomas y Lemon Card) contra la fecha de hoy. "Por Vencer"
//    depende de los días de aviso que cada documento tiene configurados en
//    Configuración de Documentos (el mayor de ellos; 30 días si no tiene).
//    Fuente: data-verificacion-colaboradores.js.
//  - Operaciones: el personal asignado (inspectores y supervisor) a las
//    operaciones vigentes (Activo / En Proceso) de Seguimiento de Operaciones.
//    Una persona asignada que no tiene información profesional registrada se
//    reporta como "Sin registro".
// =================================================
const ROL_ETIQUETA_ALERTA = { 'Tecnico Especialista': 'Técnico Especialista', 'Jefe de Area': 'Jefe de Área' };
const DIAS_AVISO_POR_DEFECTO = 30;
const ESTADOS_OP_VIGENTES = ['Activo', 'En Proceso'];
const GRUPO_SIN_REGISTRO = 'Información profesional';
const RUTA_INFO_PROFESIONAL = '../CONFIGURACION/informacion-profesional.html';
const RUTA_SEGUIMIENTO_OP = '../OPERACIONES/seguimiento-operaciones.html';

const normalizarNombre = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const escHtml = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Personal asignado a operaciones vigentes: nombre normalizado → { nombre, ops[] }
function construirAsignaciones() {
  const mapa = new Map();
  const vigentes = opCargarOperaciones().filter(op => ESTADOS_OP_VIGENTES.includes(op.estado));

  const agregarPersona = (op, nombre, rolOp) => {
    if (!nombre) return;
    const k = normalizarNombre(nombre);
    if (!mapa.has(k)) mapa.set(k, { nombre, ops: [] });
    const a = mapa.get(k);
    if (a.ops.some(o => o.opId === op.id)) return;
    a.ops.push({ opId: op.id, buque: op.buque, per: op.per, fechaInicio: op.fechaInicio, fechaFin: op.fechaFin || op.fechaInicio, estado: op.estado, rolOp });
  };
  vigentes.forEach(op => {
    agregarPersona(op, op.supervisor, 'Supervisor');
    (op.personal || []).forEach(p => agregarPersona(op, p.nombre, p.rol));
  });
  mapa.forEach(a => a.ops.sort((x, y) => x.fechaInicio.localeCompare(y.fechaInicio)));
  return { mapa, totalVigentes: vigentes.length };
}

const ASIGNACIONES = construirAsignaciones();
const opsDe = nombre => (ASIGNACIONES.mapa.get(normalizarNombre(nombre)) || { ops: [] }).ops;

const usuarioPorNombre = nombre =>
  USUARIOS_DEMO.find(u => normalizarNombre(`${u.nombre} ${u.apellido}`) === normalizarNombre(nombre));
const colaboradorPorNombre = nombre =>
  COLABORADORES_VERIF.find(c => normalizarNombre(`${c.nombre} ${c.apellido}`) === normalizarNombre(nombre));

function construirAlertasData() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const formatoFecha = iso => {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };
  const diasHasta = iso => Math.round((new Date(iso + 'T00:00:00') - hoy) / 86400000);
  const diasAviso = nombre => {
    const doc = DOCUMENTOS_VERIF.find(d => d.nombre === nombre);
    return doc && doc.alertas.length ? Math.max(...doc.alertas) : DIAS_AVISO_POR_DEFECTO;
  };

  const grupos = [
    { tipo: GRUPO_SIN_REGISTRO, prefijo: 'IP', docs: [] },
    { tipo: 'Contrato', prefijo: 'Co', docs: [] },
    { tipo: 'Cursos', prefijo: 'Cu', docs: [] },
    { tipo: 'Lemon Card', prefijo: 'LC', docs: [] },
    { tipo: 'Otros', prefijo: 'Ot', docs: [] }
  ];
  const grupoDe = tipo => grupos.find(g => g.tipo === tipo);

  const agregar = (tipo, colab, documento, inicio, fin, diasLimite, registros) => {
    const dias = diasHasta(fin);
    if (dias > diasLimite) return;
    const g = grupoDe(tipo);
    g.docs.push({
      documento,
      cod: `${g.prefijo}${String(colab.id).padStart(2, '0')}-${g.docs.length + 1}`,
      nombre: `${colab.nombre} ${colab.apellido}`,
      rol: ROL_ETIQUETA_ALERTA[colab.rol] || colab.rol,
      inicio: formatoFecha(inicio),
      fin: formatoFecha(fin),
      dias,
      registros,
      estado: dias < 0 ? 'Vencido' : 'Por Vencer'
    });
  };

  COLABORADORES_VERIF.forEach(colab => {
    // Solo cuenta el contrato más reciente: los anteriores ya fueron reemplazados.
    if (colab.contratos.length) {
      const actual = colab.contratos.reduce((a, c) => (c.fin > a.fin ? c : a));
      const registros = [...colab.contratos].sort((a, b) => b.inicio.localeCompare(a.inicio)).map(c => ({
        actualizado: '—', inicio: formatoFecha(c.inicio), fin: formatoFecha(c.fin)
      }));
      agregar('Contrato', colab, 'Contrato de Trabajo', actual.inicio, actual.fin, diasAviso('Contrato de Trabajo'), registros);
    }

    colab.documentos.forEach(reg => {
      if (!reg.archivo || reg.sinDuracion || !reg.fin) return;
      const registros = [{
        actualizado: formatoFecha(reg.actualizado), inicio: formatoFecha(reg.inicio), fin: formatoFecha(reg.fin)
      }];
      agregar(/^Curso/i.test(reg.nombre) ? 'Cursos' : 'Otros', colab, reg.nombre, reg.inicio, reg.fin, diasAviso(reg.nombre), registros);
    });

    if (colab.lemonVenc) {
      const registros = [{ actualizado: '—', inicio: '—', fin: formatoFecha(colab.lemonVenc) }];
      agregar('Lemon Card', colab, `Lemon Card ${colab.lemonCard}`, '', colab.lemonVenc, DIAS_AVISO_POR_DEFECTO, registros);
    }
  });

  // Personal asignado a una operación vigente sin información profesional registrada.
  const sinRegistro = grupoDe(GRUPO_SIN_REGISTRO);
  ASIGNACIONES.mapa.forEach(a => {
    if (colaboradorPorNombre(a.nombre)) return;
    const rolOp = a.ops[0].rolOp;
    const u = usuarioPorNombre(a.nombre);
    const rolesUsuario = u ? obtenerIdsRolesUsuario(u).map(id => (obtenerRolPorId(id) || {}).nombre).filter(Boolean) : [];
    sinRegistro.docs.push({
      documento: 'Sin información profesional registrada',
      cod: `IP${String(sinRegistro.docs.length + 1).padStart(2, '0')}`,
      nombre: a.nombre,
      rol: rolesUsuario.includes(rolOp) ? rolOp : (rolesUsuario[0] || rolOp),
      inicio: '—', fin: '—', dias: null, registros: [],
      estado: 'Sin registro'
    });
  });

  grupos.forEach(g => g.docs.sort((x, y) => (x.dias ?? -Infinity) - (y.dias ?? -Infinity)));
  return grupos.map(({ tipo, docs }) => ({ tipo, docs }));
}

const ALERTAS_DATA = construirAlertasData();

// Todo el personal que el módulo conoce: colaboradores con información profesional
// y personal asignado a operaciones que todavía no la tiene.
const PERSONAL_SISTEMA = [
  ...COLABORADORES_VERIF.map(c => ({ nombre: `${c.nombre} ${c.apellido}`, rol: ROL_ETIQUETA_ALERTA[c.rol] || c.rol })),
  ...ALERTAS_DATA.find(g => g.tipo === GRUPO_SIN_REGISTRO).docs.map(d => ({ nombre: d.nombre, rol: d.rol }))
];

const COLORES_ESTADO = { 'Vencido': '#DC2626', 'Por Vencer': '#F59E0B', 'Sin registro': '#94A3B8' };
const BADGE_ESTADO   = { 'Vencido': 'badge-vencida', 'Por Vencer': 'badge-por-vencer', 'Sin registro': 'badge-gris' };
const claseEstado    = estado => BADGE_ESTADO[estado] || '';

// Instancias de los gráficos
let CHART_VENC = null;
let CHART_BARH = null;

// =================================================
// ESTADO GLOBAL DE FILTROS Y PAGINACIÓN
// =================================================
let filtros = { tipo: 'todos', estado: 'todos', rol: 'todos', busqueda: '', operacion: 'todos', estadoOp: 'todos', asignacion: 'todos', rango: null };
let paginaActual   = 1;
let FILAS_POR_PAGINA = 10;

// =================================================
// INIT
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  const roles = [...new Set(ALERTAS_DATA.flatMap(t => t.docs.map(d => d.rol)))].sort();
  const rolSel = document.getElementById('filtroRol');
  roles.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.textContent = r;
    rolSel.appendChild(opt);
  });

  const opsUnicas = new Map();
  ASIGNACIONES.mapa.forEach(a => a.ops.forEach(o => opsUnicas.set(o.opId, o)));
  document.getElementById('filtroOperacion').insertAdjacentHTML('beforeend',
    [...opsUnicas.values()].sort((a, b) => a.opId.localeCompare(b.opId))
      .map(o => `<option value="${o.opId}">${escHtml(o.opId)} · ${escHtml(o.buque)}</option>`).join(''));
  document.getElementById('filtroEstadoOp').insertAdjacentHTML('beforeend',
    ESTADOS_OP_VIGENTES.map(e => `<option value="${e}">${e}</option>`).join(''));
  document.getElementById('filtroRango').insertAdjacentHTML('beforeend',
    RANGOS_VENC.map((r, i) => `<option value="${i}">${r.label}</option>`).join(''));

  renderTodo();

  document.addEventListener('click', e => {
    if (!e.target.closest('.btn-download-wrap')) {
      const dd = document.getElementById('downloadDropdown');
      if (dd) dd.classList.remove('open');
    }
  });
});

function renderTodo() {
  renderKPIsGlobales();
  renderTipoChips();
  renderCharts();
  renderTablaConsolidada();
  lucide.createIcons();
}

// =================================================
// FILTRO GLOBAL
// =================================================
function getFilteredDocs(ignorarTipo = false, ignorarRango = false) {
  const resultado = [];
  ALERTAS_DATA.forEach(grupo => {
    if (!ignorarTipo && filtros.tipo !== 'todos' && grupo.tipo !== filtros.tipo) return;
    grupo.docs.forEach(doc => {
      const ops = opsDe(doc.nombre);
      if (filtros.estado !== 'todos' && doc.estado !== filtros.estado) return;
      if (filtros.rol    !== 'todos' && doc.rol    !== filtros.rol)    return;
      if (filtros.asignacion === 'con' && !ops.length) return;
      if (filtros.asignacion === 'sin' && ops.length) return;
      if (filtros.operacion !== 'todos' && !ops.some(o => o.opId === filtros.operacion)) return;
      if (filtros.estadoOp !== 'todos' && !ops.some(o => o.estado === filtros.estadoOp)) return;
      if (!ignorarRango && filtros.rango !== null && (doc.dias === null || !RANGOS_VENC[filtros.rango].test(doc.dias))) return;
      if (filtros.busqueda) {
        const q = filtros.busqueda;
        const match = [doc.nombre, doc.cod, doc.documento, doc.rol, grupo.tipo, ...ops.map(o => `${o.opId} ${o.buque}`)]
          .some(s => s.toLowerCase().includes(q));
        if (!match) return;
      }
      resultado.push({ ...doc, tipo: grupo.tipo, ops });
    });
  });
  // Orden por fecha de vencimiento: primero los sin registro y los más vencidos.
  return resultado.sort((a, b) => (a.dias ?? -Infinity) - (b.dias ?? -Infinity));
}

function aplicarFiltros() {
  filtros.estado   = document.getElementById('filtroEstado').value;
  filtros.rol      = document.getElementById('filtroRol').value;
  filtros.operacion  = document.getElementById('filtroOperacion').value;
  filtros.estadoOp   = document.getElementById('filtroEstadoOp').value;
  filtros.asignacion = document.getElementById('filtroAsignacion').value;
  const rango = document.getElementById('filtroRango').value;
  filtros.rango = rango === '' ? null : Number(rango);
  filtros.busqueda = document.getElementById('filtroBusqueda').value.toLowerCase().trim();
  paginaActual = 1;
  actualizarContadorAvanzados();
  renderTodo();
}

// Filtros del panel avanzado y su valor por defecto.
const IDS_FILTROS_AVANZADOS = ['filtroRol', 'filtroOperacion', 'filtroEstadoOp', 'filtroAsignacion', 'filtroRango'];
const valorPorDefecto = id => (id === 'filtroRango' ? '' : 'todos');

function abrirModalFiltrosAvanzados() {
  abrirModal('modalFiltrosAvanzados');
}

function aplicarFiltrosAvanzadosModal() {
  cerrarModal('modalFiltrosAvanzados');
  aplicarFiltros();
}

function limpiarFiltrosAvanzadosModal() {
  IDS_FILTROS_AVANZADOS.forEach(id => { document.getElementById(id).value = valorPorDefecto(id); });
  cerrarModal('modalFiltrosAvanzados');
  aplicarFiltros();
}

// Cuántos filtros avanzados están activos (se ve aunque el panel esté cerrado).
function actualizarContadorAvanzados() {
  const n = IDS_FILTROS_AVANZADOS.filter(id => document.getElementById(id).value !== valorPorDefecto(id)).length;
  const badge = document.getElementById('filtrosAvanzadosCount');
  document.getElementById('btnFiltrosAvanzados').classList.toggle('activo', n > 0);
  badge.textContent = n;
  badge.style.display = n > 0 ? '' : 'none';
}

function limpiarFiltros() {
  filtros.tipo = 'todos';
  document.getElementById('filtroEstado').value    = 'todos';
  document.getElementById('filtroBusqueda').value  = '';
  IDS_FILTROS_AVANZADOS.forEach(id => { document.getElementById(id).value = valorPorDefecto(id); });
  aplicarFiltros();
}

// =================================================
// KPIs GLOBALES
// =================================================
// Operaciones vigentes con al menos un hallazgo entre los documentos filtrados.
function operacionesEnRiesgo(docs) {
  const porOp = new Map();
  docs.forEach(d => d.ops.forEach(o => {
    if (!porOp.has(o.opId)) porOp.set(o.opId, { ...o, hallazgos: [] });
    porOp.get(o.opId).hallazgos.push(d);
  }));
  return [...porOp.values()].sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
}

function renderKPIsGlobales() {
  const docs    = getFilteredDocs();
  const vencido = docs.filter(d => d.estado === 'Vencido').length;
  const porVenc = docs.filter(d => d.estado === 'Por Vencer').length;

  const personalAfect = new Set(docs.map(d => d.nombre)).size;
  // Con un rol elegido, el universo es solo el personal de ese rol.
  const universo = PERSONAL_SISTEMA.filter(p => filtros.rol === 'todos' || p.rol === filtros.rol).length;
  const enRiesgo = operacionesEnRiesgo(docs).length;

  document.getElementById('kpiTotalVencido').textContent        = vencido;
  document.getElementById('kpiTotalPorVencer').textContent      = porVenc;
  document.getElementById('kpiPersonalAfectado').textContent    = personalAfect;
  document.getElementById('kpiSubPersonalAfectado').textContent = `De ${universo} trabajadores`;
  document.getElementById('kpiOpsRiesgo').textContent           = enRiesgo;
  document.getElementById('kpiSubOpsRiesgo').textContent        = `De ${ASIGNACIONES.totalVigentes} operaciones vigentes`;
}

// =================================================
// CHIPS POR TIPO (reemplazan las tarjetas por tipo: filtran la tabla)
// =================================================
function renderTipoChips() {
  const docs = getFilteredDocs(true);
  const grupos = ALERTAS_DATA.filter(g => g.docs.length);
  const chip = (key, label, n) =>
    `<button class="chip-summary${filtros.tipo === key ? ' active' : ''}" onclick="elegirTipo('${key}')">${label} <strong>${n}</strong></button>`;
  document.getElementById('tipoChips').innerHTML =
    chip('todos', 'Todos', docs.length) +
    grupos.map(g => chip(g.tipo, g.tipo, docs.filter(d => d.tipo === g.tipo).length)).join('');
}

function elegirTipo(tipo) {
  // Un segundo clic sobre el chip activo vuelve a Todos.
  filtros.tipo = filtros.tipo === tipo ? 'todos' : tipo;
  aplicarFiltros();
}

// =================================================
// GRÁFICOS Y OPERACIONES EN RIESGO
// =================================================
function renderCharts() {
  const docs = getFilteredDocs();
  renderOperacionesRiesgo(docs);
  renderVencimientosChart(getFilteredDocs(false, true));
  renderBarChart(docs);
}

function toggleChartNoData(canvasId, noDataId, isEmpty) {
  const canvas = document.getElementById(canvasId);
  const nodata = document.getElementById(noDataId);
  if (canvas) canvas.style.display = isEmpty ? 'none' : 'block';
  if (nodata) nodata.classList.toggle('visible', isEmpty);
}

// --- Lista: operaciones vigentes con personal en alerta ---
function renderOperacionesRiesgo(docs) {
  const ops = operacionesEnRiesgo(docs);
  const cont = document.getElementById('opsRiesgoLista');
  document.getElementById('opsRiesgoSubtitle').textContent =
    `${ops.length} de ${ASIGNACIONES.totalVigentes} operaciones vigentes · por fecha de inicio`;

  if (!ops.length) {
    cont.innerHTML = '<div class="ops-riesgo-vacio">Ninguna operación vigente tiene personal con alertas.</div>';
    return;
  }
  const fmt = iso => iso.split('-').reverse().join('/');
  cont.innerHTML = ops.slice(0, 5).map(o => {
    const peor = o.hallazgos.some(h => h.estado === 'Vencido') ? 'Vencido'
      : o.hallazgos.some(h => h.estado === 'Sin registro') ? 'Sin registro' : 'Por Vencer';
    const detalle = o.hallazgos.map(h => `${h.nombre}: ${h.documento}`).join('\n');
    return `<div class="ops-riesgo-item" title="${escHtml(detalle)}">
      <span class="ops-riesgo-dot" style="background:${COLORES_ESTADO[peor]}"></span>
      <div class="ops-riesgo-main">
        <div class="ops-riesgo-titulo">${escHtml(o.opId)} · ${escHtml(o.buque)}</div>
        <div class="ops-riesgo-sub">${fmt(o.fechaInicio)} · ${escHtml(o.estado)} · ${o.hallazgos.length} alerta${o.hallazgos.length !== 1 ? 's' : ''}</div>
      </div>
      <span class="badge ${claseEstado(peor)}">${peor}</span>
    </div>`;
  }).join('') + (ops.length > 5
    ? `<a class="ops-riesgo-mas" href="${RUTA_SEGUIMIENTO_OP}">+${ops.length - 5} operaciones más · ver Seguimiento</a>`
    : `<a class="ops-riesgo-mas" href="${RUTA_SEGUIMIENTO_OP}">Ver Seguimiento de operaciones</a>`);
}

// --- Barras horizontales: cuántos días faltan para vencer ---
const RANGOS_VENC = [
  { label: 'Vencidos',       test: d => d < 0,              color: '#DC2626' },
  { label: '0–7 días',       test: d => d >= 0 && d <= 7,   color: '#EA580C' },
  { label: '8–15 días',      test: d => d >= 8 && d <= 15,  color: '#F59E0B' },
  { label: '16–30 días',     test: d => d >= 16 && d <= 30, color: '#FBBF24' },
  { label: 'Más de 30 días', test: d => d > 30,             color: '#94A3B8' }
];

// Escribe la cantidad al final de cada barra (también el 0, atenuado).
const etiquetasFinBarra = {
  id: 'etiquetasFinBarra',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    ctx.save();
    ctx.font = '600 12px sans-serif';
    ctx.textBaseline = 'middle';
    meta.data.forEach((barra, i) => {
      const v = chart.data.datasets[0].data[i];
      ctx.fillStyle = v ? '#1F2937' : '#9CA3AF';
      ctx.fillText(v, barra.x + 8, barra.y);
    });
    ctx.restore();
  }
};

// Clic en una barra: filtra la tabla por ese rango; otro clic en la misma lo quita.
function elegirRangoVenc(i) {
  document.getElementById('filtroRango').value = filtros.rango === i ? '' : String(i);
  aplicarFiltros();
}

function renderVencimientosChart(docs) {
  if (CHART_VENC) { CHART_VENC.destroy(); CHART_VENC = null; }
  const conFecha = docs.filter(d => d.dias !== null);
  const sinFecha = docs.length - conFecha.length;
  const porRango = RANGOS_VENC.map(r => conFecha.filter(d => r.test(d.dias)));

  const subt = document.getElementById('vencSubtitle');
  subt.textContent = conFecha.length
    ? `${conFecha.length} documento${conFecha.length !== 1 ? 's' : ''} con fecha de vencimiento`
      + (sinFecha ? ` · ${sinFecha} sin registro` : '')
    : 'Días que faltan para vencer';
  if (filtros.rango !== null) subt.textContent += ` · tabla: ${RANGOS_VENC[filtros.rango].label} (clic para quitar)`;

  toggleChartNoData('chartVenc', 'noDataVenc', conFecha.length === 0);
  if (!conFecha.length) return;

  CHART_VENC = new Chart(document.getElementById('chartVenc'), {
    type: 'bar',
    data: {
      labels: RANGOS_VENC.map(r => r.label),
      datasets: [{
        label: 'Documentos',
        data: porRango.map(l => l.length),
        // Con un rango elegido, los demás se atenúan.
        backgroundColor: RANGOS_VENC.map((r, i) => filtros.rango === null || filtros.rango === i ? r.color : r.color + '40'),
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.9
      }]
    },
    plugins: [etiquetasFinBarra],
    options: {
      devicePixelRatio: window.devicePixelRatio || 2,
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { right: 24 } },
      onClick: (e, els) => { if (els.length) elegirRangoVenc(els[0].index); },
      onHover: (e, els) => { e.native.target.style.cursor = els.length ? 'pointer' : 'default'; },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: items => items[0].label,
            label: c => ` ${c.raw} documento${c.raw !== 1 ? 's' : ''}`,
            afterBody: items => {
              const lista = porRango[items[0].dataIndex];
              const filas = lista.slice(0, 5).map(d => `• ${d.nombre} — ${d.documento}`);
              if (lista.length > 5) filas.push(`+${lista.length - 5} más`);
              return filas;
            }
          }
        }
      },
      scales: {
        x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, border: { display: false }, ticks: { precision: 0, stepSize: 1, font: { size: 10 }, color: '#6B7280' } },
        y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: '#3A3A3A' } }
      }
    }
  });
}

// --- Barras horizontales: personal con más alertas ---
function getBarPersonaData(docs) {
  const personas = {};
  docs.forEach(d => {
    if (!personas[d.nombre]) personas[d.nombre] = { 'Vencido': 0, 'Por Vencer': 0, 'Sin registro': 0 };
    personas[d.nombre][d.estado]++;
  });
  return Object.entries(personas)
    .map(([nombre, v]) => ({ nombre, ...v, total: v['Vencido'] + v['Por Vencer'] + v['Sin registro'] }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function renderBarChart(docs) {
  if (CHART_BARH) { CHART_BARH.destroy(); CHART_BARH = null; }
  const filas = getBarPersonaData(docs);

  toggleChartNoData('chartBarH', 'noDataBar', filas.length === 0);
  if (!filas.length) return;

  CHART_BARH = new Chart(document.getElementById('chartBarH'), {
    type: 'bar',
    data: {
      labels: filas.map(f => f.nombre),
      datasets: ['Vencido', 'Por Vencer', 'Sin registro'].map(estado => ({
        label: estado,
        data: filas.map(f => f[estado]),
        backgroundColor: COLORES_ESTADO[estado],
        borderSkipped: false
      }))
    },
    options: {
      devicePixelRatio: window.devicePixelRatio || 2,
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top', labels: { boxWidth: 10, font: { size: 11 }, usePointStyle: true, padding: 14 } },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.x}` } }
      },
      scales: {
        x: { stacked: true, beginAtZero: true, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { precision: 0, stepSize: 1, font: { size: 10 }, color: '#6B7280' } },
        y: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 }, color: '#3A3A3A' } }
      }
    }
  });
}

// =================================================
// TABLA CONSOLIDADA
// =================================================
const textoDias = (d, largo) => {
  if (d.dias === null) return '—';
  return d.dias < 0
    ? `${Math.abs(d.dias)}${largo ? ' días' : 'd'} vencido`
    : `${d.dias}${largo ? ' días' : 'd'} a vencer`;
};

const fechaCorta = iso => iso.split('-').reverse().slice(0, 2).join('/');

function celdaDoble(linea1, linea2, clase2 = '', ayuda = '') {
  return `<span class="celda-doble"${ayuda ? ` title="${escHtml(ayuda)}"` : ''}>
    <span class="celda-doble-1">${linea1}</span><span class="celda-doble-2 ${clase2}">${linea2}</span></span>`;
}

// Primera operación vigente de la persona, con sus fechas y su estado; el tooltip lista todas.
function celdaOperaciones(d) {
  if (!d.ops.length) return '<span class="celda-sin-op">Sin operación vigente</span>';
  const o = d.ops[0];
  const todas = d.ops.map(x => `${x.opId} · ${x.buque} (${fechaCorta(x.fechaInicio)}–${fechaCorta(x.fechaFin)}) · ${x.estado}`).join('\n');
  const mas = d.ops.length > 1 ? `<span class="celda-multi-mas">+${d.ops.length - 1}</span>` : '';
  return celdaDoble(
    `<span class="celda-multi-txt">${escHtml(o.opId)} · ${escHtml(o.buque)}</span>${mas}`,
    `${fechaCorta(o.fechaInicio)}–${fechaCorta(o.fechaFin)} · ${escHtml(o.estado)}`,
    '', todas);
}

function celdaVencimiento(d) {
  if (d.dias === null) return '<span class="celda-sin-op">Sin fecha</span>';
  const txt = d.dias < 0 ? `Venció hace ${-d.dias} d` : d.dias === 0 ? 'Vence hoy' : `Vence en ${d.dias} d`;
  return celdaDoble(d.fin, txt, d.estado === 'Vencido' ? 'txt-riesgo' : 'txt-aviso', `Vigencia: ${d.inicio} – ${d.fin}`);
}

function accionesFila(d) {
  if (d.estado === 'Sin registro') {
    return `<div class="opciones">
      <a class="btn-accion btn-icon-reg" title="Registrar información profesional" href="${RUTA_INFO_PROFESIONAL}">
        <i data-lucide="user-plus" width="14" height="14"></i>
      </a></div>`;
  }
  return `<div class="opciones">
    <button class="btn-accion btn-icon-dl" title="Descargar documento" onclick="descargarDoc('${d.cod}', '${d.nombre}')">
      <i data-lucide="download" width="14" height="14"></i>
    </button>
    <button class="btn-accion btn-icon-hist" title="Historial del documento" onclick="verHistorial('${d.cod}', '${d.nombre}')">
      <i data-lucide="history" width="14" height="14"></i>
    </button>
  </div>`;
}

function renderTablaConsolidada() {
  const docs        = getFilteredDocs();
  const total       = docs.length;
  const totalPag    = Math.max(1, Math.ceil(total / FILAS_POR_PAGINA));
  if (paginaActual > totalPag) paginaActual = 1;

  const inicio  = (paginaActual - 1) * FILAS_POR_PAGINA;
  const fin     = Math.min(inicio + FILAS_POR_PAGINA, total);
  const slice   = docs.slice(inicio, fin);

  const tbody = document.getElementById('tablaBody');

  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--gray-400)">Sin resultados para los filtros aplicados</td></tr>`;
  } else {
    tbody.innerHTML = slice.map((d, i) => `<tr>
        <td>${inicio + i + 1}</td>
        <td>${celdaDoble(escHtml(d.nombre), escHtml(d.rol))}</td>
        <td>${celdaDoble(escHtml(d.documento), escHtml(d.tipo))}</td>
        <td>${celdaOperaciones(d)}</td>
        <td>${celdaVencimiento(d)}</td>
        <td><span class="badge ${claseEstado(d.estado)}"><span class="badge-dot"></span>${d.estado}</span></td>
        <td>${accionesFila(d)}</td>
      </tr>`).join('');
  }

  document.getElementById('paginacionInfo').textContent = total > 0
    ? `Mostrando ${inicio + 1}–${fin} de ${total} registros`
    : 'Sin registros';

  renderPaginacion(totalPag);
  lucide.createIcons();
}

function renderPaginacion(totalPag) {
  const cont = document.getElementById('paginacionBtns');
  if (totalPag <= 1) { cont.innerHTML = ''; return; }

  let html = `<button class="pag-btn" onclick="cambiarPagina(${paginaActual - 1})"
    ${paginaActual === 1 ? 'disabled' : ''}>‹</button>`;

  const start = Math.max(1, paginaActual - 2);
  const end   = Math.min(totalPag, start + 4);

  for (let p = start; p <= end; p++) {
    html += `<button class="pag-btn ${p === paginaActual ? 'active' : ''}"
      onclick="cambiarPagina(${p})">${p}</button>`;
  }

  html += `<button class="pag-btn" onclick="cambiarPagina(${paginaActual + 1})"
    ${paginaActual === totalPag ? 'disabled' : ''}>›</button>`;

  cont.innerHTML = html;
}

function cambiarPagina(p) {
  const totalPag = Math.max(1, Math.ceil(getFilteredDocs().length / FILAS_POR_PAGINA));
  if (p < 1 || p > totalPag) return;
  paginaActual = p;
  renderTablaConsolidada();
}

function cambiarFilasPorPagina(n) {
  FILAS_POR_PAGINA = n;
  paginaActual = 1;
  renderTablaConsolidada();
}

// =================================================
// DOWNLOAD DROPDOWN
// =================================================
function toggleDownloadDropdown() {
  document.getElementById('downloadDropdown').classList.toggle('open');
}

// =================================================
// EXPORTACIÓN
// =================================================
const EXPORT_COLUMNAS = ['N°', 'Trabajador', 'Rol', 'Tipo', 'Documento', 'Operaciones asignadas', 'Inicio vigencia', 'Vencimiento', 'Días', 'Estado'];
const EXPORT_COL_ESTADO = 9;

function filasExportacion() {
  return getFilteredDocs().map((d, i) => [
    i + 1, d.nombre, d.rol, d.tipo, d.documento,
    d.ops.map(o => `${o.opId} (${o.buque}, ${fechaCorta(o.fechaInicio)}–${fechaCorta(o.fechaFin)}, ${o.estado})`).join('; ') || 'Sin operación vigente',
    d.inicio, d.fin, textoDias(d, true), d.estado
  ]);
}

function exportarExcel() {
  document.getElementById('downloadDropdown').classList.remove('open');
  const filas = filasExportacion();
  if (!filas.length) { mostrarToast('No hay registros para exportar con los filtros aplicados.'); return; }

  const csv = [EXPORT_COLUMNAS, ...filas]
    .map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom  = '﻿'; // BOM para que Excel abra UTF-8 correctamente
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'alertas-documentos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  mostrarToast('Exportación Excel descargada correctamente.');
}

function exportarPDF() {
  document.getElementById('downloadDropdown').classList.remove('open');
  const filas = filasExportacion();
  if (!filas.length) { mostrarToast('No hay registros para exportar con los filtros aplicados.'); return; }

  const celdaEstado = e => `<span class="${e === 'Vencido' ? 'badge-vencida' : e === 'Por Vencer' ? 'badge-por-vencer' : 'badge-gris'}">${e}</span>`;
  const cuerpo = filas.map(f => `<tr>${f.map((v, i) => `<td>${i === EXPORT_COL_ESTADO ? celdaEstado(v) : escHtml(v)}</td>`).join('')}</tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Alertas – Documento Personal</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 4px; }
      p    { margin: 0 0 10px; color: #555; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 6px 8px; text-align: left;
             font-size: 8px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 6px 8px; border-bottom: 1px solid #eee; }
      .badge-vencida  { background: #FEE2E2; color: #991B1B; padding: 2px 8px; border-radius: 20px; }
      .badge-por-vencer{ background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 20px; }
      .badge-gris     { background: #E5E7EB; color: #4B5563; padding: 2px 8px; border-radius: 20px; }
      @media print { @page { size: landscape; margin: 12mm; } }
    </style>
  </head><body>
    <h2>Alertas – Documento Personal</h2>
    <p>${filas.length} registros · generado el ${new Date().toLocaleDateString('es-PE')}</p>
    <table>
      <thead><tr>${EXPORT_COLUMNAS.map(c => `<th>${c}</th>`).join('')}</tr></thead>
      <tbody>${cuerpo}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=1100,height=700');
  if (!win) { mostrarToast('El navegador bloqueó la ventana. Permite las ventanas emergentes.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

// =================================================
// ACCIONES DE FILA
// =================================================
function descargarDoc(cod, nombre) {
  mostrarToast(`Descargando documento de ${nombre} (${cod})…`);
}

function verHistorial(cod, nombre) {
  let docEncontrado = null;
  for (const tipo of ALERTAS_DATA) {
    const d = tipo.docs.find(x => x.cod === cod);
    if (d) { docEncontrado = d; break; }
  }

  document.getElementById('historialTitulo').textContent = `Historial del documento — ${nombre}`;

  const tbody = document.getElementById('historialTbody');
  if (!docEncontrado) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:28px;color:var(--gray-400)">Sin historial disponible</td></tr>`;
  } else {
    document.getElementById('historialTitulo').textContent = `Historial — ${docEncontrado.documento} · ${nombre}`;
    tbody.innerHTML = docEncontrado.registros.map(r => `<tr>
        <td>${r.inicio}</td>
        <td>${r.fin}</td>
        <td>${r.actualizado}</td>
      </tr>`).join('');
  }

  abrirModal('modalHistorial');
}
