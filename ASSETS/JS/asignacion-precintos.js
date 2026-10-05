// =================================================
// ASIGNACION-PRECINTOS.JS
// Precintos > Asignación de Precintos: interfaz única para crear, editar,
// eliminar y consultar las entregas de precintos (Supervisor → Operador) —
// con filtros por rango de fechas/estado/entregado/recibido/material,
// agrupación y exportación.
// =================================================

let paginaAsignacionPrecintos = 1; // página actual de la grilla principal

// Agrupa "codigos" en líneas para mostrar: por defecto una línea por
// precinto (aunque dos sean numéricamente consecutivos, si se agregaron
// de uno en uno quedan separados); solo se agrupan en una sola línea los
// que pertenecen a un mismo rango agregado explícitamente con "Desde"+
// "Hasta" ("rangos", ver rangosAsignacionTemp/asignacion.rangos) — ahí sí
// se usa dividirPorMaterialYCorrelatividad para armar el texto del rango.
function agruparPrecintosPorOrigen(codigos, rangos) {
  const enRango = new Set();
  (rangos || []).forEach(r => r.forEach(c => { if (codigos.includes(c)) enRango.add(c); }));

  const deRango = codigos.filter(c => enRango.has(c));
  const individuales = codigos.filter(c => !enRango.has(c));

  const filas = dividirPorMaterialYCorrelatividad(deRango);
  individuales.forEach(c => {
    const lote = obtenerLoteDePrecinto(c);
    filas.push({ material: lote ? lote.material : '—', precintos: [c], texto: c, cantidad: 1 });
  });
  return filas;
}

// A partir de cuántos precintos "sin reportar" se avisa al elegir un
// receptor que ya tiene acumulación (Sprint 4, ajuste §2) — aviso
// informativo, nunca bloquea la asignación.
const UMBRAL_SIN_REPORTAR_ASIGNACION = 100;

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
  'Registrado': 'badge-gris',
  'En proceso': 'badge-por-vencer',
  'Finalizado': 'badge-finalizado'
};

// Rango por defecto de la consulta: últimos 90 días hasta hoy — cubre el
// caso de uso más común (revisar lo asignado recientemente) sin que el
// usuario tenga que armar el rango a mano cada vez que entra. Antes era
// "del primer día del mes en curso a hoy", pero con datos demo de fecha
// fija eso dejaba la grilla vacía apenas cambiaba el mes del sistema; 90
// días da margen real sin perder el espíritu de "no mostrar todo el
// historial sin filtrar".
function establecerFechasPorDefectoAsignacion() {
  const hoy = new Date();
  const hace90Dias = new Date(hoy);
  hace90Dias.setDate(hace90Dias.getDate() - 90);
  const pad = n => String(n).padStart(2, '0');
  const aISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  document.getElementById('filterFechaDesdeAsignacion').value = aISO(hace90Dias);
  document.getElementById('filterFechaHastaAsignacion').value = aISO(hoy);
}

