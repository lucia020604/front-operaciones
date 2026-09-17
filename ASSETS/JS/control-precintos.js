// =================================================
// CONTROL-PRECINTOS.JS
// Precintos > Control de Precintos (grilla) + modal de Registro y "Ver
// etiquetas". La Asignación de Precintos (crear/editar/anular) vive en su
// propia interfaz — ver asignacion-precintos.html/js.
// =================================================

let precintosNuevosTemp = [];   // precintos agregados en el modal Registro (aún sin guardar)
let precintoEnEdicionIndex = null;   // índice de precintosNuevosTemp que se está editando en línea (null = ninguno)
let precintoEdicionCancelada = false; // evita que Escape dispare el guardado por blur
let codigoRegistroEnEdicion = null;   // código del registro que se está editando (null = nuevo)
let precintosBloqueadosEdicion = new Set(); // precintos del registro en edición que ya están asignados a alguien: no se pueden quitar ni editar desde aquí (evita dejar una Asignación guardada apuntando a un precinto que ya no existe en el lote)
// El Detalle completo con colaboradores/firmas ("Generar Registro de
// Precintos") vive en generar-registro-precintos.js y se abre solo desde
// Reporte de Precintos > Ver. "Ver etiquetas" aquí es una vista simple de
// solo lectura con las etiquetas del lote, según el documento funcional
// ("Permite visualizar el registro de las etiquetas de cada precinto").

document.addEventListener('DOMContentLoaded', () => {
  poblarFiltroMaterialControl();
  renderTablaControlPrecintos();
});

/* =================================================
   GRILLA PRINCIPAL
================================================= */
function obtenerPersonalPorRegistro(codigo) {
  const asignaciones = ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.registroCodigos.includes(codigo));
  const nombreDe = usuario => {
    const u = obtenerUsuarioPorNombre(usuario);
    return u ? `${u.nombre} ${u.apellido}` : usuario;
  };
  const entregados = asignaciones.map(a => nombreDe(a.entregadoPor));
  const recibidos = asignaciones.map(a => nombreDe(a.recibidoPor));
  return { entregados, recibidos };
}

function poblarFiltroMaterialControl() {
  const select = document.getElementById('filterMaterialControl');
  if (!select) return;
  select.innerHTML = '<option value="">Todos</option>' +
    cargarMaterialesPrecinto().map(m => `<option value="${m.nombre}">${m.nombre}</option>`).join('');
}

