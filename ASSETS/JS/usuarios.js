// =================================================
// USUARIOS.JS
// =================================================

// Devuelve las categorías que desbloquea el valor elegido en el combo de Categoría.
// "Master" desbloquea Administrativo y Operativo a la vez (un Master puede elegir
// cualquier rol de ambos grupos), el resto de valores desbloquea solo su propia categoría.
function obtenerCategoriasSeleccionadas(categoriaSelectId) {
  const valor = document.getElementById(categoriaSelectId).value;
  if (valor === 'Master') return ['Administrativo', 'Operativo'];
  return valor ? [valor] : [];
}

// Muestra los roles cuya categoría esté entre las desbloqueadas por la categoría elegida,
// y solo desmarca los roles cuya categoría deja de estar desbloqueada.
function filtrarRolesPorCategoria(categoriaId = 'nuevoCategoriaInput', gridId = 'nuevoRolesGrid') {
  const categorias = obtenerCategoriasSeleccionadas(categoriaId);
  const grid = document.getElementById(gridId);

  grid.querySelectorAll('.check-inline').forEach(label => {
    const categoriasRol = label.dataset.categoria.split(',');
    const coincide = categoriasRol.some(c => categorias.includes(c));
    label.style.display = coincide ? '' : 'none';
    if (!coincide) label.querySelector('input[type="checkbox"]').checked = false;
  });

  // Oculta el encabezado de un grupo (Administrativo/Operativo) cuando ninguno
  // de sus roles quedó visible con la categoría elegida
  grid.querySelectorAll('.roles-grupo').forEach(grupo => {
    const hayVisibles = [...grupo.querySelectorAll('.check-inline')].some(label => label.style.display !== 'none');
    grupo.style.display = hayVisibles ? '' : 'none';
  });

  // "Configuración de acceso" solo aplica si Administrativo está entre las desbloqueadas
  const bloqueAcceso = document.getElementById(categoriaId).closest('.modal-body').querySelector('.form-group-checks');
  if (bloqueAcceso) {
    const mostrar = categorias.includes('Administrativo');
    bloqueAcceso.style.display = mostrar ? '' : 'none';
    if (!mostrar) bloqueAcceso.querySelectorAll('input[type="checkbox"]').forEach(chk => chk.checked = false);
  }
}

// Valida el tipo de imagen (jpg/jpeg/png) y muestra el indicador con el nombre del archivo adjuntado
function mostrarNombreFirma(input, archivoId, nombreId) {
  const archivoBox = document.getElementById(archivoId);
  const nombreSpan = document.getElementById(nombreId);
  const archivo = input.files[0];

  if (!archivo) {
    archivoBox.style.display = 'none';
    nombreSpan.textContent = '';
    return;
  }

  const tiposValidos = ['image/jpeg', 'image/png'];
  if (!tiposValidos.includes(archivo.type)) {
    mostrarToast('Solo se permiten imágenes JPG, JPEG o PNG');
    input.value = '';
    archivoBox.style.display = 'none';
    nombreSpan.textContent = '';
    return;
  }

  nombreSpan.textContent = archivo.name;
  archivoBox.style.display = 'inline-flex';
}

// Quita la imagen seleccionada y permite adjuntar otra
function quitarFirma(inputId, archivoId, nombreId) {
  document.getElementById(inputId).value = '';
  document.getElementById(archivoId).style.display = 'none';
  document.getElementById(nombreId).textContent = '';
}

function abrirModalNuevoUsuario() {
  limpiarErroresModal('modalNuevoUsuario');
  document.getElementById('nuevoCategoriaInput').value = 'Administrativo';
  document.getElementById('nuevoLocacionInput').value = '';
  filtrarRolesPorCategoria();
  quitarFirma('nuevoFirmaInput', 'nuevoFirmaArchivo', 'nuevoFirmaNombre');
  abrirModal('modalNuevoUsuario');
}

