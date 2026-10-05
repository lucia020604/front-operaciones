// =================================================
// GASTOS-MOVIL.JS
// App Móvil > Generar Reporte + Reportes (Sprint 4 Fase 2/3) — solo
// operadores/inspectores, misma sesión que Precintos
// (sessionStorage.sesionUsuario). Alimentos y Movilidad se registran acá;
// Días a Bordo es de solo lectura (se genera solo, ver data-gastos.js →
// generarDiasABordoOperador). Todo lo que se guarda va a las mismas
// estructuras que lee Registro de Gastos Operativos (DETALLE_*_DEMO vía
// asegurarReporteGasto/guardarEstadoGastos), para que el supervisor lo vea
// de inmediato.
//
// Un solo archivo sirve DOS páginas (gastos-movil.html "Generar Reporte" y
// reportes-movil.html "Reportes"): cada función de render consulta primero
// si el elemento de SU página existe antes de tocarlo, así cualquiera de
// las dos puede cargar este script sin que la otra reviente por un id que
// no tiene.
//
// Reportes > Descargar: el operador valida su huella (simulado, igual que
// la geolocalización simulada de Operaciones) y el sistema firma y genera
// el mismo archivo que vería el supervisor (ver descarga-gastos.js) — con
// la misma marca de agua de "descargado desde este sistema". El operador
// lo sube él mismo a su otro aplicativo.
// =================================================

function actualizarHoraStatusBarGastos() {
  const el = document.getElementById('horaStatusBar');
  if (!el) return;
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  el.textContent = `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`;
}
actualizarHoraStatusBarGastos();
setInterval(actualizarHoraStatusBarGastos, 15000);

// Período + ids de ESTE operador resueltos una vez al cargar la página (ver
// asegurarReporteGasto, data-gastos.js) — todo el módulo guarda/lee contra
// estos 3 ids mientras la página está abierta.
let gastosMovilPeriodo = null;
let gastosMovilUsuario = null;

function inicializarGastosMovil() {
  const sesion = obtenerUsuarioActual();
  if (!sesion) { window.location.href = 'login-movil.html'; return; }
  gastosMovilUsuario = sesion.usuario;

  const hoyISO = new Date().toISOString().slice(0, 10);
  gastosMovilPeriodo = asegurarReporteGasto(gastosMovilUsuario, hoyISO);
  guardarEstadoGastos();

  const elPeriodo = document.getElementById('gastosPeriodoRango');
  if (elPeriodo) elPeriodo.textContent = `${gastosMovilPeriodo.fechaDesde} al ${gastosMovilPeriodo.fechaHasta}`;

  renderTarjetasGastos();
  renderReportesAccordion();

  // "Si faltan, pedirlos una vez" (§2 Fase 2): Cargo/Doc. Identidad del
  // colaborador — asegurarEncabezadoColaboradorGastos ya intentó resolver
  // el DNI desde el perfil de Precintos; si de verdad no hay nada, se pide
  // (solo en la página que tiene este modal, "Generar Reporte").
  const colaborador = COLABORADOR_GASTOS_DEMO[gastosMovilPeriodo.ids['Alimentos']] || {};
  if ((!colaborador.cargo || !colaborador.docIdentidad) && document.getElementById('encabezadoCargoInput')) {
    document.getElementById('encabezadoCargoInput').value = colaborador.cargo || '';
    document.getElementById('encabezadoDocIdentidadInput').value = colaborador.docIdentidad || '';
    abrirModal('modalEncabezadoGastos');
  }
}

