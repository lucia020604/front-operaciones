// =================================================
// INFORMACION-PROFESIONAL.JS
// =================================================

const PERFILES = {
  1: {
    nombre: 'Sandra', apellido: 'Echavarria', rol: 'Supervisor',
    fechaIngreso: '2022-03-01', aniosIntertek: '4', aniosExperiencia: '8', cumpleanos: '1990-05-14',
    dispViaje: true, lemonCard: 'LC-00214', lemonVenc: '2027-03-01',
    telefono: '+51 999 888 777', correo: 's.echavarria@intertek.com',
    direccion: 'Av. Principal 123, Lima', descripcion: 'Supervisora de operaciones de campo.',
    experiencia: [
      { cargo: 'Supervisora', empresa: 'Intertek Caleb Brett', periodo: '2022 - Actualidad' },
      { cargo: 'Analista', empresa: 'SGS', periodo: '2018 - 2022' }
    ],
    formacion: [{ institucion: 'Universidad Nacional Mayor de San Marcos', periodo: '2012 - 2017' }],
    idiomas: ['Inglés', 'Español'],
    habilidades: ['Microsoft Office', 'Liderazgo'],
    cambioResidencia: true,
    contratos: [
      { inicio: '2022-03-01', fin: '2023-02-28', archivo: 'contrato_2022.pdf' },
      { inicio: '2023-03-01', fin: '2024-02-29', archivo: 'contrato_2023.pdf' },
      { inicio: '2024-03-01', fin: '2026-12-31', archivo: 'contrato_2024.pdf' }
    ]
  },
  2: {
    nombre: 'Bandy', apellido: 'Jimenez', rol: 'Administrador',
    fechaIngreso: '2019-07-15', aniosIntertek: '', aniosExperiencia: '6', cumpleanos: '1988-11-02',
    dispViaje: false, lemonCard: '', lemonVenc: '',
    telefono: '+51 988 111 222', correo: 'b.jimenez@externo.com',
    direccion: 'Av. Los Álamos 456, Callao', descripcion: 'Colaborador externo, soporte administrativo.',
    experiencia: [{ cargo: 'Administrador', empresa: 'Consultora Externa S.A.C.', periodo: '2019 - Actualidad' }],
    formacion: [{ institucion: 'Instituto Superior de Administración', periodo: '2010 - 2013' }],
    idiomas: ['Español'],
    habilidades: ['Gestión documentaria'],
    cambioResidencia: false,
    contratos: [
      { inicio: '2019-07-15', fin: '2025-01-31', archivo: 'contrato_2019.pdf' }
    ]
  },
  3: {
    nombre: 'Josue', apellido: 'Ramos', rol: 'Jefe de Area',
    fechaIngreso: '2021-01-10', aniosIntertek: '5', aniosExperiencia: '9', cumpleanos: '1985-09-23',
    dispViaje: true, lemonCard: 'LC-00187', lemonVenc: '2027-01-10',
    telefono: '+51 977 333 444', correo: 'j.ramos@intertek.com',
    direccion: 'Jr. Las Flores 789, Lima', descripcion: 'Jefe de área de operaciones portuarias.',
    experiencia: [{ cargo: 'Jefe de Área', empresa: 'Intertek Caleb Brett', periodo: '2021 - Actualidad' }],
    formacion: [{ institucion: 'Universidad de Lima', periodo: '2004 - 2009' }],
    idiomas: ['Inglés', 'Español', 'Portugués'],
    habilidades: ['Microsoft Office', 'Gestión de equipos'],
    cambioResidencia: true,
    contratos: [
      { inicio: '2021-01-10', fin: '2026-12-31', archivo: 'contrato_2021.pdf' }
    ]
  }
};

let perfilActualId = null;
let contratoEditIndex = null;
let contratoArchivoTemp = '';

