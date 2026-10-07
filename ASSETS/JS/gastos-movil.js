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

  // Viene de una notificación de olvido en Operaciones (§2) — abre directo
  // "Agregar gasto olvidado" en esa fecha, misma mecánica que "Jornadas
  // recientes".
  const fechaOlvido = new URLSearchParams(window.location.search).get('olvido');
  if (fechaOlvido && typeof irAJornadaDesdeGastos === 'function') irAJornadaDesdeGastos(fechaOlvido);
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
   "GASTOS" (home) — PROMPT_GASTOS_PANTALLAS_JORNADA_SPRINT4 §4: vista
   centrada en la jornada de HOY (tarjeta Jornada + 3 tarjetas de reporte de
   ESA jornada), más el resumen del período completo y las jornadas
   recientes (para corregir olvidos dentro del plazo).
================================================= */
function renderTarjetasGastos() {
  // Días a Bordo se regenera cada vez que se abre esta página (§1.2: "se
  // regenera al abrir/descargar") — así el operador ve el total real al
  // instante, sin tener que entrar a la web primero.
  regenerarDiasABordo(gastosMovilPeriodo.ids['Días a Bordo']);

  renderTarjetaJornadaHoy();
  renderTarjetasReporteDelDia();
  renderResumenPeriodoGastos();
  renderJornadasRecientesGastos();
}

function renderTarjetaJornadaHoy() {
  const cont = document.getElementById('gastosJornadaCard');
  if (!cont) return;
  const jornada = (typeof obtenerJornadaActiva === 'function') ? obtenerJornadaActiva(gastosMovilUsuario) : null;
  // Operaciones asignadas: siempre las del operador (no varían si hubo o no
  // precintos ese día). Precintos usados sí es específico de la fecha de
  // esta jornada — se informan por separado (corrección pedida).
  const operaciones = obtenerOperacionesAsignadasOperador(gastosMovilUsuario);
  const precintos = jornada ? obtenerPrecintosDeJornada(gastosMovilUsuario, jornada.fecha) : [];

  const elFecha = document.getElementById('gastosJornadaFecha');
  const elEstado = document.getElementById('gastosJornadaEstado');
  const elInicio = document.getElementById('gastosJornadaInicio');
  const elFin = document.getElementById('gastosJornadaFin');
  const elOps = document.getElementById('gastosJornadaOperaciones');
  const elPrecintos = document.getElementById('gastosJornadaPrecintos');
  const elPlazo = document.getElementById('gastosJornadaPlazoOlvido');

  elOps.textContent = textoOperacionesInvolucradas(operaciones);

  if (!jornada || jornada.estado === 'pendiente') {
    elFecha.textContent = fechaISOaDDMMYYYY(hoyISO());
    elEstado.textContent = 'Sin iniciar'; elEstado.className = 'badge badge-gris';
    elInicio.textContent = '—'; elFin.textContent = '—';
    // Bug: acá se mostraba siempre "Sin precintos usados" a secas, sin
    // revisar el dato real — un operador puede marcar un precinto como
    // usado en una operación sin haber tocado antes "Comenzar el día" (no
    // hay ninguna validación que lo bloquee), así que "pendiente" no
    // significa "sin precintos". "precintos" ya se calculó arriba contra
    // la fecha real de hoy, úsese esté o no la jornada iniciada.
    elPrecintos.textContent = precintos.length ? `Sí (${precintos.length})` : 'Sin precintos usados';
    elPlazo.textContent = '';
    return;
  }

  const dia = DIAS_SEMANA[(new Date(jornada.fecha + 'T00:00:00').getDay() + 6) % 7];
  elFecha.textContent = `${dia} ${fechaISOaDDMMYYYY(jornada.fecha)}`;
  if (jornada.estado === 'abierta') { elEstado.textContent = 'Abierta'; elEstado.className = 'badge badge-por-vencer'; }
  else { elEstado.textContent = 'Cerrada'; elEstado.className = 'badge badge-gris'; }
  elInicio.textContent = `${jornada.inicio.fecha} ${jornada.inicio.hora}`;
  elFin.textContent = jornada.fin ? `${jornada.fin.fecha} ${jornada.fin.hora}` : 'Jornada abierta';
  elPrecintos.textContent = precintos.length ? `Sí (${precintos.length})` : 'Sin precintos usados';

  if (jornada.estado === 'cerrada' && jornada.fin) {
    const limite = new Date(new Date(jornada.fin.fechaHoraISO).getTime() + CONFIG_JORNADA_DEMO.plazoOlvidoHoras * 3600000);
    const vencido = Date.now() > limite.getTime();
    const pad = n => String(n).padStart(2, '0');
    const limiteTexto = `${pad(limite.getDate())}/${pad(limite.getMonth() + 1)} ${pad(limite.getHours())}:${pad(limite.getMinutes())}`;
    elPlazo.textContent = vencido ? 'Plazo para agregar olvidos vencido.' : `Puedes corregir hasta ${limiteTexto}.`;
  } else {
    elPlazo.textContent = '';
  }
}

// Estado de un gasto YA registrado ese día: "Agregado posterior" si alguna
// fila es un olvido justificado, "Registrado" si hay filas, "Pendiente" si
// no hay nada aún — mismo criterio que usa notaAgregadoPosterior.
function estadoReporteDelDia(filasDelDia) {
  if (!filasDelDia.length) return 'Pendiente';
  return filasDelDia.some(f => f.agregadoPosterior) ? 'Agregado posterior' : 'Registrado';
}
function claseBadgeEstadoReporte(estado) {
  if (estado === 'Registrado') return 'badge badge-vigente';
  if (estado === 'Agregado posterior') return 'badge badge-por-vencer';
  return 'badge badge-gris';
}