function guardarNuevoUsuario() {
  const usuarioInput  = document.getElementById('nuevoUsuarioInput');
  const nombreInput   = document.getElementById('nuevoNombreInput');
  const apellidoInput = document.getElementById('nuevoApellidoInput');
  const correoInput   = document.getElementById('nuevoCorreoInput');
  const p1Input       = document.getElementById('nuevaPass1');
  const p2Input       = document.getElementById('nuevaPass2');
  const categoriaInput = document.getElementById('nuevoCategoriaInput');
  const locacionInput = document.getElementById('nuevoLocacionInput');
  const rolesGrid     = document.getElementById('nuevoRolesGrid');

  limpiarErroresModal('modalNuevoUsuario');

  let valido = true;
  let primerCampoInvalido = null;

  if (obtenerCategoriasSeleccionadas('nuevoCategoriaInput').length === 0) {
    mostrarErrorCampo(categoriaInput, 'Selecciona al menos una categoría');
    primerCampoInvalido = categoriaInput;
    valido = false;
  }

  if (!locacionInput.value) {
    mostrarErrorCampo(locacionInput, 'Campo obligatorio');
    if (!primerCampoInvalido) primerCampoInvalido = locacionInput;
    valido = false;
  }

  [usuarioInput, nombreInput, apellidoInput, correoInput, p1Input, p2Input].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  if (valido && p1Input.value !== p2Input.value) {
    mostrarErrorCampo(p1Input, 'Las contraseñas no coinciden');
    mostrarErrorCampo(p2Input, 'Las contraseñas no coinciden');
    primerCampoInvalido = p1Input;
    valido = false;
  }

  const rolSeleccionado = rolesGrid.querySelector('input[type="checkbox"]:checked');
  if (!rolSeleccionado) {
    mostrarErrorCampo(rolesGrid, 'Selecciona al menos un rol');
    if (!primerCampoInvalido) primerCampoInvalido = rolesGrid.querySelector('input[type="checkbox"]');
    valido = false;
  }

  if (!valido) {
    primerCampoInvalido.focus();
    return;
  }

  cerrarModal('modalNuevoUsuario');
  mostrarToast('El usuario se creó con éxito');
}

// Abre el modal de edición precargando datos de la fila seleccionada
function abrirModalEditarUsuario(btn) {
  const fila = btn.closest('tr');
  const usuario  = fila.cells[0].textContent.trim();
  const nombre   = fila.cells[1].textContent.trim();
  const email    = fila.cells[2].textContent.trim();
  const estadoActivo = fila.querySelector('.badge').classList.contains('badge-activo');

  limpiarErroresModal('modalEditarUsuario');

  document.getElementById('editarUsuarioInput').value = usuario;

  const partes = nombre.split(' ');
  document.getElementById('editarNombresInput').value = partes.slice(0, 1).join(' ');
  document.getElementById('editarApellidosInput').value = partes.slice(1).join(' ');
  document.getElementById('editarCorreoInput').value = email;

  const toggle = document.getElementById('editarEstadoToggle');
  toggle.checked = estadoActivo;
  actualizarTextoEstado();

  const usuarioObj = obtenerUsuarioPorNombre(usuario);
  const rolesUsuario = usuarioObj ? obtenerIdsRolesUsuario(usuarioObj).map(obtenerRolPorId).filter(Boolean) : [];
  const categoriasUsuario = rolesUsuario.length
    ? [...new Set(rolesUsuario.flatMap(r => r.categorias))]
    : ['Administrativo'];
  document.getElementById('editarCategoriaInput').value = categoriasUsuario.length > 1 ? 'Master' : categoriasUsuario[0];
  document.getElementById('editarLocacionInput').value = usuarioObj && usuarioObj.locacionPrincipal ? usuarioObj.locacionPrincipal : '';
  filtrarRolesPorCategoria('editarCategoriaInput', 'editarRolesGrid');
  const nombresRoles = rolesUsuario.map(r => r.nombre);
  document.querySelectorAll('#editarRolesGrid .check-inline').forEach(label => {
    if (nombresRoles.includes(label.textContent.trim())) {
      label.querySelector('input[type="checkbox"]').checked = true;
    }
  });

  quitarFirma('editarFirmaInput', 'editarFirmaArchivo', 'editarFirmaNombre');

  document.getElementById('modalEditarUsuario').dataset.filaUsuario = usuario;
  abrirModal('modalEditarUsuario');
}