function renderTablaControlPrecintos() {
  const tbody = document.getElementById('tbodyControlPrecintos');
  const texto = document.getElementById('searchControlPrecintos').value.trim().toLowerCase();
  const filtroEstado = document.getElementById('filterEstadoControl').value;
  const filtroMaterial = document.getElementById('filterMaterialControl').value;

  const filas = PRECINTOS_REGISTROS_DEMO.filter(registro => {
    if (filtroEstado && calcularEstadoLote(registro.codigo) !== filtroEstado) return false;
    if (filtroMaterial && registro.material !== filtroMaterial) return false;
    if (!texto) return true;
    const { entregados, recibidos } = obtenerPersonalPorRegistro(registro.codigo);
    const bolsaTexto = [registro.codigo, ...entregados, ...recibidos].join(' ').toLowerCase();
    return bolsaTexto.includes(texto);
  });

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="submodulo-tabla-vacio">No se encontraron registros de precintos.</td></tr>`;
    return;
  }

  tbody.innerHTML = filas.map((registro) => {
    const estadoLote = calcularEstadoLote(registro.codigo);
    const badgeClase = ESTADO_LOTE_BADGE[estadoLote] || 'badge-gris';
    const total = registro.precintos.length;
    const pendientes = obtenerPrecintosDisponiblesDeLote(registro.codigo).length;
    const pendientesCelda = pendientes
      ? `<span class="asignados-pendiente">${pendientes}</span>`
      : '0';

    const tieneAsignaciones = ASIGNACIONES_PRECINTOS_DEMO.some(a => a.registroCodigos.includes(registro.codigo));
    const botonEliminarAnular = tieneAsignaciones
      ? `<button class="btn-accion btn-inactivar" title="Anular registro" onclick="anularRegistroPrecinto('${registro.codigo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/></svg>
        </button>`
      : `<button class="btn-accion btn-inactivar" title="Eliminar registro" onclick="eliminarRegistroPrecinto('${registro.codigo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>`;

    const botonEditar = estadoLote === 'Anulado'
      ? `<button class="btn-accion btn-editar" title="Un registro anulado no se puede editar" disabled>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>`
      : `<button class="btn-accion btn-editar" title="Editar registro" onclick="abrirModalEditarPrecinto('${registro.codigo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button>`;

    return `
    <tr>
      <td class="codigo-col">${registro.codigo}</td>
      <td>${registro.fecha}</td>
      <td>${registro.material}</td>
      <td>${total}</td>
      <td>${pendientesCelda}</td>
      <td><span class="badge ${badgeClase}"><span class="badge-dot"></span>${estadoLote}</span></td>
      <td class="opciones">
        ${botonEditar}
        ${botonEliminarAnular}
        <button class="btn-accion btn-ver" title="Ver etiquetas" onclick="abrirModalVerEtiquetas('${registro.codigo}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

function filtrarControlPrecintos() {
  renderTablaControlPrecintos();
}

function limpiarFiltrosControlPrecintos() {
  document.getElementById('searchControlPrecintos').value = '';
  document.getElementById('filterEstadoControl').value = '';
  document.getElementById('filterMaterialControl').value = '';
  renderTablaControlPrecintos();
}

function toggleDownloadDropdownControlPrecintos() {
  document.getElementById('downloadDropdownControlPrecintos').classList.toggle('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.btn-download-wrap')) {
    const dd = document.getElementById('downloadDropdownControlPrecintos');
    if (dd) dd.classList.remove('open');
  }
});

function obtenerFilasExportControlPrecintos() {
  return PRECINTOS_REGISTROS_DEMO.map(registro => ({
    codigo: registro.codigo,
    fecha: registro.fecha,
    material: registro.material,
    total: registro.precintos.length,
    pendientes: obtenerPrecintosDisponiblesDeLote(registro.codigo).length,
    estado: calcularEstadoLote(registro.codigo)
  }));
}

function exportarControlPrecintosExcel() {
  const filas = obtenerFilasExportControlPrecintos();
  const headers = ['Código', 'Fecha', 'Material', 'Total', 'Pendientes', 'Estado'];

  const csv = [headers, ...filas.map(f => [f.codigo, f.fecha, f.material, f.total, f.pendientes, f.estado])]
    .map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom  = '﻿'; // BOM para que Excel abra UTF-8 correctamente
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'control-precintos.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  document.getElementById('downloadDropdownControlPrecintos').classList.remove('open');
  mostrarToast('Exportación Excel descargada correctamente.');
}

function exportarControlPrecintosPDF() {
  const filas = obtenerFilasExportControlPrecintos();
  const filasHTML = filas.map(f => `
    <tr>
      <td>${f.codigo}</td>
      <td>${f.fecha}</td>
      <td>${f.material}</td>
      <td>${f.total}</td>
      <td>${f.pendientes}</td>
      <td>${f.estado}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Control de Precintos</title>
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
    <h2>Control de Precintos</h2>
    <table>
      <thead>
        <tr><th>Código</th><th>Fecha</th><th>Material</th><th>Total</th><th>Pendientes</th><th>Estado</th></tr>
      </thead>
      <tbody>${filasHTML}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();

  document.getElementById('downloadDropdownControlPrecintos').classList.remove('open');
}

