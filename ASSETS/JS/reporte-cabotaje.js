let lineChart = null;
let pieChart  = null;
let barChart  = null;
let periodoTendencia = 'mes';
let pagina    = 1;
let PAGE_SIZE      = 10;
const MESES_ORD    = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const ANIO_ACTUAL       = new Date().getFullYear();
const MES_ACTUAL        = new Date().getMonth();
const MES_ACTUAL_NOMBRE = MESES_ORD[MES_ACTUAL];

const YEAR_COLORS = [
  { border:'#00B4D8', fill:'rgba(0,180,216,.10)'  },
  { border:'#1E3A5F', fill:'rgba(30,58,95,.10)'   },
  { border:'#F5C400', fill:'rgba(245,196,0,.10)'  },
  { border:'#22C55E', fill:'rgba(34,197,94,.10)'  },
];

// 14 colores anclados a la paleta del sistema
const TERMINAL_COLORS = [
  '#00B4D8','#F5C400','#1E3A5F','#22C55E','#E53E3E',
  '#0096B7','#D4A900','#2E5C96','#16A34A','#B91C1C',
  '#6B7280','#F59E0B','#0EA5E9','#374151',
];

// =================================================
// DATOS DEL SISTEMA
// Los viajes salen de las Operaciones registradas en Operaciones > Seguimiento
// de Operaciones (seguimiento-operaciones.js) y de la Nominación a la que
// pertenece cada una (servicios.js): una fila por cliente de la nominación, así
// que una nominación compartida aparece una vez por cada cliente. Las
// operaciones canceladas no se reportan.
// =================================================
const OPERACION_ETIQUETA = { Loading: 'CARGA', Discharging: 'DESCARGA', 'STS Transfer': 'STS', Bunkering: 'BUNKERING' };

// Cada Tipo de Operación registra sus horarios con claves distintas; el cronograma
// las unifica en las 8 columnas del reporte.
const CLAVES_CRONOGRAMA = {
  eta:    ['eta'],
  arriba: ['arriba', 'arriboZonaSts'],
  fondea: ['fondea'],
  amarre: ['amarre', 'amarreBuques'],
  inicia: ['iniciaCarga', 'iniciaDescarga', 'iniciaTransferencia', 'iniciaSuministro'],
  termina: ['terminaCarga', 'terminaDescarga', 'terminaTransferencia', 'terminaSuministro'],
  firma:  ['firmaDocumentos'],
  zarpe:  ['zarpe']
};

