// =================================================
// TABLAS-GENERALES.JS
// =================================================

let tablaEditandoFila = null;

function abrirModalNuevaTabla() {
  tablaEditandoFila = null;
  limpiarErroresModal('modalTabla');
  document.getElementById('modalTablaTitulo').textContent = 'Nueva Tabla General';
  document.getElementById('tablaGeneralInput').value = document.getElementById('filterTablaGeneral').value;
  document.getElementById('tablaNombreInput').value = '';
  document.getElementById('tablaDescripcionInput').value = '';
  abrirModal('modalTabla');
}

function abrirModalEditarTabla(btn) {
  const fila = btn.closest('tr');
  tablaEditandoFila = fila;
  limpiarErroresModal('modalTabla');
  document.getElementById('modalTablaTitulo').textContent = 'Editar Tabla General';
  document.getElementById('tablaGeneralInput').value = fila.getAttribute('data-tabla');
  document.getElementById('tablaNombreInput').value = fila.cells[1].textContent.trim();
  document.getElementById('tablaDescripcionInput').value = fila.cells[2].textContent.trim();
  abrirModal('modalTabla');
}

function grabarTablaGeneral() {
  const tablaInput       = document.getElementById('tablaGeneralInput');
  const nombreInput      = document.getElementById('tablaNombreInput');
  const descripcionInput = document.getElementById('tablaDescripcionInput');

  limpiarErroresModal('modalTabla');

  let valido = true;
  let primerCampoInvalido = null;
  [tablaInput, nombreInput].forEach(input => {
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

  const tablaSeleccionada = tablaInput.value;

  if (tablaEditandoFila) {
    tablaEditandoFila.setAttribute('data-tabla', tablaSeleccionada);
    tablaEditandoFila.cells[1].textContent = nombreInput.value.trim();
    tablaEditandoFila.cells[2].textContent = descripcionInput.value.trim();
    cerrarModal('modalTabla');
    mostrarToast('El registro se editó con éxito');
  } else {
    const tbody = document.getElementById('tablasTbody');
    const fila = document.createElement('tr');
    fila.setAttribute('data-tabla', tablaSeleccionada);
    fila.innerHTML = `
      <td></td>
      <td class="razon-col"></td>
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
    fila.cells[2].textContent = descripcionInput.value.trim();
    tbody.appendChild(fila);
    cerrarModal('modalTabla');
    mostrarToast('El registro se creó con éxito');
  }

  // El registro se incorpora a la tabla seleccionada y se visualiza en la pantalla de consulta
  document.getElementById('filterTablaGeneral').value = tablaSeleccionada;
  document.getElementById('searchTabla').value = '';
  filtrarTablas();
}

function renumerarTablas() {
  let n = 1;
  document.querySelectorAll('#tablasTbody tr').forEach(fila => {
    if (fila.style.display !== 'none') {
      fila.cells[0].textContent = n++;
    }
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

// Muestra solo los registros de la tabla general seleccionada, filtrados por nombre
function filtrarTablas() {
  const tabla = document.getElementById('filterTablaGeneral').value;
  const texto = document.getElementById('searchTabla').value.toLowerCase();
  const filas = document.querySelectorAll('#tablasTbody tr');

  filas.forEach(fila => {
    const nombre        = fila.cells[1].textContent.toLowerCase();
    const tablaFila      = fila.getAttribute('data-tabla');
    const coincideTabla  = tablaFila === tabla;
    const coincideTexto  = nombre.includes(texto);

    fila.style.display = coincideTabla && coincideTexto ? '' : 'none';
  });

  renumerarTablas();
}

// Limpia el texto buscado, conservando la tabla general seleccionada
function limpiarFiltrosTabla() {
  document.getElementById('searchTabla').value = '';
  filtrarTablas();
}

document.addEventListener('DOMContentLoaded', filtrarTablas);
