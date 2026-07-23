// =================================================
// ROLES.JS
// =================================================

function actualizarTextoEstadoRol() {
  const toggle = document.getElementById('estadoRolToggle');
  const texto  = document.getElementById('estadoRolTexto');
  texto.textContent = toggle.checked ? 'Activo' : 'Inactivo';
}

// Muestra/oculta la configuración de permisos según la categoría del rol
function actualizarPermisosPorCategoria() {
  const categoria = document.getElementById('inputCategoriaRol').value;
  const seccion   = document.getElementById('permisosSeccionRol');
  const esOperativo = categoria === 'Operativo';

  seccion.style.display = esOperativo ? 'none' : '';
  if (esOperativo) {
    seccion.querySelectorAll('.chk-permiso').forEach(chk => chk.checked = false);
  }

  limpiarErrorCampo(document.getElementById('permisosListRol'));
}

// Quita el error de "acceso al sistema" apenas se marca un permiso
document.addEventListener('change', (e) => {
  if (e.target && e.target.classList.contains('chk-permiso') && e.target.checked) {
    limpiarErrorCampo(document.getElementById('permisosListRol'));
  }
});

// Abre el modal en modo "Nuevo Rol" — todo rol nuevo se crea en estado Activo, por eso no se muestra el campo Estado
function abrirModalNuevo() {
  limpiarErroresModal('modalNuevo');
  document.getElementById('modalRolTitle').textContent = 'Nuevo Rol';
  document.getElementById('inputNombreRol').value = '';
  document.querySelectorAll('#modalNuevo .chk-permiso').forEach(chk => chk.checked = false);
  document.getElementById('inputSolicitarDocRol').checked = true;

  document.getElementById('grupoEstadoRol').style.display = 'none';

  document.getElementById('inputCategoriaRol').value = 'Administrativo';
  actualizarPermisosPorCategoria();

  document.getElementById('modalNuevo').dataset.modo = 'crear';
  abrirModal('modalNuevo');
}

// Abre el modal en modo "Editar Rol" — Estado editable con switch
function abrirModalEditar(btn) {
  const fila   = btn.closest('tr');
  const nombre = fila.cells[1].textContent.trim();
  const estado = fila.getAttribute('data-estado'); // 'activo' | 'inactivo'

  const categoria = fila.getAttribute('data-categoria') || 'Administrativo';

  document.getElementById('modalRolTitle').textContent = 'Editar Rol';
  document.getElementById('inputNombreRol').value = nombre;

  document.getElementById('grupoEstadoRol').style.display = '';
  document.getElementById('estadoRolBadge').style.display = 'none';
  document.getElementById('estadoRolSwitch').style.display = 'flex';
  document.getElementById('estadoRolToggle').checked = (estado === 'activo');
  actualizarTextoEstadoRol();

  document.getElementById('inputCategoriaRol').value = categoria;
  actualizarPermisosPorCategoria();

  const solicitarDoc = fila.getAttribute('data-solicitar-doc');
  document.getElementById('inputSolicitarDocRol').checked = solicitarDoc !== 'no';

  // Permisos de ejemplo marcados al editar (simulación)
  document.querySelectorAll('#modalNuevo .chk-permiso').forEach((chk, i) => {
    chk.checked = i < 5;
  });

  document.getElementById('modalNuevo').dataset.modo = 'editar';
  document.getElementById('modalNuevo').dataset.filaId = fila.cells[0].textContent.trim();
  abrirModal('modalNuevo');
}

