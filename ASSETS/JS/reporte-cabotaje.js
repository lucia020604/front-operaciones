// =================================================
// MOCK DATA
// =================================================
const CABOTAJE_DATA = [
  {
    opId: 'OP0001',
    viajes: [
      { cliente:'PETROPERÚ', per:'U5488A-25', viaje:'V007-2025', nave:'CHIRA', operacion:'DESCARGA', producto:'GP 6 - GR 35', terminal:'MOLLENDO', personal:'B. ANDRE VARGAS (SUAREZ) - P. Luis Barba & Luis Suarez', compartido: false, mes:'Mayo',
        tl:{ eta:'17/05/2025 05:00', arriba:'17/05/2025 01:00', fondea:'17/05/2025 01:42', amarre:'19/05/2025 02:24', inicia:'19/05/2025 06:42', termina:'19/05/2025 17:00', firma:'19/05/2025 18:30', zarpe:'19/05/2025 20:54' }},
      { cliente:'PETROPERÚ', per:'U5488B-25', viaje:'V007-2025', nave:'CHIRA', operacion:'DESCARGA', producto:'GP23 - DB5S50(53)', terminal:'CONCHÁN', personal:'B. CHARLES - P. PABLO/NOE', compartido: true, mes:'Mayo',
        tl:{ eta:'17/05/2025 05:00', arriba:'17/05/2025 03:00', fondea:'17/05/2025 03:30', amarre:'18/05/2025 08:00', inicia:'18/05/2025 10:15', termina:'18/05/2025 22:00', firma:'18/05/2025 23:00', zarpe:'19/05/2025 01:00' }},
    ]
  },
  {
    opId: 'OP0002',
    viajes: [
      { cliente:'PETROPERÚ', per:'U5877-25', viaje:'V007-2025', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP13-GR8-T44-D2S50(7);[72]', terminal:'CALLAO', personal:'B. JULIO VERTIZ - P. IVAN / BAUTISTA', compartido: false, mes:'Mayo',
        tl:{ eta:'17/05/2025 05:00', arriba:'17/05/2025 01:00', fondea:'17/05/2025 01:42', amarre:'19/05/2025 02:24', inicia:'19/05/2025 06:42', termina:'19/05/2025 17:00', firma:'19/05/2025 18:30', zarpe:'19/05/2025 20:54' }},
      { cliente:'PETROPERÚ', per:'U5877-25', viaje:'V007-2025', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP24-GR15-D2(25)-DB5(60);[124]', terminal:'CONCHÁN', personal:'B.JULIO VERTIZ - P. PABLO/NOE', compartido: true, mes:'Mayo',
        tl:{ eta:'20/05/2025 06:00', arriba:'20/05/2025 08:00', fondea:'20/05/2025 08:45', amarre:'20/05/2025 10:30', inicia:'20/05/2025 13:00', termina:'21/05/2025 04:00', firma:'21/05/2025 05:30', zarpe:'21/05/2025 08:00' }},
    ]
  },
  {
    opId: 'OP0003',
    viajes: [
      { cliente:'REPSOL', per:'U6102-25', viaje:'V009-2025', nave:'MANTARO', operacion:'CARGA', producto:'GP1-T44-D2S50(12);[48]', terminal:'MOLLENDO', personal:'B. CARLOS RIOS - P. ANDRES / FELIX', compartido: false, mes:'Mayo',
        tl:{ eta:'20/05/2025 08:00', arriba:'20/05/2025 10:00', fondea:'20/05/2025 11:15', amarre:'20/05/2025 13:30', inicia:'20/05/2025 16:00', termina:'21/05/2025 08:00', firma:'21/05/2025 09:30', zarpe:'21/05/2025 12:00' }},
      { cliente:'REPSOL', per:'U6103-25', viaje:'V009-2025', nave:'MANTARO', operacion:'CARGA', producto:'GP8-GR15-D2S50(24);[96]', terminal:'ILO', personal:'B. MARIO PEÑA - P. ROBERTO/JOSE', compartido: false, mes:'Mayo',
        tl:{ eta:'21/05/2025 06:00', arriba:'21/05/2025 08:30', fondea:'21/05/2025 09:00', amarre:'21/05/2025 11:00', inicia:'21/05/2025 14:00', termina:'22/05/2025 06:00', firma:'22/05/2025 07:15', zarpe:'22/05/2025 09:30' }},
      { cliente:'REPSOL', per:'U6104-25', viaje:'V009-2025', nave:'MANTARO', operacion:'CARGA', producto:'GP6-T44(18);[36]', terminal:'PISCO', personal:'B. LUIS FLORES - P. CARLOS/ANDRES', compartido: true, mes:'Mayo',
        tl:{ eta:'22/05/2025 07:00', arriba:'22/05/2025 09:00', fondea:'22/05/2025 09:30', amarre:'22/05/2025 11:30', inicia:'22/05/2025 14:00', termina:'23/05/2025 02:00', firma:'23/05/2025 03:30', zarpe:'23/05/2025 06:00' }},
    ]
  },
  {
    opId: 'OP0004',
    viajes: [
      { cliente:'MOBIL', per:'U7021-25', viaje:'V010-2025', nave:'PASTAZA', operacion:'DESCARGA', producto:'GP15-T44-D2(30);[60]', terminal:'CALLAO', personal:'B. RAUL SANTOS - P. DIEGO / LUIS', compartido: false, mes:'Mayo',
        tl:{ eta:'23/05/2025 04:00', arriba:'23/05/2025 06:00', fondea:'23/05/2025 06:30', amarre:'23/05/2025 09:00', inicia:'23/05/2025 11:30', termina:'24/05/2025 03:00', firma:'24/05/2025 04:00', zarpe:'24/05/2025 07:00' }},
      { cliente:'MOBIL', per:'U7022-25', viaje:'V010-2025', nave:'PASTAZA', operacion:'DESCARGA', producto:'GP12-GR8-T44(20);[80]', terminal:'MOLLENDO', personal:'B. PEDRO GOMEZ - P. IVAN/NOE', compartido: true, mes:'Mayo',
        tl:{ eta:'24/05/2025 05:00', arriba:'24/05/2025 07:00', fondea:'24/05/2025 07:30', amarre:'24/05/2025 09:30', inicia:'24/05/2025 12:00', termina:'25/05/2025 04:00', firma:'25/05/2025 05:30', zarpe:'25/05/2025 08:00' }},
    ]
  },
  {
    opId: 'OP0005',
    viajes: [
      { cliente:'PRIMAX', per:'U8011-25', viaje:'V011-2025', nave:'NAPO', operacion:'CARGA', producto:'GP3-GR6-T44(8);[32]', terminal:'ILO', personal:'B. JORGE LUNA - P. ALEX / BETO', compartido: false, mes:'Mayo',
        tl:{ eta:'25/05/2025 03:00', arriba:'25/05/2025 05:00', fondea:'25/05/2025 05:30', amarre:'25/05/2025 07:30', inicia:'25/05/2025 10:00', termina:'26/05/2025 02:00', firma:'26/05/2025 03:00', zarpe:'26/05/2025 06:00' }},
      { cliente:'PRIMAX', per:'U8012-25', viaje:'V011-2025', nave:'NAPO', operacion:'CARGA', producto:'GP5-GR4-T44(10);[40]', terminal:'PISCO', personal:'B. ANA QUISPE - P. HUGO/FELIX', compartido: false, mes:'Mayo',
        tl:{ eta:'26/05/2025 04:00', arriba:'26/05/2025 06:00', fondea:'26/05/2025 06:45', amarre:'26/05/2025 09:00', inicia:'26/05/2025 11:30', termina:'27/05/2025 03:00', firma:'27/05/2025 04:15', zarpe:'27/05/2025 07:00' }},
    ]
  },
];

