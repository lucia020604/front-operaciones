// =================================================
// MOCK DATA
// =================================================
const NOM_DATA = [
  { id:'NOM001', per:'PER001', cliente:'Sandra Motors',  locacion:'Callao',   estado:'Activo',    factura:'Pendiente',  inicio:'02/05/2025', fin:'02/09/2025', compartida:false,
    detalles:[
      { ref:'Cotización',     servicios:'Inspección Visual',         producto:'Petróleo Crudo',  costo:'S/ 3,200', costoAct:'S/ 3,200' },
      { ref:'Acuerdo Global', servicios:'Muestreo y Análisis',       producto:'GLP',             costo:'S/ 1,800', costoAct:'S/ 1,950' },
      { ref:'Contrato',       servicios:'Certificación de Calidad',  producto:'Diésel B5',       costo:'S/ 5,500', costoAct:'S/ 5,500' },
    ]},
  { id:'NOM002', per:'PER002', cliente:'PETROPERÚ',      locacion:'Mollendo', estado:'Activo',    factura:'Facturado',  inicio:'15/04/2025', fin:'15/08/2025', compartida:true,
    detalles:[
      { ref:'Contrato',       servicios:'Muestreo en Buque',         producto:'Fuel Oil',        costo:'S/ 4,100', costoAct:'S/ 4,100' },
      { ref:'Cotización',     servicios:'Pesaje y Medición',         producto:'Gasolina 90',     costo:'S/ 2,600', costoAct:'S/ 2,750' },
    ]},
  { id:'NOM003', per:'PER003', cliente:'REPSOL',         locacion:'ILO',      estado:'Inactivo',  factura:'Anulado',    inicio:'10/03/2025', fin:'10/07/2025', compartida:false,
    detalles:[
      { ref:'Acuerdo Global', servicios:'Control de Temperatura',    producto:'Petróleo Crudo',  costo:'S/ 2,900', costoAct:'S/ 2,900' },
    ]},
  { id:'NOM004', per:'PER004', cliente:'MOBIL',          locacion:'Callao',   estado:'Activo',    factura:'Pendiente',  inicio:'01/05/2025', fin:'01/09/2025', compartida:false,
    detalles:[
      { ref:'Contrato',       servicios:'Inspección de Tanques',     producto:'Diésel B2',       costo:'S/ 6,200', costoAct:'S/ 6,500' },
      { ref:'Cotización',     servicios:'Muestreo y Análisis',       producto:'GLP',             costo:'S/ 1,400', costoAct:'S/ 1,400' },
      { ref:'Acuerdo Global', servicios:'Certificación ISO',         producto:'Gasolina 95',     costo:'S/ 3,800', costoAct:'S/ 3,900' },
    ]},
  { id:'NOM005', per:'PER005', cliente:'PRIMAX',         locacion:'Pisco',    estado:'Finalizado',factura:'Facturado',  inicio:'20/01/2025', fin:'20/04/2025', compartida:true,
    detalles:[
      { ref:'Contrato',       servicios:'Inspección Visual',         producto:'Gasolina 90',     costo:'S/ 2,100', costoAct:'S/ 2,100' },
    ]},
  { id:'NOM006', per:'PER001', cliente:'Sandra Motors',  locacion:'Callao',   estado:'Finalizado',factura:'Facturado',  inicio:'10/02/2025', fin:'10/05/2025', compartida:false,
    detalles:[
      { ref:'Cotización',     servicios:'Muestreo en Buque',         producto:'Petróleo Crudo',  costo:'S/ 3,600', costoAct:'S/ 3,600' },
      { ref:'Contrato',       servicios:'Control de Calidad',        producto:'Diésel B5',       costo:'S/ 4,900', costoAct:'S/ 5,100' },
    ]},
  { id:'NOM007', per:'PER006', cliente:'EXXON MOBIL',    locacion:'Ica',      estado:'Activo',    factura:'Pendiente',  inicio:'05/05/2025', fin:'05/09/2025', compartida:false,
    detalles:[
      { ref:'Acuerdo Global', servicios:'Pesaje y Medición',         producto:'Fuel Oil',        costo:'S/ 5,200', costoAct:'S/ 5,200' },
      { ref:'Contrato',       servicios:'Inspección de Tanques',     producto:'GLP',             costo:'S/ 3,100', costoAct:'S/ 3,350' },
    ]},
  { id:'NOM008', per:'PER007', cliente:'PETROPERÚ',      locacion:'Mollendo', estado:'Finalizado',factura:'Facturado',  inicio:'01/01/2025', fin:'01/04/2025', compartida:true,
    detalles:[
      { ref:'Contrato',       servicios:'Certificación de Calidad',  producto:'Petróleo Crudo',  costo:'S/ 7,800', costoAct:'S/ 7,800' },
    ]},
  { id:'NOM009', per:'PER008', cliente:'REPSOL',         locacion:'Callao',   estado:'Activo',    factura:'Pendiente',  inicio:'18/05/2025', fin:'18/10/2025', compartida:false,
    detalles:[
      { ref:'Cotización',     servicios:'Muestreo y Análisis',       producto:'Diésel B2',       costo:'S/ 2,800', costoAct:'S/ 2,900' },
      { ref:'Acuerdo Global', servicios:'Inspección Visual',         producto:'Gasolina 90',     costo:'S/ 1,900', costoAct:'S/ 1,900' },
      { ref:'Contrato',       servicios:'Control de Temperatura',    producto:'Fuel Oil',        costo:'S/ 4,400', costoAct:'S/ 4,600' },
    ]},
  { id:'NOM010', per:'PER009', cliente:'MOBIL',          locacion:'Ilo',      estado:'Finalizado',factura:'Facturado',  inicio:'15/02/2025', fin:'15/05/2025', compartida:false,
    detalles:[
      { ref:'Contrato',       servicios:'Pesaje y Medición',         producto:'Petróleo Crudo',  costo:'S/ 5,600', costoAct:'S/ 5,600' },
    ]},
  { id:'NOM011', per:'PER002', cliente:'PETROPERÚ',      locacion:'Callao',   estado:'Activo',    factura:'Facturado',  inicio:'22/04/2025', fin:'22/08/2025', compartida:true,
    detalles:[
      { ref:'Acuerdo Global', servicios:'Inspección de Tanques',     producto:'GLP',             costo:'S/ 3,300', costoAct:'S/ 3,300' },
      { ref:'Cotización',     servicios:'Certificación ISO',         producto:'Gasolina 95',     costo:'S/ 2,700', costoAct:'S/ 2,850' },
    ]},
  { id:'NOM012', per:'PER010', cliente:'PRIMAX',         locacion:'Pisco',    estado:'Finalizado',factura:'Facturado',  inicio:'05/03/2025', fin:'05/06/2025', compartida:false,
    detalles:[
      { ref:'Contrato',       servicios:'Muestreo en Buque',         producto:'Diésel B5',       costo:'S/ 4,200', costoAct:'S/ 4,200' },
    ]},
  { id:'NOM013', per:'PER011', cliente:'Sandra Motors',  locacion:'Ica',      estado:'Inactivo',  factura:'Anulado',    inicio:'28/03/2025', fin:'28/06/2025', compartida:false,
    detalles:[
      { ref:'Cotización',     servicios:'Control de Calidad',        producto:'Gasolina 90',     costo:'S/ 1,600', costoAct:'S/ 1,600' },
    ]},
  { id:'NOM014', per:'PER012', cliente:'EXXON MOBIL',    locacion:'Callao',   estado:'Activo',    factura:'Pendiente',  inicio:'12/05/2025', fin:'12/09/2025', compartida:false,
    detalles:[
      { ref:'Contrato',       servicios:'Inspección Visual',         producto:'Petróleo Crudo',  costo:'S/ 6,800', costoAct:'S/ 7,000' },
      { ref:'Acuerdo Global', servicios:'Muestreo y Análisis',       producto:'Fuel Oil',        costo:'S/ 3,500', costoAct:'S/ 3,500' },
    ]},
  { id:'NOM015', per:'PER013', cliente:'REPSOL',         locacion:'Mollendo', estado:'Finalizado',factura:'Facturado',  inicio:'18/01/2025', fin:'18/04/2025', compartida:true,
    detalles:[
      { ref:'Contrato',       servicios:'Certificación de Calidad',  producto:'Diésel B2',       costo:'S/ 5,100', costoAct:'S/ 5,100' },
    ]},
];

