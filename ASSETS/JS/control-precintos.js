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
let paginaControlPrecintos = 1; // página actual de la grilla principal (materiales)
// "Ver registros" aquí es una vista simple de solo lectura con los
// precintos individuales de un ingreso puntual (el Detalle con uso/scrap
// por colaborador se retiró de la web en Sprint 4, ver GENERAR_REGISTROS_PRECINTOS_DEMO
// en data-precintos.js — el móvil sigue escribiendo ahí).

document.addEventListener('DOMContentLoaded', () => {
  poblarFiltroMaterialControl();
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

function controlPrecintosTamanoPagina() {
  const select = document.getElementById('controlPrecintosPagSelect');
  return select ? Number(select.value) : 5;
}

function controlPrecintosCambiarTamanoPagina() {
  paginaControlPrecintos = 1;
  renderTablaControlPrecintos();
}

function controlPrecintosIrAPagina(numero) {
  paginaControlPrecintos = numero;
  renderTablaControlPrecintos();
}

function renderPaginacionControlPrecintos(totalPaginas) {
  const prev = document.getElementById('controlPrecintosPagPrev');
  const next = document.getElementById('controlPrecintosPagNext');
  const numeros = document.getElementById('controlPrecintosPagNumeros');
  if (!prev || !next || !numeros) return;

  prev.disabled = paginaControlPrecintos <= 1;
  next.disabled = paginaControlPrecintos >= totalPaginas;

  numeros.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pag-btn' + (i === paginaControlPrecintos ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => controlPrecintosIrAPagina(i);
    numeros.appendChild(btn);
  }
}

function renderTablaControlPrecintos() {
  const tbody = document.getElementById('tbodyControlPrecintos');
  const paginacion = document.getElementById('paginacionControlPrecintos');
  const texto = document.getElementById('searchControlPrecintos').value.trim().toLowerCase();
  const filtroMaterial = document.getElementById('filterMaterialControl').value;

  const filas = obtenerMaterialesControlPrecintos().filter(grupo => {
    if (filtroMaterial && grupo.material !== filtroMaterial) return false;
    if (!texto) return true;
    return grupo.material.toLowerCase().includes(texto);
  });

  if (!filas.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="submodulo-tabla-vacio">No se encontraron materiales registrados.</td></tr>`;
    if (paginacion) paginacion.style.display = 'none';
    return;
  }

  const tamano = controlPrecintosTamanoPagina();
  const totalPaginas = Math.max(1, Math.ceil(filas.length / tamano));
  if (paginaControlPrecintos > totalPaginas) paginaControlPrecintos = totalPaginas;
  if (paginaControlPrecintos < 1) paginaControlPrecintos = 1;
  const inicio = (paginaControlPrecintos - 1) * tamano;
  const visibles = filas.slice(inicio, inicio + tamano);

  tbody.innerHTML = visibles.map((grupo, i) => {
    const disponibleCelda = grupo.disponible
      ? `<span class="asignados-pendiente">${grupo.disponible}</span>`
      : '0';

    return `
    <tr>
      <td>${inicio + i + 1}</td>
      <td>${grupo.fecha}</td>
      <td>${grupo.material}</td>
      <td>${grupo.total}</td>
      <td>${disponibleCelda}</td>
      <td>${nombreColaborador(grupo.ingresadoPor)}</td>
      <td>${grupo.fechaUltimaActualizacion}</td>
      <td class="opciones">
        <button class="btn-accion btn-ver" title="Ver historial" onclick="abrirModalHistorialMaterial('${grupo.material}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionControlPrecintos(totalPaginas);
}

function filtrarControlPrecintos() {
  renderTablaControlPrecintos();
}

function limpiarFiltrosControlPrecintos() {
  document.getElementById('searchControlPrecintos').value = '';
  document.getElementById('filterMaterialControl').value = '';
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
    tbody.innerHTML = `<tr><td colspan="3" class="submodulo-tabla-vacio">Este material no tiene precintos registrados.</td></tr>`;
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

  const filas = [];
  porGrupo.forEach(g => {
    dividirPorMaterialYCorrelatividad(g.precintos).forEach(sub => {
      filas.push({ registroCodigo: g.registroCodigo, estado: g.estado, texto: sub.texto, cantidad: sub.cantidad, precintos: sub.precintos });
    });
  });
  // Lote más reciente primero (el código de lote es correlativo, ver
  // generarCodigoRegistroPrecinto) — no hay una fecha propia por precinto
  // individual para ordenar de otra forma.
  filas.sort((a, b) => b.registroCodigo.localeCompare(a.registroCodigo));

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
    const fechaRegistro = obtenerRegistroPrecintoPorCodigo(f.registroCodigo)?.fecha || '—';
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
    </tr>`;
  }).join('');

  if (paginacion) paginacion.style.display = '';
  renderPaginacionHistorialMaterial(totalPaginas);
}

function abrirModalHistorialMaterial(material) {
  materialHistorialActivo = material;
  paginaHistorialMaterial = 1;
  document.getElementById('historialMaterialNombre').textContent = material;

  renderTablaHistorialMaterial();
  abrirModal('modalHistorialMaterial');
}
