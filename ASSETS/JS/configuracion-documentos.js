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
  ROLES_SISTEMA.forEach(r => obj[r] = { solicitado: true, adjuntoObligatorio: false });
  return obj;
}

// Variante de crearDetalleRolesVacio() para datos de ejemplo: solo los roles pasados
// quedan Solicitado, el resto queda como no solicitado.
function crearDetalleRoles(rolesIncluidos) {
  const obj = {};
  ROLES_SISTEMA.forEach(r => {
    const incluido = rolesIncluidos.includes(r);
    obj[r] = { solicitado: incluido, adjuntoObligatorio: false };
  });
  return obj;
}

function crearListaPuertosClientes(nombres) {
  return nombres.map(n => ({ nombre: n, solicitado: true, adjuntoObligatorio: false }));
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
    variantes: [],
    detalleRoles: {
      'Supervisor': { solicitado: true, adjuntoObligatorio: false },
      'Administrador': { solicitado: true, adjuntoObligatorio: true },
      'Jefe de Area': { solicitado: false, adjuntoObligatorio: false }
    },
    puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: [{ dias: 30 }, { dias: 20 }, { dias: 10 }, { dias: 5 }, { dias: 3 }, { dias: 2 }]
  },
  {
    id: 2,
    nombre: 'DNI',
    abreviatura: 'DNI',
    seccion: 'basica',
    estado: true,
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    variantes: [],
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: []
  },
  {
    id: 3,
    nombre: 'Contrato de Trabajo',
    abreviatura: 'CONT',
    seccion: 'basica',
    estado: true,
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    variantes: [],
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: [{ dias: 30 }, { dias: 15 }]
  },
  {
    id: 4,
    nombre: 'Curso de Seguridad Portuaria',
    abreviatura: 'CSP',
    seccion: 'cursos',
    estado: true,
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    variantes: [],
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: PUERTOS_DEFECTO.map(p => ({ nombre: p, solicitado: true, adjuntoObligatorio: true })),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: [{ dias: 30 }, { dias: 10 }]
  },
  {
    id: 5,
    nombre: 'Curso de Primeros Auxilios',
    abreviatura: 'CPA',
    seccion: 'cursos',
    estado: true,
    tipoRol: 'especificos',
    rolesSeleccionados: ['Administrador', 'Jefe de Area'],
    variantes: [],
    detalleRoles: crearDetalleRoles(['Administrador', 'Jefe de Area']),
    puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: [{ dias: 20 }]
  },
  {
    id: 6,
    nombre: 'Certificación ISO 9001',
    abreviatura: 'ISO9001',
    seccion: 'certificaciones',
    estado: true,
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    variantes: [],
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: [{ dias: 60 }, { dias: 30 }]
  },
  {
    id: 7,
    nombre: 'Certificación PMP',
    abreviatura: 'PMP',
    seccion: 'certificaciones',
    estado: false,
    tipoRol: 'especificos',
    rolesSeleccionados: ['Jefe de Area'],
    variantes: [],
    detalleRoles: crearDetalleRoles(['Jefe de Area']),
    puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: []
  },
  {
    id: 8,
    nombre: 'Inglés — Nivel Avanzado',
    abreviatura: 'ING-AV',
    seccion: 'idiomas',
    estado: true,
    tipoRol: 'todos',
    rolesSeleccionados: [...ROLES_SISTEMA],
    variantes: [],
    detalleRoles: crearDetalleRoles(ROLES_SISTEMA),
    puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: []
  },
  {
    id: 9,
    nombre: 'Francés — Nivel Básico',
    abreviatura: 'FR-B',
    seccion: 'idiomas',
    estado: false,
    tipoRol: 'especificos',
    rolesSeleccionados: ['Supervisor'],
    variantes: [],
    detalleRoles: crearDetalleRoles(['Supervisor']),
    puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
    clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
    alertas: []
  }
];

let documentoActualId = null;
let documentoConfigTemp = null;
let alertaEditIndex = null;

