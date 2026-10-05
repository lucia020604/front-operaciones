// =================================================
// DETALLE-GASTOS.JS
// Lógica compartida de los 3 modales de Detalle de "Registro de Gastos
// Operativos" (Alimentos / Movilidad / Días a Bordo). Cada tipo tiene su
// propio modal y su propia grilla (columnas distintas, según el documento
// funcional), pero comparten el mismo patrón: encabezado + colaborador +
// consideraciones + grilla + firma del operador + "Grabar".
//
// No hay flujo de aprobación: el colaborador registra desde el app móvil y
// el supervisor puede modificar el monto máximo y cualquier monto puntual de
// la grilla en cualquier momento — "Grabar" es la única acción de guardado,
// siempre disponible.
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

  // Días a Bordo ya no se registra a mano: se regenera sola cada vez que se
  // abre (Sprint 4 §1.2) — así un cambio de tarifa/tipo de cambio hecho
  // después de crear el período se ve sin que nadie tenga que recargar nada.
  if (gasto.tipo === 'Días a Bordo') regenerarDiasABordo(gasto.id);

  const detalle = obtenerDetalleGastoPorTipo(gasto.tipo, gasto.id);
  if (!detalle) { mostrarToast('Este registro aún no tiene información ingresada por el colaborador.'); return; }

  gastoActivoId = gasto.id;
  gastoActivoTipo = gasto.tipo;

  const cfg = CONFIG_TIPO_GASTO[gasto.tipo];
  const p = cfg.prefijo;
  const colaborador = COLABORADOR_GASTOS_DEMO[gasto.id] || {};

  document.getElementById(`${p}Titulo`).textContent = gasto.tipo === 'Días a Bordo' ? 'Ver Registro de Días a Bordo' : `Editar Registro de ${gasto.tipo}`;

  // Razón social/RUC ya no se muestran en el modal (solo tienen sentido en
  // el documento impreso/descargado, ver descargarReporteGasto) — acá basta
  // con el N° en el título, mismo patrón que "Generar Registro de Precintos".
  document.getElementById(`${p}Numero`).textContent = `— ${detalle.numero}`;
  document.getElementById(`${p}FechaEmision`).textContent = detalle.fechaEmision;
  document.getElementById(`${p}Colaborador`).textContent = `${gasto.nombre} ${gasto.apellido}`;
  document.getElementById(`${p}Cargo`).textContent = colaborador.cargo || '—';
  document.getElementById(`${p}DocIdentidad`).textContent = colaborador.docIdentidad || '—';
  document.getElementById(`${p}Area`).textContent = gasto.area;

  // Monto Máximo no aplica a Días a Bordo (§1.1: se quitó de la UI de ese
  // tipo, ya no existe el input en el HTML).
  if (gasto.tipo !== 'Días a Bordo') {
    const montoMaximoInput = document.getElementById(`${p}MontoMaximo`);
    montoMaximoInput.value = detalle.montoMaximo;
    montoMaximoInput.disabled = false;
  }
  document.getElementById(`${p}FechaInicio`).textContent = detalle.fechaInicio;
  document.getElementById(`${p}FechaFin`).textContent = detalle.fechaFin;

  renderGrillaDetalleGasto(gasto.tipo, detalle);

  renderFirmaBoxOperadorGasto(`${p}FirmaOperadorBox`, detalle);

  if (cfg.tieneBaseLegal) {
    document.getElementById(`${p}BaseLegal`).textContent = BASE_LEGAL_GASTOS;
  }

  abrirModal(MODAL_POR_TIPO[gasto.tipo]);
}

