// =================================================
// ASIGNACION-PRECINTOS.JS
// Precintos > Asignación de Precintos: interfaz única para crear, editar,
// anular y consultar las entregas de precintos (Supervisor → Operador) —
// con filtros por rango de fechas/estado/entregado/recibido/material/lote,
// agrupación y exportación.
// =================================================

document.addEventListener('DOMContentLoaded', () => {
  establecerFechasPorDefectoAsignacion();
  poblarFiltrosAvanzadosAsignacion();
  renderTablaAsignacionPrecintos();
});

function nombreColaborador(usuario) {
  const u = obtenerUsuarioPorNombre(usuario);
  return u ? `${u.nombre} ${u.apellido}` : usuario;
}

const ESTADO_ASIGNACION_BADGE = {
  'Registrada': 'badge-vigente',
  'Anulada': 'badge-inactivo'
};

// Rango por defecto de la consulta: del primer día del mes en curso a hoy —
// cubre el caso de uso más común (revisar lo asignado en lo que va del mes)
// sin que el usuario tenga que armar el rango a mano cada vez que entra.
function establecerFechasPorDefectoAsignacion() {
  const hoy = new Date();
  const pad = n => String(n).padStart(2, '0');
  const primerDiaMes = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-01`;
  const hoyISO = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  document.getElementById('filterFechaDesdeAsignacion').value = primerDiaMes;
  document.getElementById('filterFechaHastaAsignacion').value = hoyISO;
}

/* =================================================
   FILTROS AVANZADOS (Entregado por / Recibido por / Material / Lote)
================================================= */
const ASIG_IDS_FILTROS_AVANZADOS = ['filterAvzAsigEstado', 'filterAvzAsigEntregadoPor', 'filterAvzAsigRecibidoPor', 'filterAvzAsigMaterial', 'filterAvzAsigLote'];

function poblarFiltrosAvanzadosAsignacion() {
  const selectEntregado = document.getElementById('filterAvzAsigEntregadoPor');
  const rolSupervisor = obtenerRolPorNombre('Supervisor');
  selectEntregado.innerHTML = '<option value="">Todos</option>' + USUARIOS_DEMO
    .filter(u => rolSupervisor && obtenerIdsRolesUsuario(u).includes(rolSupervisor.id))
    .map(u => `<option value="${u.usuario}">${u.nombre} ${u.apellido}</option>`).join('');

  const selectRecibido = document.getElementById('filterAvzAsigRecibidoPor');
  const rolInspector = obtenerRolPorNombre('Inspector');
  selectRecibido.innerHTML = '<option value="">Todos</option>' + USUARIOS_DEMO
    .filter(u => rolInspector && obtenerIdsRolesUsuario(u).includes(rolInspector.id))
    .map(u => `<option value="${u.usuario}">${u.nombre} ${u.apellido}</option>`).join('');

  const selectMaterial = document.getElementById('filterAvzAsigMaterial');
  selectMaterial.innerHTML = '<option value="">Todos</option>' +
    cargarMaterialesPrecinto().map(m => `<option value="${m.nombre}">${m.nombre}</option>`).join('');

  const selectLote = document.getElementById('filterAvzAsigLote');
  selectLote.innerHTML = '<option value="">Todos</option>' +
    PRECINTOS_REGISTROS_DEMO.map(r => `<option value="${r.codigo}">${r.codigo}</option>`).join('');
}

function asigContarFiltrosAvanzadosActivos() {
  return ASIG_IDS_FILTROS_AVANZADOS.reduce((acc, id) => acc + (document.getElementById(id)?.value ? 1 : 0), 0);
}

function asigActualizarBotonFiltrosAvanzados() {
  const btn = document.getElementById('btnFiltrosAvanzadosAsig');
  const badge = document.getElementById('filtrosAvanzadosAsigBadge');
  const activos = asigContarFiltrosAvanzadosActivos();
  btn.classList.toggle('activo', activos > 0);
  badge.style.display = activos > 0 ? '' : 'none';
  badge.textContent = activos;
}

function abrirModalFiltrosAvanzadosAsig() {
  abrirModal('modalFiltrosAvanzadosAsig');
}

function aplicarFiltrosAvanzadosModalAsig() {
  cerrarModal('modalFiltrosAvanzadosAsig');
  filtrarAsignacionPrecintos();
  asigActualizarBotonFiltrosAvanzados();
}

function limpiarFiltrosAvanzadosModalAsig() {
  ASIG_IDS_FILTROS_AVANZADOS.forEach(id => { document.getElementById(id).value = ''; });
  establecerFechasPorDefectoAsignacion();
  cerrarModal('modalFiltrosAvanzadosAsig');
  filtrarAsignacionPrecintos();
  asigActualizarBotonFiltrosAvanzados();
}

/* =================================================
   FILTRADO + GRILLA
================================================= */
function filasAsignacionPrecintosFiltradas() {
  const texto = document.getElementById('searchAsignacionPrecintos').value.trim().toLowerCase();
  const desde = document.getElementById('filterFechaDesdeAsignacion').value;
  const hasta = document.getElementById('filterFechaHastaAsignacion').value;
  const estado = document.getElementById('filterAvzAsigEstado').value;
  const entregadoPor = document.getElementById('filterAvzAsigEntregadoPor').value;
  const recibidoPor = document.getElementById('filterAvzAsigRecibidoPor').value;
  const material = document.getElementById('filterAvzAsigMaterial').value;
  const lote = document.getElementById('filterAvzAsigLote').value;

  return ASIGNACIONES_PRECINTOS_DEMO.filter(a => {
    if (texto) {
      const entregadoNombre = nombreColaborador(a.entregadoPor).toLowerCase();
      const recibidoNombre = nombreColaborador(a.recibidoPor).toLowerCase();
      const bolsaTexto = [a.codigo, entregadoNombre, recibidoNombre].join(' ').toLowerCase();
      if (!bolsaTexto.includes(texto)) return false;
    }
    const fechaISO = fechaDDMMYYYYaISO(a.fecha);
    if (desde && fechaISO < desde) return false;
    if (hasta && fechaISO > hasta) return false;
    if (estado && a.estado !== estado) return false;
    if (entregadoPor && a.entregadoPor !== entregadoPor) return false;
    if (recibidoPor && a.recibidoPor !== recibidoPor) return false;
    if (material) {
      const materiales = a.registroCodigos.map(c => obtenerRegistroPrecintoPorCodigo(c)?.material).filter(Boolean);
      if (!materiales.includes(material)) return false;
    }
    if (lote && !a.registroCodigos.includes(lote)) return false;
    return true;
  });
}

// Clave + etiqueta de agrupación de una Asignación, según lo elegido en
// "Agrupar por" — se usa tanto para ordenar las filas por grupo como para
// las cabeceras que se insertan entre ellas.
function claveGrupoAsignacion(a, tipo) {
  if (tipo === 'entregadoPor') {
    return { key: nombreColaborador(a.entregadoPor), label: nombreColaborador(a.entregadoPor) };
  }
  if (tipo === 'recibidoPor') {
    return { key: nombreColaborador(a.recibidoPor), label: nombreColaborador(a.recibidoPor) };
  }
  return null;
}

function filaAsignacionHTML(a) {
  const badgeClase = ESTADO_ASIGNACION_BADGE[a.estado] || 'badge-gris';
  const botonEliminarAnular = asignacionTieneUsoReportado(a.id)
    ? `<button type="button" class="btn-accion btn-inactivar" title="Anular asignación" onclick="anularAsignacion(${a.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/></svg>
      </button>`
    : `<button type="button" class="btn-accion btn-inactivar" title="Eliminar asignación" onclick="eliminarAsignacion(${a.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>`;

  return `<tr>
    <td class="codigo-col">${a.codigo}</td>
    <td>${a.fecha}</td>
    <td>${nombreColaborador(a.entregadoPor)}</td>
    <td>${nombreColaborador(a.recibidoPor)}</td>
    <td>${a.cantidad}</td>
    <td><span class="badge ${badgeClase}"><span class="badge-dot"></span>${a.estado}</span></td>
    <td class="opciones">
      <button class="btn-accion btn-ver" title="Ver detalle" onclick="abrirModalVerDetalleAsignacion(${a.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button class="btn-accion btn-editar" title="Editar" onclick="abrirModalAsignacion(${a.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion btn-descargar-asig" title="Descargar reporte de la asignación" onclick="descargarReporteAsignacion(${a.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      ${botonEliminarAnular}
    </td>
  </tr>`;
}

