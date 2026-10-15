// =================================================
// DATA-ACTIVIDADES.JS
// Catálogo de Actividades (prototipo sin backend, persistido en
// localStorage) usado por el mantenedor de Actividades.
// =================================================

const ACT_DESC = 'Registro de actividades';

const ACTIVIDADES_DEMO = [
  { id: 1,  nombre: 'Arribo',                          descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 2,  nombre: 'Fondeo',                           descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 3,  nombre: 'Inicio de Maniobra',                descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 4,  nombre: 'Término de Maniobra',               descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 5,  nombre: 'Conexión',                          descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 6,  nombre: 'Inicio',                            descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 7,  nombre: 'Termino',                           descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 8,  nombre: 'Documentos firmados',                descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 9,  nombre: 'Liquidación',                       descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 10, nombre: 'Desembarque',                       descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 11, nombre: 'Retorno a base',                    descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 12, nombre: 'Inicio de guardia',                 descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 13, nombre: 'Unidades atendidas',                descripcion: ACT_DESC, tipo: 'numerico',   estado: 'activo' },
  { id: 14, nombre: 'Termino de guardia',                descripcion: ACT_DESC, tipo: 'fecha_hora', estado: 'activo' },
  { id: 15, nombre: 'Cantidad de Tanques',                descripcion: ACT_DESC, tipo: 'numerico',   estado: 'activo' },
  { id: 16, nombre: 'Cantidad de tanques muestreada',     descripcion: ACT_DESC, tipo: 'numerico',   estado: 'activo' }
];

function actCargarCatalogo() {
  const raw = localStorage.getItem('actividadesData');
  if (raw) return JSON.parse(raw);
  localStorage.setItem('actividadesData', JSON.stringify(ACTIVIDADES_DEMO));
  return JSON.parse(JSON.stringify(ACTIVIDADES_DEMO));
}

function actGuardarCatalogo(lista) {
  localStorage.setItem('actividadesData', JSON.stringify(lista));
}
