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

// Extrae el número final de un código de precinto (ej. "A-10010" → 10010),
// para ordenar precintos y calcular rangos. Compartida por control-precintos.js
// y generar-registro-precintos.js.
function numeroDePrecinto(codigo) {
  const match = String(codigo).match(/(\d+)\s*$/);
  return match ? parseInt(match[1], 10) : NaN;
}

// Agrupa una lista de precintos en rangos contiguos para mostrarlos de forma
// compacta (ej. ['A-10001','A-10002','A-10003','A-10005'] → "A-10001 - A-10003, A-10005")
// — la usa la vista "Por lote" de Ver detalle de Asignación (asignacion-precintos.js)
// para no listar precinto por precinto cuando son varias decenas.
function formatearRangosPrecintos(precintos) {
  if (!precintos || !precintos.length) return '';
  const ordenados = [...precintos].sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
  const grupos = [];
  let inicio = ordenados[0];
  let anterior = ordenados[0];

  for (let i = 1; i <= ordenados.length; i++) {
    const actual = ordenados[i];
    if (actual !== undefined && numeroDePrecinto(actual) === numeroDePrecinto(anterior) + 1) {
      anterior = actual;
      continue;
    }
    grupos.push(inicio === anterior ? inicio : `${inicio} - ${anterior}`);
    inicio = actual;
    anterior = actual;
  }
  return grupos.join(', ');
}

// Datos no editables del encabezado en "Generar Registro de Precintos".
const EMPRESA_PRECINTOS = {
  razonSocial: 'Intertek Testing Services Peru S.A.',
  ruc: '20100123456'
};

// Grilla principal de "Control de Precintos": cada fila es un lote registrado
// (código + fecha + estado) — el módulo solo maneja ingresos, ver
// obtenerHistorialMaterial más abajo. "ingresadoPor" es quién hizo ESE
// registro puntual (el supervisor que cargó el stock), no quién lo asigna
// después — eso vive en ASIGNACIONES_PRECINTOS_DEMO.entregadoPor.
const PRECINTOS_REGISTROS_SEED = [
  { codigo: 'PRE26000017', fecha: '12/09/2026', estado: 'Registrado', material: 'Circular',
    ingresadoPor: 's.echavarria',
    precintos: ['D-40001', 'D-40002', 'D-40003', 'D-40004'] },

  { codigo: 'PRE26000016', fecha: '08/09/2026', estado: 'Registrado', material: 'Metálico',
    ingresadoPor: 's.echavarria',
    precintos: ['C-30001', 'C-30002', 'C-30003', 'C-30004', 'C-30005', 'C-30006'] },

  { codigo: 'PRE26000015', fecha: '02/09/2026', estado: 'Registrado', material: 'Plástico',
    ingresadoPor: 's.echavarria',
    precintos: ['B-20001', 'B-20002', 'B-20003', 'B-20004', 'B-20005', 'B-20006', 'B-20007', 'B-20008'] },

  { codigo: 'PRE26000014', fecha: '20/08/2026', estado: 'Registrado', material: 'Plástico',
    ingresadoPor: 's.echavarria',
    precintos: ['A-10021', 'A-10022', 'A-10023', 'A-10024', 'A-10025'] },

  { codigo: 'PRE26000013', fecha: '15/08/2026', estado: 'Registrado', material: 'Plástico',
    ingresadoPor: 's.echavarria',
    precintos: ['A-10001', 'A-10002', 'A-10003', 'A-10004', 'A-10005', 'A-10006', 'A-10007', 'A-10008', 'A-10009', 'A-10010'] },

  { codigo: 'PRE26000012', fecha: '02/08/2026', estado: 'Finalizado', material: 'Circular',
    ingresadoPor: 's.echavarria',
    precintos: ['A-09950', 'A-09951', 'A-09952', 'A-09953'] },

  { codigo: 'PRE26000011', fecha: '20/07/2026', estado: 'Finalizado', material: 'Metálico',
    ingresadoPor: 's.echavarria',
    precintos: ['A-09900', 'A-09901', 'A-09902', 'A-09903', 'A-09904', 'A-09905'] }
];
const PRECINTOS_REGISTROS_DEMO = tgCargarCatalogo('precintosRegistrosData', PRECINTOS_REGISTROS_SEED);

