// =================================================
// PUERTOS.JS
// Mantenedor de Puertos. Un Puerto puede tener múltiples Terminales
// asociados (relación 1 a N, ver data-terminal-muelle.js) — por eso no se
// puede inactivar un Puerto que tenga Terminales registrados (activos o
// inactivos).
// =================================================

let puertoEditandoFila = null;

function puertoGuardarStorage() {
  const filas = document.querySelectorAll('#puertosTbody tr');
  const lista = [...filas].map((fila, i) => ({
    id: i + 1,
    nombre: fila.cells[1].textContent.trim(),
    descripcion: fila.cells[2].textContent.trim(),
    departamento: fila.getAttribute('data-departamento'),
    ubicacion: fila.getAttribute('data-ubicacion'),
    orden: Number(fila.getAttribute('data-orden')) || 1,
    estado: fila.getAttribute('data-estado')
  }));
  tgGuardarCatalogo('puertosData', lista);
}

// Un Puerto con Terminales registrados (sin importar su estado) no se
// puede inactivar, para no dejar terminales huérfanos.
function puertoTieneTerminales(nombrePuerto) {
  const terminales = tgCargarCatalogo('terminalesPuertoData', typeof TERMINAL_PUERTO_DEMO !== 'undefined' ? TERMINAL_PUERTO_DEMO : []);
  return terminales.some(t => t.puerto === nombrePuerto);
}

function crearFilaPuerto(nombre, descripcion, departamento, ubicacion, orden, estado) {
  const fila = document.createElement('tr');
  fila.setAttribute('data-departamento', departamento);
  fila.setAttribute('data-ubicacion', ubicacion);
  fila.setAttribute('data-orden', orden);
  fila.setAttribute('data-estado', estado);
  fila.innerHTML = `
    <td></td>
    <td class="razon-col"></td>
    <td></td>
    <td></td>
    <td></td>
    <td>${estado === 'activo'
      ? '<span class="badge badge-activo"><span class="badge-dot"></span>Activo</span>'
      : '<span class="badge badge-inactivo"><span class="badge-dot"></span>Inactivo</span>'}</td>
    <td class="opciones">
      <button class="btn-accion btn-editar" title="Editar registro" onclick="abrirModalEditarPuerto(this)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion ${estado === 'activo' ? 'btn-inactivar' : 'btn-activar'}" title="${estado === 'activo' ? 'Inactivar' : 'Activar'}" onclick="cambiarEstadoPuerto(this, '${estado}')">
        ${estado === 'activo'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>'}
      </button>
    </td>`;
  fila.cells[1].textContent = nombre;
  fila.cells[2].textContent = descripcion;
  fila.cells[3].textContent = departamento;
  fila.cells[4].textContent = ubicacion;
  return fila;
}

function puertoCargarFilas() {
  const tbody = document.getElementById('puertosTbody');
  const lista = tgCargarCatalogo('puertosData', PUERTOS_DEMO).slice().sort((a, b) => (a.orden || 0) - (b.orden || 0));
  tbody.innerHTML = '';
  lista.forEach(p => tbody.appendChild(crearFilaPuerto(p.nombre, p.descripcion || '', p.departamento || '', p.ubicacion || '', p.orden || 1, p.estado)));
}

function puertoPoblarSelectDepartamentos(select, valorActual) {
  const actual = select.value;
  select.innerHTML = select.id === 'filterDepartamentoPuerto'
    ? '<option value="">Todas</option>'
    : '<option value="">Seleccione departamento</option>';
  DEPARTAMENTOS_PERU.forEach(d => select.appendChild(new Option(d, d)));
  if (valorActual !== undefined) select.value = valorActual;
  else if (DEPARTAMENTOS_PERU.includes(actual)) select.value = actual;
}

function puertoPoblarSelectOrden(select, valorActual) {
  select.innerHTML = '';
  for (let i = 1; i <= 30; i++) select.appendChild(new Option(i, i));
  select.value = valorActual || '1';
}

// El toggle Activo/Inactivo del modal solo se muestra al editar (igual que
// en Configuración de Tipo de Operación) — un Puerto nuevo siempre nace
// activo, así que no tiene sentido pedirlo al crear.
function puertoActualizarTextoEstado() {
  const toggle = document.getElementById('puertoEstadoToggle');
  const texto = document.getElementById('puertoEstadoTexto');
  texto.textContent = toggle.checked ? 'Activo' : 'Inactivo';
}