function guardarEncabezadoGastos() {
  const cargoInput = document.getElementById('encabezadoCargoInput');
  const docInput = document.getElementById('encabezadoDocIdentidadInput');
  const cargo = cargoInput.value.trim();
  const docIdentidad = docInput.value.trim();

  if (!cargo) { mostrarErrorCampo(cargoInput, 'Ingresa tu cargo'); return; }
  if (!docIdentidad) { mostrarErrorCampo(docInput, 'Ingresa tu documento de identidad'); return; }

  // Se guarda en los 3 ids del período (Alimentos/Movilidad/Días a Bordo
  // comparten el mismo colaborador) para que calce en cualquiera de los 3
  // detalles que el supervisor abra en la web.
  Object.values(gastosMovilPeriodo.ids).forEach(id => {
    COLABORADOR_GASTOS_DEMO[id] = { cargo, docIdentidad };
  });
  guardarEstadoGastos();
  cerrarModal('modalEncabezadoGastos');
  mostrarToast('Datos guardados.');
}

/* =================================================
   TARJETAS (Alimentos / Movilidad / Días a Bordo)
================================================= */
function renderTarjetasGastos() {
  const elAlim = document.getElementById('gastosTotalAlimentos');
  if (elAlim) {
    const detalleAlim = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
    const totalAlim = detalleAlim.grilla.reduce((acc, f) => acc + (Number(f.costo) || 0), 0);
    elAlim.textContent = `S/ ${totalAlim.toFixed(2)}`;
  }

  const elMov = document.getElementById('gastosTotalMovilidad');
  if (elMov) {
    const detalleMov = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
    const totalMov = detalleMov.grilla.reduce((acc, f) => acc + (Number(f.totalDia) || 0), 0);
    elMov.textContent = `S/ ${totalMov.toFixed(2)}`;
  }

  // Días a Bordo se regenera cada vez que se abre esta página (§1.2: "se
  // regenera al abrir/descargar") — así el operador ve el total real al
  // instante, sin tener que entrar a la web primero. Corre siempre, tenga
  // o no esta página las tarjetas (lo necesita igual Reportes).
  regenerarDiasABordo(gastosMovilPeriodo.ids['Días a Bordo']);
  const elDias = document.getElementById('gastosTotalDiasBordo');
  if (elDias) {
    const detalleDias = obtenerDetalleGastoPorTipo('Días a Bordo', gastosMovilPeriodo.ids['Días a Bordo']);
    const totalDias = detalleDias.grilla.reduce((acc, f) => acc + (Number(f.monto) || 0), 0);
    elDias.textContent = `S/ ${totalDias.toFixed(2)}`;
    document.getElementById('gastosDiasBordoNota').textContent = `${detalleDias.grilla.length} día${detalleDias.grilla.length === 1 ? '' : 's'} este período`;
  }
}

/* =================================================
   ALIMENTOS — valida tope por comida (desayuno/almuerzo/cena) y por día,
   de LIMITES_GASTOS_DEMO.alimentos.
================================================= */
let alimentosEvidenciaTemp = [];
let alimentosIndiceEditando = null; // índice en la grilla si se está editando, null si es nuevo

function hoyISO() { return new Date().toISOString().slice(0, 10); }

function abrirModalRegistrarAlimentos() {
  alimentosIndiceEditando = null;
  alimentosEvidenciaTemp = [];
  document.getElementById('tituloRegistrarAlimentos').textContent = 'Registrar Alimentos';
  document.getElementById('alimentosComida').value = 'Desayuno';
  document.getElementById('alimentosFecha').value = hoyISO();
  document.getElementById('alimentosFecha').max = hoyISO();
  document.getElementById('alimentosFecha').min = fechaDDMMYYYYaISO(gastosMovilPeriodo.fechaDesde);
  document.getElementById('alimentosLugar').value = '';
  document.getElementById('alimentosCliente').value = '';
  document.getElementById('alimentosOperacionPer').value = '';
  document.getElementById('alimentosHora').value = '';
  document.getElementById('alimentosCosto').value = '';
  document.getElementById('alimentosSinSustento').checked = false;
  toggleEvidenciaAlimentos();
  renderEvidenciaChips('alimentosEvidenciaChips', alimentosEvidenciaTemp);
  actualizarTopeAlimentos();
  abrirModal('modalRegistrarAlimentos');
}

function toggleEvidenciaAlimentos() {
  const marcado = document.getElementById('alimentosSinSustento').checked;
  document.getElementById('alimentosEvidenciaGroup').style.display = marcado ? 'none' : '';
}

