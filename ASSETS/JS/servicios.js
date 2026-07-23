// =================================================
// SERVICIOS.JS
// Lógica del módulo Servicios: listado de Nominaciones,
// formulario de Nueva/Editar Nominación y envío de la
// Aceptación del Servicio (prototipo sin backend).
// =================================================

const SRV_STORAGE_KEY = 'nominacionesData';

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
const SRV_CATEGORIAS_SERVICIO = ['Inspección de Carga', 'Muestreo y Análisis', 'Certificación de Calidad y Cantidad', 'Supervisión de Estiba', 'Control de Calidad Ambiental'];

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

const NOMINACIONES_DEMO = [
  {
    id: 'NOM001', per: 'PER001', fechaInicio: '2025-06-15', fechaFin: '2025-09-15',
    estado: 'Vigente', buque: 'MEGARA',
    locacion: 'Peru LNG Melchorita Terminal - Cañete', supervisor: 'Julio César Gómez',
    tipoOperacion: 'Loading',
    clientes: [{ nombre: 'Sandra Motors', ruc: '11109899982', principal: true, porcentaje: 100 }],
    servicioNombre: 'Inspección de carga LNG',
    servicioDetalle: 'Vessel: MEGARA · Operation: Loading · Product: LNG · Quantity: 137,200 m3',
    productos: ['LNG'], cantidad: '137200', unidadMedida: 'Metro Cúbico',
    aceptacionEnviada: true, fechaAceptacionEnviada: '2025-06-10'
  },
  {
    id: 'NOM002', per: 'PER002', fechaInicio: '2025-07-01', fechaFin: '2025-07-20',
    estado: 'Pendiente', buque: 'STENA IMPRESSION',
    locacion: 'Terminal Callao', supervisor: 'Sandra Echavarria',
    tipoOperacion: 'Discharging',
    clientes: [{ nombre: 'Naviera del Pacífico S.A.', ruc: '20456789123', principal: true, porcentaje: 100 }],
    servicioNombre: 'Inspección de descarga de crudo',
    servicioDetalle: 'Descarga de crudo en Terminal Callao',
    productos: ['Crudo'], cantidad: '85000', unidadMedida: 'Barril',
    aceptacionEnviada: false
  },
  {
    id: 'NOM003', per: 'PER003', fechaInicio: '2025-08-05', fechaFin: '2025-08-25',
    estado: 'Vigente', buque: 'PACIFIC STAR',
    locacion: 'Terminal Pisco', supervisor: 'Bandy Jimenez',
    tipoOperacion: 'STS Transfer',
    clientes: [
      { nombre: 'Perú LNG S.R.L.', ruc: '20509876541', principal: true, porcentaje: 50, contacto: 'Pamela Pedraza' },
      { nombre: 'Shell Trading Perú', ruc: '20601234567', principal: false, porcentaje: 50 }
    ],
    servicioNombre: 'Transferencia ship-to-ship de GLP',
    servicioDetalle: 'STS Transfer entre buques en Terminal Pisco',
    productos: ['GLP'], cantidad: '42000', unidadMedida: 'Tonelada Métrica',
    aceptacionEnviada: true, fechaAceptacionEnviada: '2025-07-30'
  },
  {
    id: 'NOM004', per: 'PER004', fechaInicio: '2025-04-10', fechaFin: '2025-04-28',
    estado: 'Finalizado', buque: 'CALLAO TRADER',
    locacion: 'Terminal Talara', supervisor: 'Carla Ventura',
    tipoOperacion: 'Bunkering',
    clientes: [{ nombre: 'Shell Trading Perú', ruc: '20601234567', principal: true, porcentaje: 100 }],
    servicioNombre: 'Suministro de combustible (bunkering)',
    servicioDetalle: 'Operación de bunkering en Terminal Talara',
    productos: ['Diesel B5'], cantidad: '15000', unidadMedida: 'Metro Cúbico',
    aceptacionEnviada: true, fechaAceptacionEnviada: '2025-04-08'
  },
  {
    id: 'NOM005', per: 'PER005', fechaInicio: '2025-09-12', fechaFin: '2025-09-30',
    estado: 'Vigente', buque: 'MEGARA',
    locacion: 'Terminal Callao', supervisor: 'Julio César Gómez',
    tipoOperacion: 'Loading',
    clientes: [{ nombre: 'Perú LNG S.R.L.', ruc: '20509876541', principal: true, porcentaje: 100 }],
    servicioNombre: 'Inspección de carga de GLP',
    servicioDetalle: 'Carga de GLP en Terminal Callao',
    productos: ['GLP'], cantidad: '98000', unidadMedida: 'Barril',
    aceptacionEnviada: true, fechaAceptacionEnviada: '2025-09-08'
  },
  {
    id: 'NOM006', per: 'PER006', fechaInicio: '2025-10-02', fechaFin: '2025-10-18',
    estado: 'Pendiente', buque: 'CALLAO TRADER',
    locacion: 'Terminal Talara', supervisor: 'Josue Ramos',
    tipoOperacion: 'Discharging',
    clientes: [{ nombre: 'Naviera del Pacífico S.A.', ruc: '20456789123', principal: true, porcentaje: 100 }],
    servicioNombre: 'Inspección de descarga de diesel',
    servicioDetalle: 'Descarga de Diesel B5 en Terminal Talara',
    productos: ['Diesel B5'], cantidad: '30000', unidadMedida: 'Metro Cúbico',
    aceptacionEnviada: false
  },
  {
    id: 'NOM007', per: 'PER007', fechaInicio: '2025-05-20', fechaFin: '2025-06-05',
    estado: 'Anulado', buque: 'STENA IMPRESSION',
    locacion: 'Peru LNG Melchorita Terminal - Cañete', supervisor: 'Sandra Echavarria',
    tipoOperacion: 'STS Transfer',
    clientes: [{ nombre: 'Sandra Motors', ruc: '11109899982', principal: true, porcentaje: 100 }],
    servicioNombre: 'Transferencia ship-to-ship de crudo',
    servicioDetalle: 'Operación anulada por el cliente',
    productos: ['Crudo'], cantidad: '50000', unidadMedida: 'Barril',
    aceptacionEnviada: false
  },
  {
    id: 'NOM008', per: 'PER008', fechaInicio: '2025-11-01', fechaFin: '2025-11-15',
    estado: 'Vigente', buque: 'PACIFIC STAR',
    locacion: 'Terminal Pisco', supervisor: 'Bandy Jimenez',
    tipoOperacion: 'Bunkering',
    clientes: [{ nombre: 'Shell Trading Perú', ruc: '20601234567', principal: true, porcentaje: 100 }],
    servicioNombre: 'Suministro de combustible (bunkering)',
    servicioDetalle: 'Operación de bunkering en Terminal Pisco',
    productos: ['Diesel B5'], cantidad: '18000', unidadMedida: 'Metro Cúbico',
    aceptacionEnviada: true, fechaAceptacionEnviada: '2025-10-29'
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
  if (faltantes.length) {
    lista.push(...JSON.parse(JSON.stringify(faltantes)));
    localStorage.setItem(SRV_STORAGE_KEY, JSON.stringify(lista));
  }
  return lista;
}

function srvGuardarNominaciones(lista) {
  localStorage.setItem(SRV_STORAGE_KEY, JSON.stringify(lista));
}

function soloEnteroMax(input, max) {
  input.value = input.value.replace(/[^0-9]/g, '').slice(0, max);
}

function irANuevaNominacion() {
  window.location.href = 'nueva-nominacion.html';
}

function irANominaciones() {
  window.location.href = 'nominaciones.html';
}

// =================================================
// LISTADO — nominaciones.html
// =================================================
let srvFilasPorPagina = 10;
let srvPaginaActual = 1;

function srvBadgeEstado(estado) {
  const mapa = {
    Vigente:    '<span class="badge badge-vigente"><span class="badge-dot"></span>Vigente</span>',
    Pendiente:  '<span class="badge badge-pendiente"><span class="badge-dot"></span>Pendiente</span>',
    Finalizado: '<span class="badge badge-finalizado"><span class="badge-dot"></span>Finalizado</span>',
    Anulado:    '<span class="badge badge-anulado"><span class="badge-dot"></span>Anulado</span>'
  };
  return mapa[estado] || estado;
}

function srvBadgeAceptacion(nom) {
  return nom.aceptacionEnviada
    ? '<span class="badge badge-vigente"><span class="badge-dot"></span>Enviada</span>'
    : '<span class="badge badge-pendiente"><span class="badge-dot"></span>Pendiente</span>';
}

function srvFormatoFecha(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

function srvClientePrincipal(nom) {
  if (!nom.clientes || !nom.clientes.length) return { nombre: '—', contacto: '—' };
  const principal = nom.clientes.find(c => c.principal) || nom.clientes[0];
  const contacto = srvContactoDeCliente(principal);
  return { nombre: principal.nombre, contacto: contacto ? contacto.nombre : (principal.contacto || '—') };
}

function poblarSelectClientesFiltro() {
  const sel = document.getElementById('filterClienteNom');
  if (!sel) return;
  SRV_CLIENTES_DEMO.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.razon;
    opt.textContent = c.razon;
    sel.appendChild(opt);
  });
}

