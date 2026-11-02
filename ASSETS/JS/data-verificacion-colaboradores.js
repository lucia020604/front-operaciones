// =================================================
// DATA-VERIFICACION-COLABORADORES.JS
// Datos de ejemplo (prototipo sin backend) para Reportes > Verificación de
// información de colaborador. Replica el catálogo de documentos de
// Configuración de Documentos (configuracion-documentos.js → DOCUMENTOS) y el
// perfil de cada colaborador de Información Profesional
// (informacion-profesional.js → PERFILES) con solo los campos que usa el reporte.
// =================================================

// Documentos activos, los roles para los que están "Solicitado" y los clientes que los solicitan
// y los días de aviso configurados (alertas) 
// (Configuración de Documentos → Clientes). Los clientes de ejemplo piden documentos distintos para
// que el filtro por cliente muestre diferencias.
const CLIENTES_VERIF = ["Sandra Motors", "Naviera del Pacífico S.A.", "Perú LNG S.R.L.", "Shell Trading Perú"];

const DOCUMENTOS_VERIF = [
  { id: 1, nombre: "Curso1", seccion: "cursos", roles: ["Administrador","Gerente de Laboratorio","Analista","Inspector","Supervisor","Practicante"], clientes: ["Shell Trading Perú"], alertas: [30, 20, 10, 5, 3, 2] },
  { id: 2, nombre: "DNI", seccion: "basica", roles: ["Administrador","Gerente de Laboratorio","Analista","Inspector","Tecnico Especialista","Supervisor","Jefe de Area","Practicante","Consulta Restringida"], clientes: ["Sandra Motors", "Naviera del Pacífico S.A.", "Perú LNG S.R.L.", "Shell Trading Perú"], alertas: [] },
  { id: 3, nombre: "Contrato de Trabajo", seccion: "basica", roles: ["Administrador","Gerente de Laboratorio","Analista","Inspector","Tecnico Especialista","Supervisor","Jefe de Area","Practicante","Consulta Restringida"], clientes: ["Sandra Motors", "Naviera del Pacífico S.A.", "Perú LNG S.R.L.", "Shell Trading Perú"], alertas: [30, 15] },
  { id: 4, nombre: "Curso de Seguridad Portuaria", seccion: "cursos", roles: ["Administrador","Gerente de Laboratorio","Analista","Inspector","Tecnico Especialista","Supervisor","Jefe de Area","Practicante","Consulta Restringida"], clientes: ["Sandra Motors", "Naviera del Pacífico S.A.", "Perú LNG S.R.L."], alertas: [30, 10] },
  { id: 5, nombre: "Curso de Primeros Auxilios", seccion: "cursos", roles: ["Administrador","Tecnico Especialista","Jefe de Area","Consulta Restringida"], clientes: ["Naviera del Pacífico S.A.", "Perú LNG S.R.L."], alertas: [20] },
  { id: 6, nombre: "Certificación ISO 9001", seccion: "certificaciones", roles: ["Administrador","Gerente de Laboratorio","Analista","Inspector","Tecnico Especialista","Supervisor","Jefe de Area","Practicante","Consulta Restringida"], clientes: ["Naviera del Pacífico S.A.", "Perú LNG S.R.L.", "Shell Trading Perú"], alertas: [60, 30] },
  { id: 8, nombre: "Inglés — Nivel Avanzado", seccion: "idiomas", roles: ["Administrador","Gerente de Laboratorio","Analista","Inspector","Tecnico Especialista","Supervisor","Jefe de Area","Practicante","Consulta Restringida"], clientes: ["Perú LNG S.R.L.", "Shell Trading Perú"], alertas: [] }
];

