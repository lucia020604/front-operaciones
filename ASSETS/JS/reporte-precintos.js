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

// Un precinto cumple el filtro de "Consultar precinto" (Filtros avanzados)
// si matchea el N° de Precinto ingresado y/o el Estado del precinto elegido
// — se usa tanto para decidir qué operadores quedan en la grilla como para
// resaltar su movimiento puntual dentro del modal de movimientos.
function precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto) {
  if (precintoTexto && !f.precinto.toLowerCase().includes(precintoTexto)) return false;
  if (estadoPrecinto === 'disponible' && f.estado !== 'disponible') return false;
  if (estadoPrecinto === 'sin-reportar' && f.estado !== 'asignado') return false;
  if (estadoPrecinto === 'usado' && f.estado !== 'usado') return false;
  if (estadoPrecinto === 'scrap' && f.estado !== 'scrap') return false;
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

// Arma la cartola completa de un operador: todas sus Asignaciones como
// movimientos de entrada, y todos los usos ya reportados en los
// Detalles/GRP de esas Asignaciones como movimientos de salida — ordenados
// por fecha, con el saldo (stock) recalculado después de cada uno.
function construirLedgerOperador(usuario) {
  const asignaciones = ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.recibidoPor === usuario);
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

    // Scrap: no tiene fecha propia en el dato (todavía no llega ese detalle
    // desde la app móvil), así que se ubica en la cartola en la misma fecha
    // que su Asignación de origen — mismo criterio que usa "uso" cuando
    // faltan más datos. No es una salida real de stock (ver más abajo, no
    // mueve el saldo): es un aviso aparte, ya contado en "Total Scrap".
    if (a.scrap && a.scrap.length) {
      eventos.push({
        tipo: 'scrap',
        fecha: a.fecha,
        fechaISO: fechaDDMMYYYYaISO(a.fecha),
        asignacion: a,
        cantidad: a.scrap.length,
        precintos: [...a.scrap]
      });
    }
  });

  // Orden cronológico; en la misma fecha, la entrada (Asignación) va primero,
  // así el saldo nunca se ve negativo en la cartola — Uso y Scrap quedan
  // después, en cualquier orden entre ellos.
  eventos.sort((x, y) => {
    if (x.fechaISO !== y.fechaISO) return x.fechaISO < y.fechaISO ? -1 : 1;
    if (x.tipo !== y.tipo) return x.tipo === 'asignacion' ? -1 : 1;
    return 0;
  });

  // El Scrap no descuenta del saldo: es informativo (precintos entregados
  // que quedaron dañados), no una salida de stock reportada como uso — ver
  // totalScrap más abajo, que sí lo cuenta aparte.
  let saldo = 0;
  eventos.forEach(e => {
    if (e.tipo === 'asignacion') saldo += e.cantidad;
    else if (e.tipo === 'uso') saldo -= e.cantidad;
    e.saldo = saldo;
  });

  const totalAsignado = eventos.filter(e => e.tipo === 'asignacion').reduce((s, e) => s + e.cantidad, 0);
  const totalUsado = eventos.filter(e => e.tipo === 'uso').reduce((s, e) => s + e.cantidad, 0);
  const totalScrap = asignaciones.reduce((s, a) => s + (a.scrap ? a.scrap.length : 0), 0);

  return { usuario, eventos, totalAsignado, totalUsado, totalScrap, stock: totalAsignado - totalUsado };
}

