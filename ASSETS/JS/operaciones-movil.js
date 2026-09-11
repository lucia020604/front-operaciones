// =================================================
// OPERACIONES-MOVIL.JS
// Módulo Operaciones de la App Móvil. Un operador puede tener más de una
// operación asignada el mismo día, así que se renderiza una tarjeta por
// operación (OPERACIONES_ASIGNADAS_MOVIL_DEMO, en data-movil.js).
//
// Los estados de una operación (ver ESTADOS_OPERACION_MOVIL en data-movil.js)
// son consecutivos, igual que en el sistema — no se puede registrar uno
// fuera de orden. Por eso cada tarjeta no tiene un selector libre de
// "estado a registrar": muestra directamente el SIGUIENTE estado pendiente
// (obtenerSiguienteEstadoPendiente) con un campo rápido del tipo que
// corresponda (fecha/hora, número o texto — no todos los estados son un
// timestamp) y un botón para confirmarlo al instante. Al lado, un segundo
// botón abre "Añadir Hora", el mismo registro pero con comentario (y
// dictado por voz simulado) para un detalle mayor. "Horario" sigue
// disponible para ver la línea de tiempo completa y editar el comentario de
// un estado ya registrado; "Asignar Precinto" es la otra acción propia de
// la operación — todas abren su modal pasando su propio índice, y los
// modales (compartidos, uno solo en el DOM) recuerdan cuál operación está
// activa en indiceOperacionActiva mientras están abiertos.
// "Cerrar sesión" no vive aquí: es una acción de la sesión, no de una
// operación puntual — está en Mi Perfil.
// =================================================

