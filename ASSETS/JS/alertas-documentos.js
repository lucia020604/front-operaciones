// =================================================
// MOCK DATA — 4 tipos de documento (con campo rol)
// =================================================
const ALERTAS_DATA = [
  {
    tipo: 'Contrato',
    docs: [
      { documento:'Contrato',    cod:'Co01', nombre:'Luis Perez',       rol:'Inspector',     inicio:'06/06/2025', fin:'06/12/2025', dias:6,    estado:'Por Vencer' },
      { documento:'Contrato',    cod:'Co02', nombre:'Sandra Quispe',    rol:'Externo',      inicio:'01/03/2025', fin:'01/06/2025', dias:-22,  estado:'Vencido' },
      { documento:'Licencia',    cod:'Li01', nombre:'Carlos Ramos',     rol:'Analista',       inicio:'10/01/2025', fin:'10/05/2025', dias:-45,  estado:'Vencido' },
      { documento:'Licencia',    cod:'Li02', nombre:'Maria Torres',     rol:'Inspector', inicio:'15/04/2025', fin:'15/06/2025', dias:-8,   estado:'Vencido' },
      { documento:'Certificado', cod:'Ce01', nombre:'Jose Vega',        rol:'Practicante',     inicio:'20/02/2025', fin:'20/05/2025', dias:-33,  estado:'Vencido' },
      { documento:'Certificado', cod:'Ce02', nombre:'Ana Flores',       rol:'Inspector',     inicio:'12/05/2025', fin:'12/07/2025', dias:19,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'Ce03', nombre:'Roberto Luna',     rol:'Externo',      inicio:'25/03/2025', fin:'25/06/2025', dias:2,    estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'Pa01', nombre:'Diego Mendez',     rol:'Analista',       inicio:'01/06/2024', fin:'01/06/2025', dias:-22,  estado:'Vencido' },
      { documento:'Pasaporte',   cod:'Pa02', nombre:'Lucia Herrera',    rol:'Electricista', inicio:'10/06/2024', fin:'10/06/2025', dias:-13,  estado:'Vencido' },
      { documento:'Contrato',    cod:'Co03', nombre:'Andres Salas',     rol:'Practicante',     inicio:'14/05/2025', fin:'14/06/2025', dias:-9,   estado:'Vencido' },
      { documento:'Licencia',    cod:'Li03', nombre:'Patricia Cruz',    rol:'Inspector',     inicio:'05/05/2025', fin:'05/07/2025', dias:12,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'Ce04', nombre:'Hugo Campos',      rol:'Externo',      inicio:'20/05/2025', fin:'20/07/2025', dias:27,   estado:'Por Vencer' },
      { documento:'Contrato',    cod:'Co04', nombre:'Elena Paredes',    rol:'Analista',       inicio:'18/04/2025', fin:'18/06/2025', dias:-5,   estado:'Vencido' },
      { documento:'Licencia',    cod:'Li04', nombre:'Mario Diaz',       rol:'Electricista', inicio:'22/03/2025', fin:'22/05/2025', dias:-31,  estado:'Vencido' },
      { documento:'Certificado', cod:'Ce05', nombre:'Sofia Romero',     rol:'Practicante',     inicio:'30/04/2025', fin:'30/06/2025', dias:7,    estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'Pa03', nombre:'Victor Espinoza',  rol:'Inspector',     inicio:'03/03/2025', fin:'03/06/2025', dias:-20,  estado:'Vencido' },
      { documento:'Contrato',    cod:'Co05', nombre:'Claudia Noriega',  rol:'Externo',      inicio:'08/05/2025', fin:'08/07/2025', dias:15,   estado:'Por Vencer' },
      { documento:'Licencia',    cod:'Li05', nombre:'Felipe Castillo',  rol:'Analista',       inicio:'01/04/2025', fin:'01/06/2025', dias:-22,  estado:'Vencido' },
      { documento:'Certificado', cod:'Ce06', nombre:'Valeria Bravo',    rol:'Electricista', inicio:'12/05/2025', fin:'12/08/2025', dias:50,   estado:'Por Vencer' },
      { documento:'Contrato',    cod:'Co06', nombre:'Juan Tapia',       rol:'Practicante',     inicio:'28/03/2025', fin:'28/05/2025', dias:-25,  estado:'Vencido' },
    ]
  },
  {
    tipo: 'Cursos',
    docs: [
      { documento:'Contrato',    cod:'D2-Co01', nombre:'Rosa Alvarez',    rol:'Inspector',     inicio:'10/04/2025', fin:'10/06/2025', dias:-13, estado:'Vencido' },
      { documento:'Licencia',    cod:'D2-Li01', nombre:'Ernesto Silva',   rol:'Externo',      inicio:'20/05/2025', fin:'20/07/2025', dias:27,  estado:'Por Vencer' },
      { documento:'Certificado', cod:'D2-Ce01', nombre:'Isabel Moreno',   rol:'Analista',       inicio:'01/05/2025', fin:'01/07/2025', dias:8,   estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D2-Pa01', nombre:'Omar Vasquez',    rol:'Electricista', inicio:'15/03/2025', fin:'15/05/2025', dias:-38, estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co02', nombre:'Laura Guzman',    rol:'Practicante',     inicio:'25/04/2025', fin:'25/06/2025', dias:2,   estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D2-Li02', nombre:'Pedro Huanca',    rol:'Inspector',     inicio:'12/02/2025', fin:'12/05/2025', dias:-41, estado:'Vencido' },
      { documento:'Certificado', cod:'D2-Ce02', nombre:'Carmen Lozano',   rol:'Externo',      inicio:'08/05/2025', fin:'08/07/2025', dias:15,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D2-Pa02', nombre:'Ricardo Cano',    rol:'Analista',       inicio:'20/01/2025', fin:'20/04/2025', dias:-63, estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co03', nombre:'Nora Estrada',    rol:'Electricista', inicio:'05/04/2025', fin:'05/06/2025', dias:-18, estado:'Vencido' },
      { documento:'Licencia',    cod:'D2-Li03', nombre:'Hector Bermudez', rol:'Practicante',     inicio:'18/05/2025', fin:'18/08/2025', dias:56,  estado:'Por Vencer' },
      { documento:'Certificado', cod:'D2-Ce03', nombre:'Daniela Rojas',   rol:'Inspector',     inicio:'30/03/2025', fin:'30/05/2025', dias:-23, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D2-Pa03', nombre:'Alejandro Vera',  rol:'Externo',      inicio:'14/05/2025', fin:'14/07/2025', dias:21,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D2-Co04', nombre:'Gloria Medina',   rol:'Analista',       inicio:'22/04/2025', fin:'22/06/2025', dias:-1,  estado:'Vencido' },
      { documento:'Licencia',    cod:'D2-Li04', nombre:'Samuel Ortega',   rol:'Electricista', inicio:'28/04/2025', fin:'28/06/2025', dias:5,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'D2-Ce04', nombre:'Marta Solano',    rol:'Practicante',     inicio:'02/03/2025', fin:'02/06/2025', dias:-21, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D2-Pa04', nombre:'Gonzalo Ruiz',    rol:'Inspector',     inicio:'16/05/2025', fin:'16/07/2025', dias:23,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D2-Co05', nombre:'Beatriz Ponce',   rol:'Externo',      inicio:'10/03/2025', fin:'10/06/2025', dias:-13, estado:'Vencido' },
      { documento:'Licencia',    cod:'D2-Li05', nombre:'Xavier Delgado',  rol:'Analista',       inicio:'24/04/2025', fin:'24/06/2025', dias:1,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'D2-Ce05', nombre:'Irene Santos',    rol:'Electricista', inicio:'05/02/2025', fin:'05/05/2025', dias:-48, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D2-Pa05', nombre:'Pablo Rios',      rol:'Practicante',     inicio:'20/05/2025', fin:'20/06/2025', dias:-3,  estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co06', nombre:'Vanessa Mora',    rol:'Inspector',     inicio:'28/05/2025', fin:'28/08/2025', dias:66,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D2-Li06', nombre:'Francisco Leon',  rol:'Externo',      inicio:'12/04/2025', fin:'12/06/2025', dias:-11, estado:'Vencido' },
      { documento:'Certificado', cod:'D2-Ce06', nombre:'Marcela Torres',  rol:'Analista',       inicio:'18/05/2025', fin:'18/09/2025', dias:87,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D2-Pa06', nombre:'Alonso Reyes',    rol:'Electricista', inicio:'30/01/2025', fin:'30/04/2025', dias:-54, estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co07', nombre:'Natalia Chavez',  rol:'Practicante',     inicio:'15/05/2025', fin:'15/07/2025', dias:22,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D2-Li07', nombre:'Marcos Fuentes',  rol:'Inspector',     inicio:'08/03/2025', fin:'08/05/2025', dias:-45, estado:'Vencido' },
      { documento:'Certificado', cod:'D2-Ce07', nombre:'Graciela Nieto',  rol:'Externo',      inicio:'22/05/2025', fin:'22/07/2025', dias:29,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D2-Pa07', nombre:'Rodrigo Peña',    rol:'Analista',       inicio:'04/04/2025', fin:'04/06/2025', dias:-19, estado:'Vencido' },
      { documento:'Contrato',    cod:'D2-Co08', nombre:'Teresa Aguilar',  rol:'Electricista', inicio:'26/04/2025', fin:'26/06/2025', dias:3,   estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D2-Li08', nombre:'Eduardo Vargas',  rol:'Practicante',     inicio:'14/02/2025', fin:'14/05/2025', dias:-39, estado:'Vencido' },
    ]
  },
  {
    tipo: 'Lemon Card',
    docs: [
      { documento:'Contrato',    cod:'D3-Co01', nombre:'Liliana Quispe',  rol:'Inspector',     inicio:'12/05/2025', fin:'12/07/2025', dias:19,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D3-Li01', nombre:'Wilmer Apaza',    rol:'Externo',      inicio:'05/03/2025', fin:'05/05/2025', dias:-48, estado:'Vencido' },
      { documento:'Certificado', cod:'D3-Ce01', nombre:'Esther Condori',  rol:'Analista',       inicio:'18/04/2025', fin:'18/06/2025', dias:-5,  estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D3-Pa01', nombre:'Flavio Mamani',   rol:'Electricista', inicio:'28/05/2025', fin:'28/07/2025', dias:35,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D3-Co02', nombre:'Roxana Ccama',    rol:'Practicante',     inicio:'02/04/2025', fin:'02/06/2025', dias:-21, estado:'Vencido' },
      { documento:'Licencia',    cod:'D3-Li02', nombre:'Daniel Ticona',   rol:'Inspector',     inicio:'20/05/2025', fin:'20/08/2025', dias:58,  estado:'Por Vencer' },
      { documento:'Certificado', cod:'D3-Ce02', nombre:'Milagros Chura',  rol:'Externo',      inicio:'25/03/2025', fin:'25/05/2025', dias:-28, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D3-Pa02', nombre:'Walter Huarachi', rol:'Analista',       inicio:'10/05/2025', fin:'10/07/2025', dias:17,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D3-Co03', nombre:'Yolanda Tapia',   rol:'Electricista', inicio:'15/02/2025', fin:'15/05/2025', dias:-38, estado:'Vencido' },
      { documento:'Licencia',    cod:'D3-Li03', nombre:'Cesar Colque',    rol:'Practicante',     inicio:'22/05/2025', fin:'22/07/2025', dias:29,  estado:'Por Vencer' },
      { documento:'Certificado', cod:'D3-Ce03', nombre:'Martha Flores',   rol:'Inspector',     inicio:'01/04/2025', fin:'01/06/2025', dias:-22, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D3-Pa03', nombre:'Edwin Callisaya', rol:'Externo',      inicio:'16/05/2025', fin:'16/09/2025', dias:85,  estado:'Por Vencer' },
      { documento:'Contrato',    cod:'D3-Co04', nombre:'Natividad Ramos', rol:'Analista',       inicio:'08/03/2025', fin:'08/06/2025', dias:-15, estado:'Vencido' },
    ]
  },
  {
    tipo: 'Otros',
    docs: [
      { documento:'Contrato',    cod:'D4-Co01', nombre:'Alfredo Torres',  rol:'Electricista', inicio:'14/05/2025', fin:'14/07/2025', dias:21,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D4-Li01', nombre:'Blanca Salinas',  rol:'Practicante',     inicio:'08/04/2025', fin:'08/06/2025', dias:-15, estado:'Vencido' },
      { documento:'Certificado', cod:'D4-Ce01', nombre:'Cristian Mejia',  rol:'Inspector',     inicio:'22/05/2025', fin:'22/08/2025', dias:60,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D4-Pa01', nombre:'Diana Castillo',  rol:'Externo',      inicio:'10/03/2025', fin:'10/06/2025', dias:-13, estado:'Vencido' },
      { documento:'Contrato',    cod:'D4-Co02', nombre:'Enrique Lara',    rol:'Piloto',       inicio:'18/05/2025', fin:'18/07/2025', dias:25,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D4-Li02', nombre:'Fabiola Mendez',  rol:'Electricista', inicio:'25/04/2025', fin:'25/06/2025', dias:2,   estado:'Por Vencer' },
      { documento:'Certificado', cod:'D4-Ce02', nombre:'Gabriel Prada',   rol:'Practicante',     inicio:'02/03/2025', fin:'02/05/2025', dias:-51, estado:'Vencido' },
      { documento:'Pasaporte',   cod:'D4-Pa02', nombre:'Helena Suarez',   rol:'Inspector',     inicio:'20/04/2025', fin:'20/06/2025', dias:-3,  estado:'Vencido' },
      { documento:'Contrato',    cod:'D4-Co03', nombre:'Ignacio Meza',    rol:'Externo',      inicio:'28/05/2025', fin:'28/09/2025', dias:97,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D4-Li03', nombre:'Julia Navarro',   rol:'Piloto',       inicio:'05/04/2025', fin:'05/06/2025', dias:-18, estado:'Vencido' },
      { documento:'Certificado', cod:'D4-Ce03', nombre:'Kevin Soto',      rol:'Electricista', inicio:'12/05/2025', fin:'12/08/2025', dias:50,  estado:'Por Vencer' },
      { documento:'Pasaporte',   cod:'D4-Pa03', nombre:'Laura Pineda',    rol:'Practicante',     inicio:'18/03/2025', fin:'18/06/2025', dias:-5,  estado:'Vencido' },
      { documento:'Contrato',    cod:'D4-Co04', nombre:'Manuel Guerrero', rol:'Inspector',     inicio:'24/05/2025', fin:'24/07/2025', dias:31,  estado:'Por Vencer' },
      { documento:'Licencia',    cod:'D4-Li04', nombre:'Norma Espejo',    rol:'Externo',      inicio:'30/03/2025', fin:'30/05/2025', dias:-23, estado:'Vencido' },
    ]
  },
];

const COLORES = { 'Vencido': '#DC2626', 'Por Vencer': '#D97706' };
const DONUTS  = [];

// Instancias de los 3 gráficos analíticos
let CHART_LINE       = null;
let CHART_DONUT_TIPO = null;
let CHART_BARH       = null;

const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
let granLineChart = 'año'; // 'año' | 'mes'

// Total de trabajadores en el sistema (mock)
const TOTAL_TRABAJADORES_SISTEMA = 85;

// =================================================
// ESTADO GLOBAL DE FILTROS Y PAGINACIÓN
// =================================================
let filtros = { tipo: 'todos', estado: 'todos', rol: 'todos', busqueda: '' };
let paginaActual   = 1;
const FILAS_POR_PAGINA = 10;

// =================================================
// INIT
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  // Poblar select de Tipo
  const tipoSel = document.getElementById('filtroTipo');
  ALERTAS_DATA.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.tipo;
    opt.textContent = t.tipo;
    tipoSel.appendChild(opt);
  });

  // Poblar select de Rol (únicos, ordenados)
  const roles = [...new Set(ALERTAS_DATA.flatMap(t => t.docs.map(d => d.rol)))].sort();
  const rolSel = document.getElementById('filtroRol');
  roles.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.textContent = r;
    rolSel.appendChild(opt);
  });

  renderKPIsGlobales();
  renderAlertas();
  renderCharts();
  renderTablaConsolidada();
  lucide.createIcons();

  // Cerrar dropdown de exportar al hacer click fuera
  document.addEventListener('click', e => {
    if (!e.target.closest('.btn-download-wrap')) {
      const dd = document.getElementById('exportDropdown');
      if (dd) dd.classList.remove('open');
    }
  });
});

// =================================================
// FILTRO GLOBAL
// =================================================
function getFilteredDocs() {
  const resultado = [];
  ALERTAS_DATA.forEach(tipo => {
    if (filtros.tipo !== 'todos' && tipo.tipo !== filtros.tipo) return;
    tipo.docs.forEach(doc => {
      if (filtros.estado !== 'todos' && doc.estado !== filtros.estado) return;
      if (filtros.rol    !== 'todos' && doc.rol    !== filtros.rol)    return;
      if (filtros.busqueda) {
        const q = filtros.busqueda;
        const match = [doc.nombre, doc.cod, doc.documento, doc.rol, tipo.tipo]
          .some(s => s.toLowerCase().includes(q));
        if (!match) return;
      }
      resultado.push({ ...doc, tipo: tipo.tipo });
    });
  });
  return resultado;
}

function aplicarFiltros() {
  filtros.tipo     = document.getElementById('filtroTipo').value;
  filtros.estado   = document.getElementById('filtroEstado').value;
  filtros.rol      = document.getElementById('filtroRol').value;
  filtros.busqueda = document.getElementById('filtroBusqueda').value.toLowerCase().trim();
  paginaActual = 1;
  renderKPIsGlobales();
  renderAlertas();
  renderCharts();
  renderTablaConsolidada();
}

function limpiarFiltros() {
  filtros = { tipo: 'todos', estado: 'todos', rol: 'todos', busqueda: '' };
  paginaActual = 1;
  document.getElementById('filtroTipo').value      = 'todos';
  document.getElementById('filtroEstado').value    = 'todos';
  document.getElementById('filtroRol').value       = 'todos';
  document.getElementById('filtroBusqueda').value  = '';
  renderKPIsGlobales();
  renderAlertas();
  renderCharts();
  renderTablaConsolidada();
}

// =================================================
// KPIs GLOBALES
// =================================================
function renderKPIsGlobales() {
  const docs     = getFilteredDocs();
  const vencido  = docs.filter(d => d.estado === 'Vencido').length;
  const porVenc  = docs.filter(d => d.estado === 'Por Vencer').length;

  const todosNombres    = new Set(docs.map(d => d.nombre));
  const nombresAfect    = new Set(docs.map(d => d.nombre)); // all shown are afectados
  const personalAfect   = nombresAfect.size;
  const personalAlDia   = Math.max(0, TOTAL_TRABAJADORES_SISTEMA - personalAfect);
  const pct             = Math.round((personalAlDia / TOTAL_TRABAJADORES_SISTEMA) * 100);

  document.getElementById('kpiTotalVencido').textContent    = vencido;
  document.getElementById('kpiTotalPorVencer').textContent  = porVenc;
  document.getElementById('kpiPersonalAfectado').textContent = personalAfect;
  document.getElementById('kpiPersonalAlDia').textContent   = personalAlDia;
  document.getElementById('kpiSubPersonalAfectado').textContent = `De ${TOTAL_TRABAJADORES_SISTEMA} trabajadores`;
  document.getElementById('kpiSubPersonalAlDia').textContent    = `${pct}% del total`;
}

// =================================================
// GRID DE CARDS v2 — Dashboard moderno
// =================================================
const CARD_ICONS   = ['file-text', 'shield', 'award', 'briefcase'];
const CARD_COLORS  = [
  { bg: '#EEF2FF', fg: '#4F46E5' },
  { bg: '#E0F2FE', fg: '#0284C7' },
  { bg: '#F0FDF4', fg: '#16A34A' },
  { bg: '#FFF7ED', fg: '#EA580C' },
];

function cumplColor(pct) {
  if (pct >= 70) return '#16A34A';
  if (pct >= 40) return '#D97706';
  return '#DC2626';
}

function renderAlertas() {
  const grid = document.getElementById('alertasGrid');
  grid.innerHTML = '';

  DONUTS.forEach(c => { if (c) c.destroy(); });
  DONUTS.length = 0;

  ALERTAS_DATA.forEach((tipo, i) => {
    if (filtros.tipo !== 'todos' && tipo.tipo !== filtros.tipo) return;

    let docs = tipo.docs;
    if (filtros.estado !== 'todos') docs = docs.filter(d => d.estado === filtros.estado);
    if (filtros.rol    !== 'todos') docs = docs.filter(d => d.rol    === filtros.rol);
    if (filtros.busqueda) {
      const q = filtros.busqueda;
      docs = docs.filter(d =>
        [d.nombre, d.cod, d.documento, d.rol, tipo.tipo].some(s => s.toLowerCase().includes(q))
      );
    }
    if (docs.length === 0) return;

    const vencido  = docs.filter(d => d.estado === 'Vencido').length;
    const porVenc  = docs.filter(d => d.estado === 'Por Vencer').length;
    const total    = docs.length;
    const cumpl    = Math.round(((total - vencido) / total) * 100);
    const cc       = cumplColor(cumpl);

    const docTipos = [...new Set(docs.map(d => d.documento))].slice(0, 4);
    const legItems = docTipos.map(dt => {
      const cnt = docs.filter(d => d.documento === dt).length;
      return `<div class="ac2-leg-item ac2-leg-subitem">
        <div class="ac2-leg-left">
          <span class="ac2-leg-dot" style="background:#CBD5E1"></span>
          <span>${dt}</span>
        </div>
        <span class="ac2-leg-val ac2-leg-sub-val">${cnt}</span>
      </div>`;
    }).join('');

    const icon  = CARD_ICONS[i % CARD_ICONS.length];
    const color = CARD_COLORS[i % CARD_COLORS.length];

    const card = document.createElement('div');
    card.className = 'alerta-card-v2';
    card.innerHTML = `
      <div class="ac2-header">
        <div class="ac2-header-left">
          <div class="ac2-icon-wrap" style="background:${color.bg};color:${color.fg}">
            <i data-lucide="${icon}" width="18" height="18"></i>
          </div>
          <div>
            <div class="ac2-title">${tipo.tipo}</div>
            <div class="ac2-subtitle">${total} registros</div>
          </div>
        </div>
        <div class="ac2-header-right">
          <span class="ac2-pct" style="color:${color.fg}">${cumpl}%</span>
          <span class="ac2-pct-label">Cumplimiento</span>
        </div>
      </div>

      <div class="ac2-progress-wrap">
        <div class="ac2-progress-track">
          <div class="ac2-progress-fill" style="width:${cumpl}%;background:${color.fg}"></div>
        </div>
      </div>

      <div class="ac2-body">
        <div class="ac2-donut-wrap">
          <canvas id="donut-${i}" width="96" height="96"></canvas>
          <div class="ac2-donut-center">
            <span class="ac2-donut-val">${total}</span>
            <span class="ac2-donut-lbl">TOTAL</span>
          </div>
        </div>
        <div class="ac2-legend">
          <div class="ac2-leg-item">
            <div class="ac2-leg-left">
              <span class="ac2-leg-dot" style="background:#DC2626"></span>
              <span>Vencido</span>
            </div>
            <span class="ac2-leg-val">${vencido}</span>
          </div>
          <div class="ac2-leg-item">
            <div class="ac2-leg-left">
              <span class="ac2-leg-dot" style="background:#D97706"></span>
              <span>Por Vencer</span>
            </div>
            <span class="ac2-leg-val">${porVenc}</span>
          </div>
          <div class="ac2-leg-divider"></div>
          ${legItems}
        </div>
      </div>

      <div class="ac2-footer">
        <div class="ac2-alert-badge">
          <i data-lucide="alert-triangle" width="13" height="13"></i>
          <span>${total} con alerta</span>
        </div>
        <button class="ac2-btn-detalles" onclick="abrirDetalles(${i})">
          <i data-lucide="plus" width="12" height="12"></i>
          Detalles
        </button>
      </div>`;
    grid.appendChild(card);

    const ctx = document.getElementById(`donut-${i}`).getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Vencido', 'Por Vencer'],
        datasets: [{
          data: [vencido, porVenc],
          backgroundColor: ['#DC2626', '#D97706'],
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 5
        }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { display: false } },
        animation: { duration: 600 }
      }
    });
    DONUTS[i] = chart;
  });

  lucide.createIcons();
}

// =================================================
// GRÁFICOS ANALÍTICOS — helpers de datos
// =================================================
function getLineChartData(docs) {
  if (granLineChart === 'mes') {
    // Determine the busiest month in the data
    const monthCounts = {};
    docs.forEach(d => {
      const p   = d.fin.split('/');
      const key = `${p[2]}-${p[1].padStart(2, '0')}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    });
    const refKey = Object.keys(monthCounts).sort((a, b) => monthCounts[b] - monthCounts[a])[0];
    if (!refKey) return { labels: [], vencidos: [], porVencer: [], refLabel: '' };

    const [refY, refM]  = refKey.split('-').map(Number);
    const daysInMonth   = new Date(refY, refM, 0).getDate();
    const vencidos      = Array(daysInMonth).fill(0);
    const porVencer     = Array(daysInMonth).fill(0);
    const labels        = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

    docs.forEach(d => {
      const p  = d.fin.split('/');
      const dd = parseInt(p[0]), mm = parseInt(p[1]), yy = parseInt(p[2]);
      if (mm === refM && yy === refY) {
        if (d.estado === 'Vencido') vencidos[dd - 1]++;
        else porVencer[dd - 1]++;
      }
    });

    return { labels, vencidos, porVencer, refLabel: `${MESES_CORTOS[refM - 1]} ${refY}` };
  }

  // Año: group by month-year sorted
  const mapa = {};
  docs.forEach(d => {
    const partes = d.fin.split('/');
    const mm    = partes[1], yyyy = partes[2];
    const key   = `${yyyy}-${mm.padStart(2, '0')}`;
    const label = `${MESES_CORTOS[parseInt(mm) - 1]} ${yyyy}`;
    if (!mapa[key]) mapa[key] = { label, vencido: 0, porVencer: 0 };
    if (d.estado === 'Vencido') mapa[key].vencido++;
    else mapa[key].porVencer++;
  });
  const sorted = Object.keys(mapa).sort();
  return {
    labels:    sorted.map(k => mapa[k].label),
    vencidos:  sorted.map(k => mapa[k].vencido),
    porVencer: sorted.map(k => mapa[k].porVencer),
    refLabel: 'Todos los meses'
  };
}

function setGranLine(gran) {
  granLineChart = gran;
  document.getElementById('granBtnMes').classList.toggle('active',  gran === 'mes');
  document.getElementById('granBtnAnio').classList.toggle('active', gran === 'año');
  renderLineChart(getFilteredDocs());
}

function getDonutTipoData(docs) {
  const tipos = {};
  docs.forEach(d => { tipos[d.documento] = (tipos[d.documento] || 0) + 1; });
  const entries = Object.entries(tipos).sort((a, b) => b[1] - a[1]);
  const MAX = 5;
  if (entries.length <= MAX) {
    return { labels: entries.map(([k]) => k), data: entries.map(([, v]) => v) };
  }
  const top   = entries.slice(0, MAX - 1);
  const otros = entries.slice(MAX - 1).reduce((acc, [, v]) => acc + v, 0);
  return {
    labels: [...top.map(([k]) => k), 'Otro'],
    data:   [...top.map(([, v]) => v), otros]
  };
}

function getBarRolData(docs) {
  const roles = {};
  docs.forEach(d => {
    if (!roles[d.rol]) roles[d.rol] = { vencido: 0, porVencer: 0 };
    if (d.estado === 'Vencido') roles[d.rol].vencido++;
    else roles[d.rol].porVencer++;
  });
  const entries = Object.entries(roles)
    .map(([k, v]) => ({ label: k, vencido: v.vencido, porVencer: v.porVencer }))
    .sort((a, b) => (b.vencido + b.porVencer) - (a.vencido + a.porVencer))
    .slice(0, 5);
  return {
    labels:    entries.map(e => e.label),
    vencidos:  entries.map(e => e.vencido),
    porVencer: entries.map(e => e.porVencer)
  };
}

// =================================================
// GRÁFICOS ANALÍTICOS — render
// =================================================
function renderCharts() {
  const docs = getFilteredDocs();
  renderLineChart(docs);
  renderDonutTipoChart(docs);
  renderBarChart(docs);
}

function toggleChartNoData(canvasId, noDataId, isEmpty) {
  const canvas = document.getElementById(canvasId);
  const nodata = document.getElementById(noDataId);
  if (canvas) canvas.style.display = isEmpty ? 'none' : 'block';
  if (nodata) nodata.classList.toggle('visible', isEmpty);
}

function renderLineChart(docs) {
  if (CHART_LINE) { CHART_LINE.destroy(); CHART_LINE = null; }
  const { labels, vencidos, porVencer, refLabel } = getLineChartData(docs);

  // Update subtitle dynamically
  const subtitleEl = document.querySelector('.chart-card--linea .chart-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = granLineChart === 'mes'
      ? `Días del mes – ${refLabel}`
      : 'Vencidos vs Por Vencer por mes';
  }

  toggleChartNoData('chartLine', 'noDataLine', labels.length === 0);
  if (labels.length === 0) return;

  // Show fewer ticks in 'mes' view to avoid crowding
  const maxTicksLimit = granLineChart === 'mes' ? 10 : undefined;

  CHART_LINE = new Chart(document.getElementById('chartLine'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Vencido',
          data: vencidos,
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220,38,38,.08)',
          borderWidth: 2,
          pointRadius: granLineChart === 'mes' ? 3 : 4,
          pointBackgroundColor: '#DC2626',
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Por Vencer',
          data: porVencer,
          borderColor: '#D97706',
          backgroundColor: 'rgba(217,119,6,.08)',
          borderWidth: 2,
          pointRadius: granLineChart === 'mes' ? 3 : 4,
          pointBackgroundColor: '#D97706',
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      devicePixelRatio: window.devicePixelRatio || 2,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { boxWidth: 10, font: { size: 11 }, usePointStyle: true, padding: 14 }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: '#6B7280', maxTicksLimit }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,.04)' },
          ticks: { stepSize: 1, font: { size: 10 }, color: '#6B7280' }
        }
      }
    }
  });
}

function renderDonutTipoChart(docs) {
  if (CHART_DONUT_TIPO) { CHART_DONUT_TIPO.destroy(); CHART_DONUT_TIPO = null; }
  const { labels, data } = getDonutTipoData(docs);

  toggleChartNoData('chartDonutTipo', 'noDataDonut', data.length === 0);
  if (data.length === 0) return;

  // Paleta corporativa: navy → cyan → ocean → steel → teal → slate (Otro)
  const COLORES_DONUT = ['#1E3A5F', '#00B4D8', '#0369A1', '#0891B2', '#0D9488', '#94A3B8'];

  CHART_DONUT_TIPO = new Chart(document.getElementById('chartDonutTipo'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: COLORES_DONUT.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6
      }]
    },
    options: {
      devicePixelRatio: window.devicePixelRatio || 2,
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 10,
            font: { size: 11 },
            usePointStyle: true,
            padding: 10
          }
        }
      }
    }
  });
}

function renderBarChart(docs) {
  if (CHART_BARH) { CHART_BARH.destroy(); CHART_BARH = null; }
  const { labels, vencidos, porVencer } = getBarRolData(docs);

  const isEmpty = labels.length === 0;
  toggleChartNoData('chartBarH', 'noDataBar', isEmpty);
  if (isEmpty) return;

  CHART_BARH = new Chart(document.getElementById('chartBarH'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Vencido',
          data: vencidos,
          backgroundColor: '#DC2626',
          borderRadius: 0,
          borderSkipped: false
        },
        {
          label: 'Por Vencer',
          data: porVencer,
          backgroundColor: '#F59E0B',
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    },
    options: {
      devicePixelRatio: window.devicePixelRatio || 2,
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { boxWidth: 10, font: { size: 11 }, usePointStyle: true, padding: 14 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.x}`
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,.04)' },
          ticks: { stepSize: 1, font: { size: 10 }, color: '#6B7280' }
        },
        y: {
          stacked: true,
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#3A3A3A' }
        }
      }
    }
  });
}

