// =================================================
// REPORTE-PRECINTOS.JS
// Precintos > Reporte de Precintos: una fila por operador (Recibido por),
// con su saldo (stock) real de precintos — no todo lo que se le asigna se
// usa en el mismo mes o en una sola operación, así que el reporte sigue a
// la persona, no a la Asignación puntual. La grilla se queda simple (Total
// Asignado / Total Usado / Stock); el detalle cronológico tipo "cartola"
// (cada Asignación como entrada, cada uso reportado como salida, con el
// saldo después de cada movimiento) vive en un modal aparte ("Ver
// movimientos"), y "Precintos sin reportar" responde de un vistazo qué
// falta reportar para no dejar nada suelto — mismo espíritu que la planilla
// de control que se usaba antes de este módulo.
// =================================================

document.addEventListener('DOMContentLoaded', () => {
  poblarFiltroMaterialRep();
  renderTablaReportePrecintos();
});

// Resume en un solo estado dónde va el pipeline de firmas de un Detalle
// (Revisado → Autorizado → Finalizado → firma del operario en el móvil),
// con el mismo mapeo de color que ya usa calcularEstadoLote en Control de
// Precintos (gris = nada hecho, ámbar = en curso, azul = cerrado del lado
// oficina y a la espera de otra persona, verde = completo). Se muestra junto
// a cada movimiento de tipo "Asignación" en la cartola, para no perder esa
// trazabilidad aunque ya no sea una columna aparte de la grilla principal.
function estadoValidacionGrp(detalleGrp) {
  if (!detalleGrp) return { texto: '—', clase: 'badge-gris' };
  if (!detalleGrp.revisadoPor) return { texto: 'Por revisar', clase: 'badge-gris' };
  if (!detalleGrp.autorizadoPor || detalleGrp.estado !== 'Finalizado') return { texto: 'En revisión', clase: 'badge-por-vencer' };
  if (!detalleGrp.operarioFirmaPor) return { texto: 'Pendiente firma operario', clase: 'badge-finalizado' };
  return { texto: 'Firmado', clase: 'badge-vigente' };
}

// Un precinto cumple el filtro de "Consultar precinto" (Filtros avanzados)
// si matchea el N° de Precinto ingresado y/o el Estado del precinto elegido
// — se usa tanto para decidir qué operadores quedan en la grilla como para
// resaltar su movimiento puntual dentro del modal de movimientos.
function precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto) {
  if (precintoTexto && !f.precinto.toLowerCase().includes(precintoTexto)) return false;
  if (estadoPrecinto === 'disponible' && f.estado !== 'disponible') return false;
  if (estadoPrecinto === 'sin-reportar' && f.estado !== 'asignado') return false;
  if (estadoPrecinto === 'usado' && f.estado !== 'usado') return false;
  return true;
}

/* =================================================
   CARTOLA POR OPERADOR: Asignaciones (entradas) + usos reportados agrupados
   por evento (salidas), en orden cronológico, con saldo acumulado.
================================================= */

// Agrupa los usos de un Detalle/GRP por evento real (misma fecha + viaje +
// tipo de operación + terminal) — un operador puede reportar varios
// precintos para la misma operación, y en la cartola eso es UN movimiento
// de salida, no uno por precinto.
function agruparUsosPorEvento(detalleGrp) {
  const grupos = new Map();
  detalleGrp.detalle.forEach(d => {
    const clave = [d.fecha, d.viaje, d.tipoOperacion || '', d.terminal || ''].join('|');
    if (!grupos.has(clave)) {
      grupos.set(clave, { fecha: d.fecha, viaje: d.viaje, tipoOperacion: d.tipoOperacion || '', terminal: d.terminal || '', precintos: [] });
    }
    grupos.get(clave).precintos.push(d.precinto);
  });
  return [...grupos.values()];
}