function renderTablaAsignacionPrecintos() {
  const tbody = document.getElementById('tbodyAsignacionPrecintos');
  const filas = filasAsignacionPrecintosFiltradas();
  const tipoAgrupacion = document.getElementById('agruparAsignacionPrecintos').value;

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="submodulo-tabla-vacio">No se encontraron asignaciones.</td></tr>`;
    return;
  }

  if (!tipoAgrupacion) {
    tbody.innerHTML = filas.map(filaAsignacionHTML).join('');
    return;
  }

  // Orden cronológico/alfabético dentro de cada grupo para que las cabeceras
  // no se repitan salteadas — el array fuente no viene ordenado por grupo
  // (los registros más nuevos se agregan al principio con unshift).
  const filasConGrupo = filas.map(a => ({ a, grupo: claveGrupoAsignacion(a, tipoAgrupacion) }));
  filasConGrupo.sort((x, y) => x.grupo.key < y.grupo.key ? -1 : x.grupo.key > y.grupo.key ? 1 : 0);

  let grupoActual = null;
  const filasHTML = [];
  filasConGrupo.forEach(({ a, grupo }) => {
    if (grupo.key !== grupoActual) {
      grupoActual = grupo.key;
      filasHTML.push(`<tr class="fila-grupo-asignacion"><td colspan="7">${grupo.label}</td></tr>`);
    }
    filasHTML.push(filaAsignacionHTML(a));
  });
  tbody.innerHTML = filasHTML.join('');
}

function filtrarAsignacionPrecintos() {
  renderTablaAsignacionPrecintos();
  asigActualizarBotonFiltrosAvanzados();
}

// "Limpiar filtros" vuelve al rango por defecto (mes en curso hasta hoy),
// no a fechas en blanco — ver establecerFechasPorDefectoAsignacion.
function limpiarFiltrosAsignacionPrecintos() {
  document.getElementById('searchAsignacionPrecintos').value = '';
  establecerFechasPorDefectoAsignacion();
  document.getElementById('agruparAsignacionPrecintos').value = '';
  ASIG_IDS_FILTROS_AVANZADOS.forEach(id => { document.getElementById(id).value = ''; });
  filtrarAsignacionPrecintos();
}

/* =================================================
   MODAL: ASIGNACIÓN DE PRECINTOS (Nueva / Editar)
   La asignación es ante todo un conjunto de precintos (tomados únicamente
   de lo ya registrado y disponible en el lote — aquí no se "agrega" un
   precinto nuevo, se "asigna" uno que ya existe).
================================================= */
let precintosAsignacionTemp = [];   // precintos asignados en el modal (aún sin guardar)
let asignacionEnEdicionId = null;   // id de la asignación que se está editando (null = una nueva)

function poblarSelectEntregadoPorAsignacion() {
  const rolSupervisor = obtenerRolPorNombre('Supervisor');
  const select = document.getElementById('asignacionEntregadoPorInput');
  select.innerHTML = '<option value="">Seleccionar responsable</option>' + USUARIOS_DEMO
    .filter(u => u.estado === 'activo' && rolSupervisor && obtenerIdsRolesUsuario(u).includes(rolSupervisor.id))
    .map(u => `<option value="${u.usuario}">${u.nombre} ${u.apellido}</option>`).join('');
}

function poblarSelectRecibidoPorAsignacion() {
  const rolInspector = obtenerRolPorNombre('Inspector');
  const select = document.getElementById('asignacionRecibidoPorInput');
  select.innerHTML = '<option value="">Seleccionar receptor</option>' + USUARIOS_DEMO
    .filter(u => u.estado === 'activo' && rolInspector && obtenerIdsRolesUsuario(u).includes(rolInspector.id))
    .map(u => `<option value="${u.usuario}">${u.nombre} ${u.apellido}</option>`).join('');
}

// Extrae el prefijo de un código de precinto (ej. "A-10010" → "A-") para
// validar que "Desde" y "Hasta" pertenezcan a la misma serie antes de armar
// el rango (un lote puede tener precintos con series distintas).
function prefijoDePrecinto(codigo) {
  const match = String(codigo).match(/^(.*?)\d+\s*$/);
  return match ? match[1] : '';
}

// Lotes que se pueden elegir para seguir agregando precintos a esta
// Asignación: ni Anulados ni sin nada disponible ya (descontando lo que esta
// misma Asignación, aún sin guardar, ya tomó de cada uno). Es lo que permite
// mezclar precintos de varios lotes: se repite "elegir lote → agregar rango"
// las veces que haga falta, cada vez con un lote distinto.
function obtenerLotesDisponiblesParaAsignar() {
  return PRECINTOS_REGISTROS_DEMO.filter(registro =>
    calcularEstadoLote(registro.codigo) !== 'Anulado' &&
    obtenerPrecintosDisponiblesDeLote(registro.codigo, asignacionEnEdicionId).some(p => !precintosAsignacionTemp.includes(p))
  );
}

function poblarSelectLoteAsignacion(loteAConservar = null) {
  const select = document.getElementById('asignacionLoteInput');
  const anterior = loteAConservar || select.value;
  const lotes = obtenerLotesDisponiblesParaAsignar();
  select.innerHTML = '<option value="">Seleccionar lote</option>' +
    lotes.map(r => {
      const disponibles = obtenerPrecintosDisponiblesDeLote(r.codigo, asignacionEnEdicionId).filter(p => !precintosAsignacionTemp.includes(p)).length;
      return `<option value="${r.codigo}">${r.codigo} — ${r.material} (${disponibles} disponible${disponibles === 1 ? '' : 's'})</option>`;
    }).join('');
  select.value = lotes.some(r => r.codigo === anterior) ? anterior : '';
}

// Repuebla el combo "① Desde" con lo que sigue disponible del lote elegido
// en el selector "Lote", descontando tanto lo ya asignado en otros
// registros como lo que ya se asignó en esta misma Asignación (aún sin
// guardar, sea del mismo lote o de otro). "② Hasta" depende de lo que se
// elija acá (ver poblarSelectHastaAsignacion), así que se limpia primero.
function poblarSelectsRangoAsignacion() {
  const loteElegido = document.getElementById('asignacionLoteInput').value;
  const disponibles = loteElegido
    ? obtenerPrecintosDisponiblesDeLote(loteElegido, asignacionEnEdicionId).filter(p => !precintosAsignacionTemp.includes(p))
    : [];
  const desdeSelect = document.getElementById('asignacionPrecintoDesdeInput');
  desdeSelect.innerHTML = '<option value="">Seleccionar precinto inicial</option>' +
    disponibles.map(p => `<option value="${p}">${p}</option>`).join('');
  desdeSelect.disabled = !disponibles.length;
  poblarSelectHastaAsignacion();
}

// "② Hasta" solo se habilita después de elegir "① Desde", y solo ofrece
// precintos de la misma serie con numeración mayor o igual — así no hace
// falta explicarle al usuario por qué un valor "Hasta" no es válido, porque
// directamente no aparece en la lista.
function poblarSelectHastaAsignacion() {
  const loteElegido = document.getElementById('asignacionLoteInput').value;
  const desde = document.getElementById('asignacionPrecintoDesdeInput').value;
  const hastaSelect = document.getElementById('asignacionPrecintoHastaInput');
  const flecha = document.getElementById('rangoFlechaAsignacion');

  if (!loteElegido || !desde) {
    hastaSelect.innerHTML = '<option value="">Primero selecciona el precinto inicial</option>';
    hastaSelect.disabled = true;
    if (flecha) flecha.classList.remove('activa');
    return;
  }

  const disponibles = obtenerPrecintosDisponiblesDeLote(loteElegido, asignacionEnEdicionId).filter(p => !precintosAsignacionTemp.includes(p));
  const prefijoDesde = prefijoDePrecinto(desde);
  const numeroDesde = numeroDePrecinto(desde);
  const opciones = disponibles
    .filter(p => p !== desde && prefijoDePrecinto(p) === prefijoDesde && numeroDePrecinto(p) > numeroDesde)
    .sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));

  hastaSelect.innerHTML = '<option value="">Sin rango (solo el precinto inicial)</option>' +
    opciones.map(p => `<option value="${p}">${p}</option>`).join('');
  hastaSelect.disabled = false;
  if (flecha) flecha.classList.add('activa');
}

// Asigna un precinto individual (solo "Desde") o un rango completo (si se
// completa "Hasta") — siempre tomando los códigos únicamente de los
// precintos ya registrados y disponibles del lote elegido en "Lote".
function asignarPrecintos() {
  const loteElegido = document.getElementById('asignacionLoteInput').value;
  const desdeSelect = document.getElementById('asignacionPrecintoDesdeInput');
  const hastaSelect = document.getElementById('asignacionPrecintoHastaInput');
  const desde = desdeSelect.value;
  const hasta = hastaSelect.value;

  if (!loteElegido) { mostrarToast('Selecciona un lote.'); return; }
  if (!desde) { mostrarToast('Selecciona un precinto en "Desde".'); return; }

  let candidatos;
  if (hasta) {
    if (prefijoDePrecinto(desde) !== prefijoDePrecinto(hasta)) {
      mostrarToast('"Desde" y "Hasta" deben pertenecer a la misma serie de precintos.');
      return;
    }
    candidatos = generarRangoPrecintos(desde, hasta);
    if (!candidatos || !candidatos.length) {
      mostrarToast('"Hasta" debe ser mayor o igual que "Desde".');
      return;
    }
    const disponibles = new Set(obtenerPrecintosDisponiblesDeLote(loteElegido, asignacionEnEdicionId).filter(p => !precintosAsignacionTemp.includes(p)));
    if (!candidatos.every(p => disponibles.has(p))) {
      mostrarToast('El rango incluye precintos no disponibles en este lote.');
      return;
    }
  } else {
    candidatos = [desde];
  }

  precintosAsignacionTemp.push(...candidatos);
  poblarSelectLoteAsignacion(loteElegido);
  poblarSelectsRangoAsignacion();
  renderTablaPrecintosAsignacion();
}

function quitarPrecintoDeAsignacion(indice) {
  precintosAsignacionTemp.splice(indice, 1);
  poblarSelectLoteAsignacion();
  poblarSelectsRangoAsignacion();
  renderTablaPrecintosAsignacion();
}

function renderTablaPrecintosAsignacion() {
  const tbody = document.getElementById('tbodyPrecintosAsignacion');
  document.getElementById('asignacionCantidadInput').value = precintosAsignacionTemp.length;

  if (!precintosAsignacionTemp.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="submodulo-tabla-vacio">Aún no se asignaron precintos.</td></tr>`;
    return;
  }
  tbody.innerHTML = precintosAsignacionTemp.map((p, i) => {
    const lote = obtenerLoteDePrecinto(p);
    return `
    <tr>
      <td>${i + 1}</td>
      <td>${lote ? lote.codigo : '—'}</td>
      <td>${p}</td>
      <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintoDeAsignacion(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button></td>
    </tr>`;
  }).join('');
}