// =================================================
// STATE
// =================================================
let donutNom = null;
let filteredNom = [];

// =================================================
// INIT
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  poblarClientes();
  aplicarFiltros();
});

function poblarClientes() {
  const clientes = [...new Set(NOM_DATA.map(n => n.cliente))].sort();
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
  const cliente    = document.getElementById('filterCliente').value;
  const per        = document.getElementById('filterPer').value.toLowerCase().trim();
  const nom        = document.getElementById('filterNom').value.toLowerCase().trim();
  const desde      = document.getElementById('filterDesde').value;
  const hasta      = document.getElementById('filterHasta').value;
  const factura    = document.getElementById('filterFactura').value;
  const compartida = document.getElementById('filterCompartida').checked;

  filteredNom = NOM_DATA.filter(n => {
    if (cliente    && n.cliente !== cliente) return false;
    if (per        && !n.per.toLowerCase().includes(per)) return false;
    if (nom        && !n.id.toLowerCase().includes(nom)) return false;
    if (factura    && n.factura !== factura) return false;
    if (compartida && !n.compartida) return false;
    if (desde || hasta) {
      const fechaIni = parseFecha(n.inicio);
      if (desde && fechaIni < new Date(desde)) return false;
      if (hasta && fechaIni > new Date(hasta)) return false;
    }
    return true;
  });

  actualizarKPIs();
  renderTabla();
}

