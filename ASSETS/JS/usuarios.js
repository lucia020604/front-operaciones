// =================================================
// USUARIOS.JS
// =================================================

function abrirModalNuevoUsuario() {
  abrirModal('modalNuevoUsuario');
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
