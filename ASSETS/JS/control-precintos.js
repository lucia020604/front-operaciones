// =================================================
// CONTROL-PRECINTOS.JS
// Precintos > Control de Precintos (grilla) + modal de Registro y "Ver
// registros". La Asignación de Precintos (crear/editar/eliminar) vive en su
// propia interfaz — ver asignacion-precintos.html/js.
// =================================================

let precintosNuevosTemp = [];   // precintos agregados en el modal Registro (aún sin guardar)
let precintoEnEdicionIndex = null;   // índice de precintosNuevosTemp que se está editando en línea (null = ninguno)
let precintoEdicionCancelada = false; // evita que Escape dispare el guardado por blur
let paginaRegistroPrecintos = 1; // página actual de la tabla "Agregar Precinto" — puede acumular varios rangos
let paginaControlPrecintos = 1; // página actual de la grilla principal (materiales)
// El Detalle completo con colaboradores/firmas ("Generar Registro de
// Precintos") vive en generar-registro-precintos.js y se abre solo desde
// Reporte de Precintos > Ver. "Ver registros" aquí es una vista simple de
// solo lectura con los precintos individuales de un ingreso puntual.

document.addEventListener('DOMContentLoaded', () => {
  poblarFiltroMaterialControl();
  renderTablaControlPrecintos();
});

function nombreColaborador(usuario) {
  const u = obtenerUsuarioPorNombre(usuario);
  return u ? `${u.nombre} ${u.apellido}` : usuario;
}

/* =================================================
   GRILLA PRINCIPAL
================================================= */
function poblarFiltroMaterialControl() {
  const select = document.getElementById('filterMaterialControl');
  if (!select) return;
  select.innerHTML = '<option value="">Todos</option>' +
    cargarMaterialesPrecinto().map(m => `<option value="${m.nombre}">${m.nombre}</option>`).join('');
}

function controlPrecintosTamanoPagina() {
  const select = document.getElementById('controlPrecintosPagSelect');
  return select ? Number(select.value) : 5;
}

function controlPrecintosCambiarTamanoPagina() {
  paginaControlPrecintos = 1;
  renderTablaControlPrecintos();
}

function controlPrecintosIrAPagina(numero) {
  paginaControlPrecintos = numero;
  renderTablaControlPrecintos();
}

