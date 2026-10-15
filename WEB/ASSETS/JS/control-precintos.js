// =================================================
// CONTROL-PRECINTOS.JS
// Precintos > Control de Precintos (grilla) + modal de Registro y "Ver
// registros". La Asignación de Precintos (crear/editar/eliminar) vive en su
// propia interfaz — ver asignacion-precintos.html/js.
// =================================================

let precintosNuevosTemp = [];   // precintos agregados en el modal Registro (aún sin guardar)
let precintoEnEdicionIndex = null;   // índice de precintosNuevosTemp que se está editando en línea (null = ninguno)
let precintoEdicionCancelada = false; // evita que Escape dispare el guardado por blur
let paginaRegistroPrecintos = 1; // página actual de la tabla "Agregar Precinto" — puede acumular varios rangos
// "Ver registros" aquí es una vista simple de solo lectura con los
// precintos individuales de un ingreso puntual (el Detalle con uso/scrap
// por colaborador se retiró de la web en Sprint 4, ver GENERAR_REGISTROS_PRECINTOS_DEMO
// en data-precintos.js — el móvil sigue escribiendo ahí).

document.addEventListener('DOMContentLoaded', () => {
  poblarFiltroMaterialControl();
  poblarSelectPeriodos('filterPeriodoControl');
  renderTablaControlPrecintos();
});

function nombreColaborador(usuario) {
  const u = obtenerUsuarioPorNombre(usuario);
  return u ? `${u.nombre} ${u.apellido}` : usuario;
}

/* =================================================
   GRILLA PRINCIPAL
================================================= */
function poblarFiltroMaterialControl() {
  const select = document.getElementById('filterMaterialControl');
  if (!select) return;
  select.innerHTML = '<option value="">Todos</option>' +
    cargarMaterialesPrecinto().map(m => `<option value="${m.nombre}">${m.nombre}</option>`).join('');
}

// Cards por material (antes tabla) — mismo patrón visual que las tarjetas
// de Relaciones Portuarias (.cp-card en precintos.css, calcado de .rel-card
// de operaciones.css). "Ingresado por" y "Fecha de Registro" ya no van acá
// (corrección pedida): esa última sigue existiendo como filtro por Período,
// e "Ingresado por" pasó al Detalle de Material (Historial de movimientos).
// Sin paginación (corrección pedida): se muestran todas las cards, no son
// tantos materiales distintos como para justificarla.
function renderTablaControlPrecintos() {
  const grid = document.getElementById('controlPrecintosGrid');
  const texto = document.getElementById('searchControlPrecintos').value.trim().toLowerCase();
  const filtroMaterial = document.getElementById('filterMaterialControl').value;
  const rango = rangoDePeriodoSeleccionado('filterPeriodoControl');

  const filas = obtenerMaterialesControlPrecintos().filter(grupo => {
    if (filtroMaterial && grupo.material !== filtroMaterial) return false;
    if (texto && !grupo.material.toLowerCase().includes(texto)) return false;
    // Período compara contra la última actualización del material (el
    // ingreso más reciente que le sumó stock) — mismo criterio que ya usa
    // la columna/orden de la grilla.
    if (rango) {
      const actualizacionISO = fechaDDMMYYYYaISO(grupo.fechaUltimaActualizacion);
      if (actualizacionISO < rango.desde || actualizacionISO > rango.hasta) return false;
    }
    return true;
  });

  if (!filas.length) {
    grid.innerHTML = `<p class="submodulo-tabla-vacio">No se encontraron materiales registrados.</p>`;
    return;
  }

  grid.innerHTML = filas.map(grupo => `
    <div class="cp-card">
      <div class="cp-card-header">
        <div class="cp-card-titulo-wrap">
          <div class="cp-card-titulo">${grupo.material}</div>
          <div class="cp-card-desc">Última actualización: ${grupo.fechaUltimaActualizacion}</div>
        </div>
        <div class="cp-card-icono">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
      </div>
      <div class="cp-card-stats">
        <span>N° de Precintos: <strong>${grupo.total}</strong></span>
      </div>
      <div class="cp-card-body">
        <div class="cp-bloque">
          <div class="cp-bloque-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Stock de precintos</span>
          </div>
          <div class="cp-chips">
            <span class="cp-chip">Disponibles <strong>${grupo.disponible || 0}</strong></span>
            <span class="cp-chip cp-chip-gris">Asignados / usados <strong>${grupo.total - (grupo.disponible || 0)}</strong></span>
          </div>
        </div>
      </div>
      <div class="cp-card-footer">
        <button type="button" class="cp-btn-historial" title="Ver historial de movimientos" onclick="abrirModalHistorialMaterial('${grupo.material}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
          Ver historial
        </button>
      </div>
    </div>`).join('');
}

function filtrarControlPrecintos() {
  renderTablaControlPrecintos();
}

function limpiarFiltrosControlPrecintos() {
  document.getElementById('searchControlPrecintos').value = '';
  document.getElementById('filterMaterialControl').value = '';
  document.getElementById('filterPeriodoControl').value = '';
  renderTablaControlPrecintos();
}

/* =================================================
   MODAL: REGISTRO DE PRECINTOS (Nuevo / Editar)
================================================= */
function registroPrecintosTamanoPagina() {
  const select = document.getElementById('registroPrecintosPagSelect');
  return select ? Number(select.value) : 5;
}

function registroPrecintosCambiarTamanoPagina() {
  paginaRegistroPrecintos = 1;
  renderTablaPrecintosRegistro();
}

function registroPrecintosIrAPagina(numero) {
  paginaRegistroPrecintos = numero;
  renderTablaPrecintosRegistro();
}