// Asignaciones registradas (Precintos > Asignación de Precintos).
// "registroCodigos" enlaza con PRECINTOS_REGISTROS_DEMO.codigo — es un
// arreglo porque una misma asignación puede juntar precintos de más de un
// lote (se deriva de los lotes de origen de "precintos", ver
// obtenerLoteDePrecinto). Una asignación no es para una sola persona: cada
// entregado/recibido es un registro independiente, para no mezclar en un
// mismo registro a colaboradores distintos. La asignación es ante todo un
// conjunto de precintos ("precintos"/"cantidad") entregado de una sola vez;
// no lleva PER — cada Asignación tiene su propio Detalle/GRP de uso (ver
// asegurarReportePrecinto), relación 1 a 1. "entregadoPor" y "recibidoPor"
// son usuarios del sistema (USUARIOS_DEMO): Supervisor y Inspector
// respectivamente. No lleva un campo "estado" propio: se calcula a partir de
// su Detalle/GRP (ver calcularEstadoAsignacion más abajo) — 'Registrado'
// mientras nadie reportó ningún uso, 'En proceso' con uso parcial reportado
// y 'Finalizado' cuando ya se reportó todo o el Detalle/GRP quedó cerrado.
const ASIGNACIONES_PRECINTOS_SEED = [
  // A-09951 quedó marcado como scrap aunque esta Asignación sigue
  // "Registrado" (su Detalle/GRP todavía no tiene nada reportado): un
  // precinto puede llegar dañado y reportarse como scrap desde la app móvil
  // antes de instalarse, sin que eso implique que ya se "usó". Sirve para
  // ver cómo se bloquea ese precinto puntual en "Editar" (no se puede
  // quitar) mientras el resto de la Asignación se sigue pudiendo editar.
  { id: 8, codigo: 'ASG26000008', registroCodigos: ['PRE26000012'], fecha: '20/09/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'j.torres',
    precintos: ['A-09950', 'A-09951', 'A-09952', 'A-09953'],
    cantidad: 4,
    scrap: [{ precinto: 'A-09951', fecha: '21/09/2026', colaborador: 'j.torres', motivo: 'Cuerpo plástico agrietado al momento de revisarlo; no se pudo instalar.' }],
    motivo: 'Servicio de descarga M/N Naviera del Sur', observaciones: '' },

  // Ejemplo de una Asignación con más de un material de precinto para el
  // mismo receptor en una sola entrega (Metálico + Circular, de dos lotes
  // distintos) — no solo mezcla de lotes del mismo material como ASG26000006.
  // D-40002 (Circular) quedó marcado como scrap: sirve para ver la vista
  // "Por material" de Ver Detalle con el conteo de scrap repartido entre
  // los dos materiales de la misma Asignación (Metálico en 0, Circular en 1).
  { id: 7, codigo: 'ASG26000007', registroCodigos: ['PRE26000016', 'PRE26000017'], fecha: '16/09/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'j.gomez',
    precintos: ['C-30001', 'C-30002', 'C-30003', 'D-40001', 'D-40002'],
    cantidad: 5,
    scrap: [{ precinto: 'D-40002', fecha: '17/09/2026', colaborador: 'j.gomez', motivo: 'Mecanismo de cierre del precinto circular no engancha.' }],
    motivo: 'Servicio de estiba M/N Coloso',
    observaciones: 'Entrega con precintos metálicos (contenedores) y circulares (válvulas) para el mismo servicio.' },

  { id: 6, codigo: 'ASG26000006', registroCodigos: ['PRE26000014', 'PRE26000015'], fecha: '17/09/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'r.bravo',
    precintos: ['A-10024', 'A-10025', 'B-20006', 'B-20007', 'B-20008'],
    cantidad: 5,
    motivo: 'Servicio de descarga M/N Puelche', observaciones: 'Asignación que mezcla el saldo de dos lotes de origen.' },

  { id: 5, codigo: 'ASG26000005', registroCodigos: ['PRE26000015'], fecha: '10/09/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'e.allccaco',
    precintos: ['B-20001', 'B-20002', 'B-20003', 'B-20004', 'B-20005'],
    cantidad: 5,
    motivo: 'Servicio de carga M/N Cabo Froward', observaciones: '' },

  { id: 4, codigo: 'ASG26000004', registroCodigos: ['PRE26000014'], fecha: '04/09/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'j.gomez',
    precintos: ['A-10021', 'A-10022', 'A-10023'],
    cantidad: 3,
    motivo: 'Servicio de descarga M/N Bahía Azul', observaciones: '' },

  // A-10003 quedó marcado como scrap: es el mismo precinto que el Detalle/GRP
  // de esta Asignación (ver GENERAR_REGISTROS_PRECINTOS_DEMO, GRP26000045)
  // anota como "reemplazado por rotura" — ejemplo de un precinto dañado
  // reportado por el operador desde la app móvil.
  { id: 1, codigo: 'ASG26000001', registroCodigos: ['PRE26000013'], fecha: '16/08/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'j.gomez',
    precintos: ['A-10001', 'A-10002', 'A-10003', 'A-10004', 'A-10005', 'A-10006', 'A-10007', 'A-10008', 'A-10009', 'A-10010'],
    cantidad: 10,
    scrap: [{ precinto: 'A-10003', fecha: '18/08/2026', colaborador: 'j.gomez', motivo: 'Se rompió al momento de instalarlo; se reemplazó por otro de la misma asignación.' }],
    motivo: 'Servicio de descarga M/N Megara', observaciones: '' },

  { id: 2, codigo: 'ASG26000002', registroCodigos: ['PRE26000011'], fecha: '21/07/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'e.allccaco',
    precintos: ['A-09900', 'A-09901', 'A-09902'],
    cantidad: 3,
    motivo: 'Servicio de carga M/N Stena Impression', observaciones: 'Entrega parcial, saldo en almacén.' },

  { id: 3, codigo: 'ASG26000003', registroCodigos: ['PRE26000011'], fecha: '21/07/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'r.bravo',
    precintos: ['A-09903', 'A-09904', 'A-09905'],
    cantidad: 3,
    motivo: 'Servicio de carga M/N Stena Impression', observaciones: 'Entrega parcial, saldo en almacén.' }
];
const ASIGNACIONES_PRECINTOS_DEMO = tgCargarCatalogo('precintosAsignacionesData', ASIGNACIONES_PRECINTOS_SEED);

