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
// `cliente` puede ser 'todos', un cliente o varios (cuenta si lo solicita alguno de ellos).
function documentoSolicitadoPorCliente(doc, cliente) {
  if (cliente === 'todos') return true;
  return Array.isArray(cliente) ? cliente.some(c => doc.clientes.includes(c)) : doc.clientes.includes(cliente);
}
const textoClientes = c => Array.isArray(c) ? c.join(', ') : c;

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

// ---- Detalle de disponibilidad dentro del rango evaluado ----
function sumarDiasISO(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function ausenciaDelDia(colab, iso) {
  return colab.ausencias.find(a => a.inicio <= iso && iso <= a.fin) || null;
}
// Primer día, desde `iso`, en que el colaborador no tiene ninguna ausencia.
function proximoDiaLibre(colab, iso) {
  let d = iso, n = 0;
  while (ausenciaDelDia(colab, d) && n++ < 800) d = sumarDiasISO(d, 1);
  return d;
}
// Divide el rango evaluado en tramos seguidos: no disponible (con su ausencia) o disponible.
function tramosDisponibilidad(colab, desde, hasta) {
  const tramos = [];
  let iso = desde, n = 0;
  while (iso <= hasta && n++ < 800) {
    const aus = ausenciaDelDia(colab, iso);
    const ult = tramos[tramos.length - 1];
    if (ult && ult.aus === aus) ult.fin = iso; else tramos.push({ aus, inicio: iso, fin: iso });
    iso = sumarDiasISO(iso, 1);
  }
  return tramos;
}
// Líneas de texto: hasta qué día no estará disponible y qué días sí lo estará.
// Solo cuando se evalúa un rango de fechas (con un solo día alcanza con el badge).
function hayRangoVerif() { return filtrosVerif.desde !== filtrosVerif.hasta; }

function lineasDisponibilidad(f) {
  if (!f.ausencia || !hayRangoVerif()) return [];
  const { desde, hasta } = filtrosVerif;
  const dia = iso => formatoFecha(iso);
  const corto = iso => formatoFecha(iso).slice(0, 5); // dd/mm
  const rangoCorto = (a, b) => a === b ? corto(a) : `${corto(a)} – ${corto(b)}`;
  const lineas = [];
  tramosDisponibilidad(f.colab, desde, hasta).forEach(t => {
    if (t.aus) {
      lineas.push({ tipo: 'no', etiqueta: t.aus.tipo, rango: rangoCorto(t.aus.inicio, t.aus.fin),
        texto: t.inicio === t.aus.fin ? `No disponible el ${dia(t.inicio)}`
          : t.inicio === desde ? `No disponible hasta el ${dia(t.aus.fin)}` : `No disponible del ${dia(t.inicio)} al ${dia(t.aus.fin)}` });
      // Si el tramo llega al final del rango, se indica desde cuándo vuelve a estar disponible.
      if (t.fin === hasta) {
        const libre = proximoDiaLibre(f.colab, sumarDiasISO(t.aus.fin, 1));
        lineas.push({ tipo: 'si', etiqueta: 'Disponible desde', rango: corto(libre), texto: `Disponible desde el ${dia(libre)}` });
      }
    } else {
      lineas.push({ tipo: 'si', etiqueta: 'Disponible', rango: rangoCorto(t.inicio, t.fin),
        texto: t.inicio === t.fin ? `Disponible el ${dia(t.inicio)}` : `Disponible del ${dia(t.inicio)} al ${dia(t.fin)}` });
    }
  });
  return lineas;
}

// Tooltip con el detalle de disponibilidad (se arma al dibujar la tabla y se muestra al pasar el mouse por el badge).
let tooltipsDisp = [];
function htmlTooltipDisp(f) {
  const filas = lineasDisponibilidad(f).map(l => `<div class="vtip-fila"><i class="vtip-dot ${l.tipo}"></i><span class="vtip-et">${l.etiqueta}</span><b>${l.rango}</b></div>`).join('');
  return `<div class="vtip-titulo">Del ${formatoFecha(filtrosVerif.desde)} al ${formatoFecha(filtrosVerif.hasta)}</div>${filas}`;
}
(function activarTooltipDisp() {
  let box = null;
  const mostrar = el => {
    const html = tooltipsDisp[el.dataset.tip];
    if (!html) return;
    if (!box) { box = document.createElement('div'); box.className = 'verif-tooltip'; document.body.appendChild(box); }
    box.innerHTML = html;
    box.style.display = 'block';
    const r = el.getBoundingClientRect();
    const w = box.offsetWidth, h = box.offsetHeight;
    let left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
    box.style.left = left + 'px'; box.style.top = top + 'px';
  };
  const ocultar = () => { if (box) box.style.display = 'none'; };
  document.addEventListener('mouseover', e => { const el = e.target.closest && e.target.closest('.verif-tip'); if (el) mostrar(el); });
  document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('.verif-tip')) ocultar(); });
  document.addEventListener('focusin', e => { const el = e.target.closest && e.target.closest('.verif-tip'); if (el) mostrar(el); });
  document.addEventListener('focusout', ocultar);
  window.addEventListener('scroll', ocultar, true);
})();
// ¿La ausencia cubre todo el rango evaluado?
function ausenciaCubreTodoElRango(f) {
  return tramosDisponibilidad(f.colab, filtrosVerif.desde, filtrosVerif.hasta).every(t => t.aus);
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

// Clientes marcados en el panel (el filtro vale 'todos' o la lista de clientes elegidos).
const clientesElegidos = c => c === 'todos' ? [] : (Array.isArray(c) ? c : [c]);

// Combo de clientes de la barra de filtros (selección múltiple, igual que "Documentos solicitados").
function renderListaClientes() {
  const marcados = clientesElegidos(pendVerif.cliente);
  document.getElementById('multiCliLista').innerHTML = CLIENTES_VERIF.map((c, i) => {
    const n = DOCUMENTOS_VERIF.filter(d => d.clientes.includes(c)).length;
    return `<label class="multi-opcion">
      <input type="checkbox" ${marcados.includes(c) ? 'checked' : ''} onchange="toggleClienteFiltro(${i}, this.checked)">
      <span>${c}</span><small style="margin-left:auto;color:var(--gray-400)">${n} doc.</small>
    </label>`;
  }).join('');
  const texto = document.getElementById('multiCliTexto');
  texto.textContent = marcados.length === 0 ? 'Todos los clientes' : marcados.length === 1 ? marcados[0] : `${marcados.length} clientes`;
  texto.classList.toggle('placeholder', marcados.length === 0);
}

function toggleMultiClientes(e) {
  e.stopPropagation();
  document.getElementById('multiCli').classList.toggle('open');
}

function limpiarClientesFiltro(e) {
  e.stopPropagation();
  pendVerif.cliente = 'todos';
  renderListaClientes();
  renderPreviewCliente();
  renderMultiDocumentos();
}

function toggleClienteFiltro(i, marcado) {
  const set = new Set(clientesElegidos(pendVerif.cliente));
  if (marcado) set.add(CLIENTES_VERIF[i]); else set.delete(CLIENTES_VERIF[i]);
  const lista = CLIENTES_VERIF.filter(c => set.has(c));
  pendVerif.cliente = lista.length ? lista : 'todos';
  const texto = document.getElementById('multiCliTexto');
  texto.textContent = lista.length === 0 ? 'Todos los clientes' : lista.length === 1 ? lista[0] : `${lista.length} clientes`;
  texto.classList.toggle('placeholder', lista.length === 0);
  renderPreviewCliente();
  renderMultiDocumentos();
}

function renderPreviewCliente() {
  const cont = document.getElementById('clienteDocsPreview');
  if (pendVerif.cliente === 'todos') {
    cont.innerHTML = '<div class="multi-vacio">Elige uno o varios clientes en el filtro para ver los documentos que solicitan</div>';
    return;
  }
  const elegidos = clientesElegidos(pendVerif.cliente);
  cont.innerHTML = DOCUMENTOS_VERIF.filter(d => documentoSolicitadoPorCliente(d, pendVerif.cliente))
    .map(d => {
      const quien = elegidos.length > 1 ? ` · ${elegidos.filter(c => d.clientes.includes(c)).join(', ')}` : '';
      return `<div class="cliente-prev-item"><span>${d.nombre}</span><span>${SECCION_DOC_LABEL[d.seccion]}${quien}</span></div>`;
    }).join('');
}

function abrirPanelCliente() {
  renderListaClientes();
  renderPreviewCliente();
  abrirModal('modalCliente');
}

function aplicarPanelCliente() {
  cerrarModal('modalCliente');
  aplicarFiltros();
}

function limpiarPanelCliente() {
  pendVerif.cliente = 'todos';
  renderListaClientes();
  renderPreviewCliente();
  renderMultiDocumentos();
  cerrarModal('modalCliente');
  aplicarFiltros();
}

// Resalta el botón y muestra el badge cuando hay un cliente aplicado.
function actualizarBotonCliente() {
  const activo = filtrosVerif.cliente !== 'todos';
  document.getElementById('btnCliente').classList.toggle('activo', activo);
  const badge = document.getElementById('clienteBadge');
  badge.style.display = activo ? '' : 'none';
  badge.textContent = clientesElegidos(filtrosVerif.cliente).length;
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
  renderListaClientes();
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
  if (!n) return '<span class="verif-count verif-count-cero">0</span>';
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

  document.getElementById('panelClienteTitulo').textContent = `Documentos que solicita ${textoClientes(filtrosVerif.cliente)}`;
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

// Badge de disponibilidad. Con un rango de fechas y ausencias, lleva un tooltip con el detalle.
function celdaDisponibilidad(f) {
  if (!f.ausencia) return '<span class="badge badge-vigente"><span class="badge-dot"></span>Disponible</span>';
  const texto = ausenciaCubreTodoElRango(f) ? f.ausencia.tipo : 'Disponible parcial';
  if (!hayRangoVerif()) return `<span class="badge badge-por-vencer"><span class="badge-dot"></span>${texto}</span>`;
  const idx = tooltipsDisp.push(htmlTooltipDisp(f)) - 1;
  // El icono ⓘ va aparte del badge: es el que muestra el tooltip.
  return `<span class="badge badge-por-vencer"><span class="badge-dot"></span>${texto}</span>
    <span class="verif-info verif-tip" tabindex="0" role="button" aria-label="Ver detalle de disponibilidad" data-tip="${idx}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>`;
}

function renderVerificacion() {
  tooltipsDisp = [];
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
        <td><div class="verif-disp">${celdaDisponibilidad(f)}
          <a class="verif-disp-link" href="${RUTA_DISPONIBILIDAD}?operario=${f.colab.id}&desde=${filtrosVerif.desde}&hasta=${filtrosVerif.hasta}" title="Ver disponibilidad de ${f.colab.nombre} ${f.colab.apellido}">
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
    f.ausencia ? `${ausenciaCubreTodoElRango(f) ? f.ausencia.tipo : 'Disponible parcial'}${hayRangoVerif() ? ': ' + lineasDisponibilidad(f).map(l => l.texto).join('; ') : ''}` : 'Disponible', f.estado,
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
    <p>${textoRango()}${filtrosVerif.cliente !== 'todos' ? ` · Cliente: ${textoClientes(filtrosVerif.cliente)}` : ''}</p>
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
  ['multiDoc', 'multiCli'].forEach(id => {
    const multi = document.getElementById(id);
    if (multi && !multi.contains(e.target)) multi.classList.remove('open');
  });
  const dd = document.getElementById('downloadDropdown');
  if (dd && !e.target.closest('.btn-download-wrap')) dd.classList.remove('open');
});

// Llamado desde Seguimiento de Operaciones (botón "Verificar información"):
// ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD&cliente=A&cliente=B → rango y clientes ya aplicados.
function aplicarParametrosUrlVerif() {
  const p = new URLSearchParams(window.location.search);
  const esFecha = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
  const desde = esFecha(p.get('desde')) ? p.get('desde') : '';
  const hasta = esFecha(p.get('hasta')) ? p.get('hasta') : desde;
  const pedidos = p.getAll('cliente');
  if (!desde && !pedidos.length) return;

  if (desde) {
    document.getElementById('filtroDesde').value = desde <= hasta ? desde : hasta;
    document.getElementById('filtroHasta').value = desde <= hasta ? hasta : desde;
  }
  // Solo los clientes que tienen documentos configurados en este reporte.
  const conocidos = pedidos.filter(c => CLIENTES_VERIF.includes(c));
  if (conocidos.length) { pendVerif.cliente = conocidos; renderListaClientes(); renderMultiDocumentos(); }
  aplicarFiltros();
  const ignorados = pedidos.filter(c => !CLIENTES_VERIF.includes(c));
  if (ignorados.length) {
    mostrarToast(`${ignorados.join(', ')} no tiene${ignorados.length > 1 ? 'n' : ''} documentos configurados en este reporte${conocidos.length ? '' : '; se muestran todos los documentos'}.`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('filtroDesde').value = HOY_VERIF;
  document.getElementById('filtroHasta').value = HOY_VERIF;
  poblarFiltroRol();
  renderListaClientes();
  renderMultiDocumentos();
  renderVerificacion();
  aplicarParametrosUrlVerif();
  lucide.createIcons();
});
