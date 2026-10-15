// =================================================
// REGISTRO-GASTOS-OPERATIVOS.JS
// Precintos > Registro de Gastos Operativos: grilla principal (una fila por
// operador — no hay aprobación/estado, el supervisor puede editar en
// cualquier momento), filtro de búsqueda (operador/tipo/rango), vista previa
// + descarga desde el ícono de ojo, y el modal de "Configuración de Límites
// para Gastos". La lógica de los 3 modales de Detalle (Alimentos/Movilidad/
// Días a Bordo) vive en detalle-gastos.js.
// =================================================

document.addEventListener('DOMContentLoaded', () => {
  poblarFiltroUsuarioGastos();
  poblarSelectPeriodos('filterGastosPeriodo');
  renderTablaGastosOperativos();
  actualizarAlertaFeriadoEspecial();
});

/* =================================================
   FILTRO DE BÚSQUEDA DE LA GRILLA — por nombre/apellido, operador, tipo de
   reporte y Período (los mismos que se definen en Control de Precintos >
   Configuración > Configuración de Períodos, ver poblarSelectPeriodos y
   rangoDePeriodoSeleccionado en data-gastos.js — ya no un rango de fechas
   suelto). Ya no alimenta una descarga: la descarga real vive en el ícono
   de ojo de cada fila (ver VISTA PREVIA DESDE LA GRILLA más abajo).
================================================= */
function poblarFiltroUsuarioGastos() {
  const select = document.getElementById('filterGastosUsuario');
  if (!select) return;
  const usuarios = [...new Set(GASTOS_OPERATIVOS_DEMO
    .map(g => obtenerDetalleGastoPorTipo(g.tipo, g.id)?.firmaTrabajador)
    .filter(Boolean))];
  select.innerHTML = '<option value="">Todos</option>' +
    usuarios.map(u => `<option value="${u}">${nombreColaboradorGastos(u)}</option>`).join('');
}

function filtrarGastosOperativos() {
  const texto = document.getElementById('searchGastosOperativos').value.trim().toLowerCase();
  const usuario = document.getElementById('filterGastosUsuario').value;
  const tipo = document.getElementById('filterGastosTipo').value;
  const rango = rangoDePeriodoSeleccionado('filterGastosPeriodo');

  const grupos = agruparGastosPorOperador().filter(grupo => {
    // Además de nombre/apellido, busca por código de jornada, PER y cliente
    // dentro de los registros de sus 3 reportes (mismos campos que ya ve el
    // móvil en "Reportes").
    if (texto) {
      const matchNombre = `${grupo.nombre} ${grupo.apellido}`.toLowerCase().includes(texto);
      const matchDetalle = grupo.reportes.some(r => {
        const detalle = obtenerDetalleGastoPorTipo(r.tipo, r.id);
        if (!detalle) return false;
        return detalle.grilla.some(f => {
          const campos = [f.codigoJornada, f.codigo, f.operacionPer, f.cliente, f.per].filter(Boolean).join(' ').toLowerCase();
          return campos.includes(texto);
        });
      });
      if (!matchNombre && !matchDetalle) return false;
    }
    if (usuario && grupo.usuario !== usuario) return false;
    if (tipo && !grupo.reportes.some(r => r.tipo === tipo)) return false;
    if (rango) {
      const dentroDelRango = grupo.reportes.some(r => {
        const rDesde = fechaDDMMYYYYaISO(r.fechaDesde);
        const rHasta = fechaDDMMYYYYaISO(r.fechaHasta);
        return rHasta >= rango.desde && rDesde <= rango.hasta;
      });
      if (!dentroDelRango) return false;
    }
    return true;
  });

  renderTablaGastosOperativos(grupos);
}

function limpiarFiltrosGastosOperativos() {
  document.getElementById('searchGastosOperativos').value = '';
  document.getElementById('filterGastosUsuario').value = '';
  document.getElementById('filterGastosTipo').value = '';
  document.getElementById('filterGastosPeriodo').value = '';
  renderTablaGastosOperativos();
}

/* =================================================
   GRILLA PRINCIPAL — una fila por operador (no hay aprobación/estado que
   cerrar, el supervisor solo ve y descarga). "Ver" abre el resumen de sus 3
   reportes del período actual (Alimentos/Movilidad/Días a Bordo), cada uno
   descargable; "Historial" abre el histórico por tipo+período.
================================================= */
function agruparGastosPorOperador() {
  const grupos = new Map();
  GASTOS_OPERATIVOS_DEMO.forEach(g => {
    const detalle = obtenerDetalleGastoPorTipo(g.tipo, g.id);
    const usuario = detalle ? detalle.firmaTrabajador : null;
    const clave = usuario || `${g.nombre}|${g.apellido}`;
    if (!grupos.has(clave)) {
      grupos.set(clave, { clave, usuario, nombre: g.nombre, apellido: g.apellido, area: g.area, reportes: [] });
    }
    grupos.get(clave).reportes.push(g);
  });
  return [...grupos.values()];
}

// La fila más reciente de un operador (por fechaHasta, entre sus 3 tipos de
// reporte) — "Último período" de la grilla.
// Un reporte (período) solo cuenta como "cargado" si el operador ya agregó
// algo — los que se crean solos al abrir Jornada/Gastos, todavía vacíos, no
// deben aparecer como actividad real en ningún lado de la grilla.
function reporteTieneRegistros(r) {
  return resumenReporteGasto(r).cantidad > 0;
}

function ultimaCargaOperador(grupo) {
  return grupo.reportes.filter(reporteTieneRegistros).reduce((mas, r) =>
    (!mas || fechaDDMMYYYYaISO(r.fechaHasta) > fechaDDMMYYYYaISO(mas.fechaHasta)) ? r : mas, null);
}