function formatoHorarioCabotaje(valor) {
  if (!valor) return '—';
  const [fecha, hora] = valor.split('T');
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}${hora ? ' ' + hora : ''}`;
}

function cronogramaDeOperacion(op) {
  const horarios = op.horarios || {};
  const tl = {};
  Object.entries(CLAVES_CRONOGRAMA).forEach(([col, claves]) => {
    const clave = claves.find(k => horarios[k] && horarios[k].valor);
    tl[col] = formatoHorarioCabotaje(clave ? horarios[clave].valor : '');
  });
  return tl;
}

function construirCabotajeData() {
  const nominaciones = srvCargarNominaciones();
  return opCargarOperaciones()
    .filter(op => op.estado !== 'Cancelado')
    .sort((x, y) => (y.fechaInicio || '').localeCompare(x.fechaInicio || ''))
    .map(op => {
      const nom = nominaciones.find(n => n.id === op.nominacionId);
      const clientes = nom && nom.clientes.length ? nom.clientes.map(c => c.nombre) : ['—'];
      const fecha = new Date(op.fechaInicio + 'T00:00:00');
      const personal = [
        op.supervisor ? `${op.supervisor} (Sup.)` : '',
        ...(op.personal || []).map(p => p.nombre)
      ].filter(Boolean).join(' · ') || 'Sin personal asignado';

      return {
        opId: op.id,
        viajes: clientes.map(cliente => ({
          cliente,
          per: op.per,
          viaje: op.nroViaje || '—',
          buque: op.buque || '—',
          operacion: OPERACION_ETIQUETA[op.tipoOperacion] || (op.tipoOperacion || '—').toUpperCase(),
          producto: (op.productos || []).join(', ') || '—',
          terminal: op.terminalDestino || op.terminalInicial || '—',
          personal,
          compartido: clientes.length > 1,
          mes: MESES_ORD[fecha.getMonth()],
          anio: fecha.getFullYear(),
          fechaInicio: op.fechaInicio,
          fechaFin: op.fechaFinReal || op.fechaFin || op.fechaInicio,
          tl: cronogramaDeOperacion(op)
        }))
      };
    });
}

const CABOTAJE_DATA = construirCabotajeData();

// =================================================
// STATE
// =================================================
let filteredData = [];

// =================================================
// INIT
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  // Defaults globales Chart.js
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size   = 11;
  Chart.defaults.color       = '#6B7280';
  Chart.defaults.plugins.tooltip.backgroundColor = '#111111';
  Chart.defaults.plugins.tooltip.titleColor      = '#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor       = '#E5E7EB';
  Chart.defaults.plugins.tooltip.padding         = 10;
  Chart.defaults.plugins.tooltip.cornerRadius    = 8;
  Chart.defaults.plugins.tooltip.displayColors   = false;

  poblarFiltrosDropdowns();
  aplicarFiltros();
  document.addEventListener('click', e => {
    if (!e.target.closest('.btn-download-wrap'))
      document.getElementById('downloadDropdown').classList.remove('open');
  });
});

function poblarFiltrosDropdowns() {
  const todos = CABOTAJE_DATA.flatMap(op => op.viajes);

  const anios = [...new Set(todos.map(v => v.anio))].sort();
  const selAnio = document.getElementById('filterAnio');
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = 'Todos los años';
  selAnio.appendChild(optTodos);
  anios.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    selAnio.appendChild(opt);
  });

  const terminales = [...new Set(todos.map(v => v.terminal))].sort();
  const selTerm = document.getElementById('filterTerminal');
  terminales.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    selTerm.appendChild(opt);
  });

  // Sin pre-selección: mostrar todos los datos al cargar
}

// =================================================
// FILTROS
// =================================================
function aplicarFiltros() {
  const q        = document.getElementById('searchCabotaje').value.toLowerCase().trim();
  const mes      = document.getElementById('filterMes').value;
  const anio     = parseInt(document.getElementById('filterAnio').value) || 0;
  const terminal = document.getElementById('filterTerminal').value;

  filteredData = CABOTAJE_DATA.map(op => {
    const viajes = op.viajes.filter(v => {
      const matchQ = !q || [v.cliente, v.per, v.viaje, v.buque, v.operacion, v.producto, v.terminal, v.personal].some(s => s.toLowerCase().includes(q));
      const matchM = !mes      || v.mes      === mes;
      const matchA = !anio     || v.anio     === anio;
      const matchT = !terminal || v.terminal === terminal;
      return matchQ && matchM && matchA && matchT;
    });
    return { opId: op.opId, viajes };
  }).filter(op => op.viajes.length > 0);

  pagina = 1;
  actualizarKPIs();
  actualizarGraficos();
  renderTabla();
}

// =================================================
// KPIs
// =================================================
function actualizarKPIs() {
  const todos = filteredData.flatMap(op => op.viajes);
  document.getElementById('kpiCliente').textContent                = [...new Set(todos.map(v => v.cliente))].length;
  document.getElementById('kpiViajes').textContent                 = todos.length;
  document.getElementById('kpiCompartidos').textContent            = todos.filter(v => v.compartido).length;
  document.getElementById('infoTerminalesActivosKPI').textContent  = [...new Set(todos.map(v => v.terminal))].length;
}

// =================================================
// GRÁFICOS
// =================================================
function actualizarGraficos() {
  const todos = filteredData.flatMap(op => op.viajes);
  pintarLineaTendencia();
  pintarPastelTerminal(todos);
  pintarBarrasClientes(todos);
}

// Parsea "dd/mm/yyyy hh:mm" → Date (solo fecha, sin hora)
function parseFechaTL(str) {
  const [d, m, y] = str.split(' ')[0].split('/').map(Number);
  return new Date(y, m - 1, d);
}

// --- Línea: mensual = días activos por operación | anual = meses del año actual ---
function pintarLineaTendencia() {
  const ctx   = document.getElementById('chartLinea').getContext('2d');
  const todos = CABOTAJE_DATA.flatMap(op => op.viajes);
  let labels, data, color, subtitulo;

  if (periodoTendencia === 'mes') {
    const diasEnMes  = new Date(ANIO_ACTUAL, MES_ACTUAL + 1, 0).getDate();
    const viajesMes  = todos.filter(v => v.anio === ANIO_ACTUAL && v.mes === MES_ACTUAL_NOMBRE);
    labels = Array.from({ length: diasEnMes }, (_, i) => i + 1);
    // Cuenta operaciones activas cada día (inicio → fin), no solo el día de inicio
    data = labels.map(dia => {
      const diaDate = new Date(ANIO_ACTUAL, MES_ACTUAL, dia);
      const activas = viajesMes.filter(v => {
        const inicio = new Date(v.fechaInicio + 'T00:00:00');
        const fin    = new Date(v.fechaFin + 'T00:00:00');
        return diaDate >= inicio && diaDate <= fin;
      }).length;
      return activas > 0 ? activas : null;
    });
    color     = '#00B4D8';
    subtitulo = `${MES_ACTUAL_NOMBRE} ${ANIO_ACTUAL} · operaciones activas por día`;
  } else {
    const conteo = {};
    todos
      .filter(v => v.anio === ANIO_ACTUAL)
      .forEach(v => { conteo[v.mes] = (conteo[v.mes] || 0) + 1; });
    labels    = MESES_CORTOS;
    data      = MESES_ORD.map(m => conteo[m] ?? null);
    color     = '#F5C400';
    subtitulo = `Año ${ANIO_ACTUAL} · operaciones por mes`;
  }

  const sub = document.getElementById('lineaSubtitle');
  if (sub) sub.textContent = subtitulo;

  // Gradiente vertical: opaco arriba → transparente abajo
  const canvasH = ctx.canvas.parentElement.clientHeight || 280;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasH);
  if (periodoTendencia === 'mes') {
    gradient.addColorStop(0, 'rgba(0,180,216,0.22)');
    gradient.addColorStop(1, 'rgba(0,180,216,0)');
  } else {
    gradient.addColorStop(0, 'rgba(245,196,0,0.22)');
    gradient.addColorStop(1, 'rgba(245,196,0,0)');
  }

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Operaciones activas',
        data,
        borderColor: color,
        backgroundColor: gradient,
        fill: true,
        tension: .45,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius:      periodoTendencia === 'mes' ? 3 : 5,
        pointHoverRadius: periodoTendencia === 'mes' ? 6 : 7,
        spanGaps: true,
        borderWidth: 2.5,
      }]
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: c => {
              const lbl = c[0].label;
              return periodoTendencia === 'mes'
                ? `Día ${lbl} · ${MES_ACTUAL_NOMBRE} ${ANIO_ACTUAL}`
                : `${lbl} ${ANIO_ACTUAL}`;
            },
            label: c => ` ${c.raw ?? 0} operación${(c.raw ?? 0) !== 1 ? 'es activas' : ' activa'}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { padding: 6, maxTicksLimit: periodoTendencia === 'mes' ? 10 : 12, maxRotation: 0 },
        },
        y: {
          beginAtZero: true,
          grace: '15%',
          ticks: { precision: 0, padding: 6 },
          grid: { color: 'rgba(0,0,0,0.06)', drawTicks: false },
          border: { display: false },
        },
      },
      animation: { duration: 500, easing: 'easeInOutQuart' },
    }
  });
}