// Migración: navegadores que ya tenían "precintosAsignacionesData" guardado
// en localStorage de antes de que "scrap" pasara de ser un arreglo de
// códigos (['A-09951']) a un arreglo de objetos ({precinto, fecha,
// colaborador, motivo}) se quedan con el formato viejo cacheado —
// tgCargarCatalogo solo usa el seed nuevo si no hay nada guardado todavía.
// Sin esto, cualquier código que lea "scrap" como objeto (Reporte de
// Precintos, Asignación de Precintos) rompe apenas encuentra el string
// suelto.
ASIGNACIONES_PRECINTOS_DEMO.forEach(a => {
  if (a.scrap && a.scrap.length && typeof a.scrap[0] === 'string') {
    a.scrap = a.scrap.map(precinto => ({ precinto, fecha: a.fecha, colaborador: a.recibidoPor, motivo: '' }));
  }
});

// Grilla de "Reporte de Precintos" (Precintos > Reporte de Precintos).
// Un Reporte de Precintos solo existe si su Asignación ya quedó registrada
// (ver asegurarReportePrecinto más abajo, disparada desde
// guardarAsignacionPrecintos en control-precintos.js) — por eso no hay acá
// una Asignación "suelta" sin ningún Detalle detrás; eso dejaría el código
// GRP y el supervisor de la grilla sin nada que mostrar.
const REPORTES_PRECINTOS_SEED = [
  { id: 8, asignacionId: 8, fechaInicio: '20/09/2026', fechaFin: '', estado: 'pendiente' },
  { id: 7, asignacionId: 7, fechaInicio: '16/09/2026', fechaFin: '', estado: 'pendiente' },
  { id: 6, asignacionId: 6, fechaInicio: '17/09/2026', fechaFin: '', estado: 'pendiente' },
  { id: 5, asignacionId: 5, fechaInicio: '10/09/2026', fechaFin: '', estado: 'pendiente' },
  { id: 4, asignacionId: 4, fechaInicio: '04/09/2026', fechaFin: '', estado: 'pendiente' },
  { id: 1, asignacionId: 1, fechaInicio: '16/08/2026', fechaFin: '', estado: 'pendiente' },
  { id: 2, asignacionId: 2, fechaInicio: '21/07/2026', fechaFin: '25/07/2026', estado: 'finalizado' },
  { id: 3, asignacionId: 3, fechaInicio: '21/07/2026', fechaFin: '25/07/2026', estado: 'finalizado' }
];
const REPORTES_PRECINTOS_DEMO = tgCargarCatalogo('precintosReportesData', REPORTES_PRECINTOS_SEED);

