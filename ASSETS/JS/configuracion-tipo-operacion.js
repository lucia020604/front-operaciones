// =================================================
// CONFIGURACION-TIPO-OPERACION.JS
// =================================================

let tipoOperacionEditandoFila = null;

// Operaciones por defecto y las actividades asociadas a cada una (catálogo en data-actividades.js)
const TIPOS_OPERACION_DEMO = [
  { nombre: 'Carga / Descarga de Buque', estado: 'activo', actividades: ['Arribo', 'Fondeo', 'Inicio de Maniobra', 'Término de Maniobra', 'Conexión', 'Inicio', 'Termino', 'Documentos firmados', 'Liquidación'] },
  { nombre: 'Bunker',                    estado: 'activo', actividades: ['Arribo', 'Fondeo', 'Inicio de Maniobra', 'Término de Maniobra', 'Conexión', 'Inicio', 'Termino', 'Documentos firmados', 'Desembarque', 'Retorno a base'] },
  { nombre: 'Inspección de Cisternas',   estado: 'activo', actividades: ['Inicio de guardia', 'Unidades atendidas'] },
  { nombre: 'Inventario',                estado: 'activo', actividades: ['Inicio', 'Termino de guardia', 'Cantidad de Tanques'] },
  { nombre: 'Muestreo',                  estado: 'activo', actividades: ['Inicio', 'Termino de guardia', 'Cantidad de tanques muestreada'] }
];

// ---------- SELECTOR DE ACTIVIDADES CON ORDEN (poblado desde el catálogo de Actividades) ----------
let tipoOperacionSeleccionActual = [];

function renderTipoOperacionCamposGrid() {
  const grid = document.getElementById('tipoOperacionCamposGrid');
  const actividades = actCargarCatalogo().filter(a => a.estado === 'activo');
  const noSeleccionadas = actividades
    .map(a => a.nombre)
    .filter(nombre => !tipoOperacionSeleccionActual.includes(nombre));
  const total = tipoOperacionSeleccionActual.length;

  const filas = [
    ...tipoOperacionSeleccionActual.map((nombre, i) => construirFilaActividadPicker(nombre, true, i + 1, total)),
    ...noSeleccionadas.map(nombre => construirFilaActividadPicker(nombre, false, null, total))
  ];

  grid.innerHTML = filas.join('');
  aplicarFiltroActividadesPicker();
}

function filtrarActividadesPicker() {
  aplicarFiltroActividadesPicker();
}

function limpiarFiltroActividadesPicker() {
  document.getElementById('tipoOperacionCamposBuscar').value = '';
  aplicarFiltroActividadesPicker();
}

function aplicarFiltroActividadesPicker() {
  const texto = (document.getElementById('tipoOperacionCamposBuscar').value || '').trim().toLowerCase();
  const filas = document.querySelectorAll('#tipoOperacionCamposGrid .actividad-row');
  let visibles = 0;

  filas.forEach(fila => {
    const coincide = fila.dataset.nombre.toLowerCase().includes(texto);
    fila.style.display = coincide ? '' : 'none';
    if (coincide) visibles++;
  });

  document.getElementById('tipoOperacionCamposSinResultados').style.display = visibles === 0 ? '' : 'none';
}

function construirFilaActividadPicker(nombre, marcada, orden, total) {
  return `
    <div class="actividad-row ${marcada ? 'is-checked' : ''}" data-nombre="${nombre}">
      <label class="actividad-check-label">
        <input type="checkbox" class="actividad-check" value="${nombre}" ${marcada ? 'checked' : ''}>
        <span class="actividad-nombre">${nombre}</span>
      </label>
      <div class="actividad-orden-controls" ${marcada ? '' : 'style="visibility:hidden"'}>
        <button type="button" class="orden-btn orden-up" title="Subir orden" ${!marcada || orden <= 1 ? 'disabled' : ''}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m18 15-6-6-6 6"/></svg>
        </button>
        <span class="actividad-orden-badge">${orden || ''}</span>
        <button type="button" class="orden-btn orden-down" title="Bajar orden" ${!marcada || orden >= total ? 'disabled' : ''}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
    </div>`;
}

function alternarActividadPicker(nombre, marcada) {
  if (marcada) {
    if (!tipoOperacionSeleccionActual.includes(nombre)) tipoOperacionSeleccionActual.push(nombre);
  } else {
    tipoOperacionSeleccionActual = tipoOperacionSeleccionActual.filter(n => n !== nombre);
  }
  renderTipoOperacionCamposGrid();
}

function moverActividadPicker(nombre, direccion) {
  const i = tipoOperacionSeleccionActual.indexOf(nombre);
  const j = i + direccion;
  if (i < 0 || j < 0 || j >= tipoOperacionSeleccionActual.length) return;
  [tipoOperacionSeleccionActual[i], tipoOperacionSeleccionActual[j]] = [tipoOperacionSeleccionActual[j], tipoOperacionSeleccionActual[i]];
  renderTipoOperacionCamposGrid();
}