function cambiarPeriodoTendencia(periodo, btn) {
  periodoTendencia = periodo;
  document.querySelectorAll('.toggle-period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  pintarLineaTendencia();
}

// --- Doughnut: operaciones por terminal (hasta 14 terminales) ---
function pintarPastelTerminal(viajes) {
  const ctx    = document.getElementById('chartPastel').getContext('2d');
  const conteo = {};
  viajes.forEach(v => { conteo[v.terminal] = (conteo[v.terminal] || 0) + 1; });

  const sorted = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(e => e[0]);
  const data   = sorted.map(e => e[1]);
  const total  = data.reduce((a, b) => a + b, 0);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: TERMINAL_COLORS.slice(0, labels.length),
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 8,
        hoverBorderWidth: 2,
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          position: labels.length > 8 ? 'right' : 'bottom',
          labels: {
            font: { size: labels.length > 8 ? 9.5 : 10.5 },
            boxWidth: 10,
            padding: labels.length > 8 ? 5 : 8,
            usePointStyle: true,
            pointStyle: 'circle',
            generateLabels: chart => {
              const ds = chart.data.datasets[0];
              return chart.data.labels.map((lbl, i) => {
                const pct = total > 0 ? Math.round(ds.data[i] / total * 100) : 0;
                return {
                  text: `${lbl} · ${pct}%`,
                  fillStyle: ds.backgroundColor[i],
                  strokeStyle: '#fff',
                  lineWidth: 1,
                  pointStyle: 'circle',
                  index: i,
                  hidden: false,
                };
              });
            },
          },
        },
        tooltip: {
          callbacks: {
            label: c => {
              const pct = total > 0 ? Math.round(c.raw / total * 100) : 0;
              return ` ${c.raw} operaciones · ${pct}%`;
            },
          },
        },
      },
      animation: { duration: 500, easing: 'easeInOutQuart' },
    }
  });
}

