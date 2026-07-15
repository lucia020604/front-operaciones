// =================================================
// DISPONIBILIDAD-PERSONAL.JS
// =================================================

// Mock de operarios: mismo patrón que el resto del sistema (cada página trae su propio dataset).
// Solo se incluyen los campos que esta página necesita (nombre/apellido/rol/vacaciones/descansos).
const PERFILES = {
  1: {
    nombre: 'Sandra', apellido: 'Echavarria', rol: 'Supervisor',
    vacaciones: [
      { inicio: '2026-08-01', fin: '2026-08-15', motivo: 'Vacaciones anuales programadas.' },
      { inicio: '2025-01-06', fin: '2025-01-20', motivo: 'Vacaciones de verano.' }
    ],
    descansos: [
      { inicio: '2026-07-05', fin: '2026-07-12', motivo: 'Reposo por intervención odontológica.', archivos: ['Certificado_medico.pdf'] },
      { inicio: '2024-11-02', fin: '2024-11-06', motivo: 'Reposo por gripe estacional.', archivos: ['Descanso_nov2024.pdf', 'Receta.jpg'] }
    ]
  },
  2: {
    nombre: 'Bandy', apellido: 'Jimenez', rol: 'Administrador',
    vacaciones: [
      { inicio: '2025-12-01', fin: '2025-12-15', motivo: 'Vacaciones de fin de año.' }
    ],
    descansos: []
  },
  3: {
    nombre: 'Josue', apellido: 'Ramos', rol: 'Jefe de Area',
    vacaciones: [
      { inicio: '2026-09-10', fin: '2026-09-24', motivo: 'Vacaciones familiares.' },
      { inicio: '2025-03-01', fin: '2025-03-10', motivo: 'Vacaciones cortas.' }
    ],
    descansos: [
      { inicio: '2026-06-20', fin: '2026-06-27', motivo: 'Reposo por lumbalgia.', archivos: ['Informe_medico.pdf'] }
    ]
  }
};