// El estado del contrato se calcula siempre contra la fecha actual (no se guarda como flag manual),
// así nunca queda desincronizado si nadie actualiza el registro a tiempo.
const HOY = new Date().toISOString().slice(0, 10);
function esContratoVigente(c) {
  return c.fin >= HOY;
}

// =================================================
// FILTROS
// =================================================
function filtrarPerfiles() {
  const texto = document.getElementById('searchPerfil').value.toLowerCase();
  const rol = document.getElementById('filterRolPerfil').value;
  const tipo = document.getElementById('filterTipoPerfil').value;
  const doc = document.getElementById('filterDocPerfil').value;
  const soloColab = document.getElementById('filterColaborador').checked;

  document.querySelectorAll('#tbodyPerfiles tr').forEach(fila => {
    const nombreCompleto = (fila.cells[1].textContent + ' ' + fila.cells[2].textContent).toLowerCase();
    const filaRol = fila.dataset.rol;
    const filaTipo = fila.dataset.tipo;
    const filaDoc = fila.dataset.doc;
    const filaColab = fila.dataset.colaborador === 'true';

    const ok =
      nombreCompleto.includes(texto) &&
      (rol === 'todos' || filaRol === rol) &&
      (tipo === 'todos' || filaTipo === tipo) &&
      (doc === 'todos' || filaDoc === doc) &&
      (!soloColab || filaColab);

    fila.style.display = ok ? '' : 'none';
  });
}

function limpiarFiltrosPerfiles() {
  document.getElementById('searchPerfil').value = '';
  document.getElementById('filterRolPerfil').value = 'todos';
  document.getElementById('filterTipoPerfil').value = 'todos';
  document.getElementById('filterDocPerfil').value = 'todos';
  document.getElementById('filterColaborador').checked = false;
  document.querySelectorAll('#tbodyPerfiles tr').forEach(fila => { fila.style.display = ''; });
}

