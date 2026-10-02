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
const GASTOS_OPERATIVOS_DEMO = [
  { id: 1, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Alimentos' },
  { id: 2, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Movilidad' },
  { id: 5, periodoCodigo: 'PG26000001', nombre: 'Edward', apellido: 'Allccaco', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Días a Bordo' },
  { id: 6, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Alimentos' },
  { id: 7, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Movilidad' },
  { id: 3, periodoCodigo: 'PG26000002', nombre: 'Julio César', apellido: 'Gómez', area: 'Operaciones', fechaDesde: '01/08/2026', fechaHasta: '31/08/2026', tipo: 'Días a Bordo' },
  { id: 4, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '01/07/2026', fechaHasta: '31/07/2026', tipo: 'Alimentos' },
  { id: 8, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '01/07/2026', fechaHasta: '31/07/2026', tipo: 'Movilidad' },
  { id: 9, periodoCodigo: 'PG26000003', nombre: 'Rudy', apellido: 'Bravo Flores', area: 'Operaciones', fechaDesde: '01/07/2026', fechaHasta: '31/07/2026', tipo: 'Días a Bordo' }
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
  1: {
    numero: 'RA26000031', fechaEmision: '01/08/2026', montoMaximo: 45.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { fecha: '16/08/2026', comida: 'Desayuno', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:30 am', costo: 8.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '16/08/2026', comida: 'Almuerzo', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '13:00 pm', costo: 18.00, evidencia: ['Evidencia 1', 'Evidencia 2'], sinSustento: false },
      { fecha: '17/08/2026', comida: 'Desayuno', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:15 am', costo: 8.00, evidencia: [], sinSustento: true },
      { fecha: '17/08/2026', comida: 'Almuerzo', lugar: 'Supe', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '13:10 pm', costo: 20.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'e.allccaco'
  },
  6: {
    numero: 'RA26000032', fechaEmision: '01/08/2026', montoMaximo: 45.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { fecha: '10/08/2026', comida: 'Desayuno', lugar: 'Pisco', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '07:00 am', costo: 8.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '10/08/2026', comida: 'Cena', lugar: 'Pisco', cliente: 'Naviera del Sur', operacionPer: 'PER/09461-25', hora: '20:15 pm', costo: 15.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'j.gomez'
  },
  4: {
    numero: 'RA26000033', fechaEmision: '01/07/2026', montoMaximo: 45.00,
    fechaInicio: '01/07/2026', fechaFin: '31/07/2026',
    grilla: [
      { fecha: '21/07/2026', comida: 'Almuerzo', lugar: 'Callao', cliente: 'Consorcio Terminales', operacionPer: 'PER/09463-25', hora: '12:30 pm', costo: 22.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '22/07/2026', comida: 'Almuerzo', lugar: 'Callao', cliente: 'Consorcio Terminales', operacionPer: 'PER/09463-25', hora: '12:40 pm', costo: 22.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'r.bravo'
  }
};

// Detalle "Editar y Revisar Registro de Movilidad" — una fila por traslado
// ("Movilidad 1", "Movilidad 2"... del app), con la misma evidencia/"sin
// sustento" que Alimentos.
const DETALLE_MOVILIDAD_DEMO = {
  2: {
    numero: 'RM26000018', fechaEmision: '01/08/2026', montoMaximo: 60.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { fecha: '16/08/2026', empresa: 'Taxi Seguro Supe', distritoPartida: 'Supe Puerto', distritoDestino: 'Supe', motivo: 'Traslado a muelle', importeDia: 15.00, totalDia: 15.00, evidencia: ['Evidencia 1'], sinSustento: false },
      { fecha: '18/08/2026', empresa: 'Taxi Seguro Supe', distritoPartida: 'Supe', distritoDestino: 'Supe Puerto', motivo: 'Traslado a operación', importeDia: 15.00, totalDia: 15.00, evidencia: [], sinSustento: true }
    ],
    firmaTrabajador: 'e.allccaco'
  },
  7: {
    numero: 'RM26000019', fechaEmision: '01/08/2026', montoMaximo: 60.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { fecha: '11/08/2026', empresa: 'Taxi Seguro Pisco', distritoPartida: 'Pisco', distritoDestino: 'Terminal Portuario', motivo: 'Traslado a operación', importeDia: 14.00, totalDia: 14.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'j.gomez'
  },
  8: {
    numero: 'RM26000020', fechaEmision: '01/07/2026', montoMaximo: 60.00,
    fechaInicio: '01/07/2026', fechaFin: '31/07/2026',
    grilla: [
      { fecha: '21/07/2026', empresa: 'Transportes Callao', distritoPartida: 'Callao', distritoDestino: 'Terminal Portuario', motivo: 'Traslado a muelle', importeDia: 18.00, totalDia: 18.00, evidencia: ['Evidencia 1'], sinSustento: false }
    ],
    firmaTrabajador: 'r.bravo'
  }
};

// Detalle "Editar y Revisar Registro de Días a Bordo" (sin evidencia: el
// monto se genera automáticamente según Configuración de Límites, no
// requiere sustento del operario).
const DETALLE_DIAS_A_BORDO_DEMO = {
  // El monto de cada fila sale automático de Configuración de Límites
  // (rangos por día de semana / Feriados / Feriados Especiales), pero el
  // supervisor siempre puede corregirlo puntualmente con "Editar".
  5: {
    numero: 'RD26000010', fechaEmision: '01/08/2026', montoMaximo: 80.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { dia: 'Domingo', fecha: '16/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', operacionPer: 'PER/09461-25', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 100.00 },
      { dia: 'Lunes', fecha: '17/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', operacionPer: 'PER/09461-25', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 80.00 }
    ],
    firmaTrabajador: 'e.allccaco'
  },
  3: {
    numero: 'RD26000009', fechaEmision: '01/08/2026', montoMaximo: 80.00,
    fechaInicio: '01/08/2026', fechaFin: '31/08/2026',
    grilla: [
      { dia: 'Lunes', fecha: '10/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', operacionPer: 'PER/09461-25', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 80.00 },
      { dia: 'Martes', fecha: '11/08/2026', lugar: 'Supe', cliente: 'Naviera del Sur', operacion: 'Descarga', operacionPer: 'PER/09461-25', buque: 'M/N Megara', detalle: 'Inspección a bordo', monto: 80.00 }
    ],
    firmaTrabajador: 'j.gomez'
  },
  9: {
    numero: 'RD26000011', fechaEmision: '01/07/2026', montoMaximo: 80.00,
    fechaInicio: '01/07/2026', fechaFin: '31/07/2026',
    grilla: [
      { dia: 'Martes', fecha: '21/07/2026', lugar: 'Callao', cliente: 'Consorcio Terminales', operacion: 'Carga', operacionPer: 'PER/09463-25', buque: 'M/N Stena Impression', detalle: 'Inspección a bordo', monto: 80.00 }
    ],
    firmaTrabajador: 'r.bravo'
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
// (Alimentos/Movilidad/Días a Bordo) vacíos para el mes calendario de
// "fechaReferenciaISO" (normalmente hoy), listos para que el app vaya
// cargando lo que el operador reporte. Si el operador ya tiene reportes
// abiertos para ese mismo mes, no hace nada (evita duplicar si aparece en
// más de una Asignación dentro del mismo mes).
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
      fechaDesde, fechaHasta, tipo
    });

    const fuente = tipo === 'Alimentos' ? DETALLE_ALIMENTOS_DEMO : tipo === 'Movilidad' ? DETALLE_MOVILIDAD_DEMO : DETALLE_DIAS_A_BORDO_DEMO;
    fuente[nuevoId] = {
      numero: generarCodigoReporteGasto(tipo), fechaEmision: hoy, montoMaximo: montoMaximoPorTipo[tipo],
      fechaInicio: fechaDesde, fechaFin: fechaHasta,
      grilla: [],
      firmaTrabajador: operadorUsuario
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
    // Esto es "Configuración de Feriados" en la UI — el monto reemplaza la
    // tarifa normal por día de la semana ese día puntual. Los 4 de acá (Año
    // Nuevo, Día del Trabajo, Fiestas Patrias, Navidad) son los que se
    // acordaron en la reunión de diseño como feriados "normales" (en soles).
    diasEspeciales: [
      { id: 1, dia: 1, mes: 1, monto: 150.00 },
      { id: 2, dia: 1, mes: 5, monto: 150.00 },
      { id: 3, dia: 28, mes: 7, monto: 150.00 },
      { id: 4, dia: 25, mes: 12, monto: 150.00 }
    ],
    // "Feriados Especiales": igual de recurrente (día + mes, sin año) y con
    // su propio monto a pagar — pero ESE monto está en dólares (montoUSD),
    // no en soles: hace falta el tipo de cambio de ese día puntual para
    // saber a cuánto equivale (ver TIPOS_CAMBIO_FERIADOS_DEMO), y eso lo
    // registra quien tenga permiso (Supervisor, Jefe de Área o Gerente) el
    // mismo día, porque el tipo de cambio cambia año a año y no se puede
    // dejar precargado de antemano. La reunión no dejó cerrado CUÁLES fechas
    // son especiales (solo el concepto) — 8 de octubre queda acá como
    // ejemplo de demo hasta que se confirme la lista real.
    feriadosEspeciales: [
      { id: 1, dia: 8, mes: 10, montoUSD: 40.00 }
    ]
  }
};

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
  { id: 1, fecha: '08/10/2025', tipoCambio: 3.71, montoUSD: 40.00, montoSoles: 148.40, agregadoPor: 'j.ramos' }
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
