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

const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function inicializarOperacionesMovil() {
  const sesion = obtenerUsuarioActual();
  if (!sesion) { window.location.href = 'login-movil.html'; return; }

  const hoy = new Date();
  document.getElementById('headerFechaHoy').textContent =
    `${DIAS_LARGOS[hoy.getDay()]} ${hoy.getDate()} de ${MESES_LARGOS[hoy.getMonth()]}`;

  renderJornada();
  renderOperacionesAsignadas();
}

// =================================================
// JORNADA (Comenzar día / Finalizar) — simulación de geolocalización al
// marcar cada evento, ver decisión "Simulado con datos demo".
// =================================================
function renderJornada() {
  const sesion = obtenerUsuarioActual();
  const jornada = obtenerJornadaHoy(sesion.usuario);
  const btn = document.getElementById('btnJornada');
  const estadoTexto = document.getElementById('jornadaEstadoTexto');
  const horaTexto = document.getElementById('jornadaHoraTexto');

  if (jornada.fin) {
    estadoTexto.textContent = `Jornada finalizada · inicio ${jornada.inicio}`;
    horaTexto.textContent = jornada.fin;
    btn.textContent = 'Jornada finalizada';
    btn.classList.remove('finalizar');
    btn.disabled = true;
  } else if (jornada.inicio) {
    estadoTexto.textContent = 'Jornada en curso desde';
    horaTexto.textContent = jornada.inicio;
    btn.textContent = 'Finalizar';
    btn.classList.add('finalizar');
    btn.disabled = false;
  } else {
    estadoTexto.textContent = 'Jornada no iniciada';
    horaTexto.textContent = '—';
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
      <button type="button" class="movil-btn-secundario" style="margin-top:10px;" onclick="abrirModalActualizarProducto(${i})">
        Actualizar Producto
      </button>

      <div class="op-acciones-grid op-acciones-grid--2">
        <button type="button" class="btn-op-accion" onclick="abrirModalHorario(${i})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Horario
        </button>
        <button type="button" class="btn-op-accion" onclick="abrirModalAsignarPrecinto(${i})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
          Asignar Precinto
        </button>
      </div>

      ${renderBloqueSiguienteEstado(op, i)}
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

function valorDatetimeLocalActual() {
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}T${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}

function renderBloqueSiguienteEstado(op, indice) {
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

  const inputHtml = siguiente.tipo === 'fechaHora'
    ? `<input type="datetime-local" class="movil-input" id="opSiguienteInput-${indice}" value="${valorDatetimeLocalActual()}">`
    : `<input type="${siguiente.tipo === 'numero' ? 'number' : 'text'}" class="movil-input" id="opSiguienteInput-${indice}" placeholder="${siguiente.campoPlaceholder || ''}">`;

  return `
    <div class="op-siguiente">
      <div class="op-siguiente-titulo">${siguiente.tipo === 'fechaHora' ? siguiente.etiqueta : `${siguiente.etiqueta} · ${siguiente.campoLabel}`}</div>
      <div class="op-siguiente-fila">
        ${inputHtml}
        <button type="button" class="op-siguiente-btn" onclick="registrarActividadSiguiente(${indice})" title="Registrar ${siguiente.etiqueta}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button type="button" class="op-siguiente-btn op-siguiente-btn--secundario" onclick="abrirModalAnadirHora(${indice})" title="Registrar con comentario">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
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
function abrirModalAnadirHora(indice) {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  const siguiente = obtenerSiguienteEstadoPendiente(op);
  if (!siguiente) return;

  indiceOperacionActiva = indice;
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

  document.getElementById('anadirHoraComentario').value = '';
  document.getElementById('dictadoTexto').textContent = 'Toca el micrófono para dictar el comentario.';
  document.getElementById('btnMicrofono').classList.remove('grabando');

  abrirModal('modalAnadirHora');
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
    btn.classList.remove('grabando');
    texto.textContent = 'Comentario dictado. Puedes editarlo si lo necesitas.';
  }, 1400);
}

function guardarAnadirHora() {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const siguiente = obtenerSiguienteEstadoPendiente(op);
  if (!siguiente) { cerrarModal('modalAnadirHora'); return; }

  const campoValor = document.getElementById('anadirHoraValor');
  const comentario = document.getElementById('anadirHoraComentario').value.trim();

  if (!campoValor.value) {
    mostrarErrorCampo(campoValor, siguiente.tipo === 'fechaHora' ? 'Selecciona fecha y hora' : `Ingresa ${siguiente.campoLabel.toLowerCase()}`);
    return;
  }

  if (siguiente.tipo === 'fechaHora') {
    const [fechaParte, horaParte] = campoValor.value.split('T');
    const [anio, mes, dia] = fechaParte.split('-');
    op.estados[siguiente.clave] = { fecha: `${dia}/${mes}/${anio}`, hora: horaParte, comentario };
  } else {
    op.estados[siguiente.clave] = { valor: campoValor.value.trim(), comentario };
  }

  cerrarModal('modalAnadirHora');
  renderOperacionesAsignadas();
  mostrarModalGuardado('crear', null, () => {});
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
          <div class="timeline-etiqueta">${e.etiqueta}</div>
          <div class="timeline-detalle">${detalle}</div>
          ${dato.comentario ? `<div class="timeline-comentario">"${dato.comentario}"</div>` : ''}
          ${completado && !bloqueado ? `<button class="movil-btn-secundario" style="height:32px;margin-top:6px;font-size:11.5px;" onclick="editarEstadoHorario('${e.clave}')">Editar</button>` : ''}
        </div>
      </div>`;
  }).join('');
}