function abrirModalAsignacion(idAsignacion = null) {
  asignacionEnEdicionId = idAsignacion;
  const existente = idAsignacion ? obtenerAsignacionPorId(idAsignacion) : null;

  precintosAsignacionTemp = existente ? [...existente.precintos] : [];

  document.getElementById('modalAsignacionPrecintosTitulo').textContent =
    existente ? 'Editar Asignación de Precintos' : 'Asignación de Precintos';

  poblarSelectEntregadoPorAsignacion();
  poblarSelectRecibidoPorAsignacion();
  poblarSelectLoteAsignacion();
  poblarSelectsRangoAsignacion();
  renderTablaPrecintosAsignacion();
  limpiarErroresModal('modalAsignacionPrecintos');

  document.getElementById('asignacionCodigoInput').value = existente ? existente.codigo : generarCodigoAsignacion();
  document.getElementById('asignacionEntregadoPorInput').value = existente ? existente.entregadoPor : '';
  document.getElementById('asignacionRecibidoPorInput').value = existente ? existente.recibidoPor : '';
  document.getElementById('asignacionMotivoInput').value = existente ? existente.motivo : '';
  document.getElementById('asignacionObservacionesInput').value = existente ? existente.observaciones : '';

  abrirModal('modalAsignacionPrecintos');
}

