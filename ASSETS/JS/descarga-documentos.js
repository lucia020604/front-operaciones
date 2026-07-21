// =================================================
// DESCARGA-DOCUMENTOS.JS
// Página de descarga masiva: las columnas son las mismas "carpetas"
// generales que agrupan la documentación de un colaborador (Contrato,
// Currículum, Cursos realizados, Certificaciones, Idiomas). Marcar una
// carpeta descarga todo lo que contiene para ese colaborador.
// =================================================

const CATEGORIAS_DESCARGA = ['Contrato', 'Currículum', 'Cursos realizados', 'Certificaciones', 'Idiomas'];

// Contenido de cada "carpeta" de un perfil: nombre de cada documento que
// contiene, su estado y su fecha de referencia (para el reporte final).
function obtenerCarpetasPerfil(p) {
  const carpetas = {};

  carpetas['Contrato'] = p.contratos.map(c => ({
    nombre: `Contrato ${formatearFecha(c.inicio)} — ${formatearFecha(c.fin)}`,
    estado: esContratoVigente(c) ? 'Vigente' : 'Vencido',
    fecha: c.fin
  }));

  carpetas['Currículum'] = p.curriculumNombre
    ? [{ nombre: p.curriculumNombre, estado: 'Completado', fecha: '' }]
    : [];

  carpetas['Cursos realizados'] = p.documentos.cursos.map(d => docComoItem(d));
  carpetas['Certificaciones'] = p.documentos.certificaciones.map(d => docComoItem(d));
  carpetas['Idiomas'] = p.documentos.idiomas.map(d => docComoItem(d));

  return carpetas;
}

function docComoItem(d) {
  const completado = !!(d.historial && d.historial.length);
  return {
    nombre: d.nombre,
    estado: completado ? 'Completado' : 'Pendiente',
    fecha: completado ? d.historial[d.historial.length - 1].fecha : ''
  };
}

function construirTablaDescarga() {
  const selDoc = document.getElementById('dmTipoDocumento');
  selDoc.innerHTML = '<option value="todos">Todos</option>' +
    CATEGORIAS_DESCARGA.map(c => `<option value="${c}">${c}</option>`).join('');

  const thead = document.getElementById('dmThead');
  thead.innerHTML = `<tr>
    <th><input type="checkbox" id="dmCheckAll" onchange="toggleSeleccionarTodosDescarga(this.checked)" title="Seleccionar o quitar todas las carpetas de los colaboradores visibles"></th>
    <th>N°</th>
    <th>Nombre y Apellido</th>
    <th>Categoría</th>
    ${CATEGORIAS_DESCARGA.map(c => `<th data-col="${c}">${c}</th>`).join('')}
  </tr>`;

  const tbody = document.getElementById('dmTbody');
  tbody.innerHTML = '';
  Object.keys(PERFILES).forEach(id => {
    const p = PERFILES[id];
    const carpetas = obtenerCarpetasPerfil(p);
    const tieneAlgunaCarpeta = CATEGORIAS_DESCARGA.some(col => carpetas[col].length);

    const tr = document.createElement('tr');
    tr.dataset.id = id;
    tr.dataset.nombre = `${p.nombre} ${p.apellido}`.toLowerCase();
    tr.dataset.categoria = p.categoria || '';
    tr.dataset.rol = p.rol || '';
    tr.dataset.contrato = calcularEstadoContratoPerfil(id);
    tr.innerHTML = `
      <td><input type="checkbox" class="dm-check-fila" ${tieneAlgunaCarpeta ? 'checked' : ''} onchange="toggleFilaDescargaMasiva(this)" title="Seleccionar o quitar todas las carpetas disponibles de ${p.nombre} ${p.apellido}"></td>
      <td>${id}</td>
      <td>${p.nombre} ${p.apellido}</td>
      <td>${p.categoria || '—'}</td>
      ${CATEGORIAS_DESCARGA.map(col => `<td data-col="${col}">
        <label class="tooltip-icon dm-doc-tooltip">
          <input type="checkbox" class="dm-check-doc" ${carpetas[col].length ? 'checked' : 'disabled'} onchange="actualizarEstadoFilaDescarga(this)">
          <div class="tooltip-box">${textoTooltipCarpeta(carpetas[col])}</div>
        </label>
      </td>`).join('')}`;
    tbody.appendChild(tr);
  });

  filtrarDescarga();
  actualizarResumenSeleccion();
}

// Texto del tooltip que se muestra al pasar el mouse sobre el checkbox de una carpeta:
// cuántos documentos contiene, para que el usuario sepa el alcance antes de marcarla
// (el detalle documento por documento se ve al abrir el perfil, no aquí).
function textoTooltipCarpeta(items) {
  if (!items.length) return 'Sin documentos';
  return `${items.length} documento${items.length !== 1 ? 's' : ''}`;
}

