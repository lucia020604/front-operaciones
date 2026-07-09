// =================================================
// CLIENTE.JS
// =================================================

let contactoEditando = null; // <tr> del contacto en edición, o null si es nuevo
let clienteEditandoFila = null; // <tr> del cliente en edición, o null si es nuevo cliente

// Solo permite dígitos, limitados a un máximo de caracteres (ej. RUC)
function soloEnteroMax(input, max) {
  input.value = input.value.replace(/[^0-9]/g, '').slice(0, max);
}

function contarContactos() {
  return document.querySelectorAll('#contactosTbody tr:not(.contacts-empty-row)').length;
}

function actualizarVacioContactos() {
  const tbody = document.getElementById('contactosTbody');
  const vacio = tbody.querySelector('.contacts-empty-row');
  if (contarContactos() === 0) {
    if (!vacio) {
      tbody.insertAdjacentHTML('beforeend', '<tr class="contacts-empty-row"><td class="contacts-empty" colspan="6">Sin contactos agregados</td></tr>');
    }
  } else if (vacio) {
    vacio.remove();
  }
}

// ---------- MODAL CLIENTE (Nuevo / Editar) ----------
function abrirModalNuevoCliente() {
  clienteEditandoFila = null;
  limpiarErroresModal('modalCliente');
  document.getElementById('modalClienteTitulo').textContent = 'Nuevo Cliente';
  document.getElementById('clienteRazonInput').value = '';
  document.getElementById('clienteDireccionInput').value = '';
  document.getElementById('clienteCorreoInput').value = '';
  document.getElementById('clienteTelefonoInput').value = '';
  document.getElementById('clienteRucInput').value = '';
  document.getElementById('clientePaisInput').value = '';
  document.getElementById('contactosTbody').innerHTML = '';
  actualizarVacioContactos();
  abrirModal('modalCliente');
}

function abrirModalEditarCliente(btn) {
  const fila = btn.closest('tr');
  clienteEditandoFila = fila;
  limpiarErroresModal('modalCliente');
  document.getElementById('modalClienteTitulo').textContent = 'Editar Cliente';

  document.getElementById('clienteRazonInput').value = fila.cells[1].textContent.trim();
  document.getElementById('clienteCorreoInput').value = fila.cells[2].textContent.trim();
  document.getElementById('clienteRucInput').value = fila.cells[3].textContent.trim();
  document.getElementById('clientePaisInput').value = fila.cells[4].textContent.trim();
  document.getElementById('clienteDireccionInput').value = fila.dataset.direccion || '';
  document.getElementById('clienteTelefonoInput').value = fila.dataset.telefono || '';

  document.getElementById('contactosTbody').innerHTML = fila.dataset.contactos || '';
  actualizarVacioContactos();

  abrirModal('modalCliente');
}

function guardarCliente() {
  const razonInput = document.getElementById('clienteRazonInput');
  const direccionInput = document.getElementById('clienteDireccionInput');
  const correoInput = document.getElementById('clienteCorreoInput');
  const telefonoInput = document.getElementById('clienteTelefonoInput');
  const rucInput = document.getElementById('clienteRucInput');

  limpiarErroresModal('modalCliente');

  let valido = true;
  let primerCampoInvalido = null;
  [razonInput, direccionInput, correoInput].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  if (rucInput.value.trim() && rucInput.value.trim().length > 11) {
    mostrarErrorCampo(rucInput, 'Máximo 11 números');
    if (!primerCampoInvalido) primerCampoInvalido = rucInput;
    valido = false;
  }

  if (!valido) {
    primerCampoInvalido.focus();
    return;
  }

  const paisInput = document.getElementById('clientePaisInput');
  const contactosHtml = document.getElementById('contactosTbody').innerHTML;
  const datos = {
    razon: razonInput.value.trim(),
    correo: correoInput.value.trim(),
    ruc: rucInput.value.trim(),
    pais: paisInput.value,
    direccion: direccionInput.value.trim(),
    telefono: telefonoInput.value.trim(),
    contactosHtml
  };

  if (clienteEditandoFila) {
    aplicarDatosFilaCliente(clienteEditandoFila, datos);
    cerrarModal('modalCliente');
    mostrarToast('El cliente se editó con éxito');
  } else {
    const tbody = document.getElementById('clientesTbody');
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td></td>
      <td class="razon-col"></td>
      <td class="email-col"></td>
      <td></td>
      <td></td>
      <td>
        <label class="switch-wrap switch-table">
          <input type="checkbox" checked onchange="toggleEstadoCliente(this)">
          <span class="switch-track"></span>
        </label>
      </td>
      <td class="opciones">
        <button class="btn-accion btn-editar" title="Editar cliente" onclick="abrirModalEditarCliente(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
        <button class="btn-accion btn-eliminar" title="Eliminar cliente" onclick="eliminarCliente(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </td>`;
    tbody.appendChild(fila);
    aplicarDatosFilaCliente(fila, datos);
    renumerarClientes();
    cerrarModal('modalCliente');
    mostrarToast('El cliente se creó con éxito');
  }
}