/* =================================================
   FILTROS AVANZADOS (Entregado por / Recibido por / Material)
================================================= */
const ASIG_IDS_FILTROS_AVANZADOS = ['filterAvzAsigEstado', 'filterAvzAsigEntregadoPor', 'filterAvzAsigRecibidoPor', 'filterAvzAsigMaterial'];

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

  return ASIGNACIONES_PRECINTOS_DEMO.filter(a => {
    if (texto) {
      const bolsaTexto = `${nombreColaborador(a.entregadoPor)} ${nombreColaborador(a.recibidoPor)}`.toLowerCase();
      if (!bolsaTexto.includes(texto)) return false;
    }
    const fechaISO = fechaDDMMYYYYaISO(a.fecha);
    if (desde && fechaISO < desde) return false;
    if (hasta && fechaISO > hasta) return false;
    if (estado && calcularEstadoAsignacion(a.id) !== estado) return false;
    if (entregadoPor && a.entregadoPor !== entregadoPor) return false;
    if (recibidoPor && a.recibidoPor !== recibidoPor) return false;
    if (material) {
      const materiales = a.registroCodigos.map(c => obtenerRegistroPrecintoPorCodigo(c)?.material).filter(Boolean);
      if (!materiales.includes(material)) return false;
    }
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

function filaAsignacionHTML(a, nro) {
  // Ya no se muestra como columna/badge (ni acá ni en "Ver detalle", para
  // evitar confusión) — "estado" se sigue calculando porque Editar/Eliminar
  // dependen de él para habilitarse o no (ver botonEditar/botonEliminar).
  const estado = calcularEstadoAsignacion(a.id);

  // "Editar" se bloquea solo cuando ya quedó Finalizada (cierre definitivo).
  // Mientras esté "En proceso" sigue permitido: se puede seguir agregando
  // precintos, cambiar entregado/recibido/fecha/motivo, etc. — los
  // precintos puntuales que ya tienen uso reportado o quedaron como scrap
  // se bloquean adentro del modal (ver renderTablaPrecintosAsignacion), no
  // deshabilitando todo el botón.
  const botonEditar = estado === 'Finalizado'
    ? `<button type="button" class="btn-accion btn-editar" title="Ya está finalizada; no se puede editar" disabled>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>`
    : `<button type="button" class="btn-accion btn-editar" title="Editar" onclick="abrirModalAsignacion(${a.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>`;

  // "Eliminar" (la Asignación completa) sigue exigiendo que nada se haya
  // reportado todavía — borrar de golpe una Asignación con historial de uso
  // o scrap perdería ese registro; para esos casos corresponde editar y
  // quitar solo lo que todavía no está bloqueado.
  const botonEliminar = estado !== 'Registrado'
    ? `<button type="button" class="btn-accion btn-inactivar" title="Ya tiene uso reportado; no se puede eliminar" disabled>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>`
    : `<button type="button" class="btn-accion btn-inactivar" title="Eliminar asignación" onclick="eliminarAsignacion(${a.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>`;

  return `<tr>
    <td>${nro}</td>
    <td>${a.fecha}</td>
    <td>${nombreColaborador(a.entregadoPor)}</td>
    <td>${nombreColaborador(a.recibidoPor)}</td>
    <td>${a.cantidad}</td>
    <td>${obtenerScrapDeAsignacion(a.id)}</td>
    <td class="opciones">
      <button class="btn-accion btn-ver" title="Ver detalle" onclick="abrirModalVerDetalleAsignacion(${a.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      ${botonEditar}
      ${botonEliminar}
    </td>
  </tr>`;
}

function asignacionPrecintosTamanoPagina() {
  const select = document.getElementById('asignacionPrecintosPagSelect');
  return select ? Number(select.value) : 5;
}

function asignacionPrecintosCambiarTamanoPagina() {
  paginaAsignacionPrecintos = 1;
  renderTablaAsignacionPrecintos();
}

function asignacionPrecintosIrAPagina(numero) {
  paginaAsignacionPrecintos = numero;
  renderTablaAsignacionPrecintos();
}

function renderPaginacionAsignacionPrecintos(totalPaginas) {
  const prev = document.getElementById('asignacionPrecintosPagPrev');
  const next = document.getElementById('asignacionPrecintosPagNext');
  const numeros = document.getElementById('asignacionPrecintosPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaAsignacionPrecintos <= 1;
  next.disabled = paginaAsignacionPrecintos >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaAsignacionPrecintos ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => asignacionPrecintosIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function renderTablaAsignacionPrecintos() {
  const tbody = document.getElementById('tbodyAsignacionPrecintos');
  const paginacion = document.getElementById('paginacionAsignacionPrecintos');
  const filas = filasAsignacionPrecintosFiltradas();
  const tipoAgrupacion = document.getElementById('agruparAsignacionPrecintos').value;

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="submodulo-tabla-vacio">No se encontraron asignaciones.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  // La paginación se aplica sobre la lista filtrada ANTES de agrupar, para
  // que el tamaño de página sea siempre el mismo sin importar "Agrupar
  // por" — cada página puede repetir la cabecera de un grupo si este
  // continúa en la página siguiente.
  const tamano = asignacionPrecintosTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(filas.length / tamano));
  if (paginaAsignacionPrecintos > totalPaginas) paginaAsignacionPrecintos = totalPaginas;
  if (paginaAsignacionPrecintos < 1) paginaAsignacionPrecintos = 1;
  const inicio = (paginaAsignacionPrecintos - 1) * tamano;
  const visibles = filas.slice(inicio, inicio + tamano);

  if (!tipoAgrupacion) {
    tbody.innerHTML = visibles.map((a, i) => filaAsignacionHTML(a, inicio + i + 1)).join('');
  } else {
    // Orden cronológico/alfabético dentro de cada grupo para que las
    // cabeceras no se repitan salteadas — el array fuente no viene
    // ordenado por grupo (los registros más nuevos se agregan al
    // principio con unshift).
    const filasConGrupo = visibles.map(a => ({ a, grupo: claveGrupoAsignacion(a, tipoAgrupacion) }));
    filasConGrupo.sort((x, y) => x.grupo.key < y.grupo.key ? -1 : x.grupo.key > y.grupo.key ? 1 : 0);

    let grupoActual = null;
    let nro = inicio;
    const filasHTML = [];
    filasConGrupo.forEach(({ a, grupo }) => {
      if (grupo.key !== grupoActual) {
        grupoActual = grupo.key;
        filasHTML.push(`<tr class="fila-grupo-asignacion"><td colspan="7">${grupo.label}</td></tr>`);
      }
      filasHTML.push(filaAsignacionHTML(a, ++nro));
    });
    tbody.innerHTML = filasHTML.join('');
  }

  if (paginacion) paginacion.style.display = '';
  renderPaginacionAsignacionPrecintos(totalPaginas);
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
// Cada entrada es la lista de códigos que se agregaron JUNTOS usando
// "Desde"+"Hasta" (un rango real) — permite distinguirlos de precintos que
// resultan numéricamente consecutivos solo porque se agregaron uno por uno
// (ver agruparPrecintosPorOrigen): por defecto cada precinto va en su
// propia línea, y solo se junta en una línea si así se agregó.
let rangosAsignacionTemp = [];
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

// Muestra bajo "Recibido por" cuántos precintos sin reportar ya tiene ese
// operador (calcularSaldoOperador, data-precintos.js — misma fuente que la
// grilla/cartola de Reporte de Precintos) y, si supera el umbral, un aviso
// de acumulación informativo (nunca bloquea la asignación).
function actualizarStockReceptorAsignacion() {
  const usuario = document.getElementById('asignacionRecibidoPorInput').value;
  const hint = document.getElementById('asignacionRecibidoStockHint');
  if (!usuario) { hint.style.display = 'none'; return; }

  const { queda } = calcularSaldoOperador(usuario);
  const sobreUmbral = queda > UMBRAL_SIN_REPORTAR_ASIGNACION;
  hint.className = sobreUmbral ? 'modal-hint-advertencia' : 'modal-hint';
  hint.textContent = sobreUmbral
    ? `Tiene ${queda} precintos sin reportar — supera el umbral de ${UMBRAL_SIN_REPORTAR_ASIGNACION}, revisa antes de asignar más.`
    : `Tiene ${queda} precinto${queda === 1 ? '' : 's'} sin reportar.`;
  hint.style.display = '';
}

// Extrae el prefijo de un código de precinto (ej. "A-10010" → "A-") para
// validar que "Desde" y "Hasta" pertenezcan a la misma serie antes de armar
// el rango (un lote puede tener precintos con series distintas).
function prefijoDePrecinto(codigo) {
  const match = String(codigo).match(/^(.*?)\d+\s*$/);
  return match ? match[1] : '';
}

// Detecta y muestra el material del precinto tecleado en "Desde", buscando
// en qué lote de Control de Precintos aparece (ver obtenerLoteDePrecinto en
// data-precintos.js) — el supervisor ya no elige el material a mano, se
// completa solo con lo que ya está registrado. Si el código no existe en
// ningún registro, el campo queda vacío (el aviso de "no existe" se muestra
// recién al presionar "Asignar", en asignarPrecintos).
function detectarMaterialAsignacion() {
  const desde = document.getElementById('asignacionPrecintoDesdeInput').value.trim();
  const campo = document.getElementById('asignacionMaterialDetectado');
  const lote = desde ? obtenerLoteDePrecinto(desde) : null;
  campo.value = lote ? lote.material : '';
}

// Asigna un precinto individual (solo "Desde") o un rango completo (si se
// completa "Hasta") — el supervisor teclea el código directamente (igual
// que en Control de Precintos), y acá se valida contra lo que ya existe:
// que cada precinto del rango esté registrado en algún lote, que todos sean
// del mismo material y que ninguno esté ya asignado a alguien ni repetido
// en esta misma Asignación (aún sin guardar). Cualquier problema se avisa
// con un toast en vez de dejar avanzar la asignación a medias.
function asignarPrecintos() {
  const desdeInput = document.getElementById('asignacionPrecintoDesdeInput');
  const hastaInput = document.getElementById('asignacionPrecintoHastaInput');
  const desde = desdeInput.value.trim();
  const hasta = hastaInput.value.trim();

  if (!desde) { mostrarToast('Ingresa un número de precinto en "Desde".'); return; }

  const loteDesde = obtenerLoteDePrecinto(desde);
  if (!loteDesde) { mostrarToast(`El precinto ${desde} no existe en ningún registro de Control de Precintos.`); return; }

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
  } else {
    candidatos = [desde];
  }

  const inexistentes = candidatos.filter(p => !obtenerLoteDePrecinto(p));
  if (inexistentes.length) {
    mostrarToast(`El rango incluye precintos que no existen en ningún registro de Control de Precintos: ${inexistentes.slice(0, 5).join(', ')}${inexistentes.length > 5 ? '…' : ''}`);
    return;
  }

  const otroMaterial = candidatos.some(p => obtenerLoteDePrecinto(p).material !== loteDesde.material);
  if (otroMaterial) {
    mostrarToast('El rango incluye precintos de otro material: deben pertenecer todos al mismo material.');
    return;
  }

  const deLoteAnulado = candidatos.filter(p => calcularEstadoLote(obtenerLoteDePrecinto(p).codigo) === 'Anulado');
  if (deLoteAnulado.length) {
    mostrarToast(`El rango incluye precintos de un registro anulado, ya no disponibles: ${deLoteAnulado.slice(0, 5).join(', ')}${deLoteAnulado.length > 5 ? '…' : ''}`);
    return;
  }

  const yaEnEstaAsignacion = candidatos.filter(p => precintosAsignacionTemp.includes(p));
  if (yaEnEstaAsignacion.length) {
    mostrarToast('El rango incluye precintos que ya fueron agregados en esta misma asignación.');
    return;
  }

  const yaAsignados = candidatos.filter(p => obtenerPrecintosAsignadosDeLote(obtenerLoteDePrecinto(p).codigo, asignacionEnEdicionId).has(p));
  if (yaAsignados.length) {
    mostrarToast(`El rango incluye precintos que ya están asignados: ${yaAsignados.slice(0, 5).join(', ')}${yaAsignados.length > 5 ? '…' : ''}`);
    return;
  }

  precintosAsignacionTemp.push(...candidatos);
  // Si se completó "Hasta" quedó registrado como un rango real (aunque
  // termine siendo de 1 solo código) — ver agruparPrecintosPorOrigen.
  if (hasta) rangosAsignacionTemp.push([...candidatos]);
  desdeInput.value = '';
  hastaInput.value = '';
  desdeInput.focus();
  detectarMaterialAsignacion();
  renderTablaPrecintosAsignacion();
}

// "codigos" es el rango completo de la línea que se está quitando (ver
// renderTablaPrecintosAsignacion) — si CUALQUIERA ya tiene uso o scrap
// reportado, no se quita nada del rango (ambos reportes vienen de la app
// móvil y ya quedaron guardados; sacarlos de "precintos" los dejaría
// apuntando a un precinto que ya no está en la asignación).
function quitarPrecintosDeAsignacion(codigos) {
  if (asignacionEnEdicionId) {
    const scrapCodigos = new Set(obtenerCodigosScrapDeAsignacion(asignacionEnEdicionId));
    const usadosCodigos = new Set(obtenerPrecintosUsadosDeAsignacion(asignacionEnEdicionId));
    const bloqueado = codigos.find(c => scrapCodigos.has(c) || usadosCodigos.has(c));
    if (bloqueado) {
      mostrarToast(`${bloqueado} ya tiene uso o scrap reportado: no se puede quitar, así que no se quitó nada de este rango.`);
      return;
    }
  }
  const aQuitar = new Set(codigos);
  precintosAsignacionTemp = precintosAsignacionTemp.filter(p => !aQuitar.has(p));
  rangosAsignacionTemp = rangosAsignacionTemp
    .map(r => r.filter(c => !aQuitar.has(c)))
    .filter(r => r.length > 1); // si queda 1 solo código ya no es "un rango"
  renderTablaPrecintosAsignacion();
}

// Tabla de precintos ya agregados (aún sin guardar) — una línea por Material
// + corrida consecutiva (dividirPorMaterialYCorrelatividad, data-precintos.js)
// en vez de una fila por precinto: con 50 precintos de un rango, antes eran
// 50 filas, ahora una sola "A-0301 al A-0350 (50)". Debajo, un resumen de
// una línea con el conteo por material (Sprint 4, ajuste §2).
function renderTablaPrecintosAsignacion() {
  const tbody = document.getElementById('tbodyPrecintosAsignacion');
  const resumen = document.getElementById('resumenMaterialesAsignacion');
  document.getElementById('asignacionCantidadInput').value = precintosAsignacionTemp.length;

  if (!precintosAsignacionTemp.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="submodulo-tabla-vacio">Aún no se asignaron precintos.</td></tr>`;
    if (resumen) resumen.textContent = '';
    return;
  }

  const scrapCodigos = new Set(asignacionEnEdicionId ? obtenerCodigosScrapDeAsignacion(asignacionEnEdicionId) : []);
  const usadosCodigos = new Set(asignacionEnEdicionId ? obtenerPrecintosUsadosDeAsignacion(asignacionEnEdicionId) : []);

  // Primero se separan en bloqueados (scrap/usado, nunca se agrupan entre
  // sí con los libres aunque sean correlativos, para no complicar el
  // "quitar" de un rango mixto) y libres; cada bloque se agrupa aparte.
  const libres = precintosAsignacionTemp.filter(p => !scrapCodigos.has(p) && !usadosCodigos.has(p));
  const scrap = precintosAsignacionTemp.filter(p => scrapCodigos.has(p));
  const usados = precintosAsignacionTemp.filter(p => !scrapCodigos.has(p) && usadosCodigos.has(p));

  const filas = [];
  agruparPrecintosPorOrigen(libres, rangosAsignacionTemp).forEach(sub => filas.push({ ...sub, etiqueta: '', bloqueado: false }));
  agruparPrecintosPorOrigen(usados, rangosAsignacionTemp).forEach(sub => filas.push({ ...sub, etiqueta: 'Usado', bloqueado: true }));
  agruparPrecintosPorOrigen(scrap, rangosAsignacionTemp).forEach(sub => filas.push({ ...sub, etiqueta: 'Scrap', bloqueado: true }));

  tbody.innerHTML = filas.map(f => {
    const celdaPrecinto = f.etiqueta ? `${f.texto} <span class="precinto-asignado-tag">${f.etiqueta}</span>` : f.texto;
    const acciones = f.bloqueado
      ? `<span class="precinto-bloqueado-icono" title="Ya ${f.etiqueta === 'Scrap' ? 'fue reportado como scrap' : 'tiene uso reportado'}; no se puede quitar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>`
      : `<button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintosDeAsignacion(${JSON.stringify(f.precintos)})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>`;
    return `
    <tr>
      <td>${f.material}</td>
      <td>${celdaPrecinto}</td>
      <td>${f.cantidad}</td>
      <td>${acciones}</td>
    </tr>`;
  }).join('');

  if (resumen) {
    const porMaterial = new Map();
    precintosAsignacionTemp.forEach(p => {
      const material = obtenerLoteDePrecinto(p)?.material || '—';
      porMaterial.set(material, (porMaterial.get(material) || 0) + 1);
    });
    const partes = [...porMaterial.entries()].map(([material, n]) => `${material} ${n}`);
    partes.push(`Total ${precintosAsignacionTemp.length}`);
    resumen.textContent = partes.join(' · ');
  }
}

function abrirModalAsignacion(idAsignacion = null) {
  asignacionEnEdicionId = idAsignacion;
  const existente = idAsignacion ? obtenerAsignacionPorId(idAsignacion) : null;

  precintosAsignacionTemp = existente ? [...existente.precintos] : [];
  rangosAsignacionTemp = existente ? (existente.rangos || []).map(r => [...r]) : [];

  document.getElementById('modalAsignacionPrecintosTitulo').textContent =
    existente ? 'Editar Asignación de Precintos' : 'Asignación de Precintos';

  poblarSelectEntregadoPorAsignacion();
  poblarSelectRecibidoPorAsignacion();
  document.getElementById('asignacionPrecintoDesdeInput').value = '';
  document.getElementById('asignacionPrecintoHastaInput').value = '';
  detectarMaterialAsignacion();
  renderTablaPrecintosAsignacion();
  limpiarErroresModal('modalAsignacionPrecintos');

  document.getElementById('asignacionFechaInput').value = existente ? fechaDDMMYYYYaISO(existente.fecha) : new Date().toISOString().slice(0, 10);
  document.getElementById('asignacionEntregadoPorInput').value = existente ? existente.entregadoPor : '';
  document.getElementById('asignacionRecibidoPorInput').value = existente ? existente.recibidoPor : '';
  document.getElementById('asignacionMotivoInput').value = existente ? existente.motivo : '';
  document.getElementById('asignacionObservacionesInput').value = existente ? existente.observaciones : '';
  actualizarStockReceptorAsignacion();

  abrirModal('modalAsignacionPrecintos');
}

// Elimina por completo una asignación ya guardada (no solo precintos sueltos
// dentro de ella): sus precintos vuelven al pool de disponibles del lote.
// Solo se ofrece mientras su estado calculado sigue siendo "Registrado" (ver
// calcularEstadoAsignacion en data-precintos.js) — una vez que hay uso
// reportado, ya no se puede eliminar sin perder ese historial (ver
// botonEliminar en filaAsignacionHTML).
function eliminarAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  if (!asignacion) return;

  // El botón ya llega deshabilitado en ese caso (ver botonEliminar en
  // filaAsignacionHTML), pero se repite acá como red de seguridad — nunca
  // se elimina una Asignación con uso o scrap ya reportado, se perdería ese
  // historial (Sprint 4, ajuste de consistencia).
  if (calcularEstadoAsignacion(idAsignacion) !== 'Registrado') {
    mostrarToast('Esta asignación ya tiene uso o scrap reportado: no se puede eliminar.');
    return;
  }

  confirmarAccion(`¿Está seguro de eliminar esta asignación de ${asignacion.cantidad} precinto(s)? Los precintos volverán a quedar disponibles para asignar. Esta acción no se puede deshacer.`, () => {
    const indice = ASIGNACIONES_PRECINTOS_DEMO.findIndex(a => a.id === idAsignacion);
    if (indice !== -1) ASIGNACIONES_PRECINTOS_DEMO.splice(indice, 1);

    // El Detalle/GRP y el Reporte asociados (ver asegurarReportePrecinto en
    // data-precintos.js) quedarían apuntando a una Asignación que ya no
    // existe — se eliminan junto con ella.
    const indiceGrp = GENERAR_REGISTROS_PRECINTOS_DEMO.findIndex(r => r.asignacionId === idAsignacion);
    if (indiceGrp !== -1) GENERAR_REGISTROS_PRECINTOS_DEMO.splice(indiceGrp, 1);
    const indiceReporte = REPORTES_PRECINTOS_DEMO.findIndex(r => r.asignacionId === idAsignacion);
    if (indiceReporte !== -1) REPORTES_PRECINTOS_DEMO.splice(indiceReporte, 1);

    guardarEstadoPrecintos();
    mostrarToast('La asignación fue eliminada; sus precintos vuelven a estar disponibles.');
    renderTablaAsignacionPrecintos();
  });
}

// Detalle de solo lectura de una asignación puntual: incluye lo que la fila
// de la grilla no alcanza a mostrar sin recortarse y lo que hoy no se ve en
// ningún lado fuera del formulario de edición (Motivo/Servicio, Observaciones).
let asignacionDetalleActiva = null;

function abrirModalVerDetalleAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  if (!asignacion) return;
  // Puede haber más de un lote de origen (ver registroCodigos) — la
  // interfaz no lo muestra, solo el material resultante. Si la Asignación
  // mezcla materiales se listan todos; el desglose por material con rango
  // agrupado ya está en la tabla de precintos de más abajo.
  const lotes = asignacion.registroCodigos.map(c => obtenerRegistroPrecintoPorCodigo(c)).filter(Boolean);
  const materiales = [...new Set(lotes.map(r => r.material))];

  document.getElementById('detalleAsigFecha').textContent = asignacion.fecha;
  document.getElementById('detalleAsigMaterial').textContent = materiales.length ? materiales.join(' / ') : '—';
  document.getElementById('detalleAsigEntregado').textContent = nombreColaborador(asignacion.entregadoPor);
  document.getElementById('detalleAsigRecibido').textContent = nombreColaborador(asignacion.recibidoPor);
  document.getElementById('detalleAsigCantidad').textContent = asignacion.cantidad;
  document.getElementById('detalleAsigScrap').textContent = obtenerScrapDeAsignacion(asignacion.id);

  // Motivo / Servicio es opcional (Sprint 4, ajuste §2): la sección entera
  // se oculta si no hay nada que mostrar, en vez de dejar un "—" suelto.
  const bloqueMotivo = document.getElementById('detalleAsigMotivoBloque');
  bloqueMotivo.style.display = asignacion.motivo ? '' : 'none';
  document.getElementById('detalleAsigMotivo').textContent = asignacion.motivo || '';

  document.getElementById('detalleAsigObservaciones').textContent = asignacion.observaciones || 'Sin observaciones.';

  asignacionDetalleActiva = asignacion;
  paginaDetalleAsigPrecintos = 1;
  renderDetallePrecintosAsignacion();

  abrirModal('modalVerDetalleAsignacion');
}