function abrirModalNuevoPuerto() {
  puertoEditandoFila = null;
  limpiarErroresModal('modalPuerto');
  document.getElementById('modalPuertoTitulo').textContent = 'Nuevo Puerto';
  document.getElementById('puertoNombreInput').value = '';
  document.getElementById('puertoDescripcionInput').value = '';
  puertoPoblarSelectDepartamentos(document.getElementById('puertoDepartamentoInput'), '');
  document.getElementById('puertoUbicacionInput').value = '';
  const totalPuertos = document.querySelectorAll('#puertosTbody tr').length;
  puertoPoblarSelectOrden(document.getElementById('puertoOrdenInput'), String(totalPuertos + 1));
  document.getElementById('puertoEstadoToggle').checked = true;
  puertoActualizarTextoEstado();
  document.getElementById('puertoEstadoGroup').style.display = 'none';
  abrirModal('modalPuerto');
}

function abrirModalEditarPuerto(btn) {
  const fila = btn.closest('tr');
  puertoEditandoFila = fila;
  limpiarErroresModal('modalPuerto');
  document.getElementById('modalPuertoTitulo').textContent = 'Editar Puerto';
  document.getElementById('puertoNombreInput').value = fila.cells[1].textContent.trim();
  document.getElementById('puertoDescripcionInput').value = fila.cells[2].textContent.trim();
  puertoPoblarSelectDepartamentos(document.getElementById('puertoDepartamentoInput'), fila.getAttribute('data-departamento'));
  document.getElementById('puertoUbicacionInput').value = fila.getAttribute('data-ubicacion') || '';
  puertoPoblarSelectOrden(document.getElementById('puertoOrdenInput'), fila.getAttribute('data-orden'));
  document.getElementById('puertoEstadoToggle').checked = fila.getAttribute('data-estado') === 'activo';
  puertoActualizarTextoEstado();
  document.getElementById('puertoEstadoGroup').style.display = '';
  abrirModal('modalPuerto');
}

function grabarPuerto() {
  const nombreInput = document.getElementById('puertoNombreInput');
  const descripcionInput = document.getElementById('puertoDescripcionInput');
  const departamentoInput = document.getElementById('puertoDepartamentoInput');
  const ubicacionInput = document.getElementById('puertoUbicacionInput');
  const ordenInput = document.getElementById('puertoOrdenInput');

  limpiarErroresModal('modalPuerto');

  let valido = true;
  let primerCampoInvalido = null;
  [nombreInput, departamentoInput, ubicacionInput, ordenInput].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });
  if (!valido) {
    primerCampoInvalido.focus();
    return;
  }

  if (puertoEditandoFila) {
    const estadoAnterior = puertoEditandoFila.getAttribute('data-estado');
    const estadoNuevo = document.getElementById('puertoEstadoToggle').checked ? 'activo' : 'inactivo';
    const nombreActual = puertoEditandoFila.cells[1].textContent.trim();

    if (estadoAnterior === 'activo' && estadoNuevo === 'inactivo' && puertoTieneTerminales(nombreActual)) {
      mostrarToast('No se puede inactivar: este Puerto tiene Terminales registrados.');
      return;
    }

    puertoEditandoFila.setAttribute('data-departamento', departamentoInput.value);
    puertoEditandoFila.setAttribute('data-ubicacion', ubicacionInput.value.trim());
    puertoEditandoFila.setAttribute('data-orden', ordenInput.value);
    puertoEditandoFila.cells[1].textContent = nombreInput.value.trim();
    puertoEditandoFila.cells[2].textContent = descripcionInput.value.trim();
    puertoEditandoFila.cells[3].textContent = departamentoInput.value;
    puertoEditandoFila.cells[4].textContent = ubicacionInput.value.trim();
    if (estadoNuevo !== estadoAnterior) puertoAplicarEstadoFila(puertoEditandoFila, estadoNuevo);
    cerrarModal('modalPuerto');
    puertoGuardarStorage();
    mostrarModalGuardado('editar', null, () => resaltarFilaNueva(puertoEditandoFila));
  } else {
    const tbody = document.getElementById('puertosTbody');
    const fila = crearFilaPuerto(nombreInput.value.trim(), descripcionInput.value.trim(), departamentoInput.value, ubicacionInput.value.trim(), Number(ordenInput.value), 'activo');
    tbody.prepend(fila);
    cerrarModal('modalPuerto');
    puertoGuardarStorage();
    mostrarModalGuardado('crear', null, () => resaltarFilaNueva(fila));
  }

  filtrarPuertos();
}

function cambiarEstadoPuerto(btn, estadoActual) {
  const fila = btn.closest('tr');
  const nombre = fila.cells[1].textContent.trim();

  if (estadoActual === 'activo') {
    if (puertoTieneTerminales(nombre)) {
      mostrarToast('No se puede inactivar: este Puerto tiene Terminales registrados.');
      return;
    }
    confirmarAccion('¿Está seguro de inactivar este registro?', () => ejecutarCambioEstadoPuerto(btn, estadoActual));
  } else {
    ejecutarCambioEstadoPuerto(btn, estadoActual);
  }
}