// Estado de paginación/búsqueda de las grillas Puerto y Cliente del modal. Puerto no
// lleva buscador porque la lista de puertos es fija y corta (ver PUERTOS_DEFECTO); Cliente
// sí, porque viene de un mantenedor (cliente.html) donde la lista crece con el tiempo.
let puertoPaginaActual = 1;
let puertoPorPagina = 10;
let clientePaginaActual = 1;
let clientePorPagina = 10;
let clienteBusqueda = '';

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
    tr.dataset.id = d.id;
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
      nombre: '', abreviatura: '', seccion: 'basica', estado: true,
      tipoRol: 'todos', rolesSeleccionados: [], variantes: [],
      detalleRoles: crearDetalleRolesVacio(),
      puertos: crearListaPuertosClientes(PUERTOS_DEFECTO),
      clientes: crearListaPuertosClientes(CLIENTES_DEFECTO),
      alertas: []
    };
    document.getElementById('documentoConfigTitulo').textContent = 'Nueva Configuración de Documento';
  }

  // Copia de trabajo: los cambios solo impactan DOCUMENTOS al presionar Guardar
  documentoConfigTemp = JSON.parse(JSON.stringify(d));

  document.getElementById('documentoConfigSeccion').value = documentoConfigTemp.seccion;
  document.getElementById('documentoConfigNombre').value = documentoConfigTemp.nombre;
  document.getElementById('documentoConfigAbreviatura').value = documentoConfigTemp.abreviatura;

  // Todo documento nuevo se crea en estado Activo, por eso no se muestra el campo Estado
  document.getElementById('grupoEstadoDocumento').style.display = id !== null ? '' : 'none';
  document.getElementById('documentoConfigEstadoToggle').checked = documentoConfigTemp.estado;
  actualizarTextoEstadoDocumento();

  puertoPaginaActual = 1;
  clientePaginaActual = 1;
  clienteBusqueda = '';
  document.getElementById('searchClienteDetalle').value = '';

  renderVariantesDocumento();
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

