// =================================================
// DATA-USUARIOS.JS
// Fuente única de datos de usuarios y roles (prototipo sin backend).
// La usan: login (index.js), Usuarios (usuarios.js), Roles (roles.js)
// e Información Profesional (informacion-profesional.js, vía el campo
// "usuario" agregado a cada PERFILES[n]).
// =================================================

// Set de permisos "ver" en todo el sistema — lo usan todos los roles
// existentes salvo el rol de demostración "Consulta Restringida".
function permisosCompletos() {
  return {
    general: {
      inicio: { ver: true },
      operaciones: { ver: true },
      reportes: { ver: true }
    },
    seguridad: {
      roles: { ver: true, crear: true, editar: true, inactivar: true },
      usuarios: { ver: true, crear: true, editar: true, cambiarPassword: true, restablecerPassword: true },
      informacionProfesional: { ver: true, crear: true, editar: true, inactivar: true },
      disponibilidadPersonal: { ver: true },
      configuracionDocumentos: { ver: true }
    },
    mantenedores: {
      clientes: { ver: true, crear: true, editar: true, eliminar: true },
      tablasGenerales: { ver: true, exportar: true, aprobar: true },
      configuracionTipoOperacion: { ver: true, editar: true, anular: true }
    }
  };
}

const ROLES_DEMO = [
  { id: 1, nombre: 'Administrador', categorias: ['Administrativo'], estado: 'activo', permisos: permisosCompletos() },
  { id: 2, nombre: 'Gerente de Laboratorio', categorias: ['Administrativo'], estado: 'activo', permisos: permisosCompletos() },
  { id: 3, nombre: 'Analista', categorias: ['Administrativo'], estado: 'activo', permisos: permisosCompletos() },
  { id: 4, nombre: 'Inspector', categorias: ['Operativo'], estado: 'activo', permisos: permisosCompletos() },
  { id: 5, nombre: 'Técnico Especialista', categorias: ['Operativo'], estado: 'activo', permisos: permisosCompletos() },
  { id: 6, nombre: 'Supervisor', categorias: ['Operativo'], estado: 'inactivo', permisos: permisosCompletos() },
  { id: 7, nombre: 'Jefe de Área', categorias: ['Administrativo'], estado: 'activo', permisos: permisosCompletos() },
  { id: 8, nombre: 'Practicante', categorias: ['Operativo'], estado: 'inactivo', permisos: permisosCompletos() },
  {
    id: 9, nombre: 'Consulta Restringida', categorias: ['Administrativo', 'Operativo'], estado: 'activo',
    permisos: {
      general: {
        inicio: { ver: false },
        operaciones: { ver: false },
        reportes: { ver: false }
      },
      seguridad: {
        roles: { ver: true },
        usuarios: { ver: true },
        informacionProfesional: { ver: true },
        disponibilidadPersonal: { ver: false },
        configuracionDocumentos: { ver: false }
      },
      mantenedores: {
        clientes: { ver: true },
        tablasGenerales: { ver: true },
        configuracionTipoOperacion: { ver: false }
      }
    }
  }
];

const USUARIOS_DEMO = [
  { usuario: 'j.torres', password: 'Torres#2026', estadoPass: 'vigente',
    nombre: 'Juan', apellido: 'Torres', email: 'j.torres@intertek.com', dni: '41258963',
    rolId: 1, estado: 'activo', perfilId: null, locacionPrincipal: 'Callao',
    fechaVenc: '20/09/2026', ultimaActualizacion: '20/06/2026' },

  { usuario: 'l.paredes', password: 'Paredes#2026', estadoPass: 'porVencer',
    fechaLabel: 'Vence el 01/06/2026', diasRestantes: 15,
    nombre: 'Lucía', apellido: 'Paredes', email: 'l.paredes@intertek.com', dni: '45896321',
    rolId: 3, estado: 'activo', perfilId: null, locacionPrincipal: 'Pisco',
    fechaVenc: '01/06/2026', ultimaActualizacion: '01/03/2026' },

  { usuario: 'm.rojas', password: 'Rojas#2026', estadoPass: 'vencida',
    fechaLabel: 'Venció el 01/06/2026',
    nombre: 'Marco', apellido: 'Rojas', email: 'm.rojas@intertek.com', dni: '47125896',
    rolId: 2, estado: 'activo', perfilId: null, locacionPrincipal: 'Mollendo',
    fechaVenc: '01/06/2026', ultimaActualizacion: '01/12/2025' },

  { usuario: 'j.elcorrobarrutia', password: 'Elcorro#2026', estadoPass: 'vigente',
    nombre: 'Juan', apellido: 'Elcorrobarrutia', email: 'j.elcorrobarrutia@intertek.com', dni: '42589631',
    rolId: 2, estado: 'activo', perfilId: null, locacionPrincipal: 'Ilo',
    fechaVenc: '15/12/2026', ultimaActualizacion: '18/09/2026' },

  { usuario: 's.echavarria', password: 'Echavarria#2026', estadoPass: 'porVencer',
    nombre: 'Sandra', apellido: 'Echavarria', email: 's.echavarria@intertek.com', dni: '46321589',
    rolId: 6, estado: 'activo', perfilId: 1, locacionPrincipal: 'Talara',
    fechaVenc: '28/08/2026', ultimaActualizacion: '10/06/2026' },

  { usuario: 'm.juarez', password: 'Juarez#2026', estadoPass: 'vigente',
    nombre: 'Maria', apellido: 'Juarez', email: 'm.juarez@intertek.com', dni: '43215896',
    rolId: 8, estado: 'inactivo', perfilId: null, locacionPrincipal: 'Chimbote',
    fechaVenc: '28/08/2026', ultimaActualizacion: '10/06/2026' },

  { usuario: 'j.solis', password: 'Solis#2026', estadoPass: 'vencida',
    nombre: 'Jose', apellido: 'Solis', email: 'j.solis@intertek.com', dni: '48963215',
    rolId: 3, estado: 'activo', perfilId: null, locacionPrincipal: 'Salaverry',
    fechaVenc: '28/08/2026', ultimaActualizacion: '28/05/2026' },

  { usuario: 'b.jimenez', password: 'Jimenez#2026', estadoPass: 'vigente',
    nombre: 'Bandy', apellido: 'Jimenez', email: 'b.jimenez@externo.com', dni: '44589632',
    rolId: 1, estado: 'activo', perfilId: 2, locacionPrincipal: 'Callao',
    fechaVenc: '15/07/2027', ultimaActualizacion: '15/07/2026' },

  { usuario: 'j.ramos', password: 'Ramos#2026', estadoPass: 'vigente',
    nombre: 'Josue', apellido: 'Ramos', email: 'j.ramos@intertek.com', dni: '49632158',
    rolId: 7, estado: 'activo', perfilId: 3, locacionPrincipal: 'Supe',
    fechaVenc: '10/01/2027', ultimaActualizacion: '10/01/2026' },

  // Usuario de demostración con acceso restringido: en Seguridad solo ve
  // Roles, Usuarios e Información Profesional; en Mantenedores solo
  // Clientes y Tablas Generales (ver sección "permisos" del rol 9 arriba).
  { usuario: 'admiIntertek', password: 'admiIntertek', estadoPass: 'vigente',
    nombre: 'Carla', apellido: 'Ventura', email: 'c.ventura@intertek.com', dni: '40125874',
    rolId: 9, estado: 'activo', perfilId: null, locacionPrincipal: 'Callao',
    fechaVenc: '17/07/2027', ultimaActualizacion: '17/07/2026' }
];