function renderTarjetasReporteDelDia() {
  const jornada = (typeof obtenerJornadaActiva === 'function') ? obtenerJornadaActiva(gastosMovilUsuario) : null;
  const fechaDD = jornada ? fechaISOaDDMMYYYY(jornada.fecha) : fechaISOaDDMMYYYY(hoyISO());

  // Alimentos
  const elAlim = document.getElementById('gastosTotalAlimentos');
  if (elAlim) {
    const detalleAlim = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
    const filasDia = detalleAlim.grilla.filter(f => f.fecha === fechaDD);
    const total = filasDia.reduce((acc, f) => acc + (Number(f.costo) || 0), 0);
    elAlim.textContent = `S/ ${total.toFixed(2)}`;
    const estado = estadoReporteDelDia(filasDia);
    setTextoYClase('gastosAlimentosEstado', estado, claseBadgeEstadoReporte(estado));
    const codigoInfoAlim = jornada && obtenerCodigoReporteJornada('Alimentos', jornada.id);
    setTexto('gastosAlimentosCodigo', codigoInfoAlim ? codigoInfoAlim.codigo : 'Sin registrar');
    const chips = document.getElementById('gastosAlimentosComidasChips');
    if (chips) {
      chips.innerHTML = ['Desayuno', 'Almuerzo', 'Cena'].map(c => {
        const ok = filasDia.some(f => f.comida === c);
        return `<span class="gastos-comida-chip${ok ? ' ok' : ''}">${ok ? '✓' : '–'} ${c}</span>`;
      }).join('');
    }
  }

  // Movilidad
  const elMov = document.getElementById('gastosTotalMovilidad');
  if (elMov) {
    const detalleMov = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
    const filasDia = detalleMov.grilla.filter(f => f.fecha === fechaDD);
    const total = filasDia.reduce((acc, f) => acc + (Number(f.totalDia) || 0), 0);
    elMov.textContent = `S/ ${total.toFixed(2)}`;
    const estado = estadoReporteDelDia(filasDia);
    setTextoYClase('gastosMovilidadEstado', estado, claseBadgeEstadoReporte(estado));
    const codigoInfoMov = jornada && obtenerCodigoReporteJornada('Movilidad', jornada.id);
    setTexto('gastosMovilidadCodigo', codigoInfoMov ? codigoInfoMov.codigo : 'Sin registrar');
  }

  // Días a Bordo (solo lectura)
  const elDias = document.getElementById('gastosTotalDiasBordo');
  if (elDias) {
    const detalleDias = obtenerDetalleGastoPorTipo('Días a Bordo', gastosMovilPeriodo.ids['Días a Bordo']);
    const filaHoy = detalleDias.grilla.find(f => f.fecha === fechaDD);
    const totalDias = detalleDias.grilla.reduce((acc, f) => acc + (Number(f.monto) || 0), 0);
    elDias.textContent = `S/ ${totalDias.toFixed(2)}`;
    document.getElementById('gastosDiasBordoNota').textContent = `${detalleDias.grilla.length} día${detalleDias.grilla.length === 1 ? '' : 's'} este período`;
    const horas = jornada ? calcularHorasJornada(jornada.inicio, jornada.fin) : 0;
    let motivoHoy;
    if (filaHoy) motivoHoy = `${filaHoy.codigo || 'Sin código'} · ${filaHoy.detalle} · S/ ${Number(filaHoy.monto).toFixed(2)}`;
    else if (!jornada || jornada.estado !== 'cerrada') motivoHoy = 'Jornada aún no cerrada.';
    else if (horas < CONFIG_JORNADA_DEMO.horasMinimasDiaABordo) motivoHoy = `Jornada de ${horas.toFixed(1)} h: mínimo ${CONFIG_JORNADA_DEMO.horasMinimasDiaABordo} h.`;
    else motivoHoy = 'Sin precintos en buque hoy.';
    setTexto('gastosDiasBordoHoy', motivoHoy);
  }
}

function setTexto(id, texto) { const el = document.getElementById(id); if (el) el.textContent = texto; }
function setTextoYClase(id, texto, clase) { const el = document.getElementById(id); if (el) { el.textContent = texto; el.className = clase; } }

function renderResumenPeriodoGastos() {
  const cont = document.getElementById('gastosResumenPeriodo');
  if (!cont || !gastosMovilPeriodo) return;
  const detalleAlim = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
  const detalleMov = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
  const detalleDias = obtenerDetalleGastoPorTipo('Días a Bordo', gastosMovilPeriodo.ids['Días a Bordo']);
  const totalAlim = detalleAlim.grilla.reduce((a, f) => a + (Number(f.costo) || 0), 0);
  const totalMov = detalleMov.grilla.reduce((a, f) => a + (Number(f.totalDia) || 0), 0);
  const totalDias = detalleDias.grilla.reduce((a, f) => a + (Number(f.monto) || 0), 0);

  setTexto('gastosResumenTotal', `S/ ${(totalAlim + totalMov + totalDias).toFixed(2)}`);
  setTexto('gastosResumenAlimentos', `S/ ${totalAlim.toFixed(2)}`);
  setTexto('gastosResumenMovilidad', `S/ ${totalMov.toFixed(2)}`);
  setTexto('gastosResumenDiasBordo', `S/ ${totalDias.toFixed(2)} (${detalleDias.grilla.length} día${detalleDias.grilla.length === 1 ? '' : 's'})`);
}

