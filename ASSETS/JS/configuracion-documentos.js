// =================================================
// CONFIGURACION-DOCUMENTOS.JS
// =================================================

const ROLES_SISTEMA = ['Supervisor', 'Administrador', 'Jefe de Area'];
const ROLES_LABEL = { 'Supervisor': 'Supervisor', 'Administrador': 'Administrador', 'Jefe de Area': 'Jefe de Área' };

const PUERTOS_DEFECTO = ['Talara', 'Bayóvar', 'Etén', 'Salaverry', 'Chimbote', 'Supe', 'Callao', 'Paita', 'Ilo'];
const CLIENTES_DEFECTO = ['Cliente 1', 'Cliente 2', 'Cliente 3', 'Cliente 4', 'Cliente 5', 'Cliente 6'];

function crearDetalleRolesVacio() {
  const obj = {};
  ROLES_SISTEMA.forEach(r => obj[r] = { obligatorio: false, adjuntoObligatorio: false });
  return obj;
}

let DOCUMENTOS = [
  {
    id: 1,
    nombre: 'Curso1',
    abreviatura: 'C1',
    seccion: 'cursos',
    estado: true,
    tipoRol: 'especificos',
    rolesSeleccionados: ['Administrador', 'Supervisor'],
    numDocumentos: 1,
    detalleRoles: {
      'Supervisor': { obligatorio: true, adjuntoObligatorio: false },
      'Administrador': { obligatorio: true, adjuntoObligatorio: true },
      'Jefe de Area': { obligatorio: false, adjuntoObligatorio: false }
    },
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, obligatorio: false })),
    clientes: CLIENTES_DEFECTO.map(c => ({ nombre: c, obligatorio: false })),
    alertas: [{ dias: 30 }, { dias: 20 }, { dias: 10 }, { dias: 5 }, { dias: 3 }, { dias: 2 }]
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
  const rolFiltro = document.getElementById('filterRolDocumento').value;

  const filtrados = DOCUMENTOS.filter(d => {
    if (!d.nombre.toLowerCase().includes(texto)) return false;
    if (rolFiltro !== 'todos') {
      const roles = d.tipoRol === 'todos' ? ROLES_SISTEMA : d.rolesSeleccionados;
      if (!roles.includes(rolFiltro)) return false;
    }
    return true;
  });

  const tbody = document.getElementById('tbodyDocumentos');
  tbody.innerHTML = '';

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="contrato-vacio">No se encontraron documentos con los filtros aplicados</td></tr>';
    return;
  }

  filtrados.forEach((d, i) => {
    const rolesTexto = d.tipoRol === 'todos' ? 'Todos los roles' : d.rolesSeleccionados.map(r => ROLES_LABEL[r]).join(', ');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${d.nombre}</td>
      <td>${rolesTexto}</td>
      <td>
        <label class="switch-wrap">
          <input type="checkbox" ${d.estado ? 'checked' : ''} onchange="toggleEstadoDocumento(${d.id}, this.checked)">
          <span class="switch-track"></span>
        </label>
      </td>
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
  document.getElementById('filterRolDocumento').value = 'todos';
  renderDocumentosLista();
}

function toggleEstadoDocumento(id, checked) {
  const d = DOCUMENTOS.find(x => x.id === id);
  d.estado = checked;
  mostrarToast(`El documento se ${checked ? 'activó' : 'desactivó'} con éxito`);
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
      nombre: '', abreviatura: '', seccion: 'basica', estado: true,
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
  document.getElementById('documentoConfigEstado').value = documentoConfigTemp.estado ? 'activo' : 'inactivo';
  document.getElementById('documentoConfigNumDocs').value = documentoConfigTemp.numDocumentos;

  document.querySelector(`input[name="tipoRolDocumento"][value="${documentoConfigTemp.tipoRol}"]`).checked = true;
  document.querySelectorAll('#documentoRolesGrid input[type="checkbox"]').forEach(chk => {
    chk.checked = documentoConfigTemp.rolesSeleccionados.includes(chk.value);
  });
  toggleTipoRol();

  renderDetalleRoles();
  renderPuertos();
  renderClientes();
  renderAlertas();

  document.querySelectorAll('#modalConfigDocumento .perfil-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('#modalConfigDocumento .perfil-panel').forEach((p, i) => p.classList.toggle('active', i === 0));

  abrirModal('modalConfigDocumento');
}

function toggleTipoRol() {
  const tipo = document.querySelector('input[name="tipoRolDocumento"]:checked').value;
  document.getElementById('documentoRolesGrid').style.display = tipo === 'especificos' ? '' : 'none';
}

function cambiarTabDocumento(btn, tab) {
  document.querySelectorAll('#modalConfigDocumento .perfil-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#modalConfigDocumento .perfil-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector(`#modalConfigDocumento .perfil-panel[data-panel="${tab}"]`).classList.add('active');
}

function renderDetalleRoles() {
  const tbody = document.getElementById('detalleRolesList');
  tbody.innerHTML = ROLES_SISTEMA.map((r, i) => {
    const det = documentoConfigTemp.detalleRoles[r];
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${ROLES_LABEL[r]}</td>
        <td>
          <label class="switch-wrap">
            <input type="checkbox" ${det.obligatorio ? 'checked' : ''} onchange="documentoConfigTemp.detalleRoles['${r}'].obligatorio = this.checked">
            <span class="switch-track"></span>
          </label>
        </td>
        <td>
          <label class="switch-wrap">
            <input type="checkbox" ${det.adjuntoObligatorio ? 'checked' : ''} onchange="documentoConfigTemp.detalleRoles['${r}'].adjuntoObligatorio = this.checked">
            <span class="switch-track"></span>
          </label>
        </td>
      </tr>`;
  }).join('');
}

function renderPuertos() {
  const tbody = document.getElementById('puertosList');
  tbody.innerHTML = documentoConfigTemp.puertos.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.nombre}</td>
      <td>
        <label class="switch-wrap">
          <input type="checkbox" ${p.obligatorio ? 'checked' : ''} onchange="documentoConfigTemp.puertos[${i}].obligatorio = this.checked">
          <span class="switch-track"></span>
        </label>
      </td>
    </tr>`).join('');
}

function renderClientes() {
  const tbody = document.getElementById('clientesList');
  tbody.innerHTML = documentoConfigTemp.clientes.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${c.nombre}</td>
      <td>
        <label class="switch-wrap">
          <input type="checkbox" ${c.obligatorio ? 'checked' : ''} onchange="documentoConfigTemp.clientes[${i}].obligatorio = this.checked">
          <span class="switch-track"></span>
        </label>
      </td>
    </tr>`).join('');
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
  limpiarErroresModal('modalConfigDocumento');

  if (!nombreInput.value.trim()) { mostrarErrorCampo(nombreInput, 'Campo obligatorio'); nombreInput.focus(); return; }

  const tipoRol = document.querySelector('input[name="tipoRolDocumento"]:checked').value;
  const rolesSeleccionados = tipoRol === 'especificos'
    ? [...document.querySelectorAll('#documentoRolesGrid input:checked')].map(c => c.value)
    : [];

  if (tipoRol === 'especificos' && rolesSeleccionados.length === 0) {
    mostrarToast('Selecciona al menos un rol específico');
    return;
  }

  documentoConfigTemp.nombre = nombreInput.value.trim();
  documentoConfigTemp.abreviatura = document.getElementById('documentoConfigAbreviatura').value.trim();
  documentoConfigTemp.seccion = document.getElementById('documentoConfigSeccion').value;
  documentoConfigTemp.estado = document.getElementById('documentoConfigEstado').value === 'activo';
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
  mostrarToast('La configuración del documento se guardó con éxito');
}

renderDocumentosLista();
