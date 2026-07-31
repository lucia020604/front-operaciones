// =================================================
// SERVICIOS.JS
// Lógica del módulo Servicios: listado de Nominaciones,
// formulario de Nueva/Editar Nominación y envío de la
// Aceptación del Servicio (prototipo sin backend).
// =================================================

const SRV_STORAGE_KEY = 'nominacionesData';

// N° de PER: formato fijo PER/00000-00 (ej. PER/09461-26) — único por
// nominación, y es el mismo valor que se muestra como "Número de
// referencia de Intertek" al enviar la Aceptación del Servicio.
const SRV_PER_REGEX = /^PER\/\d{5}-\d{2}$/;

const SRV_CLIENTES_DEMO = [
  { id: 1, razon: 'Sandra Motors', ruc: '11109899982', contactos: [
    { nombre: 'Sandra', correo: 'sandra@sandramotors.com', telefono: '+51 989 580 786', principal: true },
    { nombre: 'Renzo Delgado', correo: 'renzo.delgado@sandramotors.com', telefono: '+51 945 118 220', principal: false }
  ] },
  { id: 2, razon: 'Naviera del Pacífico S.A.', ruc: '20456789123', contactos: [
    { nombre: 'Marco Rojas', correo: 'marco.rojas@navierapacifico.com', telefono: '+51 987 221 340', principal: true }
  ] },
  { id: 3, razon: 'Perú LNG S.R.L.', ruc: '20509876541', contactos: [
    { nombre: 'Pamela Pedraza', correo: 'lpedraza@perulng.com', telefono: '+51 989 580 786', principal: true },
    { nombre: 'Julio César Gómez', correo: 'julio.gomez@perulng.com', telefono: '+51 987 654 321', principal: false },
    { nombre: 'Rosa Medina', correo: 'rosa.medina@perulng.com', telefono: '+51 976 543 210', principal: false }
  ] },
  { id: 4, razon: 'Shell Trading Perú', ruc: '20601234567', contactos: [
    { nombre: 'Ana Belén Vargas', correo: 'ana.vargas@shell.com', telefono: '+51 965 432 109', principal: true }
  ] }
];

function srvContactoPrincipal(clienteDemo) {
  if (!clienteDemo?.contactos?.length) return null;
  return clienteDemo.contactos.find(c => c.principal) || clienteDemo.contactos[0];
}

function srvContactoDeCliente(clienteFormItem) {
  const demo = SRV_CLIENTES_DEMO.find(c => c.ruc === clienteFormItem.ruc);
  if (!demo) return null;
  return demo.contactos.find(c => c.nombre === clienteFormItem.contacto) || srvContactoPrincipal(demo);
}

const SRV_BUQUES = ['MEGARA', 'STENA IMPRESSION', 'PACIFIC STAR', 'CALLAO TRADER'];
const SRV_LOCACIONES = ['Peru LNG Melchorita Terminal - Cañete', 'Terminal Callao', 'Terminal Pisco', 'Terminal Talara'];
const SRV_TIPOS_OPERACION = ['Loading', 'Discharging', 'STS Transfer', 'Bunkering'];

// El personal de Intertek (Supervisor de Operaciones, Contactos de
// oficina que atienden) se toma directamente del mantenedor de
// Usuarios — no se mantiene una lista aparte.
function srvUsuariosActivos() {
  return USUARIOS_DEMO.filter(u => u.estado === 'activo');
}

function srvNombreCompletoUsuario(u) {
  return `${u.nombre} ${u.apellido}`;
}

// Solo los usuarios marcados con "Mostrar en Attending Office Contacts"
// (checkbox agregado al crear/editar un usuario) aparecen como candidatos
// en el checklist de la Aceptación.
function srvUsuariosContactoOficina() {
  return srvUsuariosActivos().filter(u => u.contactoOficina);
}

// Usuarios marcados como "Incluir en copia" — pueblan el checklist de
// "Correos electrónicos a enviar (en copia)".
function srvUsuariosIncluirCopia() {
  return srvUsuariosActivos().filter(u => u.incluirCopia);
}

// Usuarios activos que tienen asignado el rol indicado (por nombre, ver
// ROLES_DEMO/obtenerIdsRolesUsuario en data-usuarios.js) — restringe el
// selector de Supervisor y el picker de Inspector(es) a los usuarios con
// ese rol real en el mantenedor de Usuarios, en vez de listar a todo el
// personal activo.
function srvUsuariosPorRol(nombreRol) {
  return srvUsuariosActivos().filter(u =>
    obtenerIdsRolesUsuario(u).some(id => obtenerRolPorId(id)?.nombre === nombreRol)
  );
}

const NOMINACIONES_DEMO = [
  {
    id: 'NOM001', per: 'PER/09461-25', fechaInicio: '2025-06-15', fechaFin: '2025-09-15',
    estado: 'Vigente', buque: 'MEGARA',
    locacion: 'Peru LNG Melchorita Terminal - Cañete', supervisor: 'Julio César Gómez',
    tipoOperacion: 'Loading',
    clientes: [{ nombre: 'Sandra Motors', ruc: '11109899982', principal: true, porcentaje: 100, contacto: 'Sandra', aceptacionEnviada: true, fechaAceptacionEnviada: '2025-06-10' }],
    servicioNombre: 'Inspección de carga LNG',
    servicioDetalle: 'Vessel: MEGARA · Operation: Loading · Product: LNG · Quantity: 137,200 m3',
    productos: ['LNG'], inspectores: ['Edward Allccaco', 'Rudy Bravo Flores'], cantidad: '137200', unidadMedida: 'Metro Cúbico'
  },
  {
    id: 'NOM002', per: 'PER/09462-25', fechaInicio: '2025-07-01', fechaFin: '2025-07-20',
    estado: 'Pendiente', buque: 'STENA IMPRESSION',
    locacion: 'Terminal Callao', supervisor: 'Sandra Echavarria',
    tipoOperacion: 'Discharging',
    clientes: [{ nombre: 'Naviera del Pacífico S.A.', ruc: '20456789123', principal: true, porcentaje: 100, contacto: 'Marco Rojas', aceptacionEnviada: false }],
    servicioNombre: 'Inspección de descarga de crudo',
    servicioDetalle: 'Descarga de crudo en Terminal Callao',
    productos: ['Crudo'], inspectores: ['Julio César Gómez'], cantidad: '85000', unidadMedida: 'Barril'
  },
  {
    // Ejemplo de nominación compartida con Aceptaciones parciales: Perú LNG
    // ya la recibió, Shell Trading todavía no — por eso sigue "Pendiente"
    // (recién pasa a Vigente cuando TODOS los clientes hayan aceptado).
    id: 'NOM003', per: 'PER/09463-25', fechaInicio: '2025-08-05', fechaFin: '2025-08-25',
    estado: 'Pendiente', buque: 'PACIFIC STAR',
    locacion: 'Terminal Pisco', supervisor: 'Bandy Jimenez',
    tipoOperacion: 'STS Transfer',
    clientes: [
      { nombre: 'Perú LNG S.R.L.', ruc: '20509876541', principal: true, porcentaje: 50, contacto: 'Pamela Pedraza', aceptacionEnviada: true, fechaAceptacionEnviada: '2025-07-30' },
      { nombre: 'Shell Trading Perú', ruc: '20601234567', principal: false, porcentaje: 50, contacto: 'Ana Belén Vargas', aceptacionEnviada: false }
    ],
    servicioNombre: 'Transferencia ship-to-ship de GLP',
    servicioDetalle: 'STS Transfer entre buques en Terminal Pisco',
    productos: ['GLP'], inspectores: ['Edward Allccaco', 'Julio César Gómez'], cantidad: '42000', unidadMedida: 'Tonelada Métrica'
  },
  {
    id: 'NOM004', per: 'PER/09464-25', fechaInicio: '2025-04-10', fechaFin: '2025-04-28',
    estado: 'Finalizado', buque: 'CALLAO TRADER',
    locacion: 'Terminal Talara', supervisor: 'Carla Ventura',
    tipoOperacion: 'Bunkering',
    clientes: [{ nombre: 'Shell Trading Perú', ruc: '20601234567', principal: true, porcentaje: 100, contacto: 'Ana Belén Vargas', aceptacionEnviada: true, fechaAceptacionEnviada: '2025-04-08' }],
    servicioNombre: 'Suministro de combustible (bunkering)',
    servicioDetalle: 'Operación de bunkering en Terminal Talara',
    productos: ['Diesel B5'], inspectores: ['Rudy Bravo Flores'], cantidad: '15000', unidadMedida: 'Metro Cúbico'
  },
  {
    id: 'NOM005', per: 'PER/09465-25', fechaInicio: '2025-09-12', fechaFin: '2025-09-30',
    estado: 'Vigente', buque: 'MEGARA',
    locacion: 'Terminal Callao', supervisor: 'Julio César Gómez',
    tipoOperacion: 'Loading',
    clientes: [{ nombre: 'Perú LNG S.R.L.', ruc: '20509876541', principal: true, porcentaje: 100, contacto: 'Pamela Pedraza', aceptacionEnviada: true, fechaAceptacionEnviada: '2025-09-08' }],
    servicioNombre: 'Inspección de carga de GLP',
    servicioDetalle: 'Carga de GLP en Terminal Callao',
    productos: ['GLP'], inspectores: ['Julio César Gómez'], cantidad: '98000', unidadMedida: 'Barril'
  },
  {
    id: 'NOM006', per: 'PER/09466-25', fechaInicio: '2025-10-02', fechaFin: '2025-10-18',
    estado: 'Pendiente', buque: 'CALLAO TRADER',
    locacion: 'Terminal Talara', supervisor: 'Josue Ramos',
    tipoOperacion: 'Discharging',
    clientes: [{ nombre: 'Naviera del Pacífico S.A.', ruc: '20456789123', principal: true, porcentaje: 100, contacto: 'Marco Rojas', aceptacionEnviada: false }],
    servicioNombre: 'Inspección de descarga de diesel',
    servicioDetalle: 'Descarga de Diesel B5 en Terminal Talara',
    productos: ['Diesel B5'], inspectores: ['Edward Allccaco'], cantidad: '30000', unidadMedida: 'Metro Cúbico'
  },
  {
    id: 'NOM007', per: 'PER/09467-25', fechaInicio: '2025-05-20', fechaFin: '2025-06-05',
    estado: 'Cancelado', buque: 'STENA IMPRESSION',
    locacion: 'Peru LNG Melchorita Terminal - Cañete', supervisor: 'Sandra Echavarria',
    tipoOperacion: 'STS Transfer',
    clientes: [{ nombre: 'Sandra Motors', ruc: '11109899982', principal: true, porcentaje: 100, contacto: 'Sandra', aceptacionEnviada: false }],
    servicioNombre: 'Transferencia ship-to-ship de crudo',
    servicioDetalle: 'Operación anulada por el cliente',
    productos: ['Crudo'], inspectores: ['Rudy Bravo Flores'], cantidad: '50000', unidadMedida: 'Barril'
  },
  {
    id: 'NOM008', per: 'PER/09468-25', fechaInicio: '2025-11-01', fechaFin: '2025-11-15',
    estado: 'Vigente', buque: 'PACIFIC STAR',
    locacion: 'Terminal Pisco', supervisor: 'Bandy Jimenez',
    tipoOperacion: 'Bunkering',
    clientes: [{ nombre: 'Shell Trading Perú', ruc: '20601234567', principal: true, porcentaje: 100, contacto: 'Ana Belén Vargas', aceptacionEnviada: true, fechaAceptacionEnviada: '2025-10-29' }],
    servicioNombre: 'Suministro de combustible (bunkering)',
    servicioDetalle: 'Operación de bunkering en Terminal Pisco',
    productos: ['Diesel B5'], inspectores: ['Julio César Gómez', 'Edward Allccaco'], cantidad: '18000', unidadMedida: 'Metro Cúbico'
  },
  {
    // Nominación compartida entre 3 clientes, ninguno recibió su Aceptación
    // todavía — sirve para probar cómo se ve la grilla/formulario cuando
    // TODOS los clientes están "Pendiente" (badge "Pendiente 3/3", cada fila
    // de la tabla de Clientes con su botón "Enviar" habilitado).
    id: 'NOM009', per: 'PER/09469-25', fechaInicio: '2025-12-01', fechaFin: '2025-12-20',
    estado: 'Pendiente', buque: 'MEGARA',
    locacion: 'Terminal Callao', supervisor: 'Josue Ramos',
    tipoOperacion: 'Loading',
    clientes: [
      { nombre: 'Sandra Motors', ruc: '11109899982', principal: true, porcentaje: 40, contacto: 'Sandra', aceptacionEnviada: false },
      { nombre: 'Naviera del Pacífico S.A.', ruc: '20456789123', principal: false, porcentaje: 30, contacto: 'Marco Rojas', aceptacionEnviada: false },
      { nombre: 'Perú LNG S.R.L.', ruc: '20509876541', principal: false, porcentaje: 30, contacto: 'Rosa Medina', aceptacionEnviada: false }
    ],
    servicioNombre: 'Inspección de carga compartida de GLP',
    servicioDetalle: 'Carga de GLP en Terminal Callao a nombre de 3 clientes',
    productos: ['GLP'], inspectores: ['Rudy Bravo Flores'], cantidad: '65000', unidadMedida: 'Barril'
  },
  {
    // Nominación compartida entre 3 clientes con Aceptación PARCIAL: solo
    // Naviera del Pacífico ya la recibió — sirve para probar el badge
    // "Pendiente 2/3" en la grilla y la mezcla de botones "Ver"/"Enviar" en
    // la tabla de Clientes del formulario.
    id: 'NOM010', per: 'PER/09470-25', fechaInicio: '2025-12-10', fechaFin: '2025-12-28',
    estado: 'Pendiente', buque: 'CALLAO TRADER',
    locacion: 'Terminal Talara', supervisor: 'Bandy Jimenez',
    tipoOperacion: 'Discharging',
    clientes: [
      { nombre: 'Naviera del Pacífico S.A.', ruc: '20456789123', principal: true, porcentaje: 34, contacto: 'Marco Rojas', aceptacionEnviada: true, fechaAceptacionEnviada: '2025-12-05' },
      { nombre: 'Shell Trading Perú', ruc: '20601234567', principal: false, porcentaje: 33, contacto: 'Ana Belén Vargas', aceptacionEnviada: false },
      { nombre: 'Sandra Motors', ruc: '11109899982', principal: false, porcentaje: 33, contacto: 'Renzo Delgado', aceptacionEnviada: false }
    ],
    servicioNombre: 'Inspección de descarga compartida de Diesel B5',
    servicioDetalle: 'Descarga de Diesel B5 en Terminal Talara a nombre de 3 clientes',
    productos: ['Diesel B5'], inspectores: ['Julio César Gómez', 'Rudy Bravo Flores'], cantidad: '54000', unidadMedida: 'Metro Cúbico'
  },
  {
    // Nominación de UN solo cliente, Aceptación aún sin enviar — badge
    // "Pendiente" (sin fracción, porque con un solo cliente no hace falta).
    id: 'NOM011', per: 'PER/09471-25', fechaInicio: '2026-01-05', fechaFin: '2026-01-25',
    estado: 'Pendiente', buque: 'STENA IMPRESSION',
    locacion: 'Terminal Callao', supervisor: 'Josue Ramos',
    tipoOperacion: 'Bunkering',
    clientes: [{ nombre: 'Perú LNG S.R.L.', ruc: '20509876541', principal: true, porcentaje: 100, contacto: 'Pamela Pedraza', aceptacionEnviada: false }],
    servicioNombre: 'Suministro de combustible (bunkering)',
    servicioDetalle: 'Operación de bunkering en Terminal Callao',
    productos: ['Diesel B5'], inspectores: ['Edward Allccaco'], cantidad: '22000', unidadMedida: 'Metro Cúbico'
  },
  {
    // Nominación compartida entre 3 clientes, faltando enviarle solo al
    // último — sirve para probar el badge "Pendiente 1/3" en la grilla.
    id: 'NOM012', per: 'PER/09472-25', fechaInicio: '2026-01-10', fechaFin: '2026-01-30',
    estado: 'Pendiente', buque: 'PACIFIC STAR',
    locacion: 'Peru LNG Melchorita Terminal - Cañete', supervisor: 'Sandra Echavarria',
    tipoOperacion: 'STS Transfer',
    clientes: [
      { nombre: 'Perú LNG S.R.L.', ruc: '20509876541', principal: true, porcentaje: 34, contacto: 'Pamela Pedraza', aceptacionEnviada: true, fechaAceptacionEnviada: '2026-01-06' },
      { nombre: 'Sandra Motors', ruc: '11109899982', principal: false, porcentaje: 33, contacto: 'Sandra', aceptacionEnviada: true, fechaAceptacionEnviada: '2026-01-07' },
      { nombre: 'Naviera del Pacífico S.A.', ruc: '20456789123', principal: false, porcentaje: 33, contacto: 'Marco Rojas', aceptacionEnviada: false }
    ],
    servicioNombre: 'Transferencia ship-to-ship de GLP compartida',
    servicioDetalle: 'STS Transfer en Peru LNG Melchorita a nombre de 3 clientes',
    productos: ['GLP'], inspectores: ['Rudy Bravo Flores', 'Edward Allccaco'], cantidad: '48000', unidadMedida: 'Tonelada Métrica'
  }
];