function srvObtenerFiltradas() {
  const lista = srvCargarNominaciones();
  const texto = (document.getElementById('searchNominacion')?.value || '').toLowerCase().trim();
  const cliente = document.getElementById('filterClienteNom')?.value || '';
  const desde = document.getElementById('filterInicioNom')?.value || '';
  const hasta = document.getElementById('filterFinNom')?.value || '';

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
    // Fecha inicio/fin funcionan como un rango: se muestran las nominaciones
    // cuyo período [fechaInicio, fechaFin] se cruza con el rango buscado,
    // no solo las que empiezan/terminan exactamente dentro de él.
    if (desde && n.fechaFin < desde) return false;
    if (hasta && n.fechaInicio > hasta) return false;
    return true;
  });
}

function renderTablaNominaciones() {
  const tbody = document.getElementById('tbodyNominaciones');
  if (!tbody) return;

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
        <td>${p.nombre}</td>
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
          <button class="btn-accion btn-eliminar" title="${n.estado === 'Anulado' ? 'Ya está anulada' : 'Anular nominación'}" onclick="anularNominacion('${n.id}')" ${n.estado === 'Anulado' ? 'disabled' : ''}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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
}

function limpiarFiltrosNom() {
  const search = document.getElementById('searchNominacion');
  const cliente = document.getElementById('filterClienteNom');
  const desde = document.getElementById('filterInicioNom');
  const hasta = document.getElementById('filterFinNom');
  if (search) search.value = '';
  if (cliente) cliente.value = '';
  if (desde) desde.value = '';
  if (hasta) hasta.value = '';
  aplicarFiltrosNom();
}