// --- Barras: top 5 clientes ---
function pintarBarrasClientes(viajes) {
  const ctx    = document.getElementById('chartBarras').getContext('2d');
  const conteo = {};
  viajes.forEach(v => { conteo[v.cliente] = (conteo[v.cliente] || 0) + 1; });
  const top    = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = top.map(t => t[0]);
  const data   = top.map(t => t[1]);

  // Degradado: primer lugar en yellow, resto con opacidad decreciente
  const barColors = data.map((_, i) =>
    i === 0 ? '#F5C400' : i === 1 ? '#D4A900' : `rgba(245,196,0,${Math.max(0.35, 0.85 - i * 0.12)})`
  );

  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Operaciones',
        data,
        backgroundColor: barColors,
        borderRadius: 6,
        maxBarThickness: 32,
      }]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.raw} operaciones` } },
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0, padding: 6 }, grid: { color: 'rgba(0,0,0,0.04)', drawTicks: false }, border: { display: false } },
        y: { grid: { display: false }, ticks: { padding: 8, font: { weight: '600' } } },
      },
      animation: { duration: 500, easing: 'easeInOutQuart' },
    }
  });
}

// =================================================
// TABLA + PAGINACIÓN
// =================================================
function renderTabla() {
  const tbody = document.getElementById('tbodyCabotaje');
  tbody.innerHTML = '';

  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--gray-400)">Sin resultados para los filtros aplicados</td></tr>';
    const infoVacio = document.getElementById('pagInfoCabotaje');
    if (infoVacio) infoVacio.textContent = 'Sin registros';
    renderPaginacion(0);
    return;
  }

  const inicio  = (pagina - 1) * PAGE_SIZE;
  const pagData = filteredData.slice(inicio, inicio + PAGE_SIZE);

  pagData.forEach(op => {
    const hdr = document.createElement('tr');
    hdr.className = 'op-group-header';
    hdr.innerHTML = `<td colspan="9">N° Operación: ${op.opId}</td>`;
    tbody.appendChild(hdr);

    op.viajes.forEach((v, idx) => {
      const rowId = `${op.opId}-${idx}`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.cliente}</td>
        <td>${v.per}</td>
        <td>${v.viaje}</td>
        <td>${v.buque}</td>
        <td>${v.operacion}</td>
        <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${v.producto}">${v.producto}</td>
        <td>${v.terminal}</td>
        <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${v.personal}">${v.personal}</td>
        <td>
          <button class="btn-expand" id="btn-${rowId}" onclick="toggleTimeline('${rowId}')" title="Ver cronograma">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>
          </button>
        </td>`;
      tbody.appendChild(tr);

      const tlRow = document.createElement('tr');
      tlRow.className = 'timeline-row';
      tlRow.id = `tl-${rowId}`;
      tlRow.innerHTML = `
        <td colspan="9">
          <div class="timeline-inner">
            <div class="timeline-grid">
              <div class="tl-head">
                <span>ETA</span><span>ARRIBA</span><span>FONDEA</span>
                <span>AMARRE INICIO</span><span>INICIA</span><span>TERMINA</span>
                <span>FIRMA DOC.</span><span>ZARPE</span>
              </div>
              <div class="tl-body">
                <span>${v.tl.eta}</span><span>${v.tl.arriba}</span><span>${v.tl.fondea}</span>
                <span>${v.tl.amarre}</span><span>${v.tl.inicia}</span><span>${v.tl.termina}</span>
                <span>${v.tl.firma}</span><span>${v.tl.zarpe}</span>
              </div>
            </div>
          </div>
        </td>`;
      tbody.appendChild(tlRow);
    });
  });

  const infoEl = document.getElementById('pagInfoCabotaje');
  if (infoEl) {
    const total = filteredData.length;
    const inicio = (pagina - 1) * PAGE_SIZE;
    const fin    = Math.min(pagina * PAGE_SIZE, total);
    infoEl.textContent = total > 0
      ? `Mostrando ${inicio + 1}–${fin} de ${total} registros`
      : 'Sin registros';
  }
  renderPaginacion(filteredData.length);
}

