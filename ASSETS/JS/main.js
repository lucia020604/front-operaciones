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
// CONFIRMACIÓN DE ACCIONES QUE PIDEN UN COMENTARIO (ej. cancelar o marcar
// Reportado una operación): variante de confirmarAccion con un campo de
// comentario arriba del mensaje de la acción — onConfirmar recibe el
// comentario como único argumento ('' si se dejó vacío y era opcional).
// obligatorio=false permite confirmar sin escribir nada (ver toggleReportadoOp,
// donde el comentario es un "por qué" opcional y no un requisito).
// =================================================
function confirmarAccionConComentario(mensaje, onConfirmar, obligatorio = true) {
  let modal = document.getElementById('modalConfirmarAccionComentario');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalConfirmarAccionComentario';
    modal.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Confirmación</h2>
          <button class="modal-close" onclick="cerrarModal('modalConfirmarAccionComentario')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group-modal">
            <label class="modal-label">Comentario <span class="req" id="confirmarAccionComentarioReq">*</span><span id="confirmarAccionComentarioOpcional" style="display:none">(opcional)</span></label>
            <textarea class="modal-input" id="confirmarAccionComentarioInput" rows="3" placeholder="Motivo u observación..."></textarea>
          </div>
          <div class="confirmar-aviso-info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <p id="confirmarAccionComentarioMensaje"></p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" onclick="cerrarModal('modalConfirmarAccionComentario')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Cancelar
          </button>
          <button class="btn-guardar" id="confirmarAccionComentarioBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            Aceptar
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  document.getElementById('confirmarAccionComentarioMensaje').textContent = mensaje;
  document.getElementById('confirmarAccionComentarioReq').style.display = obligatorio ? '' : 'none';
  document.getElementById('confirmarAccionComentarioOpcional').style.display = obligatorio ? 'none' : '';
  const input = document.getElementById('confirmarAccionComentarioInput');
  input.value = '';
  input.classList.remove('input-error');

  // Reemplaza el botón para no acumular listeners de confirmaciones anteriores
  const btnConfirmar = document.getElementById('confirmarAccionComentarioBtn');
  const btnNuevo = btnConfirmar.cloneNode(true);
  btnConfirmar.replaceWith(btnNuevo);
  btnNuevo.addEventListener('click', () => {
    const comentario = input.value.trim();
    if (obligatorio && !comentario) {
      input.classList.add('input-error');
      input.focus();
      mostrarToast('Escribe un comentario para continuar.');
      return;
    }
    cerrarModal('modalConfirmarAccionComentario');
    onConfirmar(comentario);
  });

  abrirModal('modalConfirmarAccionComentario');
  setTimeout(() => input.focus(), 50);
}

// =================================================
// CAMBIAR MI CONTRASEÑA (disponible para cualquier usuario autenticado,
// desde el menú del avatar en el topbar)
// =================================================
function abrirModalCambiarMiPassword() {
  let modal = document.getElementById('modalCambiarMiPassword');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalCambiarMiPassword';
    modal.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Cambiar contraseña</h2>
          <button class="modal-close" onclick="cerrarModal('modalCambiarMiPassword')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group-modal">
            <label class="modal-label">Contraseña actual <span class="req">*</span></label>
            <div class="input-wrap-pass">
              <input type="password" class="modal-input" id="miPassActual" placeholder="••••••••">
              <button type="button" class="toggle-pass-modal" onclick="togglePasswordVisibility('miPassActual','miPassActualIcon')">
                <svg id="miPassActualIcon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-group-modal">
            <label class="modal-label">
              Nueva contraseña <span class="req">*</span>
              <span class="info-icon" tabindex="0" aria-label="Políticas de contraseña" data-tooltip="La contraseña debe cumplir:&#10;• Mínimo 8 caracteres&#10;• Al menos una mayúscula&#10;• Al menos un número&#10;• Al menos un carácter especial">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </span>
            </label>
            <div class="input-wrap-pass">
              <input type="password" class="modal-input" id="miPassNueva" placeholder="••••••••" oninput="medirFuerza('miPassNueva','miPassNuevaFuerza')">
              <button type="button" class="toggle-pass-modal" onclick="togglePasswordVisibility('miPassNueva','miPassNuevaIcon')">
                <svg id="miPassNuevaIcon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <div class="fuerza-pass" id="miPassNuevaFuerza">
              <div class="fuerza-barra"><span></span></div>
              <span class="fuerza-texto"></span>
            </div>
          </div>
          <div class="form-group-modal">
            <label class="modal-label">Confirmar nueva contraseña <span class="req">*</span></label>
            <div class="input-wrap-pass">
              <input type="password" class="modal-input" id="miPassConfirmar" placeholder="••••••••">
              <button type="button" class="toggle-pass-modal" onclick="togglePasswordVisibility('miPassConfirmar','miPassConfirmarIcon')">
                <svg id="miPassConfirmarIcon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" onclick="cerrarModal('modalCambiarMiPassword')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Cancelar
          </button>
          <button class="btn-guardar" id="miPassGuardarBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            Guardar
          </button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  ['miPassActual', 'miPassNueva', 'miPassConfirmar'].forEach(id => {
    const input = document.getElementById(id);
    input.type = 'password';
    input.value = '';
    limpiarErrorCampo(input);
  });
  const fuerza = document.getElementById('miPassNuevaFuerza');
  fuerza.classList.remove('f-debil', 'f-media', 'f-fuerte');
  fuerza.querySelector('.fuerza-texto').textContent = '';

  // Reemplaza el botón para no acumular listeners de aperturas anteriores
  const btnGuardar = document.getElementById('miPassGuardarBtn');
  const btnNuevo = btnGuardar.cloneNode(true);
  btnGuardar.replaceWith(btnNuevo);
  btnNuevo.addEventListener('click', confirmarCambiarMiPassword);

  abrirModal('modalCambiarMiPassword');
}

