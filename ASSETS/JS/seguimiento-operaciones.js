// =================================================
// SEGUIMIENTO-OPERACIONES.JS
// Lógica del módulo Operaciones: listado de Seguimiento de Operaciones
// y formulario de Nueva/Editar Operación (prototipo sin backend).
// Una Operación siempre nace a partir de una Nominación ya Vigente —
// reutiliza SRV_BUQUES, SRV_LOCACIONES, srvUsuariosPorRol,
// srvCargarNominaciones y demás utilidades definidas en servicios.js
// (cargado antes que este archivo), en vez de duplicar esos catálogos.
// =================================================

const OP_STORAGE_KEY = 'operacionesData';
// Sube este número cada vez que cambien los datos de OPERACIONES_DEMO
// (fechas, estados, etc.) — si no, un navegador que ya sembró el
// localStorage en una visita anterior seguiría viendo las fechas viejas
// para siempre, sin importar qué se corrija en el código.
const OP_DEMO_VERSION = '8';
const OP_DEMO_VERSION_KEY = 'operacionesDataVersion';

// Roles operativos que pueden asignarse a una operación — mismo criterio
// que ROLES_DEMO (categoría "Operativo"), sin incluir "Practicante" (rol
// inactivo en el mantenedor de Roles).
const OP_ROLES = ['Supervisor', 'Inspector', 'Técnico Especialista'];

// Cada bloque de "Horarios" guarda { valor, comentario } — el comentario
// es opcional y se revela con el ícono de globo junto a la etiqueta.
// Las actividades a registrar cambian según el Tipo de Operación (el mismo
// catálogo SRV_TIPOS_OPERACION de Nominaciones): un STS Transfer no fondea
// ni amarra igual que una Carga/Descarga en terminal, y un Bunkering no
// tiene etapa de fondeo. Las claves comunes (eta, firmaDocumentos, zarpe)
// se repiten entre tipos para poder conservar su valor si el usuario
// cambia el tipo después de haber cargado datos.
const OP_HORARIOS_POR_TIPO = {
  Loading: [
    { key: 'eta', label: 'ETA' },
    { key: 'arriba', label: 'Arriba' },
    { key: 'fondea', label: 'Fondea' },
    { key: 'amarre', label: 'Amarre' },
    { key: 'iniciaCarga', label: 'Inicia Carga' },
    { key: 'terminaCarga', label: 'Termina Carga' },
    { key: 'firmaDocumentos', label: 'Firma de Documentos' },
    { key: 'zarpe', label: 'Zarpe' }
  ],
  Discharging: [
    { key: 'eta', label: 'ETA' },
    { key: 'arriba', label: 'Arriba' },
    { key: 'fondea', label: 'Fondea' },
    { key: 'amarre', label: 'Amarre' },
    { key: 'iniciaDescarga', label: 'Inicia Descarga' },
    { key: 'terminaDescarga', label: 'Termina Descarga' },
    { key: 'firmaDocumentos', label: 'Firma de Documentos' },
    { key: 'zarpe', label: 'Zarpe' }
  ],
  'STS Transfer': [
    { key: 'eta', label: 'ETA' },
    { key: 'arriboZonaSts', label: 'Arribo a Zona STS' },
    { key: 'amarreNaves', label: 'Amarre entre Naves' },
    { key: 'iniciaTransferencia', label: 'Inicia Transferencia' },
    { key: 'terminaTransferencia', label: 'Termina Transferencia' },
    { key: 'desamarre', label: 'Desamarre' },
    { key: 'firmaDocumentos', label: 'Firma de Documentos' },
    { key: 'zarpe', label: 'Zarpe' }
  ],
  Bunkering: [
    { key: 'eta', label: 'ETA' },
    { key: 'arriba', label: 'Arriba' },
    { key: 'amarre', label: 'Amarre' },
    { key: 'iniciaSuministro', label: 'Inicia Suministro' },
    { key: 'terminaSuministro', label: 'Termina Suministro' },
    { key: 'firmaDocumentos', label: 'Firma de Documentos' },
    { key: 'zarpe', label: 'Zarpe' }
  ]
};

function opHorariosDefsPorTipo(tipo) {
  return OP_HORARIOS_POR_TIPO[tipo] || [];
}

// "leido" distingue un comentario que ya se revisó en la web de uno recién
// llegado (ej. cargado desde la app de campo) que todavía no se abrió acá —
// mientras esté en false y haya comentario, el ícono muestra un punto.
function opHorariosVacios(tipo) {
  const obj = {};
  opHorariosDefsPorTipo(tipo).forEach(h => { obj[h.key] = { valor: '', comentario: '', leido: true }; });
  return obj;
}