// Asignaciones de proyecto (mock) usadas para calcular el estado "Programado" en el calendario
const ASIGNACIONES = {
  1: [
    { inicio: '2026-07-13', fin: '2026-07-24', proyecto: 'Operación 4821', horario: '08:00 - 17:00', supervisor: 'Juan E.', observaciones: 'Turno diurno en muelle norte.' }
  ],
  2: [
    { inicio: '2026-07-06', fin: '2026-07-17', proyecto: 'Operación 3190', horario: '09:00 - 18:00', supervisor: 'Sandra E.', observaciones: '' }
  ],
  3: [
    { inicio: '2026-07-01', fin: '2026-07-31', proyecto: 'Operación 5620', horario: '07:00 - 16:00', supervisor: 'Juan E.', observaciones: 'Cobertura completa del mes.' }
  ]
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const ESTADO_LABEL = { programado: 'Programado', vacaciones: 'Vacaciones', descanso: 'Descanso Médico', disponible: 'Disponible' };
const ESTADO_LABEL_CORTO = { programado: 'Prog.', vacaciones: 'Vac.', descanso: 'Desc.', disponible: 'Disp.' };

let dispSeleccionados = new Set();
let dispPaginaActual = 1;
let dispPorPagina = 10;
let calVista = 'semana';
let calFechaRef = new Date();
let calOperariosIds = [];
let calPaginaActual = 1;
let calPorPagina = 10;
let SCHED_TOOLTIP_DATA = [];

function formatearFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fechaEnRango(fecha, inicio, fin) { return fecha >= inicio && fecha <= fin; }

// Determina el estado de un operario en un día específico, en orden de prioridad:
// vacaciones y descanso médico son eventos ya registrados, así que priman sobre una asignación de proyecto
function obtenerEstadoDia(id, fechaISO) {
  const p = PERFILES[id];
  const vac = (p.vacaciones || []).find(v => fechaEnRango(fechaISO, v.inicio, v.fin));
  if (vac) return { estado: 'vacaciones', detalle: `${formatearFecha(vac.inicio)} - ${formatearFecha(vac.fin)}` };

  const desc = (p.descansos || []).find(d => fechaEnRango(fechaISO, d.inicio, d.fin));
  if (desc) return { estado: 'descanso', detalle: `Hasta ${formatearFecha(desc.fin)}` };

  const asig = (ASIGNACIONES[id] || []).find(a => fechaEnRango(fechaISO, a.inicio, a.fin));
  if (asig) return { estado: 'programado', detalle: asig };

  return { estado: 'disponible', detalle: null };
}

function contarEstadosMes(id, anio, mes) {
  const totalDias = new Date(anio, mes + 1, 0).getDate();
  const conteo = { programado: 0, vacaciones: 0, descanso: 0, disponible: 0 };
  for (let d = 1; d <= totalDias; d++) {
    const fechaISO = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    conteo[obtenerEstadoDia(id, fechaISO).estado]++;
  }
  return conteo;
}

// =================================================
// RESUMEN (contenido principal de la página)
// =================================================
function inicializarDisponibilidad() {
  const hoy = new Date();
  document.getElementById('dispAnio').value = hoy.getFullYear();
  document.getElementById('dispMes').value = hoy.getMonth();
  document.getElementById('dispBuscar').value = '';
  document.getElementById('dispRolFiltro').value = 'todos';
  dispPorPagina = 10;
  dispPaginaActual = 1;
  dispSeleccionados.clear();
  renderDisponibilidad();
}

// Reinicia a la primera página cuando cambia un filtro (búsqueda/rol), ya que el conjunto de resultados cambia
function dispCambiarFiltro() {
  dispPaginaActual = 1;
  renderDisponibilidad();
}

function cambiarTamanoPaginaDisponibilidad(valor) {
  dispPorPagina = parseInt(valor);
  dispPaginaActual = 1;
  renderDisponibilidad();
}

function cambiarPaginaDisponibilidad(pagina) {
  dispPaginaActual = pagina;
  renderDisponibilidad();
}

function renderDisponibilidad() {
  const anio = parseInt(document.getElementById('dispAnio').value);
  const mes = parseInt(document.getElementById('dispMes').value);
  const texto = document.getElementById('dispBuscar').value.toLowerCase();
  const rolFiltro = document.getElementById('dispRolFiltro').value;

  const idsFiltrados = Object.keys(PERFILES).filter(id => {
    const p = PERFILES[id];
    const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
    if (!nombreCompleto.includes(texto)) return false;
    if (rolFiltro !== 'todos' && p.rol !== rolFiltro) return false;
    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(idsFiltrados.length / dispPorPagina));
  if (dispPaginaActual > totalPaginas) dispPaginaActual = totalPaginas;
  const inicioPagina = (dispPaginaActual - 1) * dispPorPagina;
  const idsPagina = idsFiltrados.slice(inicioPagina, inicioPagina + dispPorPagina);

  const tbody = document.getElementById('dispTbody');
  tbody.innerHTML = '';

  if (!idsPagina.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="disp-vacio">No se encontraron operarios con los filtros aplicados</td></tr>';
  } else {
    idsPagina.forEach(id => {
      const p = PERFILES[id];
      const conteo = contarEstadosMes(id, anio, mes);
      const iniciales = (p.nombre[0] + p.apellido[0]).toUpperCase();
      const tr = document.createElement('tr');
      tr.dataset.id = id;
      tr.innerHTML = `
        <td class="disp-td-check"><input type="checkbox" class="disp-check" data-id="${id}" ${dispSeleccionados.has(id) ? 'checked' : ''} onchange="toggleSeleccionOperario('${id}', this.checked)"></td>
        <td>
          <div class="disp-operario-cell">
            <span class="disp-operario-avatar">${iniciales}</span>
            <div>
              <div class="disp-operario-nombre">${p.nombre} ${p.apellido}</div>
              <div class="disp-operario-rol">${p.rol}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-programado"><span class="badge-dot"></span>${conteo.programado} días</span></td>
        <td><span class="badge badge-por-vencer"><span class="badge-dot"></span>${conteo.vacaciones} días</span></td>
        <td><span class="badge badge-vencida"><span class="badge-dot"></span>${conteo.descanso} días</span></td>
        <td><span class="badge badge-vigente"><span class="badge-dot"></span>${conteo.disponible} días</span></td>
        <td class="opciones">
          <button class="btn-accion btn-vermas" title="Ver calendario" onclick="verMasOperario('${id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
            Ver más
          </button>
        </td>`;
      tbody.appendChild(tr);
    });
  }

  actualizarContadorSeleccion();
  const checkAll = document.getElementById('dispCheckAll');
  checkAll.checked = idsPagina.length > 0 && idsPagina.every(id => dispSeleccionados.has(id));

  renderPaginacionDisponibilidad(idsFiltrados.length, totalPaginas);
}

function renderPaginacionDisponibilidad(totalOperarios, totalPaginas) {
  const cont = document.getElementById('dispPaginacion');

  let botonesPagina = '';
  for (let i = 1; i <= totalPaginas; i++) {
    botonesPagina += `<button class="pag-btn ${i === dispPaginaActual ? 'active' : ''}" onclick="cambiarPaginaDisponibilidad(${i})">${i}</button>`;
  }

  cont.innerHTML = `
    <div class="pagination-left">
      <span class="pag-text">Mostrar</span>
      <select class="pag-select" id="dispPagSize" onchange="cambiarTamanoPaginaDisponibilidad(this.value)">
        <option value="10" ${dispPorPagina === 10 ? 'selected' : ''}>10</option>
        <option value="15" ${dispPorPagina === 15 ? 'selected' : ''}>15</option>
        <option value="20" ${dispPorPagina === 20 ? 'selected' : ''}>20</option>
        <option value="50" ${dispPorPagina === 50 ? 'selected' : ''}>50</option>
        <option value="100" ${dispPorPagina === 100 ? 'selected' : ''}>100</option>
      </select>
      <span class="pag-text">registros</span>
    </div>
    <div class="pagination-right">
      <button class="pag-btn pag-btn-nav" ${dispPaginaActual === 1 ? 'disabled' : ''} onclick="cambiarPaginaDisponibilidad(${dispPaginaActual - 1})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      ${botonesPagina}
      <button class="pag-btn pag-btn-nav" ${dispPaginaActual === totalPaginas ? 'disabled' : ''} onclick="cambiarPaginaDisponibilidad(${dispPaginaActual + 1})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>`;
}

function toggleSeleccionOperario(id, checked) {
  if (checked) dispSeleccionados.add(id); else dispSeleccionados.delete(id);
  actualizarContadorSeleccion();
  const checkAll = document.getElementById('dispCheckAll');
  const idsVisibles = [...document.querySelectorAll('#dispTbody .disp-check')].map(c => c.dataset.id);
  checkAll.checked = idsVisibles.length > 0 && idsVisibles.every(i => dispSeleccionados.has(i));
}

function toggleSeleccionarTodos(forzado) {
  const idsVisibles = [...document.querySelectorAll('#dispTbody .disp-check')].map(c => c.dataset.id);
  const marcar = forzado !== undefined ? forzado : !(idsVisibles.length > 0 && idsVisibles.every(id => dispSeleccionados.has(id)));
  idsVisibles.forEach(id => marcar ? dispSeleccionados.add(id) : dispSeleccionados.delete(id));
  renderDisponibilidad();
}

function actualizarContadorSeleccion() {
  document.getElementById('dispSeleccionadosCount').textContent = `${dispSeleccionados.size} seleccionado(s)`;
}

// =================================================
// MODAL CALENDARIO (SCHEDULER) — drill-down desde la página
// =================================================
function verMasOperario(id) {
  calOperariosIds = [id];
  abrirCalendarioComun();
}

function abrirCalendarioDisponibilidad() {
  if (dispSeleccionados.size === 0) {
    mostrarToast('Selecciona al menos un operario para ver el calendario');
    return;
  }
  calOperariosIds = [...dispSeleccionados];
  abrirCalendarioComun();
}

function abrirCalendarioComun() {
  const anio = parseInt(document.getElementById('dispAnio').value);
  const mes = parseInt(document.getElementById('dispMes').value);
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const hoy = new Date();
  const dia = (hoy.getFullYear() === anio && hoy.getMonth() === mes) ? hoy.getDate() : Math.min(1, diasMes);
  calFechaRef = new Date(anio, mes, dia);
  calVista = 'semana';
  calPaginaActual = 1;
  calPorPagina = 10;
  document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'semana'));

  renderCalendario();
  document.getElementById('vistaResumen').style.display = 'none';
  document.getElementById('vistaCalendario').style.display = '';
}

