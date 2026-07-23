// =================================================
// CONFIGURACION-DOCUMENTOS.JS
// =================================================

const ROLES_SISTEMA = ['Supervisor', 'Administrador', 'Jefe de Area'];
const ROLES_LABEL = { 'Supervisor': 'Supervisor', 'Administrador': 'Administrador', 'Jefe de Area': 'Jefe de Área' };

// Estas secciones son las mismas que consume el panel "Documentación" de Información Profesional
// (informacion-profesional.js → PERFILES[].documentos.{cursos,certificaciones,idiomas}); "basica"
// agrupa documentos generales (DNI, contrato) que no pertenecen a ese panel.
const SECCION_DOC_LABEL = { basica: 'Documentación básica', cursos: 'Cursos realizados', certificaciones: 'Certificaciones', idiomas: 'Idiomas' };

const PUERTOS_DEFECTO = ['Talara', 'Bayóvar', 'Etén', 'Salaverry', 'Chimbote', 'Supe', 'Callao', 'Paita', 'Ilo'];
const CLIENTES_DEFECTO = ['Sandra Motors', 'Naviera del Pacífico S.A.', 'Perú LNG S.R.L.', 'Shell Trading Perú'];

function crearDetalleRolesVacio() {
  const obj = {};
  ROLES_SISTEMA.forEach(r => obj[r] = { solicitado: true, obligatorio: false, adjuntoObligatorio: false });
  return obj;
}

// Variante de crearDetalleRolesVacio() para datos de ejemplo: solo los roles pasados
// quedan Solicitado + Obligatorio, el resto queda como no solicitado.
function crearDetalleRoles(rolesIncluidos) {
  const obj = {};
  ROLES_SISTEMA.forEach(r => {
    const incluido = rolesIncluidos.includes(r);
    obj[r] = { solicitado: incluido, obligatorio: incluido, adjuntoObligatorio: false };
  });
  return obj;
}

let DOCUMENTOS = [
  {
    id: 1,
    nombre: 'Curso1',
    abreviatura: 'C1',
    seccion: 'cursos',
    estado: true,
    link: '',
    tipoRol: 'especificos',
    rolesSeleccionados: ['Administrador', 'Supervisor'],
    numDocumentos: 1,
    detalleRoles: {
      'Supervisor': { solicitado: true, obligatorio: true, adjuntoObligatorio: false },
      'Administrador': { solicitado: true, obligatorio: true, adjuntoObligatorio: true },
      'Jefe de Area': { solicitado: false, obligatorio: false, adjuntoObligatorio: false }
    },
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: [{ dias: 30 }, { dias: 20 }, { dias: 10 }, { dias: 5 }, { dias: 3 }, { dias: 2 }]
  },
  {
    id: 2,
    nombre: 'DNI',
    abreviatura: 'DNI',
    seccion: 'basica',
    estado: true,
    link: '',
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    numDocumentos: 1,
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: []
  },
  {
    id: 3,
    nombre: 'Contrato de Trabajo',
    abreviatura: 'CONT',
    seccion: 'basica',
    estado: true,
    link: '',
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    numDocumentos: 1,
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: [{ dias: 30 }, { dias: 15 }]
  },
  {
    id: 4,
    nombre: 'Curso de Seguridad Portuaria',
    abreviatura: 'CSP',
    seccion: 'cursos',
    estado: true,
    link: '',
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    numDocumentos: 1,
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: true })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: [{ dias: 30 }, { dias: 10 }]
  },
  {
    id: 5,
    nombre: 'Curso de Primeros Auxilios',
    abreviatura: 'CPA',
    seccion: 'cursos',
    estado: true,
    link: '',
    tipoRol: 'especificos',
    rolesSeleccionados: ['Administrador', 'Jefe de Area'],
    numDocumentos: 1,
    detalleRoles: crearDetalleRoles(['Administrador', 'Jefe de Area']),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: [{ dias: 20 }]
  },
  {
    id: 6,
    nombre: 'Certificación ISO 9001',
    abreviatura: 'ISO9001',
    seccion: 'certificaciones',
    estado: true,
    link: '',
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    numDocumentos: 1,
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: [{ dias: 60 }, { dias: 30 }]
  },
  {
    id: 7,
    nombre: 'Certificación PMP',
    abreviatura: 'PMP',
    seccion: 'certificaciones',
    estado: false,
    link: '',
    tipoRol: 'especificos',
    rolesSeleccionados: ['Jefe de Area'],
    numDocumentos: 1,
    detalleRoles: crearDetalleRoles(['Jefe de Area']),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: []
  },
  {
    id: 8,
    nombre: 'Inglés — Nivel Avanzado',
    abreviatura: 'ING-AV',
    seccion: 'idiomas',
    estado: true,
    link: '',
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    numDocumentos: 1,
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: []
  },
  {
    id: 9,
    nombre: 'Francés — Nivel Básico',
    abreviatura: 'FR-B',
    seccion: 'idiomas',
    estado: false,
    link: '',
    tipoRol: 'especificos',
    rolesSeleccionados: ['Supervisor'],
    numDocumentos: 1,
    detalleRoles: crearDetalleRoles(['Supervisor']),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: []
  }
];