// Datos de ejemplo: cada operación referencia una nominación Vigente real
// (NOMINACIONES_DEMO, definida en servicios.js) — así el listado nace con
// Cliente/Contacto/Nave siempre coherentes con esa nominación en vez de
// datos sueltos y potencialmente desincronizados.
const OPERACIONES_DEMO = [
  {
    // Ejemplo de Revisado con actividades incompletas: el
    // personal puede marcar "Revisado" (que pasa el estado a Revisado, ver
    // opCalcularEstadoAutomatico) aunque todavía falten Horarios por
    // registrar — es una decisión suya, no depende de que estén todos
    // completos como sí exige el estado automático "Completado".
    id: 'OP001', nominacionId: 'NOM001', per: 'PER/09461-25', tipoOperacion: 'Loading',
    fechaInicio: '2026-07-06', fechaFin: '2026-07-07', fechaFinReal: '2026-07-07', nroViaje: 'V-2201',
    nave: 'MEGARA', terminalInicial: 'Supe', terminalDestino: 'Callao',
    estimacionFechaHora: '2026-07-06T07:00', productos: ['LNG'],
    personal: [
      { rol: 'Supervisor', nombre: 'Julio César Gómez', principal: true },
      { rol: 'Inspector', nombre: 'Edward Allccaco', principal: false },
      { rol: 'Inspector', nombre: 'Rudy Bravo Flores', principal: false }
    ],
    horarios: {
      eta: { valor: '2026-07-06T06:00', comentario: '' },
      arriba: { valor: '2026-07-06T08:10', comentario: '' },
      fondea: { valor: '2026-07-06T09:00', comentario: '' },
      amarre: { valor: '2026-07-06T10:30', comentario: 'Amarre con demora por marea baja.', leido: false },
      iniciaCarga: { valor: '2026-07-06T12:00', comentario: '' },
      terminaCarga: { valor: '', comentario: '' },
      firmaDocumentos: { valor: '', comentario: '' },
      zarpe: { valor: '', comentario: '' }
    },
    estado: 'Revisado', revisado: true
  },
  {
    id: 'OP002', nominacionId: 'NOM005', per: 'PER/09465-25', tipoOperacion: 'Loading',
    fechaInicio: '2026-07-20', fechaFin: '2026-07-20', fechaFinReal: '', nroViaje: 'V-2214',
    nave: 'MEGARA', terminalInicial: 'Callao', terminalDestino: '',
    estimacionFechaHora: '2026-07-20T14:00', productos: ['GLP'],
    personal: [
      { rol: 'Supervisor', nombre: 'Julio César Gómez', principal: true }
    ],
    horarios: opHorariosVacios('Loading'),
    estado: 'Activo', revisado: false
  },
  {
    // A caballo entre el mes anterior y el actual (eta 31 de julio, resto de
    // la operación en agosto) — sirve para probar la navegación de mes en
    // Horario de Buques.
    id: 'OP003', nominacionId: 'NOM008', per: 'PER/09468-25', tipoOperacion: 'Bunkering',
    fechaInicio: '2026-08-01', fechaFin: '2026-08-02', fechaFinReal: '2026-08-02', nroViaje: 'V-2230',
    nave: 'PACIFIC STAR', terminalInicial: 'Pisco', terminalDestino: 'Pisco',
    estimacionFechaHora: '2026-08-01T07:30', productos: ['Diesel B5'],
    personal: [
      { rol: 'Supervisor', nombre: 'Bandy Jimenez', principal: true },
      { rol: 'Inspector', nombre: 'Julio César Gómez', principal: false },
      { rol: 'Inspector', nombre: 'Edward Allccaco', principal: false }
    ],
    horarios: {
      eta: { valor: '2026-07-31T20:00', comentario: '' },
      arriba: { valor: '2026-08-01T07:40', comentario: '' },
      amarre: { valor: '2026-08-01T09:00', comentario: '' },
      iniciaSuministro: { valor: '2026-08-01T10:00', comentario: '' },
      terminaSuministro: { valor: '2026-08-02T18:00', comentario: '' },
      firmaDocumentos: { valor: '2026-08-02T18:30', comentario: '' },
      zarpe: { valor: '2026-08-02T20:00', comentario: 'Zarpe conforme, sin observaciones.', leido: true }
    },
    estado: 'Revisado', revisado: true
  },
  {
    id: 'OP004', nominacionId: 'NOM007', per: 'PER/09467-25', tipoOperacion: 'STS Transfer',
    fechaInicio: '2026-07-13', fechaFin: '2026-07-14', fechaFinReal: '', nroViaje: 'V-2178',
    nave: 'STENA IMPRESSION', terminalInicial: 'Supe', terminalDestino: '',
    estimacionFechaHora: '2026-07-13T09:00', productos: ['Crudo'],
    personal: [
      { rol: 'Supervisor', nombre: 'Sandra Echavarria', principal: true }
    ],
    horarios: opHorariosVacios('STS Transfer'),
    estado: 'Cancelado', revisado: false
  },
  {
    // Ejemplo de Descarga (Discharging) con Horarios completos — muestra las
    // actividades propias de ese tipo (Inicia/Termina Descarga) en vez de
    // las de Carga. Fechas puestas a caballo del día de hoy para poder
    // verificar el resaltado "es-hoy" del calendario en Horario de Buques.
    // Todas las actividades de su Tipo de Operación ya tienen valor, así
    // que el estado automático correspondiente es "Completado" — todavía
    // no "Revisado" porque nadie marcó "Revisado" (ver
    // opCalcularEstadoAutomatico).
    id: 'OP005', nominacionId: 'NOM002', per: 'PER/09462-25', tipoOperacion: 'Discharging',
    fechaInicio: '2026-08-17', fechaFin: '2026-08-18', fechaFinReal: '', nroViaje: 'V-2205',
    nave: 'STENA IMPRESSION', terminalInicial: 'Callao', terminalDestino: '',
    estimacionFechaHora: '2026-08-17T06:00', productos: ['Crudo'],
    personal: [
      { rol: 'Supervisor', nombre: 'Sandra Echavarria', principal: true },
      { rol: 'Inspector', nombre: 'Julio César Gómez', principal: false }
    ],
    horarios: {
      eta: { valor: '2026-08-16T22:00', comentario: '' },
      arriba: { valor: '2026-08-17T06:10', comentario: '' },
      fondea: { valor: '2026-08-17T07:00', comentario: '' },
      amarre: { valor: '2026-08-17T08:30', comentario: 'Amarre en muelle 3.', leido: true },
      iniciaDescarga: { valor: '2026-08-17T10:00', comentario: '' },
      terminaDescarga: { valor: '2026-08-18T16:00', comentario: '' },
      firmaDocumentos: { valor: '2026-08-18T16:30', comentario: '' },
      zarpe: { valor: '2026-08-18T18:00', comentario: 'Descarga completa, sin incidencias.', leido: false }
    },
    estado: 'Completado', revisado: false
  },
  {
    // Segundo ejemplo de STS Transfer, pero Revisado y con Horarios
    // completos (a diferencia de OP004, que queda vacío para mostrar el
    // estado inicial de una operación recién creada).
    id: 'OP006', nominacionId: 'NOM003', per: 'PER/09463-25', tipoOperacion: 'STS Transfer',
    fechaInicio: '2026-07-23', fechaFin: '2026-07-24', fechaFinReal: '2026-07-24', nroViaje: 'V-2219',
    nave: 'PACIFIC STAR', terminalInicial: 'Pisco', terminalDestino: '',
    estimacionFechaHora: '2026-07-23T05:00', productos: ['GLP'],
    personal: [
      { rol: 'Supervisor', nombre: 'Bandy Jimenez', principal: true },
      { rol: 'Inspector', nombre: 'Edward Allccaco', principal: false },
      { rol: 'Inspector', nombre: 'Julio César Gómez', principal: false }
    ],
    horarios: {
      eta: { valor: '2026-07-22T20:00', comentario: '' },
      arriboZonaSts: { valor: '2026-07-23T05:30', comentario: '' },
      amarreNaves: { valor: '2026-07-23T07:00', comentario: 'Amarre costado a costado, condiciones de mar favorables.', leido: true },
      iniciaTransferencia: { valor: '2026-07-23T09:00', comentario: '' },
      terminaTransferencia: { valor: '2026-07-24T14:00', comentario: '' },
      desamarre: { valor: '2026-07-24T15:00', comentario: '' },
      firmaDocumentos: { valor: '2026-07-24T15:30', comentario: '' },
      zarpe: { valor: '2026-07-24T17:00', comentario: '' }
    },
    estado: 'Revisado', revisado: true
  },
  {
    // Ejemplo de "En Proceso": ya se registró la primera actividad (ETA/
    // Arriba) pero todavía faltan actividades de Loading por completar —
    // por eso el estado automático se queda en "En Proceso" y no avanza a
    // "Completado" (ver opTodasActividadesCompletas).
    id: 'OP007', nominacionId: 'NOM001', per: 'PER/09461-25', tipoOperacion: 'Loading',
    fechaInicio: '2026-08-19', fechaFin: '2026-08-20', fechaFinReal: '', nroViaje: 'V-2245',
    nave: 'MEGARA', terminalInicial: 'Callao', terminalDestino: 'Supe',
    estimacionFechaHora: '2026-08-19T09:00', productos: ['LNG'],
    personal: [
      { rol: 'Supervisor', nombre: 'Julio César Gómez', principal: true },
      { rol: 'Inspector', nombre: 'Rudy Bravo Flores', principal: false }
    ],
    horarios: {
      eta: { valor: '2026-08-19T05:00', comentario: '' },
      arriba: { valor: '2026-08-19T09:10', comentario: '' },
      fondea: { valor: '', comentario: '' },
      amarre: { valor: '', comentario: '' },
      iniciaCarga: { valor: '', comentario: '' },
      terminaCarga: { valor: '', comentario: '' },
      firmaDocumentos: { valor: '', comentario: '' },
      zarpe: { valor: '', comentario: '' }
    },
    estado: 'En Proceso', revisado: false
  },
  {
    // Segundo ejemplo de "Activo": recién creada, sin ningún Horario
    // cargado todavía — junto con OP002 da dos registros en este estado
    // para poder probar listado/filtros/Gantt con más de un caso.
    id: 'OP008', nominacionId: 'NOM008', per: 'PER/09468-25', tipoOperacion: 'Bunkering',
    fechaInicio: '2026-08-25', fechaFin: '2026-08-26', fechaFinReal: '', nroViaje: 'V-2252',
    nave: 'PACIFIC STAR', terminalInicial: 'Pisco', terminalDestino: '',
    estimacionFechaHora: '2026-08-25T08:00', productos: ['Diesel B5'],
    personal: [
      { rol: 'Supervisor', nombre: 'Bandy Jimenez', principal: true }
    ],
    horarios: opHorariosVacios('Bunkering'),
    estado: 'Activo', revisado: false
  },
  {
    // Tercer ejemplo de "Activo", además de mostrar que una misma
    // Nominación puede originar más de una Operación: NOM005 ya tenía a
    // OP002 y ahora también a esta.
    id: 'OP009', nominacionId: 'NOM005', per: 'PER/09465-25', tipoOperacion: 'Loading',
    fechaInicio: '2026-09-05', fechaFin: '2026-09-06', fechaFinReal: '', nroViaje: 'V-2261',
    nave: 'MEGARA', terminalInicial: 'Callao', terminalDestino: '',
    estimacionFechaHora: '2026-09-05T10:00', productos: ['GLP'],
    personal: [
      { rol: 'Supervisor', nombre: 'Julio César Gómez', principal: true }
    ],
    horarios: opHorariosVacios('Loading'),
    estado: 'Activo', revisado: false
  }
];

function opCargarOperaciones() {
  const raw = localStorage.getItem(OP_STORAGE_KEY);
  const versionGuardada = localStorage.getItem(OP_DEMO_VERSION_KEY);
  if (!raw || versionGuardada !== OP_DEMO_VERSION) {
    const semilla = JSON.parse(JSON.stringify(OPERACIONES_DEMO));
    // Los datos de ejemplo que no arrancan en "Activo" no pasaron de verdad
    // por las transiciones automáticas/manuales que los llevaron ahí, así
    // que no traen ninguna entrada de historial — se deja una de respaldo
    // para que "Ver historial de cambios" no se vea vacío en esos casos
    // (mismo criterio que usa Nominaciones para su propio historial demo).
    const { fecha, hora } = srvFechaHoraActual();
    semilla.forEach(op => {
      op.historial = op.estado !== 'Activo'
        ? [{ fecha, hora, usuario: 'Sistema', tipo: 'estado', campo: 'Estado',
             valorAnterior: 'Activo', valorNuevo: op.estado }]
        : [];
    });
    localStorage.setItem(OP_STORAGE_KEY, JSON.stringify(semilla));
    localStorage.setItem(OP_DEMO_VERSION_KEY, OP_DEMO_VERSION);
    return semilla;
  }
  return JSON.parse(raw);
}

function opGuardarOperaciones(lista) {
  localStorage.setItem(OP_STORAGE_KEY, JSON.stringify(lista));
}

function opSiguienteCodigo() {
  const lista = opCargarOperaciones();
  const max = lista.reduce((acc, o) => Math.max(acc, parseInt(o.id.replace(/\D/g, ''), 10) || 0), 0);
  return 'OP' + String(max + 1).padStart(3, '0');
}

// "Activo" (recién creada, todavía sin ninguna actividad registrada),
// "En Proceso" (ya se le cargó al menos un Horario real) y "Completado"
// (se llenaron todas las actividades del Tipo de Operación) son automáticos
// — reflejan lo que ya pasó con el buque, no una decisión manual.
// "Revisado" solo se alcanza cuando el personal marca "Revisado" en la
// web (ver guardarOperacion) — es el último estado de la operación.
// "Cancelado" es la única transición manual que queda, disponible en
// cualquier momento vía el botón "Cancelar operación" mientras la operación
// no esté ya Revisada o Cancelada (ver opPuedeCancelarse).
function opPuedeCancelarse(estado) {
  return estado !== 'Revisado' && estado !== 'Cancelado';
}

function opBadgeEstado(estado) {
  const mapa = {
    Activo: '<span class="badge badge-vigente"><span class="badge-dot"></span>Activo</span>',
    'En Proceso': '<span class="badge badge-por-vencer"><span class="badge-dot"></span>En Proceso</span>',
    Completado: '<span class="badge badge-pagado"><span class="badge-dot"></span>Completado</span>',
    Revisado: '<span class="badge badge-facturado"><span class="badge-dot"></span>Revisado</span>',
    Cancelado: '<span class="badge badge-cancelado"><span class="badge-dot"></span>Cancelado</span>'
  };
  return mapa[estado] || estado;
}

function opEsEditable(estado) {
  return estado === 'Activo' || estado === 'En Proceso' || estado === 'Completado';
}

function opNominacionPorId(id) {
  return srvCargarNominaciones().find(n => n.id === id);
}

// Cliente/Contacto de una operación se calculan siempre a partir de la
// nominación vinculada (nunca se duplican en el registro de la operación)
// para que jamás queden desactualizados si la nominación cambia.
function opClienteInfo(op) {
  const nom = opNominacionPorId(op.nominacionId);
  if (!nom) return { nombre: '—', contacto: '—' };
  return srvClientePrincipal(nom);
}

