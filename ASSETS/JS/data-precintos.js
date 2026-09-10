// =================================================
// DATA-PRECINTOS.JS
// Fuente única de datos del módulo Precintos (prototipo sin backend).
// La usan: control-precintos.js y reporte-precintos.js.
// =================================================

/* =================================================
   UTILIDADES DE FECHA (dd/mm/yyyy ⇄ yyyy-mm-dd, formato de <input type="date">)
   Compartidas por control-precintos.js, reporte-precintos.js y
   generar-registro-precintos.js.
================================================= */
function fechaISOaDDMMYYYY(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fechaDDMMYYYYaISO(ddmmyyyy) {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y}-${m}-${d}`;
}

// Mismos PER usados en Servicios/Operaciones (servicios.js → NOMINACIONES_DEMO),
// repetidos aquí para no depender de cargar ese archivo completo en Precintos.
const PER_DEMO_PRECINTOS = [
  'PER/09461-25', 'PER/09462-25', 'PER/09463-25', 'PER/09465-25', 'PER/09467-25', 'PER/09468-25'
];

// Datos no editables del encabezado en "Generar Registro de Precintos".
const EMPRESA_PRECINTOS = {
  razonSocial: 'Intertek Testing Services Peru S.A.',
  ruc: '20100123456'
};

// Grilla principal de "Control de Precintos": cada fila es un lote registrado
// (código + fecha + estado) al que luego se le puede hacer una o más
// "Asignaciones" y, cuando el colaborador ya reportó su uso, generarle su
// "Registro" (botón Ver etiquetas).
const PRECINTOS_REGISTROS_DEMO = [
  { codigo: 'PRE/00014-26', fecha: '20/08/2026', estado: 'Registrado',
    precintos: ['A-10021', 'A-10022', 'A-10023', 'A-10024', 'A-10025'] },

  { codigo: 'PRE/00013-26', fecha: '15/08/2026', estado: 'Registrado',
    precintos: ['A-10001', 'A-10002', 'A-10003', 'A-10004', 'A-10005', 'A-10006', 'A-10007', 'A-10008', 'A-10009', 'A-10010'] },

  { codigo: 'PRE/00012-26', fecha: '02/08/2026', estado: 'Finalizado',
    precintos: ['A-09950', 'A-09951', 'A-09952', 'A-09953'] },

  { codigo: 'PRE/00011-26', fecha: '20/07/2026', estado: 'Finalizado',
    precintos: ['A-09900', 'A-09901', 'A-09902', 'A-09903', 'A-09904', 'A-09905'] }
];

// Asignaciones registradas por lote (Precintos > Control de Precintos > Asignar).
// "registroCodigo" enlaza con PRECINTOS_REGISTROS_DEMO.codigo.
const ASIGNACIONES_PRECINTOS_DEMO = [
  { id: 1, registroCodigo: 'PRE/00013-26', fecha: '16/08/2026',
    entregadoPor: 'j.torres', recibidoPor: 'Carlos Injante', numDesde: 'A-10001', numHasta: 'A-10010', cantidad: 10,
    motivo: 'Servicio de descarga M/N Megara', material: ['plastico'], observaciones: '',
    pers: ['PER/09461-25'] },

  { id: 2, registroCodigo: 'PRE/00011-26', fecha: '21/07/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'Miguel Farfán', numDesde: 'A-09900', numHasta: 'A-09905', cantidad: 6,
    motivo: 'Servicio de carga M/N Stena Impression', material: ['plastico', 'metalico'], observaciones: 'Entrega parcial, saldo en almacén.',
    pers: ['PER/09463-25', 'PER/09467-25'] }
];

// Grilla de "Reporte de Precintos" (Precintos > Reporte de Precintos).
const REPORTES_PRECINTOS_DEMO = [
  { id: 1, per: 'PER/09461-25', fechaInicio: '16/08/2026', fechaFin: '', estado: 'pendiente' },
  { id: 2, per: 'PER/09463-25', fechaInicio: '21/07/2026', fechaFin: '25/07/2026', estado: 'finalizado' },
  { id: 3, per: 'PER/09467-25', fechaInicio: '21/07/2026', fechaFin: '25/07/2026', estado: 'finalizado' },
  { id: 4, per: 'PER/09468-25', fechaInicio: '05/07/2026', fechaFin: '', estado: 'pendiente' }
];

// "Generar Registro de Precintos" (Detalle): registros de uso de precintos
// por PER ingresados por el colaborador en turno (vía app móvil, fuera del
// alcance de esta fase), a la espera de Revisado/Autorizado.
// Un mismo "Registro de Precintos" (lote) puede tener más de una Asignación
// con distintos PER (ver ASIGNACIONES_PRECINTOS_DEMO), y cada PER genera su
// propio Detalle — por eso cada entrada aquí es única por PER (campo "per"),
// aunque comparta el mismo "registroCodigo" del lote de origen. "numero"
// (código GRP) es el identificador único de cada Detalle.
const GENERAR_REGISTROS_PRECINTOS_DEMO = [
  { registroCodigo: 'PRE/00013-26', numero: 'GRP-2026-0045', fechaEmision: '17/08/2026',
    fechaInicio: '16/08/2026', fechaFin: '', per: 'PER/09461-25', estado: 'Pendiente',
    detalle: [
      { colaborador1: 'Julio César Gómez', colaborador2: 'Edward Allccaco', precinto: 'A-10001', viaje: 'V-2201', fecha: '16/08/2026', observacion: '' },
      { colaborador1: 'Julio César Gómez', colaborador2: 'Edward Allccaco', precinto: 'A-10002', viaje: 'V-2201', fecha: '16/08/2026', observacion: '' },
      { colaborador1: 'Julio César Gómez', colaborador2: 'Rudy Bravo Flores', precinto: 'A-10003', viaje: 'V-2202', fecha: '17/08/2026', observacion: 'Precinto reemplazado por rotura' }
    ],
    revisadoPor: null, revisadoFecha: null, autorizadoPor: null, autorizadoFecha: null },

  { registroCodigo: 'PRE/00011-26', numero: 'GRP-2026-0038', fechaEmision: '26/07/2026',
    fechaInicio: '21/07/2026', fechaFin: '25/07/2026', per: 'PER/09463-25', estado: 'Finalizado',
    detalle: [
      { colaborador1: 'Edward Allccaco', colaborador2: 'Rudy Bravo Flores', precinto: 'A-09900', viaje: 'V-2150', fecha: '21/07/2026', observacion: '' },
      { colaborador1: 'Edward Allccaco', colaborador2: 'Rudy Bravo Flores', precinto: 'A-09901', viaje: 'V-2150', fecha: '22/07/2026', observacion: '' }
    ],
    revisadoPor: 'j.ramos', revisadoFecha: '25/07/2026 14:20', autorizadoPor: 'm.rojas', autorizadoFecha: '25/07/2026 17:05' },

  // Misma Asignación (RP-2026-011) pero para el segundo PER incluido en ella:
  // demuestra que cada PER de una misma asignación conserva su propio Detalle,
  // con sus propios colaboradores, precintos utilizados y firmas.
  { registroCodigo: 'PRE/00011-26', numero: 'GRP-2026-0039', fechaEmision: '26/07/2026',
    fechaInicio: '21/07/2026', fechaFin: '25/07/2026', per: 'PER/09467-25', estado: 'Finalizado',
    detalle: [
      { colaborador1: 'Rudy Bravo Flores', colaborador2: 'Miguel Farfán', precinto: 'A-09902', viaje: 'V-2151', fecha: '22/07/2026', observacion: '' },
      { colaborador1: 'Rudy Bravo Flores', colaborador2: 'Miguel Farfán', precinto: 'A-09903', viaje: 'V-2151', fecha: '23/07/2026', observacion: '' }
    ],
    revisadoPor: 'j.ramos', revisadoFecha: '25/07/2026 14:25', autorizadoPor: 'm.rojas', autorizadoFecha: '25/07/2026 17:07' }
];

function obtenerRegistroPrecintoPorCodigo(codigo) {
  return PRECINTOS_REGISTROS_DEMO.find(r => r.codigo === codigo);
}

// Detalle "Generar Registro" por código de lote (Control de Precintos > Ver
// etiquetas): si el lote tiene más de un PER asignado, devuelve el primero;
// para abrir el Detalle exacto de un PER puntual usar obtenerGenerarRegistroPorPer.
function obtenerGenerarRegistroPorCodigo(codigo) {
  return GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.registroCodigo === codigo);
}

// Detalle "Generar Registro" por PER (Reporte de Precintos > Ver): identifica
// sin ambigüedad el Detalle correspondiente, incluso si su lote de origen
// tiene más de un PER asignado.
function obtenerGenerarRegistroPorPer(per) {
  return GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.per === per);
}

// Detalle "Generar Registro" por su código único (GRP-...) — es el
// identificador que usa el modal mientras está abierto (codigoDetalleActivo),
// para no volver a depender de una búsqueda ambigua por lote.
function obtenerGenerarRegistroPorNumero(numero) {
  return GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.numero === numero);
}

// Próximo código correlativo para un nuevo registro, con el mismo formato
// usado para el N° de PER de Nominaciones (PER/00000-00) pero con el
// prefijo "PRE" (ej. PRE/00015-26).
function generarCodigoRegistroPrecinto() {
  const nums = PRECINTOS_REGISTROS_DEMO
    .map(r => {
      const match = String(r.codigo).match(/PRE\/(\d+)-\d{2}/);
      return match ? parseInt(match[1], 10) : NaN;
    })
    .filter(n => !isNaN(n));
  const siguiente = (nums.length ? Math.max(...nums) : 0) + 1;
  const anio = String(new Date().getFullYear()).slice(-2);
  return `PRE/${String(siguiente).padStart(5, '0')}-${anio}`;
}