function actualizarTextoEstado() {
  const toggle = document.getElementById('editarEstadoToggle');
  const texto  = document.getElementById('editarEstadoTexto');
  texto.textContent = toggle.checked ? 'Activo' : 'Inactivo';
}

function guardarEditarUsuario() {
  const nombreInput    = document.getElementById('editarNombresInput');
  const apellidoInput  = document.getElementById('editarApellidosInput');
  const correoInput    = document.getElementById('editarCorreoInput');
  const categoriaInput = document.getElementById('editarCategoriaInput');
  const locacionInput  = document.getElementById('editarLocacionInput');
  const rolesGrid      = document.getElementById('editarRolesGrid');

  limpiarErroresModal('modalEditarUsuario');

  let valido = true;
  let primerCampoInvalido = null;

  if (obtenerCategoriasSeleccionadas('editarCategoriaInput').length === 0) {
    mostrarErrorCampo(categoriaInput, 'Selecciona al menos una categoría');
    primerCampoInvalido = categoriaInput;
    valido = false;
  }

  if (!locacionInput.value) {
    mostrarErrorCampo(locacionInput, 'Campo obligatorio');
    if (!primerCampoInvalido) primerCampoInvalido = locacionInput;
    valido = false;
  }

  [nombreInput, apellidoInput, correoInput].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  const rolSeleccionado = rolesGrid.querySelector('input[type="checkbox"]:checked');
  if (!rolSeleccionado) {
    mostrarErrorCampo(rolesGrid, 'Selecciona al menos un rol');
    if (!primerCampoInvalido) primerCampoInvalido = rolesGrid.querySelector('input[type="checkbox"]');
    valido = false;
  }

  if (!valido) {
    primerCampoInvalido.focus();
    return;
  }

  cerrarModal('modalEditarUsuario');
  mostrarToast('El usuario se editó con éxito');
}

// Abre el modal de Cambiar contraseña precargando los datos del usuario en edición
function abrirModalCambiarPasswordUsuario() {
  const nombres  = document.getElementById('editarNombresInput').value.trim();
  const apellidos = document.getElementById('editarApellidosInput').value.trim();
  const correo   = document.getElementById('editarCorreoInput').value.trim();
  const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ') || '—';

  const iniciales = (nombres.charAt(0) + apellidos.charAt(0)).toUpperCase() || '--';

  document.getElementById('cambiarPassAvatar').textContent = iniciales;
  document.getElementById('cambiarPassNombre').textContent = nombreCompleto;
  document.getElementById('cambiarPassCorreo').textContent = correo || '—';

  const p1 = document.getElementById('cambiarPassNueva');
  const p2 = document.getElementById('cambiarPassConfirmar');
  p1.value = '';
  p2.value = '';
  p1.type = 'password';
  p2.type = 'password';
  document.getElementById('cambiarPassNuevaIcon').innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  document.getElementById('cambiarPassConfirmarIcon').innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  medirFuerza('cambiarPassNueva', 'fuerzaCambiarPass');

  limpiarErroresModal('modalCambiarPasswordUsuario');
  abrirModal('modalCambiarPasswordUsuario');
}

