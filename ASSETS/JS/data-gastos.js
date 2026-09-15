// =================================================
// DATA-GASTOS.JS
// Fuente única de datos del módulo "Registro de Gastos Operativos"
// (prototipo sin backend). La usan: registro-gastos-operativos.js y
// detalle-gastos.js.
// =================================================

// Encabezado no editable de cada Detalle (Razón social / RUC): se reutiliza
// el mismo dato de la empresa que usa Precintos.
const EMPRESA_GASTOS = EMPRESA_PRECINTOS;

// Grilla principal de "Registro de Gastos Operativos": un renglón por reporte
// generado por un colaborador (vía app móvil, fuera de esta fase).
// Estados (mismo pipeline de doble revisión que ya usa Reporte de Precintos):
//   pendiente          — el operador está registrando sus gastos del período.
//   revisadoSupervisor — el supervisor ya marcó "Revisado" (ver revisarDetalleGasto
//                        en detalle-gastos.js); se notifica al operador por la
//                        campana para que confirme su parte.
//   revisado           — el operador confirmó desde la notificación: cerrado,
//                        ya no se puede editar (ver consideración del documento
//                        funcional).
// Cada operador tiene sus 3 reportes del período (Alimentos/Movilidad/Días a
// Bordo) — se cubren a propósito los 3 escenarios de estado agregado que
// puede mostrar la grilla principal (ver estadoAgregadoGrupoGasto en
// registro-gastos-operativos.js, "el peor de los 3 manda"):
//   Edward (16/08-20/08): mezclado — Alimentos y Días a Bordo aún Pendiente,
//     Movilidad ya Revisado por Supervisor → el grupo se ve "Pendiente" en
//     la grilla (el más atrasado de los 3). El Días a Bordo de Edward
//     además es el único ejemplo Pendiente de ese tipo: demuestra que su
//     monto (salido automático de Configuración de Límites) igual se puede
//     corregir con "Editar" mientras no esté Revisado.
//   Julio César (10/08-14/08): los 3 en Revisado por Supervisor → recién se
//     notificó al operador por la campana, esperando que confirme los 3.
//   Rudy (21/07-25/07): los 3 en Revisado → período completamente cerrado.
// Los 3 usuarios (e.allccaco, r.bravo, j.gomez) existen en USUARIOS_DEMO
// para que la firma/nombre se resuelva bien en los 3 detalles.
// "periodoCodigo" identifica de forma única a un operador+período (mismo
// código compartido por sus 3 tipos) — reemplaza la clave armada por
// concatenación (nombre+apellido+fechas) que se usaba antes para agrupar,
// que era un buen approximation pero no un identificador real. Se genera
// con generarCodigoPeriodoGasto() al crear el período (ver asegurarReporteGasto).
const GASTOS_OPERATIVOS_DEMO = [
  { id: 1, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Alimentos', estado: 'pendiente' },
  { id: 2, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Movilidad', estado: 'revisadoSupervisor' },
  { id: 5, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Días a Bordo', estado: 'pendiente' },
  { id: 6, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Alimentos', estado: 'revisadoSupervisor' },
  { id: 7, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Movilidad', estado: 'revisadoSupervisor' },
  { id: 3, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Días a Bordo', estado: 'revisadoSupervisor' },
  { id: 4, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '01/07/2026', fechaHasta: '31/07/2026', tipo: 'Alimentos', estado: 'revisado' },
  { id: 8, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '01/07/2026', fechaHasta: '31/07/2026', tipo: 'Movilidad', estado: 'revisado' },
  { id: 9, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '01/07/2026', fechaHasta: '31/07/2026', tipo: 'Días a Bordo', estado: 'revisado' }
];

// Datos comunes de encabezado por colaborador (Nombre y apellidos, Cargo,
// Doc. Identidad, Área) — ingresados por el colaborador desde la app móvil,
// fuera de esta fase. Se repite entre los 3 ids del mismo operador (el
// modelo guarda esto por reporte, no por persona). No incluye Centro de
// costo: ese dato no se registra en ningún lado del sistema todavía.
const COLABORADOR_GASTOS_DEMO = {
  1: { cargo: 'Inspector de Operaciones', docIdentidad: '45120384' },
  2: { cargo: 'Inspector de Operaciones', docIdentidad: '45120384' },
  5: { cargo: 'Inspector de Operaciones', docIdentidad: '45120384' },
  3: { cargo: 'Supervisor de Operaciones', docIdentidad: '41985023' },
  6: { cargo: 'Supervisor de Operaciones', docIdentidad: '41985023' },
  7: { cargo: 'Supervisor de Operaciones', docIdentidad: '41985023' },
  4: { cargo: 'Inspector de Operaciones', docIdentidad: '46220157' },
  8: { cargo: 'Inspector de Operaciones', docIdentidad: '46220157' },
  9: { cargo: 'Inspector de Operaciones', docIdentidad: '46220157' }
};

const BASE_LEGAL_GASTOS = 'De acuerdo con el D.S. N.° 007-2002-TR y su reglamento, y a la política interna de viáticos y movilidad de Intertek Testing Services Peru S.A.';

// Detalle "Editar y Revisar Registro de Alimentos" (id enlaza con
// GASTOS_OPERATIVOS_DEMO.id, tipo 'Alimentos'). Una fila por comida
// (Desayuno/Almuerzo/Cena) — así queda tal cual lo carga el operario desde
// el app (ver mockup "Reporte de Alimentos": Cliente/Operación-PER se llenan
// una vez por día, pero Lugar/Hora/Costo/Evidencia son por comida). "evidencia"
// es la lista de fotos adjuntadas (sin backend real, solo un nombre/label
// por foto); "sinSustento" es el checkbox "Gasto sin sustento" del app —
// cuando está marcado no se espera evidencia para esa comida.
//
// "fechaEmision" es la fecha en que se creó la plantilla automática del
// reporte (mismo criterio que asegurarReporteGasto, que la fija en "hoy" al
// crearla) — acá, al ser datos de ejemplo ya creados, se usa el primer día
// del período (fechaInicio) como equivalente razonable.
const DETALLE_ALIMENTOS_DEMO = {
  // Edward — Pendiente: todavía está cargando desde el app.
  1: {
    numero: 'RA26000031', fechaEmision: '01/08/2026', montoMaximo: 45.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { fecha: '16/08/2026', comida: 'Desayuno', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:30 am', costo: 8.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '16/08/2026', comida: 'Almuerzo', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '13:00 pm', costo: 18.00, evidencia: ['Evidencia 1', 'Evidencia 2'], sinSustento: false },
      { fecha: '17/08/2026', comida: 'Desayuno', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:15 am', costo: 8.00, evidencia: [], sinSustento: true },
      { fecha: '17/08/2026', comida: 'Almuerzo', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '13:10 pm', costo: 20.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'e.allccaco', estado: 'pendiente'
  },
  // Julio César — Revisado por Supervisor: ya se notificó, falta que él confirme.
  6: {
    numero: 'RA26000032', fechaEmision: '01/08/2026', montoMaximo: 45.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { fecha: '10/08/2026', comida: 'Desayuno', lugar: 'Pisco', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:00 am', costo: 8.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '10/08/2026', comida: 'Cena', lugar: 'Pisco', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '20:15 pm', costo: 15.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'j.gomez', estado: 'revisadoSupervisor',
    revisadoSupervisorPor: 's.echavarria', revisadoSupervisorFecha: '15/08/2026 17:05'
  },
  // Rudy — Revisado: período cerrado del todo.
  4: {
    numero: 'RA26000033', fechaEmision: '01/07/2026', montoMaximo: 45.00,
    fechaInicio: '01/07/2026', fechaFin: '31/07/2026',
    grilla: [
      { fecha: '21/07/2026', comida: 'Almuerzo', lugar: 'Callao', cliente: 'Consorcio Terminales', operacionPer: 'PER/09463-25', hora: '12:30 pm', costo: 22.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '22/07/2026', comida: 'Almuerzo', lugar: 'Callao', cliente: 'Consorcio Terminales', operacionPer: 'PER/09463-25', hora: '12:40 pm', costo: 22.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'r.bravo', estado: 'revisado',
    revisadoSupervisorPor: 's.echavarria', revisadoSupervisorFecha: '26/07/2026 09:40',
    revisadoOperadorPor: 'r.bravo', revisadoOperadorFecha: '26/07/2026 11:15'
  }
};

// Detalle "Editar y Revisar Registro de Movilidad" — una fila por traslado
// ("Movilidad 1", "Movilidad 2"... del app), con la misma evidencia/"sin
// sustento" que Alimentos.
const DETALLE_MOVILIDAD_DEMO = {
  // Edward — Revisado por Supervisor.
  2: {
    numero: 'RM26000018', fechaEmision: '01/08/2026', montoMaximo: 60.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { fecha: '16/08/2026', empresa: 'Taxi Seguro Supe', distritoPartida: 'Supe Puerto', distritoDestino: 'Supe', motivo: 'Traslado a muelle', importeDia: 15.00, totalDia: 15.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '18/08/2026', empresa: 'Taxi Seguro Supe', distritoPartida: 'Supe', distritoDestino: 'Supe Puerto', motivo: 'Traslado a operación', importeDia: 15.00, totalDia: 15.00, evidencia: [], sinSustento: true }
    ],
    firmaTrabajador: 'e.allccaco', estado: 'revisadoSupervisor',
    revisadoSupervisorPor: 's.echavarria', revisadoSupervisorFecha: '21/08/2026 16:10'
  },
  // Julio César — Revisado por Supervisor.
  7: {
    numero: 'RM26000019', fechaEmision: '01/08/2026', montoMaximo: 60.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { fecha: '11/08/2026', empresa: 'Taxi Seguro Pisco', distritoPartida: 'Pisco', distritoDestino: 'Terminal Portuario', motivo: 'Traslado a operación', importeDia: 14.00, totalDia: 14.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'j.gomez', estado: 'revisadoSupervisor',
    revisadoSupervisorPor: 's.echavarria', revisadoSupervisorFecha: '15/08/2026 17:10'
  },
  // Rudy — Revisado: período cerrado del todo.
  8: {
    numero: 'RM26000020', fechaEmision: '01/07/2026', montoMaximo: 60.00,
    fechaInicio: '01/07/2026', fechaFin: '31/07/2026',
    grilla: [
      { fecha: '21/07/2026', empresa: 'Transportes Callao', distritoPartida: 'Callao', distritoDestino: 'Terminal Portuario', motivo: 'Traslado a muelle', importeDia: 18.00, totalDia: 18.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'r.bravo', estado: 'revisado',
    revisadoSupervisorPor: 's.echavarria', revisadoSupervisorFecha: '26/07/2026 10:15',
    revisadoOperadorPor: 'r.bravo', revisadoOperadorFecha: '26/07/2026 14:30'
  }
};

// Detalle "Editar y Revisar Registro de Días a Bordo" (sin evidencia: el
// monto se genera automáticamente según Configuración de Límites, no
// requiere sustento del operario).
const DETALLE_DIAS_A_BORDO_DEMO = {
  // Edward — Pendiente: el monto salió automático de Configuración de
  // Límites, pero el supervisor todavía puede corregirlo (ver "Editar" en
  // la grilla) antes de marcarlo como Revisado.
  5: {
    numero: 'RD26000010', fechaEmision: '01/08/2026', montoMaximo: 80.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { dia: 'Domingo', fecha: '16/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', operacionPer: 'PER/09461-25', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 100.00 },
      { dia: 'Lunes', fecha: '17/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', operacionPer: 'PER/09461-25', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 80.00 }
    ],
    firmaTrabajador: 'e.allccaco', estado: 'pendiente'
  },
  // Julio César — Revisado por Supervisor.
  3: {
    numero: 'RD26000009', fechaEmision: '01/08/2026', montoMaximo: 80.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { dia: 'Lunes', fecha: '10/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', operacionPer: 'PER/09461-25', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 80.00 },
      { dia: 'Martes', fecha: '11/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', operacionPer: 'PER/09461-25', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 80.00 }
    ],
    firmaTrabajador: 'j.gomez', estado: 'revisadoSupervisor',
    revisadoSupervisorPor: 's.echavarria', revisadoSupervisorFecha: '15/08/2026 17:20'
  },
  // Rudy — Revisado: período cerrado del todo.
  9: {
    numero: 'RD26000011', fechaEmision: '01/07/2026', montoMaximo: 80.00,
    fechaInicio: '01/07/2026', fechaFin: '31/07/2026',
    grilla: [
      { dia: 'Martes', fecha: '21/07/2026', lugar: 'Callao', cliente: 'Consorcio Terminales', operacion: 'Carga', operacionPer: 'PER/09463-25', buque: 'M/N Stena Impression', detalle: 'Inspección a bordo', monto: 80.00 }
    ],
    firmaTrabajador: 'r.bravo', estado: 'revisado',
    revisadoSupervisorPor: 's.echavarria', revisadoSupervisorFecha: '26/07/2026 10:20',
    revisadoOperadorPor: 'r.bravo', revisadoOperadorFecha: '26/07/2026 15:00'
  }
};

function obtenerGastoPorId(id) {
  return GASTOS_OPERATIVOS_DEMO.find(g => g.id === Number(id));
}

// Próximo código correlativo de un reporte de gasto por tipo (ej. RA26000032,
// RM26000019, RD26000010) — mismo formato que ya usan los demo de arriba.
function generarCodigoReporteGasto(tipo) {
  const prefijo = tipo === 'Alimentos' ? 'RA' : tipo === 'Movilidad' ? 'RM' : 'RD';
  const anio = String(new Date().getFullYear()).slice(-2);
  const fuente = tipo === 'Alimentos' ? DETALLE_ALIMENTOS_DEMO : tipo === 'Movilidad' ? DETALLE_MOVILIDAD_DEMO : DETALLE_DIAS_A_BORDO_DEMO;
  const nums = Object.values(fuente)
    .map(d => {
      const match = String(d.numero).match(new RegExp(`^${prefijo}\\d{2}(\\d{6})$`));
      return match ? parseInt(match[1], 10) : NaN;
    })
    .filter(n => !isNaN(n));
  const siguiente = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefijo}${anio}${String(siguiente).padStart(6, '0')}`;
}

// Próximo código correlativo de un período de gastos (ej. PG26000004) —
// identifica de forma única a un operador+mes; lo comparten los 3 reportes
// de ese período (ver asegurarReporteGasto).
function generarCodigoPeriodoGasto() {
  const anio = String(new Date().getFullYear()).slice(-2);
  const nums = GASTOS_OPERATIVOS_DEMO
    .map(g => {
      const match = String(g.periodoCodigo).match(/^PG\d{2}(\d{6})$/);
      return match ? parseInt(match[1], 10) : NaN;
    })
    .filter(n => !isNaN(n));
  const siguiente = (nums.length ? Math.max(...nums) : 0) + 1;
  return `PG${anio}${String(siguiente).padStart(6, '0')}`;
}

// Primer y último día del mes de una fecha ISO (yyyy-mm-dd), en formato
// dd/mm/yyyy — los reportes de Gastos son siempre por mes calendario, no por
// un rango arbitrario de días (ver asegurarReporteGasto debajo).
function primerYUltimoDiaDelMes(fechaISO) {
  const [anio, mes] = fechaISO.split('-').map(Number);
  const ultimoDia = new Date(anio, mes, 0).getDate(); // día 0 del mes siguiente = último día de este mes
  const pad = n => String(n).padStart(2, '0');
  return {
    primero: `01/${pad(mes)}/${anio}`,
    ultimo: `${pad(ultimoDia)}/${pad(mes)}/${anio}`
  };
}

// Se dispara la primera vez que un operador queda asignado a una operación
// (ver guardarAsignacionPrecintos en control-precintos.js: se llama junto
// con asegurarReportePrecinto, mismo momento en que el operador "empieza a
// registrar los precintos y gastos que realizó"). Crea sus 3 reportes
// (Alimentos/Movilidad/Días a Bordo) vacíos en estado Pendiente para el mes
// calendario de "fechaReferenciaISO" (normalmente hoy), listos para que el
// app vaya cargando lo que el operador reporte. Si el operador ya tiene
// reportes abiertos para ese mismo mes, no hace nada (evita duplicar si
// aparece en más de una Asignación dentro del mismo mes).
function asegurarReporteGasto(operadorUsuario, fechaReferenciaISO) {
  const { primero: fechaDesde, ultimo: fechaHasta } = primerYUltimoDiaDelMes(fechaReferenciaISO);

  const yaExiste = GASTOS_OPERATIVOS_DEMO.some(g =>
    g.operador === operadorUsuario && g.fechaDesde === fechaDesde && g.fechaHasta === fechaHasta);
  if (yaExiste) return;

  const u = obtenerUsuarioPorNombre(operadorUsuario);
  const nombre = u ? u.nombre : operadorUsuario;
  const apellido = u ? u.apellido : '';
  const hoy = fechaISOaDDMMYYYY(new Date().toISOString().slice(0, 10));

  const montoMaximoPorTipo = {
    'Alimentos': LIMITES_GASTOS_DEMO.alimentos.montoMaximoDia,
    'Movilidad': LIMITES_GASTOS_DEMO.movilidad.montoMaximoDia,
    'Días a Bordo': 0
  };

  // Un único código de período para los 3 (no uno por tipo: identifica al
  // operador+mes como conjunto, ver generarCodigoPeriodoGasto).
  const periodoCodigo = generarCodigoPeriodoGasto();

  ['Alimentos', 'Movilidad', 'Días a Bordo'].forEach(tipo => {
    const nuevoId = (Math.max(0, ...GASTOS_OPERATIVOS_DEMO.map(g => g.id)) || 0) + 1;
    GASTOS_OPERATIVOS_DEMO.unshift({
      id: nuevoId, periodoCodigo, operador: operadorUsuario, nombre, apellido, area: 'Operaciones',
      fechaDesde, fechaHasta, tipo, estado: 'pendiente'
    });

    const fuente = tipo === 'Alimentos' ? DETALLE_ALIMENTOS_DEMO : tipo === 'Movilidad' ? DETALLE_MOVILIDAD_DEMO : DETALLE_DIAS_A_BORDO_DEMO;
    fuente[nuevoId] = {
      numero: generarCodigoReporteGasto(tipo), fechaEmision: hoy, montoMaximo: montoMaximoPorTipo[tipo],
      fechaInicio: fechaDesde, fechaFin: fechaHasta,
      grilla: [],
      firmaTrabajador: operadorUsuario, estado: 'pendiente'
    };
  });
}

function obtenerDetalleGastoPorTipo(tipo, id) {
  const fuente = tipo === 'Alimentos' ? DETALLE_ALIMENTOS_DEMO
    : tipo === 'Movilidad' ? DETALLE_MOVILIDAD_DEMO
    : tipo === 'Días a Bordo' ? DETALLE_DIAS_A_BORDO_DEMO
    : null;
  return fuente ? fuente[Number(id)] : null;
}

// =================================================
// CONFIGURACIÓN DE LÍMITES PARA GASTOS
// (Precintos > Registro de Gastos Operativos > Configuración)
// =================================================
const LIMITES_GASTOS_DEMO = {
  modificadoPor: 'j.ramos',
  fechaModificacion: '28/08/2026 16:40',
  alimentos: {
    desayuno: 12.00, montoAnteriorDesayuno: 10.00,
    almuerzo: 20.00, montoAnteriorAlmuerzo: 18.00,
    cena: 15.00, montoAnteriorCena: 13.00,
    montoMaximoDia: 45.00
  },
  movilidad: {
    montoMaximoDia: 30.00, montoAnteriorDia: 25.00,
    montoMaximoViaje: 15.00, montoAnteriorViaje: 12.00
  },
  diasABordo: {
    rangos: [
      { id: 1, dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'], monto: 80.00 },
      { id: 2, dias: ['Sábado', 'Domingo'], monto: 100.00 }
    ],
    // Fecha recurrente (día + mes, sin año): un día especial como Navidad se
    // repite todos los años en la misma fecha, no una vez en un año puntual.
    diasEspeciales: [
      { id: 1, dia: 25, mes: 12, monto: 150.00 },
      { id: 2, dia: 1, mes: 1, monto: 150.00 }
    ]
  }
};

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const MESES_GASTOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
