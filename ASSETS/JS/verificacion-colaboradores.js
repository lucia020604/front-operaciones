// =================================================
// VERIFICACION-COLABORADORES.JS
// Reportes > Verificación de información de colaborador: por cada colaborador
// indica si cumple (Sí/No) con los documentos solicitados para su rol, evaluados
// contra una fecha, y si está disponible ese día. Los datos viven en
// data-verificacion-colaboradores.js (DOCUMENTOS_VERIF / COLABORADORES_VERIF).
// =================================================

const SECCION_DOC_LABEL = { basica: 'Documentación básica', cursos: 'Cursos realizados', certificaciones: 'Certificaciones', idiomas: 'Idiomas' };
const ROL_LABEL = {
  'Tecnico Especialista': 'Técnico Especialista',
  'Jefe de Area': 'Jefe de Área'
};
const etiquetaRol = rol => ROL_LABEL[rol] || rol;

// Pantalla de Configuración > Disponibilidad de Personal (calendario por operario).
const RUTA_DISPONIBILIDAD = '../CONFIGURACION/disponibilidad-personal.html';

// Información Profesional del colaborador (abre su perfil en la pestaña indicada).
const RUTA_INFO_PROFESIONAL = '../CONFIGURACION/informacion-profesional.html';

const HOY_VERIF = new Date().toISOString().slice(0, 10);

let filtrosVerif = { rol: 'todos', documentos: new Set(), desde: HOY_VERIF, hasta: HOY_VERIF, cumple: 'todos', cliente: 'todos' };
// Selección de rol y documentos mientras se arma el filtro; solo pasa a filtrosVerif al pulsar Buscar.
let pendVerif = { rol: 'todos', documentos: new Set(), cliente: 'todos' };
let filasModalVerif = [];
let paginaVerif = 1;
let filasPorPaginaVerif = 10;

// =================================================
// REGLAS DE VERIFICACIÓN
// =================================================

// Un documento es solicitado para el rol si el rol figura en "roles". Un rol que
// no existe en la configuración (ej. "Coordinador") solo debe lo que se pide a todos.
function documentoSolicitadoParaRol(doc, rol) {
  const rolesConfigurados = new Set(DOCUMENTOS_VERIF.flatMap(d => d.roles));
  if (!rolesConfigurados.has(rol)) return doc.roles.length >= rolesConfigurados.size;
  return doc.roles.includes(rol);
}

// Con un cliente elegido solo cuentan los documentos que ese cliente solicita.
function documentoSolicitadoPorCliente(doc, cliente) {
  return cliente === 'todos' || doc.clientes.includes(cliente);
}

// Un documento es 'Vigente' si cubre todo el rango evaluado; 'Vencido' si su fin queda
// antes del final del rango; 'Pendiente' si falta, no tiene archivo o aún no inicia.
function estadoPorRango(inicio, fin, desde, hasta) {
  if (inicio && inicio > desde) return 'Pendiente';
  if (fin && fin < hasta) return 'Vencido';
  return 'Vigente';
}

// Devuelve { estado, inicio, fin, actualizado } — inicio/fin son la vigencia del registro evaluado y
// actualizado la fecha de su último movimiento en Información Profesional (vacío si no hay registro).
function estadoDocumentoColaborador(colab, doc, desde, hasta) {
  if (doc.nombre === 'DNI') return { estado: colab.dni ? 'Vigente' : 'Pendiente', inicio: '', fin: '' };

  if (doc.nombre === 'Contrato de Trabajo') {
    if (!colab.contratos.length) return { estado: 'Pendiente', inicio: '', fin: '' };
    const vigente = colab.contratos.find(c => estadoPorRango(c.inicio, c.fin, desde, hasta) === 'Vigente');
    if (vigente) return { estado: 'Vigente', inicio: vigente.inicio, fin: vigente.fin };
    const ultimo = colab.contratos.reduce((a, c) => (c.fin > a.fin ? c : a));
    return { estado: ultimo.fin < hasta ? 'Vencido' : 'Pendiente', inicio: ultimo.inicio, fin: ultimo.fin };
  }

  const reg = colab.documentos.find(d => d.nombre === doc.nombre);
  if (!reg || !reg.archivo) return { estado: 'Pendiente', inicio: '', fin: '', actualizado: reg ? reg.actualizado : '' };
  if (reg.sinDuracion) return { estado: 'Vigente', inicio: '', fin: '', actualizado: reg.actualizado };
  return { estado: estadoPorRango(reg.inicio, reg.fin, desde, hasta), inicio: reg.inicio, fin: reg.fin, actualizado: reg.actualizado };
}