// Valida la política de contraseña (mín. 8 caracteres, mayúscula, número y carácter especial) y confirma el cambio
function confirmarCambiarPasswordUsuario() {
  const p1Input = document.getElementById('cambiarPassNueva');
  const p2Input = document.getElementById('cambiarPassConfirmar');

  limpiarErroresModal('modalCambiarPasswordUsuario');

  const cumplePolitica = p1Input.value.length >= 8
    && /[A-Z]/.test(p1Input.value)
    && /[0-9]/.test(p1Input.value)
    && /[^A-Za-z0-9]/.test(p1Input.value);

  if (!p1Input.value) {
    mostrarErrorCampo(p1Input, 'Campo obligatorio');
    p1Input.focus();
    return;
  }

  if (!cumplePolitica) {
    mostrarErrorCampo(p1Input, 'Debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial');
    p1Input.focus();
    return;
  }

  if (!p2Input.value) {
    mostrarErrorCampo(p2Input, 'Campo obligatorio');
    p2Input.focus();
    return;
  }

  if (p1Input.value !== p2Input.value) {
    mostrarErrorCampo(p2Input, 'Las contraseñas no coinciden');
    p2Input.focus();
    return;
  }

  cerrarModal('modalCambiarPasswordUsuario');
  mostrarToast('La contraseña fue modificada. Se notificó al usuario.');
}

function abrirModalPass(usuario) {
  document.getElementById('modalUsuarioLabel').value = usuario;
  limpiarErroresModal('modalPass');
  document.getElementById('passModalNueva').value = '';
  document.getElementById('passModalConfirmar').value = '';
  abrirModal('modalPass');
}

function guardarPassword() {
  const p1Input = document.getElementById('passModalNueva');
  const p2Input = document.getElementById('passModalConfirmar');

  limpiarErroresModal('modalPass');

  const cumplePolitica = p1Input.value.length >= 8
    && /[A-Z]/.test(p1Input.value)
    && /[0-9]/.test(p1Input.value)
    && /[^A-Za-z0-9]/.test(p1Input.value);

  if (!p1Input.value) {
    mostrarErrorCampo(p1Input, 'Campo obligatorio');
    p1Input.focus();
    return;
  }

  if (!cumplePolitica) {
    mostrarErrorCampo(p1Input, 'Debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial');
    p1Input.focus();
    return;
  }

  if (!p2Input.value) {
    mostrarErrorCampo(p2Input, 'Campo obligatorio');
    p2Input.focus();
    return;
  }

  if (p1Input.value !== p2Input.value) {
    mostrarErrorCampo(p2Input, 'Las contraseñas no coinciden');
    p2Input.focus();
    return;
  }

  cerrarModal('modalPass');
  abrirModal('modalExito');
  mostrarToast('La contraseña se actualizó con éxito');
}

// =================================================
// DESCARGA: Excel (CSV) y PDF con Usuario, Nombre, Apellido, Email, Rol,
// Estado, Últ. Actualización de Contraseña y Categoría.
// Si el usuario tiene varios roles, se exporta una fila por cada rol.
// =================================================
function toggleDownloadDropdownUsuarios() {
  document.getElementById('downloadDropdownUsuarios').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.btn-download-wrap')) {
    const dd = document.getElementById('downloadDropdownUsuarios');
    if (dd) dd.classList.remove('open');
  }
});

// Devuelve los IDs de los roles de un usuario: usa rolesIds si el usuario
// tiene varios roles asignados, o el rolId único como arreglo de un solo elemento
function obtenerIdsRolesUsuario(u) {
  return u.rolesIds && u.rolesIds.length ? u.rolesIds : [u.rolId];
}

// Nombres de todos los roles de un usuario, unidos por ";" para mostrarlos
// en una sola celda de la tabla cuando el usuario tiene más de un rol
function obtenerNombresRolesUsuario(u) {
  return obtenerIdsRolesUsuario(u)
    .map(id => {
      const rol = obtenerRolPorId(id);
      return rol ? rol.nombre : '—';
    })
    .join('; ');
}

