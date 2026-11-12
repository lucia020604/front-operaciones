let lineChart = null;
let pieChart  = null;
let barChart  = null;
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

// Cada operación registra sus propias actividades (según su Tipo de Operación:
// Carga, Descarga, STS, Bunkering; ver OP_HORARIOS_POR_TIPO en
// seguimiento-operaciones.js). El cronograma muestra solo las actividades que la
// operación ya tiene registradas (con fecha/hora), con el nombre y el orden de su
// tipo; las pendientes no aparecen.
function etiquetaActividad(clave) {
  for (const tipo of ['Loading', 'Discharging', 'STS Transfer', 'Bunkering']) {
    const def = opHorariosDefsPorTipo(tipo).find(d => d.key === clave);
    if (def) return def.label;
  }
  return clave.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

function formatoHorarioCabotaje(valor) {
  if (!valor) return '—';
  const [fecha, hora] = valor.split('T');
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}${hora ? ' ' + hora : ''}`;
}

function cronogramaDeOperacion(op) {
  const horarios = op.horarios || {};
  const orden = opHorariosDefsPorTipo(op.tipoOperacion).map(d => d.key);
  const posicion = k => orden.indexOf(k) === -1 ? orden.length : orden.indexOf(k);
  return Object.keys(horarios)
    .filter(k => horarios[k] && horarios[k].valor)
    .sort((x, y) => posicion(x) - posicion(y))
    .map(k => ({
      label: etiquetaActividad(k),
      valor: formatoHorarioCabotaje(horarios[k].valor),
      comentario: horarios[k].comentario || ''
    }));
}

// Meses ('YYYY-MM') que abarca una operación: una que cruza de un mes a otro
// aparece en el reporte de ambos.
function periodosDeOperacion(inicioISO, finISO) {
  const periodos = [];
  const [yi, mi] = inicioISO.split('-').map(Number);
  const [yf, mf] = (finISO < inicioISO ? inicioISO : finISO).split('-').map(Number);
  for (let y = yi, m = mi; y < yf || (y === yf && m <= mf); m === 12 ? (y++, m = 1) : m++) {
    periodos.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  return periodos;
}

// "Supe → Callao"; sin destino o con el mismo puerto, solo el puerto.
function rutaDePuertos(origen, destino) {
  if (origen && destino && origen !== destino) return `${origen} → ${destino}`;
  return origen || destino || '—';
}

function construirCabotajeData() {
  const nominaciones = srvCargarNominaciones();
  return opCargarOperaciones()
    .filter(op => op.estado !== 'Cancelado' && op.fechaInicio)
    .sort((x, y) => (y.fechaInicio || '').localeCompare(x.fechaInicio || ''))
    .map(op => {
      const nom = nominaciones.find(n => n.id === op.nominacionId);
      const clientes = nom && nom.clientes.length ? nom.clientes.map(c => c.nombre) : ['—'];
      const fecha = new Date(op.fechaInicio + 'T00:00:00');
      const personal = [
        op.supervisor ? `${op.supervisor} (Sup.)` : '',
        ...(op.personal || []).map(p => p.nombre)
      ].filter(Boolean);
      const personalTexto = personal.join(' · ') || 'Sin personal asignado';

      return {
        opId: op.id,
        viajes: clientes.map(cliente => ({
          cliente,
          clientes,
          per: op.per,
          viaje: op.nroViaje || '—',
          buque: op.buque || '—',
          operacion: OPERACION_ETIQUETA[op.tipoOperacion] || (op.tipoOperacion || '—').toUpperCase(),
          producto: (op.productos || []).join(', ') || '—',
          productos: op.productos || [],
          // Terminal Inicial / Destino de una operación son puertos (Callao, Pisco, Supe…).
          origen: op.terminalInicial || '',
          destino: op.terminalDestino || '',
          puertos: [...new Set([op.terminalInicial, op.terminalDestino].filter(Boolean))],
          ruta: rutaDePuertos(op.terminalInicial, op.terminalDestino),
          terminalNombre: op.terminal || '—',
          muelle: op.muelle || '—',
          personal: personalTexto,
          personalLista: personal,
          compartido: clientes.length > 1,
          mes: MESES_ORD[fecha.getMonth()],
          anio: fecha.getFullYear(),
          fechaInicio: op.fechaInicio,
          fechaFin: op.fechaFinReal || op.fechaFin || op.fechaInicio,
          periodos: periodosDeOperacion(op.fechaInicio, op.fechaFinReal || op.fechaFin || op.fechaInicio),
          opId: op.id,
          estado: op.estado || '—',
          cronograma: cronogramaDeOperacion(op)
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

  const anios = [...new Set(todos.flatMap(v => v.periodos.map(p => Number(p.slice(0, 4)))))].sort();
  const selAnio = document.getElementById('filterAnio');
  selAnio.innerHTML = '<option value="">Todos los años</option>' + anios.map(a => `<option value="${a}">${a}</option>`).join('');

  const puertos = [...new Set(todos.flatMap(v => v.puertos))].sort();
  const selTerm = document.getElementById('filterTerminal');
  selTerm.innerHTML = '<option value="">Todos los puertos</option>' + puertos.map(t => `<option value="${t}">${t}</option>`).join('');

  const llenar = (id, primera, valores) => {
    document.getElementById(id).innerHTML = `<option value="">${primera}</option>` +
      valores.map(x => `<option value="${escHtml(x)}">${escHtml(x)}</option>`).join('');
  };
  const ordenEstados = ['Activo', 'En Proceso', 'Completado', 'Reportado'];
  const estados = [...new Set(todos.map(v => v.estado))].sort((x, y) => ordenEstados.indexOf(x) - ordenEstados.indexOf(y));
  llenar('filterEstado', 'Todos los estados', estados);
  llenar('filterTipo', 'Todos los tipos', [...new Set(todos.map(v => v.operacion))].sort());
  llenar('filterCliente', 'Todos los clientes', [...new Set(todos.map(v => v.cliente).filter(c => c !== '—'))].sort());

  // Por defecto se muestra el año actual (o el más reciente con datos).
  selAnio.value = anios.includes(ANIO_ACTUAL) ? ANIO_ACTUAL : (anios[anios.length - 1] || '');
  poblarMeses();
}

// Solo se pueden elegir meses que tengan operaciones (en el año elegido, si hay uno).
function poblarMeses() {
  const anio = document.getElementById('filterAnio').value;
  const selMes = document.getElementById('filterMes');
  const actual = selMes.value;
  const meses = new Set(CABOTAJE_DATA.flatMap(op => op.viajes).flatMap(v => v.periodos)
    .filter(p => !anio || p.startsWith(anio + '-')).map(p => Number(p.slice(5)) - 1));
  selMes.innerHTML = '<option value="">Todos los meses</option>' +
    MESES_ORD.map((m, i) => meses.has(i) ? `<option value="${m}">${m}</option>` : '').join('');
  selMes.value = meses.has(MESES_ORD.indexOf(actual)) ? actual : '';
}

// =================================================
// FILTROS
// =================================================
// Año marcado por defecto: el actual, o el más reciente que tenga operaciones.
function anioPorDefecto() {
  const anios = [...new Set(CABOTAJE_DATA.flatMap(op => op.viajes).flatMap(v => v.periodos.map(p => Number(p.slice(0, 4)))))].sort();
  return String(anios.includes(ANIO_ACTUAL) ? ANIO_ACTUAL : (anios[anios.length - 1] || ''));
}

let temporizadorBusqueda = null;
function buscarConRetardo() {
  clearTimeout(temporizadorBusqueda);
  temporizadorBusqueda = setTimeout(aplicarFiltros, 250);
}

function aplicarFiltros() {
  poblarMeses();
  const q        = document.getElementById('searchCabotaje').value.toLowerCase().trim();
  const mes      = document.getElementById('filterMes').value;
  const anio     = document.getElementById('filterAnio').value;
  const terminal = document.getElementById('filterTerminal').value;
  const estado   = document.getElementById('filterEstado').value;
  const tipo     = document.getElementById('filterTipo').value;
  const cliente  = document.getElementById('filterCliente').value;
  const mesNum   = mes ? String(MESES_ORD.indexOf(mes) + 1).padStart(2, '0') : '';

  filteredData = CABOTAJE_DATA.map(op => {
    const viajes = op.viajes.filter(v => {
      const matchQ = !q || [op.opId, v.cliente, v.per, v.viaje, v.buque, v.operacion, v.producto, v.ruta, v.terminalNombre, v.muelle, v.personal, v.estado]
        .some(s => String(s).toLowerCase().includes(q));
      const matchP = (!mes && !anio) || v.periodos.some(p =>
        (!anio || p.startsWith(anio + '-')) && (!mesNum || p.endsWith('-' + mesNum)));
      const matchT = !terminal || v.puertos.includes(terminal);
      const matchO = (!estado || v.estado === estado) && (!tipo || v.operacion === tipo) && (!cliente || v.cliente === cliente);
      return matchQ && matchP && matchT && matchO;
    });
    return { opId: op.opId, viajes };
  }).filter(op => op.viajes.length > 0);

  pagina = 1;
  actualizarContadorAvanzados();
  actualizarKPIs();
  actualizarGraficos();
  renderTabla();
}

const IDS_FILTROS_AVANZADOS = ['filterTerminal', 'filterEstado', 'filterTipo', 'filterCliente'];

function abrirModalFiltrosAvanzados() {
  abrirModal('modalFiltrosAvanzados');
}

function aplicarFiltrosAvanzadosModal() {
  cerrarModal('modalFiltrosAvanzados');
  aplicarFiltros();
}

function limpiarFiltrosAvanzadosModal() {
  IDS_FILTROS_AVANZADOS.forEach(id => { document.getElementById(id).value = ''; });
  cerrarModal('modalFiltrosAvanzados');
  aplicarFiltros();
}

// Cuántos filtros avanzados están activos (se ve aunque el panel esté cerrado).
function actualizarContadorAvanzados() {
  const n = IDS_FILTROS_AVANZADOS.filter(id => document.getElementById(id).value).length;
  const badge = document.getElementById('filtrosAvanzadosCount');
  document.getElementById('btnFiltrosAvanzados').classList.toggle('activo', n > 0);
  badge.textContent = n;
  badge.style.display = n > 0 ? '' : 'none';
}

function limpiarFiltros() {
  document.getElementById('searchCabotaje').value = '';
  document.getElementById('filterAnio').value     = anioPorDefecto();
  document.getElementById('filterMes').value      = '';
  IDS_FILTROS_AVANZADOS.forEach(id => { document.getElementById(id).value = ''; });
  aplicarFiltros();
}

// =================================================
// KPIs
// =================================================
// Una operación = un viaje. Una nominación compartida genera una fila por
// cliente, pero sigue siendo un solo viaje: para contar viajes, terminales
// y días activos se toma una sola fila por operación.
function operacionesFiltradas() {
  return filteredData.map(op => ({ ...op.viajes[0], opId: op.opId }));
}

function actualizarKPIs() {
  const filas = filteredData.flatMap(op => op.viajes);
  const ops   = operacionesFiltradas();
  document.getElementById('kpiCliente').textContent               = new Set(filas.map(v => v.cliente).filter(c => c !== '—')).size;
  document.getElementById('kpiViajes').textContent                = ops.length;
  document.getElementById('kpiCompartidos').textContent           = ops.filter(v => v.compartido).length;
  document.getElementById('infoTerminalesActivosKPI').textContent = new Set(ops.flatMap(v => v.puertos)).size;
}

// =================================================
// GRÁFICOS
// =================================================
// Periodo que cubren los gráficos de Puerto y Clientes: siguen los filtros, y sin
// Mes/Año abarcan todos los registros (no solo el mes de la Tendencia).
function textoPeriodoFiltros() {
  const mes  = document.getElementById('filterMes').value;
  const anio = document.getElementById('filterAnio').value;
  const periodo = mes || anio ? [mes, anio].filter(Boolean).join(' ') : 'Todos los periodos';
  const extra = IDS_FILTROS_AVANZADOS.map(id => document.getElementById(id).value).filter(Boolean);
  return [periodo, ...extra].join(' · ');
}

function actualizarGraficos() {
  const texto = textoPeriodoFiltros();
  const sc = document.getElementById('clientesSubtitle');
  if (sc) sc.textContent = texto;
  pintarLineaTendencia();
  pintarPastelTerminal(operacionesFiltradas());
  pintarBarrasClientes(filteredData.flatMap(op => op.viajes));
}

// La tendencia sigue el mismo periodo que los otros dos gráficos (los filtros):
//   · con Mes       → días de ese mes
//   · solo con Año  → meses de ese año
//   · sin Año ni Mes → años disponibles
// Una operación cuenta en cada mes que abarca (igual que el filtro).
function pintarLineaTendencia() {
  const ctx    = document.getElementById('chartLinea').getContext('2d');
  const ops    = operacionesFiltradas();
  const mes    = document.getElementById('filterMes').value;
  const anioF  = parseInt(document.getElementById('filterAnio').value) || 0;
  const diario = !!mes;
  let labels, data, color, subtitulo, titulo;

  if (diario) {
    const m = MESES_ORD.indexOf(mes);
    const anio = anioF || Math.max(...ops.flatMap(v => v.periodos.filter(p => Number(p.slice(5)) - 1 === m).map(p => Number(p.slice(0, 4)))), 0) || ANIO_ACTUAL;
    const diasEnMes = new Date(anio, m + 1, 0).getDate();
    labels = Array.from({ length: diasEnMes }, (_, i) => i + 1);
    // Cuenta operaciones activas cada día (inicio → fin), no solo el día de inicio
    data = labels.map(dia => {
      const diaDate = new Date(anio, m, dia);
      const activas = ops.filter(v => {
        const inicio = new Date(v.fechaInicio + 'T00:00:00');
        const fin    = new Date(v.fechaFin + 'T00:00:00');
        return diaDate >= inicio && diaDate <= fin;
      }).length;
      return activas > 0 ? activas : null;
    });
    color     = '#00B4D8';
    subtitulo = `${mes} ${anio} · operaciones activas por día`;
    titulo    = lbl => `Día ${lbl} · ${mes} ${anio}`;
  } else if (anioF) {
    labels = MESES_CORTOS;
    data   = MESES_ORD.map((_, i) => {
      const clave = `${anioF}-${String(i + 1).padStart(2, '0')}`;
      return ops.filter(v => v.periodos.includes(clave)).length || null;
    });
    color     = '#F5C400';
    subtitulo = `Año ${anioF} · operaciones por mes`;
    titulo    = lbl => `${lbl} ${anioF}`;
  } else {
    const anios = [...new Set(ops.flatMap(v => v.periodos.map(p => p.slice(0, 4))))].sort();
    labels = anios;
    data   = anios.map(a => ops.filter(v => v.periodos.some(p => p.startsWith(a + '-'))).length || null);
    color     = '#F5C400';
    subtitulo = 'Todos los años · operaciones por año';
    titulo    = lbl => `Año ${lbl}`;
  }

  const sub = document.getElementById('lineaSubtitle');
  if (sub) sub.textContent = subtitulo;

  // Gradiente vertical: opaco arriba → transparente abajo
  const canvasH = ctx.canvas.parentElement.clientHeight || 280;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasH);
  const rgb = diario ? '0,180,216' : '245,196,0';
  gradient.addColorStop(0, `rgba(${rgb},0.22)`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);

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
        pointRadius:      diario ? 3 : 5,
        pointHoverRadius: diario ? 6 : 7,
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
            title: c => titulo(c[0].label),
            label: c => ` ${c.raw ?? 0} operación${(c.raw ?? 0) !== 1 ? 'es' : ''}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { padding: 6, maxTicksLimit: diario ? 10 : 12, maxRotation: 0 },
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

// --- Barras apiladas: top 5 puertos (origen y destino) ---
// Cada viaje cuenta una vez en su puerto de origen y una vez en el de destino
// (si hay destino y es otro puerto). Por eso el total por puerto no es un
// reparto del 100% de los viajes y no se usa un gráfico de pastel.
// Tocar Origen o Destino en la leyenda deja solo esa serie y el top 5 se ordena
// por ella; volver a tocarla muestra ambas. "Ver todos" lista todos los puertos.
let puertoModo = 'ambos';   // 'ambos' | 'origen' | 'destino'
let puertosTodos = [];      // [{ puerto, origen, destino, total }] ordenado por total

function calcularPuertos(viajes) {
  const conteo = {};
  const sumar = (puerto, campo) => {
    if (!puerto) return;
    conteo[puerto] = conteo[puerto] || { puerto, origen: 0, destino: 0 };
    conteo[puerto][campo]++;
  };
  viajes.forEach(v => {
    sumar(v.origen, 'origen');
    if (v.destino && v.destino !== v.origen) sumar(v.destino, 'destino');
  });
  return Object.values(conteo).map(p => ({ ...p, total: p.origen + p.destino }))
    .sort((a, b) => b.total - a.total || a.puerto.localeCompare(b.puerto));
}

function elegirModoPuerto(modo) {
  puertoModo = puertoModo === modo ? 'ambos' : modo;
  pintarPastelTerminal(operacionesFiltradas());
}

function pintarPastelTerminal(viajes) {
  const ctx = document.getElementById('chartPastel').getContext('2d');
  puertosTodos = calcularPuertos(viajes);

  const clave = p => puertoModo === 'ambos' ? p.total : p[puertoModo];
  const top = puertosTodos.filter(p => clave(p) > 0)
    .sort((a, b) => clave(b) - clave(a) || a.puerto.localeCompare(b.puerto)).slice(0, 5);
  const labels = top.map(p => p.puerto);

  const series = [];
  if (puertoModo !== 'destino') series.push({ label: 'Origen',  data: top.map(p => p.origen),  backgroundColor: '#00B4D8', borderRadius: 4, maxBarThickness: 26 });
  if (puertoModo !== 'origen')  series.push({ label: 'Destino', data: top.map(p => p.destino), backgroundColor: '#1E3A5F', borderRadius: 4, maxBarThickness: 26 });

  // Leyenda propia con el estado activo/apagado
  document.querySelectorAll('#puertoLeyenda .puerto-leyenda-btn').forEach(b => {
    b.classList.toggle('activo', puertoModo === b.dataset.modo);
    b.classList.toggle('apagado', puertoModo !== 'ambos' && puertoModo !== b.dataset.modo);
  });
  actualizarSubtituloPuerto();

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: series },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: c => ` ${c.dataset.label}: ${c.raw} viaje${c.raw !== 1 ? 's' : ''}`,
            footer: items => {
              if (items.length < 1) return '';
              const total = items.reduce((s, i) => s + i.raw, 0);
              return series.length > 1 ? `Total: ${total} viaje${total !== 1 ? 's' : ''}` : '';
            },
          },
        },
      },
      scales: {
        x: { stacked: true, beginAtZero: true, ticks: { precision: 0, padding: 6 }, grid: { color: 'rgba(0,0,0,0.04)', drawTicks: false }, border: { display: false } },
        y: { stacked: true, grid: { display: false }, ticks: { padding: 8, font: { weight: '600' } } },
      },
      animation: { duration: 500, easing: 'easeInOutQuart' },
    }
  });

  if (document.getElementById('modalPuertos')?.classList.contains('open')) renderModalPuertos();
}