// Primera ausencia que se cruza con el rango evaluado.
function ausenciaEnRango(colab, desde, hasta) {
  return colab.ausencias.find(a => a.inicio <= hasta && a.fin >= desde) || null;
}

function evaluarColaborador(colab) {
  const base = filtrosVerif.documentos.size
    ? DOCUMENTOS_VERIF.filter(d => filtrosVerif.documentos.has(d.id))
    : DOCUMENTOS_VERIF;
  const solicitados = base.filter(d => documentoSolicitadoParaRol(d, colab.rol) && documentoSolicitadoPorCliente(d, filtrosVerif.cliente));

  const detalle = solicitados.map(d => ({ doc: d, ...estadoDocumentoColaborador(colab, d, filtrosVerif.desde, filtrosVerif.hasta) }));
  const estado = detalle.some(x => x.estado === 'Vencido') ? 'Vencido'
    : detalle.some(x => x.estado === 'Pendiente') ? 'Pendiente' : 'Vigente';
  const ausencia = ausenciaEnRango(colab, filtrosVerif.desde, filtrosVerif.hasta);

  return { colab, detalle, estado, cumple: estado === 'Vigente', ausencia };
}

// Colaboradores evaluados con rol/documentos/cliente aplicados, sin el filtro "Cumple".
function getFilasBaseVerif() {
  const acotado = filtrosVerif.documentos.size > 0 || filtrosVerif.cliente !== 'todos';
  return COLABORADORES_VERIF
    .filter(c => filtrosVerif.rol === 'todos' || c.rol === filtrosVerif.rol)
    .map(evaluarColaborador)
    // Con documentos o cliente elegidos, solo interesan los colaboradores a quienes se les solicitan.
    .filter(f => !acotado || f.detalle.length);
}

function getFilasVerif() {
  return getFilasBaseVerif()
    .filter(f => filtrosVerif.cumple === 'todos' || (filtrosVerif.cumple === 'si') === f.cumple);
}

// =================================================
// FILTROS
// =================================================
function poblarFiltroRol() {
  const roles = [...new Set(COLABORADORES_VERIF.map(c => c.rol))];
  document.getElementById('filtroRol').innerHTML = '<option value="todos">Todos</option>'
    + roles.map(r => `<option value="${r}">${etiquetaRol(r)}</option>`).join('');
}

// Documentos que el filtro ofrece: con un rol elegido, solo los solicitados a ese rol.
function documentosDisponiblesFiltro() {
  return DOCUMENTOS_VERIF.filter(d =>
    (pendVerif.rol === 'todos' || documentoSolicitadoParaRol(d, pendVerif.rol)) && documentoSolicitadoPorCliente(d, pendVerif.cliente));
}

function renderMultiDocumentos() {
  const disponibles = documentosDisponiblesFiltro();
  const ids = new Set(disponibles.map(d => d.id));
  pendVerif.documentos.forEach(id => { if (!ids.has(id)) pendVerif.documentos.delete(id); });

  const grupos = Object.keys(SECCION_DOC_LABEL).map(sec => {
    const docs = disponibles.filter(d => d.seccion === sec);
    if (!docs.length) return '';
    return `<div class="multi-grupo">${SECCION_DOC_LABEL[sec]}</div>`
      + docs.map(d => `
        <label class="multi-opcion">
          <input type="checkbox" value="${d.id}" ${pendVerif.documentos.has(d.id) ? 'checked' : ''} onchange="toggleDocumentoFiltro(${d.id}, this.checked)">
          <span>${d.nombre}</span>
        </label>`).join('');
  }).join('');

  document.getElementById('multiDocLista').innerHTML = grupos || '<div class="multi-vacio">Sin documentos solicitados</div>';
  actualizarTextoMultiDocumentos();
}