// Arma la cartola completa de un operador: todas sus Asignaciones (no
// Anuladas) como movimientos de entrada, y todos los usos ya reportados en
// los Detalles/GRP de esas Asignaciones como movimientos de salida —
// ordenados por fecha, con el saldo (stock) recalculado después de cada uno.
function construirLedgerOperador(usuario) {
  const asignaciones = ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.recibidoPor === usuario && a.estado !== 'Anulada');
  const eventos = [];

  asignaciones.forEach(a => {
    eventos.push({
      tipo: 'asignacion',
      fecha: a.fecha,
      fechaISO: fechaDDMMYYYYaISO(a.fecha),
      asignacion: a,
      entregadoPor: a.entregadoPor,
      cantidad: a.precintos.length,
      precintos: [...a.precintos]
    });

    const detalleGrp = obtenerGenerarRegistroPorAsignacion(a.id);
    if (detalleGrp) {
      agruparUsosPorEvento(detalleGrp).forEach(g => {
        eventos.push({
          tipo: 'uso',
          fecha: g.fecha,
          fechaISO: fechaDDMMYYYYaISO(g.fecha),
          asignacion: a,
          detalleGrp,
          viaje: g.viaje,
          tipoOperacion: g.tipoOperacion,
          terminal: g.terminal,
          cantidad: g.precintos.length,
          precintos: g.precintos
        });
      });
    }
  });

  // Orden cronológico; en la misma fecha, la entrada (Asignación) va antes
  // que las salidas (Uso) — así el saldo nunca se ve negativo en la cartola.
  eventos.sort((x, y) => {
    if (x.fechaISO !== y.fechaISO) return x.fechaISO < y.fechaISO ? -1 : 1;
    if (x.tipo !== y.tipo) return x.tipo === 'asignacion' ? -1 : 1;
    return 0;
  });

  let saldo = 0;
  eventos.forEach(e => {
    saldo += e.tipo === 'asignacion' ? e.cantidad : -e.cantidad;
    e.saldo = saldo;
  });

  const totalAsignado = eventos.filter(e => e.tipo === 'asignacion').reduce((s, e) => s + e.cantidad, 0);
  const totalUsado = eventos.filter(e => e.tipo === 'uso').reduce((s, e) => s + e.cantidad, 0);

  return { usuario, eventos, totalAsignado, totalUsado, stock: totalAsignado - totalUsado };
}

/* =================================================
   FILTRADO + GRILLA
================================================= */
function filasReportePrecintosFiltradas() {
  const texto = document.getElementById('searchReportePrecintos').value.trim().toLowerCase();
  const precintoTexto = document.getElementById('filterAvzRepPrecinto').value.trim().toLowerCase();
  const estadoPrecinto = document.getElementById('filterAvzRepEstadoPrecinto').value;
  const material = document.getElementById('filterAvzRepMaterial').value;

  const operadores = [...new Set(ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.estado !== 'Anulada').map(a => a.recibidoPor))];

  return operadores.map(usuario => construirLedgerOperador(usuario)).filter(ledger => {
    if (texto && !nombreColaborador(ledger.usuario).toLowerCase().includes(texto)) return false;

    if (material && !ledger.eventos.some(e => e.precintos.some(p => obtenerLoteDePrecinto(p)?.material === material))) return false;

    // "Consultar precinto": el operador solo queda si alguno de los
    // precintos que tuvo alguna vez asignados cumple lo pedido.
    if (precintoTexto || estadoPrecinto) {
      const todosPrecintos = obtenerTodosLosPrecintosConEstado();
      const precintosDelOperador = todosPrecintos.filter(f => f.asignacion && f.asignacion.recibidoPor === ledger.usuario);
      if (!precintosDelOperador.some(f => precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto))) return false;
    }
    return true;
  });
}

