// =================================================
// TABLAS-GENERALES.JS
// =================================================

let tablaEditandoFila = null;

function abrirModalNuevaTabla() {
  tablaEditandoFila = null;
  limpiarErroresModal('modalTabla');
  document.getElementById('modalTablaTitulo').textContent = 'Nuevo Registro';
  document.getElementById('tablaNombreInput').value = '';
  document.getElementById('tablaCategoriaInput').value = '';
  document.getElementById('tablaDescripcionInput').value = '';
  abrirModal('modalTabla');
}

function abrirModalEditarTabla(btn) {
  const fila = btn.closest('tr');
  tablaEditandoFila = fila;
  limpiarErroresModal('modalTabla');
  document.getElementById('modalTablaTitulo').textContent = 'Editar Registro';
  document.getElementById('tablaNombreInput').value = fila.cells[1].textContent.trim();
  document.getElementById('tablaCategoriaInput').value = fila.cells[2].textContent.trim();
  document.getElementById('tablaDescripcionInput').value = fila.cells[3].textContent.trim();
  abrirModal('modalTabla');
}

function guardarTabla() {
  const nombreInput = document.getElementById('tablaNombreInput');
  const categoriaInput = document.getElementById('tablaCategoriaInput');
  const descripcionInput = document.getElementById('tablaDescripcionInput');

  limpiarErroresModal('modalTabla');

  let valido = true;
  let primerCampoInvalido = null;
  [nombreInput, categoriaInput].forEach(input => {
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

  if (tablaEditandoFila) {
    tablaEditandoFila.cells[1].textContent = nombreInput.value.trim();
    tablaEditandoFila.cells[2].textContent = categoriaInput.value;
    tablaEditandoFila.cells[3].textContent = descripcionInput.value.trim();
    cerrarModal('modalTabla');
    mostrarToast('El registro se editó con éxito');
  } else {
    const tbody = document.getElementById('tablasTbody');
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td></td>
      <td class="razon-col"></td>
      <td></td>
      <td></td>
      <td>
        <label class="switch-wrap switch-table">
          <input type="checkbox" checked onchange="toggleEstadoTabla(this)">
          <span class="switch-track"></span>
        </label>
      </td>
      <td class="opciones">
        <button class="btn-accion btn-editar" title="Editar registro" onclick="abrirModalEditarTabla(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
        <button class="btn-accion btn-eliminar" title="Eliminar registro" onclick="eliminarTabla(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </td>`;
    fila.cells[1].textContent = nombreInput.value.trim();
    fila.cells[2].textContent = categoriaInput.value;
    fila.cells[3].textContent = descripcionInput.value.trim();
    tbody.appendChild(fila);
    renumerarTablas();
    cerrarModal('modalTabla');
    mostrarToast('El registro se creó con éxito');
  }
}

function renumerarTablas() {
  document.querySelectorAll('#tablasTbody tr').forEach((fila, i) => {
    fila.cells[0].textContent = i + 1;
  });
}

function eliminarTabla(btn) {
  btn.closest('tr').remove();
  renumerarTablas();
  mostrarToast('El registro se eliminó con éxito');
}

function toggleEstadoTabla(checkbox) {
  mostrarToast(checkbox.checked ? 'El registro se activó con éxito' : 'El registro se inactivó con éxito');
}

function limpiarFiltrosTabla() {
  document.getElementById('searchTabla').value = '';
  document.getElementById('filterCategoriaTabla').value = '';
}
