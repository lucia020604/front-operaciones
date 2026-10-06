// =================================================
// REPORTE-PRECINTOS.JS (nombreColaborador vivía en generar-registro-precintos.js,
// retirado en Sprint 4 junto con el modal "Generar Registro de Precintos" —
// ver §3.7 del prompt; esta página sigue necesitando el helper).
// Precintos > Reporte de Precintos: responde "¿cuánto usó y cuánto fue
// scrap cada operador en el período?" (Sprint 4, "reporte usado/scrap +
// motivo") — una fila por operador con actividad en el rango filtrado.
// Cuánto tiene asignado/Queda es información de Asignación de Precintos,
// no de este reporte. El detalle cronológico tipo "cartola" (cada Uso o
// Scrap, con su Motivo cuando aplica) vive en un modal aparte ("Ver
// movimientos") — mismo espíritu que la planilla de control que se usaba
// antes de este módulo.
// =================================================

function nombreColaborador(usuario) {
  const u = obtenerUsuarioPorNombre(usuario);
  return u ? `${u.nombre} ${u.apellido}` : usuario;
}

document.addEventListener('DOMContentLoaded', () => {
  poblarPeriodoReporte();
  renderTablaReportePrecintos();
});

// Estado elegido en la barra (Todos/Usado/Scrap) contra el estado real de
// un precinto — se usa para resaltar el movimiento puntual dentro del
// modal de movimientos ("Ver movimientos" → "Por rango"/"Por precinto").
function precintoCumpleFiltroEstado(f, estadoPrecinto) {
  return !estadoPrecinto || f.estado === estadoPrecinto;
}

/* =================================================
   DETALLE DE PRECINTOS (modal con tabla filtrable) — botón "Detalle de
   Precintos" de la barra principal. Dos filtros EXCLUYENTES: texto libre
   por N° de precinto, o combo de Estado (Sin asignar/Usado/Scrap); si hay
   texto, manda sobre el estado elegido. Reutiliza
   obtenerTodosLosPrecintosConEstado (data-precintos.js) igual que el resto
   del módulo.
================================================= */
let paginaDetallePrecintos = 1;

function detallePrecintosTamanoPagina() {
  const select = document.getElementById('detallePrecintosPagSelect');
  return select ? Number(select.value) : 5;
}

function detallePrecintosCambiarTamanoPagina() {
  paginaDetallePrecintos = 1;
  renderTablaDetallePrecintos();
}

function detallePrecintosIrAPagina(numero) {
  paginaDetallePrecintos = numero;
  renderTablaDetallePrecintos();
}

function renderPaginacionDetallePrecintos(totalPaginas) {
  const prev = document.getElementById('detallePrecintosPagPrev');
  const next = document.getElementById('detallePrecintosPagNext');
  const numeros = document.getElementById('detallePrecintosPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaDetallePrecintos <= 1;
  next.disabled = paginaDetallePrecintos >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaDetallePrecintos ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => detallePrecintosIrAPagina(i);
    numeros.appendChild(btn);
  }
}

// Opciones del combo Material = materiales que de verdad existen en los
// precintos (ordenados), con "Todos los materiales" arriba.
function poblarMaterialDetallePrecintos() {
  const materiales = [...new Set(obtenerTodosLosPrecintosConEstado().map(f => f.material))].sort();
  document.getElementById('detallePrecintosMaterialSelect').innerHTML =
    '<option value="">Todos los materiales</option>' +
    materiales.map(m => `<option value="${m}">${m}</option>`).join('');
}

function abrirModalDetallePrecintos() {
  document.getElementById('detallePrecintosBuscarInput').value = '';
  document.getElementById('detallePrecintosEstadoSelect').value = '';
  poblarMaterialDetallePrecintos();
  paginaDetallePrecintos = 1;
  renderTablaDetallePrecintos();

  document.getElementById('stockOperadorBuscarInput').value = '';
  poblarMaterialStockOperador();
  bloquearFiltrosStockOperador();
  paginaStockOperador = 1;
  cambiarVistaDetallePrecintos('precinto');

  abrirModal('modalDetallePrecintos');
}

// Pestañas del modal: "Por precinto" (tabla filtrable de siempre) y "Stock
// por operador" — mismo selector .vista-toggle que "Ver movimientos".
function cambiarVistaDetallePrecintos(vista) {
  const esStock = vista === 'stock';
  document.getElementById('btnVistaDetallePrecinto').classList.toggle('activo', !esStock);
  document.getElementById('btnVistaDetalleStock').classList.toggle('activo', esStock);
  document.getElementById('detallePrecintosVistaPrecinto').style.display = esStock ? 'none' : '';
  document.getElementById('detallePrecintosVistaStock').style.display = esStock ? '' : 'none';
  document.getElementById('detallePrecintosVistaTitulo').textContent = esStock ? 'Stock por operador' : 'Precintos';
  if (esStock) renderTablaStockOperador();
}

/* =================================================
   STOCK POR OPERADOR (pestaña de "Detalle de Precintos"): cuántos precintos
   le quedan a cada operador, por material. Stock = "Queda" de
   calcularSaldoOperador (asignado − usado − scrap, histórico completo), la
   misma fuente que Asignación de Precintos y "Mis precintos" del móvil.
================================================= */
let paginaStockOperador = 1;

// Columnas de material: los activos del catálogo (Tablas Generales) más
// cualquier material que aparezca en los precintos y ya no esté en el
// catálogo — así un material desactivado con stock pendiente no se pierde.
function materialesStockOperador() {
  const delCatalogo = cargarMaterialesPrecinto().map(m => m.nombre);
  const enDatos = obtenerTodosLosPrecintosConEstado().map(f => f.material);
  return [...new Set([...delCatalogo, ...enDatos])];
}

function poblarMaterialStockOperador() {
  document.getElementById('stockOperadorMaterialSelect').innerHTML =
    '<option value="">Todos los materiales</option>' +
    materialesStockOperador().map(m => `<option value="${m}">${m}</option>`).join('');
}

function stockOperadorTamanoPagina() {
  const select = document.getElementById('stockOperadorPagSelect');
  return select ? Number(select.value) : 5;
}

function stockOperadorCambiarTamanoPagina() {
  paginaStockOperador = 1;
  renderTablaStockOperador();
}

function stockOperadorIrAPagina(numero) {
  paginaStockOperador = numero;
  renderTablaStockOperador();
}