// Guardar (crear o editar según el modo)
function guardarRol() {
  const modal = document.getElementById('modalNuevo');
  const modo  = modal.dataset.modo;
  const nombreInput = document.getElementById('inputNombreRol');
  const categoriaInput = document.getElementById('inputCategoriaRol');

  limpiarErroresModal('modalNuevo');

  if (!nombreInput.value.trim()) {
    mostrarErrorCampo(nombreInput, 'Campo obligatorio');
    nombreInput.focus();
    return;
  }

  if (!categoriaInput.value) {
    mostrarErrorCampo(categoriaInput, 'Campo obligatorio');
    categoriaInput.focus();
    return;
  }

  if (categoriaInput.value === 'Administrativo') {
    const permisosList = document.getElementById('permisosListRol');
    const algunPermiso = permisosList.querySelector('.chk-permiso:checked');
    if (!algunPermiso) {
      mostrarErrorCampo(permisosList, 'Selecciona al menos un acceso al sistema');
      return;
    }
  }

  if (modo === 'editar' && modal.dataset.filaId) {
    const estado = document.getElementById('estadoRolToggle').checked ? 'activo' : 'inactivo';
    const categoria = categoriaInput.value;
    const fila = [...document.querySelectorAll('#tbodyRoles tr')]
      .find(f => f.cells[0].textContent.trim() === modal.dataset.filaId);

    if (fila && fila.getAttribute('data-categoria') !== categoria) {
      fila.setAttribute('data-categoria', categoria);
      fila.cells[2].textContent = categoria;
    }

    if (fila) {
      const solicitarDoc = document.getElementById('inputSolicitarDocRol').checked ? 'si' : 'no';
      if ((fila.getAttribute('data-solicitar-doc') || 'si') !== solicitarDoc) {
        fila.setAttribute('data-solicitar-doc', solicitarDoc);
        const celdaDoc = fila.cells[4];
        if (solicitarDoc === 'no') {
          celdaDoc.innerHTML = '<svg class="icon-doc-no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
        } else {
          celdaDoc.innerHTML = '<svg class="icon-doc-si" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>';
        }
      }
    }

    if (fila && fila.getAttribute('data-estado') !== estado) {
      fila.setAttribute('data-estado', estado);
      const badge = fila.querySelector('.badge');
      const btnAccion = fila.querySelector('.btn-activar, .btn-inactivar');

      if (estado === 'inactivo') {
        badge.className = 'badge badge-inactivo';
        badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
        if (btnAccion) {
          btnAccion.className = 'btn-accion btn-activar';
          btnAccion.title = 'Activar';
          btnAccion.setAttribute('onclick', "cambiarEstado(this, 'inactivo')");
        }
      } else {
        badge.className = 'badge badge-activo';
        badge.innerHTML = '<span class="badge-dot"></span>Activo';
        if (btnAccion) {
          btnAccion.className = 'btn-accion btn-inactivar';
          btnAccion.title = 'Inactivar';
          btnAccion.setAttribute('onclick', "cambiarEstado(this, 'activo')");
        }
      }
    }

    cerrarModal('modalNuevo');
    mostrarModalGuardado('editar', null, () => resaltarFilaNueva(fila));
    return;
  }

  // Nuevo rol: siempre se crea Activo (el campo Estado va oculto en el modal de creación)
  const tbody = document.getElementById('tbodyRoles');
  const nombre = nombreInput.value.trim();
  const categoria = categoriaInput.value;
  const solicitarDoc = document.getElementById('inputSolicitarDocRol').checked ? 'si' : 'no';

  const fila = document.createElement('tr');
  fila.setAttribute('data-estado', 'activo');
  fila.setAttribute('data-categoria', categoria);
  fila.setAttribute('data-solicitar-doc', solicitarDoc);
  fila.innerHTML = `
    <td></td>
    <td>${nombre}</td>
    <td>${categoria}</td>
    <td><span class="badge badge-activo"><span class="badge-dot"></span>Activo</span></td>
    <td class="col-doc-flag">${solicitarDoc === 'no'
      ? '<svg class="icon-doc-no" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
      : '<svg class="icon-doc-si" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>'}</td>
    <td class="opciones">
      <button class="btn-accion btn-editar" title="Editar" onclick="abrirModalEditar(this)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion btn-inactivar" title="Inactivar" onclick="cambiarEstado(this, 'activo')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </td>`;
  tbody.prepend(fila);
  renumerarRoles();

  cerrarModal('modalNuevo');
  mostrarModalGuardado('crear', null, () => resaltarFilaNueva(fila));
}

// No existía un render centralizado de la tabla (las filas son estáticas en el HTML):
// se renumera la columna N° tras insertar un rol nuevo al inicio de la lista.
function renumerarRoles() {
  document.querySelectorAll('#tbodyRoles tr').forEach((fila, i) => {
    fila.cells[0].textContent = i + 1;
  });
}

// Filtrar tabla por búsqueda y estado
function filtrarRoles() {
  const texto  = document.getElementById('searchRol').value.toLowerCase();
  const estado = document.getElementById('filterEstado').value;
  const filas  = document.querySelectorAll('#tbodyRoles tr');

  filas.forEach(fila => {
    const nombre     = fila.cells[1].textContent.toLowerCase();
    const estadoFila = fila.getAttribute('data-estado');

    const coincideTexto  = nombre.includes(texto);
    const coincideEstado = estado === 'todos' || estadoFila === estado;

    fila.style.display = coincideTexto && coincideEstado ? '' : 'none';
  });
}

// Limpiar filtros y restaurar tabla a su estado inicial
function limpiarFiltrosRoles() {
  document.getElementById('searchRol').value = '';
  document.getElementById('filterEstado').value = 'todos';
  document.querySelectorAll('#tbodyRoles tr').forEach(fila => {
    fila.style.display = '';
  });
}

// Cambiar estado Activo <-> Inactivo
function cambiarEstado(btn, estadoActual) {
  if (estadoActual === 'activo') {
    confirmarAccion('¿Está seguro de inactivar este registro?', () => ejecutarCambioEstado(btn, estadoActual));
  } else {
    ejecutarCambioEstado(btn, estadoActual);
  }
}

function ejecutarCambioEstado(btn, estadoActual) {
  const fila  = btn.closest('tr');
  const badge = fila.querySelector('.badge');

  if (estadoActual === 'activo') {
    fila.setAttribute('data-estado', 'inactivo');
    badge.className = 'badge badge-inactivo';
    badge.innerHTML = '<span class="badge-dot"></span>Inactivo';
    btn.className = 'btn-accion btn-activar';
    btn.setAttribute('onclick', "cambiarEstado(this, 'inactivo')");
    btn.title = 'Activar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
      </svg>`;
    mostrarToast('El rol se inactivó con éxito');
  } else {
    fila.setAttribute('data-estado', 'activo');
    badge.className = 'badge badge-activo';
    badge.innerHTML = '<span class="badge-dot"></span>Activo';
    btn.className = 'btn-accion btn-inactivar';
    btn.setAttribute('onclick', "cambiarEstado(this, 'activo')");
    btn.title = 'Inactivar';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>`;
    mostrarToast('El rol se activó con éxito');
  }
}

// Listener del switch de estado en Editar Rol
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'estadoRolToggle') {
    actualizarTextoEstadoRol();
  }
});