// Edición puntual de un estado ya registrado (equivalente de campo al mismo
// patrón de edición limitada usado en Precintos/Gastos): solo disponible si
// el horario no fue revisado desde el sistema.
function editarEstadoHorario(clave) {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const dato = op.estados[clave];
  const nuevoComentario = prompt('Editar comentario:', dato.comentario || '');
  if (nuevoComentario === null) return;
  dato.comentario = nuevoComentario.trim();
  renderTimelineEstados();
  mostrarModalConfirmacionMovil('Comentario actualizado.');
}

// =================================================
// ASIGNAR PRECINTO — usa el mismo rango de la Asignación de Precintos hecha
// desde el sistema (ASIGNACIONES_PRECINTOS_DEMO) y escribe el uso reportado
// directamente en GENERAR_REGISTROS_PRECINTOS_DEMO, la misma fuente que
// muestra Precintos > Reporte de Precintos > Detalle.
// =================================================
function generarRangoPrecintos(desde, hasta) {
  const m = desde.match(/^([A-Za-z]*-?)(\d+)$/);
  const mHasta = hasta.match(/^([A-Za-z]*-?)(\d+)$/);
  if (!m || !mHasta) return [];
  const prefijo = m[1];
  const largo = m[2].length;
  const ini = parseInt(m[2], 10);
  const fin = parseInt(mHasta[2], 10);
  const lista = [];
  for (let i = ini; i <= fin; i++) {
    lista.push(prefijo + String(i).padStart(largo, '0'));
  }
  return lista;
}

function abrirModalAsignarPrecinto(indice) {
  indiceOperacionActiva = indice;
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  document.getElementById('tituloModalAsignarPrecinto').textContent = `Asignar Precinto — ${op.codigo}`;

  const asignacion = ASIGNACIONES_PRECINTOS_DEMO.find(a => a.pers.includes(op.per));
  const registro = obtenerGenerarRegistroPorPer(op.per);

  const sinDatos = document.getElementById('asignarPrecintoSinDatos');
  const form = document.getElementById('asignarPrecintoForm');
  const btnGuardar = document.getElementById('btnGuardarAsignarPrecinto');

  if (!asignacion || !registro) {
    sinDatos.style.display = 'block';
    form.style.display = 'none';
    btnGuardar.style.display = 'none';
    abrirModal('modalAsignarPrecinto');
    return;
  }
  sinDatos.style.display = 'none';
  form.style.display = 'block';
  btnGuardar.style.display = '';

  const rango = generarRangoPrecintos(asignacion.numDesde, asignacion.numHasta);
  const usados = registro.detalle.map(d => d.precinto);
  const disponibles = rango.filter(p => !usados.includes(p));

  const selPrecinto = document.getElementById('asignarPrecintoNumero');
  selPrecinto.innerHTML = disponibles.length
    ? disponibles.map(p => `<option value="${p}">${p}</option>`).join('')
    : `<option value="">No quedan precintos disponibles en este rango</option>`;

  const sesion = obtenerUsuarioActual();
  const posiblesColaboradores = [op.personalBuque, op.personalPlanta]
    .filter(nombre => nombre && nombre !== `${sesion.nombre} ${sesion.apellido}`);
  const selColab = document.getElementById('asignarPrecintoColaborador2');
  selColab.innerHTML = posiblesColaboradores.map(n => `<option value="${n}">${n}</option>`).join('');

  document.getElementById('asignarPrecintoViaje').value = op.nroViaje;
  const pad = n => String(n).padStart(2, '0');
  const ahora = new Date();
  document.getElementById('asignarPrecintoFecha').value = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
  document.getElementById('asignarPrecintoObservacion').value = '';
  document.getElementById('asignarPrecintoUsados').textContent =
    `${usados.length} de ${rango.length} precintos del rango ${asignacion.numDesde} - ${asignacion.numHasta} ya fueron registrados.`;

  abrirModal('modalAsignarPrecinto');
}

function guardarAsignarPrecinto() {
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indiceOperacionActiva];
  const registro = obtenerGenerarRegistroPorPer(op.per);
  const precinto = document.getElementById('asignarPrecintoNumero').value;
  const colaborador2 = document.getElementById('asignarPrecintoColaborador2').value;
  const viajeInput = document.getElementById('asignarPrecintoViaje');
  const fechaInput = document.getElementById('asignarPrecintoFecha');
  const observacion = document.getElementById('asignarPrecintoObservacion').value.trim();

  if (!precinto) { mostrarToast('No hay un precinto disponible para registrar.'); return; }
  if (!viajeInput.value.trim()) { mostrarErrorCampo(viajeInput, 'Ingresa el N° de viaje'); return; }
  if (!fechaInput.value) { mostrarErrorCampo(fechaInput, 'Selecciona una fecha'); return; }

  const sesion = obtenerUsuarioActual();
  const [anio, mes, dia] = fechaInput.value.split('-');

  registro.detalle.push({
    colaborador1: `${sesion.nombre} ${sesion.apellido}`,
    colaborador2: colaborador2 || '',
    precinto,
    viaje: viajeInput.value.trim(),
    fecha: `${dia}/${mes}/${anio}`,
    observacion
  });

  cerrarModal('modalAsignarPrecinto');
  mostrarModalGuardado('crear', 'El precinto quedará visible en Precintos > Reporte de Precintos.', () => {});
}

// =================================================
// ACTUALIZAR PRODUCTO
// =================================================
function abrirModalActualizarProducto(indice) {
  indiceOperacionActiva = indice;
  const op = OPERACIONES_ASIGNADAS_MOVIL_DEMO[indice];
  document.getElementById('tituloModalActualizarProducto').textContent = `Actualizar Producto — ${op.codigo}`;
  document.getElementById('nuevoProductoInput').value = '';
  renderChipsActualizarProducto();
  abrirModal('modalActualizarProducto');
}

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