// Una asignación con uso ya reportado en su Detalle/GRP (o ya Finalizada) no
// se puede eliminar sin perder ese historial — para esos casos solo se
// ofrece Anular (igual patrón que anularRegistroPrecinto/eliminarRegistroPrecinto
// en Registro de Precintos).
function asignacionTieneUsoReportado(idAsignacion) {
  const detalleGrp = GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.asignacionId === idAsignacion);
  return !!detalleGrp && (detalleGrp.detalle.length > 0 || detalleGrp.estado === 'Finalizado');
}

// Elimina por completo una asignación ya guardada (no solo precintos sueltos
// dentro de ella): sus precintos vuelven al pool de disponibles del lote.
// Solo se ofrece cuando todavía no tiene uso reportado (ver
// asignacionTieneUsoReportado) — si ya lo tiene, corresponde Anular en vez de
// borrar el historial.
function eliminarAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  if (!asignacion) return;

  confirmarAccion(`¿Está seguro de eliminar esta asignación de ${asignacion.cantidad} precinto(s)? Los precintos volverán a quedar disponibles para asignar. Esta acción no se puede deshacer.`, () => {
    const indice = ASIGNACIONES_PRECINTOS_DEMO.findIndex(a => a.id === idAsignacion);
    if (indice !== -1) ASIGNACIONES_PRECINTOS_DEMO.splice(indice, 1);
    mostrarToast('La asignación fue eliminada; sus precintos vuelven a estar disponibles.');
    renderTablaAsignacionPrecintos();
  });
}

