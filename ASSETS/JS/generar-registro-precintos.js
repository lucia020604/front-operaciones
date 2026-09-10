// =================================================
// GENERAR-REGISTRO-PRECINTOS.JS
// Lógica del modal "Generar Registro de Precintos" (Detalle con
// colaboradores, precintos utilizados y firmas Revisado/Autorizado), que se
// abre únicamente desde Reporte de Precintos > Ver, por PER (Ruta del
// documento funcional: Reporte de Precintos > Detalle).
// Requiere: data-usuarios.js, data-precintos.js y main.js ya cargados,
// y que la página incluya el markup de #modalGenerarRegistro.
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
  const firmaSesion = usuarioSesion ? obtenerFirmaUsuario(usuarioSesion) : null;

  box.classList.remove('firmado');
  box.innerHTML = `
    <span class="firma-box-titulo">${titulo} — ${nombreRol}</span>
    ${firmaSesion
      ? `<button type="button" class="btn-firmar" onclick="${tipoFirma === 'revisado' ? 'firmarRevisado()' : 'firmarAutorizado()'}">
           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
           Firmar como ${usuarioSesion.nombre}
         </button>`
      : `<span class="firma-box-sinfirma">El usuario en sesión no tiene una firma registrada. Cárguela desde Configuración &gt; Usuarios.</span>`}
  `;
}

function renderDetalleFirmas() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  renderFirmaBox('firmaRevisadoBox', 'revisado', 'Jefe inmediato', registro.revisadoPor, registro.revisadoFecha);
  renderFirmaBox('firmaAutorizadoBox', 'autorizado', 'Gerente de Área', registro.autorizadoPor, registro.autorizadoFecha);
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

function mostrarDetalleRegistro(registro) {
  codigoDetalleActivo = registro.numero;

  document.getElementById('detalleRazonSocial').textContent = EMPRESA_PRECINTOS.razonSocial;
  document.getElementById('detalleRuc').textContent = EMPRESA_PRECINTOS.ruc;
  document.getElementById('detalleNumero').textContent = registro.numero;
  document.getElementById('detalleFechaEmision').textContent = registro.fechaEmision;
  document.getElementById('detalleFechaInicio').textContent = registro.fechaInicio || '—';
  document.getElementById('detalleFechaFin').textContent = registro.fechaFin || '—';
  document.getElementById('detallePer').textContent = registro.per || '—';

  const tbody = document.getElementById('tbodyDetalleReporte');
  tbody.innerHTML = registro.detalle.length
    ? registro.detalle.map((d, i) => `
      <tr>
        <td>${d.colaborador1}</td>
        <td>${d.colaborador2}</td>
        <td>${d.precinto}</td>
        <td>${d.viaje}</td>
        <td>${d.fecha}</td>
        <td>${d.observacion || '—'}</td>
        <td class="opciones">
          <button class="btn-accion btn-editar" title="Editar" onclick="editarFilaDetalleReporte(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="7" class="submodulo-tabla-vacio">Aún no hay uso de precintos reportado por el colaborador.</td></tr>`;

  const btnFinalizar = document.getElementById('btnFinalizarRegistro');
  btnFinalizar.disabled = registro.estado === 'Finalizado';
  btnFinalizar.style.opacity = registro.estado === 'Finalizado' ? '.6' : '1';

  renderDetalleFirmas();
  abrirModal('modalGenerarRegistro');
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

// La edición fina de cada fila (ingresada originalmente por el colaborador
// desde la app móvil) queda fuera del alcance de esta fase; por ahora solo
// permite corregir la observación.
function editarFilaDetalleReporte(indice) {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);
  const fila = registro.detalle[indice];
  const nuevaObservacion = prompt('Observación:', fila.observacion || '');
  if (nuevaObservacion === null) return;
  fila.observacion = nuevaObservacion.trim();
  mostrarDetalleRegistro(registro);
}

function finalizarGenerarRegistro() {
  const registro = obtenerGenerarRegistroPorNumero(codigoDetalleActivo);

  if (!registro.revisadoPor || !registro.autorizadoPor) {
    mostrarToast('El registro debe estar Revisado y Autorizado antes de poder Finalizarlo.');
    return;
  }

  confirmarAccion('¿Confirma finalizar este registro de precintos? Ya no podrá modificarse.', () => {
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
    mostrarToast('El registro fue finalizado correctamente.');
  });
}