function agregarEvidenciaAlimentos(input) {
  if (!input.files || !input.files.length) return;
  alimentosEvidenciaTemp.push(`Evidencia ${alimentosEvidenciaTemp.length + 1} (${input.files[0].name})`);
  input.value = '';
  renderEvidenciaChips('alimentosEvidenciaChips', alimentosEvidenciaTemp);
}

function renderEvidenciaChips(contenedorId, lista) {
  const cont = document.getElementById(contenedorId);
  if (!cont) return;
  cont.innerHTML = lista.length
    ? lista.map(n => `<span class="gastos-evidencia-chip">${n}</span>`).join('')
    : `<span class="gastos-evidencia-vacia">Sin fotos adjuntadas.</span>`;
}

// Muestra cuánto lleva gastado ese día en esa comida y en total, contra los
// topes de Configuración — antes de intentar guardar (misma cuenta que
// guardarGastoAlimentos usa para bloquear si se excede).
function actualizarTopeAlimentos() {
  const span = document.getElementById('alimentosTopeTexto');
  const comida = document.getElementById('alimentosComida').value;
  const fecha = document.getElementById('alimentosFecha').value;
  const costo = parseFloat(document.getElementById('alimentosCosto').value) || 0;
  if (!fecha) { span.textContent = ''; return; }

  const { totalDia, totalComida } = totalesAlimentosDelDia(fecha, comida);
  const topeComida = LIMITES_GASTOS_DEMO.alimentos[comida.toLowerCase()];
  const topeDia = LIMITES_GASTOS_DEMO.alimentos.montoMaximoDia;
  span.textContent = `Tope ${comida.toLowerCase()}: S/ ${(totalComida + costo).toFixed(2)} / S/ ${topeComida.toFixed(2)} · Tope del día: S/ ${(totalDia + costo).toFixed(2)} / S/ ${topeDia.toFixed(2)}`;
}

// Suma lo YA registrado ese día (excluyendo la fila que se está editando,
// si aplica) — para comparar contra los topes antes de agregar/editar una más.
function totalesAlimentosDelDia(fechaISODia, comida) {
  const detalle = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
  const fechaDD = fechaISOaDDMMYYYY(fechaISODia);
  let totalDia = 0, totalComida = 0;
  detalle.grilla.forEach((f, i) => {
    if (alimentosIndiceEditando === i) return;
    if (f.fecha !== fechaDD) return;
    totalDia += Number(f.costo) || 0;
    if (f.comida === comida) totalComida += Number(f.costo) || 0;
  });
  return { totalDia, totalComida };
}

function guardarGastoAlimentos() {
  const comida = document.getElementById('alimentosComida').value;
  const fechaInput = document.getElementById('alimentosFecha');
  const lugarInput = document.getElementById('alimentosLugar');
  const clienteInput = document.getElementById('alimentosCliente');
  const operacionPerInput = document.getElementById('alimentosOperacionPer');
  const horaInput = document.getElementById('alimentosHora');
  const costoInput = document.getElementById('alimentosCosto');
  const sinSustento = document.getElementById('alimentosSinSustento').checked;

  if (!fechaInput.value) { mostrarErrorCampo(fechaInput, 'Selecciona una fecha'); return; }
  if (fechaInput.value > hoyISO()) { mostrarErrorCampo(fechaInput, 'La fecha no puede ser futura'); return; }
  if (!lugarInput.value.trim()) { mostrarErrorCampo(lugarInput, 'Ingresa el lugar'); return; }
  const costo = parseFloat(costoInput.value);
  if (isNaN(costo) || costo <= 0) { mostrarErrorCampo(costoInput, 'Ingresa un costo válido'); return; }

  const { totalDia, totalComida } = totalesAlimentosDelDia(fechaInput.value, comida);
  const topeComida = LIMITES_GASTOS_DEMO.alimentos[comida.toLowerCase()];
  const topeDia = LIMITES_GASTOS_DEMO.alimentos.montoMaximoDia;
  if (totalComida + costo > topeComida) { mostrarToast(`Supera el tope de ${comida.toLowerCase()} (S/ ${topeComida.toFixed(2)}).`); return; }
  if (totalDia + costo > topeDia) { mostrarToast(`Supera el tope del día (S/ ${topeDia.toFixed(2)}).`); return; }

  const fila = {
    fecha: fechaISOaDDMMYYYY(fechaInput.value), comida,
    lugar: lugarInput.value.trim(), cliente: clienteInput.value.trim() || '—',
    operacionPer: operacionPerInput.value.trim() || '—',
    hora: horaInput.value || '—', costo,
    evidencia: sinSustento ? [] : [...alimentosEvidenciaTemp],
    sinSustento
  };

  const detalle = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
  if (alimentosIndiceEditando !== null) detalle.grilla[alimentosIndiceEditando] = fila;
  else detalle.grilla.push(fila);

  guardarEstadoGastos();
  cerrarModal('modalRegistrarAlimentos');
  renderTarjetasGastos();
  renderReportesAccordion();
  mostrarModalConfirmacionMovil('Gasto de Alimentos guardado. Ya lo puede ver tu supervisor.');
}

