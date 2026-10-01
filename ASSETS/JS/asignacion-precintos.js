// =================================================
// ASIGNACION-PRECINTOS.JS
// Precintos > Asignación de Precintos: interfaz única para crear, editar,
// eliminar y consultar las entregas de precintos (Supervisor → Operador) —
// con filtros por rango de fechas/estado/entregado/recibido/material,
// agrupación y exportación.
// =================================================

let paginaAsignacionPrecintos = 1; // página actual de la grilla principal

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
  const estado = calcularEstadoAsignacion(a.id);
  const badgeClase = ESTADO_ASIGNACION_BADGE[estado] || 'badge-gris';

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
    <td><span class="badge ${badgeClase}"><span class="badge-dot"></span>${estado}</span></td>
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
    tbody.innerHTML = `<tr><td colspan="8" class="submodulo-tabla-vacio">No se encontraron asignaciones.</td></tr>`;
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
        filasHTML.push(`<tr class="fila-grupo-asignacion"><td colspan="8">${grupo.label}</td></tr>`);
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
  desdeInput.value = '';
  hastaInput.value = '';
  desdeInput.focus();
  detectarMaterialAsignacion();
  renderTablaPrecintosAsignacion();
}

function quitarPrecintoDeAsignacion(indice) {
  const codigo = precintosAsignacionTemp[indice];
  if (asignacionEnEdicionId) {
    if (obtenerCodigosScrapDeAsignacion(asignacionEnEdicionId).includes(codigo)) {
      mostrarToast('Este precinto ya fue reportado como scrap y no se puede quitar.');
      return;
    }
    if (obtenerPrecintosUsadosDeAsignacion(asignacionEnEdicionId).includes(codigo)) {
      mostrarToast('Este precinto ya tiene uso reportado y no se puede quitar.');
      return;
    }
  }
  precintosAsignacionTemp.splice(indice, 1);
  renderTablaPrecintosAsignacion();
}

