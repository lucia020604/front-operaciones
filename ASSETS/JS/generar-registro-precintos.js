// =================================================
// GENERAR-REGISTRO-PRECINTOS.JS
// Lógica del modal "Generar Registro de Precintos" (Detalle con
// colaboradores, precintos utilizados y firmas Revisado/Autorizado), que se
// abre únicamente desde Reporte de Precintos > Ver, por PER (Ruta del
// documento funcional: Reporte de Precintos > Detalle). Es más ancho que un
// modal-lg normal (#modalGenerarRegistro en precintos.css) porque "Agregar
// uso de precinto" tiene 4 campos + botón en una fila.
// Requiere: data-usuarios.js, data-precintos.js y main.js ya cargados, y
// que la página incluya el markup de #modalGenerarRegistro.
// =================================================

let codigoDetalleActivo = null; // código GRP (numero) único del Detalle que está abierto

function renderFirmaBox(contenedorId, tipoFirma, nombreRol, usuarioFirmante, fechaFirma) {
  const box = document.getElementById(contenedorId);
  const titulo = tipoFirma === 'revisado' ? 'Revisado' : 'Autorizado';

  if (usuarioFirmante && fechaFirma) {
    const u = obtenerUsuarioPorNombre(usuarioFirmante);
    const firma = obtenerFirmaUsuario(u);
    box.classList.add('firmado');
    box.innerHTML = `
      <span class="firma-box-titulo">${titulo}</span>
      ${firma ? `<img src="${firma}" alt="Firma">` : ''}
      <span class="firma-box-meta"><strong>${u ? u.nombre + ' ' + u.apellido : usuarioFirmante}</strong><br>${fechaFirma}</span>`;
    return;
  }

  const sesion = obtenerUsuarioActual();
  const usuarioSesion = sesion ? obtenerUsuarioPorNombre(sesion.usuario) : null;

  // Firmar (marcar Revisado/Autorizado) solo requiere una sesión activa: no
  // hace falta que el usuario tenga cargada una imagen de firma para poder
  // dar el visto bueno — si la tiene cargada se muestra como sello (ver
  // arriba), si no, igual queda registrado quién y cuándo.
  box.classList.remove('firmado');
  box.innerHTML = `
    <span class="firma-box-titulo">${titulo} — ${nombreRol}</span>
    ${usuarioSesion
      ? `<button type="button" class="btn-firmar" onclick="${tipoFirma === 'revisado' ? 'firmarRevisado()' : 'firmarAutorizado()'}">
           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
           Firmar como ${usuarioSesion.nombre}
         </button>`
      : `<span class="firma-box-sinfirma">Inicia sesión para poder firmar como ${nombreRol}.</span>`}
  `;
}

function renderDetalleFirmas() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  renderFirmaBox('firmaRevisadoBox', 'revisado', 'Jefe inmediato', registro.revisadoPor, registro.revisadoFecha);
  renderFirmaBox('firmaAutorizadoBox', 'autorizado', 'Gerente de Área', registro.autorizadoPor, registro.autorizadoFecha);
  renderFirmaOperario(registro);
}

// La firma del operario no se hace desde acá: llega por notificación a la
// app móvil recién cuando el registro queda Finalizado (Revisado + Autorizado
// ya firmados), para que revise el registro ya cerrado y firme desde ahí.
// Esta caja solo muestra el estado de ese paso, no lo dispara.
function renderFirmaOperario(registro) {
  const box = document.getElementById('firmaOperarioBox');
  if (!box) return;

  const nombres = [...new Set(registro.detalle.map(d => d.colaborador))]
    .map(nombreColaborador).join(', ') || '—';

  if (registro.operarioFirmaPor) {
    const u = obtenerUsuarioPorNombre(registro.operarioFirmaPor);
    box.className = 'firma-operario-box firmado';
    box.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
      <span><strong>Firmado por el operario</strong> — ${u ? u.nombre + ' ' + u.apellido : registro.operarioFirmaPor}, ${registro.operarioFirmaFecha}. El registro ya se envió por correo para descargar.</span>`;
    return;
  }

  box.className = 'firma-operario-box pendiente';
  box.innerHTML = registro.estado === 'Finalizado'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
       <span><strong>Pendiente la firma del operario</strong> (${nombres}) — se le notificó en la app móvil para que revise este registro y firme desde ahí. El envío por correo para descargar queda a la espera de esa firma.</span>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
       <span>La firma del operario (${nombres}) se solicita en la app móvil recién cuando este registro quede Finalizado.</span>`;
}

function fechaHoraActual() {
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(ahora.getDate())}/${pad(ahora.getMonth() + 1)}/${ahora.getFullYear()} ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}