// "Generar Registro de Precintos" (Detalle): registros de uso de precintos
// por Asignación, uno por operario (campo "colaborador" — el que realmente
// usó/cerró ese precinto, no una pareja fija), cargados desde la app móvil o
// desde el formulario "Agregar uso de precinto" de este mismo Detalle
// (respaldo web mientras no haya o falle la app). Cada Asignación (ver
// ASIGNACIONES_PRECINTOS_DEMO) genera un único Detalle propio — relación 1 a
// 1 (campo "asignacionId") — aunque comparta alguno de los "registroCodigos"
// de los lotes de origen (un Detalle puede tener precintos de más de un
// lote, si la Asignación mezcló varios). "numero" (código GRP) es el
// identificador único de cada Detalle. "estado" pasa de 'Pendiente' a
// 'Finalizado' con el botón Finalizar (ver finalizarGenerarRegistro en
// generar-registro-precintos.js) — no requiere firmas ni validaciones
// previas, es una acción directa del supervisor.
const GENERAR_REGISTROS_PRECINTOS_SEED = [
  { registroCodigos: ['PRE26000012'], numero: 'GRP26000050', fechaEmision: '20/09/2026',
    fechaInicio: '20/09/2026', fechaFin: '', asignacionId: 8, estado: 'Pendiente',
    detalle: [] },

  { registroCodigos: ['PRE26000016', 'PRE26000017'], numero: 'GRP26000049', fechaEmision: '17/09/2026',
    fechaInicio: '16/09/2026', fechaFin: '', asignacionId: 7, estado: 'Pendiente',
    detalle: [] },

  // Ejemplo con dos precintos ya reportados (de los 5 entregados) para
  // mostrar más detalle al abrir "Ver Detalle/GRP" — el resto queda "Sin
  // reportar" en el aviso de completitud.
  { registroCodigos: ['PRE26000014', 'PRE26000015'], numero: 'GRP26000048', fechaEmision: '18/09/2026',
    fechaInicio: '17/09/2026', fechaFin: '', asignacionId: 6, estado: 'Pendiente',
    detalle: [
      { colaborador: 'r.bravo', precinto: 'A-10024', viaje: 'V-2318', fecha: '18/09/2026', observacion: '', tipoOperacion: 'Descarga / M/N Puelche', terminal: 'Terminal Norte' },
      { colaborador: 'r.bravo', precinto: 'B-20006', viaje: 'V-2318', fecha: '18/09/2026', observacion: '', tipoOperacion: 'Descarga / M/N Puelche', terminal: 'Terminal Norte' }
    ] },

  // Ejemplo con tres precintos reportados (de los 5 entregados), uno con
  // observación — más detalle para "Ver Detalle/GRP".
  { registroCodigos: ['PRE26000015'], numero: 'GRP26000047', fechaEmision: '11/09/2026',
    fechaInicio: '10/09/2026', fechaFin: '', asignacionId: 5, estado: 'Pendiente',
    detalle: [
      { colaborador: 'e.allccaco', precinto: 'B-20001', viaje: 'V-2305', fecha: '11/09/2026', observacion: '', tipoOperacion: 'Carga / M/N Cabo Froward', terminal: 'Terminal Sur' },
      { colaborador: 'e.allccaco', precinto: 'B-20002', viaje: 'V-2305', fecha: '11/09/2026', observacion: '', tipoOperacion: 'Carga / M/N Cabo Froward', terminal: 'Terminal Sur' },
      { colaborador: 'e.allccaco', precinto: 'B-20003', viaje: 'V-2306', fecha: '12/09/2026', observacion: 'Contenedor con retraso en muelle', tipoOperacion: 'Carga / M/N Cabo Froward', terminal: 'Terminal Sur' }
    ] },

  // Ejemplo de asignación de septiembre con uso parcial: de los 3 precintos
  // entregados, el operador reportó 2 como usados — el resto queda en su
  // stock a la espera de la operación en la que decida usarlo (no todo lo
  // asignado se consume en el mismo mes).
  { registroCodigos: ['PRE26000014'], numero: 'GRP26000046', fechaEmision: '05/09/2026',
    fechaInicio: '04/09/2026', fechaFin: '', asignacionId: 4, estado: 'Pendiente',
    detalle: [
      { colaborador: 'j.gomez', precinto: 'A-10021', viaje: 'V-2310', fecha: '09/09/2026', observacion: '', tipoOperacion: 'Descarga / M/N Bahía Azul', terminal: 'Terminal Norte' },
      { colaborador: 'j.gomez', precinto: 'A-10022', viaje: 'V-2311', fecha: '10/09/2026', observacion: '', tipoOperacion: 'Descarga / M/N Bahía Azul', terminal: 'Terminal Norte' }
    ] },

  { registroCodigos: ['PRE26000013'], numero: 'GRP26000045', fechaEmision: '17/08/2026',
    fechaInicio: '16/08/2026', fechaFin: '', asignacionId: 1, estado: 'Pendiente',
    detalle: [
      { colaborador: 'j.gomez', precinto: 'A-10001', viaje: 'V-2201', fecha: '16/08/2026', observacion: '', tipoOperacion: 'Descarga / M/N Megara', terminal: 'Terminal Norte' },
      { colaborador: 'j.gomez', precinto: 'A-10002', viaje: 'V-2201', fecha: '16/08/2026', observacion: '', tipoOperacion: 'Descarga / M/N Megara', terminal: 'Terminal Norte' },
      { colaborador: 'j.gomez', precinto: 'A-10003', viaje: 'V-2202', fecha: '17/08/2026', observacion: 'Precinto reemplazado por rotura', tipoOperacion: 'Descarga / M/N Megara', terminal: 'Terminal Norte' }
    ] },

  { registroCodigos: ['PRE26000011'], numero: 'GRP26000038', fechaEmision: '26/07/2026',
    fechaInicio: '21/07/2026', fechaFin: '25/07/2026', asignacionId: 2, estado: 'Finalizado',
    // A-09902 quedó en esta Asignación (ver ASIGNACIONES_PRECINTOS_DEMO id 2)
    // pero nunca se reportó como usado — se deja así a propósito: es el caso
    // real que el aviso "Sin reportar" de mostrarDetalleRegistro debe mostrar
    // aunque el Detalle ya esté Finalizado.
    detalle: [
      { colaborador: 'e.allccaco', precinto: 'A-09900', viaje: 'V-2150', fecha: '21/07/2026', observacion: '', tipoOperacion: 'Carga / M/N Stena Impression', terminal: 'Terminal Sur' },
      { colaborador: 'e.allccaco', precinto: 'A-09901', viaje: 'V-2150', fecha: '22/07/2026', observacion: '', tipoOperacion: 'Carga / M/N Stena Impression', terminal: 'Terminal Sur' }
    ] },

  // Otra Asignación del mismo lote de origen (PRE26000011) pero para otro
  // receptor: demuestra que cada Asignación conserva su propio Detalle, con
  // sus propios colaboradores y precintos utilizados.
  { registroCodigos: ['PRE26000011'], numero: 'GRP26000039', fechaEmision: '26/07/2026',
    fechaInicio: '21/07/2026', fechaFin: '25/07/2026', asignacionId: 3, estado: 'Finalizado',
    detalle: [
      { colaborador: 'r.bravo', precinto: 'A-09903', viaje: 'V-2151', fecha: '23/07/2026', observacion: '', tipoOperacion: 'Carga / M/N Stena Impression', terminal: 'Terminal Sur' }
    ] }
];
const GENERAR_REGISTROS_PRECINTOS_DEMO = tgCargarCatalogo('precintosGenerarRegistrosData', GENERAR_REGISTROS_PRECINTOS_SEED);

