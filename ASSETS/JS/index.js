  // =================================================
  // USUARIOS DEMO (prototipo sin backend)
  // =================================================
  const USUARIOS_DEMO = [
    { usuario: 'j.torres',  password: 'Torres#2026',  estadoPass: 'vigente' },
    { usuario: 'l.paredes', password: 'Paredes#2026', estadoPass: 'porVencer', fechaLabel: 'Vence el 01/06/2026', diasRestantes: 15 },
    { usuario: 'm.rojas',   password: 'Rojas#2026',   estadoPass: 'vencida',   fechaLabel: 'Venció el 01/06/2026' },
  ];

  const DESTINO_LOGIN = 'MODULES/INICIO/reporte-cabotaje.html';

  let usuarioActivo = null; // usuario demo que disparó el modal de contraseña

  function toggleCampoPass(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
      input.type = 'text';
      icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
      input.type = 'password';
      icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
  }

  function togglePassword() {
    toggleCampoPass('password', 'eyeIcon');
  }

  function medirFuerzaLogin(inputId, contenedorId) {
    const valor = document.getElementById(inputId).value;
    const cont  = document.getElementById(contenedorId);
    const texto = cont.querySelector('.fuerza-texto');

    cont.classList.remove('f-debil', 'f-media', 'f-fuerte');

    if (!valor) {
      texto.textContent = '';
      return;
    }

    let puntos = 0;
    if (valor.length >= 8) puntos++;
    if (/[A-Z]/.test(valor)) puntos++;
    if (/[0-9]/.test(valor)) puntos++;
    if (/[^A-Za-z0-9]/.test(valor)) puntos++;

    if (puntos <= 1) {
      cont.classList.add('f-debil');
      texto.textContent = 'Bajo';
    } else if (puntos <= 3) {
      cont.classList.add('f-media');
      texto.textContent = 'Medio';
    } else {
      cont.classList.add('f-fuerte');
      texto.textContent = 'Alto';
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const err = document.getElementById('errorMsg');
    err.classList.remove('show');
    btn.classList.add('loading');
    setTimeout(() => {
      btn.classList.remove('loading');
      const user = document.getElementById('usuario').value.trim().toLowerCase();
      const pass = document.getElementById('password').value;
      const encontrado = USUARIOS_DEMO.find(u => u.usuario.toLowerCase() === user && u.password === pass);

      if (!encontrado) {
        err.classList.add('show');
        return;
      }

      if (encontrado.estadoPass === 'vigente') {
        window.location.href = DESTINO_LOGIN;
      } else {
        abrirModalPassVencimiento(encontrado);
      }
    }, 1400);
  }

  // =================================================
  // MODAL CONTRASEÑA POR VENCER / VENCIDA
  // =================================================
  function abrirModalPassVencimiento(usuarioDemo) {
    usuarioActivo = usuarioDemo;
    const esVencida = usuarioDemo.estadoPass === 'vencida';

    const overlay = document.getElementById('modalPassVencimiento');
    overlay.classList.toggle('pass-venc--vencida', esVencida);

    document.getElementById('passVencSkip').style.display = esVencida ? 'none' : '';
    document.getElementById('passVencTitulo').textContent = esVencida ? 'Contraseña vencida' : 'Contraseña por vencer';
    document.getElementById('passVencUsuario').textContent = usuarioDemo.usuario;
    document.getElementById('passVencFecha').textContent = usuarioDemo.fechaLabel;
    document.getElementById('passVencFooter').textContent = esVencida
      ? 'No puedes acceder al sistema hasta actualizar tu contraseña.'
      : `Su contraseña vencerá en ${usuarioDemo.diasRestantes} días`;
    document.getElementById('passVencFooter').classList.remove('pass-venc-footer-success');

    ['passVencActual', 'passVencNueva', 'passVencConfirmar'].forEach(id => {
      const input = document.getElementById(id);
      input.value = '';
      input.disabled = false;
      limpiarErrorInline(input);
    });
    document.getElementById('btnActualizarPass').disabled = false;

    const fuerza = document.getElementById('fuerzaPassVenc');
    fuerza.classList.remove('f-debil', 'f-media', 'f-fuerte');
    fuerza.querySelector('.fuerza-texto').textContent = '';

    overlay.classList.add('open');
  }

  function saltarActualizacionPassword(e) {
    e.preventDefault();
    document.getElementById('modalPassVencimiento').classList.remove('open');
    window.location.href = DESTINO_LOGIN;
  }

  function mostrarErrorInline(input, mensaje) {
    input.classList.add('input-error');
    let msg = input.closest('.form-group').querySelector('.pass-venc-field-error');
    if (!msg) {
      msg = document.createElement('span');
      msg.className = 'pass-venc-field-error';
      input.closest('.form-group').appendChild(msg);
    }
    msg.textContent = mensaje;
  }

  function limpiarErrorInline(input) {
    input.classList.remove('input-error');
    const msg = input.closest('.form-group').querySelector('.pass-venc-field-error');
    if (msg) msg.remove();
  }

  function actualizarContrasenaLogin() {
    const actualInput = document.getElementById('passVencActual');
    const nuevaInput = document.getElementById('passVencNueva');
    const confirmarInput = document.getElementById('passVencConfirmar');

    [actualInput, nuevaInput, confirmarInput].forEach(limpiarErrorInline);

    let valido = true;
    let primerCampoInvalido = null;

    if (!actualInput.value) {
      mostrarErrorInline(actualInput, 'Ingresa tu contraseña actual');
      primerCampoInvalido = actualInput;
      valido = false;
    } else if (actualInput.value !== usuarioActivo.password) {
      mostrarErrorInline(actualInput, 'La contraseña actual no es correcta');
      primerCampoInvalido = actualInput;
      valido = false;
    }

    if (!nuevaInput.value) {
      mostrarErrorInline(nuevaInput, 'Ingresa tu nueva contraseña');
      if (!primerCampoInvalido) primerCampoInvalido = nuevaInput;
      valido = false;
    } else if (nuevaInput.value.length < 8) {
      mostrarErrorInline(nuevaInput, 'Mínimo 8 caracteres');
      if (!primerCampoInvalido) primerCampoInvalido = nuevaInput;
      valido = false;
    } else if (valido && nuevaInput.value === actualInput.value) {
      mostrarErrorInline(nuevaInput, 'La nueva contraseña debe ser distinta a la actual');
      if (!primerCampoInvalido) primerCampoInvalido = nuevaInput;
      valido = false;
    }

    if (!confirmarInput.value) {
      mostrarErrorInline(confirmarInput, 'Confirma tu nueva contraseña');
      if (!primerCampoInvalido) primerCampoInvalido = confirmarInput;
      valido = false;
    } else if (confirmarInput.value !== nuevaInput.value) {
      mostrarErrorInline(confirmarInput, 'Las contraseñas no coinciden');
      if (!primerCampoInvalido) primerCampoInvalido = confirmarInput;
      valido = false;
    }

    if (!valido) {
      primerCampoInvalido.focus();
      return;
    }

    usuarioActivo.password = nuevaInput.value;
    [actualInput, nuevaInput, confirmarInput].forEach(input => input.disabled = true);
    document.getElementById('btnActualizarPass').disabled = true;

    const footer = document.getElementById('passVencFooter');
    footer.textContent = 'Contraseña actualizada. Redirigiendo…';
    footer.classList.add('pass-venc-footer-success');

    setTimeout(() => {
      window.location.href = DESTINO_LOGIN;
    }, 900);
  }
