// =================================================
// ROLES.JS
// =================================================

function abrirModalNuevo() {
  abrirModal('modalNuevo');
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

// Cambiar estado Activo <-> Inactivo
function cambiarEstado(btn, estadoActual) {
  const fila  = btn.closest('tr');
  const badge = fila.querySelector('.badge');

  if (estadoActual === 'activo') {
    // Pasar a inactivo
    fila.setAttribute('data-estado', 'inactivo');
    badge.className = 'badge badge-inactivo';
    badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstado(this, 'inactivo')");
    btn.title = 'Activar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
      Activar`;
  } else {
    // Pasar a activo
    fila.setAttribute('data-estado', 'activo');
    badge.className = 'badge badge-activo';
    badge.innerHTML = '<span class="badge-dot"></span>Activo';
    btn.className = 'btn-accion btn-inactivar';
    btn.setAttribute('onclick', "cambiarEstado(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
      </svg>
      Inactivar`;
  }
}
