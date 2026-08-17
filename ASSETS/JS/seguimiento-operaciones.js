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
const OP_DEMO_VERSION = '2';
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
    id: 'OP001', nominacionId: 'NOM001', per: 'PER/09461-25', tipoOperacion: 'Loading',
    fechaInicio: '2025-06-15', fechaFin: '2025-06-16', fechaFinReal: '', nroViaje: 'V-2201',
    nave: 'MEGARA', terminalInicial: 'Supe', terminalDestino: 'Callao',
    estimacionFechaHora: '2025-06-15T07:00', productos: ['LNG'],
    personal: [
      { rol: 'Supervisor', nombre: 'Julio César Gómez', principal: true },
      { rol: 'Inspector', nombre: 'Edward Allccaco', principal: false },
      { rol: 'Inspector', nombre: 'Rudy Bravo Flores', principal: false }
    ],
    horarios: {
      eta: { valor: '2025-06-15T06:00', comentario: '' },
      arriba: { valor: '2025-06-15T08:10', comentario: '' },
      fondea: { valor: '2025-06-15T09:00', comentario: '' },
      amarre: { valor: '2025-06-15T10:30', comentario: 'Amarre con demora por marea baja.', leido: false },
      iniciaCarga: { valor: '2025-06-15T12:00', comentario: '' },
      terminaCarga: { valor: '', comentario: '' },
      firmaDocumentos: { valor: '', comentario: '' },
      zarpe: { valor: '', comentario: '' }
    },
    estado: 'En Proceso', revisado: true
  },
  {
    id: 'OP002', nominacionId: 'NOM005', per: 'PER/09465-25', tipoOperacion: 'Loading',
    fechaInicio: '2025-09-12', fechaFin: '2025-09-12', fechaFinReal: '', nroViaje: 'V-2214',
    nave: 'MEGARA', terminalInicial: 'Callao', terminalDestino: '',
    estimacionFechaHora: '2025-09-12T14:00', productos: ['GLP'],
    personal: [
      { rol: 'Supervisor', nombre: 'Julio César Gómez', principal: true }
    ],
    horarios: opHorariosVacios('Loading'),
    estado: 'Activo', revisado: false
  },
  {
    id: 'OP003', nominacionId: 'NOM008', per: 'PER/09468-25', tipoOperacion: 'Bunkering',
    fechaInicio: '2025-11-01', fechaFin: '2025-11-02', fechaFinReal: '2025-11-02', nroViaje: 'V-2230',
    nave: 'PACIFIC STAR', terminalInicial: 'Pisco', terminalDestino: 'Pisco',
    estimacionFechaHora: '2025-11-01T07:30', productos: ['Diesel B5'],
    personal: [
      { rol: 'Supervisor', nombre: 'Bandy Jimenez', principal: true },
      { rol: 'Inspector', nombre: 'Julio César Gómez', principal: false },
      { rol: 'Inspector', nombre: 'Edward Allccaco', principal: false }
    ],
    horarios: {
      eta: { valor: '2025-10-31T20:00', comentario: '' },
      arriba: { valor: '2025-11-01T07:40', comentario: '' },
      amarre: { valor: '2025-11-01T09:00', comentario: '' },
      iniciaSuministro: { valor: '2025-11-01T10:00', comentario: '' },
      terminaSuministro: { valor: '2025-11-02T18:00', comentario: '' },
      firmaDocumentos: { valor: '2025-11-02T18:30', comentario: '' },
      zarpe: { valor: '2025-11-02T20:00', comentario: 'Zarpe conforme, sin observaciones.', leido: true }
    },
    estado: 'Finalizado', revisado: true
  },
  {
    id: 'OP004', nominacionId: 'NOM007', per: 'PER/09467-25', tipoOperacion: 'STS Transfer',
    fechaInicio: '2025-05-20', fechaFin: '2025-05-21', fechaFinReal: '', nroViaje: 'V-2178',
    nave: 'STENA IMPRESSION', terminalInicial: 'Supe', terminalDestino: '',
    estimacionFechaHora: '2025-05-20T09:00', productos: ['Crudo'],
    personal: [
      { rol: 'Supervisor', nombre: 'Sandra Echavarria', principal: true }
    ],
    horarios: opHorariosVacios('STS Transfer'),
    estado: 'Cancelado', revisado: false
  },
  {
    // Ejemplo de Descarga (Discharging) con Horarios completos — muestra las
    // actividades propias de ese tipo (Inicia/Termina Descarga) en vez de
    // las de Carga.
    id: 'OP005', nominacionId: 'NOM002', per: 'PER/09462-25', tipoOperacion: 'Discharging',
    fechaInicio: '2025-07-01', fechaFin: '2025-07-02', fechaFinReal: '', nroViaje: 'V-2205',
    nave: 'STENA IMPRESSION', terminalInicial: 'Callao', terminalDestino: '',
    estimacionFechaHora: '2025-07-01T06:00', productos: ['Crudo'],
    personal: [
      { rol: 'Supervisor', nombre: 'Sandra Echavarria', principal: true },
      { rol: 'Inspector', nombre: 'Julio César Gómez', principal: false }
    ],
    horarios: {
      eta: { valor: '2025-06-30T22:00', comentario: '' },
      arriba: { valor: '2025-07-01T06:10', comentario: '' },
      fondea: { valor: '2025-07-01T07:00', comentario: '' },
      amarre: { valor: '2025-07-01T08:30', comentario: 'Amarre en muelle 3.', leido: true },
      iniciaDescarga: { valor: '2025-07-01T10:00', comentario: '' },
      terminaDescarga: { valor: '2025-07-02T16:00', comentario: '' },
      firmaDocumentos: { valor: '2025-07-02T16:30', comentario: '' },
      zarpe: { valor: '2025-07-02T18:00', comentario: 'Descarga completa, sin incidencias.', leido: false }
    },
    estado: 'En Proceso', revisado: false
  },
  {
    // Segundo ejemplo de STS Transfer, pero Finalizado y con Horarios
    // completos (a diferencia de OP004, que queda vacío para mostrar el
    // estado inicial de una operación recién creada).
    id: 'OP006', nominacionId: 'NOM003', per: 'PER/09463-25', tipoOperacion: 'STS Transfer',
    fechaInicio: '2025-08-05', fechaFin: '2025-08-06', fechaFinReal: '2025-08-06', nroViaje: 'V-2219',
    nave: 'PACIFIC STAR', terminalInicial: 'Pisco', terminalDestino: '',
    estimacionFechaHora: '2025-08-05T05:00', productos: ['GLP'],
    personal: [
      { rol: 'Supervisor', nombre: 'Bandy Jimenez', principal: true },
      { rol: 'Inspector', nombre: 'Edward Allccaco', principal: false },
      { rol: 'Inspector', nombre: 'Julio César Gómez', principal: false }
    ],
    horarios: {
      eta: { valor: '2025-08-04T20:00', comentario: '' },
      arriboZonaSts: { valor: '2025-08-05T05:30', comentario: '' },
      amarreNaves: { valor: '2025-08-05T07:00', comentario: 'Amarre costado a costado, condiciones de mar favorables.', leido: true },
      iniciaTransferencia: { valor: '2025-08-05T09:00', comentario: '' },
      terminaTransferencia: { valor: '2025-08-06T14:00', comentario: '' },
      desamarre: { valor: '2025-08-06T15:00', comentario: '' },
      firmaDocumentos: { valor: '2025-08-06T15:30', comentario: '' },
      zarpe: { valor: '2025-08-06T17:00', comentario: '' }
    },
    estado: 'Finalizado', revisado: true
  }
];

