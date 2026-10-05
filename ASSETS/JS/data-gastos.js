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
// generado por un colaborador (vía app móvil, fuera de esta fase). No hay
// aprobación/estado: el colaborador registra desde el móvil y el supervisor
// puede modificarlo en cualquier momento (ver "Editar" en la grilla) — no
// hace falta que nadie lo "revise" ni "confirme" para que quede válido.
// Cada operador tiene sus 3 reportes por período (Alimentos/Movilidad/Días a
// Bordo). Los 3 usuarios (e.allccaco, r.bravo, j.gomez) existen en
// USUARIOS_DEMO para que la firma/nombre se resuelva bien en los 3 detalles.
// "periodoCodigo" identifica de forma única a un operador+período (mismo
// código compartido por sus 3 tipos) — reemplaza la clave armada por
// concatenación (nombre+apellido+fechas) que se usaba antes para agrupar,
// que era un buen approximation pero no un identificador real. Se genera
// con generarCodigoPeriodoGasto() al crear el período (ver asegurarReporteGasto).
// Períodos 10→09 (Sprint 4 §1.1): e.allccaco/j.gomez caen en el período de
// agosto-septiembre 2026 (sus usos de precintos reales están ahí, ver
// data-precintos.js); r.bravo en julio-agosto 2026.
const GASTOS_OPERATIVOS_SEED = [
  { id: 1, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '10/08/2026', fechaHasta: '09/09/2026', tipo: 'Alimentos' },
  { id: 2, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '10/08/2026', fechaHasta: '09/09/2026', tipo: 'Movilidad' },
  { id: 5, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '10/08/2026', fechaHasta: '09/09/2026', tipo: 'Días a Bordo' },
  { id: 6, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '10/08/2026', fechaHasta: '09/09/2026', tipo: 'Alimentos' },
  { id: 7, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '10/08/2026', fechaHasta: '09/09/2026', tipo: 'Movilidad' },
  { id: 3, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '10/08/2026', fechaHasta: '09/09/2026', tipo: 'Días a Bordo' },
  { id: 4, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '10/07/2026', fechaHasta: '09/08/2026', tipo: 'Alimentos' },
  { id: 8, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '10/07/2026', fechaHasta: '09/08/2026', tipo: 'Movilidad' },
  { id: 9, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '10/07/2026', fechaHasta: '09/08/2026', tipo: 'Días a Bordo' }
];
// Persistido (Sprint 4 Fase 2, §6): un gasto registrado desde el móvil debe
// verse en la web sin recargar nada a mano — antes estas 5 estructuras eran
// un simple array/objeto en memoria, se perdían al navegar entre páginas
// (cada una con su propio contexto de JS) y nunca llegaban de un lado al
// otro. Mismo mecanismo que ya usa Precintos (tgCargarCatalogo/tgGuardarCatalogo).
const GASTOS_OPERATIVOS_DEMO = tgCargarCatalogo('gastosOperativosData', GASTOS_OPERATIVOS_SEED);