function parseFecha(str) {
  const [d, m, y] = str.split('/');
  return new Date(`${y}-${m}-${d}`);
}

function limpiarFiltros() {
  document.getElementById('filterCliente').value    = '';
  document.getElementById('filterPer').value        = '';
  document.getElementById('filterNom').value        = '';
  document.getElementById('filterDesde').value      = '';
  document.getElementById('filterHasta').value      = '';
  document.getElementById('filterFactura').value    = '';
  document.getElementById('filterCompartida').checked = false;
  aplicarFiltros();
}

// =================================================
// KPIs + DONUT
// =================================================
function actualizarKPIs() {
  const vigente    = filteredNom.filter(n => n.estado === 'Activo').length;
  const pendiente  = filteredNom.filter(n => n.factura === 'Pendiente').length;
  const finalizado = filteredNom.filter(n => n.estado === 'Finalizado').length;
  const total      = filteredNom.length;

  document.getElementById('kpiVigente').textContent    = vigente;
  document.getElementById('kpiPendiente').textContent  = pendiente;
  document.getElementById('kpiFinalizado').textContent = finalizado;
  document.getElementById('kpiTotalNom').textContent   = total;

  const ctx = document.getElementById('donutNom').getContext('2d');
  if (donutNom) donutNom.destroy();
  donutNom = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Vigente','Pendiente','Finalizado'],
      datasets: [{ data: [vigente, pendiente, finalizado], backgroundColor: ['#22C55E','#94A3B8','#F59E0B'], borderWidth: 2, borderColor: '#fff', hoverOffset: 4 }]
    },
    options: { cutout: '70%', plugins: { legend: { display: false } }, animation: { duration: 400 } }
  });
}

// =================================================
// TABLA
// =================================================
function renderTabla() {
  const tbody = document.getElementById('tbodyNom');
  tbody.innerHTML = '';

  if (filteredNom.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:32px;color:var(--gray-400)">Sin resultados para los filtros aplicados</td></tr>';
    return;
  }

  filteredNom.forEach((n, idx) => {
    const rowId = `nom-${n.id}`;

    const estadoBadge   = n.estado === 'Activo'
      ? '<span class="badge badge-activo"><span class="badge-dot"></span>Activo</span>'
      : n.estado === 'Inactivo'
        ? '<span class="badge badge-inactivo"><span class="badge-dot"></span>Inactivo</span>'
        : '<span class="badge badge-vigente" style="background:#FEF3C7;color:#92400E;border-color:#FDE68A"><span class="badge-dot" style="background:#D97706"></span>Finalizado</span>';

    const factBadge = n.factura === 'Facturado'
      ? '<span class="badge badge-activo"><span class="badge-dot"></span>Facturado</span>'
      : n.factura === 'Pendiente'
        ? '<span class="badge badge-por-vencer"><span class="badge-dot"></span>Pendiente</span>'
        : '<span class="badge badge-inactivo"><span class="badge-dot"></span>Anulado</span>';

    // Main row
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${n.id}</strong></td>
      <td>${n.per}</td>
      <td>${n.cliente}</td>
      <td>${n.locacion}</td>
      <td>${estadoBadge}</td>
      <td>${factBadge}</td>
      <td>${n.inicio}</td>
      <td>${n.fin}</td>
      <td>
        <button class="btn-expand" id="btn-${rowId}" onclick="toggleSubtable('${rowId}')" title="Ver detalles">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>
        </button>
      </td>`;
    tbody.appendChild(tr);

    // Sub-table row
    const subTr = document.createElement('tr');
    subTr.className = 'subtable-row';
    subTr.id = `sub-${rowId}`;

    const subRows = n.detalles.map(d =>
      `<tr>
        <td>${d.ref}</td>
        <td>${d.servicios}</td>
        <td>${d.producto}</td>
        <td>${d.costo}</td>
        <td>${d.costoAct}</td>
      </tr>`
    ).join('');

    subTr.innerHTML = `
      <td colspan="10">
        <div class="subtable-inner">
          <table class="subtable">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Servicios</th>
                <th>Producto</th>
                <th>Costo</th>
                <th>Costo Actualizado</th>
              </tr>
            </thead>
            <tbody>${subRows}</tbody>
          </table>
        </div>
      </td>`;
    tbody.appendChild(subTr);
  });
}

function toggleSubtable(rowId) {
  const subRow = document.getElementById(`sub-${rowId}`);
  const btn    = document.getElementById(`btn-${rowId}`);
  const open   = subRow.classList.toggle('open');
  btn.classList.toggle('expanded', open);
}

function exportarNom() {
  mostrarToast('Exportando reporte de nominaciones...');
}