function srvCargarNominaciones() {
  const raw = localStorage.getItem(SRV_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(SRV_STORAGE_KEY, JSON.stringify(NOMINACIONES_DEMO));
    return JSON.parse(JSON.stringify(NOMINACIONES_DEMO));
  }

  // Si el navegador ya tenía datos guardados de una versión anterior del
  // demo, se incorporan los registros nuevos que falten (por id) sin tocar
  // los que el usuario ya haya creado o editado.
  const lista = JSON.parse(raw);
  const idsExistentes = new Set(lista.map(n => n.id));
  const faltantes = NOMINACIONES_DEMO.filter(n => !idsExistentes.has(n.id));
  let huboCambios = false;
  if (faltantes.length) {
    lista.push(...JSON.parse(JSON.stringify(faltantes)));
    huboCambios = true;
  }

  // Los registros demo guardados en el navegador antes de exigir
  // Inspector(es) como campo obligatorio quedaron sin ese dato — se
  // completan con los inspectores de referencia del propio demo (no se
  // toca ningún registro al que el usuario ya le haya asignado uno).
  lista.forEach(n => {
    if (!n.inspectores || !n.inspectores.length) {
      const demo = NOMINACIONES_DEMO.find(d => d.id === n.id);
      if (demo?.inspectores?.length) {
        n.inspectores = [...demo.inspectores];
        huboCambios = true;
      }
    }
  });

  // Registros demo guardados en el navegador que hayan quedado sin N° de
  // PER — se completan con el PER de referencia del propio demo. Solo
  // actúa si el campo está vacío: un PER real que el usuario ya haya
  // escrito (aunque no calce con el formato nuevo) no se toca.
  lista.forEach(n => {
    if (!n.per) {
      const demo = NOMINACIONES_DEMO.find(d => d.id === n.id);
      if (demo?.per) {
        n.per = demo.per;
        huboCambios = true;
      }
    }
  });

  // Clientes de ejemplo guardados en el navegador sin "contacto" — sin ese
  // dato el checklist de Destinatarios (To) no marca ningún contacto por
  // defecto. Se completa con el contacto de referencia del propio demo.
  lista.forEach(n => {
    const demo = NOMINACIONES_DEMO.find(d => d.id === n.id);
    if (!demo) return;
    (n.clientes || []).forEach(c => {
      if (!c.contacto) {
        const demoCliente = demo.clientes.find(dc => dc.ruc === c.ruc);
        if (demoCliente?.contacto) {
          c.contacto = demoCliente.contacto;
          huboCambios = true;
        }
      }
    });
  });

  // NOM003 pasó de "Vigente" a "Pendiente" en el demo (ejemplo de
  // Aceptación compartida parcial) después de que muchos navegadores ya
  // la tuvieran guardada con el estado viejo — se sincroniza una sola vez.
  lista.forEach(n => {
    if (n.id === 'NOM003' && n.estado === 'Vigente') {
      n.estado = 'Pendiente';
      huboCambios = true;
    }
  });

  // "Anulado" pasó a llamarse "Cancelado" (mismo concepto, ahora puede
  // opcionalmente seguir a Facturado/Pagado) — se actualiza lo que ya
  // hubiera quedado guardado en el navegador con el nombre anterior.
  lista.forEach(n => {
    if (n.estado === 'Anulado') {
      n.estado = 'Cancelado';
      huboCambios = true;
    }
  });

  // La Aceptación pasó de ser una sola por nominación a una por cliente
  // (nom.clientes[i].aceptacionEnviada/fechaAceptacionEnviada/
  // aceptacionSnapshot). Los registros guardados con el modelo viejo
  // (flags a nivel de la nominación) se migran copiando ese flag/fecha/
  // snapshot a todos sus clientes — antes todos compartían la misma
  // Aceptación, así que es el equivalente correcto — y se quitan los
  // campos viejos de la raíz.
  lista.forEach(n => {
    if ('aceptacionEnviada' in n) {
      (n.clientes || []).forEach(c => {
        if (c.aceptacionEnviada == null) {
          c.aceptacionEnviada = !!n.aceptacionEnviada;
          c.fechaAceptacionEnviada = n.fechaAceptacionEnviada || null;
          c.aceptacionSnapshot = n.aceptacionSnapshot || null;
        }
      });
      delete n.aceptacionEnviada;
      delete n.fechaAceptacionEnviada;
      delete n.aceptacionSnapshot;
      huboCambios = true;
    }
  });

  // Clientes agregados sin los campos de Aceptación (por ejemplo, clientes
  // nuevos agregados a una nominación existente antes de este cambio) —
  // se completan en "no enviada" en vez de quedar undefined.
  lista.forEach(n => {
    (n.clientes || []).forEach(c => {
      if (c.aceptacionEnviada === undefined) {
        c.aceptacionEnviada = false;
        c.fechaAceptacionEnviada = null;
        c.aceptacionSnapshot = null;
        huboCambios = true;
      }
    });
  });

  // Las nominaciones de ejemplo con un estado distinto de "Pendiente" no
  // pasaron realmente por el flujo de Cambiar Estado, así que no tienen
  // ninguna entrada de historial que explique cómo llegaron ahí — se deja
  // una entrada de respaldo para que "Ver historial de cambios" no se vea
  // vacío en esos casos.
  lista.forEach(n => {
    const tieneHistorialEstado = (n.historial || []).some(h => h.tipo === 'estado');
    if (n.estado !== 'Pendiente' && !tieneHistorialEstado) {
      if (!Array.isArray(n.historial)) n.historial = [];
      const { fecha, hora } = srvFechaHoraActual();
      n.historial = [{
        fecha, hora, usuario: 'Sistema', tipo: 'estado', campo: 'Estado',
        valorAnterior: 'Pendiente', valorNuevo: n.estado, comentario: 'Estado inicial (dato de ejemplo)'
      }, ...n.historial];
      huboCambios = true;
    }
  });

  if (huboCambios) localStorage.setItem(SRV_STORAGE_KEY, JSON.stringify(lista));
  return lista;
}

function srvGuardarNominaciones(lista) {
  localStorage.setItem(SRV_STORAGE_KEY, JSON.stringify(lista));
}

function soloEnteroMax(input, max) {
  input.value = input.value.replace(/[^0-9]/g, '').slice(0, max);
}

function irANuevaNominacion() {
  window.location.href = 'nominaciones.html?nuevo=1';
}

function irANominaciones() {
  window.location.href = 'nominaciones.html';
}

// =================================================
// LISTADO — nominaciones.html
// =================================================
let srvFilasPorPagina = 10;
let srvPaginaActual = 1;

// Transiciones manuales válidas de estado (ver "Cambiar estado" en la
// grilla y en Editar Nominación). Pendiente→Vigente queda afuera a
// propósito: sigue siendo 100% automático vía "Enviar Aceptación"
// (enviarAceptacion), nunca aparece como destino manual. Facturado/Pagado
// son un único estado alcanzable por dos caminos (flujo normal desde
// Valorizado, o cobro de gastos generados desde Cancelado) — cuál de los
// dos caminos se siguió queda registrado en el historial de cambios, no
// como un estado distinto.
const SRV_ESTADO_TRANSICIONES = {
  Pendiente:  ['Cancelado'],
  Vigente:    ['Finalizado', 'Cancelado'],
  Finalizado: ['Reportado', 'Cancelado'],
  Reportado:  ['Valorizado', 'Cancelado'],
  Valorizado: ['Facturado', 'Cancelado'],
  Facturado:  ['Pagado'],
  Pagado:     [],
  Cancelado:  ['Facturado']
};

function srvBadgeEstado(estado) {
  const mapa = {
    Pendiente:  '<span class="badge badge-pendiente"><span class="badge-dot"></span>Pendiente</span>',
    Vigente:    '<span class="badge badge-vigente"><span class="badge-dot"></span>Vigente</span>',
    Finalizado: '<span class="badge badge-finalizado"><span class="badge-dot"></span>Finalizado</span>',
    Reportado:  '<span class="badge badge-reportado"><span class="badge-dot"></span>Reportado</span>',
    Valorizado: '<span class="badge badge-valorizado"><span class="badge-dot"></span>Valorizado</span>',
    Facturado:  '<span class="badge badge-facturado"><span class="badge-dot"></span>Facturado</span>',
    Pagado:     '<span class="badge badge-pagado"><span class="badge-dot"></span>Pagado</span>',
    Cancelado:  '<span class="badge badge-cancelado"><span class="badge-dot"></span>Cancelado</span>'
  };
  return mapa[estado] || estado;
}

// La Aceptación ahora es por cliente (nom.clientes[i].aceptacionEnviada):
// una nominación compartida puede tener algunos clientes ya aceptados y
// otros no. La nominación pasa a "Vigente" recién cuando TODOS los
// clientes la aceptaron — por eso ese es también el único caso en el que
// se puede forzar "todos enviados" aunque el dato guardado esté incompleto
// (nominaciones de ejemplo antiguas, ver migración en srvCargarNominaciones).
function srvTodosClientesAceptaron(nom) {
  const clientes = nom.clientes || [];
  if (!clientes.length) return false;
  const puedeSeguirPendiente = nom.estado === 'Pendiente' || nom.estado === 'Cancelado';
  return clientes.every(c => c.aceptacionEnviada) || !puedeSeguirPendiente;
}

function srvClientesAceptacionResumen(nom) {
  const clientes = nom.clientes || [];
  const total = clientes.length;
  const enviados = clientes.filter(c => c.aceptacionEnviada).length;
  return { total, enviados: srvTodosClientesAceptaron(nom) ? total : enviados };
}

function srvBadgeAceptacion(nom) {
  const { total, enviados } = srvClientesAceptacionResumen(nom);
  if (total > 0 && enviados === total) {
    return '<span class="badge badge-vigente"><span class="badge-dot"></span>Enviada</span>';
  }
  const pendientes = total - enviados;
  const texto = total > 1 ? `Pendiente ${pendientes}/${total}` : 'Pendiente';
  return `<span class="badge badge-pendiente"><span class="badge-dot"></span>${texto}</span>`;
}

function srvFormatoFecha(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

// Formato usado en los documentos que genera el sistema (Aceptación del
// Servicio): dd-mmm-aaaa, con el mes abreviado a sus 3 primeras letras en
// minúscula — ej. 24-jul-2026.
const SRV_MESES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function srvFormatoFechaDocumento(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  const mes = SRV_MESES_ABREV[parseInt(m, 10) - 1] || m;
  return `${d}-${mes}-${a}`;
}

function srvClientePrincipal(nom) {
  if (!nom.clientes || !nom.clientes.length) return { nombre: '—', contacto: '—' };
  const principal = nom.clientes.find(c => c.principal) || nom.clientes[0];
  const contacto = srvContactoDeCliente(principal);
  return { nombre: principal.nombre, contacto: contacto ? contacto.nombre : (principal.contacto || '—') };
}

// Detalle de TODOS los clientes de una nominación (no solo el encargado) —
// usado por el popover "+N" de la grilla cuando la nominación está
// compartida entre varios clientes.
function srvClientesDetalle(nom) {
  return (nom.clientes || []).map(c => ({
    nombre: c.nombre,
    porcentaje: c.porcentaje,
    principal: !!c.principal,
    contacto: srvContactoDeCliente(c)?.nombre || c.contacto || '—'
  }));
}

// =================================================
// POPOVER "Clientes de la nominación" — grilla de listado
// Un único elemento reutilizado para toda la tabla (no uno por fila),
// posicionado con position:fixed a partir del botón "+N" clickeado, para
// no quedar recortado por el overflow-x:auto de .table-wrap.
// =================================================
let srvClientesPopoverAbiertoId = null;

function srvToggleClientesPopover(event, id) {
  event.stopPropagation();
  const popover = document.getElementById('clientesPopover');
  if (!popover) return;

  if (srvClientesPopoverAbiertoId === id) {
    srvCerrarClientesPopover();
    return;
  }

  const nom = srvCargarNominaciones().find(n => n.id === id);
  if (!nom) return;

  document.getElementById('clientesPopoverBody').innerHTML = srvClientesDetalle(nom).map(c => `
    <div class="clientes-popover-item">
      <div class="clientes-popover-item-top">
        <span class="clientes-popover-nombre">${c.nombre}${c.principal ? ' <span class="clientes-popover-tag">Encargado</span>' : ''}</span>
        <span class="clientes-popover-pct">${c.porcentaje != null ? c.porcentaje + '%' : '—'}</span>
      </div>
      <div class="clientes-popover-contacto">${c.contacto}</div>
    </div>
  `).join('');

  const rect = event.currentTarget.getBoundingClientRect();
  popover.style.top = `${rect.bottom + 6}px`;
  popover.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 268))}px`;
  popover.classList.add('open');
  srvClientesPopoverAbiertoId = id;
}

function srvCerrarClientesPopover() {
  document.getElementById('clientesPopover')?.classList.remove('open');
  srvClientesPopoverAbiertoId = null;
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.btn-clientes-mas') && !e.target.closest('#clientesPopover')) {
    srvCerrarClientesPopover();
  }
});
document.addEventListener('scroll', () => srvCerrarClientesPopover(), true);
window.addEventListener('resize', () => srvCerrarClientesPopover());

function poblarSelectClientesFiltro() {
  poblarSelect('filterAvzCliente', SRV_CLIENTES_DEMO.map(c => c.razon));
  poblarSelect('filterAvzEstado', Object.keys(SRV_ESTADO_TRANSICIONES));
  poblarSelect('filterAvzBuque', SRV_BUQUES);
  poblarSelect('filterAvzLocacion', SRV_LOCACIONES);
  poblarSelect('filterAvzTipoOperacion', SRV_TIPOS_OPERACION);
  poblarSelect('filterAvzSupervisor', srvUsuariosPorRol('Supervisor').map(srvNombreCompletoUsuario));
  poblarSelect('filterAvzInspector', srvUsuariosPorRol('Inspector').map(srvNombreCompletoUsuario));
}

// Los campos del modal de Filtros avanzados quedan siempre presentes en el
// DOM (solo ocultos por el modal cerrado), así que se leen directo de ahí
// sin necesidad de un estado paralelo: el filtro solo se aplica de verdad
// cuando renderTablaNominaciones() vuelve a correr (botón Aplicar/Buscar/Limpiar).
function srvObtenerFiltradas() {
  const lista = srvCargarNominaciones();
  const texto = (document.getElementById('searchNominacion')?.value || '').toLowerCase().trim();
  const cliente = document.getElementById('filterAvzCliente')?.value || '';
  const estado = document.getElementById('filterAvzEstado')?.value || '';
  const aceptacion = document.getElementById('filterAvzAceptacion')?.value || '';
  const buque = document.getElementById('filterAvzBuque')?.value || '';
  const locacion = document.getElementById('filterAvzLocacion')?.value || '';
  const tipoOperacion = document.getElementById('filterAvzTipoOperacion')?.value || '';
  const supervisor = document.getElementById('filterAvzSupervisor')?.value || '';
  const inspector = document.getElementById('filterAvzInspector')?.value || '';
  const desde = document.getElementById('filterAvzInicio')?.value || '';
  const hasta = document.getElementById('filterAvzFin')?.value || '';
  const soloCompartidas = document.getElementById('filterAvzCompartida')?.checked || false;

  return lista.filter(n => {
    const p = srvClientePrincipal(n);
    const nombresClientes = (n.clientes || []).map(c => c.nombre);

    if (texto) {
      const enTexto = n.id.toLowerCase().includes(texto) ||
        (n.per || '').toLowerCase().includes(texto) ||
        nombresClientes.some(nombre => nombre.toLowerCase().includes(texto)) ||
        p.contacto.toLowerCase().includes(texto);
      if (!enTexto) return false;
    }
    // El filtro de Cliente debe encontrar la nominación si CUALQUIERA de
    // sus clientes coincide, no solo el encargado.
    if (cliente && !nombresClientes.includes(cliente)) return false;
    if (estado && n.estado !== estado) return false;
    if (aceptacion) {
      const todosAceptaron = srvTodosClientesAceptaron(n);
      if (aceptacion === 'enviada' && !todosAceptaron) return false;
      if (aceptacion === 'pendiente' && todosAceptaron) return false;
    }
    if (buque && n.buque !== buque) return false;
    if (locacion && n.locacion !== locacion) return false;
    if (tipoOperacion && n.tipoOperacion !== tipoOperacion) return false;
    if (supervisor && n.supervisor !== supervisor) return false;
    if (inspector && !(n.inspectores || []).includes(inspector)) return false;
    if (soloCompartidas && nombresClientes.length < 2) return false;
    // Fecha inicio/fin funcionan como un rango: se muestran las nominaciones
    // cuyo período [fechaInicio, fechaFin] se cruza con el rango buscado,
    // no solo las que empiezan/terminan exactamente dentro de él.
    if (desde && n.fechaFin < desde) return false;
    if (hasta && n.fechaInicio > hasta) return false;
    return true;
  }).sort((a, b) => {
    // Las últimas nominaciones creadas son las primeras en mostrarse — el
    // número de la nominación (NOM###) ya es correlativo por creación
    // (srvSiguienteCodigo), así que ordenar por ese número desc. alcanza
    // sin necesitar una fecha de creación aparte.
    const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });
}

function renderTablaNominaciones() {
  const tbody = document.getElementById('tbodyNominaciones');
  if (!tbody) return;

  srvCerrarClientesPopover();

  const filtradas = srvObtenerFiltradas();
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / srvFilasPorPagina));
  if (srvPaginaActual > totalPaginas) srvPaginaActual = totalPaginas;
  const inicio = (srvPaginaActual - 1) * srvFilasPorPagina;
  const pagina = filtradas.slice(inicio, inicio + srvFilasPorPagina);

  if (!pagina.length) {
    tbody.innerHTML = `<tr><td colspan="11" class="clientes-nom-empty">No se encontraron nominaciones</td></tr>`;
  } else {
    tbody.innerHTML = pagina.map(n => {
      const p = srvClientePrincipal(n);
      return `
      <tr>
        <td class="codigo-col">${n.id}</td>
        <td>${n.per || '—'}</td>
        <td>${p.nombre}${(n.clientes && n.clientes.length > 1) ? `<button type="button" class="btn-clientes-mas" title="Ver los ${n.clientes.length} clientes de esta nominación" onclick="srvToggleClientesPopover(event, '${n.id}')">+${n.clientes.length - 1}</button>` : ''}</td>
        <td>${p.contacto}</td>
        <td>${n.buque || '—'}</td>
        <td>${n.supervisor || '—'}</td>
        <td>${srvFormatoFecha(n.fechaInicio)}</td>
        <td>${srvFormatoFecha(n.fechaFin)}</td>
        <td>${srvBadgeEstado(n.estado)}</td>
        <td>${srvBadgeAceptacion(n)}</td>
        <td class="opciones">
          <button class="btn-accion btn-editar" title="Ver nominación" onclick="verNominacion('${n.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-accion btn-editar" title="Editar nominación" onclick="editarNominacion('${n.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
          <button class="btn-accion btn-reset" title="Ver historial de cambios" onclick="verHistorialNominacion('${n.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 2.636-6.364L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
          </button>
          <button class="btn-accion btn-pass" title="Cambiar estado" onclick="abrirModalCambiarEstado('${n.id}')" ${!(SRV_ESTADO_TRANSICIONES[n.estado] || []).length ? 'disabled' : ''}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  const infoEl = document.getElementById('pagInfoNom');
  if (infoEl) {
    infoEl.textContent = filtradas.length
      ? `Mostrando ${inicio + 1}-${Math.min(inicio + srvFilasPorPagina, filtradas.length)} de ${filtradas.length} registros`
      : 'Mostrando 0 registros';
  }

  renderPaginacionNominaciones(totalPaginas);
}

