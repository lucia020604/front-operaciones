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
  { codigo: 'PRE26000014', fecha: '20/08/2026', estado: 'Registrado', material: 'Plástico',
    precintos: ['A-10021', 'A-10022', 'A-10023', 'A-10024', 'A-10025'] },

  { codigo: 'PRE26000013', fecha: '15/08/2026', estado: 'Registrado', material: 'Plástico',
    precintos: ['A-10001', 'A-10002', 'A-10003', 'A-10004', 'A-10005', 'A-10006', 'A-10007', 'A-10008', 'A-10009', 'A-10010'] },

  { codigo: 'PRE26000012', fecha: '02/08/2026', estado: 'Finalizado', material: 'Circular',
    precintos: ['A-09950', 'A-09951', 'A-09952', 'A-09953'] },

  { codigo: 'PRE26000011', fecha: '20/07/2026', estado: 'Finalizado', material: 'Metálico',
    precintos: ['A-09900', 'A-09901', 'A-09902', 'A-09903', 'A-09904', 'A-09905'] }
];

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
// respectivamente. "estado" es 'Registrada' o 'Anulada' (ver
// anularAsignacionPrecinto en control-precintos.js); una Asignación anulada
// conserva su historial pero no admite más cambios.
const ASIGNACIONES_PRECINTOS_DEMO = [
  { id: 1, codigo: 'ASG26000001', registroCodigos: ['PRE26000013'], fecha: '16/08/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'j.gomez',
    precintos: ['A-10001', 'A-10002', 'A-10003', 'A-10004', 'A-10005', 'A-10006', 'A-10007', 'A-10008', 'A-10009', 'A-10010'],
    cantidad: 10, estado: 'Registrada',
    motivo: 'Servicio de descarga M/N Megara', observaciones: '' },

  { id: 2, codigo: 'ASG26000002', registroCodigos: ['PRE26000011'], fecha: '21/07/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'e.allccaco',
    precintos: ['A-09900', 'A-09901', 'A-09902'],
    cantidad: 3, estado: 'Registrada',
    motivo: 'Servicio de carga M/N Stena Impression', observaciones: 'Entrega parcial, saldo en almacén.' },

  { id: 3, codigo: 'ASG26000003', registroCodigos: ['PRE26000011'], fecha: '21/07/2026',
    entregadoPor: 's.echavarria', recibidoPor: 'r.bravo',
    precintos: ['A-09903', 'A-09904', 'A-09905'],
    cantidad: 3, estado: 'Registrada',
    motivo: 'Servicio de carga M/N Stena Impression', observaciones: 'Entrega parcial, saldo en almacén.' }
];

// Grilla de "Reporte de Precintos" (Precintos > Reporte de Precintos).
// Un Reporte de Precintos solo existe si su Asignación ya quedó registrada
// (ver asegurarReportePrecinto más abajo, disparada desde
// guardarAsignacionPrecintos en control-precintos.js) — por eso no hay acá
// una Asignación "suelta" sin ningún Detalle detrás; eso dejaría el código
// GRP y el supervisor de la grilla sin nada que mostrar.
const REPORTES_PRECINTOS_DEMO = [
  { id: 1, asignacionId: 1, fechaInicio: '16/08/2026', fechaFin: '', estado: 'pendiente' },
  { id: 2, asignacionId: 2, fechaInicio: '21/07/2026', fechaFin: '25/07/2026', estado: 'finalizado' },
  { id: 3, asignacionId: 3, fechaInicio: '21/07/2026', fechaFin: '25/07/2026', estado: 'finalizado' }
];

