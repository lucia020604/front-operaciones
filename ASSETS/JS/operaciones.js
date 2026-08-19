// =================================================
// OPERACIONES.JS
// =================================================

// =================================================
// 1. DISTANCIAS - HORAS
// =================================================

const TERMINALES = ['Talara','Bayóvar','Eten','Salaverry','Chimbote','Supe','Relapa','Callao','Conchán','Pisco','S. Nicolás','Mollendo','Tablones','Ilo'];

// Matriz triangular inferior (fila i, columna j, j <= i). D[i][i] = diagonal (mismo terminal).
const D = [
  [0],
  [7,0],
  [15,10,0],
  [23,17,8,0],
  [27,21,12,5,0],
  [36,30,21,14,9,0],
  [41,36,27,20,15,6,0],
  [42,36,28,21,16,7,1,0],
  [44,38,30,22,18,9,2,2,0],
  [52,46,38,30,26,17,11,10,8,0],
  [60,55,46,39,35,25,20,19,17,9,0],
  [78,72,64,57,52,44,37,37,35,27,17,0],
  [81,76,67,60,55,46,41,38,32,21,5,null,0],
  [82,76,68,61,56,47,42,41,39,33,22,6,1,0],
];

let selEstado = null; // {r, c}
let ibFrom = -1, ibTo = -1;

function heatClass(v) {
  if (v === null || v === undefined) return '';
  if (v <= 9)  return 'h0';
  if (v <= 20) return 'h1';
  if (v <= 35) return 'h2';
  if (v <= 55) return 'h3';
  return 'h4';
}

function pintarMatrizDistancias() {
  const body = document.getElementById('matrizBody');
  const selO = document.getElementById('terminalInicio');
  const selD = document.getElementById('terminalDestino');
  if (!body) return;

  // Poblar selects con índice como value (para mapear directo a la matriz D)
  if (selO && selO.options.length <= 1) {
    TERMINALES.forEach((t, i) => {
      selO.appendChild(new Option(t, i));
      selD.appendChild(new Option(t, i));
    });
  }

  body.innerHTML = TERMINALES.map((fila, i) => {
    let celdas = `<td class="matriz-nombre-fila" data-ri="${i}">${fila}</td>`;
    for (let j = 0; j <= i; j++) {
      if (j === i) {
        celdas += `<td class="matriz-diagonal">${fila}</td>`;
      } else {
        const v = D[i][j];
        if (v === null) {
          celdas += `<td class="matriz-celda-vacia">—</td>`;
        } else {
          celdas += `<td class="matriz-celda-valor ${heatClass(v)}" data-r="${i}" data-c="${j}"
            onmouseenter="onHoverCelda(event,${i},${j})" onmousemove="moverTooltip(event)" onmouseleave="ocultarTooltip()"
            onclick="onClickCelda(${i},${j})">${v}</td>`;
        }
      }
    }
    return `<tr>${celdas}</tr>`;
  }).join('');
}

// ===== TOOLTIP =====
function onHoverCelda(e, r, c) {
  const tt = document.getElementById('ttDistancia');
  document.getElementById('ttFrom').textContent = TERMINALES[c];
  document.getElementById('ttTo').textContent = TERMINALES[r];
  document.getElementById('ttVal').textContent = D[r][c];
  tt.classList.add('on');
  moverTooltip(e);
}

function moverTooltip(e) {
  const tt = document.getElementById('ttDistancia');
  const x = Math.min(e.clientX + 15, window.innerWidth - (tt.offsetWidth || 160) - 8);
  const y = Math.min(e.clientY - 14, window.innerHeight - (tt.offsetHeight || 70) - 8);
  tt.style.left = x + 'px';
  tt.style.top = y + 'px';
}

function ocultarTooltip() {
  document.getElementById('ttDistancia').classList.remove('on');
}

// ===== HIGHLIGHT FILA/COLUMNA AL CLICK =====
function limpiarHighlight() {
  document.querySelectorAll('.matriz-celda-valor').forEach(td => td.classList.remove('r-hl', 'c-hl', 'sel', 'found'));
  document.querySelectorAll('.matriz-nombre-fila').forEach(td => td.classList.remove('rh-hi'));
}

function aplicarHighlight() {
  limpiarHighlight();
  if (!selEstado) return;
  const { r, c } = selEstado;
  document.querySelectorAll('.matriz-nombre-fila').forEach(td => {
    if (Number(td.dataset.ri) === r) td.classList.add('rh-hi');
  });
  document.querySelectorAll('.matriz-celda-valor').forEach(td => {
    const tr = Number(td.dataset.r), tc = Number(td.dataset.c);
    if (tr === r && tc === c) td.classList.add('sel');
    else if (tr === r) td.classList.add('r-hl');
    else if (tc === c) td.classList.add('c-hl');
  });
}

function onClickCelda(r, c) {
  if (selEstado && selEstado.r === r && selEstado.c === c) {
    selEstado = null;
    limpiarHighlight();
    cerrarInfoBar();
    return;
  }
  selEstado = { r, c };
  aplicarHighlight();
  mostrarInfoBar(c, r, D[r][c]);
}

// ===== INFO BAR =====
function mostrarInfoBar(from, to, valor) {
  ibFrom = from; ibTo = to;
  document.getElementById('ibFrom').textContent = TERMINALES[from];
  document.getElementById('ibTo').textContent = TERMINALES[to];
  document.getElementById('ibVal').innerHTML = `${valor}<sup> h</sup>`;
  document.getElementById('infoBar').classList.add('on');
}

function cerrarInfoBar() {
  document.getElementById('infoBar').classList.remove('on');
  ibFrom = -1; ibTo = -1;
}

// ===== BUSCAR / LIMPIAR (selects) =====
function buscarDistancia() {
  const oVal = document.getElementById('terminalInicio').value;
  const dVal = document.getElementById('terminalDestino').value;

  if (oVal === '' || dVal === '') {
    mostrarToast('Selecciona terminal de inicio y destino');
    return;
  }
  if (oVal === dVal) {
    mostrarToast('El terminal de inicio y destino no pueden ser iguales');
    return;
  }

  const oi = Number(oVal), di = Number(dVal);
  const r = Math.max(oi, di), c = Math.min(oi, di);

  selEstado = null;
  limpiarHighlight();

  const td = document.querySelector(`.matriz-celda-valor[data-r="${r}"][data-c="${c}"]`);
  if (td) {
    td.classList.add('found');
    const scroll = document.getElementById('matScroll');
    const tdRect = td.getBoundingClientRect();
    const scRect = scroll.getBoundingClientRect();
    scroll.scrollLeft += tdRect.left - scRect.left - scRect.width / 2 + tdRect.width / 2;
    scroll.scrollTop += tdRect.top - scRect.top - scRect.height / 2 + tdRect.height / 2;
  }

  mostrarInfoBar(oi, di, D[r][c]);
}

function limpiarFiltrosDistancia() {
  document.getElementById('terminalInicio').value = '';
  document.getElementById('terminalDestino').value = '';
  selEstado = null;
  limpiarHighlight();
  cerrarInfoBar();
}

// =================================================
// 2. HORARIO DE BUQUES (Calendario)
// Se alimenta de las operaciones reales de Seguimiento de Operaciones
// (opCargarOperaciones, definida en seguimiento-operaciones.js) en vez de
// un catálogo de eventos fijo: cada buque en operación aparece como
// columna y cada operación se ubica en el día/turno que le corresponde.
// =================================================

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
// Orden de los turnos DENTRO de un día tal como se rotulan en el sistema:
// '23-07' de un día es el tramo que EMPIEZA 23:00 el día anterior y
// TERMINA 07:00 ese día — por eso va primero (ya está "cerrando" cuando
// arranca el día), seguido de '07-15' y '15-23', que sí ocurren dentro de
// ese mismo día. Se usa tanto para pintar las filas de la vista Semana
// como para recorrer los turnos de un día en orden al armar un tramo
// continuo en el calendario (eventosHorarioDesdeOperaciones) y para
// ordenar los bloques de un día en la vista Mes — TIENE que ser el mismo
// orden en los tres casos, porque si no, un turno "23-07" se trata como
// si fuera el último del día en vez del primero y la operación se corta
// dejando un hueco (ver turnosDelDia más abajo).
const TURNOS_HORARIO = ['23-07', '07-15', '15-23'];
const HORARIO_COLOR_CLASSES = ['t1', 't2', 't3', 't4', 't5', 't6'];

let calFechaActual = new Date(); // por defecto arranca en la fecha de hoy
let calFormato = 'semana'; // 'mes' | 'semana' | 'anio' — controla el rango de días que pinta pintarHorarioBuques()
// Mes buscado con el filtro "Mes" ('YYYY-MM') — en la vista Año, ese mes
// se remarca en amarillo y la vista se desplaza hasta él (ver
// pintarHorarioAnioGrid). Se limpia al buscar sin Mes cargado o al usar
// "Limpiar filtros".
let calMesResaltado = null;

// Días a mostrar según el formato activo. En "mes" es el mes completo de
// calFechaActual; en "semana" son los 7 días (lunes a domingo) que
// contienen a calFechaActual — cada día trae su propio mes/año para que una
// semana a caballo entre dos meses se pinte igual de bien que una del medio.
// En "anio" no aplica (pintarHorarioAnioGrid arma los 12 meses por su
// cuenta con diasGridMes), así que no hay nada que devolver acá.
function diasDelPeriodoHorario() {
  if (calFormato === 'anio') return [];
  if (calFormato === 'semana') {
    const base = new Date(calFechaActual);
    const diaSemana = base.getDay(); // 0 = domingo
    const offsetLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(base);
    lunes.setDate(base.getDate() + offsetLunes);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return { dia: d.getDate(), mes: d.getMonth(), anio: d.getFullYear() };
    });
  }
  const anio = calFechaActual.getFullYear();
  const mes = calFechaActual.getMonth();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  return Array.from({ length: diasEnMes }, (_, i) => ({ dia: i + 1, mes, anio }));
}

function tituloPeriodoHorario(dias) {
  if (calFormato === 'anio') return String(calFechaActual.getFullYear());
  if (calFormato === 'mes') return `${MESES[calFechaActual.getMonth()]} ${calFechaActual.getFullYear()}`;
  const ini = dias[0];
  const fin = dias[dias.length - 1];
  const iniTxt = ini.anio === fin.anio
    ? `${ini.dia} ${MESES[ini.mes].slice(0, 3)}`
    : `${ini.dia} ${MESES[ini.mes].slice(0, 3)} ${ini.anio}`;
  const finTxt = `${fin.dia} ${MESES[fin.mes].slice(0, 3)} ${fin.anio}`;
  return `${iniTxt} - ${finTxt}`;
}

// Opciones del filtro "Año": los años que tienen alguna operación
// registrada, más el año actual aunque todavía no tenga nada agendado
// (así siempre hay algo para seleccionar por defecto). Sin opción
// "Todos" — el filtro arranca con el año actual ya seleccionado.
function poblarSelectAnioHorario() {
  const select = document.getElementById('filtroAnio');
  if (!select || typeof opCargarOperaciones !== 'function') return;
  const anioActual = new Date().getFullYear();
  const anios = [...new Set([
    anioActual,
    ...opCargarOperaciones().map(o => o.fechaInicio ? Number(o.fechaInicio.slice(0, 4)) : null).filter(Boolean)
  ])].sort((a, b) => a - b);
  select.innerHTML = anios.map(a => `<option value="${a}"${a === anioActual ? ' selected' : ''}>${a}</option>`).join('');
}

