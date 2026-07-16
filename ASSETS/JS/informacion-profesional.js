// =================================================
// INFORMACION-PROFESIONAL.JS
// =================================================

const PERFILES = {
  1: {
    nombre: 'Sandra', apellido: 'Echavarria', rol: 'Supervisor',
    fechaIngreso: '2022-03-01', aniosIntertek: '4', aniosExperiencia: '8', cumpleanos: '1990-05-14',
    dispViaje: true, lemonCard: 'LC-00214', lemonVenc: '2027-03-01',
    telefono: '+51 999 888 777', correo: 's.echavarria@intertek.com',
    direccion: 'Av. Principal 123, Lima',
    dni: '40827450', profesion: 'Ingeniero Químico / Inspector IFIA', colegiatura: 'CIP No. 215823432',
    cargoPropuesto: 'Coordinador de Inspectores',
    experienciaLaboral: [
      { empresa: 'Intertek Testing Services Peru S.A.', objeto: 'Supervisor de Operaciones de Hidrocarburos', descripcion: 'Supervisor de Operaciones de Hidrocarburos – Caleb Brett.', periodo: '01 de Septiembre del 2021 a la fecha', total: '1 año 9 meses' },
      { empresa: 'Intertek Testing Services Peru S.A.', objeto: 'Supervisión, Inspectoría y Control de Calidad de Embarques', descripcion: 'Supervisión, Inspectoría y Control de Calidad de Embarques de Nafta, MDBS y Gas Licuado de Petróleo (GLP) en planta de fraccionamiento de Pluspetrol Pisco y Descargas en los terminales de Terminales del Perú, Callao Solgas S.A., Zeta Gas, Conchan y Pampilla.', periodo: '02 de Septiembre del 2013 al 30 de Agosto del 2021', total: '8 años' },
      { empresa: 'SGS del Perú S.A.C.', objeto: 'Inspector de Hidrocarburos', descripcion: 'Inspector de Hidrocarburos', periodo: 'Enero 2010 a Agosto 2013', total: '3 años 7 meses' },
      { empresa: 'Intertek Testing Services Peru S.A.', objeto: 'Supervisión, Inspectoría y Control de Calidad de Embarques y Descargas', descripcion: 'Supervisión, Inspectoría y Control de Calidad de Embarques y Descargas de Hidrocarburos Líquidos a Granel en los terminales de: Bayóvar, Eten, Salaverry, Chimbote, Supe, Callao, Pisco, Mollendo e Ilo. Así como en las Refinerías de Talara, Conchán, Relapasa e Iquitos y Embarque de GLP en la planta de fraccionamiento de Pluspetrol Pisco.', periodo: 'Septiembre 2007 a Enero 2010', total: '2 años 4 meses' }
    ],
    totalAniosExp: '15 años 8 meses',
    curriculumNombre: '',
    formacion: [{ institucion: 'Universidad Nacional Mayor de San Marcos', periodo: '2012 - 2017' }],
    idiomas: ['Inglés', 'Español'],
    habilidades: ['Microsoft Office', 'Liderazgo'],
    cambioResidencia: true,
    contratos: [
      { inicio: '2022-03-01', fin: '2023-02-28', archivo: 'contrato_2022.pdf' },
      { inicio: '2023-03-01', fin: '2024-02-29', archivo: 'contrato_2023.pdf' },
      { inicio: '2024-03-01', fin: '2026-12-31', archivo: 'contrato_2024.pdf' }
    ],
    documentos: {
      cursos: [
        { nombre: 'Curso de Seguridad Portuaria', sinDuracion: false, inicio: '2023-01-10', fin: '2027-01-10', archivo: 'curso_seguridad_portuaria.pdf', historial: [{ estado: 'Completado', fecha: '2023-01-15' }] },
        { nombre: 'Curso de Primeros Auxilios', sinDuracion: false, inicio: '2022-05-01', fin: '2024-05-01', archivo: 'curso_primeros_auxilios.pdf', historial: [{ estado: 'Completado', fecha: '2022-05-05' }] }
      ],
      certificaciones: [
        { nombre: 'Certificación ISO 9001', sinDuracion: false, inicio: '2021-01-01', fin: '2024-01-01', archivo: 'cert_iso9001.pdf', historial: [{ estado: 'Completado', fecha: '2021-01-10' }] },
        { nombre: 'Certificación de Manejo Seguro', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_manejo_seguro.pdf', historial: [{ estado: 'Completado', fecha: '2022-06-01' }] }
      ],
      idiomas: [
        { nombre: 'Inglés — Nivel Avanzado', sinDuracion: false, inicio: '2020-01-01', fin: '2023-01-01', archivo: 'cert_ingles.pdf', historial: [{ estado: 'Completado', fecha: '2020-01-05' }] }
      ]
    },
    vacaciones: [
      { inicio: '2026-08-01', fin: '2026-08-15', motivo: 'Vacaciones anuales programadas.' },
      { inicio: '2025-01-06', fin: '2025-01-20', motivo: 'Vacaciones de verano.' }
    ],
    descansos: [
      { inicio: '2026-07-05', fin: '2026-07-12', motivo: 'Reposo por intervención odontológica.', archivos: ['Certificado_medico.pdf'] },
      { inicio: '2024-11-02', fin: '2024-11-06', motivo: 'Reposo por gripe estacional.', archivos: ['Descanso_nov2024.pdf', 'Receta.jpg'] }
    ]
  },
  2: {
    nombre: 'Bandy', apellido: 'Jimenez', rol: 'Administrador',
    fechaIngreso: '2019-07-15', aniosIntertek: '', aniosExperiencia: '6', cumpleanos: '1988-11-02',
    dispViaje: false, lemonCard: '', lemonVenc: '',
    telefono: '+51 988 111 222', correo: 'b.jimenez@externo.com',
    direccion: 'Av. Los Álamos 456, Callao',
    dni: '', profesion: '', colegiatura: '', cargoPropuesto: '',
    experienciaLaboral: [
      { empresa: 'Consultora Externa S.A.C.', objeto: 'Administrador', descripcion: '', periodo: '2019 - Actualidad', total: '' }
    ],
    totalAniosExp: '',
    curriculumNombre: '',
    formacion: [{ institucion: 'Instituto Superior de Administración', periodo: '2010 - 2013' }],
    idiomas: ['Español'],
    habilidades: ['Gestión documentaria'],
    cambioResidencia: false,
    contratos: [
      { inicio: '2019-07-15', fin: '2025-01-31', archivo: 'contrato_2019.pdf' }
    ],
    documentos: {
      cursos: [
        { nombre: 'Curso de Ética y Cumplimiento', sinDuracion: false, inicio: '', fin: '', archivo: '', historial: [] }
      ],
      certificaciones: [],
      idiomas: []
    },
    vacaciones: [
      { inicio: '2025-12-01', fin: '2025-12-15', motivo: 'Vacaciones de fin de año.' }
    ],
    descansos: []
  },
  3: {
    nombre: 'Josue', apellido: 'Ramos', rol: 'Jefe de Area',
    fechaIngreso: '2021-01-10', aniosIntertek: '5', aniosExperiencia: '9', cumpleanos: '1985-09-23',
    dispViaje: true, lemonCard: 'LC-00187', lemonVenc: '2027-01-10',
    telefono: '+51 977 333 444', correo: 'j.ramos@intertek.com',
    direccion: 'Jr. Las Flores 789, Lima',
    dni: '', profesion: '', colegiatura: '', cargoPropuesto: '',
    experienciaLaboral: [
      { empresa: 'Intertek Caleb Brett', objeto: 'Jefe de Área', descripcion: '', periodo: '2021 - Actualidad', total: '' }
    ],
    totalAniosExp: '',
    curriculumNombre: '',
    formacion: [{ institucion: 'Universidad de Lima', periodo: '2004 - 2009' }],
    idiomas: ['Inglés', 'Español', 'Portugués'],
    habilidades: ['Microsoft Office', 'Gestión de equipos'],
    cambioResidencia: true,
    contratos: [
      { inicio: '2021-01-10', fin: '2026-12-31', archivo: 'contrato_2021.pdf' }
    ],
    documentos: {
      cursos: [
        { nombre: 'Curso de Gestión de Riesgos', sinDuracion: false, inicio: '2023-02-01', fin: '2027-02-01', archivo: 'curso_gestion_riesgos.pdf', historial: [{ estado: 'Completado', fecha: '2023-02-05' }] },
        { nombre: 'Curso de Liderazgo Operativo', sinDuracion: false, inicio: '', fin: '', archivo: '', historial: [] }
      ],
      certificaciones: [
        { nombre: 'Certificación en Gestión Portuaria', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_gestion_portuaria.pdf', historial: [{ estado: 'Completado', fecha: '2023-03-01' }] }
      ],
      idiomas: []
    },
    vacaciones: [
      { inicio: '2026-09-10', fin: '2026-09-24', motivo: 'Vacaciones familiares.' },
      { inicio: '2025-03-01', fin: '2025-03-10', motivo: 'Vacaciones cortas.' }
    ],
    descansos: [
      { inicio: '2026-06-20', fin: '2026-06-27', motivo: 'Reposo por lumbalgia.', archivos: ['Informe_medico.pdf'] }
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
  const doc = document.getElementById('filterDocPerfil').value;
  const categoria = document.getElementById('filterCategoriaPerfil').value;

  document.querySelectorAll('#tbodyPerfiles tr').forEach(fila => {
    const nombreCompleto = (fila.cells[1].textContent + ' ' + fila.cells[2].textContent).toLowerCase();
    const filaRol = fila.dataset.rol;
    const filaDoc = fila.dataset.doc;
    const filaCategoria = fila.dataset.categoria;

    const ok =
      nombreCompleto.includes(texto) &&
      (rol === 'todos' || filaRol === rol) &&
      (doc === 'todos' || filaDoc === doc) &&
      (categoria === 'todos' || filaCategoria === categoria);

    fila.style.display = ok ? '' : 'none';
  });
}

function limpiarFiltrosPerfiles() {
  document.getElementById('searchPerfil').value = '';
  document.getElementById('filterRolPerfil').value = 'todos';
  document.getElementById('filterDocPerfil').value = 'todos';
  document.getElementById('filterCategoriaPerfil').value = 'todos';
  document.querySelectorAll('#tbodyPerfiles tr').forEach(fila => { fila.style.display = ''; });
}

// =================================================
// TABS DEL MODAL
// =================================================
function cambiarTabPerfil(btn, tab) {
  const panelPersonal = document.querySelector('.perfil-panel[data-panel="personal"]');
  if (tab !== 'personal' && panelPersonal.classList.contains('edit-mode')) {
    confirmarAccion('Hay cambios sin guardar en Información Personal. ¿Desea descartarlos y continuar?', () => {
      cancelarEdicionPerfil();
      aplicarCambioTabPerfil(btn, tab);
    });
    return;
  }
  aplicarCambioTabPerfil(btn, tab);
}

function aplicarCambioTabPerfil(btn, tab) {
  document.querySelectorAll('.perfil-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.perfil-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector(`.perfil-panel[data-panel="${tab}"]`).classList.add('active');

  document.querySelector('.perfil-tab-actions').style.display = tab === 'personal' ? '' : 'none';
}

// Colapsa/expande un bloque de la pestaña "Información Personal" (Datos profesionales,
// Experiencia laboral, Currículum), sin afectar el modo edición.
function toggleSeccionPersonal(btn) {
  btn.closest('.permiso-modulo').classList.toggle('collapsed');
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
  document.querySelector('.perfil-tab-actions').style.display = '';

  renderPerfilPersonal(p);
  renderContratos(p);
  renderDocumentacion(p);
  renderVacaciones(p);
  renderDescansos(p);
  desactivarEdicionPerfil();
  abrirModal('modalPerfil');
}

function renderPerfilPersonal(p) {
  document.getElementById('pfNombreCompleto').value = `${p.nombre} ${p.apellido}`;
  document.getElementById('pfDni').value = p.dni;
  document.getElementById('pfProfesion').value = p.profesion;
  document.getElementById('pfColegiatura').value = p.colegiatura;
  document.getElementById('pfCargoPropuesto').value = p.cargoPropuesto;
  document.getElementById('pfTotalAniosExp').value = p.totalAniosExp;
  renderExperienciaLaboral(p.experienciaLaboral);
  renderCurriculum(p);
}

function renderExperienciaLaboral(lista) {
  const cont = document.getElementById('pfExpLaboralList');
  cont.innerHTML = '';
  lista.forEach((e, i) => cont.appendChild(crearCardExperiencia(e, i)));
  document.getElementById('pfExpCount').textContent = lista.length;
}

function crearCardExperiencia(e, index) {
  const div = document.createElement('div');
  div.className = 'exp-card';
  div.innerHTML = `
    <div class="exp-card-header">
      <span class="exp-card-number">${index + 1}</span>
      <button type="button" class="btn-remove-entry" title="Eliminar" onclick="eliminarColumnaExperiencia(${index})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
      </button>
    </div>
    <div class="form-group-modal">
      <label class="modal-label">Empresa</label>
      <input type="text" class="modal-input" placeholder="Empresa" value="${e ? e.empresa : ''}">
    </div>
    <div class="form-group-modal">
      <label class="modal-label">Objeto</label>
      <input type="text" class="modal-input" placeholder="Objeto (breve)" value="${e ? e.objeto : ''}">
    </div>
    <div class="form-group-modal">
      <label class="modal-label">Descripción</label>
      <textarea class="modal-textarea" rows="4" placeholder="Descripción detallada del servicio">${e ? e.descripcion : ''}</textarea>
    </div>
    <div class="exp-card-row">
      <div class="form-group-modal">
        <label class="modal-label">Período</label>
        <input type="text" class="modal-input" placeholder="Período">
      </div>
      <div class="form-group-modal">
        <label class="modal-label">Total</label>
        <input type="text" class="modal-input" placeholder="Total">
      </div>
    </div>`;
  div.querySelectorAll('.exp-card-row input')[0].value = e ? e.periodo : '';
  div.querySelectorAll('.exp-card-row input')[1].value = e ? e.total : '';
  return div;
}

function agregarColumnaExperiencia() {
  const p = PERFILES[perfilActualId];
  capturarExperienciaLaboral(p);
  p.experienciaLaboral.push({ empresa: '', objeto: '', descripcion: '', periodo: '', total: '' });
  renderExperienciaLaboral(p.experienciaLaboral);
}

function eliminarColumnaExperiencia(index) {
  const p = PERFILES[perfilActualId];
  capturarExperienciaLaboral(p);
  p.experienciaLaboral.splice(index, 1);
  renderExperienciaLaboral(p.experienciaLaboral);
}

function capturarExperienciaLaboral(p) {
  p.experienciaLaboral = [...document.querySelectorAll('#pfExpLaboralList .exp-card')].map(card => {
    const [empresa, objeto] = card.querySelectorAll('.form-group-modal input.modal-input');
    const descripcion = card.querySelector('.modal-textarea').value;
    const [periodo, total] = card.querySelectorAll('.exp-card-row input');
    return { empresa: empresa.value, objeto: objeto.value, descripcion, periodo: periodo.value, total: total.value };
  });
}

// =================================================
// CURRÍCULUM (previsualización real en el modal vía object URL)
// =================================================
let curriculumArchivoTemp = null;
let curriculumObjectUrl = null;

function renderCurriculum(p) {
  if (curriculumObjectUrl) {
    URL.revokeObjectURL(curriculumObjectUrl);
    curriculumObjectUrl = null;
  }
  curriculumArchivoTemp = null;
  document.getElementById('pfCurriculumNombre').textContent = p.curriculumNombre || 'Sin currículum cargado';
  document.getElementById('pfCurriculumVerBtn').style.display = p.curriculumNombre ? '' : 'none';
  document.getElementById('pfCurriculumEliminarBtn').style.display = p.curriculumNombre ? '' : 'none';
  document.getElementById('pfCurriculumPreview').style.display = 'none';
  document.getElementById('pfCurriculumPreview').innerHTML = '';
}

function subirCurriculum(input) {
  const file = input.files[0];
  if (!file) return;
  curriculumArchivoTemp = file;
  const p = PERFILES[perfilActualId];
  p.curriculumNombre = file.name;
  document.getElementById('pfCurriculumNombre').textContent = file.name;
  document.getElementById('pfCurriculumVerBtn').style.display = '';
  document.getElementById('pfCurriculumEliminarBtn').style.display = '';
}

function verCurriculum() {
  const preview = document.getElementById('pfCurriculumPreview');
  if (preview.style.display === 'none') {
    if (!curriculumArchivoTemp) return;
    if (curriculumObjectUrl) URL.revokeObjectURL(curriculumObjectUrl);
    curriculumObjectUrl = URL.createObjectURL(curriculumArchivoTemp);
    preview.innerHTML = `<iframe src="${curriculumObjectUrl}"></iframe>`;
    preview.style.display = '';
  } else {
    preview.style.display = 'none';
  }
}

function confirmarEliminarCurriculum() {
  confirmarAccion('¿Está seguro de eliminar el currículum?', eliminarCurriculum);
}

function eliminarCurriculum() {
  const p = PERFILES[perfilActualId];
  p.curriculumNombre = '';
  document.getElementById('pfCurriculumInput').value = '';
  renderCurriculum(p);
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
  confirmarAccion('¿Desea eliminar este registro?', () => {
    const p = PERFILES[perfilActualId];
    p.contratos.splice(index, 1);
    renderContratos(p);
    mostrarToast('El contrato se eliminó con éxito');
  });
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
// DOCUMENTACIÓN (cursos, certificaciones, idiomas)
// =================================================
const DOC_SECCION_LABEL = { cursos: 'Cursos realizados', certificaciones: 'Certificaciones', idiomas: 'Idiomas' };

let documentoEditSeccion = null;
let documentoEditIndex = null;
let documentoArchivoTemp = '';

// El estado, igual que en contratos, se calcula contra la fecha actual y no se guarda como flag manual
function calcularEstadoDocumento(item) {
  if (!item.archivo) return 'pendiente';
  if (item.sinDuracion || !item.fin) return 'completado';
  return item.fin >= HOY ? 'completado' : 'vencido';
}

const DOC_ESTADO_BADGE = {
  completado: '<span class="badge badge-activo"><span class="badge-dot"></span>COMPLETADO</span>',
  pendiente: '<span class="badge badge-por-vencer"><span class="badge-dot"></span>PENDIENTE</span>',
  vencido: '<span class="badge badge-vencida"><span class="badge-dot"></span>VENCIDO</span>'
};

function formatearDuracionDoc(item) {
  if (item.sinDuracion) return 'Duración: Sin duración';
  if (!item.inicio || !item.fin) return 'Duración: xxxx - xxxx';
  return `Duración: ${formatearFecha(item.inicio)} - ${formatearFecha(item.fin)}`;
}

function renderDocumentacion(p) {
  renderDocCards('cursos', p.documentos.cursos, 'pfDocCursos');
  renderDocCards('certificaciones', p.documentos.certificaciones, 'pfDocCertificaciones');
  renderDocCards('idiomas', p.documentos.idiomas, 'pfDocIdiomas');
}

function renderDocCards(seccion, items, contenedorId) {
  const cont = document.getElementById(contenedorId);
  cont.innerHTML = '';

  if (!items.length) {
    cont.innerHTML = '<div class="doc-cards-vacio">Sin registros</div>';
    return;
  }

  items.forEach((item, i) => cont.appendChild(crearCardDocumento(seccion, item, i)));
}

function crearCardDocumento(seccion, item, index) {
  const estado = calcularEstadoDocumento(item);
  const tieneArchivo = estado !== 'pendiente';

  const div = document.createElement('div');
  div.className = 'doc-card';
  div.innerHTML = `
    <div class="doc-card-nombre">${item.nombre}</div>
    <div class="doc-card-duracion">${formatearDuracionDoc(item)}</div>
    ${DOC_ESTADO_BADGE[estado]}
    <div class="doc-card-acciones">
      <button class="btn-accion btn-editar" title="Editar" onclick="abrirModalDocumento('${seccion}', ${index})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>
      ${tieneArchivo ? `<button class="btn-accion btn-descarga" title="Descargar" onclick="descargarDocumento('${seccion}', ${index})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15V3"/><path d="m7 10 5 5 5-5"/><path d="M21 21H3"/></svg>
      </button>` : ''}
      ${tieneArchivo ? `<button class="btn-accion btn-historial" title="Historial" onclick="abrirHistorialDocumento('${seccion}', ${index})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
      </button>` : ''}
    </div>`;
  return div;
}

function abrirModalDocumento(seccion, index) {
  documentoEditSeccion = seccion;
  documentoEditIndex = index;
  documentoArchivoTemp = '';
  document.getElementById('documentoArchivoInput').value = '';
  limpiarErroresModal('modalDocumento');

  const item = PERFILES[perfilActualId].documentos[seccion][index];
  document.getElementById('documentoSeccion').value = seccion;
  document.getElementById('documentoNombre').value = item.nombre;
  document.getElementById('documentoSinDuracion').checked = item.sinDuracion;
  document.getElementById('documentoInicio').value = item.inicio || '';
  document.getElementById('documentoFin').value = item.fin || '';
  documentoArchivoTemp = item.archivo || '';
  actualizarLabelDropzoneDocumento(documentoArchivoTemp);
  toggleDocumentoSinDuracion();

  abrirModal('modalDocumento');
}

function toggleDocumentoSinDuracion() {
  const sinDuracion = document.getElementById('documentoSinDuracion').checked;
  document.getElementById('documentoFechasRow').style.display = sinDuracion ? 'none' : '';
}

function actualizarLabelDropzoneDocumento(nombre) {
  const zona = document.getElementById('documentoDropzone');
  const titulo = zona.querySelector('.dropzone-title');
  const hint = document.getElementById('documentoArchivoLabel');

  zona.classList.toggle('has-file', !!nombre);
  titulo.innerHTML = nombre
    ? `<strong>${nombre}</strong>`
    : '<strong>Haz clic para subir</strong> o arrastra el archivo aquí';
  hint.textContent = nombre ? 'Clic para cambiar el archivo' : 'PDF, JPG o PNG · Máx. 10 MB';
}

function actualizarNombreArchivoDocumento(input) {
  documentoArchivoTemp = input.files[0] ? input.files[0].name : '';
  actualizarLabelDropzoneDocumento(documentoArchivoTemp);
}

function manejarDropDocumento(e, zona) {
  e.preventDefault();
  zona.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (!file) return;
  document.getElementById('documentoArchivoInput').files = e.dataTransfer.files;
  documentoArchivoTemp = file.name;
  actualizarLabelDropzoneDocumento(documentoArchivoTemp);
}

function guardarDocumento() {
  const nombreInput = document.getElementById('documentoNombre');
  const inicioInput = document.getElementById('documentoInicio');
  const finInput = document.getElementById('documentoFin');
  const sinDuracion = document.getElementById('documentoSinDuracion').checked;
  const nuevaSeccion = document.getElementById('documentoSeccion').value;

  limpiarErroresModal('modalDocumento');

  if (!nombreInput.value.trim()) { mostrarErrorCampo(nombreInput, 'Campo obligatorio'); nombreInput.focus(); return; }
  if (!sinDuracion) {
    if (!inicioInput.value) { mostrarErrorCampo(inicioInput, 'Campo obligatorio'); inicioInput.focus(); return; }
    if (!finInput.value) { mostrarErrorCampo(finInput, 'Campo obligatorio'); finInput.focus(); return; }
    if (finInput.value <= inicioInput.value) {
      mostrarErrorCampo(finInput, 'Debe ser posterior al inicio');
      finInput.focus();
      return;
    }
  }

  const p = PERFILES[perfilActualId];
  const lista = p.documentos[documentoEditSeccion];
  const item = lista[documentoEditIndex];

  item.nombre = nombreInput.value.trim();
  item.sinDuracion = sinDuracion;
  item.inicio = sinDuracion ? '' : inicioInput.value;
  item.fin = sinDuracion ? '' : finInput.value;
  item.archivo = documentoArchivoTemp;

  if (nuevaSeccion !== documentoEditSeccion) {
    lista.splice(documentoEditIndex, 1);
    p.documentos[nuevaSeccion].push(item);
  }

  item.historial.push({ estado: capitalizarEstado(calcularEstadoDocumento(item)), fecha: HOY });

  renderDocumentacion(p);
  cerrarModal('modalDocumento');
  mostrarToast('El documento se guardó con éxito');
}

function capitalizarEstado(estado) {
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

function abrirHistorialDocumento(seccion, index) {
  const item = PERFILES[perfilActualId].documentos[seccion][index];
  const tbody = document.getElementById('historialDocList');
  tbody.innerHTML = '';

  if (!item.historial.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="contrato-vacio">Aún no hay modificaciones registradas</td></tr>';
  } else {
    item.historial.forEach((h, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${DOC_SECCION_LABEL[seccion]}</td>
        <td>${item.nombre}</td>
        <td>${h.estado}</td>
        <td>${formatearFecha(h.fecha)}</td>`;
      tbody.appendChild(tr);
    });
  }

  abrirModal('modalHistorialDoc');
}

function descargarDocumento(seccion, index) {
  const p = PERFILES[perfilActualId];
  const item = p.documentos[seccion][index];
  const estado = calcularEstadoDocumento(item);
  const html = `
    <h1>${p.nombre} ${p.apellido}</h1>
    <h2>${DOC_SECCION_LABEL[seccion]} — ${item.nombre}</h2>
    <table>
      <tr><th>Estado</th><td>${capitalizarEstado(estado)}</td></tr>
      <tr><th>Duración</th><td>${item.sinDuracion ? 'Sin duración' : `${formatearFecha(item.inicio)} - ${formatearFecha(item.fin)}`}</td></tr>
      <tr><th>Archivo adjunto</th><td>${item.archivo || '—'}</td></tr>
    </table>`;
  generarPDF(`${DOC_SECCION_LABEL[seccion]} - ${item.nombre}`, html);
}

// =================================================
// VACACIONES
// =================================================
let vacacionEditIndex = null;

// Igual que en contratos: vigencia contra la fecha actual, no un flag guardado
function esVacacionVigente(v) { return v.fin >= HOY; }

function renderVacaciones(p) {
  const cont = document.getElementById('pfVacacionesList');
  cont.innerHTML = '';

  if (!p.vacaciones.length) {
    cont.innerHTML = '<div class="contrato-vacio">Aún no se registraron vacaciones</div>';
    return;
  }

  p.vacaciones
    .map((v, i) => ({ v, i }))
    .sort((a, b) => b.v.inicio.localeCompare(a.v.inicio))
    .forEach(({ v, i }) => cont.appendChild(crearCardVacacion(v, i)));
}

function crearCardVacacion(v, index) {
  const vigente = esVacacionVigente(v);
  const div = document.createElement('div');
  div.className = `vac-card${vigente ? '' : ' culminado'}`;
  div.innerHTML = `
    <div class="vac-card-header">
      <span class="card-tiempo">
        <strong>Tiempo:</strong>
        <span>Inicio: ${formatearFecha(v.inicio)}</span>
        <span>Fin: ${formatearFecha(v.fin)}</span>
      </span>
      <span class="badge ${vigente ? 'badge-vigente' : 'badge-vencida'}"><span class="badge-dot"></span>${vigente ? 'Vigente' : 'Culminado'}</span>
    </div>
    <div class="vac-card-body">
      <fieldset class="motivo-box"><legend>Motivo</legend><p>${v.motivo || '—'}</p></fieldset>
      ${vigente ? `<button type="button" class="vac-card-edit" title="Editar" onclick="abrirModalVacacion(${index})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>` : ''}
    </div>`;
  return div;
}

function abrirModalVacacion(index = null) {
  vacacionEditIndex = index;
  limpiarErroresModal('modalVacacion');

  if (index !== null) {
    const v = PERFILES[perfilActualId].vacaciones[index];
    document.getElementById('vacacionModalTitulo').textContent = 'Editar Vacación';
    document.getElementById('vacacionInicio').value = v.inicio;
    document.getElementById('vacacionFin').value = v.fin;
    document.getElementById('vacacionMotivo').value = v.motivo;
  } else {
    document.getElementById('vacacionModalTitulo').textContent = 'Registro de Vacaciones';
    document.getElementById('vacacionInicio').value = '';
    document.getElementById('vacacionFin').value = '';
    document.getElementById('vacacionMotivo').value = '';
  }

  abrirModal('modalVacacion');
}

function guardarVacacion() {
  const inicioInput = document.getElementById('vacacionInicio');
  const finInput = document.getElementById('vacacionFin');
  const motivoInput = document.getElementById('vacacionMotivo');

  limpiarErroresModal('modalVacacion');

  if (!inicioInput.value) { mostrarErrorCampo(inicioInput, 'Campo obligatorio'); inicioInput.focus(); return; }
  if (!finInput.value) { mostrarErrorCampo(finInput, 'Campo obligatorio'); finInput.focus(); return; }
  if (finInput.value <= inicioInput.value) {
    mostrarErrorCampo(finInput, 'Debe ser posterior al inicio');
    finInput.focus();
    return;
  }
  if (!motivoInput.value.trim()) { mostrarErrorCampo(motivoInput, 'Campo obligatorio'); motivoInput.focus(); return; }

  const p = PERFILES[perfilActualId];
  if (vacacionEditIndex !== null) {
    const v = p.vacaciones[vacacionEditIndex];
    v.inicio = inicioInput.value;
    v.fin = finInput.value;
    v.motivo = motivoInput.value.trim();
  } else {
    p.vacaciones.push({ inicio: inicioInput.value, fin: finInput.value, motivo: motivoInput.value.trim() });
  }

  renderVacaciones(p);
  cerrarModal('modalVacacion');
  mostrarToast('La vacación se guardó con éxito');
}

// =================================================
// DESCANSO MÉDICO
// =================================================
let descansoEditIndex = null;
let descansoArchivosTemp = [];

function esDescansoVigente(d) { return d.fin >= HOY; }

function renderDescansos(p) {
  const cont = document.getElementById('pfDescansosList');
  cont.innerHTML = '';

  if (!p.descansos.length) {
    cont.innerHTML = '<div class="contrato-vacio">Aún no se registraron descansos médicos</div>';
    return;
  }

  p.descansos
    .map((d, i) => ({ d, i }))
    .sort((a, b) => b.d.inicio.localeCompare(a.d.inicio))
    .forEach(({ d, i }) => cont.appendChild(crearCardDescanso(d, i)));
}

function iconoArchivoDescanso(nombre) {
  const esImagen = /\.(jpg|jpeg|png|gif)$/i.test(nombre);
  return esImagen
    ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'
    : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><rect width="8" height="4" x="8" y="1" rx="1"/></svg>';
}

function crearCardDescanso(d, index) {
  const vigente = esDescansoVigente(d);
  const div = document.createElement('div');
  div.className = `desc-card${vigente ? '' : ' culminado'}`;
  div.innerHTML = `
    <div class="desc-card-header">
      <span class="card-tiempo">
        <strong>Tiempo:</strong>
        <span>Inicio: ${formatearFecha(d.inicio)}</span>
        <span>Fin: ${formatearFecha(d.fin)}</span>
      </span>
      <span class="badge ${vigente ? 'badge-vigente' : 'badge-vencida'}"><span class="badge-dot"></span>${vigente ? 'Vigente' : 'Culminado'}</span>
    </div>
    <div class="desc-card-body">
      <fieldset class="motivo-box"><legend>Motivo</legend><p>${d.motivo || '—'}</p></fieldset>
      ${vigente ? `<button type="button" class="desc-card-edit" title="Editar" onclick="abrirModalDescanso(${index})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>` : ''}
    </div>
    ${d.archivos.length ? `<div class="desc-card-files">${d.archivos.map(a => `<span class="desc-file-chip">${iconoArchivoDescanso(a)}${a}</span>`).join('')}</div>` : ''}`;
  return div;
}

function abrirModalDescanso(index = null) {
  descansoEditIndex = index;
  descansoArchivosTemp = [];
  document.getElementById('descansoArchivoInput').value = '';
  document.getElementById('descansoArchivoError').style.display = 'none';
  limpiarErroresModal('modalDescanso');

  if (index !== null) {
    const d = PERFILES[perfilActualId].descansos[index];
    document.getElementById('descansoModalTitulo').textContent = 'Editar Descanso Médico';
    document.getElementById('descansoInicio').value = d.inicio;
    document.getElementById('descansoFin').value = d.fin;
    document.getElementById('descansoMotivo').value = d.motivo;
    descansoArchivosTemp = [...d.archivos];
  } else {
    document.getElementById('descansoModalTitulo').textContent = 'Registro de Descanso Médico';
    document.getElementById('descansoInicio').value = '';
    document.getElementById('descansoFin').value = '';
    document.getElementById('descansoMotivo').value = '';
  }

  renderArchivosTempDescanso();
  abrirModal('modalDescanso');
}

function renderArchivosTempDescanso() {
  const cont = document.getElementById('descansoArchivosList');
  cont.innerHTML = '';
  descansoArchivosTemp.forEach((nombre, i) => cont.appendChild(crearChipArchivoDescanso(nombre, i)));
}

function crearChipArchivoDescanso(nombre, index) {
  const span = document.createElement('span');
  span.className = 'chip-tag';
  span.innerHTML = `<span>${nombre}</span>
    <button type="button" onclick="quitarArchivoDescanso(${index})">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>`;
  return span;
}

function agregarArchivosDescanso(input) {
  [...input.files].forEach(f => descansoArchivosTemp.push(f.name));
  input.value = '';
  if (descansoArchivosTemp.length > 0) {
    document.getElementById('descansoArchivoError').style.display = 'none';
  }
  renderArchivosTempDescanso();
}

function quitarArchivoDescanso(index) {
  descansoArchivosTemp.splice(index, 1);
  renderArchivosTempDescanso();
}

function guardarDescanso() {
  const inicioInput = document.getElementById('descansoInicio');
  const finInput = document.getElementById('descansoFin');
  const motivoInput = document.getElementById('descansoMotivo');

  limpiarErroresModal('modalDescanso');

  if (!inicioInput.value) { mostrarErrorCampo(inicioInput, 'Campo obligatorio'); inicioInput.focus(); return; }
  if (!finInput.value) { mostrarErrorCampo(finInput, 'Campo obligatorio'); finInput.focus(); return; }
  if (finInput.value <= inicioInput.value) {
    mostrarErrorCampo(finInput, 'Debe ser posterior al inicio');
    finInput.focus();
    return;
  }
  if (!motivoInput.value.trim()) { mostrarErrorCampo(motivoInput, 'Campo obligatorio'); motivoInput.focus(); return; }

  const errorArchivo = document.getElementById('descansoArchivoError');
  if (descansoArchivosTemp.length === 0) {
    errorArchivo.style.display = '';
    return;
  }
  errorArchivo.style.display = 'none';

  const p = PERFILES[perfilActualId];
  if (descansoEditIndex !== null) {
    const d = p.descansos[descansoEditIndex];
    d.inicio = inicioInput.value;
    d.fin = finInput.value;
    d.motivo = motivoInput.value.trim();
    d.archivos = [...descansoArchivosTemp];
  } else {
    p.descansos.push({ inicio: inicioInput.value, fin: finInput.value, motivo: motivoInput.value.trim(), archivos: [...descansoArchivosTemp] });
  }

  renderDescansos(p);
  cerrarModal('modalDescanso');
  mostrarToast('El descanso médico se guardó con éxito');
}

// =================================================
// MODO EDICIÓN
// =================================================
// Los campos de "Experiencia laboral" usan readOnly (no disabled) para que su texto
// se pueda seleccionar y copiar incluso fuera del modo edición.
function camposPersonal() {
  const todos = [...document.querySelectorAll('#modalPerfil .perfil-panel[data-panel="personal"] input, #modalPerfil .perfil-panel[data-panel="personal"] textarea')]
    .filter(el => el.id !== 'pfCurriculumInput');
  return {
    experiencia: todos.filter(el => el.closest('#pfExpLaboralList')),
    resto: todos.filter(el => !el.closest('#pfExpLaboralList'))
  };
}

function activarEdicionPerfil() {
  document.querySelector('.perfil-panel[data-panel="personal"]').classList.add('edit-mode');
  const { experiencia, resto } = camposPersonal();
  experiencia.forEach(el => { el.readOnly = false; });
  resto.forEach(el => { el.disabled = false; });

  document.getElementById('btnEditarPerfil').style.display = 'none';
  document.getElementById('btnGuardarPerfil').style.display = '';
  document.getElementById('btnCancelarPerfil').style.display = '';
}

function desactivarEdicionPerfil() {
  document.querySelector('.perfil-panel[data-panel="personal"]').classList.remove('edit-mode');
  const { experiencia, resto } = camposPersonal();
  experiencia.forEach(el => { el.readOnly = true; });
  resto.forEach(el => { el.disabled = true; });

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

  p.dni = document.getElementById('pfDni').value;
  p.profesion = document.getElementById('pfProfesion').value;
  p.colegiatura = document.getElementById('pfColegiatura').value;
  p.cargoPropuesto = document.getElementById('pfCargoPropuesto').value;
  p.totalAniosExp = document.getElementById('pfTotalAniosExp').value;
  capturarExperienciaLaboral(p);

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
    <h2>${p.rol}</h2>
    <div class="section">Datos generales</div>
    <table>
      <tr><th>Fecha de ingreso</th><td>${p.fechaIngreso || '—'}</td></tr>
      <tr><th>Años en Intertek</th><td>${p.aniosIntertek || '—'}</td></tr>
      <tr><th>Años de experiencia</th><td>${p.aniosExperiencia || '—'}</td></tr>
      <tr><th>Teléfono</th><td>${p.telefono || '—'}</td></tr>
      <tr><th>Correo</th><td>${p.correo || '—'}</td></tr>
      <tr><th>Dirección</th><td>${p.direccion || '—'}</td></tr>
    </table>
    <div class="section">Datos profesionales</div>
    <table>
      <tr><th>DNI No.</th><td>${p.dni || '—'}</td></tr>
      <tr><th>Profesión</th><td>${p.profesion || '—'}</td></tr>
      <tr><th>Colegiatura No.</th><td>${p.colegiatura || '—'}</td></tr>
      <tr><th>Cargo Propuesto</th><td>${p.cargoPropuesto || '—'}</td></tr>
    </table>
    <div class="section">Experiencia laboral</div>
    <table>
      <tr><th>Empresa</th>${p.experienciaLaboral.map(e => `<td>${e.empresa || '—'}</td>`).join('')}</tr>
      <tr><th>Objeto</th>${p.experienciaLaboral.map(e => `<td>${e.objeto || '—'}</td>`).join('')}</tr>
      <tr><th>Descripción</th>${p.experienciaLaboral.map(e => `<td>${e.descripcion || '—'}</td>`).join('')}</tr>
      <tr><th>Período</th>${p.experienciaLaboral.map(e => `<td>${e.periodo || '—'}</td>`).join('')}</tr>
      <tr><th>Total</th>${p.experienciaLaboral.map(e => `<td>${e.total || '—'}</td>`).join('')}</tr>
      <tr><th>Total años de experiencia</th><td colspan="${Math.max(p.experienciaLaboral.length, 1)}">${p.totalAniosExp || '—'}</td></tr>
    </table>
    <div class="section">Formación</div>
    <ul>${p.formacion.map(e => `<li>${e.institucion} (${e.periodo})</li>`).join('') || '<li>Sin registros</li>'}</ul>
    <div class="section">Idiomas / Habilidades</div>
    <p style="font-size:12px;">${[...p.idiomas, ...p.habilidades].join(' · ') || '—'}</p>`;

  generarPDF(`Perfil - ${p.nombre} ${p.apellido}`, html);
}

function descargarReporteGeneral() {
  const filas = [...document.querySelectorAll('#tbodyPerfiles tr')].filter(f => f.style.display !== 'none');
  const filasHtml = filas.map(f => `
    <tr>
      <td>${f.cells[1].textContent}</td>
      <td>${f.cells[2].textContent}</td>
      <td>${f.cells[3].textContent}</td>
      <td>${f.dataset.doc === 'completado' ? 'Completado' : 'Pendiente'}</td>
    </tr>`).join('');

  const html = `
    <h1>Información Profesional</h1>
    <h2>Reporte general de usuarios registrados</h2>
    <table>
      <tr><th>Nombre</th><th>Apellido</th><th>Rol</th><th>Documentación</th></tr>
      ${filasHtml}
    </table>`;

  generarPDF('Reporte - Información Profesional', html);
}