function editarGastoAlimentos(indice) {
  const detalle = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
  const fila = detalle.grilla[indice];
  if (!fila) return;

  alimentosIndiceEditando = indice;
  alimentosEvidenciaTemp = [...(fila.evidencia || [])];
  document.getElementById('tituloRegistrarAlimentos').textContent = 'Editar Alimentos';
  document.getElementById('alimentosComida').value = fila.comida;
  document.getElementById('alimentosFecha').value = fechaDDMMYYYYaISO(fila.fecha);
  document.getElementById('alimentosFecha').max = hoyISO();
  document.getElementById('alimentosLugar').value = fila.lugar;
  document.getElementById('alimentosCliente').value = fila.cliente === '—' ? '' : fila.cliente;
  document.getElementById('alimentosOperacionPer').value = fila.operacionPer === '—' ? '' : fila.operacionPer;
  document.getElementById('alimentosHora').value = fila.hora === '—' ? '' : fila.hora;
  document.getElementById('alimentosCosto').value = fila.costo;
  document.getElementById('alimentosSinSustento').checked = !!fila.sinSustento;
  toggleEvidenciaAlimentos();
  renderEvidenciaChips('alimentosEvidenciaChips', alimentosEvidenciaTemp);
  actualizarTopeAlimentos();
  abrirModal('modalRegistrarAlimentos');
}

function eliminarGastoAlimentos(indice) {
  confirmarAccion('¿Eliminar este gasto de Alimentos?', () => {
    const detalle = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
    detalle.grilla.splice(indice, 1);
    guardarEstadoGastos();
    renderTarjetasGastos();
    renderReportesAccordion();
  });
}

/* =================================================
   MOVILIDAD — valida tope por viaje y por día.
================================================= */
let movilidadEvidenciaTemp = [];
let movilidadIndiceEditando = null;

function abrirModalRegistrarMovilidad() {
  movilidadIndiceEditando = null;
  movilidadEvidenciaTemp = [];
  document.getElementById('tituloRegistrarMovilidad').textContent = 'Registrar Movilidad';
  document.getElementById('movilidadFecha').value = hoyISO();
  document.getElementById('movilidadFecha').max = hoyISO();
  document.getElementById('movilidadFecha').min = fechaDDMMYYYYaISO(gastosMovilPeriodo.fechaDesde);
  document.getElementById('movilidadEmpresa').value = '';
  document.getElementById('movilidadDistritoPartida').value = '';
  document.getElementById('movilidadDistritoDestino').value = '';
  document.getElementById('movilidadMotivo').value = '';
  document.getElementById('movilidadHoras').value = '';
  document.getElementById('movilidadImporte').value = '';
  document.getElementById('movilidadSinSustento').checked = false;
  toggleEvidenciaMovilidad();
  renderEvidenciaChips('movilidadEvidenciaChips', movilidadEvidenciaTemp);
  actualizarTopeMovilidad();
  abrirModal('modalRegistrarMovilidad');
}