// "Generar Registro de Precintos" (Detalle): registros de uso de precintos
// por Asignación, uno por operario (campo "colaborador" — el que realmente
// usó/cerró ese precinto, no una pareja fija), cargados desde la app móvil o
// desde el formulario "Agregar uso de precinto" de este mismo Detalle
// (respaldo web mientras no haya o falle la app), a la espera de
// Revisado/Autorizado. Cada Asignación (ver ASIGNACIONES_PRECINTOS_DEMO)
// genera un único Detalle propio — relación 1 a 1 (campo "asignacionId") —
// aunque comparta alguno de los "registroCodigos" de los lotes de origen (un
// Detalle puede tener precintos de más de un lote, si la Asignación mezcló
// varios). "numero" (código GRP) es el identificador único de cada Detalle.
//
// Flujo de firmas (ninguna se pone sola, siempre es una acción explícita de
// alguien): Revisado (Jefe inmediato) → Autorizado (Gerente de Área) → recién
// ahí se puede Finalizar. "operarioFirmaPor"/"operarioFirmaFecha" es una
// cuarta confirmación aparte, del operario que usó los precintos: al
// Finalizar se le notifica en la app móvil para que revise el registro ya
// cerrado y firme ahí (fuera del alcance de esta fase el firmarlo desde la
// web); una vez firma, recién se envía por correo el registro para
// descargar. No bloquea Finalizar — es un paso posterior, no un requisito.
const GENERAR_REGISTROS_PRECINTOS_DEMO = [
  { registroCodigos: ['PRE26000013'], numero: 'GRP26000045', fechaEmision: '17/08/2026',
    fechaInicio: '16/08/2026', fechaFin: '', asignacionId: 1, estado: 'Pendiente',
    detalle: [
      { colaborador: 'j.gomez', precinto: 'A-10001', viaje: 'V-2201', fecha: '16/08/2026', observacion: '' },
      { colaborador: 'j.gomez', precinto: 'A-10002', viaje: 'V-2201', fecha: '16/08/2026', observacion: '' },
      { colaborador: 'j.gomez', precinto: 'A-10003', viaje: 'V-2202', fecha: '17/08/2026', observacion: 'Precinto reemplazado por rotura' }
    ],
    revisadoPor: null, revisadoFecha: null, autorizadoPor: null, autorizadoFecha: null,
    operarioFirmaPor: null, operarioFirmaFecha: null },

  { registroCodigos: ['PRE26000011'], numero: 'GRP26000038', fechaEmision: '26/07/2026',
    fechaInicio: '21/07/2026', fechaFin: '25/07/2026', asignacionId: 2, estado: 'Finalizado',
    detalle: [
      { colaborador: 'e.allccaco', precinto: 'A-09900', viaje: 'V-2150', fecha: '21/07/2026', observacion: '' },
      { colaborador: 'e.allccaco', precinto: 'A-09901', viaje: 'V-2150', fecha: '22/07/2026', observacion: '' }
    ],
    // A-09902 quedó en esta Asignación (ver ASIGNACIONES_PRECINTOS_DEMO id 2)
    // pero nunca se reportó como usado — se deja así a propósito: es el caso
    // real que el aviso "Sin reportar" de mostrarDetalleRegistro debe mostrar
    // aunque el Detalle ya esté Finalizado.
    revisadoPor: 'j.ramos', revisadoFecha: '25/07/2026 14:20', autorizadoPor: 'm.rojas', autorizadoFecha: '25/07/2026 17:05',
    // Ejemplo de flujo completo: el operario ya revisó y firmó desde el
    // móvil, así que acá el registro queda disponible para descargar.
    operarioFirmaPor: 'e.allccaco', operarioFirmaFecha: '26/07/2026 09:15' },

  // Otra Asignación del mismo lote de origen (PRE26000011) pero para otro
  // receptor: demuestra que cada Asignación conserva su propio Detalle, con
  // sus propios colaboradores, precintos utilizados y firmas.
  { registroCodigos: ['PRE26000011'], numero: 'GRP26000039', fechaEmision: '26/07/2026',
    fechaInicio: '21/07/2026', fechaFin: '25/07/2026', asignacionId: 3, estado: 'Finalizado',
    detalle: [
      { colaborador: 'r.bravo', precinto: 'A-09903', viaje: 'V-2151', fecha: '23/07/2026', observacion: '' }
    ],
    revisadoPor: 'j.ramos', revisadoFecha: '25/07/2026 14:25', autorizadoPor: 'm.rojas', autorizadoFecha: '25/07/2026 17:07',
    // Ejemplo de flujo a mitad de camino: ya Finalizado (Revisado +
    // Autorizado), pero el operario todavía no confirmó su firma en el móvil.
    operarioFirmaPor: null, operarioFirmaFecha: null }
];

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
// del registro. "Anulado" es la única excepción — es una decisión manual del
// supervisor (ver anularRegistroPrecinto en control-precintos.js), así que sí
// se guarda tal cual. Usada por Control de Precintos (grilla, filtros) y por
// Asignación de Precintos (excluir lotes anulados al elegir de dónde asignar).
function calcularEstadoLote(codigo) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return null;
  // "Anulado" y "Finalizado" son cierres definitivos que ya se guardan en el
  // dato: el primero lo pone anularRegistroPrecinto, el segundo ya lo ponía
  // finalizarGenerarRegistro (generar-registro-precintos.js) cuando todas las
  // Asignaciones del lote quedan Revisadas/Autorizadas — se respeta esa
  // lógica en vez de volver a derivarla acá para no terminar con dos
  // criterios distintos.
  if (registro.estado === 'Anulado' || registro.estado === 'Finalizado') return registro.estado;

  const tieneAsignaciones = ASIGNACIONES_PRECINTOS_DEMO.some(a => a.registroCodigos.includes(codigo));
  if (!tieneAsignaciones) return 'Registrado';

  return obtenerPrecintosDisponiblesDeLote(codigo).length > 0 ? 'Parcialmente asignado' : 'Asignado';
}

// Consolida cada precinto de todos los lotes con su estado real —
// "disponible" (en el lote, sin ninguna Asignación todavía), "asignado"
// (entregado a alguien pero aún sin reportarse como usado) o "usado" (ya
// aparece en el Detalle/GRP de algún PER) — junto con el detalle de esa
// asignación/uso. Es la base de Reporte de Precintos > Por Precinto: tanto
// para consultar dónde/quién usó un precinto puntual como para listar los
// que quedaron sueltos sin reportar.
function obtenerTodosLosPrecintosConEstado() {
  return PRECINTOS_REGISTROS_DEMO.flatMap(lote => lote.precintos.map(precinto => {
    const asignacion = ASIGNACIONES_PRECINTOS_DEMO.find(a => a.precintos.includes(precinto));
    let detalleGrp = null, uso = null;
    if (asignacion) {
      // Cada Asignación tiene su propio Detalle/GRP (relación 1 a 1).
      detalleGrp = GENERAR_REGISTROS_PRECINTOS_DEMO.find(r => r.asignacionId === asignacion.id);
      if (detalleGrp) uso = detalleGrp.detalle.find(d => d.precinto === precinto);
    }
    const estado = uso ? 'usado' : (asignacion ? 'asignado' : 'disponible');
    return { precinto, registroCodigo: lote.codigo, material: lote.material, asignacion, detalleGrp, uso, estado };
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
      detalle: [],
      revisadoPor: null, revisadoFecha: null, autorizadoPor: null, autorizadoFecha: null,
      operarioFirmaPor: null, operarioFirmaFecha: null
    });
  }

  if (!REPORTES_PRECINTOS_DEMO.some(r => r.asignacionId === asignacionId)) {
    const siguienteId = REPORTES_PRECINTOS_DEMO.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    REPORTES_PRECINTOS_DEMO.unshift({ id: siguienteId, asignacionId, fechaInicio: hoy, fechaFin: '', estado: 'pendiente' });
  }
}