document.addEventListener('change', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('actividad-check')) {
    alternarActividadPicker(e.target.value, e.target.checked);
  }
});

document.addEventListener('click', (e) => {
  const btnSubir = e.target.closest('.orden-up');
  const btnBajar = e.target.closest('.orden-down');
  if (!btnSubir && !btnBajar) return;
  const fila = e.target.closest('.actividad-row');
  if (!fila) return;
  moverActividadPicker(fila.dataset.nombre, btnSubir ? -1 : 1);
});

// ---------- MODAL CONFIGURACIÓN POR TIPO DE OPERACIÓN (Nuevo / Editar) ----------
function abrirModalNuevaTipoOperacion() {
  tipoOperacionEditandoFila = null;
  limpiarErroresModal('modalTipoOperacion');
  document.getElementById('modalTipoOperacionTitulo').textContent = 'Nueva Configuración';
  document.getElementById('tipoOperacionNombreInput').value = '';
  document.getElementById('tipoOperacionEstadoToggle').checked = true;
  actualizarTextoEstadoTipoOperacion();
  document.getElementById('tipoOperacionCamposBuscar').value = '';
  tipoOperacionSeleccionActual = [];
  renderTipoOperacionCamposGrid();

  document.getElementById('tipoOperacionEstadoGroup').style.display = 'none';
  document.getElementById('tipoOperacionFormGrid').style.gridTemplateColumns = '1fr';

  abrirModal('modalTipoOperacion');
}

function abrirModalEditarTipoOperacion(btn) {
  const fila = btn.closest('tr');
  tipoOperacionEditandoFila = fila;
  limpiarErroresModal('modalTipoOperacion');
  document.getElementById('modalTipoOperacionTitulo').textContent = 'Editar Configuración';

  document.getElementById('tipoOperacionNombreInput').value = fila.cells[1].textContent.trim();
  document.getElementById('tipoOperacionEstadoToggle').checked = fila.getAttribute('data-estado') === 'activo';
  actualizarTextoEstadoTipoOperacion();
  document.getElementById('tipoOperacionCamposBuscar').value = '';

  tipoOperacionSeleccionActual = (fila.dataset.campos || '').split(',').filter(Boolean);
  renderTipoOperacionCamposGrid();

  document.getElementById('tipoOperacionEstadoGroup').style.display = '';
  document.getElementById('tipoOperacionFormGrid').style.gridTemplateColumns = '';

  abrirModal('modalTipoOperacion');
}

function actualizarTextoEstadoTipoOperacion() {
  const toggle = document.getElementById('tipoOperacionEstadoToggle');
  const texto = document.getElementById('tipoOperacionEstadoTexto');
  texto.textContent = toggle.checked ? 'Activo' : 'Inactivo';
}

function grabarTipoOperacion() {
  const nombreInput = document.getElementById('tipoOperacionNombreInput');
  const estadoToggle = document.getElementById('tipoOperacionEstadoToggle');

  limpiarErroresModal('modalTipoOperacion');

  if (!nombreInput.value.trim()) {
    mostrarErrorCampo(nombreInput, 'Campo obligatorio');
    nombreInput.focus();
    return;
  }

  const nombre = nombreInput.value.trim();
  const estado = estadoToggle.checked ? 'activo' : 'inactivo';
  const camposSeleccionados = [...tipoOperacionSeleccionActual];

  if (tipoOperacionEditandoFila) {
    const fila = tipoOperacionEditandoFila;
    fila.cells[1].textContent = nombre;
    fila.cells[2].innerHTML = renderActividadesCelda(camposSeleccionados);
    fila.dataset.campos = camposSeleccionados.join(',');
    fila.setAttribute('data-estado', estado);
    const badge = fila.querySelector('.badge');
    badge.className = `badge badge-${estado}`;
    badge.innerHTML = `<span class="badge-dot"></span>${estado === 'activo' ? 'Activo' : 'Inactivo'}`;
    const btnAccion = fila.querySelector('.btn-accion:not(.btn-editar)');
    aplicarBotonEstadoTipoOperacion(btnAccion, estado);
    cerrarModal('modalTipoOperacion');
    mostrarModalGuardado('editar', null, () => resaltarFilaNueva(fila));
  } else {
    const tbody = document.getElementById('tiposOperacionTbody');
    const fila = crearFilaTipoOperacion(nombre, camposSeleccionados, estado);
    tbody.prepend(fila);
    renumerarTiposOperacion();
    cerrarModal('modalTipoOperacion');
    mostrarModalGuardado('crear', null, () => resaltarFilaNueva(fila));
  }
}

