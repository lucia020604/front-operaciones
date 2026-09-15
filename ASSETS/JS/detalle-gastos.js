// =================================================
// DETALLE-GASTOS.JS
// Lógica compartida de los 3 modales de Detalle de "Registro de Gastos
// Operativos" (Alimentos / Movilidad / Días a Bordo). Cada tipo tiene su
// propio modal y su propia grilla (columnas distintas, según el documento
// funcional), pero comparten el mismo patrón: encabezado + colaborador +
// consideraciones + grilla + firma del trabajador + acciones según estado.
//
// Flujo de doble revisión (mismo patrón que Reporte de Precintos —
// Revisado/Autorizado/Finalizado — pero con 2 pasos en vez de 3):
//   pendiente → el operador registra sus gastos; el supervisor puede editar
//               el monto máximo y marca "Revisado" (revisarDetalleGasto).
//   revisadoSupervisor → ya no se puede editar; se notificó al operador por
//               la campana (ver main.js notifUpsertar) para que confirme su
//               parte desde ahí (confirmarRevisionOperador).
//   revisado → cerrado, sin acciones (equivalente a "Revisar" del documento:
//               "No se podrá editar un reporte si está en estado Revisado").
// =================================================

let gastoActivoId = null;
let gastoActivoTipo = null;

const CONFIG_TIPO_GASTO = {
  Alimentos: {
    prefijo: 'alimentos', fuenteDetalle: DETALLE_ALIMENTOS_DEMO,
    // Una fila por comida (Desayuno/Almuerzo/Cena) — así lo carga el
    // operario desde el app, ver DETALLE_ALIMENTOS_DEMO en data-gastos.js.
    columnas: ['fecha', 'comida', 'lugar', 'cliente', 'operacionPer', 'hora', 'costo'],
    campoMonto: 'costo', tieneBaseLegal: true, tieneEvidencia: true, tbody: 'tbodyAlimentosGrilla'
  },
  Movilidad: {
    prefijo: 'movilidad', fuenteDetalle: DETALLE_MOVILIDAD_DEMO,
    columnas: ['fecha', 'empresa', 'distritoPartida', 'distritoDestino', 'motivo', 'importeDia', 'totalDia'],
    campoMonto: 'importeDia', tieneBaseLegal: true, tieneEvidencia: true, tbody: 'tbodyMovilidadGrilla'
  },
  'Días a Bordo': {
    prefijo: 'diasBordo', fuenteDetalle: DETALLE_DIAS_A_BORDO_DEMO,
    columnas: ['dia', 'fecha', 'lugar', 'cliente', 'operacion', 'operacionPer', 'buque', 'detalle', 'monto'],
    campoMonto: 'monto', tieneBaseLegal: false, tieneEvidencia: false, tbody: 'tbodyDiasBordoGrilla'
  }
};

const MODAL_POR_TIPO = {
  Alimentos: 'modalDetalleAlimentos',
  Movilidad: 'modalDetalleMovilidad',
  'Días a Bordo': 'modalDetalleDiasABordo'
};

function abrirDetalleGasto(id) {
  const gasto = obtenerGastoPorId(id);
  if (!gasto) return;

  const detalle = obtenerDetalleGastoPorTipo(gasto.tipo, gasto.id);
  if (!detalle) { mostrarToast('Este registro aún no tiene información ingresada por el colaborador.'); return; }

  gastoActivoId = gasto.id;
  gastoActivoTipo = gasto.tipo;

  const cfg = CONFIG_TIPO_GASTO[gasto.tipo];
  const p = cfg.prefijo;
  // Una vez que el supervisor marca Revisado, el registro ya no se puede
  // editar — solo queda pendiente la confirmación del operador (o, si ya
  // confirmó, queda cerrado del todo).
  const soloLectura = gasto.estado !== 'pendiente';
  const colaborador = COLABORADOR_GASTOS_DEMO[gasto.id] || {};

  document.getElementById(`${p}Titulo`).textContent = gasto.estado === 'pendiente'
    ? `Editar Registro de ${gasto.tipo}`
    : `Revisar Registro de ${gasto.tipo}`;

  // Razón social/RUC ya no se muestran en el modal (solo tienen sentido en
  // el documento impreso/descargado, ver descargarReporteGasto) — acá basta
  // con el N° en el título, mismo patrón que "Generar Registro de Precintos".
  document.getElementById(`${p}Numero`).textContent = `— ${detalle.numero}`;
  document.getElementById(`${p}FechaEmision`).textContent = detalle.fechaEmision;
  document.getElementById(`${p}Colaborador`).textContent = `${gasto.nombre} ${gasto.apellido}`;
  document.getElementById(`${p}Cargo`).textContent = colaborador.cargo || '—';
  document.getElementById(`${p}DocIdentidad`).textContent = colaborador.docIdentidad || '—';
  document.getElementById(`${p}Area`).textContent = gasto.area;

  const montoMaximoInput = document.getElementById(`${p}MontoMaximo`);
  montoMaximoInput.value = detalle.montoMaximo;
  montoMaximoInput.disabled = soloLectura;
  document.getElementById(`${p}FechaInicio`).textContent = detalle.fechaInicio;
  document.getElementById(`${p}FechaFin`).textContent = detalle.fechaFin;

  renderGrillaDetalleGasto(gasto.tipo, detalle, soloLectura);

  renderFirmaBoxSupervisorGasto(`${p}FirmaSupervisorBox`, detalle.revisadoSupervisorPor, detalle.revisadoSupervisorFecha);
  renderFirmaBoxOperadorGasto(`${p}FirmaOperadorBox`, detalle, gasto);

  if (cfg.tieneBaseLegal) {
    document.getElementById(`${p}BaseLegal`).textContent = BASE_LEGAL_GASTOS;
  }

  const btnAutorizado = document.getElementById(`${p}BtnAutorizado`);
  const btnGrabar = document.getElementById(`${p}BtnGrabar`);
  const btnConfirmarOperador = document.getElementById(`${p}BtnConfirmarOperador`);
  btnAutorizado.style.display = gasto.estado === 'pendiente' ? '' : 'none';
  btnGrabar.style.display = gasto.estado === 'pendiente' ? '' : 'none';
  btnConfirmarOperador.style.display = gasto.estado === 'revisadoSupervisor' ? '' : 'none';

  abrirModal(MODAL_POR_TIPO[gasto.tipo]);
}