// Una fila de la cartola: "Asignación" (entrada) o "Uso" (salida), con
// material y numeración de precintos, terminal, cantidad y el saldo
// resultante — columnas detalladas a propósito, para no perder trazabilidad
// frente a la planilla que reemplaza. "resaltar" marca la fila cuando viene
// de una búsqueda por "Consultar precinto" (N° de Precinto puntual).
function filaEventoLedgerHTML(e, resaltar) {
  const materiales = [...new Set(e.precintos.map(p => obtenerLoteDePrecinto(p)?.material).filter(Boolean))];
  const numeracion = formatearRangosPrecintos(e.precintos);
  const esAsignacion = e.tipo === 'asignacion';

  const badge = esAsignacion
    ? `<span class="badge badge-vigente"><span class="badge-dot"></span>Asignación</span>`
    : `<span class="badge badge-por-vencer"><span class="badge-dot"></span>Uso</span>`;

  let detalleTexto;
  if (esAsignacion) {
    const validacion = estadoValidacionGrp(obtenerGenerarRegistroPorAsignacion(e.asignacion.id));
    detalleTexto = `Entregado por ${nombreColaborador(e.entregadoPor)} — ${e.asignacion.codigo}
      <span class="badge ${validacion.clase} badge-ledger-inline"><span class="badge-dot"></span>${validacion.texto}</span>`;
  } else {
    detalleTexto = `${e.tipoOperacion || '—'} · N° Viaje ${e.viaje}`;
  }

  const cantidadCelda = esAsignacion
    ? `<span class="evento-cantidad-entrada">+${e.cantidad}</span>`
    : `<span class="evento-cantidad-salida">-${e.cantidad}</span>`;

  const opciones = esAsignacion
    ? `<button class="btn-accion btn-ver" title="Ver Detalle/GRP" onclick="abrirModalVerEtiquetasPorAsignacion(${e.asignacion.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button class="btn-accion btn-descargar-asig" title="Descargar constancia de la Asignación" onclick="descargarReporteAsignacion(${e.asignacion.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>`
    : '—';

  return `<tr class="${esAsignacion ? 'fila-evento-asignacion' : 'fila-evento-uso'}${resaltar ? ' precinto-resaltado' : ''}">
    <td>${e.fecha}</td>
    <td>${badge}</td>
    <td>${detalleTexto}</td>
    <td>${materiales.length ? materiales.join(' / ') : '—'}</td>
    <td>${numeracion}</td>
    <td>${e.terminal || '—'}</td>
    <td>${cantidadCelda}</td>
    <td><strong>${e.saldo}</strong></td>
    <td class="opciones">${opciones}</td>
  </tr>`;
}