function filtrarDescarga() {
  const nombre = document.getElementById('dmNombreFiltro').value.trim().toLowerCase();
  const rol = document.getElementById('dmRol').value;
  const categoria = document.getElementById('dmCategoria').value;
  const estadoContrato = document.getElementById('dmEstadoContrato').value;
  const columnaFiltro = document.getElementById('dmTipoDocumento').value;
  const soloSeleccionados = document.getElementById('dmSoloSeleccionados').checked;

  document.querySelectorAll('#dmThead th[data-col], #dmTbody td[data-col]').forEach(el => {
    el.style.display = (columnaFiltro === 'todos' || el.dataset.col === columnaFiltro) ? '' : 'none';
  });

  document.querySelectorAll('#dmTbody tr').forEach(tr => {
    const coincideNombre = !nombre || tr.dataset.nombre.includes(nombre);
    const coincideRol = rol === 'todos' || tr.dataset.rol === rol;
    const coincideCategoria = categoria === 'todos' || tr.dataset.categoria === categoria;
    const coincideContrato = estadoContrato === 'todos' || tr.dataset.contrato === estadoContrato;
    const tieneSeleccion = [...tr.querySelectorAll('.dm-check-doc')].some(c => c.checked && !c.disabled);
    const coincideSeleccion = !soloSeleccionados || tieneSeleccion;
    tr.style.display = (coincideNombre && coincideRol && coincideCategoria && coincideContrato && coincideSeleccion) ? '' : 'none';
  });

  actualizarCheckAllDescarga();
}

function toggleSeleccionarTodosDescarga(checked) {
  document.querySelectorAll('#dmTbody tr').forEach(tr => {
    if (tr.style.display === 'none') return;
    tr.querySelector('.dm-check-fila').checked = checked;
    tr.querySelectorAll('.dm-check-doc:not(:disabled)').forEach(c => { c.checked = checked; });
  });
  actualizarResumenSeleccion();
}

function toggleFilaDescargaMasiva(checkboxFila) {
  const tr = checkboxFila.closest('tr');
  tr.querySelectorAll('.dm-check-doc:not(:disabled)').forEach(c => { c.checked = checkboxFila.checked; });
  actualizarCheckAllDescarga();
  actualizarResumenSeleccion();
}

function actualizarEstadoFilaDescarga(checkboxDoc) {
  const tr = checkboxDoc.closest('tr');
  const disponibles = [...tr.querySelectorAll('.dm-check-doc:not(:disabled)')];
  tr.querySelector('.dm-check-fila').checked = disponibles.length > 0 && disponibles.every(c => c.checked);
  actualizarCheckAllDescarga();
  actualizarResumenSeleccion();
}

// Cuenta colaboradores con al menos una carpeta marcada y el total de documentos
// contenidos en las carpetas seleccionadas, sin importar si el filtro actual las
// oculta (la selección real no depende de qué esté visible en un momento dado).
function actualizarResumenSeleccion() {
  const resumen = document.getElementById('dmResumenSeleccion');
  if (!resumen) return;

  let colaboradores = 0;
  let documentos = 0;
  document.querySelectorAll('#dmTbody tr').forEach(tr => {
    const p = PERFILES[tr.dataset.id];
    const carpetas = obtenerCarpetasPerfil(p);
    const carpetasMarcadas = [...tr.querySelectorAll('.dm-check-doc:checked:not(:disabled)')]
      .map(c => c.closest('td').dataset.col);
    if (!carpetasMarcadas.length) return;
    colaboradores++;
    documentos += carpetasMarcadas.reduce((total, col) => total + carpetas[col].length, 0);
  });

  resumen.textContent = colaboradores
    ? `${colaboradores} colaborador${colaboradores !== 1 ? 'es' : ''} · ${documentos} documento${documentos !== 1 ? 's' : ''} seleccionados`
    : '0 colaboradores seleccionados';
}

function actualizarCheckAllDescarga() {
  const checkAll = document.getElementById('dmCheckAll');
  if (!checkAll) return;
  const filas = [...document.querySelectorAll('#dmTbody tr')].filter(tr => tr.style.display !== 'none');
  checkAll.checked = filas.length > 0 && filas.every(tr => {
    const disponibles = [...tr.querySelectorAll('.dm-check-doc:not(:disabled)')];
    return disponibles.length > 0 && disponibles.every(c => c.checked);
  });
}

function confirmarDescarga() {
  const seleccion = [];
  document.querySelectorAll('#dmTbody tr').forEach(tr => {
    if (tr.style.display === 'none') return;
    const p = PERFILES[tr.dataset.id];
    const carpetasMarcadas = [...tr.querySelectorAll('.dm-check-doc:not(:disabled)')]
      .filter(c => c.checked)
      .map(c => c.closest('td').dataset.col);
    if (carpetasMarcadas.length) seleccion.push({ p, carpetasMarcadas });
  });

  if (!seleccion.length) {
    mostrarToast('Selecciona al menos una carpeta de documentos para descargar');
    return;
  }

  const secciones = seleccion.map(({ p, carpetasMarcadas }) => {
    const carpetas = obtenerCarpetasPerfil(p);
    const bloquesCarpeta = carpetasMarcadas.map(col => {
      const items = carpetas[col];
      const filas = items.map(it => `<tr><td>${it.nombre}</td><td>${it.estado}</td><td>${it.fecha ? formatearFecha(it.fecha) : '—'}</td></tr>`).join('');
      return `
        <div class="section">📁 ${col}</div>
        <table>
          <tr><th>Documento</th><th>Estado</th><th>Fecha</th></tr>
          ${filas || '<tr><td colspan="3">Sin documentos registrados</td></tr>'}
        </table>`;
    }).join('');
    return `<div class="section" style="border-bottom-color:#111;font-size:15px;">${p.nombre} ${p.apellido} — ${p.rol}</div>${bloquesCarpeta}`;
  }).join('');

  generarPDF('Descarga masiva - Información Profesional', `
    <h1>Descarga masiva de documentos</h1>
    <h2>Carpetas seleccionadas por colaborador</h2>
    ${secciones}`);
}

document.addEventListener('DOMContentLoaded', construirTablaDescarga);
