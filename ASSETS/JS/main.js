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
// NOTIFICACIONES (campana del topbar) — estándar único para todo el
// sistema: cualquier módulo suma sus avisos con notifAgregar(...) sin
// tocar este archivo ni la campana. Se guardan en localStorage (main.js se
// carga en todas las páginas, así que se ven igual sin importar desde
// dónde se generaron) y quedan ordenadas de más reciente a más antigua.
// Por ahora el único generador activo es el de Operaciones (reporte
// pendiente, ver seguimiento-operaciones.js), pero cualquier otro módulo
// puede sumarse después reutilizando exactamente esta misma API.
// =================================================
const NOTIF_STORAGE_KEY = 'notificacionesSistema';
const NOTIF_MAX_GUARDADAS = 50;

function notifCargarTodas() {
  const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function notifGuardarTodas(lista) {
  localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(lista.slice(0, NOTIF_MAX_GUARDADAS)));
}

// "id" lo arma quien genera la notificación. Para un aviso puntual (ej. un
// evento único) conviene un id por evento — si ya existe uno igual no se
// duplica. Para un aviso "en vivo" que resume un estado que cambia (ej.
// "3 operaciones por vencer") conviene un id fijo por categoría (no por
// día ni por operación) y usar notifUpsertar en vez de este, así se
// actualiza en el lugar en vez de acumular una fila por cada refresco.
// "prioridad" es el estándar visual (icono/color) del panel: 'info' (azul,
// por defecto), 'por_vencer' (amarillo) y 'vencido' (rojo) cubren lo que
// necesita Operaciones hoy; un módulo nuevo puede sumar otro valor propio
// agregando su propio ícono/color en NOTIF_ICONOS sin tocar el resto.
// "items" es opcional: una lista de { titulo, subtitulo, url } — si viene,
// la notificación se comporta como grupal y el click abre un modal con el
// detalle de cada elemento en vez de navegar directo (ver notifAbrirDetalle).
function notifAgregar({ id, tipo, prioridad = 'info', titulo, mensaje, url = '', items = null }) {
  const lista = notifCargarTodas();
  if (lista.some(n => n.id === id)) return false;

  lista.unshift({ id, tipo, prioridad, titulo, mensaje, url, items, creada: new Date().toISOString(), leida: false });
  notifGuardarTodas(lista);
  notifRenderPanel();
  return true;
}

// Crea la notificación si no existe, o la actualiza "en el lugar" (misma
// posición, mismo id) si ya existía — pensado para avisos grupales que se
// recalculan en cada carga de página (ej. "cuántas operaciones vencidas
// hay ahora mismo"). Si el título o el mensaje cambiaron respecto a la
// versión guardada, vuelve a quedar sin leer porque hay información nueva
// que mostrar; si no cambió nada, se deja como estaba (leída o no).
function notifUpsertar({ id, tipo, prioridad = 'info', titulo, mensaje, url = '', items = null }) {
  const lista = notifCargarTodas();
  const existente = lista.find(n => n.id === id);
  if (existente) {
    const cambio = existente.titulo !== titulo || existente.mensaje !== mensaje;
    Object.assign(existente, { tipo, prioridad, titulo, mensaje, url, items, creada: new Date().toISOString() });
    if (cambio) existente.leida = false;
  } else {
    lista.unshift({ id, tipo, prioridad, titulo, mensaje, url, items, creada: new Date().toISOString(), leida: false });
  }
  notifGuardarTodas(lista);
  notifRenderPanel();
}

// Para cuando un aviso grupal deja de aplicar (ej. ya no queda ninguna
// operación vencida) — el generador la retira en vez de dejarla en 0.
function notifEliminar(id) {
  const lista = notifCargarTodas();
  const filtrada = lista.filter(n => n.id !== id);
  if (filtrada.length === lista.length) return;
  notifGuardarTodas(filtrada);
  notifRenderPanel();
}

// Utilidad de limpieza: saca todas las notificaciones de un "tipo" dado —
// pensada para cuando un módulo cambia la forma de sus avisos (ej. de una
// notificación por operación a una agrupada) y necesita retirar el rastro
// de la versión anterior de una sola vez, sin conocer los ids puntuales.
function notifEliminarPorTipo(tipo) {
  const lista = notifCargarTodas();
  const filtrada = lista.filter(n => n.tipo !== tipo);
  if (filtrada.length === lista.length) return;
  notifGuardarTodas(filtrada);
  notifRenderPanel();
}