/* =================================================
   FILTRADO + GRILLA
================================================= */
function filasReportePrecintosFiltradas() {
  const texto = document.getElementById('searchReportePrecintos').value.trim().toLowerCase();
  const precintoTexto = document.getElementById('filterAvzRepPrecinto').value.trim().toLowerCase();
  const estadoPrecinto = document.getElementById('filterAvzRepEstadoPrecinto').value;
  const material = document.getElementById('filterAvzRepMaterial').value;

  const operadores = [...new Set(ASIGNACIONES_PRECINTOS_DEMO.map(a => a.recibidoPor))];

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

// Una fila de la cartola: "Asignación" (entrada), "Uso" (salida) o "Scrap"
// (precintos dañados, no mueve el saldo), con material y numeración de
// precintos, terminal, cantidad y el saldo resultante — columnas detalladas
// a propósito, para no perder trazabilidad frente a la planilla que
// reemplaza. "resaltar" marca la fila cuando viene de una búsqueda por
// "Consultar precinto" (N° de Precinto puntual).
const BADGE_MOVIMIENTO_LEDGER = {
  asignacion: `<span class="badge badge-vigente"><span class="badge-dot"></span>Asignación</span>`,
  uso: `<span class="badge badge-por-vencer"><span class="badge-dot"></span>Uso</span>`,
  scrap: `<span class="badge badge-inactivo"><span class="badge-dot"></span>Scrap</span>`
};

function filaEventoLedgerHTML(e, resaltar) {
  const materiales = [...new Set(e.precintos.map(p => obtenerLoteDePrecinto(p)?.material).filter(Boolean))];
  const numeracion = formatearRangosPrecintos(e.precintos);

  // Solo la Asignación (entrada) tiene un "Entregado por" propio; Uso y
  // Scrap son sobre precintos que ya están con el operador, sin otra
  // persona entregando de nuevo — el Tipo de Operación / N° Viaje de un Uso
  // ya se puede consultar con mayor detalle en "Ver Detalle/GRP".
  const entregadoPorTexto = e.tipo === 'asignacion' ? nombreColaborador(e.entregadoPor) : '—';

  const cantidadCelda = e.tipo === 'asignacion'
    ? `<span class="evento-cantidad-entrada">+${e.cantidad}</span>`
    : e.tipo === 'uso'
      ? `<span class="evento-cantidad-salida">-${e.cantidad}</span>`
      : `<span class="evento-cantidad-scrap">${e.cantidad}</span>`;

  const opciones = e.tipo === 'asignacion'
    ? `<button class="btn-accion btn-ver" title="Ver Detalle/GRP" onclick="abrirModalVerEtiquetasPorAsignacion(${e.asignacion.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button class="btn-accion btn-descargar-asig" title="Descargar constancia de la Asignación" onclick="descargarReporteAsignacion(${e.asignacion.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>`
    : e.tipo === 'scrap'
      ? `<button class="btn-accion btn-ver" title="Ver Detalle/GRP de la Asignación de origen" onclick="abrirModalVerEtiquetasPorAsignacion(${e.asignacion.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>`
      : '—';

  return `<tr class="fila-evento-${e.tipo}${resaltar ? ' precinto-resaltado' : ''}">
    <td>${e.fecha}</td>
    <td>${BADGE_MOVIMIENTO_LEDGER[e.tipo]}</td>
    <td>${entregadoPorTexto}</td>
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
    tbody.innerHTML = `<tr><td colspan="6" class="submodulo-tabla-vacio">No se encontraron operadores con precintos asignados.</td></tr>`;
    return;
  }

  tbody.innerHTML = ledgers.map((ledger) => `
    <tr>
      <td class="codigo-col">${nombreColaborador(ledger.usuario)}</td>
      <td>${ledger.totalAsignado}</td>
      <td>${ledger.totalUsado}</td>
      <td>${ledger.stock > 0 ? `<span class="asignados-pendiente">${ledger.stock}</span>` : '0'}</td>
      <td>${ledger.totalScrap || '0'}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver movimientos" onclick="abrirModalLedgerOperador('${ledger.usuario}')" ${ledger.eventos.length ? '' : 'disabled'}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

// Modal "Movimientos de <operador>": la cartola completa (Asignaciones +
// usos), en vez de una fila expandible dentro de la grilla — así la grilla
// principal se queda simple (Total Asignado / Usado / Stock / Scrap) y el
// detalle pesado solo aparece cuando de verdad hace falta consultarlo.
// "Por rango" (cartola cronológica, la vista de siempre) y "Por precinto"
// (uno por uno, con su estado puntual) son dos formas de mirar la misma
// data — ver renderLedgerOperadorActivo.
let ledgerOperadorActivoUsuario = null; // operador mostrado en el modal (para poder recalcular al cambiar de vista o descargar)
let vistaLedgerOperador = 'rango'; // 'rango' (cronológico, por defecto) o 'precinto' (uno por uno)
let paginaLedgerPrecinto = 1; // página actual de la vista "Por precinto" — puede tener muchas filas, "Por rango" no pagina

function abrirModalLedgerOperador(usuario) {
  ledgerOperadorActivoUsuario = usuario;
  vistaLedgerOperador = 'rango';
  paginaLedgerPrecinto = 1;
  document.getElementById('btnVistaLedgerPorRango').classList.add('activo');
  document.getElementById('btnVistaLedgerPorPrecinto').classList.remove('activo');
  document.getElementById('paginacionLedgerPrecinto').style.display = 'none';

  const ledger = construirLedgerOperador(usuario);
  document.getElementById('ledgerOperadorNombre').textContent = nombreColaborador(usuario);
  document.getElementById('ledgerOperadorTotalAsignado').textContent = ledger.totalAsignado;
  document.getElementById('ledgerOperadorTotalUsado').textContent = ledger.totalUsado;
  document.getElementById('ledgerOperadorStock').textContent = ledger.stock;
  document.getElementById('ledgerOperadorScrap').textContent = ledger.totalScrap || 0;

  renderLedgerOperadorActivo();
  abrirModal('modalLedgerOperador');
}

function cambiarVistaLedgerOperador(vista) {
  vistaLedgerOperador = vista;
  paginaLedgerPrecinto = 1;
  document.getElementById('btnVistaLedgerPorRango').classList.toggle('activo', vista === 'rango');
  document.getElementById('btnVistaLedgerPorPrecinto').classList.toggle('activo', vista === 'precinto');
  document.getElementById('paginacionLedgerPrecinto').style.display = vista === 'precinto' ? '' : 'none';
  renderLedgerOperadorActivo();
}

function ledgerPrecintoTamanoPagina() {
  const select = document.getElementById('ledgerPrecintoPagSelect');
  return select ? Number(select.value) : 5;
}

function ledgerPrecintoCambiarTamanoPagina() {
  paginaLedgerPrecinto = 1;
  renderLedgerOperadorActivo();
}

function ledgerPrecintoIrAPagina(numero) {
  paginaLedgerPrecinto = numero;
  renderLedgerOperadorActivo();
}

function renderPaginacionLedgerPrecinto(totalPaginas) {
  const prev = document.getElementById('ledgerPrecintoPagPrev');
  const next = document.getElementById('ledgerPrecintoPagNext');
  const numeros = document.getElementById('ledgerPrecintoPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaLedgerPrecinto <= 1;
  next.disabled = paginaLedgerPrecinto >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaLedgerPrecinto ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => ledgerPrecintoIrAPagina(i);
    numeros.appendChild(btn);
  }
}

// Etiqueta legible del estado de un precinto (mismo vocabulario que
// "Estado del precinto" en Filtros avanzados) para la vista "Por precinto".
const ESTADO_PRECINTO_TEXTO = {
  disponible: 'Por asignar',
  asignado: 'Asignado',
  usado: 'Usado',
  scrap: 'Scrap'
};
const ESTADO_PRECINTO_BADGE = {
  disponible: 'badge-gris',
  asignado: 'badge-por-vencer',
  usado: 'badge-vigente',
  scrap: 'badge-inactivo'
};

function renderLedgerOperadorActivo() {
  const usuario = ledgerOperadorActivoUsuario;
  if (!usuario) return;
  const ledger = construirLedgerOperador(usuario);
  const precintoTexto = document.getElementById('filterAvzRepPrecinto').value.trim().toLowerCase();
  const estadoPrecinto = document.getElementById('filterAvzRepEstadoPrecinto').value;
  const desde = document.getElementById('filterAvzRepFechaDesde').value;
  const hasta = document.getElementById('filterAvzRepFechaHasta').value;

  const thead = document.getElementById('theadLedgerOperador');
  const tbody = document.getElementById('tbodyLedgerOperador');

  if (vistaLedgerOperador === 'precinto') {
    // Uno por uno: todos los precintos que alguna vez le llegaron a este
    // operador (de cualquiera de sus Asignaciones), con su estado puntual y
    // de qué Asignación viene — esto último es lo que da el detalle de cada
    // scrap (en qué entrega y fecha quedó reportado), no solo el conteo
    // agregado del resumen de arriba. Acá "Por asignar" nunca aparece,
    // porque un precinto de este operador ya está, por definición, asignado
    // a alguien.
    thead.innerHTML = `<tr><th style="width:60px;">N°</th><th>Precinto</th><th>Material</th><th>Estado</th><th>Fecha de Asignación</th></tr>`;
    const todos = obtenerTodosLosPrecintosConEstado();
    const precintosDelOperador = todos
      .filter(f => f.asignacion && f.asignacion.recibidoPor === usuario)
      .filter(f => {
        if (precintoTexto && !f.precinto.toLowerCase().includes(precintoTexto)) return false;
        if (estadoPrecinto && f.estado !== (estadoPrecinto === 'sin-reportar' ? 'asignado' : estadoPrecinto)) return false;
        return true;
      })
      .sort((a, b) => numeroDePrecinto(a.precinto) - numeroDePrecinto(b.precinto));

    const tamano = ledgerPrecintoTamanoPagina();
    const totalPaginas = Math.max(1, Math.ceil(precintosDelOperador.length / tamano));
    if (paginaLedgerPrecinto > totalPaginas) paginaLedgerPrecinto = totalPaginas;
    if (paginaLedgerPrecinto < 1) paginaLedgerPrecinto = 1;
    const inicio = (paginaLedgerPrecinto - 1) * tamano;
    const visibles = precintosDelOperador.slice(inicio, inicio + tamano);

    tbody.innerHTML = visibles.length
      ? visibles.map((f, i) => `
        <tr>
          <td>${inicio + i + 1}</td>
          <td>${f.precinto}</td>
          <td>${f.material}</td>
          <td><span class="badge ${ESTADO_PRECINTO_BADGE[f.estado] || 'badge-gris'}"><span class="badge-dot"></span>${ESTADO_PRECINTO_TEXTO[f.estado] || f.estado}</span></td>
          <td>${f.asignacion.fecha}</td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="submodulo-tabla-vacio">Sin precintos con estos filtros.</td></tr>`;

    renderPaginacionLedgerPrecinto(totalPaginas);
    return;
  }

  // "Por rango": la cartola cronológica de siempre (Asignaciones + usos).
  thead.innerHTML = `<tr><th>Fecha</th><th>Movimiento</th><th>Entregado por</th><th>Material</th><th>Numeración</th><th>Terminal</th><th>Cantidad</th><th>Saldo</th><th>Opciones</th></tr>`;

  // El período (Fecha desde/hasta de Filtros avanzados) solo decide qué
  // movimientos se ven en la cartola — el Saldo de cada uno ya se calculó
  // sobre el historial completo, así que sigue siendo el saldo real aunque
  // el período oculte movimientos anteriores.
  const eventosVisibles = ledger.eventos.filter(e => {
    if (desde && e.fechaISO < desde) return false;
    if (hasta && e.fechaISO > hasta) return false;
    return true;
  });

  tbody.innerHTML = eventosVisibles.length
    ? eventosVisibles.map(e => {
        const resaltar = (precintoTexto || estadoPrecinto) && e.precintos.some(p => {
          const f = obtenerTodosLosPrecintosConEstado().find(x => x.precinto === p);
          return f && precintoCumpleFiltroAvanzado(f, precintoTexto, estadoPrecinto);
        });
        return filaEventoLedgerHTML(e, resaltar);
      }).join('')
    : `<tr><td colspan="9" class="submodulo-tabla-vacio">Sin movimientos en el período filtrado.</td></tr>`;
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
// porque las opciones (qué materiales/operadores tienen pendientes)
// dependen de lo que haya sin reportar en ese momento.
const SIN_REPORTAR_IDS_FILTROS = ['filterSinReportarPrecinto', 'filterSinReportarMaterial', 'filterSinReportarOperador'];

function poblarFiltrosPrecintosSinReportar(pendientes) {
  const materiales = [...new Set(pendientes.map(f => f.material))].sort();
  const operadores = [...new Set(pendientes.map(f => f.asignacion.recibidoPor))];

  document.getElementById('filterSinReportarMaterial').innerHTML = '<option value="">Todos</option>' +
    materiales.map(m => `<option value="${m}">${m}</option>`).join('');

  document.getElementById('filterSinReportarOperador').innerHTML = '<option value="">Todos</option>' +
    operadores.map(u => `<option value="${u}">${nombreColaborador(u)}</option>`).join('');
}

function renderTablaPrecintosSinReportar() {
  const precintoTexto = document.getElementById('filterSinReportarPrecinto').value.trim().toLowerCase();
  const material = document.getElementById('filterSinReportarMaterial').value;
  const operador = document.getElementById('filterSinReportarOperador').value;

  const pendientes = obtenerPrecintosSinReportarGlobal()
    .filter(f => {
      if (precintoTexto && !f.precinto.toLowerCase().includes(precintoTexto)) return false;
      if (material && f.material !== material) return false;
      if (operador && f.asignacion.recibidoPor !== operador) return false;
      return true;
    })
    .sort((a, b) => numeroDePrecinto(a.precinto) - numeroDePrecinto(b.precinto));

  const tbody = document.getElementById('tbodyPrecintosSinReportar');
  tbody.innerHTML = pendientes.length
    ? pendientes.map(f => `
      <tr>
        <td>${f.precinto}</td>
        <td>${f.material}</td>
        <td>${nombreColaborador(f.asignacion.recibidoPor)}</td>
        <td>${f.asignacion.fecha}</td>
      </tr>`).join('')
    : `<tr><td colspan="4" class="submodulo-tabla-vacio">No hay precintos pendientes de reportar con estos filtros.</td></tr>`;
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
   DESCARGA: "Registro de Control de Precintos" de UN operador — mismo
   formato que la planilla física que este módulo reemplaza (una fila por
   entrega, con casilleros de material tildados arriba), pero alineado a lo
   que el sistema ya traza: Motivo/Servicio y Observaciones vienen directo
   de la Asignación, "PER N°" es el número de su Detalle/GRP (mismo
   concepto, nombre histórico de la planilla) y "Cantidad en Stock" es lo
   que queda de ESA entrega puntual (descontando lo ya usado o scrap de esa
   misma Asignación) — no un saldo acumulado de todas las entregas juntas.
   Se descarga desde dos lugares: "Ver movimientos" (para el operador que se
   esté consultando ahí, ver ledgerOperadorActivoUsuario) y "Ver Detalle/GRP"
   (para el receptor puntual de esa Asignación, ver
   descargarRegistroControlDesdeDetalle en generar-registro-precintos.js) —
   por eso el usuario es un parámetro y no siempre viene de la variable global.
================================================= */
function descargarRegistroControlOperador(usuarioParam) {
  const usuario = usuarioParam || ledgerOperadorActivoUsuario;
  if (!usuario) return;

  // Mismo período de "Filtros avanzados" (Fecha desde/hasta) que ya decide
  // qué se ve en la cartola de "Ver movimientos" — se reutiliza acá para no
  // agregar un selector de fecha aparte: alcanza con dejarlo cargado antes
  // de descargar (un año completo es, por ejemplo, desde 01/01 hasta 31/12).
  // Cada fila calcula su propio "Cantidad en Stock" a partir de su propia
  // Asignación (no es un saldo acumulado entre filas), así que filtrar
  // cuáles entran no cambia el número de las que sí quedan — no se pierde
  // la estructura del reporte, solo se acorta la lista.
  const desde = document.getElementById('filterAvzRepFechaDesde').value;
  const hasta = document.getElementById('filterAvzRepFechaHasta').value;

  const asignaciones = ASIGNACIONES_PRECINTOS_DEMO
    .filter(a => a.recibidoPor === usuario)
    .filter(a => {
      const fechaISO = fechaDDMMYYYYaISO(a.fecha);
      if (desde && fechaISO < desde) return false;
      if (hasta && fechaISO > hasta) return false;
      return true;
    })
    .sort((a, b) => fechaDDMMYYYYaISO(a.fecha).localeCompare(fechaDDMMYYYYaISO(b.fecha)));

  const materialesUsados = new Set();
  const filas = asignaciones.map(a => {
    const detalleGrp = obtenerGenerarRegistroPorAsignacion(a.id);
    const usadosDeEstaAsignacion = new Set(detalleGrp ? detalleGrp.detalle.map(d => d.precinto) : []);
    const scrapDeEstaAsignacion = a.scrap || [];
    const scrapNoUsado = scrapDeEstaAsignacion.filter(p => !usadosDeEstaAsignacion.has(p)).length;
    const cantidadEnStock = a.cantidad - usadosDeEstaAsignacion.size - scrapNoUsado;

    a.registroCodigos.forEach(c => {
      const material = obtenerRegistroPrecintoPorCodigo(c)?.material;
      if (material) materialesUsados.add(material);
    });

    return {
      fecha: a.fecha,
      entregadoPor: nombreColaborador(a.entregadoPor),
      recibidoPor: nombreColaborador(a.recibidoPor),
      cantidad: a.cantidad,
      numeracion: formatearRangosPrecintos(a.precintos),
      motivo: a.motivo || '—',
      perNumero: detalleGrp ? detalleGrp.numero : '—',
      observaciones: a.observaciones || '',
      cantidadEnStock
    };
  });

  const filasHTML = filas.map(f => `
    <tr>
      <td>${f.fecha}</td>
      <td>${f.entregadoPor}</td>
      <td>${f.recibidoPor}</td>
      <td>${f.cantidad}</td>
      <td>${f.numeracion}</td>
      <td>${f.motivo}</td>
      <td>${f.perNumero}</td>
      <td>${f.observaciones}</td>
      <td>${f.cantidadEnStock}</td>
    </tr>`).join('');

  const checkboxesMaterial = cargarMaterialesPrecinto().map(m => `
    <span class="check-material"><span class="check-caja">${materialesUsados.has(m.nombre) ? 'X' : ''}</span> ${m.nombre.toUpperCase()}</span>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Registro de Control de Precintos — ${nombreColaborador(usuario)}</title>
    <style>
      body  { font-family: Arial, sans-serif; font-size: 10.5px; margin: 20px; color: #111; }
      .encabezado { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
      .marca { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
      h2    { font-size: 13px; text-align: center; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 4px; }
      .subtitulo { font-size: 11px; text-align: center; margin: 0 0 14px; color: #555; }
      .checks { text-align: right; font-size: 9.5px; }
      .check-material { display: inline-block; margin-left: 14px; white-space: nowrap; }
      .check-caja { display: inline-block; width: 12px; height: 12px; border: 1px solid #111;
                    text-align: center; line-height: 12px; font-weight: 700; margin-right: 3px; }
      table { width: 100%; border-collapse: collapse; }
      th    { background: #111; color: #fff; padding: 6px 8px; text-align: left;
              font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; }
      td    { padding: 6px 8px; border-bottom: 1px solid #eee; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <div class="encabezado">
      <div class="marca">intertek</div>
      <div class="checks">${checkboxesMaterial}</div>
    </div>
    <h2>Registro de Control de Precintos</h2>
    <p class="subtitulo">Operador: ${nombreColaborador(usuario)}${(desde || hasta) ? ` — Período: ${desde ? fechaISOaDDMMYYYY(desde) : 'inicio'} a ${hasta ? fechaISOaDDMMYYYY(hasta) : 'hoy'}` : ''}</p>
    <table>
      <thead>
        <tr><th>Fecha</th><th>Entregado por</th><th>Recibido por</th><th>Cantidad</th><th>Numeración</th><th>Motivo / Servicio</th><th>PER N°</th><th>Observaciones</th><th>Cantidad en Stock</th></tr>
      </thead>
      <tbody>${filasHTML || `<tr><td colspan="9" style="text-align:center;color:#888;">${(desde || hasta) ? 'Este operador no tiene entregas en el período seleccionado.' : 'Este operador no tiene entregas registradas.'}</td></tr>`}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=1000,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();

  if (desde || hasta) {
    mostrarToast('Se descargó el período elegido en Filtros avanzados (Fecha desde/hasta). Para bajar el historial completo, limpia esas fechas antes de descargar.');
  }
}
