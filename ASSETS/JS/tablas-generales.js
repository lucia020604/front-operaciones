// =================================================
// TABLAS-GENERALES.JS
// =================================================

let tablaEditandoFila = null;

// Categorías cuyo contenido vive en data-tablas-generales.js (localStorage)
// y por eso deben mantenerse sincronizadas cada vez que se crea/edita/cambia
// de estado una fila — a diferencia de Puertos/Monedas/Tipos de Documento,
// que solo existen como filas fijas de esta página.
const TG_CATALOGOS_SINCRONIZABLES = {
  'Productos': 'productosData',
  'Unidades de Medida': 'unidadesMedidaData'
};

function tgSincronizarCatalogo(nombreTabla) {
  const storageKey = TG_CATALOGOS_SINCRONIZABLES[nombreTabla];
  if (!storageKey) return;
  const filas = document.querySelectorAll(`#tablasTbody tr[data-tabla="${nombreTabla}"]`);
  const lista = [...filas].map((fila, i) => ({
    id: i + 1,
    nombre: fila.cells[1].textContent.trim(),
    descripcion: fila.cells[2].textContent.trim(),
    estado: fila.getAttribute('data-estado')
  }));
  localStorage.setItem(storageKey, JSON.stringify(lista));
}

function crearFilaTablaGeneral(nombreTabla, nombre, descripcion, estado) {
  const fila = document.createElement('tr');
  fila.setAttribute('data-tabla', nombreTabla);
  fila.setAttribute('data-estado', estado);
  fila.innerHTML = `
    <td></td>
    <td class="razon-col"></td>
    <td></td>
    <td>${estado === 'activo'
      ? '<span class="badge badge-activo"><span class="badge-dot"></span>Activo</span>'
      : '<span class="badge badge-inactivo"><span class="badge-dot"></span>Inactivo</span>'}</td>
    <td class="opciones">
      <button class="btn-accion btn-editar" title="Editar registro" onclick="abrirModalEditarTabla(this)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion ${estado === 'activo' ? 'btn-inactivar' : 'btn-activar'}" title="${estado === 'activo' ? 'Inactivar' : 'Activar'}" onclick="cambiarEstadoTabla(this, '${estado}')">
        ${estado === 'activo'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>'}
      </button>
    </td>`;
  fila.cells[1].textContent = nombre;
  fila.cells[2].textContent = descripcion;
  return fila;
}

function tgCargarCatalogosDinamicos() {
  const tbody = document.getElementById('tablasTbody');
  const productos = tgCargarCatalogo('productosData', PRODUCTOS_DEMO);
  const unidades = tgCargarCatalogo('unidadesMedidaData', UNIDADES_MEDIDA_DEMO);
  productos.forEach(p => tbody.appendChild(crearFilaTablaGeneral('Productos', p.nombre, p.descripcion, p.estado)));
  unidades.forEach(u => tbody.appendChild(crearFilaTablaGeneral('Unidades de Medida', u.nombre, u.descripcion, u.estado)));
}

function abrirModalNuevaTabla() {
  tablaEditandoFila = null;
  limpiarErroresModal('modalTabla');
  document.getElementById('modalTablaTitulo').textContent = 'Nueva Tabla General';
  document.getElementById('tablaGeneralInput').value = document.getElementById('filterTablaGeneral').value;
  document.getElementById('tablaNombreInput').value = '';
  document.getElementById('tablaDescripcionInput').value = '';
  abrirModal('modalTabla');
}

function abrirModalEditarTabla(btn) {
  const fila = btn.closest('tr');
  tablaEditandoFila = fila;
  limpiarErroresModal('modalTabla');
  document.getElementById('modalTablaTitulo').textContent = 'Editar Tabla General';
  document.getElementById('tablaGeneralInput').value = fila.getAttribute('data-tabla');
  document.getElementById('tablaNombreInput').value = fila.cells[1].textContent.trim();
  document.getElementById('tablaDescripcionInput').value = fila.cells[2].textContent.trim();
  abrirModal('modalTabla');
}