// =================================================
// STATE
// =================================================
let donutChart = null;
let filteredData = [];

// =================================================
// INIT
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  poblarClienteDropdown();
  aplicarFiltros();
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.btn-download-wrap')) {
      document.getElementById('downloadDropdown').classList.remove('open');
    }
  });
});

function poblarClienteDropdown() {
  const clientes = [...new Set(CABOTAJE_DATA.flatMap(op => op.viajes.map(v => v.cliente)))].sort();
  const sel = document.getElementById('filterCliente');
  clientes.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

// =================================================
// FILTROS
// =================================================
function aplicarFiltros() {
  const q      = document.getElementById('searchCabotaje').value.toLowerCase().trim();
  const mes    = document.getElementById('filterMes').value;
  const cliente= document.getElementById('filterCliente').value;

  filteredData = CABOTAJE_DATA.map(op => {
    const viajes = op.viajes.filter(v => {
      const matchQ = !q || [v.cliente, v.per, v.viaje, v.nave, v.operacion, v.producto, v.terminal, v.personal].some(s => s.toLowerCase().includes(q));
      const matchMes = !mes || v.mes === mes;
      const matchCli = !cliente || v.cliente === cliente;
      return matchQ && matchMes && matchCli;
    });
    return { opId: op.opId, viajes };
  }).filter(op => op.viajes.length > 0);

  actualizarKPIs();
  renderTabla();
}

// =================================================
// KPIs + DONUT
// =================================================
function actualizarKPIs() {
  const todosViajes = filteredData.flatMap(op => op.viajes);
  const totalViajes  = todosViajes.length;
  const totalComp    = todosViajes.filter(v => v.compartido).length;
  const clientes     = [...new Set(todosViajes.map(v => v.cliente))].length;

  document.getElementById('kpiCliente').textContent    = clientes;
  document.getElementById('kpiCompartidos').textContent = totalComp;
  document.getElementById('kpiViajes').textContent      = totalViajes;

  // Terminales info
  const termCount = {};
  todosViajes.forEach(v => { termCount[v.terminal] = (termCount[v.terminal] || 0) + 1; });
  const termNames = Object.keys(termCount);
  const topTerm   = termNames.sort((a,b) => termCount[b]-termCount[a])[0] || '—';
  document.getElementById('infoTerminalesActivos').textContent = termNames.length + ' / 14';
  document.getElementById('infoTerminalTop').textContent       = topTerm;

  // Donut: Descarga vs Carga
  const carga    = todosViajes.filter(v => v.operacion === 'CARGA').length;
  const descarga = todosViajes.filter(v => v.operacion === 'DESCARGA').length;
  actualizarDonut([descarga, carga], ['DESCARGA','CARGA'], ['#1E3A5F','#00B4D8']);
}

function actualizarDonut(valores, etiquetas, colores) {
  const ctx = document.getElementById('donutCabotaje').getContext('2d');
  if (donutChart) donutChart.destroy();
  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: etiquetas,
      datasets: [{ data: valores, backgroundColor: colores, borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }]
    },
    options: {
      cutout: '70%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}` } } },
      animation: { duration: 400 }
    }
  });

  const legend = document.getElementById('legendCabotaje');
  legend.innerHTML = etiquetas.map((l,i) =>
    `<div class="legend-item"><span class="legend-dot" style="background:${colores[i]}"></span>${l}: <strong>${valores[i]}</strong></div>`
  ).join('');
}

// =================================================
// TABLA
// =================================================
function renderTabla() {
  const tbody = document.getElementById('tbodyCabotaje');
  tbody.innerHTML = '';

  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--gray-400)">Sin resultados para los filtros aplicados</td></tr>';
    return;
  }

  filteredData.forEach(op => {
    // Group header
    const hdr = document.createElement('tr');
    hdr.className = 'op-group-header';
    hdr.innerHTML = `<td colspan="9">N° Operación: ${op.opId}</td>`;
    tbody.appendChild(hdr);

    op.viajes.forEach((v, idx) => {
      const rowId = `${op.opId}-${idx}`;

      // Main row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.cliente}</td>
        <td>${v.per}</td>
        <td>${v.viaje}</td>
        <td>${v.nave}</td>
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

      // Timeline row
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

function descargarArchivo(tipo) {
  mostrarToast(`Descarga en formato ${tipo.toUpperCase()} iniciada`);
  document.getElementById('downloadDropdown').classList.remove('open');
}