function toggleEvidenciaMovilidad() {
  const marcado = document.getElementById('movilidadSinSustento').checked;
  document.getElementById('movilidadEvidenciaGroup').style.display = marcado ? 'none' : '';
}

function agregarEvidenciaMovilidad(input) {
  if (!input.files || !input.files.length) return;
  movilidadEvidenciaTemp.push(`Evidencia ${movilidadEvidenciaTemp.length + 1} (${input.files[0].name})`);
  input.value = '';
  renderEvidenciaChips('movilidadEvidenciaChips', movilidadEvidenciaTemp);
}

function totalMovilidadDelDia(fechaISODia) {
  const detalle = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
  const fechaDD = fechaISOaDDMMYYYY(fechaISODia);
  let totalDia = 0;
  detalle.grilla.forEach((f, i) => {
    if (movilidadIndiceEditando === i) return;
    if (f.fecha === fechaDD) totalDia += Number(f.totalDia) || 0;
  });
  return totalDia;
}

function actualizarTopeMovilidad() {
  const span = document.getElementById('movilidadTopeTexto');
  const fecha = document.getElementById('movilidadFecha').value;
  const importe = parseFloat(document.getElementById('movilidadImporte').value) || 0;
  if (!fecha) { span.textContent = ''; return; }
  const totalDia = totalMovilidadDelDia(fecha);
  const topeViaje = LIMITES_GASTOS_DEMO.movilidad.montoMaximoViaje;
  const topeDia = LIMITES_GASTOS_DEMO.movilidad.montoMaximoDia;
  span.textContent = `Tope por viaje: S/ ${importe.toFixed(2)} / S/ ${topeViaje.toFixed(2)} · Tope del día: S/ ${(totalDia + importe).toFixed(2)} / S/ ${topeDia.toFixed(2)}`;
}

function guardarGastoMovilidad() {
  const fechaInput = document.getElementById('movilidadFecha');
  const empresaInput = document.getElementById('movilidadEmpresa');
  const partidaInput = document.getElementById('movilidadDistritoPartida');
  const destinoInput = document.getElementById('movilidadDistritoDestino');
  const motivoInput = document.getElementById('movilidadMotivo');
  const horasInput = document.getElementById('movilidadHoras');
  const importeInput = document.getElementById('movilidadImporte');
  const sinSustento = document.getElementById('movilidadSinSustento').checked;

  if (!fechaInput.value) { mostrarErrorCampo(fechaInput, 'Selecciona una fecha'); return; }
  if (fechaInput.value > hoyISO()) { mostrarErrorCampo(fechaInput, 'La fecha no puede ser futura'); return; }
  if (!empresaInput.value.trim()) { mostrarErrorCampo(empresaInput, 'Ingresa la empresa'); return; }
  const importe = parseFloat(importeInput.value);
  if (isNaN(importe) || importe <= 0) { mostrarErrorCampo(importeInput, 'Ingresa un importe válido'); return; }

  const topeViaje = LIMITES_GASTOS_DEMO.movilidad.montoMaximoViaje;
  const topeDia = LIMITES_GASTOS_DEMO.movilidad.montoMaximoDia;
  if (importe > topeViaje) { mostrarToast(`Supera el tope por viaje (S/ ${topeViaje.toFixed(2)}).`); return; }
  const totalDia = totalMovilidadDelDia(fechaInput.value);
  if (totalDia + importe > topeDia) { mostrarToast(`Supera el tope del día (S/ ${topeDia.toFixed(2)}).`); return; }

  const fila = {
    fecha: fechaISOaDDMMYYYY(fechaInput.value), empresa: empresaInput.value.trim(),
    distritoPartida: partidaInput.value.trim() || '—', distritoDestino: destinoInput.value.trim() || '—',
    motivo: motivoInput.value.trim() || '—', importeDia: importe, totalDia: importe,
    evidencia: sinSustento ? [] : [...movilidadEvidenciaTemp], sinSustento
  };
  if (horasInput.value.trim()) fila.horas = horasInput.value.trim();

  const detalle = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
  if (movilidadIndiceEditando !== null) detalle.grilla[movilidadIndiceEditando] = fila;
  else detalle.grilla.push(fila);

  guardarEstadoGastos();
  cerrarModal('modalRegistrarMovilidad');
  renderTarjetasGastos();
  renderReportesAccordion();
  mostrarModalConfirmacionMovil('Gasto de Movilidad guardado. Ya lo puede ver tu supervisor.');
}