let paginaDetalleAsigPrecintos = 1; // página actual de la tabla de precintos del detalle (modalVerDetalleAsignacion)

function detalleAsigPrecintosTamanoPagina() {
  const select = document.getElementById('detalleAsigPrecintosPagSelect');
  return select ? Number(select.value) : 5;
}

function detalleAsigPrecintosCambiarTamanoPagina() {
  paginaDetalleAsigPrecintos = 1;
  renderDetallePrecintosAsignacion();
}

function detalleAsigPrecintosIrAPagina(numero) {
  paginaDetalleAsigPrecintos = numero;
  renderDetallePrecintosAsignacion();
}

function renderPaginacionDetalleAsigPrecintos(totalPaginas) {
  const prev = document.getElementById('detalleAsigPrecintosPagPrev');
  const next = document.getElementById('detalleAsigPrecintosPagNext');
  const numeros = document.getElementById('detalleAsigPrecintosPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaDetalleAsigPrecintos <= 1;
  next.disabled = paginaDetalleAsigPrecintos >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaDetalleAsigPrecintos ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => detalleAsigPrecintosIrAPagina(i);
    numeros.appendChild(btn);
  }
}

// Una sola tabla, con rangos consecutivos agrupados por Material + Estado
// (dividirPorMaterialYCorrelatividad, data-precintos.js) — reemplaza las
// pestañas "Por material" (resumen) y "Por precinto" (uno por uno) que
// había antes (Sprint 4, ajuste §2). Paginada, por defecto en 5 (mismo
// componente que usa el resto del sistema).
function renderDetallePrecintosAsignacion() {
  const asignacion = asignacionDetalleActiva;
  const tbody = document.getElementById('tbodyDetalleAsigPrecintos');
  const paginacion = document.getElementById('paginacionDetalleAsigPrecintos');
  if (!asignacion) return;

  if (!asignacion.precintos.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Esta asignación no tiene precintos.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const scrapCodigos = new Set(obtenerCodigosScrapDeAsignacion(asignacion.id));
  const usadosCodigos = new Set(obtenerPrecintosUsadosDeAsignacion(asignacion.id));

  const libres = asignacion.precintos.filter(p => !scrapCodigos.has(p) && !usadosCodigos.has(p));
  const usados = asignacion.precintos.filter(p => !scrapCodigos.has(p) && usadosCodigos.has(p));
  const scrap = asignacion.precintos.filter(p => scrapCodigos.has(p));

  // Sin columna Estado: igual que en la tabla de "Agregar Precinto" de este
  // mismo modal (ver renderTablaPrecintosAsignacion), Usado/Scrap quedan
  // como una etiqueta chica junto al texto del rango en vez de una columna
  // aparte — el motivo de scrap, que antes vivía en el tooltip del badge,
  // ahora queda en el tooltip de la fila completa.
  const rangos = asignacion.rangos || [];
  const filas = [];
  agruparPrecintosPorOrigen(libres, rangos).forEach(sub => filas.push({ ...sub, etiqueta: '', titulo: '' }));
  agruparPrecintosPorOrigen(usados, rangos).forEach(sub => filas.push({ ...sub, etiqueta: 'Usado', titulo: '' }));
  agruparPrecintosPorOrigen(scrap, rangos).forEach(sub => {
    const motivo = textoMotivosScrap(sub.precintos) || 'Sin motivo registrado';
    filas.push({ ...sub, etiqueta: 'Scrap', titulo: `Motivo: ${motivo}` });
  });

  const tamano = detalleAsigPrecintosTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(filas.length / tamano));
  if (paginaDetalleAsigPrecintos > totalPaginas) paginaDetalleAsigPrecintos = totalPaginas;
  if (paginaDetalleAsigPrecintos < 1) paginaDetalleAsigPrecintos = 1;
  const inicio = (paginaDetalleAsigPrecintos - 1) * tamano;
  const visibles = filas.slice(inicio, inicio + tamano);

  tbody.innerHTML = visibles.map(f => {
    const celdaPrecinto = f.etiqueta ? `${f.texto} <span class="precinto-asignado-tag">${f.etiqueta}</span>` : f.texto;
    return `<tr${f.titulo ? ` title="${f.titulo}"` : ''}>
        <td>${celdaPrecinto}</td>
        <td>${f.material}</td>
        <td>${f.cantidad}</td>
      </tr>`;
  }).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionDetalleAsigPrecintos(totalPaginas);
}

