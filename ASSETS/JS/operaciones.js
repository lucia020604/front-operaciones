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
// =================================================

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const TURNOS_HORARIO = ['23-07', '07-15', '15-23'];
const TERMINALES_HORARIO = ['Chira', 'Urubamba', 'Moche', 'Ucayali', 'Aquazurazo', 'Selini', 'Carmeli Adrion'];

let calFechaActual = new Date(2026, 5, 15); // Junio 2026, día de referencia

// Eventos de ejemplo: { dia, turno: '23-07'|'07-15'|'15-23', terminal, personal, colorClass }
const EVENTOS_HORARIO = [
  { dia: 15, turno: '07-15', terminal: 'Aquazurazo', personal: 'P: Personal 1\nB: Personal 2', colorClass: 't1' },
  { dia: 16, turno: '07-15', terminal: 'Urubamba',    personal: 'P: Personal 1\nB: Personal 2', colorClass: 't2' },
  { dia: 16, turno: '07-15', terminal: 'Moche',       personal: 'P: Personal 1\nB: Personal 2', colorClass: 't3' },
  { dia: 16, turno: '07-15', terminal: 'Ucayali',     personal: 'P: Personal 1\nB: Personal 2', colorClass: 't4' },
  { dia: 16, turno: '15-23', terminal: 'Selini',      personal: 'P: Personal 1\nB: Personal 2', colorClass: 't5' },
  { dia: 17, turno: '23-07', terminal: 'Chira',       personal: 'P: Personal 1\nB: Personal 2', colorClass: 't6' },
  { dia: 17, turno: '15-23', terminal: 'Carmeli Adrion', personal: 'P: Personal 1\nB: Personal 2', colorClass: 't1' },
  { dia: 18, turno: '07-15', terminal: 'Urubamba',    personal: 'P: Personal 1\nB: Personal 2', colorClass: 't2' },
  { dia: 18, turno: '07-15', terminal: 'Moche',       personal: 'P: Personal 1\nB: Personal 2', colorClass: 't5' },
];

function pintarHorarioBuques() {
  const headerRow = document.getElementById('horarioHeaderRow');
  const body = document.getElementById('horarioBody');
  const titulo = document.getElementById('calMesTitulo');
  if (!headerRow || !body) return;

  const anio = calFechaActual.getFullYear();
  const mes  = calFechaActual.getMonth();
  if (titulo) titulo.textContent = `${MESES[mes]} ${anio}`;

  headerRow.innerHTML = '<th class="horario-fixed-dia">Día</th><th class="horario-fixed-turno">Turno</th>'
    + TERMINALES_HORARIO.map(t => `<th>${t}</th>`).join('');

  const hoy = new Date();
  const diaHoy = (hoy.getFullYear() === anio && hoy.getMonth() === mes) ? hoy.getDate() : null;
  const diasAMostrar = [calFechaActual.getDate(), calFechaActual.getDate() + 1, calFechaActual.getDate() + 2, calFechaActual.getDate() + 3];

  let html = '';
  diasAMostrar.forEach(dia => {
    TURNOS_HORARIO.forEach((turno, turnoIdx) => {
      const esHoy = dia === diaHoy;
      html += `<tr class="${esHoy ? 'horario-fila-hoy' : ''}">`;
      if (turnoIdx === 0) {
        html += `<td class="horario-fixed-dia" rowspan="3">${dia}</td>`;
      }
      html += `<td class="horario-fixed-turno">${turno}</td>`;

      TERMINALES_HORARIO.forEach(terminal => {
        const evento = EVENTOS_HORARIO.find(e => e.dia === dia && e.turno === turno && e.terminal === terminal);
        if (evento) {
          html += `<td><div class="horario-evento ${evento.colorClass}" onclick='abrirModalOperacion(${JSON.stringify(evento)})'>
            <strong>${evento.terminal}</strong>
            <span>${evento.personal.replace('\n', '<br>')}</span>
          </div></td>`;
        } else {
          html += '<td></td>';
        }
      });
      html += '</tr>';
    });
  });

  body.innerHTML = html;
}

function cambiarMes(delta) {
  calFechaActual.setDate(calFechaActual.getDate() + (delta * 4));
  pintarHorarioBuques();
}

