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

function verNominacion(id) {
  const nom = srvCargarNominaciones().find(n => n.id === id);
  if (!nom) return;

  const p = srvClientePrincipal(nom);
  document.getElementById('verNomTitulo').innerHTML = `${nom.id} <span style="font-weight:400;color:var(--gray-400)">— ${p.nombre}</span>`;

  const productosTexto = (nom.productos || []).join(' / ') || '—';
  const cantidadTexto = nom.cantidad ? `${nom.cantidad}${nom.unidadMedida ? ' ' + nom.unidadMedida : ''}` : '—';
  const aceptacionTexto = nom.aceptacionEnviada
    ? `Enviada${nom.fechaAceptacionEnviada ? ' el ' + srvFormatoFecha(nom.fechaAceptacionEnviada) : ''}`
    : 'Pendiente';

  const clientesFilas = (nom.clientes || []).map(c => `
    <div class="ed-row">
      <span class="ed-label">${c.nombre}${c.principal ? ' <span class="tag-encargado-ver">Encargado</span>' : ''} :</span>
      <span>${c.porcentaje != null ? c.porcentaje + '%' : '—'}${c.contacto ? ' · Contacto: ' + c.contacto : ''}</span>
    </div>
  `).join('') || '<div class="ed-row"><span>Sin clientes agregados</span></div>';

  document.getElementById('verNomDetalle').innerHTML = `
    <div class="permisos-divider" style="margin:0 0 8px"><span>Información general</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">N° PER :</span><span>${nom.per || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Estado :</span><span>${srvBadgeEstado(nom.estado)}</span></div>
      <div class="ed-row"><span class="ed-label">Aceptación :</span><span>${srvBadgeAceptacion(nom)} ${nom.aceptacionEnviada && nom.fechaAceptacionEnviada ? '· ' + srvFormatoFecha(nom.fechaAceptacionEnviada) : ''}</span></div>
      <div class="ed-row"><span class="ed-label">Fecha Inicio :</span><span>${srvFormatoFecha(nom.fechaInicio)}</span></div>
      <div class="ed-row"><span class="ed-label">Fecha Fin :</span><span>${srvFormatoFecha(nom.fechaFin)}</span></div>
    </div>

    <div class="permisos-divider" style="margin:14px 0 8px"><span>Cliente(s)</span></div>
    <div class="acept-editor-body">${clientesFilas}</div>

    <div class="permisos-divider" style="margin:14px 0 8px"><span>Detalles de la operación</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">Buque :</span><span>${nom.buque || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Locación :</span><span>${nom.locacion || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Supervisor :</span><span>${nom.supervisor || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Tipo de Operación :</span><span>${nom.tipoOperacion || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Producto(s) :</span><span>${productosTexto}</span></div>
      <div class="ed-row"><span class="ed-label">Cantidad :</span><span>${cantidadTexto}</span></div>
    </div>

    <div class="permisos-divider" style="margin:14px 0 8px"><span>Servicio</span></div>
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">Nombre :</span><span>${nom.servicioNombre || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Categoría :</span><span>${nom.servicioCategoria || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Detalle :</span><span>${nom.servicioDetalle || '—'}</span></div>
    </div>

    <div class="permisos-divider" style="margin:14px 0 8px"><span>Archivos adjuntos</span></div>
    <div class="nom-archivos-lista">
      ${(nom.archivos || []).length
        ? nom.archivos.map(nombre => `<div class="cv-upload-row nom-archivo-item"><span class="cv-nombre">${nombre}</span></div>`).join('')
        : '<div class="cv-nombre">Sin archivos adjuntos</div>'}
    </div>

    <div class="permisos-divider" style="margin:14px 0 8px"><span>Aceptación enviada al cliente</span></div>
    ${srvHtmlSnapshotAceptacion(nom)}
  `;

  abrirModal('modalVerNominacion');
}