// Descarga el reporte (período) con el id dado — lo usan el Historial y el
// modal de "elegir formato".
async function descargarReportePorId(reporteId, formato) {
  const r = GASTOS_OPERATIVOS_DEMO.find(g => g.id === reporteId);
  if (!r) return;
  const detalle = obtenerDetalleGastoPorTipo(r.tipo, r.id);
  const usuario = detalle ? detalle.firmaTrabajador : null;
  if (!usuario) { mostrarToast('Este operador no tiene un usuario del sistema asociado; no se puede generar el reporte.'); return; }

  const desde = fechaDDMMYYYYaISO(r.fechaDesde);
  const hasta = fechaDDMMYYYYaISO(r.fechaHasta);
  const d = prepararDescargaGastos({ usuario, tipo: r.tipo, desde, hasta });
  if (!d) return;

  if (formato === 'excel') await descargarWorkbookGastos(d);
  else abrirVentanaReporteGastos(d, { imprimir: true });

  registrarUltimaDescargaGastos(usuario, r.tipo, desde, hasta);
}

// Resumen de un reporte puntual (un período de uno de los 3 tipos): N° de
// reporte, cuántos gastos cargó el operario y el monto total.
function resumenReporteGasto(r) {
  // Días a Bordo se regenera antes de resumir (§1.2: "se regenera al abrir"
  // — acá se ve en el selector "Editar Gastos del Operador" sin tener que
  // entrar al Detalle primero).
  if (r.tipo === 'Días a Bordo') regenerarDiasABordo(r.id);
  const detalle = obtenerDetalleGastoPorTipo(r.tipo, r.id);
  if (!detalle) return { numero: '—', cantidad: 0, total: 0 };
  const cfg = CONFIG_TIPO_GASTO[r.tipo];
  const total = detalle.grilla.reduce((acc, fila) => acc + (Number(fila[cfg.campoMonto]) || 0), 0);
  return { numero: detalle.numero, cantidad: detalle.grilla.length, total };
}