function renderPaginacionNominaciones(totalPaginas) {
  const cont = document.getElementById('pagBtnsNom');
  if (!cont) return;
  let html = `<button class="pag-btn pag-btn-nav" onclick="cambiarPaginaNom(-1)" ${srvPaginaActual === 1 ? 'disabled' : ''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
  </button>`;
  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button class="pag-btn ${i === srvPaginaActual ? 'active' : ''}" onclick="irAPaginaNom(${i})">${i}</button>`;
  }
  html += `<button class="pag-btn pag-btn-nav" onclick="cambiarPaginaNom(1)" ${srvPaginaActual === totalPaginas ? 'disabled' : ''}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
  </button>`;
  cont.innerHTML = html;
}

function irAPaginaNom(pagina) {
  srvPaginaActual = pagina;
  renderTablaNominaciones();
}

function cambiarPaginaNom(delta) {
  srvPaginaActual += delta;
  renderTablaNominaciones();
}

function cambiarFilasNominaciones(valor) {
  srvFilasPorPagina = valor;
  srvPaginaActual = 1;
  renderTablaNominaciones();
}

function aplicarFiltrosNom() {
  srvPaginaActual = 1;
  renderTablaNominaciones();
  srvActualizarBotonFiltrosAvanzados();
}

function limpiarFiltrosNom() {
  const search = document.getElementById('searchNominacion');
  if (search) search.value = '';
  srvLimpiarCamposFiltrosAvanzados();
  aplicarFiltrosNom();
}

const SRV_IDS_FILTROS_AVANZADOS = [
  'filterAvzCliente', 'filterAvzEstado', 'filterAvzAceptacion', 'filterAvzBuque',
  'filterAvzLocacion', 'filterAvzTipoOperacion', 'filterAvzSupervisor',
  'filterAvzInspector', 'filterAvzInicio', 'filterAvzFin'
];

function srvLimpiarCamposFiltrosAvanzados() {
  SRV_IDS_FILTROS_AVANZADOS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const compartida = document.getElementById('filterAvzCompartida');
  if (compartida) compartida.checked = false;
}

function srvContarFiltrosAvanzadosActivos() {
  let n = SRV_IDS_FILTROS_AVANZADOS.reduce((acc, id) => acc + (document.getElementById(id)?.value ? 1 : 0), 0);
  if (document.getElementById('filterAvzCompartida')?.checked) n++;
  return n;
}

function srvActualizarBotonFiltrosAvanzados() {
  const btn = document.getElementById('btnFiltrosAvanzados');
  const badge = document.getElementById('filtrosAvanzadosBadge');
  if (!btn || !badge) return;
  const activos = srvContarFiltrosAvanzadosActivos();
  btn.classList.toggle('activo', activos > 0);
  badge.style.display = activos > 0 ? '' : 'none';
  badge.textContent = activos;
}

function abrirModalFiltrosAvanzados() {
  abrirModal('modalFiltrosAvanzados');
}

function aplicarFiltrosAvanzadosModal() {
  cerrarModal('modalFiltrosAvanzados');
  aplicarFiltrosNom();
}

function limpiarFiltrosAvanzadosModal() {
  srvLimpiarCamposFiltrosAvanzados();
  cerrarModal('modalFiltrosAvanzados');
  aplicarFiltrosNom();
}

function editarNominacion(id) {
  window.location.href = `nominaciones.html?id=${encodeURIComponent(id)}`;
}

// Visualizar reutiliza el mismo formulario de Editar Nominación, pero en
// modo solo lectura (?modo=ver): mismos campos, deshabilitados, sin
// buscadores ni botones de agregar/quitar — ver srvAplicarModoSoloLectura.
function verNominacion(id) {
  window.location.href = `nominaciones.html?id=${encodeURIComponent(id)}&modo=ver`;
}

// Nominaciones de ejemplo (seed) traen aceptacionEnviada:true en alguno de
// sus clientes pero nunca pasaron por enviarAceptacionCliente(), así que no
// tienen aceptacionSnapshot real. En ese caso se arma una vista razonable a
// partir de los datos ya guardados en la nominación y ese cliente en
// particular, en vez de decir que no se envió nada.
function srvConstruirSnapshotFallback(cliente, nom) {
  const contacto = srvContactoDeCliente(cliente);
  const productoTexto = (nom.productos || []).join(' / ');
  const cantidadTexto = nom.cantidad
    ? `${Number(nom.cantidad).toLocaleString('en-US')}${nom.unidadMedida ? ' ' + nom.unidadMedida : ''}`
    : '';
  const costSharing = (nom.clientes || []).length
    ? nom.clientes.map(c => `${c.porcentaje != null ? c.porcentaje + '% ' : ''}${c.nombre}`).join(' / ')
    : '';
  const destinatariosTo = contacto
    ? [`${contacto.nombre}${contacto.correo ? ' (' + contacto.correo + ')' : ''}`]
    : [];

  return {
    asunto: [nom.per, 'Confirmation of Attendance', nom.buque, nom.tipoOperacion, productoTexto, nom.locacion].filter(Boolean).join(' // '),
    nombreCliente: cliente.nombre || '',
    atencion: contacto ? contacto.nombre : '',
    firmante: nom.supervisor ? [nom.supervisor] : [],
    refCliente: 'N/A',
    refIntertek: nom.per || '',
    vessel: nom.buque || '',
    operation: nom.tipoOperacion || '',
    dateRange: srvFormatoFechaDocumento(cliente.fechaAceptacionEnviada),
    location: nom.locacion || '',
    product: productoTexto,
    quantity: cantidadTexto,
    costSharing,
    supervisor: nom.supervisor || '',
    attendingInspector: (nom.inspectores || []).join(' / '),
    contactosOficina: [],
    correosCopia: srvUsuariosIncluirCopia().map(u => `${srvNombreCompletoUsuario(u)} (${u.email})`),
    destinatariosTo,
    emergenciaNombre: contacto ? contacto.nombre : '',
    emergenciaCorreo: contacto ? (contacto.correo || '') : '',
    emergenciaTelefono: contacto ? (contacto.telefono || '') : '',
    determinacionCantidad: '',
    determinacionCalidad: '',
    comentariosAdicionales: '',
    imagenCantidad: null,
    imagenCalidad: null,
    imagenComentarios: null,
    archivos: (nom.archivos || []).map(a => typeof a === 'string' ? { nombre: a, tipo: '', dataUrl: null } : a),
    terminosHtml: ''
  };
}

// Un archivo o imagen de la Aceptación enviada puede abrirse en una pestaña
// nueva (data URL) cuando se guardó su contenido; si no, solo se ve el
// nombre — pasa con datos de ejemplo que nunca tuvieron un archivo real.
function srvHtmlArchivoAceptacion(item) {
  return item.dataUrl
    ? `<a class="cv-upload-row nom-archivo-item" href="${item.dataUrl}" target="_blank" rel="noopener" title="Abrir en una pestaña nueva">
        <span class="cv-nombre">${item.nombre}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
      </a>`
    : `<div class="cv-upload-row nom-archivo-item"><span class="cv-nombre">${item.nombre}</span></div>`;
}

function srvHtmlConsideracionAceptacion(titulo, texto, imagenDataUrl) {
  const dict = srvDiccionarioAceptacion();
  return `
    <div class="acept-consideracion-block">
      <label class="modal-label">${titulo}</label>
      <div class="acept-editor-body"><div class="ed-row"><span>${texto || dict['txt-sin-observaciones']}</span></div></div>
      ${imagenDataUrl ? `
      <div class="acept-imagen-preview"><span class="acept-imagen-item"><img src="${imagenDataUrl}" alt="${titulo}"></span></div>` : ''}
    </div>
  `;
}

function srvHtmlSnapshotAceptacion(cliente, nom) {
  const dict = srvDiccionarioAceptacion();
  const vacio = dict['txt-sin-datos'];

  if (!cliente.aceptacionEnviada) {
    return `<div class="acept-editor-body"><div class="ed-row"><span>${dict['txt-aun-no-enviada']}</span></div></div>`;
  }
  const s = cliente.aceptacionSnapshot || srvConstruirSnapshotFallback(cliente, nom);
  const lista = (arr) => (arr && arr.length) ? arr.join(', ') : vacio;
  const archivos = s.archivos || [];

  return `
    <div class="acept-form-body">
    <div>
    <div class="permisos-divider" style="margin:0 0 10px"><span>${dict['div-correo']}</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-destinatarios']}</span><span>${lista(s.destinatariosTo)}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-correos-copia']}</span><span>${lista(s.correosCopia)}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-asunto']}</span><span>${s.asunto || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-para']}</span><span>${s.nombreCliente || vacio}${s.atencion ? dict['txt-atencion-de'] + s.atencion : ''}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-firmante']}</span><span>${lista(s.firmante)}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-ref']}</span><span>${s.refCliente || vacio}${dict['txt-guion']}${s.refIntertek || vacio}</span></div>
    </div>
    </div>

    <div>
    <div class="permisos-divider" style="margin:0 0 10px"><span>${dict['div-detalles-operacion']}</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">${dict['lbl-vessel']}</span><span>${s.vessel || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-operation']}</span><span>${s.operation || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-date-range']}</span><span>${s.dateRange || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-location']}</span><span>${s.location || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-product']}</span><span>${s.product || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-quantity']}</span><span>${s.quantity || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-cost-sharing']}</span><span>${s.costSharing || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-supervisor']}</span><span>${s.supervisor || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-attending-inspector']}</span><span>${s.attendingInspector || vacio}</span></div>
    </div>
    </div>

    <div>
    <div class="permisos-divider" style="margin:0 0 10px"><span>${dict['div-attending-office']}</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-attending-contacts']}</span><span>${lista(s.contactosOficina)}</span></div>
    </div>
    </div>

    <div>
    <div class="permisos-divider" style="margin:0 0 10px"><span>${dict['div-client-emergency']}</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">${dict['lbl-name']}</span><span>${s.emergenciaNombre || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-email']}</span><span>${s.emergenciaCorreo || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-mobile']}</span><span>${s.emergenciaTelefono || vacio}</span></div>
    </div>
    </div>

    <div>
    <div class="permisos-divider" style="margin:0 0 10px"><span>${dict['div-consideraciones']}</span></div>
    <div class="acept-form-body">
    ${srvHtmlConsideracionAceptacion(dict['lbl-quantity-det'], s.determinacionCantidad, s.imagenCantidad)}
    ${srvHtmlConsideracionAceptacion(dict['lbl-quality-det'], s.determinacionCalidad, s.imagenCalidad)}
    ${srvHtmlConsideracionAceptacion(dict['lbl-additional-comments'], s.comentariosAdicionales, s.imagenComentarios)}
    </div>
    </div>

    <div>
    <div class="permisos-divider" style="margin:0 0 10px"><span>${dict['div-archivos-adjuntos']}</span></div>
    <div class="nom-archivos-lista">
      ${archivos.length ? archivos.map(srvHtmlArchivoAceptacion).join('') : `<div class="cv-nombre">${dict['txt-sin-archivos']}</div>`}
    </div>
    </div>

    ${s.terminosHtml ? `
    <div class="acept-terminos-box" style="margin-top:0">
      <strong>${dict['terminos-titulo']}</strong>
      ${s.terminosHtml}
    </div>` : ''}
    </div>
  `;
}

// Una vez que Operaciones marca el servicio como Finalizado, los datos
// operativos (buque, cantidad, clientes, etc.) quedan fijos — lo que sigue
// es puramente administrativo (reportes, valorización, facturación, pago)
// y depende de que esa información ya no cambie. Solo Pendiente y Vigente
// admiten edición de campos; el estado sí se puede seguir moviendo desde
// "Cambiar estado" en cualquiera de estos casos.
function srvNominacionEsEditable(estado) {
  return estado === 'Pendiente' || estado === 'Vigente';
}

// =================================================
// CAMBIAR ESTADO — grilla y header de Editar Nominación. El select solo
// ofrece las transiciones válidas desde el estado actual
// (SRV_ESTADO_TRANSICIONES); "Cancelado" reemplaza al antiguo "Anulado"
// como una opción más de ese selector, en vez de un botón aparte.
// =================================================
let srvEstadoCambiandoId = null;

function abrirModalCambiarEstado(id) {
  if (!id) return;
  const nom = srvCargarNominaciones().find(n => n.id === id);
  if (!nom) return;

  const siguientes = SRV_ESTADO_TRANSICIONES[nom.estado] || [];
  if (!siguientes.length) {
    mostrarToast('Esta nominación ya está en un estado final y no admite más cambios');
    return;
  }

  srvEstadoCambiandoId = id;
  document.getElementById('cambiarEstadoActual').innerHTML = srvBadgeEstado(nom.estado);
  document.getElementById('cambiarEstadoSelect').innerHTML =
    '<option value="">Seleccionar</option>' + siguientes.map(e => `<option value="${e}">${e}</option>`).join('');
  document.getElementById('cambiarEstadoComentario').value = '';
  limpiarErrorCampo(document.getElementById('cambiarEstadoSelect'));
  abrirModal('modalCambiarEstado');
}

function confirmarCambioEstado() {
  const sel = document.getElementById('cambiarEstadoSelect');
  limpiarErrorCampo(sel);
  if (!sel.value) { mostrarErrorCampo(sel, 'Seleccione un estado'); return; }

  const lista = srvCargarNominaciones();
  const idx = lista.findIndex(n => n.id === srvEstadoCambiandoId);
  if (idx < 0) return;

  const estadoAnterior = lista[idx].estado;
  const nuevoEstado = sel.value;
  const comentario = document.getElementById('cambiarEstadoComentario').value.trim();
  lista[idx].estado = nuevoEstado;
  srvRegistrarHistorial(lista[idx], [
    { tipo: 'estado', campo: 'Estado', valorAnterior: estadoAnterior, valorNuevo: nuevoEstado, comentario }
  ]);
  srvGuardarNominaciones(lista);
  cerrarModal('modalCambiarEstado');
  mostrarToast(`Estado actualizado a "${nuevoEstado}"`);

  if (document.getElementById('vistaListaNom')?.style.display !== 'none') renderTablaNominaciones();
  if (srvEditandoId === srvEstadoCambiandoId) {
    document.getElementById('tituloFormNomEstado').innerHTML = srvBadgeEstado(nuevoEstado);
  }
}

// =================================================
// HISTORIAL DE CAMBIOS — registra tanto ediciones de campos como
// cambios de estado (Cancelado, Vigente al enviar la Aceptación, etc.)
// para poder mostrarlos en el modal "Ver historial de cambios".
// =================================================

// Campos del formulario que se comparan para detectar cambios al editar
// una nominación existente. "formato" normaliza el valor guardado a texto
// legible antes de comparar y de mostrarlo en el historial.
const SRV_CAMPOS_HISTORIAL = [
  { campo: 'per', etiqueta: 'N° de PER' },
  { campo: 'fechaInicio', etiqueta: 'Fecha Inicio', formato: srvFormatoFecha },
  { campo: 'fechaFin', etiqueta: 'Fecha Final', formato: srvFormatoFecha },
  { campo: 'buque', etiqueta: 'Buque' },
  { campo: 'locacion', etiqueta: 'Locación' },
  { campo: 'supervisor', etiqueta: 'Supervisor de Operaciones' },
  { campo: 'tipoOperacion', etiqueta: 'Tipo de Operación' },
  { campo: 'servicioNombre', etiqueta: 'Nombre del Servicio' },
  { campo: 'servicioCategoria', etiqueta: 'Categoría de Servicio' },
  { campo: 'servicioDetalle', etiqueta: 'Detalle del Servicio' },
  { campo: 'cantidad', etiqueta: 'Cantidad' },
  { campo: 'unidadMedida', etiqueta: 'Unidad de Medida' },
  { campo: 'productos', etiqueta: 'Producto(s)', formato: v => (v || []).join(', ') },
  { campo: 'inspectores', etiqueta: 'Inspector(es)', formato: v => (v || []).join(', ') },
  { campo: 'clientes', etiqueta: 'Clientes', formato: v => (v || []).map(c => c.nombre).join(', ') }
];

function srvCompararCamposNominacion(anterior, nuevo) {
  return SRV_CAMPOS_HISTORIAL.reduce((entradas, { campo, etiqueta, formato }) => {
    const textoAnterior = formato ? formato(anterior[campo]) : (anterior[campo] || '');
    const textoNuevo = formato ? formato(nuevo[campo]) : (nuevo[campo] || '');
    if (textoAnterior !== textoNuevo) {
      entradas.push({ tipo: 'campo', campo: etiqueta, valorAnterior: textoAnterior || '—', valorNuevo: textoNuevo || '—' });
    }
    return entradas;
  }, []);
}

function srvUsuarioActualNombreCompleto() {
  const sesion = typeof obtenerUsuarioActual === 'function' ? obtenerUsuarioActual() : null;
  return sesion ? `${sesion.nombre} ${sesion.apellido}` : 'Usuario';
}

function srvFechaHoraActual() {
  const ahora = new Date();
  const pad = n => String(n).padStart(2, '0');
  return {
    fecha: `${pad(ahora.getDate())}/${pad(ahora.getMonth() + 1)}/${ahora.getFullYear()}`,
    hora: `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`
  };
}

// Agrega una o más entradas al historial de la nominación (más recientes
// primero). "nom" se modifica en el sitio; quien llama es responsable de
// persistir la lista con srvGuardarNominaciones().
function srvRegistrarHistorial(nom, entradas) {
  if (!entradas || !entradas.length) return;
  if (!Array.isArray(nom.historial)) nom.historial = [];
  const { fecha, hora } = srvFechaHoraActual();
  const usuario = srvUsuarioActualNombreCompleto();
  nom.historial = [...entradas.map(e => ({ fecha, hora, usuario, ...e })), ...nom.historial];
}

function verHistorialNominacion(id) {
  const nom = srvCargarNominaciones().find(n => n.id === id);
  if (!nom) return;

  document.getElementById('historialNomTitulo').textContent = `Historial de cambios — ${nom.id}`;
  const tbody = document.getElementById('historialNomTbody');
  const historial = nom.historial || [];

  // Los cambios de estado se resaltan (fila teñida + badges en vez de
  // texto plano) para que se distingan de un vistazo entre el resto de
  // ediciones de campos del historial.
  tbody.innerHTML = historial.length
    ? historial.map(h => {
      const esEstado = h.tipo === 'estado';
      return `
      <tr class="${esEstado ? 'historial-fila-estado' : ''}">
        <td>${h.fecha}</td>
        <td>${h.hora}</td>
        <td>${h.usuario}</td>
        <td>${esEstado ? 'Cambio de estado' : h.campo}</td>
        <td>${esEstado ? srvBadgeEstado(h.valorAnterior) : h.valorAnterior}</td>
        <td>${esEstado ? srvBadgeEstado(h.valorNuevo) : h.valorNuevo}</td>
        <td>${h.comentario || '—'}</td>
      </tr>`;
    }).join('')
    : `<tr><td colspan="7" class="clientes-nom-empty">Esta nominación aún no registra cambios</td></tr>`;

  abrirModal('modalHistorialNom');
}

// =================================================
// FORMULARIO — nominaciones.html (vista #vistaFormNom)
// =================================================
let srvClientesFormulario = [];
let srvArchivosFormulario = [];
let srvEditandoId = null;
// true cuando la página se abrió en modo "visualizar" (?modo=ver): mismos
// campos que Editar Nominación, pero deshabilitados y sin controles de
// agregar/quitar.
let srvModoSoloLectura = false;

function poblarSelect(id, opciones) {
  const sel = document.getElementById(id);
  if (!sel) return;
  opciones.forEach(op => {
    const opt = document.createElement('option');
    opt.value = op;
    opt.textContent = op;
    sel.appendChild(opt);
  });
}

// Producto(s): se pueden agregar uno o más, tomados del catálogo de Tablas
// Generales (sugerencias al escribir) o escritos libremente — no dependen
// exclusivamente de lo que exista en el mantenedor.
let srvProductosFormulario = [];

function renderProductosFormulario() {
  const cont = document.getElementById('nomProductosList');
  if (!cont) return;
  cont.innerHTML = srvProductosFormulario.map((p, i) => `
    <span class="chip-tag">
      <span>${p}</span>
      ${srvModoSoloLectura ? '' : `<button type="button" onclick="srvQuitarProductoNom(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>`}
    </span>
  `).join('');
}

function srvBuscarProductosSugeridos(texto) {
  const cont = document.getElementById('nomProductoSugerencias');
  if (!cont) return;
  const q = texto.trim().toLowerCase();

  const disponibles = cargarProductos().filter(p => !srvProductosFormulario.includes(p.nombre));
  const coincidencias = q
    ? disponibles.filter(p => p.nombre.toLowerCase().includes(q))
    : disponibles;

  if (!coincidencias.length) {
    cont.innerHTML = `<div class="nom-cliente-sugerencia-vacio">${q ? 'Sin coincidencias en el catálogo — presiona Añadir para usar este texto' : 'Todos los productos del catálogo ya fueron agregados'}</div>`;
  } else {
    cont.innerHTML = coincidencias.map(p => `
      <div class="nom-cliente-sugerencia" onclick="srvSeleccionarProductoSugerido('${p.nombre.replace(/'/g, "\\'")}')">
        <span class="sug-razon">${p.nombre}</span>
      </div>
    `).join('');
  }
  cont.classList.add('open');
}

function srvSeleccionarProductoSugerido(nombre) {
  const input = document.getElementById('nomProductoInput');
  if (input) input.value = nombre;
  document.getElementById('nomProductoSugerencias')?.classList.remove('open');
  srvActualizarBotonProductoNom();
}

function srvActualizarBotonProductoNom() {
  const btn = document.getElementById('btnAgregarProductoNom');
  const input = document.getElementById('nomProductoInput');
  if (btn && input) btn.disabled = !input.value.trim();
}

function srvAgregarProductoNom() {
  const input = document.getElementById('nomProductoInput');
  const valor = input.value.trim();

  if (!valor) {
    mostrarToast('Escriba o seleccione un producto');
    return;
  }
  if (srvProductosFormulario.includes(valor)) {
    mostrarToast('Ese producto ya fue agregado');
    return;
  }

  srvProductosFormulario.push(valor);
  renderProductosFormulario();
  input.value = '';
  document.getElementById('nomProductoSugerencias')?.classList.remove('open');
  srvActualizarBotonProductoNom();
}

function srvQuitarProductoNom(indice) {
  srvProductosFormulario.splice(indice, 1);
  renderProductosFormulario();
}

// Inspector(es): a diferencia de Producto(s), NO admite texto libre — solo
// se pueden agregar usuarios que ya existan en el mantenedor de Usuarios
// con rol "Inspector" (srvUsuariosPorRol). Puede haber más de un inspector
// por nominación.
let srvInspectoresFormulario = [];

function srvInicialesNombre(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/);
  const primera = partes[0]?.[0] || '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primera + ultima).toUpperCase();
}

function renderInspectoresFormulario() {
  const cont = document.getElementById('nomInspectoresList');
  if (!cont) return;

  if (!srvInspectoresFormulario.length) {
    cont.innerHTML = `<span class="nom-inspectores-vacio">Aún no se han agregado inspectores</span>`;
    return;
  }

  cont.innerHTML = srvInspectoresFormulario.map((nombre, i) => `
    <span class="chip-tag chip-tag--persona">
      <span class="chip-tag-avatar">${srvInicialesNombre(nombre)}</span>
      <span>${nombre}</span>
      ${srvModoSoloLectura ? '' : `<button type="button" onclick="srvQuitarInspectorNom(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>`}
    </span>
  `).join('');
}

function srvBuscarInspectoresSugeridos(texto) {
  const cont = document.getElementById('nomInspectorSugerencias');
  if (!cont) return;
  const q = texto.trim().toLowerCase();

  const disponibles = srvUsuariosPorRol('Inspector')
    .map(srvNombreCompletoUsuario)
    .filter(nombre => !srvInspectoresFormulario.includes(nombre));
  const coincidencias = q ? disponibles.filter(n => n.toLowerCase().includes(q)) : disponibles;

  if (!coincidencias.length) {
    cont.innerHTML = `<div class="nom-cliente-sugerencia-vacio">${q ? 'Sin coincidencias — solo se pueden agregar usuarios con rol Inspector' : 'No hay más usuarios con rol Inspector disponibles'}</div>`;
  } else {
    cont.innerHTML = coincidencias.map(nombre => `
      <div class="nom-cliente-sugerencia" onclick="srvSeleccionarInspectorSugerido('${nombre.replace(/'/g, "\\'")}')">
        <span class="sug-razon">${nombre}</span>
      </div>
    `).join('');
  }
  cont.classList.add('open');
}

function srvSeleccionarInspectorSugerido(nombre) {
  const input = document.getElementById('nomInspectorInput');
  if (input) input.value = nombre;
  document.getElementById('nomInspectorSugerencias')?.classList.remove('open');
  srvActualizarBotonInspectorNom();
}

function srvActualizarBotonInspectorNom() {
  const btn = document.getElementById('btnAgregarInspectorNom');
  const input = document.getElementById('nomInspectorInput');
  if (btn && input) btn.disabled = !input.value.trim();
}

function srvAgregarInspectorNom() {
  const input = document.getElementById('nomInspectorInput');
  const valor = input.value.trim();

  if (!valor) {
    mostrarToast('Escriba o seleccione un inspector');
    return;
  }
  const encontrado = srvUsuariosPorRol('Inspector').find(u => srvNombreCompletoUsuario(u) === valor);
  if (!encontrado) {
    mostrarToast('Seleccione un inspector válido de la lista sugerida');
    return;
  }
  if (srvInspectoresFormulario.includes(valor)) {
    mostrarToast('Ese inspector ya fue agregado');
    return;
  }

  srvInspectoresFormulario.push(valor);
  renderInspectoresFormulario();
  input.value = '';
  document.getElementById('nomInspectorSugerencias')?.classList.remove('open');
  srvActualizarBotonInspectorNom();
}

function srvQuitarInspectorNom(indice) {
  srvInspectoresFormulario.splice(indice, 1);
  renderInspectoresFormulario();
}

// Categoría de Servicio: al igual que Producto(s), las sugerencias vienen
// del catálogo de Tablas Generales, pero acá solo se admite una única
// categoría por servicio — por eso, a diferencia de Producto(s), elegir
// una sugerencia reemplaza el valor del campo en vez de agregarlo a una
// lista. Si no está en el catálogo, se puede escribir libremente.
function srvBuscarCategoriasSugeridas(texto) {
  const cont = document.getElementById('nomCategoriaSugerencias');
  if (!cont) return;
  const q = texto.trim().toLowerCase();

  const disponibles = cargarCategoriasServicio();
  const coincidencias = q
    ? disponibles.filter(c => c.nombre.toLowerCase().includes(q))
    : disponibles;

  if (!coincidencias.length) {
    cont.innerHTML = `<div class="nom-cliente-sugerencia-vacio">${q ? 'Sin coincidencias en el catálogo — puede usar el texto escrito como categoría' : 'No hay categorías registradas en Tablas Generales'}</div>`;
  } else {
    cont.innerHTML = coincidencias.map(c => `
      <div class="nom-cliente-sugerencia" onclick="srvSeleccionarCategoriaSugerida('${c.nombre.replace(/'/g, "\\'")}')">
        <span class="sug-razon">${c.nombre}</span>
      </div>
    `).join('');
  }
  cont.classList.add('open');
}

function srvSeleccionarCategoriaSugerida(nombre) {
  const input = document.getElementById('nomServicioCategoria');
  if (input) input.value = nombre;
  document.getElementById('nomCategoriaSugerencias')?.classList.remove('open');
}

function srvSiguienteCodigo() {
  const lista = srvCargarNominaciones();
  const max = lista.reduce((acc, n) => {
    const num = parseInt(n.id.replace(/\D/g, ''), 10) || 0;
    return Math.max(acc, num);
  }, 0);
  return `NOM${String(max + 1).padStart(3, '0')}`;
}

// Suma de los porcentajes asignados a los clientes de la nominación — el
// total debe ser exactamente 100% para poder guardar/enviar (ver
// srvValidarFormularioNominacion). Se muestra en vivo debajo de la tabla.
function srvSumaPorcentajesClientes() {
  return srvClientesFormulario.reduce((acc, c) => acc + (Number(c.porcentaje) || 0), 0);
}

function srvActualizarTotalPorcentajeClientes() {
  const wrap = document.getElementById('nomClienteTotalWrap');
  const valor = document.getElementById('nomClienteTotalValor');
  if (!wrap || !valor) return;

  if (!srvClientesFormulario.length) {
    wrap.style.display = 'none';
    return;
  }

  const total = srvSumaPorcentajesClientes();
  wrap.style.display = '';
  valor.textContent = `${total}%`;
  wrap.classList.toggle('total-ok', total === 100);
  wrap.classList.toggle('total-error', total !== 100);
}

function renderClientesFormulario() {
  const tbody = document.getElementById('tbodyClientesNom');
  if (!tbody) return;

  if (!srvClientesFormulario.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="clientes-nom-empty">Aún no se han agregado clientes</td></tr>`;
    srvActualizarTotalPorcentajeClientes();
    return;
  }

  const hayEncargado = srvClientesFormulario.some(c => c.principal);

  tbody.innerHTML = srvClientesFormulario.map((c, i) => {
    const demo = SRV_CLIENTES_DEMO.find(d => d.ruc === c.ruc);
    const contactos = demo ? [...demo.contactos].sort((a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0)) : [];
    const contactoActual = contactos.find(ct => ct.nombre === c.contacto) || srvContactoPrincipal(demo);
    const opcionesContacto = contactos.map(ct =>
      `<option value="${ct.nombre}" ${c.contacto === ct.nombre ? 'selected' : ''}>${ct.nombre}${ct.principal ? ' (Principal)' : ''}</option>`
    ).join('');
    const checkboxDeshabilitado = hayEncargado && !c.principal;

    return `
    <tr class="${c.principal ? 'fila-encargado-nom' : ''}">
      <td>${i + 1}</td>
      <td>${c.nombre}</td>
      <td>${c.ruc || '—'}</td>
      <td>
        ${srvModoSoloLectura
          ? `<span>${c.porcentaje != null ? c.porcentaje + '%' : '—'}</span>`
          : `<div class="porcentaje-wrap">
          <input type="number" class="porcentaje-input-nom" min="0" max="100" placeholder="0" value="${c.porcentaje ?? ''}" onchange="cambiarPorcentajeNom(${i}, this.value)">
          <span class="porcentaje-suffix">%</span>
        </div>`}
      </td>
      <td>
        ${srvModoSoloLectura
          ? `<span>${c.contacto || '—'}</span>`
          : (contactos.length > 1
            ? `<select class="contacto-select-nom" onchange="cambiarContactoNom(${i}, this.value)">${opcionesContacto}</select>`
            : `<span>${c.contacto || '—'}</span>`)}
      </td>
      <td><span class="contacto-correo-nom" id="correoContacto-${i}">${contactoActual?.correo || '—'}</span></td>
      <td style="text-align:center">
        ${srvModoSoloLectura
          ? (c.principal ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' : '—')
          : `<input type="checkbox" class="principal-check-nom" title="${checkboxDeshabilitado ? 'Ya hay un encargado asignado' : 'Marcar como encargado'}" ${c.principal ? 'checked' : ''} ${checkboxDeshabilitado ? 'disabled' : ''} onchange="marcarPrincipalNom(${i}, this)">`}
      </td>
      <td>
        ${c.aceptacionEnviada
          ? `<button type="button" class="btn-accion btn-pass" title="Ver Aceptación" onclick="abrirModalAceptacionCliente(${i})">Ver</button>`
          : (srvModoSoloLectura
              ? '<span class="nom-inspectores-vacio">No enviada</span>'
              : `<button type="button" class="btn-accion btn-enviar-aceptacion" title="Enviar Aceptación a ${c.nombre}" onclick="abrirModalAceptacionCliente(${i})">Enviar</button>`)}
      </td>
      <td>
        ${srvModoSoloLectura ? '' : `<button class="btn-accion btn-eliminar" title="Quitar" onclick="quitarClienteNom(${i})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>`}
      </td>
    </tr>
  `;
  }).join('');

  srvActualizarTotalPorcentajeClientes();
}

// La suma de los porcentajes de todos los clientes no puede superar el
// 100%: si lo que se escribe para este cliente excede lo que queda
// disponible, se recorta al máximo posible y se avisa con un toast.
function cambiarPorcentajeNom(indice, valor) {
  if (valor === '') {
    srvClientesFormulario[indice].porcentaje = null;
    renderClientesFormulario();
    return;
  }

  let num = Math.min(100, Math.max(0, Number(valor) || 0));
  const sumaOtros = srvClientesFormulario.reduce((acc, c, i) => i === indice ? acc : acc + (Number(c.porcentaje) || 0), 0);
  const restante = Math.max(0, 100 - sumaOtros);

  if (num > restante) {
    num = restante;
    mostrarToast(`La suma de los porcentajes no puede superar 100% — máximo disponible para este cliente: ${restante}%`);
  }

  srvClientesFormulario[indice].porcentaje = num;
  renderClientesFormulario();
}

function cambiarContactoNom(indice, valor) {
  srvClientesFormulario[indice].contacto = valor;
  const cliente = srvClientesFormulario[indice];
  const demo = SRV_CLIENTES_DEMO.find(d => d.ruc === cliente.ruc);
  const contacto = demo?.contactos.find(ct => ct.nombre === valor);
  const celda = document.getElementById(`correoContacto-${indice}`);
  if (celda) {
    celda.textContent = contacto?.correo || '—';
    celda.classList.remove('correo-flash');
    requestAnimationFrame(() => celda.classList.add('correo-flash'));
    setTimeout(() => celda.classList.remove('correo-flash'), 900);
  }
}

function marcarPrincipalNom(indice, checkbox) {
  if (checkbox.checked) {
    srvClientesFormulario.forEach((c, i) => c.principal = i === indice);
  } else {
    srvClientesFormulario[indice].principal = false;
  }
  renderClientesFormulario();
}

function quitarClienteNom(indice) {
  srvClientesFormulario.splice(indice, 1);
  if (!srvClientesFormulario.some(c => c.principal) && srvClientesFormulario.length) {
    srvClientesFormulario[0].principal = true;
  }
  renderClientesFormulario();
}

function srvAgregarClienteAFormulario(cliente) {
  if (srvClientesFormulario.some(c => c.ruc === cliente.ruc)) {
    mostrarToast('Ese cliente ya fue agregado');
    return;
  }
  const contactoPrincipal = srvContactoPrincipal(cliente);
  srvClientesFormulario.push({
    nombre: cliente.razon,
    ruc: cliente.ruc,
    principal: srvClientesFormulario.length === 0,
    contacto: contactoPrincipal ? contactoPrincipal.nombre : '',
    aceptacionEnviada: false,
    fechaAceptacionEnviada: null,
    aceptacionSnapshot: null
  });
  renderClientesFormulario();
}

let srvClienteSeleccionadoNom = null;

function srvActualizarBotonesClienteFiltro() {
  const btnAgregar = document.getElementById('btnAgregarClienteNom');
  if (btnAgregar) btnAgregar.disabled = !srvClienteSeleccionadoNom;
}

function srvBuscarClientesSugeridos(texto) {
  srvClienteSeleccionadoNom = null;
  srvActualizarBotonesClienteFiltro();

  const cont = document.getElementById('nomClienteSugerencias');
  if (!cont) return;
  const q = texto.trim().toLowerCase();

  const disponibles = SRV_CLIENTES_DEMO.filter(c => !srvClientesFormulario.some(f => f.ruc === c.ruc));
  const coincidencias = q
    ? disponibles.filter(c => c.razon.toLowerCase().includes(q) || c.ruc.includes(q))
    : disponibles;

  if (!coincidencias.length) {
    cont.innerHTML = `<div class="nom-cliente-sugerencia-vacio">${q ? 'No se encontraron clientes' : 'Todos los clientes ya fueron agregados'}</div>`;
  } else {
    cont.innerHTML = coincidencias.map(c => `
      <div class="nom-cliente-sugerencia" onclick="srvMarcarClienteSeleccionado('${c.ruc}')">
        <span class="sug-razon">${c.razon}</span>
        <span class="sug-ruc">RUC: ${c.ruc}</span>
      </div>
    `).join('');
  }
  cont.classList.add('open');
}

function srvMarcarClienteSeleccionado(ruc) {
  const encontrado = SRV_CLIENTES_DEMO.find(c => c.ruc === ruc);
  if (!encontrado) return;

  srvClienteSeleccionadoNom = ruc;
  const input = document.getElementById('nomClienteBuscarInput');
  const cont = document.getElementById('nomClienteSugerencias');
  if (input) input.value = encontrado.razon;
  if (cont) cont.classList.remove('open');
  srvActualizarBotonesClienteFiltro();
}

function srvAgregarClienteSeleccionadoNom() {
  if (!srvClienteSeleccionadoNom) return;
  const encontrado = SRV_CLIENTES_DEMO.find(c => c.ruc === srvClienteSeleccionadoNom);
  if (encontrado) srvAgregarClienteAFormulario(encontrado);

  srvClienteSeleccionadoNom = null;
  const input = document.getElementById('nomClienteBuscarInput');
  if (input) input.value = '';
  srvActualizarBotonesClienteFiltro();
}

document.addEventListener('click', (e) => {
  document.querySelectorAll('.nom-cliente-sugerencias.open').forEach(sugerencias => {
    const contenedor = sugerencias.closest('.nom-cliente-buscador, .nom-producto-row, .nom-categoria-search-wrap, #aceptCorreoCopiaBuscadorWrap');
    if (contenedor && !contenedor.contains(e.target)) sugerencias.classList.remove('open');
  });
});

let srvArchivoPrevisualizado = null;

function renderArchivosNom() {
  const cont = document.getElementById('nomArchivosList');
  if (!cont) return;

  if (!srvArchivosFormulario.length) {
    cont.innerHTML = `<div class="cv-nombre" style="padding:14px 0 0">Sin archivos cargados</div>`;
    return;
  }

  cont.innerHTML = srvArchivosFormulario.map((item, i) => `
    <div class="cv-upload-row nom-archivo-item">
      <span class="cv-nombre">${item.nombre}</span>
      <button type="button" class="btn-accion btn-editar" title="Ver vista previa" onclick="verArchivoNom(${i})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      ${srvModoSoloLectura ? '' : `<button type="button" class="btn-accion btn-inactivar" title="Quitar" onclick="quitarArchivoNom(${i})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
      </button>`}
    </div>
  `).join('');
}