function confirmarCambiarMiPassword() {
  const sesion = obtenerUsuarioActual();
  if (!sesion) return;
  const usuario = obtenerUsuarioPorNombre(sesion.usuario);

  const actualInput = document.getElementById('miPassActual');
  const nuevaInput = document.getElementById('miPassNueva');
  const confirmarInput = document.getElementById('miPassConfirmar');

  limpiarErroresModal('modalCambiarMiPassword');

  if (!actualInput.value) {
    mostrarErrorCampo(actualInput, 'Ingresa tu contraseña actual');
    actualInput.focus();
    return;
  }
  if (actualInput.value !== usuario.password) {
    mostrarErrorCampo(actualInput, 'La contraseña actual no es correcta');
    actualInput.focus();
    return;
  }

  if (!nuevaInput.value) {
    mostrarErrorCampo(nuevaInput, 'Ingresa tu nueva contraseña');
    nuevaInput.focus();
    return;
  }

  const cumplePolitica = nuevaInput.value.length >= 8
    && /[A-Z]/.test(nuevaInput.value)
    && /[0-9]/.test(nuevaInput.value)
    && /[^A-Za-z0-9]/.test(nuevaInput.value);

  if (!cumplePolitica) {
    mostrarErrorCampo(nuevaInput, 'Debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial');
    nuevaInput.focus();
    return;
  }
  if (nuevaInput.value === actualInput.value) {
    mostrarErrorCampo(nuevaInput, 'La nueva contraseña debe ser distinta a la actual');
    nuevaInput.focus();
    return;
  }

  if (!confirmarInput.value) {
    mostrarErrorCampo(confirmarInput, 'Confirma tu nueva contraseña');
    confirmarInput.focus();
    return;
  }
  if (confirmarInput.value !== nuevaInput.value) {
    mostrarErrorCampo(confirmarInput, 'Las contraseñas no coinciden');
    confirmarInput.focus();
    return;
  }

  usuario.password = nuevaInput.value;
  registrarCambioPassword(usuario, `${usuario.nombre} ${usuario.apellido}`);
  guardarSesionUsuario(usuario);
  cerrarModal('modalCambiarMiPassword');
  mostrarToast('Tu contraseña fue actualizada correctamente.');
}

// =================================================
// CONFIRMACIÓN DE GUARDADO (crear/editar un registro principal)
// =================================================
function mostrarModalGuardado(modo, notaExtra, onCerrar) {
  let modal = document.getElementById('modalGuardadoExito');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalGuardadoExito';
    modal.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title" id="modalGuardadoExitoTitulo"></h2>
          <button class="modal-close" id="modalGuardadoExitoClose">
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
          <button class="btn-guardar" id="modalGuardadoExitoBtn">Aceptar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  document.getElementById('modalGuardadoExitoTitulo').textContent =
    modo === 'editar' ? 'Registro actualizado' : 'Operación exitosa';
  const mensajeBase = modo === 'editar' ? 'Se modificó exitosamente.' : 'Se agregó exitosamente.';
  document.getElementById('modalGuardadoExitoMensaje').textContent =
    notaExtra ? `${mensajeBase} ${notaExtra}` : mensajeBase;

  // Clona ambos botones de cierre para no acumular listeners de llamadas anteriores
  const cerrarYNotificar = () => {
    cerrarModal('modalGuardadoExito');
    if (typeof onCerrar === 'function') onCerrar();
  };
  ['modalGuardadoExitoBtn', 'modalGuardadoExitoClose'].forEach(id => {
    const viejo = document.getElementById(id);
    const nuevo = viejo.cloneNode(true);
    viejo.replaceWith(nuevo);
    nuevo.addEventListener('click', cerrarYNotificar);
  });

  abrirModal('modalGuardadoExito');
}

// Resalta brevemente una fila recién creada/editada en una grilla general.
function resaltarFilaNueva(fila) {
  if (!fila || !fila.isConnected) return;
  fila.classList.remove('fila-resaltada');
  void fila.offsetWidth; // fuerza reflow para poder reiniciar la animación
  fila.classList.add('fila-resaltada');
  const limpiar = () => fila.classList.remove('fila-resaltada');
  fila.addEventListener('animationend', limpiar, { once: true });
  setTimeout(limpiar, 1000);
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