function renderPaginacionStockOperador(totalPaginas) {
  const prev = document.getElementById('stockOperadorPagPrev');
  const next = document.getElementById('stockOperadorPagNext');
  const numeros = document.getElementById('stockOperadorPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaStockOperador <= 1;
  next.disabled = paginaStockOperador >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaStockOperador ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => stockOperadorIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function filtrarStockOperador() {
  paginaStockOperador = 1;
  renderTablaStockOperador();
}

function limpiarFiltrosStockOperador() {
  document.getElementById('stockOperadorBuscarInput').value = '';
  document.getElementById('stockOperadorMaterialSelect').value = '';
  bloquearFiltrosStockOperador();
  paginaStockOperador = 1;
  renderTablaStockOperador();
}

// Operador y Material son excluyentes: con uno en uso, el otro queda
// bloqueado hasta vaciarlo o pulsar "Limpiar filtros".
function bloquearFiltrosStockOperador() {
  const input = document.getElementById('stockOperadorBuscarInput');
  const select = document.getElementById('stockOperadorMaterialSelect');
  select.disabled = !!input.value.trim();
  input.disabled = !!select.value;
}

// Sin filtro de material: una fila por operador con stock (> 0 en algún
// material), una columna por material y el total. Con un material elegido:
// solo esa columna, y solo los operadores que tienen stock de ese material.
function renderTablaStockOperador() {
  const thead = document.getElementById('theadStockOperador');
  const tbody = document.getElementById('tbodyStockOperador');
  const paginacion = document.getElementById('paginacionStockOperador');
  const texto = document.getElementById('stockOperadorBuscarInput').value.trim().toLowerCase();
  const material = document.getElementById('stockOperadorMaterialSelect').value;
  const materiales = material ? [material] : materialesStockOperador();
  const columnas = materiales.length + 1 + (material ? 0 : 1);

  thead.innerHTML = material
    ? `<tr><th>Operador</th><th>${material} en stock</th></tr>`
    : `<tr><th>Operador</th>${materiales.map(m => `<th>${m}</th>`).join('')}<th>Total en stock</th></tr>`;

  const operadores = [...new Set(ASIGNACIONES_PRECINTOS_DEMO.map(a => a.recibidoPor))];
  const filas = operadores
    .map(usuario => {
      const porMaterial = {};
      materiales.forEach(m => { porMaterial[m] = calcularSaldoOperador(usuario, { material: m }).queda; });
      const total = Object.values(porMaterial).reduce((s, n) => s + n, 0);
      return { usuario, nombre: nombreColaborador(usuario), porMaterial, total };
    })
    .filter(f => f.total > 0)
    .filter(f => !texto || f.nombre.toLowerCase().includes(texto) || f.usuario.toLowerCase().includes(texto))
    .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="${columnas}" class="submodulo-tabla-vacio">${texto || material ? 'Sin operadores con stock para estos filtros.' : 'Ningún operador tiene precintos en stock.'}</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = stockOperadorTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(filas.length / tamano));
  if (paginaStockOperador > totalPaginas) paginaStockOperador = totalPaginas;
  if (paginaStockOperador < 1) paginaStockOperador = 1;
  const inicio = (paginaStockOperador - 1) * tamano;
  const visibles = filas.slice(inicio, inicio + tamano);

  tbody.innerHTML = visibles.map(f => `
    <tr>
      <td class="codigo-col">${f.nombre}</td>
      ${materiales.map(m => `<td>${f.porMaterial[m] || '<span class="stock-cero">0</span>'}</td>`).join('')}
      ${material ? '' : `<td><strong>${f.total}</strong></td>`}
    </tr>`).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionStockOperador(totalPaginas);
}

function filtrarDetallePrecintos() {
  paginaDetallePrecintos = 1;
  renderTablaDetallePrecintos();
}

function limpiarFiltrosDetallePrecintos() {
  document.getElementById('detallePrecintosBuscarInput').value = '';
  document.getElementById('detallePrecintosEstadoSelect').value = '';
  document.getElementById('detallePrecintosMaterialSelect').value = '';
  paginaDetallePrecintos = 1;
  renderTablaDetallePrecintos();
}

// Fecha propia de cada fila según su estado: la del evento (uso/scrap) si
// ya tiene uno, o la de ingreso al lote (Control de Precintos) si todavía
// está sin asignar — así ninguna fila queda sin una fecha que mostrar.
function fechaDetallePrecinto(f) {
  if (f.estado === 'scrap') return f.scrapDetalle.fecha;
  if (f.estado === 'usado') return f.uso.fecha;
  return obtenerRegistroPrecintoPorCodigo(f.registroCodigo)?.fecha || '—';
}

function renderTablaDetallePrecintos() {
  const tbody = document.getElementById('tbodyDetallePrecintos');
  const paginacion = document.getElementById('paginacionDetallePrecintos');
  const texto = document.getElementById('detallePrecintosBuscarInput').value.trim().toLowerCase();
  const estado = document.getElementById('detallePrecintosEstadoSelect').value;
  const material = document.getElementById('detallePrecintosMaterialSelect').value;

  // Los filtros se combinan (N° precinto, Estado y Material); sin ninguno
  // activo no se lista nada, igual que antes.
  let filas = [];
  if (texto || estado || material) {
    filas = obtenerTodosLosPrecintosConEstado().filter(f =>
      (!texto || f.precinto.toLowerCase().includes(texto)) &&
      (!estado || f.estado === estado) &&
      (!material || f.material === material)
    );
  }

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="submodulo-tabla-vacio">${texto || estado || material ? 'Sin precintos con estos filtros.' : 'Ingresa un N° de precinto o elige un estado o material.'}</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  filas.sort((a, b) => numeroDePrecinto(a.precinto) - numeroDePrecinto(b.precinto));

  const tamano = detallePrecintosTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(filas.length / tamano));
  if (paginaDetallePrecintos > totalPaginas) paginaDetallePrecintos = totalPaginas;
  if (paginaDetallePrecintos < 1) paginaDetallePrecintos = 1;
  const inicio = (paginaDetallePrecintos - 1) * tamano;
  const visibles = filas.slice(inicio, inicio + tamano);

  tbody.innerHTML = visibles.map(f => `
    <tr>
      <td>${fechaDetallePrecinto(f)}</td>
      <td>${f.precinto}</td>
      <td>${f.material}</td>
      <td>${f.asignacion ? nombreColaborador(f.asignacion.recibidoPor) : '—'}</td>
      <td>${f.asignacion ? nombreColaborador(f.asignacion.entregadoPor) : '—'}</td>
      <td>${f.detalleGrp ? f.detalleGrp.numero : '—'}</td>
      <td>${f.uso ? (f.uso.tipoOperacion || '—') : '—'}</td>
      <td><span class="badge ${ESTADO_PRECINTO_BADGE[f.estado] || 'badge-gris'}"><span class="badge-dot"></span>${ESTADO_PRECINTO_TEXTO[f.estado] || f.estado}</span></td>
    </tr>`).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionDetallePrecintos(totalPaginas);
}

/* =================================================
   CARTOLA POR OPERADOR: Asignaciones (entradas) + usos reportados agrupados
   por evento (salidas), en orden cronológico, con saldo acumulado.
================================================= */

// Agrupa los usos de un Detalle/GRP por evento real (misma fecha + viaje +
// tipo de operación + terminal) y luego, dentro de cada evento, por material
// y correlatividad — un operador puede reportar varios precintos para la
// misma operación, y en la cartola eso es UN movimiento de salida (o varios,
// si mezcla materiales o trae un corte en la numeración), no uno por precinto.
function agruparUsosPorEvento(detalleGrp) {
  const grupos = new Map();
  detalleGrp.detalle.forEach(d => {
    const clave = [d.fecha, d.viaje, d.tipoOperacion || '', d.terminal || ''].join('|');
    if (!grupos.has(clave)) {
      grupos.set(clave, { fecha: d.fecha, viaje: d.viaje, tipoOperacion: d.tipoOperacion || '', terminal: d.terminal || '', precintos: [], observacion: '' });
    }
    const g = grupos.get(clave);
    g.precintos.push(d.precinto);
    // La observación es por precinto, no por evento (no es parte de la
    // clave de agrupación) — se muestra la primera no vacía del grupo en la
    // celda "Motivo" de la cartola para un Uso (Sprint 4, "reporte usado/
    // scrap + motivo").
    if (!g.observacion && d.observacion) g.observacion = d.observacion;
  });

  const resultado = [];
  grupos.forEach(g => {
    dividirPorMaterialYCorrelatividad(g.precintos).forEach(sub => {
      resultado.push({ fecha: g.fecha, viaje: g.viaje, tipoOperacion: g.tipoOperacion, terminal: g.terminal, material: sub.material, numeracion: sub.texto, cantidad: sub.cantidad, precintos: sub.precintos, observacion: g.observacion });
    });
  });
  return resultado;
}

// Agrupa los reportes de scrap de una Asignación por evento real (misma
// fecha + motivo) y luego por material y correlatividad — igual criterio que
// agruparUsosPorEvento.
function agruparScrapPorEvento(scrap) {
  const grupos = new Map();
  scrap.forEach(s => {
    const clave = [s.fecha, s.motivo || ''].join('|');
    if (!grupos.has(clave)) {
      grupos.set(clave, { fecha: s.fecha, motivo: s.motivo || '', precintos: [] });
    }
    grupos.get(clave).precintos.push(s.precinto);
  });

  const resultado = [];
  grupos.forEach(g => {
    dividirPorMaterialYCorrelatividad(g.precintos).forEach(sub => {
      resultado.push({ fecha: g.fecha, motivo: g.motivo, material: sub.material, numeracion: sub.texto, cantidad: sub.cantidad, precintos: sub.precintos });
    });
  });
  return resultado;
}

