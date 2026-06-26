let lineChart = null;
let pieChart  = null;
let barChart  = null;
let periodoTendencia = 'mes';
let pagina    = 1;
let PAGE_SIZE      = 10;
const MESES_ORD    = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const ANIO_ACTUAL       = new Date().getFullYear();
const MES_ACTUAL        = new Date().getMonth();
const MES_ACTUAL_NOMBRE = MESES_ORD[MES_ACTUAL];

const YEAR_COLORS = [
  { border:'#00B4D8', fill:'rgba(0,180,216,.10)'  },
  { border:'#1E3A5F', fill:'rgba(30,58,95,.10)'   },
  { border:'#F5C400', fill:'rgba(245,196,0,.10)'  },
  { border:'#22C55E', fill:'rgba(34,197,94,.10)'  },
];

// 14 colores anclados a la paleta del sistema
const TERMINAL_COLORS = [
  '#00B4D8','#F5C400','#1E3A5F','#22C55E','#E53E3E',
  '#0096B7','#D4A900','#2E5C96','#16A34A','#B91C1C',
  '#6B7280','#F59E0B','#0EA5E9','#374151',
];

// =================================================
// MOCK DATA
// =================================================
const CABOTAJE_DATA = [

  // ─── Mayo 2025 ────────────────────────────────
  { opId:'OP0001', viajes:[
    { cliente:'PETROPERÚ', per:'U5488A-25', viaje:'V007-2025', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP 6 - GR 35',              terminal:'MOLLENDO', personal:'B. ANDRE VARGAS (SUAREZ) - P. Luis Barba & Luis Suarez', compartido:false, mes:'Mayo', anio:2025, tl:{ eta:'17/05/2025 05:00', arriba:'17/05/2025 01:00', fondea:'17/05/2025 01:42', amarre:'19/05/2025 02:24', inicia:'19/05/2025 06:42', termina:'19/05/2025 17:00', firma:'19/05/2025 18:30', zarpe:'19/05/2025 20:54' } },
    { cliente:'PETROPERÚ', per:'U5488B-25', viaje:'V007-2025', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP23 - DB5S50(53)',           terminal:'CONCHÁN',  personal:'B. CHARLES - P. PABLO/NOE',                               compartido:true,  mes:'Mayo', anio:2025, tl:{ eta:'17/05/2025 05:00', arriba:'17/05/2025 03:00', fondea:'17/05/2025 03:30', amarre:'18/05/2025 08:00', inicia:'18/05/2025 10:15', termina:'18/05/2025 22:00', firma:'18/05/2025 23:00', zarpe:'19/05/2025 01:00' } },
  ]},
  { opId:'OP0002', viajes:[
    { cliente:'PETROPERÚ', per:'U5877-25',  viaje:'V007-2025', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP13-GR8-T44-D2S50(7);[72]', terminal:'CALLAO',   personal:'B. JULIO VERTIZ - P. IVAN / BAUTISTA',                    compartido:false, mes:'Mayo', anio:2025, tl:{ eta:'17/05/2025 05:00', arriba:'17/05/2025 01:00', fondea:'17/05/2025 01:42', amarre:'19/05/2025 02:24', inicia:'19/05/2025 06:42', termina:'19/05/2025 17:00', firma:'19/05/2025 18:30', zarpe:'19/05/2025 20:54' } },
    { cliente:'PETROPERÚ', per:'U5877-25',  viaje:'V007-2025', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP24-GR15-D2(25)-DB5(60);[124]', terminal:'CONCHÁN', personal:'B.JULIO VERTIZ - P. PABLO/NOE',                        compartido:true,  mes:'Mayo', anio:2025, tl:{ eta:'20/05/2025 06:00', arriba:'20/05/2025 08:00', fondea:'20/05/2025 08:45', amarre:'20/05/2025 10:30', inicia:'20/05/2025 13:00', termina:'21/05/2025 04:00', firma:'21/05/2025 05:30', zarpe:'21/05/2025 08:00' } },
  ]},
  { opId:'OP0003', viajes:[
    { cliente:'REPSOL',    per:'U6102-25',  viaje:'V009-2025', nave:'MANTARO',  operacion:'CARGA',    producto:'GP1-T44-D2S50(12);[48]',     terminal:'MOLLENDO', personal:'B. CARLOS RIOS - P. ANDRES / FELIX',                      compartido:false, mes:'Mayo', anio:2025, tl:{ eta:'20/05/2025 08:00', arriba:'20/05/2025 10:00', fondea:'20/05/2025 11:15', amarre:'20/05/2025 13:30', inicia:'20/05/2025 16:00', termina:'21/05/2025 08:00', firma:'21/05/2025 09:30', zarpe:'21/05/2025 12:00' } },
    { cliente:'REPSOL',    per:'U6103-25',  viaje:'V009-2025', nave:'MANTARO',  operacion:'CARGA',    producto:'GP8-GR15-D2S50(24);[96]',    terminal:'ILO',      personal:'B. MARIO PEÑA - P. ROBERTO/JOSE',                         compartido:false, mes:'Mayo', anio:2025, tl:{ eta:'21/05/2025 06:00', arriba:'21/05/2025 08:30', fondea:'21/05/2025 09:00', amarre:'21/05/2025 11:00', inicia:'21/05/2025 14:00', termina:'22/05/2025 06:00', firma:'22/05/2025 07:15', zarpe:'22/05/2025 09:30' } },
    { cliente:'REPSOL',    per:'U6104-25',  viaje:'V009-2025', nave:'MANTARO',  operacion:'CARGA',    producto:'GP6-T44(18);[36]',            terminal:'PISCO',    personal:'B. LUIS FLORES - P. CARLOS/ANDRES',                       compartido:true,  mes:'Mayo', anio:2025, tl:{ eta:'22/05/2025 07:00', arriba:'22/05/2025 09:00', fondea:'22/05/2025 09:30', amarre:'22/05/2025 11:30', inicia:'22/05/2025 14:00', termina:'23/05/2025 02:00', firma:'23/05/2025 03:30', zarpe:'23/05/2025 06:00' } },
  ]},
  { opId:'OP0004', viajes:[
    { cliente:'MOBIL',     per:'U7021-25',  viaje:'V010-2025', nave:'PASTAZA',  operacion:'DESCARGA', producto:'GP15-T44-D2(30);[60]',        terminal:'CALLAO',   personal:'B. RAUL SANTOS - P. DIEGO / LUIS',                        compartido:false, mes:'Mayo', anio:2025, tl:{ eta:'23/05/2025 04:00', arriba:'23/05/2025 06:00', fondea:'23/05/2025 06:30', amarre:'23/05/2025 09:00', inicia:'23/05/2025 11:30', termina:'24/05/2025 03:00', firma:'24/05/2025 04:00', zarpe:'24/05/2025 07:00' } },
    { cliente:'MOBIL',     per:'U7022-25',  viaje:'V010-2025', nave:'PASTAZA',  operacion:'DESCARGA', producto:'GP12-GR8-T44(20);[80]',       terminal:'MOLLENDO', personal:'B. PEDRO GOMEZ - P. IVAN/NOE',                            compartido:true,  mes:'Mayo', anio:2025, tl:{ eta:'24/05/2025 05:00', arriba:'24/05/2025 07:00', fondea:'24/05/2025 07:30', amarre:'24/05/2025 09:30', inicia:'24/05/2025 12:00', termina:'25/05/2025 04:00', firma:'25/05/2025 05:30', zarpe:'25/05/2025 08:00' } },
  ]},
  { opId:'OP0005', viajes:[
    { cliente:'PRIMAX',    per:'U8011-25',  viaje:'V011-2025', nave:'NAPO',     operacion:'CARGA',    producto:'GP3-GR6-T44(8);[32]',         terminal:'ILO',      personal:'B. JORGE LUNA - P. ALEX / BETO',                          compartido:false, mes:'Mayo', anio:2025, tl:{ eta:'25/05/2025 03:00', arriba:'25/05/2025 05:00', fondea:'25/05/2025 05:30', amarre:'25/05/2025 07:30', inicia:'25/05/2025 10:00', termina:'26/05/2025 02:00', firma:'26/05/2025 03:00', zarpe:'26/05/2025 06:00' } },
    { cliente:'PRIMAX',    per:'U8012-25',  viaje:'V011-2025', nave:'NAPO',     operacion:'CARGA',    producto:'GP5-GR4-T44(10);[40]',        terminal:'PISCO',    personal:'B. ANA QUISPE - P. HUGO/FELIX',                           compartido:false, mes:'Mayo', anio:2025, tl:{ eta:'26/05/2025 04:00', arriba:'26/05/2025 06:00', fondea:'26/05/2025 06:45', amarre:'26/05/2025 09:00', inicia:'26/05/2025 11:30', termina:'27/05/2025 03:00', firma:'27/05/2025 04:15', zarpe:'27/05/2025 07:00' } },
  ]},

  // ─── Octubre 2024 ─────────────────────────────
  { opId:'OP0006', viajes:[
    { cliente:'PETROPERÚ', per:'U4001-24',  viaje:'V015-2024', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP6-GR12-T44',                terminal:'CALLAO',   personal:'B. RAUL RIOS - P. JULIO/PEDRO',                           compartido:false, mes:'Octubre',   anio:2024, tl:{ eta:'15/10/2024 05:00', arriba:'15/10/2024 07:00', fondea:'15/10/2024 07:30', amarre:'15/10/2024 10:00', inicia:'15/10/2024 12:00', termina:'16/10/2024 04:00', firma:'16/10/2024 05:00', zarpe:'16/10/2024 08:00' } },
    { cliente:'PETROPERÚ', per:'U4002-24',  viaje:'V015-2024', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP8-T44-DB5',                 terminal:'MOLLENDO', personal:'B. CARLOS VILLA - P. IVAN/NOE',                            compartido:true,  mes:'Octubre',   anio:2024, tl:{ eta:'17/10/2024 06:00', arriba:'17/10/2024 08:00', fondea:'17/10/2024 08:45', amarre:'17/10/2024 11:00', inicia:'17/10/2024 14:00', termina:'18/10/2024 06:00', firma:'18/10/2024 07:00', zarpe:'18/10/2024 10:00' } },
  ]},
  { opId:'OP0007', viajes:[
    { cliente:'REPSOL',    per:'U4100-24',  viaje:'V016-2024', nave:'MANTARO',  operacion:'CARGA',    producto:'GP3-GR6',                     terminal:'ILO',      personal:'B. JOSE MEDINA - P. ALEX/BETO',                           compartido:false, mes:'Octubre',   anio:2024, tl:{ eta:'22/10/2024 04:00', arriba:'22/10/2024 06:00', fondea:'22/10/2024 06:30', amarre:'22/10/2024 09:00', inicia:'22/10/2024 11:00', termina:'23/10/2024 03:00', firma:'23/10/2024 04:00', zarpe:'23/10/2024 07:00' } },
  ]},

  // ─── Noviembre 2024 ───────────────────────────
  { opId:'OP0008', viajes:[
    { cliente:'PETROPERÚ', per:'U4200-24',  viaje:'V018-2024', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP12-GR8-D2',                 terminal:'CONCHÁN',  personal:'B. MARIO LEON - P. PABLO/FELIX',                          compartido:false, mes:'Noviembre', anio:2024, tl:{ eta:'05/11/2024 05:00', arriba:'05/11/2024 07:00', fondea:'05/11/2024 07:30', amarre:'05/11/2024 10:00', inicia:'05/11/2024 12:30', termina:'06/11/2024 04:00', firma:'06/11/2024 05:00', zarpe:'06/11/2024 08:00' } },
    { cliente:'PETROPERÚ', per:'U4201-24',  viaje:'V018-2024', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP4-T44',                     terminal:'PISCO',    personal:'B. LUIS QUISPE - P. ANDRES/JOSE',                         compartido:true,  mes:'Noviembre', anio:2024, tl:{ eta:'07/11/2024 06:00', arriba:'07/11/2024 08:00', fondea:'07/11/2024 08:30', amarre:'07/11/2024 11:00', inicia:'07/11/2024 14:00', termina:'08/11/2024 06:00', firma:'08/11/2024 07:00', zarpe:'08/11/2024 09:30' } },
  ]},
  { opId:'OP0009', viajes:[
    { cliente:'ENAP',      per:'U4300-24',  viaje:'V019-2024', nave:'PASTAZA',  operacion:'CARGA',    producto:'GP6-GR10',                    terminal:'CALLAO',   personal:'B. JORGE PINO - P. LUIS/CARLOS',                          compartido:false, mes:'Noviembre', anio:2024, tl:{ eta:'12/11/2024 04:00', arriba:'12/11/2024 06:00', fondea:'12/11/2024 06:30', amarre:'12/11/2024 09:00', inicia:'12/11/2024 11:00', termina:'13/11/2024 03:00', firma:'13/11/2024 04:00', zarpe:'13/11/2024 07:00' } },
  ]},
  { opId:'OP0010', viajes:[
    { cliente:'MOBIL',     per:'U4400-24',  viaje:'V020-2024', nave:'NAPO',     operacion:'DESCARGA', producto:'GP8-D2S50',                   terminal:'MOLLENDO', personal:'B. PEDRO SALAS - P. IVAN/BETO',                           compartido:false, mes:'Noviembre', anio:2024, tl:{ eta:'18/11/2024 05:00', arriba:'18/11/2024 07:00', fondea:'18/11/2024 07:45', amarre:'18/11/2024 10:00', inicia:'18/11/2024 13:00', termina:'19/11/2024 05:00', firma:'19/11/2024 06:00', zarpe:'19/11/2024 09:00' } },
  ]},

  // ─── Diciembre 2024 ───────────────────────────
  { opId:'OP0011', viajes:[
    { cliente:'REPSOL',    per:'U4500-24',  viaje:'V022-2024', nave:'MANTARO',  operacion:'CARGA',    producto:'GP5-GR8-T44',                 terminal:'ILO',      personal:'B. ANA TORRES - P. ROBERTO/NOE',                          compartido:false, mes:'Diciembre', anio:2024, tl:{ eta:'03/12/2024 05:00', arriba:'03/12/2024 07:00', fondea:'03/12/2024 07:30', amarre:'03/12/2024 10:00', inicia:'03/12/2024 12:00', termina:'04/12/2024 04:00', firma:'04/12/2024 05:00', zarpe:'04/12/2024 08:00' } },
    { cliente:'REPSOL',    per:'U4501-24',  viaje:'V022-2024', nave:'MANTARO',  operacion:'CARGA',    producto:'GP3-T44-DB5',                 terminal:'PISCO',    personal:'B. CARLOS MEZA - P. DIEGO/FELIX',                         compartido:true,  mes:'Diciembre', anio:2024, tl:{ eta:'05/12/2024 06:00', arriba:'05/12/2024 08:00', fondea:'05/12/2024 08:30', amarre:'05/12/2024 11:00', inicia:'05/12/2024 14:00', termina:'06/12/2024 06:00', firma:'06/12/2024 07:00', zarpe:'06/12/2024 10:00' } },
  ]},
  { opId:'OP0012', viajes:[
    { cliente:'PETROPERÚ', per:'U4600-24',  viaje:'V023-2024', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP10-GR6-D2',                 terminal:'CALLAO',   personal:'B. LUIS BARBA - P. PABLO/ANDRES',                         compartido:false, mes:'Diciembre', anio:2024, tl:{ eta:'10/12/2024 04:00', arriba:'10/12/2024 06:00', fondea:'10/12/2024 06:30', amarre:'10/12/2024 09:00', inicia:'10/12/2024 11:30', termina:'11/12/2024 03:00', firma:'11/12/2024 04:00', zarpe:'11/12/2024 07:00' } },
  ]},
  { opId:'OP0013', viajes:[
    { cliente:'ENAP',      per:'U4700-24',  viaje:'V024-2024', nave:'PASTAZA',  operacion:'CARGA',    producto:'GP4-GR5',                     terminal:'MOLLENDO', personal:'B. JORGE LUNA - P. IVAN/JOSE',                            compartido:false, mes:'Diciembre', anio:2024, tl:{ eta:'16/12/2024 05:00', arriba:'16/12/2024 07:00', fondea:'16/12/2024 07:30', amarre:'16/12/2024 10:00', inicia:'16/12/2024 13:00', termina:'17/12/2024 05:00', firma:'17/12/2024 06:00', zarpe:'17/12/2024 09:00' } },
  ]},

  // ─── Enero 2025 ───────────────────────────────
  { opId:'OP0014', viajes:[
    { cliente:'PETROPERÚ', per:'U5001-25',  viaje:'V001-2025', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP8-GR12-T44',                terminal:'CALLAO',   personal:'B. JULIO VERTIZ - P. PABLO/NOE',                          compartido:false, mes:'Enero', anio:2025, tl:{ eta:'08/01/2025 05:00', arriba:'08/01/2025 07:00', fondea:'08/01/2025 07:30', amarre:'08/01/2025 10:00', inicia:'08/01/2025 12:00', termina:'09/01/2025 04:00', firma:'09/01/2025 05:00', zarpe:'09/01/2025 08:00' } },
    { cliente:'PETROPERÚ', per:'U5002-25',  viaje:'V001-2025', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP6-D2S50',                   terminal:'CONCHÁN',  personal:'B. MARIO RIOS - P. IVAN/BETO',                            compartido:true,  mes:'Enero', anio:2025, tl:{ eta:'10/01/2025 06:00', arriba:'10/01/2025 08:00', fondea:'10/01/2025 08:30', amarre:'10/01/2025 11:00', inicia:'10/01/2025 14:00', termina:'11/01/2025 06:00', firma:'11/01/2025 07:00', zarpe:'11/01/2025 10:00' } },
  ]},
  { opId:'OP0015', viajes:[
    { cliente:'PRIMAX',    per:'U5100-25',  viaje:'V002-2025', nave:'NAPO',     operacion:'CARGA',    producto:'GP3-GR4',                     terminal:'ILO',      personal:'B. ANA QUISPE - P. CARLOS/FELIX',                         compartido:false, mes:'Enero', anio:2025, tl:{ eta:'15/01/2025 04:00', arriba:'15/01/2025 06:00', fondea:'15/01/2025 06:30', amarre:'15/01/2025 09:00', inicia:'15/01/2025 11:00', termina:'16/01/2025 03:00', firma:'16/01/2025 04:00', zarpe:'16/01/2025 07:00' } },
  ]},

  // ─── Febrero 2025 ─────────────────────────────
  { opId:'OP0016', viajes:[
    { cliente:'REPSOL',    per:'U5200-25',  viaje:'V003-2025', nave:'MANTARO',  operacion:'CARGA',    producto:'GP6-T44-D2S50',               terminal:'MOLLENDO', personal:'B. CARLOS MEZA - P. ANDRES/JOSE',                         compartido:false, mes:'Febrero', anio:2025, tl:{ eta:'05/02/2025 05:00', arriba:'05/02/2025 07:00', fondea:'05/02/2025 07:30', amarre:'05/02/2025 10:00', inicia:'05/02/2025 12:30', termina:'06/02/2025 04:00', firma:'06/02/2025 05:00', zarpe:'06/02/2025 08:00' } },
    { cliente:'REPSOL',    per:'U5201-25',  viaje:'V003-2025', nave:'MANTARO',  operacion:'CARGA',    producto:'GP4-GR8',                     terminal:'PISCO',    personal:'B. LUIS FLORES - P. ROBERTO/NOE',                         compartido:true,  mes:'Febrero', anio:2025, tl:{ eta:'07/02/2025 06:00', arriba:'07/02/2025 08:00', fondea:'07/02/2025 08:30', amarre:'07/02/2025 11:00', inicia:'07/02/2025 14:00', termina:'08/02/2025 06:00', firma:'08/02/2025 07:00', zarpe:'08/02/2025 10:00' } },
  ]},
  { opId:'OP0017', viajes:[
    { cliente:'MOBIL',     per:'U5300-25',  viaje:'V004-2025', nave:'PASTAZA',  operacion:'DESCARGA', producto:'GP10-GR5-T44',                terminal:'CALLAO',   personal:'B. RAUL SANTOS - P. DIEGO/BETO',                          compartido:false, mes:'Febrero', anio:2025, tl:{ eta:'12/02/2025 04:00', arriba:'12/02/2025 06:00', fondea:'12/02/2025 06:30', amarre:'12/02/2025 09:00', inicia:'12/02/2025 11:00', termina:'13/02/2025 03:00', firma:'13/02/2025 04:00', zarpe:'13/02/2025 07:00' } },
  ]},

  // ─── Marzo 2025 ───────────────────────────────
  { opId:'OP0018', viajes:[
    { cliente:'PETROPERÚ', per:'U5350-25',  viaje:'V005-2025', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP8-GR10-D2',                 terminal:'ILO',      personal:'B. ANDRE VARGAS - P. PABLO/FELIX',                        compartido:false, mes:'Marzo', anio:2025, tl:{ eta:'06/03/2025 05:00', arriba:'06/03/2025 07:00', fondea:'06/03/2025 07:30', amarre:'06/03/2025 10:00', inicia:'06/03/2025 12:00', termina:'07/03/2025 04:00', firma:'07/03/2025 05:00', zarpe:'07/03/2025 08:00' } },
    { cliente:'PETROPERÚ', per:'U5351-25',  viaje:'V005-2025', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP5-T44-DB5',                 terminal:'MOLLENDO', personal:'B. CHARLES - P. IVAN/NOE',                                compartido:true,  mes:'Marzo', anio:2025, tl:{ eta:'08/03/2025 06:00', arriba:'08/03/2025 08:00', fondea:'08/03/2025 08:45', amarre:'08/03/2025 11:00', inicia:'08/03/2025 14:00', termina:'09/03/2025 06:00', firma:'09/03/2025 07:00', zarpe:'09/03/2025 10:00' } },
  ]},
  { opId:'OP0019', viajes:[
    { cliente:'ENAP',      per:'U5400-25',  viaje:'V006-2025', nave:'URUBAMBA', operacion:'CARGA',    producto:'GP3-GR6',                     terminal:'PISCO',    personal:'B. JORGE PINO - P. ANDRES/CARLOS',                        compartido:false, mes:'Marzo', anio:2025, tl:{ eta:'14/03/2025 04:00', arriba:'14/03/2025 06:00', fondea:'14/03/2025 06:30', amarre:'14/03/2025 09:00', inicia:'14/03/2025 11:00', termina:'15/03/2025 03:00', firma:'15/03/2025 04:00', zarpe:'15/03/2025 07:00' } },
  ]},

  // ─── Abril 2025 ───────────────────────────────
  { opId:'OP0020', viajes:[
    { cliente:'REPSOL',    per:'U5450-25',  viaje:'V006B-2025', nave:'MANTARO', operacion:'CARGA',    producto:'GP6-GR8-T44',                 terminal:'CALLAO',   personal:'B. MARIO PEÑA - P. ROBERTO/JOSE',                         compartido:false, mes:'Abril', anio:2025, tl:{ eta:'04/04/2025 05:00', arriba:'04/04/2025 07:00', fondea:'04/04/2025 07:30', amarre:'04/04/2025 10:00', inicia:'04/04/2025 12:30', termina:'05/04/2025 04:00', firma:'05/04/2025 05:00', zarpe:'05/04/2025 08:00' } },
    { cliente:'REPSOL',    per:'U5451-25',  viaje:'V006B-2025', nave:'MANTARO', operacion:'CARGA',    producto:'GP4-D2S50',                   terminal:'CONCHÁN',  personal:'B. ANA TORRES - P. PABLO/NOE',                            compartido:true,  mes:'Abril', anio:2025, tl:{ eta:'06/04/2025 06:00', arriba:'06/04/2025 08:00', fondea:'06/04/2025 08:30', amarre:'06/04/2025 11:00', inicia:'06/04/2025 14:00', termina:'07/04/2025 06:00', firma:'07/04/2025 07:00', zarpe:'07/04/2025 10:00' } },
  ]},
  { opId:'OP0021', viajes:[
    { cliente:'PRIMAX',    per:'U5500-25',  viaje:'V006C-2025', nave:'NAPO',    operacion:'CARGA',    producto:'GP5-GR4',                     terminal:'MOLLENDO', personal:'B. JORGE LUNA - P. ALEX/BETO',                            compartido:false, mes:'Abril', anio:2025, tl:{ eta:'10/04/2025 04:00', arriba:'10/04/2025 06:00', fondea:'10/04/2025 06:30', amarre:'10/04/2025 09:00', inicia:'10/04/2025 11:00', termina:'11/04/2025 03:00', firma:'11/04/2025 04:00', zarpe:'11/04/2025 07:00' } },
  ]},
  { opId:'OP0022', viajes:[
    { cliente:'MOBIL',     per:'U5600-25',  viaje:'V006D-2025', nave:'PASTAZA', operacion:'DESCARGA', producto:'GP8-T44-D2',  terminal:'ILO',      personal:'B. PEDRO GOMEZ - P. IVAN/FELIX', compartido:false, mes:'Abril',    anio:2025, tl:{ eta:'16/04/2025 05:00', arriba:'16/04/2025 07:00', fondea:'16/04/2025 07:30', amarre:'16/04/2025 10:00', inicia:'16/04/2025 13:00', termina:'17/04/2025 05:00', firma:'17/04/2025 06:00', zarpe:'17/04/2025 09:00' } },
  ]},

  // ─── Ene–May 2026 (vista anual) ───────────────
  { opId:'OP0023', viajes:[
    { cliente:'PETROPERÚ', per:'U6001-26', viaje:'V001-2026', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP8-GR12', terminal:'CALLAO',   personal:'B. JULIO VERTIZ - P. PABLO/NOE',  compartido:false, mes:'Enero',    anio:2026, tl:{ eta:'08/01/2026 06:00', arriba:'08/01/2026 08:00', fondea:'08/01/2026 08:30', amarre:'08/01/2026 11:00', inicia:'08/01/2026 14:00', termina:'09/01/2026 04:00', firma:'09/01/2026 05:00', zarpe:'09/01/2026 08:00' } },
    { cliente:'PETROPERÚ', per:'U6002-26', viaje:'V001-2026', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP6-T44',  terminal:'CONCHÁN',  personal:'B. CARLOS RIOS - P. IVAN/NOE',    compartido:true,  mes:'Enero',    anio:2026, tl:{ eta:'10/01/2026 06:00', arriba:'10/01/2026 08:00', fondea:'10/01/2026 08:30', amarre:'10/01/2026 11:00', inicia:'10/01/2026 14:00', termina:'11/01/2026 04:00', firma:'11/01/2026 05:00', zarpe:'11/01/2026 08:00' } },
  ]},
  { opId:'OP0024', viajes:[
    { cliente:'REPSOL',    per:'U6100-26', viaje:'V002-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP5-GR8',  terminal:'MOLLENDO', personal:'B. MARIO PEÑA - P. ANDRES/JOSE',  compartido:false, mes:'Febrero',  anio:2026, tl:{ eta:'05/02/2026 06:00', arriba:'05/02/2026 08:00', fondea:'05/02/2026 08:30', amarre:'05/02/2026 11:00', inicia:'05/02/2026 14:00', termina:'06/02/2026 04:00', firma:'06/02/2026 05:00', zarpe:'06/02/2026 08:00' } },
    { cliente:'REPSOL',    per:'U6101-26', viaje:'V002-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP4-D2',   terminal:'PISCO',    personal:'B. ANA TORRES - P. ROBERTO/NOE',  compartido:true,  mes:'Febrero',  anio:2026, tl:{ eta:'07/02/2026 06:00', arriba:'07/02/2026 08:00', fondea:'07/02/2026 08:30', amarre:'07/02/2026 11:00', inicia:'07/02/2026 14:00', termina:'08/02/2026 04:00', firma:'08/02/2026 05:00', zarpe:'08/02/2026 08:00' } },
    { cliente:'MOBIL',     per:'U6200-26', viaje:'V003-2026', nave:'PASTAZA',  operacion:'DESCARGA', producto:'GP8-GR6',  terminal:'ILO',      personal:'B. RAUL SANTOS - P. DIEGO/BETO',  compartido:false, mes:'Febrero',  anio:2026, tl:{ eta:'14/02/2026 06:00', arriba:'14/02/2026 08:00', fondea:'14/02/2026 08:30', amarre:'14/02/2026 11:00', inicia:'14/02/2026 14:00', termina:'15/02/2026 04:00', firma:'15/02/2026 05:00', zarpe:'15/02/2026 08:00' } },
  ]},
  { opId:'OP0025', viajes:[
    { cliente:'PETROPERÚ', per:'U6300-26', viaje:'V004-2026', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP10-T44', terminal:'CALLAO',   personal:'B. ANDRE VARGAS - P. PABLO/FELIX', compartido:false, mes:'Marzo',    anio:2026, tl:{ eta:'06/03/2026 06:00', arriba:'06/03/2026 08:00', fondea:'06/03/2026 08:30', amarre:'06/03/2026 11:00', inicia:'06/03/2026 14:00', termina:'07/03/2026 04:00', firma:'07/03/2026 05:00', zarpe:'07/03/2026 08:00' } },
    { cliente:'PETROPERÚ', per:'U6301-26', viaje:'V004-2026', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP6-GR8',  terminal:'MOLLENDO', personal:'B. CHARLES - P. IVAN/NOE',          compartido:true,  mes:'Marzo',    anio:2026, tl:{ eta:'08/03/2026 06:00', arriba:'08/03/2026 08:00', fondea:'08/03/2026 08:30', amarre:'08/03/2026 11:00', inicia:'08/03/2026 14:00', termina:'09/03/2026 04:00', firma:'09/03/2026 05:00', zarpe:'09/03/2026 08:00' } },
    { cliente:'ENAP',      per:'U6400-26', viaje:'V005-2026', nave:'NAPO',     operacion:'CARGA',    producto:'GP4-GR5',  terminal:'PISCO',    personal:'B. JORGE PINO - P. ANDRES/CARLOS', compartido:false, mes:'Marzo',    anio:2026, tl:{ eta:'15/03/2026 06:00', arriba:'15/03/2026 08:00', fondea:'15/03/2026 08:30', amarre:'15/03/2026 11:00', inicia:'15/03/2026 14:00', termina:'16/03/2026 04:00', firma:'16/03/2026 05:00', zarpe:'16/03/2026 08:00' } },
  ]},
  { opId:'OP0026', viajes:[
    { cliente:'REPSOL',    per:'U6500-26', viaje:'V006-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP6-T44',  terminal:'CALLAO',   personal:'B. MARIO LEON - P. ROBERTO/NOE',  compartido:false, mes:'Abril',    anio:2026, tl:{ eta:'04/04/2026 06:00', arriba:'04/04/2026 08:00', fondea:'04/04/2026 08:30', amarre:'04/04/2026 11:00', inicia:'04/04/2026 14:00', termina:'05/04/2026 04:00', firma:'05/04/2026 05:00', zarpe:'05/04/2026 08:00' } },
    { cliente:'REPSOL',    per:'U6501-26', viaje:'V006-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP5-GR6',  terminal:'ILO',      personal:'B. LUIS FLORES - P. PABLO/BETO',  compartido:true,  mes:'Abril',    anio:2026, tl:{ eta:'06/04/2026 06:00', arriba:'06/04/2026 08:00', fondea:'06/04/2026 08:30', amarre:'06/04/2026 11:00', inicia:'06/04/2026 14:00', termina:'07/04/2026 04:00', firma:'07/04/2026 05:00', zarpe:'07/04/2026 08:00' } },
    { cliente:'PRIMAX',    per:'U6600-26', viaje:'V007-2026', nave:'NAPO',     operacion:'CARGA',    producto:'GP3-GR4',  terminal:'MOLLENDO', personal:'B. JORGE LUNA - P. ALEX/JOSE',    compartido:false, mes:'Abril',    anio:2026, tl:{ eta:'12/04/2026 06:00', arriba:'12/04/2026 08:00', fondea:'12/04/2026 08:30', amarre:'12/04/2026 11:00', inicia:'12/04/2026 14:00', termina:'13/04/2026 04:00', firma:'13/04/2026 05:00', zarpe:'13/04/2026 08:00' } },
    { cliente:'MOBIL',     per:'U6700-26', viaje:'V008-2026', nave:'PASTAZA',  operacion:'DESCARGA', producto:'GP8-T44',  terminal:'CONCHÁN',  personal:'B. PEDRO GOMEZ - P. IVAN/FELIX',  compartido:false, mes:'Abril',    anio:2026, tl:{ eta:'18/04/2026 06:00', arriba:'18/04/2026 08:00', fondea:'18/04/2026 08:30', amarre:'18/04/2026 11:00', inicia:'18/04/2026 14:00', termina:'19/04/2026 04:00', firma:'19/04/2026 05:00', zarpe:'19/04/2026 08:00' } },
  ]},
  { opId:'OP0027', viajes:[
    { cliente:'PETROPERÚ', per:'U6800-26', viaje:'V009-2026', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP10-GR8', terminal:'CALLAO',   personal:'B. JULIO VERTIZ - P. PABLO/NOE',  compartido:false, mes:'Mayo',     anio:2026, tl:{ eta:'05/05/2026 06:00', arriba:'05/05/2026 08:00', fondea:'05/05/2026 08:30', amarre:'05/05/2026 11:00', inicia:'05/05/2026 14:00', termina:'06/05/2026 04:00', firma:'06/05/2026 05:00', zarpe:'06/05/2026 08:00' } },
    { cliente:'PETROPERÚ', per:'U6801-26', viaje:'V009-2026', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP6-T44',  terminal:'MOLLENDO', personal:'B. MARIO RIOS - P. IVAN/BETO',    compartido:true,  mes:'Mayo',     anio:2026, tl:{ eta:'07/05/2026 06:00', arriba:'07/05/2026 08:00', fondea:'07/05/2026 08:30', amarre:'07/05/2026 11:00', inicia:'07/05/2026 14:00', termina:'08/05/2026 04:00', firma:'08/05/2026 05:00', zarpe:'08/05/2026 08:00' } },
    { cliente:'REPSOL',    per:'U6900-26', viaje:'V010-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP5-GR6',  terminal:'ILO',      personal:'B. CARLOS MEZA - P. ANDRES/NOE',  compartido:false, mes:'Mayo',     anio:2026, tl:{ eta:'12/05/2026 06:00', arriba:'12/05/2026 08:00', fondea:'12/05/2026 08:30', amarre:'12/05/2026 11:00', inicia:'12/05/2026 14:00', termina:'13/05/2026 04:00', firma:'13/05/2026 05:00', zarpe:'13/05/2026 08:00' } },
    { cliente:'REPSOL',    per:'U6901-26', viaje:'V010-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP4-D2',   terminal:'PISCO',    personal:'B. ANA TORRES - P. ROBERTO/JOSE', compartido:true,  mes:'Mayo',     anio:2026, tl:{ eta:'14/05/2026 06:00', arriba:'14/05/2026 08:00', fondea:'14/05/2026 08:30', amarre:'14/05/2026 11:00', inicia:'14/05/2026 14:00', termina:'15/05/2026 04:00', firma:'15/05/2026 05:00', zarpe:'15/05/2026 08:00' } },
    { cliente:'MOBIL',     per:'U7000-26', viaje:'V011-2026', nave:'PASTAZA',  operacion:'DESCARGA', producto:'GP8-GR5',  terminal:'CALLAO',   personal:'B. RAUL SANTOS - P. DIEGO/FELIX', compartido:false, mes:'Mayo',     anio:2026, tl:{ eta:'20/05/2026 06:00', arriba:'20/05/2026 08:00', fondea:'20/05/2026 08:30', amarre:'20/05/2026 11:00', inicia:'20/05/2026 14:00', termina:'21/05/2026 04:00', firma:'21/05/2026 05:00', zarpe:'21/05/2026 08:00' } },
  ]},

  // ─── Junio 2026 (vista mensual día a día) ─────
  { opId:'OP0028', viajes:[
    { cliente:'PETROPERÚ', per:'U7100-26', viaje:'V012-2026', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP8-GR10', terminal:'CALLAO',   personal:'B. JULIO VERTIZ - P. PABLO/NOE',  compartido:false, mes:'Junio', anio:2026, tl:{ eta:'02/06/2026 06:00', arriba:'02/06/2026 08:00', fondea:'02/06/2026 08:30', amarre:'02/06/2026 11:00', inicia:'02/06/2026 14:00', termina:'03/06/2026 02:00', firma:'03/06/2026 03:00', zarpe:'03/06/2026 06:00' } },
    { cliente:'PETROPERÚ', per:'U7101-26', viaje:'V012-2026', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP6-T44',  terminal:'CONCHÁN',  personal:'B. MARIO RIOS - P. IVAN/NOE',     compartido:true,  mes:'Junio', anio:2026, tl:{ eta:'04/06/2026 06:00', arriba:'04/06/2026 08:00', fondea:'04/06/2026 08:30', amarre:'04/06/2026 11:00', inicia:'04/06/2026 14:00', termina:'05/06/2026 02:00', firma:'05/06/2026 03:00', zarpe:'05/06/2026 06:00' } },
  ]},
  { opId:'OP0029', viajes:[
    { cliente:'REPSOL',    per:'U7200-26', viaje:'V013-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP5-GR8',  terminal:'ILO',      personal:'B. CARLOS MEZA - P. ANDRES/JOSE', compartido:false, mes:'Junio', anio:2026, tl:{ eta:'07/06/2026 06:00', arriba:'07/06/2026 08:00', fondea:'07/06/2026 08:30', amarre:'07/06/2026 11:00', inicia:'07/06/2026 14:00', termina:'08/06/2026 02:00', firma:'08/06/2026 03:00', zarpe:'08/06/2026 06:00' } },
  ]},
  { opId:'OP0030', viajes:[
    { cliente:'MOBIL',     per:'U7300-26', viaje:'V014-2026', nave:'PASTAZA',  operacion:'DESCARGA', producto:'GP10-D2',  terminal:'MOLLENDO', personal:'B. RAUL SANTOS - P. DIEGO/BETO',  compartido:false, mes:'Junio', anio:2026, tl:{ eta:'09/06/2026 06:00', arriba:'09/06/2026 08:00', fondea:'09/06/2026 08:30', amarre:'09/06/2026 11:00', inicia:'09/06/2026 14:00', termina:'10/06/2026 02:00', firma:'10/06/2026 03:00', zarpe:'10/06/2026 06:00' } },
    { cliente:'ENAP',      per:'U7400-26', viaje:'V014B-2026',nave:'NAPO',     operacion:'CARGA',    producto:'GP4-GR5',  terminal:'CALLAO',   personal:'B. JORGE PINO - P. LUIS/CARLOS',  compartido:false, mes:'Junio', anio:2026, tl:{ eta:'09/06/2026 10:00', arriba:'09/06/2026 12:00', fondea:'09/06/2026 12:30', amarre:'09/06/2026 15:00', inicia:'09/06/2026 17:00', termina:'10/06/2026 07:00', firma:'10/06/2026 08:00', zarpe:'10/06/2026 11:00' } },
  ]},
  { opId:'OP0031', viajes:[
    { cliente:'PETROPERÚ', per:'U7500-26', viaje:'V015-2026', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP12-T44', terminal:'CALLAO',   personal:'B. ANDRE VARGAS - P. PABLO/FELIX', compartido:false, mes:'Junio', anio:2026, tl:{ eta:'12/06/2026 06:00', arriba:'12/06/2026 08:00', fondea:'12/06/2026 08:30', amarre:'12/06/2026 11:00', inicia:'12/06/2026 14:00', termina:'13/06/2026 02:00', firma:'13/06/2026 03:00', zarpe:'13/06/2026 06:00' } },
    { cliente:'PETROPERÚ', per:'U7501-26', viaje:'V015-2026', nave:'URUBAMBA', operacion:'DESCARGA', producto:'GP8-GR6',  terminal:'PISCO',    personal:'B. CHARLES - P. IVAN/NOE',          compartido:true,  mes:'Junio', anio:2026, tl:{ eta:'14/06/2026 06:00', arriba:'14/06/2026 08:00', fondea:'14/06/2026 08:30', amarre:'14/06/2026 11:00', inicia:'14/06/2026 14:00', termina:'15/06/2026 02:00', firma:'15/06/2026 03:00', zarpe:'15/06/2026 06:00' } },
    { cliente:'PRIMAX',    per:'U7600-26', viaje:'V016-2026', nave:'NAPO',     operacion:'CARGA',    producto:'GP3-GR4',  terminal:'ILO',      personal:'B. ANA QUISPE - P. CARLOS/BETO',  compartido:false, mes:'Junio', anio:2026, tl:{ eta:'15/06/2026 06:00', arriba:'15/06/2026 08:00', fondea:'15/06/2026 08:30', amarre:'15/06/2026 11:00', inicia:'15/06/2026 14:00', termina:'16/06/2026 02:00', firma:'16/06/2026 03:00', zarpe:'16/06/2026 06:00' } },
  ]},
  { opId:'OP0032', viajes:[
    { cliente:'REPSOL',    per:'U7700-26', viaje:'V017-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP6-GR8',  terminal:'MOLLENDO', personal:'B. MARIO PEÑA - P. ROBERTO/JOSE', compartido:false, mes:'Junio', anio:2026, tl:{ eta:'17/06/2026 06:00', arriba:'17/06/2026 08:00', fondea:'17/06/2026 08:30', amarre:'17/06/2026 11:00', inicia:'17/06/2026 14:00', termina:'18/06/2026 02:00', firma:'18/06/2026 03:00', zarpe:'18/06/2026 06:00' } },
  ]},
  { opId:'OP0033', viajes:[
    { cliente:'MOBIL',     per:'U7800-26', viaje:'V018-2026', nave:'PASTAZA',  operacion:'DESCARGA', producto:'GP8-T44',  terminal:'CONCHÁN',  personal:'B. PEDRO SALAS - P. IVAN/FELIX',  compartido:false, mes:'Junio', anio:2026, tl:{ eta:'19/06/2026 06:00', arriba:'19/06/2026 08:00', fondea:'19/06/2026 08:30', amarre:'19/06/2026 11:00', inicia:'19/06/2026 14:00', termina:'20/06/2026 02:00', firma:'20/06/2026 03:00', zarpe:'20/06/2026 06:00' } },
    { cliente:'PETROPERÚ', per:'U7900-26', viaje:'V019-2026', nave:'CHIRA',    operacion:'DESCARGA', producto:'GP10-GR5', terminal:'CALLAO',   personal:'B. JULIO VERTIZ - P. PABLO/NOE',  compartido:false, mes:'Junio', anio:2026, tl:{ eta:'20/06/2026 06:00', arriba:'20/06/2026 08:00', fondea:'20/06/2026 08:30', amarre:'20/06/2026 11:00', inicia:'20/06/2026 14:00', termina:'21/06/2026 02:00', firma:'21/06/2026 03:00', zarpe:'21/06/2026 06:00' } },
  ]},
  { opId:'OP0034', viajes:[
    { cliente:'ENAP',      per:'U8000-26', viaje:'V020-2026', nave:'URUBAMBA', operacion:'CARGA',    producto:'GP5-GR6',  terminal:'PISCO',    personal:'B. JORGE PINO - P. ANDRES/CARLOS', compartido:false, mes:'Junio', anio:2026, tl:{ eta:'22/06/2026 06:00', arriba:'22/06/2026 08:00', fondea:'22/06/2026 08:30', amarre:'22/06/2026 11:00', inicia:'22/06/2026 14:00', termina:'23/06/2026 02:00', firma:'23/06/2026 03:00', zarpe:'23/06/2026 06:00' } },
    { cliente:'REPSOL',    per:'U8100-26', viaje:'V021-2026', nave:'MANTARO',  operacion:'CARGA',    producto:'GP6-D2',   terminal:'ILO',      personal:'B. CARLOS MEZA - P. ROBERTO/BETO', compartido:false, mes:'Junio', anio:2026, tl:{ eta:'24/06/2026 06:00', arriba:'24/06/2026 08:00', fondea:'24/06/2026 08:30', amarre:'24/06/2026 11:00', inicia:'24/06/2026 14:00', termina:'25/06/2026 02:00', firma:'25/06/2026 03:00', zarpe:'25/06/2026 06:00' } },
    { cliente:'PRIMAX',    per:'U8200-26', viaje:'V022-2026', nave:'NAPO',     operacion:'CARGA',    producto:'GP4-GR5',  terminal:'MOLLENDO', personal:'B. ANA TORRES - P. ALEX/NOE',      compartido:false, mes:'Junio', anio:2026, tl:{ eta:'24/06/2026 10:00', arriba:'24/06/2026 12:00', fondea:'24/06/2026 12:30', amarre:'24/06/2026 15:00', inicia:'24/06/2026 17:00', termina:'25/06/2026 05:00', firma:'25/06/2026 06:00', zarpe:'25/06/2026 09:00' } },
  ]},
];

// =================================================
// STATE
// =================================================
let filteredData = [];

// =================================================
// INIT
// =================================================
document.addEventListener('DOMContentLoaded', () => {
  // Defaults globales Chart.js
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size   = 11;
  Chart.defaults.color       = '#6B7280';
  Chart.defaults.plugins.tooltip.backgroundColor = '#111111';
  Chart.defaults.plugins.tooltip.titleColor      = '#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor       = '#E5E7EB';
  Chart.defaults.plugins.tooltip.padding         = 10;
  Chart.defaults.plugins.tooltip.cornerRadius    = 8;
  Chart.defaults.plugins.tooltip.displayColors   = false;

  poblarFiltrosDropdowns();
  aplicarFiltros();
  document.addEventListener('click', e => {
    if (!e.target.closest('.btn-download-wrap'))
      document.getElementById('downloadDropdown').classList.remove('open');
  });
});

function poblarFiltrosDropdowns() {
  const todos = CABOTAJE_DATA.flatMap(op => op.viajes);

  const anios = [...new Set(todos.map(v => v.anio))].sort();
  const selAnio = document.getElementById('filterAnio');
  const optTodos = document.createElement('option');
  optTodos.value = ''; optTodos.textContent = 'Todos los años';
  selAnio.appendChild(optTodos);
  anios.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    selAnio.appendChild(opt);
  });

  const terminales = [...new Set(todos.map(v => v.terminal))].sort();
  const selTerm = document.getElementById('filterTerminal');
  terminales.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    selTerm.appendChild(opt);
  });

  // Sin pre-selección: mostrar todos los datos al cargar
}

// =================================================
// FILTROS
// =================================================
function aplicarFiltros() {
  const q        = document.getElementById('searchCabotaje').value.toLowerCase().trim();
  const mes      = document.getElementById('filterMes').value;
  const anio     = parseInt(document.getElementById('filterAnio').value) || 0;
  const terminal = document.getElementById('filterTerminal').value;

  filteredData = CABOTAJE_DATA.map(op => {
    const viajes = op.viajes.filter(v => {
      const matchQ = !q || [v.cliente, v.per, v.viaje, v.nave, v.operacion, v.producto, v.terminal, v.personal].some(s => s.toLowerCase().includes(q));
      const matchM = !mes      || v.mes      === mes;
      const matchA = !anio     || v.anio     === anio;
      const matchT = !terminal || v.terminal === terminal;
      return matchQ && matchM && matchA && matchT;
    });
    return { opId: op.opId, viajes };
  }).filter(op => op.viajes.length > 0);

  pagina = 1;
  actualizarKPIs();
  actualizarGraficos();
  renderTabla();
}

// =================================================
// KPIs
// =================================================
function actualizarKPIs() {
  const todos = filteredData.flatMap(op => op.viajes);
  document.getElementById('kpiCliente').textContent                = [...new Set(todos.map(v => v.cliente))].length;
  document.getElementById('kpiViajes').textContent                 = todos.length;
  document.getElementById('kpiCompartidos').textContent            = todos.filter(v => v.compartido).length;
  document.getElementById('infoTerminalesActivosKPI').textContent  = [...new Set(todos.map(v => v.terminal))].length;
}

// =================================================
// GRÁFICOS
// =================================================
function actualizarGraficos() {
  const todos = filteredData.flatMap(op => op.viajes);
  pintarLineaTendencia();
  pintarPastelTerminal(todos);
  pintarBarrasClientes(todos);
}

// Parsea "dd/mm/yyyy hh:mm" → Date (solo fecha, sin hora)
function parseFechaTL(str) {
  const [d, m, y] = str.split(' ')[0].split('/').map(Number);
  return new Date(y, m - 1, d);
}

// --- Línea: mensual = días activos por operación | anual = meses del año actual ---
function pintarLineaTendencia() {
  const ctx   = document.getElementById('chartLinea').getContext('2d');
  const todos = CABOTAJE_DATA.flatMap(op => op.viajes);
  let labels, data, color, subtitulo;

  if (periodoTendencia === 'mes') {
    const diasEnMes  = new Date(ANIO_ACTUAL, MES_ACTUAL + 1, 0).getDate();
    const viajesMes  = todos.filter(v => v.anio === ANIO_ACTUAL && v.mes === MES_ACTUAL_NOMBRE);
    labels = Array.from({ length: diasEnMes }, (_, i) => i + 1);
    // Cuenta operaciones activas cada día (eta → zarpe), no solo el día de llegada
    data = labels.map(dia => {
      const diaDate = new Date(ANIO_ACTUAL, MES_ACTUAL, dia);
      const activas = viajesMes.filter(v => {
        const eta   = parseFechaTL(v.tl.eta);
        const zarpe = parseFechaTL(v.tl.zarpe);
        return diaDate >= eta && diaDate <= zarpe;
      }).length;
      return activas > 0 ? activas : null;
    });
    color     = '#00B4D8';
    subtitulo = `${MES_ACTUAL_NOMBRE} ${ANIO_ACTUAL} · operaciones activas por día`;
  } else {
    const conteo = {};
    todos
      .filter(v => v.anio === ANIO_ACTUAL)
      .forEach(v => { conteo[v.mes] = (conteo[v.mes] || 0) + 1; });
    labels    = MESES_CORTOS;
    data      = MESES_ORD.map(m => conteo[m] ?? null);
    color     = '#F5C400';
    subtitulo = `Año ${ANIO_ACTUAL} · operaciones por mes`;
  }

  const sub = document.getElementById('lineaSubtitle');
  if (sub) sub.textContent = subtitulo;

  // Gradiente vertical: opaco arriba → transparente abajo
  const canvasH = ctx.canvas.parentElement.clientHeight || 280;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasH);
  if (periodoTendencia === 'mes') {
    gradient.addColorStop(0, 'rgba(0,180,216,0.22)');
    gradient.addColorStop(1, 'rgba(0,180,216,0)');
  } else {
    gradient.addColorStop(0, 'rgba(245,196,0,0.22)');
    gradient.addColorStop(1, 'rgba(245,196,0,0)');
  }

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Operaciones activas',
        data,
        borderColor: color,
        backgroundColor: gradient,
        fill: true,
        tension: .45,
        pointBackgroundColor: '#fff',
        pointBorderColor: color,
        pointBorderWidth: 2,
        pointRadius:      periodoTendencia === 'mes' ? 3 : 5,
        pointHoverRadius: periodoTendencia === 'mes' ? 6 : 7,
        spanGaps: true,
        borderWidth: 2.5,
      }]
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: c => {
              const lbl = c[0].label;
              return periodoTendencia === 'mes'
                ? `Día ${lbl} · ${MES_ACTUAL_NOMBRE} ${ANIO_ACTUAL}`
                : `${lbl} ${ANIO_ACTUAL}`;
            },
            label: c => ` ${c.raw ?? 0} operación${(c.raw ?? 0) !== 1 ? 'es activas' : ' activa'}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { padding: 6, maxTicksLimit: periodoTendencia === 'mes' ? 10 : 12, maxRotation: 0 },
        },
        y: {
          beginAtZero: true,
          grace: '15%',
          ticks: { precision: 0, padding: 6 },
          grid: { color: 'rgba(0,0,0,0.06)', drawTicks: false },
          border: { display: false },
        },
      },
      animation: { duration: 500, easing: 'easeInOutQuart' },
    }
  });
}

function cambiarPeriodoTendencia(periodo, btn) {
  periodoTendencia = periodo;
  document.querySelectorAll('.toggle-period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  pintarLineaTendencia();
}

// --- Doughnut: operaciones por terminal (hasta 14 terminales) ---
function pintarPastelTerminal(viajes) {
  const ctx    = document.getElementById('chartPastel').getContext('2d');
  const conteo = {};
  viajes.forEach(v => { conteo[v.terminal] = (conteo[v.terminal] || 0) + 1; });

  const sorted = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(e => e[0]);
  const data   = sorted.map(e => e[1]);
  const total  = data.reduce((a, b) => a + b, 0);

  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: TERMINAL_COLORS.slice(0, labels.length),
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 8,
        hoverBorderWidth: 2,
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          position: labels.length > 8 ? 'right' : 'bottom',
          labels: {
            font: { size: labels.length > 8 ? 9.5 : 10.5 },
            boxWidth: 10,
            padding: labels.length > 8 ? 5 : 8,
            usePointStyle: true,
            pointStyle: 'circle',
            generateLabels: chart => {
              const ds = chart.data.datasets[0];
              return chart.data.labels.map((lbl, i) => {
                const pct = total > 0 ? Math.round(ds.data[i] / total * 100) : 0;
                return {
                  text: `${lbl} · ${pct}%`,
                  fillStyle: ds.backgroundColor[i],
                  strokeStyle: '#fff',
                  lineWidth: 1,
                  pointStyle: 'circle',
                  index: i,
                  hidden: false,
                };
              });
            },
          },
        },
        tooltip: {
          callbacks: {
            label: c => {
              const pct = total > 0 ? Math.round(c.raw / total * 100) : 0;
              return ` ${c.raw} operaciones · ${pct}%`;
            },
          },
        },
      },
      animation: { duration: 500, easing: 'easeInOutQuart' },
    }
  });
}

// --- Barras: top 5 clientes ---
function pintarBarrasClientes(viajes) {
  const ctx    = document.getElementById('chartBarras').getContext('2d');
  const conteo = {};
  viajes.forEach(v => { conteo[v.cliente] = (conteo[v.cliente] || 0) + 1; });
  const top    = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const labels = top.map(t => t[0]);
  const data   = top.map(t => t[1]);

  // Degradado: primer lugar en yellow, resto con opacidad decreciente
  const barColors = data.map((_, i) =>
    i === 0 ? '#F5C400' : i === 1 ? '#D4A900' : `rgba(245,196,0,${Math.max(0.35, 0.85 - i * 0.12)})`
  );

  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Operaciones',
        data,
        backgroundColor: barColors,
        borderRadius: 6,
        maxBarThickness: 32,
      }]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.raw} operaciones` } },
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0, padding: 6 }, grid: { color: 'rgba(0,0,0,0.04)', drawTicks: false }, border: { display: false } },
        y: { grid: { display: false }, ticks: { padding: 8, font: { weight: '600' } } },
      },
      animation: { duration: 500, easing: 'easeInOutQuart' },
    }
  });
}

// =================================================
// TABLA + PAGINACIÓN
// =================================================
function renderTabla() {
  const tbody = document.getElementById('tbodyCabotaje');
  tbody.innerHTML = '';

  if (filteredData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--gray-400)">Sin resultados para los filtros aplicados</td></tr>';
    const infoVacio = document.getElementById('pagInfoCabotaje');
    if (infoVacio) infoVacio.textContent = 'Sin registros';
    renderPaginacion(0);
    return;
  }

  const inicio  = (pagina - 1) * PAGE_SIZE;
  const pagData = filteredData.slice(inicio, inicio + PAGE_SIZE);

  pagData.forEach(op => {
    const hdr = document.createElement('tr');
    hdr.className = 'op-group-header';
    hdr.innerHTML = `<td colspan="9">N° Operación: ${op.opId}</td>`;
    tbody.appendChild(hdr);

    op.viajes.forEach((v, idx) => {
      const rowId = `${op.opId}-${idx}`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.cliente}</td>
        <td>${v.per}</td>
        <td>${v.viaje}</td>
        <td>${v.nave}</td>
        <td>${v.operacion}</td>
        <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${v.producto}">${v.producto}</td>
        <td>${v.terminal}</td>
        <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${v.personal}">${v.personal}</td>
        <td>
          <button class="btn-expand" id="btn-${rowId}" onclick="toggleTimeline('${rowId}')" title="Ver cronograma">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6,9 12,15 18,9"/></svg>
          </button>
        </td>`;
      tbody.appendChild(tr);

      const tlRow = document.createElement('tr');
      tlRow.className = 'timeline-row';
      tlRow.id = `tl-${rowId}`;
      tlRow.innerHTML = `
        <td colspan="9">
          <div class="timeline-inner">
            <div class="timeline-grid">
              <div class="tl-head">
                <span>ETA</span><span>ARRIBA</span><span>FONDEA</span>
                <span>AMARRE INICIO</span><span>INICIA</span><span>TERMINA</span>
                <span>FIRMA DOC.</span><span>ZARPE</span>
              </div>
              <div class="tl-body">
                <span>${v.tl.eta}</span><span>${v.tl.arriba}</span><span>${v.tl.fondea}</span>
                <span>${v.tl.amarre}</span><span>${v.tl.inicia}</span><span>${v.tl.termina}</span>
                <span>${v.tl.firma}</span><span>${v.tl.zarpe}</span>
              </div>
            </div>
          </div>
        </td>`;
      tbody.appendChild(tlRow);
    });
  });

  const infoEl = document.getElementById('pagInfoCabotaje');
  if (infoEl) {
    const total = filteredData.length;
    const inicio = (pagina - 1) * PAGE_SIZE;
    const fin    = Math.min(pagina * PAGE_SIZE, total);
    infoEl.textContent = total > 0
      ? `Mostrando ${inicio + 1}–${fin} de ${total} registros`
      : 'Sin registros';
  }
  renderPaginacion(filteredData.length);
}

function renderPaginacion(total) {
  const wrap      = document.getElementById('paginationWrap');
  if (!wrap) return;
  const totalPags = Math.ceil(total / PAGE_SIZE);
  if (totalPags <= 1) { wrap.innerHTML = ''; return; }

  let html = `<button class="pag-btn pag-btn-nav" onclick="irPagina(${pagina - 1})"
    ${pagina === 1 ? 'disabled' : ''}>‹</button>`;

  const start = Math.max(1, pagina - 2);
  const end   = Math.min(totalPags, start + 4);
  for (let p = start; p <= end; p++) {
    html += `<button class="pag-btn ${p === pagina ? 'active' : ''}"
      onclick="irPagina(${p})">${p}</button>`;
  }
  html += `<button class="pag-btn pag-btn-nav" onclick="irPagina(${pagina + 1})"
    ${pagina === totalPags ? 'disabled' : ''}>›</button>`;

  wrap.innerHTML = html;
}

function irPagina(n) {
  const totalPags = Math.ceil(filteredData.length / PAGE_SIZE);
  if (n < 1 || n > totalPags) return;
  pagina = n;
  renderTabla();
  document.querySelector('.table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cambiarFilasCab(n) {
  PAGE_SIZE = n;
  pagina = 1;
  renderTabla();
}

function toggleTimeline(rowId) {
  const tlRow = document.getElementById(`tl-${rowId}`);
  const btn   = document.getElementById(`btn-${rowId}`);
  const open  = tlRow.classList.toggle('open');
  btn.classList.toggle('expanded', open);
}

// =================================================
// LIMPIAR FILTROS
// =================================================
function limpiarFiltros() {
  document.getElementById('searchCabotaje').value = '';
  document.getElementById('filterMes').value      = '';
  document.getElementById('filterAnio').value     = '';
  document.getElementById('filterTerminal').value = '';
  aplicarFiltros();
}

// =================================================
// DOWNLOAD DROPDOWN
// =================================================
function toggleDownloadDropdown() {
  document.getElementById('downloadDropdown').classList.toggle('open');
}

function descargarArchivo(tipo) {
  mostrarToast(`Descarga en formato ${tipo.toUpperCase()} iniciada`);
  document.getElementById('downloadDropdown').classList.remove('open');
}