function srvHtmlSnapshotAceptacion(nom) {
  if (!nom.aceptacionEnviada || !nom.aceptacionSnapshot) {
    return '<div class="acept-editor-body"><div class="ed-row"><span>Aún no se ha enviado la Aceptación para esta nominación.</span></div></div>';
  }
  const s = nom.aceptacionSnapshot;
  const lista = (arr) => (arr && arr.length) ? arr.join(', ') : '—';
  return `
    <div class="acept-editor-body">
      <div class="ed-row"><span class="ed-label">Asunto :</span><span>${s.asunto || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Nombre (Cliente) :</span><span>${s.nombreCliente || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">A la atención de :</span><span>${s.atencion || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Firmante :</span><span>${s.firmante || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Ref. Cliente :</span><span>${s.refCliente || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Ref. Intertek :</span><span>${s.refIntertek || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Vessel :</span><span>${s.vessel || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Operation :</span><span>${s.operation || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Date Range :</span><span>${s.dateRange || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Location/Terminal :</span><span>${s.location || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Product :</span><span>${s.product || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Quantity :</span><span>${s.quantity || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Cost Sharing :</span><span>${s.costSharing || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Attending Inspector :</span><span>${s.attendingInspector || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Attending office contacts :</span><span>${lista(s.contactosOficina)}</span></div>
      <div class="ed-row"><span class="ed-label">Destinatarios (To) :</span><span>${lista(s.destinatariosTo)}</span></div>
      <div class="ed-row"><span class="ed-label">Contacto de emergencia :</span><span>${s.emergenciaNombre || '—'}${s.emergenciaCorreo ? ' — ' + s.emergenciaCorreo : ''}${s.emergenciaTelefono ? ' — ' + s.emergenciaTelefono : ''}</span></div>
      <div class="ed-row"><span class="ed-label">Quantity Determination :</span><span>${s.determinacionCantidad || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Quality Determination :</span><span>${s.determinacionCalidad || '—'}</span></div>
      <div class="ed-row"><span class="ed-label">Additional comments :</span><span>${s.comentariosAdicionales || '—'}</span></div>
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
      <button type="button" onclick="srvQuitarProductoNom(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
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
        <div class="porcentaje-wrap">
          <input type="number" class="porcentaje-input-nom" min="0" max="100" placeholder="0" value="${c.porcentaje ?? ''}" onchange="cambiarPorcentajeNom(${i}, this.value)">
          <span class="porcentaje-suffix">%</span>
        </div>
      </td>
      <td>
        ${contactos.length > 1
          ? `<select class="contacto-select-nom" onchange="cambiarContactoNom(${i}, this.value)">${opcionesContacto}</select>`
          : `<span>${c.contacto || '—'}</span>`}
      </td>
      <td><span class="contacto-correo-nom" id="correoContacto-${i}">${contactoActual?.correo || '—'}</span></td>
      <td style="text-align:center">
        <input type="checkbox" class="principal-check-nom" title="${checkboxDeshabilitado ? 'Ya hay un encargado asignado' : 'Marcar como encargado'}" ${c.principal ? 'checked' : ''} ${checkboxDeshabilitado ? 'disabled' : ''} onchange="marcarPrincipalNom(${i}, this)">
      </td>
      <td>
        <button class="btn-accion btn-eliminar" title="Quitar" onclick="quitarClienteNom(${i})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
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
let srvArchivoObjectUrl = null;

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
      ${item.file ? `
      <button type="button" class="btn-accion btn-editar" title="Ver vista previa" onclick="verArchivoNom(${i})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
      </button>` : ''}
      <button type="button" class="btn-accion btn-inactivar" title="Quitar" onclick="quitarArchivoNom(${i})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
      </button>
    </div>
  `).join('');
}

function agregarArchivosNom(input) {
  [...input.files].forEach(f => {
    if (!srvArchivosFormulario.some(a => a.nombre === f.name)) srvArchivosFormulario.push({ nombre: f.name, file: f });
  });
  input.value = '';
  renderArchivosNom();
}