// Persiste las 4 estructuras del módulo en localStorage (mismo mecanismo que
// tgCargarCatalogo/tgGuardarCatalogo ya usa el resto del sistema para sus
// mantenedores). Sin esto, cada página (Control / Asignación / Reporte de
// Precintos) arranca su propio script de datos desde cero al navegar entre
// ellas — lo que se registraba en una quedaba solo en memoria de esa página
// y desaparecía al entrar a la siguiente. Se llama explícitamente al final
// de cada acción que guarda/edita/elimina algo (ver guardarRegistroPrecinto,
// guardarAsignacionPrecintos, eliminarAsignacion, agregarUsoPrecinto,
// quitarUsoPrecinto, finalizarGenerarRegistro), y además una vez más al
// salir de la página (beforeunload) como red de seguridad.
function guardarEstadoPrecintos() {
  tgGuardarCatalogo('precintosRegistrosData', PRECINTOS_REGISTROS_DEMO);
  tgGuardarCatalogo('precintosAsignacionesData', ASIGNACIONES_PRECINTOS_DEMO);
  tgGuardarCatalogo('precintosReportesData', REPORTES_PRECINTOS_DEMO);
  tgGuardarCatalogo('precintosGenerarRegistrosData', GENERAR_REGISTROS_PRECINTOS_DEMO);
}

window.addEventListener('beforeunload', guardarEstadoPrecintos);

function obtenerAsignacionPorId(id) {
  return ASIGNACIONES_PRECINTOS_DEMO.find(a => a.id === id);
}

// Asignación a la que pertenece un precinto puntual — los códigos de
// precinto son únicos entre asignaciones, así que alcanza con buscar en cuál
// aparece. La usa operaciones-movil.js para saber en qué Detalle/GRP debe
// quedar cada precinto que el operador marca como usado.
function obtenerAsignacionDePrecinto(precinto) {
  return ASIGNACIONES_PRECINTOS_DEMO.find(a => a.precintos.includes(precinto));
}

function obtenerRegistroPrecintoPorCodigo(codigo) {
  return PRECINTOS_REGISTROS_DEMO.find(r => r.codigo === codigo);
}

// Lote (Registro de Precintos) al que pertenece un precinto puntual — los
// códigos de precinto son únicos entre lotes, así que alcanza con buscar en
// cuál lote aparece. Es la base para saber de qué lote vino cada precinto
// dentro de una Asignación que ahora puede mezclar varios lotes.
function obtenerLoteDePrecinto(precinto) {
  return PRECINTOS_REGISTROS_DEMO.find(r => r.precintos.includes(precinto));
}

// Arma una lista secuencial de precintos entre "desde" y "hasta" conservando
// el prefijo y el relleno de ceros del valor "desde" (ej. A-10021 → A-10030
// genera A-10021, A-10022, ..., A-10030). Compartida por Registro
// (control-precintos.js) y Asignación (asignacion-precintos.js).
function generarRangoPrecintos(desde, hasta) {
  const matchDesde = String(desde).match(/^(.*?)(\d+)\s*$/);
  const matchHasta = String(hasta).match(/(\d+)\s*$/);
  if (!matchDesde || !matchHasta) return null;

  const prefijo = matchDesde[1];
  const ancho = matchDesde[2].length;
  const nDesde = parseInt(matchDesde[2], 10);
  const nHasta = parseInt(matchHasta[1], 10);
  if (isNaN(nDesde) || isNaN(nHasta) || nHasta < nDesde) return null;

  const lista = [];
  for (let n = nDesde; n <= nHasta; n++) {
    lista.push(`${prefijo}${String(n).padStart(ancho, '0')}`);
  }
  return lista;
}