// Alternativa a eliminar cuando la asignación ya tiene uso reportado: en vez
// de borrar el historial de quién recibió y usó qué precintos, la cierra
// para que no se le puedan agregar más cambios (mismo patrón que
// anularRegistroPrecinto en Registro de Precintos).
function anularAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  if (!asignacion) return;

  confirmarAccion(`¿Está seguro de anular esta asignación (${asignacion.codigo})? El historial de precintos y su uso reportado se conserva, pero no se podrán agregar más cambios. Esta acción no se puede deshacer.`, () => {
    asignacion.estado = 'Anulada';
    mostrarToast('La asignación fue anulada.');
    renderTablaAsignacionPrecintos();
  });
}

// Detalle de solo lectura de una asignación puntual: incluye lo que la fila
// de la grilla no alcanza a mostrar sin recortarse y lo que hoy no se ve en
// ningún lado fuera del formulario de edición (Motivo/Servicio, Observaciones).
let asignacionDetalleActiva = null; // asignación mostrada en "Ver detalle" (para poder recalcular al cambiar de vista)
let vistaDetalleAsignacion = 'lote'; // 'lote' (agrupado, por defecto) o 'precinto' (uno por uno)

function abrirModalVerDetalleAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  if (!asignacion) return;
  // Puede haber más de un lote de origen (ver registroCodigos), y si comparten
  // el mismo material se muestra uno solo; si no, se listan todos. El campo
  // resumen de acá arriba no lista los códigos uno por uno (con varios lotes
  // se vuelve una sola línea larga y apretada) — el desglose completo, lote
  // por lote, ya está en la tabla "Por lote" de más abajo.
  const lotes = asignacion.registroCodigos.map(c => obtenerRegistroPrecintoPorCodigo(c)).filter(Boolean);
  const materiales = [...new Set(lotes.map(r => r.material))];
  const badgeClase = ESTADO_ASIGNACION_BADGE[asignacion.estado] || 'badge-gris';

  document.getElementById('detalleAsigCodigoAsignacion').textContent = asignacion.codigo;
  document.getElementById('detalleAsigCodigo').textContent = asignacion.registroCodigos.length > 1
    ? `${asignacion.registroCodigos.length} lotes (ver detalle abajo)`
    : (asignacion.registroCodigos[0] || '—');
  document.getElementById('detalleAsigMaterial').textContent = materiales.length ? materiales.join(' / ') : '—';
  document.getElementById('detalleAsigFecha').textContent = asignacion.fecha;
  document.getElementById('detalleAsigEstado').innerHTML = `<span class="badge ${badgeClase}"><span class="badge-dot"></span>${asignacion.estado}</span>`;
  document.getElementById('detalleAsigEntregado').textContent = nombreColaborador(asignacion.entregadoPor);
  document.getElementById('detalleAsigRecibido').textContent = nombreColaborador(asignacion.recibidoPor);
  document.getElementById('detalleAsigCantidad').textContent = asignacion.cantidad;
  document.getElementById('detalleAsigMotivo').textContent = asignacion.motivo || '—';
  document.getElementById('detalleAsigObservaciones').textContent = asignacion.observaciones || 'Sin observaciones.';

  asignacionDetalleActiva = asignacion;
  // "Por lote" es la vista con la que siempre se abre el modal: una
  // Asignación puede tener más de 50 precintos, y listarlos todos de
  // entrada haría scroll interminable — el resumen agrupado por lote
  // alcanza para la mayoría de las consultas, y "Por precinto" queda a un
  // clic para cuando de verdad hace falta el detalle uno por uno.
  vistaDetalleAsignacion = 'lote';
  document.getElementById('btnVistaAsigPorLote').classList.add('activo');
  document.getElementById('btnVistaAsigPorPrecinto').classList.remove('activo');
  renderDetallePrecintosAsignacion();

  abrirModal('modalVerDetalleAsignacion');
}

