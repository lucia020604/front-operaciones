// =================================================
// OPERACIONES.JS
// =================================================

// =================================================
// 1. DISTANCIAS - HORAS
// =================================================

const TERMINALES = ['Talara','Bayóvar','Eten','Salaverry','Chimbote','Supe','Relapa','Callao','Conchán','Pisco','S. Nicolás','Mollendo','Tablones','Ilo'];

// Matriz de tiempos (horas) — triangular inferior, según referencia del wireframe
const DISTANCIAS = {
  'Bayóvar-Talara': 7,
  'Eten-Talara': 15,        'Eten-Bayóvar': 10,
  'Salaverry-Talara': 23,   'Salaverry-Bayóvar': 17, 'Salaverry-Eten': 8,
  'Chimbote-Talara': 27,    'Chimbote-Bayóvar': 21,  'Chimbote-Eten': 12, 'Chimbote-Salaverry': 5,
  'Supe-Talara': 36,        'Supe-Bayóvar': 30,      'Supe-Eten': 21,     'Supe-Salaverry': 14,    'Supe-Chimbote': 9,
  'Relapa-Talara': 41,      'Relapa-Bayóvar': 36,    'Relapa-Eten': 27,   'Relapa-Salaverry': 20,  'Relapa-Chimbote': 15, 'Relapa-Supe': 6,
  'Callao-Talara': 42,      'Callao-Bayóvar': 36,    'Callao-Eten': 28,   'Callao-Salaverry': 21,  'Callao-Chimbote': 16, 'Callao-Supe': 7, 'Callao-Relapa': 1,
  'Conchán-Talara': 44,     'Conchán-Bayóvar': 38,   'Conchán-Eten': 30,  'Conchán-Salaverry': 22, 'Conchán-Chimbote': 18, 'Conchán-Supe': 9, 'Conchán-Relapa': 2, 'Conchán-Callao': 2,
  'Pisco-Talara': 52,       'Pisco-Bayóvar': 46,     'Pisco-Eten': 38,    'Pisco-Salaverry': 30,   'Pisco-Chimbote': 26,  'Pisco-Supe': 17, 'Pisco-Relapa': 11, 'Pisco-Callao': 10, 'Pisco-Conchán': 8,
  'S. Nicolás-Talara': 60,  'S. Nicolás-Bayóvar': 55,'S. Nicolás-Eten': 46,'S. Nicolás-Salaverry': 39,'S. Nicolás-Chimbote': 35,'S. Nicolás-Supe': 25,'S. Nicolás-Relapa': 20,'S. Nicolás-Callao': 19,'S. Nicolás-Conchán': 17,'S. Nicolás-Pisco': 9,
  'Mollendo-Talara': 78,    'Mollendo-Bayóvar': 72,  'Mollendo-Eten': 64, 'Mollendo-Salaverry': 57,'Mollendo-Chimbote': 52, 'Mollendo-Supe': 44,'Mollendo-Relapa': 37,'Mollendo-Callao': 37,'Mollendo-Conchán': 35,'Mollendo-Pisco': 27,'Mollendo-S. Nicolás': 17,
  'Tablones-Talara': 81,    'Tablones-Bayóvar': 76,  'Tablones-Eten': 67, 'Tablones-Salaverry': 60,'Tablones-Chimbote': 55, 'Tablones-Supe': 46,'Tablones-Relapa': 41,'Tablones-Callao': 38,'Tablones-Conchán': 32,'Tablones-Pisco': 21,'Tablones-S. Nicolás': 5,
  'Ilo-Talara': 82,         'Ilo-Bayóvar': 76,       'Ilo-Eten': 68,      'Ilo-Salaverry': 61,     'Ilo-Chimbote': 56,     'Ilo-Supe': 47,    'Ilo-Relapa': 42,    'Ilo-Callao': 41,    'Ilo-Conchán': 39,   'Ilo-Pisco': 33,'Ilo-S. Nicolás': 22,'Ilo-Mollendo': 6,'Ilo-Tablones': 1,
};

function obtenerDistancia(origen, destino) {
  if (origen === destino) return null;
  const key1 = `${origen}-${destino}`;
  const key2 = `${destino}-${origen}`;
  return DISTANCIAS[key1] ?? DISTANCIAS[key2] ?? null;
}

function pintarMatrizDistancias() {
  const body = document.getElementById('matrizBody');
  if (!body) return;

  body.innerHTML = TERMINALES.map((fila, filaIdx) => {
    let celdas = `<td class="matriz-nombre-fila">${fila}</td>`;

    for (let colIdx = 0; colIdx <= filaIdx; colIdx++) {
      const colTerminal = TERMINALES[colIdx];
      if (colIdx === filaIdx) {
        celdas += `<td class="matriz-diagonal">${fila}</td>`;
      } else {
        const valor = obtenerDistancia(fila, colTerminal);
        celdas += `<td class="matriz-celda-valor">${valor !== null ? valor : '—'}</td>`;
      }
    }
    return `<tr>${celdas}</tr>`;
  }).join('');
}

function buscarDistancia() {
  const origen  = document.getElementById('terminalInicio').value;
  const destino = document.getElementById('terminalDestino').value;
  const resultado = document.getElementById('resultadoDistancia');
  const texto = document.getElementById('resultadoTexto');

  if (!origen || !destino) {
    mostrarToast('Selecciona terminal de inicio y destino');
    return;
  }
  if (origen === destino) {
    mostrarToast('El terminal de inicio y destino no pueden ser iguales');
    return;
  }

  const valor = obtenerDistancia(origen, destino);
  resultado.style.display = 'flex';

  if (valor !== null) {
    texto.textContent = `Distancia estimada entre ${origen} y ${destino}: ${valor} horas`;
  } else {
    texto.textContent = `No se encontró información registrada entre ${origen} y ${destino}`;
  }
}

function limpiarFiltrosDistancia() {
  document.getElementById('terminalInicio').value = '';
  document.getElementById('terminalDestino').value = '';
  document.getElementById('resultadoDistancia').style.display = 'none';
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
  mostrarToast('El retraso se registró con éxito');
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