// Opciones del filtro "Mes": los 12 meses del año, sin año — el año lo
// pone el filtro "Año" (o, si no se eligió, el que ya se esté viendo).
function poblarSelectMesHorario() {
  const select = document.getElementById('filtroMes');
  if (!select) return;
  select.innerHTML = '<option value="">Todos</option>' + MESES.map((nombre, i) => `<option value="${i}">${nombre}</option>`).join('');
}

// Una operación "tiene retraso" si en algún punto de su rango Fecha
// Inicio-Fin cae un retraso propio (RETRASOS_GANTT) o uno heredado de un
// cierre de terminal — a diferencia de retrasoDeOperacionEnFecha(), acá no
// importa un día puntual, sirve para el filtro "Solo con retraso".
function operacionTieneRetraso(o) {
  const desde = o.fechaInicio;
  const hasta = o.fechaFin && o.fechaFin >= o.fechaInicio ? o.fechaFin : o.fechaInicio;
  const propio = RETRASOS_GANTT.some(r => r.opId === o.id && r.fechaInicio <= hasta && r.fechaFin >= desde);
  if (propio) return true;
  return cierresQueAfectanOperacion(o).some(c => c.fechaInicio <= hasta && c.fechaFin >= desde);
}

// Predicado de filtros compartido por eventosHorarioDesdeOperaciones() y
// buquesHorario() — centralizado acá para que agregar un filtro nuevo no
// obligue a tocar los dos lugares por separado (antes se duplicaba la
// lógica de Cliente/Buque en cada función, con el riesgo de que uno de los
// dos quedara desactualizado).
function operacionCoincideFiltrosHorario(o) {
  const clienteFiltro = document.getElementById('filtroCliente')?.value || '';
  const buqueFiltro = document.getElementById('filtroBuque')?.value || '';
  const estadoFiltro = document.getElementById('filtroEstadoHorario')?.value || '';
  const tipoOperacionFiltro = document.getElementById('filtroTipoOperacionHorario')?.value || '';
  const soloRetraso = document.getElementById('filtroSoloRetrasoHorario')?.checked || false;
  const textoFiltro = (document.getElementById('filtroTextoHorario')?.value || '').toLowerCase().trim();

  if (clienteFiltro && opClienteInfo(o).nombre !== clienteFiltro) return false;
  if (buqueFiltro && o.nave !== buqueFiltro) return false;
  if (estadoFiltro && o.estado !== estadoFiltro) return false;
  if (tipoOperacionFiltro && o.tipoOperacion !== tipoOperacionFiltro) return false;
  if (soloRetraso && !operacionTieneRetraso(o)) return false;
  if (textoFiltro) {
    const enTexto = [o.id, o.nave, opClienteInfo(o).nombre, o.tipoOperacion, o.terminalInicial, o.terminalDestino]
      .some(campo => (campo || '').toLowerCase().includes(textoFiltro));
    if (!enTexto) return false;
  }
  return true;
}

// Buques mostrados como columnas: se toman de las operaciones reales en
// vez de un catálogo fijo, para que el calendario siempre refleje lo que
// de verdad está programado en Seguimiento de Operaciones. Aplica los
// mismos filtros que eventosHorarioDesdeOperaciones() (vía
// operacionCoincideFiltrosHorario) — si no, filtrar por Cliente igual
// dejaría ver de columna las naves de otros clientes (vacías, porque sus
// eventos sí quedan filtrados), en vez de que solo se vea lo filtrado.
function buquesHorario() {
  if (typeof opCargarOperaciones !== 'function') return [];
  const naves = opCargarOperaciones()
    .filter(o => o.estado !== 'Cancelado')
    .filter(operacionCoincideFiltrosHorario)
    .map(o => o.nave)
    .filter(Boolean);
  return [...new Set(naves)];
}

// Turno según la hora de la Estimación Fecha/Hora de la operación (o
// '07-15' si no la tiene) — mismos tres bloques que ya usaba el calendario.
function turnoDesdeHora(hora) {
  if (hora === null || Number.isNaN(hora)) return '07-15';
  if (hora >= 23 || hora < 7) return '23-07';
  if (hora < 15) return '07-15';
  return '15-23';
}