function firmarRevisado() {
  const sesion = obtenerUsuarioActual();
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  registro.revisadoPor = sesion.usuario;
  registro.revisadoFecha = fechaHoraActual();
  renderDetalleFirmas();
  mostrarToast('Registro marcado como Revisado.');
}

function firmarAutorizado() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  if (!registro.revisadoPor) {
    mostrarToast('El registro debe estar Revisado antes de poder Autorizarlo.');
    return;
  }
  const sesion = obtenerUsuarioActual();
  registro.autorizadoPor = sesion.usuario;
  registro.autorizadoFecha = fechaHoraActual();
  renderDetalleFirmas();
  mostrarToast('Registro marcado como Autorizado.');
}

function nombreColaborador(usuario) {
  const u = obtenerUsuarioPorNombre(usuario);
  return u ? `${u.nombre} ${u.apellido}` : usuario;
}

// Precintos de este PER que todavía nadie reportó como usados — la base
// tanto del aviso de completitud como de las opciones que ofrece el select
// "Precinto" del formulario de abajo.
function obtenerPrecintosSinReportar(registro) {
  const reportados = new Set(registro.detalle.map(d => d.precinto));
  return [...obtenerPrecintosAsignadosPorPer(registro.per)]
    .filter(p => !reportados.has(p))
    .sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
}

function renderCompletitudDetalle(registro) {
  const asignados = obtenerPrecintosAsignadosPorPer(registro.per).size;
  const sinReportar = obtenerPrecintosSinReportar(registro);
  const reportados = asignados - sinReportar.length;
  const el = document.getElementById('detalleCompletitud');
  el.innerHTML = `Precintos asignados a este PER: <strong>${asignados}</strong> ·
    Reportados: <strong>${reportados}</strong> · ` + (sinReportar.length
      ? `<span class="detalle-completitud-alerta">Sin reportar: ${sinReportar.length}</span>`
      : `<span class="detalle-completitud-ok">Completo</span>`);
}

// Repuebla el formulario "Agregar uso de precinto": el select de precintos
// solo ofrece los que de verdad están asignados a este PER y todavía no
// fueron reportados (evita reportar un precinto que nunca se entregó bajo
// este PER, o reportarlo dos veces). El de colaborador se limita a quienes
// recibieron precintos bajo este PER en Control de Precintos > Asignación.
function poblarFormularioAgregarUso(registro) {
  const disponibles = obtenerPrecintosSinReportar(registro);
  const selectPrecinto = document.getElementById('detallePrecintoInput');
  selectPrecinto.innerHTML = disponibles.length
    ? '<option value="">Seleccionar precinto</option>' + disponibles.map(p => `<option value="${p}">${p}</option>`).join('')
    : '<option value="">No quedan precintos de este PER por reportar</option>';

  const colaboradores = [...new Set(
    ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.pers.includes(registro.per)).map(a => a.recibidoPor)
  )];
  const selectColaborador = document.getElementById('detalleColaboradorInput');
  selectColaborador.innerHTML = '<option value="">Seleccionar colaborador</option>' +
    colaboradores.map(u => `<option value="${u}">${nombreColaborador(u)}</option>`).join('');

  document.getElementById('detalleViajeInput').value = '';
  document.getElementById('detalleFechaUsoInput').value = new Date().toISOString().slice(0, 10);
  document.getElementById('detalleObservacionInput').value = '';
}

// "Agregar uso de precinto" arranca contraído (ver mostrarDetalleRegistro) y
// se expande solo si el usuario lo pide — mismo patrón que
// toggleSeccionClientesNom en servicios.js (Nominaciones > Cliente).
function toggleFormularioAgregarUso() {
  const body = document.getElementById('formularioAgregarUsoBody');
  const btn = document.getElementById('btnColapsarAgregarUso');
  if (!body || !btn) return;
  const expandir = body.style.display === 'none';
  body.style.display = expandir ? '' : 'none';
  btn.classList.toggle('colapsado', !expandir);
  btn.title = expandir ? 'Ocultar' : 'Agregar uso de precinto';
}