function renderPaginacion(total) {
  const wrap      = document.getElementById('paginationWrap');
  if (!wrap) return;
  const totalPags = Math.ceil(total / PAGE_SIZE);
  if (totalPags <= 1) { wrap.innerHTML = ''; return; }

  let html = `<button class="pag-btn pag-btn-nav" onclick="irPagina(${pagina - 1})"
    ${pagina === 1 ? 'disabled' : ''}>‹</button>`;

  const start = Math.max(1, pagina - 2);
  const end   = Math.min(totalPags, start + 4);
  for (let p = start; p <= end; p++) {
    html += `<button class="pag-btn ${p === pagina ? 'active' : ''}"
      onclick="irPagina(${p})">${p}</button>`;
  }
  html += `<button class="pag-btn pag-btn-nav" onclick="irPagina(${pagina + 1})"
    ${pagina === totalPags ? 'disabled' : ''}>›</button>`;

  wrap.innerHTML = html;
}

function irPagina(n) {
  const totalPags = Math.ceil(filteredData.length / PAGE_SIZE);
  if (n < 1 || n > totalPags) return;
  pagina = n;
  renderTabla();
  document.querySelector('.table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cambiarFilasCab(n) {
  PAGE_SIZE = n;
  pagina = 1;
  renderTabla();
}

function toggleTimeline(rowId) {
  const tlRow = document.getElementById(`tl-${rowId}`);
  const btn   = document.getElementById(`btn-${rowId}`);
  const open  = tlRow.classList.toggle('open');
  btn.classList.toggle('expanded', open);
}

// =================================================
// LIMPIAR FILTROS
// =================================================
function limpiarFiltros() {
  document.getElementById('searchCabotaje').value = '';
  document.getElementById('filterMes').value      = '';
  document.getElementById('filterAnio').value     = '';
  document.getElementById('filterTerminal').value = '';
  aplicarFiltros();
}

// =================================================
// DOWNLOAD DROPDOWN
// =================================================
function toggleDownloadDropdown() {
  document.getElementById('downloadDropdown').classList.toggle('open');
}

function descargarArchivo(tipo) {
  mostrarToast(`Descarga en formato ${tipo.toUpperCase()} iniciada`);
  document.getElementById('downloadDropdown').classList.remove('open');
}