// =================================================
// TABLA CONSOLIDADA
// =================================================
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
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:28px;color:var(--gray-400)">Sin resultados para los filtros aplicados</td></tr>`;
  } else {
    tbody.innerHTML = slice.map((d, i) => {
      const n        = inicio + i + 1;
      const badgeCls = d.estado === 'Vencido' ? 'badge-vencida' : 'badge-por-vencer';
      const diasTxt  = d.dias < 0 ? `${Math.abs(d.dias)}d vencido` : `${d.dias}d a vencer`;
      return `<tr>
        <td>${n}</td>
        <td>${d.nombre}</td>
        <td>${d.rol}</td>
        <td>${d.tipo}</td>
        <td>${d.documento}</td>
        <td>${d.inicio}</td>
        <td>${d.fin}</td>
        <td>${diasTxt}</td>
        <td><span class="badge ${badgeCls}"><span class="badge-dot"></span>${d.estado}</span></td>
        <td>
          <div class="opciones">
            <button class="btn-accion btn-icon-dl" title="Descargar documento"
                    onclick="descargarDoc('${d.cod}', '${d.nombre}')">
              <i data-lucide="download" width="12" height="12"></i>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-to-line-icon lucide-arrow-down-to-line"><path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/></svg>
            </button>
            <button class="btn-accion btn-icon-hist" title="Historial del documento"
                    onclick="verHistorial('${d.cod}', '${d.nombre}')">
              <i data-lucide="clock" width="14" height="14"></i>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history-icon lucide-history"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // Actualizar info de paginación
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

// =================================================
// EXPORTACIÓN
// =================================================
function exportarExcel() {
  const docs = getFilteredDocs();
  const headers = ['N°', 'Trabajador', 'Rol', 'Documento', 'Detalle', 'Fecha carga', 'Vencimiento', 'Días', 'Estado'];
  const filas = docs.map((d, i) => {
    const diasTxt = d.dias < 0 ? `${Math.abs(d.dias)} días vencido` : `${d.dias} días a vencer`;
    return [i + 1, d.nombre, d.rol, d.tipo, d.documento, d.inicio, d.fin, diasTxt, d.estado];
  });

  const csv = [headers, ...filas]
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
  const docs = getFilteredDocs();
  const filas = docs.map((d, i) => {
    const cls     = d.estado === 'Vencido' ? 'badge-vencida' : 'badge-por-vencer';
    const diasTxt = d.dias < 0 ? `${Math.abs(d.dias)}d vencido` : `${d.dias}d a vencer`;
    return `<tr>
      <td>${i + 1}</td><td>${d.nombre}</td><td>${d.rol}</td>
      <td>${d.tipo}</td><td>${d.documento}</td>
      <td>${d.inicio}</td><td>${d.fin}</td><td>${diasTxt}</td>
      <td><span class="${cls}">${d.estado}</span></td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Alertas – Documento Personal</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 12px; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 7px 10px; text-align: left;
             font-size: 9px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 7px 10px; border-bottom: 1px solid #eee; }
      .badge-vencida  { background: #FEE2E2; color: #991B1B; padding: 2px 8px;
                        border-radius: 20px; font-size: 10px; }
      .badge-por-vencer{ background: #FEF3C7; color: #92400E; padding: 2px 8px;
                         border-radius: 20px; font-size: 10px; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <h2>Alertas – Documento Personal</h2>
    <table>
      <thead>
        <tr><th>N°</th><th>Trabajador</th><th>Rol</th><th>Documento</th><th>Detalle</th>
            <th>Fecha carga</th><th>Vencimiento</th><th>Días</th><th>Estado</th></tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
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
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--gray-400)">Sin historial disponible</td></tr>`;
  } else {
    tbody.innerHTML = getMockHistorial(docEncontrado).map(e => {
      const clsAnt = badgeClsEstado(e.estadoAnterior);
      const clsAct = badgeClsEstado(e.estadoActual);
      return `<tr>
        <td>${e.fechaCarga}</td>
        <td>${e.usuario}</td>
        <td>${e.actualizacion}</td>
        <td>${e.estadoAnterior !== '—'
          ? `<span class="badge ${clsAnt}"><span class="badge-dot"></span>${e.estadoAnterior}</span>`
          : '—'}</td>
        <td><span class="badge ${clsAct}"><span class="badge-dot"></span>${e.estadoActual}</span></td>
      </tr>`;
    }).join('');
  }

  abrirModal('modalHistorial');
}

function getMockHistorial(doc) {
  const eventos = [
    { fechaCarga: doc.inicio, usuario: 'admin@calebbrett.com',
      actualizacion: doc.inicio, estadoAnterior: '—', estadoActual: 'Vigente' }
  ];
  if (doc.estado === 'Vencido') {
    eventos.push(
      { fechaCarga: doc.inicio, usuario: 'sistema',
        actualizacion: '(30 días antes del vencimiento)', estadoAnterior: 'Vigente', estadoActual: 'Por Vencer' },
      { fechaCarga: doc.inicio, usuario: 'sistema',
        actualizacion: doc.fin, estadoAnterior: 'Por Vencer', estadoActual: 'Vencido' }
    );
  } else if (doc.estado === 'Por Vencer') {
    eventos.push(
      { fechaCarga: doc.inicio, usuario: 'sistema',
        actualizacion: '(30 días antes del vencimiento)', estadoAnterior: 'Vigente', estadoActual: 'Por Vencer' }
    );
  }
  return eventos;
}

function badgeClsEstado(estado) {
  if (estado === 'Vigente')    return 'badge-vigente';
  if (estado === 'Por Vencer') return 'badge-por-vencer';
  if (estado === 'Vencido')    return 'badge-vencida';
  return '';
}

// =================================================
// MODAL DETALLES
// =================================================
let modalTipoIdx        = 0;
let modalFiltroEstado   = 'todos';
let modalPaginaActual   = 1;
let modalTotalFiltrados = 0;
const MODAL_FILAS_POR_PAG = 8;

function abrirDetalles(idx) {
  modalTipoIdx       = idx;
  modalFiltroEstado  = 'todos';
  modalPaginaActual  = 1;
  document.getElementById('modalSearch').value               = '';
  document.getElementById('modalDetallesTitulo').textContent = `Detalle de ${ALERTAS_DATA[idx].tipo}`;
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
    { key: 'todos',      label: `Todos (${total})`,         cls: '' },
    { key: 'Vencido',    label: `Vencido (${vencido})`,     cls: 'chip-red' },
    { key: 'Por Vencer', label: `Por Vencer (${porVenc})`,  cls: 'chip-amber' },
  ];

  document.getElementById('chipsContainer').innerHTML = chips.map(c =>
    `<button class="chip-summary ${c.cls}${modalFiltroEstado === c.key ? ' active' : ''}"
      onclick="setModalFiltro('${c.key}')">${c.label}</button>`
  ).join('');
}