function agregarUsoPrecinto() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  const colaborador = document.getElementById('detalleColaboradorInput').value;
  const precinto = document.getElementById('detallePrecintoInput').value;
  const viaje = document.getElementById('detalleViajeInput').value.trim();
  const fechaUso = document.getElementById('detalleFechaUsoInput').value;
  const observacion = document.getElementById('detalleObservacionInput').value.trim();

  if (!colaborador) { mostrarToast('Selecciona el colaborador.'); return; }
  if (!precinto) { mostrarToast('Selecciona el precinto usado.'); return; }
  if (!viaje) { mostrarToast('Ingresa el N° de viaje.'); return; }
  if (!fechaUso) { mostrarToast('Ingresa la fecha.'); return; }

  // Red de seguridad además del select ya filtrado: por si el registro
  // cambió (otra pestaña) entre que se abrió el modal y se hizo click acá.
  if (!obtenerPrecintosAsignadosPorPer(registro.per).has(precinto)) {
    mostrarToast('Ese precinto no está asignado a este PER.');
    return;
  }
  if (registro.detalle.some(d => d.precinto === precinto)) {
    mostrarToast('Ese precinto ya fue reportado.');
    return;
  }

  registro.detalle.push({ colaborador, precinto, viaje, fecha: fechaISOaDDMMYYYY(fechaUso), observacion });
  mostrarDetalleRegistro(registro);
  mostrarToast('Uso de precinto agregado.');
}

function quitarUsoPrecinto(indice) {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  confirmarAccion('¿Está seguro de quitar este uso de precinto del reporte?', () => {
    registro.detalle.splice(indice, 1);
    mostrarDetalleRegistro(registro);
  });
}