// Últimas 7 jornadas del operador (abiertas o cerradas) — tocar una abre
// "Generar Reporte" posicionado en esa fecha para corregir un olvido dentro
// del plazo (§4.4).
function renderJornadasRecientesGastos() {
  const cont = document.getElementById('gastosJornadasRecientes');
  if (!cont) return;
  const jornadas = Object.values(JORNADAS_MOVIL_DEMO)
    .filter(j => j.usuario === gastosMovilUsuario && j.estado !== 'pendiente')
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 7);

  if (!jornadas.length) { cont.innerHTML = `<p class="submodulo-tabla-vacio">Sin jornadas registradas.</p>`; return; }

  cont.innerHTML = jornadas.map(j => {
    // Precintos usados ESE día puntual (distinto de las operaciones
    // asignadas al operador, que no varían día a día — corrección pedida).
    const precintos = obtenerPrecintosDeJornada(gastosMovilUsuario, j.fecha);
    const fechaDD = fechaISOaDDMMYYYY(j.fecha);
    const detalleAlim = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
    const detalleMov = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
    const totalDia = detalleAlim.grilla.filter(f => f.fecha === fechaDD).reduce((a, f) => a + (Number(f.costo) || 0), 0)
      + detalleMov.grilla.filter(f => f.fecha === fechaDD).reduce((a, f) => a + (Number(f.totalDia) || 0), 0);
    const faltantes = [];
    if (!detalleAlim.grilla.some(f => f.fecha === fechaDD)) faltantes.push('Alimentos');
    if (!detalleMov.grilla.some(f => f.fecha === fechaDD)) faltantes.push('Movilidad');
    const chipsFaltantes = faltantes.length
      ? `<span class="gastos-faltante-chip">Falta: ${faltantes.join(', ')}</span>` : '';
    return `
      <button type="button" class="gastos-mis-gastos-item" onclick="irAJornadaDesdeGastos('${j.fecha}')">
        <div class="gastos-mis-gastos-info">
          <span class="gastos-mis-gastos-fecha">${fechaDD}</span>
          <span class="gastos-mis-gastos-sub">${precintos.length ? `Precintos usados (${precintos.length})` : 'Sin precintos usados'}</span>
          ${chipsFaltantes}
        </div>
        <span class="gastos-mis-gastos-monto">S/ ${totalDia.toFixed(2)}</span>
      </button>`;
  }).join('');
}

// Abre "Registrar Alimentos" con la fecha de una jornada reciente ya
// seleccionada (§4.4: "tocar abre esa jornada para olvidos dentro del
// plazo") — Alimentos primero, igual que la secuencia de reportes (§2).
function irAJornadaDesdeGastos(fechaISO) {
  abrirModalRegistrarAlimentos();
  document.getElementById('alimentosFecha').value = fechaISO;
  actualizarComidasDisponibles();
  renderPanelInformativoGasto('alimentos', fechaISO, 'Alimentos');
}

/* =================================================
   ALIMENTOS — valida tope por comida (desayuno/almuerzo/cena) y por día,
   de LIMITES_GASTOS_DEMO.alimentos.
================================================= */
let alimentosEvidenciaTemp = [];
let alimentosIndiceEditando = null; // índice en la grilla si se está editando, null si es nuevo

function hoyISO() { return new Date().toISOString().slice(0, 10); }

// Panel informativo (solo lectura) de Jornada/Operaciones involucradas/
// Hora de registro/Costo total/Código — PROMPT_GASTOS_PANTALLAS_JORNADA_
// SPRINT4 §1/§2/§3: ya no se elige Operación/PER ni Cliente a mano, se
// muestran acá derivados de la jornada de la fecha elegida. "prefijo" es
// 'alimentos' o 'movilidad' (comparten el mismo patrón de ids de panel).
function renderPanelInformativoGasto(prefijo, fechaISODia, tipo) {
  const panel = document.getElementById(`${prefijo}PanelInfo`);
  if (!panel || !fechaISODia) return;
  const info = infoJornadaGasto(gastosMovilUsuario, fechaISODia, tipo);

  // Fecha/hora de inicio y fin por separado (una jornada que cruza
  // medianoche puede tener fechas distintas, no solo horas distintas).
  const elInicio = document.getElementById(`${prefijo}PanelInicio`);
  if (elInicio) elInicio.textContent = info.jornada && info.fechaInicio ? `${info.fechaInicio} ${info.horaInicio}` : 'Sin jornada marcada';
  const elFin = document.getElementById(`${prefijo}PanelFin`);
  if (elFin) elFin.textContent = info.jornada && info.fechaFin ? `${info.fechaFin} ${info.horaFin}` : (info.jornada && info.jornada.estado === 'abierta' ? 'Jornada abierta' : '—');

  document.getElementById(`${prefijo}PanelOperaciones`).textContent = textoOperacionesInvolucradas(info.operaciones);
  // Precintos usados en ESTA fecha puntual (distinto de las operaciones
  // asignadas, que no varían día a día) — corrección pedida: ya no se
  // conflaten los dos conceptos.
  const elPrecintos = document.getElementById(`${prefijo}PanelPrecintos`);
  if (elPrecintos) elPrecintos.textContent = info.huboPrecintos ? `Sí (${info.precintosUsados})` : 'Sin precintos usados';
  document.getElementById(`${prefijo}PanelCodigo`).textContent = info.codigo || 'Se asigna al guardar';

  const horaReg = document.getElementById(`${prefijo}PanelHoraRegistro`);
  if (horaReg) {
    const ahora = new Date();
    horaReg.textContent = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  }

  const totalEl = document.getElementById(`${prefijo}PanelTotal`);
  if (totalEl) {
    const detalle = obtenerDetalleGastoPorTipo(tipo, gastosMovilPeriodo.ids[tipo]);
    const campoMonto = tipo === 'Alimentos' ? 'costo' : 'totalDia';
    const fechaDD = fechaISOaDDMMYYYY(fechaISODia);
    const indiceEditando = tipo === 'Alimentos' ? alimentosIndiceEditando : movilidadIndiceEditando;
    const total = detalle.grilla.reduce((acc, f, i) => {
      if (i === indiceEditando) return acc;
      return f.fecha === fechaDD ? acc + (Number(f[campoMonto]) || 0) : acc;
    }, 0);
    totalEl.textContent = `S/ ${total.toFixed(2)}`;
  }
}

