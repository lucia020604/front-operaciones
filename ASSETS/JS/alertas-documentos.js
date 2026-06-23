// =================================================
// MOCK DATA — 4 tipos de documento
// =================================================
const ALERTAS_DATA = [
  {
    tipo: 'Tipo de Documento 1',
    docs: [
      { documento:'Contrato',    cod:'Co01', nombre:'Luis Perez',       inicio:'06/06/2025', fin:'06/12/2025', dias:6,    estado:'Por Vencer' },
      { documento:'Contrato',    cod:'Co02', nombre:'Sandra Quispe',    inicio:'01/03/2025', fin:'01/06/2025', dias:-22,  estado:'Vencido' },
      { documento:'Licencia',    cod:'Li01', nombre:'Carlos Ramos',     inicio:'10/01/2025', fin:'10/05/2025', dias:-45,  estado:'Vencido' },
      { documento:'Licencia',    cod:'Li02', nombre:'Maria Torres',     inicio:'15/04/2025', fin:'15/06/2025', dias:-8,   estado:'Vencido' },
      { documento:'Certificado', cod:'Ce01', nombre:'Jose Vega',        inicio:'20/02/2025', fin:'20/05/2025', dias:-33,  estado:'Vencido' },
      { documento:'Certificado', cod:'Ce02', nombre:'Ana Flores',       inicio:'12/05/2025', fin:'12/07/2025', dias:19,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'Ce03', nombre:'Roberto Luna',     inicio:'25/03/2025', fin:'25/06/2025', dias:2,    estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'Pa01', nombre:'Diego Mendez',     inicio:'01/06/2024', fin:'01/06/2025', dias:-22,  estado:'Vencido' },
      { documento:'Pasaporte',   cod:'Pa02', nombre:'Lucia Herrera',    inicio:'10/06/2024', fin:'10/06/2025', dias:-13,  estado:'Vencido' },
      { documento:'Contrato',    cod:'Co03', nombre:'Andres Salas',     inicio:'14/05/2025', fin:'14/06/2025', dias:-9,   estado:'Vencido' },
      { documento:'Licencia',    cod:'Li03', nombre:'Patricia Cruz',    inicio:'05/05/2025', fin:'05/07/2025', dias:12,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'Ce04', nombre:'Hugo Campos',      inicio:'20/05/2025', fin:'20/07/2025', dias:27,   estado:'Por Vencer' },
      { documento:'Contrato',    cod:'Co04', nombre:'Elena Paredes',    inicio:'18/04/2025', fin:'18/06/2025', dias:-5,   estado:'Vencido' },
      { documento:'Licencia',    cod:'Li04', nombre:'Mario Diaz',       inicio:'22/03/2025', fin:'22/05/2025', dias:-31,  estado:'Vencido' },
      { documento:'Certificado', cod:'Ce05', nombre:'Sofia Romero',     inicio:'30/04/2025', fin:'30/06/2025', dias:7,    estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'Pa03', nombre:'Victor Espinoza',  inicio:'03/03/2025', fin:'03/06/2025', dias:-20,  estado:'Vencido' },
      { documento:'Contrato',    cod:'Co05', nombre:'Claudia Noriega',  inicio:'08/05/2025', fin:'08/07/2025', dias:15,   estado:'Por Vencer' },
      { documento:'Licencia',    cod:'Li05', nombre:'Felipe Castillo',  inicio:'01/04/2025', fin:'01/06/2025', dias:-22,  estado:'Vencido' },
      { documento:'Certificado', cod:'Ce06', nombre:'Valeria Bravo',    inicio:'12/05/2025', fin:'12/08/2025', dias:50,   estado:'Por Vencer' },
      { documento:'Contrato',    cod:'Co06', nombre:'Juan Tapia',       inicio:'28/03/2025', fin:'28/05/2025', dias:-25,  estado:'Vencido' },
    ]
  },
  {
    tipo: 'Tipo de Documento 2',
    docs: [
      { documento:'Contrato',    cod:'D2-Co01', nombre:'Rosa Alvarez',    inicio:'10/04/2025', fin:'10/06/2025', dias:-13, estado:'Vencido' },
      { documento:'Licencia',    cod:'D2-Li01', nombre:'Ernesto Silva',   inicio:'20/05/2025', fin:'20/07/2025', dias:27,  estado:'Por Vencer' },
      { documento:'Certificado', cod:'D2-Ce01', nombre:'Isabel Moreno',   inicio:'01/05/2025', fin:'01/07/2025', dias:8,   estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D2-Pa01', nombre:'Omar Vasquez',    inicio:'15/03/2025', fin:'15/05/2025', dias:-38, estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co02', nombre:'Laura Guzman',    inicio:'25/04/2025', fin:'25/06/2025', dias:2,   estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D2-Li02', nombre:'Pedro Huanca',    inicio:'12/02/2025', fin:'12/05/2025', dias:-41, estado:'Vencido' },
      { documento:'Certificado', cod:'D2-Ce02', nombre:'Carmen Lozano',   inicio:'08/05/2025', fin:'08/07/2025', dias:15,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D2-Pa02', nombre:'Ricardo Cano',    inicio:'20/01/2025', fin:'20/04/2025', dias:-63, estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co03', nombre:'Nora Estrada',    inicio:'05/04/2025', fin:'05/06/2025', dias:-18, estado:'Vencido' },
      { documento:'Licencia',    cod:'D2-Li03', nombre:'Hector Bermudez', inicio:'18/05/2025', fin:'18/08/2025', dias:56,  estado:'Por Vencer' },
      { documento:'Certificado', cod:'D2-Ce03', nombre:'Daniela Rojas',   inicio:'30/03/2025', fin:'30/05/2025', dias:-23, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D2-Pa03', nombre:'Alejandro Vera',  inicio:'14/05/2025', fin:'14/07/2025', dias:21,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D2-Co04', nombre:'Gloria Medina',   inicio:'22/04/2025', fin:'22/06/2025', dias:-1,  estado:'Vencido' },
      { documento:'Licencia',    cod:'D2-Li04', nombre:'Samuel Ortega',   inicio:'28/04/2025', fin:'28/06/2025', dias:5,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'D2-Ce04', nombre:'Marta Solano',    inicio:'02/03/2025', fin:'02/06/2025', dias:-21, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D2-Pa04', nombre:'Gonzalo Ruiz',    inicio:'16/05/2025', fin:'16/07/2025', dias:23,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D2-Co05', nombre:'Beatriz Ponce',   inicio:'10/03/2025', fin:'10/06/2025', dias:-13, estado:'Vencido' },
      { documento:'Licencia',    cod:'D2-Li05', nombre:'Xavier Delgado',  inicio:'24/04/2025', fin:'24/06/2025', dias:1,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'D2-Ce05', nombre:'Irene Santos',    inicio:'05/02/2025', fin:'05/05/2025', dias:-48, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D2-Pa05', nombre:'Pablo Rios',      inicio:'20/05/2025', fin:'20/06/2025', dias:-3,  estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co06', nombre:'Vanessa Mora',    inicio:'28/05/2025', fin:'28/08/2025', dias:66,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D2-Li06', nombre:'Francisco Leon',  inicio:'12/04/2025', fin:'12/06/2025', dias:-11, estado:'Vencido' },
      { documento:'Certificado', cod:'D2-Ce06', nombre:'Marcela Torres',  inicio:'18/05/2025', fin:'18/09/2025', dias:87,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D2-Pa06', nombre:'Alonso Reyes',    inicio:'30/01/2025', fin:'30/04/2025', dias:-54, estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co07', nombre:'Natalia Chavez',  inicio:'15/05/2025', fin:'15/07/2025', dias:22,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D2-Li07', nombre:'Marcos Fuentes',  inicio:'08/03/2025', fin:'08/05/2025', dias:-45, estado:'Vencido' },
      { documento:'Certificado', cod:'D2-Ce07', nombre:'Graciela Nieto',  inicio:'22/05/2025', fin:'22/07/2025', dias:29,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D2-Pa07', nombre:'Rodrigo Peña',    inicio:'04/04/2025', fin:'04/06/2025', dias:-19, estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co08', nombre:'Teresa Aguilar',  inicio:'26/04/2025', fin:'26/06/2025', dias:3,   estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D2-Li08', nombre:'Eduardo Vargas',  inicio:'14/02/2025', fin:'14/05/2025', dias:-39, estado:'Vencido' },
    ]
  },
  {
    tipo: 'Tipo de Documento 3',
    docs: [
      { documento:'Contrato',    cod:'D3-Co01', nombre:'Liliana Quispe',  inicio:'12/05/2025', fin:'12/07/2025', dias:19,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D3-Li01', nombre:'Wilmer Apaza',    inicio:'05/03/2025', fin:'05/05/2025', dias:-48, estado:'Vencido' },
      { documento:'Certificado', cod:'D3-Ce01', nombre:'Esther Condori',  inicio:'18/04/2025', fin:'18/06/2025', dias:-5,  estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D3-Pa01', nombre:'Flavio Mamani',   inicio:'28/05/2025', fin:'28/07/2025', dias:35,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D3-Co02', nombre:'Roxana Ccama',    inicio:'02/04/2025', fin:'02/06/2025', dias:-21, estado:'Vencido' },
      { documento:'Licencia',    cod:'D3-Li02', nombre:'Daniel Ticona',   inicio:'20/05/2025', fin:'20/08/2025', dias:58,  estado:'Por Vencer' },
      { documento:'Certificado', cod:'D3-Ce02', nombre:'Milagros Chura',  inicio:'25/03/2025', fin:'25/05/2025', dias:-28, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D3-Pa02', nombre:'Walter Huarachi', inicio:'10/05/2025', fin:'10/07/2025', dias:17,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D3-Co03', nombre:'Yolanda Tapia',   inicio:'15/02/2025', fin:'15/05/2025', dias:-38, estado:'Vencido' },
      { documento:'Licencia',    cod:'D3-Li03', nombre:'Cesar Colque',    inicio:'22/05/2025', fin:'22/07/2025', dias:29,  estado:'Por Vencer' },
      { documento:'Certificado', cod:'D3-Ce03', nombre:'Martha Flores',   inicio:'01/04/2025', fin:'01/06/2025', dias:-22, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D3-Pa03', nombre:'Edwin Callisaya', inicio:'16/05/2025', fin:'16/09/2025', dias:85,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D3-Co04', nombre:'Natividad Ramos', inicio:'08/03/2025', fin:'08/06/2025', dias:-15, estado:'Vencido' },
    ]
  },
  {
    tipo: 'Tipo de Documento 4',
    docs: [
      { documento:'Contrato',    cod:'D4-Co01', nombre:'Alfredo Torres',  inicio:'14/05/2025', fin:'14/07/2025', dias:21,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D4-Li01', nombre:'Blanca Salinas',  inicio:'08/04/2025', fin:'08/06/2025', dias:-15, estado:'Vencido' },
      { documento:'Certificado', cod:'D4-Ce01', nombre:'Cristian Mejia',  inicio:'22/05/2025', fin:'22/08/2025', dias:60,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D4-Pa01', nombre:'Diana Castillo',  inicio:'10/03/2025', fin:'10/06/2025', dias:-13, estado:'Vencido' },
      { documento:'Contrato',    cod:'D4-Co02', nombre:'Enrique Lara',    inicio:'18/05/2025', fin:'18/07/2025', dias:25,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D4-Li02', nombre:'Fabiola Mendez',  inicio:'25/04/2025', fin:'25/06/2025', dias:2,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'D4-Ce02', nombre:'Gabriel Prada',   inicio:'02/03/2025', fin:'02/05/2025', dias:-51, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D4-Pa02', nombre:'Helena Suarez',   inicio:'20/04/2025', fin:'20/06/2025', dias:-3,  estado:'Vencido' },
      { documento:'Contrato',    cod:'D4-Co03', nombre:'Ignacio Meza',    inicio:'28/05/2025', fin:'28/09/2025', dias:97,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D4-Li03', nombre:'Julia Navarro',   inicio:'05/04/2025', fin:'05/06/2025', dias:-18, estado:'Vencido' },
      { documento:'Certificado', cod:'D4-Ce03', nombre:'Kevin Soto',      inicio:'12/05/2025', fin:'12/08/2025', dias:50,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D4-Pa03', nombre:'Laura Pineda',    inicio:'18/03/2025', fin:'18/06/2025', dias:-5,  estado:'Vencido' },
      { documento:'Contrato',    cod:'D4-Co04', nombre:'Manuel Guerrero', inicio:'24/05/2025', fin:'24/07/2025', dias:31,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D4-Li04', nombre:'Norma Espejo',    inicio:'30/03/2025', fin:'30/05/2025', dias:-23, estado:'Vencido' },
    ]
  },
];

// Colors
const COLORES = { 'Vencido': '#DC2626', 'Por Vencer': '#D97706' };
const DONUTS  = [];

// =================================================
// INIT
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  renderKPIsGlobales();
  renderAlertas();
});

function renderKPIsGlobales() {
  const total   = ALERTAS_DATA.flatMap(t => t.docs);
  const vencido = total.filter(d => d.estado === 'Vencido').length;
  const porVenc = total.filter(d => d.estado === 'Por Vencer').length;
  document.getElementById('kpiTotalVencido').textContent   = vencido;
  document.getElementById('kpiTotalPorVencer').textContent = porVenc;
}

// =================================================
// RENDER GRID DE CARDS
// =================================================
function renderAlertas() {
  const grid = document.getElementById('alertasGrid');
  grid.innerHTML = '';

  ALERTAS_DATA.forEach((tipo, i) => {
    const vencido = tipo.docs.filter(d => d.estado === 'Vencido').length;
    const porVenc = tipo.docs.filter(d => d.estado === 'Por Vencer').length;
    const total   = tipo.docs.length;

    // mini tabla por documento-tipo
    const docTipos  = [...new Set(tipo.docs.map(d => d.documento))].slice(0, 4);
    const legItems  = docTipos.map(dt => {
      const cnt = tipo.docs.filter(d => d.documento === dt).length;
      return `<div class="alerta-leg-item"><div class="alerta-leg-left"><span class="legend-dot" style="background:var(--gray-400)"></span>${dt}</div><span class="alerta-leg-count">${cnt}</span></div>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'alerta-card';
    card.innerHTML = `
      <div class="alerta-card-title">${tipo.tipo}</div>
      <div class="alerta-card-inner">
        <div class="alerta-chart-wrap">
          <canvas id="donut-${i}" width="100" height="100"></canvas>
          <div class="alerta-chart-lbl">
            <span class="ac-val">${total}</span>
            <span class="ac-lbl">total</span>
          </div>
        </div>
        <div class="alerta-legend">
          <div class="alerta-leg-item">
            <div class="alerta-leg-left"><span class="legend-dot" style="background:#DC2626"></span>Vencido (${vencido})</div>
          </div>
          <div class="alerta-leg-item">
            <div class="alerta-leg-left"><span class="legend-dot" style="background:#D97706"></span>Por Vencer (${porVenc})</div>
          </div>
          <div style="margin-top:6px;border-top:1px solid #BFD9EF;padding-top:6px;">${legItems}</div>
        </div>
      </div>
      <div class="alerta-card-footer">
        <span class="alerta-total">Total: ${total}</span>
        <button class="btn-detalles" onclick="abrirDetalles(${i})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Detalles
        </button>
      </div>`;
    grid.appendChild(card);

    // Render donut after appending (canvas must be in DOM)
    requestAnimationFrame(() => {
      const ctx = document.getElementById(`donut-${i}`).getContext('2d');
      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Vencido', 'Por Vencer'],
          datasets: [{ data: [vencido, porVenc], backgroundColor: ['#DC2626','#D97706'], borderWidth: 2, borderColor: '#E8F4FD', hoverOffset: 4 }]
        },
        options: { cutout: '68%', plugins: { legend: { display: false } }, animation: { duration: 500 } }
      });
      DONUTS[i] = chart;
    });
  });
}

// =================================================
// MODAL DETALLES
// =================================================
let modalTipoIdx    = 0;
let modalFiltroEstado = 'todos';

function abrirDetalles(idx) {
  modalTipoIdx = idx;
  modalFiltroEstado = 'todos';
  document.getElementById('modalSearch').value = '';
  document.getElementById('modalDetallesTitulo').textContent = ALERTAS_DATA[idx].tipo;
  renderChipsSummary();
  renderModalTabla();
  abrirModal('modalDetalles');
}

function renderChipsSummary() {
  const docs    = ALERTAS_DATA[modalTipoIdx].docs;
  const total   = docs.length;
  const vencido = docs.filter(d => d.estado === 'Vencido').length;
  const porVenc = docs.filter(d => d.estado === 'Por Vencer').length;

  const chips = [
    { key:'todos',      label:`Todos (${total})`,         cls:'' },
    { key:'Vencido',    label:`Vencido (${vencido})`,     cls:'chip-red' },
    { key:'Por Vencer', label:`Por Vencer (${porVenc})`,  cls:'chip-amber' },
  ];

  document.getElementById('chipsContainer').innerHTML = chips.map(c =>
    `<button class="chip-summary ${c.cls}${modalFiltroEstado === c.key ? ' active':''}" onclick="setModalFiltro('${c.key}')">${c.label}</button>`
  ).join('');
}

function setModalFiltro(key) {
  modalFiltroEstado = key;
  renderChipsSummary();
  renderModalTabla();
}

function filtrarModal() {
  renderModalTabla();
}

function renderModalTabla() {
  const q     = document.getElementById('modalSearch').value.toLowerCase().trim();
  const docs  = ALERTAS_DATA[modalTipoIdx].docs;

  const filtrados = docs.filter(d => {
    const matchEstado = modalFiltroEstado === 'todos' || d.estado === modalFiltroEstado;
    const matchQ      = !q || [d.documento, d.cod, d.nombre, d.estado].some(s => s.toLowerCase().includes(q));
    return matchEstado && matchQ;
  });

  const tbody = document.getElementById('modalTbody');
  if (filtrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--gray-400)">Sin resultados</td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map((d, i) => {
    const badgeCls  = d.estado === 'Vencido' ? 'badge-vencida' : 'badge-por-vencer';
    const diasTxt   = d.dias < 0 ? `${Math.abs(d.dias)} días vencido` : `${d.dias} días a vencer`;
    return `<tr>
      <td>${i + 1}</td>
      <td>${ALERTAS_DATA[modalTipoIdx].tipo}</td>
      <td>${d.documento}</td>
      <td>${d.cod}</td>
      <td>${d.nombre}</td>
      <td>${d.inicio}</td>
      <td>${d.fin}</td>
      <td>${diasTxt}</td>
      <td><span class="badge ${badgeCls}"><span class="badge-dot"></span>${d.estado}</span></td>
    </tr>`;
  }).join('');
}