function obtenerUsuarioPorLogin(usuario, passwordIngresado) {
  return USUARIOS_DEMO.find(u => u.usuario.toLowerCase() === usuario.toLowerCase() && u.password === passwordIngresado);
}

function obtenerUsuarioPorNombre(usuario) {
  return USUARIOS_DEMO.find(u => u.usuario === usuario);
}

function obtenerRolPorId(id) {
  return ROLES_DEMO.find(r => r.id === Number(id));
}

function obtenerRolPorNombre(nombre) {
  return ROLES_DEMO.find(r => r.nombre === nombre);
}

function obtenerUsuarioActual() {
  const raw = sessionStorage.getItem('sesionUsuario');
  return raw ? JSON.parse(raw) : null;
}

function guardarSesionUsuario(usuarioObj) {
  sessionStorage.setItem('sesionUsuario', JSON.stringify({
    usuario: usuarioObj.usuario,
    nombre: usuarioObj.nombre,
    apellido: usuarioObj.apellido,
    rolId: usuarioObj.rolId
  }));
}

// =================================================
// MODELO DE PERMISOS: qué página corresponde a qué llave dentro de
// "permisos", usado tanto por permisos.js (ocultar sidebar/tabs y
// bloquear el acceso directo) como por index.js (a dónde redirigir
// tras el login según lo que el rol pueda ver).
// =================================================
const PAGINA_PERMISO = {
  'reporte-cabotaje.html':              { grupo: 'general', clave: 'inicio' },
  'alertas-documentos.html':            { grupo: 'general', clave: 'inicio' },
  'reporte-nominacion.html':            { grupo: 'general', clave: 'inicio' },
  'distancias-horas.html':              { grupo: 'general', clave: 'operaciones' },
  'horario-buques.html':                { grupo: 'general', clave: 'operaciones' },
  'retrasos-naves.html':                { grupo: 'general', clave: 'operaciones' },
  'roles.html':                         { grupo: 'seguridad', clave: 'roles' },
  'usuarios.html':                      { grupo: 'seguridad', clave: 'usuarios' },
  'informacion-profesional.html':       { grupo: 'seguridad', clave: 'informacionProfesional' },
  'disponibilidad-personal.html':       { grupo: 'seguridad', clave: 'disponibilidadPersonal' },
  'configuracion-documentos.html':      { grupo: 'seguridad', clave: 'configuracionDocumentos' },
  'cliente.html':                       { grupo: 'mantenedores', clave: 'clientes' },
  'tablas-generales.html':              { grupo: 'mantenedores', clave: 'tablasGenerales' },
  'configuracion-tipo-operacion.html':  { grupo: 'mantenedores', clave: 'configuracionTipoOperacion' }
};

// Orden de prioridad para elegir la primera página de Configuración
// permitida (usado para redirigir tras el login a un rol sin acceso a Inicio)
const ORDEN_PAGINAS_CONFIGURACION = [
  'roles.html', 'usuarios.html', 'informacion-profesional.html',
  'disponibilidad-personal.html', 'configuracion-documentos.html',
  'cliente.html', 'tablas-generales.html', 'configuracion-tipo-operacion.html'
];

function tienePermisoVer(rol, grupo, clave) {
  return !!(rol && rol.permisos && rol.permisos[grupo] && rol.permisos[grupo][clave] && rol.permisos[grupo][clave].ver);
}

function seccionTienePermisoVer(rol, grupo) {
  return !!(rol && rol.permisos && rol.permisos[grupo] && Object.values(rol.permisos[grupo]).some(p => p.ver));
}

function primeraPaginaPermitida(rol) {
  const archivo = ORDEN_PAGINAS_CONFIGURACION.find(a => {
    const permiso = PAGINA_PERMISO[a];
    return permiso && tienePermisoVer(rol, permiso.grupo, permiso.clave);
  });
  return archivo ? `MODULES/CONFIGURACION/${archivo}` : null;
}