function editarGastoMovilidad(indice) {
  const detalle = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
  const fila = detalle.grilla[indice];
  if (!fila) return;

  movilidadIndiceEditando = indice;
  movilidadEvidenciaTemp = [...(fila.evidencia || [])];
  document.getElementById('tituloRegistrarMovilidad').textContent = 'Editar Movilidad';
  document.getElementById('movilidadFecha').value = fechaDDMMYYYYaISO(fila.fecha);
  document.getElementById('movilidadFecha').max = hoyISO();
  document.getElementById('movilidadEmpresa').value = fila.empresa;
  document.getElementById('movilidadDistritoPartida').value = fila.distritoPartida === '—' ? '' : fila.distritoPartida;
  document.getElementById('movilidadDistritoDestino').value = fila.distritoDestino === '—' ? '' : fila.distritoDestino;
  document.getElementById('movilidadMotivo').value = fila.motivo === '—' ? '' : fila.motivo;
  document.getElementById('movilidadHoras').value = fila.horas || '';
  document.getElementById('movilidadImporte').value = fila.importeDia;
  document.getElementById('movilidadSinSustento').checked = !!fila.sinSustento;
  toggleEvidenciaMovilidad();
  renderEvidenciaChips('movilidadEvidenciaChips', movilidadEvidenciaTemp);
  actualizarTopeMovilidad();
  abrirModal('modalRegistrarMovilidad');
}

function eliminarGastoMovilidad(indice) {
  confirmarAccion('¿Eliminar este gasto de Movilidad?', () => {
    const detalle = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
    detalle.grilla.splice(indice, 1);
    guardarEstadoGastos();
    renderTarjetasGastos();
    renderReportesAccordion();
  });
}

/* =================================================
   REPORTES — vista acordeón por día (reportes-movil.html): agrupa cada tipo
   por fecha (mismo criterio que la planilla real, un bloque por día) con un
   encabezado de resumen del día y un acordeón numerado por registro, igual
   que los wireframes de Movilidad/Alimentos. Editar/Eliminar reutilizan los
   mismos modales y funciones de "Generar Reporte" (duplicados en el HTML
   de esta página) — Días a Bordo queda de solo lectura.
================================================= */
let reportesTabActiva = 'Movilidad';
let reportesAcordeonAbiertos = {};

function hayPantallaReportes() { return !!document.getElementById('reportesAccordion'); }

function cambiarTabReportes(tipo) {
  reportesTabActiva = tipo;
  reportesAcordeonAbiertos = {};
  const idBoton = tipo === 'Alimentos' ? 'btnTabReportesAlimentos' : tipo === 'Movilidad' ? 'btnTabReportesMovilidad' : 'btnTabReportesDiasBordo';
  document.querySelectorAll('#reportesTabs .movil-tab-toggle-btn').forEach(btn => btn.classList.remove('activo'));
  document.getElementById(idBoton).classList.add('activo');
  renderReportesAccordion();
}

function toggleReportesAcordeon(clave) {
  reportesAcordeonAbiertos[clave] = !reportesAcordeonAbiertos[clave];
  renderReportesAccordion();
}

