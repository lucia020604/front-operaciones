// =================================================
// TERMINALES.JS
// Mantenedor de Terminales, relacionados a un Puerto (Tablas Generales).
// =================================================

let terminalEditandoFila = null;

function terminalGuardarStorage() {
  const filas = document.querySelectorAll('#terminalesTbody tr');
  const lista = [...filas].map((fila, i) => ({
    id: i + 1,
    nombre: fila.cells[1].textContent.trim(),
    puerto: fila.getAttribute('data-puerto'),
    descripcion: fila.cells[3].textContent.trim(),
    estado: fila.getAttribute('data-estado')
  }));
  tgGuardarCatalogo('terminalesPuertoData', lista);
}

function crearFilaTerminal(nombre, puerto, descripcion, estado) {
  const fila = document.createElement('tr');
  fila.setAttribute('data-puerto', puerto);
  fila.setAttribute('data-estado', estado);
  fila.innerHTML = `
    <td></td>
    <td class="razon-col"></td>
    <td></td>
    <td></td>
    <td>${estado === 'activo'
      ? '<span class="badge badge-activo"><span class="badge-dot"></span>Activo</span>'
      : '<span class="badge badge-inactivo"><span class="badge-dot"></span>Inactivo</span>'}</td>
    <td class="opciones">
      <button class="btn-accion btn-editar" title="Editar registro" onclick="abrirModalEditarTerminal(this)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion ${estado === 'activo' ? 'btn-inactivar' : 'btn-activar'}" title="${estado === 'activo' ? 'Inactivar' : 'Activar'}" onclick="cambiarEstadoTerminal(this, '${estado}')">
        ${estado === 'activo'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>'}
      </button>
    </td>`;
  fila.cells[1].textContent = nombre;
  fila.cells[2].textContent = puerto;
  fila.cells[3].textContent = descripcion;
  return fila;
}

function terminalCargarFilas() {
  const tbody = document.getElementById('terminalesTbody');
  const lista = tgCargarCatalogo('terminalesPuertoData', TERMINAL_PUERTO_DEMO);
  tbody.innerHTML = '';
  lista.forEach(t => tbody.appendChild(crearFilaTerminal(t.nombre, t.puerto, t.descripcion, t.estado)));
}

// Puebla un <select> de Puertos con los puertos activos; si se pasa
// valorActual y no está entre los activos (puerto inactivado luego de
// crear el terminal), igual se agrega para no dejar el campo en blanco.
function terminalPoblarSelectPuertos(select, valorActual) {
  const activos = typeof cargarPuertos === 'function' ? cargarPuertos().map(p => p.nombre) : [];
  const nombres = valorActual && !activos.includes(valorActual) ? [valorActual, ...activos] : activos;
  const actual = select.value;
  select.innerHTML = select.id === 'filterPuertoTerminal'
    ? '<option value="">Todos</option>'
    : '<option value="">--Seleccione puerto--</option>';
  nombres.forEach(n => select.appendChild(new Option(n, n)));
  if (valorActual !== undefined) select.value = valorActual;
  else if (nombres.includes(actual)) select.value = actual;
}

function abrirModalNuevoTerminal() {
  terminalEditandoFila = null;
  limpiarErroresModal('modalTerminal');
  document.getElementById('modalTerminalTitulo').textContent = 'Nuevo Terminal';
  document.getElementById('terminalNombreInput').value = '';
  terminalPoblarSelectPuertos(document.getElementById('terminalPuertoInput'), '');
  document.getElementById('terminalDescripcionInput').value = '';
  abrirModal('modalTerminal');
}

function abrirModalEditarTerminal(btn) {
  const fila = btn.closest('tr');
  terminalEditandoFila = fila;
  limpiarErroresModal('modalTerminal');
  document.getElementById('modalTerminalTitulo').textContent = 'Editar Terminal';
  document.getElementById('terminalNombreInput').value = fila.cells[1].textContent.trim();
  terminalPoblarSelectPuertos(document.getElementById('terminalPuertoInput'), fila.getAttribute('data-puerto'));
  document.getElementById('terminalDescripcionInput').value = fila.cells[3].textContent.trim();
  abrirModal('modalTerminal');
}