function actualizarTextoMultiDocumentos() {
  const n = pendVerif.documentos.size;
  const texto = document.getElementById('multiDocTexto');
  texto.textContent = n === 0 ? 'Todos los documentos' : n === 1 ? DOCUMENTOS_VERIF.find(d => pendVerif.documentos.has(d.id)).nombre : `${n} documentos`;
  texto.classList.toggle('placeholder', n === 0);
}

function toggleMultiDocumentos(e) {
  e.stopPropagation();
  document.getElementById('multiDoc').classList.toggle('open');
}

function toggleDocumentoFiltro(id, marcado) {
  if (marcado) pendVerif.documentos.add(id); else pendVerif.documentos.delete(id);
  actualizarTextoMultiDocumentos();
}

function limpiarDocumentosFiltro(e) {
  e.stopPropagation();
  pendVerif.documentos.clear();
  renderMultiDocumentos();
}

function poblarFiltroCliente() {
  document.getElementById('filtroCliente').innerHTML = '<option value="todos">Todos</option>'
    + CLIENTES_VERIF.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderPreviewCliente() {
  const cont = document.getElementById('clienteDocsPreview');
  if (pendVerif.cliente === 'todos') {
    cont.innerHTML = '<div class="multi-vacio">Elige un cliente para ver los documentos que solicita</div>';
    return;
  }
  cont.innerHTML = DOCUMENTOS_VERIF.filter(d => documentoSolicitadoPorCliente(d, pendVerif.cliente))
    .map(d => `<div class="cliente-prev-item"><span>${d.nombre}</span><span>${SECCION_DOC_LABEL[d.seccion]}</span></div>`).join('');
}

function abrirPanelCliente() {
  document.getElementById('filtroCliente').value = pendVerif.cliente;
  renderPreviewCliente();
  abrirModal('modalCliente');
}

function cambiarClienteFiltro() {
  pendVerif.cliente = document.getElementById('filtroCliente').value;
  renderPreviewCliente();
  renderMultiDocumentos();
}

function aplicarPanelCliente() {
  cerrarModal('modalCliente');
  aplicarFiltros();
}

function limpiarPanelCliente() {
  pendVerif.cliente = 'todos';
  document.getElementById('filtroCliente').value = 'todos';
  renderPreviewCliente();
  renderMultiDocumentos();
  cerrarModal('modalCliente');
  aplicarFiltros();
}

// Resalta el botón y muestra el badge cuando hay un cliente aplicado.
function actualizarBotonCliente() {
  const activo = filtrosVerif.cliente !== 'todos';
  document.getElementById('btnCliente').classList.toggle('activo', activo);
  document.getElementById('clienteBadge').style.display = activo ? '' : 'none';
}

function cambiarRolFiltro() {
  pendVerif.rol = document.getElementById('filtroRol').value;
  renderMultiDocumentos();
}

function aplicarFiltros() {
  let desde = document.getElementById('filtroDesde').value || HOY_VERIF;
  let hasta = document.getElementById('filtroHasta').value || desde;
  if (hasta < desde) [desde, hasta] = [hasta, desde];
  document.getElementById('filtroDesde').value = desde;
  document.getElementById('filtroHasta').value = hasta;
  filtrosVerif.rol = pendVerif.rol;
  filtrosVerif.cliente = pendVerif.cliente;
  filtrosVerif.documentos = new Set(pendVerif.documentos);
  filtrosVerif.desde = desde;
  filtrosVerif.hasta = hasta;
  filtrosVerif.cumple = document.getElementById('filtroCumple').value;
  paginaVerif = 1;
  renderVerificacion();
}

function limpiarFiltros() {
  filtrosVerif = { rol: 'todos', documentos: new Set(), desde: HOY_VERIF, hasta: HOY_VERIF, cumple: 'todos', cliente: 'todos' };
  pendVerif = { rol: 'todos', documentos: new Set(), cliente: 'todos' };
  document.getElementById('filtroRol').value = 'todos';
  document.getElementById('filtroCliente').value = 'todos';
  document.getElementById('filtroDesde').value = HOY_VERIF;
  document.getElementById('filtroHasta').value = HOY_VERIF;
  document.getElementById('filtroCumple').value = 'todos';
  renderMultiDocumentos();
  paginaVerif = 1;
  renderVerificacion();
}

// =================================================
// RENDER
// =================================================
function formatoFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function textoRango() {
  const { desde, hasta } = filtrosVerif;
  return desde === hasta ? `Evaluado al ${formatoFecha(desde)}` : `Evaluado del ${formatoFecha(desde)} al ${formatoFecha(hasta)}`;
}

const BADGE_ESTADO_DOC = { Vigente: 'badge-vigente', Pendiente: 'badge-por-vencer', Vencido: 'badge-vencida' };

function observadosDe(f) {
  return f.detalle.filter(x => x.estado !== 'Vigente');
}

function celdaObservados(f, idx) {
  const n = observadosDe(f).length;
  if (!n) return '<span class="verif-muted">0</span>';
  return `<button type="button" class="verif-count" title="Ver documentos observados" onclick="abrirObservados(${idx})">${n}</button>`;
}

function abrirObservados(idx) {
  const f = filasModalVerif[idx];
  if (!f) return;
  document.getElementById('modalObservadosTitulo').textContent = `Documentos observados — ${f.colab.nombre} ${f.colab.apellido}`;
  document.getElementById('modalObservadosSub').textContent = `${etiquetaRol(f.colab.rol)} · ${textoRango()}`;
  document.getElementById('modalObservadosTbody').innerHTML = observadosDe(f).map((x, i) => `<tr>
      <td>${i + 1}</td>
      <td>${x.doc.nombre}</td>
      <td>${SECCION_DOC_LABEL[x.doc.seccion]}</td>
      <td>${x.inicio || x.fin ? `${formatoFecha(x.inicio)} – ${formatoFecha(x.fin)}` : '—'}</td>
      <td>${formatoFecha(x.actualizado)}</td>
      <td><span class="badge ${BADGE_ESTADO_DOC[x.estado]}"><span class="badge-dot"></span>${x.estado}</span></td>
    </tr>`).join('');
  // Los colaboradores sin perfil registrado abren el listado de Información Profesional.
  const link = document.getElementById('btnCompletarPerfil');
  const perfil = f.colab.tienePerfil === false ? '' : `?perfil=${f.colab.id}&tab=documentacion`;
  link.href = RUTA_INFO_PROFESIONAL + perfil;
  abrirModal('modalObservados');
}

function renderKPIs(filas) {
  const cumplen = filas.filter(f => f.cumple).length;
  document.getElementById('kpiEvaluados').textContent = filas.length;
  document.getElementById('kpiCumplen').textContent = cumplen;
  document.getElementById('kpiNoCumplen').textContent = filas.length - cumplen;
  document.getElementById('kpiNoDisponibles').textContent = filas.filter(f => f.ausencia).length;
  document.getElementById('kpiFecha').textContent = textoRango();
}

// Documentos que solicita el cliente elegido y cuántos colaboradores cumplen cada uno.
function renderPanelCliente(filas) {
  const panel = document.getElementById('panelCliente');
  if (filtrosVerif.cliente === 'todos') { panel.style.display = 'none'; return; }

  // Se calcula sobre las mismas filas de la tabla y las tarjetas de resumen,
  // para que los números de los tres lugares siempre coincidan.
  const docs = DOCUMENTOS_VERIF.filter(d => documentoSolicitadoPorCliente(d, filtrosVerif.cliente)
    && (!filtrosVerif.documentos.size || filtrosVerif.documentos.has(d.id)));
  const cumplenTodo = filas.filter(f => f.cumple).length;

  document.getElementById('panelClienteTitulo').textContent = `Documentos que solicita ${filtrosVerif.cliente}`;
  document.getElementById('panelClienteResumen').textContent =
    `${filas.length} colaborador${filas.length === 1 ? '' : 'es'} en la tabla · ${cumplenTodo} cumple${cumplenTodo === 1 ? '' : 'n'} todos · ${filas.length - cumplenTodo} no`;

  document.getElementById('panelClienteLista').innerHTML = docs.map(d => {
    const evaluados = filas.map(f => f.detalle.find(x => x.doc.id === d.id)).filter(Boolean);
    const cumplen = evaluados.filter(x => x.estado === 'Vigente').length;
    const detalle = evaluados.length
      ? `<b>${cumplen}</b> cumplen · <b>${evaluados.length - cumplen}</b> no cumplen`
      : 'No aplica a los colaboradores listados';
    const cls = !evaluados.length ? '' : cumplen === evaluados.length ? 'ok' : 'falta';
    return `<div class="cliente-doc ${cls}">
      <span class="cliente-doc-nombre">${d.nombre}</span>
      <span class="cliente-doc-seccion">${SECCION_DOC_LABEL[d.seccion]}</span>
      <span class="cliente-doc-cumple">${detalle}</span>
    </div>`;
  }).join('');
  panel.style.display = '';
}

function renderVerificacion() {
  const filas = getFilasVerif();
  filasModalVerif = filas;
  renderPanelCliente(filas);
  actualizarBotonCliente();
  renderKPIs(filas);

  const total = filas.length;
  const totalPag = Math.max(1, Math.ceil(total / filasPorPaginaVerif));
  if (paginaVerif > totalPag) paginaVerif = 1;
  const inicio = (paginaVerif - 1) * filasPorPaginaVerif;
  const fin = Math.min(inicio + filasPorPaginaVerif, total);

  const tbody = document.getElementById('tablaBody');
  tbody.innerHTML = total === 0
    ? '<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--gray-400)">Sin resultados para los filtros aplicados</td></tr>'
    : filas.slice(inicio, fin).map((f, i) => `<tr>
        <td>${inicio + i + 1}</td>
        <td>${f.colab.nombre}</td>
        <td>${f.colab.apellido}</td>
        <td>${etiquetaRol(f.colab.rol)}</td>
        <td><div class="verif-disp">${f.ausencia
          ? `<span class="badge badge-por-vencer" title="${formatoFecha(f.ausencia.inicio)} – ${formatoFecha(f.ausencia.fin)}"><span class="badge-dot"></span>${f.ausencia.tipo}</span>`
          : '<span class="badge badge-vigente"><span class="badge-dot"></span>Disponible</span>'}
          <a class="verif-disp-link" href="${RUTA_DISPONIBILIDAD}" title="Ver disponibilidad del personal">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
          </a></div></td>
        <td><span class="badge ${BADGE_ESTADO_DOC[f.estado]}"><span class="badge-dot"></span>${f.estado}</span></td>
        <td>${celdaObservados(f, inicio + i)}</td>
        <td><span class="badge ${f.cumple ? 'badge-vigente' : 'badge-vencida'}"><span class="badge-dot"></span>${f.cumple ? 'Sí' : 'No'}</span></td>
      </tr>`).join('');

  document.getElementById('paginacionInfo').textContent = total > 0
    ? `Mostrando ${inicio + 1}–${fin} de ${total} registros`
    : 'Sin registros';
  renderPaginacion(totalPag);
}

function renderPaginacion(totalPag) {
  const cont = document.getElementById('paginacionBtns');
  if (totalPag <= 1) { cont.innerHTML = ''; return; }

  let html = `<button class="pag-btn" onclick="cambiarPagina(${paginaVerif - 1})" ${paginaVerif === 1 ? 'disabled' : ''}>‹</button>`;
  const start = Math.max(1, paginaVerif - 2);
  const end = Math.min(totalPag, start + 4);
  for (let p = start; p <= end; p++) {
    html += `<button class="pag-btn ${p === paginaVerif ? 'active' : ''}" onclick="cambiarPagina(${p})">${p}</button>`;
  }
  html += `<button class="pag-btn" onclick="cambiarPagina(${paginaVerif + 1})" ${paginaVerif === totalPag ? 'disabled' : ''}>›</button>`;
  cont.innerHTML = html;
}

function cambiarPagina(p) {
  const totalPag = Math.max(1, Math.ceil(getFilasVerif().length / filasPorPaginaVerif));
  if (p < 1 || p > totalPag) return;
  paginaVerif = p;
  renderVerificacion();
}

function cambiarFilasPorPagina(n) {
  filasPorPaginaVerif = n;
  paginaVerif = 1;
  renderVerificacion();
}

// =================================================
// DESCARGA
// =================================================
function toggleDownloadDropdown() {
  document.getElementById('downloadDropdown').classList.toggle('open');
}

function filasParaExportar() {
  return getFilasVerif().map((f, i) => [
    i + 1, f.colab.nombre, f.colab.apellido, etiquetaRol(f.colab.rol),
    f.ausencia ? f.ausencia.tipo : 'Disponible', f.estado,
    observadosDe(f).length,
    observadosDe(f).map(x => `${x.doc.nombre} (${x.estado})`).join('; ') || '—',
    f.cumple ? 'Sí' : 'No'
  ]);
}

const ENCABEZADOS_EXPORT = ['N°', 'Nombre', 'Apellido', 'Rol', 'Disponibilidad', 'Estado Documentación', 'N° documentos observados', 'Documentos observados', 'Cumple'];

function exportarExcel() {
  const csv = [ENCABEZADOS_EXPORT, ...filasParaExportar()]
    .map(fila => fila.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'verificacion-colaboradores.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  mostrarToast('Exportación Excel descargada correctamente.');
}

function exportarPDF() {
  const filas = filasParaExportar().map(f => `<tr>${f.map(v => `<td>${v}</td>`).join('')}</tr>`).join('');
  const html = `<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8">
    <title>Verificación de información de colaborador</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
      h2   { font-size: 14px; margin-bottom: 4px; }
      p    { margin: 0 0 12px; color: #555; }
      table{ width: 100%; border-collapse: collapse; }
      th   { background: #111; color: #fff; padding: 7px 10px; text-align: left;
             font-size: 9px; text-transform: uppercase; letter-spacing: .05em; }
      td   { padding: 7px 10px; border-bottom: 1px solid #eee; }
      @media print { @page { margin: 15mm; } }
    </style>
  </head><body>
    <h2>Verificación de información de colaborador</h2>
    <p>${textoRango()}${filtrosVerif.cliente !== 'todos' ? ` · Cliente: ${filtrosVerif.cliente}` : ''}</p>
    <table>
      <thead><tr>${ENCABEZADOS_EXPORT.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${filas}</tbody>
    </table>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

// =================================================
// INIT
// =================================================
document.addEventListener('click', e => {
  const multi = document.getElementById('multiDoc');
  if (multi && !multi.contains(e.target)) multi.classList.remove('open');
  const dd = document.getElementById('downloadDropdown');
  if (dd && !e.target.closest('.btn-download-wrap')) dd.classList.remove('open');
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filtroDesde').value = HOY_VERIF;
  document.getElementById('filtroHasta').value = HOY_VERIF;
  poblarFiltroRol();
  poblarFiltroCliente();
  renderMultiDocumentos();
  renderVerificacion();
  lucide.createIcons();
});