function opFormatoFechaHora(valor) {
  if (!valor) return '—';
  const [fecha, hora] = valor.split('T');
  return `${srvFormatoFecha(fecha)}${hora ? ' ' + hora : ''}`;
}

// =================================================
// HISTORIAL DE CAMBIOS — mismo patrón que Nominaciones
// (SRV_CAMPOS_HISTORIAL/srvRegistrarHistorial en servicios.js): registra
// tanto ediciones de campos como cambios de estado (automáticos o vía
// "Cancelar operación") para poder mostrarlos en "Ver historial de cambios".
// =================================================
const OP_CAMPOS_HISTORIAL = [
  { campo: 'nominacionId', etiqueta: 'N° Nominación' },
  { campo: 'nroViaje', etiqueta: 'N° de Viaje' },
  { campo: 'nave', etiqueta: 'Nave' },
  { campo: 'tipoOperacion', etiqueta: 'Tipo de Operación' },
  { campo: 'terminalInicial', etiqueta: 'Terminal Inicial' },
  { campo: 'terminalDestino', etiqueta: 'Terminal Destino' },
  { campo: 'fechaInicio', etiqueta: 'Fecha Inicio(Estimada)', formato: srvFormatoFecha },
  { campo: 'fechaFin', etiqueta: 'Fecha Fin(Estimada)', formato: srvFormatoFecha },
  { campo: 'fechaFinReal', etiqueta: 'Fecha Fin(Real)', formato: v => v ? srvFormatoFecha(v) : '' },
  { campo: 'estimacionFechaHora', etiqueta: 'Estimación Fecha/Hora', formato: opFormatoFechaHora },
  { campo: 'productos', etiqueta: 'Producto(s)', formato: v => (v || []).join(', ') },
  { campo: 'personal', etiqueta: 'Personal', formato: v => (v || []).map(p => `${p.rol}: ${p.nombre}`).join(', ') }
];

function opCompararCamposOperacion(anterior, nuevo) {
  return OP_CAMPOS_HISTORIAL.reduce((entradas, { campo, etiqueta, formato }) => {
    const textoAnterior = formato ? formato(anterior[campo]) : (anterior[campo] || '');
    const textoNuevo = formato ? formato(nuevo[campo]) : (nuevo[campo] || '');
    if (textoAnterior !== textoNuevo) {
      entradas.push({ tipo: 'campo', campo: etiqueta, valorAnterior: textoAnterior || '—', valorNuevo: textoNuevo || '—' });
    }
    return entradas;
  }, []);
}

// Compara Valor y Comentario de cada Actividad (Horarios) entre lo que
// había antes de este guardado y lo que quedó — cada entrada se marca con
// "actividadKey" para que el ícono de historial de esa actividad puntual
// (verHistorialActividadOp) pueda filtrar solo las suyas dentro del
// historial general de la operación, en vez de tener un historial aparte.
function opCompararHorarios(horariosAnterior, horariosNuevo, tipoAnterior, tipoNuevo) {
  const labelPorKey = {};
  [...opHorariosDefsPorTipo(tipoAnterior), ...opHorariosDefsPorTipo(tipoNuevo)].forEach(d => { labelPorKey[d.key] = d.label; });

  const keys = new Set([...Object.keys(horariosAnterior || {}), ...Object.keys(horariosNuevo || {})]);
  const entradas = [];
  keys.forEach(key => {
    const antes = horariosAnterior?.[key] || { valor: '', comentario: '' };
    const despues = horariosNuevo?.[key] || { valor: '', comentario: '' };
    const label = labelPorKey[key] || key;

    const valorAntes = opFormatoFechaHora(antes.valor);
    const valorDespues = opFormatoFechaHora(despues.valor);
    if (valorAntes !== valorDespues) {
      entradas.push({ tipo: 'campo', campo: `${label} — Valor`, valorAnterior: valorAntes, valorNuevo: valorDespues, actividadKey: key });
    }

    if ((antes.comentario || '') !== (despues.comentario || '')) {
      entradas.push({ tipo: 'campo', campo: `${label} — Comentario`, valorAnterior: antes.comentario || '—', valorNuevo: despues.comentario || '—', actividadKey: key });
    }
  });
  return entradas;
}

// Agrega una o más entradas al historial de la operación (más recientes
// primero). "op" se modifica en el sitio; quien llama es responsable de
// persistir la lista con opGuardarOperaciones().
function opRegistrarHistorial(op, entradas) {
  if (!entradas || !entradas.length) return;
  if (!Array.isArray(op.historial)) op.historial = [];
  const { fecha, hora } = srvFechaHoraActual();
  const usuario = srvUsuarioActualNombreCompleto();
  op.historial = [...entradas.map(e => ({ fecha, hora, usuario, ...e })), ...op.historial];
}

function verHistorialOperacion(id) {
  const op = opCargarOperaciones().find(o => o.id === id);
  if (!op) return;

  document.getElementById('historialOpTitulo').textContent = `Historial de cambios — ${op.id}`;
  const tbody = document.getElementById('historialOpTbody');
  const historial = op.historial || [];

  // Los cambios de estado se resaltan (fila teñida + badges en vez de
  // texto plano) igual que en el historial de Nominaciones.
  tbody.innerHTML = historial.length
    ? historial.map(h => {
      const esEstado = h.tipo === 'estado';
      return `
      <tr class="${esEstado ? 'historial-fila-estado' : ''}">
        <td>${h.fecha}</td>
        <td>${h.hora}</td>
        <td>${h.usuario}</td>
        <td>${esEstado ? 'Cambio de estado' : h.campo}</td>
        <td>${esEstado ? opBadgeEstado(h.valorAnterior) : h.valorAnterior}</td>
        <td>${esEstado ? opBadgeEstado(h.valorNuevo) : h.valorNuevo}</td>
      </tr>`;
    }).join('')
    : `<tr><td colspan="6" class="clientes-nom-empty">Esta operación aún no registra cambios</td></tr>`;

  abrirModal('modalHistorialOp');
}

// =================================================
// LISTADO
// =================================================
let opFilasPorPagina = 10;
let opPaginaActual = 1;

// Mismo catálogo de estados que opBadgeEstado — como lista aparte para
// poblar el select "Estado" de Filtros avanzados sin depender del orden
// de las claves de ese objeto.
const OP_ESTADOS_LISTA = ['Activo', 'En Proceso', 'Completado', 'Revisado', 'Cancelado'];

function poblarSelectsFiltrosAvanzadosOp() {
  poblarSelect('filterAvzOpCliente', SRV_CLIENTES_DEMO.map(c => c.razon));
  poblarSelect('filterAvzOpEstado', OP_ESTADOS_LISTA);
  poblarSelect('filterAvzOpNave', SRV_BUQUES);
  poblarSelect('filterAvzOpTipoOperacion', SRV_TIPOS_OPERACION);
  poblarSelect('filterAvzOpTerminalInicial', TERMINALES);
  poblarSelect('filterAvzOpTerminalDestino', TERMINALES);
  poblarSelect('filterAvzOpSupervisor', srvUsuariosPorRol('Supervisor').map(srvNombreCompletoUsuario));
  poblarSelect('filterAvzOpInspector', srvUsuariosPorRol('Inspector').map(srvNombreCompletoUsuario));
  poblarSelect('filterAvzOpTecnico', srvUsuariosPorRol('Técnico Especialista').map(srvNombreCompletoUsuario));
}

// Igual que en Nominaciones (srvObtenerFiltradas): los campos del modal de
// Filtros avanzados quedan siempre presentes en el DOM (solo ocultos por el
// modal cerrado), así que se leen directo de ahí sin un estado paralelo —
// el filtro se aplica de verdad recién cuando renderTablaOperaciones()
// vuelve a correr (botón Aplicar/Buscar/Limpiar).
function opObtenerFiltradas() {
  const lista = opCargarOperaciones();
  const texto = (document.getElementById('searchOperacion')?.value || '').toLowerCase().trim();
  const cliente = document.getElementById('filterAvzOpCliente')?.value || '';
  const estado = document.getElementById('filterAvzOpEstado')?.value || '';
  const revisado = document.getElementById('filterAvzOpRevisado')?.value || '';
  const nave = document.getElementById('filterAvzOpNave')?.value || '';
  const tipoOperacion = document.getElementById('filterAvzOpTipoOperacion')?.value || '';
  const terminalInicial = document.getElementById('filterAvzOpTerminalInicial')?.value || '';
  const terminalDestino = document.getElementById('filterAvzOpTerminalDestino')?.value || '';
  const supervisor = document.getElementById('filterAvzOpSupervisor')?.value || '';
  const inspector = document.getElementById('filterAvzOpInspector')?.value || '';
  const tecnico = document.getElementById('filterAvzOpTecnico')?.value || '';
  const desde = document.getElementById('filterAvzOpInicio')?.value || '';
  const hasta = document.getElementById('filterAvzOpFin')?.value || '';

  return lista.filter(o => {
    const info = opClienteInfo(o);
    if (texto) {
      const enTexto = o.id.toLowerCase().includes(texto) ||
        (o.nominacionId || '').toLowerCase().includes(texto) ||
        (o.per || '').toLowerCase().includes(texto) ||
        info.nombre.toLowerCase().includes(texto) ||
        info.contacto.toLowerCase().includes(texto);
      if (!enTexto) return false;
    }
    if (cliente && info.nombre !== cliente) return false;
    if (estado && o.estado !== estado) return false;
    if (revisado === 'revisada' && !o.revisado) return false;
    if (revisado === 'pendiente' && o.revisado) return false;
    if (nave && o.nave !== nave) return false;
    if (tipoOperacion && o.tipoOperacion !== tipoOperacion) return false;
    if (terminalInicial && o.terminalInicial !== terminalInicial) return false;
    if (terminalDestino && o.terminalDestino !== terminalDestino) return false;
    if (supervisor && !(o.personal || []).some(p => p.rol === 'Supervisor' && p.nombre === supervisor)) return false;
    if (inspector && !(o.personal || []).some(p => p.rol === 'Inspector' && p.nombre === inspector)) return false;
    if (tecnico && !(o.personal || []).some(p => p.rol === 'Técnico Especialista' && p.nombre === tecnico)) return false;
    // Rango: se muestran las operaciones cuyo período [fechaInicio, fechaFin]
    // se cruza con el rango buscado, no solo las que caen exactamente dentro.
    if (desde && o.fechaFin < desde) return false;
    if (hasta && o.fechaInicio > hasta) return false;
    return true;
  }).sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });
}