function camposAcordeonReporte(tipo, f) {
  const chipsEvidencia = (f.evidencia || []).length
    ? f.evidencia.map(ev => `<span class="gastos-evidencia-chip">${ev}</span>`).join('')
    : `<span class="gastos-evidencia-vacia">${f.sinSustento ? 'Sin sustento' : 'Sin evidencia'}</span>`;

  if (tipo === 'Alimentos') return `
    <div class="reportes-campo"><span>Lugar</span><strong>${f.lugar}</strong></div>
    <div class="reportes-campo"><span>Hora</span><strong>${f.hora}</strong></div>
    <div class="reportes-campo"><span>Costo</span><strong>S/ ${Number(f.costo || 0).toFixed(2)}</strong></div>
    <div class="reportes-evidencia">${chipsEvidencia}</div>`;
  if (tipo === 'Movilidad') return `
    <div class="reportes-campo"><span>Empresa</span><strong>${f.empresa}</strong></div>
    <div class="reportes-campo"><span>Distrito de partida</span><strong>${f.distritoPartida}</strong></div>
    <div class="reportes-campo"><span>Distrito de destino</span><strong>${f.distritoDestino}</strong></div>
    <div class="reportes-campo"><span>Motivo</span><strong>${f.motivo}</strong></div>
    <div class="reportes-campo"><span>Importe Día</span><strong>S/ ${Number(f.importeDia || 0).toFixed(2)}</strong></div>
    <div class="reportes-evidencia">${chipsEvidencia}</div>`;
  return `
    <div class="reportes-campo"><span>Lugar</span><strong>${f.lugar || '—'}</strong></div>
    <div class="reportes-campo"><span>Operación</span><strong>${f.operacion || '—'}</strong></div>
    <div class="reportes-campo"><span>Buque</span><strong>${f.buque || '—'}</strong></div>`;
}

function renderReportesAccordion() {
  if (!hayPantallaReportes()) return;
  const cont = document.getElementById('reportesAccordion');
  const totalEl = document.getElementById('reportesTotalGeneral');
  const tipo = reportesTabActiva;
  const id = gastosMovilPeriodo.ids[tipo];

  if (tipo === 'Días a Bordo') regenerarDiasABordo(id);
  const detalle = obtenerDetalleGastoPorTipo(tipo, id);
  const campoMonto = tipo === 'Alimentos' ? 'costo' : tipo === 'Movilidad' ? 'totalDia' : 'monto';

  if (!detalle.grilla.length) {
    cont.innerHTML = `<p class="submodulo-tabla-vacio">Sin registros de ${tipo.toLowerCase()} en este período.</p>`;
    totalEl.textContent = '';
    return;
  }

  const porFecha = {};
  detalle.grilla.forEach((f, i) => { (porFecha[f.fecha] = porFecha[f.fecha] || []).push({ ...f, _indice: i }); });
  const fechas = Object.keys(porFecha).sort((a, b) => fechaDDMMYYYYaISO(a).localeCompare(fechaDDMMYYYYaISO(b)));

  cont.innerHTML = fechas.map(fecha => {
    const filas = porFecha[fecha];
    const totalDia = filas.reduce((acc, f) => acc + (f.pendiente ? 0 : Number(f[campoMonto]) || 0), 0);
    const primera = filas[0];
    const subHeader = tipo === 'Alimentos'
      ? `<span class="reportes-dia-sub">${primera.cliente !== '—' ? primera.cliente : 'Sin cliente'}${primera.operacionPer !== '—' ? ' · ' + primera.operacionPer : ''}</span>`
      : '';

    const filasHTML = filas.map((f, iDia) => {
      const clave = `${tipo}-${fecha}-${iDia}`;
      const abierto = !!reportesAcordeonAbiertos[clave];
      const titulo = tipo === 'Alimentos' ? f.comida : tipo === 'Movilidad' ? `Movilidad ${iDia + 1}` : (f.detalle || `Día ${iDia + 1}`);
      const monto = f.pendiente ? 'Pendiente' : `S/ ${Number(f[campoMonto] || 0).toFixed(2)}`;
      const acciones = tipo === 'Días a Bordo' ? '' : `
        <div class="reportes-acordeon-acciones">
          <button type="button" class="btn-accion btn-editar" onclick="event.stopPropagation(); ${tipo === 'Alimentos' ? 'editarGastoAlimentos' : 'editarGastoMovilidad'}(${f._indice})">Editar</button>
          <button type="button" class="btn-accion btn-eliminar" onclick="event.stopPropagation(); ${tipo === 'Alimentos' ? 'eliminarGastoAlimentos' : 'eliminarGastoMovilidad'}(${f._indice})">Eliminar</button>
        </div>`;
      return `
        <div class="reportes-acordeon-item${abierto ? ' abierto' : ''}">
          <button type="button" class="reportes-acordeon-header" onclick="toggleReportesAcordeon('${clave}')">
            <span class="reportes-acordeon-numero">${iDia + 1}</span>
            <span class="reportes-acordeon-titulo">${titulo}</span>
            <span class="reportes-acordeon-monto">${monto}</span>
            <svg class="reportes-acordeon-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="reportes-acordeon-body">
            ${camposAcordeonReporte(tipo, f)}
            ${acciones}
          </div>
        </div>`;
    }).join('');

    return `
      <div class="reportes-dia-grupo">
        <div class="reportes-dia-header">
          <span class="reportes-dia-fecha">${fecha}</span>
          ${subHeader}
          <span class="reportes-dia-total">Total Día: S/ ${totalDia.toFixed(2)}</span>
        </div>
        ${filasHTML}
      </div>`;
  }).join('');

  const totalGeneral = detalle.grilla.reduce((acc, f) => acc + (f.pendiente ? 0 : Number(f[campoMonto]) || 0), 0);
  totalEl.textContent = `Total del período: S/ ${totalGeneral.toFixed(2)}`;
}

