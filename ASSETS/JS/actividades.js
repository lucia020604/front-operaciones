// =================================================
// ACTIVIDADES.JS
// =================================================

let actividadEditandoFila = null;

const ACT_ETIQUETAS_TIPO = {
  fecha_hora: 'Fecha y Hora',
  numerico: 'Número',
  texto: 'Texto'
};

function actSincronizarCatalogo() {
  const filas = document.querySelectorAll('#actividadesTbody tr');
  const lista = [...filas].map((fila, i) => ({
    id: i + 1,
    nombre: fila.cells[1].textContent.trim(),
    descripcion: fila.cells[2].textContent.trim(),
    tipo: fila.getAttribute('data-tipo'),
    estado: fila.getAttribute('data-estado')
  }));
  actGuardarCatalogo(lista);
}

function crearFilaActividad(nombre, descripcion, tipo, estado) {
  const fila = document.createElement('tr');
  fila.setAttribute('data-tipo', tipo);
  fila.setAttribute('data-estado', estado);
  fila.innerHTML = `
    <td></td>
    <td class="razon-col"></td>
    <td></td>
    <td></td>
    <td>${estado === 'activo'
      ? '<span class="badge badge-activo"><span class="badge-dot"></span>Activo</span>'
      : '<span class="badge badge-inactivo"><span class="badge-dot"></span>Inactivo</span>'}</td>
    <td class="opciones">
      <button class="btn-accion btn-editar" title="Editar registro" onclick="abrirModalEditarActividad(this)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion ${estado === 'activo' ? 'btn-inactivar' : 'btn-activar'}" title="${estado === 'activo' ? 'Inactivar' : 'Activar'}" onclick="cambiarEstadoActividad(this, '${estado}')">
        ${estado === 'activo'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>'}
      </button>
    </td>`;
  fila.cells[1].textContent = nombre;
  fila.cells[2].textContent = descripcion;
  fila.cells[3].textContent = ACT_ETIQUETAS_TIPO[tipo] || tipo;
  return fila;
}

function actCargarCatalogoInicial() {
  const tbody = document.getElementById('actividadesTbody');
  const actividades = actCargarCatalogo();
  actividades.forEach(a => tbody.appendChild(crearFilaActividad(a.nombre, a.descripcion, a.tipo, a.estado)));
}

function abrirModalNuevaActividad() {
  actividadEditandoFila = null;
  limpiarErroresModal('modalActividad');
  document.getElementById('modalActividadTitulo').textContent = 'Nueva Actividad';
  document.getElementById('actividadNombreInput').value = '';
  document.getElementById('actividadDescripcionInput').value = '';
  document.getElementById('actividadTipoInput').value = '';
  abrirModal('modalActividad');
}

function abrirModalEditarActividad(btn) {
  const fila = btn.closest('tr');
  actividadEditandoFila = fila;
  limpiarErroresModal('modalActividad');
  document.getElementById('modalActividadTitulo').textContent = 'Editar Actividad';
  document.getElementById('actividadNombreInput').value = fila.cells[1].textContent.trim();
  document.getElementById('actividadDescripcionInput').value = fila.cells[2].textContent.trim();
  document.getElementById('actividadTipoInput').value = fila.getAttribute('data-tipo');
  abrirModal('modalActividad');
}

function grabarActividad() {
  const nombreInput      = document.getElementById('actividadNombreInput');
  const descripcionInput = document.getElementById('actividadDescripcionInput');
  const tipoInput        = document.getElementById('actividadTipoInput');

  limpiarErroresModal('modalActividad');

  let valido = true;
  let primerCampoInvalido = null;
  [nombreInput, tipoInput].forEach(input => {
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

  if (actividadEditandoFila) {
    actividadEditandoFila.setAttribute('data-tipo', tipoInput.value);
    actividadEditandoFila.cells[1].textContent = nombreInput.value.trim();
    actividadEditandoFila.cells[2].textContent = descripcionInput.value.trim();
    actividadEditandoFila.cells[3].textContent = ACT_ETIQUETAS_TIPO[tipoInput.value] || tipoInput.value;
    cerrarModal('modalActividad');
    mostrarModalGuardado('editar', null, () => resaltarFilaNueva(actividadEditandoFila));
  } else {
    const tbody = document.getElementById('actividadesTbody');
    const fila = crearFilaActividad(nombreInput.value.trim(), descripcionInput.value.trim(), tipoInput.value, 'activo');
    tbody.prepend(fila);
    cerrarModal('modalActividad');
    mostrarModalGuardado('crear', null, () => resaltarFilaNueva(fila));
  }

  actSincronizarCatalogo();
  filtrarActividades();
}

function renumerarActividades() {
  let n = 1;
  document.querySelectorAll('#actividadesTbody tr').forEach(fila => {
    if (fila.style.display !== 'none') {
      fila.cells[0].textContent = n++;
    }
  });
}

function cambiarEstadoActividad(btn, estadoActual) {
  if (estadoActual === 'activo') {
    confirmarAccion('¿Está seguro de inactivar este registro?', () => ejecutarCambioEstadoActividad(btn, estadoActual));
  } else {
    ejecutarCambioEstadoActividad(btn, estadoActual);
  }
}

function ejecutarCambioEstadoActividad(btn, estadoActual) {
  const fila = btn.closest('tr');
  const badge = fila.querySelector('.badge');

  if (estadoActual === 'activo') {
    fila.setAttribute('data-estado', 'inactivo');
    badge.className = 'badge badge-inactivo';
    badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstadoActividad(this, 'inactivo')");
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
    btn.setAttribute('onclick', "cambiarEstadoActividad(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
    mostrarToast('El registro se activó con éxito');
  }

  actSincronizarCatalogo();
}

function filtrarActividades() {
  const texto  = document.getElementById('searchActividad').value.toLowerCase();
  const estado = document.getElementById('filterEstadoActividad').value;
  const filas  = document.querySelectorAll('#actividadesTbody tr');

  filas.forEach(fila => {
    const nombre         = fila.cells[1].textContent.toLowerCase();
    const estadoFila     = fila.getAttribute('data-estado');
    const coincideTexto  = nombre.includes(texto);
    const coincideEstado = estado === 'todos' || estadoFila === estado;

    fila.style.display = coincideTexto && coincideEstado ? '' : 'none';
  });

  renumerarActividades();
}

function limpiarFiltrosActividad() {
  document.getElementById('searchActividad').value = '';
  document.getElementById('filterEstadoActividad').value = 'todos';
  filtrarActividades();
}

document.addEventListener('DOMContentLoaded', () => {
  actCargarCatalogoInicial();
  filtrarActividades();
});
