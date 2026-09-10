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
// Estados: activo, inactivo, revisado. Un reporte "revisado" ya no se puede
// editar (ver consideración del documento funcional).
const GASTOS_OPERATIVOS_DEMO = [
  { id: 1, nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '16/08/2026', fechaHasta: '20/08/2026', tipo: 'Alimentos', estado: 'activo' },
  { id: 2, nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '16/08/2026', fechaHasta: '20/08/2026', tipo: 'Movilidad', estado: 'activo' },
  { id: 3, nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '10/08/2026', fechaHasta: '14/08/2026', tipo: 'Días a Bordo', estado: 'inactivo' },
  { id: 4, nombre: 'Miguel', apellido: 'Farfán', area: 'Operaciones', fechaDesde: '21/07/2026', fechaHasta: '25/07/2026', tipo: 'Alimentos', estado: 'revisado' },
  { id: 5, nombre: 'Carlos', apellido: 'Injante', area: 'Operaciones', fechaDesde: '21/07/2026', fechaHasta: '25/07/2026', tipo: 'Movilidad', estado: 'revisado' }
];

// Datos comunes de encabezado por colaborador (Nombre y apellidos, Cargo,
// Doc. Identidad, Centro de costo, Área) — ingresados por el colaborador
// desde la app móvil, fuera de esta fase.
const COLABORADOR_GASTOS_DEMO = {
  1: { cargo: 'Inspector de Operaciones', docIdentidad: '45120384', centroCosto: 'CC-014' },
  2: { cargo: 'Inspector de Operaciones', docIdentidad: '46220157', centroCosto: 'CC-014' },
  3: { cargo: 'Supervisor de Operaciones', docIdentidad: '41985023', centroCosto: 'CC-021' },
  4: { cargo: 'Inspector de Operaciones', docIdentidad: '44112298', centroCosto: 'CC-014' },
  5: { cargo: 'Inspector de Operaciones', docIdentidad: '43876210', centroCosto: 'CC-014' }
};

const BASE_LEGAL_GASTOS = 'De acuerdo con el D.S. N.° 007-2002-TR y su reglamento, y a la política interna de viáticos y movilidad de Intertek Testing Services Peru S.A.';

// Detalle "Editar y Revisar Registro de Alimentos" (id enlaza con
// GASTOS_OPERATIVOS_DEMO.id, tipo 'Alimentos').
const DETALLE_ALIMENTOS_DEMO = {
  1: {
    numero: 'RA-2026-0031', fechaEmision: '21/08/2026', montoMaximo: 45.00,
    fechaInicio: '16/08/2026', fechaFin: '20/08/2026',
    grilla: [
      { fecha: '16/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', horas: '13:00 - 14:00', costo: 18.00, total: 18.00 },
      { fecha: '17/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', horas: '13:00 - 14:00', costo: 20.00, total: 20.00 }
    ],
    firmaTrabajador: 'e.allccaco', estado: 'activo'
  },
  4: {
    numero: 'RA-2026-0027', fechaEmision: '26/07/2026', montoMaximo: 45.00,
    fechaInicio: '21/07/2026', fechaFin: '25/07/2026',
    grilla: [
      { fecha: '21/07/2026', lugar: 'Mollendo', cliente: 'Consorcio Terminales', operacionPer: 'PER/09463-25', horas: '12:30 - 13:30', costo: 22.00, total: 22.00 },
      { fecha: '22/07/2026', lugar: 'Mollendo', cliente: 'Consorcio Terminales', operacionPer: 'PER/09463-25', horas: '12:30 - 13:30', costo: 22.00, total: 22.00 }
    ],
    firmaTrabajador: 'm.farfan', estado: 'revisado', revisadoFecha: '26/07/2026 09:40'
  }
};

// Detalle "Editar y Revisar Registro de Movilidad".
const DETALLE_MOVILIDAD_DEMO = {
  2: {
    numero: 'RM-2026-0018', fechaEmision: '21/08/2026', montoMaximo: 60.00,
    fechaInicio: '16/08/2026', fechaFin: '20/08/2026',
    grilla: [
      { fecha: '16/08/2026', empresa: 'Taxi Seguro Supe', distritoPartida: 'Supe Puerto', distritoDestino: 'Supe', motivo: 'Traslado a muelle', importeDia: 15.00, totalDia: 15.00 },
      { fecha: '18/08/2026', empresa: 'Taxi Seguro Supe', distritoPartida: 'Supe', distritoDestino: 'Supe Puerto', motivo: 'Traslado a operación', importeDia: 15.00, totalDia: 15.00 }
    ],
    firmaTrabajador: 'r.bravo', estado: 'activo'
  },
  5: {
    numero: 'RM-2026-0014', fechaEmision: '26/07/2026', montoMaximo: 60.00,
    fechaInicio: '21/07/2026', fechaFin: '25/07/2026',
    grilla: [
      { fecha: '21/07/2026', empresa: 'Transportes Mollendo', distritoPartida: 'Mollendo', distritoDestino: 'Terminal Portuario', motivo: 'Traslado a muelle', importeDia: 18.00, totalDia: 18.00 }
    ],
    firmaTrabajador: 'c.injante', estado: 'revisado', revisadoFecha: '26/07/2026 10:15'
  }
};

// Detalle "Editar y Revisar Registro de Días a Bordo".
const DETALLE_DIAS_A_BORDO_DEMO = {
  3: {
    numero: 'RD-2026-0009', fechaEmision: '15/08/2026', montoMaximo: 80.00,
    fechaInicio: '10/08/2026', fechaFin: '14/08/2026',
    grilla: [
      { dia: 'Lunes', fecha: '10/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', itsRef: 'ITS-2201', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 80.00 },
      { dia: 'Martes', fecha: '11/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', itsRef: 'ITS-2201', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 80.00 }
    ],
    firmaTrabajador: 'j.gomez', estado: 'inactivo'
  }
};

function obtenerGastoPorId(id) {
  return GASTOS_OPERATIVOS_DEMO.find(g => g.id === Number(id));
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
    diasEspeciales: [
      { id: 1, fecha: '25/12/2026', monto: 150.00 },
      { id: 2, fecha: '01/01/2027', monto: 150.00 }
    ]
  }
};

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
