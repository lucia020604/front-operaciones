// =================================================
// DETALLE-GASTOS.JS
// Lógica compartida de los 3 modales de Detalle de "Registro de Gastos
// Operativos" (Alimentos / Movilidad / Días a Bordo). Cada tipo tiene su
// propio modal y su propia grilla (columnas distintas, según el documento
// funcional), pero comparten el mismo patrón: encabezado + colaborador +
// consideraciones + grilla + firma del trabajador + Grabar/Autorizado.
//
// El botón "Editar" de la grilla principal siempre abre el mismo modal; si
// el registro ya está en estado "Revisado" se abre en modo solo lectura
// (equivalente a la función "Revisar" del documento) y no puede editarse,
// tal como indica la consideración: "No se podrá editar un reporte si está
// en estado Revisado".
// =================================================

let gastoActivoId = null;
let gastoActivoTipo = null;

const CONFIG_TIPO_GASTO = {
  Alimentos: {
    prefijo: 'alimentos', fuenteDetalle: DETALLE_ALIMENTOS_DEMO,
    columnas: ['fecha', 'lugar', 'cliente', 'operacionPer', 'horas', 'costo', 'total'],
    campoMonto: 'costo', tieneBaseLegal: true, tbody: 'tbodyAlimentosGrilla'
  },
  Movilidad: {
    prefijo: 'movilidad', fuenteDetalle: DETALLE_MOVILIDAD_DEMO,
    columnas: ['fecha', 'empresa', 'distritoPartida', 'distritoDestino', 'motivo', 'importeDia', 'totalDia'],
    campoMonto: 'importeDia', tieneBaseLegal: true, tbody: 'tbodyMovilidadGrilla'
  },
  'Días a Bordo': {
    prefijo: 'diasBordo', fuenteDetalle: DETALLE_DIAS_A_BORDO_DEMO,
    columnas: ['dia', 'fecha', 'lugar', 'cliente', 'operacion', 'itsRef', 'buque', 'detalle', 'monto'],
    campoMonto: 'monto', tieneBaseLegal: false, tbody: 'tbodyDiasBordoGrilla'
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
  const soloLectura = gasto.estado === 'revisado';
  const colaborador = COLABORADOR_GASTOS_DEMO[gasto.id] || {};

  document.getElementById(`${p}Titulo`).textContent = soloLectura
    ? `Revisar Registro de ${gasto.tipo}`
    : `Editar Registro de ${gasto.tipo}`;

  document.getElementById(`${p}RazonSocial`).textContent = EMPRESA_GASTOS.razonSocial;
  document.getElementById(`${p}Ruc`).textContent = EMPRESA_GASTOS.ruc;
  document.getElementById(`${p}Numero`).textContent = detalle.numero;
  document.getElementById(`${p}FechaEmision`).textContent = detalle.fechaEmision;
  document.getElementById(`${p}Colaborador`).textContent = `${gasto.nombre} ${gasto.apellido}`;
  document.getElementById(`${p}Cargo`).textContent = colaborador.cargo || '—';
  document.getElementById(`${p}DocIdentidad`).textContent = colaborador.docIdentidad || '—';
  document.getElementById(`${p}CentroCosto`).textContent = colaborador.centroCosto || '—';
  document.getElementById(`${p}Area`).textContent = gasto.area;

  const montoMaximoInput = document.getElementById(`${p}MontoMaximo`);
  montoMaximoInput.value = detalle.montoMaximo;
  montoMaximoInput.disabled = soloLectura;
  document.getElementById(`${p}FechaInicio`).textContent = detalle.fechaInicio;
  document.getElementById(`${p}FechaFin`).textContent = detalle.fechaFin;

  renderGrillaDetalleGasto(gasto.tipo, detalle, soloLectura);

  const u = obtenerUsuarioPorNombre(detalle.firmaTrabajador);
  const firma = obtenerFirmaUsuario(u);
  const boxFirma = document.getElementById(`${p}FirmaBox`);
  boxFirma.classList.toggle('firmado', !!firma);
  boxFirma.innerHTML = `
    <span class="firma-box-titulo">Firma del trabajador</span>
    ${firma ? `<img src="${firma}" alt="Firma">` : `<span class="firma-box-sinfirma">${u ? (u.nombre + ' ' + u.apellido) : (detalle.firmaTrabajador || 'El colaborador')} aún no tiene una firma registrada. Se carga desde Configuración &gt; Usuarios.</span>`}
    ${u ? `<span class="firma-box-meta"><strong>${u.nombre} ${u.apellido}</strong></span>` : ''}
  `;

  if (cfg.tieneBaseLegal) {
    document.getElementById(`${p}BaseLegal`).textContent = BASE_LEGAL_GASTOS;
  }

  const btnAutorizado = document.getElementById(`${p}BtnAutorizado`);
  const btnGrabar = document.getElementById(`${p}BtnGrabar`);
  btnAutorizado.style.display = soloLectura ? 'none' : '';
  btnGrabar.style.display = soloLectura ? 'none' : '';

  abrirModal(MODAL_POR_TIPO[gasto.tipo]);
}

function renderGrillaDetalleGasto(tipo, detalle, soloLectura) {
  const cfg = CONFIG_TIPO_GASTO[tipo];
  const tbody = document.getElementById(cfg.tbody);

  const formatoCelda = (col, valor) => (col === cfg.campoMonto) ? `S/ ${Number(valor).toFixed(2)}` : valor;

  tbody.innerHTML = detalle.grilla.length
    ? detalle.grilla.map((fila, i) => `
      <tr>
        ${cfg.columnas.map(col => `<td>${formatoCelda(col, fila[col])}</td>`).join('')}
        <td class="opciones">
          <button class="btn-accion btn-editar" title="Editar" ${soloLectura ? 'disabled style="opacity:.4;cursor:not-allowed;"' : ''} onclick="editarFilaDetalleGasto(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="${cfg.columnas.length + 1}" class="submodulo-tabla-vacio">Aún no hay gastos reportados por el colaborador.</td></tr>`;
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

  const nuevoValorTexto = prompt('Nuevo monto (S/):', Number(actual).toFixed(2));
  if (nuevoValorTexto === null) return;
  const nuevoValor = parseFloat(nuevoValorTexto);
  if (isNaN(nuevoValor) || nuevoValor < 0) { mostrarToast('Ingresa un monto válido.'); return; }

  fila[cfg.campoMonto] = nuevoValor;
  // Alimentos y Movilidad muestran además una columna "Total" que refleja el
  // mismo importe reportado por el colaborador para esa fila.
  if (gastoActivoTipo === 'Alimentos') fila.total = nuevoValor;
  if (gastoActivoTipo === 'Movilidad') fila.totalDia = nuevoValor;

  renderGrillaDetalleGasto(gastoActivoTipo, detalle, false);
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

function autorizarDetalleGasto(tipo) {
  confirmarAccion('¿Confirma marcar este registro como Revisado? Ya no podrá modificarse.', () => {
    const detalle = obtenerDetalleGastoPorTipo(tipo, gastoActivoId);
    const gasto = obtenerGastoPorId(gastoActivoId);

    detalle.estado = 'revisado';
    detalle.revisadoFecha = fechaHoraActualGastos();
    gasto.estado = 'revisado';

    cerrarModal(MODAL_POR_TIPO[tipo]);
    renderTablaGastosOperativos();
    mostrarToast('El registro fue marcado como Revisado correctamente.');
  });
}