// Se lee el archivo como data URL para que la vista previa siga
// disponible aun después de guardar y recargar la página (sin backend
// no hay otro lugar donde persistir el binario).
function agregarArchivosNom(input) {
  [...input.files].forEach(f => {
    if (srvArchivosFormulario.some(a => a.nombre === f.name)) return;
    const item = { nombre: f.name, tipo: f.type, dataUrl: null };
    srvArchivosFormulario.push(item);
    const reader = new FileReader();
    reader.onload = () => {
      item.dataUrl = reader.result;
      renderArchivosNom();
    };
    reader.readAsDataURL(f);
  });
  input.value = '';
  renderArchivosNom();
}

function srvOcultarPreviewArchivoNom() {
  const preview = document.getElementById('nomArchivoPreview');
  if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; }
  srvArchivoPrevisualizado = null;
}

function verArchivoNom(indice) {
  const preview = document.getElementById('nomArchivoPreview');
  if (!preview) return;

  if (srvArchivoPrevisualizado === indice) {
    srvOcultarPreviewArchivoNom();
    return;
  }

  const item = srvArchivosFormulario[indice];
  if (!item) return;

  srvArchivoPrevisualizado = indice;

  if (item.dataUrl && (item.tipo || '').startsWith('image/')) {
    preview.innerHTML = `<img src="${item.dataUrl}" alt="${item.nombre}">`;
  } else if (item.dataUrl && item.tipo === 'application/pdf') {
    preview.innerHTML = `<iframe src="${item.dataUrl}"></iframe>`;
  } else {
    preview.innerHTML = `<div class="nom-archivo-preview-vacio">Vista previa no disponible para "${item.nombre}"</div>`;
  }
  preview.style.display = '';
}