/* =================================================
   DESCARGA DESDE EL MÓVIL — "se firman de manera automática validando su
   huella": se simula la validación biométrica (setTimeout + estado de
   carga, mismo patrón que la geolocalización simulada de Operaciones, sin
   hardware real) antes de generar el archivo. El archivo sale IDÉNTICO al
   que arma la web para ese mismo usuario/tipo/rango (mismos builders de
   descarga-gastos.js), así que trae la misma marca de agua de "descargado
   desde este sistema" sin tener que duplicar la plantilla.
================================================= */
let reportesDescargaPendiente = null;

function iniciarDescargaReporte(formato) {
  if (!gastosMovilPeriodo) return;
  reportesDescargaPendiente = { tipo: reportesTabActiva, formato };
  document.getElementById('huellaEstadoTexto').textContent = 'Coloca tu huella en el sensor…';
  document.getElementById('huellaIcono').classList.remove('huella-ok');
  abrirModal('modalValidarHuella');

  setTimeout(() => {
    const elTexto = document.getElementById('huellaEstadoTexto');
    const elIcono = document.getElementById('huellaIcono');
    if (elTexto) elTexto.textContent = 'Huella validada. Firmando y generando el reporte…';
    if (elIcono) elIcono.classList.add('huella-ok');
    setTimeout(confirmarDescargaConHuella, 700);
  }, 1300);
}

async function confirmarDescargaConHuella() {
  if (!reportesDescargaPendiente) return;
  const { tipo, formato } = reportesDescargaPendiente;
  reportesDescargaPendiente = null;
  cerrarModal('modalValidarHuella');

  const d = prepararDescargaGastos({
    usuario: gastosMovilUsuario, tipo,
    desde: fechaDDMMYYYYaISO(gastosMovilPeriodo.fechaDesde),
    hasta: fechaDDMMYYYYaISO(gastosMovilPeriodo.fechaHasta)
  });
  if (!d) return;

  if (formato === 'excel') await descargarWorkbookGastos(d);
  else abrirVentanaReporteGastos(d, { imprimir: true });

  registrarUltimaDescargaGastos(gastosMovilUsuario, tipo, d.desde, d.hasta);
  guardarEstadoGastos();
  mostrarModalConfirmacionMovil('Reporte firmado con tu huella y descargado. Ya puedes subirlo a tu otro aplicativo.');
}

document.addEventListener('DOMContentLoaded', inicializarGastosMovil);