function renderPaginacionControlPrecintos(totalPaginas) {
  const prev = document.getElementById('controlPrecintosPagPrev');
  const next = document.getElementById('controlPrecintosPagNext');
  const numeros = document.getElementById('controlPrecintosPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaControlPrecintos <= 1;
  next.disabled = paginaControlPrecintos >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaControlPrecintos ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => controlPrecintosIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function renderTablaControlPrecintos() {
  const tbody = document.getElementById('tbodyControlPrecintos');
  const paginacion = document.getElementById('paginacionControlPrecintos');
  const texto = document.getElementById('searchControlPrecintos').value.trim().toLowerCase();
  const filtroMaterial = document.getElementById('filterMaterialControl').value;

  const filas = obtenerMaterialesControlPrecintos().filter(grupo => {
    if (filtroMaterial && grupo.material !== filtroMaterial) return false;
    if (!texto) return true;
    return grupo.material.toLowerCase().includes(texto);
  });

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="submodulo-tabla-vacio">No se encontraron materiales registrados.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = controlPrecintosTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(filas.length / tamano));
  if (paginaControlPrecintos > totalPaginas) paginaControlPrecintos = totalPaginas;
  if (paginaControlPrecintos < 1) paginaControlPrecintos = 1;
  const inicio = (paginaControlPrecintos - 1) * tamano;
  const visibles = filas.slice(inicio, inicio + tamano);

  tbody.innerHTML = visibles.map((grupo, i) => {
    const disponibleCelda = grupo.disponible
      ? `<span class="asignados-pendiente">${grupo.disponible}</span>`
      : '0';

    return `
    <tr>
      <td>${inicio + i + 1}</td>
      <td>${grupo.fecha}</td>
      <td>${grupo.material}</td>
      <td>${grupo.total}</td>
      <td>${disponibleCelda}</td>
      <td>${nombreColaborador(grupo.ingresadoPor)}</td>
      <td>${grupo.fechaUltimaActualizacion}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver historial" onclick="abrirModalHistorialMaterial('${grupo.material}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionControlPrecintos(totalPaginas);
}

function filtrarControlPrecintos() {
  renderTablaControlPrecintos();
}

function limpiarFiltrosControlPrecintos() {
  document.getElementById('searchControlPrecintos').value = '';
  document.getElementById('filterMaterialControl').value = '';
  renderTablaControlPrecintos();
}

/* =================================================
   MODAL: REGISTRO DE PRECINTOS (Nuevo / Editar)
================================================= */
function registroPrecintosTamanoPagina() {
  const select = document.getElementById('registroPrecintosPagSelect');
  return select ? Number(select.value) : 5;
}

function registroPrecintosCambiarTamanoPagina() {
  paginaRegistroPrecintos = 1;
  renderTablaPrecintosRegistro();
}

function registroPrecintosIrAPagina(numero) {
  paginaRegistroPrecintos = numero;
  renderTablaPrecintosRegistro();
}

function renderPaginacionRegistroPrecintos(totalPaginas) {
  const prev = document.getElementById('registroPrecintosPagPrev');
  const next = document.getElementById('registroPrecintosPagNext');
  const numeros = document.getElementById('registroPrecintosPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaRegistroPrecintos <= 1;
  next.disabled = paginaRegistroPrecintos >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaRegistroPrecintos ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => registroPrecintosIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function renderTablaPrecintosRegistro() {
  const tbody = document.getElementById('tbodyPrecintosRegistro');
  const paginacion = document.getElementById('paginacionRegistroPrecintos');
  document.getElementById('registroCantidadInput').value = precintosNuevosTemp.length;

  if (!precintosNuevosTemp.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron precintos.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = registroPrecintosTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(precintosNuevosTemp.length / tamano));
  if (paginaRegistroPrecintos > totalPaginas) paginaRegistroPrecintos = totalPaginas;
  if (paginaRegistroPrecintos < 1) paginaRegistroPrecintos = 1;
  const inicio = (paginaRegistroPrecintos - 1) * tamano;
  const indicesVisibles = precintosNuevosTemp.map((_, i) => i).slice(inicio, inicio + tamano);

  tbody.innerHTML = indicesVisibles.map(i => {
    const p = precintosNuevosTemp[i];
    const enEdicion = i === precintoEnEdicionIndex;
    const celda = enEdicion
      ? `<input type="text" class="precinto-editar-input" id="precintoEditarInput"
           value="${p}"
           onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();} if(event.key==='Escape'){event.preventDefault();precintoEdicionCancelada=true;this.blur();}"
           onblur="onBlurPrecintoEditar(${i})">`
      : p;
    const acciones = enEdicion
      ? `<button type="button" class="btn-editar-fila" title="Guardar" onmousedown="event.preventDefault();guardarEdicionPrecinto(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
          <button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintoDeRegistro(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>`
      : `<button type="button" class="btn-editar-fila" title="Editar" onclick="editarPrecintoDeRegistro(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
          <button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintoDeRegistro(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>`;
    return `
    <tr>
      <td>${i + 1}</td>
      <td>${celda}</td>
      <td>${acciones}</td>
    </tr>`;
  }).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionRegistroPrecintos(totalPaginas);

  if (precintoEnEdicionIndex !== null) {
    const input = document.getElementById('precintoEditarInput');
    if (input) { input.focus(); input.select(); }
  }
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
  paginaRegistroPrecintos = 1; // para que lo recién agregado quede a la vista
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

// Material del precinto (plástico, metálico, circular, ...): combo cargado
// desde Configuración > Tablas Generales en vez de opciones fijas en el HTML.
function poblarSelectMaterialRegistro() {
  const select = document.getElementById('registroMaterialInput');
  select.innerHTML = cargarMaterialesPrecinto().map(m => `<option value="${m.nombre}">${m.nombre}</option>`).join('');
}

function abrirModalRegistrarPrecinto() {
  precintosNuevosTemp = [];
  precintoEnEdicionIndex = null;
  paginaRegistroPrecintos = 1;

  document.getElementById('modalRegistroPrecintoTitulo').textContent = 'Registro de Precintos';
  document.getElementById('registroFechaInput').value = new Date().toISOString().slice(0, 10);
  poblarSelectMaterialRegistro();
  limpiarErroresModal('modalRegistroPrecinto');
  renderTablaPrecintosRegistro();
  abrirModal('modalRegistroPrecinto');
}

function guardarRegistroPrecinto() {
  limpiarErroresModal('modalRegistroPrecinto');

  const fechaInput = document.getElementById('registroFechaInput');
  if (!fechaInput.value) {
    mostrarErrorCampo(fechaInput, 'La fecha de registro es obligatoria.');
    return;
  }

  if (!precintosNuevosTemp.length) {
    mostrarToast('Agrega al menos un precinto antes de guardar.');
    return;
  }

  const material = document.getElementById('registroMaterialInput').value;
  const sesion = obtenerUsuarioActual();

  PRECINTOS_REGISTROS_DEMO.unshift({
    codigo: generarCodigoRegistroPrecinto(),
    fecha: fechaISOaDDMMYYYY(fechaInput.value),
    estado: 'Registrado',
    material,
    ingresadoPor: sesion ? sesion.usuario : null,
    precintos: [...precintosNuevosTemp]
  });
  guardarEstadoPrecintos();

  cerrarModal('modalRegistroPrecinto');
  renderTablaControlPrecintos();
  mostrarModalGuardado('crear', null, () => {});
}

/* =================================================
   MODAL: VER ETIQUETAS (solo lectura, etiquetas del lote)
================================================= */
let codigoVerEtiquetasActivo = null; // código del registro mostrado en el modal (para poder recalcular al cambiar de página)
let paginaVerEtiquetas = 1;

function verEtiquetasTamanoPagina() {
  const select = document.getElementById('verEtiquetasPagSelect');
  return select ? Number(select.value) : 5;
}

function verEtiquetasCambiarTamanoPagina() {
  paginaVerEtiquetas = 1;
  renderTablaVerEtiquetas();
}

function verEtiquetasIrAPagina(numero) {
  paginaVerEtiquetas = numero;
  renderTablaVerEtiquetas();
}

function renderPaginacionVerEtiquetas(totalPaginas) {
  const prev = document.getElementById('verEtiquetasPagPrev');
  const next = document.getElementById('verEtiquetasPagNext');
  const numeros = document.getElementById('verEtiquetasPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaVerEtiquetas <= 1;
  next.disabled = paginaVerEtiquetas >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaVerEtiquetas ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => verEtiquetasIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function renderTablaVerEtiquetas() {
  const registro = obtenerRegistroPrecintoPorCodigo(codigoVerEtiquetasActivo);
  const tbody = document.getElementById('tbodyVerEtiquetas');
  const paginacion = document.getElementById('paginacionVerEtiquetas');
  if (!registro) return;

  if (!registro.precintos.length) {
    tbody.innerHTML = `<tr><td colspan="2" class="submodulo-tabla-vacio">Este registro no tiene precintos añadidos.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = verEtiquetasTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(registro.precintos.length / tamano));
  if (paginaVerEtiquetas > totalPaginas) paginaVerEtiquetas = totalPaginas;
  if (paginaVerEtiquetas < 1) paginaVerEtiquetas = 1;
  const inicio = (paginaVerEtiquetas - 1) * tamano;
  const indicesVisibles = registro.precintos.map((_, i) => i).slice(inicio, inicio + tamano);

  tbody.innerHTML = indicesVisibles.map(i => `<tr><td>${i + 1}</td><td>${registro.precintos[i]}</td></tr>`).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionVerEtiquetas(totalPaginas);
}

function abrirModalVerEtiquetas(codigo) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return;

  codigoVerEtiquetasActivo = codigo;
  paginaVerEtiquetas = 1;

  document.getElementById('etiquetasFecha').textContent = registro.fecha;
  document.getElementById('etiquetasMaterial').textContent = registro.material;
  document.getElementById('etiquetasIngresadoPor').textContent = nombreColaborador(registro.ingresadoPor);

  renderTablaVerEtiquetas();
  abrirModal('modalVerEtiquetas');
}

/* =================================================
   MODAL: HISTORIAL DE MATERIAL (ingresos de un material)
================================================= */
let materialHistorialActivo = null; // material mostrado en el modal (para poder recalcular al cambiar de página)
let paginaHistorialMaterial = 1;

function historialMaterialTamanoPagina() {
  const select = document.getElementById('historialMaterialPagSelect');
  return select ? Number(select.value) : 5;
}

function historialMaterialCambiarTamanoPagina() {
  paginaHistorialMaterial = 1;
  renderTablaHistorialMaterial();
}

function historialMaterialIrAPagina(numero) {
  paginaHistorialMaterial = numero;
  renderTablaHistorialMaterial();
}

function renderPaginacionHistorialMaterial(totalPaginas) {
  const prev = document.getElementById('historialMaterialPagPrev');
  const next = document.getElementById('historialMaterialPagNext');
  const numeros = document.getElementById('historialMaterialPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaHistorialMaterial <= 1;
  next.disabled = paginaHistorialMaterial >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaHistorialMaterial ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => historialMaterialIrAPagina(i);
    numeros.appendChild(btn);
  }
}

// Extrae el prefijo de un código de precinto (ej. "A-10010" → "A-") — copia
// local de la misma lógica que ya usa asignacion-precintos.js, que no está
// cargada en esta página.
function prefijoDePrecintoControl(codigo) {
  const match = String(codigo).match(/^(.*?)\d+\s*$/);
  return match ? match[1] : '';
}

// El último rango agregado a un ingreso queda al principio del arreglo
// "precintos" (cada "Añadir" hace unshift, ver agregarPrecintoARegistro) —
// separarlo así permite mostrar solo ese en Historial de Movimientos por
// defecto, con el resto de rangos disponible al pasar el mouse (ver
// renderTablaHistorialMaterial), en vez de un texto largo con todos juntos.
function separarUltimoRangoAgregado(precintos) {
  if (!precintos.length) return { ultimo: [], resto: [] };
  const prefijo = prefijoDePrecintoControl(precintos[0]);
  let fin = 1;
  while (fin < precintos.length) {
    const actual = precintos[fin];
    const anterior = precintos[fin - 1];
    if (prefijoDePrecintoControl(actual) === prefijo && numeroDePrecinto(actual) === numeroDePrecinto(anterior) + 1) {
      fin++;
    } else {
      break;
    }
  }
  return { ultimo: precintos.slice(0, fin), resto: precintos.slice(fin) };
}

function renderTablaHistorialMaterial() {
  const tbody = document.getElementById('tbodyHistorialMaterial');
  const paginacion = document.getElementById('paginacionHistorialMaterial');
  const movimientos = obtenerHistorialMaterial(materialHistorialActivo);

  if (!movimientos.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="submodulo-tabla-vacio">Este material no tiene movimientos registrados.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = historialMaterialTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(movimientos.length / tamano));
  if (paginaHistorialMaterial > totalPaginas) paginaHistorialMaterial = totalPaginas;
  if (paginaHistorialMaterial < 1) paginaHistorialMaterial = 1;
  const inicio = (paginaHistorialMaterial - 1) * tamano;
  const visibles = movimientos.slice(inicio, inicio + tamano);

  tbody.innerHTML = visibles.map(m => {
    const { ultimo, resto } = separarUltimoRangoAgregado(m.precintos);
    const textoUltimo = formatearRangosPrecintos(ultimo);
    const indicador = resto.length ? ` <span class="rango-mas-indicador">+${resto.length}</span>` : '';
    const tituloCompleto = resto.length
      ? `Resto: ${formatearRangosPrecintos(resto)}`
      : textoUltimo;
    return `
    <tr>
      <td>${m.fecha}</td>
      <td>${nombreColaborador(m.ingresadoPor)}</td>
      <td><span class="rango-precintos-cell" title="${tituloCompleto}">${textoUltimo}${indicador}</span></td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver registros" onclick="abrirModalVerEtiquetas('${m.codigoLote}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionHistorialMaterial(totalPaginas);
}

function abrirModalHistorialMaterial(material) {
  materialHistorialActivo = material;
  paginaHistorialMaterial = 1;
  document.getElementById('historialMaterialNombre').textContent = material;

  renderTablaHistorialMaterial();
  abrirModal('modalHistorialMaterial');
}