function actualizarSubtituloPuerto() {
  const sp = document.getElementById('puertoSubtitle');
  if (!sp) return;
  const que = puertoModo === 'origen' ? 'solo origen' : puertoModo === 'destino' ? 'solo destino' : 'origen y destino';
  sp.textContent = `Top 5 · ${textoPeriodoFiltros()} · ${que}`;
}

// Modal con TODOS los puertos (siguen los filtros), con origen, destino y total.
function abrirModalPuertos() {
  renderModalPuertos();
  abrirModal('modalPuertos');
}

// Todos los puertos registrados en el sistema (Mantenedor de Puertos, activos) con sus
// viajes de origen y destino — los que no tienen viajes salen en 0. Si algún viaje usa
// un puerto que no está en el catálogo, también se incluye.
function puertosDelSistema() {
  const porNombre = {};
  puertosTodos.forEach(p => { porNombre[p.puerto] = p; });
  const catalogo = (typeof cargarPuertos === 'function' ? cargarPuertos() : []).map(p => p.nombre);
  const nombres = [...new Set([...catalogo, ...puertosTodos.map(p => p.puerto)])];
  return nombres.map(n => porNombre[n] || { puerto: n, origen: 0, destino: 0, total: 0 })
    .sort((a, b) => b.total - a.total || nombres.indexOf(a.puerto) - nombres.indexOf(b.puerto));
}