function volverAResumenDisponibilidad() {
  document.getElementById('vistaCalendario').style.display = 'none';
  document.getElementById('vistaResumen').style.display = '';
}

function cambiarVistaCalendario(vista) {
  calVista = vista;
  document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === vista));
  renderCalendario();
}

function navegarPeriodoCalendario(dir) {
  const d = new Date(calFechaRef);
  if (calVista === 'dia') d.setDate(d.getDate() + dir);
  else if (calVista === 'semana') d.setDate(d.getDate() + dir * 7);
  else d.setMonth(d.getMonth() + dir);
  calFechaRef = d;
  renderCalendario();
}

function cambiarPaginaCalendario(pagina) {
  calPaginaActual = pagina;
  renderCalendario();
}

function cambiarTamanoPaginaCalendario(valor) {
  calPorPagina = parseInt(valor);
  calPaginaActual = 1;
  renderCalendario();
}

function renderPaginacionCalendario(totalOperarios, totalPaginas) {
  const cont = document.getElementById('calPaginacion');

  let botonesPagina = '';
  for (let i = 1; i <= totalPaginas; i++) {
    botonesPagina += `<button class="pag-btn ${i === calPaginaActual ? 'active' : ''}" onclick="cambiarPaginaCalendario(${i})">${i}</button>`;
  }

  cont.innerHTML = `
    <div class="pagination-left">
      <span class="pag-text">Mostrar</span>
      <select class="pag-select" id="calPagSize" onchange="cambiarTamanoPaginaCalendario(this.value)">
        <option value="10" ${calPorPagina === 10 ? 'selected' : ''}>10</option>
        <option value="15" ${calPorPagina === 15 ? 'selected' : ''}>15</option>
        <option value="20" ${calPorPagina === 20 ? 'selected' : ''}>20</option>
        <option value="50" ${calPorPagina === 50 ? 'selected' : ''}>50</option>
        <option value="100" ${calPorPagina === 100 ? 'selected' : ''}>100</option>
      </select>
      <span class="pag-text">registros</span>
    </div>
    <div class="pagination-right">
      <button class="pag-btn pag-btn-nav" ${calPaginaActual === 1 ? 'disabled' : ''} onclick="cambiarPaginaCalendario(${calPaginaActual - 1})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      ${botonesPagina}
      <button class="pag-btn pag-btn-nav" ${calPaginaActual === totalPaginas ? 'disabled' : ''} onclick="cambiarPaginaCalendario(${calPaginaActual + 1})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>`;
}

