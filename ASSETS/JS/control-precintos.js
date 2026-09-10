// =================================================
// CONTROL-PRECINTOS.JS
// Precintos > Control de Precintos (grilla) + modales de Registro,
// Asignación y "Generar Registro" (Detalle / Ver etiquetas).
// =================================================

let precintosNuevosTemp = [];   // precintos agregados en el modal Registro (aún sin guardar)
let precintoEnEdicionIndex = null;   // índice de precintosNuevosTemp que se está editando en línea (null = ninguno)
let precintoEdicionCancelada = false; // evita que Escape dispare el guardado por blur
let persNuevosTemp = [];        // PER agregados en el modal Asignación (aún sin guardar)
let codigoRegistroEnEdicion = null;   // código del registro que se está editando (null = nuevo)
let codigoAsignacionActivo = null;    // código del registro sobre el que se abrió Asignación
// El Detalle completo con colaboradores/firmas ("Generar Registro de
// Precintos") vive en generar-registro-precintos.js y se abre solo desde
// Reporte de Precintos > Ver (por PER). "Ver etiquetas" aquí es una vista
// simple de solo lectura con las etiquetas del lote, según el documento
// funcional ("Permite visualizar el registro de las etiquetas de cada
// precinto").

document.addEventListener('DOMContentLoaded', () => {
  renderTablaControlPrecintos();
});

/* =================================================
   GRILLA PRINCIPAL
================================================= */
function obtenerPersonalPorRegistro(codigo) {
  const asignaciones = ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.registroCodigo === codigo);
  const entregados = asignaciones.map(a => obtenerUsuarioPorNombre(a.entregadoPor)).filter(Boolean)
    .map(u => `${u.nombre} ${u.apellido}`);
  const recibidos = asignaciones.map(a => a.recibidoPor);
  return { entregados, recibidos, pers: asignaciones.flatMap(a => a.pers) };
}

