// =================================================
// USUARIOS.JS
// =================================================

function abrirModalNuevoUsuario() {
  abrirModal('modalNuevoUsuario');
}

function guardarNuevoUsuario() {
  const p1 = document.getElementById('nuevaPass1').value;
  const p2 = document.getElementById('nuevaPass2').value;
  const nombreUsuario = document.getElementById('nuevoUsuarioInput').value;

  if (!nombreUsuario) {
    mostrarToast('El campo Usuario es obligatorio');
    return;
  }
  if (!p1 || !p2) {
    mostrarToast('La contraseña es obligatoria');
    return;
  }
  if (p1 !== p2) {
    mostrarToast('Las contraseñas no coinciden');
    return;
  }

  cerrarModal('modalNuevoUsuario');
  mostrarToast('El usuario se creó con éxito');
}

// Abre el modal de edición precargando datos de la fila seleccionada
function abrirModalEditarUsuario(btn) {
  const fila = btn.closest('tr');
  const usuario  = fila.cells[0].textContent.trim();
  const nombre   = fila.cells[1].textContent.trim();
  const email    = fila.cells[2].textContent.trim();
  const estadoActivo = fila.querySelector('.badge').classList.contains('badge-activo');

  document.getElementById('editarUsuarioInput').value = usuario;

  const partes = nombre.split(' ');
  document.getElementById('editarNombresInput').value = partes.slice(0, 1).join(' ');
  document.getElementById('editarApellidosInput').value = partes.slice(1).join(' ');
  document.getElementById('editarCorreoInput').value = email;

  const toggle = document.getElementById('editarEstadoToggle');
  toggle.checked = estadoActivo;
  actualizarTextoEstado();

  document.getElementById('modalEditarUsuario').dataset.filaUsuario = usuario;
  abrirModal('modalEditarUsuario');
}

function actualizarTextoEstado() {
  const toggle = document.getElementById('editarEstadoToggle');
  const texto  = document.getElementById('editarEstadoTexto');
  texto.textContent = toggle.checked ? 'Activo' : 'Inactivo';
}

function guardarEditarUsuario() {
  cerrarModal('modalEditarUsuario');
  mostrarToast('El usuario se editó con éxito');
}

function restablecerPassword() {
  mostrarToast('La contraseña fue restablecida. El usuario será notificado.');
}

function abrirModalPass(usuario) {
  document.getElementById('modalUsuarioLabel').value = usuario;
  abrirModal('modalPass');
}

function guardarPassword() {
  cerrarModal('modalPass');
  abrirModal('modalExito');
  mostrarToast('La contraseña se actualizó con éxito');
}

function limpiarFiltrosUsuarios() {
  document.getElementById('searchUsuario').value = '';
  document.getElementById('filterRol').value = 'Todos los roles';
  document.getElementById('filterEstadoUsuario').value = 'Todos';
  document.getElementById('filterPassUsuario').value = 'Todos';
}

// Listener para el toggle de estado en Editar Usuario
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'editarEstadoToggle') {
    actualizarTextoEstado();
  }
});

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
    mostrarToast('El usuario se inactivó con éxito');
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
    mostrarToast('El usuario se activó con éxito');
  }
}