function notifMarcarLeida(id) {
  const lista = notifCargarTodas();
  const n = lista.find(x => x.id === id);
  if (!n || n.leida) return;
  n.leida = true;
  notifGuardarTodas(lista);
  notifRenderPanel();
}

function notifMarcarTodasLeidas() {
  const lista = notifCargarTodas();
  let cambios = false;
  lista.forEach(n => { if (!n.leida) { n.leida = true; cambios = true; } });
  if (cambios) notifGuardarTodas(lista);
  notifRenderPanel();
}

// Handler único al hacer click en una fila del panel: si trae "items"
// (aviso grupal) abre el modal de detalle con la lista completa; si no,
// se comporta como un aviso puntual de siempre (navega a "url" si tiene).
// En ambos casos queda marcada como leída.
function notifAbrirDetalle(id) {
  const n = notifCargarTodas().find(x => x.id === id);
  if (!n) return;
  notifMarcarLeida(id);

  if (n.items && n.items.length) {
    notifMostrarModalDetalle(n);
    return;
  }
  if (n.url) window.location.href = n.url;
}

function notifMostrarModalDetalle(n) {
  let modal = document.getElementById('modalNotifDetalle');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modalNotifDetalle';
    modal.innerHTML = `
      <div class="modal modal-sm notif-detalle-modal">
        <div class="modal-header notif-detalle-header">
          <div class="notif-detalle-header-izq">
            <div class="notif-detalle-header-icono" id="notifDetalleIcono"></div>
            <div class="notif-detalle-header-texto">
              <h2 class="modal-title" id="notifDetalleTitulo">Detalle</h2>
              <p id="notifDetalleMensaje"></p>
            </div>
          </div>
          <button class="modal-close" onclick="cerrarModal('modalNotifDetalle')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div class="modal-body notif-detalle-body">
          <div class="notif-detalle-lista" id="notifDetalleLista"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" onclick="cerrarModal('modalNotifDetalle')">Cerrar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  const modalCard = modal.querySelector('.notif-detalle-modal');
  modalCard.className = `modal modal-sm notif-detalle-modal notif-detalle-modal-${n.prioridad}`;

  document.getElementById('notifDetalleIcono').innerHTML = NOTIF_ICONOS[n.prioridad] || NOTIF_ICONOS.info;
  document.getElementById('notifDetalleTitulo').textContent = n.titulo;
  document.getElementById('notifDetalleMensaje').textContent = n.mensaje || '';
  document.getElementById('notifDetalleLista').innerHTML = n.items.map(it => `
    <a class="notif-detalle-item" href="${it.url || '#'}">
      <span class="notif-detalle-item-icono">${NOTIF_ICONOS[n.prioridad] || NOTIF_ICONOS.info}</span>
      <div class="notif-detalle-item-texto">
        <strong>${it.titulo}</strong>
        ${it.subtitulo ? `<p>${it.subtitulo}</p>` : ''}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
    </a>
  `).join('');

  abrirModal('modalNotifDetalle');
}

// Descartar es independiente de "leída": saca la notificación de la lista
// sin navegar a ningún lado (por eso stopPropagation, ya que el botón vive
// dentro de la fila clickeable). No pide confirmación porque no borra nada
// más que este aviso puntual — el registro que lo originó (ej. la
// operación) no se toca.
function notifDescartar(id, event) {
  event.stopPropagation();
  const lista = notifCargarTodas().filter(n => n.id !== id);
  notifGuardarTodas(lista);
  notifRenderPanel();
}

function notifTiempoRelativo(iso) {
  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return 'ahora';
  if (minutos < 60) return `hace ${minutos}min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas}h`;
  return `hace ${Math.floor(horas / 24)}d`;
}

const NOTIF_ICONOS = {
  vencido: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  por_vencer: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
};

// 'todas' | 'no_leidas' — la pestaña activa del panel, vive en memoria (no
// hace falta persistirla: cada vez que se abre la campana tiene sentido
// arrancar mostrando todo).
let notifFiltroActual = 'todas';

function notifCambiarFiltro(filtro) {
  notifFiltroActual = filtro;
  notifRenderPanel();
}

function notifRenderPanel() {
  const lista = notifCargarTodas();
  const sinLeer = lista.filter(n => !n.leida).length;

  const badge = document.querySelector('.notif-menu .notif-dot');
  if (badge) {
    badge.textContent = sinLeer > 9 ? '9+' : String(sinLeer);
    badge.style.display = sinLeer ? 'flex' : 'none';
  }

  const contadorHeader = document.getElementById('notifPanelContador');
  if (contadorHeader) contadorHeader.textContent = sinLeer ? `(${sinLeer} sin leer)` : '';

  const btnMarcarTodas = document.getElementById('notifPanelMarcarTodas');
  if (btnMarcarTodas) btnMarcarTodas.style.display = sinLeer ? '' : 'none';

  document.querySelectorAll('.notif-panel-tab').forEach(tab => {
    tab.classList.toggle('activa', tab.dataset.filtro === notifFiltroActual);
  });

  const visibles = notifFiltroActual === 'no_leidas' ? lista.filter(n => !n.leida) : lista;

  const body = document.getElementById('notifPanelBody');
  if (!body) return;

  body.innerHTML = visibles.length
    ? visibles.map(n => `
      <div class="notif-item notif-item-${n.prioridad} ${n.leida ? '' : 'notif-item-sinleer'}" onclick="notifAbrirDetalle('${n.id}')">
        <span class="notif-item-icono">${NOTIF_ICONOS[n.prioridad] || NOTIF_ICONOS.info}</span>
        <div class="notif-item-texto">
          <strong>${n.titulo}</strong>
          <p>${n.mensaje}</p>
          <span class="notif-item-hora">${notifTiempoRelativo(n.creada)}</span>
          ${n.items && n.items.length ? '<span class="notif-item-grupo">Ver detalle</span>' : ''}
        </div>
        ${n.leida ? '' : '<span class="notif-item-punto"></span>'}
        <button type="button" class="notif-item-descartar" title="Descartar" onclick="notifDescartar('${n.id}', event)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    `).join('')
    : `<div class="notif-panel-vacio">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
        <p>${notifFiltroActual === 'no_leidas' ? 'No tienes notificaciones sin leer.' : 'No tienes notificaciones.'}</p>
      </div>`;
}

