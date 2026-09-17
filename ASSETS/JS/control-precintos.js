// =================================================
// CONTROL-PRECINTOS.JS
// Precintos > Control de Precintos (grilla) + modales de Registro,
// Asignación y "Generar Registro" (Detalle / Ver etiquetas).
// =================================================

let precintosNuevosTemp = [];   // precintos agregados en el modal Registro (aún sin guardar)
let precintoEnEdicionIndex = null;   // índice de precintosNuevosTemp que se está editando en línea (null = ninguno)
let precintoEdicionCancelada = false; // evita que Escape dispare el guardado por blur
let codigoRegistroEnEdicion = null;   // código del registro que se está editando (null = nuevo)
let precintosBloqueadosEdicion = new Set(); // precintos del registro en edición que ya están asignados a alguien: no se pueden quitar ni editar desde aquí (evita dejar una Asignación guardada apuntando a un precinto que ya no existe en el lote)
let codigoAsignacionActivo = null;    // código del registro sobre el que se abrió Asignación
// El Detalle completo con colaboradores/firmas ("Generar Registro de
// Precintos") vive en generar-registro-precintos.js y se abre solo desde
// Reporte de Precintos > Ver (por PER). "Ver etiquetas" aquí es una vista
// simple de solo lectura con las etiquetas del lote, según el documento
// funcional ("Permite visualizar el registro de las etiquetas de cada
// precinto").