function renderTablaOperaciones() {
  const tbody = document.getElementById('tbodyOperaciones');
  if (!tbody) return;

  const filtradas = opObtenerFiltradas();
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / opFilasPorPagina));
  if (opPaginaActual > totalPaginas) opPaginaActual = totalPaginas;
  const inicio = (opPaginaActual - 1) * opFilasPorPagina;
  const pagina = filtradas.slice(inicio, inicio + opFilasPorPagina);

  if (!pagina.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="clientes-nom-empty">No se encontraron operaciones</td></tr>`;
  } else {
    tbody.innerHTML = pagina.map(o => {
      const info = opClienteInfo(o);
      return `
      <tr>
        <td class="codigo-col">${o.id}</td>
        <td>${o.nominacionId || '—'}</td>
        <td>${info.nombre}</td>
        <td>${info.contacto}</td>
        <td>${o.nave || '—'}</td>
        <td>${srvFormatoFecha(o.fechaInicio)}</td>
        <td>${srvFormatoFecha(o.fechaFin)}</td>
        <td>${opBadgeEstado(o.estado)}</td>
        <td class="opciones">
          <button class="btn-accion btn-editar" title="Ver operación" onclick="verOperacion('${o.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-accion btn-editar" title="Editar operación" onclick="editarOperacion('${o.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
          <button class="btn-accion btn-reset" title="Ver historial de cambios" onclick="verHistorialOperacion('${o.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 2.636-6.364L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  renderPaginacionOperaciones(totalPaginas, filtradas.length, inicio);
}

