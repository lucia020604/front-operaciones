// =================================================
// USUARIOS.JS
// =================================================

function abrirModalNuevoUsuario() {
  limpiarErroresModal('modalNuevoUsuario');
  abrirModal('modalNuevoUsuario');
}

function guardarNuevoUsuario() {
  const usuarioInput  = document.getElementById('nuevoUsuarioInput');
  const nombreInput   = document.getElementById('nuevoNombreInput');
  const apellidoInput = document.getElementById('nuevoApellidoInput');
  const correoInput   = document.getElementById('nuevoCorreoInput');
  const p1Input       = document.getElementById('nuevaPass1');
  const p2Input       = document.getElementById('nuevaPass2');
  const rolesGrid     = document.getElementById('nuevoRolesGrid');

  limpiarErroresModal('modalNuevoUsuario');

  let valido = true;
  let primerCampoInvalido = null;

  [usuarioInput, nombreInput, apellidoInput, correoInput, p1Input, p2Input].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  if (valido && p1Input.value !== p2Input.value) {
    mostrarErrorCampo(p1Input, 'Las contraseñas no coinciden');
    mostrarErrorCampo(p2Input, 'Las contraseñas no coinciden');
    primerCampoInvalido = p1Input;
    valido = false;
  }

  const rolSeleccionado = rolesGrid.querySelector('input[type="checkbox"]:checked');
  if (!rolSeleccionado) {
    mostrarErrorCampo(rolesGrid, 'Selecciona al menos un rol');
    if (!primerCampoInvalido) primerCampoInvalido = rolesGrid.querySelector('input[type="checkbox"]');
    valido = false;
  }

  if (!valido) {
    primerCampoInvalido.focus();
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

// =================================================
// CONFIGURACIÓN DE VENCIMIENTO DE CONTRASEÑA (global, solo Administradores)
// =================================================
const ROL_USUARIO_ACTUAL = 'Administrador'; // TODO: reemplazar por el rol de la sesión autenticada
const CONFIG_PASSWORD_KEY = 'configVencimientoPassword';

document.addEventListener('DOMContentLoaded', () => {
  const btnConfig = document.getElementById('btnConfigPassword');
  if (btnConfig && ROL_USUARIO_ACTUAL === 'Administrador') {
    btnConfig.style.display = '';
  }
});

// Solo permite dígitos enteros positivos en el campo (sin letras, símbolos, negativos ni decimales)
function soloEnteroPositivo(input) {
  input.value = input.value.replace(/[^0-9]/g, '');
}

function obtenerConfigPassword() {
  const guardada = localStorage.getItem(CONFIG_PASSWORD_KEY);
  return guardada ? JSON.parse(guardada) : null;
}

function abrirModalConfigPassword() {
  const config = obtenerConfigPassword();
  document.getElementById('configDiasVigencia').value = config ? config.diasVigencia : '';
  document.getElementById('configDiasAviso').value = config ? config.diasAviso : '';
  abrirModal('modalConfigPassword');
}

function guardarConfigPassword() {
  const vigenciaInput = document.getElementById('configDiasVigencia');
  const avisoInput = document.getElementById('configDiasAviso');
  const diasVigencia = vigenciaInput.value.trim();
  const diasAviso = avisoInput.value.trim();

  if (!diasVigencia || !diasAviso) {
    mostrarToast('Ambos campos son obligatorios');
    return;
  }

  const esEnteroPositivo = (valor) => /^[1-9][0-9]*$/.test(valor);
  if (!esEnteroPositivo(diasVigencia) || !esEnteroPositivo(diasAviso)) {
    mostrarToast('Solo se permiten números enteros positivos');
    return;
  }

  const vigencia = parseInt(diasVigencia, 10);
  const aviso = parseInt(diasAviso, 10);

  if (aviso > vigencia) {
    mostrarToast('El aviso no puede ser mayor que la vigencia de la contraseña');
    return;
  }

  localStorage.setItem(CONFIG_PASSWORD_KEY, JSON.stringify({ diasVigencia: vigencia, diasAviso: aviso }));

  cerrarModal('modalConfigPassword');
  mostrarToast('La configuración de vencimiento de contraseña se guardó con éxito');
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