function setModalFiltro(key) {
  modalFiltroEstado = key;
  modalPaginaActual = 1;
  renderChipsSummary();
  renderModalTabla();
}

function filtrarModal() {
  modalPaginaActual = 1;
  renderModalTabla();
}

function setModalPag(pag) {
  const totalPags = Math.ceil(modalTotalFiltrados / MODAL_FILAS_POR_PAG);
  if (pag < 1 || pag > totalPags) return;
  modalPaginaActual = pag;
  renderModalTabla();
}

function renderModalTabla() {
  const q    = document.getElementById('modalSearch').value.toLowerCase().trim();
  const docs = ALERTAS_DATA[modalTipoIdx].docs;

  const filtrados = docs.filter(d => {
    const matchEstado = modalFiltroEstado === 'todos' || d.estado === modalFiltroEstado;
    const matchQ      = !q || [d.documento, d.cod, d.nombre, d.rol, d.estado]
      .some(s => s.toLowerCase().includes(q));
    return matchEstado && matchQ;
  });

  modalTotalFiltrados  = filtrados.length;
  const totalPags      = Math.max(1, Math.ceil(filtrados.length / MODAL_FILAS_POR_PAG));
  if (modalPaginaActual > totalPags) modalPaginaActual = 1;

  const inicio = (modalPaginaActual - 1) * MODAL_FILAS_POR_PAG;
  const slice  = filtrados.slice(inicio, inicio + MODAL_FILAS_POR_PAG);

  const tbody = document.getElementById('modalTbody');
  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:28px;color:var(--gray-400)">Sin resultados</td></tr>`;
    renderModalPaginacion(0);
    return;
  }

  tbody.innerHTML = slice.map((d, i) => {
    const n       = inicio + i + 1;
    const badgeCls = d.estado === 'Vencido' ? 'badge-vencida' : 'badge-por-vencer';
    const diasTxt  = d.dias < 0 ? `${Math.abs(d.dias)} días vencido` : `${d.dias} días a vencer`;
    return `<tr>
      <td>${n}</td>
      <td>${d.nombre}</td>
      <td>${d.cod}</td>
      <td>${d.rol}</td>
      <td>${d.documento}</td>
      <td>${d.inicio}</td>
      <td>${d.fin}</td>
      <td><span class="badge ${badgeCls}"><span class="badge-dot"></span>${d.estado}</span></td>
      <td>${diasTxt}</td>
    </tr>`;
  }).join('');

  renderModalPaginacion(filtrados.length);
}

