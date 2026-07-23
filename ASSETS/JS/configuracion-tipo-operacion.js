// =================================================
// CONFIGURACION-TIPO-OPERACION.JS
// =================================================

let tipoOperacionEditandoFila = null;

// ---------- MODAL CONFIGURACIÓN POR TIPO DE OPERACIÓN (Nuevo / Editar) ----------
function abrirModalNuevaTipoOperacion() {
  tipoOperacionEditandoFila = null;
  limpiarErroresModal('modalTipoOperacion');
  document.getElementById('modalTipoOperacionTitulo').textContent = 'Nueva Configuración';
  document.getElementById('tipoOperacionNombreInput').value = '';
  document.getElementById('tipoOperacionEstadoToggle').checked = true;
  actualizarTextoEstadoTipoOperacion();
  document.querySelectorAll('#tipoOperacionCamposGrid input[type="checkbox"]').forEach(chk => chk.checked = false);

  document.getElementById('tipoOperacionEstadoGroup').style.display = 'none';
  document.getElementById('tipoOperacionFormGrid').style.gridTemplateColumns = '1fr';

  abrirModal('modalTipoOperacion');
}

function abrirModalEditarTipoOperacion(btn) {
  const fila = btn.closest('tr');
  tipoOperacionEditandoFila = fila;
  limpiarErroresModal('modalTipoOperacion');
  document.getElementById('modalTipoOperacionTitulo').textContent = 'Editar Configuración';

  document.getElementById('tipoOperacionNombreInput').value = fila.cells[1].textContent.trim();
  document.getElementById('tipoOperacionEstadoToggle').checked = fila.getAttribute('data-estado') === 'activo';
  actualizarTextoEstadoTipoOperacion();

  const campos = (fila.dataset.campos || '').split(',').filter(Boolean);
  document.querySelectorAll('#tipoOperacionCamposGrid input[type="checkbox"]').forEach(chk => {
    chk.checked = campos.includes(chk.value);
  });

  document.getElementById('tipoOperacionEstadoGroup').style.display = '';
  document.getElementById('tipoOperacionFormGrid').style.gridTemplateColumns = '';

  abrirModal('modalTipoOperacion');
}

function actualizarTextoEstadoTipoOperacion() {
  const toggle = document.getElementById('tipoOperacionEstadoToggle');
  const texto = document.getElementById('tipoOperacionEstadoTexto');
  texto.textContent = toggle.checked ? 'Activo' : 'Inactivo';
}

function grabarTipoOperacion() {
  const nombreInput = document.getElementById('tipoOperacionNombreInput');
  const estadoToggle = document.getElementById('tipoOperacionEstadoToggle');

  limpiarErroresModal('modalTipoOperacion');

  if (!nombreInput.value.trim()) {
    mostrarErrorCampo(nombreInput, 'Campo obligatorio');
    nombreInput.focus();
    return;
  }

  const nombre = nombreInput.value.trim();
  const estado = estadoToggle.checked ? 'activo' : 'inactivo';
  const camposSeleccionados = [...document.querySelectorAll('#tipoOperacionCamposGrid input:checked')].map(c => c.value);
  const camposTexto = camposSeleccionados.join(', ');

  if (tipoOperacionEditandoFila) {
    const fila = tipoOperacionEditandoFila;
    fila.cells[1].textContent = nombre;
    fila.cells[2].textContent = camposTexto;
    fila.dataset.campos = camposSeleccionados.join(',');
    fila.setAttribute('data-estado', estado);
    const badge = fila.querySelector('.badge');
    badge.className = `badge badge-${estado}`;
    badge.innerHTML = `<span class="badge-dot"></span>${estado === 'activo' ? 'Activo' : 'Inactivo'}`;
    const btnAccion = fila.querySelector('.btn-accion:not(.btn-editar)');
    aplicarBotonEstadoTipoOperacion(btnAccion, estado);
    cerrarModal('modalTipoOperacion');
    mostrarModalGuardado('editar', null, () => resaltarFilaNueva(fila));
  } else {
    const tbody = document.getElementById('tiposOperacionTbody');
    const fila = document.createElement('tr');
    fila.setAttribute('data-estado', estado);
    fila.dataset.campos = camposSeleccionados.join(',');
    fila.innerHTML = `
      <td></td>
      <td class="razon-col"></td>
      <td></td>
      <td><span class="badge badge-${estado}"><span class="badge-dot"></span>${estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
      <td class="opciones">
        <button class="btn-accion btn-editar" title="Editar" onclick="abrirModalEditarTipoOperacion(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
        <button class="btn-accion" title="Inactivar" onclick="cambiarEstadoTipoOperacion(this, 'activo')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>`;
    fila.cells[1].textContent = nombre;
    fila.cells[2].textContent = camposTexto;
    const btnAccion = fila.querySelector('.btn-accion:not(.btn-editar)');
    aplicarBotonEstadoTipoOperacion(btnAccion, estado);
    tbody.prepend(fila);
    renumerarTiposOperacion();
    cerrarModal('modalTipoOperacion');
    mostrarModalGuardado('crear', null, () => resaltarFilaNueva(fila));
  }
}