// Aplica el estado (badge + botón activar/inactivar) a una fila ya
// existente en el DOM — usado tanto por el toggle del botón de fila como
// por el toggle del modal de edición, para no duplicar el marcado.
function puertoAplicarEstadoFila(fila, estado) {
  fila.setAttribute('data-estado', estado);
  const badge = fila.querySelector('.badge');
  const btn = fila.querySelector('.btn-accion:not(.btn-editar)');

  if (estado === 'activo') {
    badge.className = 'badge badge-activo';
    badge.innerHTML = '<span class="badge-dot"></span>Activo';
    btn.className = 'btn-accion btn-inactivar';
    btn.setAttribute('onclick', "cambiarEstadoPuerto(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
  } else {
    badge.className = 'badge badge-inactivo';
    badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstadoPuerto(this, 'inactivo')");
    btn.title = 'Activar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      </svg>`;
  }
}

function ejecutarCambioEstadoPuerto(btn, estadoActual) {
  const fila = btn.closest('tr');
  const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
  puertoAplicarEstadoFila(fila, nuevoEstado);
  mostrarToast(nuevoEstado === 'inactivo' ? 'El registro se inactivó con éxito' : 'El registro se activó con éxito');
  puertoGuardarStorage();
}

// =================================================
// FILTRO + PAGINACIÓN
// El "Mostrar N registros" del pie de tabla es funcional: solo se muestran
// las filas de la página actual, con el resto de filas coincidentes con el
// filtro ocultas (no solo las que no matchean el filtro).
// =================================================
let puertoPaginaActual = 1;

function puertoTamanoPagina() {
  const select = document.getElementById('puertoPagSelect');
  return select ? Number(select.value) : 10;
}

function puertoAplicarFiltros(resetearPagina) {
  if (resetearPagina) puertoPaginaActual = 1;

  const texto = document.getElementById('searchPuerto').value.toLowerCase();
  const departamento = document.getElementById('filterDepartamentoPuerto').value;
  const estado = document.getElementById('filterEstadoPuerto').value;

  const filas = [...document.querySelectorAll('#puertosTbody tr')];
  const coincidentes = filas.filter(fila => {
    const nombre = fila.cells[1].textContent.toLowerCase();
    const coincideTexto = nombre.includes(texto);
    const coincideDepartamento = !departamento || fila.getAttribute('data-departamento') === departamento;
    const coincideEstado = estado === 'todos' || fila.getAttribute('data-estado') === estado;
    return coincideTexto && coincideDepartamento && coincideEstado;
  });

  const tamano = puertoTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(coincidentes.length / tamano));
  if (puertoPaginaActual > totalPaginas) puertoPaginaActual = totalPaginas;
  if (puertoPaginaActual < 1) puertoPaginaActual = 1;

  const inicio = (puertoPaginaActual - 1) * tamano;
  const visibles = coincidentes.slice(inicio, inicio + tamano);

  filas.forEach(fila => { fila.style.display = 'none'; });
  visibles.forEach((fila, i) => {
    fila.style.display = '';
    fila.cells[0].textContent = inicio + i + 1;
  });

  puertoRenderizarPaginacion(totalPaginas);
}

function puertoRenderizarPaginacion(totalPaginas) {
  const prev = document.getElementById('puertoPagPrev');
  const next = document.getElementById('puertoPagNext');
  const numeros = document.getElementById('puertoPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = puertoPaginaActual <= 1;
  next.disabled = puertoPaginaActual >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === puertoPaginaActual ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => puertoIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function puertoIrAPagina(numero) {
  puertoPaginaActual = numero;
  puertoAplicarFiltros(false);
}

function puertoCambiarTamanoPagina() {
  puertoAplicarFiltros(true);
}

function filtrarPuertos() {
  puertoAplicarFiltros(true);
}

function limpiarFiltrosPuerto() {
  document.getElementById('searchPuerto').value = '';
  document.getElementById('filterDepartamentoPuerto').value = '';
  document.getElementById('filterEstadoPuerto').value = 'todos';
  filtrarPuertos();
}

// Listener para el toggle de estado en el modal de Puertos
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'puertoEstadoToggle') puertoActualizarTextoEstado();
});

document.addEventListener('DOMContentLoaded', () => {
  puertoCargarFilas();
  puertoPoblarSelectDepartamentos(document.getElementById('filterDepartamentoPuerto'));
  filtrarPuertos();
});
