// =================================================
// SIDEBAR TOGGLE (pinned) — persiste entre páginas
// =================================================
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar   = document.getElementById('sidebar');
const layoutEl  = document.querySelector('.layout');

function aplicarPinned(activo) {
  sidebar.classList.toggle('pinned', activo);
  layoutEl.classList.toggle('pinned', activo);
}

if (toggleBtn && sidebar && layoutEl) {
  // Aplica el estado guardado SIN animación al cargar la página
  sidebar.classList.add('no-transition');
  aplicarPinned(localStorage.getItem('sidebarPinned') === 'true');
  // Reactiva la transición en el siguiente frame para futuros toggles
  requestAnimationFrame(() => {
    sidebar.classList.remove('no-transition');
  });

  toggleBtn.addEventListener('click', () => {
    const nuevoEstado = !sidebar.classList.contains('pinned');
    aplicarPinned(nuevoEstado);
    localStorage.setItem('sidebarPinned', nuevoEstado);
  });
}

// =================================================
// SESIÓN: muestra en la barra superior al usuario que inició sesión
// =================================================
function renderSesionUsuario() {
  if (typeof obtenerUsuarioActual !== 'function') return;
  const sesion = obtenerUsuarioActual();
  if (!sesion) return;

  const avatarEl = document.querySelector('.user-info .avatar');
  const nombreEl = document.querySelector('.user-info .user-name');
  const iniciales = (sesion.nombre.charAt(0) + sesion.apellido.charAt(0)).toUpperCase();

  if (avatarEl) avatarEl.textContent = iniciales;
  if (nombreEl) nombreEl.textContent = `${sesion.nombre} ${sesion.apellido.charAt(0)}.`;
}

document.addEventListener('DOMContentLoaded', renderSesionUsuario);

function cerrarSesion() {
  sessionStorage.removeItem('sesionUsuario');
}

// =================================================
// MENÚ DE USUARIO (desplegable: Configuración / Cerrar sesión)
// =================================================
const userMenu = document.getElementById('userMenu');
const userMenuToggle = document.getElementById('userMenuToggle');

if (userMenu && userMenuToggle) {
  userMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (userMenu.classList.contains('open') && !userMenu.contains(e.target)) {
      userMenu.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') userMenu.classList.remove('open');
  });
}

// =================================================
// MODALES
// =================================================
function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Cerrar al hacer click fuera del modal
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// =================================================
// VALIDACIÓN INLINE DE CAMPOS (global, todos los módulos)
// =================================================
function mostrarErrorCampo(input, mensaje) {
  input.classList.add('input-error');
  let msg = input.nextElementSibling;
  if (!msg || !msg.classList.contains('input-error-msg')) {
    msg = document.createElement('span');
    msg.className = 'input-error-msg';
    input.insertAdjacentElement('afterend', msg);
  }
  msg.textContent = mensaje;
}

function limpiarErrorCampo(input) {
  input.classList.remove('input-error');
  const msg = input.nextElementSibling;
  if (msg && msg.classList.contains('input-error-msg')) msg.remove();
}

function limpiarErroresModal(modalId) {
  document.querySelectorAll(`#${modalId} .input-error`).forEach(limpiarErrorCampo);
}

// Quita el error de un campo apenas el usuario empieza a corregirlo
document.addEventListener('input', (e) => {
  if (e.target.classList && e.target.classList.contains('input-error')) {
    limpiarErrorCampo(e.target);
  }
});

// =================================================
// MOSTRAR/OCULTAR CONTRASEÑA (global, todos los módulos)
// =================================================
function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);

  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

// =================================================
// MEDIDOR DE FUERZA DE CONTRASEÑA (global, todos los módulos)
// =================================================
function medirFuerza(inputId, contenedorId) {
  const valor = document.getElementById(inputId).value;
  const cont  = document.getElementById(contenedorId);
  const texto = cont.querySelector('.fuerza-texto');

  cont.classList.remove('f-debil', 'f-media', 'f-fuerte');

  if (!valor) {
    texto.textContent = '';
    return;
  }

  let puntos = 0;
  if (valor.length >= 8) puntos++;
  if (/[A-Z]/.test(valor)) puntos++;
  if (/[0-9]/.test(valor)) puntos++;
  if (/[^A-Za-z0-9]/.test(valor)) puntos++;

  if (puntos <= 1) {
    cont.classList.add('f-debil');
    texto.textContent = 'Bajo';
  } else if (puntos <= 3) {
    cont.classList.add('f-media');
    texto.textContent = 'Medio';
  } else {
    cont.classList.add('f-fuerte');
    texto.textContent = 'Alto';
  }
}
// =================================================
// CONFIRMACIÓN DE ACCIONES (ej. inactivar un registro)
// =================================================
function confirmarAccion(mensaje, onConfirmar) {
  let modal = document.getElementById('modalConfirmarAccion');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalConfirmarAccion';
    modal.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Confirmar acción</h2>
          <button class="modal-close" onclick="cerrarModal('modalConfirmarAccion')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="success-msg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9A9A9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <p id="confirmarAccionMensaje"></p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" onclick="cerrarModal('modalConfirmarAccion')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Cancelar
          </button>
          <button class="btn-guardar" id="confirmarAccionBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            Confirmar
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  document.getElementById('confirmarAccionMensaje').textContent = mensaje;

  // Reemplaza el botón para no acumular listeners de confirmaciones anteriores
  const btnConfirmar = document.getElementById('confirmarAccionBtn');
  const btnNuevo = btnConfirmar.cloneNode(true);
  btnConfirmar.replaceWith(btnNuevo);
  btnNuevo.addEventListener('click', () => {
    cerrarModal('modalConfirmarAccion');
    onConfirmar();
  });

  abrirModal('modalConfirmarAccion');
}

// =================================================
// CONFIRMACIÓN DE GUARDADO (crear/editar un registro principal)
// =================================================
function mostrarModalGuardado(modo, notaExtra) {
  let modal = document.getElementById('modalGuardadoExito');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalGuardadoExito';
    modal.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title" id="modalGuardadoExitoTitulo"></h2>
          <button class="modal-close" onclick="cerrarModal('modalGuardadoExito')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="success-msg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
            <p id="modalGuardadoExitoMensaje"></p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-guardar" onclick="cerrarModal('modalGuardadoExito')">Aceptar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  document.getElementById('modalGuardadoExitoTitulo').textContent =
    modo === 'editar' ? 'Registro modificado' : 'Registro agregado';
  const mensajeBase = modo === 'editar' ? 'Se modificó exitosamente.' : 'Se agregó exitosamente.';
  document.getElementById('modalGuardadoExitoMensaje').textContent =
    notaExtra ? `${mensajeBase} ${notaExtra}` : mensajeBase;

  abrirModal('modalGuardadoExito');
}

function mostrarToast(mensaje) {
  let cont = document.querySelector('.toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.className = 'toast-container';
    document.body.appendChild(cont);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>
    </svg>
    <span>${mensaje}</span>`;

  cont.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}
