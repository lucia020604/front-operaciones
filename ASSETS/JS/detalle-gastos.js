// =================================================
// DETALLE-GASTOS.JS
// Lógica compartida de los 3 modales de Detalle de "Registro de Gastos
// Operativos" (Alimentos / Movilidad / Días a Bordo). Cada tipo tiene su
// propio modal y su propia grilla (columnas distintas, según el documento
// funcional), pero comparten el mismo patrón: encabezado + colaborador +
// consideraciones + grilla + firma del operador.
//
// PROMPT_GASTOS_JORNADA_SPRINT4 §4: la web es SOLO VER Y DESCARGAR — el
// supervisor ya no puede editar Monto Máximo, ningún monto puntual de la
// grilla, ni ajustar/excluir días de Días a Bordo. El colaborador registra
// todo desde el app móvil (con su propio bloqueo por plazo de olvidos, ver
// gastos-movil.js); acá solo queda consultar y descargar.
// =================================================

let gastoActivoId = null;
let gastoActivoTipo = null;

// "codigoCol"/"agregadoCol" (PROMPT_GASTOS_PANTALLAS_JORNADA_SPRINT4 §1/§6):
// código único de jornada+tipo y si fue un gasto olvidado — mismos campos
// que ya ve el móvil (codigoJornada/codigo y agregadoPosterior en cada
// fila), la web solo los muestra, nunca los edita.
const CONFIG_TIPO_GASTO = {
  Alimentos: {
    prefijo: 'alimentos', fuenteDetalle: DETALLE_ALIMENTOS_DEMO,
    // Una fila por comida (Desayuno/Almuerzo/Cena) — así lo carga el
    // operario desde el app, ver DETALLE_ALIMENTOS_DEMO en data-gastos.js.
    // "operacionesCol" (PROMPT_GASTOS_PENDIENTES_SPRINT4 §3): Cliente y
    // Operación/Per se guardan por separado (Excel/PDF los necesita así,
    // misma plantilla de siempre) pero en la web se muestran juntos como
    // "PER · Cliente" — ver textoOperacionesDesdeFila más abajo.
    columnas: ['fecha', 'comida', 'lugar', 'operacionesCol', 'hora', 'costo', 'codigoCol', 'agregadoCol'],
    campoMonto: 'costo', tieneBaseLegal: true, tieneEvidencia: true, tbody: 'tbodyAlimentosGrilla'
  },
  Movilidad: {
    prefijo: 'movilidad', fuenteDetalle: DETALLE_MOVILIDAD_DEMO,
    columnas: ['fecha', 'empresa', 'distritoPartida', 'distritoDestino', 'motivo', 'importeDia', 'totalDia', 'codigoCol', 'agregadoCol'],
    campoMonto: 'importeDia', tieneBaseLegal: true, tieneEvidencia: true, tbody: 'tbodyMovilidadGrilla'
  },
  'Días a Bordo': {
    prefijo: 'diasBordo', fuenteDetalle: DETALLE_DIAS_A_BORDO_DEMO,
    // Sin "Cliente": Precintos no lo registra por Uso, casi siempre sale
    // vacío — Operación (Loading/Discharging) sí tiene dato real siempre.
    columnas: ['dia', 'fecha', 'lugar', 'operacion', 'operacionPer', 'buque', 'detalle', 'monto', 'codigoCol'],
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

  document.getElementById(`${p}Titulo`).textContent = `Ver Registro de ${gasto.tipo}`;

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
  // tipo, ya no existe el input en el HTML). Para los otros 2 tipos queda
  // siempre deshabilitado — solo lectura (§4).
  if (gasto.tipo !== 'Días a Bordo') {
    const montoMaximoInput = document.getElementById(`${p}MontoMaximo`);
    montoMaximoInput.value = detalle.montoMaximo;
    montoMaximoInput.disabled = true;
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

// Zipea los campos cliente/operacionPer (unidos con " / " en el mismo orden
// desde que se guardaron, ver guardarGastoAlimentos) en pares "PER · Cliente"
// — mismo formato que textoOperacionesInvolucradas (data-movil.js).
function textoOperacionesDesdeFila(fila) {
  if (!fila.cliente || fila.cliente === '—') return (fila.operacionPer && fila.operacionPer !== '—') ? fila.operacionPer : 'Sin operaciones asignadas';
  const clientes = fila.cliente.split(' / ');
  const pers = (fila.operacionPer || '').split(' / ');
  return clientes.map((c, i) => `${pers[i] || '—'} · ${c}`).join(' / ');
}

function renderGrillaDetalleGasto(tipo, detalle) {
  const cfg = CONFIG_TIPO_GASTO[tipo];
  const tbody = document.getElementById(cfg.tbody);
  const esDiasABordo = tipo === 'Días a Bordo';

  const formatoCelda = (col, valor) => (col === cfg.campoMonto) ? `S/ ${Number(valor).toFixed(2)}` : (valor ?? '—');
  // Sin columna "Opciones" (§4, solo lectura): el colspan del estado vacío
  // ya no suma esa columna.
  const colspanVacio = cfg.columnas.length + (cfg.tieneEvidencia ? 1 : 0);

  tbody.innerHTML = detalle.grilla.length
    ? detalle.grilla.map((fila, i) => `
      <tr>
        ${cfg.columnas.map(col => {
          if (esDiasABordo && col === cfg.campoMonto && fila.pendiente) {
            return `<td><span class="badge badge-por-vencer" title="Falta registrar el tipo de cambio de este Feriado especial en Configuración">Pendiente tipo de cambio</span></td>`;
          }
          if (col === 'operacionesCol') return `<td>${textoOperacionesDesdeFila(fila)}</td>`;
          if (col === 'codigoCol') return `<td>${fila.codigoJornada || fila.codigo || '—'}</td>`;
          if (col === 'agregadoCol') {
            return fila.agregadoPosterior
              ? `<td><span class="badge badge-por-vencer" title="${fila.justificacion || ''}">Agregado posterior</span></td>`
              : `<td><span class="badge badge-gris">No</span></td>`;
          }
          return `<td>${formatoCelda(col, fila[col])}</td>`;
        }).join('')}
        ${cfg.tieneEvidencia ? `<td>${celdaEvidenciaGasto(tipo, i, fila)}</td>` : ''}
      </tr>`).join('')
    : `<tr><td colspan="${colspanVacio}" class="submodulo-tabla-vacio">${esDiasABordo ? 'Este operador no tuvo operaciones en el período.' : 'Aún no hay gastos reportados por el colaborador.'}</td></tr>`;
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

// Etiquetas de columna para la impresión (descargarReporteGasto) — mismas
// que usan los <thead> de los 3 modales, centralizadas acá porque cada tipo
// solo usa un subconjunto.
const ETIQUETA_COLUMNA_GASTO = {
  fecha: 'Fecha', comida: 'Comida', lugar: 'Lugar', cliente: 'Cliente', operacionPer: 'Operación/Per', hora: 'Hora', costo: 'Costo',
  empresa: 'Empresa', distritoPartida: 'Distrito de Partida', distritoDestino: 'Distrito de Destino', motivo: 'Motivo', importeDia: 'Importe/Día', totalDia: 'Total/Día',
  dia: 'Día', operacion: 'Operación', buque: 'Buque', detalle: 'Detalle', monto: 'Monto',
  codigoCol: 'Código', agregadoCol: 'Agregado posterior', operacionesCol: 'Operaciones'
};

// La descarga ya no es por reporte individual desde acá: ahora se hace por
// usuario + tipo + rango de fechas desde la barra de arriba, en Excel o PDF
// (ver exportarGastosExcel/exportarGastosPDF en registro-gastos-operativos.js),
// que reutilizan CONFIG_TIPO_GASTO/ETIQUETA_COLUMNA_GASTO de arriba.