function guardarAsignacionPrecintos() {
  // Lotes de origen de todos los precintos ya agregados a esta Asignación
  // (puede ser más de uno — ver obtenerLoteDePrecinto).
  const registroCodigos = [...new Set(precintosAsignacionTemp.map(p => obtenerLoteDePrecinto(p)?.codigo).filter(Boolean))];

  if (registroCodigos.some(c => calcularEstadoLote(c) === 'Anulado')) {
    mostrarToast('Uno de los precintos incluidos ya no está disponible (registro anulado): no se pueden crear ni modificar asignaciones sobre él.');
    return;
  }

  const fechaInput = document.getElementById('asignacionFechaInput');
  const entregadoInput = document.getElementById('asignacionEntregadoPorInput');
  const recibidoInput = document.getElementById('asignacionRecibidoPorInput');
  const motivoInput = document.getElementById('asignacionMotivoInput');

  limpiarErroresModal('modalAsignacionPrecintos');
  let valido = true;
  let primerCampoInvalido = null;

  // Motivo / Servicio quedó opcional (Sprint 4, ajuste §2): la entrega es
  // física, no está ligada a un servicio puntual — motivoInput no entra acá.
  [fechaInput, entregadoInput, recibidoInput].forEach(input => {
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

  // Red de seguridad además del bloqueo en la grilla (ver
  // renderTablaPrecintosAsignacion): si por algún motivo falta un precinto
  // ya reportado como scrap o con uso reportado, no se guarda.
  if (valido && asignacionEnEdicionId) {
    const faltantesScrap = obtenerCodigosScrapDeAsignacion(asignacionEnEdicionId).filter(p => !precintosAsignacionTemp.includes(p));
    const faltantesUsados = obtenerPrecintosUsadosDeAsignacion(asignacionEnEdicionId).filter(p => !precintosAsignacionTemp.includes(p));
    if (faltantesScrap.length || faltantesUsados.length) {
      mostrarToast('No se puede guardar: faltan precintos que ya fueron reportados como scrap o con uso reportado.');
      valido = false;
    }
  }

  if (!valido) {
    if (primerCampoInvalido) primerCampoInvalido.focus();
    return;
  }

  let idAsignacion = asignacionEnEdicionId;

  if (asignacionEnEdicionId) {
    const asignacion = obtenerAsignacionPorId(asignacionEnEdicionId);
    asignacion.fecha = fechaISOaDDMMYYYY(fechaInput.value);
    asignacion.entregadoPor = entregadoInput.value;
    asignacion.recibidoPor = recibidoInput.value;
    asignacion.precintos = [...precintosAsignacionTemp];
    asignacion.rangos = rangosAsignacionTemp.map(r => [...r]);
    asignacion.cantidad = precintosAsignacionTemp.length;
    asignacion.registroCodigos = registroCodigos;
    asignacion.motivo = motivoInput.value.trim();
    asignacion.observaciones = document.getElementById('asignacionObservacionesInput').value.trim();
  } else {
    idAsignacion = Date.now();
    ASIGNACIONES_PRECINTOS_DEMO.unshift({
      id: idAsignacion,
      codigo: generarCodigoAsignacion(),
      registroCodigos,
      fecha: fechaISOaDDMMYYYY(fechaInput.value),
      entregadoPor: entregadoInput.value,
      recibidoPor: recibidoInput.value,
      precintos: [...precintosAsignacionTemp],
      rangos: rangosAsignacionTemp.map(r => [...r]),
      cantidad: precintosAsignacionTemp.length,
      scrap: [],
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

  guardarEstadoPrecintos();

  const modo = asignacionEnEdicionId ? 'editar' : 'crear';
  const mensaje = asignacionEnEdicionId ? 'Se actualizó la asignación de precintos.' : 'Se registró la asignación de precintos.';

  cerrarModal('modalAsignacionPrecintos');
  mostrarModalGuardado(modo, mensaje, () => renderTablaAsignacionPrecintos());
}