function cambiarFormato(formato, btn) {
  document.querySelectorAll('.formato-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  mostrarToast(`Vista cambiada a: ${formato === 'mes' ? 'Mes' : 'Semana'}`);
}

function abrirModalOperacion(evento) {
  const turnosTexto = { '23-07': '23:00 - 07:00', '07-15': '07:00 - 15:00', '15-23': '15:00 - 23:00' };
  document.getElementById('modalOperacionTitulo').textContent = evento.terminal;
  document.getElementById('opTerminal').value = evento.terminal;
  document.getElementById('opTurno').value = turnosTexto[evento.turno] || evento.turno;
  document.getElementById('opFecha').value = `${evento.dia} de ${MESES[calFechaActual.getMonth()]} ${calFechaActual.getFullYear()}`;
  document.getElementById('opPersonal').value = evento.personal;
  abrirModal('modalOperacion');
}

function filtrarCalendario() {
  mostrarToast('Filtro aplicado a la programación');
}

function limpiarFiltrosCalendario() {
  const cliente = document.getElementById('filtroCliente');
  const desde = document.getElementById('fechaDesde');
  const hasta = document.getElementById('fechaHasta');
  if (cliente) cliente.value = '';
  if (desde) desde.value = '';
  if (hasta) hasta.value = '';
}

// =================================================
// 3. RETRASOS ATENCIÓN DE NAVES (Gantt)
// =================================================

const NAVES = [
  { nombre: 'Chira - Conchán',   obs: 'Prioridad 1', obsClass: 'obs-p1' },
  { nombre: 'Moche - Talara',    obs: 'Prioridad 2', obsClass: 'obs-p2' },
  { nombre: 'Ucayali - Salaverry', obs: 'Prioridad 3', obsClass: 'obs-p3' },
  { nombre: 'Tumbes - Bayóvar',  obs: 'Prioridad 1', obsClass: 'obs-p1' },
];

// Retrasos registrados de ejemplo: { nave: index, diaInicio, diaFin, tipo }
let RETRASOS_GANTT = [
  { nave: 0, diaInicio: 3,  diaFin: 5,  tipo: 'mal-tiempo' },
  { nave: 1, diaInicio: 10, diaFin: 11, tipo: 'cola' },
  { nave: 2, diaInicio: 15, diaFin: 18, tipo: 'ventana' },
  { nave: 3, diaInicio: 22, diaFin: 23, tipo: 'mal-tiempo' },
];

const DIAS_MES_GANTT = 31;

function pintarGantt() {
  const headerRow = document.getElementById('ganttHeaderRow');
  const body = document.getElementById('ganttBody');
  if (!headerRow || !body) return;

  let headerHtml = '<th class="gantt-fixed-col">Nave - Terminal</th>';
  for (let d = 1; d <= DIAS_MES_GANTT; d++) {
    headerHtml += `<th>${d}</th>`;
  }
  headerRow.innerHTML = headerHtml;

  body.innerHTML = NAVES.map((nave, naveIdx) => {
    let celdas = `<td class="gantt-fixed-col">
      <span class="gantt-nave-nombre">${nave.nombre}</span>
      <span class="gantt-nave-obs ${nave.obsClass}">${nave.obs}</span>
    </td>`;

    for (let d = 1; d <= DIAS_MES_GANTT; d++) {
      const retraso = RETRASOS_GANTT.find(r => r.nave === naveIdx && d >= r.diaInicio && d <= r.diaFin);
      const esInicio = retraso && d === retraso.diaInicio;
      const ancho = retraso ? (retraso.diaFin - retraso.diaInicio + 1) : 1;

      if (retraso && esInicio) {
        celdas += `<td onclick="abrirModalRetraso(${naveIdx}, ${d})" style="position:relative;">
          <div class="gantt-barra ${retraso.tipo}" style="left:2px; width:calc(${ancho * 100}% - 4px);" title="${retraso.tipo}"></div>
        </td>`;
      } else if (retraso && !esInicio) {
        // celda cubierta por el rowspan visual de la barra, se omite contenido pero mantiene click
        celdas += `<td onclick="abrirModalRetraso(${naveIdx}, ${d})"></td>`;
      } else {
        celdas += `<td onclick="abrirModalRetraso(${naveIdx}, ${d})"></td>`;
      }
    }
    return `<tr>${celdas}</tr>`;
  }).join('');
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

function abrirModalRetraso(naveIdx, dia) {
  document.getElementById('modalRetraso').dataset.nave = naveIdx;
  document.getElementById('retrasoDiaInicio').value = `2026-06-${String(dia).padStart(2,'0')}`;
  document.getElementById('retrasoDiaFin').value = `2026-06-${String(dia).padStart(2,'0')}`;
  document.getElementById('retrasoHoraInicio').value = '';
  document.getElementById('retrasoHoraFin').value = '';
  document.getElementById('retrasoDuracion').value = '';
  document.querySelectorAll('input[name="leyendaRetraso"]').forEach(r => r.checked = false);
  document.getElementById('retrasoPrioridad').value = '1';
  abrirModal('modalRetraso');
}

function guardarRetraso() {
  const leyenda = document.querySelector('input[name="leyendaRetraso"]:checked');
  if (!leyenda) {
    mostrarToast('Selecciona una leyenda para el retraso');
    return;
  }

  const naveIdx = Number(document.getElementById('modalRetraso').dataset.nave);
  const diaInicio = Number(document.getElementById('retrasoDiaInicio').value.split('-')[2]);
  const diaFin = Number(document.getElementById('retrasoDiaFin').value.split('-')[2]) || diaInicio;

  RETRASOS_GANTT.push({ nave: naveIdx, diaInicio, diaFin, tipo: leyenda.value });

  cerrarModal('modalRetraso');
  pintarGantt();
  mostrarModalGuardado('crear');
}

function filtrarGantt() {
  mostrarToast('Filtro aplicado al diagrama Gantt');
}

function limpiarFiltrosGantt() {
  const search = document.getElementById('searchNave');
  if (search) search.value = '';
}

// =================================================
// INICIALIZACIÓN según la página cargada
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('matrizDistancias')) pintarMatrizDistancias();
  if (document.getElementById('horarioTable')) pintarHorarioBuques();
  if (document.getElementById('ganttTable')) pintarGantt();
});
