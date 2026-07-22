// =================================================
// DATA-TABLAS-GENERALES.JS
// Catálogos de "Productos" y "Unidades de Medida" compartidos entre
// el mantenedor de Tablas Generales y el módulo Servicios (Nueva
// Nominación / Aceptación del Servicio). Puertos, Monedas y Tipos de
// Documento siguen siendo filas fijas dentro de tablas-generales.html
// y no usan este archivo.
// =================================================

const PRODUCTOS_DEMO = [
  { id: 1, nombre: 'LNG', descripcion: 'Gas Natural Licuado', estado: 'activo' },
  { id: 2, nombre: 'GLP', descripcion: 'Gas Licuado de Petróleo', estado: 'activo' },
  { id: 3, nombre: 'Crudo', descripcion: 'Petróleo crudo', estado: 'activo' },
  { id: 4, nombre: 'Diesel B5', descripcion: 'Diesel de bajo azufre', estado: 'activo' }
];

const UNIDADES_MEDIDA_DEMO = [
  { id: 1, nombre: 'Barril', descripcion: 'Unidad de volumen para hidrocarburos (BBL)', estado: 'activo' },
  { id: 2, nombre: 'Tonelada Métrica', descripcion: 'Unidad de masa equivalente a 1000 kg (TM)', estado: 'activo' },
  { id: 3, nombre: 'Metro Cúbico', descripcion: 'Unidad de volumen (m3)', estado: 'activo' }
];

function tgCargarCatalogo(storageKey, demo) {
  const raw = localStorage.getItem(storageKey);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(storageKey, JSON.stringify(demo));
  return JSON.parse(JSON.stringify(demo));
}

function tgGuardarCatalogo(storageKey, lista) {
  localStorage.setItem(storageKey, JSON.stringify(lista));
}

function cargarProductos() {
  return tgCargarCatalogo('productosData', PRODUCTOS_DEMO).filter(p => p.estado === 'activo');
}

function cargarUnidadesMedida() {
  return tgCargarCatalogo('unidadesMedidaData', UNIDADES_MEDIDA_DEMO).filter(u => u.estado === 'activo');
}