function opCargarOperaciones() {
  const raw = localStorage.getItem(OP_STORAGE_KEY);
  const versionGuardada = localStorage.getItem(OP_DEMO_VERSION_KEY);
  if (!raw || versionGuardada !== OP_DEMO_VERSION) {
    localStorage.setItem(OP_STORAGE_KEY, JSON.stringify(OPERACIONES_DEMO));
    localStorage.setItem(OP_DEMO_VERSION_KEY, OP_DEMO_VERSION);
    return JSON.parse(JSON.stringify(OPERACIONES_DEMO));
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

// "Activo" (recién creada, todavía sin ninguna actividad registrada) y
// "En Proceso" (ya se le cargó al menos un Horario real, desde la web o la
// app) son distintos a propósito: la grilla necesitaba poder distinguir una
// operación que solo existe en papel de una que el buque ya está viviendo.
const OP_ESTADO_TRANSICIONES = {
  Activo: ['En Proceso', 'Cancelado'],
  'En Proceso': ['Finalizado', 'Cancelado'],
  Finalizado: [],
  Cancelado: []
};

function opBadgeEstado(estado) {
  const mapa = {
    Activo: '<span class="badge badge-vigente"><span class="badge-dot"></span>Activo</span>',
    'En Proceso': '<span class="badge badge-programado"><span class="badge-dot"></span>En Proceso</span>',
    Finalizado: '<span class="badge badge-finalizado"><span class="badge-dot"></span>Finalizado</span>',
    Cancelado: '<span class="badge badge-cancelado"><span class="badge-dot"></span>Cancelado</span>'
  };
  return mapa[estado] || estado;
}

function opEsEditable(estado) {
  return estado === 'Activo' || estado === 'En Proceso';
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
// LISTADO
// =================================================
let opFilasPorPagina = 10;
let opPaginaActual = 1;

function poblarSelectClientesFiltroOp() {
  poblarSelect('opFiltroCliente', SRV_CLIENTES_DEMO.map(c => c.razon));
}

function opObtenerFiltradas() {
  const lista = opCargarOperaciones();
  const texto = (document.getElementById('searchOperacion')?.value || '').toLowerCase().trim();
  const cliente = document.getElementById('opFiltroCliente')?.value || '';
  const desde = document.getElementById('opFiltroFechaInicio')?.value || '';
  const hasta = document.getElementById('opFiltroFechaFin')?.value || '';

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
        <td>${opBadgeEstado(o.estado)}${o.revisado ? ' <span class="op-revisado-tag" title="Operación revisada"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>' : ''}</td>
        <td class="opciones">
          <button class="btn-accion btn-editar" title="Editar operación" onclick="editarOperacion('${o.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
          <button class="btn-accion btn-eliminar" title="Eliminar operación" onclick="eliminarOperacion('${o.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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
}

function limpiarFiltrosOp() {
  const search = document.getElementById('searchOperacion');
  if (search) search.value = '';
  ['opFiltroCliente', 'opFiltroFechaInicio', 'opFiltroFechaFin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  aplicarFiltrosOp();
}

function eliminarOperacion(id) {
  confirmarAccion('¿Deseas eliminar esta operación? Esta acción no se puede deshacer.', () => {
    const lista = opCargarOperaciones().filter(o => o.id !== id);
    opGuardarOperaciones(lista);
    renderTablaOperaciones();
    mostrarToast('Operación eliminada correctamente.');
  });
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

// =================================================
// FORMULARIO — NUEVA / EDITAR OPERACIÓN
// =================================================
let opEditandoId = null;
let opModoSoloLectura = false;
let opPersonalFormulario = [];
let opProductosFormulario = [];
let opHorariosFormulario = {};
let opRevisadoActual = false;

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
  const select = document.getElementById('opPersonalNombre');
  if (!rol) {
    select.innerHTML = '<option value="">Seleccionar personal</option>';
    select.disabled = true;
    document.getElementById('btnAgregarPersonalOp').disabled = true;
    return;
  }
  const disponibles = srvUsuariosPorRol(rol).map(srvNombreCompletoUsuario);
  select.innerHTML = '<option value="">Seleccionar personal</option>' +
    disponibles.map(n => `<option value="${n}">${n}</option>`).join('');
  select.disabled = false;
  document.getElementById('btnAgregarPersonalOp').disabled = true;
}

document.addEventListener('change', (e) => {
  if (e.target.id === 'opPersonalNombre') {
    document.getElementById('btnAgregarPersonalOp').disabled = !e.target.value;
  }
});

function srvOpAgregarPersonal() {
  const rol = document.getElementById('opPersonalRol').value;
  const nombre = document.getElementById('opPersonalNombre').value;
  if (!rol || !nombre) return;
  if (opPersonalFormulario.some(p => p.nombre === nombre)) {
    mostrarToast(`${nombre} ya está asignado a esta operación.`);
    return;
  }
  opPersonalFormulario.push({ rol, nombre, principal: opPersonalFormulario.length === 0 });
  renderPersonalFormularioOp();

  document.getElementById('opPersonalRol').value = '';
  srvOpPoblarPersonalPorRol();
}

function renderPersonalFormularioOp() {
  const tbody = document.getElementById('tbodyPersonalOp');
  if (!tbody) return;

  if (!opPersonalFormulario.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="clientes-nom-empty">Aún no se ha asignado personal</td></tr>`;
    return;
  }

  tbody.innerHTML = opPersonalFormulario.map((p, i) => `
    <tr class="${p.principal ? 'fila-encargado-nom' : ''}">
      <td>${i + 1}</td>
      <td>${p.rol}</td>
      <td>${p.nombre}</td>
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
    </tr>
  `).join('');
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
        <button type="button" class="op-comment-btn" id="opComBtn_${h.key}" title="Agregar comentario" onclick="toggleComentarioHorario('${h.key}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span class="op-comment-dot"></span>
        </button>
      </label>
      <input type="datetime-local" id="opHor_${h.key}" onchange="opActualizarHorario('${h.key}')">
      <textarea class="op-comentario-horario" id="opComTxt_${h.key}" placeholder="Comentario sobre ${h.label.toLowerCase()}..." style="display:none" oninput="opActualizarComentarioHorario('${h.key}', this.value)"></textarea>
    </div>
  `).join('');
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
function toggleRevisadoOp() {
  opRevisadoActual = !opRevisadoActual;
  actualizarBotonRevisadoOp();
}

// Fecha Fin(Estimada) es la que se maneja mientras la operación sigue en
// curso; recién al marcar "Revisado" se habilita Fecha Fin(Real) — con la
// fecha de hoy como valor sugerido, editable — para registrar cuándo
// terminó de verdad.
function actualizarBotonRevisadoOp() {
  const btn = document.getElementById('btnRevisadoOp');
  const texto = document.getElementById('btnRevisadoOpTexto');
  if (!btn) return;
  btn.classList.toggle('activo', opRevisadoActual);
  texto.textContent = opRevisadoActual ? 'Revisado' : 'Marcar como revisado';

  const campoReal = document.getElementById('opFechaFinReal');
  if (campoReal && !opModoSoloLectura) {
    campoReal.disabled = !opRevisadoActual;
    if (opRevisadoActual && !campoReal.value) {
      const hoy = new Date();
      const pad = n => String(n).padStart(2, '0');
      campoReal.value = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
    }
  }
}

let opEstadoCambiando = null;

function abrirModalCambiarEstadoOp() {
  if (!opEditandoId) return;
  const op = opCargarOperaciones().find(o => o.id === opEditandoId);
  if (!op) return;
  opEstadoCambiando = op;

  document.getElementById('cambiarEstadoOpActual').innerHTML = opBadgeEstado(op.estado);
  const opciones = OP_ESTADO_TRANSICIONES[op.estado] || [];
  const select = document.getElementById('cambiarEstadoOpSelect');
  select.innerHTML = '<option value="">Seleccionar</option>' + opciones.map(e => `<option value="${e}">${e}</option>`).join('');
  document.getElementById('cambiarEstadoOpComentario').value = '';
  abrirModal('modalCambiarEstadoOp');
}

function confirmarCambioEstadoOp() {
  const nuevoEstado = document.getElementById('cambiarEstadoOpSelect').value;
  if (!nuevoEstado || !opEstadoCambiando) {
    mostrarErrorCampo(document.getElementById('cambiarEstadoOpSelect'), 'Selecciona el nuevo estado');
    return;
  }
  const lista = opCargarOperaciones();
  const op = lista.find(o => o.id === opEstadoCambiando.id);
  if (!op) return;
  op.estado = nuevoEstado;
  opGuardarOperaciones(lista);
  cerrarModal('modalCambiarEstadoOp');
  mostrarToast(`La operación ${op.id} ahora está en estado "${nuevoEstado}".`);
  setTimeout(irAOperaciones, 700);
}

// =================================================
// CARGAR / VALIDAR / GUARDAR
// =================================================
function srvOpCargarFormularioParaEdicion(id) {
  const op = opCargarOperaciones().find(o => o.id === id);
  if (!op) return;

  const bloqueadaPorEstado = !opEsEditable(op.estado);
  opEditandoId = id;
  opModoSoloLectura = bloqueadaPorEstado;

  document.getElementById('tituloFormOpTexto').textContent = 'Editar operación';
  document.getElementById('breadcrumbFormOp').textContent = 'Editar operación';
  document.getElementById('tituloFormOpEstado').innerHTML = opBadgeEstado(op.estado);
  document.getElementById('btnCambiarEstadoOp').style.display = (OP_ESTADO_TRANSICIONES[op.estado] || []).length ? '' : 'none';

  const aviso = document.getElementById('opBloqueadaAviso');
  if (bloqueadaPorEstado) {
    document.getElementById('opBloqueadaAvisoTexto').textContent =
      `Esta operación está en estado "${op.estado}" y ya no se puede editar.`;
    aviso.style.display = '';
    document.getElementById('btnGuardarOp').style.display = 'none';
    document.getElementById('btnRevisadoOp').style.display = 'none';
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

  opRevisadoActual = !!op.revisado;
  actualizarBotonRevisadoOp();

  if (opModoSoloLectura) {
    ['opNominacionSelect', 'opNroViaje', 'opNave', 'opTipoOperacion', 'opTerminalInicial', 'opTerminalDestino',
      'opEstimacionFechaHora', 'opFechaInicio', 'opFechaFin', 'opFechaFinReal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });
    document.querySelector('.op-personal-row')?.style.setProperty('display', 'none');
    document.querySelector('.nom-producto-row')?.style.setProperty('display', 'none');
    opHorariosDefsPorTipo(op.tipoOperacion || '').forEach(h => {
      document.getElementById(`opHor_${h.key}`)?.setAttribute('disabled', 'disabled');
      const btn = document.getElementById(`opComBtn_${h.key}`);
      btn?.setAttribute('disabled', 'disabled');
      // El botón queda deshabilitado en solo lectura, así que un comentario
      // pendiente de leer se despliega solo (si no, quedaría escondido sin
      // forma de abrirlo) y se marca como leído.
      if (btn?.classList.contains('sin-leer')) {
        btn.classList.remove('sin-leer');
        const dato = opHorariosFormulario[h.key];
        if (dato) dato.leido = true;
        const txt = document.getElementById(`opComTxt_${h.key}`);
        if (txt) txt.style.display = '';
      }
    });
    document.getElementById('btnCancelarOpTexto').textContent = 'Cerrar';
  }
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
// depender de que alguien se acuerde de cambiarlo a mano. Cancelado y
// Finalizado siguen siendo decisiones manuales (botón "Cambiar estado").
function opTieneActividadRegistrada(horarios) {
  return Object.values(horarios || {}).some(h => h && h.valor);
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
    Object.assign(op, datos);
    let pasoAEnProceso = false;
    if (op.estado === 'Activo' && opTieneActividadRegistrada(op.horarios)) {
      op.estado = 'En Proceso';
      pasoAEnProceso = true;
    }
    opGuardarOperaciones(lista);
    mostrarModalGuardado('editar', `Operación ${op.id} actualizada.${pasoAEnProceso ? ' Pasó a estado "En Proceso" al registrarse su primera actividad.' : ''}`, irAOperaciones);
  } else {
    const estadoInicial = opTieneActividadRegistrada(datos.horarios) ? 'En Proceso' : 'Activo';
    const nuevo = { id: opSiguienteCodigo(), ...datos, estado: estadoInicial };
    lista.push(nuevo);
    opGuardarOperaciones(lista);
    mostrarModalGuardado('crear', `Operación ${nuevo.id} creada.`, irAOperaciones);
  }
}

// =================================================
// INICIALIZACIÓN
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('vistaListaOp')) return;

  const params = new URLSearchParams(window.location.search);
  const idEdicion = params.get('id');
  const mostrarForm = idEdicion || params.has('nuevo');

  document.getElementById('vistaListaOp').style.display = mostrarForm ? 'none' : '';
  document.getElementById('vistaFormOp').style.display = mostrarForm ? '' : 'none';

  if (!mostrarForm) {
    const search = document.getElementById('searchOperacion');
    if (search) search.value = '';
    ['opFiltroCliente', 'opFiltroFechaInicio', 'opFiltroFechaFin'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    poblarSelectClientesFiltroOp();
    renderTablaOperaciones();
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
