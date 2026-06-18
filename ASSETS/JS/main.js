// =================================================
// SIDEBAR TOGGLE
// =================================================
const toggleBtn = document.getElementById('toggleSidebar');
const sidebar   = document.getElementById('sidebar');

if (toggleBtn && sidebar) {
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
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