// Lista de fechas 'YYYY-MM-DD' entre inicio y fin (inclusive). Se limita a
// 31 días como salvaguarda: una operación real dura 1 o 2 días — el tope
// solo evita que una Fecha Fin mal cargada (heredada de una nominación con
// una ventana larga) genere miles de celdas.
function rangoFechasHorario(fechaInicio, fechaFin) {
  const fin = fechaFin && fechaFin >= fechaInicio ? fechaFin : fechaInicio;
  const fechas = [];
  const cursor = new Date(`${fechaInicio}T00:00`);
  const finDate = new Date(`${fin}T00:00`);
  while (cursor <= finDate && fechas.length < 31) {
    const y = cursor.getFullYear(), m = cursor.getMonth() + 1, d = cursor.getDate();
    fechas.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return fechas;
}

// Fecha y hora en que terminó realmente la actividad de la operación,
// tomada del primer campo "termina*" con valor en horarios (varía según
// tipoOperacion: terminaCarga, terminaDescarga, terminaSuministro,
// terminaTransferencia...). Se necesita la fecha completa (no solo la
// hora) porque un turno nocturno (23-07) termina al día siguiente — si
// solo se mirara la hora, una operación que arranca a las 23:00 y termina
// a las 05:00 del día después se veía como si terminara "antes" de
// empezar, en vez de extenderse al día siguiente.
function operacionFechaHoraFin(op) {
  const campos = Object.keys(op.horarios || {});
  const campoFin = campos.find(k => k.startsWith('termina') && op.horarios[k]?.valor);
  if (!campoFin) return null;
  const [fecha, hora] = op.horarios[campoFin].valor.split('T');
  return { fecha, horaTexto: hora?.slice(0, 5), horaNum: Number(hora?.slice(0, 2)) };
}

// Arma los eventos del calendario a partir de las operaciones reales,
// aplicando los filtros de la barra (texto libre, Cliente/Buque/Estado/
// Con retraso de Filtros avanzados) vía operacionCoincideFiltrosHorario().
// La navegación en el tiempo (qué mes/semana se ve) es responsabilidad
// exclusiva de las flechas y el botón Hoy — no hay filtro de rango de
// fechas acá, para no duplicar esa navegación con un control aparte. Cada
// operación aparece en TODOS los días entre su Fecha Inicio y su Fecha
// Fin (no solo el primero), para que se vea el inicio y fin real.
function eventosHorarioDesdeOperaciones() {
  if (typeof opCargarOperaciones !== 'function') return [];

  const operaciones = opCargarOperaciones()
    // Una operación Cancelada no va a operar — no debe ocupar un espacio en
    // el calendario de Horario de Buques. El resto del flujo (Activo, En
    // Proceso, Finalizado) sí se agenda con normalidad.
    .filter(o => o.fechaInicio && o.nave && o.estado !== 'Cancelado')
    .filter(operacionCoincideFiltrosHorario);

  const eventos = [];
  operaciones.forEach((o, i) => {
    const personal = (o.personal || []).map(p => `${p.rol}: ${p.nombre}`).join('\n') || 'Sin personal asignado';
    const horaEta = o.horarios?.eta?.valor?.split('T')[1] || o.estimacionFechaHora?.split('T')[1] || '';
    const colorClass = HORARIO_COLOR_CLASSES[i % HORARIO_COLOR_CLASSES.length];

    const horaInicioNum = o.estimacionFechaHora ? Number(o.estimacionFechaHora.split('T')[1]?.slice(0, 2)) : null;
    const turnoInicio = turnoDesdeHora(horaInicioNum);
    const finReal = operacionFechaHoraFin(o);
    const turnoFin = finReal ? turnoDesdeHora(finReal.horaNum) : turnoInicio;
    // La hora que se muestra es la exacta registrada (estimación de inicio /
    // termina* real), no el límite del bloque de turno — así "23:00" y
    // "05:00" se ven tal cual, en vez de redondearse a los bordes 23:00/07:00
    // del turno nocturno que solo se usan internamente para ubicar filas.
    const horaInicioTexto = o.estimacionFechaHora ? o.estimacionFechaHora.split('T')[1]?.slice(0, 5) : TURNO_HORA_INICIO[turnoInicio];
    const horaFinTexto = finReal ? finReal.horaTexto : TURNO_HORA_FIN[turnoFin];

    // La Fecha Fin que se agenda es la más tardía entre la registrada en la
    // operación y la fecha real del "termina*" (si el turno de cierre cruza
    // medianoche, esa fecha real cae un día después) — así el calendario
    // siempre refleja el cierre real de la operación, aunque el campo Fecha
    // Fin de la operación no se haya actualizado a mano.
    const fechaFinBase = o.fechaFin && o.fechaFin >= o.fechaInicio ? o.fechaFin : o.fechaInicio;
    const fechaFinCalendario = finReal && finReal.fecha > fechaFinBase ? finReal.fecha : fechaFinBase;

    const dias = rangoFechasHorario(o.fechaInicio, fechaFinCalendario);
    const iTurnoInicio = TURNOS_HORARIO.indexOf(turnoInicio);
    const iTurnoFin = TURNOS_HORARIO.indexOf(turnoFin);

    dias.forEach((fechaStr, idx) => {
      const [anio, mes, dia] = fechaStr.split('-').map(Number);
      const esPrimerDia = idx === 0;
      const esUltimoDia = idx === dias.length - 1;

      // Turnos que se pintan ESE día: desde el turno de inicio hasta el de
      // fin, sin huecos — un solo día pinta de turnoInicio a turnoFin; el
      // primer día de varios pinta de turnoInicio al último turno del día;
      // el último día pinta desde el primer turno del día hasta turnoFin;
      // cualquier día intermedio se pinta completo.
      let turnosDelDia;
      if (dias.length === 1) {
        turnosDelDia = iTurnoFin >= iTurnoInicio ? TURNOS_HORARIO.slice(iTurnoInicio, iTurnoFin + 1) : [turnoInicio];
      } else if (esPrimerDia) {
        turnosDelDia = TURNOS_HORARIO.slice(iTurnoInicio);
      } else if (esUltimoDia) {
        turnosDelDia = TURNOS_HORARIO.slice(0, iTurnoFin + 1);
      } else {
        turnosDelDia = TURNOS_HORARIO;
      }

      const retraso = retrasoDeOperacionEnFecha(o, fechaStr);

      turnosDelDia.forEach(turno => {
        const esInicio = esPrimerDia && turno === turnoInicio;
        const esFin = esUltimoDia && turno === turnoFin;

        eventos.push({
          dia, mes: mes - 1, anio,
          turno,
          buque: o.nave,
          terminal: o.terminalInicial || '—',
          eta: horaEta,
          personal,
          colorClass,
          opId: o.id,
          retraso: !!retraso,
          retrasoTipo: retraso ? (CIERRE_TIPO_TEXTO[retraso.tipo] || retraso.tipo) : null,
          esInicio,
          esFin,
          horaInicioOperacion: horaInicioTexto,
          horaFinOperacion: horaFinTexto,
          fechaInicioOperacion: o.fechaInicio,
          fechaFinOperacion: fechaFinCalendario,
          estado: o.estado
        });
      });
    });
  });

  return eventos;
}

// Un evento se pinta en rojo si la operación tiene un retraso de atención
// registrado ese día — ya sea uno propio de la nave (RETRASOS_GANTT) o uno
// heredado de un cierre de terminal que afecta su Terminal Inicial/Destino.
function retrasoDeOperacionEnFecha(op, fecha) {
  const propio = RETRASOS_GANTT.find(r => r.opId === op.id && fecha >= r.fechaInicio && fecha <= r.fechaFin);
  if (propio) return propio;
  const porCierre = cierresQueAfectanOperacion(op).find(c => fecha >= c.fechaInicio && fecha <= c.fechaFin);
  return porCierre || null;
}

let eventosHorarioActuales = [];

function iconoKpiHorario(path) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>`;
}

function kpiCardHtmlHorario(label, valor, color, iconoPath) {
  return `
    <div class="kpi-card">
      <div class="kpi-value">${valor}</div>
      <div class="kpi-label">${label}</div>
      <div class="kpi-icon-box" style="background:${color}1A; color:${color};">${iconoKpiHorario(iconoPath)}</div>
    </div>`;
}

// Resume el período visible del calendario (mes/semana en curso, o el año
// completo en la vista Año) en 4 cifras, respetando los filtros de Cliente
// y Buque ya aplicados a eventosHorarioActuales — antes no había ningún
// número que respondiera "¿cuántas operaciones hay acá?" sin contar
// bloques a mano.
function actualizarKpisHorario() {
  const cont = document.getElementById('horarioKpiGrid');
  if (!cont) return;

  const dias = diasDelPeriodoHorario();
  const clavesDias = new Set(dias.map(d => `${d.anio}-${d.mes}-${d.dia}`));
  const anioActual = calFechaActual.getFullYear();

  const eventosDelPeriodo = calFormato === 'anio'
    ? eventosHorarioActuales.filter(ev => ev.anio === anioActual)
    : eventosHorarioActuales.filter(ev => clavesDias.has(`${ev.anio}-${ev.mes}-${ev.dia}`));

  // Un evento se repite por cada día/turno que ocupa una misma operación —
  // se agrupa por opId para que las 4 cifras cuenten operaciones, no filas.
  const operaciones = new Map();
  const opsConRetraso = new Set();
  eventosDelPeriodo.forEach(ev => {
    if (!operaciones.has(ev.opId)) operaciones.set(ev.opId, ev);
    if (ev.retraso) opsConRetraso.add(ev.opId);
  });

  const listaOps = Array.from(operaciones.values());
  const buques = new Set(listaOps.map(ev => ev.buque));
  const enCurso = listaOps.filter(ev => ev.estado !== 'Finalizado').length;

  cont.innerHTML =
    kpiCardHtmlHorario('Operaciones totales', operaciones.size, '#111111', '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>') +
    kpiCardHtmlHorario('En curso', enCurso, '#1D4ED8', '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>') +
    kpiCardHtmlHorario('Con retraso', opsConRetraso.size, '#DC2626', '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>') +
    kpiCardHtmlHorario('Buques', buques.size, '#16A34A', '<path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2h-3"/><path d="M12 10V4a1 1 0 0 0-1-1H6.14a1 1 0 0 0-1 .89l-.32 2.15"/>');
}

function pintarHorarioBuques() {
  const titulo = document.getElementById('calMesTitulo');
  const mesGrid = document.getElementById('horarioMesGrid');
  const semanaWrap = document.getElementById('horarioSemanaWrap');
  const anioGrid = document.getElementById('horarioAnioGrid');
  const sinResultados = document.getElementById('horarioSinResultados');
  if (!mesGrid || !semanaWrap) return;

  eventosHorarioActuales = eventosHorarioDesdeOperaciones();

  const dias = diasDelPeriodoHorario();
  if (titulo) titulo.textContent = tituloPeriodoHorario(dias);

  // El calendario "vacío" es normal cuando nadie filtró nada (un mes sin
  // operaciones agendadas). Solo se avisa con un mensaje cuando hay un
  // filtro de Cliente y/o Buque activo y es lo que dejó la vista sin
  // resultados.
  const hayFiltroActivo = !!(document.getElementById('filtroCliente')?.value || document.getElementById('filtroBuque')?.value ||
    document.getElementById('filtroTextoHorario')?.value.trim() || document.getElementById('filtroEstadoHorario')?.value ||
    document.getElementById('filtroSoloRetrasoHorario')?.checked);
  const sinCoincidencias = hayFiltroActivo && eventosHorarioActuales.length === 0;
  if (sinResultados) sinResultados.style.display = sinCoincidencias ? '' : 'none';

  actualizarKpisHorario();
  horActualizarBotonFiltrosAvanzados();

  if (sinCoincidencias) {
    mesGrid.style.display = 'none';
    semanaWrap.style.display = 'none';
    if (anioGrid) anioGrid.style.display = 'none';
    return;
  }

  if (calFormato === 'mes') {
    mesGrid.style.display = '';
    semanaWrap.style.display = 'none';
    if (anioGrid) anioGrid.style.display = 'none';
    pintarHorarioMesGrid();
  } else if (calFormato === 'anio') {
    mesGrid.style.display = 'none';
    semanaWrap.style.display = 'none';
    if (anioGrid) anioGrid.style.display = '';
    pintarHorarioAnioGrid();
  } else {
    mesGrid.style.display = 'none';
    semanaWrap.style.display = '';
    if (anioGrid) anioGrid.style.display = 'none';
    pintarHorarioSemanaTabla(dias);
  }
}

const MESES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS_SEMANA_LARGO = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const TURNO_HORA_INICIO = { '07-15': '07:00', '15-23': '15:00', '23-07': '23:00' };
const TURNO_HORA_FIN = { '07-15': '15:00', '15-23': '23:00', '23-07': '07:00' };
// Relaciona cada turno con el color de su punto en la leyenda
// (leyenda-turnos, horario-buques.html) — se usa en la columna "Turno" de
// la vista Semana para que el color de la leyenda tenga un correlato real
// en la tabla, en vez de ser un color que no se pinta en ningún lado.
const TURNO_LEYENDA_CLASE = { '07-15': 'turno-1', '15-23': 'turno-2', '23-07': 'turno-3' };

// Cuadrícula de celdas (domingo a sábado) que cubre el mes de calFechaActual
// completo, agregando los días sobrantes de la semana anterior/siguiente —
// igual que un calendario mensual tipo Outlook — para que ninguna semana
// quede a medias.
function diasGridMes(anio, mes) {
  const primerDia = new Date(anio, mes, 1);
  const inicioGrid = new Date(primerDia);
  inicioGrid.setDate(primerDia.getDate() - primerDia.getDay());

  const ultimoDia = new Date(anio, mes + 1, 0);
  const finGrid = new Date(ultimoDia);
  finGrid.setDate(ultimoDia.getDate() + (6 - ultimoDia.getDay()));

  const dias = [];
  const cursor = new Date(inicioGrid);
  while (cursor <= finGrid) {
    dias.push({
      dia: cursor.getDate(),
      mes: cursor.getMonth(),
      anio: cursor.getFullYear(),
      fueraDeMes: cursor.getMonth() !== mes
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

// Etiqueta de hora de un bloque en la vista Mes: si la operación es de un
// solo día se ve el rango completo (07:00-15:00); si abarca varios días se
// deja claro si ese bloque es el inicio, el fin, o un día intermedio — así
// se distingue a simple vista cuándo empezó y cuándo terminó la operación.
function etiquetaHoraEventoMes(ev) {
  if (ev.esInicio && ev.esFin) return `${ev.horaInicioOperacion}-${ev.horaFinOperacion}`;
  if (ev.esInicio) return `Inicio ${ev.horaInicioOperacion}`;
  if (ev.esFin) return `Fin ${ev.horaFinOperacion}`;
  return 'En curso';
}

// ¿La operación opId tiene algún bloque pintado ese día? (sin importar el
// turno) — se usa para saber si el bloque de un día debe fundirse
// visualmente con el del día vecino, formando una sola barra continua en
// vez de celdas sueltas.
function operacionPintadaElDia(opId, dia, mes, anio) {
  return eventosHorarioActuales.some(e => e.opId === opId && e.dia === dia && e.mes === mes && e.anio === anio);
}

function pintarHorarioMesGrid() {
  const cont = document.getElementById('horarioMesGrid');
  if (!cont) return;

  const anio = calFechaActual.getFullYear();
  const mes = calFechaActual.getMonth();
  const dias = diasGridMes(anio, mes);
  const hoy = new Date();

  let html = '<div class="horario-mes-dow">'
    + DIAS_SEMANA_LARGO.map(d => `<div class="horario-mes-dow-cell">${d}</div>`).join('')
    + '</div><div class="horario-mes-celdas">';

  dias.forEach(({ dia, mes: m, anio: a, fueraDeMes }, i) => {
    const esHoy = hoy.getFullYear() === a && hoy.getMonth() === m && hoy.getDate() === dia;
    const mostrarMes = dia === 1 || i === 0;
    const etiquetaFecha = mostrarMes ? `${dia} de ${MESES_ABREV[m]}.` : String(dia);

    // Una operación de varios días ahora genera un evento por cada turno
    // pintado ese día (para que la vista Semana quede sin huecos) — acá se
    // deduplica por operación y se prioriza el bloque con más información
    // (el que marca el Fin, luego el que marca el Inicio, si no cualquiera)
    // para no repetir la misma operación varias veces en una sola celda.
    const porOperacion = new Map();
    eventosHorarioActuales.forEach((e, idx) => {
      if (e.dia !== dia || e.mes !== m || e.anio !== a) return;
      const actual = porOperacion.get(e.opId);
      if (!actual || e.esFin || (e.esInicio && !actual.esFin)) {
        porOperacion.set(e.opId, { ...e, idx });
      }
    });
    const eventosDia = [...porOperacion.values()]
      .sort((x, y) => TURNOS_HORARIO.indexOf(x.turno) - TURNOS_HORARIO.indexOf(y.turno));

    // Para que la operación se lea como UNA barra continua (no celdas
    // sueltas), el bloque se funde con el del día anterior/siguiente
    // cuando ese día también tiene la misma operación — pero solo dentro
    // de la misma fila (semana) de la grilla, porque un salto de fila no
    // se puede fundir visualmente.
    const columna = i % 7;
    const ayer = new Date(a, m, dia - 1);
    const manana = new Date(a, m, dia + 1);

    html += `<div class="horario-mes-celda${fueraDeMes ? ' fuera-de-mes' : ''}${esHoy ? ' es-hoy' : ''}">
      <div class="horario-mes-celda-fecha">${etiquetaFecha}</div>
      <div class="horario-mes-celda-eventos">
        ${eventosDia.map(ev => {
          const continuaDesdeAyer = columna > 0 && operacionPintadaElDia(ev.opId, ayer.getDate(), ayer.getMonth(), ayer.getFullYear());
          const continuaHaciaManana = columna < 6 && operacionPintadaElDia(ev.opId, manana.getDate(), manana.getMonth(), manana.getFullYear());
          const claseContinuidad = `${continuaDesdeAyer ? ' continua-antes' : ''}${continuaHaciaManana ? ' continua-despues' : ''}`;
          return `
          <div class="horario-evento horario-evento-mes ${ev.colorClass}${ev.estado === 'Finalizado' ? ' horario-evento-finalizada' : ''}${ev.retraso ? ' horario-evento-retraso' : ''}${claseContinuidad}" onclick="abrirModalOperacion(${ev.idx})" onmouseenter="mostrarTooltipEvento(event, ${ev.idx})" onmouseleave="ocultarTooltipEvento()">
            ${ev.retraso ? '⚠ ' : ''}${etiquetaHoraEventoMes(ev)} ${ev.buque}: ${ev.terminal}
          </div>
        `;
        }).join('')}
      </div>
    </div>`;
  });

  html += '</div>';
  cont.innerHTML = html;
}

const DIAS_SEMANA_MINI = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// Vista Año: los 12 meses en miniatura (mismo armado de grilla que
// diasGridMes usa en la vista Mes, reutilizado acá a menor escala), con
// los días que tienen operación marcados con un punto y los que tienen
// retraso en rojo — sin el detalle de buque/terminal, que no entra a este
// tamaño. Clic en el título del mes o en un día con operación lleva
// directo a la vista Mes de ese mes (irAMesDesdeAnio).
function pintarHorarioAnioGrid() {
  const cont = document.getElementById('horarioAnioGrid');
  if (!cont) return;

  const anio = calFechaActual.getFullYear();
  const hoy = new Date();

  let html = '';
  for (let m = 0; m < 12; m++) {
    const dias = diasGridMes(anio, m);
    const esMesHoy = hoy.getFullYear() === anio && hoy.getMonth() === m;
    // El mes buscado con el filtro "Mes" se remarca en amarillo para que
    // sea fácil de ubicar entre los 12 — comparación por 'YYYY-MM', mismo
    // formato que devuelve el <input type="month">.
    const claveMe = `${anio}-${String(m + 1).padStart(2, '0')}`;
    const esMesResaltado = calMesResaltado === claveMe;

    html += `<div class="horario-anio-mes${esMesResaltado ? ' resaltado' : ''}" data-mes-key="${claveMe}">
      <div class="horario-anio-mes-titulo${esMesHoy ? ' es-mes-hoy' : ''}" onclick="irAMesDesdeAnio(${anio}, ${m})">${MESES[m]}</div>
      <div class="horario-anio-mes-dow">${DIAS_SEMANA_MINI.map(d => `<span>${d}</span>`).join('')}</div>
      <div class="horario-anio-mes-dias">
        ${dias.map(({ dia, mes: dm, anio: da, fueraDeMes }) => {
          const eventosDia = eventosHorarioActuales.filter(e => e.dia === dia && e.mes === dm && e.anio === da);
          const tieneOperacion = eventosDia.length > 0;
          const tieneRetraso = eventosDia.some(e => e.retraso);
          // Un día es "historial" (gris) solo si TODAS sus operaciones ya
          // terminaron — si además hay una activa o en proceso ese mismo
          // día, sigue mostrándose a color, igual que en Mes y Semana.
          const todasFinalizadas = tieneOperacion && eventosDia.every(e => e.estado === 'Finalizado');
          const esHoy = hoy.getFullYear() === da && hoy.getMonth() === dm && hoy.getDate() === dia;
          const clases = ['horario-anio-dia'];
          if (fueraDeMes) clases.push('fuera-de-mes');
          if (esHoy) clases.push('es-hoy');
          if (tieneOperacion) clases.push('con-operacion');
          if (todasFinalizadas) clases.push('con-operacion-finalizada');
          if (tieneRetraso) clases.push('con-retraso');
          const eventos = tieneOperacion
            ? ` onclick="irAMesDesdeAnio(${da}, ${dm})" onmouseenter="mostrarTooltipDiaAnio(event, ${da}, ${dm}, ${dia})" onmouseleave="ocultarTooltipEvento()"`
            : '';
          return `<span class="${clases.join(' ')}"${eventos}>${dia}</span>`;
        }).join('')}
      </div>
    </div>`;
  }

  cont.innerHTML = html;

  // "y se dirige ahí": si el mes buscado está en el año que se está
  // mostrando, la vista se desplaza hasta esa tarjeta (los 12 meses no
  // siempre entran completos en la pantalla sin hacer scroll).
  if (calMesResaltado) {
    cont.querySelector('.horario-anio-mes.resaltado')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Salta de la vista Año a la vista Mes del mes elegido (clic en el título
// de un mes o en cualquier día con operación) — Vista Mes siempre muestra
// el mes completo, así que no hace falta distinguir qué día puntual se
// clickeó.
function irAMesDesdeAnio(anio, mes) {
  calFechaActual = new Date(anio, mes, 1);
  calFormato = 'mes';
  document.querySelectorAll('.formato-btn').forEach(b => b.classList.toggle('active', b.dataset.formato === 'mes'));
  pintarHorarioBuques();
}

function pintarHorarioSemanaTabla(dias) {
  const headerRow = document.getElementById('horarioHeaderRow');
  const body = document.getElementById('horarioBody');
  if (!headerRow || !body) return;

  const buques = buquesHorario();

  headerRow.innerHTML = '<th class="horario-fixed-dia">Día</th><th class="horario-fixed-turno">Turno</th>'
    + (buques.length ? buques.map(b => `<th>${b}</th>`).join('') : '<th>Sin buques en operación</th>');

  const hoy = new Date();
  const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Lista plana de franjas (día+turno) en el mismo orden en que se
  // renderizan las filas de la tabla — permite, para cada celda pintada,
  // mirar la franja inmediatamente anterior y siguiente (incluso cruzando
  // de un día al otro) y así saber si debe fundirse con ellas en una sola
  // barra continua, en vez de quedar como una celda suelta.
  const franjas = [];
  dias.forEach(({ dia, mes, anio }) => {
    TURNOS_HORARIO.forEach(turno => franjas.push({ dia, mes, anio, turno }));
  });

  function eventoEnFranja(franja, buque) {
    if (!franja) return null;
    const idx = eventosHorarioActuales.findIndex(e => e.dia === franja.dia && e.mes === franja.mes && e.anio === franja.anio && e.turno === franja.turno && e.buque === buque);
    return idx === -1 ? null : idx;
  }

  let html = '';
  let franjaIdx = 0;
  dias.forEach(({ dia, mes, anio }) => {
    const esHoy = hoy.getFullYear() === anio && hoy.getMonth() === mes && hoy.getDate() === dia;
    const etiquetaDia = `${DIAS_SEMANA[new Date(anio, mes, dia).getDay()]} ${dia}`;

    TURNOS_HORARIO.forEach((turno, turnoIdx) => {
      // El resaltado de "hoy" tiene que verse como UN solo recuadro
      // alrededor de las 3 filas de turno del día (no un borde repetido en
      // cada fila) — por eso cada fila suma, además de horario-fila-hoy, la
      // posición que ocupa dentro del bloque (arriba/media/abajo), y el CSS
      // solo dibuja el borde superior en la primera, el inferior en la
      // última, y los laterales corridos a lo largo de las tres.
      let claseFila = '';
      if (esHoy) {
        claseFila = 'horario-fila-hoy';
        if (turnoIdx === 0) claseFila += ' horario-fila-hoy-arriba';
        else if (turnoIdx === TURNOS_HORARIO.length - 1) claseFila += ' horario-fila-hoy-abajo';
        else claseFila += ' horario-fila-hoy-media';
      }
      html += `<tr class="${claseFila}">`;
      if (turnoIdx === 0) {
        html += `<td class="horario-fixed-dia${esHoy ? ' horario-dia-hoy-celda' : ''}" rowspan="3">${etiquetaDia}</td>`;
      }
      html += `<td class="horario-fixed-turno"><span class="horario-turno-dot ${TURNO_LEYENDA_CLASE[turno]}"></span>${TURNO_HORA_INICIO[turno]}-${TURNO_HORA_FIN[turno]}</td>`;

      buques.forEach(buque => {
        const idx = eventoEnFranja(franjas[franjaIdx], buque);
        if (idx !== -1 && idx !== null) {
          const evento = eventosHorarioActuales[idx];

          // Se funde con la franja anterior/siguiente solo si es la MISMA
          // operación — así el color se pinta corrido de punta a punta
          // (redondeado únicamente en el verdadero inicio y fin del
          // bloque) sin importar cuántos turnos o días abarque.
          const idxAnterior = eventoEnFranja(franjas[franjaIdx - 1], buque);
          const idxSiguiente = eventoEnFranja(franjas[franjaIdx + 1], buque);
          const continuaArriba = idxAnterior !== null && eventosHorarioActuales[idxAnterior]?.opId === evento.opId;
          const continuaAbajo = idxSiguiente !== null && eventosHorarioActuales[idxSiguiente]?.opId === evento.opId;

          const clases = ['horario-celda-evento', evento.colorClass];
          if (evento.estado === 'Finalizado') clases.push('horario-evento-finalizada');
          if (evento.retraso) clases.push('horario-evento-retraso');
          if (continuaArriba) clases.push('continua-arriba');
          if (continuaAbajo) clases.push('continua-abajo');

          html += `<td class="${clases.join(' ')}" onclick="abrirModalOperacion(${idx})" title="${evento.retraso ? 'Retraso de atención: ' + evento.retrasoTipo : ''}">
            <div class="horario-evento-contenido">
              <strong>${evento.terminal}</strong>
              ${evento.retraso ? `<span class="horario-evento-retraso-tag">⚠ Retraso: ${evento.retrasoTipo}</span>` : ''}
              ${evento.eta ? `<span class="horario-evento-eta">ETA: ${evento.eta}</span>` : ''}
              <span>${evento.personal.replace(/\n/g, '<br>')}</span>
            </div>
          </td>`;
        } else {
          html += '<td></td>';
        }
      });
      html += '</tr>';
      franjaIdx++;
    });
  });

  body.innerHTML = html;
}

// Salta el calendario directamente al día de hoy, sin importar en qué
// mes/semana esté posicionado — calFechaActual arranca en la fecha de la
// primera operación registrada (no necesariamente la actual), así que
// hace falta un atajo para volver rápido a "ahora".
function irAHoyCalendario() {
  calFechaActual = new Date();
  pintarHorarioBuques();
}

function cambiarMes(delta) {
  if (calFormato === 'semana') {
    calFechaActual.setDate(calFechaActual.getDate() + delta * 7);
  } else if (calFormato === 'anio') {
    calFechaActual.setFullYear(calFechaActual.getFullYear() + delta);
  } else {
    calFechaActual.setDate(1);
    calFechaActual.setMonth(calFechaActual.getMonth() + delta);
  }
  pintarHorarioBuques();
}

function cambiarFormato(formato, btn) {
  document.querySelectorAll('.formato-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  calFormato = formato;
  pintarHorarioBuques();
}

// Tooltip enriquecido de la vista Mes: reemplaza el atributo title="" nativo
// (una sola línea, sin estilo) por un tooltip propio en un <div> aparte
// (#calEventoTooltip, fuera de la celda) posicionado con JS en vez de CSS
// puro — la lista de eventos de cada día tiene overflow-y:auto
// (horario-mes-celda-eventos), así que un tooltip CSS anidado ahí adentro
// quedaría recortado por el scroll. Al vivir fuera de esa celda no tiene
// ese problema y puede mostrar toda la info relevante de la operación.
function mostrarTooltipEvento(mouseEvent, idx) {
  const evento = eventosHorarioActuales[idx];
  const tooltip = document.getElementById('calEventoTooltip');
  if (!evento || !tooltip) return;

  const op = typeof opCargarOperaciones === 'function' ? opCargarOperaciones().find(o => o.id === evento.opId) : null;

  const lineas = [`<strong>${evento.opId} · ${evento.buque}</strong>`];
  if (op) lineas.push(`${op.tipoOperacion || '—'} · ${opClienteInfo(op).nombre}`);
  lineas.push(`${evento.terminal}${op?.terminalDestino ? ' → ' + op.terminalDestino : ''}`);
  lineas.push(`${evento.horaInicioOperacion || '—'} - ${evento.horaFinOperacion || '—'}`);
  if (op?.productos?.length) lineas.push(`Producto: ${op.productos.join(', ')}`);
  if (op?.estado) lineas.push(`Estado: ${op.estado}`);
  if (evento.retraso) lineas.push(`⚠ Retraso: ${evento.retrasoTipo}`);

  tooltip.innerHTML = lineas.join('<br>');
  tooltip.classList.add('visible');
  posicionarTooltipSobreElemento(mouseEvent.currentTarget, tooltip);
}

// Posiciona el tooltip pegado abajo del elemento sobre el que se pasó el
// mouse (o arriba/a la izquierda si no entra), sin depender de las
// coordenadas del mouse — así queda igual de estable venga de un bloque
// grande (vista Mes) o de un día chico de 20px (vista Año).
function posicionarTooltipSobreElemento(elemento, tooltip) {
  const origen = elemento.getBoundingClientRect();
  const tip = tooltip.getBoundingClientRect();
  let left = origen.left;
  let top = origen.bottom + 8;
  if (left + tip.width > window.innerWidth - 8) left = window.innerWidth - tip.width - 8;
  if (top + tip.height > window.innerHeight - 8) top = origen.top - tip.height - 8;
  tooltip.style.left = `${Math.max(8, left)}px`;
  tooltip.style.top = `${Math.max(8, top)}px`;
}

// Tooltip de un día en la vista Año: a diferencia de la vista Mes (un
// bloque = una operación), acá un solo día puede tener varias operaciones
// distintas (varios buques) — se listan todas, una línea por operación,
// deduplicadas por N° de Operación (un día puede tener más de un turno de
// la misma operación).
function mostrarTooltipDiaAnio(mouseEvent, anio, mes, dia) {
  const tooltip = document.getElementById('calEventoTooltip');
  if (!tooltip) return;

  const eventosDia = eventosHorarioActuales.filter(e => e.dia === dia && e.mes === mes && e.anio === anio);
  if (!eventosDia.length) return;

  const porOperacion = new Map();
  eventosDia.forEach(e => { if (!porOperacion.has(e.opId)) porOperacion.set(e.opId, e); });

  const lineas = [...porOperacion.values()].map(e =>
    `${e.retraso ? '⚠ ' : ''}<strong>${e.opId}</strong> · ${e.buque} — ${e.terminal} (${e.horaInicioOperacion || '—'}-${e.horaFinOperacion || '—'})`
  );

  tooltip.innerHTML = lineas.join('<br>');
  tooltip.classList.add('visible');
  posicionarTooltipSobreElemento(mouseEvent.currentTarget, tooltip);
}

function ocultarTooltipEvento() {
  document.getElementById('calEventoTooltip')?.classList.remove('visible');
}

function abrirModalOperacion(idx) {
  const evento = eventosHorarioActuales[idx];
  if (!evento) return;
  ocultarTooltipEvento();

  const op = typeof opCargarOperaciones === 'function' ? opCargarOperaciones().find(o => o.id === evento.opId) : null;

  document.getElementById('modalOperacionTitulo').textContent = evento.buque;
  // Una operación de varios días aparece como bloques separados en el
  // calendario (ej. entre semanas distintas de la vista Mes, donde no se
  // pueden fundir visualmente) — mostrar el N° de Operación acá permite
  // confirmar que dos bloques distintos pertenecen a la misma operación.
  document.getElementById('opNumero').value = evento.opId || '—';
  document.getElementById('opTerminal').value = evento.buque;
  document.getElementById('opHoraInicio').value = evento.horaInicioOperacion || '—';
  document.getElementById('opHoraFin').value = evento.horaFinOperacion || '—';
  // Fecha Inicio/Fin son las mismas que ya se usaron para ubicar la
  // operación en el calendario (evento.fechaFinOperacion ya contempla que
  // un turno nocturno cierra al día siguiente) — así el modal nunca
  // contradice lo que se ve en Horario de Buques.
  document.getElementById('opFechaInicio').value = evento.fechaInicioOperacion ? srvFormatoFecha(evento.fechaInicioOperacion) : `${evento.dia} de ${MESES[evento.mes]} ${evento.anio}`;
  document.getElementById('opFechaFin').value = evento.fechaFinOperacion ? srvFormatoFecha(evento.fechaFinOperacion) : '—';
  document.getElementById('opPersonal').value = evento.personal;

  const retrasoGrupoEl = document.getElementById('opRetrasoGrupo');
  const retrasoTextoEl = document.getElementById('opRetrasoTexto');
  if (retrasoGrupoEl && retrasoTextoEl) {
    retrasoGrupoEl.style.display = evento.retraso ? '' : 'none';
    retrasoTextoEl.textContent = evento.retraso ? `Hubo retraso en la atención por: ${evento.retrasoTipo}` : '';
  }

  const clienteEl = document.getElementById('opCliente');
  const terminalRealEl = document.getElementById('opTerminalReal');
  const estadoEl = document.getElementById('opEstado');
  const tipoEl = document.getElementById('opTipo');
  const viajeEl = document.getElementById('opViaje');
  const productosGrupoEl = document.getElementById('opProductosGrupo');
  const productosEl = document.getElementById('opProductos');
  const btnVer = document.getElementById('btnVerOperacionCompleta');
  if (op) {
    if (clienteEl) clienteEl.value = opClienteInfo(op).nombre;
    if (terminalRealEl) terminalRealEl.value = op.terminalDestino ? `${op.terminalInicial} → ${op.terminalDestino}` : (op.terminalInicial || '—');
    // Reutiliza el mismo badge de color por estado que ya usa la grilla de
    // Seguimiento de Operaciones (opBadgeEstado, seguimiento-operaciones.js)
    // en vez de inventar una paleta nueva para el mismo dato.
    if (estadoEl) estadoEl.innerHTML = typeof opBadgeEstado === 'function' ? opBadgeEstado(op.estado) : (op.estado || '—');
    if (tipoEl) tipoEl.innerHTML = op.tipoOperacion ? `<span class="chip-tag">${op.tipoOperacion}</span>` : '—';
    if (viajeEl) viajeEl.value = op.nroViaje || '—';
    if (productosGrupoEl && productosEl) {
      const productos = op.productos || [];
      productosGrupoEl.style.display = productos.length ? '' : 'none';
      productosEl.innerHTML = productos.map(p => `<span class="chip-tag">${p}</span>`).join('');
    }
    if (btnVer) { btnVer.style.display = ''; btnVer.dataset.opId = op.id; }
  } else {
    if (clienteEl) clienteEl.value = '—';
    if (terminalRealEl) terminalRealEl.value = '—';
    if (estadoEl) estadoEl.innerHTML = '—';
    if (tipoEl) tipoEl.innerHTML = '—';
    if (viajeEl) viajeEl.value = '—';
    if (productosGrupoEl) productosGrupoEl.style.display = 'none';
    if (btnVer) btnVer.style.display = 'none';
  }

  abrirModal('modalOperacion');
}

// Salta al detalle completo de la operación en Seguimiento de Operaciones
// — así el calendario deja de ser una vista aislada y se conecta con el
// registro real que le dio origen.
function irAOperacionDesdeCalendario() {
  const id = document.getElementById('btnVerOperacionCompleta')?.dataset.opId;
  if (id) window.location.href = `seguimiento-operaciones.html?id=${id}`;
}

// "Año" y "Mes" son atajos de navegación (saltan el calendario ahí), no
// filtros que ocultan operaciones — eso lo cubren Cliente y Buque, que sí
// achican qué se ve (incluidas las columnas de la vista Semana, ver
// buquesHorario()). "Mes" ahora es solo el nombre del mes (sin año, ver
// poblarSelectMesHorario) — si se elige sin Año, busca ese mes dentro del
// año que ya se está viendo, en vez de obligar a elegir también el año.
function filtrarCalendario() {
  const anioEspecifico = document.getElementById('filtroAnio')?.value; // 'YYYY'
  const mesEspecifico = document.getElementById('filtroMes')?.value; // '0'-'11', índice de MESES

  if (mesEspecifico) {
    const anioDestino = anioEspecifico ? Number(anioEspecifico) : calFechaActual.getFullYear();
    calFechaActual = new Date(anioDestino, Number(mesEspecifico), 1);
    calMesResaltado = `${anioDestino}-${String(Number(mesEspecifico) + 1).padStart(2, '0')}`;
  } else if (anioEspecifico) {
    calFechaActual = new Date(Number(anioEspecifico), 0, 1);
    calMesResaltado = null;
  } else {
    calMesResaltado = null;
  }
  pintarHorarioBuques();
}

function limpiarFiltrosCalendario() {
  const cliente = document.getElementById('filtroCliente');
  const buque = document.getElementById('filtroBuque');
  const anio = document.getElementById('filtroAnio');
  const mes = document.getElementById('filtroMes');
  const texto = document.getElementById('filtroTextoHorario');
  const estado = document.getElementById('filtroEstadoHorario');
  const tipoOperacion = document.getElementById('filtroTipoOperacionHorario');
  const soloRetraso = document.getElementById('filtroSoloRetrasoHorario');
  if (cliente) cliente.value = '';
  if (buque) buque.value = '';
  if (texto) texto.value = '';
  if (estado) estado.value = '';
  if (tipoOperacion) tipoOperacion.value = '';
  if (soloRetraso) soloRetraso.checked = false;
  // "Año" no tiene opción "Todos" — al limpiar, vuelve al año actual en
  // vez de quedar sin nada seleccionado.
  if (anio) anio.value = String(new Date().getFullYear());
  if (mes) mes.value = '';
  calMesResaltado = null;
  pintarHorarioBuques();
}

// Panel "Filtros avanzados" (Cliente, Buque, Estado, Con retraso, Mes,
// Año) — mismo patrón de Nominaciones/Información Profesional: los campos
// quedan siempre en el DOM (solo ocultos por el panel cerrado) y se leen
// directo de ahí; el filtro se aplica de verdad recién con "Aplicar".
function aplicarFiltrosAvanzadosHorario() {
  cerrarModal('modalFiltrosAvanzadosHorario');
  filtrarCalendario();
}

function limpiarFiltrosAvanzadosHorario() {
  limpiarFiltrosCalendario();
  cerrarModal('modalFiltrosAvanzadosHorario');
}

function horContarFiltrosAvanzadosActivos() {
  let n = 0;
  if (document.getElementById('filtroCliente')?.value) n++;
  if (document.getElementById('filtroBuque')?.value) n++;
  if (document.getElementById('filtroEstadoHorario')?.value) n++;
  if (document.getElementById('filtroTipoOperacionHorario')?.value) n++;
  if (document.getElementById('filtroSoloRetrasoHorario')?.checked) n++;
  if (document.getElementById('filtroMes')?.value) n++;
  // "Año" no cuenta: siempre trae un valor por defecto (el año actual), a
  // diferencia del resto de los campos, que arrancan vacíos.
  return n;
}

function horActualizarBotonFiltrosAvanzados() {
  const btn = document.getElementById('btnFiltrosAvanzadosHorario');
  const badge = document.getElementById('filtrosAvanzadosBadgeHorario');
  if (!btn || !badge) return;
  const activos = horContarFiltrosAvanzadosActivos();
  btn.classList.toggle('activo', activos > 0);
  badge.style.display = activos > 0 ? '' : 'none';
  badge.textContent = activos;
}

// =================================================
// 3. RETRASOS ATENCIÓN DE NAVES (Gantt)
// Cada fila del Gantt es una operación real de Seguimiento de Operaciones
// (opCargarOperaciones, seguimiento-operaciones.js) en vez de una nave
// ficticia fija — así los retrasos que se registran acá quedan asociados
// a una operación que de verdad existe.
// =================================================

// Estado del período visible del Gantt — igual patrón que calFechaActual /
// calFormato de Horario de Buques (operaciones.js:208-209), pero acotado a
// 'mes' | 'semana' porque el Gantt no tiene vista "año".
let ganttFechaActual = new Date();
let ganttFormato = 'mes';

// Días a mostrar según ganttFormato, como strings 'YYYY-MM-DD' (formato que
// ya usa el resto del módulo) en vez de los objetos {dia,mes,anio} de
// diasDelPeriodoHorario() — pintarGantt() compara fechas como strings.
function diasDelPeriodoGantt() {
  const fmt = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (ganttFormato === 'semana') {
    const base = new Date(ganttFechaActual);
    const diaSemana = base.getDay();
    const offsetLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(base);
    lunes.setDate(base.getDate() + offsetLunes);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      return fmt(d.getFullYear(), d.getMonth() + 1, d.getDate());
    });
  }
  const anio = ganttFechaActual.getFullYear();
  const mes = ganttFechaActual.getMonth();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  return Array.from({ length: diasEnMes }, (_, i) => fmt(anio, mes + 1, i + 1));
}

const GANTT_DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function tituloPeriodoGantt(fechas) {
  if (ganttFormato === 'mes') return `${MESES[ganttFechaActual.getMonth()]} ${ganttFechaActual.getFullYear()}`;
  const [yIni, mIni, dIni] = fechas[0].split('-').map(Number);
  const [yFin, mFin, dFin] = fechas[fechas.length - 1].split('-').map(Number);
  const iniTxt = yIni === yFin ? `${dIni} ${MESES[mIni - 1].slice(0, 3)}` : `${dIni} ${MESES[mIni - 1].slice(0, 3)} ${yIni}`;
  const finTxt = `${dFin} ${MESES[mFin - 1].slice(0, 3)} ${yFin}`;
  return `${iniTxt} - ${finTxt}`;
}

function ganttFechas() {
  if (typeof opCargarOperaciones !== 'function') return [];
  if (!opCargarOperaciones().some(o => o.nave && o.fechaInicio)) return [];
  return diasDelPeriodoGantt();
}

// Salta el período visible al mes/año elegidos en los selects "Mes" y
// "Año" — a diferencia de antes (que solo hacía scroll), ahora el Gantt
// muestra un período acotado, así que hace falta reposicionar
// ganttFechaActual y repintar.
function irAMesGantt() {
  const mes = Number(document.getElementById('filtroMes')?.value);
  const anio = Number(document.getElementById('filtroAnio')?.value);
  if (!mes || !anio) return;
  ganttFechaActual = new Date(anio, mes - 1, 1);
  pintarGantt();
}

function irAHoyGantt() {
  ganttFechaActual = new Date();
  pintarGantt();
}

function cambiarPeriodoGantt(delta) {
  if (ganttFormato === 'semana') {
    ganttFechaActual.setDate(ganttFechaActual.getDate() + delta * 7);
  } else {
    ganttFechaActual.setDate(1);
    ganttFechaActual.setMonth(ganttFechaActual.getMonth() + delta);
  }
  pintarGantt();
}

function cambiarFormatoGantt(formato, btn) {
  document.querySelectorAll('#retrasos-formato-toggle .formato-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ganttFormato = formato;
  pintarGantt();
}

// Select "Mes": los 12 meses fijos (no depende de qué operaciones haya),
// siempre queda seleccionado el mes que el Gantt tiene activo en cada
// momento (el actual al cargar la página, o el que se navegó después).
function poblarSelectMesGantt() {
  const select = document.getElementById('filtroMes');
  if (!select) return;
  if (!select.options.length) {
    select.innerHTML = MESES.map((nombre, i) => `<option value="${i + 1}">${nombre}</option>`).join('');
  }
  select.value = String(ganttFechaActual.getMonth() + 1);
}

// Select "Año": solo el año actual y el siguiente — no se puede filtrar
// hacia años pasados ni más de un año hacia adelante. Por defecto queda
// seleccionado el año actual (o el que el Gantt tenga activo, si ya se
// navegó al año siguiente).
function poblarSelectAnioGantt() {
  const select = document.getElementById('filtroAnio');
  if (!select) return;
  const anioActual = new Date().getFullYear();
  const anioActivo = ganttFechaActual.getFullYear();
  const anios = [anioActual, anioActual + 1];
  select.innerHTML = anios.map(a => `<option value="${a}">${a}</option>`).join('');
  select.value = String(anios.includes(anioActivo) ? anioActivo : anioActual);
}

// Naves mostradas como filas: solo operaciones VIGENTES (Activo / En
// Proceso) — una operación finalizada o cancelada ya no admite registrarle
// un retraso, así que no ocupa fila. Identificadas por su opId para que los
// retrasos ya registrados no se desalineen si la lista se filtra por texto.
// ignorarFiltroTexto=true se usa para poblar el select "Ir a mes" con el
// universo completo de vigentes, sin aplicar el filtro de búsqueda activo.
function navesGantt(ignorarFiltroTexto) {
  if (typeof opCargarOperaciones !== 'function') return [];
  const texto = ignorarFiltroTexto ? '' : ganttFiltroTexto;
  return opCargarOperaciones()
    .filter(o => o.nave && o.fechaInicio && ['Activo', 'En Proceso'].includes(o.estado))
    .map(o => ({
      opId: o.id,
      nave: o.nave,
      ruta: `${o.terminalInicial || '—'}${o.terminalDestino ? ' → ' + o.terminalDestino : ''}`,
      estado: o.estado,
      fechaInicio: o.fechaInicio,
      fechaFin: o.fechaFin || o.fechaInicio,
      cliente: typeof opClienteInfo === 'function' ? opClienteInfo(o).nombre : '—',
      tipoOperacion: o.tipoOperacion,
      nroViaje: o.nroViaje,
      productos: o.productos || []
    }))
    // El texto buscable incluye nave, terminales y N° de viaje — no solo el
    // nombre visible — para poder ubicar una fila por cualquiera de esos datos.
    .filter(n => !texto || `${n.nave} ${n.ruta} ${n.nroViaje || ''}`.toLowerCase().includes(texto));
}

// Tooltip enriquecido (mismo componente #calEventoTooltip que usa Horario
// de Buques en mostrarTooltipEvento) con la información de la operación
// que hay detrás de cada fila del Gantt.
function mostrarTooltipNaveGantt(mouseEvent, naveIdx) {
  const nave = navesDelGantt[naveIdx];
  const tooltip = document.getElementById('calEventoTooltip');
  if (!nave || !tooltip) return;

  const fechas = `${srvFormatoFecha ? srvFormatoFecha(nave.fechaInicio) : nave.fechaInicio} - ${srvFormatoFecha ? srvFormatoFecha(nave.fechaFin) : nave.fechaFin}`;
  const lineas = [
    `<strong>Operación ${nave.opId} · ${nave.nave}</strong>`,
    `${nave.tipoOperacion || '—'}${nave.nroViaje ? ' · ' + nave.nroViaje : ''} · ${nave.cliente || '—'}`,
    `${nave.ruta}`,
    `Estado: ${nave.estado || '—'}`,
    `Fechas: ${fechas}`
  ];
  if (nave.productos.length) lineas.push(`Producto: ${nave.productos.join(', ')}`);

  tooltip.innerHTML = lineas.join('<br>');
  tooltip.classList.add('visible');
  posicionarTooltipSobreElemento(mouseEvent.currentTarget, tooltip);
}

// Retrasos registrados: { opId, fechaInicio, fechaFin, tipo }. Se persisten
// en localStorage (igual que los cierres de terminal) para que Horario de
// Buques pueda pintarlos en rojo aunque el retraso se haya cargado desde
// la página de Retrasos de Naves en otra visita.
const RETRASOS_STORAGE_KEY = 'retrasosNavesData';

function retrasosCargar() {
  const raw = localStorage.getItem(RETRASOS_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function retrasosGuardar(lista) {
  localStorage.setItem(RETRASOS_STORAGE_KEY, JSON.stringify(lista));
}

let RETRASOS_GANTT = retrasosCargar();

let ganttFiltroTexto = '';

// Cierre (si lo hay) aplicado a cada fila del último pintarGantt(), para
// que el click sobre una barra automática pueda mostrar su detalle sin
// recalcularlo.
let cierresDelGantt = [];

// Naves del último pintarGantt(), para que el tooltip enriquecido de la
// columna "Nave - Terminal" pueda ubicar sus datos por índice de fila.
let navesDelGantt = [];

// =================================================
// CIERRES DE TERMINAL
// Un cierre (mal tiempo, cola, ventana de ingreso) es del terminal, no de
// un buque puntual — cuando se registra uno, TODA operación cuyo Terminal
// Inicial o Destino coincida, y cuya ventana de fechas se solape con la
// del cierre, muestra el retraso automáticamente en el Gantt, sin tener
// que cargarlo operación por operación.
// =================================================
const CIERRES_STORAGE_KEY = 'cierresTerminalData';
const CIERRE_TIPO_TEXTO = { 'mal-tiempo': 'Mal tiempo', cola: 'Cola de naves', ventana: 'Ventana de ingreso' };

function cierresCargar() {
  const raw = localStorage.getItem(CIERRES_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Cierres cuyo terminal coincide con el Terminal Inicial/Destino de la
// operación y cuya ventana de fechas se solapa con la de la operación.
function cierresQueAfectanOperacion(op) {
  const terminales = [op.terminalInicial, op.terminalDestino].filter(Boolean);
  if (!terminales.length) return [];
  const finOp = op.fechaFin || op.fechaInicio;
  return cierresCargar().filter(c =>
    terminales.includes(c.terminal) && c.fechaInicio <= finOp && c.fechaFin >= op.fechaInicio
  );
}

// Recorta el cierre que afecta a esta operación (si lo hay) al solape real
// entre la ventana del cierre y la ventana de la propia operación — ya no
// depende de ningún mes de referencia, son fechas absolutas.
function cierreBarraParaNave(nave) {
  if (typeof opCargarOperaciones !== 'function') return null;
  const op = opCargarOperaciones().find(o => o.id === nave.opId);
  if (!op) return null;

  const afecta = cierresQueAfectanOperacion(op)[0];
  if (!afecta) return null;

  const finOp = op.fechaFin || op.fechaInicio;
  const fechaInicioBarra = afecta.fechaInicio > op.fechaInicio ? afecta.fechaInicio : op.fechaInicio;
  const fechaFinBarra = afecta.fechaFin < finOp ? afecta.fechaFin : finOp;
  return { ...afecta, fechaInicioBarra, fechaFinBarra };
}

function mostrarInfoCierreGantt(cierre) {
  mostrarToast(`Retraso por cierre de ${cierre.terminal} (${CIERRE_TIPO_TEXTO[cierre.tipo] || cierre.tipo})${cierre.motivo ? ': ' + cierre.motivo : ''}.`);
}

function pintarGantt() {
  const mesesRow = document.getElementById('ganttHeaderMesesRow');
  const headerRow = document.getElementById('ganttHeaderRow');
  const body = document.getElementById('ganttBody');
  const tabla = document.getElementById('ganttTable');
  if (!mesesRow || !headerRow || !body) return;

  const fechas = ganttFechas();
  poblarSelectMesGantt();
  poblarSelectAnioGantt();

  if (tabla) tabla.classList.toggle('gantt-table--semana', ganttFormato === 'semana');

  const tituloEl = document.getElementById('ganttPeriodoTitulo');
  if (tituloEl) tituloEl.textContent = fechas.length ? tituloPeriodoGantt(fechas) : tituloPeriodoGantt(diasDelPeriodoGantt());

  if (!fechas.length) {
    mesesRow.innerHTML = '';
    headerRow.innerHTML = '<th class="gantt-fixed-col">Nave - Terminal</th><th class="gantt-fixed-col gantt-obs-col">Observaciones</th>';
    body.innerHTML = `<tr><td class="clientes-nom-empty" colspan="2">No hay operaciones registradas</td></tr>`;
    return;
  }

  // Cabecera de dos filas: grupo de mes (colspan) arriba, día del mes abajo
  // — mismo patrón que un Gantt de proyecto real, y ninguna fila queda
  // fuera de rango porque la línea de tiempo cubre TODAS las operaciones.
  // En formato semana, cada día muestra también su abreviatura (Lun, Mar...)
  // para orientarse mejor con solo 7 columnas visibles.
  let mesesHtml = '<th class="gantt-fixed-col" rowspan="2">Nave - Terminal</th>';
  let diasHtml = '';
  let grupoActual = null;
  const hoyStr = ganttHoyStr();
  fechas.forEach(f => {
    const [y, m, d] = f.split('-').map(Number);
    const ym = f.slice(0, 7);
    if (!grupoActual || grupoActual.ym !== ym) {
      if (grupoActual) mesesHtml += `<th colspan="${grupoActual.colspan}" data-mes="${grupoActual.ym}">${MESES[grupoActual.mes - 1].slice(0, 3).toUpperCase()} ${grupoActual.anio}</th>`;
      grupoActual = { ym, anio: y, mes: m, colspan: 0 };
    }
    grupoActual.colspan++;
    // La columna de hoy se resalta (mismo tratamiento que "Horario de
    // Buques") para que el límite entre días pasados (inhabilitados) y
    // disponibles se note de un vistazo, sin importar el mes/semana activo.
    const claseHoy = f === hoyStr ? ' class="gantt-dia-hoy"' : '';
    if (ganttFormato === 'semana') {
      const dow = GANTT_DIAS_SEMANA[new Date(`${f}T00:00`).getDay()];
      diasHtml += `<th${claseHoy}><span class="gantt-dia-dow">${dow}</span><span class="gantt-dia-num">${d}</span></th>`;
    } else {
      diasHtml += `<th${claseHoy}>${d}</th>`;
    }
  });
  if (grupoActual) mesesHtml += `<th colspan="${grupoActual.colspan}" data-mes="${grupoActual.ym}">${MESES[grupoActual.mes - 1].slice(0, 3).toUpperCase()} ${grupoActual.anio}</th>`;
  mesesHtml += '<th class="gantt-fixed-col gantt-obs-col" rowspan="2">Observaciones</th>';

  mesesRow.innerHTML = mesesHtml;
  headerRow.innerHTML = diasHtml;

  const naves = navesGantt();
  navesDelGantt = naves;

  if (!naves.length) {
    body.innerHTML = `<tr><td class="clientes-nom-empty" colspan="${fechas.length + 2}">No se encontraron naves con los filtros aplicados</td></tr>`;
    return;
  }

  body.innerHTML = naves.map((nave, naveIdx) => {
    const cierre = cierreBarraParaNave(nave);
    // Tres niveles de lectura: la nave (lo primero que se busca), la ruta
    // (terminal inicial → destino) y el tipo de operación + N° de viaje —
    // este último es lo que distingue dos filas de la misma nave en la
    // misma ruta cuando hay más de un viaje vigente a la vez.
    let celdas = `<td class="gantt-fixed-col" onmouseenter="mostrarTooltipNaveGantt(event, ${naveIdx})" onmouseleave="ocultarTooltipEvento()">
      <span class="gantt-nave-nombre">${nave.nave}</span>
      <span class="gantt-nave-ruta">${nave.ruta}</span>
      <span class="gantt-nave-tipo">${nave.tipoOperacion || '—'}${nave.nroViaje ? ' · ' + nave.nroViaje : ''}</span>
    </td>`;

    fechas.forEach(f => {
      const claseHoyCol = f === hoyStr ? ' gantt-dia-hoy-col' : '';

      if (cierre && f >= cierre.fechaInicioBarra && f <= cierre.fechaFinBarra) {
        const esInicioCierre = f === cierre.fechaInicioBarra;
        if (esInicioCierre) {
          const anchoCierre = fechas.filter(x => x >= cierre.fechaInicioBarra && x <= cierre.fechaFinBarra).length;
          celdas += `<td class="${claseHoyCol.trim()}" onclick="mostrarInfoCierreGantt(cierresDelGantt[${naveIdx}])" style="position:relative;">
            <div class="gantt-barra gantt-barra-cierre ${cierre.tipo}" style="left:2px; width:calc(${anchoCierre * 100}% - 4px);" title="Cierre de terminal (${cierre.terminal}): ${CIERRE_TIPO_TEXTO[cierre.tipo] || cierre.tipo}${cierre.motivo ? ' — ' + cierre.motivo : ''}"></div>
          </td>`;
        } else {
          celdas += `<td class="${claseHoyCol.trim()}" onclick="mostrarInfoCierreGantt(cierresDelGantt[${naveIdx}])"></td>`;
        }
        return;
      }

      const retraso = RETRASOS_GANTT.find(r => r.opId === nave.opId && f >= r.fechaInicio && f <= r.fechaFin);
      const esInicio = retraso && f === retraso.fechaInicio;

      if (retraso) {
        // Un retraso ya registrado no se puede editar ni sobreponer desde
        // la grilla — el click solo muestra su info; para quitarlo hay que
        // usar el detalle de Observaciones.
        const tituloRetraso = `${CIERRE_TIPO_TEXTO[retraso.tipo] || retraso.tipo}${retraso.prioridad ? ' — Prioridad ' + retraso.prioridad : ''}`;
        const onclickInfo = `mostrarInfoRetrasoGantt('${retraso.fechaInicio}', '${retraso.fechaFin}', '${retraso.tipo}', ${retraso.prioridad || 'null'})`;
        if (esInicio) {
          const ancho = fechas.filter(x => x >= retraso.fechaInicio && x <= retraso.fechaFin).length;
          celdas += `<td class="${claseHoyCol.trim()}" onclick="${onclickInfo}" style="position:relative;">
            <div class="gantt-barra ${retraso.tipo}" style="left:2px; width:calc(${ancho * 100}% - 4px);" title="${tituloRetraso}"></div>
          </td>`;
        } else {
          // celda cubierta visualmente por la barra, se omite contenido pero mantiene click
          celdas += `<td class="${claseHoyCol.trim()}" onclick="${onclickInfo}" title="${tituloRetraso}"></td>`;
        }
      } else if (f < hoyStr) {
        // Fecha pasada sin retraso registrado: no se puede cargar uno
        // nuevo ahí, así que la celda queda inerte (sin drag) en vez de
        // parecer una opción disponible.
        celdas += `<td class="gantt-celda-pasada"></td>`;
      } else {
        celdas += `<td class="${claseHoyCol.trim()}" data-opid="${nave.opId}" data-fecha="${f}" onmousedown="ganttDragIniciar(this)" onmouseenter="ganttDragContinuar(this)" onmouseup="ganttDragSoltar()"></td>`;
      }
    });

    const cantidadObs = RETRASOS_GANTT.filter(r => r.opId === nave.opId).length + (cierre ? 1 : 0);
    celdas += `<td class="gantt-fixed-col gantt-obs-col">
      <button type="button" class="gantt-obs-btn" title="${cantidadObs ? 'Ver ' + cantidadObs + ' observación(es)' : 'Sin observaciones registradas'}" onclick="abrirDetalleObservaciones('${nave.opId}')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
        <span class="gantt-obs-count">${cantidadObs}</span>
      </button>
    </td>`;
    return `<tr>${celdas}</tr>`;
  }).join('');

  // Se guarda aparte (no en un dataset por celda) para que el click del
  // cierre pueda mostrar terminal/motivo sin volver a recalcular nada.
  cierresDelGantt = naves.map(nave => cierreBarraParaNave(nave));
}

// Autocalcula Fin (a partir de Duración) o Duración (a partir de Fin) — evita recursión con bandera
let calculandoRetraso = false;

function autocalcularRetraso(modo) {
  if (calculandoRetraso) return;

  const diaIni  = document.getElementById('retrasoDiaInicio').value;
  const horaIni = document.getElementById('retrasoHoraInicio').value;

  if (!diaIni || !horaIni) return;
  const inicio = new Date(`${diaIni}T${horaIni}`);

  calculandoRetraso = true;

  if (modo === 'fin') {
    const duracion = Number(document.getElementById('retrasoDuracion').value);
    if (duracion > 0) {
      const fin = new Date(inicio.getTime() + duracion * 60 * 60 * 1000);
      document.getElementById('retrasoDiaFin').value = fin.toISOString().slice(0, 10);
      document.getElementById('retrasoHoraFin').value = fin.toTimeString().slice(0, 5);
    }
  } else if (modo === 'duracion') {
    const diaFin  = document.getElementById('retrasoDiaFin').value;
    const horaFin = document.getElementById('retrasoHoraFin').value;
    if (diaFin && horaFin) {
      const fin = new Date(`${diaFin}T${horaFin}`);
      const horas = (fin.getTime() - inicio.getTime()) / (60 * 60 * 1000);
      if (horas > 0) {
        document.getElementById('retrasoDuracion').value = horas;
      }
    }
  }

  calculandoRetraso = false;
}

// Selección de rango por arrastre: mousedown en una celda vacía marca el
// inicio, mouseenter (con el botón presionado) extiende la selección hasta
// esa celda dentro de la MISMA fila (mismo opId), mouseup abre el modal con
// el rango completo precargado. Un click simple (sin arrastrar) deja
// fechaInicio === fechaFin, igual que el comportamiento anterior.
let ganttDrag = null; // { opId, fechaInicio, fechaActual }

function ganttDragPintarSeleccion() {
  document.querySelectorAll('.gantt-celda-seleccionando').forEach(td => td.classList.remove('gantt-celda-seleccionando'));
  if (!ganttDrag) return;
  const desde = ganttDrag.fechaInicio < ganttDrag.fechaActual ? ganttDrag.fechaInicio : ganttDrag.fechaActual;
  const hasta = ganttDrag.fechaInicio < ganttDrag.fechaActual ? ganttDrag.fechaActual : ganttDrag.fechaInicio;
  document.querySelectorAll(`td[data-opid="${ganttDrag.opId}"]`).forEach(td => {
    const f = td.dataset.fecha;
    if (f >= desde && f <= hasta) td.classList.add('gantt-celda-seleccionando');
  });
}

function ganttDragIniciar(td) {
  ganttDrag = { opId: td.dataset.opid, fechaInicio: td.dataset.fecha, fechaActual: td.dataset.fecha };
  ganttDragPintarSeleccion();
}

function ganttDragContinuar(td) {
  if (!ganttDrag || td.dataset.opid !== ganttDrag.opId) return;
  ganttDrag.fechaActual = td.dataset.fecha;
  ganttDragPintarSeleccion();
}

function ganttDragSoltar() {
  if (!ganttDrag) return;
  const desde = ganttDrag.fechaInicio < ganttDrag.fechaActual ? ganttDrag.fechaInicio : ganttDrag.fechaActual;
  const hasta = ganttDrag.fechaInicio < ganttDrag.fechaActual ? ganttDrag.fechaActual : ganttDrag.fechaInicio;
  const opId = ganttDrag.opId;
  document.querySelectorAll('.gantt-celda-seleccionando').forEach(td => td.classList.remove('gantt-celda-seleccionando'));
  ganttDrag = null;
  abrirModalRetraso(opId, desde, hasta);
}

// Si el usuario suelta el mouse fuera de una celda del Gantt, igual hay que
// cerrar la selección en curso para no dejarla "pegada".
document.addEventListener('mouseup', () => { if (ganttDrag) ganttDragSoltar(); });

// Fecha de hoy en formato local 'YYYY-MM-DD' (no UTC, para no desfasarse
// según la hora del día) — usada para bloquear fechas pasadas.
function ganttHoyStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// El modal solo sirve para REGISTRAR un retraso nuevo — no para editarlo.
// Un retraso ya cargado no se puede sobreponer ni modificar desde la
// grilla; la única forma de quitarlo es eliminándolo desde el detalle de
// Observaciones (abrirDetalleObservaciones).
function abrirModalRetraso(opId, fechaInicio, fechaFin) {
  const modal = document.getElementById('modalRetraso');
  modal.dataset.opId = opId;

  document.getElementById('retrasoDiaInicio').value = fechaInicio;
  document.getElementById('retrasoDiaFin').value = fechaFin || fechaInicio;
  document.getElementById('retrasoHoraInicio').value = '';
  document.getElementById('retrasoHoraFin').value = '';
  document.getElementById('retrasoDuracion').value = '';
  document.querySelectorAll('input[name="leyendaRetraso"]').forEach(r => r.checked = false);
  document.getElementById('retrasoPrioridad').value = '1';
  document.getElementById('retrasoDescripcion').value = '';

  abrirModal('modalRetraso');
}

function guardarRetraso() {
  const leyenda = document.querySelector('input[name="leyendaRetraso"]:checked');
  if (!leyenda) {
    mostrarToast('Selecciona una leyenda para el retraso');
    return;
  }

  const modal = document.getElementById('modalRetraso');
  const opId = modal.dataset.opId;
  const fechaInicio = document.getElementById('retrasoDiaInicio').value;
  const fechaFin = document.getElementById('retrasoDiaFin').value || fechaInicio;

  if (fechaInicio < ganttHoyStr()) {
    mostrarToast('No se puede registrar un retraso en una fecha pasada');
    return;
  }

  const prioridad = Number(document.getElementById('retrasoPrioridad').value);
  const descripcion = document.getElementById('retrasoDescripcion').value.trim();

  RETRASOS_GANTT.push({ opId, fechaInicio, fechaFin, tipo: leyenda.value, prioridad, descripcion });
  retrasosGuardar(RETRASOS_GANTT);

  cerrarModal('modalRetraso');
  pintarGantt();
  mostrarModalGuardado('crear');
}

// Elimina un retraso ya registrado — solo se puede hacer desde el detalle
// de Observaciones (abrirDetalleObservaciones), nunca desde la grilla.
function eliminarRetrasoDesdeDetalle(opId, fechaInicio, fechaFin, tipo) {
  const idx = RETRASOS_GANTT.findIndex(r => r.opId === opId && r.fechaInicio === fechaInicio && r.fechaFin === fechaFin && r.tipo === tipo);
  if (idx < 0) return;

  // Resguardo: un retraso que ya finalizó no se puede eliminar (el botón
  // ya viene deshabilitado en ese caso, esto es solo por si acaso).
  if (RETRASOS_GANTT[idx].fechaFin < ganttHoyStr()) {
    mostrarToast('Este retraso ya finalizó y no se puede eliminar.');
    return;
  }

  confirmarAccion('¿Deseas eliminar este retraso?', () => {
    RETRASOS_GANTT.splice(idx, 1);
    retrasosGuardar(RETRASOS_GANTT);
    pintarGantt();
    mostrarToast('Retraso eliminado correctamente.');
    abrirDetalleObservaciones(opId);
  });
}

// Info rápida (toast) de un retraso ya registrado al hacer click sobre su
// barra en la grilla — a diferencia de antes, ya NO abre el modal de
// edición ni permite sobreponer otro registro encima: para quitarlo hay
// que eliminarlo desde el detalle de Observaciones.
function mostrarInfoRetrasoGantt(fechaInicio, fechaFin, tipo, prioridad) {
  const fmt = f => srvFormatoFecha ? srvFormatoFecha(f) : f;
  mostrarToast(`${CIERRE_TIPO_TEXTO[tipo] || tipo} (${fmt(fechaInicio)} - ${fmt(fechaFin)})${prioridad ? ' — Prioridad ' + prioridad : ''}. Para eliminarlo, usa el detalle de Observaciones.`);
}

// Detalle completo detrás del ícono de la columna Observaciones: los datos
// de registro de la operación (los mismos que el tooltip de la fila) más
// TODAS las observaciones que la afectan — cada retraso cargado a mano (con
// su descripción) y, si corresponde, el retraso derivado de un cierre de
// terminal — en vez de solo la última prioridad que muestra la píldora.
function abrirDetalleObservaciones(opId) {
  const op = typeof opCargarOperaciones === 'function' ? opCargarOperaciones().find(o => o.id === opId) : null;
  const titulo = document.getElementById('detalleObsTitulo');
  const body = document.getElementById('detalleObsBody');
  if (!body) return;

  if (!op) {
    body.innerHTML = '<p class="autocalc-hint">No se encontró la operación.</p>';
    abrirModal('modalDetalleObservaciones');
    return;
  }

  if (titulo) titulo.textContent = `${op.nave} - ${op.terminalInicial || '—'}${op.terminalDestino ? ' → ' + op.terminalDestino : ''}`;

  const cliente = typeof opClienteInfo === 'function' ? opClienteInfo(op).nombre : '—';
  const fmtFecha = f => srvFormatoFecha ? srvFormatoFecha(f) : f;
  const cierre = cierreBarraParaNave({ opId });

  // Único lugar del sistema donde un retraso ya registrado se puede
  // eliminar — desde la grilla del Gantt ya no es posible. Uno que ya
  // terminó (fechaFin en el pasado) queda como registro histórico y no se
  // puede borrar; uno en curso (empezó pero su fechaFin es hoy o después)
  // o que todavía no empieza sí se puede quitar.
  const hoyStr = ganttHoyStr();
  const itemsRetraso = RETRASOS_GANTT.filter(r => r.opId === opId).map(r => {
    const finalizado = r.fechaFin < hoyStr;
    const btnEliminar = finalizado
      ? `<button type="button" class="btn-accion btn-eliminar detalle-obs-item-eliminar" disabled title="Ya finalizó — no se puede eliminar un retraso pasado">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>`
      : `<button type="button" class="btn-accion btn-eliminar detalle-obs-item-eliminar" title="Eliminar este retraso" onclick="eliminarRetrasoDesdeDetalle('${opId}', '${r.fechaInicio}', '${r.fechaFin}', '${r.tipo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>`;
    return `
    <div class="detalle-obs-item">
      <div class="detalle-obs-item-cab">
        <span class="leyenda-dot leyenda-${r.tipo}"></span>
        <strong>${CIERRE_TIPO_TEXTO[r.tipo] || r.tipo}</strong>
        <span class="gantt-nave-obs obs-p${r.prioridad || 2}">Prioridad ${r.prioridad || '—'}</span>
        ${btnEliminar}
      </div>
      <div class="detalle-obs-item-fechas">${fmtFecha(r.fechaInicio)} - ${fmtFecha(r.fechaFin)}</div>
      ${r.descripcion ? `<div class="detalle-obs-item-desc">${r.descripcion}</div>` : ''}
    </div>
  `;
  }).join('');

  const itemCierre = cierre ? `
    <div class="detalle-obs-item">
      <div class="detalle-obs-item-cab">
        <span class="leyenda-dot leyenda-cierre-auto"></span>
        <strong>Cierre de terminal (${cierre.terminal})</strong>
      </div>
      <div class="detalle-obs-item-fechas">${fmtFecha(cierre.fechaInicioBarra)} - ${fmtFecha(cierre.fechaFinBarra)}</div>
      ${cierre.motivo ? `<div class="detalle-obs-item-desc">${cierre.motivo}</div>` : ''}
    </div>
  ` : '';

  const listaObs = itemsRetraso + itemCierre;

  body.innerHTML = `
    <div class="detalle-obs-seccion">
      <div class="retraso-seccion-titulo">Registro de la operación</div>
      <div class="detalle-obs-grid">
        <div><span class="modal-label">Operación</span><br>${op.id}</div>
        <div><span class="modal-label">Cliente</span><br>${cliente}</div>
        <div><span class="modal-label">Tipo</span><br>${op.tipoOperacion || '—'}${op.nroViaje ? ' — Viaje ' + op.nroViaje : ''}</div>
        <div><span class="modal-label">Estado</span><br>${op.estado || '—'}</div>
        <div><span class="modal-label">Fechas</span><br>${fmtFecha(op.fechaInicio)} - ${fmtFecha(op.fechaFin || op.fechaInicio)}</div>
        <div><span class="modal-label">Productos</span><br>${(op.productos || []).join(', ') || '—'}</div>
      </div>
    </div>
    <div class="permisos-divider"><span>Observaciones registradas</span></div>
    ${listaObs || '<p class="autocalc-hint">No hay retrasos registrados para esta operación.</p>'}
  `;

  abrirModal('modalDetalleObservaciones');
}