// =================================================
// TABS DEL MODAL
// =================================================
function cambiarTabPerfil(btn, tab) {
  document.querySelectorAll('.perfil-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.perfil-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector(`.perfil-panel[data-panel="${tab}"]`).classList.add('active');
}

// =================================================
// ABRIR / RENDER PERFIL
// =================================================
function abrirPerfil(btn) {
  const fila = btn.closest('tr');
  perfilActualId = fila.dataset.id;
  const p = PERFILES[perfilActualId];

  document.getElementById('perfilNombreTitulo').textContent = `Información Profesional — ${p.nombre} ${p.apellido}`;

  document.querySelectorAll('.perfil-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.perfil-panel').forEach((pn, i) => pn.classList.toggle('active', i === 0));

  renderPerfilPersonal(p);
  renderContratos(p);
  desactivarEdicionPerfil();
  abrirModal('modalPerfil');
}

function renderPerfilPersonal(p) {
  document.getElementById('pfFechaIngreso').value = p.fechaIngreso;
  document.getElementById('pfAniosIntertek').value = p.aniosIntertek;
  document.getElementById('pfAniosExperiencia').value = p.aniosExperiencia;
  document.getElementById('pfCumpleanos').value = p.cumpleanos;
  document.getElementById('pfDispViajeMov').checked = p.dispViaje;
  document.getElementById('pfLemonCard').value = p.lemonCard;
  document.getElementById('pfLemonVenc').value = p.lemonVenc;

  document.getElementById('pfTelefono').value = p.telefono;
  document.getElementById('pfCorreo').value = p.correo;
  document.getElementById('pfDireccion').value = p.direccion;
  document.getElementById('pfDescripcion').value = p.descripcion;

  const expList = document.getElementById('pfExperienciaList');
  expList.innerHTML = '';
  p.experiencia.forEach(e => expList.appendChild(crearFilaExperiencia(e)));

  const eduList = document.getElementById('pfFormacionList');
  eduList.innerHTML = '';
  p.formacion.forEach(e => eduList.appendChild(crearFilaFormacion(e)));

  renderChips('pfIdiomasList', p.idiomas);
  renderChips('pfHabilidadesList', p.habilidades);

  document.getElementById('pfCambioResidencia').checked = p.cambioResidencia;
}

function crearFilaExperiencia(e) {
  const div = document.createElement('div');
  div.className = 'exp-entry';
  div.innerHTML = `
    <input type="text" class="modal-input" placeholder="Cargo" value="${e ? e.cargo : ''}">
    <input type="text" class="modal-input" placeholder="Empresa" value="${e ? e.empresa : ''}">
    <input type="text" class="modal-input" placeholder="Período" value="${e ? e.periodo : ''}">
    <button type="button" class="btn-remove-entry" title="Eliminar" onclick="this.closest('.exp-entry').remove()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
    </button>`;
  return div;
}

function crearFilaFormacion(e) {
  const div = document.createElement('div');
  div.className = 'edu-entry';
  div.innerHTML = `
    <input type="text" class="modal-input" placeholder="Institución" value="${e ? e.institucion : ''}">
    <input type="text" class="modal-input" placeholder="Período" value="${e ? e.periodo : ''}">
    <button type="button" class="btn-remove-entry" title="Eliminar" onclick="this.closest('.edu-entry').remove()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
    </button>`;
  return div;
}

function agregarExperiencia() {
  document.getElementById('pfExperienciaList').appendChild(crearFilaExperiencia(null));
}

function agregarFormacion() {
  document.getElementById('pfFormacionList').appendChild(crearFilaFormacion(null));
}

function renderChips(contenedorId, items) {
  const cont = document.getElementById(contenedorId);
  cont.innerHTML = '';
  items.forEach(texto => cont.appendChild(crearChip(texto)));
}

function crearChip(texto) {
  const span = document.createElement('span');
  span.className = 'chip-tag';
  span.innerHTML = `<span>${texto}</span>
    <button type="button" onclick="this.closest('.chip-tag').remove()">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>`;
  return span;
}

function agregarChipDesdeInput(inputId, listaId) {
  const input = document.getElementById(inputId);
  const valor = input.value.trim();
  if (!valor) return;
  document.getElementById(listaId).appendChild(crearChip(valor));
  input.value = '';
  input.focus();
}

// =================================================
// CONTRATOS
// =================================================
function formatearFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function renderContratos(p) {
  const tbody = document.getElementById('pfContratosList');
  tbody.innerHTML = '';

  if (!p.contratos.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="contrato-vacio">Aún no se registraron contratos</td></tr>';
  } else {
    p.contratos.forEach((c, i) => {
      const esVigente = esContratoVigente(c);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${formatearFecha(c.inicio)}</td>
        <td>${formatearFecha(c.fin)}</td>
        <td>${esVigente
          ? '<span class="badge badge-vigente"><span class="badge-dot"></span>Vigente</span>'
          : '<span class="badge badge-vencida"><span class="badge-dot"></span>Vencido</span>'}</td>
        <td class="opciones">
          ${esVigente ? `<button class="btn-accion btn-editar" title="Editar contrato" onclick="abrirModalContrato(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>` : ''}
          <button class="btn-accion btn-descarga" title="Descargar" onclick="descargarContrato(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15V3"/><path d="m7 10 5 5 5-5"/><path d="M21 21H3"/></svg>
          </button>
          ${esVigente ? `<button class="btn-accion btn-inactivar" title="Eliminar contrato" onclick="eliminarContrato(${i})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          </button>` : ''}
        </td>`;
      tbody.appendChild(tr);
    });
  }

  const tieneVigente = p.contratos.some(esContratoVigente);
  document.getElementById('contratoAlertDot').style.display = tieneVigente ? 'none' : '';
  actualizarBadgeContratoFila(perfilActualId, tieneVigente);
}

function actualizarBadgeContratoFila(id, tieneVigente) {
  const fila = document.querySelector(`#tbodyPerfiles tr[data-id="${id}"]`);
  if (!fila) return;
  fila.cells[5].innerHTML = tieneVigente
    ? '<span class="badge badge-vigente"><span class="badge-dot"></span>Vigente</span>'
    : '<span class="badge badge-vencida"><span class="badge-dot"></span>Vencido</span>';
}

function abrirModalContrato(index = null) {
  contratoEditIndex = index;
  contratoArchivoTemp = '';
  document.getElementById('contratoArchivoInput').value = '';
  limpiarErroresModal('modalContrato');

  if (index !== null) {
    const c = PERFILES[perfilActualId].contratos[index];
    document.getElementById('contratoModalTitulo').textContent = 'Editar Contrato';
    document.getElementById('contratoInicio').value = c.inicio;
    document.getElementById('contratoFin').value = c.fin;
    contratoArchivoTemp = c.archivo || '';
  } else {
    document.getElementById('contratoModalTitulo').textContent = 'Agregar Contrato';
    document.getElementById('contratoInicio').value = '';
    document.getElementById('contratoFin').value = '';
  }
  actualizarLabelDropzone(contratoArchivoTemp);

  abrirModal('modalContrato');
}

// Refleja en la dropzone si ya hay un archivo seleccionado o no
function actualizarLabelDropzone(nombre) {
  const zona = document.getElementById('contratoDropzone');
  const titulo = zona.querySelector('.dropzone-title');
  const hint = document.getElementById('contratoArchivoLabel');

  zona.classList.toggle('has-file', !!nombre);
  titulo.innerHTML = nombre
    ? `<strong>${nombre}</strong>`
    : '<strong>Haz clic para subir</strong> o arrastra el archivo aquí';
  hint.textContent = nombre ? 'Clic para cambiar el archivo' : 'PDF, JPG o PNG · Máx. 10 MB';
}

function actualizarNombreArchivoContrato(input) {
  contratoArchivoTemp = input.files[0] ? input.files[0].name : '';
  actualizarLabelDropzone(contratoArchivoTemp);
}

// Soporta arrastrar y soltar el archivo directamente sobre la dropzone
function manejarDropContrato(e, zona) {
  e.preventDefault();
  zona.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  document.getElementById('contratoArchivoInput').files = e.dataTransfer.files;
  contratoArchivoTemp = file.name;
  actualizarLabelDropzone(contratoArchivoTemp);
}

function guardarContrato() {
  const inicioInput = document.getElementById('contratoInicio');
  const finInput = document.getElementById('contratoFin');

  limpiarErroresModal('modalContrato');

  if (!inicioInput.value) { mostrarErrorCampo(inicioInput, 'Campo obligatorio'); inicioInput.focus(); return; }
  if (!finInput.value) { mostrarErrorCampo(finInput, 'Campo obligatorio'); finInput.focus(); return; }
  if (finInput.value <= inicioInput.value) {
    mostrarErrorCampo(finInput, 'Debe ser posterior al inicio');
    finInput.focus();
    return;
  }

  const p = PERFILES[perfilActualId];

  if (contratoEditIndex !== null) {
    const c = p.contratos[contratoEditIndex];
    c.inicio = inicioInput.value;
    c.fin = finInput.value;
    c.archivo = contratoArchivoTemp || c.archivo;
  } else {
    p.contratos.push({ inicio: inicioInput.value, fin: finInput.value, archivo: contratoArchivoTemp });
  }

  renderContratos(p);
  cerrarModal('modalContrato');
  mostrarToast('El contrato se guardó con éxito');
}

function eliminarContrato(index) {
  const p = PERFILES[perfilActualId];
  p.contratos.splice(index, 1);
  renderContratos(p);
  mostrarToast('El contrato se eliminó con éxito');
}

function descargarContrato(index) {
  const p = PERFILES[perfilActualId];
  const c = p.contratos[index];
  const html = `
    <h1>${p.nombre} ${p.apellido}</h1>
    <h2>Contrato N° ${index + 1} · ${esContratoVigente(c) ? 'Vigente' : 'Vencido'}</h2>
    <table>
      <tr><th>Fecha inicio</th><td>${formatearFecha(c.inicio)}</td></tr>
      <tr><th>Fecha fin</th><td>${formatearFecha(c.fin)}</td></tr>
      <tr><th>Archivo adjunto</th><td>${c.archivo || '—'}</td></tr>
    </table>`;
  generarPDF(`Contrato - ${p.nombre} ${p.apellido}`, html);
}

// =================================================
// MODO EDICIÓN
// =================================================
function activarEdicionPerfil() {
  document.querySelector('.perfil-panel[data-panel="personal"]').classList.add('edit-mode');
  document.querySelectorAll('#modalPerfil .perfil-panel[data-panel="personal"] input, #modalPerfil .perfil-panel[data-panel="personal"] textarea')
    .forEach(el => { el.disabled = false; });

  document.getElementById('btnEditarPerfil').style.display = 'none';
  document.getElementById('btnGuardarPerfil').style.display = '';
  document.getElementById('btnCancelarPerfil').style.display = '';
}

function desactivarEdicionPerfil() {
  document.querySelector('.perfil-panel[data-panel="personal"]').classList.remove('edit-mode');
  document.querySelectorAll('#modalPerfil .perfil-panel[data-panel="personal"] input, #modalPerfil .perfil-panel[data-panel="personal"] textarea')
    .forEach(el => { el.disabled = true; });

  document.getElementById('btnEditarPerfil').style.display = '';
  document.getElementById('btnGuardarPerfil').style.display = 'none';
  document.getElementById('btnCancelarPerfil').style.display = 'none';
}

function cancelarEdicionPerfil() {
  renderPerfilPersonal(PERFILES[perfilActualId]);
  desactivarEdicionPerfil();
}

// Vuelca los valores actuales del formulario al objeto del perfil (sin efectos de UI)
function capturarDatosFormulario() {
  const p = PERFILES[perfilActualId];

  p.fechaIngreso = document.getElementById('pfFechaIngreso').value;
  p.aniosIntertek = document.getElementById('pfAniosIntertek').value;
  p.aniosExperiencia = document.getElementById('pfAniosExperiencia').value;
  p.cumpleanos = document.getElementById('pfCumpleanos').value;
  p.dispViaje = document.getElementById('pfDispViajeMov').checked;
  p.lemonCard = document.getElementById('pfLemonCard').value;
  p.lemonVenc = document.getElementById('pfLemonVenc').value;

  p.telefono = document.getElementById('pfTelefono').value;
  p.correo = document.getElementById('pfCorreo').value;
  p.direccion = document.getElementById('pfDireccion').value;
  p.descripcion = document.getElementById('pfDescripcion').value;

  p.experiencia = [...document.querySelectorAll('#pfExperienciaList .exp-entry')].map(row => {
    const inputs = row.querySelectorAll('input');
    return { cargo: inputs[0].value, empresa: inputs[1].value, periodo: inputs[2].value };
  });

  p.formacion = [...document.querySelectorAll('#pfFormacionList .edu-entry')].map(row => {
    const inputs = row.querySelectorAll('input');
    return { institucion: inputs[0].value, periodo: inputs[1].value };
  });

  p.idiomas = [...document.querySelectorAll('#pfIdiomasList .chip-tag span')].map(s => s.textContent);
  p.habilidades = [...document.querySelectorAll('#pfHabilidadesList .chip-tag span')].map(s => s.textContent);
  p.cambioResidencia = document.getElementById('pfCambioResidencia').checked;

  return p;
}

function guardarPerfil() {
  capturarDatosFormulario();
  desactivarEdicionPerfil();
  mostrarToast('La información profesional se guardó con éxito');
}

// =================================================
// DESCARGA PDF (impresión del navegador)
// =================================================
function generarPDF(titulo, contenidoHTML) {
  const ventana = window.open('', '_blank');
  ventana.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${titulo}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;padding:32px;color:#111;}
      h1{font-size:19px;margin-bottom:2px;}
      h2{font-size:12.5px;color:#666;font-weight:normal;margin-bottom:22px;}
      .section{font-weight:700;font-size:13px;margin:20px 0 8px;border-bottom:2px solid #F5C400;padding-bottom:4px;}
      table{width:100%;border-collapse:collapse;margin-bottom:6px;}
      td,th{border:1px solid #ddd;padding:8px 10px;font-size:12px;text-align:left;}
      th{background:#111;color:#fff;}
      ul{margin:0;padding-left:18px;font-size:12px;}
    </style></head><body>${contenidoHTML}
    <script>window.onload = function(){ window.print(); };<\/script>
    </body></html>`);
  ventana.document.close();
}

function descargarFilaPDF(btn) {
  const fila = btn.closest('tr');
  const id = fila.dataset.id;
  const p = PERFILES[id];

  const html = `
    <h1>${p.nombre} ${p.apellido}</h1>
    <h2>${p.rol} · ${fila.dataset.tipo === 'interno' ? 'Colaborador Interno' : 'Colaborador Externo'}</h2>
    <div class="section">Datos generales</div>
    <table>
      <tr><th>Fecha de ingreso</th><td>${p.fechaIngreso || '—'}</td></tr>
      <tr><th>Años en Intertek</th><td>${p.aniosIntertek || '—'}</td></tr>
      <tr><th>Años de experiencia</th><td>${p.aniosExperiencia || '—'}</td></tr>
      <tr><th>Teléfono</th><td>${p.telefono || '—'}</td></tr>
      <tr><th>Correo</th><td>${p.correo || '—'}</td></tr>
      <tr><th>Dirección</th><td>${p.direccion || '—'}</td></tr>
    </table>
    <div class="section">Experiencia profesional</div>
    <ul>${p.experiencia.map(e => `<li>${e.cargo} — ${e.empresa} (${e.periodo})</li>`).join('') || '<li>Sin registros</li>'}</ul>
    <div class="section">Formación</div>
    <ul>${p.formacion.map(e => `<li>${e.institucion} (${e.periodo})</li>`).join('') || '<li>Sin registros</li>'}</ul>
    <div class="section">Idiomas / Habilidades</div>
    <p style="font-size:12px;">${[...p.idiomas, ...p.habilidades].join(' · ') || '—'}</p>`;

  generarPDF(`Perfil - ${p.nombre} ${p.apellido}`, html);
}

function descargarPerfilPDF() {
  if (!perfilActualId) return;
  capturarDatosFormulario();
  const fila = document.querySelector(`#tbodyPerfiles tr[data-id="${perfilActualId}"]`);
  descargarFilaPDF(fila.querySelector('.btn-descarga'));
}

function descargarReporteGeneral() {
  const filas = [...document.querySelectorAll('#tbodyPerfiles tr')].filter(f => f.style.display !== 'none');
  const filasHtml = filas.map(f => `
    <tr>
      <td>${f.cells[1].textContent}</td>
      <td>${f.cells[2].textContent}</td>
      <td>${f.cells[3].textContent}</td>
      <td>${f.dataset.tipo === 'interno' ? 'Interno' : 'Externo'}</td>
      <td>${f.dataset.doc === 'completado' ? 'Completado' : 'Pendiente'}</td>
    </tr>`).join('');

  const html = `
    <h1>Información Profesional</h1>
    <h2>Reporte general de usuarios registrados</h2>
    <table>
      <tr><th>Nombre</th><th>Apellido</th><th>Rol</th><th>Tipo</th><th>Documentación</th></tr>
      ${filasHtml}
    </table>`;

  generarPDF('Reporte - Información Profesional', html);
}
