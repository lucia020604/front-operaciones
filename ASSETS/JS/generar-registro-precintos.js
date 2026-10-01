// =================================================
// GENERAR-REGISTRO-PRECINTOS.JS
// Lógica del modal "Generar Registro de Precintos" (Detalle con
// colaboradores y precintos utilizados), que se abre únicamente desde
// Reporte de Precintos > Ver, por Asignación (Ruta del documento funcional:
// Reporte de Precintos > Detalle). Es más ancho que un modal-lg normal
// (#modalGenerarRegistro en precintos.css) porque "Agregar uso de precinto"
// tiene 4 campos + botón en una fila.
// Requiere: data-usuarios.js, data-precintos.js y main.js ya cargados, y
// que la página incluya el markup de #modalGenerarRegistro.
// =================================================

let codigoDetalleActivo = null; // código GRP (numero) único del Detalle que está abierto

function nombreColaborador(usuario) {
  const u = obtenerUsuarioPorNombre(usuario);
  return u ? `${u.nombre} ${u.apellido}` : usuario;
}

// Precintos de esta Asignación que todavía nadie reportó como usados — la
// base tanto del aviso de completitud como de las opciones que ofrece el
// select "Precinto" del formulario de abajo.
function obtenerPrecintosSinReportar(registro) {
  const asignacion = obtenerAsignacionPorId(registro.asignacionId);
  const reportados = new Set(registro.detalle.map(d => d.precinto));
  return (asignacion ? asignacion.precintos : [])
    .filter(p => !reportados.has(p))
    .sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
}

function renderCompletitudDetalle(registro) {
  const asignacion = obtenerAsignacionPorId(registro.asignacionId);
  const asignados = asignacion ? asignacion.precintos.length : 0;
  const sinReportar = obtenerPrecintosSinReportar(registro);
  const reportados = asignados - sinReportar.length;
  const el = document.getElementById('detalleCompletitud');
  el.innerHTML = `Precintos de esta Asignación: <strong>${asignados}</strong> ·
    Reportados: <strong>${reportados}</strong> · ` + (sinReportar.length
      ? `<span class="detalle-completitud-alerta">Sin reportar: ${sinReportar.length}</span>`
      : `<span class="detalle-completitud-ok">Completo</span>`);
}

// Repuebla el formulario "Agregar uso de precinto": el select de precintos
// solo ofrece los que de verdad están en esta Asignación y todavía no fueron
// reportados (evita reportar un precinto que nunca se entregó en ella, o
// reportarlo dos veces). El de colaborador se limita al receptor de esta
// Asignación (Precintos > Asignación de Precintos).
function poblarFormularioAgregarUso(registro) {
  const asignacion = obtenerAsignacionPorId(registro.asignacionId);
  const disponibles = obtenerPrecintosSinReportar(registro);
  const selectPrecinto = document.getElementById('detallePrecintoInput');
  selectPrecinto.innerHTML = disponibles.length
    ? '<option value="">Seleccionar precinto</option>' + disponibles.map(p => `<option value="${p}">${p}</option>`).join('')
    : '<option value="">No quedan precintos de esta Asignación por reportar</option>';

  const colaboradores = asignacion ? [asignacion.recibidoPor] : [];
  const selectColaborador = document.getElementById('detalleColaboradorInput');
  selectColaborador.innerHTML = '<option value="">Seleccionar colaborador</option>' +
    colaboradores.map(u => `<option value="${u}">${nombreColaborador(u)}</option>`).join('');

  const selectTerminal = document.getElementById('detalleTerminalInput');
  if (selectTerminal) {
    selectTerminal.innerHTML = '<option value="">Seleccionar terminal</option>' +
      cargarTerminalesPuerto().map(t => `<option value="${t.nombre}">${t.nombre}</option>`).join('');
  }

  document.getElementById('detalleViajeInput').value = '';
  document.getElementById('detalleFechaUsoInput').value = new Date().toISOString().slice(0, 10);
  document.getElementById('detalleTipoOperacionInput').value = '';
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
  const tipoOperacion = document.getElementById('detalleTipoOperacionInput').value.trim();
  const terminal = document.getElementById('detalleTerminalInput').value;

  if (!colaborador) { mostrarToast('Selecciona el colaborador.'); return; }
  if (!precinto) { mostrarToast('Selecciona el precinto usado.'); return; }
  if (!tipoOperacion) { mostrarToast('Ingresa el tipo de operación.'); return; }
  if (!viaje) { mostrarToast('Ingresa el N° de viaje.'); return; }
  if (!fechaUso) { mostrarToast('Ingresa la fecha.'); return; }

  // Red de seguridad además del select ya filtrado: por si el registro
  // cambió (otra pestaña) entre que se abrió el modal y se hizo click acá.
  const asignacion = obtenerAsignacionPorId(registro.asignacionId);
  if (!asignacion || !asignacion.precintos.includes(precinto)) {
    mostrarToast('Ese precinto no está en esta Asignación.');
    return;
  }
  if (registro.detalle.some(d => d.precinto === precinto)) {
    mostrarToast('Ese precinto ya fue reportado.');
    return;
  }

  registro.detalle.push({ colaborador, precinto, viaje, fecha: fechaISOaDDMMYYYY(fechaUso), tipoOperacion, terminal });
  guardarEstadoPrecintos();
  mostrarDetalleRegistro(registro);
  mostrarToast('Uso de precinto agregado.');
}