function renderModalPuertos() {
  const lista = puertosDelSistema();
  const conViajes = lista.filter(p => p.total > 0);
  const totalViajes = conViajes.reduce((s, p) => s + p.total, 0);
  document.getElementById('puertosModalSub').textContent = `${textoPeriodoFiltros()} · ${lista.length} puerto${lista.length === 1 ? '' : 's'} registrados`;

  document.getElementById('puertosModalResumen').innerHTML = [
    [lista.length, 'Puertos registrados'],
    [conViajes.length, 'Con viajes'],
    [lista.length - conViajes.length, 'Sin viajes'],
  ].map(([n, t]) => `<div class="pm-kpi"><strong>${n}</strong><span>${t}</span></div>`).join('');

  // Cada barra se mide contra el puerto con más viajes: origen + destino apilados
  const max = Math.max(1, ...lista.map(p => p.total));
  document.getElementById('puertosModalLista').innerHTML = lista.map((p, i) => {
    const pct = n => (n / max * 100).toFixed(2);
    const detalle = p.total
      ? `<span class="pm-detalle">${p.origen} orig. · ${p.destino} dest.</span>`
      : '<span class="pm-detalle">Sin viajes</span>';
    return `<div class="pm-fila${p.total ? '' : ' pm-sin'}" title="${escHtml(p.puerto)}: ${p.origen} de origen, ${p.destino} de destino">
      <div class="pm-puerto"><span class="pm-pos">${i + 1}</span>${escHtml(p.puerto)}</div>
      <div class="pm-barra"><div class="pm-seg-o" style="width:${pct(p.origen)}%"></div><div class="pm-seg-d" style="width:${pct(p.destino)}%"></div></div>
      <div class="pm-valores">${detalle}<span class="pm-total">${p.total}</span></div>
    </div>`;
  }).join('');
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
        label: 'Viajes',
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
        tooltip: { callbacks: { label: c => ` ${c.raw} viaje${c.raw !== 1 ? 's' : ''}` } },
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
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--gray-400)">Sin resultados para los filtros aplicados</td></tr>';
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
    hdr.innerHTML = `<td colspan="10">N° Operación: ${op.opId}</td>`;
    tbody.appendChild(hdr);

    op.viajes.forEach((v, idx) => {
      const rowId = `${op.opId}-${idx}`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${celdaConTooltip(v.cliente, v.clientes, 'Clientes')}</td>
        <td>${v.per}</td>
        <td>${v.viaje}</td>
        <td>${v.buque}</td>
        <td>${v.operacion}</td>
        <td>${celdaConTooltip(v.productos[0] || v.producto, v.productos, 'Productos')}</td>
        <td>${celdaUbicacion(v)}</td>
        <td>${opBadgeEstado(v.estado)}</td>
        <td>${celdaConTooltip(v.personalLista[0] || v.personal, v.personalLista, 'Personal asignado')}</td>
        <td>
          <button class="btn-expand" id="btn-${rowId}" onclick="toggleTimeline('${rowId}')" title="Ver cronograma">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>
          </button>
        </td>`;
      tbody.appendChild(tr);

      const tlRow = document.createElement('tr');
      tlRow.className = 'timeline-row';
      tlRow.id = `tl-${rowId}`;
      const act = v.cronograma;
      tlRow.innerHTML = act.length ? `
        <td colspan="10">
          <div class="timeline-inner">
            <div class="timeline-grid" style="grid-template-columns:repeat(${act.length},1fr)">
              <div class="tl-head">${act.map(x => `<span>${escHtml(x.label)}</span>`).join('')}</div>
              <div class="tl-body">${act.map(x => `<span${x.comentario ? ` title="${escHtml(x.comentario)}"` : ''}>${x.valor}</span>`).join('')}</div>
            </div>
          </div>
        </td>` : `<td colspan="10"><div class="timeline-inner">Esta operación todavía no tiene actividades registradas.</div></td>`;
      tbody.appendChild(tlRow);
    });
  });

  const infoEl = document.getElementById('pagInfoCabotaje');
  if (infoEl) {
    const total = filteredData.length;
    const inicio = (pagina - 1) * PAGE_SIZE;
    const fin    = Math.min(pagina * PAGE_SIZE, total);
    infoEl.textContent = total > 0
      ? `Mostrando ${inicio + 1}–${fin} de ${total} operaciones`
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
// DOWNLOAD DROPDOWN
// =================================================
function toggleDownloadDropdown() {
  document.getElementById('downloadDropdown').classList.toggle('open');
}

const CABOTAJE_COLUMNAS_BASE = [
  'N° Operación', 'Cliente', 'PER', 'Viaje', 'Buque', 'Operación', 'Producto', 'Puerto', 'Terminal', 'Muelle', 'Estado',
  'Personal Asignado', 'Fecha inicio', 'Fecha fin'
];

// Las actividades cambian según el tipo de operación: las columnas del cronograma
// son la unión de las actividades de las filas filtradas, en orden de aparición.
function actividadesExportacion() {
  const labels = [];
  filteredData.forEach(op => op.viajes.forEach(v =>
    v.cronograma.forEach(x => { if (!labels.includes(x.label)) labels.push(x.label); })));
  return labels;
}

// Todas las filas filtradas (no solo la página visible), con el cronograma completo.
function filasExportacion(actividades) {
  return filteredData.flatMap(op => op.viajes.map(v => [
    op.opId, v.cliente, v.per, v.viaje, v.buque, v.operacion, v.producto, v.ruta, v.terminalNombre, v.muelle, v.estado, v.personal,
    formatoHorarioCabotaje(v.fechaInicio), formatoHorarioCabotaje(v.fechaFin),
    ...actividades.map(l => { const x = v.cronograma.find(c => c.label === l); return x ? x.valor : ''; })
  ]));
}

// Ubicación en una sola celda: ruta de puertos y, debajo, Terminal · Muelle (si existen).
function celdaUbicacion(v) {
  const detalle = [v.terminalNombre, v.muelle].filter(x => x && x !== '—').join(' · ');
  return `<div class="celda-ubicacion"><span class="celda-ubicacion-puerto">${escHtml(v.ruta)}</span>` +
    (detalle ? `<span class="celda-ubicacion-detalle">${escHtml(detalle)}</span>` : '') + '</div>';
}

// Celda que puede tener varios valores (clientes, productos, personal): se muestra
// recortada con "+N" cuando hay más de uno, y el tooltip lista cada uno en su línea.
function celdaConTooltip(texto, lista, titulo) {
  const items = (lista || []).filter(Boolean);
  const extra = items.length > 1 ? `<span class="celda-multi-mas">+${items.length - 1}</span>` : '';
  const tip = items.length > 1 ? `${titulo} (${items.length}):\n` + items.map(i => '• ' + i).join('\n') : texto;
  return `<span class="celda-multi" title="${escHtml(tip)}"><span class="celda-multi-txt">${escHtml(texto)}</span>${extra}</span>`;
}

function escHtml(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function descargarArchivo(tipo) {
  document.getElementById('downloadDropdown').classList.remove('open');
  const actividades = actividadesExportacion();
  const columnas = [...CABOTAJE_COLUMNAS_BASE, ...actividades];
  const filas = filasExportacion(actividades);
  if (!filas.length) { mostrarToast('No hay registros para exportar con los filtros aplicados.'); return; }

  if (tipo === 'excel') {
    const csv = [columnas, ...filas]
      .map(f => f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'reporte-cabotaje.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast('Exportación Excel descargada correctamente.');
    return;
  }

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
    <title>Dashboard de Cabotaje</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 9px; margin: 16px; }
      h2 { font-size: 14px; margin-bottom: 4px; }
      p  { margin: 0 0 10px; color: #555; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #111; color: #fff; padding: 5px 6px; text-align: left; font-size: 8px; text-transform: uppercase; }
      td { padding: 5px 6px; border-bottom: 1px solid #eee; }
      @media print { @page { size: landscape; margin: 10mm; } }
    </style></head><body>
    <h2>Dashboard de Cabotaje</h2>
    <p>${textoPeriodoFiltros()} · ${filas.length} registros · generado el ${new Date().toLocaleDateString('es-PE')}</p>
    <table><thead><tr>${columnas.map(c => `<th>${escHtml(c)}</th>`).join('')}</tr></thead>
    <tbody>${filas.map(f => `<tr>${f.map(v => `<td>${escHtml(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
  </body></html>`;
  const win = window.open('', '_blank', 'width=1100,height=700');
  if (!win) { mostrarToast('El navegador bloqueó la ventana. Permite las ventanas emergentes.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