// "Revisado por Supervisor": puramente informativo — a diferencia de
// firmarRevisado en precintos, acá la acción vive en el botón "Revisado"
// del footer (revisarDetalleGasto), no en la caja misma.
function renderFirmaBoxSupervisorGasto(contenedorId, usuarioPor, fecha) {
  const box = document.getElementById(contenedorId);
  if (!box) return;

  if (usuarioPor && fecha) {
    const u = obtenerUsuarioPorNombre(usuarioPor);
    box.classList.add('firmado');
    box.innerHTML = `
      <span class="firma-box-titulo">Revisado por Supervisor</span>
      <span class="firma-box-meta"><strong>${u ? u.nombre + ' ' + u.apellido : usuarioPor}</strong><br>${fecha}</span>`;
    return;
  }

  box.classList.remove('firmado');
  box.innerHTML = `
    <span class="firma-box-titulo">Revisado por Supervisor</span>
    <span class="firma-box-sinfirma">Pendiente de revisión.</span>`;
}

// Firma del trabajador (imagen registrada en Configuración > Usuarios) +
// estado de su confirmación de la revisión — se notifica por la campana
// recién cuando el supervisor marca Revisado (ver revisarDetalleGasto), y
// esta caja refleja si ya confirmó o sigue pendiente.
function renderFirmaBoxOperadorGasto(contenedorId, detalle, gasto) {
  const box = document.getElementById(contenedorId);
  if (!box) return;

  const u = obtenerUsuarioPorNombre(detalle.firmaTrabajador);
  const firma = obtenerFirmaUsuario(u);
  const confirmado = !!detalle.revisadoOperadorPor;
  box.classList.toggle('firmado', confirmado);

  const estadoTexto = confirmado
    ? `Confirmado el ${detalle.revisadoOperadorFecha}`
    : gasto.estado === 'revisadoSupervisor'
      ? 'Se notificó al operador por la campana; pendiente de confirmar.'
      : 'Aún no corresponde confirmar.';

  box.innerHTML = `
    <span class="firma-box-titulo">Firma del Operador</span>
    ${firma ? `<img src="${firma}" alt="Firma">` : `<span class="firma-box-sinfirma">${u ? (u.nombre + ' ' + u.apellido) : (detalle.firmaTrabajador || 'El colaborador')} aún no tiene una firma registrada. Se carga desde Configuración &gt; Usuarios.</span>`}
    <span class="firma-box-meta"><strong>${u ? u.nombre + ' ' + u.apellido : detalle.firmaTrabajador}</strong><br>${estadoTexto}</span>
  `;
}

// Columna "Evidencia" del app: si el operario marcó "Gasto sin sustento" esa
// es la justificación (no se espera foto); si no, muestra cuántas fotos
// adjuntó (clickeable, ver verEvidenciaGasto) o "—" si no adjuntó ninguna.
function celdaEvidenciaGasto(tipo, indice, fila) {
  if (fila.sinSustento) return `<span class="badge badge-gris">Sin sustento</span>`;
  if (fila.evidencia && fila.evidencia.length) {
    return `<button type="button" class="btn-ver-evidencia" onclick="verEvidenciaGasto('${tipo}', ${indice})">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      ${fila.evidencia.length}
    </button>`;
  }
  return '—';
}

