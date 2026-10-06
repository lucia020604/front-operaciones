// =================================================
// DATA-MOVIL.JS
// Fuente única de datos de la App Móvil (prototipo sin backend). La app
// móvil reutiliza el mismo login y la misma sesión que el sistema web
// (USUARIOS_DEMO / sessionStorage.sesionUsuario) — es el mismo sistema,
// visto desde el dispositivo del colaborador en campo.
//
// Los datos de la operación asignada se modelan aquí como un set demo
// independiente (mismo formato de PER, buque, terminal y nombres de estado
// que ya usa el resto del sistema) en lugar de acoplarse a OPERACIONES_DEMO
// de Seguimiento de Operaciones, para no modificar código fuera del
// alcance pedido en esta fase (solo App Móvil).
// =================================================

// Datos adicionales de perfil (Área, DNI) por usuario — el resto de datos
// del Perfil (Nombre, Apellido, Rol, Celular) ya están en USUARIOS_DEMO.
const PERFIL_MOVIL_EXTRA_DEMO = {
  'e.allccaco': { dni: '45120384' },
  'r.bravo':    { dni: '46220157' },
  'j.gomez':    { dni: '41985023' },
  'j.torres':   { dni: '40873219' }
};

// Direcciones demo que devuelve "Actualizar Ubicación" (simulación de
// geolocalización — ver decisión del usuario: sin APIs reales del navegador).
const UBICACIONES_DEMO_MOVIL = [
  'Av. Costanera 245, Supe Puerto, Barranca',
  'Muelle Fiscal N.° 2, Supe Puerto, Barranca',
  'Jr. Los Pescadores 118, Supe, Barranca'
];

// Frases demo que devuelve el dictado por voz simulado (botón de micrófono).
const FRASES_DICTADO_DEMO = [
  'Operación en curso sin novedades.',
  'Demora por espera de marea, se reanuda en 30 minutos.',
  'Se coordina con el buque el inicio de la siguiente etapa.'
];

// Secuencia de estados de la operación (coincide con las columnas ya usadas
// en Reporte Mensual de Cabotaje: Eta, Arriba, Fondea, Amarre inicio, Inicia,
// Termina, Firma de Documentos, Zarpe).
//
// "tipo" define qué campo se pide al registrar el estado — no todos son
// fecha y hora: "numero" y "texto" también existen (ej. cantidad de amarras,
// responsable de firma). campoLabel/campoPlaceholder solo aplican a esos dos
// tipos (en "fechaHora" el campo ya se explica solo con la etiqueta del
// estado). Esto no viene de una pantalla existente del sistema web (ahí el
// horario de operaciones es siempre fecha/hora) — es una extensión propia
// de la app móvil para operaciones cuyo estado no es un simple timestamp.
const ESTADOS_OPERACION_MOVIL = [
  { clave: 'eta', etiqueta: 'Eta', tipo: 'fechaHora' },
  { clave: 'arriba', etiqueta: 'Arriba', tipo: 'fechaHora' },
  { clave: 'fondea', etiqueta: 'Fondea', tipo: 'fechaHora' },
  { clave: 'amarreInicio', etiqueta: 'Amarre inicio', tipo: 'numero', campoLabel: 'N° de amarras', campoPlaceholder: 'Ej. 4' },
  { clave: 'inicia', etiqueta: 'Inicia', tipo: 'fechaHora' },
  { clave: 'termina', etiqueta: 'Termina', tipo: 'fechaHora' },
  { clave: 'firmaDocumentos', etiqueta: 'Firma de Documentos', tipo: 'texto', campoLabel: 'Responsable de la firma', campoPlaceholder: 'Nombre y apellido' },
  { clave: 'zarpe', etiqueta: 'Zarpe', tipo: 'fechaHora' }
];