// Arma la cartola completa de un operador: todas sus Asignaciones como
// movimientos de entrada, y todos los usos ya reportados en los
// Detalles/GRP de esas Asignaciones como movimientos de salida — ordenados
// por fecha, con el saldo (stock) recalculado después de cada uno.
function construirLedgerOperador(usuario) {
  const asignaciones = ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.recibidoPor === usuario);
  const eventos = [];

  asignaciones.forEach(a => {
    // La entrega puede mezclar materiales (varios rangos agregados uno por
    // uno) — se parte igual que uso/scrap, una línea por material y corrida
    // consecutiva (ver dividirPorMaterialYCorrelatividad).
    dividirPorMaterialYCorrelatividad(a.precintos).forEach(sub => {
      eventos.push({
        tipo: 'asignacion',
        fecha: a.fecha,
        fechaISO: fechaDDMMYYYYaISO(a.fecha),
        asignacion: a,
        entregadoPor: a.entregadoPor,
        material: sub.material,
        numeracion: sub.texto,
        cantidad: sub.cantidad,
        precintos: sub.precintos
      });
    });

    const detalleGrp = obtenerGenerarRegistroPorAsignacion(a.id);
    if (detalleGrp) {
      // Un precinto reportado como scrap cuenta como Scrap, no como Uso,
      // aunque también tenga su propia entrada en el Detalle/GRP (ej.
      // A-10003: se instaló, se rompió y se reemplazó por otro de la misma
      // Asignación, pero igual quedó reportado como scrap) — mismo criterio
      // de precedencia que ya usa obtenerTodosLosPrecintosConEstado en
      // data-precintos.js (scrap gana sobre usado). Sin este filtro, el
      // precinto se restaba dos veces del saldo (Sprint 4, ajuste de
      // consistencia: "cálculos paralelos" que daban resultados distintos).
      const scrapCodigos = new Set((a.scrap || []).map(s => s.precinto));
      const detalleSinScrap = detalleGrp.detalle.some(d => scrapCodigos.has(d.precinto))
        ? { ...detalleGrp, detalle: detalleGrp.detalle.filter(d => !scrapCodigos.has(d.precinto)) }
        : detalleGrp;
      agruparUsosPorEvento(detalleSinScrap).forEach(g => {
        eventos.push({
          tipo: 'uso',
          fecha: g.fecha,
          fechaISO: fechaDDMMYYYYaISO(g.fecha),
          asignacion: a,
          detalleGrp,
          viaje: g.viaje,
          tipoOperacion: g.tipoOperacion,
          terminal: g.terminal,
          material: g.material,
          numeracion: g.numeracion,
          cantidad: g.cantidad,
          precintos: g.precintos,
          observacion: g.observacion
        });
      });
    }

    // Scrap: cada reporte trae su propia fecha y motivo (los indica el
    // operador desde la app móvil al marcarlo) — se agrupa igual que "uso"
    // cuando hay varios reportados juntos. No es una salida real de stock
    // (ver más abajo, no mueve el saldo): es un aviso aparte, ya contado en
    // "Total Scrap".
    if (a.scrap && a.scrap.length) {
      agruparScrapPorEvento(a.scrap).forEach(g => {
        eventos.push({
          tipo: 'scrap',
          fecha: g.fecha,
          fechaISO: fechaDDMMYYYYaISO(g.fecha),
          asignacion: a,
          motivo: g.motivo,
          material: g.material,
          numeracion: g.numeracion,
          cantidad: g.cantidad,
          precintos: g.precintos
        });
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

  // El Scrap SÍ descuenta del saldo (Sprint 4, ajuste §1: Queda = Asignado -
  // Usado - Scrap) — un precinto dañado ya no cuenta como stock disponible,
  // aunque nunca se haya "usado". El orden cronológico ya deja la Asignación
  // primero en cada fecha (ver arriba), así el saldo nunca se ve negativo.
  let saldo = 0;
  eventos.forEach(e => {
    if (e.tipo === 'asignacion') saldo += e.cantidad;
    else if (e.tipo === 'uso' || e.tipo === 'scrap') saldo -= e.cantidad;
    e.saldo = saldo;
  });

  // Los totales resumen (a diferencia del saldo por fila, que es propio de
  // esta cartola) vienen de calcularSaldoOperador (data-precintos.js) — la
  // misma fuente que usan la grilla, la descarga y "Mis precintos" del
  // móvil, para no tener dos cálculos distintos de lo mismo.
  const { totalAsignado, totalUsado, totalScrap, queda } = calcularSaldoOperador(usuario);

  return { usuario, eventos, totalAsignado, totalUsado, totalScrap, stock: queda };
}

// Recalcula Usado/Scrap (y de paso Asignado/Stock, aunque ya no se
// muestren — ver principio del Sprint 4 "reporte usado/scrap + motivo") de
// un ledger a partir de SOLO los eventos dentro del Material y/o rango de
// fecha elegidos — sin filtros, devuelve el ledger tal cual (totales del
// historial completo). Usada por la grilla principal.
function recalcularTotalesLedger(ledger, material, desde, hasta) {
  if (!material && !desde && !hasta) return ledger;
  const { totalAsignado, totalUsado, totalScrap, queda } = calcularSaldoOperador(ledger.usuario, { material, desde, hasta });
  return { ...ledger, totalAsignado, totalUsado, totalScrap, stock: queda };
}

/* =================================================
   FILTRADO + GRILLA
================================================= */
// El Reporte responde "¿cuánto usó y cuánto fue scrap cada operador en el
// período?" (Sprint 4, "reporte usado/scrap + motivo") — ya no "¿cuánto
// tiene asignado?" (eso es de Asignación de Precintos). Por eso la grilla
// solo lista operadores con Usado > 0 o Scrap > 0 dentro del mes en curso
// (rango fijo: Estado/Material/Rango de fecha se retiraron de esta barra y
// ahora viven dentro de "Ver movimientos", por operador). El buscador
// filtra por nombre de operador — y, si el texto no matchea ningún nombre
// pero SÍ es un N° de precinto exacto, se resuelve a su operador
// (asignacion.recibidoPor) en vez de dejar la grilla en blanco solo porque
// el código no es un nombre. "Detalle de Precintos" (botón aparte) abre su
// propia tabla filtrable, ver abrirModalDetallePrecintos.
function filasReportePrecintosFiltradas() {
  const texto = document.getElementById('searchReportePrecintos').value.trim().toLowerCase();
  const { desde, hasta } = obtenerRangoReportePeriodo();

  const operadores = [...new Set(ASIGNACIONES_PRECINTOS_DEMO.map(a => a.recibidoPor))];

  let operadorPorPrecinto = null;
  if (texto) {
    const matchPrecinto = obtenerTodosLosPrecintosConEstado().find(f => f.precinto.toLowerCase() === texto);
    if (matchPrecinto && matchPrecinto.asignacion) operadorPorPrecinto = matchPrecinto.asignacion.recibidoPor;
  }

  return operadores
    .map(usuario => recalcularTotalesLedger(construirLedgerOperador(usuario), '', desde, hasta))
    .filter(ledger => ledger.totalUsado > 0 || ledger.totalScrap > 0)
    .filter(ledger => {
      if (!texto) return true;
      if (operadorPorPrecinto) return ledger.usuario === operadorPorPrecinto;
      return nombreColaborador(ledger.usuario).toLowerCase().includes(texto);
    });
}

// Una fila de la cartola: "Uso" o "Scrap" (la Asignación ya no se muestra
// acá, ver principio del Sprint 4 "reporte usado/scrap + motivo" — es
// información de Asignación de Precintos, no del Reporte), con material,
// numeración ya agrupada por corrida consecutiva, cantidad, viaje, tipo de
// operación, terminal, PER N° y Motivo (el motivo de scrap, o la
// observación del uso si la tiene — "—" si no hay nada que mostrar).
// "resaltar" marca la fila cuando viene de una búsqueda por Estado.
const BADGE_MOVIMIENTO_LEDGER = {
  uso: `<span class="badge badge-por-vencer"><span class="badge-dot"></span>Uso</span>`,
  scrap: `<span class="badge badge-inactivo"><span class="badge-dot"></span>Scrap</span>`
};

function filaEventoLedgerHTML(e, resaltar) {
  const viajeCelda = e.tipo === 'uso' ? (e.viaje || '—') : '—';
  const tipoOperacionCelda = e.tipo === 'uso' ? (e.tipoOperacion || '—') : '—';
  const terminalCelda = e.tipo === 'uso' ? (e.terminal || '—') : '—';
  const motivoCelda = e.tipo === 'scrap' ? (e.motivo || '—') : (e.observacion || '—');
  const detalleGrpDeLaFila = e.tipo === 'uso' ? e.detalleGrp : obtenerGenerarRegistroPorAsignacion(e.asignacion.id);
  const perNumero = detalleGrpDeLaFila ? detalleGrpDeLaFila.numero : '—';

  const cantidadCelda = e.tipo === 'uso'
    ? `<span class="evento-cantidad-salida">${e.cantidad}</span>`
    : `<span class="evento-cantidad-scrap">${e.cantidad}</span>`;

  return `<tr class="fila-evento-${e.tipo}${resaltar ? ' precinto-resaltado' : ''}">
    <td>${e.fecha}</td>
    <td>${BADGE_MOVIMIENTO_LEDGER[e.tipo]}</td>
    <td>${e.material}</td>
    <td>${e.numeracion}</td>
    <td>${cantidadCelda}</td>
    <td>${viajeCelda}</td>
    <td>${tipoOperacionCelda}</td>
    <td>${terminalCelda}</td>
    <td>${perNumero}</td>
    <td>${motivoCelda}</td>
  </tr>`;
}

let paginaReportePrecintos = 1; // página actual de la grilla principal (por operador)

function reportePrecintosTamanoPagina() {
  const select = document.getElementById('reportePrecintosPagSelect');
  return select ? Number(select.value) : 5;
}

function reportePrecintosCambiarTamanoPagina() {
  paginaReportePrecintos = 1;
  renderTablaReportePrecintos();
}

function reportePrecintosIrAPagina(numero) {
  paginaReportePrecintos = numero;
  renderTablaReportePrecintos();
}

function renderPaginacionReportePrecintos(totalPaginas) {
  const prev = document.getElementById('reportePrecintosPagPrev');
  const next = document.getElementById('reportePrecintosPagNext');
  const numeros = document.getElementById('reportePrecintosPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaReportePrecintos <= 1;
  next.disabled = paginaReportePrecintos >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaReportePrecintos ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => reportePrecintosIrAPagina(i);
    numeros.appendChild(btn);
  }
}

// Celda "Última Descarga" de la grilla — NO depende de los filtros de la
// barra (ni el texto ni el badge "N nuevos"): siempre muestra la descarga
// real más reciente de ese operador, sin importar qué se esté filtrando en
// pantalla (Sprint 4, cierre §A.1).
function celdaUltimaDescargaControlHTML(usuario) {
  const nuevos = contarMovimientosNuevosControl(usuario);
  const badge = nuevos > 0
    ? ` <span class="badge-nuevos-control" title="Movimientos posteriores a la última descarga">${nuevos} nuevo${nuevos === 1 ? '' : 's'}</span>`
    : '';

  const registro = obtenerUltimaDescargaControl(usuario);
  if (!registro) {
    return `<span class="ultima-descarga-nunca">Nunca descargado</span>${badge}`;
  }

  const f = new Date(registro.fecha);
  const fechaHora = `${f.toLocaleDateString('es-PE')} ${f.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  const materialTexto = registro.modo === 'material' && registro.material ? ` (${registro.material})` : '';

  return `
    <div class="ultima-descarga-linea1">${fechaHora}</div>
    <div class="ultima-descarga-linea2">Período: ${textoPeriodoDescargaControl(registro)}${materialTexto}</div>${badge}`;
}

function renderTablaReportePrecintos() {
  const ledgers = filasReportePrecintosFiltradas();
  const tbody = document.getElementById('tbodyReportePrecintos');
  const paginacion = document.getElementById('paginacionReportePrecintos');

  actualizarKpisReportePrecintos();

  if (!ledgers.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="submodulo-tabla-vacio">Sin precintos usados ni scrap en este período.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = reportePrecintosTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(ledgers.length / tamano));
  if (paginaReportePrecintos > totalPaginas) paginaReportePrecintos = totalPaginas;
  if (paginaReportePrecintos < 1) paginaReportePrecintos = 1;
  const inicio = (paginaReportePrecintos - 1) * tamano;
  const visibles = ledgers.slice(inicio, inicio + tamano);

  // El botón "Ver movimientos" ya no se deshabilita: la grilla solo lista
  // operadores con Usado > 0 o Scrap > 0 en el período (ver
  // filasReportePrecintosFiltradas), así que siempre hay algo que mostrar.
  tbody.innerHTML = visibles.map((ledger) => `
    <tr>
      <td class="codigo-col">${nombreColaborador(ledger.usuario)}</td>
      <td>${ledger.totalUsado}</td>
      <td>${ledger.totalScrap || '0'}</td>
      <td><strong>${ledger.totalUsado + ledger.totalScrap}</strong></td>
      <td class="ultima-descarga-cell">${celdaUltimaDescargaControlHTML(ledger.usuario)}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver movimientos" onclick="abrirModalLedgerOperador('${ledger.usuario}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionReportePrecintos(totalPaginas);
}

// Modal "Movimientos de <operador>": la cartola de Uso/Scrap del período,
// en vez de una fila expandible dentro de la grilla — así la grilla
// principal se queda simple (Usado / Scrap / Total reportado) y el detalle
// pesado solo aparece cuando de verdad hace falta consultarlo. "Por rango"
// (cronológico) y "Por precinto" (uno por uno, con su Motivo si es scrap)
// son dos formas de mirar la misma data — ver renderLedgerOperadorActivo.
let ledgerOperadorActivoUsuario = null; // operador mostrado en el modal (para poder recalcular al cambiar de vista o descargar)
let vistaLedgerOperador = 'rango'; // 'rango' (cronológico, por defecto) o 'precinto' (uno por uno)
let paginaLedgerRango = 1;    // página actual de la vista "Por rango"
let paginaLedgerPrecinto = 1; // página actual de la vista "Por precinto"
let ledgerPeriodoSeleccionado = 'actual'; // 'actual' o una clave 'YYYY-MM' del select Período
let ledgerRangoPersonalizado = false;     // true cuando se tilda el checkbox "Rango personalizado"
let ledgerMaterialesSeleccionados = new Set(); // vacío = Todos

// Meses (YYYY-MM) en los que el operador tuvo algún movimiento (uso o
// scrap) — opciones del combo "Período", más recientes primero. El mes en
// curso siempre aparece primero como "Período actual", tenga o no actividad.
function mesesConActividadLedger(ledger) {
  const claves = new Set(ledger.eventos.filter(e => e.tipo !== 'asignacion').map(e => e.fechaISO.slice(0, 7)));
  const hoy = new Date();
  const claveActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  claves.add(claveActual);
  return [...claves].sort((a, b) => b.localeCompare(a));
}

function rangoDelMes(claveYYYYMM) {
  const [anio, mes] = claveYYYYMM.split('-').map(Number);
  const desde = new Date(anio, mes - 1, 1);
  const hasta = new Date(anio, mes, 0);
  const aISO = d => d.toISOString().slice(0, 10);
  return { desde: aISO(desde), hasta: aISO(hasta) };
}

// Rango efectivo de la cartola según el estado actual de la barra de
// filtros del modal: el checkbox "Rango personalizado" manda sobre el
// combo "Período" cuando está tildado.
function obtenerRangoLedgerActivo() {
  if (ledgerRangoPersonalizado) {
    return {
      desde: document.getElementById('ledgerRangoDesde').value,
      hasta: document.getElementById('ledgerRangoHasta').value
    };
  }
  if (ledgerPeriodoSeleccionado === 'actual') return rangoPeriodoActualRep();
  return rangoDelMes(ledgerPeriodoSeleccionado);
}

function cambiarPeriodoLedgerOperador() {
  ledgerPeriodoSeleccionado = document.getElementById('ledgerPeriodoSelect').value;
  actualizarCabeceraLedgerOperador();
  renderLedgerOperadorActivo();
}

function toggleRangoPersonalizadoLedger() {
  ledgerRangoPersonalizado = document.getElementById('ledgerRangoPersonalizadoCheck').checked;
  document.getElementById('ledgerPeriodoSelect').disabled = ledgerRangoPersonalizado;
  document.getElementById('ledgerRangoDesdeGroup').style.display = ledgerRangoPersonalizado ? '' : 'none';
  document.getElementById('ledgerRangoHastaGroup').style.display = ledgerRangoPersonalizado ? '' : 'none';
  if (ledgerRangoPersonalizado) {
    const desdeInput = document.getElementById('ledgerRangoDesde');
    const hastaInput = document.getElementById('ledgerRangoHasta');
    if (!desdeInput.value && !hastaInput.value) {
      const { desde, hasta } = rangoPeriodoActualRep();
      desdeInput.value = desde;
      hastaInput.value = hasta;
    }
  }
  actualizarCabeceraLedgerOperador();
  renderLedgerOperadorActivo();
}

// Dropdown de materiales con checkbox (mismo patrón abrir/cerrar que
// toggleLedgerMaterialDropdown) — solo lista materiales que el operador de
// verdad tiene en su cartola, más un "Todos" explícito arriba (tildado por
// defecto, = sin filtro) para poder volver a "sin filtro" con un clic.
let ledgerMaterialesDisponibles = [];

function poblarMaterialDropdownLedger(usuario) {
  ledgerMaterialesDisponibles = [...new Set(
    obtenerTodosLosPrecintosConEstado()
      .filter(f => f.asignacion && f.asignacion.recibidoPor === usuario)
      .map(f => f.material)
  )].sort();
  ledgerMaterialesSeleccionados = new Set();
  renderDropdownMaterialLedger();
}

function renderDropdownMaterialLedger() {
  const cont = document.getElementById('ledgerMaterialDropdown');
  const sinFiltro = ledgerMaterialesSeleccionados.size === 0;
  cont.innerHTML = `
    <label class="ledger-material-opcion">
      <input type="checkbox" ${sinFiltro ? 'checked' : ''} onchange="toggleTodosMaterialLedger()">
      <span>Todos</span>
    </label>` +
    ledgerMaterialesDisponibles.map(m => `
    <label class="ledger-material-opcion">
      <input type="checkbox" value="${m}" ${ledgerMaterialesSeleccionados.has(m) ? 'checked' : ''} onchange="toggleMaterialLedger('${m}')">
      <span>${m}</span>
    </label>`).join('');
  actualizarEtiquetaMaterialLedger();
}

// "Todos" limpia la selección (= sin filtro) — mutuamente excluyente con
// elegir materiales puntuales, igual que cualquier combo "Todos" + opciones.
function toggleTodosMaterialLedger() {
  ledgerMaterialesSeleccionados = new Set();
  renderDropdownMaterialLedger();
  actualizarCabeceraLedgerOperador();
  renderLedgerOperadorActivo();
}

function toggleMaterialLedger(material) {
  if (ledgerMaterialesSeleccionados.has(material)) ledgerMaterialesSeleccionados.delete(material);
  else ledgerMaterialesSeleccionados.add(material);
  renderDropdownMaterialLedger();
  actualizarCabeceraLedgerOperador();
  renderLedgerOperadorActivo();
}

function actualizarEtiquetaMaterialLedger() {
  const btn = document.getElementById('ledgerMaterialBtn');
  if (!btn) return;
  const n = ledgerMaterialesSeleccionados.size;
  btn.textContent = n === 0 ? 'Todos' : n === 1 ? [...ledgerMaterialesSeleccionados][0] : `${n} seleccionados`;
}

function toggleLedgerMaterialDropdown() {
  document.getElementById('ledgerMaterialDropdown').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.ledger-material-wrap')) {
    document.getElementById('ledgerMaterialDropdown')?.classList.remove('open');
  }
});

// Usado/Scrap/Total reportado del encabezado — suma calcularSaldoOperador
// por cada material seleccionado (vacío = sin filtro de material, un solo
// cálculo) ya que esa función solo acepta un material a la vez.
function calcularResumenLedgerOperador(usuario, { desde, hasta }) {
  if (!ledgerMaterialesSeleccionados.size) return calcularSaldoOperador(usuario, { desde, hasta });
  let totalUsado = 0, totalScrap = 0;
  ledgerMaterialesSeleccionados.forEach(material => {
    const r = calcularSaldoOperador(usuario, { material, desde, hasta });
    totalUsado += r.totalUsado;
    totalScrap += r.totalScrap;
  });
  return { totalUsado, totalScrap };
}

function actualizarCabeceraLedgerOperador() {
  const usuario = ledgerOperadorActivoUsuario;
  if (!usuario) return;
  const { desde, hasta } = obtenerRangoLedgerActivo();
  const resumen = calcularResumenLedgerOperador(usuario, { desde, hasta });
  document.getElementById('ledgerOperadorTotalUsado').textContent = resumen.totalUsado;
  document.getElementById('ledgerOperadorScrap').textContent = resumen.totalScrap;
  document.getElementById('ledgerOperadorTotalReportado').textContent = resumen.totalUsado + resumen.totalScrap;
}

function abrirModalLedgerOperador(usuario) {
  ledgerOperadorActivoUsuario = usuario;
  vistaLedgerOperador = 'rango';
  paginaLedgerRango = 1;
  paginaLedgerPrecinto = 1;
  ledgerPeriodoSeleccionado = 'actual';
  ledgerRangoPersonalizado = false;
  document.getElementById('btnVistaLedgerPorRango').classList.add('activo');
  document.getElementById('btnVistaLedgerPorPrecinto').classList.remove('activo');
  document.getElementById('paginacionLedgerPrecinto').style.display = 'none';

  // El primer mes de la lista (el actual, ver mesesConActividadLedger) usa
  // el valor especial "actual" en vez de su clave 'YYYY-MM' — así calza
  // directo con rangoPeriodoActualRep (1.º del mes a HOY, no al último día
  // del mes) y con el default de ledgerPeriodoSeleccionado. La etiqueta de
  // cada opción es solo "Mes Año" (ej. "Octubre 2026"), sin el prefijo
  // "Período actual".
  const mesesDisponibles = mesesConActividadLedger(construirLedgerOperador(usuario));
  document.getElementById('ledgerPeriodoSelect').innerHTML = mesesDisponibles.map((clave, i) => {
    const [anio, mes] = clave.split('-');
    const etiqueta = new Date(Number(anio), Number(mes) - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    return `<option value="${i === 0 ? 'actual' : clave}">${etiqueta}</option>`;
  }).join('');
  document.getElementById('ledgerPeriodoSelect').value = 'actual';
  document.getElementById('ledgerPeriodoSelect').disabled = false;
  document.getElementById('ledgerRangoPersonalizadoCheck').checked = false;
  document.getElementById('ledgerRangoDesdeGroup').style.display = 'none';
  document.getElementById('ledgerRangoHastaGroup').style.display = 'none';
  document.getElementById('ledgerRangoDesde').value = '';
  document.getElementById('ledgerRangoHasta').value = '';

  poblarMaterialDropdownLedger(usuario);

  const registro = obtenerUltimaDescargaControl(usuario);
  document.getElementById('ledgerUltimaDescargaInfo').textContent = registro
    ? `Última descarga: ${new Date(registro.fecha).toLocaleDateString('es-PE')} ${new Date(registro.fecha).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`
    : 'Última descarga: nunca descargado';

  document.getElementById('ledgerOperadorNombre').textContent = nombreColaborador(usuario);
  actualizarCabeceraLedgerOperador();

  renderLedgerOperadorActivo();
  abrirModal('modalLedgerOperador');
}

function cambiarVistaLedgerOperador(vista) {
  vistaLedgerOperador = vista;
  paginaLedgerRango = 1;
  paginaLedgerPrecinto = 1;
  document.getElementById('btnVistaLedgerPorRango').classList.toggle('activo', vista === 'rango');
  document.getElementById('btnVistaLedgerPorPrecinto').classList.toggle('activo', vista === 'precinto');
  document.getElementById('paginacionLedgerRango').style.display = vista === 'rango' ? '' : 'none';
  document.getElementById('paginacionLedgerPrecinto').style.display = vista === 'precinto' ? '' : 'none';
  renderLedgerOperadorActivo();
}

function ledgerRangoTamanoPagina() {
  const select = document.getElementById('ledgerRangoPagSelect');
  return select ? Number(select.value) : 5;
}

function ledgerRangoCambiarTamanoPagina() {
  paginaLedgerRango = 1;
  renderLedgerOperadorActivo();
}

function ledgerRangoIrAPagina(numero) {
  paginaLedgerRango = numero;
  renderLedgerOperadorActivo();
}

function renderPaginacionLedgerRango(totalPaginas) {
  const prev = document.getElementById('ledgerRangoPagPrev');
  const next = document.getElementById('ledgerRangoPagNext');
  const numeros = document.getElementById('ledgerRangoPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaLedgerRango <= 1;
  next.disabled = paginaLedgerRango >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaLedgerRango ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => ledgerRangoIrAPagina(i);
    numeros.appendChild(btn);
  }
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

// Coincide con el filtro de Material (multicheck, vacío = Todos).
function precintoCumpleFiltroMaterialLedger(material) {
  return !ledgerMaterialesSeleccionados.size || ledgerMaterialesSeleccionados.has(material);
}

function renderLedgerOperadorActivo() {
  const usuario = ledgerOperadorActivoUsuario;
  if (!usuario) return;
  const ledger = construirLedgerOperador(usuario);
  const { desde, hasta } = obtenerRangoLedgerActivo();

  const thead = document.getElementById('theadLedgerOperador');
  const tbody = document.getElementById('tbodyLedgerOperador');

  if (vistaLedgerOperador === 'precinto') {
    // Uno por uno: solo los precintos ya usados o scrap de este operador
    // (ya no "Por asignar" — eso es de Asignación de Precintos, Sprint 4
    // "reporte usado/scrap + motivo"), dentro del período filtrado (por la
    // fecha de SU PROPIO evento: uso o scrap, no la de la Asignación).
    thead.innerHTML = `<tr><th style="width:60px;">N°</th><th>Precinto</th><th>Material</th><th>Estado</th><th>Fecha</th><th>Motivo</th></tr>`;
    const todos = obtenerTodosLosPrecintosConEstado();
    const precintosDelOperador = todos
      .filter(f => f.asignacion && f.asignacion.recibidoPor === usuario)
      .filter(f => f.estado === 'usado' || f.estado === 'scrap')
      .filter(f => {
        const fechaEvento = f.estado === 'scrap' ? f.scrapDetalle.fecha : f.uso.fecha;
        const fechaISO = fechaDDMMYYYYaISO(fechaEvento);
        if (desde && fechaISO < desde) return false;
        if (hasta && fechaISO > hasta) return false;
        return true;
      })
      .filter(f => precintoCumpleFiltroMaterialLedger(f.material))
      .sort((a, b) => numeroDePrecinto(a.precinto) - numeroDePrecinto(b.precinto));

    const tamano = ledgerPrecintoTamanoPagina();
    const totalPaginas = Math.max(1, Math.ceil(precintosDelOperador.length / tamano));
    if (paginaLedgerPrecinto > totalPaginas) paginaLedgerPrecinto = totalPaginas;
    if (paginaLedgerPrecinto < 1) paginaLedgerPrecinto = 1;
    const inicio = (paginaLedgerPrecinto - 1) * tamano;
    const visibles = precintosDelOperador.slice(inicio, inicio + tamano);

    tbody.innerHTML = visibles.length
      ? visibles.map((f, i) => {
          const fechaCelda = f.estado === 'scrap' ? f.scrapDetalle.fecha : f.uso.fecha;
          const motivoCelda = f.estado === 'scrap' ? (obtenerMotivoScrap(f.precinto) || '—') : (f.uso.observacion || '—');
          return `
        <tr>
          <td>${inicio + i + 1}</td>
          <td>${f.precinto}</td>
          <td>${f.material}</td>
          <td><span class="badge ${ESTADO_PRECINTO_BADGE[f.estado] || 'badge-gris'}"><span class="badge-dot"></span>${ESTADO_PRECINTO_TEXTO[f.estado] || f.estado}</span></td>
          <td>${fechaCelda}</td>
          <td>${motivoCelda}</td>
        </tr>`;
        }).join('')
      : `<tr><td colspan="6" class="submodulo-tabla-vacio">Sin precintos con estos filtros.</td></tr>`;

    renderPaginacionLedgerPrecinto(totalPaginas);
    return;
  }

  // "Por rango": cartola cronológica, solo movimientos Uso y Scrap del
  // período filtrado — ya no incluye Asignación ni saldo (eso es de
  // Asignación de Precintos). Paginada igual que "Por precinto".
  thead.innerHTML = `<tr><th>Fecha</th><th>Movimiento</th><th>Material</th><th>Numeración</th><th>Cantidad</th><th>Viaje</th><th>Tipo de operación</th><th>Terminal</th><th>PER N°</th><th>Motivo</th></tr>`;

  const eventosVisibles = ledger.eventos.filter(e => {
    if (e.tipo === 'asignacion') return false;
    if (desde && e.fechaISO < desde) return false;
    if (hasta && e.fechaISO > hasta) return false;
    return precintoCumpleFiltroMaterialLedger(e.material);
  });

  const tamano = ledgerRangoTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(eventosVisibles.length / tamano));
  if (paginaLedgerRango > totalPaginas) paginaLedgerRango = totalPaginas;
  if (paginaLedgerRango < 1) paginaLedgerRango = 1;
  const inicio = (paginaLedgerRango - 1) * tamano;
  const visibles = eventosVisibles.slice(inicio, inicio + tamano);

  tbody.innerHTML = visibles.length
    ? visibles.map(e => filaEventoLedgerHTML(e, false)).join('')
    : `<tr><td colspan="10" class="submodulo-tabla-vacio">Sin precintos usados ni scrap en el período filtrado.</td></tr>`;

  renderPaginacionLedgerRango(totalPaginas);
}

// "Buscar" SIEMPRE filtra la grilla por nombre de operador, aunque el texto
// calce con un N° de precinto exacto — para eso está el botón "Detalle de
// Precintos" aparte (ver abrirModalDetallePrecintos).
function filtrarReportePrecintos() {
  renderTablaReportePrecintos();
}

function limpiarFiltrosReportePrecintos() {
  document.getElementById('searchReportePrecintos').value = '';
  reportePeriodoSeleccionado = 'actual';
  document.getElementById('reportePeriodoSelect').value = 'actual';
  filtrarReportePrecintos();
}

/* =================================================
   KPIs: Usados y Scrap del PERÍODO filtrado + material con mayor stock —
   tres tarjetas fijas, no una
   por material (Sprint 4, "reporte usado/scrap + motivo"): el Reporte ya
   no muestra stock/Asignado (eso es de Asignación de Precintos).
================================================= */

// Reacciona al buscador de operador, al filtro de Material y al rango de
// fechas (criterio de aceptación §4: "cambiar el rango cambia Usado/Scrap/
// Total; los KPIs coinciden con la suma de la grilla") — mismo universo de
// precintos (usado/scrap, dentro del período) que alimenta la grilla.
function actualizarKpisReportePrecintos() {
  const cont = document.getElementById('kpiGridReportePrecintos');
  if (!cont) return;

  const texto = document.getElementById('searchReportePrecintos').value.trim().toLowerCase();
  const { desde, hasta } = obtenerRangoReportePeriodo();

  const dentroDelPeriodo = fechaStr => {
    const fechaISO = fechaDDMMYYYYaISO(fechaStr);
    if (desde && fechaISO < desde) return false;
    if (hasta && fechaISO > hasta) return false;
    return true;
  };

  // Mismo criterio que filasReportePrecintosFiltradas: si el texto no
  // matchea ningún nombre pero SÍ es un N° de precinto exacto, se resuelve
  // a su operador — los KPIs tienen que coincidir con lo que muestra la
  // grilla para esa misma búsqueda.
  let operadorPorPrecinto = null;
  if (texto) {
    const matchPrecinto = obtenerTodosLosPrecintosConEstado().find(f => f.precinto.toLowerCase() === texto);
    if (matchPrecinto && matchPrecinto.asignacion) operadorPorPrecinto = matchPrecinto.asignacion.recibidoPor;
  }

  const precintosDelPeriodo = obtenerTodosLosPrecintosConEstado()
    .filter(f => f.estado === 'usado' || f.estado === 'scrap')
    .filter(f => {
      if (!texto) return true;
      if (operadorPorPrecinto) return f.asignacion && f.asignacion.recibidoPor === operadorPorPrecinto;
      return f.asignacion && nombreColaborador(f.asignacion.recibidoPor).toLowerCase().includes(texto);
    })
    .filter(f => dentroDelPeriodo(f.estado === 'scrap' ? f.scrapDetalle.fecha : f.uso.fecha));

  const totalUsado = precintosDelPeriodo.filter(f => f.estado === 'usado').length;
  const totalScrap = precintosDelPeriodo.filter(f => f.estado === 'scrap').length;

  const iconoUsado = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>`;
  const iconoScrap = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`;

  const tarjetasTotales = `
    <div class="kpi-card" style="border-top:3px solid #16A34A">
      <div class="kpi-icon-box" style="color:#16A34A;background:#16A34A1A">${iconoUsado}</div>
      <div class="kpi-value">${totalUsado}</div>
      <div class="kpi-label">Usados del período</div>
    </div>
    <div class="kpi-card" style="border-top:3px solid #DC2626">
      <div class="kpi-icon-box" style="color:#DC2626;background:#DC26261A">${iconoScrap}</div>
      <div class="kpi-value">${totalScrap}</div>
      <div class="kpi-label">Scrap del período</div>
    </div>`;

  // Ya no hay una tarjeta por material (el catálogo va a crecer y la grilla
  // de KPIs no escala) — el desglose vive en "Detalle de Precintos > Stock
  // por operador". Acá solo queda el material con más precintos en stock
  // (asignados y todavía sin reportar como usado ni scrap). El stock no es
  // del período (es lo que hay hoy en manos de los operadores), pero sí
  // respeta el buscador de operador, igual que las otras dos tarjetas.
  const stockPorMaterial = {};
  obtenerTodosLosPrecintosConEstado()
    .filter(f => f.estado === 'asignado')
    .filter(f => {
      if (!texto) return true;
      if (operadorPorPrecinto) return f.asignacion.recibidoPor === operadorPorPrecinto;
      return nombreColaborador(f.asignacion.recibidoPor).toLowerCase().includes(texto);
    })
    .forEach(f => { stockPorMaterial[f.material] = (stockPorMaterial[f.material] || 0) + 1; });
  // Ranking: los 3 materiales con más stock (empate → orden alfabético).
  const ranking = Object.entries(stockPorMaterial)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3);

  const rankingHTML = ranking.length
    ? `<ol class="kpi-ranking">${ranking.map(([material, cantidad]) => `
        <li><span class="kpi-ranking-nombre" title="${material}">${material}</span><span class="kpi-ranking-valor">${cantidad}</span></li>`).join('')}
      </ol>`
    : `<div class="kpi-value">—</div>`;

  const tarjetaStock = `
    <div class="kpi-card kpi-card-ranking" style="border-top:3px solid #00B4D8">
      ${rankingHTML}
      <div class="kpi-label">Top 3 materiales con mayor stock</div>
    </div>`;

  cont.innerHTML = tarjetasTotales + tarjetaStock;
}

// El cierre de este reporte es mensual (§3.2): por defecto la grilla y sus
// KPIs muestran el mes en curso (1.º del mes hasta hoy) — el combo
// "Período" de la barra principal (igual concepto que el de "Ver
// movimientos", ver mesesConActividadLedger/rangoDelMes) permite elegir
// cualquier otro mes con actividad; Material y un rango personalizado
// siguen siendo solo de "Ver movimientos", por operador.
function rangoPeriodoActualRep() {
  const hoy = new Date();
  const primero = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const aISO = d => d.toISOString().slice(0, 10);
  return { desde: aISO(primero), hasta: aISO(hoy) };
}

let reportePeriodoSeleccionado = 'actual'; // 'actual' o una clave 'YYYY-MM' del select Período de la barra principal

// Meses (YYYY-MM) con algún Uso o Scrap reportado por CUALQUIER operador —
// mismo criterio que mesesConActividadLedger pero a nivel de todo el
// reporte, no de un solo operador. El mes en curso siempre aparece primero,
// tenga o no actividad todavía.
function mesesConActividadReporte() {
  const claves = new Set(
    obtenerTodosLosPrecintosConEstado()
      .filter(f => f.estado === 'usado' || f.estado === 'scrap')
      .map(f => fechaDDMMYYYYaISO(f.estado === 'scrap' ? f.scrapDetalle.fecha : f.uso.fecha).slice(0, 7))
  );
  const hoy = new Date();
  claves.add(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`);
  return [...claves].sort((a, b) => b.localeCompare(a));
}

function poblarPeriodoReporte() {
  const select = document.getElementById('reportePeriodoSelect');
  if (!select) return;
  const meses = mesesConActividadReporte();
  select.innerHTML = meses.map((clave, i) => {
    const [anio, mes] = clave.split('-');
    const etiqueta = new Date(Number(anio), Number(mes) - 1, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    return `<option value="${i === 0 ? 'actual' : clave}">${etiqueta}</option>`;
  }).join('');
  select.value = 'actual';
}

// Rango efectivo de la grilla/KPIs principales según el combo "Período" de
// la barra — mismo patrón que obtenerRangoLedgerActivo.
function obtenerRangoReportePeriodo() {
  if (reportePeriodoSeleccionado === 'actual') return rangoPeriodoActualRep();
  return rangoDelMes(reportePeriodoSeleccionado);
}

function cambiarPeriodoReporte() {
  reportePeriodoSeleccionado = document.getElementById('reportePeriodoSelect').value;
  paginaReportePrecintos = 1;
  renderTablaReportePrecintos();
}

/* =================================================
   DESCARGA: "Registro de Control de Precintos" — reporte de CIERRE, no de
   stock: solo incluye precintos que ya se reportaron como usados o como
   scrap (lo que todavía está asignado pero sin reportar NO entra — eso es
   información de Asignación de Precintos, no de este reporte). Una línea
   por grupo correlativo (rangos consecutivos agrupados, ver
   dividirPorMaterialYCorrelatividad), con casilleros de material tildados
   arriba y, si se descarga por Operador, una cabecera de resumen (Usado/
   Scrap/Total reportado) — mismo formato que la planilla física que este
   módulo reemplaza, siempre en PDF. Solo se descarga con el operador ya
   resuelto por contexto: "Ver movimientos" (ledgerOperadorActivoUsuario,
   con el rango/material activos de ese modal) es el único origen que la
   llama hoy — "codigoPrecintoFiltro" queda como parámetro opcional por si
   hace falta de nuevo un atajo de descarga por un solo precinto puntual.
   Ya no hay un selector general en la barra de filtros (se retiró el botón
   "Descargar Registro de Control").
   "descargarRegistroControl" solo arma los datos (d) — construirHTMLRegistroControl
   los convierte en el documento, y descargarRegistroControlPDF dispara la
   descarga (ver registrarDescargasControl).
================================================= */
function descargarRegistroControl({ operador, material, desde, hasta, codigoPrecintoFiltro } = {}) {
  // Si no vienen fechas explícitas, no se restringe por fecha (todo el
  // historial) — "Ver movimientos" y "Detalle del Precinto" siempre las
  // pasan explícitas (vacías si no se eligió un rango).
  if (desde === undefined) desde = '';
  if (hasta === undefined) hasta = '';

  if (!operador && !material && !desde && !hasta) {
    mostrarToast('Elige un filtro: operador, material o rango de fecha.');
    return;
  }

  // Qué criterio se usó para elegir el universo de esta descarga — se
  // guarda tal cual en "Última Descarga" (ver registrarUltimaDescargaControl).
  const modo = operador ? 'operador' : material ? 'material' : 'fecha';

  const registros = obtenerTodosLosPrecintosConEstado()
    .filter(f => f.estado === 'usado' || f.estado === 'scrap')
    .filter(f => !operador || (f.asignacion && f.asignacion.recibidoPor === operador))
    .filter(f => !material || f.material === material)
    .filter(f => !codigoPrecintoFiltro || f.precinto === codigoPrecintoFiltro)
    .filter(f => {
      if (!desde && !hasta) return true;
      const fechaRef = f.estado === 'scrap' ? f.scrapDetalle.fecha : f.uso.fecha;
      const fechaISO = fechaDDMMYYYYaISO(fechaRef);
      if (desde && fechaISO < desde) return false;
      if (hasta && fechaISO > hasta) return false;
      return true;
    });

  // Agrupa por fecha+operador+estado+detalle y, dentro de cada grupo, por
  // material y corrida consecutiva (mismo criterio que la cartola, ver
  // dividirPorMaterialYCorrelatividad) — así varios precintos reportados
  // juntos en el mismo viaje/motivo salen en una sola línea con rango
  // ("A-0301 al A-0303 (3)"), y un corte en la numeración o de material
  // queda en líneas separadas.
  // "Motivo" es columna propia (Sprint 4, "reporte usado/scrap + motivo"):
  // ya no se mezcla dentro de "Detalle" — un Scrap no tiene Viaje/Tipo de
  // Operación que mostrar ahí, y un Uso no tiene motivo (queda "—").
  const grupos = new Map();
  registros.forEach(f => {
    const esScrap = f.estado === 'scrap';
    const fecha = esScrap ? f.scrapDetalle.fecha : f.uso.fecha;
    const detalle = esScrap
      ? '—'
      : `Viaje ${f.uso.viaje || '—'} — ${f.uso.tipoOperacion || '—'}${f.uso.terminal ? ' / ' + f.uso.terminal : ''}`;
    const motivo = esScrap ? (obtenerMotivoScrap(f.precinto) || '—') : '—';
    const operadorNombre = f.asignacion ? nombreColaborador(f.asignacion.recibidoPor) : '—';
    const clave = [fecha, operadorNombre, f.estado, detalle, motivo].join('|');
    if (!grupos.has(clave)) {
      grupos.set(clave, { fecha, operador: operadorNombre, estado: esScrap ? 'Scrap' : 'Usado', detalle, motivo, perNumero: f.detalleGrp ? f.detalleGrp.numero : '—', precintos: [] });
    }
    grupos.get(clave).precintos.push(f.precinto);
  });

  const filas = [];
  grupos.forEach(g => {
    dividirPorMaterialYCorrelatividad(g.precintos).forEach(sub => {
      filas.push({ fecha: g.fecha, numeracion: sub.texto, material: sub.material, operador: g.operador, estado: g.estado, detalle: g.detalle, motivo: g.motivo, perNumero: g.perNumero, cantidad: sub.cantidad });
    });
  });
  filas.sort((a, b) => fechaDDMMYYYYaISO(a.fecha).localeCompare(fechaDDMMYYYYaISO(b.fecha)));

  // Casilleros tildados arriba: materiales que de verdad quedaron en el
  // reporte final, no el universo completo antes de filtrar.
  const materialesUsados = new Set(filas.map(f => f.material));
  const checkboxesMaterial = cargarMaterialesPrecinto().map(m => ({ nombre: m.nombre, tildado: materialesUsados.has(m.nombre) }));

  // Subtítulo: el criterio elegido por el atajo de contexto que llamó a esta
  // función (el combo operador+precinto puntual es la única excepción, ver
  // nota arriba).
  const criterios = [
    operador ? `Operador: ${nombreColaborador(operador)}` : null,
    material ? `Material: ${material}` : null,
    codigoPrecintoFiltro ? `Precinto: ${codigoPrecintoFiltro}` : null,
    (desde || hasta) ? `Período: ${desde ? fechaISOaDDMMYYYY(desde) : 'inicio'} a ${hasta ? fechaISOaDDMMYYYY(hasta) : 'hoy'}` : null
  ].filter(Boolean).join(' — ');

  // Cabecera de resumen, solo cuando se descarga por Operador: Usado/Scrap/
  // Total reportado DEL PERÍODO descargado (ya no Asignado/Queda — eso es
  // de Asignación de Precintos, Sprint 4 "reporte usado/scrap + motivo"),
  // más los terminales donde se usó dentro de ese mismo período.
  let resumenOperador = null;
  if (operador) {
    const resumenPeriodo = calcularSaldoOperador(operador, { desde, hasta });
    const ledgerOp = construirLedgerOperador(operador);
    const terminales = [...new Set(
      ledgerOp.eventos
        .filter(e => e.tipo === 'uso' && e.terminal)
        .filter(e => (!desde || e.fechaISO >= desde) && (!hasta || e.fechaISO <= hasta))
        .map(e => e.terminal)
    )];
    resumenOperador = {
      totalUsado: resumenPeriodo.totalUsado,
      totalScrap: resumenPeriodo.totalScrap,
      totalReportado: resumenPeriodo.totalUsado + resumenPeriodo.totalScrap,
      terminal: terminales.length ? terminales.join(' / ') : '—'
    };
  }

  // Operadores que de verdad quedaron incluidos en este reporte — una
  // descarga por Material o Rango de Fecha puede abarcar a varios a la vez,
  // así que "Última Descarga" (ver registrarUltimaDescargaControl) se
  // registra para cada uno, no solo cuando se descarga por Operador.
  const usuariosIncluidos = [...new Set(registros.map(f => f.asignacion.recibidoPor))];

  return { operador, material, codigoPrecintoFiltro, desde, hasta, modo, filas, checkboxesMaterial, criterios, resumenOperador, usuariosIncluidos };
}

// Arma el HTML del Registro de Control a partir de "d" (ver
// descargarRegistroControl) — lo usan tanto la descarga en PDF (imprime)
// como en Excel (mismo contenido, logo y encabezado dorado que Gastos, ver
// construirHojaExcelRegistroControl).
function construirHTMLRegistroControl(d) {
  const { operador, filas, checkboxesMaterial, criterios, resumenOperador } = d;

  const filasHTML = filas.map(f => `
    <tr>
      <td>${f.fecha}</td>
      <td>${f.numeracion}</td>
      <td>${f.material}</td>
      <td>${f.operador}</td>
      <td>${f.estado}</td>
      <td>${f.detalle}</td>
      <td>${f.motivo}</td>
      <td>${f.perNumero}</td>
    </tr>`).join('');

  const checksHTML = checkboxesMaterial.map(m => `
    <span class="check-material"><span class="check-caja">${m.tildado ? 'X' : ''}</span> ${m.nombre.toUpperCase()}</span>`).join('');

  const resumenHTML = resumenOperador ? `
    <div class="resumen-operador">
      <span><strong>Usado:</strong> ${resumenOperador.totalUsado}</span>
      <span><strong>Scrap:</strong> ${resumenOperador.totalScrap}</span>
      <span><strong>Total reportado:</strong> ${resumenOperador.totalReportado}</span>
      <span><strong>Terminal:</strong> ${resumenOperador.terminal}</span>
    </div>` : '';

  return `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Registro de Control de Precintos${operador ? ' — ' + nombreColaborador(operador) : ''}</title>
    <style>
      body  { font-family: Arial, sans-serif; font-size: 10.5px; margin: 20px; color: #111; }
      .encabezado { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
      .marca img { height: 20px; width: auto; display: block; }
      h2    { font-size: 13px; text-align: center; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 4px; }
      .subtitulo { font-size: 11px; text-align: center; margin: 0 0 14px; color: #555; }
      .checks { text-align: right; font-size: 9.5px; }
      .check-material { display: inline-block; margin-left: 14px; white-space: nowrap; }
      .check-caja { display: inline-block; width: 12px; height: 12px; border: 1px solid #111;
                    text-align: center; line-height: 12px; font-weight: 700; margin-right: 3px; }
      .resumen-operador { display: flex; flex-wrap: wrap; gap: 14px; font-size: 10px; margin: 0 0 14px; padding: 8px 10px; background: #FFF8DD; border-radius: 4px; }
      table { width: 100%; border-collapse: collapse; }
      th    { background: #FFC000; color: #111; padding: 6px 8px; text-align: left;
              font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; }
      td    { padding: 6px 8px; border-bottom: 1px solid #eee; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <div class="encabezado">
      <div class="marca"><img src="data:image/png;base64,${LOGO_INTERTEK_BASE64}" alt="Intertek"></div>
      <div class="checks">${checksHTML}</div>
    </div>
    <h2>Registro de Control de Precintos</h2>
    <p class="subtitulo">${criterios}</p>
    ${resumenHTML}
    <table>
      <thead>
        <tr><th>Fecha</th><th>Precinto</th><th>Material</th><th>Operador</th><th>Estado</th><th>Detalle</th><th>Motivo</th><th>PER N°</th></tr>
      </thead>
      <tbody>${filasHTML || `<tr><td colspan="8" style="text-align:center;color:#888;">No se encontraron precintos usados o scrap con estos filtros.</td></tr>`}</tbody>
    </table>
  </body></html>`;
}

function descargarRegistroControlPDF(opciones) {
  const d = descargarRegistroControl(opciones);
  if (!d) return;
  const win = window.open('', '_blank', 'width=1000,height=700');
  win.document.write(construirHTMLRegistroControl(d));
  win.document.close();
  win.focus();
  win.print();
  registrarDescargasControl(d, 'pdf');
}

// "Última Descarga" (Sprint 4, cierre §A.1): se registra con el MISMO rango
// que de verdad se usó (d.desde/d.hasta, ya null si el modo fue Operador o
// Material sin fecha) para cada operador incluido — y solo si la descarga
// salió con datos, no si el resultado quedó vacío.
function registrarDescargasControl(d, formato) {
  if (!d.filas.length) return;
  const sesion = obtenerUsuarioActual();
  const opcionesRegistro = { por: sesion ? sesion.usuario : null, desde: d.desde || null, hasta: d.hasta || null, modo: d.modo, material: d.material || null, formato };
  d.usuariosIncluidos.forEach(u => registrarUltimaDescargaControl(u, opcionesRegistro));
}