function grabarTerminal() {
  const nombreInput = document.getElementById('terminalNombreInput');
  const puertoInput = document.getElementById('terminalPuertoInput');
  const descripcionInput = document.getElementById('terminalDescripcionInput');

  limpiarErroresModal('modalTerminal');

  let valido = true;
  let primerCampoInvalido = null;
  [nombreInput, puertoInput].forEach(input => {
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

  if (terminalEditandoFila) {
    terminalEditandoFila.setAttribute('data-puerto', puertoInput.value);
    terminalEditandoFila.cells[1].textContent = nombreInput.value.trim();
    terminalEditandoFila.cells[2].textContent = puertoInput.value;
    terminalEditandoFila.cells[3].textContent = descripcionInput.value.trim();
    cerrarModal('modalTerminal');
    terminalGuardarStorage();
    mostrarModalGuardado('editar', null, () => resaltarFilaNueva(terminalEditandoFila));
  } else {
    const tbody = document.getElementById('terminalesTbody');
    const fila = crearFilaTerminal(nombreInput.value.trim(), puertoInput.value, descripcionInput.value.trim(), 'activo');
    tbody.prepend(fila);
    cerrarModal('modalTerminal');
    terminalGuardarStorage();
    mostrarModalGuardado('crear', null, () => resaltarFilaNueva(fila));
  }

  filtrarTerminales();
}

function cambiarEstadoTerminal(btn, estadoActual) {
  if (estadoActual === 'activo') {
    confirmarAccion('¿Está seguro de inactivar este registro?', () => ejecutarCambioEstadoTerminal(btn, estadoActual));
  } else {
    ejecutarCambioEstadoTerminal(btn, estadoActual);
  }
}

function ejecutarCambioEstadoTerminal(btn, estadoActual) {
  const fila = btn.closest('tr');
  const badge = fila.querySelector('.badge');

  if (estadoActual === 'activo') {
    fila.setAttribute('data-estado', 'inactivo');
    badge.className = 'badge badge-inactivo';
    badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstadoTerminal(this, 'inactivo')");
    btn.title = 'Activar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      </svg>`;
    mostrarToast('El registro se inactivó con éxito');
  } else {
    fila.setAttribute('data-estado', 'activo');
    badge.className = 'badge badge-activo';
    badge.innerHTML = '<span class="badge-dot"></span>Activo';
    btn.className = 'btn-accion btn-inactivar';
    btn.setAttribute('onclick', "cambiarEstadoTerminal(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
    mostrarToast('El registro se activó con éxito');
  }

  terminalGuardarStorage();
}

function renumerarTerminales() {
  let n = 1;
  document.querySelectorAll('#terminalesTbody tr').forEach(fila => {
    if (fila.style.display !== 'none') fila.cells[0].textContent = n++;
  });
}

function filtrarTerminales() {
  const texto = document.getElementById('searchTerminal').value.toLowerCase();
  const puerto = document.getElementById('filterPuertoTerminal').value;
  const estado = document.getElementById('filterEstadoTerminal').value;

  document.querySelectorAll('#terminalesTbody tr').forEach(fila => {
    const nombre = fila.cells[1].textContent.toLowerCase();
    const coincideTexto = nombre.includes(texto);
    const coincidePuerto = !puerto || fila.getAttribute('data-puerto') === puerto;
    const coincideEstado = estado === 'todos' || fila.getAttribute('data-estado') === estado;
    fila.style.display = coincideTexto && coincidePuerto && coincideEstado ? '' : 'none';
  });

  renumerarTerminales();
}

function limpiarFiltrosTerminal() {
  document.getElementById('searchTerminal').value = '';
  document.getElementById('filterPuertoTerminal').value = '';
  document.getElementById('filterEstadoTerminal').value = 'todos';
  filtrarTerminales();
}

document.addEventListener('DOMContentLoaded', () => {
  terminalCargarFilas();
  terminalPoblarSelectPuertos(document.getElementById('filterPuertoTerminal'));
  filtrarTerminales();
});