function renderGrillaDetalleGasto(tipo, detalle, soloLectura) {
  const cfg = CONFIG_TIPO_GASTO[tipo];
  const tbody = document.getElementById(cfg.tbody);

  const formatoCelda = (col, valor) => (col === cfg.campoMonto) ? `S/ ${Number(valor).toFixed(2)}` : valor;
  const colspanVacio = cfg.columnas.length + 1 + (cfg.tieneEvidencia ? 1 : 0);

  tbody.innerHTML = detalle.grilla.length
    ? detalle.grilla.map((fila, i) => `
      <tr>
        ${cfg.columnas.map(col => `<td>${formatoCelda(col, fila[col])}</td>`).join('')}
        ${cfg.tieneEvidencia ? `<td>${celdaEvidenciaGasto(tipo, i, fila)}</td>` : ''}
        <td class="opciones">
          <button class="btn-accion btn-editar" title="${soloLectura ? 'El reporte ya está en revisión: no se puede editar' : 'Editar'}" ${soloLectura ? 'disabled' : ''} onclick="editarFilaDetalleGasto(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="${colspanVacio}" class="submodulo-tabla-vacio">Aún no hay gastos reportados por el colaborador.</td></tr>`;
}

// Modal simple con las fotos que el operario adjuntó desde el app (sin
// backend real para archivos, se muestran como placeholders con su nombre).
function verEvidenciaGasto(tipo, indice) {
  const detalle = obtenerDetalleGastoPorTipo(tipo, gastoActivoId);
  const fila = detalle.grilla[indice];
  if (!fila || !fila.evidencia || !fila.evidencia.length) return;

  document.getElementById('evidenciaGastoBody').innerHTML = fila.evidencia.map(nombre => `
    <div class="evidencia-item">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>${nombre}</span>
    </div>`).join('');

  abrirModal('modalVerEvidenciaGasto');
}

// La edición fina de cada fila queda limitada al monto (costo/importe/monto,
// según el tipo): el resto de datos de la fila los origina el colaborador
// desde la app móvil (fuera del alcance de esta fase), igual que el criterio
// ya aplicado en el Detalle de Precintos.
function editarFilaDetalleGasto(indice) {
  const detalle = obtenerDetalleGastoPorTipo(gastoActivoTipo, gastoActivoId);
  const cfg = CONFIG_TIPO_GASTO[gastoActivoTipo];
  const fila = detalle.grilla[indice];
  const actual = fila[cfg.campoMonto];

  pedirValorModal('Editar monto', 'Nuevo monto (S/)', Number(actual).toFixed(2), (valor) => {
    const nuevoValor = parseFloat(valor);
    if (isNaN(nuevoValor) || nuevoValor < 0) { mostrarToast('Ingresa un monto válido.'); return; }

    fila[cfg.campoMonto] = nuevoValor;
    // Movilidad muestra además una columna "Total/Día" que refleja el mismo
    // importe reportado por el colaborador para esa fila.
    if (gastoActivoTipo === 'Movilidad') fila.totalDia = nuevoValor;

    renderGrillaDetalleGasto(gastoActivoTipo, detalle, false);
  }, 'number');
}

function grabarDetalleGasto(tipo) {
  const cfg = CONFIG_TIPO_GASTO[tipo];
  const p = cfg.prefijo;
  const montoMaximoInput = document.getElementById(`${p}MontoMaximo`);
  const montoMaximo = parseFloat(montoMaximoInput.value);

  if (isNaN(montoMaximo) || montoMaximo <= 0) {
    mostrarErrorCampo(montoMaximoInput, 'Debe ser mayor a cero');
    montoMaximoInput.focus();
    return;
  }

  const detalle = obtenerDetalleGastoPorTipo(tipo, gastoActivoId);
  detalle.montoMaximo = montoMaximo;

  cerrarModal(MODAL_POR_TIPO[tipo]);
  renderTablaGastosOperativos();
  mostrarModalGuardado('editar', null, () => {});
}

// Etiquetas de columna para la impresión (descargarReporteGasto) — mismas
// que usan los <thead> de los 3 modales, centralizadas acá porque cada tipo
// solo usa un subconjunto.
const ETIQUETA_COLUMNA_GASTO = {
  fecha: 'Fecha', comida: 'Comida', lugar: 'Lugar', cliente: 'Cliente', operacionPer: 'Operación/Per', hora: 'Hora', costo: 'Costo',
  empresa: 'Empresa', distritoPartida: 'Distrito de Partida', distritoDestino: 'Distrito de Destino', motivo: 'Motivo', importeDia: 'Importe/Día', totalDia: 'Total/Día',
  dia: 'Día', operacion: 'Operación', buque: 'Buque', detalle: 'Detalle', monto: 'Monto'
};

// Descarga = imprimir el reporte como PDF, mismo criterio que ya usa
// Precintos (descargarRegistroPrecintos en generar-registro-precintos.js):
// sin backend para generar un documento aparte, se apoya en el diálogo de
// impresión del navegador. Solo disponible una vez Revisado (cerrado) — antes
// de eso el reporte todavía puede cambiar.
function descargarReporteGasto(tipo, id) {
  const gasto = obtenerGastoPorId(id);
  const detalle = obtenerDetalleGastoPorTipo(tipo, id);
  if (!gasto || !detalle || gasto.estado !== 'revisado') {
    mostrarToast('El reporte debe estar Revisado para poder descargarlo.');
    return;
  }

  const cfg = CONFIG_TIPO_GASTO[tipo];
  const headers = cfg.columnas.map(col => ETIQUETA_COLUMNA_GASTO[col] || col);
  const filasHTML = detalle.grilla.map(fila => `
    <tr>${cfg.columnas.map(col => `<td>${col === cfg.campoMonto ? 'S/ ' + Number(fila[col]).toFixed(2) : fila[col]}</td>`).join('')}</tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>${tipo} — ${detalle.numero}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 4px; }
      p    { font-size: 11px; color: #555; margin: 0 0 14px; }
      .membrete { font-size: 10px; color: #777; margin-bottom: 10px; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 7px 10px; text-align: left;
             font-size: 9px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 7px 10px; border-bottom: 1px solid #eee; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <p class="membrete">${EMPRESA_GASTOS.razonSocial} — RUC ${EMPRESA_GASTOS.ruc}</p>
    <h2>Reporte de ${tipo} — ${detalle.numero}</h2>
    <p>${gasto.nombre} ${gasto.apellido} · ${detalle.fechaInicio} al ${detalle.fechaFin}</p>
    <table>
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${filasHTML}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function revisarDetalleGasto(tipo) {
  confirmarAccion('¿Confirma marcar este registro como Revisado? Se notificará al operador para que confirme su parte, y ya no podrá modificarse.', () => {
    const detalle = obtenerDetalleGastoPorTipo(tipo, gastoActivoId);
    const gasto = obtenerGastoPorId(gastoActivoId);
    const sesion = obtenerUsuarioActual();

    detalle.estado = 'revisadoSupervisor';
    detalle.revisadoSupervisorPor = sesion ? sesion.usuario : null;
    detalle.revisadoSupervisorFecha = fechaHoraActualGastos();
    gasto.estado = 'revisadoSupervisor';

    notificarOperadorRevisionGasto(gasto, tipo);

    cerrarModal(MODAL_POR_TIPO[tipo]);
    renderTablaGastosOperativos();
    mostrarToast('El registro fue marcado como Revisado y se notificó al operador.');
  });
}

// Aviso en la campana (notifUpsertar en main.js) para que el operador sepa
// que su reporte ya fue revisado por el supervisor y confirme su parte.
// Mismo id siempre que este gasto llegue a este estado, así reabrir y
// volver a marcar Revisado actualiza el aviso en vez de duplicarlo.
function notificarOperadorRevisionGasto(gasto, tipo) {
  if (typeof notifUpsertar !== 'function') return;
  notifUpsertar({
    id: `gasto_revisar_${gasto.id}`,
    tipo: 'gasto_revisado_supervisor',
    prioridad: 'info',
    titulo: `Tu reporte de ${tipo} fue revisado`,
    mensaje: `${gasto.nombre} ${gasto.apellido} — confirma tu revisión del período ${gasto.fechaDesde} al ${gasto.fechaHasta}.`,
    url: `../GASTOS/registro-gastos-operativos.html?gastoId=${gasto.id}`
  });
}

function confirmarRevisionOperador(tipo) {
  confirmarAccion('¿Confirmas tu revisión de este registro? Quedará cerrado y ya no podrá modificarse.', () => {
    const detalle = obtenerDetalleGastoPorTipo(tipo, gastoActivoId);
    const gasto = obtenerGastoPorId(gastoActivoId);
    const sesion = obtenerUsuarioActual();

    detalle.estado = 'revisado';
    detalle.revisadoOperadorPor = sesion ? sesion.usuario : detalle.firmaTrabajador;
    detalle.revisadoOperadorFecha = fechaHoraActualGastos();
    gasto.estado = 'revisado';

    if (typeof notifEliminar === 'function') notifEliminar(`gasto_revisar_${gasto.id}`);

    cerrarModal(MODAL_POR_TIPO[tipo]);
    renderTablaGastosOperativos();
    mostrarToast('Tu revisión quedó confirmada. El registro está cerrado.');
  });
}