// =================================================
// DOCUMENTOS ESPECÍFICOS (edición en línea, sin modal)
// =================================================
function renderVariantesDocumento() {
  const tbody = document.getElementById('variantesDocumentoList');

  if (!documentoConfigTemp.variantes.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="contrato-vacio">Aún no se registraron documentos específicos</td></tr>';
    return;
  }

  tbody.innerHTML = documentoConfigTemp.variantes.map((v, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><input type="text" class="modal-input" placeholder="Ej. Básico" value="${v.nombre}" oninput="setVarianteCampo(${i}, 'nombre', this.value)"></td>
      <td><input type="url" class="modal-input" placeholder="https://..." value="${v.link}" oninput="setVarianteCampo(${i}, 'link', this.value)"></td>
      <td class="opciones">
        <button class="btn-accion btn-inactivar" title="Eliminar" onclick="eliminarVarianteDocumento(${i})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

function agregarVarianteDocumento() {
  documentoConfigTemp.variantes.push({ nombre: '', link: '' });
  renderVariantesDocumento();
  const inputs = document.querySelectorAll('#variantesDocumentoList tr:last-child input');
  if (inputs.length) inputs[0].focus();
}

function setVarianteCampo(index, campo, valor) {
  documentoConfigTemp.variantes[index][campo] = valor;
}

function eliminarVarianteDocumento(index) {
  documentoConfigTemp.variantes.splice(index, 1);
  renderVariantesDocumento();
}

function cambiarTabDocumento(btn, tab) {
  document.querySelectorAll('#modalConfigDocumento .perfil-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#modalConfigDocumento .perfil-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector(`#modalConfigDocumento .perfil-panel[data-panel="${tab}"]`).classList.add('active');
}

// Botón segmentado Sí/No: reemplaza al switch en Detalle de documentos, Puerto y Cliente.
// `campo` es opcional: identifica a qué columna pertenece el toggle (data-col), usado
// por Detalle de documentos para relacionar cada celda con su checkbox "seleccionar todos".
function segToggleHTML(valor, onSi, onNo, disabled = false, campo = '') {
  const dis = disabled ? 'disabled' : '';
  const col = campo ? ` data-col="${campo}"` : '';
  return `
    <div class="seg-toggle ${disabled ? 'seg-toggle-disabled' : ''}"${col}>
      <button type="button" class="seg-btn seg-btn-no ${!valor ? 'active' : ''}" ${dis} onclick="${onNo}">No</button>
      <button type="button" class="seg-btn seg-btn-si ${valor ? 'active' : ''}" ${dis} onclick="${onSi}">Sí</button>
    </div>`;
}

// Columnas de Detalle de documentos: relaciona cada campo del modelo con el id de su
// checkbox "seleccionar todos" en el encabezado. 'solicitado' es la columna que manda:
// al ponerla en No, fuerza y deshabilita 'adjuntoObligatorio' en esa fila.
const DETALLE_ROLES_COLUMNAS = [
  { campo: 'solicitado', checkId: 'checkAllSolicitado' },
  { campo: 'adjuntoObligatorio', checkId: 'checkAllAdjunto' }
];

function renderDetalleRoles() {
  const tbody = document.getElementById('detalleRolesList');
  tbody.innerHTML = ROLES_SISTEMA.map((r, i) => {
    const det = documentoConfigTemp.detalleRoles[r];
    const deshabilitado = !det.solicitado;
    const celda = (campo, disabled = false) => `
        <td class="col-centrado">
          ${segToggleHTML(det[campo], `setDetalleCampo('${r}', '${campo}', true)`, `setDetalleCampo('${r}', '${campo}', false)`, disabled, campo)}
        </td>`;
    return `
      <tr class="${deshabilitado ? 'fila-rol-inactiva' : ''}">
        <td>${i + 1}</td>
        <td>${ROLES_LABEL[r]}</td>
        ${celda('solicitado')}
        ${celda('adjuntoObligatorio', deshabilitado)}
      </tr>`;
  }).join('');
  actualizarCheckAllDetalle();
}

// Sincroniza los checkboxes "seleccionar todos" del encabezado con el estado real de
// las filas: marcado si todas están en Sí, indeterminado si están mezcladas. Las
// columnas que no sean 'solicitado' solo consideran filas con Solicitado=Sí.
function actualizarCheckAllDetalle() {
  const roles = ROLES_SISTEMA.map(r => documentoConfigTemp.detalleRoles[r]);
  DETALLE_ROLES_COLUMNAS.forEach(({ campo, checkId }) => {
    const elegibles = campo === 'solicitado' ? roles : roles.filter(d => d.solicitado);
    setCheckAllState(checkId, elegibles.map(d => d[campo]), campo !== 'solicitado' && elegibles.length === 0);
  });
}

function setCheckAllState(id, valores, forzarDisabled = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.disabled = forzarDisabled;
  el.checked = valores.length > 0 && valores.every(v => v);
  el.indeterminate = !forzarDisabled && valores.some(v => v) && !valores.every(v => v);
}

// Cambia un campo de una sola fila. 'solicitado' es especial: al pasar a No, fuerza
// también 'adjuntoObligatorio' a No (regla de negocio de la tabla).
function setDetalleCampo(rol, campo, valor) {
  const det = documentoConfigTemp.detalleRoles[rol];
  det[campo] = valor;
  if (campo === 'solicitado' && !valor) {
    det.adjuntoObligatorio = false;
  }
  renderDetalleRoles();
}

// Aplica un valor a una columna completa (checkbox "seleccionar todos" del encabezado).
// Reutilizable para las 2 columnas vía data-col, sin duplicar lógica por columna.
function marcarColumna(campo, valor) {
  ROLES_SISTEMA.forEach(r => {
    const det = documentoConfigTemp.detalleRoles[r];
    if (campo === 'solicitado') {
      det.solicitado = valor;
      if (!valor) {
        det.adjuntoObligatorio = false;
      }
    } else if (det.solicitado) {
      det[campo] = valor;
    }
  });
  renderDetalleRoles();
}

// Render genérico para las tablas Puerto/Cliente: mismas columnas Solicitado +
// Documento Adjunto que en Detalle de documentos, con la misma regla de deshabilitado.
// `entradas` son pares {item, i} donde `i` es el índice del item en la lista COMPLETA
// (documentoConfigTemp.puertos/clientes), no en la página visible, para que el setter
// siga mutando el registro correcto aunque haya paginación o búsqueda de por medio.
function renderListaSolicitadoAdjunto(tbodyId, entradas, setter) {
  const tbody = document.getElementById(tbodyId);
  if (!entradas.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="contrato-vacio">No se encontraron registros</td></tr>';
    return;
  }
  tbody.innerHTML = entradas.map(({ item, i }) => {
    const deshabilitado = !item.solicitado;
    const celda = (campo, disabled = false) => `
        <td class="col-centrado">
          ${segToggleHTML(item[campo], `${setter}(${i}, '${campo}', true)`, `${setter}(${i}, '${campo}', false)`, disabled, campo)}
        </td>`;
    return `
      <tr class="${deshabilitado ? 'fila-rol-inactiva' : ''}">
        <td>${i + 1}</td>
        <td>${item.nombre}</td>
        ${celda('solicitado')}
        ${celda('adjuntoObligatorio', deshabilitado)}
      </tr>`;
  }).join('');
}

// El checkbox "seleccionar todos" del encabezado solo considera el conjunto vigente
// (lo que pasa el filtro de búsqueda, si hay uno), igual que "marcar columna" abajo.
function actualizarCheckAllLista(lista, checkIdSolicitado, checkIdAdjunto) {
  setCheckAllState(checkIdSolicitado, lista.map(item => item.solicitado));
  const elegibles = lista.filter(item => item.solicitado);
  setCheckAllState(checkIdAdjunto, elegibles.map(item => item.adjuntoObligatorio), elegibles.length === 0);
}

// Pagina un arreglo de {item, i} ya filtrado. Ajusta la página actual si quedó fuera
// de rango (p. ej. tras filtrar o borrar registros) y devuelve también el total.
function paginarEntradas(entradas, paginaActual, porPagina) {
  const total = entradas.length;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const pagina = Math.min(paginaActual, totalPaginas);
  const inicio = (pagina - 1) * porPagina;
  return { pagina, totalPaginas, total, entradasPagina: entradas.slice(inicio, inicio + porPagina) };
}

// HTML de paginación reutilizable para Puerto y Cliente (mismo componente visual que
// usa Disponibilidad de Personal en ASSETS/JS/disponibilidad-personal.js).
function paginacionHTML(pagina, totalPaginas, porPagina, fnPagina, fnTamano) {
  let botones = '';
  for (let i = 1; i <= totalPaginas; i++) {
    botones += `<button class="pag-btn ${i === pagina ? 'active' : ''}" onclick="${fnPagina}(${i})">${i}</button>`;
  }
  return `
    <div class="pagination-left">
      <span class="pag-text">Mostrar</span>
      <select class="pag-select" onchange="${fnTamano}(this.value)">
        <option value="5" ${porPagina === 5 ? 'selected' : ''}>5</option>
        <option value="10" ${porPagina === 10 ? 'selected' : ''}>10</option>
        <option value="20" ${porPagina === 20 ? 'selected' : ''}>20</option>
        <option value="50" ${porPagina === 50 ? 'selected' : ''}>50</option>
      </select>
      <span class="pag-text">registros</span>
    </div>
    <div class="pagination-right">
      <button class="pag-btn pag-btn-nav" ${pagina === 1 ? 'disabled' : ''} onclick="${fnPagina}(${pagina - 1})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      ${botones}
      <button class="pag-btn pag-btn-nav" ${pagina === totalPaginas ? 'disabled' : ''} onclick="${fnPagina}(${pagina + 1})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>`;
}

function renderPuertos() {
  const entradas = documentoConfigTemp.puertos.map((item, i) => ({ item, i }));
  const { pagina, totalPaginas, entradasPagina } = paginarEntradas(entradas, puertoPaginaActual, puertoPorPagina);
  puertoPaginaActual = pagina;

  renderListaSolicitadoAdjunto('puertosList', entradasPagina, 'setDetallePuerto');
  actualizarCheckAllLista(documentoConfigTemp.puertos, 'checkAllPuertoSolicitado', 'checkAllPuertoAdjunto');
  document.getElementById('puertoPaginacion').innerHTML =
    paginacionHTML(pagina, totalPaginas, puertoPorPagina, 'cambiarPaginaPuertos', 'cambiarTamanoPaginaPuertos');
}

function cambiarPaginaPuertos(pagina) {
  puertoPaginaActual = pagina;
  renderPuertos();
}

function cambiarTamanoPaginaPuertos(valor) {
  puertoPorPagina = parseInt(valor);
  puertoPaginaActual = 1;
  renderPuertos();
}

function setDetallePuerto(i, campo, valor) {
  const p = documentoConfigTemp.puertos[i];
  p[campo] = valor;
  if (campo === 'solicitado' && !valor) p.adjuntoObligatorio = false;
  renderPuertos();
}

// "Marcar todos" aplica sobre TODA la lista de puertos (no hay buscador en este panel,
// así que el conjunto visible tras paginar y el conjunto total son lo mismo en intención).
function marcarColumnaPuertos(campo, valor) {
  documentoConfigTemp.puertos.forEach(p => {
    if (campo === 'solicitado') {
      p.solicitado = valor;
      if (!valor) p.adjuntoObligatorio = false;
    } else if (p.solicitado) {
      p[campo] = valor;
    }
  });
  renderPuertos();
}

// Devuelve los clientes que coinciden con clienteBusqueda, como pares {item, i} con el
// índice ORIGINAL en documentoConfigTemp.clientes (no el de la lista filtrada).
function clientesFiltrados() {
  const texto = clienteBusqueda.trim().toLowerCase();
  return documentoConfigTemp.clientes
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => !texto || item.nombre.toLowerCase().includes(texto));
}

function renderClientes() {
  const entradas = clientesFiltrados();
  const { pagina, totalPaginas, entradasPagina } = paginarEntradas(entradas, clientePaginaActual, clientePorPagina);
  clientePaginaActual = pagina;

  renderListaSolicitadoAdjunto('clientesList', entradasPagina, 'setDetalleCliente');
  actualizarCheckAllLista(entradas.map(e => e.item), 'checkAllClienteSolicitado', 'checkAllClienteAdjunto');
  document.getElementById('clientePaginacion').innerHTML =
    paginacionHTML(pagina, totalPaginas, clientePorPagina, 'cambiarPaginaClientes', 'cambiarTamanoPaginaClientes');
}

function buscarClientesDetalle(texto) {
  clienteBusqueda = texto;
  clientePaginaActual = 1;
  renderClientes();
}

function cambiarPaginaClientes(pagina) {
  clientePaginaActual = pagina;
  renderClientes();
}

function cambiarTamanoPaginaClientes(valor) {
  clientePorPagina = parseInt(valor);
  clientePaginaActual = 1;
  renderClientes();
}

function setDetalleCliente(i, campo, valor) {
  const c = documentoConfigTemp.clientes[i];
  c[campo] = valor;
  if (campo === 'solicitado' && !valor) c.adjuntoObligatorio = false;
  renderClientes();
}

// "Marcar todos" respeta el buscador: si hay texto escrito, solo afecta a los clientes
// que coinciden (lo esperable cuando se está filtrando una lista que crece con el tiempo).
function marcarColumnaClientes(campo, valor) {
  clientesFiltrados().forEach(({ item: c }) => {
    if (campo === 'solicitado') {
      c.solicitado = valor;
      if (!valor) c.adjuntoObligatorio = false;
    } else if (c.solicitado) {
      c[campo] = valor;
    }
  });
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
  documentoConfigTemp.estado = documentoActualId !== null ? document.getElementById('documentoConfigEstadoToggle').checked : true;
  documentoConfigTemp.tipoRol = tipoRol;
  documentoConfigTemp.rolesSeleccionados = rolesSeleccionados;
  documentoConfigTemp.variantes = documentoConfigTemp.variantes
    .map(v => ({ nombre: v.nombre.trim(), link: v.link.trim() }))
    .filter(v => v.nombre !== '');

  let idGuardado;
  if (documentoActualId !== null) {
    const idx = DOCUMENTOS.findIndex(d => d.id === documentoActualId);
    DOCUMENTOS[idx] = { ...documentoConfigTemp, id: documentoActualId };
    idGuardado = documentoActualId;
  } else {
    const nuevoId = Math.max(0, ...DOCUMENTOS.map(d => d.id)) + 1;
    DOCUMENTOS.unshift({ ...documentoConfigTemp, id: nuevoId });
    idGuardado = nuevoId;
  }

  renderDocumentosLista();
  cerrarModal('modalConfigDocumento');
  mostrarModalGuardado(documentoActualId !== null ? 'editar' : 'crear', null, () => {
    resaltarFilaNueva(document.querySelector(`#tbodyDocumentos [data-id="${idGuardado}"]`));
  });
}

renderDocumentosLista();