function abrirModalRegistrarAlimentos() {
  alimentosIndiceEditando = null;
  alimentosEvidenciaTemp = [];
  document.getElementById('tituloRegistrarAlimentos').textContent = 'Registrar Alimentos';
  document.getElementById('alimentosComida').value = 'Desayuno';
  document.getElementById('alimentosFecha').value = hoyISO();
  document.getElementById('alimentosFecha').max = hoyISO();
  document.getElementById('alimentosFecha').min = fechaDDMMYYYYaISO(gastosMovilPeriodo.fechaDesde);
  document.getElementById('alimentosLugar').value = '';
  document.getElementById('alimentosHora').value = '';
  document.getElementById('alimentosCosto').value = '';
  document.getElementById('alimentosSinSustento').checked = false;
  toggleEvidenciaAlimentos();
  renderEvidenciaChips('alimentosEvidenciaChips', alimentosEvidenciaTemp);
  document.getElementById('alimentosJustificacion').value = '';
  actualizarComidasDisponibles();
  renderPanelInformativoGasto('alimentos', hoyISO(), 'Alimentos');
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

// §3 PROMPT_GASTOS_JORNADA_SPRINT4: sin Jornada marcada/declarada en la
// fecha del gasto, no se puede registrar nada ese día — y, para Alimentos,
// Desayuno/Almuerzo quedan deshabilitados si la Jornada de esa fecha
// INICIÓ a la hora de corte configurada o después. La validación usa la
// hora GUARDADA en la jornada (jornada.inicio.hora), no la hora actual del
// reloj, para que no se pueda evadir el corte registrando más tarde (ni
// siquiera registrándolo al día siguiente).
function jornadaDelGasto(fechaISODia) {
  return typeof obtenerJornadaPorFecha === 'function' ? obtenerJornadaPorFecha(gastosMovilUsuario, fechaISODia) : null;
}

function comidaDisponible(comida, fechaISODia) {
  if (comida === 'Cena') return true;
  const jornada = jornadaDelGasto(fechaISODia);
  if (!jornada || !jornada.inicio) return true; // sin jornada no hay corte que aplicar (el gating de guardado ya bloquea el registro)
  const limite = comida === 'Desayuno' ? CONFIG_JORNADA_DEMO.horaLimiteInicioDesayuno : CONFIG_JORNADA_DEMO.horaLimiteInicioAlmuerzo;
  return jornada.inicio.hora < limite;
}

/* =================================================
   GASTO OLVIDADO (§3) — un gasto es "olvidado" cuando su fecha ya quedó en
   el PASADO respecto a hoy (estamos en un día calendario posterior), no
   simplemente porque la Jornada de esa fecha ya esté cerrada: cerrar el día
   (p.ej. para que arranque el corte de comidas) no debe impedir seguir
   registrando algo del MISMO día calendario — la Cena, por ejemplo, se
   suele registrar después de "Finalizar el día" y no debe pedir
   justificación. Recién al cruzar la medianoche (hoy > esa fecha) se pide
   justificación obligatoria, y solo se permite dentro de un plazo en horas
   desde el FIN de esa jornada (configurable,
   CONFIG_JORNADA_DEMO.plazoOlvidoHoras, 48h por defecto) — pasado el
   plazo, ni agregar ni editar, solo ver y descargar (ver
   renderReportesAccordion, que oculta Editar/Eliminar en ese caso). Editar
   un reporte de un día anterior cae en el mismo caso: su fecha también
   quedó en el pasado.
================================================= */
function esGastoOlvidado(fechaISODia) {
  return fechaISODia < hoyISO();
}

// Horas desde que cerró la Jornada de esa fecha — null si esa fecha no es
// un "olvido" (sigue siendo hoy) o si esa jornada nunca se cerró (no hay
// desde cuándo contar el plazo).
function horasDesdeCierreJornada(fechaISODia) {
  if (!esGastoOlvidado(fechaISODia)) return null;
  const jornada = jornadaDelGasto(fechaISODia);
  if (!jornada || !jornada.fin) return null;
  return (Date.now() - new Date(jornada.fin.fechaHoraISO).getTime()) / 3600000;
}

function dentroDePlazoOlvido(fechaISODia) {
  const horas = horasDesdeCierreJornada(fechaISODia);
  if (horas === null) return true; // no es un olvido: no aplica ningún plazo
  return horas <= CONFIG_JORNADA_DEMO.plazoOlvidoHoras;
}

// "Pasado el plazo solo se puede ver y descargar" (§3) — bloquea Editar/
// Eliminar una vez vencido el plazo de olvidos para la fecha de esa fila
// (recibe la fecha en dd/mm/yyyy, como viene guardada en la grilla).
function puedeEditarGastoEnFecha(fechaDD) {
  return dentroDePlazoOlvido(fechaDDMMYYYYaISO(fechaDD));
}

// Muestra/oculta el campo de Justificación según si la fecha elegida cae
// en una Jornada ya cerrada — "prefijo" es 'alimentos' o 'movilidad' (los
// 2 modales comparten el mismo patrón de ids).
function actualizarVisibilidadJustificacion(prefijo, fechaISODia) {
  const grupo = document.getElementById(`${prefijo}JustificacionGroup`);
  if (!grupo) return;
  grupo.style.display = esGastoOlvidado(fechaISODia) ? '' : 'none';
}

function actualizarJustificacionMovilidad() {
  const fechaInput = document.getElementById('movilidadFecha');
  if (!fechaInput || !fechaInput.value) return;
  actualizarVisibilidadJustificacion('movilidad', fechaInput.value);
  renderPanelInformativoGasto('movilidad', fechaInput.value, 'Movilidad');
}

// Refresca qué opciones de "Comida" quedan habilitadas según la fecha
// elegida (se llama al abrir el modal, al editar y al cambiar la fecha) —
// si la comida ya elegida queda deshabilitada, salta a la primera
// disponible en vez de dejar una opción bloqueada seleccionada.
function actualizarComidasDisponibles() {
  const select = document.getElementById('alimentosComida');
  const fechaInput = document.getElementById('alimentosFecha');
  const span = document.getElementById('alimentosComidaCorteTexto');
  if (!select || !fechaInput || !fechaInput.value) return;

  let seleccionBloqueada = false;
  [...select.options].forEach(opt => {
    const disponible = comidaDisponible(opt.value, fechaInput.value);
    opt.disabled = !disponible;
    if (opt.value === select.value && !disponible) seleccionBloqueada = true;
  });
  if (seleccionBloqueada) {
    const siguiente = [...select.options].find(o => !o.disabled);
    if (siguiente) select.value = siguiente.value;
  }

  const jornada = jornadaDelGasto(fechaInput.value);
  if (span) {
    if (!jornada) span.textContent = 'No hay jornada marcada en esta fecha: no se puede registrar.';
    else if (!jornada.inicio) span.textContent = '';
    else span.textContent = `Jornada inició ${jornada.inicio.hora}${jornada.inicio.fuente === 'declarada' ? ' (declarada)' : ''}.`;
  }
  actualizarVisibilidadJustificacion('alimentos', fechaInput.value);
  actualizarTopeAlimentos();
  renderPanelInformativoGasto('alimentos', fechaInput.value, 'Alimentos');
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
  const horaInput = document.getElementById('alimentosHora');
  const costoInput = document.getElementById('alimentosCosto');
  const sinSustento = document.getElementById('alimentosSinSustento').checked;

  if (!fechaInput.value) { mostrarErrorCampo(fechaInput, 'Selecciona una fecha'); return; }
  if (fechaInput.value > hoyISO()) { mostrarErrorCampo(fechaInput, 'La fecha no puede ser futura'); return; }
  if (!lugarInput.value.trim()) { mostrarErrorCampo(lugarInput, 'Ingresa el lugar'); return; }
  const costo = parseFloat(costoInput.value);
  if (isNaN(costo) || costo <= 0) { mostrarErrorCampo(costoInput, 'Ingresa un costo válido'); return; }

  // §3: sin jornada marcada/declarada en esa fecha no se puede registrar
  // nada; con jornada, Desayuno/Almuerzo respetan su corte horario — se
  // revalida acá además de deshabilitarlo en el select (defensa en
  // profundidad, por si el valor llegó bloqueado de otra forma).
  if (!jornadaDelGasto(fechaInput.value)) { mostrarToast('No hay una jornada marcada o declarada en esa fecha: no se puede registrar el gasto.'); return; }
  if (!comidaDisponible(comida, fechaInput.value)) { mostrarToast(`${comida} ya no está disponible: la jornada de ese día inició después del corte.`); return; }

  const { totalDia, totalComida } = totalesAlimentosDelDia(fechaInput.value, comida);
  const topeComida = LIMITES_GASTOS_DEMO.alimentos[comida.toLowerCase()];
  const topeDia = LIMITES_GASTOS_DEMO.alimentos.montoMaximoDia;
  if (totalComida + costo > topeComida) { mostrarToast(`Supera el tope de ${comida.toLowerCase()} (S/ ${topeComida.toFixed(2)}).`); return; }
  if (totalDia + costo > topeDia) { mostrarToast(`Supera el tope del día (S/ ${topeDia.toFixed(2)}).`); return; }

  // Gasto olvidado (§3): la Jornada de esa fecha ya cerró — pide
  // justificación y respeta el plazo (configurable, 48h por defecto desde
  // el FIN de esa jornada); pasado el plazo, ni agregar ni editar.
  const justificacionInput = document.getElementById('alimentosJustificacion');
  const esOlvido = esGastoOlvidado(fechaInput.value);
  if (esOlvido) {
    if (!dentroDePlazoOlvido(fechaInput.value)) { mostrarToast(`Ya pasó el plazo (${CONFIG_JORNADA_DEMO.plazoOlvidoHoras} h) para agregar un gasto olvidado en esta fecha.`); return; }
    if (!justificacionInput.value.trim()) { mostrarErrorCampo(justificacionInput, 'La justificación es obligatoria para un gasto olvidado'); return; }
  }

  // Operación/PER y Cliente ya no se eligen a mano (§1): se derivan de las
  // operaciones ASIGNADAS al operador (siempre tiene al menos una, no
  // depende de si hubo precintos usados ese día) — con varias, se unen por
  // " / " (mismo criterio que usa generarDiasABordoOperador).
  const jornada = jornadaDelGasto(fechaInput.value);
  const operaciones = (typeof obtenerOperacionesAsignadasOperador === 'function') ? obtenerOperacionesAsignadasOperador(gastosMovilUsuario) : [];
  const codigoInfo = jornada ? obtenerOCrearCodigoReporteJornada('Alimentos', jornada.id) : null;

  const detalle = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
  const filaPrevia = alimentosIndiceEditando !== null ? detalle.grilla[alimentosIndiceEditando] : null;
  const fila = {
    fecha: fechaISOaDDMMYYYY(fechaInput.value), comida,
    lugar: lugarInput.value.trim(),
    cliente: operaciones.length ? operaciones.map(o => o.cliente).join(' / ') : '—',
    operacionPer: operaciones.length ? operaciones.map(o => o.per).join(' / ') : '—',
    jornadaId: jornada ? jornada.id : null,
    codigoJornada: codigoInfo ? codigoInfo.codigo : null,
    hora: horaInput.value || '—', costo,
    evidencia: sinSustento ? [] : [...alimentosEvidenciaTemp],
    sinSustento,
    agregadoPosterior: esOlvido,
    justificacion: esOlvido ? justificacionInput.value.trim() : '',
    agregadoEn: esOlvido ? ((filaPrevia && filaPrevia.agregadoEn) || new Date().toISOString()) : null
  };

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
  if (!puedeEditarGastoEnFecha(fila.fecha)) { mostrarToast('Ya pasó el plazo para editar este gasto: solo se puede ver y descargar.'); return; }

  alimentosIndiceEditando = indice;
  alimentosEvidenciaTemp = [...(fila.evidencia || [])];
  document.getElementById('tituloRegistrarAlimentos').textContent = 'Editar Alimentos';
  document.getElementById('alimentosComida').value = fila.comida;
  document.getElementById('alimentosFecha').value = fechaDDMMYYYYaISO(fila.fecha);
  document.getElementById('alimentosFecha').max = hoyISO();
  document.getElementById('alimentosLugar').value = fila.lugar;
  document.getElementById('alimentosHora').value = fila.hora === '—' ? '' : fila.hora;
  document.getElementById('alimentosCosto').value = fila.costo;
  document.getElementById('alimentosSinSustento').checked = !!fila.sinSustento;
  toggleEvidenciaAlimentos();
  renderEvidenciaChips('alimentosEvidenciaChips', alimentosEvidenciaTemp);
  document.getElementById('alimentosJustificacion').value = fila.justificacion || '';
  actualizarComidasDisponibles();
  renderPanelInformativoGasto('alimentos', fechaDDMMYYYYaISO(fila.fecha), 'Alimentos');
  abrirModal('modalRegistrarAlimentos');
}

function eliminarGastoAlimentos(indice) {
  const detalle0 = obtenerDetalleGastoPorTipo('Alimentos', gastosMovilPeriodo.ids['Alimentos']);
  const fila0 = detalle0.grilla[indice];
  if (!fila0) return;
  if (!puedeEditarGastoEnFecha(fila0.fecha)) { mostrarToast('Ya pasó el plazo para eliminar este gasto: solo se puede ver y descargar.'); return; }

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
  document.getElementById('movilidadJustificacion').value = '';
  actualizarJustificacionMovilidad();
  actualizarTopeMovilidad();
  renderPanelInformativoGasto('movilidad', hoyISO(), 'Movilidad');
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

  // §3: Movilidad solo tiene tope de monto (sin corte horario), pero sigue
  // exigiendo una jornada marcada/declarada en esa fecha.
  if (!jornadaDelGasto(fechaInput.value)) { mostrarToast('No hay una jornada marcada o declarada en esa fecha: no se puede registrar el gasto.'); return; }

  const topeViaje = LIMITES_GASTOS_DEMO.movilidad.montoMaximoViaje;
  const topeDia = LIMITES_GASTOS_DEMO.movilidad.montoMaximoDia;
  if (importe > topeViaje) { mostrarToast(`Supera el tope por viaje (S/ ${topeViaje.toFixed(2)}).`); return; }
  const totalDia = totalMovilidadDelDia(fechaInput.value);
  if (totalDia + importe > topeDia) { mostrarToast(`Supera el tope del día (S/ ${topeDia.toFixed(2)}).`); return; }

  // Gasto olvidado (§3): ver guardarGastoAlimentos.
  const justificacionInput = document.getElementById('movilidadJustificacion');
  const esOlvido = esGastoOlvidado(fechaInput.value);
  if (esOlvido) {
    if (!dentroDePlazoOlvido(fechaInput.value)) { mostrarToast(`Ya pasó el plazo (${CONFIG_JORNADA_DEMO.plazoOlvidoHoras} h) para agregar un gasto olvidado en esta fecha.`); return; }
    if (!justificacionInput.value.trim()) { mostrarErrorCampo(justificacionInput, 'La justificación es obligatoria para un gasto olvidado'); return; }
  }

  // Operaciones involucradas de la jornada de esa fecha (§1) — solo
  // informativo (ver renderPanelInformativoGasto); Movilidad no tenía
  // Cliente/Operación-PER como campo, pero igual queda ligada a su jornada.
  const jornadaMov = jornadaDelGasto(fechaInput.value);
  const codigoInfoMov = jornadaMov ? obtenerOCrearCodigoReporteJornada('Movilidad', jornadaMov.id) : null;

  const detalle = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
  const filaPrevia = movilidadIndiceEditando !== null ? detalle.grilla[movilidadIndiceEditando] : null;
  const fila = {
    fecha: fechaISOaDDMMYYYY(fechaInput.value), empresa: empresaInput.value.trim(),
    distritoPartida: partidaInput.value.trim() || '—', distritoDestino: destinoInput.value.trim() || '—',
    motivo: motivoInput.value.trim() || '—', importeDia: importe, totalDia: importe,
    jornadaId: jornadaMov ? jornadaMov.id : null,
    codigoJornada: codigoInfoMov ? codigoInfoMov.codigo : null,
    evidencia: sinSustento ? [] : [...movilidadEvidenciaTemp], sinSustento,
    agregadoPosterior: esOlvido,
    justificacion: esOlvido ? justificacionInput.value.trim() : '',
    agregadoEn: esOlvido ? ((filaPrevia && filaPrevia.agregadoEn) || new Date().toISOString()) : null
  };
  if (horasInput.value.trim()) fila.horas = horasInput.value.trim();

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
  if (!puedeEditarGastoEnFecha(fila.fecha)) { mostrarToast('Ya pasó el plazo para editar este gasto: solo se puede ver y descargar.'); return; }

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
  document.getElementById('movilidadJustificacion').value = fila.justificacion || '';
  actualizarJustificacionMovilidad();
  actualizarTopeMovilidad();
  renderPanelInformativoGasto('movilidad', fechaDDMMYYYYaISO(fila.fecha), 'Movilidad');
  abrirModal('modalRegistrarMovilidad');
}

function eliminarGastoMovilidad(indice) {
  const detalle0 = obtenerDetalleGastoPorTipo('Movilidad', gastosMovilPeriodo.ids['Movilidad']);
  const fila0 = detalle0.grilla[indice];
  if (!fila0) return;
  if (!puedeEditarGastoEnFecha(fila0.fecha)) { mostrarToast('Ya pasó el plazo para eliminar este gasto: solo se puede ver y descargar.'); return; }

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
// Filtros (§5): búsqueda libre (código/PER/cliente) + rango de fechas +
// orden — se aplican sobre el tipo seleccionado en los chips.
let reportesBusqueda = '';
let reportesDesdeFiltro = '';
let reportesHastaFiltro = '';
let reportesOrden = 'desc'; // 'desc' = más recientes primero

function hayPantallaReportes() { return !!document.getElementById('reportesAccordion'); }

function cambiarTabReportes(tipo) {
  reportesTabActiva = tipo;
  reportesAcordeonAbiertos = {};
  const idBoton = tipo === 'Alimentos' ? 'btnTabReportesAlimentos' : tipo === 'Movilidad' ? 'btnTabReportesMovilidad' : tipo === 'Días a Bordo' ? 'btnTabReportesDiasBordo' : 'btnTabReportesTodos';
  document.querySelectorAll('#reportesTabs .movil-tab-toggle-btn').forEach(btn => btn.classList.remove('activo'));
  const btn = document.getElementById(idBoton);
  if (btn) btn.classList.add('activo');
  renderReportesAccordion();
}

function actualizarFiltrosReportes() {
  const busq = document.getElementById('reportesBusqueda');
  const desde = document.getElementById('reportesDesde');
  const hasta = document.getElementById('reportesHasta');
  reportesBusqueda = busq ? busq.value.trim().toLowerCase() : '';
  reportesDesdeFiltro = desde ? desde.value : '';
  reportesHastaFiltro = hasta ? hasta.value : '';
  renderReportesAccordion();
}

function limpiarFiltrosReportes() {
  reportesBusqueda = ''; reportesDesdeFiltro = ''; reportesHastaFiltro = '';
  const busq = document.getElementById('reportesBusqueda');
  const desde = document.getElementById('reportesDesde');
  const hasta = document.getElementById('reportesHasta');
  if (busq) busq.value = '';
  if (desde) desde.value = '';
  if (hasta) hasta.value = '';
  renderReportesAccordion();
}

function cambiarOrdenReportes() {
  reportesOrden = reportesOrden === 'desc' ? 'asc' : 'desc';
  renderReportesAccordion();
}

// Texto de búsqueda de una fila: código de jornada, PER/viaje y cliente —
// mismos campos que trae cada fila ya derivados de las operaciones
// involucradas (ver guardarGastoAlimentos/Movilidad y generarDiasABordoOperador).
function filaCoincideBusqueda(f, codigo, texto) {
  if (!texto) return true;
  const campos = [codigo, f.operacionPer, f.cliente, f.per].filter(Boolean).join(' ').toLowerCase();
  return campos.includes(texto);
}

function filaDentroDeRango(f) {
  const fechaISO = fechaDDMMYYYYaISO(f.fecha);
  if (reportesDesdeFiltro && fechaISO < reportesDesdeFiltro) return false;
  if (reportesHastaFiltro && fechaISO > reportesHastaFiltro) return false;
  return true;
}

function toggleReportesAcordeon(clave) {
  reportesAcordeonAbiertos[clave] = !reportesAcordeonAbiertos[clave];
  renderReportesAccordion();
}

// "Agregado posterior" (§3): un gasto olvidado se marca con fecha/hora y
// justificación — se muestra así en el reporte en vez de verse igual que
// uno registrado el mismo día de la jornada.
function notaAgregadoPosterior(f) {
  if (!f.agregadoPosterior) return '';
  const fechaAgregado = f.agregadoEn ? new Date(f.agregadoEn).toLocaleString('es-PE') : '—';
  return `
    <div class="reportes-campo reportes-campo-olvido"><span>Agregado posterior</span><strong>${fechaAgregado}</strong></div>
    <div class="reportes-campo"><span>Justificación</span><strong>${f.justificacion || '—'}</strong></div>`;
}

function camposAcordeonReporte(tipo, f) {
  const chipsEvidencia = (f.evidencia || []).length
    ? f.evidencia.map(ev => `<span class="gastos-evidencia-chip">${ev}</span>`).join('')
    : `<span class="gastos-evidencia-vacia">${f.sinSustento ? 'Sin sustento' : 'Sin evidencia'}</span>`;
  const olvido = notaAgregadoPosterior(f);

  if (tipo === 'Alimentos') return `
    <div class="reportes-campo"><span>Lugar</span><strong>${f.lugar}</strong></div>
    <div class="reportes-campo"><span>Hora</span><strong>${f.hora}</strong></div>
    <div class="reportes-campo"><span>Costo</span><strong>S/ ${Number(f.costo || 0).toFixed(2)}</strong></div>
    <div class="reportes-evidencia">${chipsEvidencia}</div>${olvido}`;
  if (tipo === 'Movilidad') return `
    <div class="reportes-campo"><span>Empresa</span><strong>${f.empresa}</strong></div>
    <div class="reportes-campo"><span>Distrito de partida</span><strong>${f.distritoPartida}</strong></div>
    <div class="reportes-campo"><span>Distrito de destino</span><strong>${f.distritoDestino}</strong></div>
    <div class="reportes-campo"><span>Motivo</span><strong>${f.motivo}</strong></div>
    <div class="reportes-campo"><span>Importe Día</span><strong>S/ ${Number(f.importeDia || 0).toFixed(2)}</strong></div>
    <div class="reportes-evidencia">${chipsEvidencia}</div>${olvido}`;
  return `
    <div class="reportes-campo"><span>Lugar</span><strong>${f.lugar || '—'}</strong></div>
    <div class="reportes-campo"><span>Operación</span><strong>${f.operacion || '—'}</strong></div>
    <div class="reportes-campo"><span>Buque</span><strong>${f.buque || '—'}</strong></div>`;
}

// §5: ahora cada "tarjeta" es un reporte de jornada+tipo (ya no una fila
// suelta) — búsqueda por código/PER/cliente, rango de fechas y tipo (incl.
// "Todos", que mezcla los 3 tipos del período) se aplican antes de agrupar.
function renderReportesAccordion() {
  if (!hayPantallaReportes()) return;
  const cont = document.getElementById('reportesAccordion');
  const totalEl = document.getElementById('reportesTotalGeneral');
  const contadorEl = document.getElementById('reportesContador');
  const tipoSel = reportesTabActiva;

  regenerarDiasABordo(gastosMovilPeriodo.ids['Días a Bordo']);

  const tipos = tipoSel === 'Todos' ? ['Alimentos', 'Movilidad', 'Días a Bordo'] : [tipoSel];
  const campoMontoPorTipo = { 'Alimentos': 'costo', 'Movilidad': 'totalDia', 'Días a Bordo': 'monto' };

  let huboAlgoSinFiltrar = false;
  let filas = [];
  tipos.forEach(tipo => {
    const detalle = obtenerDetalleGastoPorTipo(tipo, gastosMovilPeriodo.ids[tipo]);
    if (detalle.grilla.length) huboAlgoSinFiltrar = true;
    const codigoCampo = tipo === 'Días a Bordo' ? 'codigo' : 'codigoJornada';
    detalle.grilla.forEach((f, i) => {
      if (!filaDentroDeRango(f)) return;
      const codigo = f[codigoCampo] || '';
      if (!filaCoincideBusqueda(f, codigo, reportesBusqueda)) return;
      filas.push({ ...f, _tipo: tipo, _indice: i, _codigo: codigo });
    });
  });

  if (!filas.length) {
    const hayFiltrosActivos = reportesBusqueda || reportesDesdeFiltro || reportesHastaFiltro;
    cont.innerHTML = huboAlgoSinFiltrar && hayFiltrosActivos
      ? `<p class="submodulo-tabla-vacio">Sin reportes para los filtros elegidos.</p>
         <button type="button" class="btn-accion btn-cancelar" style="width:100%;margin-top:8px;" onclick="limpiarFiltrosReportes()">Limpiar filtros</button>`
      : `<p class="submodulo-tabla-vacio">Sin registros de ${tipoSel.toLowerCase()} en este período.</p>`;
    totalEl.textContent = '';
    if (contadorEl) contadorEl.textContent = '';
    return;
  }

  // Un grupo = una jornada+tipo = UN reporte con su código único (§1) — con
  // "Todos" puede haber más de un grupo por fecha (uno por tipo).
  const porGrupo = {};
  filas.forEach(f => { (porGrupo[`${f._tipo}|${f.fecha}`] = porGrupo[`${f._tipo}|${f.fecha}`] || []).push(f); });
  const claves = Object.keys(porGrupo).sort((a, b) => {
    const cmp = fechaDDMMYYYYaISO(a.split('|')[1]).localeCompare(fechaDDMMYYYYaISO(b.split('|')[1]));
    return reportesOrden === 'desc' ? -cmp : cmp;
  });

  if (contadorEl) contadorEl.textContent = `${claves.length} reporte${claves.length === 1 ? '' : 's'}`;

  cont.innerHTML = claves.map(clave => {
    const [tipo, fecha] = clave.split('|');
    const filasGrupo = porGrupo[clave];
    const campoMonto = campoMontoPorTipo[tipo];
    const totalDia = filasGrupo.reduce((acc, f) => acc + (f.pendiente ? 0 : Number(f[campoMonto]) || 0), 0);
    const codigo = filasGrupo[0]._codigo || 'Sin registrar';
    const operaciones = (typeof obtenerOperacionesAsignadasOperador === 'function') ? obtenerOperacionesAsignadasOperador(gastosMovilUsuario) : [];
    const precintosDia = (typeof obtenerPrecintosDeJornada === 'function') ? obtenerPrecintosDeJornada(gastosMovilUsuario, fechaDDMMYYYYaISO(fecha)) : [];

    const filasHTML = filasGrupo.map((f, iDia) => {
      const claveAcordeon = `${tipo}-${fecha}-${iDia}`;
      const abierto = !!reportesAcordeonAbiertos[claveAcordeon];
      const titulo = tipo === 'Alimentos' ? f.comida : tipo === 'Movilidad' ? `Movilidad ${iDia + 1}` : (f.detalle || `Día ${iDia + 1}`);
      const monto = f.pendiente ? 'Pendiente' : `S/ ${Number(f[campoMonto] || 0).toFixed(2)}`;
      const acciones = tipo === 'Días a Bordo' ? '' : `
        <div class="reportes-acordeon-acciones">
          <button type="button" class="btn-accion btn-editar" onclick="event.stopPropagation(); ${tipo === 'Alimentos' ? 'editarGastoAlimentos' : 'editarGastoMovilidad'}(${f._indice})">Editar</button>
          <button type="button" class="btn-accion btn-eliminar" onclick="event.stopPropagation(); ${tipo === 'Alimentos' ? 'eliminarGastoAlimentos' : 'eliminarGastoMovilidad'}(${f._indice})">Eliminar</button>
        </div>`;
      return `
        <div class="reportes-acordeon-item${abierto ? ' abierto' : ''}">
          <button type="button" class="reportes-acordeon-header" onclick="toggleReportesAcordeon('${claveAcordeon}')">
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
          <span class="reportes-dia-fecha">${tipoSel === 'Todos' ? tipo + ' · ' : ''}${fecha}</span>
          <span class="reportes-dia-codigo">${codigo}</span>
        </div>
        <div class="reportes-dia-operaciones">${textoOperacionesInvolucradas(operaciones)} · ${precintosDia.length ? `Precintos usados (${precintosDia.length})` : 'Sin precintos usados'}</div>
        <div class="reportes-dia-header">
          <span class="reportes-dia-total">Total: S/ ${totalDia.toFixed(2)}</span>
        </div>
        ${filasHTML}
      </div>`;
  }).join('');

  const totalGeneral = filas.reduce((acc, f) => acc + (f.pendiente ? 0 : Number(f[campoMontoPorTipo[f._tipo]]) || 0), 0);
  totalEl.textContent = `Total ${tipoSel === 'Todos' ? 'general' : 'del período'}: S/ ${totalGeneral.toFixed(2)}`;
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