let documentoActualId = null;
let documentoConfigTemp = null;
let alertaEditIndex = null;

// =================================================
// LISTA
// =================================================
function renderDocumentosLista() {
  const texto = document.getElementById('searchDocumento').value.toLowerCase();
  const seccionFiltro = document.getElementById('filterSeccionDocumento').value;
  const rolFiltro = document.getElementById('filterRolDocumento').value;
  const estadoFiltro = document.getElementById('filterEstadoDocumento').value;

  const filtrados = DOCUMENTOS.filter(d => {
    if (!d.nombre.toLowerCase().includes(texto)) return false;
    if (seccionFiltro !== 'todos' && d.seccion !== seccionFiltro) return false;
    if (rolFiltro !== 'todos') {
      const roles = d.tipoRol === 'todos' ? ROLES_SISTEMA : d.rolesSeleccionados;
      if (!roles.includes(rolFiltro)) return false;
    }
    if (estadoFiltro !== 'todos' && (d.estado ? 'activo' : 'inactivo') !== estadoFiltro) return false;
    return true;
  });

  const tbody = document.getElementById('tbodyDocumentos');
  tbody.innerHTML = '';

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="contrato-vacio">No se encontraron documentos con los filtros aplicados</td></tr>';
    return;
  }

  filtrados.forEach((d, i) => {
    const rolesTexto = d.tipoRol === 'todos' ? 'Todos los roles' : d.rolesSeleccionados.map(r => ROLES_LABEL[r]).join(', ');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${d.nombre}</td>
      <td>${SECCION_DOC_LABEL[d.seccion] || d.seccion}</td>
      <td>${rolesTexto}</td>
      <td><span class="badge ${d.estado ? 'badge-activo' : 'badge-inactivo'}"><span class="badge-dot"></span>${d.estado ? 'Activo' : 'Inactivo'}</span></td>
      <td class="opciones">
        <button class="btn-accion btn-editar" title="Editar" onclick="abrirModalDocumento(${d.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
        <button class="btn-accion btn-inactivar" title="Eliminar" onclick="eliminarDocumento(${d.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function filtrarDocumentos() { renderDocumentosLista(); }

function limpiarFiltrosDocumentos() {
  document.getElementById('searchDocumento').value = '';
  document.getElementById('filterSeccionDocumento').value = 'todos';
  document.getElementById('filterRolDocumento').value = 'todos';
  document.getElementById('filterEstadoDocumento').value = 'todos';
  renderDocumentosLista();
}

function eliminarDocumento(id) {
  confirmarAccion('¿Desea eliminar esta configuración de documento?', () => {
    DOCUMENTOS = DOCUMENTOS.filter(d => d.id !== id);
    renderDocumentosLista();
    mostrarToast('La configuración se eliminó con éxito');
  });
}

// =================================================
// MODAL NUEVO/EDITAR CONFIGURACIÓN DE DOCUMENTO
// =================================================
function abrirModalDocumento(id = null) {
  documentoActualId = id;
  limpiarErroresModal('modalConfigDocumento');

  let d;
  if (id !== null) {
    d = DOCUMENTOS.find(x => x.id === id);
    document.getElementById('documentoConfigTitulo').textContent = 'Editar Configuración de Documento';
  } else {
    d = {
      nombre: '', abreviatura: '', seccion: 'basica', estado: true, link: '',
      tipoRol: 'todos', rolesSeleccionados: [], numDocumentos: 1,
      detalleRoles: crearDetalleRolesVacio(),
      puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
      clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
      alertas: []
    };
    document.getElementById('documentoConfigTitulo').textContent = 'Nueva Configuración de Documento';
  }

  // Copia de trabajo: los cambios solo impactan DOCUMENTOS al presionar Guardar
  documentoConfigTemp = JSON.parse(JSON.stringify(d));

  document.getElementById('documentoConfigSeccion').value = documentoConfigTemp.seccion;
  document.getElementById('documentoConfigNombre').value = documentoConfigTemp.nombre;
  document.getElementById('documentoConfigAbreviatura').value = documentoConfigTemp.abreviatura;
  document.getElementById('documentoConfigLink').value = documentoConfigTemp.link || '';
  document.getElementById('documentoConfigNumDocs').value = documentoConfigTemp.numDocumentos;

  // Todo documento nuevo se crea en estado Activo, por eso no se muestra el campo Estado
  document.getElementById('grupoEstadoDocumento').style.display = id !== null ? '' : 'none';
  document.getElementById('documentoConfigEstadoToggle').checked = documentoConfigTemp.estado;
  actualizarTextoEstadoDocumento();

  renderDetalleRoles();
  renderPuertos();
  renderClientes();
  renderAlertas();

  document.querySelectorAll('#modalConfigDocumento .perfil-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('#modalConfigDocumento .perfil-panel').forEach((p, i) => p.classList.toggle('active', i === 0));

  abrirModal('modalConfigDocumento');
}

function actualizarTextoEstadoDocumento() {
  const toggle = document.getElementById('documentoConfigEstadoToggle');
  const texto = document.getElementById('documentoConfigEstadoTexto');
  texto.textContent = toggle.checked ? 'Activo' : 'Inactivo';
}

function cambiarTabDocumento(btn, tab) {
  document.querySelectorAll('#modalConfigDocumento .perfil-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#modalConfigDocumento .perfil-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector(`#modalConfigDocumento .perfil-panel[data-panel="${tab}"]`).classList.add('active');
}

// Botón segmentado Sí/No: reemplaza al switch en Detalle de documentos, Puerto y Cliente
function segToggleHTML(valor, onSi, onNo, disabled = false) {
  const dis = disabled ? 'disabled' : '';
  return `
    <div class="seg-toggle ${disabled ? 'seg-toggle-disabled' : ''}">
      <button type="button" class="seg-btn seg-btn-si ${valor ? 'active' : ''}" ${dis} onclick="${onSi}">Sí</button>
      <button type="button" class="seg-btn seg-btn-no ${!valor ? 'active' : ''}" ${dis} onclick="${onNo}">No</button>
    </div>`;
}

function renderDetalleRoles() {
  const tbody = document.getElementById('detalleRolesList');
  tbody.innerHTML = ROLES_SISTEMA.map((r, i) => {
    const det = documentoConfigTemp.detalleRoles[r];
    const deshabilitado = !det.solicitado;
    return `
      <tr class="${deshabilitado ? 'fila-rol-inactiva' : ''}">
        <td>${i + 1}</td>
        <td>${ROLES_LABEL[r]}</td>
        <td class="col-centrado">
          ${segToggleHTML(det.solicitado, `toggleRolSolicitado('${r}', true)`, `toggleRolSolicitado('${r}', false)`)}
        </td>
        <td class="col-centrado">
          ${segToggleHTML(det.obligatorio, `setDetalleRolFlag('${r}', 'obligatorio', true)`, `setDetalleRolFlag('${r}', 'obligatorio', false)`, deshabilitado)}
        </td>
        <td class="col-centrado">
          ${segToggleHTML(det.adjuntoObligatorio, `setDetalleRolFlag('${r}', 'adjuntoObligatorio', true)`, `setDetalleRolFlag('${r}', 'adjuntoObligatorio', false)`, deshabilitado)}
        </td>
      </tr>`;
  }).join('');
}

function toggleRolSolicitado(rol, solicitado) {
  const det = documentoConfigTemp.detalleRoles[rol];
  det.solicitado = solicitado;
  if (!solicitado) {
    det.obligatorio = false;
    det.adjuntoObligatorio = false;
  }
  renderDetalleRoles();
}

function setDetalleRolFlag(rol, campo, valor) {
  documentoConfigTemp.detalleRoles[rol][campo] = valor;
  renderDetalleRoles();
}

function renderPuertos() {
  const tbody = document.getElementById('puertosList');
  tbody.innerHTML = documentoConfigTemp.puertos.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.nombre}</td>
      <td class="col-centrado">
        ${segToggleHTML(p.obligatorio, `setPuertoObligatorio(${i}, true)`, `setPuertoObligatorio(${i}, false)`)}
      </td>
    </tr>`).join('');
}

function setPuertoObligatorio(i, valor) {
  documentoConfigTemp.puertos[i].obligatorio = valor;
  renderPuertos();
}

function renderClientes() {
  const tbody = document.getElementById('clientesList');
  tbody.innerHTML = documentoConfigTemp.clientes.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${c.nombre}</td>
      <td class="col-centrado">
        ${segToggleHTML(c.obligatorio, `setClienteObligatorio(${i}, true)`, `setClienteObligatorio(${i}, false)`)}
      </td>
    </tr>`).join('');
}

function setClienteObligatorio(i, valor) {
  documentoConfigTemp.clientes[i].obligatorio = valor;
  renderClientes();
}

function renderAlertas() {
  const tbody = document.getElementById('alertasList');

  if (!documentoConfigTemp.alertas.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="contrato-vacio">Aún no se registraron alertas</td></tr>';
    return;
  }

  tbody.innerHTML = documentoConfigTemp.alertas.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${a.dias} días</td>
      <td class="opciones">
        <button class="btn-accion btn-editar" title="Editar" onclick="abrirModalAlerta(${i})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
        <button class="btn-accion btn-inactivar" title="Eliminar" onclick="eliminarAlerta(${i})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

function abrirModalAlerta(index = null) {
  alertaEditIndex = index;
  limpiarErroresModal('modalAlertaDocumento');
  document.getElementById('alertaModalTitulo').textContent = index !== null ? 'Editar Alerta' : 'Registro de Alerta';
  document.getElementById('alertaDias').value = index !== null ? documentoConfigTemp.alertas[index].dias : '';
  abrirModal('modalAlertaDocumento');
}

function guardarAlerta() {
  const input = document.getElementById('alertaDias');
  limpiarErroresModal('modalAlertaDocumento');

  const dias = parseInt(input.value);
  if (!input.value || dias <= 0) { mostrarErrorCampo(input, 'Ingrese un número de días válido'); input.focus(); return; }

  if (alertaEditIndex !== null) {
    documentoConfigTemp.alertas[alertaEditIndex].dias = dias;
  } else {
    documentoConfigTemp.alertas.push({ dias });
  }
  documentoConfigTemp.alertas.sort((a, b) => b.dias - a.dias);

  renderAlertas();
  cerrarModal('modalAlertaDocumento');
  mostrarToast('La alerta se guardó con éxito');
}

function eliminarAlerta(index) {
  confirmarAccion('¿Desea eliminar esta alerta?', () => {
    documentoConfigTemp.alertas.splice(index, 1);
    renderAlertas();
    mostrarToast('La alerta se eliminó con éxito');
  });
}

function guardarDocumento() {
  const nombreInput = document.getElementById('documentoConfigNombre');
  const seccionInput = document.getElementById('documentoConfigSeccion');
  limpiarErroresModal('modalConfigDocumento');

  if (!nombreInput.value.trim()) { mostrarErrorCampo(nombreInput, 'Campo obligatorio'); nombreInput.focus(); return; }
  if (!seccionInput.value) { mostrarErrorCampo(seccionInput, 'Campo obligatorio'); seccionInput.focus(); return; }

  const rolesSeleccionados = ROLES_SISTEMA.filter(r => documentoConfigTemp.detalleRoles[r].solicitado);
  const tipoRol = rolesSeleccionados.length === ROLES_SISTEMA.length ? 'todos' : 'especificos';

  if (rolesSeleccionados.length === 0) {
    mostrarToast('Selecciona al menos un rol solicitado');
    return;
  }

  documentoConfigTemp.nombre = nombreInput.value.trim();
  documentoConfigTemp.abreviatura = document.getElementById('documentoConfigAbreviatura').value.trim();
  documentoConfigTemp.seccion = seccionInput.value;
  documentoConfigTemp.link = document.getElementById('documentoConfigLink').value.trim();
  documentoConfigTemp.estado = documentoActualId !== null ? document.getElementById('documentoConfigEstadoToggle').checked : true;
  documentoConfigTemp.numDocumentos = parseInt(document.getElementById('documentoConfigNumDocs').value) || 1;
  documentoConfigTemp.tipoRol = tipoRol;
  documentoConfigTemp.rolesSeleccionados = rolesSeleccionados;

  if (documentoActualId !== null) {
    const idx = DOCUMENTOS.findIndex(d => d.id === documentoActualId);
    DOCUMENTOS[idx] = { ...documentoConfigTemp, id: documentoActualId };
  } else {
    const nuevoId = Math.max(0, ...DOCUMENTOS.map(d => d.id)) + 1;
    DOCUMENTOS.push({ ...documentoConfigTemp, id: nuevoId });
  }

  renderDocumentosLista();
  cerrarModal('modalConfigDocumento');
  mostrarModalGuardado(documentoActualId !== null ? 'editar' : 'crear');
}

renderDocumentosLista();