function filtrarGantt() {
  ganttFiltroTexto = (document.getElementById('searchNave')?.value || '').toLowerCase().trim();
  pintarGantt();
}

function limpiarFiltrosGantt() {
  const search = document.getElementById('searchNave');
  if (search) search.value = '';
  ganttFiltroTexto = '';
  pintarGantt();
}

// =================================================
// INICIALIZACIÓN según la página cargada
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('matrizDistancias')) pintarMatrizDistancias();
  if (document.getElementById('horarioTable')) {
    if (document.getElementById('filtroCliente') && typeof SRV_CLIENTES_DEMO !== 'undefined') {
      poblarSelect('filtroCliente', SRV_CLIENTES_DEMO.map(c => c.razon));
    }
    if (document.getElementById('filtroBuque') && typeof SRV_BUQUES !== 'undefined') {
      poblarSelect('filtroBuque', SRV_BUQUES);
    }
    if (document.getElementById('filtroTipoOperacionHorario') && typeof SRV_TIPOS_OPERACION !== 'undefined') {
      poblarSelect('filtroTipoOperacionHorario', SRV_TIPOS_OPERACION);
    }
    poblarSelectAnioHorario();
    poblarSelectMesHorario();
    pintarHorarioBuques();
  }
  if (document.getElementById('ganttTable')) {
    pintarGantt();
  }
});