/* =================================================
   MODAL: REGISTRO DE PRECINTOS (Nuevo / Editar)
================================================= */
function renderTablaPrecintosRegistro() {
  const tbody = document.getElementById('tbodyPrecintosRegistro');
  document.getElementById('registroCantidadInput').value = precintosNuevosTemp.length;

  if (!precintosNuevosTemp.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron precintos.</td></tr>`;
    return;
  }
  tbody.innerHTML = precintosNuevosTemp.map((p, i) => {
    const bloqueado = precintosBloqueadosEdicion.has(p);
    const enEdicion = i === precintoEnEdicionIndex;
    const celda = enEdicion
      ? `<input type="text" class="precinto-editar-input" id="precintoEditarInput"
           value="${p}"
           onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();} if(event.key==='Escape'){event.preventDefault();precintoEdicionCancelada=true;this.blur();}"
           onblur="onBlurPrecintoEditar(${i})">`
      : bloqueado
        ? `${p} <span class="precinto-asignado-tag">Asignado</span>`
        : p;
    const acciones = bloqueado
      ? `<span class="precinto-bloqueado-icono" title="Ya está asignado a alguien; no se puede editar ni quitar desde aquí">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>`
      : enEdicion
        ? `<button type="button" class="btn-editar-fila" title="Guardar" onmousedown="event.preventDefault();guardarEdicionPrecinto(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
          </button>
          <button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintoDeRegistro(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>`
        : `<button type="button" class="btn-editar-fila" title="Editar" onclick="editarPrecintoDeRegistro(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>
          <button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintoDeRegistro(${i})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>`;
    return `
    <tr>
      <td>${i + 1}</td>
      <td>${celda}</td>
      <td>${acciones}</td>
    </tr>`;
  }).join('');

  if (precintoEnEdicionIndex !== null) {
    const input = document.getElementById('precintoEditarInput');
    if (input) { input.focus(); input.select(); }
  }
}

// Agrega un precinto individual (solo "Desde") o, si se completa "Hasta",
// un rango completo de precintos de una sola vez.
function agregarPrecintoARegistro() {
  const inputDesde = document.getElementById('registroPrecintoNuevoInput');
  const inputHasta = document.getElementById('registroPrecintoHastaInput');
  const desde = inputDesde.value.trim();
  const hasta = inputHasta.value.trim();

  if (!desde) { mostrarToast('Ingresa un número de precinto.'); return; }

  let candidatos;
  if (hasta) {
    candidatos = generarRangoPrecintos(desde, hasta);
    if (!candidatos || !candidatos.length) { mostrarToast('El rango ingresado no es válido.'); return; }
    if (candidatos.length > 500) { mostrarToast('El rango es demasiado grande (máximo 500 precintos).'); return; }
  } else {
    candidatos = [desde];
  }

  const nuevos = candidatos.filter(p => !precintosNuevosTemp.includes(p));
  const repetidos = candidatos.length - nuevos.length;

  if (!nuevos.length) { mostrarToast('Ese(s) precinto(s) ya fueron agregados.'); return; }

  precintosNuevosTemp.unshift(...nuevos);
  inputDesde.value = '';
  inputHasta.value = '';
  inputDesde.focus();
  renderTablaPrecintosRegistro();

  if (repetidos > 0) {
    mostrarToast(`Se agregaron ${nuevos.length} precinto(s). ${repetidos} ya existían y se omitieron.`);
  }
}

function editarPrecintoDeRegistro(indice) {
  if (precintosBloqueadosEdicion.has(precintosNuevosTemp[indice])) {
    mostrarToast('Este precinto ya está asignado y no se puede editar.');
    return;
  }
  precintoEnEdicionIndex = indice;
  renderTablaPrecintosRegistro();
}

function onBlurPrecintoEditar(indice) {
  if (precintoEdicionCancelada) {
    precintoEdicionCancelada = false;
    precintoEnEdicionIndex = null;
    renderTablaPrecintosRegistro();
    return;
  }
  guardarEdicionPrecinto(indice);
}

function guardarEdicionPrecinto(indice) {
  const input = document.getElementById('precintoEditarInput');
  if (!input) return;
  const valor = input.value.trim();
  if (!valor) { mostrarToast('El precinto no puede estar vacío.'); input.focus(); return; }
  const duplicado = precintosNuevosTemp.some((p, i) => i !== indice && p === valor);
  if (duplicado) { mostrarToast('Ese precinto ya existe en la lista.'); input.focus(); return; }
  precintosNuevosTemp[indice] = valor;
  precintoEnEdicionIndex = null;
  renderTablaPrecintosRegistro();
}

function quitarPrecintoDeRegistro(indice) {
  if (precintosBloqueadosEdicion.has(precintosNuevosTemp[indice])) {
    mostrarToast('Este precinto ya está asignado y no se puede quitar.');
    return;
  }
  if (precintoEnEdicionIndex === indice) precintoEnEdicionIndex = null;
  precintosNuevosTemp.splice(indice, 1);
  renderTablaPrecintosRegistro();
}

// Material del precinto (plástico, metálico, circular, ...): combo cargado
// desde Configuración > Tablas Generales en vez de opciones fijas en el HTML.
function poblarSelectMaterialRegistro() {
  const select = document.getElementById('registroMaterialInput');
  select.innerHTML = cargarMaterialesPrecinto().map(m => `<option value="${m.nombre}">${m.nombre}</option>`).join('');
}

function abrirModalRegistrarPrecinto() {
  codigoRegistroEnEdicion = null;
  precintosNuevosTemp = [];
  precintoEnEdicionIndex = null;
  precintosBloqueadosEdicion = new Set();

  document.getElementById('modalRegistroPrecintoTitulo').textContent = 'Registro de Precintos';
  document.getElementById('registroCodigoInput').value = generarCodigoRegistroPrecinto();
  poblarSelectMaterialRegistro();
  limpiarErroresModal('modalRegistroPrecinto');
  renderTablaPrecintosRegistro();
  abrirModal('modalRegistroPrecinto');
}

function abrirModalEditarPrecinto(codigo) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return;

  codigoRegistroEnEdicion = codigo;
  precintosNuevosTemp = [...registro.precintos];
  precintoEnEdicionIndex = null;
  // Precintos ya asignados a alguien: se muestran pero no se pueden quitar ni
  // editar, para no dejar una Asignación guardada apuntando a un precinto
  // que este modal borró silenciosamente del lote.
  precintosBloqueadosEdicion = obtenerPrecintosAsignadosDeLote(codigo);

  document.getElementById('modalRegistroPrecintoTitulo').textContent = 'Editar Registro de Precintos';
  document.getElementById('registroCodigoInput').value = registro.codigo;
  poblarSelectMaterialRegistro();
  document.getElementById('registroMaterialInput').value = registro.material;
  limpiarErroresModal('modalRegistroPrecinto');
  renderTablaPrecintosRegistro();
  abrirModal('modalRegistroPrecinto');
}

function guardarRegistroPrecinto() {
  limpiarErroresModal('modalRegistroPrecinto');

  // Red de seguridad además del bloqueo en la grilla: si por algún motivo
  // falta un precinto ya asignado, no se guarda (ver precintosBloqueadosEdicion).
  const faltantes = [...precintosBloqueadosEdicion].filter(p => !precintosNuevosTemp.includes(p));
  if (faltantes.length) {
    mostrarToast('No se puede guardar: faltan precintos que ya están asignados a alguien.');
    return;
  }

  if (!precintosNuevosTemp.length) {
    mostrarToast('Agrega al menos un precinto antes de guardar.');
    return;
  }

  const material = document.getElementById('registroMaterialInput').value;

  if (codigoRegistroEnEdicion) {
    const registro = obtenerRegistroPrecintoPorCodigo(codigoRegistroEnEdicion);
    registro.material = material;
    registro.precintos = [...precintosNuevosTemp];
  } else {
    PRECINTOS_REGISTROS_DEMO.unshift({
      codigo: document.getElementById('registroCodigoInput').value,
      fecha: fechaISOaDDMMYYYY(new Date().toISOString().slice(0, 10)),
      estado: 'Registrado',
      material,
      precintos: [...precintosNuevosTemp]
    });
  }

  cerrarModal('modalRegistroPrecinto');
  renderTablaControlPrecintos();
  mostrarModalGuardado(codigoRegistroEnEdicion ? 'editar' : 'crear', null, () => {});
}

function eliminarRegistroPrecinto(codigo) {
  // El botón "Eliminar" solo se muestra cuando el lote todavía no tiene
  // ninguna asignación (ver botonEliminarAnular en renderTablaControlPrecintos),
  // así que acá nunca hay asignaciones que arrastrar.
  confirmarAccion(`¿Está seguro de eliminar el registro ${codigo}? Esta acción no se puede deshacer.`, () => {
    const indice = PRECINTOS_REGISTROS_DEMO.findIndex(r => r.codigo === codigo);
    if (indice !== -1) PRECINTOS_REGISTROS_DEMO.splice(indice, 1);
    renderTablaControlPrecintos();
    mostrarToast('El registro fue eliminado correctamente.');
  });
}

// Alternativa a eliminar cuando el lote ya tiene asignaciones: en vez de
// borrar el historial de quién recibió qué precinto, lo cierra para que no
// se le puedan agregar más asignaciones (Asignación de Precintos deja de
// ofrecer este lote como origen cuando su estado calculado es "Anulado").
function anularRegistroPrecinto(codigo) {
  confirmarAccion(`¿Está seguro de anular el registro ${codigo}? Las asignaciones ya hechas se conservan como historial, pero no se podrán agregar más asignaciones a este lote. Esta acción no se puede deshacer.`, () => {
    const registro = obtenerRegistroPrecintoPorCodigo(codigo);
    if (registro) registro.estado = 'Anulado';
    renderTablaControlPrecintos();
    mostrarToast('El registro fue anulado.');
  });
}

const ESTADO_LOTE_BADGE = {
  'Registrado': 'badge-gris',
  'Parcialmente asignado': 'badge-por-vencer',
  'Asignado': 'badge-vigente',
  'Finalizado': 'badge-finalizado',
  'Anulado': 'badge-inactivo'
};

/* =================================================
   MODAL: VER ETIQUETAS (solo lectura, etiquetas del lote)
================================================= */
function abrirModalVerEtiquetas(codigo) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return;

  document.getElementById('etiquetasCodigo').textContent = registro.codigo;
  document.getElementById('etiquetasFecha').textContent = registro.fecha;
  document.getElementById('etiquetasEstado').textContent = calcularEstadoLote(codigo);
  document.getElementById('etiquetasMaterial').textContent = registro.material;

  const tbody = document.getElementById('tbodyVerEtiquetas');
  tbody.innerHTML = registro.precintos.length
    ? registro.precintos.map((p, i) => `<tr><td>${i + 1}</td><td>${p}</td></tr>`).join('')
    : `<tr><td colspan="2" class="submodulo-tabla-vacio">Este registro no tiene precintos añadidos.</td></tr>`;

  abrirModal('modalVerEtiquetas');
}