function srvOcultarPreviewArchivoNom() {
  const preview = document.getElementById('nomArchivoPreview');
  if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; }
  if (srvArchivoObjectUrl) { URL.revokeObjectURL(srvArchivoObjectUrl); srvArchivoObjectUrl = null; }
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
  if (!item || !item.file) return;

  if (srvArchivoObjectUrl) URL.revokeObjectURL(srvArchivoObjectUrl);
  srvArchivoObjectUrl = URL.createObjectURL(item.file);
  srvArchivoPrevisualizado = indice;

  if (item.file.type.startsWith('image/')) {
    preview.innerHTML = `<img src="${srvArchivoObjectUrl}" alt="${item.nombre}">`;
  } else if (item.file.type === 'application/pdf') {
    preview.innerHTML = `<iframe src="${srvArchivoObjectUrl}"></iframe>`;
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

function srvCargarFormularioParaEdicion(id) {
  const nom = srvCargarNominaciones().find(n => n.id === id);
  if (!nom) return;

  srvEditandoId = id;
  document.getElementById('tituloFormNom').textContent = 'Editar Nominación';
  document.getElementById('breadcrumbFormNom').textContent = 'Editar Nominación';
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
  // El contenido binario de los archivos no sobrevive a un recargo de
  // página en este prototipo sin backend; se conserva y se lista el nombre.
  srvArchivosFormulario = (nom.archivos || []).map(nombre => ({ nombre, file: null }));
  srvOcultarPreviewArchivoNom();
  renderArchivosNom();
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
    archivos: srvArchivosFormulario.map(a => a.nombre)
  };

  if (srvEditandoId) {
    const idx = lista.findIndex(n => n.id === srvEditandoId);
    const estadoPrevio = idx >= 0 ? lista[idx].estado : 'Pendiente';
    datos.estado = estadoPrevio;
    if (idx >= 0) lista[idx] = datos; else lista.push(datos);
  } else {
    lista.push(datos);
  }

  srvGuardarNominaciones(lista);
  srvEditandoId = nuevaId;
  document.getElementById('tituloFormNom').textContent = 'Editar Nominación';
  document.getElementById('breadcrumbFormNom').textContent = 'Editar Nominación';
  mostrarToast('Nominación guardada correctamente');
  return true;
}

// =================================================
// MODAL — ENVIAR ACEPTACIÓN DEL SERVICIO
// =================================================
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
    : '<span class="nom-cliente-sugerencia-vacio">Agregue clientes a la nominación para ver sus contactos</span>';

  const firmanteSel = document.getElementById('aceptFirmante');
  firmanteSel.innerHTML = '<option value="">Seleccionar</option>' +
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
    : '<span class="nom-cliente-sugerencia-vacio">Sin usuarios marcados como "Incluir en copia" en el mantenedor de Usuarios</span>';

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
    : '<span class="nom-cliente-sugerencia-vacio">Sin usuarios marcados como "Attending Office Contact" en el mantenedor de Usuarios</span>';

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

  abrirModal('modalAceptacion');
}

const srvImagenesAceptacion = {};

function srvAdjuntarImagenAceptacion(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById(previewId);
  if (!preview) return;

  if (srvImagenesAceptacion[previewId]) URL.revokeObjectURL(srvImagenesAceptacion[previewId]);
  const url = URL.createObjectURL(file);
  srvImagenesAceptacion[previewId] = url;

  preview.innerHTML = `
    <span class="acept-imagen-item">
      <img src="${url}" alt="${file.name}">
      <button type="button" class="acept-imagen-quitar" title="Quitar imagen" onclick="srvLimpiarImagenAceptacion('${previewId}')">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </span>`;
  input.value = '';
}

function srvLimpiarImagenAceptacion(previewId) {
  const preview = document.getElementById(previewId);
  if (preview) preview.innerHTML = '';
  if (srvImagenesAceptacion[previewId]) {
    URL.revokeObjectURL(srvImagenesAceptacion[previewId]);
    delete srvImagenesAceptacion[previewId];
  }
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
    comentariosAdicionales: val('aceptComentariosAdicionales')
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
      srvCargarFormularioParaEdicion(idEdicion);
    } else {
      document.getElementById('nomNumero').value = srvSiguienteCodigo();
      renderClientesFormulario();
      renderArchivosNom();
      renderProductosFormulario();
    }
  }
});
