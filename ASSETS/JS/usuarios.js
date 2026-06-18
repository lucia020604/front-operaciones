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
}