function renderTablaControlPrecintos(filtroTexto = '') {
  const tbody = document.getElementById('tbodyControlPrecintos');
  const texto = filtroTexto.trim().toLowerCase();

  const filas = PRECINTOS_REGISTROS_DEMO.filter(registro => {
    if (!texto) return true;
    const { entregados, recibidos, pers } = obtenerPersonalPorRegistro(registro.codigo);
    const bolsaTexto = [registro.codigo, ...pers, ...entregados, ...recibidos].join(' ').toLowerCase();
    return bolsaTexto.includes(texto);
  });

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="submodulo-tabla-vacio">No se encontraron registros de precintos.</td></tr>`;
    return;
  }

  tbody.innerHTML = filas.map((registro) => {
    const badgeClase = registro.estado === 'Finalizado' ? 'badge-gris' : 'badge-vigente';
    return `
    <tr>
      <td class="codigo-col">${registro.codigo}</td>
      <td>${registro.fecha}</td>
      <td>${registro.precintos.length}</td>
      <td><span class="badge ${badgeClase}"><span class="badge-dot"></span>${registro.estado}</span></td>
      <td class="opciones">
        <button class="btn-accion btn-asignar" title="Asignar precintos" onclick="abrirModalAsignacion('${registro.codigo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
        </button>
        <button class="btn-accion btn-editar" title="Editar registro" onclick="abrirModalEditarPrecinto('${registro.codigo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
        <button class="btn-accion btn-inactivar" title="Eliminar registro" onclick="eliminarRegistroPrecinto('${registro.codigo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
        <button class="btn-accion btn-ver" title="Ver etiquetas" onclick="abrirModalVerEtiquetas('${registro.codigo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

function filtrarControlPrecintos() {
  renderTablaControlPrecintos(document.getElementById('searchControlPrecintos').value);
}

function limpiarFiltrosControlPrecintos() {
  document.getElementById('searchControlPrecintos').value = '';
  renderTablaControlPrecintos();
}

/* =================================================
   MODAL: REGISTRO DE PRECINTOS (Nuevo / Editar)
================================================= */
function renderTablaPrecintosRegistro() {
  const tbody = document.getElementById('tbodyPrecintosRegistro');
  document.getElementById('registroCantidadInput').value = precintosNuevosTemp.length;

  if (!precintosNuevosTemp.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron precintos.</td></tr>`;
    return;
  }
  tbody.innerHTML = precintosNuevosTemp.map((p, i) => {
    const enEdicion = i === precintoEnEdicionIndex;
    const celda = enEdicion
      ? `<input type="text" class="precinto-editar-input" id="precintoEditarInput"
           value="${p}"
           onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();} if(event.key==='Escape'){event.preventDefault();precintoEdicionCancelada=true;this.blur();}"
           onblur="onBlurPrecintoEditar(${i})">`
      : p;
    const botonAccion = enEdicion
      ? `<button type="button" class="btn-editar-fila" title="Guardar" onmousedown="event.preventDefault();guardarEdicionPrecinto(${i})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
        </button>`
      : `<button type="button" class="btn-editar-fila" title="Editar" onclick="editarPrecintoDeRegistro(${i})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>`;
    return `
    <tr>
      <td>${i + 1}</td>
      <td>${celda}</td>
      <td>
        ${botonAccion}
        <button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintoDeRegistro(${i})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  if (precintoEnEdicionIndex !== null) {
    const input = document.getElementById('precintoEditarInput');
    if (input) { input.focus(); input.select(); }
  }
}

// Arma una lista secuencial de precintos entre "desde" y "hasta" conservando
// el prefijo y el relleno de ceros del valor "desde" (ej. A-10021 → A-10030
// genera A-10021, A-10022, ..., A-10030).
function generarRangoPrecintos(desde, hasta) {
  const matchDesde = String(desde).match(/^(.*?)(\d+)\s*$/);
  const matchHasta = String(hasta).match(/(\d+)\s*$/);
  if (!matchDesde || !matchHasta) return null;

  const prefijo = matchDesde[1];
  const ancho = matchDesde[2].length;
  const nDesde = parseInt(matchDesde[2], 10);
  const nHasta = parseInt(matchHasta[1], 10);
  if (isNaN(nDesde) || isNaN(nHasta) || nHasta < nDesde) return null;

  const lista = [];
  for (let n = nDesde; n <= nHasta; n++) {
    lista.push(`${prefijo}${String(n).padStart(ancho, '0')}`);
  }
  return lista;
}

// Agrega un precinto individual (solo "Desde") o, si se completa "Hasta",
// un rango completo de precintos de una sola vez.
function agregarPrecintoARegistro() {
  const inputDesde = document.getElementById('registroPrecintoNuevoInput');
  const inputHasta = document.getElementById('registroPrecintoHastaInput');
  const desde = inputDesde.value.trim();
  const hasta = inputHasta.value.trim();

  if (!desde) { mostrarToast('Ingresa un número de precinto.'); return; }

  let candidatos;
  if (hasta) {
    candidatos = generarRangoPrecintos(desde, hasta);
    if (!candidatos || !candidatos.length) { mostrarToast('El rango ingresado no es válido.'); return; }
    if (candidatos.length > 500) { mostrarToast('El rango es demasiado grande (máximo 500 precintos).'); return; }
  } else {
    candidatos = [desde];
  }

  const nuevos = candidatos.filter(p => !precintosNuevosTemp.includes(p));
  const repetidos = candidatos.length - nuevos.length;

  if (!nuevos.length) { mostrarToast('Ese(s) precinto(s) ya fueron agregados.'); return; }

  precintosNuevosTemp.unshift(...nuevos);
  inputDesde.value = '';
  inputHasta.value = '';
  inputDesde.focus();
  renderTablaPrecintosRegistro();

  if (repetidos > 0) {
    mostrarToast(`Se agregaron ${nuevos.length} precinto(s). ${repetidos} ya existían y se omitieron.`);
  }
}

function editarPrecintoDeRegistro(indice) {
  precintoEnEdicionIndex = indice;
  renderTablaPrecintosRegistro();
}

function onBlurPrecintoEditar(indice) {
  if (precintoEdicionCancelada) {
    precintoEdicionCancelada = false;
    precintoEnEdicionIndex = null;
    renderTablaPrecintosRegistro();
    return;
  }
  guardarEdicionPrecinto(indice);
}

function guardarEdicionPrecinto(indice) {
  const input = document.getElementById('precintoEditarInput');
  if (!input) return;
  const valor = input.value.trim();
  if (!valor) { mostrarToast('El precinto no puede estar vacío.'); input.focus(); return; }
  const duplicado = precintosNuevosTemp.some((p, i) => i !== indice && p === valor);
  if (duplicado) { mostrarToast('Ese precinto ya existe en la lista.'); input.focus(); return; }
  precintosNuevosTemp[indice] = valor;
  precintoEnEdicionIndex = null;
  renderTablaPrecintosRegistro();
}

function quitarPrecintoDeRegistro(indice) {
  if (precintoEnEdicionIndex === indice) precintoEnEdicionIndex = null;
  precintosNuevosTemp.splice(indice, 1);
  renderTablaPrecintosRegistro();
}

function abrirModalRegistrarPrecinto() {
  codigoRegistroEnEdicion = null;
  precintosNuevosTemp = [];
  precintoEnEdicionIndex = null;

  document.getElementById('modalRegistroPrecintoTitulo').textContent = 'Registro de Precintos';
  document.getElementById('registroCodigoInput').value = generarCodigoRegistroPrecinto();
  document.getElementById('registroFechaInput').value = new Date().toISOString().slice(0, 10);
  document.getElementById('registroEstadoInput').value = 'Registrado';
  limpiarErroresModal('modalRegistroPrecinto');
  renderTablaPrecintosRegistro();
  abrirModal('modalRegistroPrecinto');
}

function abrirModalEditarPrecinto(codigo) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return;

  codigoRegistroEnEdicion = codigo;
  precintosNuevosTemp = [...registro.precintos];
  precintoEnEdicionIndex = null;

  document.getElementById('modalRegistroPrecintoTitulo').textContent = 'Editar Registro de Precintos';
  document.getElementById('registroCodigoInput').value = registro.codigo;
  document.getElementById('registroFechaInput').value = fechaDDMMYYYYaISO(registro.fecha);
  document.getElementById('registroEstadoInput').value = registro.estado;
  limpiarErroresModal('modalRegistroPrecinto');
  renderTablaPrecintosRegistro();
  abrirModal('modalRegistroPrecinto');
}

function guardarRegistroPrecinto() {
  const fechaInput = document.getElementById('registroFechaInput');
  limpiarErroresModal('modalRegistroPrecinto');

  if (!fechaInput.value) {
    mostrarErrorCampo(fechaInput, 'Campo obligatorio');
    fechaInput.focus();
    return;
  }
  if (!precintosNuevosTemp.length) {
    mostrarToast('Agrega al menos un precinto antes de guardar.');
    return;
  }

  const fechaFormateada = fechaISOaDDMMYYYY(fechaInput.value);
  const estado = document.getElementById('registroEstadoInput').value;

  if (codigoRegistroEnEdicion) {
    const registro = obtenerRegistroPrecintoPorCodigo(codigoRegistroEnEdicion);
    registro.fecha = fechaFormateada;
    registro.estado = estado;
    registro.precintos = [...precintosNuevosTemp];
  } else {
    PRECINTOS_REGISTROS_DEMO.unshift({
      codigo: document.getElementById('registroCodigoInput').value,
      fecha: fechaFormateada,
      estado,
      precintos: [...precintosNuevosTemp]
    });
  }

  cerrarModal('modalRegistroPrecinto');
  renderTablaControlPrecintos();
  mostrarModalGuardado(codigoRegistroEnEdicion ? 'editar' : 'crear', null, () => {});
}

function eliminarRegistroPrecinto(codigo) {
  confirmarAccion(`¿Está seguro de eliminar el registro ${codigo}? Esta acción no se puede deshacer.`, () => {
    const indice = PRECINTOS_REGISTROS_DEMO.findIndex(r => r.codigo === codigo);
    if (indice !== -1) PRECINTOS_REGISTROS_DEMO.splice(indice, 1);
    renderTablaControlPrecintos();
    mostrarToast('El registro fue eliminado correctamente.');
  });
}

/* =================================================
   MODAL: ASIGNACIÓN DE PRECINTOS
================================================= */
function poblarSelectUsuariosAsignacion() {
  const select = document.getElementById('asignacionEntregadoPorInput');
  select.innerHTML = USUARIOS_DEMO
    .filter(u => u.estado === 'activo')
    .map(u => `<option value="${u.usuario}">${u.nombre} ${u.apellido}</option>`).join('');
}

function poblarSelectPerAsignacion() {
  const select = document.getElementById('asignacionPerNuevoInput');
  select.innerHTML = PER_DEMO_PRECINTOS.map(per => `<option value="${per}">${per}</option>`).join('');
}

function renderTablaPersAsignacion() {
  const tbody = document.getElementById('tbodyPersAsignacion');
  if (!persNuevosTemp.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron PER.</td></tr>`;
    return;
  }
  tbody.innerHTML = persNuevosTemp.map((per, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${per}</td>
      <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPerDeAsignacion(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button></td>
    </tr>`).join('');
}

function agregarPerAAsignacion() {
  const select = document.getElementById('asignacionPerNuevoInput');
  const valor = select.value;
  if (!valor) return;
  if (persNuevosTemp.includes(valor)) { mostrarToast('Ese PER ya fue agregado.'); return; }
  persNuevosTemp.push(valor);
  renderTablaPersAsignacion();
}

function quitarPerDeAsignacion(indice) {
  persNuevosTemp.splice(indice, 1);
  renderTablaPersAsignacion();
}

// Extrae el número final de un código de precinto (ej. "A-10010" → 10010)
// para poder calcular cuántos precintos abarca un rango.
function numeroDePrecinto(codigo) {
  const match = String(codigo).match(/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : NaN;
}

function calcularStockAsignacion() {
  const desde = document.getElementById('asignacionNumDesdeInput').value.trim();
  const hasta = document.getElementById('asignacionNumHastaInput').value.trim();
  const nDesde = numeroDePrecinto(desde);
  const nHasta = numeroDePrecinto(hasta);
  const cont = document.getElementById('asignacionCantidadStock');

  if (!desde || !hasta || isNaN(nDesde) || isNaN(nHasta) || nHasta < nDesde) {
    cont.textContent = '0';
    return 0;
  }
  const cantidad = nHasta - nDesde + 1;
  cont.textContent = cantidad;
  return cantidad;
}

function abrirModalAsignacion(codigo) {
  codigoAsignacionActivo = codigo;
  persNuevosTemp = [];

  poblarSelectUsuariosAsignacion();
  poblarSelectPerAsignacion();
  limpiarErroresModal('modalAsignacionPrecintos');

  document.getElementById('asignacionFechaInput').value = new Date().toISOString().slice(0, 10);
  document.getElementById('asignacionRecibidoPorInput').value = '';
  document.getElementById('asignacionNumDesdeInput').value = '';
  document.getElementById('asignacionNumHastaInput').value = '';
  document.getElementById('asignacionCantidadStock').textContent = '0';
  document.getElementById('asignacionMotivoInput').value = '';
  document.getElementById('asignacionMaterialPlastico').checked = true;
  document.getElementById('asignacionMaterialMetalico').checked = false;
  document.getElementById('asignacionObservacionesInput').value = '';
  renderTablaPersAsignacion();

  abrirModal('modalAsignacionPrecintos');
}

function guardarAsignacionPrecintos() {
  const fechaInput = document.getElementById('asignacionFechaInput');
  const recibidoInput = document.getElementById('asignacionRecibidoPorInput');
  const desdeInput = document.getElementById('asignacionNumDesdeInput');
  const hastaInput = document.getElementById('asignacionNumHastaInput');
  const motivoInput = document.getElementById('asignacionMotivoInput');

  limpiarErroresModal('modalAsignacionPrecintos');
  let valido = true;
  let primerCampoInvalido = null;

  [fechaInput, recibidoInput, desdeInput, hastaInput, motivoInput].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  const cantidad = calcularStockAsignacion();
  if (valido && cantidad <= 0) {
    mostrarErrorCampo(hastaInput, 'El rango ingresado no es válido');
    primerCampoInvalido = hastaInput;
    valido = false;
  }

  if (valido && !persNuevosTemp.length) {
    mostrarToast('Agrega al menos un PER antes de guardar.');
    valido = false;
  }

  if (!valido) {
    if (primerCampoInvalido) primerCampoInvalido.focus();
    return;
  }

  const material = [];
  if (document.getElementById('asignacionMaterialPlastico').checked) material.push('plastico');
  if (document.getElementById('asignacionMaterialMetalico').checked) material.push('metalico');

  ASIGNACIONES_PRECINTOS_DEMO.unshift({
    id: Date.now(),
    registroCodigo: codigoAsignacionActivo,
    fecha: fechaISOaDDMMYYYY(fechaInput.value),
    entregadoPor: document.getElementById('asignacionEntregadoPorInput').value,
    recibidoPor: recibidoInput.value.trim(),
    numDesde: desdeInput.value.trim(),
    numHasta: hastaInput.value.trim(),
    cantidad,
    motivo: motivoInput.value.trim(),
    material,
    observaciones: document.getElementById('asignacionObservacionesInput').value.trim(),
    pers: [...persNuevosTemp]
  });

  cerrarModal('modalAsignacionPrecintos');
  renderTablaControlPrecintos();
  mostrarModalGuardado('crear', 'Se registró la asignación de precintos.', () => {});
}

/* =================================================
   MODAL: VER ETIQUETAS (solo lectura, etiquetas del lote)
================================================= */
function abrirModalVerEtiquetas(codigo) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return;

  document.getElementById('etiquetasCodigo').textContent = registro.codigo;
  document.getElementById('etiquetasFecha').textContent = registro.fecha;
  document.getElementById('etiquetasEstado').textContent = registro.estado;

  const tbody = document.getElementById('tbodyVerEtiquetas');
  tbody.innerHTML = registro.precintos.length
    ? registro.precintos.map((p, i) => `<tr><td>${i + 1}</td><td>${p}</td></tr>`).join('')
    : `<tr><td colspan="2" class="submodulo-tabla-vacio">Este registro no tiene precintos añadidos.</td></tr>`;

  abrirModal('modalVerEtiquetas');
}
