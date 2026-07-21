// =================================================
// INFORMACION-PROFESIONAL.JS
// =================================================

const PERFILES = {
  1: {
    usuario: 's.echavarria',
    nombre: 'Sandra', apellido: 'Echavarria', rol: 'Supervisor', categoria: 'Operativo',
    fechaIngreso: '2022-03-01', aniosIntertek: '4', aniosExperiencia: '8', cumpleanos: '1990-05-14',
    dispViaje: true, lemonCard: 'LC-00214', lemonVenc: '2027-03-01',
    telefono: '+51 999 888 777', correo: 's.echavarria@intertek.com',
    direccion: 'Av. Principal 123, Lima',
    dni: '40827450', profesion: 'Ingeniero Químico / Inspector IFIA', colegiatura: 'CIP No. 215823432',
    cargoPropuesto: 'Coordinador de Inspectores',
    experienciaLaboral: [
      { empresa: 'Intertek Testing Services Peru S.A.', objeto: 'Supervisor de Operaciones de Hidrocarburos', descripcion: 'Supervisor de Operaciones de Hidrocarburos – Caleb Brett.', periodo: '01 de Septiembre del 2021 a la fecha', totalAnios: 0, totalMeses: 0, actual: true, fechaInicio: '2021-09-01' },
      { empresa: 'Intertek Testing Services Peru S.A.', objeto: 'Supervisión, Inspectoría y Control de Calidad de Embarques', descripcion: 'Supervisión, Inspectoría y Control de Calidad de Embarques de Nafta, MDBS y Gas Licuado de Petróleo (GLP) en planta de fraccionamiento de Pluspetrol Pisco y Descargas en los terminales de Terminales del Perú, Callao Solgas S.A., Zeta Gas, Conchan y Pampilla.', periodo: '02 de Septiembre del 2013 al 30 de Agosto del 2021', totalAnios: 8, totalMeses: 0 },
      { empresa: 'SGS del Perú S.A.C.', objeto: 'Inspector de Hidrocarburos', descripcion: 'Inspector de Hidrocarburos', periodo: 'Enero 2010 a Agosto 2013', totalAnios: 3, totalMeses: 7 },
      { empresa: 'Intertek Testing Services Peru S.A.', objeto: 'Supervisión, Inspectoría y Control de Calidad de Embarques y Descargas', descripcion: 'Supervisión, Inspectoría y Control de Calidad de Embarques y Descargas de Hidrocarburos Líquidos a Granel en los terminales de: Bayóvar, Eten, Salaverry, Chimbote, Supe, Callao, Pisco, Mollendo e Ilo. Así como en las Refinerías de Talara, Conchán, Relapasa e Iquitos y Embarque de GLP en la planta de fraccionamiento de Pluspetrol Pisco.', periodo: 'Septiembre 2007 a Enero 2010', totalAnios: 2, totalMeses: 4 }
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
        { nombre: 'Curso de Seguridad Portuaria', descripcion: 'Formación en normativas de seguridad en terminales portuarias.', sinDuracion: false, inicio: '2023-01-10', fin: '2027-01-10', archivo: 'curso_seguridad_portuaria.pdf', historial: [{ estado: 'Completado', fecha: '2023-01-15' }] },
        { nombre: 'Curso de Primeros Auxilios', descripcion: 'Capacitación en técnicas de primeros auxilios y respuesta ante emergencias.', sinDuracion: false, inicio: '2022-05-01', fin: '2024-05-01', archivo: 'curso_primeros_auxilios.pdf', historial: [{ estado: 'Completado', fecha: '2022-05-05' }] },
        { nombre: 'Curso de Manejo Defensivo', descripcion: 'Técnicas de manejo defensivo para operación en zonas portuarias.', sinDuracion: false, inicio: '', fin: '', archivo: '', historial: [] }
      ],
      certificaciones: [
        { nombre: 'Certificación ISO 9001', descripcion: 'Certificación en sistemas de gestión de calidad bajo estándar ISO 9001:2015.', sinDuracion: false, inicio: '2021-01-01', fin: '2024-01-01', archivo: 'cert_iso9001.pdf', historial: [{ estado: 'Completado', fecha: '2021-01-10' }] },
        { nombre: 'Certificación de Manejo Seguro', descripcion: 'Certificación en manejo seguro de materiales y equipos portuarios.', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_manejo_seguro.pdf', historial: [{ estado: 'Completado', fecha: '2022-06-01' }] }
      ],
      idiomas: [
        { nombre: 'Inglés — Nivel Avanzado', descripcion: 'Dominio avanzado del idioma inglés — lectura, escritura y conversación.', sinDuracion: false, inicio: '2020-01-01', fin: '2023-01-01', archivo: 'cert_ingles.pdf', historial: [{ estado: 'Completado', fecha: '2020-01-05' }] }
      ]
    },
    vacaciones: [
      { inicio: '2026-08-01', fin: '2026-08-15', motivo: 'Vacaciones anuales programadas.' },
      { inicio: '2025-01-06', fin: '2025-01-20', motivo: 'Vacaciones de verano.' }
    ],
    descansos: [
      { inicio: '2026-07-05', fin: '2026-07-12', motivo: 'Reposo por intervención odontológica.', archivos: ['Certificado_medico.pdf'] },
      { inicio: '2024-11-02', fin: '2024-11-06', motivo: 'Reposo por gripe estacional.', archivos: ['Descanso_nov2024.pdf', 'Receta.jpg'] }
    ],
    permisosEspeciales: [
      { tipo: 'Cita médica', inicio: '2026-08-10', fin: '2026-08-10', motivo: 'Control médico anual.', archivos: ['citacion_medica.pdf'] }
    ],
    equiposAsignados: [
      { nombre: 'Celular Samsung A54', tipo: 'Celular', fechaAsignacion: '2026-03-01', estado: 'Bueno', checklist: [{ item: 'Manual de usuario entregado', cumplido: true }, { item: 'Cargador', cumplido: true }, { item: 'Chip corporativo', cumplido: false }], archivos: ['acta_entrega_celular.pdf'], observaciones: 'IMEI 356789104567890.' }
    ]
  },
  2: {
    usuario: 'b.jimenez',
    nombre: 'Bandy', apellido: 'Jimenez', rol: 'Administrador', categoria: 'Administrativo',
    fechaIngreso: '2019-07-15', aniosIntertek: '', aniosExperiencia: '6', cumpleanos: '1988-11-02',
    dispViaje: false, lemonCard: '', lemonVenc: '',
    telefono: '+51 988 111 222', correo: 'b.jimenez@externo.com',
    direccion: 'Av. Los Álamos 456, Callao',
    dni: '', profesion: '', colegiatura: '', cargoPropuesto: '',
    experienciaLaboral: [
      { empresa: 'Consultora Externa S.A.C.', objeto: 'Administrador', descripcion: '', periodo: '2019 - Actualidad', totalAnios: 0, totalMeses: 0, actual: true, fechaInicio: '2019-07-15' }
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
        { nombre: 'Curso de Ética y Cumplimiento', descripcion: '', sinDuracion: false, inicio: '', fin: '', archivo: '', historial: [] }
      ],
      certificaciones: [],
      idiomas: []
    },
    vacaciones: [
      { inicio: '2025-12-01', fin: '2025-12-15', motivo: 'Vacaciones de fin de año.' }
    ],
    descansos: [],
    permisosEspeciales: [],
    equiposAsignados: []
  },
  3: {
    usuario: 'j.ramos',
    nombre: 'Josue', apellido: 'Ramos', rol: 'Jefe de Area', categoria: 'Administrativo',
    fechaIngreso: '2021-01-10', aniosIntertek: '5', aniosExperiencia: '9', cumpleanos: '1985-09-23',
    dispViaje: true, lemonCard: 'LC-00187', lemonVenc: '2027-01-10',
    telefono: '+51 977 333 444', correo: 'j.ramos@intertek.com',
    direccion: 'Jr. Las Flores 789, Lima',
    dni: '', profesion: '', colegiatura: '', cargoPropuesto: '',
    experienciaLaboral: [
      { empresa: 'Intertek Caleb Brett', objeto: 'Jefe de Área', descripcion: '', periodo: '2021 - Actualidad', totalAnios: 0, totalMeses: 0, actual: true, fechaInicio: '2021-01-10' }
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
        { nombre: 'Curso de Gestión de Riesgos', descripcion: 'Identificación, evaluación y mitigación de riesgos operativos en entornos industriales.', sinDuracion: false, inicio: '2023-02-01', fin: '2027-02-01', archivo: 'curso_gestion_riesgos.pdf', historial: [{ estado: 'Completado', fecha: '2023-02-05' }] },
        { nombre: 'Curso de Liderazgo Operativo', descripcion: '', sinDuracion: false, inicio: '', fin: '', archivo: '', historial: [] }
      ],
      certificaciones: [
        { nombre: 'Certificación en Gestión Portuaria', descripcion: 'Certificación profesional en planificación y gestión de operaciones portuarias.', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_gestion_portuaria.pdf', historial: [{ estado: 'Completado', fecha: '2023-03-01' }] }
      ],
      idiomas: []
    },
    vacaciones: [
      { inicio: '2026-09-10', fin: '2026-09-24', motivo: 'Vacaciones familiares.' },
      { inicio: '2025-03-01', fin: '2025-03-10', motivo: 'Vacaciones cortas.' }
    ],
    descansos: [
      { inicio: '2026-06-20', fin: '2026-06-27', motivo: 'Reposo por lumbalgia.', archivos: ['Informe_medico.pdf'] }
    ],
    permisosEspeciales: [],
    equiposAsignados: []
  },
  4: {
    nombre: 'Carlos', apellido: 'Mendoza', rol: 'Inspector', categoria: 'Operativo',
    fechaIngreso: '2020-03-15', aniosIntertek: '6', aniosExperiencia: '10', cumpleanos: '1987-04-20',
    dispViaje: true, lemonCard: 'LC-00231', lemonVenc: '2027-03-15',
    telefono: '+51 955 222 333', correo: 'c.mendoza@intertek.com',
    direccion: 'Av. Industrial 321, Callao',
    dni: '42318760', profesion: 'Ingeniero Químico / Inspector IFIA', colegiatura: 'CIP No. 198745312',
    cargoPropuesto: 'Inspector Senior',
    experienciaLaboral: [
      { empresa: 'Intertek Testing Services Peru S.A.', objeto: 'Inspector de Hidrocarburos', descripcion: 'Inspección y control de calidad de hidrocarburos en terminales portuarios.', periodo: '2020 - Actualidad', totalAnios: 0, totalMeses: 0, actual: true, fechaInicio: '2020-03-15' }
    ],
    totalAniosExp: '10 años',
    curriculumNombre: '',
    formacion: [{ institucion: 'Universidad Nacional de Ingeniería', periodo: '2006 - 2011' }],
    idiomas: ['Español', 'Inglés'],
    habilidades: ['Inspección de Hidrocarburos', 'Microsoft Office'],
    cambioResidencia: true,
    contratos: [
      { inicio: '2020-03-15', fin: '2027-03-15', archivo: 'contrato_mendoza.pdf' }
    ],
    documentos: {
      cursos: [
        { nombre: 'Curso de Seguridad Portuaria', descripcion: 'Normativas de seguridad en operaciones portuarias.', sinDuracion: false, inicio: '2023-05-01', fin: '2027-05-01', archivo: 'curso_seg_portuaria.pdf', historial: [{ estado: 'Completado', fecha: '2023-05-10' }] },
        { nombre: 'Curso de Primeros Auxilios', descripcion: 'Técnicas de primeros auxilios y respuesta ante emergencias.', sinDuracion: false, inicio: '2022-08-01', fin: '2026-08-01', archivo: 'curso_primeros_auxilios.pdf', historial: [{ estado: 'Completado', fecha: '2022-08-05' }] }
      ],
      certificaciones: [
        { nombre: 'Certificación ISO 14001', descripcion: 'Certificación en sistemas de gestión ambiental.', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_iso14001.pdf', historial: [{ estado: 'Completado', fecha: '2021-09-01' }] }
      ],
      idiomas: [
        { nombre: 'Inglés — Nivel Intermedio', descripcion: 'Dominio intermedio del idioma inglés para entornos técnicos.', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_ingles_mendoza.pdf', historial: [{ estado: 'Completado', fecha: '2020-04-01' }] }
      ]
    },
    vacaciones: [
      { inicio: '2026-12-01', fin: '2026-12-15', motivo: 'Vacaciones anuales.' }
    ],
    descansos: [],
    permisosEspeciales: [],
    equiposAsignados: []
  },
  5: {
    nombre: 'María', apellido: 'López', rol: 'Coordinador', categoria: 'Administrativo',
    fechaIngreso: '2018-09-01', aniosIntertek: '7', aniosExperiencia: '12', cumpleanos: '1983-02-14',
    dispViaje: false, lemonCard: 'LC-00198', lemonVenc: '2027-09-01',
    telefono: '+51 966 444 555', correo: 'm.lopez@intertek.com',
    direccion: 'Jr. Los Pinos 654, Lima',
    dni: '38921540', profesion: 'Administradora de Empresas', colegiatura: '',
    cargoPropuesto: 'Coordinadora Senior de Operaciones',
    experienciaLaboral: [
      { empresa: 'Intertek Testing Services Peru S.A.', objeto: 'Coordinadora de Operaciones', descripcion: 'Coordinación y seguimiento de operaciones de inspección a nivel nacional.', periodo: '2018 - Actualidad', totalAnios: 0, totalMeses: 0, actual: true, fechaInicio: '2018-09-01' }
    ],
    totalAniosExp: '12 años',
    curriculumNombre: '',
    formacion: [{ institucion: 'Universidad de Lima', periodo: '2001 - 2006' }],
    idiomas: ['Español', 'Inglés', 'Francés'],
    habilidades: ['Gestión de proyectos', 'Microsoft Office', 'Liderazgo'],
    cambioResidencia: false,
    contratos: [
      { inicio: '2018-09-01', fin: '2027-08-31', archivo: 'contrato_lopez.pdf' }
    ],
    documentos: {
      cursos: [
        { nombre: 'Curso de Gestión de Calidad', descripcion: 'Herramientas y metodologías para la gestión de la calidad en operaciones.', sinDuracion: false, inicio: '2022-03-01', fin: '2027-03-01', archivo: 'curso_gestion_calidad.pdf', historial: [{ estado: 'Completado', fecha: '2022-03-10' }] }
      ],
      certificaciones: [
        { nombre: 'Certificación PMP', descripcion: 'Certificación internacional en gestión de proyectos.', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_pmp.pdf', historial: [{ estado: 'Completado', fecha: '2020-06-01' }] },
        { nombre: 'Certificación ISO 9001', descripcion: 'Certificación en sistemas de gestión de calidad.', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_iso9001_lopez.pdf', historial: [{ estado: 'Completado', fecha: '2019-11-01' }] }
      ],
      idiomas: [
        { nombre: 'Inglés — Nivel Avanzado', descripcion: 'Dominio avanzado del idioma inglés.', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_ingles_lopez.pdf', historial: [{ estado: 'Completado', fecha: '2018-10-01' }] },
        { nombre: 'Francés — Nivel Básico', descripcion: 'Conocimiento básico del idioma francés.', sinDuracion: true, inicio: '', fin: '', archivo: 'cert_frances.pdf', historial: [{ estado: 'Completado', fecha: '2019-01-01' }] }
      ]
    },
    vacaciones: [
      { inicio: '2026-07-20', fin: '2026-08-03', motivo: 'Vacaciones de invierno.' }
    ],
    descansos: [],
    permisosEspeciales: [],
    equiposAsignados: []
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

// Igual que esContratoVigente: se calcula siempre contra HOY, nunca se guarda como texto fijo.
function calcularAntiguedad(fechaInicioStr) {
  const inicio = new Date(fechaInicioStr);
  const hoy = new Date(HOY);
  let años = hoy.getFullYear() - inicio.getFullYear();
  let meses = hoy.getMonth() - inicio.getMonth();
  if (hoy.getDate() < inicio.getDate()) meses--;
  if (meses < 0) { años--; meses += 12; }
  return { anios: años, meses };
}

function formatAniosMeses(anios, meses) {
  const partes = [];
  if (anios > 0) partes.push(`${anios} año${anios !== 1 ? 's' : ''}`);
  partes.push(`${meses} mes${meses !== 1 ? 'es' : ''}`);
  return partes.join(' ');
}

function calcularEstadoContratoPerfil(id) {
  const contratos = PERFILES[id].contratos;
  if (!contratos.length) return 'vencido';
  return contratos.some(c => esContratoVigente(c)) ? 'vigente' : 'vencido';
}

// =================================================
// FILTROS
// =================================================
function filtrarPerfiles() {
  const texto    = document.getElementById('searchPerfil').value.toLowerCase();
  const rol      = document.getElementById('filterRolPerfil').value;
  const contrato = document.getElementById('filterContratoPerfil').value;
  const categoria = document.getElementById('filterCategoriaPerfil').value;
  const obsEquipo = document.getElementById('searchObsEquipo').value.toLowerCase();

  document.querySelectorAll('#tbodyPerfiles tr').forEach(fila => {
    const nombreCompleto = (fila.cells[1].textContent + ' ' + fila.cells[2].textContent).toLowerCase();

    const ok =
      nombreCompleto.includes(texto) &&
      (rol      === 'todos' || fila.dataset.rol      === rol) &&
      (contrato === 'todos' || fila.dataset.contrato === contrato) &&
      (categoria === 'todos' || fila.dataset.categoria === categoria) &&
      (!obsEquipo || (fila.dataset.equiposObs || '').includes(obsEquipo));

    fila.style.display = ok ? '' : 'none';
  });
}

function limpiarFiltrosPerfiles() {
  document.getElementById('searchPerfil').value = '';
  document.getElementById('filterRolPerfil').value = 'todos';
  document.getElementById('filterContratoPerfil').value = 'todos';
  document.getElementById('filterCategoriaPerfil').value = 'todos';
  document.getElementById('searchObsEquipo').value = '';
  document.getElementById('btnFiltroAvanzadoPerfiles').classList.remove('filtro-avanzado-activo');
  document.querySelectorAll('#tbodyPerfiles tr').forEach(fila => { fila.style.display = ''; });
}

// Abre el modal del filtro avanzado (búsqueda en observaciones de equipos asignados)
function abrirModalFiltroAvanzadoPerfiles() {
  abrirModal('modalFiltroAvanzado');
  document.getElementById('searchObsEquipo').focus();
}

// Aplica el término ingresado en el modal y marca el botón como filtro activo mientras haya texto
function aplicarFiltroAvanzadoPerfiles() {
  const activo = document.getElementById('searchObsEquipo').value.trim() !== '';
  document.getElementById('btnFiltroAvanzadoPerfiles').classList.toggle('filtro-avanzado-activo', activo);
  filtrarPerfiles();
  cerrarModal('modalFiltroAvanzado');
}

// Junta las observaciones de todos los equipos asignados de un perfil para que el
// filtro avanzado pueda buscar dentro de ese texto sin recalcularlo en cada tecla
function actualizarBusquedaEquiposPerfil(id) {
  const fila = document.querySelector(`#tbodyPerfiles tr[data-id="${id}"]`);
  if (!fila) return;
  fila.dataset.equiposObs = PERFILES[id].equiposAsignados
    .map(e => e.observaciones || '')
    .join(' ')
    .toLowerCase();
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
  renderPermisosEspeciales(p);
  renderEquiposAsignados(p);
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
  const ordenada = [...lista].sort((a, b) => (b.actual === true) - (a.actual === true));
  const cont = document.getElementById('pfExpLaboralList');
  cont.innerHTML = '';
  ordenada.forEach((e, i) => cont.appendChild(crearCardExperiencia(e, i)));
  document.getElementById('pfExpCount').textContent = ordenada.length;
  recalcularTotalAniosExp();
}

// Suma los totales (años/meses) de todas las tarjetas de experiencia y actualiza
// el campo agregado "Total años de experiencia", que ya no se edita manualmente.
function recalcularTotalAniosExp() {
  let totalAnios = 0;
  let totalMeses = 0;
  document.querySelectorAll('#pfExpLaboralList .exp-card').forEach(card => {
    if (card.dataset.actual === 'true') {
      const antiguedad = calcularAntiguedad(card.dataset.fechaInicio);
      totalAnios += antiguedad.anios;
      totalMeses += antiguedad.meses;
    } else {
      totalAnios += Number(card.querySelector('.exp-total-anios').value) || 0;
      totalMeses += Number(card.querySelector('.exp-total-meses').value) || 0;
    }
  });
  totalAnios += Math.floor(totalMeses / 12);
  totalMeses = totalMeses % 12;
  const texto = formatAniosMeses(totalAnios, totalMeses);
  document.getElementById('pfTotalAniosExp').value = texto;
  if (perfilActualId) PERFILES[perfilActualId].totalAniosExp = texto;
}

function crearCardExperiencia(e, index) {
  const esActual = !!(e && e.actual);
  const totalMostrado = esActual ? calcularAntiguedad(e.fechaInicio) : { anios: e ? (e.totalAnios || 0) : 0, meses: e ? (e.totalMeses || 0) : 0 };
  const div = document.createElement('div');
  div.className = 'exp-card';
  div.dataset.actual = esActual ? 'true' : 'false';
  div.dataset.fechaInicio = e && e.fechaInicio ? e.fechaInicio : '';
  div.innerHTML = `
    <div class="exp-card-header">
      <span class="exp-card-number">${index + 1}</span>
      ${esActual ? '' : `<button type="button" class="btn-remove-entry" title="Eliminar" onclick="eliminarColumnaExperiencia(${index})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
      </button>`}
    </div>
    <div class="form-group-modal">
      <label class="modal-label">Empresa${esActual ? ' (automático)' : ''}</label>
      <input type="text" class="modal-input${esActual ? ' exp-auto-field' : ''}" placeholder="Empresa" value="${e ? e.empresa : ''}" ${esActual ? 'readonly' : ''}>
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
        <label class="modal-label">Total${esActual ? ' (automático)' : ''}</label>
        <div class="exp-total-inputs">
          <div class="exp-total-item">
            <input type="number" min="0" class="modal-input exp-total-anios${esActual ? ' exp-auto-field' : ''}" placeholder="0" ${esActual ? 'readonly' : ''}>
            <span class="exp-total-suffix">años</span>
          </div>
          <div class="exp-total-item">
            <input type="number" min="0" max="11" class="modal-input exp-total-meses${esActual ? ' exp-auto-field' : ''}" placeholder="0" ${esActual ? 'readonly' : ''}>
            <span class="exp-total-suffix">meses</span>
          </div>
        </div>
      </div>
    </div>`;
  div.querySelector('.exp-card-row input').value = e ? e.periodo : '';
  const inputAnios = div.querySelector('.exp-total-anios');
  const inputMeses = div.querySelector('.exp-total-meses');
  inputAnios.value = totalMostrado.anios;
  inputMeses.value = totalMostrado.meses;
  inputAnios.addEventListener('input', recalcularTotalAniosExp);
  inputMeses.addEventListener('input', recalcularTotalAniosExp);
  return div;
}

function agregarColumnaExperiencia() {
  const p = PERFILES[perfilActualId];
  capturarExperienciaLaboral(p);
  p.experienciaLaboral.push({ empresa: '', objeto: '', descripcion: '', periodo: '', totalAnios: 0, totalMeses: 0 });
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
    const periodo = card.querySelector('.exp-card-row input');
    const totalAniosInput = card.querySelector('.exp-total-anios');
    const totalMesesInput = card.querySelector('.exp-total-meses');
    const actual = card.dataset.actual === 'true';
    const fechaInicio = card.dataset.fechaInicio || '';
    return { empresa: empresa.value, objeto: objeto.value, descripcion, periodo: periodo.value,
      totalAnios: actual ? 0 : (Number(totalAniosInput.value) || 0),
      totalMeses: actual ? 0 : (Number(totalMesesInput.value) || 0),
      actual, fechaInicio };
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

function calcularEstadoDocumentacionPerfil(id) {
  const d    = PERFILES[id].documentos;
  const todos = [...d.cursos, ...d.certificaciones, ...d.idiomas];
  if (!todos.length) return 'pendiente';
  const estados = todos.map(calcularEstadoDocumento);
  if (estados.every(e => e === 'completado')) return 'completado';
  if (estados.some(e  => e === 'vencido'))    return 'vencido';
  return 'pendiente';
}

// La columna "Documentación" se eliminó de la grilla (reemplazada por las columnas
// Pendientes/Vencidos); esta función solo mantiene el estado en el dataset de la fila,
// usado por el filtro "Estado Documentación" y el reporte PDF general.
function actualizarBadgeDocumentacion(id) {
  const fila = document.querySelector(`#tbodyPerfiles tr[data-id="${id}"]`);
  if (!fila) return;
  fila.dataset.doc = calcularEstadoDocumentacionPerfil(id);
}

// Junta cursos/certificaciones/idiomas para saber cuántos y cuáles documentos necesitan
// atención. Cuenta como pendiente tanto lo que falta subir como lo que ya venció, para que
// el % y su color coincidan siempre con el badge de la columna "Documentación"
// (calcularEstadoDocumentacionPerfil usa exactamente la misma jerarquía completado/vencido/pendiente).
function obtenerDocumentosPendientes(documentos) {
  const SECCIONES = ['cursos', 'certificaciones', 'idiomas'];
  const todos = SECCIONES.flatMap(key =>
    documentos[key].map((item, index) => ({ item, seccionKey: key, seccionLabel: DOC_SECCION_LABEL[key], index }))
  );
  const pendientes = todos
    .map(({ item, seccionKey, seccionLabel, index }) => ({ item, seccionKey, seccionLabel, index, estado: calcularEstadoDocumento(item) }))
    .filter(t => t.estado !== 'completado')
    .map(t => ({ nombre: t.item.nombre, descripcion: t.item.descripcion, seccionKey: t.seccionKey, seccionLabel: t.seccionLabel, index: t.index, estado: t.estado }));

  const total = todos.length;
  const numPendientes = pendientes.filter(p => p.estado === 'pendiente').length;
  const numVencidos = pendientes.filter(p => p.estado === 'vencido').length;
  const pctPendiente = total ? Math.round(numPendientes / total * 100) : 0;
  const pctVencido = total ? Math.round(numVencidos / total * 100) : 0;
  const numCompletados = total - pendientes.length;
  const estadoGeneral = !total ? 'sin-datos' : !pendientes.length ? 'completado' : numVencidos ? 'vencido' : 'pendiente';
  return { total, pendientes, numPendientes, numVencidos, numCompletados, pctPendiente, pctVencido, estadoGeneral };
}

// Pinta los dos chips independientes de la grilla (columnas "Pendientes" y "Vencidos").
// Siempre muestra el %, incluido "0%"; el tooltip (hover) es solo un resumen corto —
// el detalle completo (nombre por nombre) vive en el modal, no en el tooltip.
function actualizarProgresoDocumentacion(id) {
  const fila = document.querySelector(`#tbodyPerfiles tr[data-id="${id}"]`);
  if (!fila) return;
  const { pendientes, pctPendiente, pctVencido } = obtenerDocumentosPendientes(PERFILES[id].documentos);

  pintarChipDocumentacion(fila, 'pendiente', pctPendiente, pendientes);
  pintarChipDocumentacion(fila, 'vencido', pctVencido, pendientes);
}

function pintarChipDocumentacion(fila, estado, pct, pendientes) {
  const chip = fila.querySelector(`.chip-doc-pct--${estado}`);
  chip.querySelector('.chip-doc-pct-value').textContent = `${pct}%`;
  chip.classList.toggle('is-zero', pct === 0);

  const cantidad = pendientes.filter(p => p.estado === estado).length;
  const etiqueta = estado === 'vencido' ? 'vencido' : 'pendiente';
  chip.querySelector('.tooltip-box').textContent = cantidad
    ? `${cantidad} documento${cantidad !== 1 ? 's' : ''} ${etiqueta}${cantidad !== 1 ? 's' : ''} · clic para ver detalle`
    : `Sin documentos ${etiqueta}s`;
}

function abrirModalProgresoDocs(btn) {
  // Sin esto el tooltip puede quedar "pegado" visible tras el clic: los navegadores no
  // sueltan el :hover/:focus del botón solo porque se abrió un modal encima (no hay
  // movimiento de mouse de por medio), así que se fuerza a perder el foco explícitamente.
  btn.blur();
  perfilActualId = btn.closest('tr').dataset.id;
  const { total, pendientes, numPendientes, numVencidos, numCompletados, pctPendiente, pctVencido } = obtenerDocumentosPendientes(PERFILES[perfilActualId].documentos);

  // Anillo de 3 tramos (vencido rojo, pendiente ámbar, completado verde) según la proporción real de cada uno
  const finVencido = pctVencido;
  const finPendiente = finVencido + pctPendiente;
  const anillo = document.getElementById('progresoDocsRing');
  anillo.style.background = total
    ? `conic-gradient(var(--red) 0 ${finVencido}%, #F59E0B ${finVencido}% ${finPendiente}%, var(--green) ${finPendiente}% 100%)`
    : 'var(--gray-200)';
  document.getElementById('progresoDocsPercent').textContent = total ? `${pctVencido + pctPendiente}%` : '—';

  const stats = [];
  if (numVencidos)   stats.push(`<span class="progreso-docs-stat progreso-docs-stat--vencido">${numVencidos} vencido${numVencidos !== 1 ? 's' : ''}</span>`);
  if (numPendientes) stats.push(`<span class="progreso-docs-stat progreso-docs-stat--pendiente">${numPendientes} pendiente${numPendientes !== 1 ? 's' : ''}</span>`);
  if (numCompletados) stats.push(`<span class="progreso-docs-stat progreso-docs-stat--completado">${numCompletados} completado${numCompletados !== 1 ? 's' : ''}</span>`);
  document.getElementById('progresoDocsResumenSub').innerHTML = !total
    ? 'Sin documentos registrados'
    : stats.join('');

  const cont = document.getElementById('progresoDocsList');

  if (!total) {
    cont.innerHTML = '<div class="progreso-docs-vacio">Este perfil aún no tiene documentos registrados</div>';
  } else if (!pendientes.length) {
    cont.innerHTML = '<div class="progreso-docs-vacio progreso-docs-vacio--ok">Toda la documentación está al día</div>';
  } else {
    // Agrupa primero por estado (Vencidos arriba, Pendientes debajo) para que no se confundan entre sí;
    // la sección (Cursos/Certificaciones/Idiomas) queda como etiqueta secundaria junto al nombre.
    const GRUPOS_ESTADO = [
      { estado: 'vencido', titulo: 'Vencidos' },
      { estado: 'pendiente', titulo: 'Pendientes' }
    ];

    cont.innerHTML = GRUPOS_ESTADO
      .map(g => ({ ...g, items: pendientes.filter(p => p.estado === g.estado) }))
      .filter(g => g.items.length)
      .map(g => `
        <div class="progreso-docs-grupo progreso-docs-grupo--${g.estado}">
          <div class="progreso-docs-grupo-titulo">${g.titulo} <span class="progreso-docs-grupo-count">${g.items.length}</span></div>
          ${g.items.map(it => `
            <div class="progreso-docs-item">
              <div class="progreso-docs-item-info">
                <div class="progreso-docs-item-header">
                  <span class="progreso-docs-item-nombre">${it.nombre}</span>
                  <span class="progreso-docs-item-seccion">${it.seccionLabel}</span>
                </div>
                ${it.descripcion ? `<span class="progreso-docs-item-desc">${it.descripcion}</span>` : ''}
              </div>
              <button type="button" class="btn-completar-doc" onclick="completarDocumentoPendiente('${it.seccionKey}', ${it.index})">
                ${it.estado === 'vencido' ? 'Renovar' : 'Completar'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>`).join('')}
        </div>`).join('');
  }

  abrirModal('modalProgresoDocs');
}

// Salta directo del listado de pendientes a la edición de ese documento puntual
function completarDocumentoPendiente(seccionKey, index) {
  cerrarModal('modalProgresoDocs');
  abrirModalDocumento(seccionKey, index);
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
  const tieneLink = /^https?:\/\//i.test(item.link || '');

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
      ${tieneLink ? `<a class="btn-accion btn-link" title="Abrir enlace" href="${item.link}" target="_blank" rel="noopener noreferrer">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </a>` : ''}
      ${tieneArchivo ? `<button class="btn-accion btn-historial" title="Historial" onclick="abrirHistorialDocumento('${seccion}', ${index})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
      </button>` : ''}
    </div>`;
  return div;
}

const SECCION_LABEL = { cursos: 'Cursos realizados', certificaciones: 'Certificaciones', idiomas: 'Idiomas' };

function abrirModalDocumento(seccion, index) {
  documentoEditSeccion = seccion;
  documentoEditIndex = index;
  documentoArchivoTemp = '';
  document.getElementById('documentoArchivoInput').value = '';
  limpiarErroresModal('modalDocumento');

  const item = PERFILES[perfilActualId].documentos[seccion][index];
  document.getElementById('documentoSeccionLabel').textContent = SECCION_LABEL[seccion] || seccion;
  document.getElementById('documentoSeccion').value            = seccion;
  document.getElementById('documentoNombreLabel').textContent  = item.nombre;
  document.getElementById('documentoNombre').value             = item.nombre;
  document.getElementById('documentoDescripcion').value        = item.descripcion || '';
  document.getElementById('documentoSinDuracion').checked      = item.sinDuracion;
  document.getElementById('documentoInicio').value             = item.inicio || '';
  document.getElementById('documentoFin').value                = item.fin || '';
  document.getElementById('documentoLink').value                = item.link || '';
  documentoArchivoTemp = item.archivo || '';
  toggleDocumentoSinDuracion();

  abrirModal('modalDocumento');
  actualizarLabelDropzoneDocumento(documentoArchivoTemp);
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
  if (!input.files || !input.files[0]) return;
  documentoArchivoTemp = input.files[0].name;
  actualizarLabelDropzoneDocumento(documentoArchivoTemp);
}

function copiarEnlaceDocumento(btn) {
  const input = document.getElementById('documentoLink');
  const valor = input.value.trim();
  if (!valor) { mostrarErrorCampo(input, 'No hay enlace para copiar'); input.focus(); return; }

  navigator.clipboard.writeText(valor).then(() => {
    btn.classList.add('copied');
    mostrarToast('Enlace copiado al portapapeles');
    setTimeout(() => btn.classList.remove('copied'), 1500);
  });
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
  item.descripcion = document.getElementById('documentoDescripcion').value.trim();
  item.sinDuracion = sinDuracion;
  item.inicio = sinDuracion ? '' : inicioInput.value;
  item.fin = sinDuracion ? '' : finInput.value;
  item.link = document.getElementById('documentoLink').value.trim();
  item.archivo = documentoArchivoTemp;

  if (nuevaSeccion !== documentoEditSeccion) {
    lista.splice(documentoEditIndex, 1);
    p.documentos[nuevaSeccion].push(item);
  }

  item.historial.push({ estado: capitalizarEstado(calcularEstadoDocumento(item)), fecha: HOY });

  renderDocumentacion(p);
  actualizarBadgeDocumentacion(perfilActualId);
  actualizarProgresoDocumentacion(perfilActualId);
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
      <fieldset class="motivo-box"><legend>Comentario</legend><p>${v.motivo || '—'}</p></fieldset>
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
// PERMISOS ESPECIALES (días libres del colaborador — mismo patrón que Descanso Médico)
// =================================================
let permisoEditIndex = null;
let permisoArchivosTemp = [];

function esPermisoVigente(pe) { return pe.fin >= HOY; }

function renderPermisosEspeciales(p) {
  const cont = document.getElementById('pfPermisosList');
  cont.innerHTML = '';

  if (!p.permisosEspeciales.length) {
    cont.innerHTML = '<div class="contrato-vacio">Aún no se registraron permisos especiales</div>';
    return;
  }

  p.permisosEspeciales
    .map((pe, i) => ({ pe, i }))
    .sort((a, b) => b.pe.inicio.localeCompare(a.pe.inicio))
    .forEach(({ pe, i }) => cont.appendChild(crearCardPermiso(pe, i)));
}

function crearCardPermiso(pe, index) {
  const vigente = esPermisoVigente(pe);
  const div = document.createElement('div');
  div.className = `desc-card${vigente ? '' : ' culminado'}`;
  div.innerHTML = `
    <div class="desc-card-header">
      <span class="card-tiempo">
        <strong>${pe.tipo}:</strong>
        <span>Inicio: ${formatearFecha(pe.inicio)}</span>
        <span>Fin: ${formatearFecha(pe.fin)}</span>
      </span>
      <span class="badge ${vigente ? 'badge-vigente' : 'badge-vencida'}"><span class="badge-dot"></span>${vigente ? 'Vigente' : 'Culminado'}</span>
    </div>
    <div class="desc-card-body">
      <fieldset class="motivo-box"><legend>Motivo</legend><p>${pe.motivo || '—'}</p></fieldset>
      ${vigente ? `<button type="button" class="desc-card-edit" title="Editar" onclick="abrirModalPermiso(${index})">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
      </button>` : ''}
    </div>
    ${pe.archivos.length ? `<div class="desc-card-files">${pe.archivos.map(a => `<span class="desc-file-chip">${iconoArchivoDescanso(a)}${a}</span>`).join('')}</div>` : ''}`;
  return div;
}

function abrirModalPermiso(index = null) {
  permisoEditIndex = index;
  permisoArchivosTemp = [];
  document.getElementById('permisoArchivoInput').value = '';
  document.getElementById('permisoArchivoError').style.display = 'none';
  limpiarErroresModal('modalPermiso');

  if (index !== null) {
    const pe = PERFILES[perfilActualId].permisosEspeciales[index];
    document.getElementById('permisoModalTitulo').textContent = 'Editar Permiso Especial';
    document.getElementById('permisoTipo').value = pe.tipo;
    document.getElementById('permisoInicio').value = pe.inicio;
    document.getElementById('permisoFin').value = pe.fin;
    document.getElementById('permisoMotivo').value = pe.motivo;
    permisoArchivosTemp = [...pe.archivos];
  } else {
    document.getElementById('permisoModalTitulo').textContent = 'Registro de Permiso Especial';
    document.getElementById('permisoTipo').value = 'Trámite personal';
    document.getElementById('permisoInicio').value = '';
    document.getElementById('permisoFin').value = '';
    document.getElementById('permisoMotivo').value = '';
  }

  renderArchivosTempPermiso();
  abrirModal('modalPermiso');
}

function renderArchivosTempPermiso() {
  const cont = document.getElementById('permisoArchivosList');
  cont.innerHTML = '';
  permisoArchivosTemp.forEach((nombre, i) => cont.appendChild(crearChipArchivoPermiso(nombre, i)));
}

function crearChipArchivoPermiso(nombre, index) {
  const span = document.createElement('span');
  span.className = 'chip-tag';
  span.innerHTML = `<span>${nombre}</span>
    <button type="button" onclick="quitarArchivoPermiso(${index})">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>`;
  return span;
}

function agregarArchivosPermiso(input) {
  [...input.files].forEach(f => permisoArchivosTemp.push(f.name));
  input.value = '';
  if (permisoArchivosTemp.length > 0) {
    document.getElementById('permisoArchivoError').style.display = 'none';
  }
  renderArchivosTempPermiso();
}

function quitarArchivoPermiso(index) {
  permisoArchivosTemp.splice(index, 1);
  renderArchivosTempPermiso();
}

function guardarPermiso() {
  const inicioInput = document.getElementById('permisoInicio');
  const finInput = document.getElementById('permisoFin');
  const motivoInput = document.getElementById('permisoMotivo');

  limpiarErroresModal('modalPermiso');

  if (!inicioInput.value) { mostrarErrorCampo(inicioInput, 'Campo obligatorio'); inicioInput.focus(); return; }
  if (!finInput.value) { mostrarErrorCampo(finInput, 'Campo obligatorio'); finInput.focus(); return; }
  if (finInput.value <= inicioInput.value) {
    mostrarErrorCampo(finInput, 'Debe ser posterior al inicio');
    finInput.focus();
    return;
  }
  if (!motivoInput.value.trim()) { mostrarErrorCampo(motivoInput, 'Campo obligatorio'); motivoInput.focus(); return; }

  const errorArchivo = document.getElementById('permisoArchivoError');
  if (permisoArchivosTemp.length === 0) {
    errorArchivo.style.display = '';
    return;
  }
  errorArchivo.style.display = 'none';

  const p = PERFILES[perfilActualId];
  const datos = {
    tipo: document.getElementById('permisoTipo').value,
    inicio: inicioInput.value,
    fin: finInput.value,
    motivo: motivoInput.value.trim(),
    archivos: [...permisoArchivosTemp]
  };

  if (permisoEditIndex !== null) {
    p.permisosEspeciales[permisoEditIndex] = datos;
  } else {
    p.permisosEspeciales.push(datos);
  }

  renderPermisosEspeciales(p);
  cerrarModal('modalPermiso');
  mostrarToast('El permiso especial se guardó con éxito');
}

// =================================================
// EQUIPOS ASIGNADOS
// =================================================
let equipoEditIndex = null;
let equipoChecklistTemp = [];
let equipoArchivosTemp = [];

function renderEquiposAsignados(p) {
  const cont = document.getElementById('pfEquiposList');
  cont.innerHTML = '';
  if (!p.equiposAsignados.length) {
    cont.innerHTML = '<div class="contrato-vacio">Aún no se registraron equipos asignados</div>';
    return;
  }
  p.equiposAsignados.forEach((e, i) => cont.appendChild(crearCardEquipo(e, i)));
}

const EQUIPO_ESTADO_BADGE = {
  Bueno: 'badge-activo',
  Regular: 'badge-por-vencer',
  'Dañado': 'badge-vencida'
};

function crearCardEquipo(e, index) {
  const completados = e.checklist.filter(c => c.cumplido).length;
  const total = e.checklist.length;
  const todoCompleto = total > 0 && completados === total;
  const div = document.createElement('div');
  div.className = 'desc-card';
  div.innerHTML = `
    <div class="desc-card-header">
      <span class="card-tiempo">
        <strong>${e.nombre}</strong>
        <span>${e.tipo ? `${e.tipo} · ` : ''}Asignado: ${formatearFecha(e.fechaAsignacion)}</span>
      </span>
      <div class="equipo-card-header-actions">
        <span class="badge ${EQUIPO_ESTADO_BADGE[e.estado]}"><span class="badge-dot"></span>${e.estado}</span>
        <button type="button" class="desc-card-edit" title="Editar" onclick="abrirModalEquipo(${index})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>
      </div>
    </div>
    <div class="equipo-card-body">
      ${total ? `
        <fieldset class="motivo-box">
          <legend>Checklist de entrega — ${completados} de ${total} accesorios entregados${todoCompleto ? ' (completo)' : ''}</legend>
          <ul class="equipo-checklist-resumen">
            ${e.checklist.map(c => `<li class="${c.cumplido ? 'entregado' : 'pendiente'}">${c.cumplido ? '✓' : '○'} ${c.item}</li>`).join('')}
          </ul>
        </fieldset>` : ''}
      <fieldset class="motivo-box"><legend>Observaciones</legend><p>${e.observaciones || '—'}</p></fieldset>
    </div>
    ${e.archivos.length ? `<div class="desc-card-files">${e.archivos.map(a => `<span class="desc-file-chip">${iconoArchivoDescanso(a)}${a}</span>`).join('')}</div>` : ''}`;
  return div;
}

function abrirModalEquipo(index = null) {
  equipoEditIndex = index;
  equipoChecklistTemp = [];
  equipoArchivosTemp = [];
  document.getElementById('equipoArchivoInput').value = '';
  limpiarErroresModal('modalEquipo');

  if (index !== null) {
    const e = PERFILES[perfilActualId].equiposAsignados[index];
    document.getElementById('equipoModalTitulo').textContent = 'Editar Equipo Asignado';
    document.getElementById('equipoNombre').value = e.nombre;
    document.getElementById('equipoTipo').value = e.tipo || 'Celular';
    document.getElementById('equipoFechaAsignacion').value = e.fechaAsignacion;
    document.getElementById('equipoEstado').value = e.estado;
    document.getElementById('equipoObservaciones').value = e.observaciones;
    equipoChecklistTemp = e.checklist.map(c => ({ ...c }));
    equipoArchivosTemp = [...e.archivos];
  } else {
    document.getElementById('equipoModalTitulo').textContent = 'Registro de Equipo Asignado';
    document.getElementById('equipoNombre').value = '';
    document.getElementById('equipoTipo').value = 'Celular';
    document.getElementById('equipoFechaAsignacion').value = '';
    document.getElementById('equipoEstado').value = 'Bueno';
    document.getElementById('equipoObservaciones').value = '';
  }

  renderChecklistTempEquipo();
  renderArchivosTempEquipo();
  abrirModal('modalEquipo');
}

function renderChecklistTempEquipo() {
  const cont = document.getElementById('equipoChecklistList');
  cont.innerHTML = '';
  equipoChecklistTemp.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'equipo-checklist-item';
    row.innerHTML = `
      <label class="check-inline">
        <input type="checkbox" ${c.cumplido ? 'checked' : ''} onchange="toggleChecklistEquipo(${i}, this.checked)">
        ${c.item}
      </label>
      <button type="button" class="btn-remove-entry" onclick="quitarChecklistEquipo(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
      </button>`;
    cont.appendChild(row);
  });
}

function agregarChecklistEquipo() {
  const input = document.getElementById('equipoChecklistNuevo');
  const valor = input.value.trim();
  if (!valor) return;
  equipoChecklistTemp.push({ item: valor, cumplido: false });
  input.value = '';
  renderChecklistTempEquipo();
}

function toggleChecklistEquipo(index, checked) {
  equipoChecklistTemp[index].cumplido = checked;
}

function quitarChecklistEquipo(index) {
  equipoChecklistTemp.splice(index, 1);
  renderChecklistTempEquipo();
}

function renderArchivosTempEquipo() {
  const cont = document.getElementById('equipoArchivosList');
  cont.innerHTML = '';
  equipoArchivosTemp.forEach((nombre, i) => {
    const span = document.createElement('span');
    span.className = 'chip-tag';
    span.innerHTML = `<span>${nombre}</span>
      <button type="button" onclick="quitarArchivoEquipo(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>`;
    cont.appendChild(span);
  });
}

function agregarArchivosEquipo(input) {
  [...input.files].forEach(f => equipoArchivosTemp.push(f.name));
  input.value = '';
  renderArchivosTempEquipo();
}

function quitarArchivoEquipo(index) {
  equipoArchivosTemp.splice(index, 1);
  renderArchivosTempEquipo();
}

function guardarEquipo() {
  const nombreInput = document.getElementById('equipoNombre');
  const fechaInput = document.getElementById('equipoFechaAsignacion');
  limpiarErroresModal('modalEquipo');
  if (!nombreInput.value.trim()) { mostrarErrorCampo(nombreInput, 'Campo obligatorio'); nombreInput.focus(); return; }
  if (!fechaInput.value) { mostrarErrorCampo(fechaInput, 'Campo obligatorio'); fechaInput.focus(); return; }

  const p = PERFILES[perfilActualId];
  const datos = {
    nombre: nombreInput.value.trim(),
    tipo: document.getElementById('equipoTipo').value,
    fechaAsignacion: fechaInput.value,
    estado: document.getElementById('equipoEstado').value,
    checklist: equipoChecklistTemp.map(c => ({ ...c })),
    archivos: [...equipoArchivosTemp],
    observaciones: document.getElementById('equipoObservaciones').value.trim()
  };

  if (equipoEditIndex !== null) {
    p.equiposAsignados[equipoEditIndex] = datos;
  } else {
    p.equiposAsignados.push(datos);
  }

  renderEquiposAsignados(p);
  actualizarBusquedaEquiposPerfil(perfilActualId);
  cerrarModal('modalEquipo');
  mostrarToast('El equipo asignado se guardó con éxito');
}

// =================================================
// MODO EDICIÓN
// =================================================
// Los campos de "Experiencia laboral" usan readOnly (no disabled) para que su texto
// se pueda seleccionar y copiar incluso fuera del modo edición.
function camposPersonal() {
  const todos = [...document.querySelectorAll('#modalPerfil .perfil-panel[data-panel="personal"] input, #modalPerfil .perfil-panel[data-panel="personal"] textarea')]
    .filter(el => el.id !== 'pfCurriculumInput' && el.id !== 'pfTotalAniosExp');
  return {
    experiencia: todos.filter(el => el.closest('#pfExpLaboralList')),
    resto: todos.filter(el => !el.closest('#pfExpLaboralList'))
  };
}

function activarEdicionPerfil() {
  document.querySelector('.perfil-panel[data-panel="personal"]').classList.add('edit-mode');
  const { experiencia, resto } = camposPersonal();
  experiencia.forEach(el => {
    if (!el.classList.contains('exp-auto-field')) el.readOnly = false;
  });
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

document.addEventListener('DOMContentLoaded', () => {
  Object.keys(PERFILES).forEach(id => {
    actualizarBadgeDocumentacion(id);
    actualizarProgresoDocumentacion(id);
    actualizarBusquedaEquiposPerfil(id);
    const fila = document.querySelector(`#tbodyPerfiles tr[data-id="${id}"]`);
    if (fila) fila.dataset.contrato = calcularEstadoContratoPerfil(id);
  });
});
