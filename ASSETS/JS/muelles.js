// =================================================
// MUELLES.JS
// Mantenedor de Muelles, relacionados a un Terminal (Terminales).
// =================================================

let muelleEditandoFila = null;

function muelleGuardarStorage() {
  const filas = document.querySelectorAll('#muellesTbody tr');
  const lista = [...filas].map((fila, i) => ({
    id: i + 1,
    nombre: fila.cells[1].textContent.trim(),
    terminal: fila.getAttribute('data-terminal'),
    descripcion: fila.cells[3].textContent.trim(),
    estado: fila.getAttribute('data-estado')
  }));
  tgGuardarCatalogo('muellesData', lista);
}

function crearFilaMuelle(nombre, terminal, descripcion, estado) {
  const fila = document.createElement('tr');
  fila.setAttribute('data-terminal', terminal);
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
      <button class="btn-accion btn-editar" title="Editar registro" onclick="abrirModalEditarMuelle(this)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion ${estado === 'activo' ? 'btn-inactivar' : 'btn-activar'}" title="${estado === 'activo' ? 'Inactivar' : 'Activar'}" onclick="cambiarEstadoMuelle(this, '${estado}')">
        ${estado === 'activo'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>'}
      </button>
    </td>`;
  fila.cells[1].textContent = nombre;
  fila.cells[2].textContent = terminal;
  fila.cells[3].textContent = descripcion;
  return fila;
}

function muelleCargarFilas() {
  const tbody = document.getElementById('muellesTbody');
  const lista = tgCargarCatalogo('muellesData', MUELLE_DEMO);
  tbody.innerHTML = '';
  lista.forEach(m => tbody.appendChild(crearFilaMuelle(m.nombre, m.terminal, m.descripcion, m.estado)));
}

// Puebla un <select> de Terminales con los terminales activos; si se pasa
// valorActual y no está entre los activos (terminal inactivado luego de
// crear el muelle), igual se agrega para no dejar el campo en blanco.
function muellePoblarSelectTerminales(select, valorActual) {
  const activos = typeof cargarTerminalesPuerto === 'function' ? cargarTerminalesPuerto().map(t => t.nombre) : [];
  const nombres = valorActual && !activos.includes(valorActual) ? [valorActual, ...activos] : activos;
  const actual = select.value;
  select.innerHTML = select.id === 'filterTerminalMuelle'
    ? '<option value="">Todos</option>'
    : '<option value="">--Seleccione terminal--</option>';
  nombres.forEach(n => select.appendChild(new Option(n, n)));
  if (valorActual !== undefined) select.value = valorActual;
  else if (nombres.includes(actual)) select.value = actual;
}

function abrirModalNuevoMuelle() {
  muelleEditandoFila = null;
  limpiarErroresModal('modalMuelle');
  document.getElementById('modalMuelleTitulo').textContent = 'Nuevo Muelle';
  document.getElementById('muelleNombreInput').value = '';
  muellePoblarSelectTerminales(document.getElementById('muelleTerminalInput'), '');
  document.getElementById('muelleDescripcionInput').value = '';
  abrirModal('modalMuelle');
}

function abrirModalEditarMuelle(btn) {
  const fila = btn.closest('tr');
  muelleEditandoFila = fila;
  limpiarErroresModal('modalMuelle');
  document.getElementById('modalMuelleTitulo').textContent = 'Editar Muelle';
  document.getElementById('muelleNombreInput').value = fila.cells[1].textContent.trim();
  muellePoblarSelectTerminales(document.getElementById('muelleTerminalInput'), fila.getAttribute('data-terminal'));
  document.getElementById('muelleDescripcionInput').value = fila.cells[3].textContent.trim();
  abrirModal('modalMuelle');
}

function grabarMuelle() {
  const nombreInput = document.getElementById('muelleNombreInput');
  const terminalInput = document.getElementById('muelleTerminalInput');
  const descripcionInput = document.getElementById('muelleDescripcionInput');

  limpiarErroresModal('modalMuelle');

  let valido = true;
  let primerCampoInvalido = null;
  [nombreInput, terminalInput].forEach(input => {
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

  if (muelleEditandoFila) {
    muelleEditandoFila.setAttribute('data-terminal', terminalInput.value);
    muelleEditandoFila.cells[1].textContent = nombreInput.value.trim();
    muelleEditandoFila.cells[2].textContent = terminalInput.value;
    muelleEditandoFila.cells[3].textContent = descripcionInput.value.trim();
    cerrarModal('modalMuelle');
    muelleGuardarStorage();
    mostrarModalGuardado('editar', null, () => resaltarFilaNueva(muelleEditandoFila));
  } else {
    const tbody = document.getElementById('muellesTbody');
    const fila = crearFilaMuelle(nombreInput.value.trim(), terminalInput.value, descripcionInput.value.trim(), 'activo');
    tbody.prepend(fila);
    cerrarModal('modalMuelle');
    muelleGuardarStorage();
    mostrarModalGuardado('crear', null, () => resaltarFilaNueva(fila));
  }

  filtrarMuelles();
}

function cambiarEstadoMuelle(btn, estadoActual) {
  if (estadoActual === 'activo') {
    confirmarAccion('¿Está seguro de inactivar este registro?', () => ejecutarCambioEstadoMuelle(btn, estadoActual));
  } else {
    ejecutarCambioEstadoMuelle(btn, estadoActual);
  }
}

function ejecutarCambioEstadoMuelle(btn, estadoActual) {
  const fila = btn.closest('tr');
  const badge = fila.querySelector('.badge');

  if (estadoActual === 'activo') {
    fila.setAttribute('data-estado', 'inactivo');
    badge.className = 'badge badge-inactivo';
    badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstadoMuelle(this, 'inactivo')");
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
    btn.setAttribute('onclick', "cambiarEstadoMuelle(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
    mostrarToast('El registro se activó con éxito');
  }

  muelleGuardarStorage();
}

function renumerarMuelles() {
  let n = 1;
  document.querySelectorAll('#muellesTbody tr').forEach(fila => {
    if (fila.style.display !== 'none') fila.cells[0].textContent = n++;
  });
}

function filtrarMuelles() {
  const texto = document.getElementById('searchMuelle').value.toLowerCase();
  const terminal = document.getElementById('filterTerminalMuelle').value;
  const estado = document.getElementById('filterEstadoMuelle').value;

  document.querySelectorAll('#muellesTbody tr').forEach(fila => {
    const nombre = fila.cells[1].textContent.toLowerCase();
    const coincideTexto = nombre.includes(texto);
    const coincideTerminal = !terminal || fila.getAttribute('data-terminal') === terminal;
    const coincideEstado = estado === 'todos' || fila.getAttribute('data-estado') === estado;
    fila.style.display = coincideTexto && coincideTerminal && coincideEstado ? '' : 'none';
  });

  renumerarMuelles();
}

function limpiarFiltrosMuelle() {
  document.getElementById('searchMuelle').value = '';
  document.getElementById('filterTerminalMuelle').value = '';
  document.getElementById('filterEstadoMuelle').value = 'todos';
  filtrarMuelles();
}

document.addEventListener('DOMContentLoaded', () => {
  muelleCargarFilas();
  muellePoblarSelectTerminales(document.getElementById('filterTerminalMuelle'));
  filtrarMuelles();
});