function obtenerFilasExportUsuarios() {
  const filas = [];

  USUARIOS_DEMO.forEach(u => {
    obtenerIdsRolesUsuario(u).forEach(rolId => {
      const rol = obtenerRolPorId(rolId);
      filas.push({
        usuario: u.usuario,
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        rol: rol ? rol.nombre : '—',
        estado: u.estado === 'activo' ? 'Activo' : 'Inactivo',
        ultimaActualizacion: u.ultimaActualizacion || '—',
        categoria: rol && rol.categorias ? rol.categorias.join(', ') : '—'
      });
    });
  });

  return filas;
}

function exportarUsuariosExcel() {
  const filas = obtenerFilasExportUsuarios();
  const headers = ['Usuario', 'Nombre', 'Apellido', 'Email', 'Rol', 'Estado', 'Últ. Actualización de Contraseña', 'Categoría'];

  const csv = [headers, ...filas.map(f => [f.usuario, f.nombre, f.apellido, f.email, f.rol, f.estado, f.ultimaActualizacion, f.categoria])]
    .map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom  = '﻿'; // BOM para que Excel abra UTF-8 correctamente
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'usuarios.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  document.getElementById('downloadDropdownUsuarios').classList.remove('open');
  mostrarToast('Exportación Excel descargada correctamente.');
}

