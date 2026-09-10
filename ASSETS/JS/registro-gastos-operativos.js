// =================================================
// REGISTRO-GASTOS-OPERATIVOS.JS
// Precintos > Registro de Gastos Operativos: grilla principal + filtros,
// y el modal de "Configuración de Límites para Gastos".
// La lógica de los 3 modales de Detalle (Alimentos/Movilidad/Días a Bordo)
// vive en detalle-gastos.js.
// =================================================

let rangoDiasSeleccionados = [];   // días marcados en "Agregar rango" (Días a Bordo, aún sin guardar)

document.addEventListener('DOMContentLoaded', () => {
  renderTablaGastosOperativos();
});

/* =================================================
   GRILLA PRINCIPAL
================================================= */
function renderTablaGastosOperativos() {
  const texto = document.getElementById('searchGastos').value.trim().toLowerCase();
  const desde = document.getElementById('filterFechaDesdeGastos').value;
  const hasta = document.getElementById('filterFechaHastaGastos').value;
  const tipo = document.getElementById('filterTipoGastos').value;
  const estado = document.getElementById('filterEstadoGastos').value;

  const filas = GASTOS_OPERATIVOS_DEMO.filter(g => {
    if (texto && !`${g.nombre} ${g.apellido}`.toLowerCase().includes(texto)) return false;
    if (tipo && g.tipo !== tipo) return false;
    if (estado && g.estado !== estado) return false;
    if (desde && fechaDDMMYYYYaISO(g.fechaDesde) < desde) return false;
    if (hasta && fechaDDMMYYYYaISO(g.fechaHasta) > hasta) return false;
    return true;
  });

  const tbody = document.getElementById('tbodyGastosOperativos');

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="submodulo-tabla-vacio">No se encontraron registros de gastos operativos.</td></tr>`;
    return;
  }

  const badgePorEstado = { activo: 'badge-activo', inactivo: 'badge-inactivo', revisado: 'badge-revisado' };
  const etiquetaPorEstado = { activo: 'Activo', inactivo: 'Inactivo', revisado: 'Revisado' };

  tbody.innerHTML = filas.map((g, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${g.nombre}</td>
      <td>${g.apellido}</td>
      <td>${g.area}</td>
      <td>${g.fechaDesde}</td>
      <td>${g.fechaHasta}</td>
      <td>${g.tipo}</td>
      <td><span class="badge ${badgePorEstado[g.estado]}"><span class="badge-dot"></span>${etiquetaPorEstado[g.estado]}</span></td>
      <td class="opciones">
        <button class="btn-accion btn-editar" title="Editar" onclick="abrirDetalleGasto(${g.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

function filtrarGastosOperativos() {
  renderTablaGastosOperativos();
}

function limpiarFiltrosGastos() {
  document.getElementById('searchGastos').value = '';
  document.getElementById('filterFechaDesdeGastos').value = '';
  document.getElementById('filterFechaHastaGastos').value = '';
  document.getElementById('filterTipoGastos').value = '';
  document.getElementById('filterEstadoGastos').value = '';
  renderTablaGastosOperativos();
}

/* =================================================
   MODAL: CONFIGURACIÓN DE LÍMITES PARA GASTOS
================================================= */
function cambiarTabLimites(tab) {
  document.querySelectorAll('.limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.tab === tab));
  document.getElementById('limitesPanelAlimentos').classList.toggle('activo', tab === 'alimentos');
  document.getElementById('limitesPanelMovilidad').classList.toggle('activo', tab === 'movilidad');
  document.getElementById('limitesPanelDiasABordo').classList.toggle('activo', tab === 'diasABordo');
}

function renderChipsDiasSemana() {
  const cont = document.getElementById('diasSemanaChipsNuevoRango');
  cont.innerHTML = DIAS_SEMANA.map(dia => `
    <label class="dia-chip">
      <input type="checkbox" value="${dia}" onchange="toggleDiaSeleccionado('${dia}', this.checked)">
      ${dia}
    </label>`).join('');
}

function toggleDiaSeleccionado(dia, marcado) {
  if (marcado) {
    if (!rangoDiasSeleccionados.includes(dia)) rangoDiasSeleccionados.push(dia);
  } else {
    rangoDiasSeleccionados = rangoDiasSeleccionados.filter(d => d !== dia);
  }
}

function renderListaRangosDiasABordo() {
  const cont = document.getElementById('listaRangosDiasABordo');
  const rangos = LIMITES_GASTOS_DEMO.diasABordo.rangos;
  cont.innerHTML = rangos.length
    ? rangos.map(r => `
      <div class="rango-dias-row">
        <span class="rango-dias-lista">${r.dias.join(', ')}</span>
        <span class="rango-dias-monto">S/ ${Number(r.monto).toFixed(2)}</span>
        <button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarRangoDiasABordo(${r.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>`).join('')
    : `<p class="submodulo-tabla-vacio">Aún no se agregaron rangos.</p>`;
}

function agregarRangoDiasABordo() {
  const montoInput = document.getElementById('nuevoRangoMonto');
  const monto = parseFloat(montoInput.value);

  if (!rangoDiasSeleccionados.length) { mostrarToast('Selecciona al menos un día de la semana.'); return; }
  if (isNaN(monto) || monto <= 0) { mostrarToast('Ingresa un monto de rango válido, mayor a cero.'); return; }

  // Un mismo día de la semana no puede pertenecer a más de un rango a la vez.
  const diasYaUsados = LIMITES_GASTOS_DEMO.diasABordo.rangos.flatMap(r => r.dias);
  const conflicto = rangoDiasSeleccionados.find(d => diasYaUsados.includes(d));
  if (conflicto) { mostrarToast(`El día "${conflicto}" ya pertenece a otro rango.`); return; }

  const nuevoId = (Math.max(0, ...LIMITES_GASTOS_DEMO.diasABordo.rangos.map(r => r.id)) || 0) + 1;
  LIMITES_GASTOS_DEMO.diasABordo.rangos.push({ id: nuevoId, dias: [...rangoDiasSeleccionados], monto });

  rangoDiasSeleccionados = [];
  montoInput.value = '';
  renderChipsDiasSemana();
  renderListaRangosDiasABordo();
}

function quitarRangoDiasABordo(id) {
  LIMITES_GASTOS_DEMO.diasABordo.rangos = LIMITES_GASTOS_DEMO.diasABordo.rangos.filter(r => r.id !== id);
  renderListaRangosDiasABordo();
}

function renderTablaDiasEspeciales() {
  const tbody = document.getElementById('tbodyDiasEspeciales');
  const dias = LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales;
  tbody.innerHTML = dias.length
    ? dias.map(d => `
      <tr>
        <td>${d.fecha}</td>
        <td>S/ ${Number(d.monto).toFixed(2)}</td>
        <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarDiaEspecial(${d.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button></td>
      </tr>`).join('')
    : `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron días especiales.</td></tr>`;
}

function agregarDiaEspecial() {
  const fechaInput = document.getElementById('nuevoDiaEspecialFecha');
  const montoInput = document.getElementById('nuevoDiaEspecialMonto');
  const monto = parseFloat(montoInput.value);

  if (!fechaInput.value) { mostrarToast('Selecciona una fecha para el día especial.'); return; }
  if (isNaN(monto) || monto <= 0) { mostrarToast('Ingresa un monto válido, mayor a cero.'); return; }

  const fechaFormateada = fechaISOaDDMMYYYY(fechaInput.value);
  const duplicada = LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales.some(d => d.fecha === fechaFormateada);
  if (duplicada) { mostrarToast('Esa fecha ya está registrada como día especial.'); return; }

  const nuevoId = (Math.max(0, ...LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales.map(d => d.id)) || 0) + 1;
  LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales.push({ id: nuevoId, fecha: fechaFormateada, monto });

  fechaInput.value = '';
  montoInput.value = '';
  renderTablaDiasEspeciales();
}

function quitarDiaEspecial(id) {
  LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales = LIMITES_GASTOS_DEMO.diasABordo.diasEspeciales.filter(d => d.id !== id);
  renderTablaDiasEspeciales();
}

function abrirModalConfiguracionLimites() {
  const cfg = LIMITES_GASTOS_DEMO;
  const u = obtenerUsuarioPorNombre(cfg.modificadoPor);
  document.getElementById('limitesModificadoPor').textContent = u ? `${u.nombre} ${u.apellido}` : cfg.modificadoPor;
  document.getElementById('limitesFechaModificacion').textContent = cfg.fechaModificacion;

  document.getElementById('limAlimentosDesayuno').value = cfg.alimentos.desayuno;
  document.getElementById('limAlimentosDesayunoAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorDesayuno).toFixed(2)}`;
  document.getElementById('limAlimentosAlmuerzo').value = cfg.alimentos.almuerzo;
  document.getElementById('limAlimentosAlmuerzoAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorAlmuerzo).toFixed(2)}`;
  document.getElementById('limAlimentosCena').value = cfg.alimentos.cena;
  document.getElementById('limAlimentosCenaAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorCena).toFixed(2)}`;
  document.getElementById('limAlimentosMaximoDia').value = cfg.alimentos.montoMaximoDia;

  document.getElementById('limMovilidadMaximoDia').value = cfg.movilidad.montoMaximoDia;
  document.getElementById('limMovilidadMaximoDiaAnterior').textContent = `S/ ${Number(cfg.movilidad.montoAnteriorDia).toFixed(2)}`;
  document.getElementById('limMovilidadMaximoViaje').value = cfg.movilidad.montoMaximoViaje;
  document.getElementById('limMovilidadMaximoViajeAnterior').textContent = `S/ ${Number(cfg.movilidad.montoAnteriorViaje).toFixed(2)}`;

  rangoDiasSeleccionados = [];
  renderChipsDiasSemana();
  renderListaRangosDiasABordo();
  renderTablaDiasEspeciales();

  cambiarTabLimites('alimentos');
  abrirModal('modalConfiguracionLimites');
}

function guardarConfiguracionLimites() {
  const campos = [
    document.getElementById('limAlimentosDesayuno'), document.getElementById('limAlimentosAlmuerzo'),
    document.getElementById('limAlimentosCena'), document.getElementById('limAlimentosMaximoDia'),
    document.getElementById('limMovilidadMaximoDia'), document.getElementById('limMovilidadMaximoViaje')
  ];

  for (const campo of campos) {
    const valor = parseFloat(campo.value);
    if (isNaN(valor) || valor <= 0) {
      mostrarErrorCampo(campo, 'Debe ser mayor a cero');
      campo.focus();
      return;
    }
  }

  const cfg = LIMITES_GASTOS_DEMO;
  cfg.alimentos.montoAnteriorDesayuno = cfg.alimentos.desayuno;
  cfg.alimentos.montoAnteriorAlmuerzo = cfg.alimentos.almuerzo;
  cfg.alimentos.montoAnteriorCena = cfg.alimentos.cena;
  cfg.alimentos.desayuno = parseFloat(document.getElementById('limAlimentosDesayuno').value);
  cfg.alimentos.almuerzo = parseFloat(document.getElementById('limAlimentosAlmuerzo').value);
  cfg.alimentos.cena = parseFloat(document.getElementById('limAlimentosCena').value);
  cfg.alimentos.montoMaximoDia = parseFloat(document.getElementById('limAlimentosMaximoDia').value);

  cfg.movilidad.montoAnteriorDia = cfg.movilidad.montoMaximoDia;
  cfg.movilidad.montoAnteriorViaje = cfg.movilidad.montoMaximoViaje;
  cfg.movilidad.montoMaximoDia = parseFloat(document.getElementById('limMovilidadMaximoDia').value);
  cfg.movilidad.montoMaximoViaje = parseFloat(document.getElementById('limMovilidadMaximoViaje').value);

  const sesion = obtenerUsuarioActual();
  cfg.modificadoPor = sesion ? sesion.usuario : cfg.modificadoPor;
  cfg.fechaModificacion = fechaHoraActualGastos();

  cerrarModal('modalConfiguracionLimites');
  mostrarToast('La configuración de límites fue guardada correctamente.');
}

function fechaHoraActualGastos() {
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(ahora.getDate())}/${pad(ahora.getMonth() + 1)}/${ahora.getFullYear()} ${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}