function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function obtenerDiasVista() {
  const dias = [];
  if (calVista === 'dia') {
    dias.push(new Date(calFechaRef));
  } else if (calVista === 'semana') {
    const inicioSemana = new Date(calFechaRef);
    const diaSemana = (inicioSemana.getDay() + 6) % 7; // lunes = 0
    inicioSemana.setDate(inicioSemana.getDate() - diaSemana);
    for (let i = 0; i < 7; i++) {
      const d = new Date(inicioSemana);
      d.setDate(d.getDate() + i);
      dias.push(d);
    }
  } else {
    const anio = calFechaRef.getFullYear();
    const mes = calFechaRef.getMonth();
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    for (let d = 1; d <= totalDias; d++) dias.push(new Date(anio, mes, d));
  }
  return dias;
}

function iconoKpi(path) {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>`;
}

function kpiCardHtml(label, valor, color, iconoPath) {
  return `
    <div class="kpi-card">
      <div class="kpi-value">${valor}</div>
      <div class="kpi-label">${label}</div>
      <div class="kpi-icon-box" style="background:${color}1A; color:${color};">${iconoKpi(iconoPath)}</div>
    </div>`;
}

function bloqueHtml(p, estado, detalle, compacto) {
  const claseMap = { programado: 'sched-programado', vacaciones: 'sched-vacaciones', descanso: 'sched-descanso', disponible: 'sched-disponible' };
  const texto = compacto ? ESTADO_LABEL_CORTO[estado] : ESTADO_LABEL[estado];
  let subHtml = '';
  if (!compacto) {
    if (estado === 'programado' && detalle) subHtml = `<small>${detalle.proyecto}</small><small>${detalle.horario}</small>`;
    else if ((estado === 'vacaciones' || estado === 'descanso') && detalle) subHtml = `<small>${detalle}</small>`;
  }

  const idx = SCHED_TOOLTIP_DATA.length;
  SCHED_TOOLTIP_DATA.push({
    nombre: `${p.nombre} ${p.apellido}`,
    estado: ESTADO_LABEL[estado],
    proyecto: estado === 'programado' && detalle ? detalle.proyecto : '',
    horario: estado === 'programado' && detalle ? detalle.horario : '',
    supervisor: estado === 'programado' && detalle ? detalle.supervisor : '',
    observaciones: estado === 'programado' && detalle ? (detalle.observaciones || '') : ''
  });

  return `<div class="sched-block ${claseMap[estado]}${compacto ? ' compacto' : ''}" data-tt-idx="${idx}">${texto}${subHtml}</div>`;
}

function renderCalendario() {
  SCHED_TOOLTIP_DATA = [];
  const dias = obtenerDiasVista();
  const hoyISO = toISO(new Date());

  const lbl = document.getElementById('calPeriodoLabel');
  if (calVista === 'dia') {
    lbl.textContent = `${dias[0].getDate()} de ${MESES[dias[0].getMonth()]} ${dias[0].getFullYear()}`;
  } else if (calVista === 'semana') {
    lbl.textContent = `${dias[0].getDate()} ${MESES[dias[0].getMonth()].slice(0, 3)} — ${dias[6].getDate()} ${MESES[dias[6].getMonth()].slice(0, 3)} ${dias[6].getFullYear()}`;
  } else {
    lbl.textContent = `${MESES[calFechaRef.getMonth()]} ${calFechaRef.getFullYear()}`;
  }

  const anioKpi = calFechaRef.getFullYear();
  const mesKpi = calFechaRef.getMonth();
  let totalProg = 0, totalVac = 0, totalDesc = 0, totalDisp = 0;
  calOperariosIds.forEach(id => {
    const c = contarEstadosMes(id, anioKpi, mesKpi);
    totalProg += c.programado; totalVac += c.vacaciones; totalDesc += c.descanso; totalDisp += c.disponible;
  });

  document.getElementById('calKpiGrid').innerHTML =
    kpiCardHtml('Total Operarios', calOperariosIds.length, '#111111', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>') +
    kpiCardHtml('Disponibles', totalDisp, '#16A34A', '<path d="M20 6 9 17l-5-5"/>') +
    kpiCardHtml('Programados', totalProg, '#1D4ED8', '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>') +
    kpiCardHtml('Vacaciones', totalVac, '#D97706', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>') +
    kpiCardHtml('Descanso Médico', totalDesc, '#DC2626', '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>');

  const wrap = document.getElementById('schedulerWrap');
  const paginacionCont = document.getElementById('calPaginacion');
  if (!calOperariosIds.length) {
    wrap.innerHTML = '<div class="scheduler-vacio">No hay operarios seleccionados para mostrar en el calendario</div>';
    paginacionCont.innerHTML = '';
    return;
  }

  const totalPaginas = Math.max(1, Math.ceil(calOperariosIds.length / calPorPagina));
  if (calPaginaActual > totalPaginas) calPaginaActual = totalPaginas;
  const inicioPagina = (calPaginaActual - 1) * calPorPagina;
  const idsPagina = calOperariosIds.slice(inicioPagina, inicioPagina + calPorPagina);

  const compacto = calVista === 'mes';
  const anchoCol = compacto ? '40px' : (calVista === 'dia' ? '280px' : '168px');

  const headerDias = dias.map(d => `
    <div class="scheduler-day-col ${toISO(d) === hoyISO ? 'hoy' : ''}" style="width:${anchoCol}">
      <span class="scheduler-day-name">${DIAS_SEMANA[(d.getDay() + 6) % 7]}</span>
      <span class="scheduler-day-num">${d.getDate()}</span>
    </div>`).join('') + '<div class="scheduler-spacer"></div>';

  const filas = idsPagina.map(id => {
    const p = PERFILES[id];
    const celdas = dias.map(d => {
      const fechaISO = toISO(d);
      const { estado, detalle } = obtenerEstadoDia(id, fechaISO);
      return `<div class="scheduler-cell" style="width:${anchoCol}">${bloqueHtml(p, estado, detalle, compacto)}</div>`;
    }).join('') + '<div class="scheduler-spacer"></div>';
    return `
      <div class="scheduler-row">
        <div class="scheduler-operario-cell">
          <span class="scheduler-operario-nombre">${p.nombre} ${p.apellido}</span>
          <span class="scheduler-operario-rol">${p.rol}</span>
        </div>
        <div class="scheduler-days">${celdas}</div>
      </div>`;
  }).join('');

  wrap.innerHTML = `
    <div class="scheduler scheduler--${calVista}">
      <div class="scheduler-header-row">
        <div class="scheduler-corner">Operario</div>
        <div class="scheduler-days">${headerDias}</div>
      </div>
      <div class="scheduler-body">${filas}</div>
    </div>`;

  // Siempre arranca mostrando el primer día del periodo, completo. Se difiere dos frames
  // porque el navegador aún no terminó de calcular el layout del contenido recién insertado
  // (asignar scrollLeft en el mismo tick, o incluso en el siguiente frame, a veces no alcanza).
  const schedulerEl = wrap.querySelector('.scheduler');
  if (schedulerEl) {
    schedulerEl.scrollLeft = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { schedulerEl.scrollLeft = 0; });
    });
  }

  activarTooltipsScheduler();
  renderPaginacionCalendario(calOperariosIds.length, totalPaginas);
}

function activarTooltipsScheduler() {
  let tooltipEl = document.querySelector('.sched-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'sched-tooltip';
    document.body.appendChild(tooltipEl);
  }

  document.querySelectorAll('#schedulerWrap .sched-block').forEach(block => {
    block.addEventListener('mouseenter', () => {
      const data = SCHED_TOOLTIP_DATA[block.dataset.ttIdx];
      let html = `<strong>${data.nombre}</strong><span>Estado: ${data.estado}</span>`;
      if (data.proyecto) html += `<span>Proyecto: ${data.proyecto}</span>`;
      if (data.horario) html += `<span>Horario: ${data.horario}</span>`;
      if (data.supervisor) html += `<span>Supervisor: ${data.supervisor}</span>`;
      if (data.observaciones) html += `<span>Obs.: ${data.observaciones}</span>`;
      tooltipEl.innerHTML = html;
      tooltipEl.classList.add('show');
    });
    block.addEventListener('mousemove', (e) => {
      tooltipEl.style.left = (e.clientX + 14) + 'px';
      tooltipEl.style.top = (e.clientY + 14) + 'px';
    });
    block.addEventListener('mouseleave', () => tooltipEl.classList.remove('show'));
  });
}

inicializarDisponibilidad();