// Precintos del lote que ya fueron asignados en alguna Asignación (a
// cualquier receptor), para no ofrecerlos de nuevo al crear una nueva. Al
// editar una Asignación existente se excluye su propio id, porque sus
// precintos siguen siendo "suyos" mientras se edita (si no, desaparecerían
// de las opciones disponibles). Usada por Control de Precintos (bloquear
// precintos ya asignados al editar un Registro) y por Asignación de
// Precintos (armar el pool de precintos disponibles de un lote).
function obtenerPrecintosAsignadosDeLote(codigo, excluirId = null) {
  const asignados = new Set();
  ASIGNACIONES_PRECINTOS_DEMO
    .filter(a => a.registroCodigos.includes(codigo) && a.id !== excluirId)
    .forEach(a => a.precintos.forEach(p => asignados.add(p)));
  return asignados;
}

// Precintos del lote (Registro de Precintos) que todavía no fueron
// asignados a nadie, ordenados de menor a mayor numeración. Una Asignación
// solo puede repartir precintos que ya existan en ese lote — no crea
// precintos nuevos ni permite escribir cualquier código a mano.
function obtenerPrecintosDisponiblesDeLote(codigo, excluirId = null) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return [];
  const asignados = obtenerPrecintosAsignadosDeLote(codigo, excluirId);
  return registro.precintos
    .filter(p => !asignados.has(p))
    .sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
}

// Estado del lote: se calcula a partir de sus asignaciones y del cierre en
// "Generar Registro" (Revisado/Autorizado), en vez de quedar fijo en el dato
// del registro. "Anulado" queda como valor posible del dato (ningún flujo de
// UI actual lo pone, pero Asignación de Precintos lo sigue rechazando si el
// supervisor teclea un precinto de un lote anulado — ver asignarPrecintos
// en asignacion-precintos.js). Usada también por calcularEstadoAsignacion.
function calcularEstadoLote(codigo) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return null;
  // "Anulado" y "Finalizado" son cierres definitivos que ya se guardan en el
  // dato: el segundo lo pone finalizarGenerarRegistro (generar-registro-precintos.js)
  // cuando todas las Asignaciones del lote quedan Revisadas/Autorizadas — se
  // respeta esa lógica en vez de volver a derivarla acá para no terminar con
  // dos criterios distintos.
  if (registro.estado === 'Anulado' || registro.estado === 'Finalizado') return registro.estado;

  const tieneAsignaciones = ASIGNACIONES_PRECINTOS_DEMO.some(a => a.registroCodigos.includes(codigo));
  if (!tieneAsignaciones) return 'Registrado';

  return obtenerPrecintosDisponiblesDeLote(codigo).length > 0 ? 'Parcialmente asignado' : 'Asignado';
}

// Vista agregada de "Control de Precintos": una fila por material con el
// total y el disponible sumados de todos sus lotes — la grilla no muestra un
// lote por fila, sino el almacén consolidado (ver renderTablaControlPrecintos
// en control-precintos.js). El módulo solo registra ingresos (ver
// obtenerHistorialMaterial), así que "Fecha de Registro" es el lote más
// antiguo de ese material (cuándo se empezó a llevar) y "Última
// Actualización" el más reciente (el último ingreso que le sumó stock);
// "Ingresado por" es quién hizo ese último ingreso.
function obtenerMaterialesControlPrecintos() {
  const porMaterial = {};
  PRECINTOS_REGISTROS_DEMO.forEach(lote => {
    if (!porMaterial[lote.material]) {
      porMaterial[lote.material] = {
        material: lote.material, fecha: lote.fecha, fechaUltimaActualizacion: lote.fecha,
        ingresadoPor: lote.ingresadoPor, total: 0, disponible: 0
      };
    }
    const grupo = porMaterial[lote.material];
    grupo.total += lote.precintos.length;
    grupo.disponible += obtenerPrecintosDisponiblesDeLote(lote.codigo).length;
    if (fechaDDMMYYYYaISO(lote.fecha) < fechaDDMMYYYYaISO(grupo.fecha)) grupo.fecha = lote.fecha;
    if (fechaDDMMYYYYaISO(lote.fecha) > fechaDDMMYYYYaISO(grupo.fechaUltimaActualizacion)) {
      grupo.fechaUltimaActualizacion = lote.fecha;
      grupo.ingresadoPor = lote.ingresadoPor;
    }
  });
  return Object.values(porMaterial).sort((a, b) => fechaDDMMYYYYaISO(b.fechaUltimaActualizacion).localeCompare(fechaDDMMYYYYaISO(a.fechaUltimaActualizacion)));
}