// Datos comunes de encabezado por colaborador (Nombre y apellidos, Cargo,
// Doc. Identidad, Área) — ingresados por el colaborador desde la app móvil
// (ver asegurarEncabezadoColaboradorGastos). Se repite entre los 3 ids del
// mismo operador (el modelo guarda esto por reporte, no por persona). No
// incluye Centro de costo: ese dato no se registra en ningún lado del
// sistema todavía.
const COLABORADOR_GASTOS_SEED = {
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
const COLABORADOR_GASTOS_DEMO = tgCargarCatalogo('colaboradorGastosData', COLABORADOR_GASTOS_SEED);

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
const DETALLE_ALIMENTOS_SEED = {
  1: {
    numero: 'RA26000031', fechaEmision: '10/08/2026', montoMaximo: 45.00,
    fechaInicio: '10/08/2026', fechaFin: '09/09/2026',
    grilla: [
      { fecha: '16/08/2026', comida: 'Desayuno', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:30 am', costo: 8.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '16/08/2026', comida: 'Almuerzo', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '13:00 pm', costo: 18.00, evidencia: ['Evidencia 1', 'Evidencia 2'], sinSustento: false },
      { fecha: '17/08/2026', comida: 'Desayuno', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:15 am', costo: 8.00, evidencia: [], sinSustento: true },
      { fecha: '17/08/2026', comida: 'Almuerzo', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '13:10 pm', costo: 20.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'e.allccaco'
  },
  6: {
    numero: 'RA26000032', fechaEmision: '10/08/2026', montoMaximo: 45.00,
    fechaInicio: '10/08/2026', fechaFin: '09/09/2026',
    grilla: [
      { fecha: '10/08/2026', comida: 'Desayuno', lugar: 'Pisco', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:00 am', costo: 8.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '10/08/2026', comida: 'Cena', lugar: 'Pisco', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '20:15 pm', costo: 15.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'j.gomez'
  },
  4: {
    numero: 'RA26000033', fechaEmision: '10/07/2026', montoMaximo: 45.00,
    fechaInicio: '10/07/2026', fechaFin: '09/08/2026',
    grilla: [
      { fecha: '21/07/2026', comida: 'Almuerzo', lugar: 'Callao', cliente: 'Consorcio Terminales', operacionPer: 'PER/09463-25', hora: '12:30 pm', costo: 22.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '22/07/2026', comida: 'Almuerzo', lugar: 'Callao', cliente: 'Consorcio Terminales', operacionPer: 'PER/09463-25', hora: '12:40 pm', costo: 22.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'r.bravo'
  }
};
const DETALLE_ALIMENTOS_DEMO = tgCargarCatalogo('detalleAlimentosData', DETALLE_ALIMENTOS_SEED);

// Detalle "Editar y Revisar Registro de Movilidad" — una fila por traslado
// ("Movilidad 1", "Movilidad 2"... del app), con la misma evidencia/"sin
// sustento" que Alimentos.
const DETALLE_MOVILIDAD_SEED = {
  2: {
    numero: 'RM26000018', fechaEmision: '10/08/2026', montoMaximo: 60.00,
    fechaInicio: '10/08/2026', fechaFin: '09/09/2026',
    grilla: [
      { fecha: '16/08/2026', empresa: 'Taxi Seguro Supe', distritoPartida: 'Supe Puerto', distritoDestino: 'Supe', motivo: 'Traslado a muelle', importeDia: 15.00, totalDia: 15.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '18/08/2026', empresa: 'Taxi Seguro Supe', distritoPartida: 'Supe', distritoDestino: 'Supe Puerto', motivo: 'Traslado a operación', importeDia: 15.00, totalDia: 15.00, evidencia: [], sinSustento: true }
    ],
    firmaTrabajador: 'e.allccaco'
  },
  7: {
    numero: 'RM26000019', fechaEmision: '10/08/2026', montoMaximo: 60.00,
    fechaInicio: '10/08/2026', fechaFin: '09/09/2026',
    grilla: [
      { fecha: '11/08/2026', empresa: 'Taxi Seguro Pisco', distritoPartida: 'Pisco', distritoDestino: 'Terminal Portuario', motivo: 'Traslado a operación', importeDia: 14.00, totalDia: 14.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'j.gomez'
  },
  8: {
    numero: 'RM26000020', fechaEmision: '10/07/2026', montoMaximo: 60.00,
    fechaInicio: '10/07/2026', fechaFin: '09/08/2026',
    grilla: [
      { fecha: '21/07/2026', empresa: 'Transportes Callao', distritoPartida: 'Callao', distritoDestino: 'Terminal Portuario', motivo: 'Traslado a muelle', importeDia: 18.00, totalDia: 18.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'r.bravo'
  }
};
const DETALLE_MOVILIDAD_DEMO = tgCargarCatalogo('detalleMovilidadData', DETALLE_MOVILIDAD_SEED);

// Detalle "Ver Registro de Días a Bordo" (sin evidencia ni Monto Máximo: ya
// no se registra a mano — Sprint 4 §1.2, "grilla" se regenera sola a partir
// de las operaciones reales del operador y la configuración vigente, ver
// regenerarDiasABordo más arriba). "overrides" guarda los ajustes/exclusiones
// puntuales del supervisor por fecha (dd/mm/yyyy) — sobreviven a la
// regeneración; "grilla" arranca vacía y se llena la primera vez que se abre
// o descarga el reporte.
const DETALLE_DIAS_A_BORDO_SEED = {
  5: { numero: 'RD26000010', fechaEmision: '10/08/2026', fechaInicio: '10/08/2026', fechaFin: '09/09/2026', grilla: [], overrides: {}, firmaTrabajador: 'e.allccaco' },
  3: { numero: 'RD26000009', fechaEmision: '10/08/2026', fechaInicio: '10/08/2026', fechaFin: '09/09/2026', grilla: [], overrides: {}, firmaTrabajador: 'j.gomez' },
  9: { numero: 'RD26000011', fechaEmision: '10/07/2026', fechaInicio: '10/07/2026', fechaFin: '09/08/2026', grilla: [], overrides: {}, firmaTrabajador: 'r.bravo' }
};
const DETALLE_DIAS_A_BORDO_DEMO = tgCargarCatalogo('detalleDiasABordoData', DETALLE_DIAS_A_BORDO_SEED);

function obtenerGastoPorId(id) {
  return GASTOS_OPERATIVOS_DEMO.find(g => g.id === Number(id));
}

// Persiste las 5 estructuras del módulo (mismo mecanismo que
// guardarEstadoPrecintos) — se llama explícitamente al final de cada acción
// que crea/edita algo (asegurarReporteGasto, registrar un gasto desde el
// móvil, editar un monto desde la web) y además una vez más al salir de la
// página como red de seguridad.
function guardarEstadoGastos() {
  tgGuardarCatalogo('gastosOperativosData', GASTOS_OPERATIVOS_DEMO);
  tgGuardarCatalogo('colaboradorGastosData', COLABORADOR_GASTOS_DEMO);
  tgGuardarCatalogo('detalleAlimentosData', DETALLE_ALIMENTOS_DEMO);
  tgGuardarCatalogo('detalleMovilidadData', DETALLE_MOVILIDAD_DEMO);
  tgGuardarCatalogo('detalleDiasABordoData', DETALLE_DIAS_A_BORDO_DEMO);
}
window.addEventListener('beforeunload', guardarEstadoGastos);

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

// Período de Gastos = del 10 de un mes al 09 del mes siguiente (Sprint 4,
// §1.1) — ya no mes calendario. El día 10 ABRE el período siguiente (una
// fecha de referencia con día < 10 todavía cae en el período que abrió el
// 10 del mes anterior). Alimentos, Movilidad y Días a Bordo usan esta misma
// regla (ver asegurarReporteGasto) para compartir periodoCodigo.
function primerYUltimoDiaDelMes(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const pad = n => String(n).padStart(2, '0');

  let anioInicio = anio, mesInicio = mes;
  if (dia < 10) {
    mesInicio -= 1;
    if (mesInicio === 0) { mesInicio = 12; anioInicio -= 1; }
  }
  let mesFin = mesInicio + 1, anioFin = anioInicio;
  if (mesFin === 13) { mesFin = 1; anioFin += 1; }

  return {
    primero: `10/${pad(mesInicio)}/${anioInicio}`,
    ultimo: `09/${pad(mesFin)}/${anioFin}`
  };
}

// Quincena a la que pertenece una fecha dd/mm/yyyy dentro de un período
// 10→09: 1 = días 10 al 25, 2 = días 26 al 09 (del mes siguiente) — usada
// para partir la descarga de Días a Bordo en sus 2 tablas (ver
// construirHojaExcelDiasABordo/construirHTMLReporteGastos, §1.3).
function quincenaDeFecha(fechaDDMMYYYY) {
  const dia = parseInt(fechaDDMMYYYY.split('/')[0], 10);
  return (dia >= 10 && dia <= 25) ? 1 : 2;
}

// Corte de quincena del período 10→09 (se paga dos veces: 10→25 y 26→09,
// ver §1.3 "Hoja por quincena"). "fechaDesdeDDMMYYYY" es el inicio del
// período completo (el "10"); devuelve los 2 rangos en ISO.
function quincenasDelPeriodo(fechaDesdeDDMMYYYY, fechaHastaDDMMYYYY) {
  const [diaIni, mesIni, anioIni] = fechaDesdeDDMMYYYY.split('/').map(Number);
  const pad = n => String(n).padStart(2, '0');
  const mitad = `${anioIni}-${pad(mesIni)}-25`;
  const mitadInicio = `${anioIni}-${pad(mesIni)}-26`;
  return {
    primeraQuincena: { desde: fechaDDMMYYYYaISO(fechaDesdeDDMMYYYY), hasta: mitad },
    segundaQuincena: { desde: mitadInicio, hasta: fechaDDMMYYYYaISO(fechaHastaDDMMYYYY) }
  };
}

// Se dispara la primera vez que un operador queda asignado a una operación
// (ver guardarAsignacionPrecintos en control-precintos.js: se llama junto
// con asegurarReportePrecinto, mismo momento en que el operador "empieza a
// registrar los precintos y gastos que realizó"). Crea sus 3 reportes
// (Alimentos/Movilidad/Días a Bordo) vacíos para el mes calendario de
// "fechaReferenciaISO" (normalmente hoy), listos para que el app vaya
// cargando lo que el operador reporte. Si el operador ya tiene reportes
// abiertos para ese mismo mes, no hace nada (evita duplicar si aparece en
// más de una Asignación dentro del mismo mes).
// Cargo/Doc. Identidad desde el perfil del colaborador (Fase 2 móvil, §2) —
// Doc. Identidad reutiliza el DNI que ya carga Precintos en el móvil
// (PERFIL_MOVIL_EXTRA_DEMO, data-movil.js, si esa página lo tiene cargado);
// Cargo se infiere del rol del usuario. Solo rellena los ids que todavía no
// tengan datos — nunca pisa lo que ya exista.
function asegurarEncabezadoColaboradorGastos(ids, operadorUsuario) {
  const u = obtenerUsuarioPorNombre(operadorUsuario);
  const rol = u ? obtenerRolPorId(u.rolId) : null;
  const dni = (typeof PERFIL_MOVIL_EXTRA_DEMO !== 'undefined' && PERFIL_MOVIL_EXTRA_DEMO[operadorUsuario]) ? PERFIL_MOVIL_EXTRA_DEMO[operadorUsuario].dni : '';
  ids.forEach(id => {
    if (!COLABORADOR_GASTOS_DEMO[id]) {
      COLABORADOR_GASTOS_DEMO[id] = { cargo: rol ? rol.nombre : '', docIdentidad: dni || '' };
    }
  });
}

// Devuelve (creando si hace falta) los 3 reportes del período 10→09 de
// "fechaReferenciaISO" para este operador — { periodoCodigo, ids: {tipo:id},
// fechaDesde, fechaHasta }. Idéntico resultado si ya existían (no duplica):
// el móvil lo llama cada vez que abre Gastos para resolver "en qué id
// guardar" sin tener que recordar nada entre sesiones.
function asegurarReporteGasto(operadorUsuario, fechaReferenciaISO) {
  const { primero: fechaDesde, ultimo: fechaHasta } = primerYUltimoDiaDelMes(fechaReferenciaISO);

  // Identifica al dueño por firmaTrabajador del Detalle (igual criterio que
  // agruparGastosPorOperador/prepararDescargaGastos), no por g.operador —
  // los 3 operadores de ejemplo del seed nunca tuvieron ese campo poblado.
  const existentes = GASTOS_OPERATIVOS_DEMO.filter(g => {
    if (g.fechaDesde !== fechaDesde || g.fechaHasta !== fechaHasta) return false;
    const detalle = obtenerDetalleGastoPorTipo(g.tipo, g.id);
    return detalle && detalle.firmaTrabajador === operadorUsuario;
  });
  if (existentes.length === 3) {
    const ids = {};
    existentes.forEach(g => { ids[g.tipo] = g.id; });
    asegurarEncabezadoColaboradorGastos(Object.values(ids), operadorUsuario);
    return { periodoCodigo: existentes[0].periodoCodigo, ids, fechaDesde, fechaHasta };
  }

  const u = obtenerUsuarioPorNombre(operadorUsuario);
  const nombre = u ? u.nombre : operadorUsuario;
  const apellido = u ? u.apellido : '';
  const hoy = fechaISOaDDMMYYYY(new Date().toISOString().slice(0, 10));

  // Días a Bordo ya no tiene Monto Máximo (§1.1: no aplica, se quitó de la
  // UI) ni montoMaximoPorTipo para ese tipo.
  const montoMaximoPorTipo = {
    'Alimentos': LIMITES_GASTOS_DEMO.alimentos.montoMaximoDia,
    'Movilidad': LIMITES_GASTOS_DEMO.movilidad.montoMaximoDia
  };

  // Un único código de período para los 3 (no uno por tipo: identifica al
  // operador+mes como conjunto, ver generarCodigoPeriodoGasto).
  const periodoCodigo = generarCodigoPeriodoGasto();
  const ids = {};

  ['Alimentos', 'Movilidad', 'Días a Bordo'].forEach(tipo => {
    const nuevoId = (Math.max(0, ...GASTOS_OPERATIVOS_DEMO.map(g => g.id)) || 0) + 1;
    GASTOS_OPERATIVOS_DEMO.unshift({
      id: nuevoId, periodoCodigo, operador: operadorUsuario, nombre, apellido, area: 'Operaciones',
      fechaDesde, fechaHasta, tipo
    });

    const fuente = tipo === 'Alimentos' ? DETALLE_ALIMENTOS_DEMO : tipo === 'Movilidad' ? DETALLE_MOVILIDAD_DEMO : DETALLE_DIAS_A_BORDO_DEMO;
    fuente[nuevoId] = {
      numero: generarCodigoReporteGasto(tipo), fechaEmision: hoy, montoMaximo: montoMaximoPorTipo[tipo],
      fechaInicio: fechaDesde, fechaFin: fechaHasta,
      grilla: [],
      firmaTrabajador: operadorUsuario,
      ...(tipo === 'Días a Bordo' ? { overrides: {} } : {})
    };
    ids[tipo] = nuevoId;
  });

  asegurarEncabezadoColaboradorGastos(Object.values(ids), operadorUsuario);
  guardarEstadoGastos();
  return { periodoCodigo, ids, fechaDesde, fechaHasta };
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
// Sprint 4 §1.1: Días a Bordo deja de ser "rangos por día de semana" +
// "Días Especiales en soles" — pasa a 2 conceptos fijos (Día a bordo S/50,
// Domingo laborado S/90, igual en Lima o provincia) + "Feriados especiales"
// en dólares (tipo de cambio del día, ya resuelto por TIPOS_CAMBIO_FERIADOS_DEMO).
// Persistido (tgCargarCatalogo/tgGuardarCatalogo) para que una edición de
// tarifas sobreviva a un recargo de página y se vea igual en todas las
// pestañas — antes esta config vivía solo en memoria.
const LIMITES_GASTOS_SEED = {
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
    // "MONTOS ESTABLECIDOS" de la plantilla Resumen Total: Día a bordo S/50
    // cualquier día normal; Domingo laborado S/90 (Lima o provincia, mismo
    // monto — el Resumen Total solo las separa en columnas distintas).
    diaNormal: 50.00, montoAnteriorDiaNormal: 50.00,
    domingo: 90.00, montoAnteriorDomingo: 90.00,
    // "Feriados especiales" (US$70, tipo de cambio del día): Año Nuevo, Día
    // del Trabajo, Fiestas Patrias y Navidad — acordados en la reunión.
    feriadosEspeciales: [
      { id: 1, dia: 1, mes: 1, montoUSD: 70.00 },
      { id: 2, dia: 1, mes: 5, montoUSD: 70.00 },
      { id: 3, dia: 28, mes: 7, montoUSD: 70.00 },
      { id: 4, dia: 25, mes: 12, montoUSD: 70.00 }
    ]
  }
};
const LIMITES_GASTOS_DEMO = tgCargarCatalogo('limitesGastosData', LIMITES_GASTOS_SEED);
function guardarLimitesGastos() { tgGuardarCatalogo('limitesGastosData', LIMITES_GASTOS_DEMO); }

// Roles habilitados para registrar el tipo de cambio de un Feriado Especial
// ("permiso especial" del pedido original) — mismo criterio que ya usa
// Asignación de Precintos para distinguir Supervisor/Inspector (ver
// obtenerRolPorNombre), no una tabla de permisos nueva.
const ROLES_TIPO_CAMBIO_FERIADO = ['Supervisor', 'Jefe de Área', 'Gerente de Laboratorio', 'Administrador'];

function usuarioPuedeRegistrarTipoCambio(usuario) {
  const u = obtenerUsuarioPorNombre(usuario);
  if (!u) return false;
  return obtenerIdsRolesUsuario(u).some(id => {
    const rol = obtenerRolPorId(id);
    return rol && ROLES_TIPO_CAMBIO_FERIADO.includes(rol.nombre);
  });
}

// Historial de tipos de cambio registrados para los Feriados Especiales —
// un renglón por cada ocurrencia real (con año) ya registrada, nunca de
// antemano: "solo se agrega una vez" y el mismo día que ocurre, con el tipo
// de cambio vigente ese día (ver registrarTipoCambioFeriadoEspecial).
const TIPOS_CAMBIO_FERIADOS_SEED = [
  { id: 1, fecha: '28/07/2026', tipoCambio: 3.75, montoUSD: 70.00, montoSoles: 262.50, agregadoPor: 'j.ramos' }
];
const TIPOS_CAMBIO_FERIADOS_DEMO = tgCargarCatalogo('tiposCambioFeriadosData', TIPOS_CAMBIO_FERIADOS_SEED);

function guardarTiposCambioFeriados() {
  tgGuardarCatalogo('tiposCambioFeriadosData', TIPOS_CAMBIO_FERIADOS_DEMO);
}

// ¿Hoy es un Feriado Especial configurado y todavía no tiene su tipo de
// cambio registrado? Si es así, genera (o mantiene) la alerta para que la
// persona con permiso lo registre; si ya se registró o dejó de ser feriado
// especial (se quitó de la config), retira la alerta. Se llama al cargar
// Registro de Gastos Operativos — mismo patrón que el resto del sistema usa
// para notificaciones grupales que se recalculan en cada carga (ver
// notifUpsertar en main.js).
function fechaHoyDDMMYYYY() {
  const hoy = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(hoy.getDate())}/${pad(hoy.getMonth() + 1)}/${hoy.getFullYear()}`;
}

function obtenerFeriadoEspecialDeHoy() {
  const hoy = new Date();
  const dia = hoy.getDate(), mes = hoy.getMonth() + 1;
  return LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.find(f => f.dia === dia && f.mes === mes) || null;
}

function obtenerTipoCambioDeHoy() {
  return TIPOS_CAMBIO_FERIADOS_DEMO.find(t => t.fecha === fechaHoyDDMMYYYY()) || null;
}

function actualizarAlertaFeriadoEspecial() {
  const esFeriadoEspecialHoy = obtenerFeriadoEspecialDeHoy();
  const yaRegistrado = obtenerTipoCambioDeHoy();

  if (esFeriadoEspecialHoy && !yaRegistrado) {
    notifUpsertar({
      id: 'feriado-especial-tipo-cambio',
      tipo: 'feriadoEspecial',
      prioridad: 'por_vencer',
      titulo: 'Hoy es un Feriado Especial',
      mensaje: 'Falta registrar el tipo de cambio de hoy en Registro de Gastos Operativos > Configuración.',
      url: 'registro-gastos-operativos.html'
    });
  } else {
    notifEliminar('feriado-especial-tipo-cambio');
  }
}

// Registra el tipo de cambio de HOY para el Feriado Especial de hoy — queda
// bloqueado de inmediato (no hay "editar" ni "quitar" para estos renglones,
// a diferencia de "Días Especiales"): es un registro histórico de lo que
// efectivamente rigió ese día, no un valor configurable que se pueda
// corregir después. El monto a pagar ese día está en dólares (montoUSD, ver
// feriadosEspeciales) — acá se calcula y se guarda también el equivalente en
// soles (montoUSD × tipoCambio) ya resuelto, para que quede fijo aunque el
// monto en dólares configurado cambie más adelante.
function registrarTipoCambioFeriadoEspecial(tipoCambio, usuario) {
  const feriado = obtenerFeriadoEspecialDeHoy();
  if (!feriado) return { ok: false, motivo: 'Hoy no es un Feriado Especial configurado.' };
  if (obtenerTipoCambioDeHoy()) return { ok: false, motivo: 'El tipo de cambio de hoy ya fue registrado.' };
  if (!usuarioPuedeRegistrarTipoCambio(usuario)) return { ok: false, motivo: 'No tienes permiso para registrar el tipo de cambio.' };

  const nuevoId = (Math.max(0, ...TIPOS_CAMBIO_FERIADOS_DEMO.map(t => t.id)) || 0) + 1;
  const montoUSD = feriado.montoUSD;
  const montoSoles = Math.round(montoUSD * tipoCambio * 100) / 100;
  TIPOS_CAMBIO_FERIADOS_DEMO.unshift({ id: nuevoId, fecha: fechaHoyDDMMYYYY(), tipoCambio, montoUSD, montoSoles, agregadoPor: usuario });
  guardarTiposCambioFeriados();
  actualizarAlertaFeriadoEspecial();
  return { ok: true };
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const MESES_GASTOS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/* =================================================
   DÍAS A BORDO — AUTOMÁTICO (Sprint 4 §1.2)
   Ya no se registra a mano: se genera solo a partir de la configuración
   (tarifas, domingos, feriados especiales + tipo de cambio) y de las
   operaciones reales que el operador ya tiene en el sistema. Nunca inventa
   un dato: si algo no existe en la fuente real, queda vacío/"—".
================================================= */

// Monto de UN día puntual (fechaISO: yyyy-mm-dd) — única función que usan el
// Detalle, la descarga y el Resumen Total, para no calcular esto en más de
// un lugar (mismo criterio que calcularSaldoOperador en Precintos). Orden de
// prioridad: Feriado especial > Domingo > día normal — un feriado que cae
// domingo se paga como feriado (US$70 × TC), no se suman los dos.
function calcularMontoDiaABordo(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const cfg = LIMITES_GASTOS_DEMO.diasABordo;

  const feriado = cfg.feriadosEspeciales.find(f => f.dia === dia && f.mes === mes);
  if (feriado) {
    const pad = n => String(n).padStart(2, '0');
    const fechaDDMMYYYY = `${pad(dia)}/${pad(mes)}/${anio}`;
    const tc = TIPOS_CAMBIO_FERIADOS_DEMO.find(t => t.fecha === fechaDDMMYYYY);
    if (!tc) return { monto: 0, tipo: 'feriado', pendiente: true };
    return { monto: tc.montoSoles, tipo: 'feriado', pendiente: false };
  }

  const diaSemana = new Date(anio, mes - 1, dia).getDay(); // 0 = domingo
  if (diaSemana === 0) return { monto: cfg.domingo, tipo: 'domingo', pendiente: false };
  return { monto: cfg.diaNormal, tipo: 'normal', pendiente: false };
}

// Distritos/provincias que el Resumen Total cuenta como "Lima" (incluye
// Callao, mismo criterio que usa nómina) — el resto cae en "Provincia". No
// hay un campo de "región" en el sistema; se infiere del lugar/terminal de
// la operación, igual que hace la planilla con el conocimiento del área.
const LUGARES_LIMA_GASTOS = ['Lima', 'Callao'];
function esLugarDeLima(lugar) {
  return LUGARES_LIMA_GASTOS.some(l => (lugar || '').toLowerCase().includes(l.toLowerCase()));
}

// Genera los renglones de Días a Bordo de un operador en [desdeISO, hastaISO]
// a partir de sus precintos USADOS en Precintos (data-precintos.js): un
// "Uso" reportado ese día es la fuente real de "el operador tuvo una
// operación ese día" ya disponible en el sistema (mismo dato que ya
// alimenta Reporte de Precintos — lugar/operación/ITS REF/buque salen de
// ahí). Si Precintos no está cargado en esta página, no hay fuente: el
// período sale vacío en vez de inventar nada.
function generarDiasABordoOperador(operadorUsuario, desdeISO, hastaISO) {
  if (typeof obtenerTodosLosPrecintosConEstado !== 'function') return [];

  const porDia = new Map(); // fechaISO -> uso (el primero de ese día, si hay más de uno)
  obtenerTodosLosPrecintosConEstado()
    .filter(f => f.uso && f.asignacion && f.asignacion.recibidoPor === operadorUsuario)
    .forEach(f => {
      const fechaISO = fechaDDMMYYYYaISO(f.uso.fecha);
      if (fechaISO < desdeISO || fechaISO > hastaISO) return;
      if (!porDia.has(fechaISO)) porDia.set(fechaISO, f.uso);
    });

  return [...porDia.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fechaISO, uso]) => {
      const montoCalc = calcularMontoDiaABordo(fechaISO);
      const diaSemana = DIAS_SEMANA[(new Date(fechaISO + 'T00:00:00').getDay() + 6) % 7];
      // "tipoOperacion" de Precintos viene como "Descarga / M/N Cordillera"
      // (operación + buque, separados por " / ") — se separan acá por la
      // PRIMERA barra nomás (el nombre del buque "M/N ..." trae su propia
      // barra, un split('/') a secas lo hubiera cortado mal), sin inventar
      // ningún dato que no esté ya en el registro de uso.
      const textoOperacion = String(uso.tipoOperacion || '');
      const separador = textoOperacion.indexOf('/');
      const operacionTexto = (separador === -1 ? textoOperacion : textoOperacion.slice(0, separador)).trim();
      const buqueTexto = (separador === -1 ? '' : textoOperacion.slice(separador + 1)).trim();
      return {
        dia: diaSemana,
        fecha: fechaISOaDDMMYYYY(fechaISO),
        fechaISO,
        lugar: uso.terminal || '—',
        operacion: operacionTexto || '—',
        operacionPer: uso.viaje || '—',
        buque: buqueTexto || '—',
        cliente: '—', // Precintos no registra cliente en el evento de uso — no se inventa
        detalle: montoCalc.tipo === 'feriado' ? 'Feriado especial' : montoCalc.tipo === 'domingo' ? 'Domingo laborado' : 'Inspección a bordo',
        monto: montoCalc.monto,
        pendiente: montoCalc.pendiente
      };
    });
}

// Aplica los ajustes/exclusiones del supervisor (detalle.overrides, keyed por
// fecha dd/mm/yyyy) sobre lo recién generado y deja el resultado en
// detalle.grilla — se llama cada vez que se abre/descarga el reporte (ver
// detalle-gastos.js → abrirDetalleGasto / registro-gastos-operativos.js →
// prepararDescargaGastos), así un cambio de tarifa o tipo de cambio se
// refleja solo, sin que nadie tenga que volver a cargar nada a mano.
function regenerarDiasABordo(id) {
  const detalle = DETALLE_DIAS_A_BORDO_DEMO[id];
  if (!detalle) return;
  if (!detalle.overrides) detalle.overrides = {};

  const desdeISO = fechaDDMMYYYYaISO(detalle.fechaInicio);
  const hastaISO = fechaDDMMYYYYaISO(detalle.fechaFin);
  const generados = generarDiasABordoOperador(detalle.firmaTrabajador, desdeISO, hastaISO);

  detalle.grilla = generados
    .filter(f => !(detalle.overrides[f.fecha] && detalle.overrides[f.fecha].excluido))
    .map(f => {
      const ov = detalle.overrides[f.fecha];
      return (ov && ov.monto !== undefined) ? { ...f, monto: ov.monto, pendiente: false } : f;
    });
}

// Resumen de un operador para el Resumen Total (§1.4): cuenta y suma cada
// día generado (ver generarDiasABordoOperador — ya respeta tarifas/TC/
// feriados) en sus 4 columnas (Feriado / Domingo Lima / Domingo Provincia /
// Día a bordo), más los buques y PER que tuvo en el rango. Usa los mismos
// días "en bruto" (no pasa por overrides de un período puntual — el
// Resumen es un corte propio, no agrega las ediciones de cada Detalle).
function calcularResumenDiasABordoOperador(operadorUsuario, desdeISO, hastaISO) {
  const dias = generarDiasABordoOperador(operadorUsuario, desdeISO, hastaISO);
  const r = {
    feriadoDias: 0, feriadoSoles: 0,
    domLimaDias: 0, domLimaSoles: 0,
    domProvDias: 0, domProvSoles: 0,
    bordoDias: 0, bordoSoles: 0,
    pendiente: false, buques: new Set(), pers: new Set()
  };
  dias.forEach(f => {
    if (f.pendiente) r.pendiente = true;
    if (f.buque && f.buque !== '—') r.buques.add(f.buque);
    if (f.operacionPer && f.operacionPer !== '—') r.pers.add(f.operacionPer);

    if (f.detalle === 'Feriado especial') { r.feriadoDias++; r.feriadoSoles += f.monto; }
    else if (f.dia === 'Domingo') {
      if (esLugarDeLima(f.lugar)) { r.domLimaDias++; r.domLimaSoles += f.monto; }
      else { r.domProvDias++; r.domProvSoles += f.monto; }
    } else { r.bordoDias++; r.bordoSoles += f.monto; }
  });
  r.total = r.feriadoSoles + r.domLimaSoles + r.domProvSoles + r.bordoSoles;
  r.buque = r.buques.size === 0 ? 'NO TIENE' : r.buques.size === 1 ? [...r.buques][0] : 'VARIOS';
  r.per = r.pers.size === 0 ? 'NO TIENE' : r.pers.size === 1 ? [...r.pers][0] : 'VARIOS';
  return r;
}

// Todos los operadores con al menos un día generado en [desdeISO,hastaISO]
// — recorre los mismos 3 operadores que ya tienen reportes de Gastos
// (GASTOS_OPERATIVOS_DEMO), igual universo que usa la grilla principal.
function operadoresConDiasABordo(desdeISO, hastaISO) {
  const usuarios = [...new Set(
    GASTOS_OPERATIVOS_DEMO
      .map(g => obtenerDetalleGastoPorTipo(g.tipo, g.id)?.firmaTrabajador)
      .filter(Boolean)
  )];
  return usuarios
    .map(usuario => ({ usuario, resumen: calcularResumenDiasABordoOperador(usuario, desdeISO, hastaISO) }))
    .filter(({ resumen }) => resumen.feriadoDias + resumen.domLimaDias + resumen.domProvDias + resumen.bordoDias > 0);
}