function quitarArchivoNom(indice) {
  if (srvArchivoPrevisualizado === indice) srvOcultarPreviewArchivoNom();
  srvArchivosFormulario.splice(indice, 1);
  renderArchivosNom();
}

// El correo de Aceptación envía los mismos archivos adjuntos a la
// nominación — esta sección del modal solo los muestra, no permite
// agregar/quitar (eso se hace desde la sección "Archivo adjunto" de
// Nueva Nominación).
function renderArchivosAceptacionSoloLectura() {
  const cont = document.getElementById('aceptArchivosList');
  if (!cont) return;

  if (!srvArchivosFormulario.length) {
    cont.innerHTML = `<div class="cv-nombre" style="padding:0">Sin archivos adjuntos</div>`;
    return;
  }

  cont.innerHTML = srvArchivosFormulario.map(item => `
    <div class="cv-upload-row nom-archivo-item">
      <span class="cv-nombre">${item.nombre}</span>
    </div>
  `).join('');
}

function srvCargarFormularioParaEdicion(id, soloLectura) {
  const nom = srvCargarNominaciones().find(n => n.id === id);
  if (!nom) return;

  // Si el estado ya no admite edición (Finalizado en adelante), se entra
  // igual al formulario — no se saca a la persona del flujo de la
  // nominación — pero queda en modo lectura con un aviso explicando por
  // qué, y el botón "Cambiar estado" se mantiene disponible para seguir
  // avanzando el ciclo de vida sin tocar los datos operativos.
  const bloqueadaPorEstado = !srvNominacionEsEditable(nom.estado);

  srvEditandoId = id;
  srvModoSoloLectura = !!soloLectura || bloqueadaPorEstado;
  document.getElementById('tituloFormNomTexto').textContent = srvModoSoloLectura ? 'Visualizar Nominación' : 'Editar Nominación';
  document.getElementById('breadcrumbFormNom').textContent = srvModoSoloLectura ? 'Visualizar Nominación' : 'Editar Nominación';
  document.getElementById('tituloFormNomEstado').innerHTML = srvBadgeEstado(nom.estado);
  // "Cambiar estado" es una acción de gestión, no de edición de campos —
  // por eso se muestra tanto en Editar normal como en Editar bloqueado por
  // estado. Pero en "Ver Nominación" (modo=ver, elegido a propósito para
  // solo consultar) no corresponde ofrecer ninguna acción.
  document.getElementById('btnCambiarEstadoNom').style.display = soloLectura ? 'none' : '';

  const aviso = document.getElementById('nomBloqueadaAviso');
  if (aviso) {
    if (bloqueadaPorEstado && !soloLectura) {
      document.getElementById('nomBloqueadaAvisoTexto').textContent =
        `Esta nominación está en estado "${nom.estado}" y ya no se puede editar. Puedes cambiar su estado o revisar su historial de cambios.`;
      aviso.style.display = '';
    } else {
      aviso.style.display = 'none';
    }
  }
  document.getElementById('nomNumero').value = nom.id;
  document.getElementById('nomPer').value = nom.per || '';
  document.getElementById('nomFechaInicio').value = nom.fechaInicio || '';
  document.getElementById('nomFechaFin').value = nom.fechaFin || '';
  document.getElementById('nomBuque').value = nom.buque || '';
  document.getElementById('nomLocacion').value = nom.locacion || '';
  document.getElementById('nomSupervisor').value = nom.supervisor || '';
  document.getElementById('nomTipoOperacion').value = nom.tipoOperacion || '';
  document.getElementById('nomServicioNombre').value = nom.servicioNombre || '';
  document.getElementById('nomServicioCategoria').value = nom.servicioCategoria || '';
  document.getElementById('nomServicioDetalle').value = nom.servicioDetalle || '';
  document.getElementById('nomCantidad').value = nom.cantidad || '';
  document.getElementById('nomUnidadMedida').value = nom.unidadMedida || '';
  srvProductosFormulario = [...(nom.productos || [])];
  renderProductosFormulario();

  srvInspectoresFormulario = [...(nom.inspectores || [])];
  renderInspectoresFormulario();

  srvClientesFormulario = JSON.parse(JSON.stringify(nom.clientes || []));
  renderClientesFormulario();
  // Los archivos se guardan como data URL para que la vista previa siga
  // funcionando después de recargar la página (soporta también el formato
  // antiguo, donde solo se guardaba el nombre, sin vista previa disponible).
  srvArchivosFormulario = (nom.archivos || []).map(a =>
    typeof a === 'string' ? { nombre: a, tipo: '', dataUrl: null } : { ...a }
  );
  srvOcultarPreviewArchivoNom();
  renderArchivosNom();

  if (srvModoSoloLectura) srvAplicarModoSoloLectura(nom);
}

// Deja la página de edición en modo lectura: deshabilita los campos fijos,
// oculta los buscadores/botones de agregar (los renders de clientes,
// productos y archivos ya omiten sus controles de quitar por srvModoSoloLectura)
// y quita las acciones que no correspondan a una simple visualización.
function srvAplicarModoSoloLectura(nom) {
  ['nomPer', 'nomFechaInicio', 'nomFechaFin', 'nomBuque', 'nomLocacion', 'nomSupervisor',
    'nomTipoOperacion', 'nomServicioNombre', 'nomServicioCategoria', 'nomCantidad',
    'nomUnidadMedida', 'nomServicioDetalle'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  });

  document.querySelector('.nom-cliente-buscador')?.style.setProperty('display', 'none');
  // Producto(s) e Inspector(es) comparten la clase .nom-producto-row —
  // hay que ocultar ambas filas de búsqueda/agregar, no solo la primera.
  document.querySelectorAll('.nom-producto-row').forEach(el => el.style.setProperty('display', 'none'));
  document.getElementById('btnAdjuntarArchivoNom')?.style.setProperty('display', 'none');
  document.getElementById('btnGuardarNom')?.style.setProperty('display', 'none');
  const cerrarTexto = document.getElementById('btnCancelarNomTexto');
  if (cerrarTexto) cerrarTexto.textContent = 'Cerrar';
}