// Historial de movimientos de un material: Control de Precintos solo maneja
// ingresos (cada lote registrado) — las salidas (Asignaciones) ya tienen su
// propio historial en Asignación de Precintos / Reporte de Precintos, así
// que acá no se mezclan. Usado por el modal "Historial" de Control de
// Precintos.
function obtenerHistorialMaterial(material) {
  return PRECINTOS_REGISTROS_DEMO
    .filter(r => r.material === material)
    .map(l => ({
      tipo: 'ingreso', fecha: l.fecha, codigoLote: l.codigo, ingresadoPor: l.ingresadoPor,
      cantidad: l.precintos.length, precintos: [...l.precintos]
    }))
    .sort((a, b) => fechaDDMMYYYYaISO(b.fecha).localeCompare(fechaDDMMYYYYaISO(a.fecha)));
}

// Consolida cada precinto de todos los lotes con su estado real —
// "disponible" (en el lote, sin ninguna Asignación todavía — "Por asignar"
// en Reporte de Precintos), "asignado" (entregado a alguien pero aún sin
// reportarse como usado), "usado" (ya aparece en el Detalle/GRP de alguna
// Asignación) o "scrap" (el operador lo reportó dañado — ver
// ASIGNACIONES_PRECINTOS_DEMO.scrap; manda sobre "usado" si el mismo
// precinto quedó reportado en ambos) — junto con el detalle de esa
// asignación/uso. Es la base de Reporte de Precintos > Por Precinto: tanto
// para consultar dónde/quién usó un precinto puntual como para listar los
// que quedaron sueltos sin reportar.
function obtenerTodosLosPrecintosConEstado() {
  return PRECINTOS_REGISTROS_DEMO.flatMap(lote => lote.precintos.map(precinto => {
    const asignacion = ASIGNACIONES_PRECINTOS_DEMO.find(a => a.precintos.includes(precinto));
    let detalleGrp = null, uso = null, scrapDetalle = null;
    if (asignacion) {
      // Cada Asignación tiene su propio Detalle/GRP (relación 1 a 1).
      detalleGrp = GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.asignacionId === asignacion.id);
      if (detalleGrp) uso = detalleGrp.detalle.find(d => d.precinto === precinto);
      scrapDetalle = asignacion.scrap?.find(s => s.precinto === precinto) || null;
    }
    const estado = scrapDetalle ? 'scrap' : uso ? 'usado' : (asignacion ? 'asignado' : 'disponible');
    return { precinto, registroCodigo: lote.codigo, material: lote.material, asignacion, detalleGrp, uso, scrapDetalle, estado };
  }));
}

// Detalle "Generar Registro" por código de lote (Control de Precintos > Ver
// etiquetas): si el lote tiene más de una Asignación, devuelve la primera;
// para abrir el Detalle exacto de una Asignación puntual usar
// obtenerGenerarRegistroPorAsignacion.
function obtenerGenerarRegistroPorCodigo(codigo) {
  return GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.registroCodigos.includes(codigo));
}

// Detalle "Generar Registro" por Asignación (Reporte de Precintos > Ver):
// identifica sin ambigüedad el Detalle correspondiente, incluso si su lote de
// origen tiene más de una Asignación.
function obtenerGenerarRegistroPorAsignacion(asignacionId) {
  return GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.asignacionId === asignacionId);
}

// Estado de la Asignación: igual que calcularEstadoLote con los lotes, no es
// un campo que se guarde ni se elija a mano — se deriva de su Detalle/GRP.
// "Registrado" mientras nadie reportó ningún uso todavía (recién entregada
// al operador), "En proceso" mientras se fue reportando parte de sus
// precintos (desde la app móvil o el
// respaldo web de Generar Registro) y "Finalizado" cuando ya se reportaron
// todos o el Detalle/GRP quedó cerrado (Revisado + Autorizado) aunque falte
// alguno sin reportar. Usada por Asignación de Precintos (grilla, filtros,
// bloquear Editar/Eliminar una vez hay algo reportado).
function calcularEstadoAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  if (!asignacion) return null;
  const detalleGrp = obtenerGenerarRegistroPorAsignacion(idAsignacion);
  if (!detalleGrp || !detalleGrp.detalle.length) return 'Registrado';
  if (detalleGrp.estado === 'Finalizado' || detalleGrp.detalle.length >= asignacion.cantidad) return 'Finalizado';
  return 'En proceso';
}

// Precintos scrap/dañados de una Asignación: cada uno vive en su propio
// campo "scrap" (ver ASIGNACIONES_PRECINTOS_DEMO) como un objeto {precinto,
// fecha, colaborador, motivo} — lo reporta el operador desde la app móvil
// (ver abrirModalAsignarPrecinto > pestaña "Scrap" en operaciones-movil.js).
function obtenerScrapDeAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  return asignacion?.scrap?.length || 0;
}