function renderPaginacionOperaciones(totalPaginas) {
  const cont = document.getElementById('pagBtnsOp');
  if (!cont) return;
  let html = `<button class="pag-btn pag-btn-nav" onclick="cambiarPaginaOp(-1)" ${opPaginaActual === 1 ? 'disabled' : ''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
  </button>`;
  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button class="pag-btn ${i === opPaginaActual ? 'active' : ''}" onclick="irAPaginaOp(${i})">${i}</button>`;
  }
  html += `<button class="pag-btn pag-btn-nav" onclick="cambiarPaginaOp(1)" ${opPaginaActual === totalPaginas ? 'disabled' : ''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
  </button>`;
  cont.innerHTML = html;
}

function irAPaginaOp(pagina) { opPaginaActual = pagina; renderTablaOperaciones(); }
function cambiarPaginaOp(delta) { opPaginaActual += delta; renderTablaOperaciones(); }
function cambiarFilasOperaciones(valor) { opFilasPorPagina = valor; opPaginaActual = 1; renderTablaOperaciones(); }

function aplicarFiltrosOp() {
  opPaginaActual = 1;
  renderTablaOperaciones();
  opActualizarBotonFiltrosAvanzados();
}

function limpiarFiltrosOp() {
  const search = document.getElementById('searchOperacion');
  if (search) search.value = '';
  opLimpiarCamposFiltrosAvanzados();
  aplicarFiltrosOp();
}

const OP_IDS_FILTROS_AVANZADOS = [
  'filterAvzOpCliente', 'filterAvzOpEstado', 'filterAvzOpRevisado', 'filterAvzOpNave',
  'filterAvzOpTipoOperacion', 'filterAvzOpTerminalInicial', 'filterAvzOpTerminalDestino',
  'filterAvzOpSupervisor', 'filterAvzOpInspector', 'filterAvzOpTecnico',
  'filterAvzOpInicio', 'filterAvzOpFin'
];

function opLimpiarCamposFiltrosAvanzados() {
  OP_IDS_FILTROS_AVANZADOS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function opContarFiltrosAvanzadosActivos() {
  return OP_IDS_FILTROS_AVANZADOS.reduce((acc, id) => acc + (document.getElementById(id)?.value ? 1 : 0), 0);
}

function opActualizarBotonFiltrosAvanzados() {
  const btn = document.getElementById('btnFiltrosAvanzadosOp');
  const badge = document.getElementById('filtrosAvanzadosOpBadge');
  if (!btn || !badge) return;
  const activos = opContarFiltrosAvanzadosActivos();
  btn.classList.toggle('activo', activos > 0);
  badge.style.display = activos > 0 ? '' : 'none';
  badge.textContent = activos;
}

function abrirModalFiltrosAvanzadosOp() {
  abrirModal('modalFiltrosAvanzadosOp');
}

function aplicarFiltrosAvanzadosModalOp() {
  cerrarModal('modalFiltrosAvanzadosOp');
  aplicarFiltrosOp();
}

function limpiarFiltrosAvanzadosModalOp() {
  opLimpiarCamposFiltrosAvanzados();
  cerrarModal('modalFiltrosAvanzadosOp');
  aplicarFiltrosOp();
}

function irANuevaOperacion() {
  window.location.href = 'seguimiento-operaciones.html?nuevo=1';
}

function irAOperaciones() {
  window.location.href = 'seguimiento-operaciones.html';
}

function editarOperacion(id) {
  window.location.href = `seguimiento-operaciones.html?id=${id}`;
}

// Misma vista que Editar, pero forzada a solo lectura (ver
// srvOpCargarFormularioParaEdicion) — sin importar el estado real de la
// operación, no se puede tocar ni un campo ni disparar ninguna acción.
function verOperacion(id) {
  window.location.href = `seguimiento-operaciones.html?id=${id}&ver=1`;
}

// =================================================
// FORMULARIO — NUEVA / EDITAR OPERACIÓN
// =================================================
let opEditandoId = null;
let opModoSoloLectura = false;
let opPersonalFormulario = [];
let opProductosFormulario = [];
let opHorariosFormulario = {};
let opRevisadoActual = false;
// Bloqueo "duro": la operación ya estaba en un estado no editable (o ya
// venía Revisada) al abrir el formulario — no cambia durante la sesión.
let opBloqueadaPorEstadoActual = false;
// Estado real/persistido de la operación al abrir el formulario (o null si
// es una operación nueva) — sirve para volver a mostrarlo en el badge si el
// usuario desmarca "Revisado" antes de guardar.
let opEstadoBaseFormulario = null;
// true cuando se entró desde el botón "Ver" (ojo) de la grilla — fuerza
// solo lectura sin importar el estado real de la operación, y oculta toda
// acción (Guardar, Revisado, Cancelar operación).
let opModoVisualizacion = false;

// Campos que se bloquean por completo apenas la operación queda marcada
// "Revisado" — el mismo set que antes solo se aplicaba al reabrir una
// operación ya bloqueada por estado, ahora también en vivo al tildar el
// botón, para que "ya no se puede cambiar los datos" sea inmediato y no
// dependa de guardar y volver a entrar.
const OP_CAMPOS_BLOQUEABLES = [
  'opNominacionSelect', 'opNroViaje', 'opNave', 'opTipoOperacion', 'opTerminalInicial',
  'opTerminalDestino', 'opEstimacionFechaHora', 'opFechaInicio', 'opFechaFin', 'opFechaFinReal'
];

function poblarSelectsFormularioOp() {
  poblarSelect('opNave', SRV_BUQUES);
  // Los terminales son los mismos 14 puertos del Pacífico del módulo
  // Distancias - Horas (TERMINALES/D, definidos en operaciones.js) — así
  // la Estimación Fecha/Hora se puede calcular con la misma matriz de
  // distancias en vez de mantener un catálogo de terminales aparte.
  poblarSelect('opTerminalInicial', TERMINALES);
  poblarSelect('opTerminalDestino', TERMINALES);
  poblarSelect('opPersonalRol', OP_ROLES);
  // Mismo catálogo que "Tipo de Operación" en Nominaciones (SRV_TIPOS_OPERACION) —
  // de él dependen las actividades que se muestran en Horarios.
  poblarSelect('opTipoOperacion', SRV_TIPOS_OPERACION);

  // Solo nominaciones Vigentes pueden dar origen a una operación nueva —
  // son las que ya completaron su Aceptación del Servicio. Si se está
  // editando una operación cuya nominación cambió de estado después de
  // creada, esa opción se agrega igual para no perder la referencia.
  const nominaciones = srvCargarNominaciones();
  const vigentes = nominaciones.filter(n => n.estado === 'Vigente');
  const opActual = opEditandoId ? opCargarOperaciones().find(o => o.id === opEditandoId) : null;
  if (opActual && !vigentes.some(n => n.id === opActual.nominacionId)) {
    const actual = nominaciones.find(n => n.id === opActual.nominacionId);
    if (actual) vigentes.unshift(actual);
  }

  const select = document.getElementById('opNominacionSelect');
  select.innerHTML = '<option value="">Seleccionar Servicio</option>' +
    vigentes.map(n => `<option value="${n.id}">${n.id} — ${n.per || 's/PER'}</option>`).join('');
}

// Autocompleta los datos de la operación con los de la nominación elegida
// — así "Operaciones" nace siempre a partir de una Nominación existente en
// vez de capturar los mismos datos por segunda vez.
function srvOpAplicarNominacion(nomId) {
  const nom = opNominacionPorId(nomId);
  if (!nom) return;

  document.getElementById('opPer').value = nom.per || '';
  document.getElementById('opNave').value = nom.buque || '';
  document.getElementById('opTerminalInicial').value = opTerminalDesdeLocacion(nom.locacion);
  document.getElementById('opFechaInicio').value = nom.fechaInicio || '';
  document.getElementById('opFechaFin').value = nom.fechaFin || '';
  document.getElementById('opTipoOperacion').value = nom.tipoOperacion || '';

  opProductosFormulario = [...(nom.productos || [])];
  renderProductosFormularioOp();

  opPersonalFormulario = [];
  if (nom.supervisor) opPersonalFormulario.push({ rol: 'Supervisor', nombre: nom.supervisor, principal: true });
  (nom.inspectores || []).forEach(nombre => opPersonalFormulario.push({ rol: 'Inspector', nombre, principal: false }));
  renderPersonalFormularioOp();

  opAlCambiarTipoOperacion();
  opSincronizarOpcionesTerminales();
  opCalcularEstimacionHoras();
  mostrarToast('Datos de la nominación cargados. Puedes ajustarlos antes de guardar.');
}

// La "Locación" de la nominación (catálogo propio de Servicios, ej. "Terminal
// Callao") no es exactamente uno de los 14 puertos de TERMINALES — se busca
// por coincidencia de texto para preseleccionar el Terminal Inicial; si no
// hay coincidencia, se deja en blanco para que el usuario lo elija.
function opTerminalDesdeLocacion(locacion) {
  if (!locacion) return '';
  const texto = locacion.toLowerCase();
  return TERMINALES.find(t => texto.includes(t.toLowerCase())) || '';
}

// Terminal Inicial y Terminal Destino no pueden ser el mismo puerto — en vez
// de dejar elegirlo y recién avisar después, se deshabilita en cada select
// la opción que ya está elegida en el otro (mismo criterio que Distancias -
// Horas, pero evitado desde el propio combo en lugar de con un mensaje).
function opSincronizarOpcionesTerminales() {
  const inicialSel = document.getElementById('opTerminalInicial');
  const destinoSel = document.getElementById('opTerminalDestino');
  if (!inicialSel || !destinoSel) return;

  Array.from(destinoSel.options).forEach(opt => {
    opt.disabled = !!opt.value && opt.value === inicialSel.value;
  });
  Array.from(inicialSel.options).forEach(opt => {
    opt.disabled = !!opt.value && opt.value === destinoSel.value;
  });
}

function opAlCambiarTerminal() {
  opSincronizarOpcionesTerminales();
  opCalcularEstimacionHoras();
}

// Calcula la Estimación Fecha/Hora sumando a la Fecha Inicio las horas de
// distancia entre Terminal Inicial y Terminal Destino — la misma matriz
// (TERMINALES/D) que pinta la grilla de Distancias - Horas, para que ambos
// módulos hablen de los mismos puertos y los mismos tiempos de navegación.
function opCalcularEstimacionHoras() {
  const iVal = document.getElementById('opTerminalInicial')?.value;
  const dVal = document.getElementById('opTerminalDestino')?.value;
  if (!iVal || !dVal) return;

  const i = TERMINALES.indexOf(iVal);
  const j = TERMINALES.indexOf(dVal);
  if (i === -1 || j === -1) return;

  // La Estimación se calcula apenas se eligen ambos terminales, aunque la
  // Fecha Inicio todavía no se haya llenado — en ese caso se toma la fecha
  // de hoy como base y se recalcula sola en cuanto se complete/cambie la
  // Fecha Inicio (ver el onchange en ese campo).
  const fechaInicioInput = document.getElementById('opFechaInicio');
  const fechaBase = fechaInicioInput?.value || new Date().toISOString().slice(0, 10);

  const campoEstimacion = document.getElementById('opEstimacionFechaHora');
  const pad = n => String(n).padStart(2, '0');

  // Mismo aviso que usa Distancias - Horas (buscarDistancia, operaciones.js)
  // ante el mismo par de terminales: no hay una distancia real que calcular.
  if (i === j) {
    campoEstimacion.value = '';
    mostrarToast('El terminal de inicio y destino no pueden ser iguales');
    return;
  }

  const horas = D[Math.max(i, j)][Math.min(i, j)];
  if (horas === null || horas === undefined) {
    mostrarToast('No hay distancia registrada entre estos terminales — ingresa la estimación manualmente.');
    return;
  }

  const estimado = new Date(`${fechaBase}T00:00`);
  estimado.setHours(estimado.getHours() + horas);
  campoEstimacion.value = `${estimado.getFullYear()}-${pad(estimado.getMonth() + 1)}-${pad(estimado.getDate())}T${pad(estimado.getHours())}:${pad(estimado.getMinutes())}`;
  mostrarToast(`Estimación calculada: ${horas} h de navegación entre ${iVal} y ${dVal}.`);
}

// =================================================
// PRODUCTO(S) — mismo patrón de búsqueda + chips que Nominaciones
// (catálogo de Tablas Generales, con texto libre como respaldo).
// =================================================
function renderProductosFormularioOp() {
  const cont = document.getElementById('opProductosList');
  if (!cont) return;
  cont.innerHTML = opProductosFormulario.map((p, i) => `
    <span class="chip-tag">
      <span>${p}</span>
      ${opModoSoloLectura ? '' : `<button type="button" onclick="srvOpQuitarProducto(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>`}
    </span>
  `).join('');
}

function srvOpBuscarProductosSugeridos(texto) {
  const cont = document.getElementById('opProductoSugerencias');
  if (!cont) return;
  const q = texto.trim().toLowerCase();

  const disponibles = cargarProductos().filter(p => !opProductosFormulario.includes(p.nombre));
  const coincidencias = q
    ? disponibles.filter(p => p.nombre.toLowerCase().includes(q))
    : disponibles;

  if (!coincidencias.length) {
    cont.innerHTML = `<div class="nom-cliente-sugerencia-vacio">${q ? 'Sin coincidencias en el catálogo — presiona Añadir para usar este texto' : 'Todos los productos del catálogo ya fueron agregados'}</div>`;
  } else {
    cont.innerHTML = coincidencias.map(p => `
      <div class="nom-cliente-sugerencia" onclick="srvOpSeleccionarProductoSugerido('${p.nombre.replace(/'/g, "\\'")}')">
        <span class="sug-razon">${p.nombre}</span>
      </div>
    `).join('');
  }
  cont.classList.add('open');
}

function srvOpSeleccionarProductoSugerido(nombre) {
  const input = document.getElementById('opProductoInput');
  if (input) input.value = nombre;
  document.getElementById('opProductoSugerencias')?.classList.remove('open');
  srvOpActualizarBotonProducto();
}

function srvOpActualizarBotonProducto() {
  const btn = document.getElementById('btnAgregarProductoOp');
  const input = document.getElementById('opProductoInput');
  if (btn && input) btn.disabled = !input.value.trim();
}

function srvOpAgregarProducto() {
  const input = document.getElementById('opProductoInput');
  const valor = input.value.trim();

  if (!valor) {
    mostrarToast('Escriba o seleccione un producto');
    return;
  }
  if (opProductosFormulario.includes(valor)) {
    mostrarToast('Ese producto ya fue agregado');
    return;
  }

  opProductosFormulario.push(valor);
  renderProductosFormularioOp();
  input.value = '';
  document.getElementById('opProductoSugerencias')?.classList.remove('open');
  srvOpActualizarBotonProducto();
}

function srvOpQuitarProducto(indice) {
  opProductosFormulario.splice(indice, 1);
  renderProductosFormularioOp();
}

function srvOpPoblarPersonalPorRol() {
  const rol = document.getElementById('opPersonalRol').value;
  const input = document.getElementById('opPersonalInput');
  input.value = '';
  document.getElementById('opPersonalSugerencias')?.classList.remove('open');
  input.disabled = !rol;
  input.placeholder = rol ? 'Buscar personal...' : 'Seleccione un rol primero...';
  document.getElementById('btnAgregarPersonalOp').disabled = true;
}

// Mismo componente visual que el picker de Inspector(es) en Nominaciones
// (srvBuscarInspectoresSugeridos): buscador de texto libre + lista de
// sugerencias con el badge de Disponibilidad de cada persona
// (srvEstadoDisponibilidadInspector/SRV_ESTADO_DISP_*, servicios.js),
// filtrada primero por el Rol elegido.
function srvOpBuscarPersonalSugerido(texto) {
  const rol = document.getElementById('opPersonalRol').value;
  const cont = document.getElementById('opPersonalSugerencias');
  if (!cont || !rol) return;
  const q = texto.trim().toLowerCase();

  const disponibles = srvUsuariosPorRol(rol).map(srvNombreCompletoUsuario)
    .filter(nombre => !opPersonalFormulario.some(p => p.nombre === nombre));
  const coincidencias = q ? disponibles.filter(n => n.toLowerCase().includes(q)) : disponibles;

  const fechaInicio = document.getElementById('opFechaInicio')?.value;
  const fechaFin = document.getElementById('opFechaFin')?.value;

  if (!coincidencias.length) {
    cont.innerHTML = `<div class="nom-cliente-sugerencia-vacio">${q ? `Sin coincidencias — solo se pueden agregar usuarios con rol ${rol}` : `No hay más usuarios con rol ${rol} disponibles`}</div>`;
  } else {
    cont.innerHTML = coincidencias.map(nombre => {
      const estado = srvEstadoDisponibilidadInspector(nombre, fechaInicio, fechaFin);
      const badge = estado
        ? `<span class="badge ${SRV_ESTADO_DISP_BADGE[estado]}"><span class="badge-dot"></span>${SRV_ESTADO_DISP_LABEL[estado]}</span>`
        : `<span class="nom-cliente-sugerencia-agregado" style="padding:0">Ingrese fechas para ver disponibilidad</span>`;
      return `
      <div class="nom-cliente-sugerencia" onclick="srvOpSeleccionarPersonalSugerido('${nombre.replace(/'/g, "\\'")}')">
        <div class="nom-inspector-sugerencia-fila">
          <span class="sug-razon">${nombre}</span>
          ${badge}
        </div>
      </div>`;
    }).join('');
  }
  cont.classList.add('open');
}

function srvOpSeleccionarPersonalSugerido(nombre) {
  const input = document.getElementById('opPersonalInput');
  if (input) input.value = nombre;
  document.getElementById('opPersonalSugerencias')?.classList.remove('open');
  document.getElementById('btnAgregarPersonalOp').disabled = false;
}

document.addEventListener('click', (e) => {
  const sugerencias = document.getElementById('opPersonalSugerencias');
  if (sugerencias?.classList.contains('open') && !document.getElementById('opPersonalBuscadorWrap')?.contains(e.target)) {
    sugerencias.classList.remove('open');
  }
});

function srvOpAgregarPersonal() {
  const rol = document.getElementById('opPersonalRol').value;
  const nombre = document.getElementById('opPersonalInput').value.trim();
  if (!rol || !nombre) return;

  const encontrado = srvUsuariosPorRol(rol).find(u => srvNombreCompletoUsuario(u) === nombre);
  if (!encontrado) {
    mostrarToast(`Seleccione un/a ${rol} válido/a de la lista sugerida`);
    return;
  }
  if (opPersonalFormulario.some(p => p.nombre === nombre)) {
    mostrarToast(`${nombre} ya está asignado a esta operación.`);
    return;
  }

  opPersonalFormulario.push({ rol, nombre, principal: opPersonalFormulario.length === 0 });
  renderPersonalFormularioOp();

  // Mismo aviso no bloqueante que Nominaciones al agregar un Inspector que
  // no figura disponible en el rango de fechas (ver srvAgregarInspectorNom).
  const fechaInicio = document.getElementById('opFechaInicio')?.value;
  const fechaFin = document.getElementById('opFechaFin')?.value;
  const estado = srvEstadoDisponibilidadInspector(nombre, fechaInicio, fechaFin);
  if (estado && estado !== 'disponible') {
    mostrarToast(`${nombre} no figura disponible (${SRV_ESTADO_DISP_LABEL[estado]}) en el rango de fechas de esta operación`);
  }

  document.getElementById('opPersonalRol').value = '';
  srvOpPoblarPersonalPorRol();
}

// Se llama al cambiar Fecha Inicio/Fecha Fin (Estimadas): recalcula la
// Disponibilidad mostrada tanto en la tabla de personal ya asignado como en
// las sugerencias de personal a agregar (si están abiertas) — mismo
// criterio que srvRefrescarSugerenciasInspectorPorFecha en Nominaciones.
function opRefrescarDisponibilidadPersonal() {
  renderPersonalFormularioOp();
  const cont = document.getElementById('opPersonalSugerencias');
  if (cont?.classList.contains('open')) srvOpBuscarPersonalSugerido(document.getElementById('opPersonalInput')?.value || '');
  opAvisarConflictosPersonalPorFecha();
}

// Aviso puramente informativo (no bloquea nada) cuando el nuevo rango de
// fechas deja a alguien YA asignado con conflicto de disponibilidad —
// mismo mensaje/formato que usa srvOpAgregarPersonal al agregar a alguien
// no disponible, solo que acá lo dispara el cambio de fecha en vez del alta.
function opAvisarConflictosPersonalPorFecha() {
  const fechaInicio = document.getElementById('opFechaInicio')?.value;
  const fechaFin = document.getElementById('opFechaFin')?.value;
  if (!fechaInicio || !fechaFin) return;

  const ocupados = opPersonalFormulario
    .map(p => ({ nombre: p.nombre, estado: srvEstadoDisponibilidadInspector(p.nombre, fechaInicio, fechaFin) }))
    .filter(p => p.estado && p.estado !== 'disponible');

  if (!ocupados.length) return;
  if (ocupados.length === 1) {
    const { nombre, estado } = ocupados[0];
    mostrarToast(`${nombre} no figura disponible (${SRV_ESTADO_DISP_LABEL[estado]}) en el nuevo rango de fechas de esta operación`);
  } else {
    mostrarToast(`${ocupados.map(p => p.nombre).join(', ')} no figuran disponibles en el nuevo rango de fechas de esta operación`);
  }
}

function renderPersonalFormularioOp() {
  const tbody = document.getElementById('tbodyPersonalOp');
  if (!tbody) return;

  if (!opPersonalFormulario.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="clientes-nom-empty">Aún no se ha asignado personal</td></tr>`;
    return;
  }

  const fechaInicio = document.getElementById('opFechaInicio')?.value;
  const fechaFin = document.getElementById('opFechaFin')?.value;

  tbody.innerHTML = opPersonalFormulario.map((p, i) => {
    const estado = srvEstadoDisponibilidadInspector(p.nombre, fechaInicio, fechaFin);
    const badgeDisponibilidad = estado
      ? `<span class="badge ${SRV_ESTADO_DISP_BADGE[estado]}"><span class="badge-dot"></span>${SRV_ESTADO_DISP_LABEL[estado]}</span>`
      : '<span class="clientes-nom-empty" style="padding:0">Ingrese fechas</span>';
    return `
    <tr class="${p.principal ? 'fila-encargado-nom' : ''}">
      <td>${i + 1}</td>
      <td>${p.rol}</td>
      <td>${p.nombre}</td>
      <td>${badgeDisponibilidad}</td>
      <td style="text-align:center">
        ${opModoSoloLectura
          ? (p.principal ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' : '—')
          : `<input type="checkbox" class="principal-check-nom" title="Marcar como principal" ${p.principal ? 'checked' : ''} onchange="marcarPrincipalPersonalOp(${i}, this)">`}
      </td>
      <td>
        ${opModoSoloLectura ? '' : `<button class="btn-accion btn-eliminar" title="Quitar" onclick="quitarPersonalOp(${i})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>`}
      </td>
    </tr>`;
  }).join('');
}

function marcarPrincipalPersonalOp(indice, checkbox) {
  if (checkbox.checked) {
    opPersonalFormulario.forEach((p, i) => p.principal = i === indice);
  } else {
    opPersonalFormulario[indice].principal = false;
  }
  renderPersonalFormularioOp();
}

function quitarPersonalOp(indice) {
  opPersonalFormulario.splice(indice, 1);
  if (!opPersonalFormulario.some(p => p.principal) && opPersonalFormulario.length) {
    opPersonalFormulario[0].principal = true;
  }
  renderPersonalFormularioOp();
}

// =================================================
// HORARIOS — dinámicos según el Tipo de Operación elegido
// =================================================

// Reconstruye la grilla de Horarios para el tipo actual; conserva los
// valores ya cargados en las claves que siguen existiendo en el nuevo tipo
// (ej. eta/zarpe/firmaDocumentos, comunes a todos) y descarta el resto.
function opAlCambiarTipoOperacion() {
  const tipo = document.getElementById('opTipoOperacion')?.value || '';
  const nuevo = {};
  opHorariosDefsPorTipo(tipo).forEach(h => {
    nuevo[h.key] = opHorariosFormulario[h.key] || { valor: '', comentario: '', leido: true };
  });
  opHorariosFormulario = nuevo;
  renderHorariosGrid(tipo);
  aplicarHorariosAlFormulario(tipo);
}

function renderHorariosGrid(tipo) {
  const cont = document.getElementById('opHorariosGrid');
  if (!cont) return;
  const defs = opHorariosDefsPorTipo(tipo);

  if (!defs.length) {
    cont.innerHTML = `<div class="clientes-nom-empty" style="grid-column:1/-1">Selecciona el Tipo de Operación para ver sus actividades.</div>`;
    return;
  }

  // Una operación puede durar varios días y sus datos se van completando en
  // el camino — muchas veces desde la app de campo, no desde esta pantalla.
  // Por eso el valor puede quedar vacío mientras solo haya un comentario
  // (ej. "buque a la espera, sin hora confirmada") y el ícono de comentario
  // marca con un punto los que todavía no se revisaron en la web.
  cont.innerHTML = defs.map(h => `
    <div class="op-horario-campo">
      <label>
        <span>${h.label}</span>
        <span class="op-horario-acciones">
          <button type="button" class="op-comment-btn op-historial-actividad-btn" title="Ver historial de esta actividad" onclick="verHistorialActividadOp('${h.key}', '${h.label.replace(/'/g, "\\'")}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 2.636-6.364L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
          </button>
          <button type="button" class="op-comment-btn" id="opComBtn_${h.key}" title="Agregar comentario" onclick="toggleComentarioHorario('${h.key}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="op-comment-dot"></span>
          </button>
        </span>
      </label>
      <input type="datetime-local" id="opHor_${h.key}" onchange="opActualizarHorario('${h.key}')">
      <textarea class="op-comentario-horario" id="opComTxt_${h.key}" placeholder="Comentario sobre ${h.label.toLowerCase()}..." style="display:none" oninput="opActualizarComentarioHorario('${h.key}', this.value)"></textarea>
    </div>
  `).join('');
}

// Historial de cambios de una actividad puntual (Fecha/Hora y Comentario) —
// reutiliza el mismo modal que "Ver historial de cambios" de la operación
// (modalHistorialOp), pero filtrado solo a las entradas de esta actividad
// (marcadas con actividadKey al guardar, ver opCompararHorarios). Al vivir
// dentro del historial propio de la operación, nunca mezcla datos de otra
// operación aunque dos compartan el mismo tipo/actividad.
function verHistorialActividadOp(key, label) {
  if (!opEditandoId) {
    mostrarToast('Guarda la operación para poder ver el historial de esta actividad.');
    return;
  }
  const op = opCargarOperaciones().find(o => o.id === opEditandoId);
  if (!op) return;

  const historial = (op.historial || []).filter(h => h.actividadKey === key);

  document.getElementById('historialOpTitulo').textContent = `Historial de "${label}" — ${op.id}`;
  const tbody = document.getElementById('historialOpTbody');
  tbody.innerHTML = historial.length
    ? historial.map(h => `
      <tr>
        <td>${h.fecha}</td>
        <td>${h.hora}</td>
        <td>${h.usuario}</td>
        <td>${h.campo}</td>
        <td>${h.valorAnterior}</td>
        <td>${h.valorNuevo}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" class="clientes-nom-empty">Esta actividad aún no registra cambios</td></tr>`;

  abrirModal('modalHistorialOp');
}

// Abrir el comentario cuenta como "leerlo": si llegó sin revisar desde la
// app, el punto desaparece apenas el usuario lo despliega en la web.
function toggleComentarioHorario(key) {
  const txt = document.getElementById(`opComTxt_${key}`);
  const btn = document.getElementById(`opComBtn_${key}`);
  if (!txt) return;
  const abrir = txt.style.display === 'none';
  txt.style.display = abrir ? '' : 'none';
  btn.classList.toggle('activo', abrir || !!txt.value);
  if (abrir) txt.focus();

  if (abrir && opHorariosFormulario[key] && !opHorariosFormulario[key].leido) {
    opHorariosFormulario[key].leido = true;
    btn.classList.remove('sin-leer');
  }
}

function opActualizarHorario(key) {
  const input = document.getElementById(`opHor_${key}`);
  if (!opHorariosFormulario[key]) opHorariosFormulario[key] = { valor: '', comentario: '', leido: true };
  opHorariosFormulario[key].valor = input.value;
}

// Un comentario que el propio usuario está escribiendo en la web nunca
// cuenta como "no leído" — ese estado es solo para lo que llega de afuera
// (la app de campo) y todavía no se abrió acá.
function opActualizarComentarioHorario(key, valor) {
  if (!opHorariosFormulario[key]) opHorariosFormulario[key] = { valor: '', comentario: '', leido: true };
  opHorariosFormulario[key].comentario = valor;
  opHorariosFormulario[key].leido = true;
  const btn = document.getElementById(`opComBtn_${key}`);
  btn?.classList.toggle('activo', !!valor);
  btn?.classList.remove('sin-leer');
}

function aplicarHorariosAlFormulario(tipo) {
  opHorariosDefsPorTipo(tipo).forEach(h => {
    const dato = opHorariosFormulario[h.key] || { valor: '', comentario: '', leido: true };
    const input = document.getElementById(`opHor_${h.key}`);
    const txt = document.getElementById(`opComTxt_${h.key}`);
    const btn = document.getElementById(`opComBtn_${h.key}`);
    const sinLeer = !!dato.comentario && dato.leido === false;
    if (input) input.value = dato.valor || '';
    if (txt) {
      txt.value = dato.comentario || '';
      // Un comentario no leído queda colapsado a propósito — recién se
      // despliega (y se marca como leído) cuando el usuario abre el ícono,
      // igual que una notificación. Uno ya leído se muestra abierto de una.
      txt.style.display = (dato.comentario && !sinLeer) ? '' : 'none';
    }
    if (btn) {
      btn.classList.toggle('activo', !!dato.comentario);
      btn.classList.toggle('sin-leer', sinLeer);
    }
  });
}

// =================================================
// REVISADO / ESTADO
// =================================================
// Marcar "Revisado" es una decisión definitiva, no un borrador: al
// confirmarla se valida, se bloquea el formulario, se guarda de inmediato
// (mismo camino que el botón Guardar) y se vuelve al listado ya como
// Revisado — así no queda una pantalla intermedia con botones que ya no
// aplican (Cancelar operación, el propio Revisado) por mostrar u ocultar.
// Desmarcarla no pide confirmación: mientras no se guarde, es reversible y
// no tiene efecto sobre datos persistidos.
function toggleRevisadoOp() {
  if (opRevisadoActual) {
    opRevisadoActual = false;
    actualizarBotonRevisadoOp();
    return;
  }
  confirmarAccion(
    '¿Deseas marcar esta operación como Revisada? Al hacerlo pasará a estado "Revisado", se guardará de inmediato y sus datos ya no se podrán editar.',
    () => {
      if (!srvOpValidarFormulario()) return;
      opRevisadoActual = true;
      actualizarBotonRevisadoOp();
      guardarOperacion();
    }
  );
}

// Bloquea/desbloquea todos los campos del formulario (mismo criterio que
// antes solo se aplicaba al reabrir una operación ya cerrada): los datos
// generales, Personal, Producto(s) y cada Horario con su comentario. Se
// reutiliza tanto al cargar el formulario como en vivo cada vez que se
// marca/desmarca "Revisado" durante la edición.
function opActualizarLectura(bloquear) {
  opModoSoloLectura = bloquear;

  OP_CAMPOS_BLOQUEABLES.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = bloquear;
  });
  document.querySelector('.op-personal-row')?.style.setProperty('display', bloquear ? 'none' : '');
  document.querySelector('.nom-producto-row')?.style.setProperty('display', bloquear ? 'none' : '');

  const tipo = document.getElementById('opTipoOperacion')?.value || '';
  opHorariosDefsPorTipo(tipo).forEach(h => {
    const input = document.getElementById(`opHor_${h.key}`);
    if (input) input.disabled = bloquear;
    const btn = document.getElementById(`opComBtn_${h.key}`);
    if (btn) btn.disabled = bloquear;
    // El botón de comentario queda deshabilitado en bloqueo, así que un
    // comentario pendiente de leer se despliega solo (si no, quedaría
    // escondido sin forma de abrirlo) y se marca como leído.
    if (bloquear && btn?.classList.contains('sin-leer')) {
      btn.classList.remove('sin-leer');
      const dato = opHorariosFormulario[h.key];
      if (dato) dato.leido = true;
      const txt = document.getElementById(`opComTxt_${h.key}`);
      if (txt) txt.style.display = '';
    }
  });

  // Vuelve a pintar Personal y Producto(s) para que sus botones de quitar
  // aparezcan u oculten según el nuevo modo de solo lectura.
  renderPersonalFormularioOp();
  renderProductosFormularioOp();
}