function cambiarVistaDetalleAsignacion(vista) {
  vistaDetalleAsignacion = vista;
  document.getElementById('btnVistaAsigPorLote').classList.toggle('activo', vista === 'lote');
  document.getElementById('btnVistaAsigPorPrecinto').classList.toggle('activo', vista === 'precinto');
  renderDetallePrecintosAsignacion();
}

function renderDetallePrecintosAsignacion() {
  const asignacion = asignacionDetalleActiva;
  const thead = document.getElementById('theadDetalleAsigPrecintos');
  const tbody = document.getElementById('tbodyDetalleAsigPrecintos');
  if (!asignacion) return;

  if (!asignacion.precintos.length) {
    thead.innerHTML = '';
    tbody.innerHTML = `<tr><td class="submodulo-tabla-vacio">Esta asignación no tiene precintos.</td></tr>`;
    return;
  }

  if (vistaDetalleAsignacion === 'lote') {
    // Resumen compacto: un renglón por lote de origen, con su material,
    // cuántos precintos de ese lote entraron en esta Asignación y el rango
    // ya agrupado (ver formatearRangosPrecintos) en vez de listarlos todos.
    thead.innerHTML = `<tr><th>Lote</th><th>Material</th><th style="width:100px;">Cantidad</th><th>Precintos</th></tr>`;
    tbody.innerHTML = asignacion.registroCodigos.map(codigoLote => {
      const lote = obtenerRegistroPrecintoPorCodigo(codigoLote);
      const precintosDeLote = asignacion.precintos.filter(p => obtenerLoteDePrecinto(p)?.codigo === codigoLote);
      return `<tr>
        <td>${codigoLote}</td>
        <td>${lote ? lote.material : '—'}</td>
        <td>${precintosDeLote.length}</td>
        <td>${formatearRangosPrecintos(precintosDeLote)}</td>
      </tr>`;
    }).join('');
    return;
  }

  // "Por precinto": detalle uno por uno, de qué lote/material viene cada
  // uno, para cuando hace falta revisar un precinto puntual.
  thead.innerHTML = `<tr><th style="width:60px;">N°</th><th>Precinto</th><th>Material</th><th>Lote</th></tr>`;
  const precintosOrdenados = [...asignacion.precintos].sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
  tbody.innerHTML = precintosOrdenados.map((p, i) => {
    const lote = obtenerLoteDePrecinto(p);
    return `<tr>
      <td>${i + 1}</td>
      <td>${p}</td>
      <td>${lote ? lote.material : '—'}</td>
      <td>${lote ? lote.codigo : '—'}</td>
    </tr>`;
  }).join('');
}