function exportarUsuariosPDF() {
  const filas = obtenerFilasExportUsuarios();
  const filasHTML = filas.map(f => `
    <tr>
      <td>${f.usuario}</td>
      <td>${f.nombre}</td>
      <td>${f.apellido}</td>
      <td>${f.email}</td>
      <td>${f.rol}</td>
      <td>${f.estado}</td>
      <td>${f.ultimaActualizacion}</td>
      <td>${f.categoria}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Usuarios</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 12px; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 7px 10px; text-align: left;
             font-size: 9px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 7px 10px; border-bottom: 1px solid #eee; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <h2>Usuarios</h2>
    <table>
      <thead>
        <tr><th>Usuario</th><th>Nombre</th><th>Apellido</th><th>Email</th><th>Rol</th><th>Estado</th><th>Últ. Actualización de Contraseña</th><th>Categoría</th></tr>
      </thead>
      <tbody>${filasHTML}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();

  document.getElementById('downloadDropdownUsuarios').classList.remove('open');
}

function limpiarFiltrosUsuarios() {
  document.getElementById('searchUsuario').value = '';
  document.getElementById('filterRol').value = 'Todos los roles';
  document.getElementById('filterEstadoUsuario').value = 'Todos';
  document.getElementById('filterPassUsuario').value = 'Todos';
}

// =================================================
// TABLA DE USUARIOS: se renderiza desde la fuente única USUARIOS_DEMO
// =================================================
function estadoPassInfo(estadoPass) {
  if (estadoPass === 'porVencer') return { clase: 'badge-por-vencer', texto: 'Por vencer' };
  if (estadoPass === 'vencida') return { clase: 'badge-vencida', texto: 'Vencida' };
  return { clase: 'badge-vigente', texto: 'Vigente' };
}

function filaUsuarioHTML(u) {
  const estadoActivo = u.estado === 'activo';
  const pass = estadoPassInfo(u.estadoPass);

  return `
  <tr>
    <td class="user-col">${u.usuario}</td>
    <td>${u.nombre} ${u.apellido}</td>
    <td class="email-col">${u.email}</td>
    <td>${obtenerNombresRolesUsuario(u)}</td>
    <td><span class="badge ${estadoActivo ? 'badge-activo' : 'badge-inactivo'}"><span class="badge-dot"></span>${estadoActivo ? 'Activo' : 'Inactivo'}</span></td>
    <td>${u.fechaVenc || '—'}</td>
    <td><span class="badge ${pass.clase}"><span class="badge-dot"></span>${pass.texto}</span></td>
    <td>${u.ultimaActualizacion || '—'}</td>
    <td class="opciones">
      <button class="btn-accion btn-editar" title="Editar usuario" onclick="abrirModalEditarUsuario(this)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      <button class="btn-accion btn-pass" title="Cambiar contraseña" onclick="abrirModalPass('${u.usuario}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>
      </button>
      <button class="btn-accion ${estadoActivo ? 'btn-inactivar' : 'btn-activar'}" title="${estadoActivo ? 'Inactivar' : 'Activar'}" onclick="cambiarEstado(this, '${estadoActivo ? 'activo' : 'inactivo'}')">
        ${estadoActivo
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>'}
      </button>
    </td>
  </tr>`;
}

function renderTablaUsuarios() {
  const tbody = document.getElementById('tbodyUsuarios');
  if (!tbody) return;
  tbody.innerHTML = USUARIOS_DEMO.map(filaUsuarioHTML).join('');
}

document.addEventListener('DOMContentLoaded', renderTablaUsuarios);

// =================================================
// CONFIGURACIÓN DE VENCIMIENTO DE CONTRASEÑA (solo Administradores)
// =================================================
const CONFIG_PASSWORD_KEY = 'configVencimientoPassword';

document.addEventListener('DOMContentLoaded', () => {
  const btnConfig = document.getElementById('btnConfigPassword');
  const sesion = obtenerUsuarioActual();
  const rolSesion = sesion ? obtenerRolPorId(sesion.rolId) : null;
  if (btnConfig && rolSesion && rolSesion.nombre === 'Administrador') {
    btnConfig.style.display = '';
  }
});

// Solo permite dígitos enteros positivos en el campo (sin letras, símbolos, negativos ni decimales)
function soloEnteroPositivo(input) {
  input.value = input.value.replace(/[^0-9]/g, '');
}

function obtenerConfigPassword() {
  const guardada = localStorage.getItem(CONFIG_PASSWORD_KEY);
  return guardada ? JSON.parse(guardada) : null;
}

function abrirModalConfigPassword() {
  const config = obtenerConfigPassword();
  limpiarErroresModal('modalConfigPassword');
  document.getElementById('configDiasVigencia').value = config ? config.diasVigencia : '';
  document.getElementById('configDiasAviso').value = config ? config.diasAviso : '';
  abrirModal('modalConfigPassword');
}

function guardarConfigPassword() {
  const vigenciaInput = document.getElementById('configDiasVigencia');
  const avisoInput = document.getElementById('configDiasAviso');
  const diasVigencia = vigenciaInput.value.trim();
  const diasAviso = avisoInput.value.trim();

  limpiarErroresModal('modalConfigPassword');

  let valido = true;
  let primerCampoInvalido = null;
  const esEnteroPositivo = (valor) => /^[1-9][0-9]*$/.test(valor);

  [vigenciaInput, avisoInput].forEach(input => {
    const valor = input.value.trim();
    if (!valor) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    } else if (!esEnteroPositivo(valor)) {
      mostrarErrorCampo(input, 'Solo números enteros positivos');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  if (!valido) {
    primerCampoInvalido.focus();
    return;
  }

  const vigencia = parseInt(diasVigencia, 10);
  const aviso = parseInt(diasAviso, 10);

  if (aviso > vigencia) {
    mostrarErrorCampo(avisoInput, 'No puede ser mayor que la vigencia');
    avisoInput.focus();
    return;
  }

  localStorage.setItem(CONFIG_PASSWORD_KEY, JSON.stringify({ diasVigencia: vigencia, diasAviso: aviso }));

  cerrarModal('modalConfigPassword');
  mostrarToast('La configuración de vencimiento de contraseña se guardó con éxito');
}

// Listener para el toggle de estado en Editar Usuario
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'editarEstadoToggle') {
    actualizarTextoEstado();
  }
});

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
    mostrarToast('El usuario se inactivó con éxito');
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
    mostrarToast('El usuario se activó con éxito');
  }
}