function aplicarBotonEstadoTipoOperacion(btn, estado) {
  if (estado === 'activo') {
    btn.className = 'btn-accion btn-inactivar';
    btn.setAttribute('onclick', "cambiarEstadoTipoOperacion(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
  } else {
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstadoTipoOperacion(this, 'inactivo')");
    btn.title = 'Activar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      </svg>`;
  }
}

function cambiarEstadoTipoOperacion(btn, estadoActual) {
  if (estadoActual === 'activo') {
    confirmarAccion('¿Está seguro de inactivar este registro?', () => ejecutarCambioEstadoTipoOperacion(btn, estadoActual));
  } else {
    ejecutarCambioEstadoTipoOperacion(btn, estadoActual);
  }
}

function ejecutarCambioEstadoTipoOperacion(btn, estadoActual) {
  const fila = btn.closest('tr');
  const badge = fila.querySelector('.badge');
  const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';

  fila.setAttribute('data-estado', nuevoEstado);
  badge.className = `badge badge-${nuevoEstado}`;
  badge.innerHTML = `<span class="badge-dot"></span>${nuevoEstado === 'activo' ? 'Activo' : 'Inactivo'}`;
  aplicarBotonEstadoTipoOperacion(btn, nuevoEstado);

  mostrarToast(nuevoEstado === 'activo' ? 'La configuración se activó con éxito' : 'La configuración se inactivó con éxito');
}

function filtrarTiposOperacion() {
  const texto = document.getElementById('searchTipoOperacion').value.toLowerCase();
  const estado = document.getElementById('filterEstadoTipoOperacion').value;
  const filas = document.querySelectorAll('#tiposOperacionTbody tr');

  filas.forEach(fila => {
    const nombre = fila.cells[1].textContent.toLowerCase();
    const campos = fila.cells[2].textContent.toLowerCase();
    const estadoFila = fila.getAttribute('data-estado');
    const coincideTexto = nombre.includes(texto) || campos.includes(texto);
    const coincideEstado = estado === 'todos' || estadoFila === estado;

    fila.style.display = coincideTexto && coincideEstado ? '' : 'none';
  });

  renumerarTiposOperacion();
}

function limpiarFiltrosTipoOperacion() {
  document.getElementById('searchTipoOperacion').value = '';
  document.getElementById('filterEstadoTipoOperacion').value = 'todos';
  filtrarTiposOperacion();
}

function renumerarTiposOperacion() {
  let n = 1;
  document.querySelectorAll('#tiposOperacionTbody tr').forEach(fila => {
    if (fila.style.display !== 'none') {
      fila.cells[0].textContent = n++;
    }
  });
}

// Listener para el toggle de estado en el modal de Configuración por Tipo de Operación
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'tipoOperacionEstadoToggle') {
    actualizarTextoEstadoTipoOperacion();
  }
});