function editarNominacion(id) {
  window.location.href = `nueva-nominacion.html?id=${encodeURIComponent(id)}`;
}

// Visualizar reutiliza el mismo formulario de Editar Nominación, pero en
// modo solo lectura (?modo=ver): mismos campos, deshabilitados, sin
// buscadores ni botones de agregar/quitar — ver srvAplicarModoSoloLectura.
function verNominacion(id) {
  window.location.href = `nueva-nominacion.html?id=${encodeURIComponent(id)}&modo=ver`;
}

// Nominaciones de ejemplo (seed) traen aceptacionEnviada:true pero nunca
// pasaron por enviarAceptacion(), así que no tienen aceptacionSnapshot real.
// En ese caso se arma una vista razonable a partir de los datos ya
// guardados en la nominación, en vez de decir que no se envió nada.
function srvConstruirSnapshotFallback(nom) {
  const principal = (nom.clientes || []).find(c => c.principal) || (nom.clientes || [])[0];
  const principalContacto = principal ? srvContactoDeCliente(principal) : null;
  const productoTexto = (nom.productos || []).join(' / ');
  const cantidadTexto = nom.cantidad
    ? `${Number(nom.cantidad).toLocaleString('en-US')}${nom.unidadMedida ? ' ' + nom.unidadMedida : ''}`
    : '';
  const costSharing = (nom.clientes || []).length
    ? nom.clientes.map(c => `${c.porcentaje != null ? c.porcentaje + '% ' : ''}${c.nombre}`).join(' / ')
    : '';
  const destinatariosTo = principalContacto
    ? [`${principalContacto.nombre}${principalContacto.correo ? ' (' + principalContacto.correo + ')' : ''}`]
    : [];

  return {
    asunto: [nom.per, 'Confirmation of Attendance', nom.buque, nom.tipoOperacion, productoTexto, nom.locacion].filter(Boolean).join(' // '),
    nombreCliente: principal ? principal.nombre : '',
    atencion: principalContacto ? principalContacto.nombre : '',
    firmante: nom.supervisor || '',
    refCliente: '',
    refIntertek: nom.per || '',
    vessel: nom.buque || '',
    operation: nom.tipoOperacion || '',
    dateRange: srvFormatoFecha(nom.fechaAceptacionEnviada),
    location: nom.locacion || '',
    product: productoTexto,
    quantity: cantidadTexto,
    costSharing,
    attendingInspector: nom.supervisor || '',
    contactosOficina: [],
    destinatariosTo,
    emergenciaNombre: principalContacto ? principalContacto.nombre : '',
    emergenciaCorreo: principalContacto ? (principalContacto.correo || '') : '',
    emergenciaTelefono: principalContacto ? (principalContacto.telefono || '') : '',
    determinacionCantidad: '',
    determinacionCalidad: '',
    comentariosAdicionales: '',
    imagenCantidad: null,
    imagenCalidad: null,
    imagenComentarios: null,
    archivos: (nom.archivos || []).map(a => typeof a === 'string' ? { nombre: a, tipo: '', dataUrl: null } : a)
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

function srvHtmlSnapshotAceptacion(nom) {
  const dict = srvDiccionarioAceptacion();
  const vacio = dict['txt-sin-datos'];

  if (!nom.aceptacionEnviada) {
    return `<div class="acept-editor-body"><div class="ed-row"><span>${dict['txt-aun-no-enviada']}</span></div></div>`;
  }
  const s = nom.aceptacionSnapshot || srvConstruirSnapshotFallback(nom);
  const lista = (arr) => (arr && arr.length) ? arr.join(', ') : vacio;
  const archivos = s.archivos || [];

  return `
    <div class="acept-form-body">
    <div>
    <div class="permisos-divider" style="margin:0 0 10px"><span>${dict['div-correo']}</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-asunto']}</span><span>${s.asunto || vacio}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-para']}</span><span>${s.nombreCliente || vacio}${s.atencion ? dict['txt-atencion-de'] + s.atencion : ''}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-destinatarios']}</span><span>${lista(s.destinatariosTo)}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-firmante']}</span><span>${s.firmante || vacio}</span></div>
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
      <div class="ed-row"><span class="ed-label">${dict['lbl-attending-inspector']}</span><span>${s.attendingInspector || vacio}</span></div>
    </div>
    </div>

    <div>
    <div class="permisos-divider" style="margin:0 0 10px"><span>${dict['div-contactos']}</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-attending-contacts']}</span><span>${lista(s.contactosOficina)}</span></div>
      <div class="ed-row"><span class="ed-label">${dict['lbl-view-contacto-emergencia']}</span><span>${s.emergenciaNombre || vacio}${s.emergenciaCorreo ? ' — ' + s.emergenciaCorreo : ''}${s.emergenciaTelefono ? ' — ' + s.emergenciaTelefono : ''}</span></div>
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
    </div>
  `;
}

function anularNominacion(id) {
  confirmarAccion('¿Está seguro de anular esta nominación? Quedará marcada como Anulada.', () => {
    const lista = srvCargarNominaciones();
    const idx = lista.findIndex(n => n.id === id);
    if (idx >= 0) {
      lista[idx].estado = 'Anulado';
      srvGuardarNominaciones(lista);
      renderTablaNominaciones();
      mostrarToast('Nominación anulada correctamente');
    }
  });
}

// =================================================
// FORMULARIO — nueva-nominacion.html
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

function srvSiguienteCodigo() {
  const lista = srvCargarNominaciones();
  const max = lista.reduce((acc, n) => {
    const num = parseInt(n.id.replace(/\D/g, ''), 10) || 0;
    return Math.max(acc, num);
  }, 0);
  return `NOM${String(max + 1).padStart(3, '0')}`;
}

function renderClientesFormulario() {
  const tbody = document.getElementById('tbodyClientesNom');
  if (!tbody) return;

  if (!srvClientesFormulario.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="clientes-nom-empty">Aún no se han agregado clientes</td></tr>`;
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
        ${srvModoSoloLectura ? '' : `<button class="btn-accion btn-eliminar" title="Quitar" onclick="quitarClienteNom(${i})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>`}
      </td>
    </tr>
  `;
  }).join('');
}

function cambiarPorcentajeNom(indice, valor) {
  const num = Math.min(100, Math.max(0, Number(valor) || 0));
  srvClientesFormulario[indice].porcentaje = valor === '' ? null : num;
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
    contacto: contactoPrincipal ? contactoPrincipal.nombre : ''
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
    const contenedor = sugerencias.closest('.nom-cliente-buscador, .nom-producto-row');
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

  srvEditandoId = id;
  srvModoSoloLectura = !!soloLectura;
  document.getElementById('tituloFormNom').textContent = srvModoSoloLectura ? 'Visualizar Nominación' : 'Editar Nominación';
  document.getElementById('breadcrumbFormNom').textContent = srvModoSoloLectura ? 'Visualizar Nominación' : 'Editar Nominación';
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

  srvActualizarBotonAceptacion(nom);

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
  document.querySelector('.nom-producto-row')?.style.setProperty('display', 'none');
  document.getElementById('btnAdjuntarArchivoNom')?.style.setProperty('display', 'none');
  document.getElementById('btnGuardarNom')?.style.setProperty('display', 'none');
  const cerrarTexto = document.getElementById('btnCancelarNomTexto');
  if (cerrarTexto) cerrarTexto.textContent = 'Cerrar';

  // El botón de Aceptación solo se muestra en modo lectura si ya fue
  // enviada (para verla) — enviarla es una acción de edición, no de vista.
  if (!nom.aceptacionEnviada) {
    document.getElementById('btnAceptacion')?.style.setProperty('display', 'none');
  }
}

// Una vez enviada la Aceptación, el botón deja de ofrecer "Aceptación"
// (enviar) y pasa a "Ver Aceptación" (solo lectura) — abrirModalAceptacion()
// ya decide internamente qué modal mostrar según aceptacionEnviada.
function srvActualizarBotonAceptacion(nom) {
  const icono = document.getElementById('btnAceptacionIcono');
  const texto = document.getElementById('btnAceptacionTexto');
  if (!icono || !texto) return;

  if (nom.aceptacionEnviada) {
    icono.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    texto.textContent = 'Ver Aceptación';
  } else {
    icono.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
    texto.textContent = 'Aceptación';
  }
}

function guardarNominacion() {
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

  const lista = srvCargarNominaciones();
  const nuevaId = srvEditandoId || srvSiguienteCodigo();
  const datos = {
    id: nuevaId,
    per: perInput.value.trim(),
    fechaInicio: inicioInput.value,
    fechaFin: finInput.value,
    estado: 'Pendiente',
    buque: buqueInput.value,
    locacion: locacionInput.value,
    supervisor: supervisorInput.value,
    tipoOperacion: tipoOperacionInput.value,
    clientes: srvClientesFormulario,
    servicioNombre: document.getElementById('nomServicioNombre').value,
    servicioCategoria: document.getElementById('nomServicioCategoria').value,
    servicioDetalle: document.getElementById('nomServicioDetalle').value,
    productos: [...srvProductosFormulario],
    cantidad: document.getElementById('nomCantidad').value,
    unidadMedida: document.getElementById('nomUnidadMedida').value,
    archivos: srvArchivosFormulario.map(a => ({ nombre: a.nombre, tipo: a.tipo || '', dataUrl: a.dataUrl || null })),
    // Toda modificación a una nominación invalida la Aceptación ya enviada:
    // los datos que el cliente recibió pueden haber cambiado, así que se
    // vuelve a marcar como pendiente y se habilita el reenvío.
    aceptacionEnviada: false
  };

  const eraEdicion = !!srvEditandoId;
  let aceptacionPreviaEnviada = false;
  if (srvEditandoId) {
    const idx = lista.findIndex(n => n.id === srvEditandoId);
    const estadoPrevio = idx >= 0 ? lista[idx].estado : 'Pendiente';
    aceptacionPreviaEnviada = idx >= 0 && !!lista[idx].aceptacionEnviada;
    datos.estado = estadoPrevio;
    if (idx >= 0) lista[idx] = datos; else lista.push(datos);
  } else {
    lista.push(datos);
  }

  srvGuardarNominaciones(lista);
  srvEditandoId = nuevaId;
  document.getElementById('tituloFormNom').textContent = 'Editar Nominación';
  document.getElementById('breadcrumbFormNom').textContent = 'Editar Nominación';
  srvActualizarBotonAceptacion(datos);
  mostrarModalGuardado(
    eraEdicion ? 'editar' : 'crear',
    aceptacionPreviaEnviada ? 'La Aceptación deberá enviarse nuevamente.' : null
  );
  return true;
}

// =================================================
// MODAL — ENVIAR ACEPTACIÓN DEL SERVICIO
// =================================================

// Idioma del contenido del modal de Aceptación (ES/EN) — el botón se crea
// dinámicamente en el header del modal, junto al título; no vive en el HTML.
let srvAceptIdioma = localStorage.getItem('srvAceptIdioma') === 'en' ? 'en' : 'es';

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
    'lbl-firmante': 'Firmante (Intertek)',
    'opt-seleccionar': 'Seleccionar',
    'lbl-ref-cliente': 'Número de referencia al Cliente',
    'ph-ref-cliente': 'Referencia al cliente',
    'lbl-ref-intertek': 'Número de referencia de Intertek',
    'ph-ref-intertek': 'Referencia Intertek',
    'div-detalles-operacion': 'Detalles de la operación',
    'lbl-vessel': 'Buque :',
    'ph-vessel': 'Nombre del buque',
    'lbl-operation': 'Operación :',
    'ph-operation': 'Tipo de operación',
    'lbl-date-range': 'Rango de fechas :',
    'ph-date-range': 'dd/mm/aaaa',
    'lbl-location': 'Locación/Terminal :',
    'ph-location': 'Locación / terminal',
    'lbl-product': 'Producto :',
    'ph-product': 'Producto(s)',
    'lbl-quantity': 'Cantidad :',
    'ph-quantity': 'Cantidad y unidad',
    'lbl-cost-sharing': 'Costo compartido :',
    'ph-cost-sharing': '% por cliente',
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
    'terminos-p1': 'Todo el trabajo realizado está sujeto a los términos y condiciones generales de Intertek, cuya copia se adjunta a esta confirmación de asistencia. Tenga en cuenta que la aceptación de nuestra cotización y la programación del trabajo confirmarán su conformidad para operar según los T&Cs de Intertek.',
    'terminos-p2-html': '"Los términos y condiciones de Intertek (de servicios y de compra de bienes y servicios) contienen disposiciones específicas sobre confidencialidad, propiedad intelectual y protección de datos, disponibles en la intranet. <a href="https://www.intertek.com/terms/" target="_blank" rel="noopener">https://www.intertek.com/terms/</a>"',
    'btn-cancelar': 'Cancelar',
    'btn-cerrar': 'Cerrar',
    'btn-enviar': 'Enviar',
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
    'lbl-firmante': 'Signatory (Intertek)',
    'opt-seleccionar': 'Select',
    'lbl-ref-cliente': 'Client reference number',
    'ph-ref-cliente': 'Client reference',
    'lbl-ref-intertek': 'Intertek reference number',
    'ph-ref-intertek': 'Intertek reference',
    'div-detalles-operacion': 'Operation details',
    'lbl-vessel': 'Vessel :',
    'ph-vessel': 'Vessel name',
    'lbl-operation': 'Operation :',
    'ph-operation': 'Operation type',
    'lbl-date-range': 'Date Range :',
    'ph-date-range': 'dd/mm/yyyy',
    'lbl-location': 'Location/Terminal :',
    'ph-location': 'Location / terminal',
    'lbl-product': 'Product :',
    'ph-product': 'Product(s)',
    'lbl-quantity': 'Quantity :',
    'ph-quantity': 'Quantity and unit',
    'lbl-cost-sharing': 'Cost Sharing :',
    'ph-cost-sharing': '% by client',
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
    'terminos-p1': "All work carried out is subject to Intertek's general terms and conditions, a copy of which is attached to this confirmation of attendance. Please note that acceptance of our quotation and an appointment to carry out the work will confirm your agreement to trade as per Intertek's T&Cs.",
    'terminos-p2-html': '"Intertek terms and conditions (of services and of purchase of goods and services) contain specific provisions for dealing with confidentiality, intellectual property and data protection are available on the intranet. <a href="https://www.intertek.com/terms/" target="_blank" rel="noopener">https://www.intertek.com/terms/</a>"',
    'btn-cancelar': 'Cancel',
    'btn-cerrar': 'Close',
    'btn-enviar': 'Send',
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
  const p2 = document.getElementById('aceptTerminosP2');
  if (p2 && dict['terminos-p2-html'] != null) p2.innerHTML = dict['terminos-p2-html'];

  const enLectura = document.getElementById('aceptSoloLecturaBody')?.style.display !== 'none';
  document.getElementById('aceptModalTituloTexto').textContent = enLectura ? dict['titulo-vista'] : dict['titulo-crear'];
  document.getElementById('aceptBtnCerrarTexto').textContent = enLectura ? dict['btn-cerrar'] : dict['btn-cancelar'];

  if (enLectura && srvEditandoId) {
    const nomActual = srvCargarNominaciones().find(n => n.id === srvEditandoId);
    if (nomActual) document.getElementById('aceptSoloLecturaBody').innerHTML = srvHtmlSnapshotAceptacion(nomActual);
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

function abrirModalAceptacion() {
  if (srvEditandoId) {
    const nomActual = srvCargarNominaciones().find(n => n.id === srvEditandoId);
    if (nomActual && nomActual.aceptacionEnviada) {
      srvAbrirModalAceptacionSoloLectura(nomActual);
      return;
    }
  }

  document.getElementById('aceptSoloLecturaAviso').style.display = 'none';
  document.getElementById('aceptSoloLecturaBody').style.display = 'none';
  document.getElementById('aceptFormularioBody').style.display = '';
  document.getElementById('aceptBtnEnviar').style.display = '';

  const buque = document.getElementById('nomBuque')?.value || '';
  const operacion = document.getElementById('nomTipoOperacion')?.value || '';
  const locacion = document.getElementById('nomLocacion')?.value || '';
  const producto = srvProductosFormulario.join(' / ');
  const cantidad = document.getElementById('nomCantidad')?.value || '';
  const unidadMedida = document.getElementById('nomUnidadMedida')?.value || '';
  const supervisorNombre = document.getElementById('nomSupervisor')?.value || '';

  const principal = srvClientesFormulario.find(c => c.principal) || srvClientesFormulario[0];
  const principalContacto = principal ? srvContactoDeCliente(principal) : null;

  // Date Range = fecha en la que se está enviando la Aceptación (hoy), no las
  // fechas de inicio/fin de la nominación.
  const rango = srvFormatoFecha(new Date().toISOString().slice(0, 10));
  const cantidadTexto = cantidad ? `${Number(cantidad).toLocaleString('en-US')}${unidadMedida ? ' ' + unidadMedida : ''}` : '';
  const costSharing = srvClientesFormulario.length
    ? srvClientesFormulario.map(c => `${c.porcentaje != null ? c.porcentaje + '% ' : ''}${c.nombre}`).join(' / ')
    : '';

  document.getElementById('aceptNombre').value = principal ? principal.nombre : '';
  document.getElementById('aceptAtencion').value = principalContacto ? principalContacto.nombre : '';

  // Destinatarios (To) — checklist con todos los contactos de todos los
  // clientes agregados a la nominación (no solo el del cliente encargado).
  // Se marca por defecto el contacto que cada cliente tiene seleccionado.
  const destinatariosCont = document.getElementById('aceptDestinatariosTo');
  const filasDestinatarios = srvClientesFormulario.flatMap(cli => {
    const demo = SRV_CLIENTES_DEMO.find(d => d.ruc === cli.ruc);
    return (demo?.contactos || []).map(ct => `
      <label class="acept-oficina-item">
        <input type="checkbox" value="${cli.ruc}|${ct.nombre}" ${ct.nombre === cli.contacto ? 'checked' : ''}>
        <span class="oficina-info">
          <span class="oficina-nombre">${ct.nombre} <span style="font-weight:400;color:var(--gray-400)">— ${cli.nombre}</span></span>
          <span class="oficina-datos">${ct.correo || '—'}</span>
        </span>
      </label>
    `);
  });
  destinatariosCont.innerHTML = filasDestinatarios.length
    ? filasDestinatarios.join('')
    : '<span class="nom-cliente-sugerencia-vacio" data-i18n="txt-agregar-clientes-contactos">Agregue clientes a la nominación para ver sus contactos</span>';

  const firmanteSel = document.getElementById('aceptFirmante');
  firmanteSel.innerHTML = '<option value="" data-i18n="opt-seleccionar">Seleccionar</option>' +
    srvUsuariosActivos().map(u => `<option value="${u.usuario}">${srvNombreCompletoUsuario(u)}</option>`).join('');
  const sesion = typeof obtenerUsuarioActual === 'function' ? obtenerUsuarioActual() : null;
  if (sesion) firmanteSel.value = sesion.usuario;

  // Correos electrónicos a enviar (en copia) — checklist de usuarios marcados
  // como "Incluir en copia" en el mantenedor de Usuarios.
  const copiaCont = document.getElementById('aceptCorreosCopia');
  const candidatosCopia = srvUsuariosIncluirCopia();
  copiaCont.innerHTML = candidatosCopia.length
    ? candidatosCopia.map(u => `
    <label class="acept-oficina-item">
      <input type="checkbox" value="${u.usuario}" checked>
      <span class="oficina-info">
        <span class="oficina-nombre">${srvNombreCompletoUsuario(u)}</span>
        <span class="oficina-datos">${u.email}</span>
      </span>
    </label>
    `).join('')
    : '<span class="nom-cliente-sugerencia-vacio" data-i18n="txt-sin-usuarios-copia">Sin usuarios marcados como "Incluir en copia" en el mantenedor de Usuarios</span>';

  document.getElementById('aceptVessel').value = buque;
  document.getElementById('aceptOperation').value = operacion;
  document.getElementById('aceptDateRange').value = rango;
  document.getElementById('aceptLocation').value = locacion;
  document.getElementById('aceptProduct').value = producto;
  document.getElementById('aceptQuantity').value = cantidadTexto;
  document.getElementById('aceptCostSharing').value = costSharing;
  document.getElementById('aceptAttendingInspector').value = supervisorNombre;
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

  // Contacto de emergencia del cliente — precargado desde el contacto del
  // cliente encargado, pero editable por si falta algún dato
  document.getElementById('aceptEmergenciaNombre').value = principalContacto ? principalContacto.nombre : '';
  document.getElementById('aceptEmergenciaCorreo').value = principalContacto ? (principalContacto.correo || '') : '';
  document.getElementById('aceptEmergenciaTelefono').value = principalContacto ? (principalContacto.telefono || '') : '';

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

// Una vez enviada la Aceptación, la nominación queda fijada: el botón
// "Aceptación" ya no reabre el formulario editable, solo muestra en modo
// lectura lo que efectivamente se envió al cliente (aceptacionSnapshot).
function srvAbrirModalAceptacionSoloLectura(nom) {
  document.getElementById('aceptSoloLecturaAviso').style.display = '';
  document.getElementById('aceptFormularioBody').style.display = 'none';
  document.getElementById('aceptBtnEnviar').style.display = 'none';

  const cont = document.getElementById('aceptSoloLecturaBody');
  cont.innerHTML = srvHtmlSnapshotAceptacion(nom);
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
  const firmanteSel = document.getElementById('aceptFirmante');
  return {
    asunto: val('aceptAsunto'),
    nombreCliente: val('aceptNombre'),
    atencion: val('aceptAtencion'),
    firmante: firmanteSel?.selectedOptions[0]?.textContent || '',
    refCliente: val('aceptRefCliente'),
    refIntertek: val('aceptRefIntertek'),
    vessel: val('aceptVessel'),
    operation: val('aceptOperation'),
    dateRange: val('aceptDateRange'),
    location: val('aceptLocation'),
    product: val('aceptProduct'),
    quantity: val('aceptQuantity'),
    costSharing: val('aceptCostSharing'),
    attendingInspector: val('aceptAttendingInspector'),
    contactosOficina: srvContactosMarcados('aceptContactosOficina'),
    destinatariosTo: srvContactosMarcados('aceptDestinatariosTo'),
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
    archivos: srvArchivosFormulario.map(a => ({ nombre: a.nombre, tipo: a.tipo || '', dataUrl: a.dataUrl || null }))
  };
}

function enviarAceptacion() {
  // Enviar la Aceptación implica que la nominación queda guardada: si aún
  // no se había guardado, se guarda automáticamente en este paso.
  if (!srvEditandoId) {
    const guardada = guardarNominacion();
    if (!guardada) return;
  }

  const lista = srvCargarNominaciones();
  const idx = lista.findIndex(n => n.id === srvEditandoId);
  if (idx >= 0) {
    lista[idx].estado = 'Vigente';
    lista[idx].aceptacionEnviada = true;
    lista[idx].fechaAceptacionEnviada = new Date().toISOString().slice(0, 10);
    lista[idx].aceptacionSnapshot = srvCapturarSnapshotAceptacion();
    srvGuardarNominaciones(lista);
  }

  cerrarModal('modalAceptacion');
  mostrarToast('Aceptación enviada — la nominación ahora está Vigente');
  setTimeout(irANominaciones, 600);
}

// =================================================
// INICIALIZACIÓN
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  // Página: listado de nominaciones
  if (document.getElementById('tbodyNominaciones')) {
    poblarSelectClientesFiltro();
    renderTablaNominaciones();
  }

  // Página: nueva/editar nominación
  if (document.getElementById('tbodyClientesNom')) {
    srvCrearToggleIdiomaAceptacion();
    poblarSelect('nomBuque', SRV_BUQUES);
    poblarSelect('nomLocacion', SRV_LOCACIONES);
    poblarSelect('nomSupervisor', srvUsuariosActivos().map(srvNombreCompletoUsuario));
    poblarSelect('nomTipoOperacion', SRV_TIPOS_OPERACION);
    poblarSelect('nomServicioCategoria', SRV_CATEGORIAS_SERVICIO);
    poblarSelect('nomUnidadMedida', cargarUnidadesMedida().map(u => u.nombre));

    ['nomBuque', 'nomLocacion', 'nomSupervisor', 'nomTipoOperacion'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', () => { if (el.classList.contains('input-error')) limpiarErrorCampo(el); });
    });

    const params = new URLSearchParams(window.location.search);
    const idEdicion = params.get('id');
    if (idEdicion) {
      srvCargarFormularioParaEdicion(idEdicion, params.get('modo') === 'ver');
    } else {
      document.getElementById('nomNumero').value = srvSiguienteCodigo();
      renderClientesFormulario();
      renderArchivosNom();
      renderProductosFormulario();
    }
  }
});
