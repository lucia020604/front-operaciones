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
    texto.textContent = 'Débil';
  } else if (puntos <= 3) {
    cont.classList.add('f-media');
    texto.textContent = 'Media';
  } else {
    cont.classList.add('f-fuerte');
    texto.textContent = 'Fuerte';
  }
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