// Firma del trabajador: imagen registrada en Configuración > Usuarios (o, a
// futuro, la que genere la validación por huella desde el app móvil) — acá
// es puramente informativa, no una acción de aprobación.
function renderFirmaBoxOperadorGasto(contenedorId, detalle) {
  const box = document.getElementById(contenedorId);
  if (!box) return;

  const u = obtenerUsuarioPorNombre(detalle.firmaTrabajador);
  const firma = obtenerFirmaUsuario(u);
  box.classList.toggle('firmado', !!firma);

  box.innerHTML = `
    <span class="firma-box-titulo">Firma del Operador</span>
    ${firma ? `<img src="${firma}" alt="Firma">` : `<span class="firma-box-sinfirma">${u ? (u.nombre + ' ' + u.apellido) : (detalle.firmaTrabajador || 'El colaborador')} aún no tiene una firma registrada. Se carga desde Configuración &gt; Usuarios.</span>`}
    <span class="firma-box-meta"><strong>${u ? u.nombre + ' ' + u.apellido : detalle.firmaTrabajador}</strong></span>
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

// Días a Bordo: "Editar" ajusta el monto de ESE día (queda guardado en
// detalle.overrides, ver regenerarDiasABordo) y "Excluir" lo saca del
// período — identificados por fecha (no por índice: la grilla se recalcula
// entera cada vez que se abre/descarga, el índice no es estable). Un día
// "Pendiente tipo de cambio" (Feriado especial sin TC registrado todavía)
// no se puede editar hasta que alguien con permiso lo registre en
// Configuración (ver renderAlertaTipoCambioHoy).
function celdaOpcionesDiasABordo(fila) {
  return `
    <button class="btn-accion btn-editar" title="Editar monto" onclick="editarMontoDiaABordo('${fila.fecha}')" ${fila.pendiente ? 'disabled' : ''}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
    </button>
    <button class="btn-accion btn-eliminar" title="Excluir del período" onclick="excluirDiaABordo('${fila.fecha}')">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button>`;
}

function renderGrillaDetalleGasto(tipo, detalle) {
  const cfg = CONFIG_TIPO_GASTO[tipo];
  const tbody = document.getElementById(cfg.tbody);
  const esDiasABordo = tipo === 'Días a Bordo';

  const formatoCelda = (col, valor) => (col === cfg.campoMonto) ? `S/ ${Number(valor).toFixed(2)}` : (valor ?? '—');
  const colspanVacio = cfg.columnas.length + 1 + (cfg.tieneEvidencia ? 1 : 0);

  tbody.innerHTML = detalle.grilla.length
    ? detalle.grilla.map((fila, i) => `
      <tr>
        ${cfg.columnas.map(col => {
          if (esDiasABordo && col === cfg.campoMonto && fila.pendiente) {
            return `<td><span class="badge badge-por-vencer" title="Falta registrar el tipo de cambio de este Feriado especial en Configuración">Pendiente tipo de cambio</span></td>`;
          }
          return `<td>${formatoCelda(col, fila[col])}</td>`;
        }).join('')}
        ${cfg.tieneEvidencia ? `<td>${celdaEvidenciaGasto(tipo, i, fila)}</td>` : ''}
        <td class="opciones">${esDiasABordo
          ? celdaOpcionesDiasABordo(fila)
          : `<button class="btn-accion btn-editar" title="Editar" onclick="editarFilaDetalleGasto(${i})">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
            </button>`}
        </td>
      </tr>`).join('')
    : `<tr><td colspan="${colspanVacio}" class="submodulo-tabla-vacio">${esDiasABordo ? 'Este operador no tuvo operaciones en el período.' : 'Aún no hay gastos reportados por el colaborador.'}</td></tr>`;
}

function editarMontoDiaABordo(fechaDDMMYYYY) {
  const detalle = obtenerDetalleGastoPorTipo('Días a Bordo', gastoActivoId);
  const fila = detalle.grilla.find(f => f.fecha === fechaDDMMYYYY);
  if (!fila) return;

  pedirValorModal('Editar monto', `Nuevo monto del ${fechaDDMMYYYY} (S/)`, Number(fila.monto).toFixed(2), (valor) => {
    const nuevo = parseFloat(valor);
    if (isNaN(nuevo) || nuevo < 0) { mostrarToast('Ingresa un monto válido.'); return; }

    if (!detalle.overrides) detalle.overrides = {};
    detalle.overrides[fechaDDMMYYYY] = { monto: nuevo };
    regenerarDiasABordo(gastoActivoId);
    guardarEstadoGastos();
    renderGrillaDetalleGasto('Días a Bordo', obtenerDetalleGastoPorTipo('Días a Bordo', gastoActivoId));
  }, 'number');
}

function excluirDiaABordo(fechaDDMMYYYY) {
  confirmarAccion(`¿Excluir el ${fechaDDMMYYYY} de este período de Días a Bordo?`, () => {
    const detalle = obtenerDetalleGastoPorTipo('Días a Bordo', gastoActivoId);
    if (!detalle.overrides) detalle.overrides = {};
    detalle.overrides[fechaDDMMYYYY] = { excluido: true };
    regenerarDiasABordo(gastoActivoId);
    guardarEstadoGastos();
    renderGrillaDetalleGasto('Días a Bordo', obtenerDetalleGastoPorTipo('Días a Bordo', gastoActivoId));
    renderTablaGastosOperativos();
  });
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

    renderGrillaDetalleGasto(gastoActivoTipo, detalle);
  }, 'number');
}

function grabarDetalleGasto(tipo) {
  const cfg = CONFIG_TIPO_GASTO[tipo];
  const p = cfg.prefijo;

  // Días a Bordo no tiene Monto Máximo que validar/guardar — sus ediciones
  // (monto por día / excluir) ya quedaron guardadas al vuelo en
  // detalle.overrides (ver editarMontoDiaABordo/excluirDiaABordo), "Grabar"
  // acá solo cierra el modal.
  if (tipo !== 'Días a Bordo') {
    const montoMaximoInput = document.getElementById(`${p}MontoMaximo`);
    const montoMaximo = parseFloat(montoMaximoInput.value);

    if (isNaN(montoMaximo) || montoMaximo <= 0) {
      mostrarErrorCampo(montoMaximoInput, 'Debe ser mayor a cero');
      montoMaximoInput.focus();
      return;
    }

    const detalle = obtenerDetalleGastoPorTipo(tipo, gastoActivoId);
    detalle.montoMaximo = montoMaximo;
  }

  guardarEstadoGastos();
  cerrarModal(MODAL_POR_TIPO[tipo]);
  renderTablaGastosOperativos();
  // Si el selector "Editar Gastos del Operador" sigue abierto debajo (ver
  // registro-gastos-operativos.js), refresca sus montos también.
  if (typeof renderTablaEditarGastosOperador === 'function') renderTablaEditarGastosOperador();
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

// La descarga ya no es por reporte individual desde acá: ahora se hace por
// usuario + tipo + rango de fechas desde la barra de arriba, en Excel o PDF
// (ver exportarGastosExcel/exportarGastosPDF en registro-gastos-operativos.js),
// que reutilizan CONFIG_TIPO_GASTO/ETIQUETA_COLUMNA_GASTO de arriba.