// Valida los campos obligatorios del formulario de Nominación — se usa
// tanto al Guardar (crear o editar) como antes de habilitar el envío de
// la Aceptación del Servicio, ya que esta última no debe poder enviarse
// si la nominación quedó con datos incompletos. Marca en rojo los campos
// faltantes y enfoca el primero; retorna true solo si todo es válido.
function srvValidarFormularioNominacion() {
  const perInput = document.getElementById('nomPer');
  const inicioInput = document.getElementById('nomFechaInicio');
  const finInput = document.getElementById('nomFechaFin');
  const buqueInput = document.getElementById('nomBuque');
  const locacionInput = document.getElementById('nomLocacion');
  const supervisorInput = document.getElementById('nomSupervisor');
  const tipoOperacionInput = document.getElementById('nomTipoOperacion');
  const camposRequeridos = [perInput, inicioInput, finInput, buqueInput, locacionInput, supervisorInput, tipoOperacionInput];

  let primerCampoInvalido = null;
  camposRequeridos.forEach(input => {
    limpiarErrorCampo(input);
    if (!(input.value || '').trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
    }
  });

  // N° de PER: formato fijo (PER/00000-00) y único entre nominaciones —
  // es el mismo valor que se muestra como "Número de referencia de
  // Intertek" en la Aceptación del Servicio.
  const perValor = perInput.value.trim();
  if (perValor && !SRV_PER_REGEX.test(perValor)) {
    mostrarErrorCampo(perInput, 'Formato inválido — debe ser PER/00000-00 (ej. PER/09461-26)');
    if (!primerCampoInvalido) primerCampoInvalido = perInput;
  } else if (perValor) {
    const perDuplicado = srvCargarNominaciones().some(n =>
      n.id !== srvEditandoId && (n.per || '').trim().toUpperCase() === perValor.toUpperCase()
    );
    if (perDuplicado) {
      mostrarErrorCampo(perInput, 'Ya existe otra nominación con este N° de PER');
      if (!primerCampoInvalido) primerCampoInvalido = perInput;
    }
  }

  if (inicioInput.value && finInput.value && finInput.value < inicioInput.value) {
    mostrarErrorCampo(finInput, 'La fecha final no puede ser anterior a la fecha inicio');
    if (!primerCampoInvalido) primerCampoInvalido = finInput;
  }

  if (primerCampoInvalido) {
    primerCampoInvalido.focus();
    return false;
  }
  if (!srvClientesFormulario.length) {
    mostrarToast('Agregue al menos un cliente a la nominación');
    return false;
  }

  // La suma de los porcentajes asignados a los clientes debe ser
  // exactamente 100% — ni menos (queda sin asignar) ni más (ya se impide
  // al escribirlo, ver cambiarPorcentajeNom, pero se valida igual acá).
  const totalPorcentaje = srvSumaPorcentajesClientes();
  if (totalPorcentaje !== 100) {
    mostrarToast(`La suma de los porcentajes de los clientes debe ser 100% (actualmente ${totalPorcentaje}%)`);
    document.getElementById('nomClienteTotalWrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  if (!srvInspectoresFormulario.length) {
    mostrarToast('Agregue al menos un inspector para poder realizar la Aceptación');
    document.getElementById('nomInspectoresList')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  return true;
}

function guardarNominacion() {
  if (srvEditandoId) {
    const actual = srvCargarNominaciones().find(n => n.id === srvEditandoId);
    if (actual && !srvNominacionEsEditable(actual.estado)) {
      mostrarToast('Esta nominación ya no se puede editar');
      return false;
    }
  }
  if (!srvValidarFormularioNominacion()) return false;

  const perInput = document.getElementById('nomPer');
  const inicioInput = document.getElementById('nomFechaInicio');
  const finInput = document.getElementById('nomFechaFin');
  const buqueInput = document.getElementById('nomBuque');
  const locacionInput = document.getElementById('nomLocacion');
  const supervisorInput = document.getElementById('nomSupervisor');
  const tipoOperacionInput = document.getElementById('nomTipoOperacion');

  const lista = srvCargarNominaciones();
  const nuevaId = srvEditandoId || srvSiguienteCodigo();
  const datos = {
    id: nuevaId,
    per: perInput.value.trim(),
    fechaInicio: inicioInput.value,
    fechaFin: finInput.value,
    buque: buqueInput.value,
    locacion: locacionInput.value,
    supervisor: supervisorInput.value,
    tipoOperacion: tipoOperacionInput.value,
    clientes: srvClientesFormulario,
    servicioNombre: document.getElementById('nomServicioNombre').value,
    servicioCategoria: document.getElementById('nomServicioCategoria').value,
    servicioDetalle: document.getElementById('nomServicioDetalle').value,
    productos: [...srvProductosFormulario],
    inspectores: [...srvInspectoresFormulario],
    cantidad: document.getElementById('nomCantidad').value,
    unidadMedida: document.getElementById('nomUnidadMedida').value,
    archivos: srvArchivosFormulario.map(a => ({ nombre: a.nombre, tipo: a.tipo || '', dataUrl: a.dataUrl || null }))
  };

  const eraEdicion = !!srvEditandoId;
  const idx = eraEdicion ? lista.findIndex(n => n.id === srvEditandoId) : -1;
  const anterior = idx >= 0 ? lista[idx] : null;

  datos.estado = anterior ? anterior.estado : 'Pendiente';
  datos.historial = anterior && Array.isArray(anterior.historial) ? anterior.historial : [];

  const historialEntradas = anterior
    ? srvCompararCamposNominacion(anterior, datos)
    : [{ tipo: 'creacion', campo: 'Nominación', valorAnterior: '—', valorNuevo: 'Registro creado' }];
  srvRegistrarHistorial(datos, historialEntradas);

  if (idx >= 0) lista[idx] = datos; else lista.push(datos);

  srvGuardarNominaciones(lista);
  srvEditandoId = nuevaId;
  document.getElementById('tituloFormNomTexto').textContent = 'Editar Nominación';
  document.getElementById('breadcrumbFormNom').textContent = 'Editar Nominación';
  document.getElementById('tituloFormNomEstado').innerHTML = srvBadgeEstado(datos.estado);
  document.getElementById('btnCambiarEstadoNom').style.display = '';
  mostrarModalGuardado(eraEdicion ? 'editar' : 'crear');
  return true;
}

// =================================================
// MODAL — ENVIAR ACEPTACIÓN DEL SERVICIO
// =================================================

// Idioma del contenido del modal de Aceptación (ES/EN) — el botón se crea
// dinámicamente en el header del modal, junto al título; no vive en el HTML.
let srvAceptIdioma = localStorage.getItem('srvAceptIdioma') === 'en' ? 'en' : 'es';

// Términos y Condiciones del modal de Aceptación: el texto legal se toma
// por defecto de Tablas Generales (ver TERMINOS_CONDICIONES_DEMO en
// data-tablas-generales.js). srvTerminosTextoActual guarda lo que se ve
// ahora mismo en el modal — puede ser ese valor de referencia o, si el
// usuario tocó "Editar", una versión ad-hoc solo para este envío (no se
// escribe de vuelta en Tablas Generales).
let srvTerminosEditando = false;
let srvTerminosTextoActual = '';

const SRV_ACEPT_I18N = {
  es: {
    'titulo-crear': 'Enviar Aceptación del Servicio',
    'titulo-vista': 'Aceptación enviada',
    'aviso-solo-lectura': 'Esta Aceptación ya fue enviada al cliente y no puede modificarse',
    'lbl-correos-copia': 'Correos electrónicos a enviar (en copia):',
    'lbl-asunto': 'Asunto',
    'btn-regenerar': 'Regenerar',
    'ph-asunto': 'Asunto del correo',
    'lbl-from': 'De:',
    'lbl-nombre-cliente': 'Nombre (Cliente)',
    'ph-nombre-cliente': 'Nombre del destinatario',
    'lbl-atencion': 'A la atención de',
    'ph-atencion': 'A la atención de',
    'lbl-destinatarios': 'Destinatarios (To):',
    'ph-agregar-correo': 'Agregar correos (separados por coma)...',
    'btn-anadir': 'Añadir',
    'lbl-firmante': 'Firmante (Intertek)',
    'opt-seleccionar': 'Seleccionar',
    'lbl-ref-cliente': 'Número de referencia al Cliente',
    'ph-ref-cliente': 'Referencia al cliente (N/A si no aplica)',
    'lbl-ref-intertek': 'Número de referencia de Intertek',
    'ph-ref-intertek': 'Referencia Intertek',
    'div-detalles-operacion': 'Detalles de la operación',
    'lbl-vessel': 'Buque :',
    'ph-vessel': 'Nombre del buque',
    'lbl-operation': 'Operación :',
    'ph-operation': 'Tipo de operación',
    'lbl-date-range': 'Rango de fechas :',
    'ph-date-range': 'dd-mmm-aaaa',
    'lbl-location': 'Locación/Terminal :',
    'ph-location': 'Locación / terminal',
    'lbl-product': 'Producto :',
    'ph-product': 'Producto(s)',
    'lbl-quantity': 'Cantidad :',
    'ph-quantity': 'Cantidad y unidad',
    'lbl-cost-sharing': 'Costo compartido :',
    'ph-cost-sharing': '% por cliente',
    'lbl-supervisor': 'Supervisor :',
    'lbl-attending-inspector': 'Inspector asignado :',
    'ph-attending-inspector': 'Supervisor de operaciones',
    'div-attending-office': 'Datos de contacto de oficina que atiende',
    'div-client-emergency': 'Datos de contacto de emergencia del cliente',
    'lbl-name': 'Nombre :',
    'ph-emerg-nombre': 'Nombre de contacto',
    'lbl-email': 'Correo :',
    'lbl-mobile': 'Celular :',
    'div-consideraciones': 'Consideraciones',
    'lbl-quantity-det': 'Determinación de cantidad',
    'ph-quantity-det': 'Describa la determinación de cantidad...',
    'lbl-quality-det': 'Determinación de calidad',
    'ph-quality-det': 'Describa la determinación de calidad...',
    'lbl-additional-comments': 'Comentarios adicionales',
    'ph-additional-comments': 'Comentarios adicionales...',
    'btn-adjuntar-imagen': 'Adjuntar imagen',
    'div-archivos-adjuntos': 'Archivos adjuntos',
    'txt-mismos-archivos': 'Se envían los mismos archivos adjuntos a la nominación.',
    'terminos-titulo': 'Términos y Condiciones Generales de Intertek:',
    'btn-editar-terminos': 'Editar',
    'btn-listo-terminos': 'Listo',
    'btn-cancelar': 'Cancelar',
    'btn-cerrar': 'Cerrar',
    'btn-enviar': 'Enviar',
    'lbl-view-correos-copia': 'En copia :',
    'lbl-view-asunto': 'Asunto :',
    'lbl-view-para': 'Para :',
    'txt-atencion-de': ' — A la atención de ',
    'lbl-view-destinatarios': 'Destinatarios (To) :',
    'lbl-view-firmante': 'Firmante :',
    'lbl-view-ref': 'Ref. Cliente / Intertek :',
    'div-correo': 'Correo',
    'lbl-view-attending-contacts': 'Contactos de oficina que atienden :',
    'lbl-view-contacto-emergencia': 'Contacto de emergencia :',
    'div-contactos': 'Contactos',
    'txt-sin-archivos': 'Sin archivos adjuntos',
    'txt-aun-no-enviada': 'Aún no se ha enviado la Aceptación para esta nominación.',
    'txt-sin-observaciones': 'Sin observaciones',
    'txt-guion': ' / ',
    'txt-sin-datos': '—',
    'txt-agregar-clientes-contactos': 'Agregue clientes a la nominación para ver sus contactos',
    'txt-sin-usuarios-copia': 'Sin usuarios marcados como "Incluir en copia" en el mantenedor de Usuarios',
    'txt-sin-usuarios-oficina': 'Sin usuarios marcados como "Attending Office Contact" en el mantenedor de Usuarios'
  },
  en: {
    'titulo-crear': 'Send Service Acceptance',
    'titulo-vista': 'Acceptance sent',
    'aviso-solo-lectura': 'This Acceptance has already been sent to the client and cannot be modified',
    'lbl-correos-copia': 'Emails to send (CC):',
    'lbl-asunto': 'Subject',
    'btn-regenerar': 'Regenerate',
    'ph-asunto': 'Email subject',
    'lbl-from': 'From:',
    'lbl-nombre-cliente': 'Name (Client)',
    'ph-nombre-cliente': 'Recipient name',
    'lbl-atencion': 'Attention of',
    'ph-atencion': 'Attention of',
    'lbl-destinatarios': 'Recipients (To):',
    'ph-agregar-correo': 'Add emails (comma-separated)...',
    'btn-anadir': 'Add',
    'lbl-firmante': 'Signatory (Intertek)',
    'opt-seleccionar': 'Select',
    'lbl-ref-cliente': 'Client reference number',
    'ph-ref-cliente': 'Client reference (N/A if not applicable)',
    'lbl-ref-intertek': 'Intertek reference number',
    'ph-ref-intertek': 'Intertek reference',
    'div-detalles-operacion': 'Operation details',
    'lbl-vessel': 'Vessel :',
    'ph-vessel': 'Vessel name',
    'lbl-operation': 'Operation :',
    'ph-operation': 'Operation type',
    'lbl-date-range': 'Date Range :',
    'ph-date-range': 'dd-mmm-yyyy',
    'lbl-location': 'Location/Terminal :',
    'ph-location': 'Location / terminal',
    'lbl-product': 'Product :',
    'ph-product': 'Product(s)',
    'lbl-quantity': 'Quantity :',
    'ph-quantity': 'Quantity and unit',
    'lbl-cost-sharing': 'Cost Sharing :',
    'ph-cost-sharing': '% by client',
    'lbl-supervisor': 'Supervisor :',
    'lbl-attending-inspector': 'Attending Inspector :',
    'ph-attending-inspector': 'Operations supervisor',
    'div-attending-office': 'Attending office contact details',
    'div-client-emergency': 'Client emergency contact details',
    'lbl-name': 'Name :',
    'ph-emerg-nombre': 'Contact name',
    'lbl-email': 'Email :',
    'lbl-mobile': 'Mobile Number :',
    'div-consideraciones': 'Considerations',
    'lbl-quantity-det': 'Quantity Determination',
    'ph-quantity-det': 'Describe the quantity determination...',
    'lbl-quality-det': 'Quality Determination',
    'ph-quality-det': 'Describe the quality determination...',
    'lbl-additional-comments': 'Additional comments',
    'ph-additional-comments': 'Additional comments...',
    'btn-adjuntar-imagen': 'Attach image',
    'div-archivos-adjuntos': 'Attached files',
    'txt-mismos-archivos': 'The same files attached to the nomination will be sent.',
    'terminos-titulo': "Intertek's General Terms and Conditions:",
    'btn-editar-terminos': 'Edit',
    'btn-listo-terminos': 'Done',
    'btn-cancelar': 'Cancel',
    'btn-cerrar': 'Close',
    'btn-enviar': 'Send',
    'lbl-view-correos-copia': 'CC :',
    'lbl-view-asunto': 'Subject :',
    'lbl-view-para': 'To :',
    'txt-atencion-de': ' — Attention of ',
    'lbl-view-destinatarios': 'Recipients (To) :',
    'lbl-view-firmante': 'Signatory :',
    'lbl-view-ref': 'Client / Intertek Ref. :',
    'div-correo': 'Email',
    'lbl-view-attending-contacts': 'Attending office contacts :',
    'lbl-view-contacto-emergencia': 'Emergency contact :',
    'div-contactos': 'Contacts',
    'txt-sin-archivos': 'No attached files',
    'txt-aun-no-enviada': 'The Acceptance for this nomination has not been sent yet.',
    'txt-sin-observaciones': 'No remarks',
    'txt-guion': ' / ',
    'txt-sin-datos': '—',
    'txt-agregar-clientes-contactos': 'Add clients to the nomination to see their contacts',
    'txt-sin-usuarios-copia': 'No users marked as "Include in copy" in the Users maintainer',
    'txt-sin-usuarios-oficina': 'No users marked as "Attending Office Contact" in the Users maintainer'
  }
};

function srvDiccionarioAceptacion() {
  return SRV_ACEPT_I18N[srvAceptIdioma] || SRV_ACEPT_I18N.es;
}

// Texto legal registrado en Tablas Generales para el idioma indicado (ver
// cargarTerminosCondiciones en data-tablas-generales.js). Un registro por
// idioma, con Nombre = "Español" / "English". Tablas Generales guarda esto
// como texto plano (párrafos separados por línea en blanco); el formato
// (negrita/cursiva/subrayado) solo se aplica puntualmente en el editor de
// esta Aceptación, ver srvToggleEditarTerminos.
function srvTerminosCondicionesTexto(idioma) {
  const nombreBuscado = idioma === 'en' ? 'English' : 'Español';
  const catalogo = typeof cargarTerminosCondiciones === 'function' ? cargarTerminosCondiciones() : [];
  const entrada = catalogo.find(t => t.nombre === nombreBuscado);
  return entrada ? entrada.descripcion : '';
}

function srvEscaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Convierte URLs planas en enlaces clicables, sobre texto ya escapado.
function srvLinkificarTexto(textoEscapado) {
  return textoEscapado.replace(/(https?:\/\/[^\s"]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

// HTML (escapado + linkificado) a partir del texto plano registrado en
// Tablas Generales — es el punto de partida antes de cualquier formato
// (negrita/cursiva/subrayado) que se aplique ad-hoc en el editor.
function srvTerminosHtmlDesdeTexto(texto) {
  const parrafos = (texto || '').split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return parrafos.map(p => `<p>${srvLinkificarTexto(srvEscaparHtml(p))}</p>`).join('');
}

function srvRenderTerminosCondiciones(html) {
  const cont = document.getElementById('aceptTerminosTexto');
  if (cont) cont.innerHTML = html;
}

// Solo se permiten las etiquetas de formato de texto (negrita/cursiva/
// subrayado), párrafos/saltos de línea y enlaces — cualquier otra cosa que
// haya llegado por un "pegar" dentro del editor (estilos inline, scripts,
// etc.) se descarta, conservando el texto. script/style se eliminan por
// completo (con su contenido) en vez de desenvolverse, porque ese
// contenido no es texto para mostrar.
const SRV_TERMINOS_TAGS_PERMITIDOS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'P', 'BR', 'A', 'DIV', 'SPAN']);
const SRV_TERMINOS_TAGS_A_ELIMINAR = new Set(['SCRIPT', 'STYLE']);

function srvSanitizarHtmlTerminos(html) {
  const contenedor = document.createElement('div');
  contenedor.innerHTML = html;

  const limpiarNodo = (nodo) => {
    [...nodo.childNodes].forEach(hijo => {
      if (hijo.nodeType === Node.ELEMENT_NODE) {
        if (SRV_TERMINOS_TAGS_A_ELIMINAR.has(hijo.tagName)) {
          hijo.remove();
          return;
        }
        limpiarNodo(hijo);
        if (!SRV_TERMINOS_TAGS_PERMITIDOS.has(hijo.tagName)) {
          hijo.replaceWith(...hijo.childNodes);
          return;
        }
        [...hijo.attributes].forEach(attr => {
          const permitido = hijo.tagName === 'A' && ['href', 'target', 'rel'].includes(attr.name);
          if (!permitido) hijo.removeAttribute(attr.name);
        });
      } else if (hijo.nodeType !== Node.TEXT_NODE) {
        hijo.remove();
      }
    });
  };
  limpiarNodo(contenedor);
  return contenedor.innerHTML;
}

// Alterna entre ver el texto registrado en Tablas Generales y editarlo
// puntualmente para este envío (no modifica el catálogo de Tablas
// Generales, solo lo que se muestra/envía en esta Aceptación). En modo
// edición se puede aplicar negrita/cursiva/subrayado con la barra de
// herramientas (srvFormatoTerminos), igual que al redactar un correo.
function srvToggleEditarTerminos() {
  const textoDiv = document.getElementById('aceptTerminosTexto');
  const editorWrap = document.getElementById('aceptTerminosEditorWrap');
  const editable = document.getElementById('aceptTerminosTextoEdit');
  const btnTexto = document.getElementById('aceptTerminosEditarTexto');
  if (!textoDiv || !editorWrap || !editable) return;
  const dict = srvDiccionarioAceptacion();

  srvTerminosEditando = !srvTerminosEditando;
  if (srvTerminosEditando) {
    editable.innerHTML = srvTerminosTextoActual;
    textoDiv.style.display = 'none';
    editorWrap.style.display = '';
    editable.focus();
    if (btnTexto) btnTexto.textContent = dict['btn-listo-terminos'];
  } else {
    srvTerminosTextoActual = srvSanitizarHtmlTerminos(editable.innerHTML.trim()) || srvTerminosTextoActual;
    srvRenderTerminosCondiciones(srvTerminosTextoActual);
    editorWrap.style.display = 'none';
    textoDiv.style.display = '';
    if (btnTexto) btnTexto.textContent = dict['btn-editar-terminos'];
  }
}

// Aplica negrita/cursiva/subrayado a la selección actual dentro del editor
// de Términos y Condiciones (mismas propiedades básicas de formato que se
// usarían para redactar un correo, ya que esta Aceptación se envía como tal).
function srvFormatoTerminos(comando) {
  const editable = document.getElementById('aceptTerminosTextoEdit');
  if (!editable) return;
  editable.focus();
  document.execCommand(comando, false, null);
  srvActualizarToolbarTerminos();
}

function srvActualizarToolbarTerminos() {
  document.querySelectorAll('#aceptTerminosEditorWrap .acept-editor-toolbar-btn').forEach(btn => {
    const cmd = btn.getAttribute('data-cmd');
    let activo = false;
    try { activo = document.queryCommandState(cmd); } catch (e) { /* noop */ }
    btn.classList.toggle('active', activo);
  });
}

document.addEventListener('selectionchange', () => {
  const editable = document.getElementById('aceptTerminosTextoEdit');
  if (editable && document.activeElement === editable) srvActualizarToolbarTerminos();
});

// Crea el selector de idioma (ES/EN) e lo inserta en la misma fila del
// título del modal — se genera por JS, no vive escrito en el HTML.
function srvCrearToggleIdiomaAceptacion() {
  const header = document.querySelector('#modalAceptacion .modal-header');
  if (!header || document.getElementById('aceptIdiomaSwitch')) return;

  const titulo = header.querySelector('.modal-title');
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;gap:14px;min-width:0';
  titulo.parentNode.insertBefore(wrap, titulo);
  wrap.appendChild(titulo);

  const sw = document.createElement('div');
  sw.className = 'acept-idioma-switch';
  sw.id = 'aceptIdiomaSwitch';
  sw.innerHTML = `
    <button type="button" class="acept-idioma-btn" data-lang="es">ES</button>
    <button type="button" class="acept-idioma-btn" data-lang="en">EN</button>
  `;
  sw.querySelectorAll('.acept-idioma-btn').forEach(btn => {
    btn.addEventListener('click', () => srvCambiarIdiomaAceptacion(btn.dataset.lang));
  });
  wrap.appendChild(sw);

  srvActualizarBotonesIdiomaAceptacion();
}

function srvCambiarIdiomaAceptacion(lang) {
  if (lang !== 'es' && lang !== 'en') return;
  srvAceptIdioma = lang;
  localStorage.setItem('srvAceptIdioma', lang);
  srvAplicarIdiomaAceptacion();
}

function srvActualizarBotonesIdiomaAceptacion() {
  document.querySelectorAll('#aceptIdiomaSwitch .acept-idioma-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === srvAceptIdioma);
  });
}

// Aplica el idioma actual a todo el contenido del modal: textos fijos
// (data-i18n), placeholders (data-i18n-ph), título/botones según el modo
// (creación o solo-lectura) y, si corresponde, vuelve a pintar la vista de
// "Aceptación enviada" con el idioma nuevo.
function srvAplicarIdiomaAceptacion() {
  const dict = srvDiccionarioAceptacion();
  const modal = document.getElementById('modalAceptacion');
  if (!modal) return;

  modal.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] != null) el.textContent = dict[key];
  });
  modal.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key] != null) el.placeholder = dict[key];
  });
  modal.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] != null) el.title = dict[key];
  });
  // Términos y Condiciones: se muestran según lo registrado en Tablas
  // Generales para el idioma activo. Cambiar de idioma descarta cualquier
  // edición ad-hoc hecha con "Editar" y vuelve a lo registrado.
  srvTerminosEditando = false;
  srvTerminosTextoActual = srvTerminosHtmlDesdeTexto(srvTerminosCondicionesTexto(srvAceptIdioma));
  srvRenderTerminosCondiciones(srvTerminosTextoActual);
  document.getElementById('aceptTerminosEditorWrap')?.style.setProperty('display', 'none');
  document.getElementById('aceptTerminosTexto')?.style.removeProperty('display');

  const enLectura = document.getElementById('aceptSoloLecturaBody')?.style.display !== 'none';
  document.getElementById('aceptModalTituloTexto').textContent = enLectura ? dict['titulo-vista'] : dict['titulo-crear'];
  document.getElementById('aceptBtnCerrarTexto').textContent = enLectura ? dict['btn-cerrar'] : dict['btn-cancelar'];

  if (enLectura && srvEditandoId && srvAceptacionClienteIndex != null) {
    const nomActual = srvCargarNominaciones().find(n => n.id === srvEditandoId);
    const clienteActual = nomActual?.clientes?.[srvAceptacionClienteIndex];
    if (nomActual && clienteActual) document.getElementById('aceptSoloLecturaBody').innerHTML = srvHtmlSnapshotAceptacion(clienteActual, nomActual);
  }

  srvActualizarBotonesIdiomaAceptacion();
}