// "contratos" se verifica contra el documento "Contrato de Trabajo"; "dni" contra "DNI";
// "documentos" agrupa cursos, certificaciones e idiomas por nombre de documento.
// "ausencias" = vacaciones, descansos médicos y permisos especiales.
const COLABORADORES_VERIF = [
  {
    id: 1, nombre: "Sandra", apellido: "Echavarria", rol: "Supervisor", dni: "40827450", lemonCard: "LC-00214", lemonVenc: "2027-03-01",
    contratos: [{"inicio":"2022-03-01","fin":"2023-02-28"},{"inicio":"2023-03-01","fin":"2024-02-29"},{"inicio":"2024-03-01","fin":"2026-12-31"}],
    documentos: [
      {"nombre":"Curso de Seguridad Portuaria","inicio":"2023-01-10","fin":"2027-01-10","sinDuracion":false,"archivo":true,"actualizado":"2023-01-15"},
      {"nombre":"Curso de Primeros Auxilios","inicio":"2022-05-01","fin":"2024-05-01","sinDuracion":false,"archivo":true,"actualizado":"2022-05-05"},
      {"nombre":"Curso de Manejo Defensivo","inicio":"","fin":"","sinDuracion":false,"archivo":false,"actualizado":""},
      {"nombre":"Certificación ISO 9001","inicio":"2021-01-01","fin":"2024-01-01","sinDuracion":false,"archivo":true,"actualizado":"2021-01-10"},
      {"nombre":"Certificación de Manejo Seguro","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2022-06-01"},
      {"nombre":"Inglés — Nivel Avanzado","inicio":"2020-01-01","fin":"2023-01-01","sinDuracion":false,"archivo":true,"actualizado":"2020-01-05"}
    ],
    ausencias: [{"tipo":"Vacaciones","inicio":"2026-08-01","fin":"2026-08-15"},{"tipo":"Vacaciones","inicio":"2025-01-06","fin":"2025-01-20"},{"tipo":"Descanso Médico","inicio":"2026-07-05","fin":"2026-07-12"},{"tipo":"Descanso Médico","inicio":"2024-11-02","fin":"2024-11-06"},{"tipo":"Permiso Especial","inicio":"2026-08-10","fin":"2026-08-10"}]
  },
  {
    id: 2, nombre: "Bandy", apellido: "Jimenez", rol: "Administrador", dni: "", lemonCard: "", lemonVenc: "",
    contratos: [{"inicio":"2019-07-15","fin":"2025-01-31"}],
    documentos: [
      {"nombre":"Curso de Ética y Cumplimiento","inicio":"","fin":"","sinDuracion":false,"archivo":false,"actualizado":""}
    ],
    ausencias: [{"tipo":"Vacaciones","inicio":"2025-12-01","fin":"2025-12-15"}]
  },
  {
    id: 3, nombre: "Josue", apellido: "Ramos", rol: "Jefe de Area", dni: "", lemonCard: "LC-00187", lemonVenc: "2027-01-10",
    contratos: [{"inicio":"2021-01-10","fin":"2026-12-31"}],
    documentos: [
      {"nombre":"Curso de Gestión de Riesgos","inicio":"2023-02-01","fin":"2026-11-20","sinDuracion":false,"archivo":true,"actualizado":"2023-02-05"},
      {"nombre":"Curso de Liderazgo Operativo","inicio":"","fin":"","sinDuracion":false,"archivo":false,"actualizado":""},
      {"nombre":"Certificación en Gestión Portuaria","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2023-03-01"}
    ],
    ausencias: [{"tipo":"Vacaciones","inicio":"2026-09-10","fin":"2026-09-24"},{"tipo":"Vacaciones","inicio":"2025-03-01","fin":"2025-03-10"},{"tipo":"Descanso Médico","inicio":"2026-06-20","fin":"2026-06-27"}]
  },
  {
    id: 4, nombre: "Carlos", apellido: "Mendoza", rol: "Inspector", dni: "42318760", lemonCard: "LC-00231", lemonVenc: "2027-03-15",
    contratos: [{"inicio":"2020-03-15","fin":"2027-03-15"}],
    documentos: [
      {"nombre":"Curso de Seguridad Portuaria","inicio":"2023-05-01","fin":"2026-11-25","sinDuracion":false,"archivo":true,"actualizado":"2023-05-10"},
      {"nombre":"Curso de Primeros Auxilios","inicio":"2022-08-01","fin":"2026-08-01","sinDuracion":false,"archivo":true,"actualizado":"2022-08-05"},
      {"nombre":"Certificación ISO 14001","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2021-09-01"},
      {"nombre":"Inglés — Nivel Intermedio","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2020-04-01"}
    ],
    ausencias: [{"tipo":"Vacaciones","inicio":"2026-12-01","fin":"2026-12-15"}]
  },
  {
    id: 5, nombre: "María", apellido: "López", rol: "Coordinador", dni: "38921540", lemonCard: "LC-00198", lemonVenc: "2027-09-01",
    contratos: [{"inicio":"2018-09-01","fin":"2027-08-31"}],
    documentos: [
      {"nombre":"Curso de Gestión de Calidad","inicio":"2022-03-01","fin":"2027-03-01","sinDuracion":false,"archivo":true,"actualizado":"2022-03-10"},
      {"nombre":"Certificación PMP","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2020-06-01"},
      {"nombre":"Certificación ISO 9001","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2019-11-01"},
      {"nombre":"Inglés — Nivel Avanzado","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2018-10-01"},
      {"nombre":"Francés — Nivel Básico","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2019-01-01"}
    ],
    ausencias: [{"tipo":"Vacaciones","inicio":"2026-07-20","fin":"2026-08-03"}]
  },
  {
    id: 6, tienePerfil: false, nombre: "Luis", apellido: "Paredes", rol: "Inspector", dni: "45120987", lemonCard: "", lemonVenc: "",
    contratos: [{"inicio":"2025-01-01","fin":"2029-12-31"}],
    documentos: [
      {"nombre":"Curso1","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-09-15"},
      {"nombre":"Curso de Seguridad Portuaria","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-09-15"},
      {"nombre":"Certificación ISO 9001","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-09-15"},
      {"nombre":"Inglés — Nivel Avanzado","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2026-09-15"}
    ],
    ausencias: []
  },
  {
    id: 7, tienePerfil: false, nombre: "Ana", apellido: "Quispe", rol: "Supervisor", dni: "41763205", lemonCard: "", lemonVenc: "",
    contratos: [{"inicio":"2025-01-01","fin":"2029-12-31"}],
    documentos: [
      {"nombre":"Curso1","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-10-03"},
      {"nombre":"Curso de Seguridad Portuaria","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-10-03"},
      {"nombre":"Certificación ISO 9001","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-10-03"},
      {"nombre":"Inglés — Nivel Avanzado","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-10-03"}
    ],
    ausencias: [{"tipo":"Permiso Especial","inicio":"2026-11-10","fin":"2026-11-10"}]
  },
  {
    id: 8, tienePerfil: false, nombre: "Pedro", apellido: "Castillo", rol: "Analista", dni: "47559128", lemonCard: "", lemonVenc: "",
    contratos: [{"inicio":"2025-01-01","fin":"2029-12-31"}],
    documentos: [
      {"nombre":"Curso1","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-08-21"},
      {"nombre":"Curso de Seguridad Portuaria","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-08-21"},
      {"nombre":"Certificación ISO 9001","inicio":"","fin":"","sinDuracion":true,"archivo":true,"actualizado":"2026-08-21"},
      {"nombre":"Inglés — Nivel Avanzado","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-08-21"}
    ],
    ausencias: []
  },
  {
    id: 9, tienePerfil: false, nombre: "Rosa", apellido: "Vargas", rol: "Jefe de Area", dni: "40236781", lemonCard: "", lemonVenc: "",
    contratos: [{"inicio":"2025-01-01","fin":"2029-12-31"}],
    documentos: [
      {"nombre":"Curso de Seguridad Portuaria","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-10-20"},
      {"nombre":"Curso de Primeros Auxilios","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-10-20"},
      {"nombre":"Certificación ISO 9001","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-10-20"},
      {"nombre":"Inglés — Nivel Avanzado","inicio":"2025-01-01","fin":"2029-12-31","sinDuracion":false,"archivo":true,"actualizado":"2026-10-20"}
    ],
    ausencias: [{"tipo":"Vacaciones","inicio":"2026-12-01","fin":"2026-12-15"}]
  }
];
