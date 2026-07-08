// =================================================
// ROLES.JS
// =================================================

function actualizarTextoEstadoRol() {
  const toggle = document.getElementById('estadoRolToggle');
  const texto  = document.getElementById('estadoRolTexto');
  texto.textContent = toggle.checked ? 'Activo' : 'Inactivo';
}

// Abre el modal en modo "Nuevo Rol" — Estado fijo en Activo (no editable)
function abrirModalNuevo() {
  limpiarErroresModal('modalNuevo');
  document.getElementById('modalRolTitle').textContent = 'Nuevo Rol';
  document.getElementById('inputNombreRol').value = '';
  document.querySelectorAll('#modalNuevo .chk-permiso').forEach(chk => chk.checked = false);

  document.getElementById('estadoRolBadge').style.display = 'flex';
  document.getElementById('estadoRolSwitch').style.display = 'none';

  document.getElementById('modalNuevo').dataset.modo = 'crear';
  abrirModal('modalNuevo');
}

// Abre el modal en modo "Editar Rol" — Estado editable con switch
function abrirModalEditar(btn) {
  const fila   = btn.closest('tr');
  const nombre = fila.cells[1].textContent.trim();
  const estado = fila.getAttribute('data-estado'); // 'activo' | 'inactivo'

  document.getElementById('modalRolTitle').textContent = 'Editar Rol';
  document.getElementById('inputNombreRol').value = nombre;

  document.getElementById('estadoRolBadge').style.display = 'none';
  document.getElementById('estadoRolSwitch').style.display = 'flex';
  document.getElementById('estadoRolToggle').checked = (estado === 'activo');
  actualizarTextoEstadoRol();

  // Permisos de ejemplo marcados al editar (simulación)
  document.querySelectorAll('#modalNuevo .chk-permiso').forEach((chk, i) => {
    chk.checked = i < 5;
  });

  document.getElementById('modalNuevo').dataset.modo = 'editar';
  document.getElementById('modalNuevo').dataset.filaId = fila.cells[0].textContent.trim();
  abrirModal('modalNuevo');
}

// Guardar (crear o editar según el modo)
function guardarRol() {
  const modal = document.getElementById('modalNuevo');
  const modo  = modal.dataset.modo;
  const nombreInput = document.getElementById('inputNombreRol');

  limpiarErroresModal('modalNuevo');

  if (!nombreInput.value.trim()) {
    mostrarErrorCampo(nombreInput, 'Campo obligatorio');
    nombreInput.focus();
    return;
  }

  if (modo === 'editar' && modal.dataset.filaId) {
    const estado = document.getElementById('estadoRolToggle').checked ? 'activo' : 'inactivo';
    const fila = [...document.querySelectorAll('#tbodyRoles tr')]
      .find(f => f.cells[0].textContent.trim() === modal.dataset.filaId);

    if (fila && fila.getAttribute('data-estado') !== estado) {
      fila.setAttribute('data-estado', estado);
      const badge = fila.querySelector('.badge');
      const btnAccion = fila.querySelector('.btn-activar, .btn-inactivar');

      if (estado === 'inactivo') {
        badge.className = 'badge badge-inactivo';
        badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
        if (btnAccion) {
          btnAccion.className = 'btn-accion btn-activar';
          btnAccion.title = 'Activar';
          btnAccion.setAttribute('onclick', "cambiarEstado(this, 'inactivo')");
        }
      } else {
        badge.className = 'badge badge-activo';
        badge.innerHTML = '<span class="badge-dot"></span>Activo';
        if (btnAccion) {
          btnAccion.className = 'btn-accion btn-inactivar';
          btnAccion.title = 'Inactivar';
          btnAccion.setAttribute('onclick', "cambiarEstado(this, 'activo')");
        }
      }
    }
  }

  cerrarModal('modalNuevo');
  mostrarToast(modo === 'editar' ? 'El rol se editó con éxito' : 'El registro se guardó con éxito');
}

// Filtrar tabla por búsqueda y estado
function filtrarRoles() {
  const texto  = document.getElementById('searchRol').value.toLowerCase();
  const estado = document.getElementById('filterEstado').value;
  const filas  = document.querySelectorAll('#tbodyRoles tr');

  filas.forEach(fila => {
    const nombre     = fila.cells[1].textContent.toLowerCase();
    const estadoFila = fila.getAttribute('data-estado');

    const coincideTexto  = nombre.includes(texto);
    const coincideEstado = estado === 'todos' || estadoFila === estado;

    fila.style.display = coincideTexto && coincideEstado ? '' : 'none';
  });
}

// Limpiar filtros y restaurar tabla a su estado inicial
function limpiarFiltrosRoles() {
  document.getElementById('searchRol').value = '';
  document.getElementById('filterEstado').value = 'todos';
  document.querySelectorAll('#tbodyRoles tr').forEach(fila => {
    fila.style.display = '';
  });
}

// Cambiar estado Activo <-> Inactivo
function cambiarEstado(btn, estadoActual) {
  const fila  = btn.closest('tr');
  const badge = fila.querySelector('.badge');

  if (estadoActual === 'activo') {
    fila.setAttribute('data-estado', 'inactivo');
    badge.className = 'badge badge-inactivo';
    badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstado(this, 'inactivo')");
    btn.title = 'Activar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      </svg>`;
    mostrarToast('El rol se inactivó con éxito');
  } else {
    fila.setAttribute('data-estado', 'activo');
    badge.className = 'badge badge-activo';
    badge.innerHTML = '<span class="badge-dot"></span>Activo';
    btn.className = 'btn-accion btn-inactivar';
    btn.setAttribute('onclick', "cambiarEstado(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
    mostrarToast('El rol se activó con éxito');
  }
}

// Listener del switch de estado en Editar Rol
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'estadoRolToggle') {
    actualizarTextoEstadoRol();
  }
});