// Fecha Fin(Estimada) es la que se maneja mientras la operación sigue en
// curso; al marcar "Revisado" se completa Fecha Fin(Real) —con la fecha de
// hoy como valor sugerido— y, de inmediato, todo el formulario (incluida
// esa misma fecha) queda bloqueado: revisar es la señal de que el personal
// ya da los datos por conformes, así que no hace falta guardar y volver a
// entrar para que el bloqueo tenga efecto.
function actualizarBotonRevisadoOp() {
  const btn = document.getElementById('btnRevisadoOp');
  const texto = document.getElementById('btnRevisadoOpTexto');
  if (!btn) return;
  btn.classList.toggle('activo', opRevisadoActual);
  texto.textContent = opRevisadoActual ? 'Revisado' : 'Marcar como revisado';

  const campoReal = document.getElementById('opFechaFinReal');
  if (campoReal && opRevisadoActual && !campoReal.value) {
    const hoy = new Date();
    const pad = n => String(n).padStart(2, '0');
    campoReal.value = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  }

  opActualizarLectura(opBloqueadaPorEstadoActual || opRevisadoActual);

  const badgeEl = document.getElementById('tituloFormOpEstado');
  if (badgeEl) {
    badgeEl.innerHTML = opRevisadoActual
      ? opBadgeEstado('Revisado')
      : (opEstadoBaseFormulario ? opBadgeEstado(opEstadoBaseFormulario) : '');
  }
}