// Asunto autogenerado: {RefCliente} // Confirmation of Attendance // {Vessel}
// // {Operation} // {Product} // {Location} // {Date Range} // {RefIntertek}
// (omite segmentos vacíos). Queda editable después de generarse.
function srvGenerarAsunto() {
  const val = id => document.getElementById(id)?.value.trim() || '';
  const partes = [
    val('aceptRefCliente'),
    'Confirmation of Attendance',
    val('aceptVessel'),
    val('aceptOperation'),
    val('aceptProduct'),
    val('aceptLocation'),
    val('aceptDateRange'),
    val('aceptRefIntertek')
  ].filter(Boolean);
  const input = document.getElementById('aceptAsunto');
  if (input) input.value = partes.join(' // ');
}

// Índice (en srvClientesFormulario) del cliente cuya Aceptación se está
// componiendo o viendo en el modal — cada cliente de la nominación tiene su
// propia Aceptación independiente (destinatarios/Attn./contacto de
// emergencia propios); el resto del contenido (Vessel, Product, Cantidad,
// Consideraciones, archivos, Términos) se comparte igual para todos.
let srvAceptacionClienteIndex = null;

function abrirModalAceptacionCliente(clienteIndex) {
  const cliente = srvClientesFormulario[clienteIndex];
  if (!cliente) return;

  srvAceptacionClienteIndex = clienteIndex;

  if (cliente.aceptacionEnviada) {
    if (!srvEditandoId) return;
    const nomActual = srvCargarNominaciones().find(n => n.id === srvEditandoId);
    const clienteActual = nomActual?.clientes?.[clienteIndex];
    if (nomActual && clienteActual) srvAbrirModalAceptacionSoloLecturaCliente(clienteActual, nomActual);
    return;
  }

  // No se puede enviar la Aceptación de una nominación con campos
  // obligatorios incompletos — se marcan en rojo y ni siquiera se abre
  // el modal de envío.
  if (!srvValidarFormularioNominacion()) {
    mostrarToast('Complete los campos obligatorios de la nominación antes de enviar la Aceptación');
    return;
  }

  document.getElementById('aceptSoloLecturaAviso').style.display = 'none';
  document.getElementById('aceptSoloLecturaBody').style.display = 'none';
  document.getElementById('aceptFormularioBody').style.display = '';
  document.getElementById('aceptBtnEnviar').style.display = '';
  document.getElementById('aceptModalTituloTexto').textContent = `Enviar Aceptación del Servicio — ${cliente.nombre}`;

  const buque = document.getElementById('nomBuque')?.value || '';
  const operacion = document.getElementById('nomTipoOperacion')?.value || '';
  const locacion = document.getElementById('nomLocacion')?.value || '';
  const producto = srvProductosFormulario.join(' / ');
  const cantidad = document.getElementById('nomCantidad')?.value || '';
  const unidadMedida = document.getElementById('nomUnidadMedida')?.value || '';
  const supervisorNombre = document.getElementById('nomSupervisor')?.value || '';

  const contacto = srvContactoDeCliente(cliente);

  // Date Range = fecha en la que se está enviando la Aceptación (hoy), no las
  // fechas de inicio/fin de la nominación.
  const rango = srvFormatoFechaDocumento(new Date().toISOString().slice(0, 10));
  const cantidadTexto = cantidad ? `${Number(cantidad).toLocaleString('en-US')}${unidadMedida ? ' ' + unidadMedida : ''}` : '';
  // Cost Sharing es informativo del reparto completo entre todos los
  // clientes de la nominación — se mantiene igual para todos, a diferencia
  // de Destinatarios/Attn./Contacto de emergencia que sí son de este cliente.
  const costSharing = srvClientesFormulario.length
    ? srvClientesFormulario.map(c => `${c.porcentaje != null ? c.porcentaje + '% ' : ''}${c.nombre}`).join(' / ')
    : '';

  document.getElementById('aceptNombre').value = cliente.nombre || '';
  document.getElementById('aceptAtencion').value = contacto ? contacto.nombre : '';

  // Destinatarios (To) — checklist con los contactos de ESTE cliente
  // únicamente (cada cliente de la nominación tiene su propia Aceptación).
  // Se marca por defecto el contacto que este cliente tiene seleccionado.
  const destinatariosCont = document.getElementById('aceptDestinatariosTo');
  const demoCliente = SRV_CLIENTES_DEMO.find(d => d.ruc === cliente.ruc);
  const filasDestinatarios = (demoCliente?.contactos || []).map(ct => `
      <label class="acept-oficina-item">
        <input type="checkbox" value="${ct.nombre}" ${ct.nombre === cliente.contacto ? 'checked' : ''}>
        <span class="oficina-info">
          <span class="oficina-nombre">${ct.nombre}</span>
          <span class="oficina-datos">${ct.correo || '—'}</span>
        </span>
      </label>
    `);
  destinatariosCont.innerHTML = filasDestinatarios.length
    ? filasDestinatarios.join('')
    : '<span class="nom-cliente-sugerencia-vacio">Este cliente no tiene contactos registrados</span>';

  // Correos sueltos agregados a mano como destinatario adicional — se
  // reinician en cada apertura del compositor (son solo para este envío).
  srvDestinatariosSueltos = [];
  document.getElementById('aceptDestinatarioNuevoInput').value = '';
  renderDestinatariosSueltos();

  // El Firmante debe tener rol de Gerente — puede firmar más de una
  // persona a la vez, así que es un checklist (no un selector único). Se
  // marca por defecto la sesión actual si esta califica.
  const firmanteCont = document.getElementById('aceptFirmante');
  const candidatosFirmante = srvUsuariosPorRol('Gerente de Laboratorio');
  const sesion = typeof obtenerUsuarioActual === 'function' ? obtenerUsuarioActual() : null;
  firmanteCont.innerHTML = candidatosFirmante.length
    ? candidatosFirmante.map(u => `
    <label class="acept-oficina-item">
      <input type="checkbox" value="${u.usuario}" ${sesion && sesion.usuario === u.usuario ? 'checked' : ''}>
      <span class="oficina-info">
        <span class="oficina-nombre">${srvNombreCompletoUsuario(u)}</span>
      </span>
    </label>`).join('')
    : '<span class="nom-cliente-sugerencia-vacio">No hay usuarios con rol Gerente de Laboratorio</span>';

  // Correos electrónicos a enviar (en copia) — checklist de usuarios
  // marcados como "Incluir en copia" en el mantenedor de Usuarios
  // (checked por defecto, suelen ser pocos). Los correos del catálogo
  // "Correos en Copia" de Tablas Generales pueden ser muchos, así que se
  // buscan y agregan de a uno más abajo, no se tildan todos de entrada.
  const copiaCont = document.getElementById('aceptCorreosCopia');
  const candidatosCopiaUsuarios = srvUsuariosIncluirCopia();
  copiaCont.innerHTML = candidatosCopiaUsuarios.length
    ? candidatosCopiaUsuarios.map(u => `
    <label class="acept-oficina-item">
      <input type="checkbox" value="${u.usuario}" checked>
      <span class="oficina-info">
        <span class="oficina-nombre">${srvNombreCompletoUsuario(u)}</span>
        <span class="oficina-datos">${u.email}</span>
      </span>
    </label>
    `).join('')
    : '<span class="nom-cliente-sugerencia-vacio" data-i18n="txt-sin-usuarios-copia">Sin usuarios marcados como "Incluir en copia" en el mantenedor de Usuarios</span>';

  // Correos del catálogo "Correos en Copia" agregados a mano — se
  // reinician en cada apertura del compositor (son solo para este envío).
  srvCorreosCopiaAgregados = [];
  document.getElementById('aceptCorreoCopiaBuscarInput').value = '';
  renderCorreosCopiaCatalogo();

  // El N° de PER de la nominación es único y es el mismo valor que se usa
  // como Número de referencia de Intertek — no se vuelve a escribir acá.
  document.getElementById('aceptRefIntertek').value = document.getElementById('nomPer')?.value || '';
  document.getElementById('aceptVessel').value = buque;
  document.getElementById('aceptOperation').value = operacion;
  document.getElementById('aceptDateRange').value = rango;
  document.getElementById('aceptLocation').value = locacion;
  document.getElementById('aceptProduct').value = producto;
  document.getElementById('aceptQuantity').value = cantidadTexto;
  document.getElementById('aceptCostSharing').value = costSharing;
  // A diferencia de "Attending Inspector" (editable, se puede personalizar
  // para el correo), este campo siempre refleja el Supervisor de
  // Operaciones seleccionado en la nominación, sin poder modificarse acá.
  document.getElementById('aceptSupervisor').textContent = supervisorNombre || '—';
  // El Supervisor y el Inspector no son la misma persona: "Attending
  // Inspector" se precarga con el/los Inspector(es) agregados a la
  // nominación (sigue siendo editable a mano antes de enviar).
  document.getElementById('aceptAttendingInspector').value = srvInspectoresFormulario.join(' / ');
  srvGenerarAsunto();

  // Contactos de oficina que atienden — checklist de usuarios marcados como
  // "Attending Office Contact" en el mantenedor de Usuarios; se puede tildar
  // o destildar aquí mismo antes de enviar (se envía solo lo que quede marcado)
  const oficinaCont = document.getElementById('aceptContactosOficina');
  const candidatosOficina = srvUsuariosContactoOficina();
  oficinaCont.innerHTML = candidatosOficina.length
    ? candidatosOficina.map(u => `
    <label class="acept-oficina-item">
      <input type="checkbox" value="${u.usuario}" checked>
      <span class="oficina-info">
        <span class="oficina-nombre">${srvNombreCompletoUsuario(u)}</span>
        <span class="oficina-datos">${u.email}${u.celular ? ' — ' + u.celular : ''}</span>
      </span>
    </label>
    `).join('')
    : '<span class="nom-cliente-sugerencia-vacio" data-i18n="txt-sin-usuarios-oficina">Sin usuarios marcados como "Attending Office Contact" en el mantenedor de Usuarios</span>';

  // Contacto de emergencia — precargado desde el contacto de ESTE cliente,
  // pero editable por si falta algún dato
  document.getElementById('aceptEmergenciaNombre').value = contacto ? contacto.nombre : '';
  document.getElementById('aceptEmergenciaCorreo').value = contacto ? (contacto.correo || '') : '';
  document.getElementById('aceptEmergenciaTelefono').value = contacto ? (contacto.telefono || '') : '';

  // Bloques de texto libre: se limpian entre aperturas del modal
  document.getElementById('aceptDeterminacionCantidad').value = '';
  document.getElementById('aceptDeterminacionCalidad').value = '';
  document.getElementById('aceptComentariosAdicionales').value = '';
  srvLimpiarImagenAceptacion('aceptCantidadImagenPreview');
  srvLimpiarImagenAceptacion('aceptCalidadImagenPreview');
  srvLimpiarImagenAceptacion('aceptComentariosImagenPreview');

  renderArchivosAceptacionSoloLectura();

  srvAplicarIdiomaAceptacion();
  abrirModal('modalAceptacion');
}