// Códigos de precinto de una Asignación marcados como scrap — versión que
// devuelve solo los códigos (no el detalle completo), para las vistas que
// únicamente necesitan señalar cuáles son ("Ver detalle" y "Editar").
function obtenerCodigosScrapDeAsignacion(idAsignacion) {
  const asignacion = obtenerAsignacionPorId(idAsignacion);
  return (asignacion?.scrap || []).map(s => s.precinto);
}

// Precintos de una Asignación que ya tienen su uso reportado en el
// Detalle/GRP (ver GENERAR_REGISTROS_PRECINTOS_DEMO) — igual que los
// marcados como scrap, tampoco se pueden quitar de la Asignación desde
// "Editar": si se quitaran, ese reporte quedaría apuntando a un precinto
// que ya no está en la lista de la Asignación.
function obtenerPrecintosUsadosDeAsignacion(idAsignacion) {
  const detalleGrp = obtenerGenerarRegistroPorAsignacion(idAsignacion);
  return detalleGrp ? detalleGrp.detalle.map(d => d.precinto) : [];
}

// Detalle "Generar Registro" por su código único (GRP-...) — es el
// identificador que usa el modal mientras está abierto (codigoDetalleActivo),
// para no volver a depender de una búsqueda ambigua por lote.
function obtenerGenerarRegistroPorNumero(numero) {
  return GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.numero === numero);
}

// Próximo código correlativo para un nuevo registro, con el mismo formato
// que usa Nominaciones (ej. NOM26000001): prefijo + año de 2 dígitos +
// correlativo de 6 dígitos (ej. PRE26000015).
function generarCodigoRegistroPrecinto() {
  const anio = String(new Date().getFullYear()).slice(-2);
  const nums = PRECINTOS_REGISTROS_DEMO
    .map(r => {
      const match = String(r.codigo).match(/^PRE\d{2}(\d{6})$/);
      return match ? parseInt(match[1], 10) : NaN;
    })
    .filter(n => !isNaN(n));
  const siguiente = (nums.length ? Math.max(...nums) : 0) + 1;
  return `PRE${anio}${String(siguiente).padStart(6, '0')}`;
}

// Próximo código GRP correlativo, mismo formato (ej. GRP26000046).
function generarCodigoGRP() {
  const anio = String(new Date().getFullYear()).slice(-2);
  const nums = GENERAR_REGISTROS_PRECINTOS_DEMO
    .map(r => {
      const match = String(r.numero).match(/^GRP\d{2}(\d{6})$/);
      return match ? parseInt(match[1], 10) : NaN;
    })
    .filter(n => !isNaN(n));
  const siguiente = (nums.length ? Math.max(...nums) : 0) + 1;
  return `GRP${anio}${String(siguiente).padStart(6, '0')}`;
}

// Próximo código de Asignación correlativo, mismo formato (ej. ASG26000004).
function generarCodigoAsignacion() {
  const anio = String(new Date().getFullYear()).slice(-2);
  const nums = ASIGNACIONES_PRECINTOS_DEMO
    .map(a => {
      const match = String(a.codigo).match(/^ASG\d{2}(\d{6})$/);
      return match ? parseInt(match[1], 10) : NaN;
    })
    .filter(n => !isNaN(n));
  const siguiente = (nums.length ? Math.max(...nums) : 0) + 1;
  return `ASG${anio}${String(siguiente).padStart(6, '0')}`;
}

// Crea el Reporte de Precintos de una Asignación (y su Detalle/GRP vacío) la
// primera vez que se guarda — antes de esto ninguno de los dos existía en
// ningún lado: Reporte de Precintos no lo mostraba y el operario no podía
// registrar nada desde el móvil para esa Asignación (abrirModalAsignarPrecinto
// en operaciones-movil.js mostraba "sin datos" al no encontrar su Detalle).
// Si ya existen (se está editando la misma Asignación), no hace nada — cada
// Asignación tiene un único Reporte/Detalle propio.
function asegurarReportePrecinto(asignacionId, registroCodigos) {
  const hoy = fechaISOaDDMMYYYY(new Date().toISOString().slice(0, 10));

  if (!obtenerGenerarRegistroPorAsignacion(asignacionId)) {
    GENERAR_REGISTROS_PRECINTOS_DEMO.unshift({
      registroCodigos: [...registroCodigos], numero: generarCodigoGRP(), fechaEmision: hoy,
      fechaInicio: hoy, fechaFin: '', asignacionId, estado: 'Pendiente',
      detalle: []
    });
  }

  if (!REPORTES_PRECINTOS_DEMO.some(r => r.asignacionId === asignacionId)) {
    const siguienteId = REPORTES_PRECINTOS_DEMO.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    REPORTES_PRECINTOS_DEMO.unshift({ id: siguienteId, asignacionId, fechaInicio: hoy, fechaFin: '', estado: 'pendiente' });
  }
}