function renderModalPaginacion(total) {
  const infoEl = document.getElementById('modalPaginacionInfo');
  const btnsEl = document.getElementById('modalPaginacionBtns');
  if (!infoEl || !btnsEl) return;

  if (total === 0) {
    infoEl.textContent = 'Sin registros';
    btnsEl.innerHTML   = '';
    return;
  }

  const pag       = modalPaginaActual;
  const totalPags = Math.ceil(total / MODAL_FILAS_POR_PAG);
  const inicio    = (pag - 1) * MODAL_FILAS_POR_PAG;
  const fin       = Math.min(pag * MODAL_FILAS_POR_PAG, total);
  infoEl.textContent = `Mostrando ${inicio + 1}–${fin} de ${total} registros`;

  if (totalPags <= 1) { btnsEl.innerHTML = ''; return; }

  let html = `<button class="pag-btn pag-btn-nav" onclick="setModalPag(${pag - 1})"
    ${pag === 1 ? 'disabled' : ''}>‹</button>`;

  const start = Math.max(1, pag - 2);
  const end   = Math.min(totalPags, start + 4);
  for (let p = start; p <= end; p++) {
    html += `<button class="pag-btn ${p === pag ? 'active' : ''}"
      onclick="setModalPag(${p})">${p}</button>`;
  }

  html += `<button class="pag-btn pag-btn-nav" onclick="setModalPag(${pag + 1})"
    ${pag === totalPags ? 'disabled' : ''}>›</button>`;

  btnsEl.innerHTML = html;
}

function toggleExportDropdown() {
  document.getElementById('exportDropdown').classList.toggle('open');
}

function cerrarExportDropdown() {
  const dd = document.getElementById('exportDropdown');
  if (dd) dd.classList.remove('open');
}