// Una vez enviada la Aceptación de un cliente, esa Aceptación queda fijada:
// el botón de ese cliente ya no reabre el formulario editable, solo muestra
// en modo lectura lo que efectivamente se le envió (aceptacionSnapshot).
function srvAbrirModalAceptacionSoloLecturaCliente(cliente, nom) {
  document.getElementById('aceptSoloLecturaAviso').style.display = '';
  document.getElementById('aceptFormularioBody').style.display = 'none';
  document.getElementById('aceptBtnEnviar').style.display = 'none';
  document.getElementById('aceptModalTituloTexto').textContent = `Aceptación enviada — ${cliente.nombre}`;

  const cont = document.getElementById('aceptSoloLecturaBody');
  cont.innerHTML = srvHtmlSnapshotAceptacion(cliente, nom);
  cont.style.display = '';

  srvAplicarIdiomaAceptacion();
  abrirModal('modalAceptacion');
}

// Se guardan como data URL (no como blob URL) para que la imagen quede
// incluida en el aceptacionSnapshot y siga visible al ver la Aceptación
// enviada después de recargar la página.
const srvImagenesAceptacion = {};

// El botón "Adjuntar imagen" y el recuadro cuadrado de añadir/reemplazar
// comparten el mismo id base que el contenedor de la miniatura (sufijo
// "Preview" -> "Btn" / "Add"), así que se derivan a partir de previewId.
function srvAlternarControlesImagenAceptacion(previewId, hayImagen) {
  const btn = document.getElementById(previewId.replace('Preview', 'Btn'));
  const add = document.getElementById(previewId.replace('Preview', 'Add'));
  if (btn) btn.style.display = hayImagen ? 'none' : '';
  if (add) add.style.display = hayImagen ? '' : 'none';
}

function srvAdjuntarImagenAceptacion(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById(previewId);
  if (!preview) return;

  const reader = new FileReader();
  reader.onload = () => {
    srvImagenesAceptacion[previewId] = reader.result;
    preview.innerHTML = `
      <span class="acept-imagen-item">
        <img src="${reader.result}" alt="${file.name}">
        <button type="button" class="acept-imagen-quitar" title="Quitar imagen" onclick="srvLimpiarImagenAceptacion('${previewId}')">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </span>`;
    srvAlternarControlesImagenAceptacion(previewId, true);
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function srvLimpiarImagenAceptacion(previewId) {
  const preview = document.getElementById(previewId);
  if (preview) preview.innerHTML = '';
  delete srvImagenesAceptacion[previewId];
  srvAlternarControlesImagenAceptacion(previewId, false);
}

// Destinatarios (To) no tienen por qué limitarse a los contactos ya
// registrados del cliente — se puede sumar cualquier otro correo suelto
// como destinatario adicional, solo para este envío (no queda guardado en
// ningún mantenedor). Se reinicia cada vez que se abre el compositor de
// Aceptación de un cliente.
let srvDestinatariosSueltos = [];

function renderDestinatariosSueltos() {
  const cont = document.getElementById('aceptDestinatariosSueltosList');
  if (!cont) return;
  cont.innerHTML = srvDestinatariosSueltos.map((correo, i) => `
    <span class="chip-tag">
      <span>${correo}</span>
      <button type="button" onclick="srvQuitarDestinatarioSuelto(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </span>
  `).join('');
}

// Admite agregar varios correos de una sola vez, separados por coma,
// punto y coma o espacios/saltos de línea (pegar una lista completa
// también funciona).
function srvAgregarDestinatarioSuelto() {
  const input = document.getElementById('aceptDestinatarioNuevoInput');
  const crudo = input.value.trim();
  if (!crudo) { mostrarToast('Escriba uno o más correos'); return; }

  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const partes = crudo.split(/[,;\s]+/).map(c => c.trim()).filter(Boolean);

  let agregados = 0;
  let invalidos = 0;
  partes.forEach(correo => {
    if (!regexCorreo.test(correo)) { invalidos++; return; }
    if (srvDestinatariosSueltos.some(c => c.toLowerCase() === correo.toLowerCase())) return;
    srvDestinatariosSueltos.push(correo);
    agregados++;
  });

  renderDestinatariosSueltos();
  input.value = '';

  if (!agregados) { mostrarToast('Ingrese al menos un correo válido'); return; }
  mostrarToast(agregados === 1
    ? 'Correo agregado'
    : `${agregados} correos agregados${invalidos ? ` (${invalidos} inválido${invalidos > 1 ? 's' : ''} omitido${invalidos > 1 ? 's' : ''})` : ''}`);
}

function srvQuitarDestinatarioSuelto(indice) {
  srvDestinatariosSueltos.splice(indice, 1);
  renderDestinatariosSueltos();
}

// Correos "en copia" del catálogo Tablas Generales: puede haber muchos, así
// que en vez de tildarlos todos por defecto se buscan y agregan de a uno
// (mismo patrón que Producto(s)/Inspector(es) en la nominación) — solo
// admite valores que existan en el catálogo, no texto libre.
let srvCorreosCopiaAgregados = [];

function renderCorreosCopiaCatalogo() {
  const cont = document.getElementById('aceptCorreosCopiaCatalogoList');
  if (!cont) return;
  if (!srvCorreosCopiaAgregados.length) {
    cont.innerHTML = `<span class="nom-inspectores-vacio">Aún no se agregó ningún correo del catálogo</span>`;
    return;
  }
  cont.innerHTML = srvCorreosCopiaAgregados.map((c, i) => `
    <span class="chip-tag">
      <span>${c.nombre} (${c.descripcion})</span>
      <button type="button" onclick="srvQuitarCorreoCopiaCatalogo(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </span>
  `).join('');
}

function srvBuscarCorreosCopiaSugeridos(texto) {
  const cont = document.getElementById('aceptCorreoCopiaSugerencias');
  if (!cont) return;
  const q = texto.trim().toLowerCase();
  const disponibles = cargarCorreosCopia().filter(c => !srvCorreosCopiaAgregados.some(a => a.id === c.id));
  const coincidencias = q
    ? disponibles.filter(c => c.nombre.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q))
    : disponibles;

  cont.innerHTML = coincidencias.length
    ? coincidencias.map(c => `
      <div class="nom-cliente-sugerencia" onclick="srvSeleccionarCorreoCopiaSugerido('${c.nombre.replace(/'/g, "\\'")}')">
        <span class="sug-razon">${c.nombre}</span>
        <span class="sug-ruc">${c.descripcion}</span>
      </div>
    `).join('')
    : `<div class="nom-cliente-sugerencia-vacio">${q ? 'Sin coincidencias' : 'Todos los correos del catálogo ya fueron agregados'}</div>`;
  cont.classList.add('open');
}

function srvSeleccionarCorreoCopiaSugerido(nombre) {
  const input = document.getElementById('aceptCorreoCopiaBuscarInput');
  if (input) input.value = nombre;
  document.getElementById('aceptCorreoCopiaSugerencias')?.classList.remove('open');
  srvActualizarBotonCorreoCopiaNom();
}

function srvActualizarBotonCorreoCopiaNom() {
  const btn = document.getElementById('btnAgregarCorreoCopiaNom');
  const input = document.getElementById('aceptCorreoCopiaBuscarInput');
  if (btn && input) btn.disabled = !input.value.trim();
}

function srvAgregarCorreoCopiaCatalogo() {
  const input = document.getElementById('aceptCorreoCopiaBuscarInput');
  const valor = input.value.trim();
  if (!valor) { mostrarToast('Escriba o seleccione un correo'); return; }

  const encontrado = cargarCorreosCopia().find(c => c.nombre === valor);
  if (!encontrado) { mostrarToast('Seleccione un correo válido de la lista sugerida'); return; }
  if (srvCorreosCopiaAgregados.some(c => c.id === encontrado.id)) { mostrarToast('Ese correo ya fue agregado'); return; }

  srvCorreosCopiaAgregados.push(encontrado);
  renderCorreosCopiaCatalogo();
  input.value = '';
  document.getElementById('aceptCorreoCopiaSugerencias')?.classList.remove('open');
  srvActualizarBotonCorreoCopiaNom();
}

function srvQuitarCorreoCopiaCatalogo(indice) {
  srvCorreosCopiaAgregados.splice(indice, 1);
  renderCorreosCopiaCatalogo();
}

function srvContactosMarcados(containerId) {
  return [...document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`)].map(cb => {
    const item = cb.closest('.acept-oficina-item');
    const nombre = item?.querySelector('.oficina-nombre')?.textContent.trim() || '';
    const datos = item?.querySelector('.oficina-datos')?.textContent.trim() || '';
    return datos ? `${nombre} (${datos})` : nombre;
  });
}

function srvCapturarSnapshotAceptacion() {
  const val = id => document.getElementById(id)?.value.trim() || '';
  return {
    asunto: val('aceptAsunto'),
    nombreCliente: val('aceptNombre'),
    atencion: val('aceptAtencion'),
    // Puede haber más de un Firmante marcado — se guardan todos.
    firmante: srvContactosMarcados('aceptFirmante'),
    // Número de referencia al Cliente es opcional: si el cliente no dio uno,
    // queda como "N/A" en vez de quedar vacío.
    refCliente: val('aceptRefCliente') || 'N/A',
    refIntertek: val('aceptRefIntertek'),
    vessel: val('aceptVessel'),
    operation: val('aceptOperation'),
    dateRange: val('aceptDateRange'),
    location: val('aceptLocation'),
    product: val('aceptProduct'),
    quantity: val('aceptQuantity'),
    costSharing: val('aceptCostSharing'),
    supervisor: document.getElementById('nomSupervisor')?.value || '',
    attendingInspector: val('aceptAttendingInspector'),
    contactosOficina: srvContactosMarcados('aceptContactosOficina'),
    correosCopia: [...srvContactosMarcados('aceptCorreosCopia'), ...srvCorreosCopiaAgregados.map(c => `${c.nombre} (${c.descripcion})`)],
    destinatariosTo: [...srvContactosMarcados('aceptDestinatariosTo'), ...srvDestinatariosSueltos],
    emergenciaNombre: val('aceptEmergenciaNombre'),
    emergenciaCorreo: val('aceptEmergenciaCorreo'),
    emergenciaTelefono: val('aceptEmergenciaTelefono'),
    determinacionCantidad: val('aceptDeterminacionCantidad'),
    determinacionCalidad: val('aceptDeterminacionCalidad'),
    comentariosAdicionales: val('aceptComentariosAdicionales'),
    imagenCantidad: srvImagenesAceptacion['aceptCantidadImagenPreview'] || null,
    imagenCalidad: srvImagenesAceptacion['aceptCalidadImagenPreview'] || null,
    imagenComentarios: srvImagenesAceptacion['aceptComentariosImagenPreview'] || null,
    // Los mismos archivos adjuntos de la nominación se envían con la
    // Aceptación — se guardan aquí para que la vista de "Ver Aceptación"
    // muestre exactamente lo que se envió, aunque luego se editen o
    // reemplacen los archivos de la nominación.
    archivos: srvArchivosFormulario.map(a => ({ nombre: a.nombre, tipo: a.tipo || '', dataUrl: a.dataUrl || null })),
    // Términos y Condiciones tal como quedaron en el editor (con cualquier
    // negrita/cursiva/subrayado aplicado) — esto es lo que efectivamente se
    // envió como parte del correo, no lo que esté registrado en Tablas
    // Generales al momento de volver a ver la Aceptación.
    terminosHtml: srvTerminosTextoActual || ''
  };
}

function enviarAceptacionCliente() {
  // Enviar la Aceptación implica guardar la nominación con los datos
  // actuales del formulario — tanto si aún no existía como si se venía
  // editando. guardarNominacion() vuelve a validar los campos obligatorios
  // y los marca en rojo si algo quedó incompleto, en cuyo caso no se envía.
  const guardada = guardarNominacion();
  if (!guardada) {
    cerrarModal('modalAceptacion');
    mostrarToast('Complete los campos obligatorios de la nominación antes de enviar la Aceptación');
    return;
  }

  const lista = srvCargarNominaciones();
  const idx = lista.findIndex(n => n.id === srvEditandoId);
  if (idx < 0) return;
  const nom = lista[idx];
  const cliente = nom.clientes[srvAceptacionClienteIndex];
  if (!cliente) return;

  cliente.aceptacionEnviada = true;
  cliente.fechaAceptacionEnviada = new Date().toISOString().slice(0, 10);
  cliente.aceptacionSnapshot = srvCapturarSnapshotAceptacion();

  const estadoAnterior = nom.estado;
  const entradas = [
    { tipo: 'aceptacion', campo: 'Aceptación del Servicio', valorAnterior: 'No enviada', valorNuevo: `Enviada a ${cliente.nombre}` }
  ];
  const todosAceptaronAhora = srvTodosClientesAceptaron(nom);
  if (todosAceptaronAhora && nom.estado === 'Pendiente') {
    nom.estado = 'Vigente';
    entradas.push({ tipo: 'estado', campo: 'Estado', valorAnterior: estadoAnterior, valorNuevo: 'Vigente' });
  }
  srvRegistrarHistorial(nom, entradas);
  srvGuardarNominaciones(lista);

  cerrarModal('modalAceptacion');
  mostrarToast(`Aceptación enviada a ${cliente.nombre}` + (nom.estado === 'Vigente' && estadoAnterior !== 'Vigente' ? ' — la nominación ahora está Vigente' : ''));

  // Se refleja el nuevo estado sin salir de la nominación — puede haber
  // otros clientes a los que todavía haya que enviarles su Aceptación.
  srvClientesFormulario = JSON.parse(JSON.stringify(nom.clientes));
  renderClientesFormulario();
  document.getElementById('tituloFormNomEstado').innerHTML = srvBadgeEstado(nom.estado);

  if (nom.estado === 'Vigente' && estadoAnterior !== 'Vigente') {
    setTimeout(irANominaciones, 900);
  }
}

// =================================================
// INICIALIZACIÓN
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('vistaListaNom')) return;

  const params = new URLSearchParams(window.location.search);
  const idEdicion = params.get('id');
  const mostrarForm = idEdicion || params.has('nuevo');

  document.getElementById('vistaListaNom').style.display = mostrarForm ? 'none' : '';
  document.getElementById('vistaFormNom').style.display = mostrarForm ? '' : 'none';

  if (!mostrarForm) {
    // Vista: listado de nominaciones
    poblarSelectClientesFiltro();
    renderTablaNominaciones();
    srvActualizarBotonFiltrosAvanzados();
    return;
  }

  // Vista: nueva/editar nominación
  srvCrearToggleIdiomaAceptacion();
  poblarSelect('nomBuque', SRV_BUQUES);
  poblarSelect('nomLocacion', SRV_LOCACIONES);
  poblarSelect('nomSupervisor', srvUsuariosPorRol('Supervisor').map(srvNombreCompletoUsuario));
  poblarSelect('nomTipoOperacion', SRV_TIPOS_OPERACION);
  poblarSelect('nomUnidadMedida', cargarUnidadesMedida().map(u => u.nombre));

  ['nomBuque', 'nomLocacion', 'nomSupervisor', 'nomTipoOperacion'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => { if (el.classList.contains('input-error')) limpiarErrorCampo(el); });
  });

  if (idEdicion) {
    srvCargarFormularioParaEdicion(idEdicion, params.get('modo') === 'ver');
  } else {
    document.getElementById('nomNumero').value = srvSiguienteCodigo();
    renderClientesFormulario();
    renderArchivosNom();
    renderProductosFormulario();
    renderInspectoresFormulario();
  }
});