function renderTablaPrecintosAsignacion() {
  const tbody = document.getElementById('tbodyPrecintosAsignacion');
  document.getElementById('asignacionCantidadInput').value = precintosAsignacionTemp.length;

  if (!precintosAsignacionTemp.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="submodulo-tabla-vacio">Aún no se asignaron precintos.</td></tr>`;
    return;
  }

  // Precintos que ya tienen uso reportado (Detalle/GRP) o ya quedaron como
  // scrap no se pueden quitar de la asignación desde acá — ambos reportes
  // vienen de la app móvil y ya quedaron guardados; sacarlos de
  // "precintos" los dejaría apuntando a un precinto que ya no está en la
  // asignación.
  const scrapCodigos = new Set(asignacionEnEdicionId ? obtenerCodigosScrapDeAsignacion(asignacionEnEdicionId) : []);
  const usadosCodigos = new Set(asignacionEnEdicionId ? obtenerPrecintosUsadosDeAsignacion(asignacionEnEdicionId) : []);

  tbody.innerHTML = precintosAsignacionTemp.map((p, i) => {
    const lote = obtenerLoteDePrecinto(p);
    const esScrap = scrapCodigos.has(p);
    const esUsado = !esScrap && usadosCodigos.has(p);
    const bloqueado = esScrap || esUsado;
    const etiqueta = esScrap ? 'Scrap' : esUsado ? 'Usado' : '';
    const celdaPrecinto = etiqueta ? `${p} <span class="precinto-asignado-tag">${etiqueta}</span>` : p;
    const acciones = bloqueado
      ? `<span class="precinto-bloqueado-icono" title="Ya ${esScrap ? 'fue reportado como scrap' : 'tiene uso reportado'}; no se puede quitar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>`
      : `<button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintoDeAsignacion(${i})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>`;
    return `
    <tr>
      <td>${i + 1}</td>
      <td>${lote ? lote.material : '—'}</td>
      <td>${celdaPrecinto}</td>
      <td>${acciones}</td>
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

  confirmarAccion(`¿Está seguro de eliminar esta asignación de ${asignacion.cantidad} precinto(s)? Los precintos volverán a quedar disponibles para asignar. Esta acción no se puede deshacer.`, () => {
    const indice = ASIGNACIONES_PRECINTOS_DEMO.findIndex(a => a.id === idAsignacion);
    if (indice !== -1) ASIGNACIONES_PRECINTOS_DEMO.splice(indice, 1);
    guardarEstadoPrecintos();
    mostrarToast('La asignación fue eliminada; sus precintos vuelven a estar disponibles.');
    renderTablaAsignacionPrecintos();
  });
}

// Detalle de solo lectura de una asignación puntual: incluye lo que la fila
// de la grilla no alcanza a mostrar sin recortarse y lo que hoy no se ve en
// ningún lado fuera del formulario de edición (Motivo/Servicio, Observaciones).
let asignacionDetalleActiva = null; // asignación mostrada en "Ver detalle" (para poder recalcular al cambiar de vista)
let vistaDetalleAsignacion = 'material'; // 'material' (agrupado, por defecto) o 'precinto' (uno por uno)

function abrirModalVerDetalleAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  if (!asignacion) return;
  // Puede haber más de un lote de origen (ver registroCodigos) — la
  // interfaz no lo muestra, solo el material resultante. Si la Asignación
  // mezcla materiales se listan todos; el desglose por material, con
  // cantidad y rango de cada uno, ya está en la tabla "Por material" de más
  // abajo.
  const lotes = asignacion.registroCodigos.map(c => obtenerRegistroPrecintoPorCodigo(c)).filter(Boolean);
  const materiales = [...new Set(lotes.map(r => r.material))];
  const estado = calcularEstadoAsignacion(asignacion.id);
  const badgeClase = ESTADO_ASIGNACION_BADGE[estado] || 'badge-gris';

  document.getElementById('detalleAsigFecha').textContent = asignacion.fecha;
  document.getElementById('detalleAsigMaterial').textContent = materiales.length ? materiales.join(' / ') : '—';
  document.getElementById('detalleAsigEstado').innerHTML = `<span class="badge ${badgeClase}"><span class="badge-dot"></span>${estado}</span>`;
  document.getElementById('detalleAsigEntregado').textContent = nombreColaborador(asignacion.entregadoPor);
  document.getElementById('detalleAsigRecibido').textContent = nombreColaborador(asignacion.recibidoPor);
  document.getElementById('detalleAsigCantidad').textContent = asignacion.cantidad;
  document.getElementById('detalleAsigScrap').textContent = obtenerScrapDeAsignacion(asignacion.id);
  document.getElementById('detalleAsigMotivo').textContent = asignacion.motivo || '—';
  document.getElementById('detalleAsigObservaciones').textContent = asignacion.observaciones || 'Sin observaciones.';

  asignacionDetalleActiva = asignacion;
  // "Por material" es la vista con la que siempre se abre el modal: una
  // Asignación puede tener más de 50 precintos, y listarlos todos de
  // entrada haría scroll interminable — el resumen agrupado por material
  // alcanza para la mayoría de las consultas, y "Por precinto" queda a un
  // clic para cuando de verdad hace falta el detalle uno por uno.
  vistaDetalleAsignacion = 'material';
  document.getElementById('btnVistaAsigPorMaterial').classList.add('activo');
  document.getElementById('btnVistaAsigPorPrecinto').classList.remove('activo');
  renderDetallePrecintosAsignacion();

  abrirModal('modalVerDetalleAsignacion');
}

function cambiarVistaDetalleAsignacion(vista) {
  vistaDetalleAsignacion = vista;
  document.getElementById('btnVistaAsigPorMaterial').classList.toggle('activo', vista === 'material');
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

  const scrapCodigos = new Set(obtenerCodigosScrapDeAsignacion(asignacion.id));

  if (vistaDetalleAsignacion === 'material') {
    // Resumen compacto: un renglón por material, con cuántos precintos de
    // ese material entraron en esta Asignación, cuántos de esos son scrap y
    // el rango ya agrupado (ver formatearRangosPrecintos) en vez de
    // listarlos todos. De qué lote sale cada precinto queda resuelto por
    // dentro (ver obtenerLoteDePrecinto) — no se muestra acá.
    thead.innerHTML = `<tr><th>Material</th><th style="width:100px;">Cantidad</th><th style="width:90px;">Scrap</th><th>Precintos</th></tr>`;
    const materiales = [...new Set(asignacion.precintos.map(p => obtenerLoteDePrecinto(p)?.material).filter(Boolean))];
    tbody.innerHTML = materiales.map(material => {
      const precintosDeMaterial = asignacion.precintos.filter(p => obtenerLoteDePrecinto(p)?.material === material);
      const scrapDeMaterial = precintosDeMaterial.filter(p => scrapCodigos.has(p));
      return `<tr>
        <td>${material}</td>
        <td>${precintosDeMaterial.length}</td>
        <td>${scrapDeMaterial.length || '0'}</td>
        <td>${formatearRangosPrecintos(precintosDeMaterial)}</td>
      </tr>`;
    }).join('');
    return;
  }

  // "Por precinto": detalle uno por uno, de qué material viene cada uno y
  // si quedó reportado como scrap, para cuando hace falta revisar un
  // precinto puntual.
  thead.innerHTML = `<tr><th style="width:60px;">N°</th><th>Precinto</th><th>Material</th><th style="width:90px;">Scrap</th></tr>`;
  const precintosOrdenados = [...asignacion.precintos].sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
  tbody.innerHTML = precintosOrdenados.map((p, i) => {
    const lote = obtenerLoteDePrecinto(p);
    const esScrap = scrapCodigos.has(p);
    return `<tr>
      <td>${i + 1}</td>
      <td>${p}</td>
      <td>${lote ? lote.material : '—'}</td>
      <td>${esScrap ? '<span class="badge badge-inactivo"><span class="badge-dot"></span>Scrap</span>' : '—'}</td>
    </tr>`;
  }).join('');
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

  [fechaInput, entregadoInput, recibidoInput, motivoInput].forEach(input => {
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