// Cancelar es la única transición manual que queda — disponible en
// cualquier momento (Activo, En Proceso o Completado) sin pasar por un
// modal de selección, ya que "Cancelado" es el único destino posible.
function cancelarOperacionOp() {
  if (!opEditandoId) return;
  const op = opCargarOperaciones().find(o => o.id === opEditandoId);
  if (!op || !opPuedeCancelarse(op.estado)) return;

  confirmarAccion(`¿Deseas cancelar la operación ${op.id}? Esta acción no se puede deshacer.`, () => {
    const lista = opCargarOperaciones();
    const actualizar = lista.find(o => o.id === opEditandoId);
    if (!actualizar) return;
    const estadoAnterior = actualizar.estado;
    actualizar.estado = 'Cancelado';
    opRegistrarHistorial(actualizar, [
      { tipo: 'estado', campo: 'Estado', valorAnterior: estadoAnterior, valorNuevo: 'Cancelado' }
    ]);
    opGuardarOperaciones(lista);
    mostrarToast(`La operación ${actualizar.id} fue cancelada.`);
    setTimeout(irAOperaciones, 700);
  });
}

// =================================================
// CARGAR / VALIDAR / GUARDAR
// =================================================
function srvOpCargarFormularioParaEdicion(id) {
  const op = opCargarOperaciones().find(o => o.id === id);
  if (!op) return;

  const bloqueadaPorEstado = !opEsEditable(op.estado);
  // Una operación que ya venía marcada "Revisado" al abrir el formulario
  // queda tan bloqueada como una en estado Revisado/Cancelado — revisar
  // es la señal de que sus datos ya se dieron por conformes y no deben
  // poder tocarse ni desmarcarse desde acá. Distinto de opRevisadoActual,
  // que sí puede cambiar en vivo durante esta sesión (ver
  // actualizarBotonRevisadoOp/opActualizarLectura) si todavía no estaba
  // Revisada al entrar.
  const bloqueadaPorRevisadoAlCargar = !!op.revisado;
  // El botón "Ver" (ojo) de la grilla fuerza solo lectura sin importar el
  // estado real de la operación — es puramente para consultar el contenido,
  // no admite ninguna acción.
  const bloqueadaAlCargar = opModoVisualizacion || bloqueadaPorEstado || bloqueadaPorRevisadoAlCargar;
  opEditandoId = id;
  opBloqueadaPorEstadoActual = opModoVisualizacion || bloqueadaPorEstado;
  opEstadoBaseFormulario = op.estado;

  const tituloAccion = opModoVisualizacion ? 'Ver operación' : 'Editar operación';
  document.getElementById('tituloFormOpTexto').textContent = tituloAccion;
  document.getElementById('breadcrumbFormOp').textContent = tituloAccion;
  document.getElementById('btnCancelarOperacionOp').style.display =
    !opModoVisualizacion && opPuedeCancelarse(op.estado) ? '' : 'none';

  const aviso = document.getElementById('opBloqueadaAviso');
  if (bloqueadaAlCargar) {
    document.getElementById('opBloqueadaAvisoTexto').textContent = opModoVisualizacion
      ? 'Estás visualizando esta operación en modo solo lectura.'
      : bloqueadaPorEstado
        ? `Esta operación está en estado "${op.estado}" y ya no se puede editar.`
        : 'Esta operación ya fue revisada y sus campos no se pueden editar.';
    aviso.style.display = '';
    document.getElementById('btnGuardarOp').style.display = 'none';
    document.getElementById('btnRevisadoOp').style.display = 'none';
    document.getElementById('btnCancelarOpTexto').textContent = 'Cerrar';
  } else {
    aviso.style.display = 'none';
  }

  document.getElementById('opNumero').value = op.id;
  document.getElementById('opNominacionSelect').value = op.nominacionId || '';
  document.getElementById('opPer').value = op.per || '';
  document.getElementById('opFechaInicio').value = op.fechaInicio || '';
  document.getElementById('opFechaFin').value = op.fechaFin || '';
  document.getElementById('opFechaFinReal').value = op.fechaFinReal || '';
  document.getElementById('opNroViaje').value = op.nroViaje || '';
  document.getElementById('opNave').value = op.nave || '';
  document.getElementById('opTipoOperacion').value = op.tipoOperacion || '';
  document.getElementById('opTerminalInicial').value = op.terminalInicial || '';
  document.getElementById('opTerminalDestino').value = op.terminalDestino || '';
  document.getElementById('opEstimacionFechaHora').value = op.estimacionFechaHora || '';
  opSincronizarOpcionesTerminales();

  opProductosFormulario = [...(op.productos || [])];
  renderProductosFormularioOp();

  opPersonalFormulario = JSON.parse(JSON.stringify(op.personal || []));
  renderPersonalFormularioOp();

  renderHorariosGrid(op.tipoOperacion || '');
  opHorariosFormulario = JSON.parse(JSON.stringify({ ...opHorariosVacios(op.tipoOperacion || ''), ...(op.horarios || {}) }));
  aplicarHorariosAlFormulario(op.tipoOperacion || '');

  // actualizarBotonRevisadoOp aplica el bloqueo de campos vía
  // opActualizarLectura (usando opBloqueadaPorEstadoActual + opRevisadoActual)
  // y pinta el badge de estado — cubre tanto este primer render como
  // cualquier toggle posterior de "Revisado" durante la sesión.
  opRevisadoActual = !!op.revisado;
  actualizarBotonRevisadoOp();
}