function mostrarDetalleRegistro(registro) {
  codigoDetalleActivo = registro.numero;

  document.getElementById('modalGenerarRegistroNumero').textContent = `— ${registro.numero}`;
  document.getElementById('detalleFechaEmision').textContent = registro.fechaEmision;
  document.getElementById('detalleFechaInicio').textContent = registro.fechaInicio || '—';
  document.getElementById('detalleFechaFin').textContent = registro.fechaFin || '—';
  document.getElementById('detallePer').textContent = registro.per || '—';

  renderCompletitudDetalle(registro);

  const soloLectura = registro.estado === 'Finalizado';
  const formularioAgregar = document.getElementById('formularioAgregarUso');
  if (formularioAgregar) formularioAgregar.style.display = soloLectura ? 'none' : '';
  if (!soloLectura) {
    poblarFormularioAgregarUso(registro);
    // Arranca contraído cada vez que se abre el modal: si ya no hay nada
    // que agregar (o se está revisando lo ya cargado), el formulario no
    // compite por atención — se expande solo si el usuario lo pide.
    const body = document.getElementById('formularioAgregarUsoBody');
    const btn = document.getElementById('btnColapsarAgregarUso');
    if (body) body.style.display = 'none';
    if (btn) btn.classList.add('colapsado');
  }

  const tbody = document.getElementById('tbodyDetalleReporte');
  tbody.innerHTML = registro.detalle.length
    ? registro.detalle.map((d, i) => `
      <tr>
        <td>${nombreColaborador(d.colaborador)}</td>
        <td>${d.precinto}</td>
        <td>${d.viaje}</td>
        <td>${d.fecha}</td>
        <td>${d.observacion || '—'}</td>
        <td class="opciones">
          ${soloLectura ? '—' : `<button class="btn-accion btn-editar" title="Editar" onclick="editarFilaDetalleReporte(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
          <button class="btn-accion btn-inactivar" title="Quitar" onclick="quitarUsoPrecinto(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>`}
        </td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="submodulo-tabla-vacio">Aún no hay uso de precintos reportado por el colaborador.</td></tr>`;

  const btnFinalizar = document.getElementById('btnFinalizarRegistro');
  btnFinalizar.disabled = soloLectura;
  btnFinalizar.style.opacity = soloLectura ? '.6' : '1';

  // Solo hay algo formal para descargar una vez Finalizado (Revisado +
  // Autorizado) — antes de eso el registro todavía puede cambiar.
  const btnDescargar = document.getElementById('btnDescargarRegistro');
  if (btnDescargar) {
    btnDescargar.disabled = !soloLectura;
    btnDescargar.title = soloLectura ? '' : 'Disponible una vez que el registro esté Finalizado';
    btnDescargar.style.opacity = soloLectura ? '1' : '.5';
  }

  renderDetalleFirmas();
  abrirModal('modalGenerarRegistro');
}

// Descarga = imprimir el modal como PDF. No hay backend para generar un
// documento aparte, así que se apoya en el diálogo de impresión del propio
// navegador — el @media print de precintos.css oculta todo lo que no es el
// contenido del modal (topbar, sidebar, overlay, botones, formulario de
// carga) para que salga limpio.
function descargarRegistroPrecintos() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  if (!registro || registro.estado !== 'Finalizado') {
    mostrarToast('El registro debe estar Finalizado para poder descargarlo.');
    return;
  }
  window.print();
}

// Variante para Reporte de Precintos, donde la fila que dispara "Ver" se
// identifica por PER: abre el Detalle exacto de ese PER, sin ambigüedad
// aunque el lote de origen tenga más de un PER asignado.
function abrirModalVerEtiquetasPorPer(per) {
  const registro = obtenerGenerarRegistroPorPer(per);
  if (!registro) {
    mostrarToast('Aún no hay un registro de precintos generado para este PER.');
    return;
  }
  mostrarDetalleRegistro(registro);
}

// Corrige solo la observación de una fila ya reportada (desde la app móvil o
// desde "Agregar uso de precinto" acá mismo). Para quitarla del todo está
// quitarUsoPrecinto — cambiar el precinto o el colaborador de una fila
// existente implica quitarla y volver a agregarla, para no saltarse la
// validación contra lo realmente asignado a este PER.
function editarFilaDetalleReporte(indice) {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  const fila = registro.detalle[indice];
  pedirValorModal('Editar observación', 'Observación', fila.observacion || '', (valor) => {
    fila.observacion = valor.trim();
    mostrarDetalleRegistro(registro);
  });
}

function finalizarGenerarRegistro() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);

  if (!registro.revisadoPor || !registro.autorizadoPor) {
    mostrarToast('El registro debe estar Revisado y Autorizado antes de poder Finalizarlo.');
    return;
  }

  // No es requisito tener el 100% de los precintos reportados para poder
  // Finalizar: el supervisor revisa/cierra al terminar el mes, no cuando el
  // reporte quede completo. "Sin reportar" queda como aviso informativo
  // (ver detalleCompletitud), no como bloqueo.
  const sinReportar = obtenerPrecintosSinReportar(registro);
  const advertencia = sinReportar.length
    ? ` Quedan ${sinReportar.length} precinto(s) de este PER sin reportar como usados.`
    : '';

  confirmarAccion(`¿Confirma finalizar este registro de precintos? Ya no podrá modificarse.${advertencia}`, () => {
    registro.estado = 'Finalizado';

    // El lote (Control de Precintos) solo pasa a Finalizado cuando TODOS los
    // PER que tiene asignados ya finalizaron su propio Detalle.
    const registroPrincipal = obtenerRegistroPrecintoPorCodigo(registro.registroCodigo);
    const detallesDelLote = GENERAR_REGISTROS_PRECINTOS_DEMO.filter(r => r.registroCodigo === registro.registroCodigo);
    if (registroPrincipal && detallesDelLote.every(r => r.estado === 'Finalizado')) {
      registroPrincipal.estado = 'Finalizado';
    }

    const reporte = REPORTES_PRECINTOS_DEMO.find(r => r.per === registro.per);
    if (reporte) reporte.estado = 'finalizado';

    cerrarModal('modalGenerarRegistro');
    if (typeof renderTablaControlPrecintos === 'function') renderTablaControlPrecintos();
    if (typeof renderTablaReportePrecintos === 'function') renderTablaReportePrecintos();
    mostrarModalGuardado('editar', 'El registro de precintos fue finalizado correctamente.', () => {});
  });
}