function renderActividadesCelda(actividades) {
  if (!actividades.length) return '<span class="actividades-vacio">Sin actividades</span>';

  const plural = actividades.length === 1 ? 'actividad' : 'actividades';
  return `
    <button type="button" class="actividades-count-badge" onclick="abrirModalVerActividades(this)">
      <span class="count-dot">${actividades.length}</span> ${plural}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    </button>`;
}

function abrirModalVerActividades(btn) {
  const fila = btn.closest('tr');
  const nombre = fila.cells[1].textContent.trim();
  const actividades = (fila.dataset.campos || '').split(',').filter(Boolean);

  document.getElementById('modalVerActividadesTitulo').textContent = `Actividades de ${nombre}`;
  document.getElementById('verActividadesLista').innerHTML = actividades.map(a => `<li>${a}</li>`).join('');

  abrirModal('modalVerActividades');
}

function crearFilaTipoOperacion(nombre, actividades, estado) {
  const fila = document.createElement('tr');
  fila.setAttribute('data-estado', estado);
  fila.dataset.campos = actividades.join(',');
  fila.innerHTML = `
    <td></td>
    <td class="razon-col"></td>
    <td></td>
    <td><span class="badge badge-${estado}"><span class="badge-dot"></span>${estado === 'activo' ? 'Activo' : 'Inactivo'}</span></td>
    <td class="opciones">
      <button class="btn-accion btn-editar" title="Editar" onclick="abrirModalEditarTipoOperacion(this)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion" title="Inactivar" onclick="cambiarEstadoTipoOperacion(this, 'activo')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </td>`;
  fila.cells[1].textContent = nombre;
  fila.cells[2].innerHTML = renderActividadesCelda(actividades);
  const btnAccion = fila.querySelector('.btn-accion:not(.btn-editar)');
  aplicarBotonEstadoTipoOperacion(btnAccion, estado);
  return fila;
}

function cargarTiposOperacionInicial() {
  const tbody = document.getElementById('tiposOperacionTbody');
  TIPOS_OPERACION_DEMO.forEach(op => tbody.appendChild(crearFilaTipoOperacion(op.nombre, op.actividades, op.estado)));
  renumerarTiposOperacion();
}

function aplicarBotonEstadoTipoOperacion(btn, estado) {
  if (estado === 'activo') {
    btn.className = 'btn-accion btn-inactivar';
    btn.setAttribute('onclick', "cambiarEstadoTipoOperacion(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
  } else {
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstadoTipoOperacion(this, 'inactivo')");
    btn.title = 'Activar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      </svg>`;
  }
}

function cambiarEstadoTipoOperacion(btn, estadoActual) {
  if (estadoActual === 'activo') {
    confirmarAccion('¿Está seguro de inactivar este registro?', () => ejecutarCambioEstadoTipoOperacion(btn, estadoActual));
  } else {
    ejecutarCambioEstadoTipoOperacion(btn, estadoActual);
  }
}

function ejecutarCambioEstadoTipoOperacion(btn, estadoActual) {
  const fila = btn.closest('tr');
  const badge = fila.querySelector('.badge');
  const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';

  fila.setAttribute('data-estado', nuevoEstado);
  badge.className = `badge badge-${nuevoEstado}`;
  badge.innerHTML = `<span class="badge-dot"></span>${nuevoEstado === 'activo' ? 'Activo' : 'Inactivo'}`;
  aplicarBotonEstadoTipoOperacion(btn, nuevoEstado);

  mostrarToast(nuevoEstado === 'activo' ? 'La configuración se activó con éxito' : 'La configuración se inactivó con éxito');
}

function filtrarTiposOperacion() {
  const texto = document.getElementById('searchTipoOperacion').value.toLowerCase();
  const estado = document.getElementById('filterEstadoTipoOperacion').value;
  const filas = document.querySelectorAll('#tiposOperacionTbody tr');

  filas.forEach(fila => {
    const nombre = fila.cells[1].textContent.toLowerCase();
    const campos = fila.cells[2].textContent.toLowerCase();
    const estadoFila = fila.getAttribute('data-estado');
    const coincideTexto = nombre.includes(texto) || campos.includes(texto);
    const coincideEstado = estado === 'todos' || estadoFila === estado;

    fila.style.display = coincideTexto && coincideEstado ? '' : 'none';
  });

  renumerarTiposOperacion();
}

function limpiarFiltrosTipoOperacion() {
  document.getElementById('searchTipoOperacion').value = '';
  document.getElementById('filterEstadoTipoOperacion').value = 'todos';
  filtrarTiposOperacion();
}

function renumerarTiposOperacion() {
  let n = 1;
  document.querySelectorAll('#tiposOperacionTbody tr').forEach(fila => {
    if (fila.style.display !== 'none') {
      fila.cells[0].textContent = n++;
    }
  });
}

// Listener para el toggle de estado en el modal de Configuración por Tipo de Operación
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'tipoOperacionEstadoToggle') {
    actualizarTextoEstadoTipoOperacion();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  cargarTiposOperacionInicial();
});