function srvOpValidarFormulario() {
  const nomInput = document.getElementById('opNominacionSelect');
  const inicioInput = document.getElementById('opFechaInicio');
  const finInput = document.getElementById('opFechaFin');
  const terminalInput = document.getElementById('opTerminalInicial');

  limpiarErroresModal('vistaFormOp');
  [nomInput, inicioInput, finInput, terminalInput].forEach(limpiarErrorCampo);

  let primerError = null;
  if (!nomInput.value) { mostrarErrorCampo(nomInput, 'Selecciona la nominación de origen'); primerError = primerError || nomInput; }
  if (!inicioInput.value) { mostrarErrorCampo(inicioInput, 'Ingresa la fecha de inicio'); primerError = primerError || inicioInput; }
  if (!finInput.value) { mostrarErrorCampo(finInput, 'Ingresa la fecha de fin'); primerError = primerError || finInput; }
  if (inicioInput.value && finInput.value && finInput.value < inicioInput.value) {
    mostrarErrorCampo(finInput, 'La fecha de fin no puede ser anterior a la fecha de inicio');
    primerError = primerError || finInput;
  }
  if (!terminalInput.value) { mostrarErrorCampo(terminalInput, 'Selecciona el terminal inicial'); primerError = primerError || terminalInput; }

  if (primerError) { primerError.focus(); return false; }
  return true;
}

// Una operación deja de ser "Activo" apenas tiene al menos un Horario real
// cargado (sea desde la web o, más adelante, desde la app de campo) — así
// el estado refleja lo que de verdad está pasando con el buque en vez de
// depender de que alguien se acuerde de cambiarlo a mano.
function opTieneActividadRegistrada(horarios) {
  return Object.values(horarios || {}).some(h => h && h.valor);
}

// "Completado" es automático: se alcanza en cuanto todas las actividades de
// Horarios propias del Tipo de Operación tienen valor cargado. Es distinto
// de "Revisado" porque completar las actividades no implica que el
// personal ya revisó/dio conformidad a los datos — eso sigue siendo una
// decisión manual (marcar "Revisado", ver más abajo).
function opTodasActividadesCompletas(horarios, tipo) {
  const defs = opHorariosDefsPorTipo(tipo);
  if (!defs.length) return false;
  return defs.every(h => horarios?.[h.key]?.valor);
}

function guardarOperacion() {
  if (!srvOpValidarFormulario()) return;

  const lista = opCargarOperaciones();
  const datos = {
    nominacionId: document.getElementById('opNominacionSelect').value,
    per: document.getElementById('opPer').value,
    fechaInicio: document.getElementById('opFechaInicio').value,
    fechaFin: document.getElementById('opFechaFin').value,
    fechaFinReal: document.getElementById('opFechaFinReal').value,
    nroViaje: document.getElementById('opNroViaje').value,
    nave: document.getElementById('opNave').value,
    tipoOperacion: document.getElementById('opTipoOperacion').value,
    terminalInicial: document.getElementById('opTerminalInicial').value,
    terminalDestino: document.getElementById('opTerminalDestino').value,
    estimacionFechaHora: document.getElementById('opEstimacionFechaHora').value,
    productos: opProductosFormulario,
    personal: opPersonalFormulario,
    horarios: opHorariosFormulario,
    revisado: opRevisadoActual
  };

  if (opEditandoId) {
    const op = lista.find(o => o.id === opEditandoId);
    const anterior = JSON.parse(JSON.stringify(op));
    const estadoPrevio = op.estado;
    Object.assign(op, datos);
    op.estado = opCalcularEstadoAutomatico(op.estado, op.horarios, op.tipoOperacion, op.revisado);
    const mensajeEstado = op.estado !== estadoPrevio ? ` Pasó a estado "${op.estado}".` : '';

    const entradasEstado = op.estado !== estadoPrevio
      ? [{ tipo: 'estado', campo: 'Estado', valorAnterior: estadoPrevio, valorNuevo: op.estado }]
      : [];
    opRegistrarHistorial(op, [
      ...entradasEstado,
      ...opCompararCamposOperacion(anterior, op),
      ...opCompararHorarios(anterior.horarios, op.horarios, anterior.tipoOperacion, op.tipoOperacion)
    ]);

    opGuardarOperaciones(lista);
    mostrarModalGuardado('editar', `Operación ${op.id} actualizada.${mensajeEstado}`, irAOperaciones);
  } else {
    const estadoInicial = opCalcularEstadoAutomatico('Activo', datos.horarios, datos.tipoOperacion, datos.revisado);
    const nuevo = { id: opSiguienteCodigo(), ...datos, estado: estadoInicial, historial: [] };
    if (estadoInicial !== 'Activo') {
      opRegistrarHistorial(nuevo, [
        { tipo: 'estado', campo: 'Estado', valorAnterior: 'Activo', valorNuevo: estadoInicial }
      ]);
    }
    lista.push(nuevo);
    opGuardarOperaciones(lista);
    mostrarModalGuardado('crear', `Operación ${nuevo.id} creada.`, irAOperaciones);
  }
}

// Encadena las tres transiciones automáticas en orden: primero si hay
// actividad registrada (Activo→En Proceso), luego si ya se completaron
// todas las actividades del tipo (En Proceso→Completado), y por último si
// el personal marcó "Revisado" en la web — que fuerza el estado a Revisado
// sin importar en cuál de los estados anteriores haya quedado la operación
// (Revisado es el último estado posible de una operación, salvo Cancelado).
// Cancelado no pasa por acá: solo se alcanza manualmente vía "Cancelar operación".
function opCalcularEstadoAutomatico(estadoActual, horarios, tipo, revisado) {
  let estado = estadoActual;
  if (estado === 'Activo' && opTieneActividadRegistrada(horarios)) {
    estado = 'En Proceso';
  }
  if (estado === 'En Proceso' && opTodasActividadesCompletas(horarios, tipo)) {
    estado = 'Completado';
  }
  if (revisado && estado !== 'Cancelado') {
    estado = 'Revisado';
  }
  return estado;
}

// =================================================
// INICIALIZACIÓN
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('vistaListaOp')) return;

  const params = new URLSearchParams(window.location.search);
  const idEdicion = params.get('id');
  const mostrarForm = idEdicion || params.has('nuevo');
  opModoVisualizacion = !!idEdicion && params.has('ver');

  document.getElementById('vistaListaOp').style.display = mostrarForm ? 'none' : '';
  document.getElementById('vistaFormOp').style.display = mostrarForm ? '' : 'none';

  if (!mostrarForm) {
    const search = document.getElementById('searchOperacion');
    if (search) search.value = '';
    opLimpiarCamposFiltrosAvanzados();
    poblarSelectsFiltrosAvanzadosOp();
    renderTablaOperaciones();
    opActualizarBotonFiltrosAvanzados();
    return;
  }

  // opEditandoId se fija antes de poblar los selects para que, al editar,
  // el select de N° Nominación pueda incluir la nominación ya vinculada
  // aunque ya no esté Vigente (ver poblarSelectsFormularioOp).
  opEditandoId = idEdicion;
  poblarSelectsFormularioOp();

  if (idEdicion) {
    srvOpCargarFormularioParaEdicion(idEdicion);
  } else {
    document.getElementById('opNumero').value = opSiguienteCodigo();
    opPersonalFormulario = [];
    opProductosFormulario = [];
    opHorariosFormulario = {};
    opRevisadoActual = false;
    renderHorariosGrid('');
    renderPersonalFormularioOp();
    renderProductosFormularioOp();
    actualizarBotonRevisadoOp();
  }
});