function renderPaginacionRegistroPrecintos(totalPaginas) {
  const prev = document.getElementById('registroPrecintosPagPrev');
  const next = document.getElementById('registroPrecintosPagNext');
  const numeros = document.getElementById('registroPrecintosPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaRegistroPrecintos <= 1;
  next.disabled = paginaRegistroPrecintos >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaRegistroPrecintos ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => registroPrecintosIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function renderTablaPrecintosRegistro() {
  const tbody = document.getElementById('tbodyPrecintosRegistro');
  const paginacion = document.getElementById('paginacionRegistroPrecintos');
  document.getElementById('registroCantidadInput').value = precintosNuevosTemp.length;

  if (!precintosNuevosTemp.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron precintos.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = registroPrecintosTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(precintosNuevosTemp.length / tamano));
  if (paginaRegistroPrecintos > totalPaginas) paginaRegistroPrecintos = totalPaginas;
  if (paginaRegistroPrecintos < 1) paginaRegistroPrecintos = 1;
  const inicio = (paginaRegistroPrecintos - 1) * tamano;
  const indicesVisibles = precintosNuevosTemp.map((_, i) => i).slice(inicio, inicio + tamano);

  tbody.innerHTML = indicesVisibles.map(i => {
    const p = precintosNuevosTemp[i];
    const enEdicion = i === precintoEnEdicionIndex;
    const celda = enEdicion
      ? `<input type="text" class="precinto-editar-input" id="precintoEditarInput"
           value="${p}"
           onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();} if(event.key==='Escape'){event.preventDefault();precintoEdicionCancelada=true;this.blur();}"
           onblur="onBlurPrecintoEditar(${i})">`
      : p;
    const acciones = enEdicion
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

  if (paginacion) paginacion.style.display = '';
  renderPaginacionRegistroPrecintos(totalPaginas);

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

  // Ningún precinto puede existir ya en OTRO lote (de cualquier material,
  // incluidos anulados) — se valida antes que el duplicado "en esta misma
  // lista" (Sprint 4, ajuste §3).
  const enOtroLote = candidatos.filter(p => obtenerLoteDePrecinto(p));
  if (enOtroLote.length) {
    const detalle = enOtroLote.slice(0, 5).map(p => `${p} (ya en ${obtenerLoteDePrecinto(p).codigo})`).join(', ');
    mostrarToast(`No se agregaron: ${detalle}${enOtroLote.length > 5 ? '…' : ''}`);
    candidatos = candidatos.filter(p => !enOtroLote.includes(p));
    if (!candidatos.length) return;
  }

  const nuevos = candidatos.filter(p => !precintosNuevosTemp.includes(p));
  const repetidos = candidatos.length - nuevos.length;

  if (!nuevos.length) { mostrarToast('Ese(s) precinto(s) ya fueron agregados.'); return; }

  precintosNuevosTemp.unshift(...nuevos);
  inputDesde.value = '';
  inputHasta.value = '';
  inputDesde.focus();
  paginaRegistroPrecintos = 1; // para que lo recién agregado quede a la vista
  renderTablaPrecintosRegistro();

  if (repetidos > 0) {
    mostrarToast(`Se agregaron ${nuevos.length} precinto(s). ${repetidos} ya existían y se omitieron.`);
  }
}

function editarPrecintoDeRegistro(indice) {
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
  precintosNuevosTemp = [];
  precintoEnEdicionIndex = null;
  paginaRegistroPrecintos = 1;

  document.getElementById('modalRegistroPrecintoTitulo').textContent = 'Registro de Precintos';
  document.getElementById('registroFechaInput').value = new Date().toISOString().slice(0, 10);
  poblarSelectMaterialRegistro();
  limpiarErroresModal('modalRegistroPrecinto');
  renderTablaPrecintosRegistro();
  abrirModal('modalRegistroPrecinto');
}

function guardarRegistroPrecinto() {
  limpiarErroresModal('modalRegistroPrecinto');

  const fechaInput = document.getElementById('registroFechaInput');
  if (!fechaInput.value) {
    mostrarErrorCampo(fechaInput, 'La fecha de registro es obligatoria.');
    return;
  }

  if (!precintosNuevosTemp.length) {
    mostrarToast('Agrega al menos un precinto antes de guardar.');
    return;
  }

  // Última validación contra duplicados en cualquier otro lote antes de
  // guardar — red de seguridad por si otro registro chocó mientras este
  // modal seguía abierto (Sprint 4, ajuste §3); si hay choque, no se guarda
  // nada (no se agrega el registro a medias).
  const enOtroLote = precintosNuevosTemp.filter(p => obtenerLoteDePrecinto(p));
  if (enOtroLote.length) {
    const detalle = enOtroLote.slice(0, 5).map(p => `${p} (ya en ${obtenerLoteDePrecinto(p).codigo})`).join(', ');
    mostrarToast(`No se guardó: estos precintos ya existen en otro registro — ${detalle}${enOtroLote.length > 5 ? '…' : ''}`);
    return;
  }

  const material = document.getElementById('registroMaterialInput').value;
  const sesion = obtenerUsuarioActual();

  PRECINTOS_REGISTROS_DEMO.unshift({
    codigo: generarCodigoRegistroPrecinto(),
    fecha: fechaISOaDDMMYYYY(fechaInput.value),
    estado: 'Registrado',
    material,
    ingresadoPor: sesion ? sesion.usuario : null,
    precintos: [...precintosNuevosTemp]
  });
  guardarEstadoPrecintos();

  cerrarModal('modalRegistroPrecinto');
  renderTablaControlPrecintos();
  mostrarModalGuardado('crear', null, () => {});
}

/* =================================================
   MODAL: DETALLE DE MATERIAL — fusiona lo que antes eran dos modales
   ("Historial de Material", que listaba ingresos/lotes, y "Ver Registros",
   que había que abrir aparte para ver los precintos sueltos de uno de esos
   lotes) en una sola tabla de rangos agrupados con columna Estado
   (Sprint 4, ajuste §3): ya no hace falta entrar a cada lote para saber qué
   quedó disponible, asignado, usado o scrap.
================================================= */
let materialHistorialActivo = null; // material mostrado en el modal (para poder recalcular al cambiar de página)
let paginaHistorialMaterial = 1;

function historialMaterialTamanoPagina() {
  const select = document.getElementById('historialMaterialPagSelect');
  return select ? Number(select.value) : 5;
}

function historialMaterialCambiarTamanoPagina() {
  paginaHistorialMaterial = 1;
  renderTablaHistorialMaterial();
}

function historialMaterialIrAPagina(numero) {
  paginaHistorialMaterial = numero;
  renderTablaHistorialMaterial();
}

function renderPaginacionHistorialMaterial(totalPaginas) {
  const prev = document.getElementById('historialMaterialPagPrev');
  const next = document.getElementById('historialMaterialPagNext');
  const numeros = document.getElementById('historialMaterialPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaHistorialMaterial <= 1;
  next.disabled = paginaHistorialMaterial >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaHistorialMaterial ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => historialMaterialIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function renderTablaHistorialMaterial() {
  const tbody = document.getElementById('tbodyHistorialMaterial');
  const paginacion = document.getElementById('paginacionHistorialMaterial');
  const todos = obtenerTodosLosPrecintosConEstado().filter(f => f.material === materialHistorialActivo);

  if (!todos.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="submodulo-tabla-vacio">Este material no tiene precintos registrados.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  // Agrupa por Lote + Estado (no se muestran como columna, pero sin este
  // agrupamiento se mezclarían rangos de distinto lote/estado en una sola
  // fila) y, dentro de cada grupo, por corrida consecutiva
  // (dividirPorMaterialYCorrelatividad, data-precintos.js) — una
  // Asignación/Lote con 50 precintos en el mismo estado ahora es una sola
  // fila ("A-0301 al A-0350 (50)"), no 50.
  const porGrupo = new Map();
  todos.forEach(f => {
    const clave = `${f.registroCodigo}|${f.estado}`;
    if (!porGrupo.has(clave)) porGrupo.set(clave, { registroCodigo: f.registroCodigo, estado: f.estado, precintos: [] });
    porGrupo.get(clave).precintos.push(f.precinto);
  });

  let filas = [];
  porGrupo.forEach(g => {
    dividirPorMaterialYCorrelatividad(g.precintos).forEach(sub => {
      filas.push({ registroCodigo: g.registroCodigo, estado: g.estado, texto: sub.texto, cantidad: sub.cantidad, precintos: sub.precintos });
    });
  });
  // Lote más reciente primero (el código de lote es correlativo, ver
  // generarCodigoRegistroPrecinto) — no hay una fecha propia por precinto
  // individual para ordenar de otra forma.
  filas.sort((a, b) => b.registroCodigo.localeCompare(a.registroCodigo));

  // Filtro por Período: contra la Fecha de Registro del lote de cada fila
  // — mismo criterio que ya usa Control de Precintos arriba.
  const rango = rangoDePeriodoSeleccionado('filterPeriodoHistorialMaterial');
  if (rango) {
    filas = filas.filter(f => {
      const lote = obtenerRegistroPrecintoPorCodigo(f.registroCodigo);
      if (!lote) return false;
      const fechaISO = fechaDDMMYYYYaISO(lote.fecha);
      return fechaISO >= rango.desde && fechaISO <= rango.hasta;
    });
  }

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="submodulo-tabla-vacio">Sin movimientos para los filtros elegidos.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = historialMaterialTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(filas.length / tamano));
  if (paginaHistorialMaterial > totalPaginas) paginaHistorialMaterial = totalPaginas;
  if (paginaHistorialMaterial < 1) paginaHistorialMaterial = 1;
  const inicio = (paginaHistorialMaterial - 1) * tamano;
  const visibles = filas.slice(inicio, inicio + tamano);

  tbody.innerHTML = visibles.map(f => {
    // Motivo del scrap en tooltip (data-precintos.js, Sprint 4 "reporte
    // usado/scrap + motivo") — mismo helper que usa Asignación de Precintos;
    // sin columna Estado visible, el tooltip queda en la celda de Precintos.
    const tituloMotivo = f.estado === 'scrap' ? ` title="Motivo: ${textoMotivosScrap(f.precintos) || 'Sin motivo registrado'}"` : '';
    // Fecha de Registro: la del lote (Registro de Precintos) al que
    // pertenece esta línea — todos los precintos de una misma línea vienen
    // del mismo registroCodigo (ver agrupación arriba), así que es una sola
    // fecha por fila, no una mezcla. Al final de la fila (después de
    // Cantidad), no junto a Precintos.
    const lote = obtenerRegistroPrecintoPorCodigo(f.registroCodigo);
    const fechaRegistro = lote?.fecha || '—';
    // "Ingresado por" (corrección pedida): ya no va en el card de arriba,
    // solo acá en el detalle de movimientos — mismo lote que la fecha.
    const ingresadoPor = lote ? nombreColaborador(lote.ingresadoPor) : '—';
    // El "(N)" del texto de rango es redundante acá: ya está la columna
    // Cantidad aparte (a diferencia de otras tablas que usan este mismo
    // formato de dividirPorMaterialYCorrelatividad sin una columna Cantidad
    // propia, donde sí hace falta).
    const textoSinConteo = f.texto.replace(/\s*\(\d+\)$/, '');
    return `
    <tr>
      <td${tituloMotivo}>${textoSinConteo}</td>
      <td>${f.cantidad}</td>
      <td>${fechaRegistro}</td>
      <td>${ingresadoPor}</td>
    </tr>`;
  }).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionHistorialMaterial(totalPaginas);
}

function abrirModalHistorialMaterial(material) {
  materialHistorialActivo = material;
  paginaHistorialMaterial = 1;
  document.getElementById('historialMaterialNombre').textContent = material;
  poblarSelectPeriodos('filterPeriodoHistorialMaterial');
  document.getElementById('filterPeriodoHistorialMaterial').value = '';

  renderTablaHistorialMaterial();
  abrirModal('modalHistorialMaterial');
}

/* ==================================================
   CONFIGURACIÓN DE LÍMITES PARA GASTOS — movido desde
   registro-gastos-operativos.js (el botón vive ahora en Control de
   Precintos, dentro del apartado "Configuración de Gastos").
================================================= */
/* =================================================
   MODAL: CONFIGURACIÓN DE LÍMITES PARA GASTOS
================================================= */
function cambiarTabLimites(tab) {
  // Escopado a #limitesTabsGastos (bug real): ".limites-tab" a secas
  // también matcheaba los botones del apartado de afuera (Períodos/Gastos,
  // #configuracionApartados), que no tienen data-tab — les apagaba el
  // "activa" sin querer cada vez que se abría el modal.
  document.querySelectorAll('#limitesTabsGastos .limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.tab === tab));
  document.getElementById('limitesPanelAlimentos').classList.toggle('activo', tab === 'alimentos');
  document.getElementById('limitesPanelMovilidad').classList.toggle('activo', tab === 'movilidad');
  document.getElementById('limitesPanelDiasABordo').classList.toggle('activo', tab === 'diasABordo');
  document.getElementById('limitesPanelJornada').classList.toggle('activo', tab === 'jornada');
}

// =================================================
// SELECTOR DE HORA SPINNER (Cortes de comida, tab Jornada) — mismo estilo
// que ".pcal-spinner" (operaciones.js, Retrasos de Buques) y que el
// selector propio del móvil (gastos-movil.js): flechitas arriba/abajo,
// siempre 12h/am-pm, nunca el <input type="time"> nativo (24h/12h según
// SO/navegador, fuera de nuestro control). Un solo popup compartido (como
// "pcalPopup") porque acá hay 6 campos de hora en la misma pantalla, en vez
// de uno fijo por campo. El hidden input "{baseId}" guarda 24h "HH:MM"
// (mismo contrato que ya usa guardarConfiguracionLimites); el texto visible
// vive en "{baseId}Texto" (ver horaA12 en data-movil.js).
// =================================================
let thoraBaseIdActivo = null;
let thoraHoraValor = 12; // 1-12
let thoraMinutoValor = 0;
let thoraAmPmValor = 'AM';

function actualizarDisplayThora(baseId) {
  const hidden = document.getElementById(baseId);
  const texto = document.getElementById(`${baseId}Texto`);
  if (!hidden || !texto) return;
  texto.value = hidden.value ? horaA12(hidden.value) : '';
}

function thoraCrearPopup() {
  let popup = document.getElementById('thoraPopup');
  if (popup) return popup;
  popup = document.createElement('div');
  popup.id = 'thoraPopup';
  popup.className = 'thora-popup';
  popup.innerHTML = `
    <div class="thora-spinners">
      <div class="thora-spinner" onwheel="thoraRueda(event,'h')">
        <button type="button" class="thora-spin-btn" onclick="thoraAjustar('h',1)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg></button>
        <div class="thora-spin-valor" id="thoraValorH">12</div>
        <button type="button" class="thora-spin-btn" onclick="thoraAjustar('h',-1)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
      </div>
      <div class="thora-spin-sep">:</div>
      <div class="thora-spinner" onwheel="thoraRueda(event,'m')">
        <button type="button" class="thora-spin-btn" onclick="thoraAjustar('m',1)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg></button>
        <div class="thora-spin-valor" id="thoraValorM">00</div>
        <button type="button" class="thora-spin-btn" onclick="thoraAjustar('m',-1)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
      </div>
      <div class="thora-spinner" onwheel="thoraRueda(event,'ampm')">
        <button type="button" class="thora-spin-btn" onclick="thoraAjustar('ampm',1)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg></button>
        <div class="thora-spin-valor thora-spin-valor-ampm" id="thoraValorAmpm">AM</div>
        <button type="button" class="thora-spin-btn" onclick="thoraAjustar('ampm',-1)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>
      </div>
    </div>
    <button type="button" class="btn-guardar thora-listo" onclick="thoraConfirmar()">Listo</button>`;
  document.body.appendChild(popup);
  return popup;
}

function thoraAbrir(baseId) {
  const popup = thoraCrearPopup();
  thoraBaseIdActivo = baseId;
  const hidden = document.getElementById(baseId);
  const input = document.getElementById(`${baseId}Texto`);
  if (!hidden || !input) return;

  const h24 = hidden.value || '00:00';
  const [hh, mm] = h24.split(':').map(Number);
  thoraHoraValor = hh % 12 === 0 ? 12 : hh % 12;
  thoraMinutoValor = mm;
  thoraAmPmValor = hh >= 12 ? 'PM' : 'AM';
  thoraRenderizar();

  const rect = input.getBoundingClientRect();
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.bottom + window.scrollY + 6}px`;
  popup.classList.add('pcal-open');

  // Se registra en el próximo tick para que el click que abrió el popup
  // (burbujeando hasta document) no lo cierre de inmediato — mismo patrón
  // que pcalAbrir en operaciones.js.
  setTimeout(() => document.addEventListener('click', thoraClickAfuera), 0);
}

function thoraRenderizar() {
  document.getElementById('thoraValorH').textContent = String(thoraHoraValor).padStart(2, '0');
  document.getElementById('thoraValorM').textContent = String(thoraMinutoValor).padStart(2, '0');
  document.getElementById('thoraValorAmpm').textContent = thoraAmPmValor;
}

function thoraAjustar(unidad, delta) {
  if (unidad === 'h') thoraHoraValor = ((thoraHoraValor - 1 + delta + 12) % 12) + 1;
  else if (unidad === 'm') thoraMinutoValor = (thoraMinutoValor + delta + 60) % 60;
  else thoraAmPmValor = thoraAmPmValor === 'AM' ? 'PM' : 'AM';
  thoraRenderizar();
}

function thoraRueda(e, unidad) {
  e.preventDefault();
  thoraAjustar(unidad, e.deltaY < 0 ? 1 : -1);
}

function thoraClickAfuera(e) {
  const popup = document.getElementById('thoraPopup');
  if (!popup || popup.contains(e.target) || e.target.closest('.thora-campo')) return;
  thoraCerrar();
}

function thoraCerrar() {
  const popup = document.getElementById('thoraPopup');
  if (popup) popup.classList.remove('pcal-open');
  document.removeEventListener('click', thoraClickAfuera);
}

function thoraConfirmar() {
  if (!thoraBaseIdActivo) return;
  const hidden = document.getElementById(thoraBaseIdActivo);
  const h24 = thoraAmPmValor === 'PM' ? (thoraHoraValor === 12 ? 12 : thoraHoraValor + 12) : (thoraHoraValor === 12 ? 0 : thoraHoraValor);
  hidden.value = `${String(h24).padStart(2, '0')}:${String(thoraMinutoValor).padStart(2, '0')}`;
  hidden.dispatchEvent(new Event('change', { bubbles: true }));
  actualizarDisplayThora(thoraBaseIdActivo);

  const texto = document.getElementById(`${thoraBaseIdActivo}Texto`);
  texto.classList.remove('input-error');
  const msg = texto.nextElementSibling;
  if (msg && msg.classList.contains('input-error-msg')) msg.remove();

  thoraCerrar();
}

// =================================================
// FERIADOS ESPECIALES (tipo de cambio) — mismo patrón de alta/baja que
// "Días Especiales" para la fecha (día+mes recurrente) y el monto, salvo que
// acá el monto está en dólares: lo que hace falta además es el tipo de
// cambio del día exacto, que se registra una sola vez desde
// renderAlertaTipoCambioHoy/guardarTipoCambioHoy (ver data-gastos.js >
// registrarTipoCambioFeriadoEspecial), para saber a cuánto equivale en soles.
// =================================================
function poblarSelectsFeriadoEspecial() {
  const selectDia = document.getElementById('nuevoFeriadoEspecialDia');
  const selectMes = document.getElementById('nuevoFeriadoEspecialMes');
  if (!selectDia || !selectMes) return;

  selectDia.innerHTML = Array.from({ length: 31 }, (_, i) => i + 1)
    .map(d => `<option value="${d}">${d}</option>`).join('');
  selectMes.innerHTML = MESES_GASTOS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
}

/* =================================================
   FERIADOS OFICIALES (calendario oficial peruano, PROMPT_GASTOS_CONFIG_
   SPRINT4 §2) — se pagan todos al mismo monto fijo (cfg.feriadoOficial,
   ver "Montos fijos"); esta lista solo define QUÉ fechas cuentan como
   feriado oficial (Día, Mes, Descripción, Año opcional — con año = fecha
   puntual de un año concreto, p.ej. Jueves/Viernes Santo; sin año = se
   repite cada año). Mismo patrón visual que Feriados Especiales de abajo,
   sin la parte de tipo de cambio (acá el monto ya es fijo en soles).
================================================= */
function poblarSelectsFeriado() {
  const selectDia = document.getElementById('nuevoFeriadoDia');
  const selectMes = document.getElementById('nuevoFeriadoMes');
  if (!selectDia || !selectMes) return;

  selectDia.innerHTML = Array.from({ length: 31 }, (_, i) => i + 1)
    .map(d => `<option value="${d}">${d}</option>`).join('');
  selectMes.innerHTML = MESES_GASTOS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('');
}

function renderTablaFeriados() {
  const tbody = document.getElementById('tbodyFeriados');
  if (!tbody) return;
  const fechas = (LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales || [])
    .slice()
    .sort((a, b) => (a.mes - b.mes) || (a.dia - b.dia));
  tbody.innerHTML = fechas.length
    ? fechas.map(f => `
      <tr>
        <td>${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')}${f.anio ? `/${f.anio}` : ''} <span class="dia-especial-nota">${f.anio ? `(solo ${f.anio})` : '(todos los años)'}</span></td>
        <td>${f.descripcion || '—'}</td>
        <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarFeriado(${f.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button></td>
      </tr>`).join('')
    : `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron Feriados Oficiales.</td></tr>`;
}

function agregarFeriado() {
  const diaInput = document.getElementById('nuevoFeriadoDia');
  const mesInput = document.getElementById('nuevoFeriadoMes');
  const descripcionInput = document.getElementById('nuevoFeriadoDescripcion');
  const dia = parseInt(diaInput.value, 10);
  const mes = parseInt(mesInput.value, 10);
  const descripcion = descripcionInput.value.trim();
  const anio = null; // los feriados nuevos se repiten todos los años

  if (!descripcion) { mostrarErrorCampo(descripcionInput, 'Ingresa una descripción'); return; }

  const lista = LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales || (LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales = []);
  const duplicada = lista.some(f => f.dia === dia && f.mes === mes && f.anio === anio);
  if (duplicada) { mostrarToast('Esa fecha ya está registrada como Feriado Oficial.'); return; }
  const esEspecial = LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.some(f => f.dia === dia && f.mes === mes);
  if (esEspecial) { mostrarToast('Esa fecha ya está registrada como Feriado Especial: ese prevalece, no se puede duplicar como Oficial.'); return; }

  const nuevoId = (Math.max(0, ...lista.map(f => f.id)) || 0) + 1;
  lista.push({ id: nuevoId, dia, mes, descripcion, anio });
  guardarLimitesGastos();

  diaInput.value = '1';
  mesInput.value = '1';
  descripcionInput.value = '';
  renderTablaFeriados();
}

function quitarFeriado(id) {
  LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales = LIMITES_GASTOS_DEMO.diasABordo.feriadosOficiales.filter(f => f.id !== id);
  guardarLimitesGastos();
  renderTablaFeriados();
}

function renderTablaFeriadosEspeciales() {
  const tbody = document.getElementById('tbodyFeriadosEspeciales');
  const fechas = LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales;
  tbody.innerHTML = fechas.length
    ? fechas.map(f => `
      <tr>
        <td>${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')} <span class="dia-especial-nota">(todos los años)</span></td>
        <td>US$ ${Number(f.montoUSD).toFixed(2)}</td>
        <td><button type="button" class="btn-quitar-fila" title="Quitar" onclick="quitarFeriadoEspecial(${f.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button></td>
      </tr>`).join('')
    : `<tr><td colspan="3" class="submodulo-tabla-vacio">Aún no se agregaron Feriados Especiales.</td></tr>`;
}

function agregarFeriadoEspecial() {
  const diaInput = document.getElementById('nuevoFeriadoEspecialDia');
  const mesInput = document.getElementById('nuevoFeriadoEspecialMes');
  const montoInput = document.getElementById('nuevoFeriadoEspecialMonto');
  const dia = parseInt(diaInput.value, 10);
  const mes = parseInt(mesInput.value, 10);
  const montoUSD = parseFloat(montoInput.value);

  if (isNaN(montoUSD) || montoUSD <= 0) { mostrarErrorCampo(montoInput, 'Ingresa un monto en dólares válido, mayor a cero'); return; }

  const duplicada = LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.some(f => f.dia === dia && f.mes === mes);
  if (duplicada) { mostrarToast('Esa fecha ya está registrada como Feriado Especial.'); return; }

  const nuevoId = (Math.max(0, ...LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.map(f => f.id)) || 0) + 1;
  LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.push({ id: nuevoId, dia, mes, montoUSD });
  guardarLimitesGastos();

  diaInput.value = '1';
  mesInput.value = '1';
  montoInput.value = '';
  renderTablaFeriadosEspeciales();
  renderAlertaTipoCambioHoy();
  actualizarAlertaFeriadoEspecial();
}

function quitarFeriadoEspecial(id) {
  LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales = LIMITES_GASTOS_DEMO.diasABordo.feriadosEspeciales.filter(f => f.id !== id);
  guardarLimitesGastos();
  renderTablaFeriadosEspeciales();
  renderAlertaTipoCambioHoy();
  actualizarAlertaFeriadoEspecial();
}

function poblarFiltroAgregadoPorTiposCambio() {
  const select = document.getElementById('filtroTcAgregadoPor');
  const actual = select.value;
  const usuarios = [...new Set(TIPOS_CAMBIO_FERIADOS_DEMO.map(t => t.agregadoPor))];
  select.innerHTML = '<option value="">Todos</option>'
    + usuarios.map(u => `<option value="${u}">${nombreColaboradorGastos(u)}</option>`).join('');
  select.value = usuarios.includes(actual) ? actual : '';
}

function limpiarFiltrosTiposCambio() {
  document.getElementById('filtroTcFecha').value = '';
  document.getElementById('filtroTcAgregadoPor').value = '';
  renderTablaTiposCambioFeriados();
}

let tipoCambioEnEdicionId = null;

function renderTablaTiposCambioFeriados() {
  const tbody = document.getElementById('tbodyTiposCambioFeriados');
  poblarFiltroAgregadoPorTiposCambio();
  const fecha = document.getElementById('filtroTcFecha').value;
  const agregadoPor = document.getElementById('filtroTcAgregadoPor').value;
  const sesion = obtenerUsuarioActual();
  const puede = sesion && usuarioPuedeRegistrarTipoCambio(sesion.usuario);

  const lista = TIPOS_CAMBIO_FERIADOS_DEMO.filter(t => {
    if (fecha && fechaDDMMYYYYaISO(t.fecha) !== fecha) return false;
    if (agregadoPor && t.agregadoPor !== agregadoPor) return false;
    return true;
  });

  tbody.innerHTML = lista.length
    ? lista.map(t => {
      const editable = tipoCambioEsEditable(t);
      const titulo = !puede ? 'No tienes permiso para editar'
        : editable ? 'Editar'
        : `Bloqueado: pasaron más de ${DIAS_PLAZO_EDICION_TIPO_CAMBIO} días desde el feriado`;
      const habilitado = puede && editable;
      const enEdicion = t.id === tipoCambioEnEdicionId && habilitado;
      if (enEdicion) {
        return `
      <tr>
        <td>${t.fecha}</td>
        <td><input type="number" step="0.01" class="modal-input" id="editarTcMonto" value="${t.montoUSD}" style="height:32px;width:100px;" oninput="recalcularSolesEdicionTipoCambio()" onkeydown="if(event.key==='Enter')guardarEdicionTipoCambio();if(event.key==='Escape')cancelarEdicionTipoCambio();"></td>
        <td><input type="number" step="0.001" class="modal-input" id="editarTcValor" value="${t.tipoCambio}" style="height:32px;width:90px;" oninput="recalcularSolesEdicionTipoCambio()" onkeydown="if(event.key==='Enter')guardarEdicionTipoCambio();if(event.key==='Escape')cancelarEdicionTipoCambio();"></td>
        <td id="editarTcSoles">S/ ${Number(t.montoSoles).toFixed(2)}</td>
        <td>${nombreColaboradorGastos(t.agregadoPor)}</td>
        <td><button type="button" class="btn-editar-fila btn-guardar-fila" title="Guardar" onclick="guardarEdicionTipoCambio()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
        </button></td>
      </tr>`;
      }
      return `
      <tr>
        <td>${t.fecha}</td>
        <td>US$ ${Number(t.montoUSD).toFixed(2)}</td>
        <td>${Number(t.tipoCambio).toFixed(3)}</td>
        <td>S/ ${Number(t.montoSoles).toFixed(2)}</td>
        <td>${nombreColaboradorGastos(t.agregadoPor)}</td>
        <td><button type="button" class="btn-editar-fila" title="${titulo}" ${habilitado ? `onclick="editarTipoCambioEnFila(${t.id})"` : 'disabled style="opacity:.4;cursor:not-allowed;"'}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>
        </button></td>
      </tr>`;
    }).join('')
    : `<tr><td colspan="6" class="submodulo-tabla-vacio">${TIPOS_CAMBIO_FERIADOS_DEMO.length ? 'Sin resultados para los filtros elegidos.' : 'Todavía no se registró ningún tipo de cambio.'}</td></tr>`;
}

function recalcularSolesEdicionTipoCambio() {
  const monto = parseFloat(document.getElementById('editarTcMonto').value) || 0;
  const tc = parseFloat(document.getElementById('editarTcValor').value) || 0;
  document.getElementById('editarTcSoles').textContent = `S/ ${(Math.round(monto * tc * 100) / 100).toFixed(2)}`;
}

// Edición en la misma fila (sin modal): el lápiz habilita Monto y Tipo de
// cambio, y pasa a ser un check que guarda — mismo patrón que la edición de
// precintos en el Registro. Enter guarda, Escape cancela.
function editarTipoCambioEnFila(id) {
  const registro = TIPOS_CAMBIO_FERIADOS_DEMO.find(t => t.id === id);
  if (!registro) return;
  if (!tipoCambioEsEditable(registro)) {
    mostrarToast(`Solo se puede editar hasta ${DIAS_PLAZO_EDICION_TIPO_CAMBIO} días después del feriado.`);
    tipoCambioEnEdicionId = null;
    renderTablaTiposCambioFeriados();
    return;
  }
  tipoCambioEnEdicionId = id;
  renderTablaTiposCambioFeriados();
  document.getElementById('editarTcMonto')?.focus();
}

function cancelarEdicionTipoCambio() {
  tipoCambioEnEdicionId = null;
  renderTablaTiposCambioFeriados();
}

function guardarEdicionTipoCambio() {
  const monto = document.getElementById('editarTcMonto');
  const valor = document.getElementById('editarTcValor');
  const montoUSD = parseFloat(monto.value);
  const tipoCambio = parseFloat(valor.value);
  if (isNaN(montoUSD) || montoUSD <= 0) { mostrarErrorCampo(monto, 'Monto inválido'); return; }
  if (isNaN(tipoCambio) || tipoCambio <= 0) { mostrarErrorCampo(valor, 'Tipo de cambio inválido'); return; }

  const sesion = obtenerUsuarioActual();
  const resultado = editarTipoCambioFeriadoEspecial(tipoCambioEnEdicionId, tipoCambio, montoUSD, sesion.usuario);
  if (!resultado.ok) { mostrarToast(resultado.motivo); return; }

  tipoCambioEnEdicionId = null;
  renderTablaTiposCambioFeriados();
  mostrarToast('Tipo de cambio actualizado correctamente.');
}

// Solo se muestra el día exacto de un Feriado Especial sin tipo de cambio
// registrado todavía, y solo si quien tiene la sesión abierta puede
// registrarlo (ver usuarioPuedeRegistrarTipoCambio en data-gastos.js) — para
// cualquier otro caso (no es Feriado Especial hoy, ya se registró, o no
// tiene permiso) la banda queda oculta.
function renderAlertaTipoCambioHoy() {
  const caja = document.getElementById('alertaTipoCambioHoy');
  if (!caja) return;
  const sesion = obtenerUsuarioActual();
  const puede = sesion && usuarioPuedeRegistrarTipoCambio(sesion.usuario);
  const feriado = obtenerFeriadoEspecialDeHoy();
  const mostrar = feriado && !obtenerTipoCambioDeHoy() && puede;
  caja.style.display = mostrar ? '' : 'none';
  if (mostrar) {
    document.getElementById('nuevoTipoCambioHoy').value = '';
    document.getElementById('alertaTipoCambioMontoUSD').textContent = `US$ ${Number(feriado.montoUSD).toFixed(2)}`;
  }
}

function guardarTipoCambioHoy() {
  const input = document.getElementById('nuevoTipoCambioHoy');
  const valor = parseFloat(input.value);
  if (isNaN(valor) || valor <= 0) { mostrarErrorCampo(input, 'Ingresa un tipo de cambio válido, mayor a cero'); return; }

  const sesion = obtenerUsuarioActual();
  const resultado = registrarTipoCambioFeriadoEspecial(valor, sesion.usuario);
  if (!resultado.ok) { mostrarToast(resultado.motivo); return; }

  renderAlertaTipoCambioHoy();
  renderTablaTiposCambioFeriados();
  mostrarToast('Tipo de cambio registrado correctamente.');
}

// Monto Máximo por Día de Alimentos ya no se edita a mano: se recalcula
// solo como Desayuno + Almuerzo + Cena (el campo queda bloqueado en el
// HTML) — se llama al abrir el modal y en cada oninput de los 3 montos.
function recalcularLimAlimentosMaximoDia() {
  const desayuno = parseFloat(document.getElementById('limAlimentosDesayuno').value) || 0;
  const almuerzo = parseFloat(document.getElementById('limAlimentosAlmuerzo').value) || 0;
  const cena = parseFloat(document.getElementById('limAlimentosCena').value) || 0;
  document.getElementById('limAlimentosMaximoDia').value = (desayuno + almuerzo + cena).toFixed(2);
}

function abrirModalConfiguracionLimites() {
  cambiarApartadoConfiguracion('periodos');
  const cfg = LIMITES_GASTOS_DEMO;
  const u = obtenerUsuarioPorNombre(cfg.modificadoPor);
  document.getElementById('limitesModificadoPor').textContent = u ? `${u.nombre} ${u.apellido}` : cfg.modificadoPor;
  document.getElementById('limitesFechaModificacion').textContent = cfg.fechaModificacion;

  document.getElementById('limAlimentosDesayuno').value = cfg.alimentos.desayuno;
  document.getElementById('limAlimentosDesayunoAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorDesayuno).toFixed(2)}`;
  document.getElementById('limAlimentosAlmuerzo').value = cfg.alimentos.almuerzo;
  document.getElementById('limAlimentosAlmuerzoAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorAlmuerzo).toFixed(2)}`;
  document.getElementById('limAlimentosCena').value = cfg.alimentos.cena;
  document.getElementById('limAlimentosCenaAnterior').textContent = `S/ ${Number(cfg.alimentos.montoAnteriorCena).toFixed(2)}`;
  recalcularLimAlimentosMaximoDia();

  document.getElementById('limMovilidadMaximoDia').value = cfg.movilidad.montoMaximoDia;
  document.getElementById('limMovilidadMaximoDiaAnterior').textContent = `S/ ${Number(cfg.movilidad.montoAnteriorDia).toFixed(2)}`;
  document.getElementById('limMovilidadMaximoViaje').value = cfg.movilidad.montoMaximoViaje;
  document.getElementById('limMovilidadMaximoViajeAnterior').textContent = `S/ ${Number(cfg.movilidad.montoAnteriorViaje).toFixed(2)}`;

  document.getElementById('limDiasBordoNormal').value = cfg.diasABordo.diaNormal;
  document.getElementById('limDiasBordoNormalAnterior').textContent = `S/ ${Number(cfg.diasABordo.montoAnteriorDiaNormal).toFixed(2)}`;
  document.getElementById('limDiasBordoDomingo').value = cfg.diasABordo.domingo;
  document.getElementById('limDiasBordoDomingoAnterior').textContent = `S/ ${Number(cfg.diasABordo.montoAnteriorDomingo).toFixed(2)}`;
  document.getElementById('limDiasBordoFeriadoOficial').value = cfg.diasABordo.feriadoOficial;
  document.getElementById('limDiasBordoFeriadoOficialAnterior').textContent = `S/ ${Number(cfg.diasABordo.montoAnteriorFeriadoOficial).toFixed(2)}`;

  // Jornada (PROMPT_GASTOS_JORNADA_SPRINT4 §1/§3/§5) — vive en
  // CONFIG_JORNADA_DEMO (data-movil.js), no en LIMITES_GASTOS_DEMO: son
  // parámetros de la Jornada, no tarifas de Gastos, pero se editan desde
  // el mismo modal de Configuración por pedido del cliente.
  if (typeof CONFIG_JORNADA_DEMO === 'object') {
    [
      ['limJornadaCorteDesayunoDesde', CONFIG_JORNADA_DEMO.corteDesayunoDesde],
      ['limJornadaCorteDesayunoHasta', CONFIG_JORNADA_DEMO.corteDesayunoHasta],
      ['limJornadaCorteAlmuerzoDesde', CONFIG_JORNADA_DEMO.corteAlmuerzoDesde],
      ['limJornadaCorteAlmuerzoHasta', CONFIG_JORNADA_DEMO.corteAlmuerzoHasta],
      ['limJornadaCorteCenaDesde', CONFIG_JORNADA_DEMO.corteCenaDesde],
      ['limJornadaCorteCenaHasta', CONFIG_JORNADA_DEMO.corteCenaHasta]
    ].forEach(([baseId, valor24]) => {
      document.getElementById(baseId).value = valor24;
      actualizarDisplayThora(baseId);
    });
    document.getElementById('limJornadaPlazoOlvido').value = CONFIG_JORNADA_DEMO.plazoOlvidoHoras;
    document.getElementById('limJornadaHorasMinDiasBordo').value = CONFIG_JORNADA_DEMO.horasMinimasDiaABordo;
    document.getElementById('limJornadaHoraRecordatorio').value = CONFIG_JORNADA_DEMO.horaRecordatorioOlvidos || '18:00';
    actualizarDisplayThora('limJornadaHoraRecordatorio');
    const modU = CONFIG_JORNADA_DEMO.modificadoPor ? obtenerUsuarioPorNombre(CONFIG_JORNADA_DEMO.modificadoPor) : null;
    document.getElementById('limJornadaRecordatorioModificado').textContent = CONFIG_JORNADA_DEMO.fechaModificacion
      ? `Último cambio por ${modU ? modU.nombre + ' ' + modU.apellido : CONFIG_JORNADA_DEMO.modificadoPor} el ${CONFIG_JORNADA_DEMO.fechaModificacion}`
      : '';
  }

  poblarSelectsFeriado();
  renderTablaFeriados();
  poblarSelectsFeriadoEspecial();
  renderTablaFeriadosEspeciales();
  renderAlertaTipoCambioHoy();
  renderTablaTiposCambioFeriados();

  cambiarTabLimites('alimentos');
  abrirModal('modalConfiguracionLimites');
}

function guardarConfiguracionLimites() {
  // Monto Máximo por Día de Alimentos queda fuera de esta validación: ya no
  // se edita a mano, se deriva de Desayuno+Almuerzo+Cena (ver
  // recalcularLimAlimentosMaximoDia) — validar esos 3 ya lo cubre.
  const campos = [
    document.getElementById('limAlimentosDesayuno'), document.getElementById('limAlimentosAlmuerzo'),
    document.getElementById('limAlimentosCena'),
    document.getElementById('limMovilidadMaximoDia'), document.getElementById('limMovilidadMaximoViaje'),
    document.getElementById('limDiasBordoNormal'), document.getElementById('limDiasBordoDomingo'),
    document.getElementById('limDiasBordoFeriadoOficial')
  ];

  for (const campo of campos) {
    const valor = parseFloat(campo.value);
    if (isNaN(valor) || valor <= 0) {
      mostrarErrorCampo(campo, 'Debe ser mayor a cero');
      campo.focus();
      return;
    }
  }

  const cfg = LIMITES_GASTOS_DEMO;
  cfg.alimentos.montoAnteriorDesayuno = cfg.alimentos.desayuno;
  cfg.alimentos.montoAnteriorAlmuerzo = cfg.alimentos.almuerzo;
  cfg.alimentos.montoAnteriorCena = cfg.alimentos.cena;
  cfg.alimentos.desayuno = parseFloat(document.getElementById('limAlimentosDesayuno').value);
  cfg.alimentos.almuerzo = parseFloat(document.getElementById('limAlimentosAlmuerzo').value);
  cfg.alimentos.cena = parseFloat(document.getElementById('limAlimentosCena').value);
  cfg.alimentos.montoMaximoDia = cfg.alimentos.desayuno + cfg.alimentos.almuerzo + cfg.alimentos.cena;

  cfg.movilidad.montoAnteriorDia = cfg.movilidad.montoMaximoDia;
  cfg.movilidad.montoAnteriorViaje = cfg.movilidad.montoMaximoViaje;
  cfg.movilidad.montoMaximoDia = parseFloat(document.getElementById('limMovilidadMaximoDia').value);
  cfg.movilidad.montoMaximoViaje = parseFloat(document.getElementById('limMovilidadMaximoViaje').value);

  cfg.diasABordo.montoAnteriorDiaNormal = cfg.diasABordo.diaNormal;
  cfg.diasABordo.montoAnteriorDomingo = cfg.diasABordo.domingo;
  cfg.diasABordo.montoAnteriorFeriadoOficial = cfg.diasABordo.feriadoOficial;
  cfg.diasABordo.diaNormal = parseFloat(document.getElementById('limDiasBordoNormal').value);
  cfg.diasABordo.domingo = parseFloat(document.getElementById('limDiasBordoDomingo').value);
  cfg.diasABordo.feriadoOficial = parseFloat(document.getElementById('limDiasBordoFeriadoOficial').value);

  // Jornada: validación propia (hora/horas/minutos, no "mayor a cero" como
  // los montos de arriba) antes de guardar en CONFIG_JORNADA_DEMO.
  if (typeof CONFIG_JORNADA_DEMO === 'object') {
    const cortes = [
      ['limJornadaCorteDesayunoDesde', 'limJornadaCorteDesayunoHasta'],
      ['limJornadaCorteAlmuerzoDesde', 'limJornadaCorteAlmuerzoHasta'],
      ['limJornadaCorteCenaDesde', 'limJornadaCorteCenaHasta']
    ].map(([idDesde, idHasta]) => ({
      desdeInput: document.getElementById(idDesde), hastaInput: document.getElementById(idHasta),
      // El error visual tiene que marcarse en el input VISIBLE (el "Texto"
      // de 12h) — el hidden de abajo (24h, el que de verdad se valida/guarda)
      // no se ve, así que mostrarErrorCampo ahí no tendría efecto.
      desdeTexto: document.getElementById(`${idDesde}Texto`), hastaTexto: document.getElementById(`${idHasta}Texto`)
    }));
    const plazoOlvidoInput = document.getElementById('limJornadaPlazoOlvido');
    const horasMinInput = document.getElementById('limJornadaHorasMinDiasBordo');
    const horaRecordatorioInput = document.getElementById('limJornadaHoraRecordatorio');
    const horaRecordatorioTexto = document.getElementById('limJornadaHoraRecordatorioTexto');

    for (const { desdeInput, hastaInput, desdeTexto, hastaTexto } of cortes) {
      if (!desdeInput.value) { mostrarErrorCampo(desdeTexto, 'Campo obligatorio'); desdeTexto.focus(); return; }
      if (!hastaInput.value) { mostrarErrorCampo(hastaTexto, 'Campo obligatorio'); hastaTexto.focus(); return; }
      if (hastaInput.value <= desdeInput.value) { mostrarErrorCampo(hastaTexto, 'Debe ser posterior a "Desde"'); hastaTexto.focus(); return; }
    }
    if (!horaRecordatorioInput.value) { mostrarErrorCampo(horaRecordatorioTexto, 'Campo obligatorio'); horaRecordatorioTexto.focus(); return; }
    const camposJornadaNumericos = [plazoOlvidoInput, horasMinInput];
    for (const campo of camposJornadaNumericos) {
      const valor = parseFloat(campo.value);
      if (isNaN(valor) || valor < 0) { mostrarErrorCampo(campo, 'Debe ser un número válido'); campo.focus(); return; }
    }

    const huboCambioRecordatorio = CONFIG_JORNADA_DEMO.horaRecordatorioOlvidos !== horaRecordatorioInput.value;

    CONFIG_JORNADA_DEMO.corteDesayunoDesde = cortes[0].desdeInput.value;
    CONFIG_JORNADA_DEMO.corteDesayunoHasta = cortes[0].hastaInput.value;
    CONFIG_JORNADA_DEMO.corteAlmuerzoDesde = cortes[1].desdeInput.value;
    CONFIG_JORNADA_DEMO.corteAlmuerzoHasta = cortes[1].hastaInput.value;
    CONFIG_JORNADA_DEMO.corteCenaDesde = cortes[2].desdeInput.value;
    CONFIG_JORNADA_DEMO.corteCenaHasta = cortes[2].hastaInput.value;
    CONFIG_JORNADA_DEMO.plazoOlvidoHoras = parseFloat(plazoOlvidoInput.value);
    CONFIG_JORNADA_DEMO.horasMinimasDiaABordo = parseFloat(horasMinInput.value);
    CONFIG_JORNADA_DEMO.recordatorioOlvidosActivo = true;
    CONFIG_JORNADA_DEMO.horaRecordatorioOlvidos = horaRecordatorioInput.value;
    if (huboCambioRecordatorio) {
      const sesionCfg = obtenerUsuarioActual();
      CONFIG_JORNADA_DEMO.modificadoPor = sesionCfg ? sesionCfg.usuario : CONFIG_JORNADA_DEMO.modificadoPor;
      CONFIG_JORNADA_DEMO.fechaModificacion = fechaHoraActualGastos();
    }
    guardarConfigJornada();
  }

  const sesion = obtenerUsuarioActual();
  cfg.modificadoPor = sesion ? sesion.usuario : cfg.modificadoPor;
  cfg.fechaModificacion = fechaHoraActualGastos();
  guardarLimitesGastos();

  cerrarModal('modalConfiguracionLimites');
  mostrarToast('La configuración de límites fue guardada correctamente.');
}

/* =================================================
   CONFIGURACIÓN (botón movido desde Gastos Operativos): 2 apartados
   en el mismo modal — "Configuración de Gastos" (todo lo de abajo,
   sin cambios) y "Configuración de Períodos" (nuevo).
================================================= */
function cambiarApartadoConfiguracion(apartado) {
  document.querySelectorAll('#configuracionApartados .limites-tab').forEach(btn => btn.classList.toggle('activa', btn.dataset.apartado === apartado));
  document.getElementById('apartadoConfigGastos').classList.toggle('activo', apartado === 'gastos');
  document.getElementById('apartadoConfigPeriodos').classList.toggle('activo', apartado === 'periodos');
  const btnGuardar = document.getElementById('btnGuardarConfigGastos');
  if (btnGuardar) btnGuardar.style.display = apartado === 'gastos' ? '' : 'none';
  if (apartado === 'periodos') renderTablaPeriodosGastos();
}

function renderTablaPeriodosGastos() {
  const tbody = document.getElementById('tbodyPeriodosGastos');
  if (!tbody) return;
  // Descendente (el más reciente primero) — mismo criterio que el resto
  // de la app (Reportes, Historial): lo último siempre arriba.
  const lista = PERIODOS_GASTOS_DEMO.slice().sort((a, b) => fechaDDMMYYYYaISO(b.fechaInicio).localeCompare(fechaDDMMYYYYaISO(a.fechaInicio)));
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="submodulo-tabla-vacio">Aún no se crearon períodos.</td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(p => {
    const estado = estadoPeriodoGasto(p);
    const claseBadge = estado === 'Registrado' || estado === 'Abierto' ? 'badge-vigente' : 'badge-gris';
    return `
    <tr>
      <td>${p.nombre}</td>
      <td>${p.fechaInicio}</td>
      <td>${p.fechaFin}</td>
      <td><span class="badge ${claseBadge}"><span class="badge-dot"></span>${estado}</span></td>
      <td class="opciones">
        <button class="btn-accion btn-eliminar" title="Eliminar" onclick="eliminarPeriodoGasto(${p.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

function crearPeriodoGasto() {
  const nombreInput = document.getElementById('nuevoPeriodoNombre');
  const inicioInput = document.getElementById('nuevoPeriodoInicio');
  const finInput = document.getElementById('nuevoPeriodoFin');
  const nombre = nombreInput.value.trim();
  if (!nombre) { mostrarErrorCampo(nombreInput, 'Ingresa un nombre'); return; }
  if (!inicioInput.value || !finInput.value) { mostrarToast('Selecciona fecha de inicio y fin.'); return; }
  if (finInput.value < inicioInput.value) { mostrarErrorCampo(finInput, 'Debe ser posterior a la fecha de inicio'); return; }

  const nuevoId = (Math.max(0, ...PERIODOS_GASTOS_DEMO.map(p => p.id)) || 0) + 1;
  PERIODOS_GASTOS_DEMO.push({
    id: nuevoId, nombre,
    fechaInicio: fechaISOaDDMMYYYY(inicioInput.value),
    fechaFin: fechaISOaDDMMYYYY(finInput.value)
  });
  guardarPeriodosGastos();
  nombreInput.value = ''; inicioInput.value = ''; finInput.value = '';
  renderTablaPeriodosGastos();
  poblarSelectPeriodos('filterPeriodoControl');
  poblarSelectPeriodos('filterPeriodoHistorialMaterial');
  mostrarToast('Período creado correctamente.');
}

function eliminarPeriodoGasto(id) {
  confirmarAccion('¿Eliminar este período? Esta acción no se puede deshacer.', () => {
    const idx = PERIODOS_GASTOS_DEMO.findIndex(p => p.id === id);
    if (idx !== -1) PERIODOS_GASTOS_DEMO.splice(idx, 1);
    guardarPeriodosGastos();
    renderTablaPeriodosGastos();
    poblarSelectPeriodos('filterPeriodoControl');
    poblarSelectPeriodos('filterPeriodoHistorialMaterial');
    });
}