function grabarTablaGeneral() {
  const tablaInput       = document.getElementById('tablaGeneralInput');
  const nombreInput      = document.getElementById('tablaNombreInput');
  const descripcionInput = document.getElementById('tablaDescripcionInput');

  limpiarErroresModal('modalTabla');

  let valido = true;
  let primerCampoInvalido = null;
  [tablaInput, nombreInput].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  if (!valido) {
    primerCampoInvalido.focus();
    return;
  }

  const tablaSeleccionada = tablaInput.value;

  if (tablaEditandoFila) {
    tablaEditandoFila.setAttribute('data-tabla', tablaSeleccionada);
    tablaEditandoFila.cells[1].textContent = nombreInput.value.trim();
    tablaEditandoFila.cells[2].textContent = descripcionInput.value.trim();
    cerrarModal('modalTabla');
    mostrarToast('El registro se editó con éxito');
  } else {
    const tbody = document.getElementById('tablasTbody');
    const fila = crearFilaTablaGeneral(tablaSeleccionada, nombreInput.value.trim(), descripcionInput.value.trim(), 'activo');
    tbody.appendChild(fila);
    cerrarModal('modalTabla');
    mostrarToast('El registro se creó con éxito');
  }

  tgSincronizarCatalogo(tablaSeleccionada);

  // El registro se incorpora a la tabla seleccionada y se visualiza en la pantalla de consulta
  document.getElementById('filterTablaGeneral').value = tablaSeleccionada;
  document.getElementById('searchTabla').value = '';
  filtrarTablas();
}

function renumerarTablas() {
  let n = 1;
  document.querySelectorAll('#tablasTbody tr').forEach(fila => {
    if (fila.style.display !== 'none') {
      fila.cells[0].textContent = n++;
    }
  });
}

function cambiarEstadoTabla(btn, estadoActual) {
  if (estadoActual === 'activo') {
    confirmarAccion('¿Está seguro de inactivar este registro?', () => ejecutarCambioEstadoTabla(btn, estadoActual));
  } else {
    ejecutarCambioEstadoTabla(btn, estadoActual);
  }
}

function ejecutarCambioEstadoTabla(btn, estadoActual) {
  const fila = btn.closest('tr');
  const badge = fila.querySelector('.badge');

  if (estadoActual === 'activo') {
    fila.setAttribute('data-estado', 'inactivo');
    badge.className = 'badge badge-inactivo';
    badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstadoTabla(this, 'inactivo')");
    btn.title = 'Activar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      </svg>`;
    mostrarToast('El registro se inactivó con éxito');
  } else {
    fila.setAttribute('data-estado', 'activo');
    badge.className = 'badge badge-activo';
    badge.innerHTML = '<span class="badge-dot"></span>Activo';
    btn.className = 'btn-accion btn-inactivar';
    btn.setAttribute('onclick', "cambiarEstadoTabla(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
    mostrarToast('El registro se activó con éxito');
  }

  tgSincronizarCatalogo(fila.getAttribute('data-tabla'));
}

// Muestra solo los registros de la tabla general seleccionada, filtrados por nombre
function filtrarTablas() {
  const tabla  = document.getElementById('filterTablaGeneral').value;
  const texto  = document.getElementById('searchTabla').value.toLowerCase();
  const estado = document.getElementById('filterEstadoTabla').value;
  const filas  = document.querySelectorAll('#tablasTbody tr');

  filas.forEach(fila => {
    const nombre         = fila.cells[1].textContent.toLowerCase();
    const tablaFila      = fila.getAttribute('data-tabla');
    const estadoFila     = fila.getAttribute('data-estado');
    const coincideTabla  = tablaFila === tabla;
    const coincideTexto  = nombre.includes(texto);
    const coincideEstado = estado === 'todos' || estadoFila === estado;

    fila.style.display = coincideTabla && coincideTexto && coincideEstado ? '' : 'none';
  });

  renumerarTablas();
}

// Limpia el texto buscado y el estado, conservando la tabla general seleccionada
function limpiarFiltrosTabla() {
  document.getElementById('searchTabla').value = '';
  document.getElementById('filterEstadoTabla').value = 'todos';
  filtrarTablas();
}

document.addEventListener('DOMContentLoaded', () => {
  tgCargarCatalogosDinamicos();
  filtrarTablas();
});