// Operaciones asignadas al colaborador en sesión. Un operador puede tener
// más de una operación asignada el mismo día (ej. termina una y empieza otra
// en un terminal distinto), por eso es una lista y no un objeto único —
// "Añadir Hora", "Horario" y "Asignar Precinto" se abren desde la tarjeta de
// cada operación y actúan solo sobre esa operación.
// Las 4 cubren a los 4 operadores con precintos en data-precintos.js
// (ASIGNACIONES_PRECINTOS_DEMO: j.gomez, j.torres, r.bravo, e.allccaco) —
// cliente/viaje/terminal de j.gomez y j.torres calzan con su Asignación
// ASG26000009/ASG26000008 (misma M/N y Terminal), para que "Asignar
// Precinto" se vea como parte de la misma operación real en vez de un dato
// suelto sin relación.
const OPERACIONES_ASIGNADAS_MOVIL_DEMO = [
  {
    codigo: 'OP-2026-041',
    cliente: 'Naviera del Sur',
    per: 'PER/09461-25',
    nroViaje: 'V-2201',
    terminal: 'Supe',
    operacion: 'Loading',
    personalAsignado: 'Edward Allccaco',
    productos: ['LNG'],
    // admiVisadoPorSistema: si el área administrativa ya marcó "Revisado" desde
    // el sistema, el horario queda bloqueado para edición desde el móvil.
    revisadoPorSistema: false,
    estados: {
      eta: { fecha: '06/07/2026', hora: '06:00', comentario: '' },
      arriba: { fecha: '06/07/2026', hora: '08:10', comentario: '' },
      fondea: { fecha: '', hora: '', comentario: '' },
      amarreInicio: { valor: '', comentario: '' },
      inicia: { fecha: '', hora: '', comentario: '' },
      termina: { fecha: '', hora: '', comentario: '' },
      firmaDocumentos: { valor: '', comentario: '' },
      zarpe: { fecha: '', hora: '', comentario: '' }
    }
  },
  {
    codigo: 'OP-2026-052',
    cliente: 'Pesquera Costa Azul',
    per: 'PER/09512-25',
    nroViaje: 'V-2214',
    terminal: 'Supe',
    operacion: 'Discharging',
    // r.bravo tiene la Asignación ASG26000090 (los 3 materiales, caso de
    // prueba del reporte por material) — su viaje/terminal calzan con este.
    personalAsignado: 'Rudy Bravo Flores',
    productos: ['Diesel B5', 'Gasolina 90'],
    revisadoPorSistema: true,
    estados: {
      eta: { fecha: '06/07/2026', hora: '14:30', comentario: '' },
      arriba: { fecha: '06/07/2026', hora: '16:05', comentario: '' },
      fondea: { fecha: '06/07/2026', hora: '16:40', comentario: '' },
      amarreInicio: { valor: '', comentario: '' },
      inicia: { fecha: '', hora: '', comentario: '' },
      termina: { fecha: '', hora: '', comentario: '' },
      firmaDocumentos: { valor: '', comentario: '' },
      zarpe: { fecha: '', hora: '', comentario: '' }
    }
  },
  // Misma Asignación ASG26000009 (Reporte de Precintos): Terminal Norte,
  // M/N Cordillera, descarga — E-50005/E-50006 quedan disponibles para
  // reportar un Uso nuevo desde acá (E-50001 al E-50004/E-50007/E-50008 ya
  // usados, E-50009/E-50010 ya scrap).
  {
    codigo: 'OP-2026-063',
    cliente: 'Naviera Cordillera',
    per: 'PER/09573-25',
    nroViaje: 'V-2401',
    terminal: 'Terminal Norte',
    operacion: 'Discharging',
    personalAsignado: 'Julio César Gómez',
    productos: ['Concentrado de cobre'],
    revisadoPorSistema: false,
    estados: {
      eta: { fecha: '02/10/2026', hora: '07:15', comentario: '' },
      arriba: { fecha: '02/10/2026', hora: '09:40', comentario: '' },
      fondea: { fecha: '', hora: '', comentario: '' },
      amarreInicio: { valor: '', comentario: '' },
      inicia: { fecha: '', hora: '', comentario: '' },
      termina: { fecha: '', hora: '', comentario: '' },
      firmaDocumentos: { valor: '', comentario: '' },
      zarpe: { fecha: '', hora: '', comentario: '' }
    }
  },
  // Misma Asignación ASG26000008: todavía sin ningún Uso reportado (solo
  // A-09951 como scrap) — ejemplo de operación recién empezada, sin ningún
  // estado registrado aún.
  {
    codigo: 'OP-2026-074',
    cliente: 'Naviera del Sur',
    per: 'PER/09634-25',
    nroViaje: 'V-2287',
    terminal: 'Terminal Norte',
    operacion: 'Discharging',
    personalAsignado: 'Juan Torres',
    productos: ['Contenedores'],
    revisadoPorSistema: false,
    estados: {
      eta: { fecha: '', hora: '', comentario: '' },
      arriba: { fecha: '', hora: '', comentario: '' },
      fondea: { fecha: '', hora: '', comentario: '' },
      amarreInicio: { valor: '', comentario: '' },
      inicia: { fecha: '', hora: '', comentario: '' },
      termina: { fecha: '', hora: '', comentario: '' },
      firmaDocumentos: { valor: '', comentario: '' },
      zarpe: { fecha: '', hora: '', comentario: '' }
    }
  }
];

// Jornada diaria (Comenzar día / Finalizar) por usuario y fecha — reinicia
// en cada carga de página como el resto del prototipo (sin backend).
const JORNADAS_MOVIL_DEMO = {};

function obtenerFechaHoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function obtenerJornadaHoy(usuario) {
  const clave = `${usuario}_${obtenerFechaHoyISO()}`;
  if (!JORNADAS_MOVIL_DEMO[clave]) {
    JORNADAS_MOVIL_DEMO[clave] = { inicio: null, fin: null };
  }
  return JORNADAS_MOVIL_DEMO[clave];
}