// La campana (icon-btn con el ícono de campana en topbar-right) ya existe
// igual en el HTML de todas las páginas — acá se le agrega el panel
// desplegable en vivo, envolviéndola en un contenedor propio, en vez de
// tener que editar el topbar de cada módulo por separado.
function inicializarCampanaNotificaciones() {
  const btnCampana = document.querySelector('.topbar-right .icon-btn');
  if (!btnCampana || btnCampana.dataset.notifInit) return;
  btnCampana.dataset.notifInit = '1';

  const contenedor = document.createElement('div');
  contenedor.className = 'notif-menu';
  btnCampana.parentNode.insertBefore(contenedor, btnCampana);
  contenedor.appendChild(btnCampana);

  const panel = document.createElement('div');
  panel.className = 'notif-panel';
  panel.innerHTML = `
    <div class="notif-panel-header">
      <div class="notif-panel-titulo">
        <span>Notificaciones</span>
        <span class="notif-panel-contador" id="notifPanelContador"></span>
      </div>
      <button type="button" id="notifPanelMarcarTodas" onclick="notifMarcarTodasLeidas()">Marcar todas como leídas</button>
    </div>
    <div class="notif-panel-tabs">
      <button type="button" class="notif-panel-tab activa" data-filtro="todas" onclick="notifCambiarFiltro('todas')">Todas</button>
      <button type="button" class="notif-panel-tab" data-filtro="no_leidas" onclick="notifCambiarFiltro('no_leidas')">No leídas</button>
    </div>
    <div class="notif-panel-body" id="notifPanelBody"></div>
  `;
  contenedor.appendChild(panel);

  btnCampana.addEventListener('click', (e) => {
    e.stopPropagation();
    const abriendo = !contenedor.classList.contains('open');
    contenedor.classList.toggle('open');
    if (abriendo) {
      notifFiltroActual = 'todas';
      notifRenderPanel();
    }
  });

  document.addEventListener('click', (e) => {
    if (contenedor.classList.contains('open') && !contenedor.contains(e.target)) {
      contenedor.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') contenedor.classList.remove('open');
  });

  // Mientras el panel está abierto, refresca el "hace Xh" de cada fila cada
  // minuto — sin esto quedaría congelado en el valor calculado al abrir.
  setInterval(() => {
    if (contenedor.classList.contains('open')) notifRenderPanel();
  }, 60000);

  // Si otra pestaña del navegador agrega/marca/descarta una notificación
  // (misma app, otra página abierta), este storage event la sincroniza acá
  // sin necesidad de recargar.
  window.addEventListener('storage', (e) => {
    if (e.key === NOTIF_STORAGE_KEY) notifRenderPanel();
  });

  notifRenderPanel();
}

document.addEventListener('DOMContentLoaded', inicializarCampanaNotificaciones);

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
    // En la app móvil (marco .telefono presente) el modal se acopla al
    // tamaño del dispositivo en vez de cubrir toda la ventana del navegador
    // — ver movil.css .movil-modal-overlay.
    const contenedorMovil = document.querySelector('.telefono');
    modal = document.createElement('div');
    modal.className = contenedorMovil ? 'modal-overlay movil-modal-overlay' : 'modal-overlay';
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
    (contenedorMovil || document.body).appendChild(modal);
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
function confirmarAccionConComentario(mensaje, onConfirmar, obligatorio = true, nota = '') {
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
          <div class="confirmar-aviso-warning" id="confirmarAccionComentarioNotaCont" style="display:none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <p id="confirmarAccionComentarioNota"></p>
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
  document.getElementById('confirmarAccionComentarioNota').textContent = nota;
  document.getElementById('confirmarAccionComentarioNotaCont').style.display = nota ? '' : 'none';
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
    // En la app móvil (marco .telefono presente) el modal se acopla al
    // tamaño del dispositivo en vez de cubrir toda la ventana del navegador
    // — ver movil.css .movil-modal-overlay.
    const contenedorMovil = document.querySelector('.telefono');
    modal = document.createElement('div');
    modal.className = contenedorMovil ? 'modal-overlay movil-modal-overlay' : 'modal-overlay';
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
    (contenedorMovil || document.body).appendChild(modal);
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

  // En la app móvil se confirma con un modal (no con el toast de escritorio,
  // que queda fuera del marco del teléfono).
  if (document.querySelector('.telefono')) {
    mostrarModalPasswordActualizadaMovil();
  } else {
    mostrarToast('Tu contraseña fue actualizada correctamente.');
  }
}

function mostrarModalPasswordActualizadaMovil() {
  mostrarModalConfirmacionMovil('Tu contraseña fue actualizada correctamente.');
}

// =================================================
// CONFIRMACIÓN GENÉRICA EN LA APP MÓVIL — reemplaza el toast de escritorio
// (mostrarToast) para avisos que confirman una acción del colaborador
// (jornada iniciada/finalizada, comentario actualizado, ubicación
// actualizada, contraseña actualizada, etc.): en el teléfono se necesita un
// modal que el usuario cierre a propósito, no un toast flotante que puede
// pasar desapercibido o quedar fuera del marco del dispositivo.
// =================================================
function mostrarModalConfirmacionMovil(mensaje, onCerrar) {
  let modal = document.getElementById('modalConfirmacionMovil');
  if (!modal) {
    const contenedorMovil = document.querySelector('.telefono');
    modal = document.createElement('div');
    modal.className = 'modal-overlay movil-modal-overlay';
    modal.id = 'modalConfirmacionMovil';
    modal.innerHTML = `
      <div class="modal modal-sm">
        <div class="modal-body">
          <div class="success-msg">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></svg>
            <p id="modalConfirmacionMovilMensaje"></p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-guardar" id="modalConfirmacionMovilBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            Aceptar
          </button>
        </div>
      </div>`;
    (contenedorMovil || document.body).appendChild(modal);
  }

  document.getElementById('modalConfirmacionMovilMensaje').textContent = mensaje;

  // Reemplaza el botón para no acumular listeners de llamadas anteriores
  const btnViejo = document.getElementById('modalConfirmacionMovilBtn');
  const btnNuevo = btnViejo.cloneNode(true);
  btnViejo.replaceWith(btnNuevo);
  btnNuevo.addEventListener('click', () => {
    cerrarModal('modalConfirmacionMovil');
    if (typeof onCerrar === 'function') onCerrar();
  });

  abrirModal('modalConfirmacionMovil');
}

// =================================================
// CONFIRMACIÓN DE GUARDADO (crear/editar un registro principal)
// =================================================
function mostrarModalGuardado(modo, notaExtra, onCerrar) {
  let modal = document.getElementById('modalGuardadoExito');
  if (!modal) {
    // En la app móvil (marco .telefono presente) el modal se acopla al
    // tamaño del dispositivo en vez de cubrir toda la ventana del navegador
    // — ver movil.css .movil-modal-overlay.
    const contenedorMovil = document.querySelector('.telefono');
    modal = document.createElement('div');
    modal.className = contenedorMovil ? 'modal-overlay movil-modal-overlay' : 'modal-overlay';
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
    (contenedorMovil || document.body).appendChild(modal);
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