function quitarUsoPrecinto(indice) {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  confirmarAccion('¿Está seguro de quitar este uso de precinto del reporte?', () => {
    registro.detalle.splice(indice, 1);
    guardarEstadoPrecintos();
    mostrarDetalleRegistro(registro);
  });
}

function mostrarDetalleRegistro(registro) {
  codigoDetalleActivo = registro.numero;

  const asignacion = obtenerAsignacionPorId(registro.asignacionId);

  document.getElementById('modalGenerarRegistroNumero').textContent = `— ${registro.numero}`;
  document.getElementById('detalleFechaEmision').textContent = registro.fechaEmision;
  document.getElementById('detalleFechaAsignacion').textContent = asignacion ? asignacion.fecha : '—';

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
        <td>${d.tipoOperacion || '—'}</td>
        <td>${d.viaje}</td>
        <td>${d.terminal || '—'}</td>
        <td>${d.fecha}</td>
        <td class="opciones">
          ${soloLectura ? '—' : `<button class="btn-accion btn-inactivar" title="Quitar" onclick="quitarUsoPrecinto(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>`}
        </td>
      </tr>`).join('')
    : `<tr><td colspan="7" class="submodulo-tabla-vacio">Aún no hay uso de precintos reportado por el colaborador.</td></tr>`;

  const btnFinalizar = document.getElementById('btnFinalizarRegistro');
  btnFinalizar.disabled = soloLectura;
  btnFinalizar.style.opacity = soloLectura ? '.6' : '1';

  // Solo hay algo formal para descargar una vez Finalizado — antes de eso
  // el registro todavía puede cambiar.
  const btnDescargar = document.getElementById('btnDescargarRegistro');
  if (btnDescargar) {
    btnDescargar.disabled = !soloLectura;
    btnDescargar.title = soloLectura ? '' : 'Disponible una vez que el registro esté Finalizado';
    btnDescargar.style.opacity = soloLectura ? '1' : '.5';
  }

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

// "Descargar Registro de Control" desde este mismo modal (Ver Detalle/GRP):
// arma el mismo Registro de Control de Precintos con formato de planilla
// (ver descargarRegistroControlOperador en reporte-precintos.js), pero para
// el receptor de la Asignación que se esté viendo en este momento, sin
// pasar primero por "Ver movimientos".
function descargarRegistroControlDesdeDetalle() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  const asignacion = registro ? obtenerAsignacionPorId(registro.asignacionId) : null;
  if (!asignacion) return;
  descargarRegistroControlOperador(asignacion.recibidoPor);
}

// Variante para Reporte de Precintos, donde la fila que dispara "Ver" se
// identifica por Asignación: abre el Detalle exacto de esa Asignación, sin
// ambigüedad aunque el lote de origen tenga más de una Asignación.
function abrirModalVerEtiquetasPorAsignacion(asignacionId) {
  const registro = obtenerGenerarRegistroPorAsignacion(asignacionId);
  if (!registro) {
    mostrarToast('Aún no hay un registro de precintos generado para esta Asignación.');
    return;
  }
  mostrarDetalleRegistro(registro);
}

function finalizarGenerarRegistro() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);

  // No es requisito tener el 100% de los precintos reportados para poder
  // Finalizar: el supervisor revisa/cierra al terminar el mes, no cuando el
  // reporte quede completo. "Sin reportar" queda como aviso informativo
  // (ver detalleCompletitud), no como bloqueo.
  const sinReportar = obtenerPrecintosSinReportar(registro);
  const advertencia = sinReportar.length
    ? ` Quedan ${sinReportar.length} precinto(s) de esta Asignación sin reportar como usados.`
    : '';

  confirmarAccion(`¿Confirma finalizar este registro de precintos? Ya no podrá modificarse.${advertencia}`, () => {
    registro.estado = 'Finalizado';

    // Cada lote (Control de Precintos) del que salieron precintos para este
    // Detalle solo pasa a Finalizado cuando TODOS los PER que tienen
    // precintos asignados de ese lote ya finalizaron su propio Detalle — un
    // Detalle puede tocar más de un lote a la vez, así que se revisa uno por
    // uno.
    (registro.registroCodigos || []).forEach(codigoLote => {
      const registroPrincipal = obtenerRegistroPrecintoPorCodigo(codigoLote);
      const detallesDelLote = GENERAR_REGISTROS_PRECINTOS_DEMO.filter(r => (r.registroCodigos || []).includes(codigoLote));
      if (registroPrincipal && detallesDelLote.length && detallesDelLote.every(r => r.estado === 'Finalizado')) {
        registroPrincipal.estado = 'Finalizado';
      }
    });

    const reporte = REPORTES_PRECINTOS_DEMO.find(r => r.asignacionId === registro.asignacionId);
    if (reporte) reporte.estado = 'finalizado';

    guardarEstadoPrecintos();

    cerrarModal('modalGenerarRegistro');
    if (typeof renderTablaControlPrecintos === 'function') renderTablaControlPrecintos();
    if (typeof renderTablaReportePrecintos === 'function') renderTablaReportePrecintos();
    mostrarModalGuardado('editar', 'El registro de precintos fue finalizado correctamente.', () => {});
  });
}