document.addEventListener('DOMContentLoaded', () => {
  poblarFiltroMaterialControl();
  renderTablaControlPrecintos();
  renderTablaOperadoresControl();
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

/* =================================================
   MODAL: ASIGNACIONES POR OPERADOR — a cada persona que recibió precintos
   (recibidoPor) se le ve, de un vistazo, qué material/lote tiene asignado en
   total — sumando todas sus asignaciones — y se puede expandir a cada
   entrega puntual (fecha, entregado por, motivo, PER). Responde directamente
   "de qué lote y material se le está asignando a cada operador", que ni la
   grilla de Lotes (agrupada por lote, no por persona) ni Reporte de
   Precintos (agrupado por PER, no por operador) muestran.
================================================= */
let filasExpandidasOperadores = new Set();

function abrirModalOperadoresAsignados() {
  renderTablaOperadoresControl();
  abrirModal('modalOperadoresAsignados');
}

function obtenerOperadoresConAsignaciones() {
  return [...new Set(ASIGNACIONES_PRECINTOS_DEMO.map(a => a.recibidoPor))];
}

function obtenerAsignacionesDeOperador(operador) {
  return ASIGNACIONES_PRECINTOS_DEMO.filter(a => a.recibidoPor === operador);
}

// Desglosa un conjunto de asignaciones (todas las de un operador, o una sola
// asignación puntual) en Material → Lote → cantidad de precintos.
function desglosarPorMaterialYLote(asignaciones) {
  const porMaterial = new Map();
  asignaciones.forEach(a => {
    a.precintos.forEach(p => {
      const lote = obtenerLoteDePrecinto(p);
      if (!lote) return;
      if (!porMaterial.has(lote.material)) porMaterial.set(lote.material, new Map());
      const porLote = porMaterial.get(lote.material);
      porLote.set(lote.codigo, (porLote.get(lote.codigo) || 0) + 1);
    });
  });
  return porMaterial;
}

function formatearDesgloseMaterialLote(porMaterial) {
  if (!porMaterial.size) return '—';
  return [...porMaterial.entries()].map(([material, porLote]) => {
    const lotesTexto = [...porLote.entries()].map(([lote, cant]) => `${lote}: ${cant}`).join(', ');
    return `<span class="material-tag">${material}</span>${lotesTexto}`;
  }).join('<br>');
}

function renderTablaOperadoresControl() {
  const tbody = document.getElementById('tbodyOperadoresControl');
  if (!tbody) return;

  const filas = obtenerOperadoresConAsignaciones()
    .map(operador => {
      const asignaciones = obtenerAsignacionesDeOperador(operador);
      const porMaterial = desglosarPorMaterialYLote(asignaciones);
      const u = obtenerUsuarioPorNombre(operador);
      const nombre = u ? `${u.nombre} ${u.apellido}` : operador;
      return { operador, nombre, asignaciones, porMaterial };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="submodulo-tabla-vacio">Todavía no hay precintos asignados a ningún operador.</td></tr>`;
    return;
  }

  tbody.innerHTML = filas.map(f => {
    const total = f.asignaciones.reduce((suma, a) => suma + a.cantidad, 0);
    const ultimaFecha = [...f.asignaciones]
      .sort((a, b) => fechaDDMMYYYYaISO(b.fecha).localeCompare(fechaDDMMYYYYaISO(a.fecha)))[0].fecha;
    const expandido = filasExpandidasOperadores.has(f.operador);

    const botonExpandir = `<button type="button" class="btn-expandir-fila${expandido ? ' expandido' : ''}" title="${expandido ? 'Contraer' : 'Expandir'} asignaciones" onclick="toggleFilaDetalleOperador('${f.operador}')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </button>`;

    const filaDetalle = `<tr class="fila-detalle-precintos" style="display:${expandido ? '' : 'none'}">
      <td colspan="6">${renderAsignacionesDeOperadorDetalle(f.asignaciones)}</td>
    </tr>`;

    return `<tr>
      <td class="celda-expandir">${botonExpandir}</td>
      <td>${f.nombre}</td>
      <td>${formatearDesgloseMaterialLote(f.porMaterial)}</td>
      <td>${total}</td>
      <td>${f.asignaciones.length}</td>
      <td>${ultimaFecha}</td>
    </tr>${filaDetalle}`;
  }).join('');
}

function toggleFilaDetalleOperador(operador) {
  if (filasExpandidasOperadores.has(operador)) filasExpandidasOperadores.delete(operador);
  else filasExpandidasOperadores.add(operador);
  renderTablaOperadoresControl();
}

// Detalle expandido de un operador: cada entrega puntual que recibió, con su
// propio desglose de material/lote (una asignación puede incluir varios).
function renderAsignacionesDeOperadorDetalle(asignaciones) {
  const filasHtml = [...asignaciones]
    .sort((a, b) => fechaDDMMYYYYaISO(b.fecha).localeCompare(fechaDDMMYYYYaISO(a.fecha)))
    .map(a => {
      const entregado = obtenerUsuarioPorNombre(a.entregadoPor);
      const entregadoNombre = entregado ? `${entregado.nombre} ${entregado.apellido}` : a.entregadoPor;
      const perCelda = !a.pers.length
        ? '—'
        : a.pers.length === 1
          ? a.pers[0]
          : `${a.pers[0]} <span class="per-mas">+${a.pers.length - 1} más</span>`;
      const anulada = a.registroCodigos.some(c => calcularEstadoLote(c) === 'Anulado');
      const botonEditar = anulada
        ? `<button type="button" class="btn-editar-fila" title="Uno de los lotes incluidos está anulado; no se puede editar" disabled>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>`
        : `<button type="button" class="btn-editar-fila" title="Editar" onclick="editarAsignacionDesdeControl(${a.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
          </button>`;

      return `<tr>
        <td>${a.fecha}</td>
        <td>${entregadoNombre}</td>
        <td>${formatearDesgloseMaterialLote(desglosarPorMaterialYLote([a]))}</td>
        <td>${a.cantidad}</td>
        <td>${perCelda}</td>
        <td>
          <button type="button" class="btn-ver-fila" title="Ver detalle" onclick="abrirModalVerDetalleAsignacion(${a.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          ${botonEditar}
          <button type="button" class="btn-quitar-fila" title="Eliminar asignación" onclick="eliminarAsignacionDesdeControl(${a.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      </tr>`;
    }).join('');

  return `
    <div class="precintos-anidados-marco">
      <table class="tabla-precintos-anidada">
        <thead><tr><th>Fecha</th><th>Entregado por</th><th>Material / Lote</th><th>Cant.</th><th>PER</th><th>Opciones</th></tr></thead>
        <tbody>${filasHtml}</tbody>
      </table>
    </div>`;
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

// Arma una lista secuencial de precintos entre "desde" y "hasta" conservando
// el prefijo y el relleno de ceros del valor "desde" (ej. A-10021 → A-10030
// genera A-10021, A-10022, ..., A-10030).
function generarRangoPrecintos(desde, hasta) {
  const matchDesde = String(desde).match(/^(.*?)(\d+)\s*$/);
  const matchHasta = String(hasta).match(/(\d+)\s*$/);
  if (!matchDesde || !matchHasta) return null;

  const prefijo = matchDesde[1];
  const ancho = matchDesde[2].length;
  const nDesde = parseInt(matchDesde[2], 10);
  const nHasta = parseInt(matchHasta[1], 10);
  if (isNaN(nDesde) || isNaN(nHasta) || nHasta < nDesde) return null;

  const lista = [];
  for (let n = nDesde; n <= nHasta; n++) {
    lista.push(`${prefijo}${String(n).padStart(ancho, '0')}`);
  }
  return lista;
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
// se le puedan agregar más asignaciones (renderAsignacionesDeOperadorDetalle
// deshabilita "Editar" en las asignaciones que incluyen un lote Anulado).
function anularRegistroPrecinto(codigo) {
  confirmarAccion(`¿Está seguro de anular el registro ${codigo}? Las asignaciones ya hechas se conservan como historial, pero no se podrán agregar más asignaciones a este lote. Esta acción no se puede deshacer.`, () => {
    const registro = obtenerRegistroPrecintoPorCodigo(codigo);
    if (registro) registro.estado = 'Anulado';
    renderTablaControlPrecintos();
    renderTablaOperadoresControl();
    mostrarToast('El registro fue anulado.');
  });
}

/* =================================================
   MODAL: ASIGNACIÓN DE PRECINTOS
   Cada asignación es de un entregado/recibido específico: para asignar a
   otra persona se abre "Asignar precintos" de nuevo y se genera un registro
   nuevo, en vez de agrupar varias personas dentro de un mismo registro (eso
   generaba confusión sobre quién recibió qué precintos). La asignación es
   ante todo un conjunto de precintos (tomados únicamente de lo ya
   registrado y disponible en el lote — aquí no se "agrega" un precinto
   nuevo, se "asigna" uno que ya existe); el PER es opcional y aparte: ese
   mismo conjunto puede quedar sin PER, con uno solo, o repartido entre
   varios.
================================================= */
let precintosAsignacionTemp = [];   // precintos asignados en el modal Asignación (aún sin guardar)
let persAsignacionTemp = [];        // PER (opcionales) agregados en el modal Asignación (aún sin guardar)
let asignacionEnEdicionId = null;   // id de la asignación que se está editando (null = una nueva)

function poblarSelectEntregadoPorAsignacion() {
  const rolSupervisor = obtenerRolPorNombre('Supervisor');
  const select = document.getElementById('asignacionEntregadoPorInput');
  select.innerHTML = '<option value="">Seleccionar responsable</option>' + USUARIOS_DEMO
    .filter(u => u.estado === 'activo' && rolSupervisor && obtenerIdsRolesUsuario(u).includes(rolSupervisor.id))
    .map(u => `<option value="${u.usuario}">${u.nombre} ${u.apellido}</option>`).join('');
}

function poblarSelectRecibidoPorAsignacion() {
  const rolInspector = obtenerRolPorNombre('Inspector');
  const select = document.getElementById('asignacionRecibidoPorInput');
  select.innerHTML = '<option value="">Seleccionar receptor</option>' + USUARIOS_DEMO
    .filter(u => u.estado === 'activo' && rolInspector && obtenerIdsRolesUsuario(u).includes(rolInspector.id))
    .map(u => `<option value="${u.usuario}">${u.nombre} ${u.apellido}</option>`).join('');
}

// Extrae el prefijo de un código de precinto (ej. "A-10010" → "A-") para
// validar que "Desde" y "Hasta" pertenezcan a la misma serie antes de armar
// el rango (un lote puede tener precintos con series distintas).
function prefijoDePrecinto(codigo) {
  const match = String(codigo).match(/^(.*?)\d+\s*$/);
  return match ? match[1] : '';
}

// Precintos del lote que ya fueron asignados en otro registro (a cualquier
// receptor), para no ofrecerlos de nuevo en "Asignar Precintos". Al editar
// una asignación existente se excluye su propio id, porque sus precintos
// siguen siendo "suyos" mientras se edita (si no, desaparecerían de las
// opciones disponibles).
function obtenerPrecintosAsignadosDeLote(codigo, excluirId = null) {
  const asignados = new Set();
  ASIGNACIONES_PRECINTOS_DEMO
    .filter(a => a.registroCodigos.includes(codigo) && a.id !== excluirId)
    .forEach(a => a.precintos.forEach(p => asignados.add(p)));
  return asignados;
}

// Precintos del lote (Registro de Precintos) que todavía no fueron
// asignados a nadie, ordenados de menor a mayor numeración. La Asignación
// solo puede repartir precintos que ya existan en ese lote — no crea
// precintos nuevos ni permite escribir cualquier código a mano.
function obtenerPrecintosDisponiblesDeLote(codigo, excluirId = null) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return [];
  const asignados = obtenerPrecintosAsignadosDeLote(codigo, excluirId);
  return registro.precintos
    .filter(p => !asignados.has(p))
    .sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
}

// Estado del lote: se calcula a partir de sus asignaciones y del cierre en
// "Generar Registro" (Revisado/Autorizado), en vez de quedar fijo en el dato
// del registro. "Anulado" es la única excepción — es una decisión manual del
// supervisor (ver anularRegistroPrecinto), así que sí se guarda tal cual.
function calcularEstadoLote(codigo) {
  const registro = obtenerRegistroPrecintoPorCodigo(codigo);
  if (!registro) return null;
  // "Anulado" y "Finalizado" son cierres definitivos que ya se guardan en el
  // dato: el primero lo pone anularRegistroPrecinto, el segundo ya lo ponía
  // finalizarGenerarRegistro (generar-registro-precintos.js) cuando todos los
  // PER del lote quedan Revisados/Autorizados — se respeta esa lógica en vez
  // de volver a derivarla acá para no terminar con dos criterios distintos.
  if (registro.estado === 'Anulado' || registro.estado === 'Finalizado') return registro.estado;

  const tieneAsignaciones = ASIGNACIONES_PRECINTOS_DEMO.some(a => a.registroCodigos.includes(codigo));
  if (!tieneAsignaciones) return 'Registrado';

  return obtenerPrecintosDisponiblesDeLote(codigo).length > 0 ? 'Parcialmente asignado' : 'Asignado';
}

const ESTADO_LOTE_BADGE = {
  'Registrado': 'badge-gris',
  'Parcialmente asignado': 'badge-por-vencer',
  'Asignado': 'badge-vigente',
  'Finalizado': 'badge-finalizado',
  'Anulado': 'badge-inactivo'
};

// Lotes que se pueden elegir para seguir agregando precintos a esta
// Asignación: ni Anulados ni sin nada disponible ya (descontando lo que esta
// misma Asignación, aún sin guardar, ya tomó de cada uno). materialFiltro
// acota la lista al Material elegido (obligatorio) en el combo de arriba.
function obtenerLotesDisponiblesParaAsignar(materialFiltro = null) {
  return PRECINTOS_REGISTROS_DEMO.filter(registro =>
    calcularEstadoLote(registro.codigo) !== 'Anulado' &&
    (!materialFiltro || registro.material === materialFiltro) &&
    obtenerPrecintosDisponiblesDeLote(registro.codigo, asignacionEnEdicionId).some(p => !precintosAsignacionTemp.includes(p))
  );
}

// El Material es el campo obligatorio que gobierna esta sección: se elige
// primero, y recién con eso el combo "Lote" (opcional, para acotar a uno
// puntual) y "Desde/Hasta" se habilitan. Ya no se valida "por lote" — un
// precinto puede tomarse de cualquier lote de ese material sin que el
// usuario tenga que saber a cuál pertenece.
function poblarSelectMaterialFiltroAsignacion(materialAConservar = null) {
  const select = document.getElementById('asignacionMaterialFiltroInput');
  const anterior = materialAConservar !== null ? materialAConservar : select.value;
  const materiales = [...new Set(obtenerLotesDisponiblesParaAsignar().map(r => r.material))];
  select.innerHTML = '<option value="">Seleccionar material</option>' +
    materiales.map(m => `<option value="${m}">${m}</option>`).join('');
  select.value = materiales.includes(anterior) ? anterior : '';
}

// Combo "Lote": deshabilitado hasta que haya un Material elegido. Con
// Material puesto, "Todos los lotes de este material" (value="") es la
// opción normal — dejar un lote puntual elegido es la excepción, para
// cuando el usuario sí quiere acotar a uno en particular.
function poblarSelectLoteAsignacion(loteAConservar = null) {
  const select = document.getElementById('asignacionLoteInput');
  const anterior = loteAConservar || select.value;
  const materialFiltro = document.getElementById('asignacionMaterialFiltroInput').value;

  if (!materialFiltro) {
    select.innerHTML = '<option value="">Selecciona un material primero</option>';
    select.value = '';
    select.disabled = true;
    return;
  }

  select.disabled = false;
  const lotes = obtenerLotesDisponiblesParaAsignar(materialFiltro);
  select.innerHTML = '<option value="">Todos los lotes de este material</option>' +
    lotes.map(r => `<option value="${r.codigo}">${r.codigo}</option>`).join('');
  select.value = lotes.some(r => r.codigo === anterior) ? anterior : '';
}

// Al cambiar de Material se descarta el Lote elegido (pertenecía al
// Material anterior) y se repuebla todo lo que depende de él.
function onCambioMaterialFiltroAsignacion() {
  document.getElementById('asignacionLoteInput').value = '';
  poblarSelectLoteAsignacion();
  poblarSelectsRangoAsignacion();
}

function onCambioLoteAsignacion() {
  poblarSelectsRangoAsignacion();
}

// Precintos disponibles para agregar dado el Material (obligatorio) y,
// opcionalmente, un Lote puntual dentro de ese material. Sin Lote, junta la
// disponibilidad de todos los lotes del material — es lo que permite pedir
// un rango "Desde/Hasta" sin que el usuario tenga que saber de qué lote
// específico sale cada precinto.
function obtenerPrecintosDisponiblesParaAsignacion(materialFiltro, loteFiltro) {
  if (loteFiltro) {
    return obtenerPrecintosDisponiblesDeLote(loteFiltro, asignacionEnEdicionId).filter(p => !precintosAsignacionTemp.includes(p));
  }
  if (!materialFiltro) return [];
  const disponibles = [];
  obtenerLotesDisponiblesParaAsignar(materialFiltro).forEach(r => disponibles.push(...obtenerPrecintosDisponiblesDeLote(r.codigo, asignacionEnEdicionId)));
  return disponibles
    .filter(p => !precintosAsignacionTemp.includes(p))
    .sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
}

// Repuebla los combos "Desde"/"Hasta" con lo que sigue disponible para el
// Material (y, si se acotó, el Lote) elegidos — descontando tanto lo ya
// asignado en otros registros como lo que ya se asignó en esta misma
// Asignación (aún sin guardar).
function poblarSelectsRangoAsignacion() {
  const materialElegido = document.getElementById('asignacionMaterialFiltroInput').value;
  const loteElegido = document.getElementById('asignacionLoteInput').value;
  const disponibles = obtenerPrecintosDisponiblesParaAsignacion(materialElegido, loteElegido);
  const opciones = disponibles.map(p => `<option value="${p}">${p}</option>`).join('');
  document.getElementById('asignacionPrecintoDesdeInput').innerHTML = `<option value="">Desde</option>${opciones}`;
  document.getElementById('asignacionPrecintoHastaInput').innerHTML = `<option value="">Hasta (opcional)</option>${opciones}`;
}

// Asigna un precinto individual (solo "Desde") o un rango completo (si se
// completa "Hasta") — siempre tomando los códigos únicamente de los
// precintos ya registrados y disponibles del Material elegido (en cualquiera
// de sus lotes, salvo que se haya acotado a uno puntual en "Lote").
function asignarPrecintos() {
  const materialElegido = document.getElementById('asignacionMaterialFiltroInput').value;
  const loteElegido = document.getElementById('asignacionLoteInput').value;
  const desdeSelect = document.getElementById('asignacionPrecintoDesdeInput');
  const hastaSelect = document.getElementById('asignacionPrecintoHastaInput');
  const desde = desdeSelect.value;
  const hasta = hastaSelect.value;

  if (!materialElegido) { mostrarToast('Selecciona un material.'); return; }
  if (!desde) { mostrarToast('Selecciona un precinto en "Desde".'); return; }

  let candidatos;
  if (hasta) {
    if (prefijoDePrecinto(desde) !== prefijoDePrecinto(hasta)) {
      mostrarToast('"Desde" y "Hasta" deben pertenecer a la misma serie de precintos.');
      return;
    }
    candidatos = generarRangoPrecintos(desde, hasta);
    if (!candidatos || !candidatos.length) {
      mostrarToast('"Hasta" debe ser mayor o igual que "Desde".');
      return;
    }
    const disponibles = new Set(obtenerPrecintosDisponiblesParaAsignacion(materialElegido, loteElegido));
    if (!candidatos.every(p => disponibles.has(p))) {
      mostrarToast('El rango incluye precintos no disponibles.');
      return;
    }
  } else {
    candidatos = [desde];
  }

  precintosAsignacionTemp.push(...candidatos);

  poblarSelectMaterialFiltroAsignacion(materialElegido);
  poblarSelectLoteAsignacion(loteElegido);
  poblarSelectsRangoAsignacion();
  renderTablaPrecintosAsignacion();
}

function quitarPrecintoDeAsignacion(indice) {
  precintosAsignacionTemp.splice(indice, 1);
  poblarSelectMaterialFiltroAsignacion();
  poblarSelectLoteAsignacion();
  poblarSelectsRangoAsignacion();
  renderTablaPrecintosAsignacion();
}

// Resumen en vivo (materiales / lotes / cantidad) de lo que lleva agregado
// esta Asignación — pensado como checkpoint para detectar antes de Guardar
// si se mezcló un material por error.
function actualizarResumenAsignacion() {
  const chip = document.getElementById('asignacionResumenChip');
  if (!chip) return;

  if (!precintosAsignacionTemp.length) {
    chip.textContent = 'Sin precintos agregados.';
    chip.classList.remove('con-datos');
    return;
  }

  const porMaterial = new Map(); // material -> { cantidad, lotes:Set }
  precintosAsignacionTemp.forEach(p => {
    const lote = obtenerLoteDePrecinto(p);
    const material = lote ? lote.material : '—';
    if (!porMaterial.has(material)) porMaterial.set(material, { cantidad: 0, lotes: new Set() });
    const entrada = porMaterial.get(material);
    entrada.cantidad++;
    if (lote) entrada.lotes.add(lote.codigo);
  });

  const totalLotes = new Set(precintosAsignacionTemp.map(p => obtenerLoteDePrecinto(p)?.codigo).filter(Boolean)).size;
  const chips = [...porMaterial.entries()]
    .map(([material, info]) => `<span class="material-tag">${material}: ${info.cantidad}</span>`)
    .join('');

  chip.innerHTML = `<strong>${precintosAsignacionTemp.length} precinto(s)</strong> · ${porMaterial.size} material(es) · ${totalLotes} lote(s)<br>${chips}`;
  chip.classList.add('con-datos');
}

// Agrupa la tabla de precintos ya agregados por Material → Lote (en vez de
// una lista plana) para que, al mezclar varios, se pueda verificar de un
// vistazo qué se está por asignar antes de Guardar.
function renderTablaPrecintosAsignacion() {
  const tbody = document.getElementById('tbodyPrecintosAsignacion');
  document.getElementById('asignacionCantidadInput').value = precintosAsignacionTemp.length;
  actualizarResumenAsignacion();

  if (!precintosAsignacionTemp.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se asignaron precintos.</td></tr>`;
    return;
  }

  const grupos = new Map(); // material -> Map(loteCodigo -> [{precinto, indice}])
  precintosAsignacionTemp.forEach((p, indice) => {
    const lote = obtenerLoteDePrecinto(p);
    const materialKey = lote ? lote.material : '—';
    const loteKey = lote ? lote.codigo : '—';
    if (!grupos.has(materialKey)) grupos.set(materialKey, new Map());
    const porLote = grupos.get(materialKey);
    if (!porLote.has(loteKey)) porLote.set(loteKey, []);
    porLote.get(loteKey).push({ precinto: p, indice });
  });

  let n = 0;
  let html = '';
  for (const [material, porLote] of grupos) {
    for (const [loteCodigo, items] of porLote) {
      html += `<tr class="fila-grupo-asignacion">
        <td colspan="3"><span class="material-tag">${material}</span>Lote ${loteCodigo} <span class="grupo-asignacion-cant">(${items.length})</span></td>
      </tr>`;
      items.forEach(({ precinto, indice }) => {
        n++;
        html += `<tr>
          <td>${n}</td>
          <td>${precinto}</td>
          <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPrecintoDeAsignacion(${indice})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button></td>
        </tr>`;
      });
    }
  }
  tbody.innerHTML = html;
}

// PER (opcionales) que podrían usar este conjunto de precintos — no están
// atados a un sub-rango específico, es una simple lista aparte.
function poblarSelectPerAsignacion() {
  const select = document.getElementById('asignacionPerInput');
  const disponibles = PER_DEMO_PRECINTOS.filter(per => !persAsignacionTemp.includes(per));
  select.innerHTML = '<option value="">Seleccionar PER</option>' + disponibles.map(per => `<option value="${per}">${per}</option>`).join('');
}

function agregarPerAAsignacion() {
  const select = document.getElementById('asignacionPerInput');
  const valor = select.value;
  if (!valor) { mostrarToast('Selecciona un PER.'); return; }
  if (persAsignacionTemp.includes(valor)) { mostrarToast('Ese PER ya fue agregado.'); return; }
  persAsignacionTemp.push(valor);
  poblarSelectPerAsignacion();
  renderTablaPersAsignacion();
}

function quitarPerDeAsignacion(indice) {
  persAsignacionTemp.splice(indice, 1);
  poblarSelectPerAsignacion();
  renderTablaPersAsignacion();
}

function renderTablaPersAsignacion() {
  const tbody = document.getElementById('tbodyPersAsignacion');
  if (!persAsignacionTemp.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Sin PER agregados (opcional).</td></tr>`;
    return;
  }
  tbody.innerHTML = persAsignacionTemp.map((per, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${per}</td>
      <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarPerDeAsignacion(${i})">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button></td>
    </tr>`).join('');
}

function abrirModalAsignacion(codigo, idAsignacion = null) {
  codigoAsignacionActivo = codigo;
  asignacionEnEdicionId = idAsignacion;
  const existente = idAsignacion ? ASIGNACIONES_PRECINTOS_DEMO.find(a => a.id === idAsignacion) : null;

  precintosAsignacionTemp = existente ? [...existente.precintos] : [];
  persAsignacionTemp = existente ? [...existente.pers] : [];

  document.getElementById('modalAsignacionPrecintosTitulo').textContent =
    existente ? 'Editar Asignación de Precintos' : 'Asignación de Precintos';

  poblarSelectEntregadoPorAsignacion();
  poblarSelectRecibidoPorAsignacion();

  // Material con el que arranca la sección "Asignar Precintos" (obligatorio
  // para poder agregar más): si es una asignación nueva abierta desde un
  // lote puntual, el de ese lote; si es una edición, el de sus precintos —
  // pero solo si todos son del mismo material (si ya mezcla varios, no hay
  // uno "correcto" para preseleccionar y arranca vacío).
  let materialInicial = '';
  if (existente) {
    const materialesExistente = [...new Set(precintosAsignacionTemp.map(p => obtenerLoteDePrecinto(p)?.material).filter(Boolean))];
    materialInicial = materialesExistente.length === 1 ? materialesExistente[0] : '';
  } else if (codigo) {
    materialInicial = obtenerRegistroPrecintoPorCodigo(codigo)?.material || '';
  }
  poblarSelectMaterialFiltroAsignacion(materialInicial);
  poblarSelectLoteAsignacion(codigo);
  poblarSelectsRangoAsignacion();
  poblarSelectPerAsignacion();
  renderTablaPrecintosAsignacion();
  renderTablaPersAsignacion();
  limpiarErroresModal('modalAsignacionPrecintos');

  document.getElementById('asignacionEntregadoPorInput').value = existente ? existente.entregadoPor : '';
  document.getElementById('asignacionRecibidoPorInput').value = existente ? existente.recibidoPor : '';
  document.getElementById('asignacionMotivoInput').value = existente ? existente.motivo : '';
  document.getElementById('asignacionObservacionesInput').value = existente ? existente.observaciones : '';

  abrirModal('modalAsignacionPrecintos');
}

// Detalle de solo lectura de una asignación puntual (una fila de "Reparto
// por persona"): incluye lo que la fila no alcanza a mostrar sin recortarse
// (todos los PER, no solo el primero) y lo que hoy no se ve en ningún lado
// fuera del formulario de edición (Motivo/Servicio, Observaciones).
function abrirModalVerDetalleAsignacion(idAsignacion) {
  const asignacion = ASIGNACIONES_PRECINTOS_DEMO.find(a => a.id === idAsignacion);
  if (!asignacion) return;
  // Puede haber más de un lote de origen (ver registroCodigos): se listan
  // todos los códigos y, si comparten el mismo material, se muestra uno
  // solo; si no, se listan todos.
  const lotes = asignacion.registroCodigos.map(c => obtenerRegistroPrecintoPorCodigo(c)).filter(Boolean);
  const materiales = [...new Set(lotes.map(r => r.material))];

  const entregado = obtenerUsuarioPorNombre(asignacion.entregadoPor);
  const recibido = obtenerUsuarioPorNombre(asignacion.recibidoPor);

  document.getElementById('detalleAsigCodigo').textContent = asignacion.registroCodigos.join(', ');
  document.getElementById('detalleAsigMaterial').textContent = materiales.length ? materiales.join(' / ') : '—';
  document.getElementById('detalleAsigFecha').textContent = asignacion.fecha;
  document.getElementById('detalleAsigEntregado').textContent = entregado ? `${entregado.nombre} ${entregado.apellido}` : asignacion.entregadoPor;
  document.getElementById('detalleAsigRecibido').textContent = recibido ? `${recibido.nombre} ${recibido.apellido}` : asignacion.recibidoPor;
  document.getElementById('detalleAsigCantidad').textContent = asignacion.cantidad;
  document.getElementById('detalleAsigPrecintos').textContent = formatearRangosPrecintos(asignacion.precintos);
  document.getElementById('detalleAsigPer').textContent = asignacion.pers.length ? asignacion.pers.join(', ') : 'Sin PER asignado.';
  document.getElementById('detalleAsigMotivo').textContent = asignacion.motivo || '—';
  document.getElementById('detalleAsigObservaciones').textContent = asignacion.observaciones || 'Sin observaciones.';

  abrirModal('modalVerDetalleAsignacion');
}

function guardarAsignacionPrecintos() {
  // Lotes de origen de todos los precintos ya agregados a esta Asignación
  // (puede ser más de uno — ver obtenerLoteDePrecinto).
  const registroCodigos = [...new Set(precintosAsignacionTemp.map(p => obtenerLoteDePrecinto(p)?.codigo).filter(Boolean))];

  if (registroCodigos.some(c => calcularEstadoLote(c) === 'Anulado')) {
    mostrarToast('Uno de los lotes incluidos está anulado: no se pueden crear ni modificar asignaciones sobre él.');
    return;
  }

  const entregadoInput = document.getElementById('asignacionEntregadoPorInput');
  const recibidoInput = document.getElementById('asignacionRecibidoPorInput');
  const motivoInput = document.getElementById('asignacionMotivoInput');

  limpiarErroresModal('modalAsignacionPrecintos');
  let valido = true;
  let primerCampoInvalido = null;

  [entregadoInput, recibidoInput, motivoInput].forEach(input => {
    if (!input.value.trim()) {
      mostrarErrorCampo(input, 'Campo obligatorio');
      if (!primerCampoInvalido) primerCampoInvalido = input;
      valido = false;
    }
  });

  if (valido && !precintosAsignacionTemp.length) {
    mostrarToast('Asigna al menos un precinto antes de guardar.');
    valido = false;
  }

  if (!valido) {
    if (primerCampoInvalido) primerCampoInvalido.focus();
    return;
  }

  if (asignacionEnEdicionId) {
    const asignacion = ASIGNACIONES_PRECINTOS_DEMO.find(a => a.id === asignacionEnEdicionId);
    asignacion.entregadoPor = entregadoInput.value;
    asignacion.recibidoPor = recibidoInput.value;
    asignacion.precintos = [...precintosAsignacionTemp];
    asignacion.cantidad = precintosAsignacionTemp.length;
    asignacion.registroCodigos = registroCodigos;
    asignacion.pers = [...persAsignacionTemp];
    asignacion.motivo = motivoInput.value.trim();
    asignacion.observaciones = document.getElementById('asignacionObservacionesInput').value.trim();
  } else {
    ASIGNACIONES_PRECINTOS_DEMO.unshift({
      id: Date.now(),
      registroCodigos,
      fecha: fechaISOaDDMMYYYY(new Date().toISOString().slice(0, 10)),
      entregadoPor: entregadoInput.value,
      recibidoPor: recibidoInput.value,
      precintos: [...precintosAsignacionTemp],
      cantidad: precintosAsignacionTemp.length,
      pers: [...persAsignacionTemp],
      motivo: motivoInput.value.trim(),
      observaciones: document.getElementById('asignacionObservacionesInput').value.trim()
    });
  }

  // Primera vez que cada uno de estos PER queda ligado a una Asignación: se
  // crea su Reporte de Precintos (y Detalle/GRP vacío) si todavía no existía
  // — ver asegurarReportePrecinto en data-precintos.js. Si ya existía (el
  // PER se repite en otra Asignación), no hace nada.
  persAsignacionTemp.forEach(per => asegurarReportePrecinto(per, registroCodigos));

  // Mismo momento en que el operador ("recibido por") queda asignado a la
  // operación: empieza a poder registrar desde el app tanto sus precintos
  // (arriba) como sus gastos — se le crean los 3 reportes vacíos (Alimentos/
  // Movilidad/Días a Bordo) del mes calendario en curso, si todavía no los
  // tenía (ver asegurarReporteGasto en data-gastos.js: el período de un
  // reporte de gastos siempre es un mes completo, no un rango libre).
  if (typeof asegurarReporteGasto === 'function') {
    asegurarReporteGasto(recibidoInput.value, new Date().toISOString().slice(0, 10));
  }

  const modo = asignacionEnEdicionId ? 'editar' : 'crear';
  const mensaje = asignacionEnEdicionId ? 'Se actualizó la asignación de precintos.' : 'Se registró la asignación de precintos.';

  cerrarModal('modalAsignacionPrecintos');
  renderTablaControlPrecintos();
  // Al confirmar, se abre "Asignaciones por Operador" con la fila de este
  // operador ya expandida — ahí es donde queda visible el desglose por
  // material/lote de lo que se acaba de asignar.
  filasExpandidasOperadores.add(recibidoInput.value);
  mostrarModalGuardado(modo, mensaje, () => abrirModalOperadoresAsignados());
}

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

// Reabre el formulario de Asignación ya cargado con los datos de una
// asignación existente — se usa desde el "Editar" de la fila expandible de
// Por Operador (ver renderAsignacionesDeOperadorDetalle).
function editarAsignacionDesdeControl(idAsignacion) {
  const asignacion = ASIGNACIONES_PRECINTOS_DEMO.find(a => a.id === idAsignacion);
  if (!asignacion) return;
  abrirModalAsignacion(asignacion.registroCodigos[0], idAsignacion);
}

// Elimina por completo una asignación ya guardada (no solo precintos sueltos
// dentro de ella): sus precintos vuelven al pool de disponibles del lote.
// Es la única forma de "deshacer" una asignación — guardarAsignacionPrecintos
// no permite dejarla en 0 precintos, así que editar no sirve para esto.
function eliminarAsignacionDesdeControl(idAsignacion) {
  const asignacion = ASIGNACIONES_PRECINTOS_DEMO.find(a => a.id === idAsignacion);
  if (!asignacion) return;

  confirmarAccion(`¿Está seguro de eliminar esta asignación de ${asignacion.cantidad} precinto(s)? Los precintos volverán a quedar disponibles para asignar. Esta acción no se puede deshacer.`, () => {
    const indice = ASIGNACIONES_PRECINTOS_DEMO.findIndex(a => a.id === idAsignacion);
    if (indice !== -1) ASIGNACIONES_PRECINTOS_DEMO.splice(indice, 1);
    renderTablaControlPrecintos();
    renderTablaOperadoresControl();
    mostrarToast('La asignación fue eliminada; sus precintos vuelven a estar disponibles.');
  });
}

// Agrupa una lista de precintos en rangos contiguos para mostrarlos de forma
// compacta (ej. ['A-10001','A-10002','A-10003','A-10005'] → "A-10001 - A-10003, A-10005").
function formatearRangosPrecintos(precintos) {
  if (!precintos || !precintos.length) return '';
  const ordenados = [...precintos].sort((a, b) => numeroDePrecinto(a) - numeroDePrecinto(b));
  const grupos = [];
  let inicio = ordenados[0];
  let anterior = ordenados[0];

  for (let i = 1; i <= ordenados.length; i++) {
    const actual = ordenados[i];
    if (actual !== undefined && numeroDePrecinto(actual) === numeroDePrecinto(anterior) + 1) {
      anterior = actual;
      continue;
    }
    grupos.push(inicio === anterior ? inicio : `${inicio} - ${anterior}`);
    inicio = actual;
    anterior = actual;
  }
  return grupos.join(', ');
}