function guardarAsignacionPrecintos() {
  // Lotes de origen de todos los precintos ya agregados a esta Asignación
  // (puede ser más de uno — ver obtenerLoteDePrecinto).
  const registroCodigos = [...new Set(precintosAsignacionTemp.map(p => obtenerLoteDePrecinto(p)?.codigo).filter(Boolean))];

  if (registroCodigos.some(c => calcularEstadoLote(c) === 'Anulado')) {
    mostrarToast('Uno de los lotes incluidos está anulado: no se pueden crear ni modificar asignaciones sobre él.');
    return;
  }

  const entregadoInput = document.getElementById('asignacionEntregadoPorInput');
  const recibidoInput = document.getElementById('asignacionRecibidoPorInput');
  const motivoInput = document.getElementById('asignacionMotivoInput');

  limpiarErroresModal('modalAsignacionPrecintos');
  let valido = true;
  let primerCampoInvalido = null;

  [entregadoInput, recibidoInput, motivoInput].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  if (valido && entregadoInput.value && recibidoInput.value && entregadoInput.value === recibidoInput.value) {
    mostrarErrorCampo(recibidoInput, 'Recibido por no puede ser la misma persona que Entregado por');
    if (!primerCampoInvalido) primerCampoInvalido = recibidoInput;
    valido = false;
  }

  if (valido && !precintosAsignacionTemp.length) {
    mostrarToast('Asigna al menos un precinto antes de guardar.');
    valido = false;
  }

  if (!valido) {
    if (primerCampoInvalido) primerCampoInvalido.focus();
    return;
  }

  let idAsignacion = asignacionEnEdicionId;

  if (asignacionEnEdicionId) {
    const asignacion = obtenerAsignacionPorId(asignacionEnEdicionId);
    asignacion.entregadoPor = entregadoInput.value;
    asignacion.recibidoPor = recibidoInput.value;
    asignacion.precintos = [...precintosAsignacionTemp];
    asignacion.cantidad = precintosAsignacionTemp.length;
    asignacion.registroCodigos = registroCodigos;
    asignacion.motivo = motivoInput.value.trim();
    asignacion.observaciones = document.getElementById('asignacionObservacionesInput').value.trim();
  } else {
    idAsignacion = Date.now();
    ASIGNACIONES_PRECINTOS_DEMO.unshift({
      id: idAsignacion,
      codigo: document.getElementById('asignacionCodigoInput').value,
      registroCodigos,
      fecha: fechaISOaDDMMYYYY(new Date().toISOString().slice(0, 10)),
      entregadoPor: entregadoInput.value,
      recibidoPor: recibidoInput.value,
      precintos: [...precintosAsignacionTemp],
      cantidad: precintosAsignacionTemp.length,
      estado: 'Registrada',
      motivo: motivoInput.value.trim(),
      observaciones: document.getElementById('asignacionObservacionesInput').value.trim()
    });
  }

  // Primera vez que se guarda esta Asignación: se crea su Reporte de
  // Precintos (y Detalle/GRP vacío) si todavía no existía — ver
  // asegurarReportePrecinto en data-precintos.js. Si ya existía (se está
  // editando la misma Asignación), no hace nada.
  asegurarReportePrecinto(idAsignacion, registroCodigos);

  // Mismo momento en que el operador ("recibido por") queda asignado a la
  // operación: empieza a poder registrar desde el app tanto sus precintos
  // (arriba) como sus gastos — se le crean los 3 reportes vacíos (Alimentos/
  // Movilidad/Días a Bordo) del mes calendario en curso, si todavía no los
  // tenía (ver asegurarReporteGasto en data-gastos.js: el período de un
  // reporte de gastos siempre es un mes completo, no un rango libre).
  if (typeof asegurarReporteGasto === 'function') {
    asegurarReporteGasto(recibidoInput.value, new Date().toISOString().slice(0, 10));
  }

  const modo = asignacionEnEdicionId ? 'editar' : 'crear';
  const mensaje = asignacionEnEdicionId ? 'Se actualizó la asignación de precintos.' : 'Se registró la asignación de precintos.';

  cerrarModal('modalAsignacionPrecintos');
  mostrarModalGuardado(modo, mensaje, () => renderTablaAsignacionPrecintos());
}