function actualizarHoraStatusBar() {
  const el = document.getElementById('horaStatusBar');
  if (!el) return;
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  el.textContent = `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}
actualizarHoraStatusBar();
setInterval(actualizarHoraStatusBar, 15000);

function inicializarOperacionesMovil() {
  const sesion = obtenerUsuarioActual();
  if (!sesion) { window.location.href = 'login-movil.html'; return; }

  renderJornada();
  renderOperacionesAsignadas();
}

// =================================================
// JORNADA (Comenzar día / Finalizar) — simulación de geolocalización al
// marcar cada evento, ver decisión "Simulado con datos demo".
// =================================================
const JORNADA_ICONOS = {
  pendiente: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  enCurso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v18l15-9Z"/></svg>',
  finalizada: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>'
};

function renderJornada() {
  const sesion = obtenerUsuarioActual();
  const jornada = obtenerJornadaHoy(sesion.usuario);
  const box = document.querySelector('.jornada-box');
  const icono = document.getElementById('jornadaIcono');
  const btn = document.getElementById('btnJornada');
  const estadoTexto = document.getElementById('jornadaEstadoTexto');
  const horaTexto = document.getElementById('jornadaHoraTexto');
  const horaCaption = document.getElementById('jornadaHoraCaption');
  const badge = document.getElementById('jornadaMetaTexto');

  const nOperaciones = OPERACIONES_ASIGNADAS_MOVIL_DEMO.length;
  badge.textContent = nOperaciones
    ? `${nOperaciones} operación${nOperaciones === 1 ? '' : 'es'} hoy`
    : 'Sin operaciones hoy';

  box.classList.remove('en-curso', 'finalizada');

  if (jornada.fin) {
    box.classList.add('finalizada');
    icono.innerHTML = JORNADA_ICONOS.finalizada;
    estadoTexto.textContent = 'Jornada finalizada';
    horaTexto.textContent = jornada.fin;
    horaCaption.textContent = `Inicio ${jornada.inicio} · Fin ${jornada.fin}`;
    btn.textContent = 'Jornada finalizada';
    btn.classList.remove('finalizar');
    btn.disabled = true;
  } else if (jornada.inicio) {
    box.classList.add('en-curso');
    icono.innerHTML = JORNADA_ICONOS.enCurso;
    estadoTexto.textContent = 'Jornada en curso';
    horaTexto.textContent = jornada.inicio;
    horaCaption.textContent = 'Hora de inicio';
    btn.textContent = 'Finalizar';
    btn.classList.add('finalizar');
    btn.disabled = false;
  } else {
    icono.innerHTML = JORNADA_ICONOS.pendiente;
    estadoTexto.textContent = 'Jornada no iniciada';
    horaTexto.textContent = '—';
    horaCaption.textContent = 'Aún no registrada';
    btn.textContent = 'Comenzar día';
    btn.classList.remove('finalizar');
    btn.disabled = false;
  }
}

// =================================================
// REGISTRO DE JORNADA (Comenzar día / Finalizar) — la ubicación (simulada,
// ver decisión "Simulado con datos demo") con fecha y hora actual es
// obligatoria: no se puede confirmar "Iniciar Operación" ni "Finalizar" sin
// ella (btnConfirmarRegistroJornada permanece disabled hasta capturarla).
// =================================================
let registroJornadaModo = null; // 'inicio' | 'fin'
let registroJornadaCaptura = null;

function formatearFechaLarga(fecha) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

function formatearHora12(fecha) {
  let horas = fecha.getHours();
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const sufijo = horas >= 12 ? 'pm' : 'am';
  horas = horas % 12;
  if (horas === 0) horas = 12;
  return `${String(horas).padStart(2, '0')}:${minutos} ${sufijo}`;
}

function abrirModalRegistroJornada() {
  const sesion = obtenerUsuarioActual();
  const jornada = obtenerJornadaHoy(sesion.usuario);
  registroJornadaModo = (jornada.inicio && !jornada.fin) ? 'fin' : 'inicio';
  registroJornadaCaptura = null;
  const esFin = registroJornadaModo === 'fin';

  document.getElementById('registroJornadaSubtitulo').textContent = esFin
    ? 'Registro de Inicio y Finalización de Operación'
    : 'Registro de Inicio de Operación';

  document.getElementById('registroSeccionInicio').style.display = '';
  document.getElementById('registroSeccionFin').style.display = esFin ? '' : 'none';
  document.getElementById('btnConfirmarRegistroJornadaTexto').textContent = esFin ? 'Finalizar' : 'Iniciar Operación';

  if (esFin) {
    // El inicio ya quedó registrado antes: se muestra de solo lectura y solo
    // se captura ahora la ubicación/hora de finalización.
    document.getElementById('registroBoxInicio').classList.remove('activa');
    document.getElementById('registroRefrescarInicio').style.display = 'none';
    document.getElementById('registroUbicacionTextoInicio').textContent = jornada.ubicacionInicio;
    document.getElementById('registroHoraInicio').textContent = jornada.inicio;
    document.getElementById('registroFechaInicio').textContent = jornada.fechaInicio;
    document.getElementById('registroRefrescarFin').style.display = '';
    iniciarCapturaUbicacionRegistro('Fin');
  } else {
    document.getElementById('registroRefrescarInicio').style.display = '';
    iniciarCapturaUbicacionRegistro('Inicio');
  }

  abrirModal('modalRegistroJornada');
}

function iniciarCapturaUbicacionRegistro(sufijo) {
  document.getElementById(`registroBox${sufijo}`).classList.add('activa');
  document.getElementById(`registroUbicacionTexto${sufijo}`).textContent = 'Obteniendo ubicación…';
  document.getElementById(`registroHora${sufijo}`).textContent = '—';
  document.getElementById(`registroFecha${sufijo}`).textContent = '—';

  registroJornadaCaptura = null;
  document.getElementById('btnConfirmarRegistroJornada').disabled = true;

  setTimeout(() => {
    const ahora = new Date();
    const ubicacion = UBICACIONES_DEMO_MOVIL[Math.floor(Math.random() * UBICACIONES_DEMO_MOVIL.length)];
    const pad = n => String(n).padStart(2, '0');

    registroJornadaCaptura = {
      ubicacion,
      horaCorta: `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`,
      horaLarga: formatearHora12(ahora),
      fecha: formatearFechaLarga(ahora)
    };

    document.getElementById(`registroUbicacionTexto${sufijo}`).textContent = ubicacion;
    document.getElementById(`registroHora${sufijo}`).textContent = registroJornadaCaptura.horaLarga;
    document.getElementById(`registroFecha${sufijo}`).textContent = registroJornadaCaptura.fecha;
    document.getElementById('btnConfirmarRegistroJornada').disabled = false;
  }, 700);
}

function confirmarRegistroJornada() {
  if (!registroJornadaCaptura) return;
  const sesion = obtenerUsuarioActual();
  const jornada = obtenerJornadaHoy(sesion.usuario);

  if (registroJornadaModo === 'inicio') {
    jornada.inicio = registroJornadaCaptura.horaCorta;
    jornada.fechaInicio = registroJornadaCaptura.fecha;
    jornada.ubicacionInicio = registroJornadaCaptura.ubicacion;
  } else {
    jornada.fin = registroJornadaCaptura.horaCorta;
    jornada.fechaFin = registroJornadaCaptura.fecha;
    jornada.ubicacionFin = registroJornadaCaptura.ubicacion;
  }

  cerrarModal('modalRegistroJornada');
  renderJornada();
  mostrarModalConfirmacionMovil(registroJornadaModo === 'inicio' ? 'Jornada iniciada correctamente.' : 'Jornada finalizada correctamente.');
}

// =================================================
// OPERACIONES ASIGNADAS (lista) — cada tarjeta trae sus propios datos,
// productos y acciones (Añadir Hora / Horario / Asignar Precinto), todas
// dirigidas a esa operación puntual mediante su índice en el arreglo.
// =================================================

// Recordada mientras un modal de acción está abierto, para saber sobre qué
// operación de la lista está operando (se fija al abrir cada modal).
let indiceOperacionActiva = null;

function renderOperacionesAsignadas() {
  const cont = document.getElementById('operacionesLista');
  const lista = OPERACIONES_ASIGNADAS_MOVIL_DEMO;

  document.getElementById('opListaTitulo').style.display = lista.length ? '' : 'none';

  if (!lista.length) {
    cont.innerHTML = `<div class="movil-card"><p style="font-size:11px;color:var(--gray-500);">No tienes operaciones asignadas por el momento.</p></div>`;
    return;
  }

  const indiceEnProceso = indiceOperacionEnProceso();

  cont.innerHTML = lista.map((op, i) => `
    <div class="movil-card op-card">
      <div class="op-card-header">
        <span class="op-codigo-badge">${op.codigo}</span>
        <span class="op-card-terminal">${op.terminal}</span>
      </div>
      <div class="op-datos-grid">
        <div class="op-dato"><span class="lbl">Cliente</span><span class="val">${op.cliente}</span></div>
        <div class="op-dato"><span class="lbl">N° Per</span><span class="val">${op.per}</span></div>
        <div class="op-dato"><span class="lbl">N° Viaje</span><span class="val">${op.nroViaje}</span></div>
        <div class="op-dato"><span class="lbl">Operación</span><span class="val">${op.operacion}</span></div>
        <div class="op-dato"><span class="lbl">Personal Buque</span><span class="val">${op.personalBuque}</span></div>
        <div class="op-dato"><span class="lbl">Personal Planta</span><span class="val">${op.personalPlanta}</span></div>
      </div>

      <div style="margin-top:10px;">
        <span class="lbl" style="font-size:10px;color:var(--gray-400);">Productos</span>
        <div class="op-productos-chips" id="opProductosChips-${i}"></div>
      </div>

      <div class="op-acciones-grid">
        <button type="button" class="btn-op-accion" onclick="abrirModalActualizarProducto(${i})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>
          Productos
        </button>
        <button type="button" class="btn-op-accion" onclick="abrirModalHorario(${i})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Horario
        </button>
        <button type="button" class="btn-op-accion" onclick="abrirModalAsignarPrecinto(${i})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          Precinto
        </button>
      </div>

      ${renderBloqueSiguienteEstado(op, i, indiceEnProceso)}
    </div>`).join('');

  lista.forEach((op, i) => renderProductosChips(i));
}

// =================================================
// SIGUIENTE ESTADO PENDIENTE — los estados de una operación son
// consecutivos (igual que en el sistema), así que en vez de un selector
// libre se muestra directo el próximo que falta. No todos son fecha y hora:
// también hay tipo "numero" y "texto" (ver ESTADOS_OPERACION_MOVIL) — la
// tarjeta ofrece un campo rápido del tipo que corresponda, y un botón
// aparte abre "Añadir Hora" con comentario (y dictado) para un registro
// más detallado.
// =================================================
function estadoEstaCompletado(estado, dato) {
  return estado.tipo === 'fechaHora' ? !!dato.fecha : !!(dato.valor && String(dato.valor).trim());
}

function obtenerSiguienteEstadoPendiente(op) {
  return ESTADOS_OPERACION_MOVIL.find(e => !estadoEstaCompletado(e, op.estados[e.clave])) || null;
}

// El operador no puede trabajar en dos operaciones a la vez: la "operación en
// proceso" es la primera operación asignada que ya tiene al menos un estado
// registrado (ya se empezó) pero todavía no todos (aún no termina). Mientras
// esa exista, el campo rápido de registro queda disponible solo para ella;
// las demás quedan bloqueadas hasta que se complete, sin necesidad de
// exponerle al usuario ninguna etiqueta de "estado" — solo se le pide
// terminar la que ya tiene entre manos.
function indiceOperacionEnProceso() {
  const primerEstado = ESTADOS_OPERACION_MOVIL[0];
  return OPERACIONES_ASIGNADAS_MOVIL_DEMO.findIndex(op => {
    if (op.revisadoPorSistema) return false;
    const yaEmpezo = estadoEstaCompletado(primerEstado, op.estados[primerEstado.clave]);
    return yaEmpezo && obtenerSiguienteEstadoPendiente(op) !== null;
  });
}

function valorDatetimeLocalActual() {
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}

function renderBloqueSiguienteEstado(op, indice, indiceEnProceso) {
  if (op.revisadoPorSistema) {
    return `
      <div class="op-siguiente-bloqueado">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Esta operación ya fue revisada desde el sistema y no puede modificarse desde la app.</span>
      </div>`;
  }

  const siguiente = obtenerSiguienteEstadoPendiente(op);
  if (!siguiente) {
    return `
      <div class="op-siguiente-completo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
        Todos los estados de la operación fueron registrados.
      </div>`;
  }

  if (indiceEnProceso !== -1 && indiceEnProceso !== indice) {
    return `
      <div class="op-siguiente-bloqueado">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Termina la operación que ya tienes en curso para continuar con esta.</span>
      </div>`;
  }

  const inputHtml = siguiente.tipo === 'fechaHora'
    ? `<input type="datetime-local" class="movil-input" id="opSiguienteInput-${indice}" value="${valorDatetimeLocalActual()}">`
    : `<input type="${siguiente.tipo === 'numero' ? 'number' : 'text'}" class="movil-input" id="opSiguienteInput-${indice}" placeholder="${siguiente.campoPlaceholder || ''}">`;

  const iconoTipo = {
    fechaHora: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    numero: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>',
    texto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>'
  }[siguiente.tipo];

  const pistaFormato = siguiente.tipo === 'fechaHora'
    ? '<div class="op-siguiente-hint">Formato: dd/mm/aaaa</div>'
    : '';

  return `
    <div class="op-siguiente">
      <div class="op-siguiente-titulo">
        ${iconoTipo}
        <span>${siguiente.tipo === 'fechaHora' ? siguiente.etiqueta : `${siguiente.etiqueta} · ${siguiente.campoLabel}`}</span>
      </div>
      <div class="op-siguiente-campo">
        ${inputHtml}
        ${pistaFormato}
      </div>
      <div class="op-siguiente-acciones">
        <button type="button" class="op-siguiente-btn" onclick="registrarActividadSiguiente(${indice})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Registrar
        </button>
        <button type="button" class="op-siguiente-btn op-siguiente-btn--secundario" onclick="abrirModalAnadirHora(${indice})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Con comentario
        </button>
      </div>
    </div>`;
}

function registrarActividadSiguiente(indice) {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  const siguiente = obtenerSiguienteEstadoPendiente(op);
  if (!siguiente) return;

  const input = document.getElementById(`opSiguienteInput-${indice}`);

  if (siguiente.tipo === 'fechaHora') {
    if (!input.value) { mostrarErrorCampo(input, 'Selecciona fecha y hora'); return; }
    const [fechaParte, horaParte] = input.value.split('T');
    const [anio, mes, dia] = fechaParte.split('-');
    op.estados[siguiente.clave] = { fecha: `${dia}/${mes}/${anio}`, hora: horaParte, comentario: '' };
  } else {
    if (!input.value.trim()) { mostrarErrorCampo(input, `Ingresa ${siguiente.campoLabel.toLowerCase()}`); return; }
    op.estados[siguiente.clave] = { valor: input.value.trim(), comentario: '' };
  }

  renderOperacionesAsignadas();
  mostrarModalConfirmacionMovil(`${siguiente.etiqueta} registrado correctamente.`);
}

function renderProductosChips(indice) {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  const cont = document.getElementById(`opProductosChips-${indice}`);
  if (!cont) return;
  cont.innerHTML = op.productos.length
    ? op.productos.map(p => `<span class="op-producto-chip">${p}</span>`).join('')
    : `<span style="font-size:10px;color:var(--gray-400);">Sin productos registrados.</span>`;
}

// =================================================
// AÑADIR HORA — registro detallado (con comentario y dictado) del mismo
// siguiente estado pendiente que ya se puede registrar rápido desde la
// tarjeta; el campo principal se adapta al tipo del estado (fecha/hora,
// número o texto).
// =================================================
// El mismo modal sirve para dos casos: registrar el SIGUIENTE estado
// pendiente (claveEstadoEditando en null) o editar un estado que ya fue
// registrado antes, abierto desde "Horario" (claveEstadoEditando con la
// clave de ese estado) — en ambos casos el campo principal se adapta al
// tipo del estado (fecha/hora, número o texto) y hay un campo de comentario.
let claveEstadoEditando = null;

// El textarea de comentario crece con el contenido (en vez de quedar fijo a
// 3 filas y cortar el texto) hasta un máximo; de ahí en adelante se vuelve
// desplazable para no empujar el resto del modal fuera de la pantalla.
const ANADIR_HORA_COMENTARIO_MAX_ALTO = 120;

function autoAjustarTextareaMovil(el) {
  el.style.height = 'auto';
  const alto = Math.min(el.scrollHeight, ANADIR_HORA_COMENTARIO_MAX_ALTO);
  el.style.height = `${alto}px`;
  el.style.overflowY = el.scrollHeight > ANADIR_HORA_COMENTARIO_MAX_ALTO ? 'auto' : 'hidden';
}

function abrirModalAnadirHora(indice) {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  const siguiente = obtenerSiguienteEstadoPendiente(op);
  if (!siguiente) return;

  indiceOperacionActiva = indice;
  claveEstadoEditando = null;
  document.getElementById('tituloModalAnadirHora').textContent = `Añadir Hora — ${op.codigo}`;
  document.getElementById('anadirHoraEtiqueta').textContent = siguiente.tipo === 'fechaHora' ? siguiente.etiqueta : `${siguiente.etiqueta} · ${siguiente.campoLabel}`;

  const campoValor = document.getElementById('anadirHoraValor');
  campoValor.type = siguiente.tipo === 'fechaHora' ? 'datetime-local' : (siguiente.tipo === 'numero' ? 'number' : 'text');
  campoValor.placeholder = siguiente.tipo === 'fechaHora' ? '' : (siguiente.campoPlaceholder || '');
  // Por defecto sale la fecha/hora exacta en que se abre el modal; en
  // número/texto el campo obligatorio queda vacío para que el colaborador lo
  // complete.
  campoValor.value = siguiente.tipo === 'fechaHora' ? valorDatetimeLocalActual() : '';
  limpiarErrorCampo(campoValor);

  const campoComentario = document.getElementById('anadirHoraComentario');
  campoComentario.value = '';
  autoAjustarTextareaMovil(campoComentario);
  document.getElementById('dictadoTexto').textContent = 'Toca el micrófono para dictar el comentario.';
  document.getElementById('btnMicrofono').classList.remove('grabando');

  abrirModal('modalAnadirHora');
}

// Editar un estado ya registrado (desde el ícono de lápiz en "Horario"):
// precarga su valor actual (respetando el tipo — fecha/hora, número o
// texto) y su comentario. Cierra "Horario" mientras se edita para que los
// dos modales no queden superpuestos, y lo vuelve a abrir al guardar o
// cancelar.
function abrirModalEditarEstado(clave) {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const estado = ESTADOS_OPERACION_MOVIL.find(e => e.clave === clave);
  const dato = op && op.estados[clave];
  if (!estado || !dato) return;

  claveEstadoEditando = clave;
  cerrarModal('modalHorario');

  document.getElementById('tituloModalAnadirHora').textContent = `Editar ${estado.etiqueta} — ${op.codigo}`;
  document.getElementById('anadirHoraEtiqueta').textContent = estado.tipo === 'fechaHora' ? estado.etiqueta : `${estado.etiqueta} · ${estado.campoLabel}`;

  const campoValor = document.getElementById('anadirHoraValor');
  campoValor.type = estado.tipo === 'fechaHora' ? 'datetime-local' : (estado.tipo === 'numero' ? 'number' : 'text');
  campoValor.placeholder = estado.tipo === 'fechaHora' ? '' : (estado.campoPlaceholder || '');
  if (estado.tipo === 'fechaHora') {
    const [dia, mes, anio] = dato.fecha.split('/');
    campoValor.value = `${anio}-${mes}-${dia}T${dato.hora}`;
  } else {
    campoValor.value = dato.valor || '';
  }
  limpiarErrorCampo(campoValor);

  const campoComentario = document.getElementById('anadirHoraComentario');
  campoComentario.value = dato.comentario || '';
  autoAjustarTextareaMovil(campoComentario);
  document.getElementById('dictadoTexto').textContent = 'Toca el micrófono para dictar el comentario.';
  document.getElementById('btnMicrofono').classList.remove('grabando');

  abrirModal('modalAnadirHora');
}

// Cerrar/Cancelar el modal: si se estaba editando un estado desde
// "Horario", regresa a esa línea de tiempo en vez de dejar todo cerrado.
function cancelarAnadirHora() {
  const editando = !!claveEstadoEditando;
  const idx = indiceOperacionActiva;
  claveEstadoEditando = null;
  cerrarModal('modalAnadirHora');
  if (editando) abrirModalHorario(idx);
}

// Dictado por voz simulado: no usa la Web Speech API real (decisión del
// usuario), solo anima el botón y, tras un instante, inserta una frase demo.
function iniciarDictadoSimulado() {
  const btn = document.getElementById('btnMicrofono');
  const texto = document.getElementById('dictadoTexto');
  const campo = document.getElementById('anadirHoraComentario');

  btn.classList.add('grabando');
  texto.textContent = 'Escuchando…';

  setTimeout(() => {
    const frase = FRASES_DICTADO_DEMO[Math.floor(Math.random() * FRASES_DICTADO_DEMO.length)];
    campo.value = campo.value ? `${campo.value} ${frase}` : frase;
    autoAjustarTextareaMovil(campo);
    btn.classList.remove('grabando');
    texto.textContent = 'Comentario dictado. Puedes editarlo si lo necesitas.';
  }, 1400);
}

function guardarAnadirHora() {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const estado = claveEstadoEditando
    ? ESTADOS_OPERACION_MOVIL.find(e => e.clave === claveEstadoEditando)
    : obtenerSiguienteEstadoPendiente(op);
  if (!estado) { cerrarModal('modalAnadirHora'); return; }

  const campoValor = document.getElementById('anadirHoraValor');
  const comentario = document.getElementById('anadirHoraComentario').value.trim();

  if (!campoValor.value) {
    mostrarErrorCampo(campoValor, estado.tipo === 'fechaHora' ? 'Selecciona fecha y hora' : `Ingresa ${estado.campoLabel.toLowerCase()}`);
    return;
  }

  if (estado.tipo === 'fechaHora') {
    const [fechaParte, horaParte] = campoValor.value.split('T');
    const [anio, mes, dia] = fechaParte.split('-');
    op.estados[estado.clave] = { fecha: `${dia}/${mes}/${anio}`, hora: horaParte, comentario };
  } else {
    op.estados[estado.clave] = { valor: campoValor.value.trim(), comentario };
  }

  const editando = !!claveEstadoEditando;
  claveEstadoEditando = null;
  cerrarModal('modalAnadirHora');
  renderOperacionesAsignadas();

  if (editando) {
    abrirModalHorario(indiceOperacionActiva);
    mostrarModalConfirmacionMovil(`${estado.etiqueta} actualizado correctamente.`);
  } else {
    mostrarModalGuardado('crear', null, () => {});
  }
}

// =================================================
// HORARIO — línea de tiempo de estados
// =================================================
function abrirModalHorario(indice) {
  indiceOperacionActiva = indice;
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  document.getElementById('tituloModalHorario').textContent = `Horario — ${op.codigo}`;
  document.getElementById('horarioLockNota').style.display = op.revisadoPorSistema ? 'flex' : 'none';
  renderTimelineEstados();
  abrirModal('modalHorario');
}

function renderTimelineEstados() {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const bloqueado = op.revisadoPorSistema;
  const cont = document.getElementById('timelineEstados');

  const iconoTipo = {
    fechaHora: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    numero: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>',
    texto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>'
  };

  cont.innerHTML = ESTADOS_OPERACION_MOVIL.map(e => {
    const dato = op.estados[e.clave];
    const completado = estadoEstaCompletado(e, dato);
    const detalle = !completado
      ? 'Pendiente de registrar'
      : (e.tipo === 'fechaHora' ? `${dato.fecha} · ${dato.hora}` : dato.valor);
    return `
      <div class="timeline-item ${completado ? 'completado' : ''}">
        <div class="timeline-punto">
          ${completado
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>'
            : ''}
        </div>
        <div class="timeline-cuerpo">
          <div class="timeline-cabecera">
            <div class="timeline-etiqueta">${iconoTipo[e.tipo]}<span>${e.etiqueta}</span></div>
            ${completado && !bloqueado ? `<button type="button" class="timeline-editar" onclick="abrirModalEditarEstado('${e.clave}')" title="Editar ${e.etiqueta}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg></button>` : ''}
          </div>
          <div class="timeline-detalle">${detalle}</div>
          ${dato.comentario ? `<div class="timeline-comentario">"${dato.comentario}"</div>` : ''}
        </div>
      </div>`;
  }).join('');
}

// =================================================
// ASIGNAR PRECINTO — usa los precintos que la Asignación de Precintos hecha
// desde el sistema (ASIGNACIONES_PRECINTOS_DEMO) le entregó al Inspector
// que reporta, y escribe el uso directamente en GENERAR_REGISTROS_PRECINTOS_DEMO,
// la misma fuente que muestra Precintos > Reporte de Precintos > Detalle.
// =================================================

// Precintos disponibles de la operación activa y los que el operador ya
// marcó — se guardan aparte del DOM porque el buscador filtra qué se ve en
// el checklist, y una marca no debe perderse solo porque el precinto quedó
// oculto por el filtro de búsqueda.
let precintosDisponiblesModal = [];
let precintosSeleccionadosModal = new Set();

function abrirModalAsignarPrecinto(indice) {
  indiceOperacionActiva = indice;
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  document.getElementById('tituloModalAsignarPrecinto').textContent = `Asignar Precinto — ${op.codigo}`;

  // El PER es opcional y aparte en la Asignación de Precintos: puede
  // asociarse a un conjunto de precintos sin sub-rangos. Se juntan todas las
  // asignaciones que incluyan este PER en su lista "pers", y se descuenta lo
  // que ya quedó registrado en su Detalle (Generar Registro).
  const asignaciones = ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.pers.includes(op.per));
  const registro = obtenerGenerarRegistroPorPer(op.per);

  const sinDatos = document.getElementById('asignarPrecintoSinDatos');
  const form = document.getElementById('asignarPrecintoForm');
  const btnGuardar = document.getElementById('btnGuardarAsignarPrecinto');

  if (!asignaciones.length || !registro) {
    sinDatos.style.display = 'block';
    form.style.display = 'none';
    btnGuardar.style.display = 'none';
    abrirModal('modalAsignarPrecinto');
    return;
  }
  sinDatos.style.display = 'none';
  form.style.display = 'block';
  btnGuardar.style.display = '';

  const pool = asignaciones.flatMap(a => a.precintos);
  const usados = registro.detalle.map(d => d.precinto);
  precintosDisponiblesModal = pool.filter(p => !usados.includes(p));
  precintosSeleccionadosModal = new Set();

  document.getElementById('asignarPrecintoPer').value = op.per;
  document.getElementById('asignarPrecintoBuscar').value = '';
  renderChecklistPrecintos(precintosDisponiblesModal);

  const pad = n => String(n).padStart(2, '0');
  const ahora = new Date();
  document.getElementById('asignarPrecintoFecha').value = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
  document.getElementById('asignarPrecintoObservacion').value = '';
  document.getElementById('asignarPrecintoUsados').textContent =
    `${usados.length} de ${pool.length} precintos asignados a este PER ya fueron registrados.`;

  abrirModal('modalAsignarPrecinto');
}

// El checklist permite marcar más de un precinto disponible del rango (los
// que ya están registrados en el sistema para el PER de la operación, vía
// ASIGNACIONES_PRECINTOS_DEMO) y registrarlos todos juntos al Guardar. Las
// marcas se guardan en precintosSeleccionadosModal (no solo en el DOM) para
// que sobrevivan al filtrado del buscador.
function renderChecklistPrecintos(lista) {
  const cont = document.getElementById('asignarPrecintoChecklist');
  if (!lista.length) {
    cont.innerHTML = `<span class="precinto-check-vacio">${precintosDisponiblesModal.length ? 'Ningún precinto coincide con la búsqueda.' : 'No quedan precintos disponibles en este rango.'}</span>`;
    return;
  }
  cont.innerHTML = lista.map(p => `
    <label class="precinto-check-item">
      <input type="checkbox" value="${p}" ${precintosSeleccionadosModal.has(p) ? 'checked' : ''} onchange="alternarSeleccionPrecinto('${p}', this.checked)">
      <span>${p}</span>
    </label>`).join('');
}

function alternarSeleccionPrecinto(codigo, marcado) {
  if (marcado) precintosSeleccionadosModal.add(codigo);
  else precintosSeleccionadosModal.delete(codigo);
}

function filtrarChecklistPrecintos(texto) {
  const q = texto.trim().toUpperCase();
  const filtrados = q ? precintosDisponiblesModal.filter(p => p.toUpperCase().includes(q)) : precintosDisponiblesModal;
  renderChecklistPrecintos(filtrados);
}

function guardarAsignarPrecinto() {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const registro = obtenerGenerarRegistroPorPer(op.per);
  const precintosMarcados = Array.from(precintosSeleccionadosModal);
  const fechaInput = document.getElementById('asignarPrecintoFecha');
  const observacion = document.getElementById('asignarPrecintoObservacion').value.trim();

  if (!precintosMarcados.length) { mostrarToast('Selecciona al menos un precinto para registrar.'); return; }
  if (!fechaInput.value) { mostrarErrorCampo(fechaInput, 'Selecciona una fecha'); return; }

  const sesion = obtenerUsuarioActual();
  const [anio, mes, dia] = fechaInput.value.split('-');

  precintosMarcados.forEach(precinto => {
    registro.detalle.push({
      colaborador1: `${sesion.nombre} ${sesion.apellido}`,
      colaborador2: '',
      precinto,
      viaje: op.nroViaje,
      fecha: `${dia}/${mes}/${anio}`,
      observacion
    });
  });

  cerrarModal('modalAsignarPrecinto');
  mostrarModalGuardado('crear', `${precintosMarcados.length > 1 ? 'Los precintos quedarán' : 'El precinto quedará'} visible en Precintos > Reporte de Precintos.`, () => {});
}

// =================================================
// ESCANEAR PRECINTO — pide la cámara real del dispositivo (con linterna
// para poca iluminación) en vez de tener que escribir el código a mano.
// Este prototipo no decodifica un código de barras real: "Capturar" simula
// la lectura marcando el siguiente precinto disponible del checklist.
// =================================================
let escanerPrecintoStream = null;
let escanerPrecintoLinternaOn = false;

function abrirModalEscanearPrecinto() {
  document.getElementById('escanerSinCamara').style.display = 'none';
  escanerPrecintoLinternaOn = false;
  document.getElementById('escanerBtnLinterna').classList.remove('activa');
  abrirModal('modalEscanearPrecinto');
  iniciarCamaraEscanerPrecinto();
}

async function iniciarCamaraEscanerPrecinto() {
  const video = document.getElementById('escanerVideo');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    document.getElementById('escanerSinCamara').style.display = 'flex';
    return;
  }
  try {
    escanerPrecintoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = escanerPrecintoStream;
  } catch (err) {
    document.getElementById('escanerSinCamara').style.display = 'flex';
  }
}

function detenerCamaraEscanerPrecinto() {
  if (escanerPrecintoStream) {
    escanerPrecintoStream.getTracks().forEach(t => t.stop());
    escanerPrecintoStream = null;
  }
  const video = document.getElementById('escanerVideo');
  if (video) video.srcObject = null;
}

async function alternarLinternaEscaner() {
  const track = escanerPrecintoStream && escanerPrecintoStream.getVideoTracks()[0];
  if (!track) { mostrarToast('Activa la cámara para poder usar la linterna.'); return; }

  const capacidades = track.getCapabilities ? track.getCapabilities() : {};
  if (!capacidades.torch) { mostrarToast('Este dispositivo no permite controlar la linterna.'); return; }

  const nuevoEstado = !escanerPrecintoLinternaOn;
  try {
    await track.applyConstraints({ advanced: [{ torch: nuevoEstado }] });
    escanerPrecintoLinternaOn = nuevoEstado;
    document.getElementById('escanerBtnLinterna').classList.toggle('activa', escanerPrecintoLinternaOn);
  } catch (err) {
    mostrarToast('No se pudo activar la linterna.');
  }
}

function cerrarModalEscanearPrecinto() {
  detenerCamaraEscanerPrecinto();
  cerrarModal('modalEscanearPrecinto');
}

// Se resuelve contra precintosDisponiblesModal (no contra el DOM del
// checklist) para que el escaneo encuentre el siguiente precinto sin marcar
// aunque el buscador tenga un filtro activo ocultándolo de la vista.
function capturarEscaneoPrecinto() {
  const siguiente = precintosDisponiblesModal.find(p => !precintosSeleccionadosModal.has(p));
  if (!siguiente) { mostrarToast('No quedan precintos disponibles para escanear.'); return; }

  precintosSeleccionadosModal.add(siguiente);
  document.getElementById('asignarPrecintoBuscar').value = '';
  renderChecklistPrecintos(precintosDisponiblesModal);
  detenerCamaraEscanerPrecinto();
  cerrarModal('modalEscanearPrecinto');
  mostrarToast(`Precinto ${siguiente} leído correctamente.`);
}

// =================================================
// ACTUALIZAR PRODUCTO — el catálogo de sugerencias viene de Tablas
// Generales (cargarProductos, en data-tablas-generales.js), la misma
// fuente que usa el sistema web; si el producto que se necesita no está
// registrado ahí, el operador puede igual escribirlo y agregarlo como
// texto libre (agregarProductoOperacion no valida contra el catálogo).
// =================================================
// Mientras el modal está abierto, agregar/quitar un producto ya se refleja
// al instante en op.productos (para que los chips se vean actualizados);
// se guarda una copia al abrir para poder descartar los cambios con
// "Cancelar" y dejar la operación como estaba.
let productosSnapshotModal = null;

function abrirModalActualizarProducto(indice) {
  indiceOperacionActiva = indice;
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  productosSnapshotModal = [...op.productos];
  document.getElementById('tituloModalActualizarProducto').textContent = `Productos — ${op.codigo}`;
  document.getElementById('nuevoProductoInput').value = '';
  document.getElementById('productoSugerenciasMovil').classList.remove('open');
  renderChipsActualizarProducto();
  abrirModal('modalActualizarProducto');
}

function guardarActualizarProducto() {
  cerrarModal('modalActualizarProducto');
  renderProductosChips(indiceOperacionActiva);
  mostrarModalConfirmacionMovil('Productos actualizados correctamente.');
}

function cancelarActualizarProducto() {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  if (productosSnapshotModal) op.productos = [...productosSnapshotModal];
  cerrarModal('modalActualizarProducto');
  renderProductosChips(indiceOperacionActiva);
}

function buscarProductosSugeridosMovil(texto) {
  const cont = document.getElementById('productoSugerenciasMovil');
  if (!cont) return;
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const q = texto.trim().toLowerCase();

  const catalogo = typeof cargarProductos === 'function' ? cargarProductos() : [];
  const disponibles = catalogo.filter(p => !op.productos.includes(p.nombre));
  const coincidencias = q ? disponibles.filter(p => p.nombre.toLowerCase().includes(q)) : disponibles;

  if (!coincidencias.length) {
    cont.innerHTML = `<div class="movil-sugerencia-vacia">${q ? 'Sin coincidencias en el catálogo — toca Agregar para usar este texto' : 'Todos los productos del catálogo ya fueron agregados'}</div>`;
  } else {
    cont.innerHTML = coincidencias.map(p => `
      <div class="movil-sugerencia" onclick="seleccionarProductoSugeridoMovil('${p.nombre.replace(/'/g, "\\'")}')">${p.nombre}</div>
    `).join('');
  }
  cont.classList.add('open');
}

function seleccionarProductoSugeridoMovil(nombre) {
  const input = document.getElementById('nuevoProductoInput');
  if (input) input.value = nombre;
  document.getElementById('productoSugerenciasMovil')?.classList.remove('open');
}

document.addEventListener('click', e => {
  const cont = document.getElementById('productoSugerenciasMovil');
  if (!cont || !cont.classList.contains('open')) return;
  if (!cont.closest('.movil-form-group').contains(e.target)) cont.classList.remove('open');
});

function renderChipsActualizarProducto() {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const cont = document.getElementById('actualizarProductoChips');
  cont.innerHTML = op.productos.length
    ? op.productos.map((p, i) => `
        <span class="op-producto-chip">${p}
          <button type="button" onclick="quitarProductoOperacion(${i})" title="Quitar">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </span>`).join('')
    : `<span style="font-size:10px;color:var(--gray-400);">Sin productos registrados.</span>`;
}

function agregarProductoOperacion() {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const input = document.getElementById('nuevoProductoInput');
  const valor = input.value.trim();
  if (!valor) { mostrarErrorCampo(input, 'Ingresa un producto'); return; }
  if (op.productos.includes(valor)) { mostrarToast('Ese producto ya está registrado.'); return; }

  op.productos.push(valor);
  input.value = '';
  renderChipsActualizarProducto();
  renderProductosChips(indiceOperacionActiva);
}

function quitarProductoOperacion(indice) {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  op.productos.splice(indice, 1);
  renderChipsActualizarProducto();
  renderProductosChips(indiceOperacionActiva);
}

document.addEventListener('DOMContentLoaded', inicializarOperacionesMovil);
