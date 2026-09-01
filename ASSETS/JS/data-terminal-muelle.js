// =================================================
// DATA-TERMINAL-MUELLE.JS
// Catálogos de "Terminales" y "Muelles", relacionados jerárquicamente con
// Puertos (data-tablas-generales.js): Puerto → Terminal → Muelle.
//
// Nombrados TERMINAL_PUERTO_DEMO / cargarTerminalesPuerto() (en vez de
// TERMINALES/cargarTerminales) para no chocar con la constante TERMINALES
// que ya existe en operaciones.js — esa es la lista de PUERTOS que usa la
// matriz de Distancias-Horas, un concepto distinto al de este archivo.
//
// Depende de tgCargarCatalogo/tgGuardarCatalogo (data-tablas-generales.js),
// que debe cargarse antes que este script.
// =================================================

const TERMINAL_PUERTO_DEMO = [
  { id: 1, nombre: 'Terminal Norte', puerto: 'Callao', descripcion: 'Terminal de graneles líquidos', estado: 'activo' },
  { id: 2, nombre: 'Terminal Sur', puerto: 'Callao', descripcion: 'Terminal de contenedores', estado: 'activo' },
  { id: 3, nombre: 'Terminal Paita', puerto: 'Paita', descripcion: 'Terminal multipropósito', estado: 'activo' }
];

const MUELLE_DEMO = [
  { id: 1, nombre: 'Muelle 1', terminal: 'Terminal Norte', descripcion: 'Atraque para buques tanque', estado: 'activo' },
  { id: 2, nombre: 'Muelle 2', terminal: 'Terminal Norte', descripcion: 'Atraque para buques tanque', estado: 'activo' },
  { id: 3, nombre: 'Muelle 5', terminal: 'Terminal Sur', descripcion: 'Atraque para portacontenedores', estado: 'activo' }
];

function cargarTerminalesPuerto() {
  return tgCargarCatalogo('terminalesPuertoData', TERMINAL_PUERTO_DEMO).filter(t => t.estado === 'activo');
}

function cargarMuelles() {
  return tgCargarCatalogo('muellesData', MUELLE_DEMO).filter(m => m.estado === 'activo');
}