function renderTablaGastosOperativos(gruposFiltrados) {
  const grupos = gruposFiltrados || agruparGastosPorOperador();
  const tbody = document.getElementById('tbodyGastosOperativos');

  if (!grupos.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="submodulo-tabla-vacio">No se encontraron registros de gastos operativos.</td></tr>`;
    return;
  }

  tbody.innerHTML = grupos.map(grupo => {
    const ultima = ultimaCargaOperador(grupo);
    return `
    <tr>
      <td>${grupo.nombre}</td>
      <td>${grupo.apellido}</td>
      <td>${ultima ? asegurarPeriodoGastoNombrado(ultima.fechaDesde, ultima.fechaHasta) : '—'}</td>
      <td class="ultima-descarga-cell">${grupo.usuario ? textoUltimaDescargaGastosOperador(grupo.usuario) : 'Sin descargas registradas'}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver" onclick="abrirSelectorPreviewGastos('${grupo.clave}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="btn-accion btn-reset" title="Historial" onclick="abrirSelectorEditarGastos('${grupo.clave}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 3"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

/* =================================================
   "VER" — resumen de los 3 reportes del operador (Alimentos/Movilidad/Días
   a Bordo); cada uno abre el Detalle real de su período más reciente, donde
   vive el botón "Descargar" (abre el modal de "elegir formato" Excel/PDF).
================================================= */
function abrirSelectorPreviewGastos(clave) {
  const grupo = agruparGastosPorOperador().find(g => g.clave === clave);
  if (!grupo) return;
  if (!grupo.usuario) { mostrarToast('Este operador no tiene un usuario del sistema asociado; no se puede generar el reporte.'); return; }

  document.getElementById('previewGastosOperadorNombre').textContent = `${grupo.nombre} ${grupo.apellido}`;
  renderPreviewGastosLista(grupo);
  abrirModal('modalPreviewGastos');
}

function renderPreviewGastosLista(grupo) {
  const cont = document.getElementById('previewGastosLista');
  const iconoOjo = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>';

  cont.innerHTML = TIPOS_GASTO_PREVIEW.map(tipo => {
    const reportes = grupo.reportes.filter(r => r.tipo === tipo && reporteTieneRegistros(r));
    if (!reportes.length) {
      return `<div class="preview-gastos-opcion preview-gastos-opcion-vacia">
        <span class="preview-gastos-opcion-info">
          <span class="preview-gastos-opcion-titulo">${tipo}</span>
          <span class="preview-gastos-opcion-sub">Sin reportes registrados</span>
        </span>
      </div>`;
    }

    // "Ver" siempre abre el período más reciente (ultimoReporteDeTipo) — el
    // subtítulo tiene que ser el de ESE período (su nombre, no un rango
    // agregado de los N períodos que tiene el operador, que confundía:
    // mostraba "2 períodos · 10/08 al 09/10" aunque "Ver" solo abriera uno).
    // Los anteriores siguen disponibles en "Historial".
    const ultimo = ultimoReporteDeTipo(reportes);
    return `<div class="preview-gastos-opcion">
      <span class="preview-gastos-opcion-info">
        <span class="preview-gastos-opcion-titulo">${tipo}</span>
        <span class="preview-gastos-opcion-sub">${asegurarPeriodoGastoNombrado(ultimo.fechaDesde, ultimo.fechaHasta)}</span>
        <span class="preview-gastos-opcion-descarga">${textoUltimaDescargaGastos(grupo.usuario, tipo)}</span>
      </span>
      <span class="preview-gastos-opcion-acciones">
        <button type="button" class="btn-accion btn-ver" title="Ver" onclick="cerrarModal('modalPreviewGastos'); abrirDetalleGasto(${ultimo.id})">${iconoOjo}</button>
      </span>
    </div>`;
  }).join('');
}

// El reporte (período) más reciente de un tipo dado, por fechaHasta — "Ver"
// abre el Detalle de ese período.
function ultimoReporteDeTipo(reportes) {
  return reportes.reduce((mas, r) =>
    (!mas || fechaDDMMYYYYaISO(r.fechaHasta) > fechaDDMMYYYYaISO(mas.fechaHasta)) ? r : mas, null);
}

/* =================================================
   MODAL "ELEGIR FORMATO" — el botón "Descargar" del Detalle y de Historial
   abren este modal chico (Excel/PDF) en vez de duplicar botones;
   pendienteReporteId guarda qué reporte se va a descargar hasta elegir.
================================================= */
let pendienteReporteId = null;

function abrirElegirFormatoDescargaReporte(reporteId) {
  pendienteReporteId = reporteId;
  abrirModal('modalElegirFormatoDescarga');
}

async function confirmarFormatoDescargaElegido(formato) {
  if (!pendienteReporteId) return;
  const reporteId = pendienteReporteId;
  pendienteReporteId = null;
  cerrarModal('modalElegirFormatoDescarga');

  await descargarReportePorId(reporteId, formato);

  renderTablaGastosOperativos();
  if (editarGastosOperadorClave) renderTablaEditarGastosOperador();
  mostrarToast(`Reporte descargado correctamente (${formato === 'excel' ? 'Excel' : 'PDF'}).`);
}

/* =================================================
   HISTORIAL — 3 pestañas (Alimentos/Movilidad/Días a Bordo) del operador que
   abrió el modal, cada una lista sus períodos; búsqueda por N° de gasto
   (mismo nombre que la columna) + rango Desde/Hasta. "Ver" abre el Detalle
   real; el ícono de descarga abre el modal de "elegir formato".
================================================= */
let editarGastosOperadorClave = null;
let editarGastosOperadorTab = 'Alimentos';
let verGastosBusquedaFiltro = '';
let verGastosDesdeFiltro = '';
let verGastosHastaFiltro = '';
let verGastosComidaFiltro = '';
// "Rango personalizado" (checkbox, mismo patrón que Reporte de Precintos >
// Movimientos del operador — ver ledgerRangoPersonalizado en
// reporte-precintos.js): por defecto se filtra por Período (compendio, una
// fila por período); al tildarlo se cambia a un detalle día por día dentro
// del rango Desde/Hasta elegido, porque un rango arbitrario puede no
// coincidir con los límites de ningún Período.
let verGastosRangoPersonalizado = false;

function abrirSelectorEditarGastos(clave) {
  const grupo = agruparGastosPorOperador().find(g => g.clave === clave);
  if (!grupo) return;

  editarGastosOperadorClave = clave;
  editarGastosOperadorTab = 'Alimentos';
  document.getElementById('editarGastosOperadorNombre').textContent = `${grupo.nombre} ${grupo.apellido}`;
  document.querySelectorAll('#modalEditarGastosOperador .limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.tab === 'Alimentos'));
  poblarSelectPeriodos('verGastosPeriodo');
  actualizarVisibilidadComidaVerGastos();
  limpiarFiltrosVerGastosOperador();
  abrirModal('modalEditarGastosOperador');
}

function cambiarTabEditarGastosOperador(tipo) {
  editarGastosOperadorTab = tipo;
  document.querySelectorAll('#modalEditarGastosOperador .limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.tab === tipo));
  actualizarVisibilidadComidaVerGastos();
  renderTablaEditarGastosOperador();
}

// "Comida" (segundo filtro, como "Material" en Movimientos de Precintos)
// solo tiene sentido en Alimentos — Movilidad y Días a Bordo no registran
// por tipo de comida.
function actualizarVisibilidadComidaVerGastos() {
  const grupo = document.getElementById('verGastosComidaGroup');
  if (grupo) grupo.style.display = editarGastosOperadorTab === 'Alimentos' ? '' : 'none';
}

function filtrarVerGastosOperador() {
  verGastosBusquedaFiltro = document.getElementById('verGastosBusqueda').value.trim().toLowerCase();
  verGastosComidaFiltro = document.getElementById('verGastosComida').value;
  if (verGastosRangoPersonalizado) {
    verGastosDesdeFiltro = document.getElementById('verGastosDesdeInput').value;
    verGastosHastaFiltro = document.getElementById('verGastosHastaInput').value;
  } else {
    const rango = rangoDePeriodoSeleccionado('verGastosPeriodo');
    verGastosDesdeFiltro = rango ? rango.desde : '';
    verGastosHastaFiltro = rango ? rango.hasta : '';
  }
  renderTablaEditarGastosOperador();
}

function limpiarFiltrosVerGastosOperador() {
  verGastosBusquedaFiltro = ''; verGastosDesdeFiltro = ''; verGastosHastaFiltro = ''; verGastosComidaFiltro = '';
  verGastosRangoPersonalizado = false;
  document.getElementById('verGastosBusqueda').value = '';
  document.getElementById('verGastosPeriodo').value = '';
  document.getElementById('verGastosDesdeInput').value = '';
  document.getElementById('verGastosHastaInput').value = '';
  document.getElementById('verGastosComida').value = '';
  document.getElementById('verGastosRangoCheck').checked = false;
  aplicarVisibilidadRangoVerGastos();
  renderTablaEditarGastosOperador();
}

function aplicarVisibilidadRangoVerGastos() {
  const r = verGastosRangoPersonalizado;
  document.getElementById('verGastosPeriodoGroup').style.display = r ? 'none' : '';
  document.getElementById('verGastosDesdeGroup').style.display = r ? '' : 'none';
  document.getElementById('verGastosHastaGroup').style.display = r ? '' : 'none';
}

function alternarRangoPersonalizadoVerGastos() {
  verGastosRangoPersonalizado = document.getElementById('verGastosRangoCheck').checked;
  aplicarVisibilidadRangoVerGastos();
  if (verGastosRangoPersonalizado) {
    const desdeInput = document.getElementById('verGastosDesdeInput');
    const hastaInput = document.getElementById('verGastosHastaInput');
    if (!desdeInput.value && !hastaInput.value) {
      // Arranca con el rango del período elegido (si había uno), para no
      // abrir en blanco — mismo criterio que Reporte de Precintos.
      const rango = rangoDePeriodoSeleccionado('verGastosPeriodo');
      if (rango) { desdeInput.value = rango.desde; hastaInput.value = rango.hasta; }
    }
  }
  filtrarVerGastosOperador();
}

// Un período coincide con la búsqueda si su N° de gasto (resumen.numero)
// calza — mismo campo que muestra la columna "N° de Registro de Período".
function periodoCoincideBusqueda(resumen, texto) {
  if (!texto) return true;
  return String(resumen.numero).toLowerCase().includes(texto);
}

function periodoDentroDeRango(r) {
  if (!verGastosDesdeFiltro && !verGastosHastaFiltro) return true;
  const rDesde = fechaDDMMYYYYaISO(r.fechaDesde);
  const rHasta = fechaDDMMYYYYaISO(r.fechaHasta);
  if (verGastosDesdeFiltro && rHasta < verGastosDesdeFiltro) return false;
  if (verGastosHastaFiltro && rDesde > verGastosHastaFiltro) return false;
  return true;
}

function renderTablaEditarGastosOperador() {
  const grupo = agruparGastosPorOperador().find(g => g.clave === editarGastosOperadorClave);
  const tbody = document.getElementById('tbodyEditarGastosOperador');
  if (!grupo || !tbody) return;

  // Días a Bordo ya es período a período (no hay "día suelto" que mostrar
  // fuera de eso), así que "Rango personalizado" ahí se queda como filtro
  // de fecha sobre los mismos períodos, sin bajar a detalle diario.
  const porDia = verGastosRangoPersonalizado && editarGastosOperadorTab !== 'Días a Bordo';
  const thead = document.getElementById('theadEditarGastosOperador');
  if (thead) {
    thead.innerHTML = porDia
      ? `<tr><th>Fecha</th>${editarGastosOperadorTab === 'Alimentos' ? '<th>Comida</th>' : ''}<th>N° de Registro Diario</th><th>N° de Registro de Período</th><th>Monto</th><th style="width:70px;">Opciones</th></tr>`
      : `<tr><th>Período</th><th>N° de Registro de Período</th><th>Registros</th><th>Monto Total</th><th style="width:70px;">Opciones</th></tr>`;
  }

  if (porDia) renderHistorialPorDia(grupo, tbody);
  else renderHistorialPorPeriodo(grupo, tbody);
}

const iconoOjoHistorial = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const iconoDescargaHistorial = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

// Historial por PERÍODO para los 3 tipos (Alimentos, Movilidad y Días a
// Bordo) — un compendio de todo lo que el operador subió día a día dentro
// de ese período, en una sola fila (pedido explícito: "mantenerlo ordenado
// por período" en vez de una fila por día, aunque el operador siga
// registrando diario desde el móvil). Un reporte solo "existe" acá cuando
// el operador ya agregó algo (los períodos vacíos, creados solos al abrir
// Jornada/Gastos, no se muestran). El detalle día por día sigue disponible
// al abrir "Ver" (ver abrirDetalleGasto en detalle-gastos.js).
function renderHistorialPorPeriodo(grupo, tbody) {
  const todosDelTipo = grupo.reportes
    .filter(r => r.tipo === editarGastosOperadorTab)
    .map(r => ({ r, resumen: resumenReporteGasto(r) }))
    .filter(({ resumen }) => resumen.cantidad > 0);
  const reportes = todosDelTipo
    .filter(({ r }) => periodoDentroDeRango(r))
    .filter(({ resumen }) => periodoCoincideBusqueda(resumen, verGastosBusquedaFiltro))
    .sort((a, b) => fechaDDMMYYYYaISO(b.r.fechaDesde).localeCompare(fechaDDMMYYYYaISO(a.r.fechaDesde)));

  if (!reportes.length) {
    const hayFiltrosActivos = verGastosBusquedaFiltro || verGastosDesdeFiltro || verGastosHastaFiltro;
    tbody.innerHTML = todosDelTipo.length && hayFiltrosActivos
      ? `<tr><td colspan="5" class="submodulo-tabla-vacio">Sin períodos para los filtros elegidos.</td></tr>`
      : `<tr><td colspan="5" class="submodulo-tabla-vacio">Este operador no tiene reportes de ${editarGastosOperadorTab}.</td></tr>`;
    return;
  }

  tbody.innerHTML = reportes.map(({ r, resumen }) => `
    <tr>
      <td>${asegurarPeriodoGastoNombrado(r.fechaDesde, r.fechaHasta)}</td>
      <td>${resumen.numero}</td>
      <td>${resumen.cantidad}</td>
      <td>S/ ${resumen.total.toFixed(2)}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver" onclick="abrirDetalleGasto(${r.id})">${iconoOjoHistorial}</button>
        <button class="btn-accion btn-descarga" title="Descargar" onclick="abrirElegirFormatoDescargaReporte(${r.id})">${iconoDescargaHistorial}</button>
      </td>
    </tr>`).join('');
}

// Vista "Rango personalizado" (Alimentos/Movilidad) — una fila por cada
// comida/viaje que el operador registró ese día desde el móvil, dentro del
// rango Desde/Hasta elegido, sin agruparlas por Período (un rango libre
// puede cruzar varios períodos o caer a mitad de uno). Cada fila trae dos
// números distintos a propósito: el "N° de Registro Diario" que generó el
// móvil al guardar ESE día (fila.codigoJornada/fila.codigo — ver
// detalle-gastos.js), y el "N° de Registro de Período" del reporte
// compendio al que esa fila pertenece (detalle.numero) — mismo criterio en
// toda la pantalla, ver asegurarPeriodoGastoNombrado/renderHistorialPorPeriodo.
function renderHistorialPorDia(grupo, tbody) {
  const cfg = CONFIG_TIPO_GASTO[editarGastosOperadorTab];
  const reportesDelTipo = grupo.reportes.filter(r => r.tipo === editarGastosOperadorTab);

  const todasLasFilas = [];
  reportesDelTipo.forEach(r => {
    const detalle = obtenerDetalleGastoPorTipo(r.tipo, r.id);
    if (!detalle) return;
    detalle.grilla.forEach(fila => {
      todasLasFilas.push({ fila, reporteId: r.id, numeroPeriodo: detalle.numero, fechaISO: fechaDDMMYYYYaISO(fila.fecha) });
    });
  });

  const filtradas = todasLasFilas
    .filter(f => !verGastosDesdeFiltro || f.fechaISO >= verGastosDesdeFiltro)
    .filter(f => !verGastosHastaFiltro || f.fechaISO <= verGastosHastaFiltro)
    .filter(f => !verGastosComidaFiltro || f.fila.comida === verGastosComidaFiltro)
    .filter(f => {
      if (!verGastosBusquedaFiltro) return true;
      const codigoDiario = String(f.fila.codigoJornada || f.fila.codigo || '').toLowerCase();
      return codigoDiario.includes(verGastosBusquedaFiltro) || String(f.numeroPeriodo).toLowerCase().includes(verGastosBusquedaFiltro);
    })
    .sort((a, b) => b.fechaISO.localeCompare(a.fechaISO));

  const colspan = editarGastosOperadorTab === 'Alimentos' ? 6 : 5;
  if (!filtradas.length) {
    tbody.innerHTML = todasLasFilas.length
      ? `<tr><td colspan="${colspan}" class="submodulo-tabla-vacio">Sin registros para los filtros elegidos.</td></tr>`
      : `<tr><td colspan="${colspan}" class="submodulo-tabla-vacio">Este operador no tiene reportes de ${editarGastosOperadorTab}.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtradas.map(({ fila, reporteId, numeroPeriodo }) => `
    <tr>
      <td>${fila.fecha}</td>
      ${editarGastosOperadorTab === 'Alimentos' ? `<td>${fila.comida || '—'}</td>` : ''}
      <td>${fila.codigoJornada || fila.codigo || '—'}</td>
      <td>${numeroPeriodo}</td>
      <td>S/ ${Number(fila[cfg.campoMonto] || 0).toFixed(2)}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver" onclick="abrirDetalleGasto(${reporteId})">${iconoOjoHistorial}</button>
        <button class="btn-accion btn-descarga" title="Descargar" onclick="abrirElegirFormatoDescargaReporte(${reporteId})">${iconoDescargaHistorial}</button>
      </td>
    </tr>`).join('');
}

/* =================================================
   RESUMEN TOTAL DE DÍAS A BORDO (§1.4) — un solo archivo con TODOS los
   operadores del rango elegido, calcando "RESUMEN TOTAL DIAS A BORDO...xlsx":
   cabecera con "MONTOS ESTABLECIDOS" (tomados de la configuración vigente),
   una fila por operador (Feriados/Dom. Lima/Dom. Prov./Días a Bordo, en
   días y soles) y totales. Botón "Resumen Total" de la barra, para
   supervisores — el móvil no genera este reporte (ver §2 del prompt).
================================================= */
let resumenTotalRangoPersonalizado = false;
let resumenTotalDesdeFiltro = '';
let resumenTotalHastaFiltro = '';

function abrirModalResumenTotal() {
  const hoy = new Date();
  const aISO = d => d.toISOString().slice(0, 10);
  const desdeActualISO = aISO(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 10));
  const hastaActualISO = aISO(new Date(hoy.getFullYear(), hoy.getMonth(), 9));
  const desdeActualDDMM = fechaISOaDDMMYYYY(desdeActualISO);
  const hastaActualDDMM = fechaISOaDDMMYYYY(hastaActualISO);

  // Asegura que el período actual ya exista en la lista (puede no existir
  // todavía si nadie generó un gasto este mes) — mismo criterio que usa el
  // móvil, ver asegurarPeriodoGastoNombrado en data-gastos.js.
  asegurarPeriodoGastoNombrado(desdeActualDDMM, hastaActualDDMM);
  poblarSelectPeriodos('resumenTotalPeriodo');
  const periodoActual = PERIODOS_GASTOS_DEMO.find(p => p.fechaInicio === desdeActualDDMM && p.fechaFin === hastaActualDDMM);
  document.getElementById('resumenTotalPeriodo').value = periodoActual ? periodoActual.id : '';

  resumenTotalRangoPersonalizado = false;
  document.getElementById('resumenTotalRangoCheck').checked = false;
  document.getElementById('resumenTotalDesdeInput').value = desdeActualISO;
  document.getElementById('resumenTotalHastaInput').value = hastaActualISO;
  aplicarVisibilidadRangoResumenTotal();
  buscarResumenTotal();

  abrirModal('modalResumenTotal');
}

function aplicarVisibilidadRangoResumenTotal() {
  const r = resumenTotalRangoPersonalizado;
  document.getElementById('resumenTotalPeriodoGroup').style.display = r ? 'none' : '';
  document.getElementById('resumenTotalDesdeGroup').style.display = r ? '' : 'none';
  document.getElementById('resumenTotalHastaGroup').style.display = r ? '' : 'none';
}

function alternarRangoPersonalizadoResumenTotal() {
  resumenTotalRangoPersonalizado = document.getElementById('resumenTotalRangoCheck').checked;
  aplicarVisibilidadRangoResumenTotal();
  if (resumenTotalRangoPersonalizado) {
    const desdeInput = document.getElementById('resumenTotalDesdeInput');
    const hastaInput = document.getElementById('resumenTotalHastaInput');
    if (!desdeInput.value && !hastaInput.value) {
      const rango = rangoDePeriodoSeleccionado('resumenTotalPeriodo');
      if (rango) { desdeInput.value = rango.desde; hastaInput.value = rango.hasta; }
    }
  }
  buscarResumenTotal();
}

function buscarResumenTotal() {
  if (resumenTotalRangoPersonalizado) {
    resumenTotalDesdeFiltro = document.getElementById('resumenTotalDesdeInput').value;
    resumenTotalHastaFiltro = document.getElementById('resumenTotalHastaInput').value;
  } else {
    const rango = rangoDePeriodoSeleccionado('resumenTotalPeriodo');
    resumenTotalDesdeFiltro = rango ? rango.desde : '';
    resumenTotalHastaFiltro = rango ? rango.hasta : '';
  }

  const ultima = ULTIMA_DESCARGA_GASTOS['resumen-total|Resumen Total'];
  document.getElementById('resumenTotalUltimaDescarga').textContent = ultima
    ? textoUltimaDescargaGastos('resumen-total', 'Resumen Total')
    : 'Sin descargas registradas';
}

function limpiarFiltrosResumenTotal() {
  resumenTotalRangoPersonalizado = false;
  document.getElementById('resumenTotalRangoCheck').checked = false;
  document.getElementById('resumenTotalPeriodo').value = '';
  document.getElementById('resumenTotalDesdeInput').value = '';
  document.getElementById('resumenTotalHastaInput').value = '';
  aplicarVisibilidadRangoResumenTotal();
  buscarResumenTotal();
}

// Arma los datos del Resumen Total a partir del rango elegido — una fila
// por operador con actividad (ver operadoresConDiasABordo, data-gastos.js),
// ordenadas alfabéticamente por apellido, con N° correlativo 1..N.
function prepararResumenTotal(desde, hasta) {
  if (!desde || !hasta) { mostrarToast('Selecciona un rango de fechas.'); return null; }

  const operadores = operadoresConDiasABordo(desde, hasta)
    .map(({ usuario, resumen }) => {
      const u = obtenerUsuarioPorNombre(usuario);
      return { usuario, nombre: u ? `${u.apellido} ${u.nombre}` : usuario, resumen };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((op, i) => ({ ...op, numero: i + 1 }));

  if (!operadores.length) { mostrarToast('No se encontraron operadores con Días a Bordo en este rango.'); return null; }

  const cfg = LIMITES_GASTOS_DEMO.diasABordo;
  const totales = operadores.reduce((acc, op) => ({
    feriadoDias: acc.feriadoDias + op.resumen.feriadoDias,
    domLimaDias: acc.domLimaDias + op.resumen.domLimaDias,
    domProvDias: acc.domProvDias + op.resumen.domProvDias,
    bordoDias: acc.bordoDias + op.resumen.bordoDias,
    total: acc.total + op.resumen.total
  }), { feriadoDias: 0, domLimaDias: 0, domProvDias: 0, bordoDias: 0, total: 0 });

  return {
    desde, hasta, operadores, totales,
    montoFeriadoUSD: cfg.feriadosEspeciales.length ? cfg.feriadosEspeciales[0].montoUSD : 70,
    montoDomingo: cfg.domingo, montoDiaNormal: cfg.diaNormal,
    tituloPeriodo: `Del 10 de ${MESES_GASTOS[new Date(desde + 'T00:00:00').getMonth()].toUpperCase()} ${new Date(desde + 'T00:00:00').getFullYear()} al 09 ${MESES_GASTOS[new Date(hasta + 'T00:00:00').getMonth()].toUpperCase()} ${new Date(hasta + 'T00:00:00').getFullYear()}`,
    fechaEmision: fechaHoraActualGastos(),
    hayPendientes: operadores.some(op => op.resumen.pendiente)
  };
}

function construirHojaExcelResumenTotal(sheet, r) {
  aplicarMarcaAguaExcel(sheet);
  sheet.columns = [{ width: 4 }, { width: 28 }, { width: 16 }, { width: 12 },
    { width: 9 }, { width: 11 }, { width: 9 }, { width: 11 }, { width: 9 }, { width: 11 }, { width: 9 }, { width: 11 },
    { width: 13 }, { width: 16 }, { width: 12 }];

  sheet.mergeCells(1, 1, 1, 15);
  sheet.getRow(1).height = 60;
  const logoId = sheet.workbook.addImage({ base64: LOGO_INTERTEK_BASE64, extension: 'png' });
  sheet.addImage(logoId, { tl: { col: 0, row: 0.1 }, ext: { width: 180, height: 120 } });

  sheet.mergeCells(2, 2, 2, 15);
  celdaExcelGastos(sheet, 2, 2, 'RESUMEN TOTAL DE PAGO', { bold: true, size: 14, align: 'center', borde: false });

  celdaExcelGastos(sheet, 4, 11, 'MONTOS ESTABLECIDOS (S/.):', { bold: true, borde: false });
  celdaExcelGastos(sheet, 6, 2, 'PARA:', { bold: true, borde: false });
  celdaExcelGastos(sheet, 6, 11, 'DÍA FERIADO LABORADO (US$)', { bold: true, borde: false });
  celdaExcelGastos(sheet, 6, 15, r.montoFeriadoUSD, { bold: true, align: 'right', borde: false });
  celdaExcelGastos(sheet, 7, 2, 'DE:', { bold: true, borde: false });
  celdaExcelGastos(sheet, 7, 11, 'DÍA DOMINGO LABORADO EN LIMA', { bold: true, borde: false });
  celdaExcelGastos(sheet, 7, 15, r.montoDomingo, { bold: true, align: 'right', borde: false });
  celdaExcelGastos(sheet, 8, 2, 'REF:', { bold: true, borde: false });
  celdaExcelGastos(sheet, 8, 3, 'PAGO POR DIA LABORADO EN BUQUES', { bold: true, borde: false });
  celdaExcelGastos(sheet, 8, 11, 'DÍA DOMINGO LABORADO EN PROV.', { bold: true, borde: false });
  celdaExcelGastos(sheet, 8, 15, r.montoDomingo, { bold: true, align: 'right', borde: false });
  celdaExcelGastos(sheet, 9, 2, 'FECHA:', { bold: true, borde: false });
  celdaExcelGastos(sheet, 9, 3, r.tituloPeriodo, { bold: true, borde: false });
  celdaExcelGastos(sheet, 9, 11, 'DÍA A BORDO', { bold: true, borde: false });
  celdaExcelGastos(sheet, 9, 15, r.montoDiaNormal, { bold: true, align: 'right', borde: false });

  let f = 11;
  const headers1 = ['N°', 'APELLIDO Y NOMBRE', 'BUQUE', 'PER', 'Feriados Lab. (días)', 'Feriados Lab. (S/.)', 'Dom. Lab. Lima (días)', 'Dom. Lab. Lima (S/.)', 'Dom. Lab. Prov. (días)', 'Dom. Lab. Prov. (S/.)', 'Días a Bordo (días)', 'Días a Bordo (S/.)', 'TOTAL A COBRAR', 'FECHA DE FACTURACIÓN', 'CENTRO DE COSTOS'];
  headers1.forEach((label, i) => celdaExcelGastos(sheet, f, i + 1, label, { bold: true, align: 'center', fill: EXCEL_COLOR_GOLD, wrap: true }));
  f++;
  const filaInicioDatos = f;

  r.operadores.forEach(op => {
    const s = op.resumen;
    const valores = [op.numero, op.nombre, s.buque, s.per, s.feriadoDias || '', s.feriadoSoles || '', s.domLimaDias || '', s.domLimaSoles || '', s.domProvDias || '', s.domProvSoles || '', s.bordoDias || '', s.bordoSoles || '', s.total, r.fechaEmision, CENTRO_COSTO_GASTOS];
    valores.forEach((v, i) => {
      const esMonto = [5, 7, 9, 11, 12].includes(i);
      celdaExcelGastos(sheet, f, i + 1, v, { align: (i === 0 || esMonto) ? 'right' : 'left', formato: esMonto ? '"S/" #,##0.00' : undefined, fill: EXCEL_COLOR_CREAM });
    });
    f++;
  });
  const filaFinDatos = f - 1;

  celdaExcelGastos(sheet, f, 2, 'TOTALES', { bold: true, fill: EXCEL_COLOR_GOLD });
  [5, 7, 9, 11, 13].forEach(col => {
    celdaExcelGastos(sheet, f, col, { formula: `SUM(${sheet.getColumn(col).letter}${filaInicioDatos}:${sheet.getColumn(col).letter}${filaFinDatos})` }, { bold: true, align: 'right', fill: EXCEL_COLOR_GOLD, formato: col === 13 ? '"S/" #,##0.00' : undefined });
  });
  f += 2;

  sheet.mergeCells(f, 2, f, 15);
  celdaExcelGastos(sheet, f, 2, 'FAVOR DEPOSITAR LA CANTIDAD DE SOLES INDICADAS SEGÚN EL ACUERDO POR DÍAS LABORADOS', { bold: true, borde: false, align: 'center' });
  f += 3;

  const firmas = [['Revisado por:', 2], ['Autorizado por:', 6], ['Aprobado por:', 11]];
  firmas.forEach(([label, col]) => celdaExcelGastos(sheet, f, col, label, { bold: true, borde: false, align: 'center' }));
  f += 3;
  const pies = [['Área Solicitante', 2], ['Coordinador de RRHH', 6], ['Gerente General', 11]];
  pies.forEach(([label, col]) => celdaExcelGastos(sheet, f, col, label, { bold: true, borde: false, align: 'center' }));
}

function construirHTMLResumenTotal(r) {
  const filasHTML = r.operadores.map(op => {
    const s = op.resumen;
    return `<tr>
      <td>${op.numero}</td><td>${op.nombre}</td><td>${s.buque}</td><td>${s.per}</td>
      <td>${s.feriadoDias || ''}</td><td style="text-align:right;">${s.feriadoSoles ? 'S/ ' + s.feriadoSoles.toFixed(2) : ''}</td>
      <td>${s.domLimaDias || ''}</td><td style="text-align:right;">${s.domLimaSoles ? 'S/ ' + s.domLimaSoles.toFixed(2) : ''}</td>
      <td>${s.domProvDias || ''}</td><td style="text-align:right;">${s.domProvSoles ? 'S/ ' + s.domProvSoles.toFixed(2) : ''}</td>
      <td>${s.bordoDias || ''}</td><td style="text-align:right;">${s.bordoSoles ? 'S/ ' + s.bordoSoles.toFixed(2) : ''}</td>
      <td style="text-align:right;font-weight:700;">S/ ${s.total.toFixed(2)}</td>
      <td>${r.fechaEmision}</td><td>${CENTRO_COSTO_GASTOS}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Resumen Total de Días a Bordo</title>
    <style>
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 9px; margin: 18px; color: #111; }
      .marca img { width: 170px; height: auto; display: block; margin-bottom: 8px; }
      h1 { font-size: 15px; text-align: center; text-transform: uppercase; margin: 4px 0 12px; }
      .cab-grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 10px; font-size: 10px; }
      .cab-grid div { line-height: 1.6; }
      .montos-tabla { border-collapse: collapse; font-size: 9.5px; }
      .montos-tabla td { padding: 2px 8px; font-weight: 700; }
      table.datos { width: 100%; border-collapse: collapse; margin-top: 8px; }
      table.datos th { background: #FFC000; padding: 4px 3px; font-size: 7px; text-transform: uppercase; border: 1px solid #999; text-align: center; }
      table.datos td { padding: 3px; border: 1px solid #ddd; background: #FFF8DD; font-size: 8px; }
      .fila-total td { font-weight: 700; background: #FFC000; border: 1px solid #999; }
      .leyenda { font-weight: 700; text-align: center; margin: 10px 0; font-size: 9.5px; }
      .firmas { display: flex; justify-content: space-around; margin-top: 50px; text-align: center; font-size: 9px; }
      .firmas div { border-top: 1px solid #111; padding-top: 4px; width: 160px; }
      @media print { @page { margin: 12mm; size: landscape; } }
    </style>
  </head><body>
    <div class="marca"><img src="data:image/png;base64,${LOGO_INTERTEK_BASE64}" alt="Intertek"></div>
    <h1>Resumen Total de Pago</h1>
    <div class="cab-grid">
      <div><strong>PARA:</strong> Operadores con Días a Bordo<br><strong>DE:</strong><br><strong>REF:</strong> Pago por día laborado en buques<br><strong>FECHA:</strong> ${r.tituloPeriodo}</div>
      <table class="montos-tabla">
        <tr><td>Día feriado laborado (US$)</td><td>${r.montoFeriadoUSD.toFixed(2)}</td></tr>
        <tr><td>Día domingo laborado en Lima</td><td>${r.montoDomingo.toFixed(2)}</td></tr>
        <tr><td>Día domingo laborado en provincia</td><td>${r.montoDomingo.toFixed(2)}</td></tr>
        <tr><td>Día a bordo</td><td>${r.montoDiaNormal.toFixed(2)}</td></tr>
      </table>
    </div>
    <table class="datos">
      <thead><tr>
        <th>N°</th><th>Apellido y Nombre</th><th>Buque</th><th>PER</th>
        <th colspan="2">Feriados Lab.</th><th colspan="2">Dom. Lab. Lima</th><th colspan="2">Dom. Lab. Prov.</th><th colspan="2">Días a Bordo</th>
        <th>Total a Cobrar</th><th>Fecha de Facturación</th><th>Centro de Costos</th>
      </tr></thead>
      <tbody>${filasHTML}</tbody>
      <tfoot><tr class="fila-total">
        <td colspan="4">TOTALES</td>
        <td>${r.totales.feriadoDias || ''}</td><td></td>
        <td>${r.totales.domLimaDias || ''}</td><td></td>
        <td>${r.totales.domProvDias || ''}</td><td></td>
        <td>${r.totales.bordoDias || ''}</td><td></td>
        <td>S/ ${r.totales.total.toFixed(2)}</td><td colspan="2"></td>
      </tr></tfoot>
    </table>
    <p class="leyenda">FAVOR DEPOSITAR LA CANTIDAD DE SOLES INDICADAS SEGÚN EL ACUERDO POR DÍAS LABORADOS</p>
    <div class="firmas">
      <div>Revisado por:<br>Área Solicitante</div>
      <div>Autorizado por:<br>Coordinador de RRHH</div>
      <div>Aprobado por:<br>Gerente General</div>
    </div>
  </body></html>`;
}

async function descargarResumenTotalExcel(r) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Resumen Total');
  construirHojaExcelResumenTotal(sheet, r);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Resumen-Total-Dias-A-Bordo-${r.desde}-al-${r.hasta}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function descargarResumenTotalPDF(r) {
  const win = window.open('', '_blank', 'width=1200,height=700');
  win.document.write(construirHTMLResumenTotal(r));
  win.document.close();
  win.focus();
  win.print();
}

async function confirmarDescargarResumenTotal(formato) {
  const desde = resumenTotalDesdeFiltro;
  const hasta = resumenTotalHastaFiltro;
  const r = prepararResumenTotal(desde, hasta);
  if (!r) return;
  if (r.hayPendientes) mostrarToast('Ojo: hay operadores con Feriados especiales sin tipo de cambio registrado — ese monto queda en 0 hasta que se registre.');

  if (formato === 'excel') await descargarResumenTotalExcel(r);
  else descargarResumenTotalPDF(r);

  registrarUltimaDescargaGastos('resumen-total', 'Resumen Total', desde, hasta);
  cerrarModal('modalResumenTotal');
  document.getElementById('downloadDropdownResumenTotal')?.classList.remove('open');
  mostrarToast(`Resumen Total descargado correctamente (${formato === 'excel' ? 'Excel' : 'PDF'}).`);
}

function toggleDescargaResumenTotalDropdown() {
  document.getElementById('downloadDropdownResumenTotal').classList.toggle('open');
}

// Funciones de "Configuración de Límites para Gastos" movidas a
// control-precintos.js (el modal y su botón ahora viven en Control de
// Precintos, junto al nuevo apartado "Configuración de Períodos").


// Cierra el desplegable Excel/PDF del Resumen Total si se hace clic afuera
// (mismo patrón que ya usa Reporte de Precintos para su propio dropdown).
document.addEventListener('click', e => {
  if (!e.target.closest('#modalResumenTotal .btn-download-wrap')) {
    const dd = document.getElementById('downloadDropdownResumenTotal');
    if (dd) dd.classList.remove('open');
  }
});