function renderTablaReportePrecintos() {
  const ledgers = filasReportePrecintosFiltradas();
  const tbody = document.getElementById('tbodyReportePrecintos');

  actualizarKpisReportePrecintos();
  actualizarBadgeSinReportar();

  if (!ledgers.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="submodulo-tabla-vacio">No se encontraron operadores con precintos asignados.</td></tr>`;
    return;
  }

  tbody.innerHTML = ledgers.map((ledger) => `
    <tr>
      <td class="codigo-col">${nombreColaborador(ledger.usuario)}</td>
      <td>${ledger.totalAsignado}</td>
      <td>${ledger.totalUsado}</td>
      <td>${ledger.stock > 0 ? `<span class="asignados-pendiente">${ledger.stock}</span>` : '0'}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver movimientos" onclick="abrirModalLedgerOperador('${ledger.usuario}')" ${ledger.eventos.length ? '' : 'disabled'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

// Modal "Movimientos de <operador>": la cartola completa (Asignaciones +
// usos), en vez de una fila expandible dentro de la grilla — así la grilla
// principal se queda simple (Total Asignado / Usado / Stock) y el detalle
// pesado solo aparece cuando de verdad hace falta consultarlo.
function abrirModalLedgerOperador(usuario) {
  const ledger = construirLedgerOperador(usuario);
  const precintoTexto = document.getElementById('filterAvzRepPrecinto').value.trim().toLowerCase();
  const estadoPrecinto = document.getElementById('filterAvzRepEstadoPrecinto').value;
  const desde = document.getElementById('filterAvzRepFechaDesde').value;
  const hasta = document.getElementById('filterAvzRepFechaHasta').value;

  document.getElementById('ledgerOperadorNombre').textContent = nombreColaborador(usuario);
  document.getElementById('ledgerOperadorTotalAsignado').textContent = ledger.totalAsignado;
  document.getElementById('ledgerOperadorTotalUsado').textContent = ledger.totalUsado;
  document.getElementById('ledgerOperadorStock').textContent = ledger.stock;

  // El período (Fecha desde/hasta de Filtros avanzados) solo decide qué
  // movimientos se ven en la cartola — el Saldo de cada uno ya se calculó
  // sobre el historial completo, así que sigue siendo el saldo real aunque
  // el período oculte movimientos anteriores.
  const eventosVisibles = ledger.eventos.filter(e => {
    if (desde && e.fechaISO < desde) return false;
    if (hasta && e.fechaISO > hasta) return false;
    return true;
  });

  const tbody = document.getElementById('tbodyLedgerOperador');
  tbody.innerHTML = eventosVisibles.length
    ? eventosVisibles.map(e => {
        const resaltar = (precintoTexto || estadoPrecinto) && e.precintos.some(p => {
          const f = obtenerTodosLosPrecintosConEstado().find(x => x.precinto === p);
          return f && precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto);
        });
        return filaEventoLedgerHTML(e, resaltar);
      }).join('')
    : `<tr><td colspan="9" class="submodulo-tabla-vacio">Sin movimientos en el período filtrado.</td></tr>`;

  abrirModal('modalLedgerOperador');
}

/* =================================================
   PRECINTOS SIN REPORTAR: entregados a alguien pero todavía sin uso
   reportado, para poder revisarlos de un vistazo y no dejar nada suelto al
   cierre del período — responde directamente "¿qué me falta reportar?".
================================================= */
function obtenerPrecintosSinReportarGlobal() {
  return obtenerTodosLosPrecintosConEstado().filter(f => f.estado === 'asignado');
}

function actualizarBadgeSinReportar() {
  const badge = document.getElementById('badgeSinReportarTotal');
  if (!badge) return;
  badge.textContent = `(${obtenerPrecintosSinReportarGlobal().length})`;
}

// Ids de los selects de filtro del modal — se repueblan cada vez que se abre
// porque las opciones (qué materiales/operadores/lotes tienen pendientes)
// dependen de lo que haya sin reportar en ese momento.
const SIN_REPORTAR_IDS_FILTROS = ['filterSinReportarPrecinto', 'filterSinReportarMaterial', 'filterSinReportarOperador', 'filterSinReportarLote'];

function poblarFiltrosPrecintosSinReportar(pendientes) {
  const materiales = [...new Set(pendientes.map(f => f.material))].sort();
  const operadores = [...new Set(pendientes.map(f => f.asignacion.recibidoPor))];
  const lotes = [...new Set(pendientes.map(f => f.registroCodigo))].sort();

  document.getElementById('filterSinReportarMaterial').innerHTML = '<option value="">Todos</option>' +
    materiales.map(m => `<option value="${m}">${m}</option>`).join('');

  document.getElementById('filterSinReportarOperador').innerHTML = '<option value="">Todos</option>' +
    operadores.map(u => `<option value="${u}">${nombreColaborador(u)}</option>`).join('');

  document.getElementById('filterSinReportarLote').innerHTML = '<option value="">Todos</option>' +
    lotes.map(l => `<option value="${l}">${l}</option>`).join('');
}

function renderTablaPrecintosSinReportar() {
  const precintoTexto = document.getElementById('filterSinReportarPrecinto').value.trim().toLowerCase();
  const material = document.getElementById('filterSinReportarMaterial').value;
  const operador = document.getElementById('filterSinReportarOperador').value;
  const lote = document.getElementById('filterSinReportarLote').value;

  const pendientes = obtenerPrecintosSinReportarGlobal()
    .filter(f => {
      if (precintoTexto && !f.precinto.toLowerCase().includes(precintoTexto)) return false;
      if (material && f.material !== material) return false;
      if (operador && f.asignacion.recibidoPor !== operador) return false;
      if (lote && f.registroCodigo !== lote) return false;
      return true;
    })
    .sort((a, b) => numeroDePrecinto(a.precinto) - numeroDePrecinto(b.precinto));

  const tbody = document.getElementById('tbodyPrecintosSinReportar');
  tbody.innerHTML = pendientes.length
    ? pendientes.map(f => `
      <tr>
        <td>${f.precinto}</td>
        <td>${f.material}</td>
        <td>${f.registroCodigo}</td>
        <td>${f.asignacion.codigo}</td>
        <td>${nombreColaborador(f.asignacion.recibidoPor)}</td>
        <td>${f.asignacion.fecha}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="submodulo-tabla-vacio">No hay precintos pendientes de reportar con estos filtros.</td></tr>`;
}

function filtrarPrecintosSinReportar() {
  renderTablaPrecintosSinReportar();
}

function limpiarFiltrosPrecintosSinReportar() {
  SIN_REPORTAR_IDS_FILTROS.forEach(id => { document.getElementById(id).value = ''; });
  renderTablaPrecintosSinReportar();
}

function abrirModalPrecintosSinReportar() {
  const pendientes = obtenerPrecintosSinReportarGlobal();
  SIN_REPORTAR_IDS_FILTROS.forEach(id => { document.getElementById(id).value = ''; });
  poblarFiltrosPrecintosSinReportar(pendientes);
  renderTablaPrecintosSinReportar();
  abrirModal('modalPrecintosSinReportar');
}

function filtrarReportePrecintos() {
  renderTablaReportePrecintos();
  repActualizarBotonFiltrosAvanzados();
}

function limpiarFiltrosReportePrecintos() {
  document.getElementById('searchReportePrecintos').value = '';
  repLimpiarCamposFiltrosAvanzados();
  filtrarReportePrecintos();
}

/* =================================================
   KPIs: precintos en stock (entregados y aún sin reportar como usados) por
   material — equivalente digital de los casilleros manuales de la planilla
   de referencia (Tambor / De Alambre / Plástico / De Acero-SISESAT).
================================================= */
const KPI_REP_COLORES = ['#00B4D8', '#6D28D9', '#16A34A', '#D97706', '#DC2626', '#0E7490'];

function actualizarKpisReportePrecintos() {
  const cont = document.getElementById('kpiGridReportePrecintos');
  if (!cont) return;
  const todosPrecintos = obtenerTodosLosPrecintosConEstado();
  const materiales = cargarMaterialesPrecinto();

  cont.innerHTML = materiales.map((m, i) => {
    const enStock = todosPrecintos.filter(f => f.material === m.nombre && f.estado === 'asignado').length;
    const color = KPI_REP_COLORES[i % KPI_REP_COLORES.length];
    return `<div class="kpi-card" style="border-top:3px solid ${color}">
      <div class="kpi-icon-box" style="color:${color};background:${color}1A">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <div class="kpi-value">${enStock}</div>
      <div class="kpi-label">${m.nombre} en stock</div>
    </div>`;
  }).join('');
}

/* =================================================
   FILTROS AVANZADOS — mismo patrón que Seguimiento de Operaciones
   (seguimiento-operaciones.js): modal lateral + badge con la cantidad de
   filtros activos. "Consultar precinto" (N° de Precinto + Estado del
   precinto) vive acá para no saturar la barra de filtros principal.
================================================= */
const REP_IDS_FILTROS_AVANZADOS = [
  'filterAvzRepPrecinto', 'filterAvzRepEstadoPrecinto', 'filterAvzRepMaterial',
  'filterAvzRepFechaDesde', 'filterAvzRepFechaHasta'
];

function poblarFiltroMaterialRep() {
  const select = document.getElementById('filterAvzRepMaterial');
  if (!select) return;
  select.innerHTML = '<option value="">Todos</option>' +
    cargarMaterialesPrecinto().map(m => `<option value="${m.nombre}">${m.nombre}</option>`).join('');
}

function repLimpiarCamposFiltrosAvanzados() {
  REP_IDS_FILTROS_AVANZADOS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function repContarFiltrosAvanzadosActivos() {
  return REP_IDS_FILTROS_AVANZADOS.reduce((acc, id) => acc + (document.getElementById(id)?.value ? 1 : 0), 0);
}

function repActualizarBotonFiltrosAvanzados() {
  const btn = document.getElementById('btnFiltrosAvanzadosRep');
  const badge = document.getElementById('filtrosAvanzadosRepBadge');
  if (!btn || !badge) return;
  const activos = repContarFiltrosAvanzadosActivos();
  btn.classList.toggle('activo', activos > 0);
  badge.style.display = activos > 0 ? '' : 'none';
  badge.textContent = activos;
}

function abrirModalFiltrosAvanzadosRep() {
  abrirModal('modalFiltrosAvanzadosRep');
}

function aplicarFiltrosAvanzadosModalRep() {
  cerrarModal('modalFiltrosAvanzadosRep');
  filtrarReportePrecintos();
}

function limpiarFiltrosAvanzadosModalRep() {
  repLimpiarCamposFiltrosAvanzados();
  cerrarModal('modalFiltrosAvanzadosRep');
  filtrarReportePrecintos();
}

/* =================================================
   DESCARGA: Excel (CSV) y PDF — una fila por movimiento (Asignación o Uso)
   de cada operador visible, mismas columnas que la planilla de referencia
   (Fecha / Entregado por / Recibido por / Cantidad / Numeración / Tipo de
   Operación / N° Viaje / Terminal / Stock) más Material, que el sistema sí
   traza y la planilla no.
================================================= */
function toggleDownloadDropdownReportePrecintos() {
  document.getElementById('downloadDropdownReportePrecintos').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.btn-download-wrap')) {
    const dd = document.getElementById('downloadDropdownReportePrecintos');
    if (dd) dd.classList.remove('open');
  }
});

function obtenerFilasExportReportePrecintos() {
  const desde = document.getElementById('filterAvzRepFechaDesde').value;
  const hasta = document.getElementById('filterAvzRepFechaHasta').value;

  return filasReportePrecintosFiltradas().flatMap(ledger => {
    const eventos = ledger.eventos.filter(e => {
      if (desde && e.fechaISO < desde) return false;
      if (hasta && e.fechaISO > hasta) return false;
      return true;
    });
    return eventos.map(e => {
      const materiales = [...new Set(e.precintos.map(p => obtenerLoteDePrecinto(p)?.material).filter(Boolean))];
      return {
        fecha: e.fecha,
        entregadoPor: e.tipo === 'asignacion' ? nombreColaborador(e.entregadoPor) : '—',
        recibidoPor: nombreColaborador(ledger.usuario),
        cantidad: e.tipo === 'asignacion' ? e.cantidad : -e.cantidad,
        numeracion: formatearRangosPrecintos(e.precintos),
        material: materiales.length ? materiales.join(' / ') : '—',
        tipoOperacion: e.tipo === 'uso' ? (e.tipoOperacion || '—') : '—',
        viaje: e.tipo === 'uso' ? e.viaje : '—',
        terminal: e.tipo === 'uso' ? (e.terminal || '—') : '—',
        stock: e.saldo
      };
    });
  });
}

function exportarReportePrecintosExcel() {
  const filas = obtenerFilasExportReportePrecintos();
  const headers = ['Fecha', 'Entregado por', 'Recibido por', 'Cantidad', 'Numeración', 'Material', 'Tipo de Operación', 'N° Viaje', 'Terminal', 'Cantidad en Stock'];

  const csv = [headers, ...filas.map(f => [f.fecha, f.entregadoPor, f.recibidoPor, f.cantidad, f.numeracion, f.material, f.tipoOperacion, f.viaje, f.terminal, f.stock])]
    .map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom  = '﻿'; // BOM para que Excel abra UTF-8 correctamente
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'reporte-precintos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  document.getElementById('downloadDropdownReportePrecintos').classList.remove('open');
  mostrarToast('Exportación Excel descargada correctamente.');
}

function exportarReportePrecintosPDF() {
  const filas = obtenerFilasExportReportePrecintos();
  const filasHTML = filas.map(f => `
    <tr>
      <td>${f.fecha}</td>
      <td>${f.entregadoPor}</td>
      <td>${f.recibidoPor}</td>
      <td>${f.cantidad}</td>
      <td>${f.numeracion}</td>
      <td>${f.material}</td>
      <td>${f.tipoOperacion}</td>
      <td>${f.viaje}</td>
      <td>${f.terminal}</td>
      <td>${f.stock}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Reporte de Precintos</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 10.5px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 12px; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 6px 8px; text-align: left;
             font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 6px 8px; border-bottom: 1px solid #eee; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <h2>Reporte de Precintos — Registro de Control de Precintos</h2>
    <table>
      <thead>
        <tr><th>Fecha</th><th>Entregado por</th><th>Recibido por</th><th>Cantidad</th><th>Numeración</th><th>Material</th><th>Tipo de Operación</th><th>N° Viaje</th><th>Terminal</th><th>Stock</th></tr>
      </thead>
      <tbody>${filasHTML}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();

  document.getElementById('downloadDropdownReportePrecintos').classList.remove('open');
}