function aplicarDatosFilaCliente(fila, datos) {
  fila.cells[1].textContent = datos.razon;
  fila.cells[2].textContent = datos.correo;
  fila.cells[3].textContent = datos.ruc;
  fila.cells[4].textContent = datos.pais;
  fila.dataset.direccion = datos.direccion;
  fila.dataset.telefono = datos.telefono;
  fila.dataset.contactos = datos.contactosHtml;
}

function renumerarClientes() {
  document.querySelectorAll('#clientesTbody tr').forEach((fila, i) => {
    fila.cells[0].textContent = i + 1;
  });
}

function eliminarCliente(btn) {
  btn.closest('tr').remove();
  renumerarClientes();
  mostrarToast('El cliente se eliminó con éxito');
}

function toggleEstadoCliente(checkbox) {
  mostrarToast(checkbox.checked ? 'El cliente se activó con éxito' : 'El cliente se inactivó con éxito');
}

function limpiarFiltrosCliente() {
  document.getElementById('searchCliente').value = '';
  document.getElementById('filterPaisCliente').value = '';
}

// ---------- MODAL CONTACTO (dentro de Cliente) ----------
function abrirModalContacto() {
  contactoEditando = null;
  limpiarErroresModal('modalContacto');
  document.getElementById('modalContactoTitulo').textContent = 'Agregar Contacto';
  document.getElementById('contactoNombresInput').value = '';
  document.getElementById('contactoApellidosInput').value = '';
  document.getElementById('contactoEmailInput').value = '';
  document.getElementById('contactoTelefonoInput').value = '';
  abrirModal('modalContacto');
}

function editarContacto(btn) {
  const fila = btn.closest('tr');
  contactoEditando = fila;
  limpiarErroresModal('modalContacto');
  document.getElementById('modalContactoTitulo').textContent = 'Editar Contacto';
  document.getElementById('contactoNombresInput').value = fila.dataset.nombres || '';
  document.getElementById('contactoApellidosInput').value = fila.dataset.apellidos || '';
  document.getElementById('contactoEmailInput').value = fila.cells[2].textContent.trim();
  document.getElementById('contactoTelefonoInput').value = fila.cells[3].textContent.trim();
  abrirModal('modalContacto');
}

function guardarContacto() {
  const nombresInput = document.getElementById('contactoNombresInput');
  const apellidosInput = document.getElementById('contactoApellidosInput');
  const emailInput = document.getElementById('contactoEmailInput');
  const telefonoInput = document.getElementById('contactoTelefonoInput');

  limpiarErroresModal('modalContacto');

  let valido = true;
  let primerCampoInvalido = null;
  [nombresInput, apellidosInput, emailInput, telefonoInput].forEach(input => {
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

  const nombres = nombresInput.value.trim();
  const apellidos = apellidosInput.value.trim();
  const nombreCompleto = `${nombres} ${apellidos}`.trim();

  const tbody = document.getElementById('contactosTbody');

  if (contactoEditando) {
    contactoEditando.dataset.nombres = nombres;
    contactoEditando.dataset.apellidos = apellidos;
    contactoEditando.cells[1].textContent = nombreCompleto;
    contactoEditando.cells[2].textContent = emailInput.value.trim();
    contactoEditando.cells[3].textContent = telefonoInput.value.trim();
  } else {
    const fila = document.createElement('tr');
    fila.dataset.nombres = nombres;
    fila.dataset.apellidos = apellidos;
    fila.innerHTML = `
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td><input type="checkbox" class="principal-check" onchange="marcarContactoPrincipal(this)"></td>
      <td class="opciones">
        <button type="button" class="btn-accion btn-editar" title="Editar contacto" onclick="editarContacto(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
        <button type="button" class="btn-accion btn-eliminar" title="Eliminar contacto" onclick="eliminarContacto(this)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
        </button>
      </td>`;
    fila.cells[1].textContent = nombreCompleto;
    fila.cells[2].textContent = emailInput.value.trim();
    fila.cells[3].textContent = telefonoInput.value.trim();
    tbody.appendChild(fila);
  }

  renumerarContactos();
  actualizarVacioContactos();
  cerrarModal('modalContacto');
  mostrarToast('El contacto se guardó con éxito');
}

function eliminarContacto(btn) {
  btn.closest('tr').remove();
  renumerarContactos();
  actualizarVacioContactos();
  mostrarToast('El contacto se eliminó con éxito');
}

function renumerarContactos() {
  document.querySelectorAll('#contactosTbody tr:not(.contacts-empty-row)').forEach((fila, i) => {
    fila.cells[0].textContent = i + 1;
  });
}

// Solo un contacto puede ser marcado como principal
function marcarContactoPrincipal(checkbox) {
  if (!checkbox.checked) return;
  document.querySelectorAll('#contactosTbody .principal-check').forEach(chk => {
    if (chk !== checkbox) chk.checked = false;
  });
}