/* =================================================
   DESCARGA: Excel (CSV) y PDF — mismo patrón que Control de Precintos /
   Reporte de Precintos.
================================================= */
function toggleDownloadDropdownAsignacionPrecintos() {
  document.getElementById('downloadDropdownAsignacionPrecintos').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.btn-download-wrap')) {
    const dd = document.getElementById('downloadDropdownAsignacionPrecintos');
    if (dd) dd.classList.remove('open');
  }
});

// Una fila por cada lote de origen dentro de cada Asignación (no una fila
// por Asignación): si una Asignación mezcla materiales o lotes distintos,
// separarlo así es lo que permite ver de un vistazo cuánto y qué precintos
// exactos salieron de cada lote, en vez de mezclarlo todo en una sola celda.
function obtenerFilasExportAsignacionPrecintos() {
  return filasAsignacionPrecintosFiltradas().flatMap(a =>
    a.registroCodigos.map(codigoLote => {
      const lote = obtenerRegistroPrecintoPorCodigo(codigoLote);
      const precintosDeLote = a.precintos.filter(p => obtenerLoteDePrecinto(p)?.codigo === codigoLote);
      return {
        codigo: a.codigo,
        fecha: a.fecha,
        entregadoPor: nombreColaborador(a.entregadoPor),
        recibidoPor: nombreColaborador(a.recibidoPor),
        material: lote ? lote.material : '—',
        lote: codigoLote,
        cantidad: precintosDeLote.length,
        estado: a.estado,
        numeracion: formatearRangosPrecintos(precintosDeLote)
      };
    })
  );
}

function exportarAsignacionPrecintosExcel() {
  const filas = obtenerFilasExportAsignacionPrecintos();
  const headers = ['Código', 'Fecha', 'Entregado por', 'Recibido por', 'Material', 'Lote', 'Cantidad', 'Estado', 'Numeración'];

  const csv = [headers, ...filas.map(f => [f.codigo, f.fecha, f.entregadoPor, f.recibidoPor, f.material, f.lote, f.cantidad, f.estado, f.numeracion])]
    .map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom  = '﻿'; // BOM para que Excel abra UTF-8 correctamente
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'asignacion-precintos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  document.getElementById('downloadDropdownAsignacionPrecintos').classList.remove('open');
  mostrarToast('Exportación Excel descargada correctamente.');
}

function exportarAsignacionPrecintosPDF() {
  const filas = obtenerFilasExportAsignacionPrecintos();
  const filasHTML = filas.map(f => `
    <tr>
      <td>${f.codigo}</td>
      <td>${f.fecha}</td>
      <td>${f.entregadoPor}</td>
      <td>${f.recibidoPor}</td>
      <td>${f.material}</td>
      <td>${f.lote}</td>
      <td>${f.cantidad}</td>
      <td>${f.estado}</td>
      <td>${f.numeracion}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Asignación de Precintos</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 12px; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 7px 10px; text-align: left;
             font-size: 9px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 7px 10px; border-bottom: 1px solid #eee; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <h2>Asignación de Precintos</h2>
    <table>
      <thead>
        <tr><th>Código</th><th>Fecha</th><th>Entregado por</th><th>Recibido por</th><th>Material</th><th>Lote</th><th>Cantidad</th><th>Estado</th><th>Numeración</th></tr>
      </thead>
      <tbody>${filasHTML}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();

  document.getElementById('downloadDropdownAsignacionPrecintos').classList.remove('open');
}

// descargarReporteAsignacion (constancia de UNA Asignación puntual) vive en
// data-precintos.js — la usan tanto esta página (grilla y "Ver detalle")
// como el modal de movimientos de Reporte de Precintos.
