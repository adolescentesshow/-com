const { useState, useCallback } = React;


// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const generateId = () => Math.random().toString(36).slice(2, 10);
const fmtMoney  = (n) => `Bs. ${Number(n || 0).toFixed(2)}`;
const fmtDate   = (d) => { if (!d) return "—"; const [y,m,dy] = d.split("-"); return `${dy}/${m}/${y}`; };
const today     = () => new Date().toISOString().slice(0, 10);
const addDays   = (ds, n) => { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };

// ─── MIEMBROS DEL GRUPO ───────────────────────────────────────────────────────
const SOCIOS = [
  { code:"S01", name:"Jose Luis Gutierrez",  role:"Guitarrón",                  type:"socio"     },
  { code:"S02", name:"Jhonny Cadima Limón",  role:"Vihuela y Voz",              type:"socio"     },
  { code:"S03", name:"Dámaso González",      role:"Vihuela y Primera Voz",      type:"socio"     },
  { code:"S04", name:"Yoryi Cadima Limón",   role:"Guitarra y Primera Voz",     type:"socio"     },
  { code:"S05", name:"Jimmy Toro Tapia",     role:"Acordeón y Teclado",         type:"socio"     },
  { code:"S06", name:"René Sandoval",        role:"Segunda Trompeta y Coros",   type:"socio"     },
];
const TRABAJADORES = [
  { code:"T01", name:"Jose Alfredo Coca",    role:"Primera Trompeta",           type:"trabajador" },
  { code:"T02", name:"Joaquín Severiche",    role:"Batería y Voz",              type:"trabajador" },
  { code:"T03", name:"Carlos Nova",          role:"Bongo y Timbales",           type:"trabajador" },
];
const REEMPLAZOS = [
  { code:"R01", name:"Kevin Moscoso",        role:"Bajo",                       type:"reemplazo"  },
  { code:"R02", name:"Diego Sandoval",       role:"Vihuela y Voz",              type:"reemplazo"  },
  { code:"R03", name:"Arvin Torrez",         role:"Trompeta",                   type:"reemplazo"  },
  { code:"R04", name:"Maiber Veliz",         role:"Trompeta",                   type:"reemplazo"  },
];

// Códigos visuales para cada músico
const MEMBER_COLOR = {
  socio:     { bg:"rgba(255,191,0,.18)",    color:"#ffbf00",   border:"rgba(255,191,0,.5)"    },
  trabajador:{ bg:"rgba(0,184,204,.15)",    color:"#00b8cc",   border:"rgba(0,184,204,.5)"    },
  reemplazo: { bg:"rgba(139,68,240,.15)",   color:"#8b44f0",   border:"rgba(139,68,240,.5)"   },
};

const ALL_MEMBERS = [...SOCIOS, ...TRABAJADORES, ...REEMPLAZOS];
const getMember  = (code) => ALL_MEMBERS.find(m => m.code === code);

// ─── CATÁLOGO DE MULTAS ───────────────────────────────────────────────────────
const MULTAS_CAT = [
  { id:"retraso",          label:"Retraso",                  monto:20,  icon:"⏰" },
  { id:"uniforme",         label:"Uniforme (complemento)",   monto:20,  icon:"👔" },
  { id:"uniforme_ppal",    label:"Uniforme (prenda ppál)",   monto:50,  icon:"🥼" },
  { id:"borrachera",       label:"Borrachera",               monto:200, icon:"🍺" },
  { id:"no_presentarse",   label:"No presentarse al show",   monto:200, icon:"🚫" },
  { id:"otro",             label:"Otra multa",               monto:0,   icon:"📋" },
];

// ─── PAQUETES ─────────────────────────────────────────────────────────────────
const PAQUETES_DEFAULT = [
  { id:"serenata",   icon:"🎤", nombre:"PAQUETE SERENATA",             duracion:"20-25 min",  precio:1200,  descripcion:"Show musical en vivo · Repertorio romántico y variado",                                  minHoras:null },
  { id:"favorito",   icon:"⭐", nombre:"PAQUETE FAVORITO",             duracion:"40 min",     precio:2000,  descripcion:"Show más completo · Más canciones y animación",                                          minHoras:null },
  { id:"boliche",    icon:"🔥", nombre:"PRESENTACIÓN BOLICHE/DISC.",   duracion:"45 min",     precio:3000,  descripcion:"Ideal para discotecas, boliches y eventos nocturnos",                                     minHoras:null },
  { id:"evento_hr",  icon:"🎶", nombre:"PAQUETE EVENTO (por hora)",    duracion:"mín 4h",     precio:1200,  descripcion:"Presentación musical continua · Animación · Precio por hora",                             minHoras:4   },
  { id:"completo",   icon:"🔊", nombre:"PAQUETE EVENTO COMPLETO",      duracion:"mín 5h",     precio:9000,  descripcion:"Grupo musical · Sonido profesional · Micrófonos y amplificación",                        minHoras:5   },
  { id:"provincias", icon:"🚐", nombre:"PAQUETE PROVINCIAS",           duracion:"hasta 8h",   precio:20000, descripcion:"Sonido profesional · Ingeniero de sonido · Transporte incluido · Presentación en vivo",  minHoras:null },
  { id:"manual",     icon:"✏️", nombre:"PRECIO MANUAL / PERSONALIZADO",duracion:"—",          precio:0,     descripcion:"Ingresar precio manualmente",                                                             minHoras:null },
];

const STATUS_CFG = {
  Disponible:{ color:"#22c55e", bg:"#052e16" },
  Reservado: { color:"#f59e0b", bg:"#1c1500" },
  Confirmado:{ color:"#3b82f6", bg:"#0c1a2e" },
  Realizado: { color:"#a855f7", bg:"#1a0b2e" },
};

const DAYS_ES   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MONTHS_SH = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const ALL_HOURS = Array.from({length:24},(_,i)=>`${String(i).padStart(2,"0")}:00`);

const getWeekDays = (ds) => {
  const d = new Date(ds+"T12:00:00");
  const s = new Date(d); s.setDate(d.getDate()-d.getDay());
  return Array.from({length:7},(_,i)=>{ const nd=new Date(s); nd.setDate(s.getDate()+i); return nd.toISOString().slice(0,10); });
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
const T = today();
const SEED_SHOWS = [
  { id:"s1", date:"2025-08-15", timeStart:"21:00", hours:3, place:"Club Náutico Santa Cruz", cliente:"Familia Rodríguez", tipoEvento:"Aniversario", ubicacion:"Av. Beni y 3er Anillo", price:1200, advance:300, status:"Realizado", paymentMethod:"Efectivo",
    presentes:["S01","S02","S03","S04","S05","S06"], trabajadores:["T01","T02","T03"], reemplazos:[], ausentes:[], tarde:["S02"], notas:"" },
  { id:"s2", date:addDays(T,3), timeStart:"20:00", hours:4, place:"Hotel Los Tajibos", cliente:"Empresa TotalEnergies", tipoEvento:"Cena Corporativa", ubicacion:"Av. San Martín 455", price:2500, advance:500, status:"Confirmado", paymentMethod:null, presentes:[], trabajadores:[], reemplazos:[], ausentes:[], tarde:[], notas:"Confirmar menú" },
  { id:"s3", date:addDays(T,7), timeStart:"21:00", hours:3, place:"Salón del Country", cliente:"Sr. Morales", tipoEvento:"Cumpleaños 50", ubicacion:"Barrio Las Palmas", price:1800, advance:0, status:"Reservado", paymentMethod:null, presentes:[], trabajadores:[], reemplazos:[], ausentes:[], tarde:[], notas:"" },
  { id:"s4", date:addDays(T,14), timeStart:"19:00", hours:5, place:"Casa de la Cultura", cliente:"Municipio Santa Cruz", tipoEvento:"Festival Folclórico", ubicacion:"Plaza 24 de Septiembre", price:3200, advance:1000, status:"Confirmado", paymentMethod:null, presentes:[], trabajadores:[], reemplazos:[], ausentes:[], tarde:[], notas:"Llevar equipo de sonido" },
];
const SEED_MULTAS = [
  { id:"f1", showId:"s1", memberCode:"S02", type:"retraso", amount:20, date:"2025-08-15", note:"Llegó 40 min tarde" },
];
const SEED_PRINCIPAL = [
  { id:"p1", date:"2025-08-15", type:"adelanto", concept:"Adelanto Show Club Náutico", amount:300 },
  { id:"p2", date:"2025-08-15", type:"saldo",    concept:"Saldo Show Club Náutico",    amount:900 },
  { id:"p3", date:"2025-08-15", type:"pago",     concept:"Pago trabajadores (3)",       amount:-300 },
  { id:"p4", date:"2025-08-15", type:"pago",     concept:"Dividido socios (6)",          amount:-900 },
];
const SEED_CAJACHICA = [
  { id:"cc1", date:"2025-08-15", type:"multa", concept:"Multa retraso — Jhonny Cadima Limón", amount:20 },
];
const SEED_PAYMENTS = [
  { id:"pay1", showId:"s1", date:"2025-08-15", totalShow:1200, advance:300,
    gastosAdmin:[], pagosNoSocios:[{code:"T01",name:"Jose Alfredo Coca",monto:100},{code:"T02",name:"Joaquín Severiche",monto:100},{code:"T03",name:"Carlos Nova",monto:100}],
    pagosReemplazos:[], multasTotal:20,
    sociosPagados:["S01","S02","S03","S04","S05","S06"],
    montoSaldo:900, porSocio:150,
    socioDesglose:[{code:"S01",name:"Jose Luis Gutierrez",base:"150",total:"150"},{code:"S02",name:"Jhonny Cadima Limón",base:"150",total:"130"},{code:"S03",name:"Dámaso González",base:"150",total:"150"},{code:"S04",name:"Yoryi Cadima Limón",base:"150",total:"150"},{code:"S05",name:"Jimmy Toro Tapia",base:"150",total:"150"},{code:"S06",name:"René Sandoval",base:"150",total:"150"}],
  },
];
const DEFAULT_DASH = {
  groupName: "ADOLESCENTES SHOW",
  tagline: "Sistema de Gestión Musical",
  city: "Santa Cruz de la Sierra",
  phone: "+591 777-12345",
  email: "adolescentes@show.bo",
  socialMedia: "@AdolescentesShow",
  showGoalMonthly: 8,
  incomeGoalMonthly: 12000,
  widgets: ["proximos","ingresos","multas","asistencia","calendario","actividad"],
};

// ─── CSS ──────────────────────────────────────────────────────────────────────


// ─── HELPERS ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || STATUS_CFG.Disponible;
  return <span className="bdg" style={{ background:c.bg, color:c.color, borderColor:c.color+"40" }}>{status}</span>;
}
function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div className="ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={wide?{maxWidth:820}:{}}>
        <div className="mh"><span className="mt2">{title}</span><button className="bico" onClick={onClose}>✕</button></div>
        <div className="mb2">{children}</div>
        {footer && <div className="mf">{footer}</div>}
      </div>
    </div>
  );
}
function TypeBadge({ type }) {
  const cfg = {socio:{color:"var(--gold)",bg:"rgba(255,191,0,.1)",label:"Socio"},trabajador:{color:"var(--tel)",bg:"rgba(0,184,204,.1)",label:"Trabajador"},reemplazo:{color:"var(--pur)",bg:"rgba(139,68,240,.1)",label:"Reemplazo"}}[type]||{};
  return <span className="bdg" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.color+"50"}}>{cfg.label}</span>;
}
const safeArr = (v) => Array.isArray(v) ? v : [];
const safeNum = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const safeStr = (v) => (v == null ? "" : String(v));
const MES_ES  = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const getLunes = (ds) => {
  try {
    const d = new Date(safeStr(ds)+"T12:00:00");
    if (isNaN(d.getTime())) return today();
    const dow = d.getDay();
    d.setDate(d.getDate()+(dow===0?-6:1-dow));
    return d.toISOString().slice(0,10);
  } catch { return today(); }
};

const TIPO_EVENTO = ["Cumpleaños","Aniversario","Boda","Bautizo","Cena Corporativa","Festival","Serenata","Quinceañera","Graduación","Fiesta Privada","Evento Municipal","Otro"];
const HORAS_OPTS = [1,2,3,4,5,6,7,8,9,10,12];

// ─── MINI CALCULADORA ─────────────────────────────────────────────────────────
function MiniCalc() {
  const [disp,setDisp]=useState("0");
  const [expr,setExpr]=useState("");
  const [wait,setWait]=useState(false);
  const sN=(v)=>{const n=parseFloat(v);return isNaN(n)?0:n;};
  const num=(n)=>{if(wait){setDisp(n);setWait(false);}else setDisp(disp==="0"?n:disp+n);};
  const op=(o)=>{setExpr(disp+" "+o);setWait(true);};
  const eq=()=>{try{const f=expr+" "+disp;const r=Function('"use strict";return('+f.replace(/×/g,"*").replace(/÷/g,"/")+')')(  );setDisp(String(parseFloat(r.toFixed(4))));setExpr(f+" =");setWait(true);}catch{setDisp("Error");}};
  const clr=()=>{setDisp("0");setExpr("");setWait(false);};
  const keys=[
    {l:"C",c:"cclr",a:clr},{l:"±",c:"",a:()=>setDisp(String(-sN(disp)))},{l:"%",c:"",a:()=>setDisp(String(sN(disp)/100))},{l:"÷",c:"cop",a:()=>op("÷")},
    {l:"7",c:"",a:()=>num("7")},{l:"8",c:"",a:()=>num("8")},{l:"9",c:"",a:()=>num("9")},{l:"×",c:"cop",a:()=>op("×")},
    {l:"4",c:"",a:()=>num("4")},{l:"5",c:"",a:()=>num("5")},{l:"6",c:"",a:()=>num("6")},{l:"−",c:"cop",a:()=>op("-")},
    {l:"1",c:"",a:()=>num("1")},{l:"2",c:"",a:()=>num("2")},{l:"3",c:"",a:()=>num("3")},{l:"+",c:"cop",a:()=>op("+")},
    {l:"⌫",c:"",a:()=>setDisp(disp.length>1?disp.slice(0,-1):"0")},{l:"0",c:"czero",a:()=>num("0")},{l:".",c:"",a:()=>{if(!disp.includes("."))setDisp(disp+".");}},{l:"=",c:"ceq",a:eq},
  ];
  return (
    <div className="calc-panel">
      <div className="calc-disp"><div className="calc-expr">{expr}</div><div>{disp}</div></div>
      <div className="calc-grid">{keys.map((k,i)=><button key={i} className={`cbtn ${k.c}`} onClick={k.a}>{k.l}</button>)}</div>
    </div>
  );
}

// ─── SHOW FORM MODAL ──────────────────────────────────────────────────────────
function ShowFormModal({ show, occupiedHours, onSave, onClose, onAddMulta, multas, startStep, allShows }) {
  const emptyF = { date:today(), timeStart:"20:00", hours:"3", place:"", cliente:"", tipoEvento:"Cumpleaños", ubicacion:"", price:"", advance:"", status:"Reservado", notas:"" };
  const [step, setStep] = useState(startStep||1);
  const [f, setF] = useState(show ? {
    date:show.date, timeStart:show.timeStart||"20:00", hours:String(show.hours||3),
    place:show.place||"", cliente:show.cliente||"", tipoEvento:show.tipoEvento||"Cumpleaños",
    ubicacion:show.ubicacion||"", price:String(show.price||""), advance:String(show.advance||""),
    status:show.status||"Reservado", notas:show.notas||""
  } : emptyF);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [paqueteId, setPaqueteId]           = useState(show?.paqueteId||"manual");
  const [presentes, setPresentes]     = useState(show?.presentes?.length ? show.presentes : SOCIOS.map(m=>m.code));
  const [trabajadores, setTrab]       = useState(show?.trabajadores?.length ? show.trabajadores : TRABAJADORES.map(m=>m.code));
  const [reemplazos, setReemplazos]   = useState(show?.reemplazos||[]);
  const [ausentes, setAusentes]       = useState(show?.ausentes||[]);
  const [tarde, setTarde]             = useState(show?.tarde||[]);
  const [multaM, setMultaM] = useState({memberCode:"", type:"retraso", amount:"", note:""});
  const [localMultas, setLocalMultas] = useState(show ? (multas||[]).filter(m=>m.showId===show.id) : []);
  const [newAdv, setNewAdv] = useState("");

  const endTime = f.timeStart && f.hours ? `${String(parseInt(f.timeStart.split(":")[0])+parseInt(f.hours)).padStart(2,"0")}:00` : "";
  const saldo = f.price && f.advance ? parseFloat(f.price) - (parseFloat(f.advance)||0) : null;

  const stepOk = () => {
    if(!f.date||!f.place||!f.price||!f.hours) { alert("Completa fecha, lugar, precio y duración"); return; }
    setStep(2);
  };

  const addMultaLocal = () => {
    if(!multaM.memberCode||!multaM.amount) return alert("Selecciona músico y monto");
    const m = { id:generateId(), showId:show?.id||"", memberCode:multaM.memberCode, type:multaM.type, amount:parseFloat(multaM.amount), date:f.date, note:multaM.note };
    setLocalMultas(prev=>[...prev, m]);
    if(onAddMulta) onAddMulta({...multaM, showId:show?.id||"", date:f.date, amount:parseFloat(multaM.amount)});
    setMultaM({memberCode:"", type:"retraso", amount:"", note:""});
  };

  const applyAdv = () => {
    const v = parseFloat(newAdv);
    if(!v||v<=0) return alert("Ingresa un monto válido");
    setF(prev=>({...prev, advance:String((parseFloat(prev.advance)||0)+v)}));
    setNewAdv("");
  };

  const save = () => {
    const data = {
      ...f, price:parseFloat(f.price), advance:parseFloat(f.advance)||0, hours:parseInt(f.hours),
      presentes, trabajadores, reemplazos, ausentes, tarde
    };
    onSave(data);
  };

  return (
    <Modal title={show ? "✏️ Editar Show" : "🎸 Nuevo Show"} onClose={onClose} wide
      footer={
        step===1
          ? <><button className="btn bs" onClick={onClose}>Cancelar</button>
              <button className="btn bp" onClick={stepOk}>Siguiente → Asistencia</button></>
          : <><button className="btn bs" onClick={()=>setStep(1)}>← Datos</button>
              <button className="btn bp" onClick={save}>💾 {show?"Guardar Cambios":"Agendar Show"}</button></>
      }>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
        {[{n:1,l:"Datos del Show"},{n:2,l:"Asistencia y Multas"}].map(({n,l})=>(
          <div key={n} style={{display:"flex",alignItems:"center",gap:6,cursor:n<step?"pointer":"default"}} onClick={()=>n<step&&setStep(n)}>
            <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,
              background:step===n?"var(--acc)":step>n?"var(--grn)":"var(--bg3)",
              color:step>=n?"#fff":"var(--txt2)",border:`1px solid ${step===n?"var(--acc)":step>n?"var(--grn)":"var(--border)"}`}}>{step>n?"✓":n}</div>
            <span style={{fontSize:11,color:step===n?"var(--txt)":"var(--txt2)",fontWeight:step===n?700:400}}>{l}</span>
          </div>
        ))}
      </div>

      {step===1 && (()=>{
        // Shows del mismo mes para mostrar contador
        const monthStr = f.date ? f.date.slice(0,7) : "";
        const showsEsteMes = (allShows||[]).filter(s=>s.date.startsWith(monthStr)&&s.id!==show?.id);
        const showsEsaFecha= (allShows||[]).filter(s=>s.date===f.date&&s.id!==show?.id);

        const applyPaquete = (p) => {
          setPaqueteId(p.id);
          if(p.id!=="manual"){
            setF(prev=>({...prev,
              price: p.precio>0 ? String(p.precio) : prev.price,
              hours: p.minHoras ? String(p.minHoras) : prev.hours
            }));
          }
        };

        return (<>
        {/* ── CONTADOR DE SHOWS ── */}
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:120,background:"rgba(45,110,245,.08)",border:"1px solid rgba(45,110,245,.25)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:26,color:"var(--blu)"}}>{showsEsteMes.length}</div>
            <div style={{fontSize:9,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>Shows en {MONTHS_SH[parseInt(monthStr.slice(5,7))-1]||"el mes"}</div>
          </div>
          <div style={{flex:1,minWidth:120,background:"rgba(232,41,74,.08)",border:"1px solid rgba(232,41,74,.25)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:26,color:"var(--acc)"}}>{showsEsaFecha.length}</div>
            <div style={{fontSize:9,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>Shows esa fecha</div>
          </div>
          <div style={{flex:1,minWidth:120,background:"rgba(255,191,0,.07)",border:"1px solid rgba(255,191,0,.25)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:26,color:"var(--gold)"}}>{fmtMoney(f.price?parseFloat(f.price):0).replace("Bs. ","Bs.")}</div>
            <div style={{fontSize:9,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>Precio actual</div>
          </div>
        </div>

        {/* ── CLIENTE ── */}
        <div className="ct" style={{fontSize:12,marginBottom:8,color:"var(--tel)"}}>👤 INFORMACIÓN DEL CLIENTE</div>
        <div className="fgg">
          <div className="fg"><label className="lb">Nombre del Cliente *</label><input className="inp" placeholder="Ej: Familia García" value={f.cliente} onChange={e=>setF({...f,cliente:e.target.value})}/></div>
          <div className="fg"><label className="lb">Tipo de Evento</label><select className="sel" value={f.tipoEvento} onChange={e=>setF({...f,tipoEvento:e.target.value})}>{TIPO_EVENTO.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="fg" style={{gridColumn:"1/-1"}}><label className="lb">Ubicación / Dirección</label><input className="inp" placeholder="Ej: Av. Busch #235, 3er Anillo" value={f.ubicacion} onChange={e=>setF({...f,ubicacion:e.target.value})}/></div>
          <div className="fg" style={{gridColumn:"1/-1"}}><label className="lb">Lugar / Salón *</label><input className="inp" placeholder="Ej: Salón del Country" value={f.place} onChange={e=>setF({...f,place:e.target.value})}/></div>
        </div>

        <div className="div"/>

        {/* ── PAQUETES ── */}
        <div className="ct" style={{fontSize:12,marginBottom:10,color:"var(--gold)"}}>🎶 TIPO DE SHOW / PAQUETE</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:7,marginBottom:12}}>
          {PAQUETES_DEFAULT.map(p=>{
            const sel = paqueteId===p.id;
            return (
              <div key={p.id} onClick={()=>applyPaquete(p)}
                style={{borderRadius:11,border:`2px solid ${sel?"var(--gold)":"var(--border)"}`,
                  background:sel?"rgba(255,191,0,.09)":"var(--bg3)",
                  padding:"11px 10px",cursor:"pointer",transition:"all .15s",
                  position:"relative",overflow:"hidden",textAlign:"center"}}>
                {sel && <div style={{position:"absolute",top:5,right:7,fontSize:12}}>✅</div>}
                <div style={{fontSize:22,marginBottom:4}}>{p.icon}</div>
                <div style={{fontWeight:700,fontSize:10,lineHeight:1.3,color:"var(--txt)",marginBottom:2}}>{p.nombre.replace("PAQUETE ","").replace("PRESENTACIÓN ","")}</div>
                <div style={{fontSize:8,color:"var(--txt2)",marginBottom:4}}>{p.duracion}</div>
                {p.precio>0
                  ? <div style={{fontFamily:"var(--fd)",fontSize:16,color:"var(--gold)",letterSpacing:.5}}>Bs.{p.precio.toLocaleString("es-BO")}</div>
                  : <div style={{fontFamily:"var(--fd)",fontSize:14,color:"var(--txt2)"}}>Manual</div>}
              </div>
            );
          })}
        </div>

        <div className="div"/>

        {/* ── FECHA Y HORARIO ── */}
        <div className="ct" style={{fontSize:12,marginBottom:8,color:"var(--tel)"}}>📅 FECHA Y HORARIO</div>
        <div className="fgg">
          <div className="fg"><label className="lb">Fecha *</label><input className="inp" type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
          <div className="fg"><label className="lb">Duración (editable) *</label>
            <select className="sel" value={f.hours} onChange={e=>setF({...f,hours:e.target.value})}>
              {HORAS_OPTS.map(h=><option key={h} value={h}>{h} hora{h>1?"s":""}</option>)}
            </select>
          </div>
        </div>
        <div className="fg" style={{marginBottom:8}}>
          <label className="lb">Hora de Inicio</label>
          <div className="fc g8 mt8">
            <div className="inp" style={{width:90,textAlign:"center",cursor:"pointer",color:"var(--acc)",fontFamily:"var(--fm)",fontWeight:700,fontSize:16}} onClick={()=>setShowTimePicker(!showTimePicker)}>{f.timeStart}</div>
            {f.timeStart&&f.hours&&<div className="al ai" style={{marginBottom:0,padding:"6px 10px",fontSize:11}}>🕐 {f.timeStart} → {endTime} ({f.hours}h)</div>}
          </div>
          {showTimePicker&&(
            <div className="time-grid mt8">
              {ALL_HOURS.map(h=>{
                const isOcc=occupiedHours&&occupiedHours[h]&&occupiedHours[h]?.id!==show?.id;
                return <button key={h} className={`time-btn ${f.timeStart===h?"sel":""} ${isOcc?"occ":""}`} disabled={isOcc} onClick={()=>{if(!isOcc){setF({...f,timeStart:h});setShowTimePicker(false);}}}>{h}{isOcc?" 🔒":""}</button>;
              })}
            </div>
          )}
        </div>

        <div className="div"/>

        {/* ── PRECIO Y ESTADO ── */}
        <div className="ct" style={{fontSize:12,marginBottom:8,color:"var(--tel)"}}>💰 PRECIO Y ESTADO</div>
        <div className="fgg">
          <div className="fg">
            <label className="lb">Precio Total (Bs.) * <span style={{color:"var(--gold)"}}>— editable</span></label>
            <input className="inp" type="number" placeholder="0.00" value={f.price} onChange={e=>setF({...f,price:e.target.value})}
              style={{fontSize:18,fontWeight:700,color:"var(--gold)",fontFamily:"var(--fm)"}}/>
          </div>
          <div className="fg"><label className="lb">Adelanto (Bs.)</label><input className="inp" type="number" placeholder="0" value={f.advance} onChange={e=>setF({...f,advance:e.target.value})}/></div>
          <div className="fg"><label className="lb">Estado</label><select className="sel" value={f.status} onChange={e=>setF({...f,status:e.target.value})}>{Object.keys(STATUS_CFG).map(s=><option key={s}>{s}</option>)}</select></div>
          {saldo!==null&&saldo>0&&<div className="fg"><div className="lb">Saldo Pendiente</div><div className="al ao" style={{marginBottom:0}}><strong>{fmtMoney(saldo)}</strong></div></div>}
        </div>
        <div className="fg"><label className="lb">Notas</label><input className="inp" type="text" placeholder="Indicaciones especiales..." value={f.notas} onChange={e=>setF({...f,notas:e.target.value})}/></div>
        </>);
      })()}

      {step===2 && (<>
        <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",gap:14,flexWrap:"wrap",fontSize:11}}>
          <div><strong>{f.place}</strong></div>
          <div className="mono">{fmtDate(f.date)}</div>
          <div className="mono gld">{fmtMoney(parseFloat(f.price)||0)}</div>
        </div>

        <details open style={{marginBottom:10,background:"var(--bg3)",borderRadius:10,border:"1px solid var(--border)",overflow:"hidden"}}>
          <summary style={{cursor:"pointer",fontFamily:"var(--fd)",fontSize:13,letterSpacing:1,padding:"12px 14px",listStyle:"none",background:"rgba(0,0,0,.2)"}}>👥 LISTA DE ASISTENCIA</summary>
          <div style={{padding:"10px 14px"}}>
            <div style={{marginBottom:12}}>
              <div className="lb" style={{color:"var(--gold)",marginBottom:6}}>⭐ SOCIOS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:5}}>
                {SOCIOS.map(m=>{
                  const isP=presentes.includes(m.code), isA=ausentes.includes(m.code), isL=tarde.includes(m.code);
                  const mc=MEMBER_COLOR.socio;
                  return (
                    <div key={m.code} style={{borderRadius:9,border:`2px solid ${isP?"var(--grn)":isA?"var(--acc)":"var(--border)"}`,background:isP?"rgba(24,184,78,.09)":"var(--bg3)",padding:"9px 10px",cursor:"pointer",position:"relative"}}
                      onClick={()=>{if(isP){setPresentes(a=>a.filter(c=>c!==m.code));setAusentes(a=>[...a,m.code]);}else{setPresentes(a=>[...a,m.code]);setAusentes(a=>a.filter(c=>c!==m.code));}}}>
                      <div style={{position:"absolute",top:7,right:8,fontSize:13}}>{isP?"✅":isA?"❌":"⬜"}</div>
                      <div style={{display:"inline-block",background:mc.bg,color:mc.color,border:`1px solid ${mc.border}`,borderRadius:5,padding:"2px 7px",fontFamily:"var(--fm)",fontSize:10,fontWeight:700,marginBottom:5}}>{m.code}</div>
                      <div style={{fontSize:12,fontWeight:700,lineHeight:1.3}}>{m.name}</div>
                      <div style={{fontSize:9,color:"var(--txt2)",marginTop:1}}>{m.role}</div>
                      {isL&&<div style={{fontSize:9,color:"var(--gold)",fontWeight:700,marginTop:3}}>⏰ Llegó tarde</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="lb" style={{color:"var(--tel)",marginBottom:6}}>🔵 TRABAJADORES</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:5}}>
                {TRABAJADORES.map(m=>{
                  const isP=trabajadores.includes(m.code);
                  const mc=MEMBER_COLOR.trabajador;
                  return (
                    <div key={m.code} style={{borderRadius:9,border:`2px solid ${isP?"var(--tel)":"var(--border)"}`,background:isP?"rgba(0,184,204,.08)":"var(--bg3)",padding:"9px 10px",cursor:"pointer",position:"relative"}}
                      onClick={()=>{if(isP)setTrab(a=>a.filter(c=>c!==m.code));else setTrab(a=>[...a,m.code]);}}>
                      <div style={{position:"absolute",top:7,right:8,fontSize:13}}>{isP?"✅":"⬜"}</div>
                      <div style={{display:"inline-block",background:mc.bg,color:mc.color,border:`1px solid ${mc.border}`,borderRadius:5,padding:"2px 7px",fontFamily:"var(--fm)",fontSize:10,fontWeight:700,marginBottom:5}}>{m.code}</div>
                      <div style={{fontSize:12,fontWeight:700,lineHeight:1.3}}>{m.name}</div>
                      <div style={{fontSize:9,color:"var(--txt2)",marginTop:1}}>{m.role}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </details>

        <details open style={{marginBottom:10,background:"var(--bg3)",borderRadius:10,border:"1px solid rgba(232,41,74,.25)",overflow:"hidden"}}>
          <summary style={{cursor:"pointer",fontFamily:"var(--fd)",fontSize:13,letterSpacing:1,padding:"12px 14px",listStyle:"none",background:"rgba(232,41,74,.06)"}}>⚠️ MULTAS</summary>
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginBottom:8}}>
              <div className="fg" style={{marginBottom:0}}><label className="lb">Músico</label>
                <select className="sel" value={multaM.memberCode} onChange={e=>setMultaM({...multaM,memberCode:e.target.value})}>
                  <option value="">Seleccionar</option>
                  {ALL_MEMBERS.map(m=><option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}
                </select>
              </div>
              <div className="fg" style={{marginBottom:0}}><label className="lb">Tipo</label>
                <select className="sel" value={multaM.type} onChange={e=>{const c=MULTAS_CAT.find(x=>x.id===e.target.value);setMultaM({...multaM,type:e.target.value,amount:c?.monto||""});}}>
                  {MULTAS_CAT.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div className="fg" style={{marginBottom:0}}><label className="lb">Monto</label><input className="inp" type="number" value={multaM.amount} onChange={e=>setMultaM({...multaM,amount:e.target.value})}/></div>
            </div>
            <button className="btn bp bsm" style={{width:"100%"}} onClick={addMultaLocal}>⚠️ APLICAR MULTA</button>
            {localMultas.map((m,i)=>{
              const cat=MULTAS_CAT.find(c=>c.id===m.type);const mem=getMember(m.memberCode);
              return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:12}}>
                <span>{cat?.icon}</span><div style={{flex:1}}><strong>{mem?.name}</strong> — {cat?.label}</div>
                <span style={{color:"var(--acc)",fontFamily:"var(--fm)",fontWeight:700}}>{fmtMoney(m.amount)}</span>
              </div>;
            })}
          </div>
        </details>
      </>)}
    </Modal>
  );
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function AgendaPage({ shows, onAddShow, onUpdateShow, onDeleteShow, multas, onAddMulta }) {
  const todayStr = today();
  const [view, setView]       = useState("week");
  const [weekRef, setWeekRef] = useState(todayStr);
  const [selDay, setSelDay]   = useState(todayStr);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [editDate, setEditDate] = useState(todayStr);

  const weekDays = getWeekDays(weekRef);
  const showsOnDay = (d) => shows.filter(s=>s.date===d);

  const buildOccupied = (date, excludeId=null) => {
    const occ = {};
    shows.filter(s=>s.date===date&&s.id!==excludeId).forEach(s=>{
      const startH = parseInt(s.timeStart?.split(":")[0]||20);
      for(let i=0;i<(s.hours||1);i++){
        const slot = String(startH+i).padStart(2,"0")+":00";
        occ[slot] = s;
      }
    });
    return occ;
  };

  const openAdd = (date=selDay) => { setEditing(null); setEditDate(date); setModal(true); };
  const openEdit = (s) => { setEditing(s); setEditDate(s.date); setModal(true); };
  const handleSave = (data) => {
    if(editing) onUpdateShow({...editing,...data});
    else onAddShow({...data, presentes:[], trabajadores:[], reemplazos:[], ausentes:[], tarde:[], paymentMethod:null});
    setModal(false);
  };

  const ws = new Date(weekDays[0]+"T12:00:00"), we = new Date(weekDays[6]+"T12:00:00");
  const wkLabel = `${ws.getDate()} ${MONTHS_SH[ws.getMonth()]} — ${we.getDate()} ${MONTHS_SH[we.getMonth()]} ${we.getFullYear()}`;

  const occupiedSlots = {};
  showsOnDay(selDay).forEach(s=>{
    const startH = parseInt(s.timeStart?.split(":")[0]||20);
    for(let i=0;i<(s.hours||1);i++){ const slot = String(startH+i).padStart(2,"0")+":00"; occupiedSlots[slot] = s; }
  });

  return (
    <div>
      <div className="sh">
        <div><div className="stit">📅 AGENDA</div><div className="ssub">Programación de shows</div></div>
        <button className="btn bp" onClick={()=>openAdd()}>+ Nuevo Show</button>
      </div>
      <div className="tabs">
        <button className={`tab ${view==="week"?"on":""}`} onClick={()=>setView("week")}>Semanal</button>
        <button className={`tab ${view==="day"?"on":""}`} onClick={()=>setView("day")}>Diario</button>
        <button className={`tab ${view==="list"?"on":""}`} onClick={()=>setView("list")}>Lista</button>
      </div>

      {view==="week" && (
        <div className="wk-wrap">
          <div className="wk-nav">
            <button className="btn bs bsm" onClick={()=>setWeekRef(addDays(weekRef,-7))}>◀ Anterior</button>
            <div style={{textAlign:"center"}}>
              <div style={{fontFamily:"var(--fd)",fontSize:17,letterSpacing:1.5}}>{wkLabel}</div>
              <div style={{fontSize:9,color:"var(--txt2)",marginTop:2}}>{weekDays.reduce((t,d)=>t+showsOnDay(d).length,0)} shows esta semana</div>
            </div>
            <button className="btn bs bsm" onClick={()=>setWeekRef(addDays(weekRef,7))}>Siguiente ▶</button>
          </div>
          <div className="wk-big">
            {weekDays.map(d=>{
              const ds=showsOnDay(d), isT=d===todayStr;
              const wd2=new Date(d+"T12:00:00");
              return (
                <div key={d} className={`wk-big-col ${isT?"tod":""}`}>
                  <div className="wk-big-hdr" onClick={()=>{setSelDay(d);setView("day");}}>
                    <div className="wk-big-dn">{DAYS_ES[wd2.getDay()]}</div>
                    <div className="wk-big-dd" style={{color:isT?"var(--acc)":"var(--txt)"}}>{wd2.getDate()}</div>
                    <div className="wk-big-mes">{MONTHS_SH[wd2.getMonth()]}</div>
                    {isT && <div className="wk-big-today-pip"/>}
                  </div>
                  <div className="wk-big-body">
                    {ds.length===0
                      ? <div className="wk-big-free" onClick={()=>{setSelDay(d);setView("day");}}><span style={{fontSize:22}}>📅</span><div className="wk-big-libre">Libre</div></div>
                      : ds.map(s=>{
                          const sc=STATUS_CFG[s.status]||STATUS_CFG.Disponible;
                          const endH=s.timeStart&&s.hours?String(parseInt(s.timeStart.split(":")[0])+(s.hours||0)).padStart(2,"0")+":00":"";
                          return (
                            <div key={s.id} className="wk-big-event" style={{background:sc.bg,color:sc.color,borderColor:sc.color+"50"}} onClick={e=>{e.stopPropagation();openEdit(s);}}>
                              <div className="wk-big-event-time">🕐 {s.timeStart}{endH?" → "+endH:""}</div>
                              <div className="wk-big-event-place">{s.place}</div>
                              {s.tipoEvento && <div className="wk-big-event-tipo">{s.tipoEvento}</div>}
                              <div className="wk-big-event-price">{fmtMoney(s.price)}</div>
                              {s.hours && <div className="wk-big-event-dur">{s.hours}h</div>}
                            </div>
                          );
                        })
                    }
                  </div>
                  <button className="wk-big-add" onClick={e=>{e.stopPropagation();openAdd(d);}}>+ Agregar Show</button>
                </div>
              );
            })}
          </div>
          <div className="wk-legend">
            {Object.entries(STATUS_CFG).map(([k,v])=>(
              <span key={k} className="fc g5" style={{color:v.color,fontSize:10}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:v.color,display:"inline-block",flexShrink:0}}/>{k}
              </span>
            ))}
          </div>
        </div>
      )}

      {view==="day" && (
        <div>
          <div className="fc g8 mb12">
            <button className="bico" onClick={()=>setSelDay(addDays(selDay,-1))}>◀</button>
            <span style={{fontFamily:"var(--fd)",fontSize:15,flex:1,textAlign:"center"}}>{selDay}</span>
            <button className="bico" onClick={()=>setSelDay(addDays(selDay,1))}>▶</button>
          </div>
          {showsOnDay(selDay).length===0
            ? <div className="al ao">✅ Día libre</div>
            : showsOnDay(selDay).map(s=>(
                <div key={s.id} className="show-card-big" style={{borderColor:STATUS_CFG[s.status]?.color+"55",borderLeftWidth:4}}>
                  <div className="fb mb8">
                    <div><div className="bold" style={{fontSize:16}}>{s.place}</div>{s.cliente && <div style={{fontSize:12,color:"var(--gold)"}}>👤 {s.cliente} — {s.tipoEvento}</div>}</div>
                    <div className="fc g8"><StatusBadge status={s.status}/><button className="bico" onClick={()=>openEdit(s)}>✏️</button><button className="bico" style={{color:"var(--acc)"}} onClick={()=>onDeleteShow(s.id)}>🗑️</button></div>
                  </div>
                  <div className="fc g12 fw" style={{fontSize:12}}>
                    <span>🕐 {s.timeStart}</span><span className="tel bold">{s.hours}h</span>
                    <span className="gld mono bold">{fmtMoney(s.price)}</span>
                  </div>
                </div>
              ))
          }
          <div className="card" style={{marginTop:10}}>
            <div className="ct">🕐 Disponibilidad</div>
            {ALL_HOURS.map(h=>{
              const occ = occupiedSlots[h];
              return (
                <div key={h} className={`dslot ${occ?"occ":""}`}>
                  <span className="dst">{h}</span>
                  {occ ? <span className="dsc" style={{color:"var(--pur)"}}>🎸 {occ.timeStart===h?occ.place:"(cont.)"}</span>
                       : <><span className="dsc">— disponible —</span><button className="bico" style={{fontSize:9,padding:"2px 6px"}} onClick={()=>openAdd(selDay)}>+</button></>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view==="list" && (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div className="tw">
            <table>
              <thead><tr><th>Fecha</th><th>Inicio</th><th>H</th><th>Cliente</th><th>Lugar</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {shows.length===0 && <tr><td colSpan={8}><div className="empty"><div className="ei">🎸</div>Sin shows</div></td></tr>}
                {[...shows].sort((a,b)=>a.date.localeCompare(b.date)).map(s=>(
                  <tr key={s.id}>
                    <td className="mono">{fmtDate(s.date)}</td>
                    <td className="mono">{s.timeStart}</td>
                    <td><span className="tel mono bold">{s.hours}h</span></td>
                    <td style={{fontSize:11}}>{s.cliente||"—"}</td>
                    <td className="bold" style={{fontSize:12}}>{s.place}</td>
                    <td className="gld mono bold">{fmtMoney(s.price)}</td>
                    <td><StatusBadge status={s.status}/></td>
                    <td><button className="bico" onClick={()=>openEdit(s)}>✏️</button></td>
                    <td><button className="bico" style={{color:"var(--acc)"}} onClick={()=>onDeleteShow(s.id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <ShowFormModal show={editing} occupiedHours={buildOccupied(editDate, editing?.id)}
          onSave={handleSave} onClose={()=>setModal(false)} multas={multas} onAddMulta={onAddMulta}
          allShows={shows}
          startStep={editing?._startStep||1}/>
      )}
    </div>
  );
}

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
function RegistroPage({ shows, multas, onRegisterShow, onAddMulta, onUpdateShow, onDeleteShow, paquetes, onUpdatePaquetes }) {
  const [step, setStep]         = useState(1);
  const [paqueteId, setPaqId]   = useState("manual");
  const [selDateHours, setSDH]  = useState(false); // muestra panel de horas
  const [form, setForm] = useState({
    showId:"", date:today(), place:"", price:"", advance:"", paymentMethod:"Efectivo",
    presentesSocios:SOCIOS.map(m=>m.code), presentesTrabajadores:TRABAJADORES.map(m=>m.code),
    reemplazos:[], ausentes:[], tarde:[]
  });
  const [multaForm, setMultaForm] = useState({memberCode:"", type:"retraso", amount:"", note:""});
  const [resultado, setResultado] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear]   = useState(new Date().getFullYear());

  const pendingShows = shows.filter(s=>s.status!=="Realizado").sort((a,b)=>a.date.localeCompare(b.date));
  const showMultas   = multas.filter(m=>form.showId?m.showId===form.showId:m.date===form.date);
  const totalPresentes = form.presentesSocios.length + form.presentesTrabajadores.length + form.reemplazos.length;

  // Shows del día seleccionado → para panel de horas
  const showsOnSelDate = shows.filter(s=>s.date===form.date);
  const busyHours = {};
  showsOnSelDate.forEach(s=>{
    const startH=parseInt(s.timeStart?.split(":")[0]||20);
    for(let i=0;i<(s.hours||1);i++){
      const slot=String(startH+i).padStart(2,"0")+":00";
      busyHours[slot]=s;
    }
  });

  const calDays = (() => {
    const firstDay=new Date(calYear,calMonth,1).getDay();
    const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
    const cells=[];
    for(let i=0;i<firstDay;i++) cells.push(null);
    for(let d=1;d<=daysInMonth;d++) cells.push(d);
    return cells;
  })();

  // Todos los shows por día (todos los estados)
  const calShowsByDay={};
  shows.forEach(s=>{
    const d=parseInt(s.date.slice(8,10)),m2=parseInt(s.date.slice(5,7))-1,y=parseInt(s.date.slice(0,4));
    if(y===calYear&&m2===calMonth){ if(!calShowsByDay[d])calShowsByDay[d]=[]; calShowsByDay[d].push(s); }
  });

  const selectShow=(id)=>{
    const s=shows.find(x=>x.id===id);
    if(s){
      setForm({...form,showId:id,date:s.date,place:s.place,price:s.price,advance:s.advance||"",
        presentesSocios:s.presentes?.length?s.presentes:SOCIOS.map(m=>m.code),
        presentesTrabajadores:s.trabajadores?.length?s.trabajadores:TRABAJADORES.map(m=>m.code),
        reemplazos:s.reemplazos||[],ausentes:s.ausentes||[],tarde:s.tarde||[]});
      // Auto-detect paquete
      const paq=PAQUETES_DEFAULT.find(p=>p.precio===s.price&&p.id!=="manual");
      setPaqId(paq?paq.id:"manual");
    }
  };

  const applyPaquete=(p)=>{
    setPaqId(p.id);
    if(p.id!=="manual"){
      setForm(f=>({...f,
        price:p.precio>0?String(p.precio):f.price,
      }));
    }
  };

  const addMultaLocal=()=>{
    if(!multaForm.memberCode||!multaForm.amount)return alert("Selecciona músico y monto");
    onAddMulta({...multaForm,showId:form.showId,date:form.date,amount:parseFloat(multaForm.amount)});
    setMultaForm({memberCode:"",type:"retraso",amount:"",note:""});
  };

  const registrar=()=>{
    if(!form.date)return alert("Selecciona una fecha");
    if(!form.place&&!form.showId)return alert("Selecciona un show de la agenda o ingresa el lugar");
    if(!form.price||parseFloat(form.price)<=0)return alert("Ingresa el precio del show");
    const realPlace=form.place||(shows.find(s=>s.id===form.showId)?.place)||"";
    const res=onRegisterShow({...form,place:realPlace},showMultas);
    setResultado(res);
    setStep(3);
  };

  if(step===3&&resultado) return (
    <div>
      <div className="sh"><div><div className="stit">✅ SHOW REGISTRADO</div></div></div>
      <div style={{background:"linear-gradient(135deg,rgba(24,184,78,.12),rgba(0,184,204,.08))",border:"1px solid rgba(24,184,78,.25)",borderRadius:14,padding:"24px 20px",marginBottom:12,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:8}}>🎉</div>
        <div style={{fontFamily:"var(--fd)",fontSize:28,letterSpacing:2,color:"var(--grn)"}}>¡SHOW REGISTRADO!</div>
        <div style={{fontSize:12,color:"var(--txt2)"}}>{fmtDate(form.date)} · {form.place}</div>
        <div style={{fontSize:11,color:"var(--tel)",marginTop:4}}>💳 Ingresado automáticamente a Cuenta Principal</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
        {[["💰 Total cobrado",fmtMoney(resultado.totalShow),"var(--gold)"],
          ["👥 Músicos presentes",resultado.totalPresentes,"var(--grn)"],
          ["⚠️ Multas → Caja Chica",fmtMoney(resultado.multasTotal),"var(--acc)"]].map(([l,v,c])=>(
          <div key={l} style={{background:"var(--card)",border:`1px solid ${c}33`,borderRadius:12,padding:14,textAlign:"center"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:22,color:c}}>{v}</div>
            <div style={{fontSize:9,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:.8,marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>
      <button className="btn bp" style={{width:"100%",justifyContent:"center"}} onClick={()=>{setStep(1);setResultado(null);setPaqId("manual");setForm({showId:"",date:today(),place:"",price:"",advance:"",paymentMethod:"Efectivo",presentesSocios:SOCIOS.map(m=>m.code),presentesTrabajadores:TRABAJADORES.map(m=>m.code),reemplazos:[],ausentes:[],tarde:[]});}}>
        + Registrar Otro Show
      </button>
    </div>
  );

  return (
    <div>
      <div className="sh">
        <div><div className="stit">🎤 REGISTRO</div><div className="ssub">Shows tocados · asistencia · multas</div></div>
      </div>

      <div className="reg-stepper">
        {[{n:1,lbl:"Show & Paquete"},{n:2,lbl:"Asistencia"},{n:3,lbl:"Finalizado"}].map(st=>{
          const cls=step===st.n?"active":step>st.n?"done":"locked";
          return (
            <div key={st.n} className={`reg-step ${cls}`} onClick={()=>cls!=="locked"&&setStep(st.n)}>
              <div className="reg-step-num">{cls==="done"?"✓":st.n}</div>
              <div className="reg-step-lbl">{st.lbl}</div>
            </div>
          );
        })}
      </div>

      {step===1 && (
        <div>
          {/* ─── KPIs ─── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
            {[
              [shows.filter(s=>s.status==="Realizado").length,"Realizados","var(--pur)"],
              [pendingShows.length,"Pendientes","var(--gold)"],
              [shows.filter(s=>s.date.startsWith(form.date.slice(0,7))).length,"Este mes","var(--blu)"]
            ].map(([v,l,c])=>(
              <div key={l} style={{background:"var(--card)",border:`1px solid ${c}33`,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontFamily:"var(--fd)",fontSize:28,color:c}}>{v}</div>
                <div style={{fontSize:9,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:.8,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>

          <div className="reg-main-grid">
            {/* ─── CALENDARIIO ─── */}
            <div>
              <div className="card">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <button className="bico" onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}}>◀</button>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontFamily:"var(--fd)",fontSize:18,letterSpacing:2}}>{MONTHS_ES[calMonth]}</div>
                    <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--txt2)"}}>{calYear}</div>
                  </div>
                  <button className="bico" onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}}>▶</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:4}}>
                  {["D","L","M","X","J","V","S"].map(d=><div key={d} style={{textAlign:"center",fontSize:8,color:"var(--txt2)",fontWeight:700,padding:"3px 0"}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                  {calDays.map((d,i)=>{
                    if(!d) return <div key={i}/>;
                    const dateStr=`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                    const ds=calShowsByDay[d]||[];
                    const isToday=dateStr===today(), isSel=form.date===dateStr;
                    const topSC=ds[0]?STATUS_CFG[ds[0].status]||STATUS_CFG.Disponible:null;
                    return (
                      <div key={i} onClick={()=>{setForm(f=>({...f,date:dateStr,showId:""}));setSDH(true);}}
                        style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                          borderRadius:7,border:`1.5px solid ${isSel?"var(--acc)":ds.length?topSC.color+"88":isToday?"rgba(255,191,0,.6)":"var(--border)"}`,
                          background:isSel?"rgba(232,41,74,.22)":ds.length?topSC.bg:"transparent",
                          cursor:"pointer",fontSize:11,fontWeight:isSel||ds.length?700:400,
                          color:isSel?"#fff":ds.length?topSC.color:isToday?"var(--gold)":"var(--txt)"}}>
                        {d}
                        {ds.length>0&&<div style={{fontSize:7,fontWeight:900,lineHeight:1,marginTop:1}}>{ds.length}</div>}
                      </div>
                    );
                  })}
                </div>
                {/* Leyenda de colores */}
                <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
                  {Object.entries(STATUS_CFG).map(([k,v])=>(
                    <span key={k} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:v.color}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:v.color,display:"inline-block"}}/>
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* ─── PANEL HORAS DEL DÍA ─── */}
              {selDateHours && (
                <div className="card" style={{marginTop:0}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{fontFamily:"var(--fd)",fontSize:13,letterSpacing:1}}>
                      🕐 {fmtDate(form.date)}
                    </div>
                    <button className="bico" onClick={()=>setSDH(false)}>✕</button>
                  </div>
                  {showsOnSelDate.length>0&&(
                    <div style={{marginBottom:8}}>
                      {showsOnSelDate.map(s=>{
                        const sc=STATUS_CFG[s.status]||STATUS_CFG.Disponible;
                        return (
                          <div key={s.id} style={{background:sc.bg,border:`1px solid ${sc.color}55`,borderRadius:8,padding:"7px 10px",marginBottom:5,fontSize:11,cursor:"pointer"}}
                            onClick={()=>selectShow(s.id)}>
                            <div style={{fontWeight:700,color:sc.color}}>{s.timeStart} — {s.place}</div>
                            <div style={{color:"var(--txt2)",fontSize:10}}>{s.tipoEvento} · {s.hours}h · {fmtMoney(s.price)}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div style={{fontSize:9,color:"var(--txt2)",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Horario del día:</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:3}}>
                    {["18:00","19:00","20:00","21:00","22:00","23:00","00:00","01:00"].map(h=>{
                      const occ=busyHours[h];
                      const sc=occ?STATUS_CFG[occ.status]||STATUS_CFG.Disponible:null;
                      return (
                        <div key={h} style={{borderRadius:6,padding:"5px 4px",textAlign:"center",fontSize:9,fontWeight:700,
                          border:`1px solid ${occ?sc.color+"66":"var(--border)"}`,
                          background:occ?sc.bg:"var(--bg3)",color:occ?sc.color:"var(--txt2)"}}>
                          {h}
                          {occ&&<div style={{fontSize:7,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}>{occ.place.slice(0,10)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ─── COLUMNA DERECHA ─── */}
            <div>
              {/* Shows sincronizados */}
              <div className="card" style={{marginBottom:10}}>
                <div className="ct">🎫 SHOWS EN AGENDA</div>
                {pendingShows.length===0
                  ? <div style={{textAlign:"center",padding:"20px 0",color:"var(--txt2)"}}>
                      <div style={{fontSize:36,marginBottom:8}}>🎵</div>
                      <div style={{fontFamily:"var(--fd)",fontSize:14,letterSpacing:1}}>SIN SHOWS PENDIENTES</div>
                    </div>
                  : pendingShows.map(s=>{
                    const isSel=form.showId===s.id;
                    const sc=STATUS_CFG[s.status]||STATUS_CFG.Disponible;
                    const dn=new Date(s.date+"T12:00:00");
                    const dDiff=Math.ceil((new Date(s.date+"T12:00:00")-new Date())/86400000);
                    return (
                      <div key={s.id} className={`date-card ${isSel?"active":""}`} onClick={()=>selectShow(isSel?"":s.id)}>
                        <div className="date-card-ticket">
                          <div className="date-card-left" style={{background:sc.bg}}>
                            <div className="date-card-day-big" style={{color:sc.color}}>{dn.getDate()}</div>
                            <div className="date-card-mon-big">{MONTHS_SH[dn.getMonth()]}</div>
                          </div>
                          <div className="date-card-right">
                            <div className="date-card-place">{s.place}</div>
                            {s.cliente&&<div className="date-card-client">👤 {s.cliente}</div>}
                            <div className="date-card-meta">
                              {s.tipoEvento&&<span>{s.tipoEvento}</span>}
                              <StatusBadge status={s.status}/>
                              {s.hours&&<span className="hrs-badge">{s.hours}h</span>}
                            </div>
                          </div>
                          <div className="date-card-price-tag">
                            <div>{fmtMoney(s.price)}</div>
                            <div style={{fontSize:9,color:dDiff<=0?"var(--acc)":dDiff<=3?"var(--gold)":"var(--txt2)",fontWeight:700,fontFamily:"var(--fm)"}}>
                              {dDiff<0?"PASADO":dDiff===0?"HOY":dDiff===1?"MAÑANA":`${dDiff}d`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* ─── PAQUETES ─── */}
              <div className="card">
                <div className="ct">🎶 TIPO DE SHOW / PAQUETE</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:6,marginBottom:12}}>
                  {PAQUETES_DEFAULT.map(p=>{
                    const sel=paqueteId===p.id;
                    return (
                      <div key={p.id} onClick={()=>applyPaquete(p)}
                        style={{borderRadius:10,border:`2px solid ${sel?"var(--gold)":"var(--border)"}`,
                          background:sel?"rgba(255,191,0,.09)":"var(--bg3)",
                          padding:"10px 8px",cursor:"pointer",transition:"all .15s",
                          textAlign:"center",position:"relative",overflow:"hidden"}}>
                        {sel&&<div style={{position:"absolute",top:4,right:5,fontSize:10}}>✅</div>}
                        <div style={{fontSize:20,marginBottom:3}}>{p.icon}</div>
                        <div style={{fontWeight:700,fontSize:9,lineHeight:1.3,color:"var(--txt)",marginBottom:2}}>{p.nombre.replace("PAQUETE ","").replace("PRESENTACIÓN ","")}</div>
                        <div style={{fontSize:7,color:"var(--txt2)",marginBottom:3}}>{p.duracion}</div>
                        {p.precio>0
                          ? <div style={{fontFamily:"var(--fd)",fontSize:14,color:"var(--gold)",letterSpacing:.3}}>Bs.{p.precio.toLocaleString("es-BO")}</div>
                          : <div style={{fontFamily:"var(--fd)",fontSize:12,color:"var(--txt2)"}}>Manual</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Precio / Adelanto editables */}
                <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                  <div style={{fontSize:10,color:"var(--txt2)",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>
                    💰 Precio & Cobro — <span style={{color:"var(--gold)"}}>Editable</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
                    <div className="fg" style={{marginBottom:0}}>
                      <label className="lb">Precio Total (Bs.) *</label>
                      <input className="inp" type="number" placeholder="0.00" value={form.price}
                        onChange={e=>{setForm({...form,price:e.target.value});setPaqId("manual");}}
                        style={{fontFamily:"var(--fm)",fontSize:17,fontWeight:700,color:"var(--gold)"}}/>
                    </div>
                    <div className="fg" style={{marginBottom:0}}>
                      <label className="lb">Adelanto recibido (Bs.)</label>
                      <input className="inp" type="number" placeholder="0" value={form.advance} onChange={e=>setForm({...form,advance:e.target.value})}/>
                    </div>
                    <div className="fg" style={{marginBottom:0}}>
                      <label className="lb">Forma de pago</label>
                      <select className="sel" value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})}>
                        {["Efectivo","QR","Transferencia"].map(m=><option key={m}>{m}</option>)}
                      </select>
                    </div>
                    {form.price&&form.advance&&parseFloat(form.price)-parseFloat(form.advance)>0&&(
                      <div className="fg" style={{marginBottom:0}}>
                        <label className="lb">Saldo pendiente</label>
                        <div className="al ao" style={{marginBottom:0,padding:"7px 10px"}}>
                          <strong>{fmtMoney(parseFloat(form.price)-parseFloat(form.advance))}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lugar (si no viene de agenda) */}
                {!form.showId&&(
                  <div className="fg" style={{marginBottom:10}}>
                    <label className="lb">Lugar del show *</label>
                    <input className="inp" placeholder="Ej: Salón del Country" value={form.place} onChange={e=>setForm({...form,place:e.target.value})}/>
                  </div>
                )}

                <div style={{background:"linear-gradient(135deg,rgba(232,41,74,.1),rgba(139,68,240,.06))",borderRadius:12,border:"1px solid rgba(232,41,74,.22)",padding:14}}>
                  <div style={{fontSize:12,color:"var(--txt2)",marginBottom:10}}>
                    {form.showId
                      ? <span>✅ Show: <strong style={{color:"var(--txt)"}}>{shows.find(s=>s.id===form.showId)?.place}</strong></span>
                      : form.place
                      ? <span>📍 Lugar: <strong style={{color:"var(--txt)"}}>{form.place}</strong></span>
                      : <span style={{color:"var(--gold)"}}>⚠️ Selecciona un show de la agenda o ingresa el lugar</span>}
                  </div>
                  <button className="btn bp" style={{width:"100%",justifyContent:"center",fontSize:13,padding:"13px"}}
                    onClick={()=>{
                      if(!form.date) return alert("Selecciona una fecha");
                      if(!form.place&&!form.showId) return alert("Selecciona un show de la agenda o ingresa el lugar");
                      if(!form.price||parseFloat(form.price)<=0) return alert("Ingresa el precio del show");
                      setStep(2);
                    }}>
                    👥 PASO 2 — LISTA DE ASISTENCIA →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step===2 && (
        <div>
          <div style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",marginBottom:10,display:"flex",gap:12,flexWrap:"wrap",fontSize:11,position:"sticky",top:58,zIndex:50,backdropFilter:"blur(12px)"}}>
            <div><strong>{form.place||"—"}</strong></div>
            <div className="mono">{fmtDate(form.date)}</div>
            <div className="mono gld">{fmtMoney(parseFloat(form.price)||0)}</div>
            <div style={{marginLeft:"auto",display:"flex",gap:6}}>
              <span style={{background:"rgba(24,184,78,.15)",color:"var(--grn)",borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700}}>✅ {form.presentesSocios.length}</span>
              <span style={{background:"rgba(0,184,204,.12)",color:"var(--tel)",borderRadius:99,padding:"2px 8px",fontSize:10,fontWeight:700}}>🔵 {form.presentesTrabajadores.length}</span>
            </div>
          </div>

          <div className="card" style={{marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div className="ct" style={{margin:0,color:"var(--gold)"}}>⭐ SOCIOS (6)</div>
              <div style={{display:"flex",gap:5}}>
                <button className="btn bsm bw" style={{fontSize:9}} onClick={()=>setForm(f=>({...f,presentesSocios:SOCIOS.map(m=>m.code)}))}>Todos ✓</button>
                <button className="btn bsm bs" style={{fontSize:9}} onClick={()=>setForm(f=>({...f,presentesSocios:[]}))}>Todos ✗</button>
              </div>
            </div>
            <div className="asis-grid">
              {SOCIOS.map(m=>{
                const isP=form.presentesSocios.includes(m.code), isA=form.ausentes.includes(m.code), isL=form.tarde.includes(m.code);
                return (
                  <div key={m.code} className={`asis-card ${isP?"presente":isA?"ausente":""}`}
                    onClick={()=>{
                      if(isP){setForm(f=>({...f,presentesSocios:f.presentesSocios.filter(c=>c!==m.code),ausentes:[...f.ausentes,m.code]}));}
                      else{setForm(f=>({...f,presentesSocios:[...f.presentesSocios,m.code],ausentes:f.ausentes.filter(c=>c!==m.code)}));}
                    }}>
                    <div className="asis-ico">{isP?"✅":isA?"❌":"⬜"}</div>
                    <div className="asis-code" style={{color:"var(--gold)"}}>{m.code}</div>
                    <div className="asis-name">{m.name}</div>
                    <div className="asis-role">{m.role}</div>
                    {isL&&<div className="asis-tag" style={{color:"var(--gold)"}}>⏰ Tarde</div>}
                    {isP&&<button className="btn bsm" style={{marginTop:5,fontSize:8,padding:"2px 6px",background:isL?"rgba(255,191,0,.2)":"rgba(255,191,0,.07)",color:"var(--gold)",border:"1px solid rgba(255,191,0,.3)"}}
                      onClick={e=>{e.stopPropagation();setForm(f=>({...f,tarde:isL?f.tarde.filter(c=>c!==m.code):[...f.tarde,m.code]}));}}>
                      ⏰ {isL?"✓ Tarde":"Tarde"}
                    </button>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div className="ct" style={{margin:0,color:"var(--tel)"}}>🔵 TRABAJADORES (3)</div>
              <div style={{display:"flex",gap:5}}>
                <button className="btn bsm" style={{fontSize:9,background:"rgba(0,184,204,.12)",color:"var(--tel)",border:"1px solid rgba(0,184,204,.3)"}} onClick={()=>setForm(f=>({...f,presentesTrabajadores:TRABAJADORES.map(m=>m.code)}))}>Todos ✓</button>
                <button className="btn bsm bs" style={{fontSize:9}} onClick={()=>setForm(f=>({...f,presentesTrabajadores:[]}))}>Todos ✗</button>
              </div>
            </div>
            <div className="asis-grid">
              {TRABAJADORES.map(m=>{
                const isP=form.presentesTrabajadores.includes(m.code);
                return (
                  <div key={m.code} className={`asis-card ${isP?"trabajador-p":""}`}
                    onClick={()=>{if(isP)setForm(f=>({...f,presentesTrabajadores:f.presentesTrabajadores.filter(c=>c!==m.code)}));else setForm(f=>({...f,presentesTrabajadores:[...f.presentesTrabajadores,m.code]}));}}>
                    <div className="asis-ico">{isP?"✅":"⬜"}</div>
                    <div className="asis-code" style={{color:"var(--tel)"}}>{m.code}</div>
                    <div className="asis-name">{m.name}</div>
                    <div className="asis-role">{m.role}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card" style={{marginBottom:8}}>
            <div className="ct" style={{marginBottom:8,color:"var(--pur)"}}>🔄 REEMPLAZOS</div>
            <div className="asis-grid">
              {REEMPLAZOS.map(m=>{
                const isP=form.reemplazos.includes(m.code);
                return (
                  <div key={m.code} className={`asis-card ${isP?"reemplazo-p":""}`} style={{opacity:isP?1:.65}}
                    onClick={()=>setForm(f=>({...f,reemplazos:isP?f.reemplazos.filter(c=>c!==m.code):[...f.reemplazos,m.code]}))}>
                    <div className="asis-ico">{isP?"✅":"⬜"}</div>
                    <div className="asis-code" style={{color:"var(--pur)"}}>{m.code}</div>
                    <div className="asis-name">{m.name}</div>
                    <div className="asis-role">{m.role}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <details open style={{marginBottom:8,background:"var(--bg3)",borderRadius:10,border:"1px solid rgba(232,41,74,.25)",overflow:"hidden"}}>
            <summary style={{cursor:"pointer",fontFamily:"var(--fd)",fontSize:13,letterSpacing:1,padding:"12px 14px",listStyle:"none",background:"rgba(232,41,74,.05)"}}>
              ⚠️ COBRAR MULTAS {showMultas.length>0&&`· ${fmtMoney(showMultas.reduce((s,m)=>s+m.amount,0))}`}
            </summary>
            <div style={{padding:"12px 14px"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:4,marginBottom:12}}>
                {ALL_MEMBERS.map(m=>{
                  const myMults=showMultas.filter(x=>x.memberCode===m.code);
                  const isSel=multaForm.memberCode===m.code;
                  return (
                    <div key={m.code} onClick={()=>setMultaForm(f=>({...f,memberCode:isSel?"":m.code}))}
                      style={{borderRadius:7,border:`1.5px solid ${isSel?"var(--acc)":"var(--border)"}`,background:isSel?"rgba(232,41,74,.1)":"transparent",padding:"7px 9px",cursor:"pointer"}}>
                      <div style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--gold)",fontWeight:700}}>{m.code}</div>
                      <div style={{fontSize:10,fontWeight:700}}>{m.name.split(" ")[0]}</div>
                      {myMults.length>0&&<div style={{fontSize:9,color:"var(--acc)",fontWeight:700}}>⚠️{myMults.length}</div>}
                    </div>
                  );
                })}
              </div>
              {multaForm.memberCode&&(
                <div style={{background:"rgba(232,41,74,.06)",border:"1px solid rgba(232,41,74,.2)",borderRadius:9,padding:12,marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:10,color:"var(--acc)"}}>Multa para: <strong>{getMember(multaForm.memberCode)?.name}</strong></div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginBottom:8}}>
                    <div className="fg" style={{marginBottom:0}}><label className="lb">Tipo</label>
                      <select className="sel" value={multaForm.type} onChange={e=>{const c=MULTAS_CAT.find(x=>x.id===e.target.value);setMultaForm(f=>({...f,type:e.target.value,amount:c?.monto||""}));}}>
                        {MULTAS_CAT.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                      </select>
                    </div>
                    <div className="fg" style={{marginBottom:0}}><label className="lb">Monto</label><input className="inp" type="number" value={multaForm.amount} onChange={e=>setMultaForm(f=>({...f,amount:e.target.value}))}/></div>
                  </div>
                  <button className="btn bp bsm" style={{width:"100%"}} onClick={addMultaLocal}>⚠️ APLICAR MULTA → CAJA CHICA</button>
                </div>
              )}
            </div>
          </details>

          <div className="reg-bottom-bar no-print">
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:700}}>{totalPresentes} músicos</div>
              {form.ausentes.length>0&&<div style={{fontSize:10,color:"var(--acc)"}}>❌ {form.ausentes.length} ausente{form.ausentes.length>1?"s":""}</div>}
            </div>
            <button className="btn bs" onClick={()=>setStep(1)}>← Datos</button>
            <button className="btn bp" style={{minWidth:140,justifyContent:"center"}} onClick={registrar}>✅ Registrar Show</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROL DE PAGOS ─────────────────────────────────────────────────────────────
function RolPagoPage({ payments, shows, multas, onSavePayment, onDeletePayment }) {
  const [vista, setVista] = useState("lista");
  const [wp, setWp]       = useState(null);

  const buildWp = (p) => {
    if (!p) return null;
    const show = safeArr(shows).find(s=>s&&s.id===p.showId)||{};
    let sd = safeArr(p.socioDesglose).filter(Boolean);
    if(sd.length===0) sd=safeArr(p.sociosPresentes).map(code=>{const m=getMember(code)||{};return{code,name:m.name||code,base:"",total:""};});
    let ns = safeArr(p.pagosNoSocios).filter(Boolean);
    if(ns.length===0) ns=safeArr(p.presentesTrabajadores).map(code=>{const m=getMember(code)||{};return{code,name:m.name||code,monto:""}});
    let re = safeArr(p.pagosReemplazos).filter(Boolean);
    let ga = safeArr(p.gastosAdmin).filter(Boolean);
    if(ga.length===0) ga=[{concepto:"",monto:""}];
    const multasTotal=safeArr(multas).filter(m=>m&&m.showId===p.showId).reduce((s,m)=>s+safeNum(m.amount),0);
    return{...p,show,socioDesglose:sd,pagosNoSocios:ns,pagosReemplazos:re,gastosAdmin:ga,multasTotal,totalShow:safeNum(p.totalShow)};
  };

  const openCalc=(p)=>{const built=buildWp(p);if(!built)return;setWp(built);setVista("calc");};

  if(vista==="calc") {
    if(!wp){setVista("lista");return null;}
    const sd=safeArr(wp.socioDesglose), ns=safeArr(wp.pagosNoSocios), re=safeArr(wp.pagosReemplazos), ga=safeArr(wp.gastosAdmin);
    const totalShow=safeNum(wp.totalShow);
    const totalNS=ns.reduce((s,x)=>s+safeNum(x?.monto),0);
    const totalRE=re.reduce((s,x)=>s+safeNum(x?.monto),0);
    const totalGA=ga.reduce((s,g)=>s+safeNum(g?.monto),0);
    const saldo=totalShow-totalNS-totalRE-totalGA;
    const nSocios=sd.length||1;
    const baseCalc=saldo/nSocios;
    const updNS=(code,val)=>setWp(w=>({...w,pagosNoSocios:safeArr(w.pagosNoSocios).map(x=>x&&x.code===code?{...x,monto:val}:x)}));
    const updGA=(i,field,val)=>setWp(w=>{const a=[...safeArr(w.gastosAdmin)];if(a[i])a[i]={...a[i],[field]:val};return{...w,gastosAdmin:a};});
    const updSD=(i,val)=>setWp(w=>{
      const arr=[...safeArr(w.socioDesglose)];if(!arr[i])return w;
      const myM=safeArr(multas).filter(m=>m&&m.showId===w.showId&&m.memberCode===arr[i].code).reduce((t,m)=>t+safeNum(m.amount),0);
      arr[i]={...arr[i],base:val,total:String((safeNum(val)-myM).toFixed(2))};
      return{...w,socioDesglose:arr};
    });
    const applyAll=()=>setWp(w=>({...w,socioDesglose:safeArr(w.socioDesglose).map(s=>{
      if(!s)return s;
      const myM=safeArr(multas).filter(m=>m&&m.showId===w.showId&&m.memberCode===s.code).reduce((t,m)=>t+safeNum(m.amount),0);
      return{...s,base:baseCalc.toFixed(2),total:(baseCalc-myM).toFixed(2)};
    })}));
    const guardar=()=>{onSavePayment({...wp,socioDesglose:sd,pagosNoSocios:ns,pagosReemplazos:re,gastosAdmin:ga,saldoParaSocios:saldo,porSocioBase:baseCalc});setVista("lista");};
    return (
      <div>
        <div className="sh">
          <div><div className="stit">💵 CALCULAR PAGO</div><div className="ssub">{safeStr(wp.show?.place)||"Show"} · {fmtDate(safeStr(wp.date))}</div></div>
          <button className="btn bs" onClick={()=>setVista("lista")}>← Volver</button>
        </div>
        <div className="sg">
          <div className="st"><div className="sv gld">{fmtMoney(totalShow)}</div><div className="sl">Total Show</div></div>
          <div className="st"><div className="sv tel">{fmtMoney(totalNS+totalRE)}</div><div className="sl">Personal</div></div>
          <div className="st"><div className="sv acc">{fmtMoney(totalGA)}</div><div className="sl">Gastos</div></div>
          <div className="st"><div className="sv grn">{fmtMoney(saldo)}</div><div className="sl">→ Socios</div></div>
          <div className="st"><div className="sv" style={{color:"var(--rose)"}}>{fmtMoney(baseCalc)}</div><div className="sl">Base/Socio</div></div>
        </div>
        <div className="g2">
          <div>
            <div className="card">
              <div className="ct">🔵 Trabajadores</div>
              {ns.map(x=>!x?null:(
                <div key={x.code} className="row">
                  <div style={{flex:1}}><div className="bold" style={{fontSize:12}}>{x.name}</div><div className="mut" style={{fontSize:10}}>{x.code}</div></div>
                  <input className="inp" type="number" placeholder="0" style={{width:95,textAlign:"right"}} value={x.monto} onChange={e=>updNS(x.code,e.target.value)}/>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="ct">📋 Gastos Administrativos</div>
              {ga.map((g,i)=>!g?null:(<div key={i} className="fc g8 mb8"><input className="inp" type="text" placeholder="Concepto…" style={{flex:2}} value={g.concepto} onChange={e=>updGA(i,"concepto",e.target.value)}/><input className="inp" type="number" placeholder="Bs." style={{width:85,textAlign:"right"}} value={g.monto} onChange={e=>updGA(i,"monto",e.target.value)}/></div>))}
              <button className="btn bs bsm" onClick={()=>setWp(w=>({...w,gastosAdmin:[...safeArr(w.gastosAdmin),{concepto:"",monto:""}]}))}>+ Agregar</button>
            </div>
            <div className="card">
              <div className="ct">⭐ Socios</div>
              <div className="al ao mb8" style={{fontSize:11}}>Saldo: <strong>{fmtMoney(saldo)}</strong> ÷ {nSocios} = <strong>{fmtMoney(baseCalc)}</strong> c/u</div>
              <button className="btn bg2 bsm mb8" onClick={applyAll}>↙ Aplicar base a todos</button>
              {sd.map((s,i)=>{if(!s)return null;
                const myM=safeArr(multas).filter(m=>m&&m.showId===wp.showId&&m.memberCode===s.code).reduce((t,m)=>t+safeNum(m.amount),0);
                const baseV=safeNum(s.base)||baseCalc; const totV=baseV-myM;
                return (<div key={s.code||i} className="row" style={{flexWrap:"wrap",gap:8}}>
                  <div style={{flex:1,minWidth:110}}>
                    <div className="bold" style={{fontSize:12}}>{s.name||s.code}</div>
                    {myM>0&&<div style={{fontSize:10,color:"var(--acc)"}}>⚠️ Multa: -{fmtMoney(myM)}</div>}
                  </div>
                  <div className="fc g8">
                    <div><div className="lb">Base Bs.</div><input className="inp" type="number" style={{width:85}} value={s.base} onChange={e=>updSD(i,e.target.value)}/></div>
                    <div style={{textAlign:"right",minWidth:70}}><div className="lb">Total</div><div className="grn mono bold" style={{fontSize:15}}>{fmtMoney(totV)}</div></div>
                  </div>
                </div>);
              })}
            </div>
          </div>
          <div>
            <div className="card"><div className="ct">🔢 Calculadora</div><MiniCalc/></div>
            <div className="card">
              <div className="ct">✅ Verificación</div>
              {[["Total cobrado",fmtMoney(totalShow),"gld"],["− Personal","−"+fmtMoney(totalNS+totalRE),"tel"],["− Gastos","−"+fmtMoney(totalGA),"acc"],["= Socios",fmtMoney(saldo),"grn"]].map(([l,v,c])=>(
                <div key={l} className="fb" style={{padding:"6px 0",borderBottom:"1px solid var(--border)",fontSize:12}}><span className="mut">{l}</span><span className={`${c} mono bold`}>{v}</span></div>
              ))}
              <button className="btn bp mt12" style={{width:"100%"}} onClick={guardar}>💾 Guardar Cálculo</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allSorted=[...safeArr(payments)].filter(Boolean).sort((a,b)=>safeStr(b.date).localeCompare(safeStr(a.date)));
  return (
    <div>
      <div className="sh"><div><div className="stit">💵 ROL DE PAGOS</div><div className="ssub">Cálculo por show</div></div></div>
      {allSorted.length===0
        ? <div className="card"><div className="empty"><div className="ei">💸</div>Sin shows registrados aún.</div></div>
        : allSorted.map(p=>{
            if(!p)return null;
            const show=safeArr(shows).find(s=>s&&s.id===p.showId)||{};
            const sdArr=safeArr(p.socioDesglose).filter(Boolean);
            const nsArr=safeArr(p.pagosNoSocios).filter(x=>x&&safeNum(x.monto)>0);
            const saved=(p.porSocioBase!=null)||sdArr.some(s=>s&&(s.base||s.total));
            const sc=STATUS_CFG[show.status]||STATUS_CFG.Disponible;
            return (
              <div key={p.id} className="card" style={{borderLeftWidth:3,borderLeftColor:sc.color}}>
                <div className="fb">
                  <div style={{flex:1,minWidth:0}}>
                    <div className="bold" style={{fontSize:14}}>{safeStr(show.place)||"Show"}</div>
                    <div className="mut" style={{fontSize:11}}>{fmtDate(safeStr(p.date))}{show.cliente&&` · 👤 ${show.cliente}`}</div>
                  </div>
                  <div className="fc g8" style={{flexShrink:0}}>
                    <div style={{textAlign:"right"}}>
                      <div className="gld mono bold" style={{fontSize:16}}>{fmtMoney(p.totalShow)}</div>
                      {saved&&p.porSocioBase&&<div style={{fontSize:9,color:"var(--grn)"}}>✓ {fmtMoney(p.porSocioBase)}/socio</div>}
                      {!saved&&<div style={{fontSize:9,color:"var(--gold)"}}>⏳ Pendiente calcular</div>}
                    </div>
                    <button className="btn bp bsm" onClick={()=>openCalc(p)}>🔢 {saved?"Editar":"Calcular"}</button>
                    <button className="btn bsm" style={{background:"rgba(232,41,74,.1)",color:"var(--acc)",border:"1px solid rgba(232,41,74,.3)"}} onClick={()=>onDeletePayment(p.id)}>🗑️</button>
                  </div>
                </div>
                {saved&&sdArr.length>0&&(
                  <><div className="div"/>
                  <div className="g3">
                    {sdArr.map(s=>{if(!s)return null;const totV=safeNum(s.total)||safeNum(s.base)||safeNum(p.porSocioBase);return(<div key={s.code} className="mcard"><div className="mc-code" style={{color:"var(--gold)"}}>{s.code}</div><div className="mc-name">{s.name}</div><div className="mc-amt" style={{color:"var(--grn)"}}>{fmtMoney(totV)}</div></div>);})}
                    {nsArr.map(x=>!x?null:(<div key={x.code} className="mcard"><div className="mc-code" style={{color:"var(--tel)"}}>{x.code}</div><div className="mc-name">{x.name}</div><div className="mc-amt" style={{color:"var(--tel)"}}>{fmtMoney(x.monto)}</div></div>))}
                  </div></>
                )}
              </div>
            );
          })
      }
    </div>
  );
}

// ─── CUENTAS ──────────────────────────────────────────────────────────────────
function CuentasPage({ principal, cajachica, onAddMovimiento, shows }) {
  const [cuenta, setCuenta] = useState("principal");
  const [form, setForm] = useState({date:today(),type:"ingreso",concept:"",amount:""});
  const totPrincipal = principal.reduce((s,e)=>s+e.amount,0);
  const totCajachica = cajachica.reduce((s,e)=>s+e.amount,0);
  const entries = cuenta==="principal" ? principal : cajachica;
  const typeOpts = cuenta==="principal"
    ? [["adelanto","💳 Adelanto"],["saldo","💰 Saldo cobrado"],["ingreso","➕ Otro ingreso"],["pago","💸 Pago músicos"],["egreso","➖ Egreso"]]
    : [["multa","⚠️ Multa"],["ingreso","➕ Ingreso"],["egreso","➖ Egreso"]];
  const addMov = () => {
    if(!form.concept||!form.amount) return alert("Completa concepto y monto");
    onAddMovimiento(cuenta,{...form,amount:["pago","egreso"].includes(form.type)?-Math.abs(parseFloat(form.amount)):parseFloat(form.amount)});
    setForm({date:today(),type:"ingreso",concept:"",amount:""});
  };
  return (
    <div>
      <div className="sh"><div><div className="stit">🏦 CUENTAS</div></div></div>
      <div className="acc-tabs">
        <div className={`acc-tab ${cuenta==="principal"?"ap":""}`} onClick={()=>setCuenta("principal")}>
          <div className="acc-nm">💳 CUENTA PRINCIPAL</div>
          <div className="acc-bal" style={{color:"var(--gold)"}}>{fmtMoney(totPrincipal)}</div>
        </div>
        <div className={`acc-tab ${cuenta==="cajachica"?"ac":""}`} onClick={()=>setCuenta("cajachica")}>
          <div className="acc-nm">💰 CAJA CHICA</div>
          <div className="acc-bal" style={{color:"var(--tel)"}}>{fmtMoney(totCajachica)}</div>
        </div>
      </div>
      <div className="sg">
        <div className="st"><div className="sv grn">{fmtMoney(entries.filter(e=>e.amount>0).reduce((s,e)=>s+e.amount,0))}</div><div className="sl">Ingresos</div></div>
        <div className="st"><div className="sv acc">{fmtMoney(Math.abs(entries.filter(e=>e.amount<0).reduce((s,e)=>s+e.amount,0)))}</div><div className="sl">Egresos</div></div>
        <div className="st"><div className="sv" style={{color:cuenta==="principal"?"var(--gold)":"var(--tel)"}}>{fmtMoney(cuenta==="principal"?totPrincipal:totCajachica)}</div><div className="sl">Saldo</div></div>
      </div>
      <div className="card">
        <div className="ct">➕ Nuevo Movimiento</div>
        <div className="fgg">
          <div className="fg"><label className="lb">Fecha</label><input className="inp" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div className="fg"><label className="lb">Tipo</label><select className="sel" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{typeOpts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
          <div className="fg" style={{gridColumn:"1/-1"}}><label className="lb">Concepto</label><input className="inp" type="text" placeholder="Descripción" value={form.concept} onChange={e=>setForm({...form,concept:e.target.value})}/></div>
          <div className="fg"><label className="lb">Monto (Bs.)</label><input className="inp" type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div>
        </div>
        <button className="btn bp" onClick={addMov}>+ Registrar</button>
      </div>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="tw">
          <table>
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead>
            <tbody>
              {entries.length===0 && <tr><td colSpan={4}><div className="empty"><div className="ei">📭</div>Sin movimientos</div></td></tr>}
              {[...entries].sort((a,b)=>b.date.localeCompare(a.date)).map(e=>(
                <tr key={e.id}>
                  <td className="mono">{fmtDate(e.date)}</td>
                  <td><span className="bdg" style={{background:e.amount>=0?"#020e06":"#140005",color:e.amount>=0?"var(--grn)":"var(--acc)",borderColor:(e.amount>=0?"var(--grn)":"var(--acc)")+"44"}}>{e.type}</span></td>
                  <td style={{fontSize:12}}>{e.concept}</td>
                  <td className={`mono bold ${e.amount>=0?"grn":"acc"}`}>{e.amount>=0?"+":""}{fmtMoney(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── MULTAS ───────────────────────────────────────────────────────────────────
function MultasPage({ multas, onAddMulta, onDeleteMulta }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({memberCode:"",type:"retraso",amount:"",note:"",date:today()});
  const save = () => {
    if(!form.memberCode||!form.amount) return alert("Músico y monto requeridos");
    onAddMulta({...form,amount:parseFloat(form.amount)});
    setModal(false);
    setForm({memberCode:"",type:"retraso",amount:"",note:"",date:today()});
  };
  const byMember = {};
  multas.forEach(m=>{if(!byMember[m.memberCode])byMember[m.memberCode]={count:0,total:0};byMember[m.memberCode].count++;byMember[m.memberCode].total+=m.amount;});
  return (
    <div>
      <div className="sh">
        <div><div className="stit">⚠️ MULTAS</div><div className="ssub">Control de sanciones — Caja Chica</div></div>
        <button className="btn bp" onClick={()=>setModal(true)}>+ Nueva Multa</button>
      </div>
      <div className="card">
        <div className="ct">📋 Catálogo</div>
        {MULTAS_CAT.map(c=>(
          <div key={c.id} className="row">
            <div style={{fontSize:20,width:28,textAlign:"center",flexShrink:0}}>{c.icon}</div>
            <div style={{flex:1}}><div className="bold" style={{fontSize:13}}>{c.label}</div></div>
            <div className="acc mono bold">{c.monto>0?fmtMoney(c.monto):"Variable"}</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="ct">📊 Ranking</div>
          <div className="fb mb8"><span className="mut" style={{fontSize:11}}>Total en caja chica:</span><span className="acc mono bold">{fmtMoney(multas.reduce((s,m)=>s+m.amount,0))}</span></div>
          <div className="div"/>
          {Object.entries(byMember).sort((a,b)=>b[1].total-a[1].total).map(([code,d],i)=>{const mem=getMember(code);return(
            <div key={code} className="fb" style={{padding:"7px 0",borderBottom:"1px solid var(--border)",fontSize:12}}>
              <div><span className="mut" style={{fontSize:9,marginRight:5}}>#{i+1}</span><strong>{mem?.name||code}</strong></div>
              <span className="acc mono bold">{fmtMoney(d.total)}</span>
            </div>
          );})}
        </div>
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"11px 14px",borderBottom:"1px solid var(--border)"}}><div className="ct" style={{margin:0}}>📜 Historial</div></div>
          <div className="tw">
            <table>
              <thead><tr><th>Fecha</th><th>Músico</th><th>Tipo</th><th>Monto</th><th></th></tr></thead>
              <tbody>
                {multas.length===0 && <tr><td colSpan={5}><div className="empty"><div className="ei">🎉</div>Sin multas</div></td></tr>}
                {[...multas].sort((a,b)=>b.date.localeCompare(a.date)).map(m=>{
                  const cat=MULTAS_CAT.find(c=>c.id===m.type); const mem=getMember(m.memberCode);
                  return(<tr key={m.id}><td className="mono">{fmtDate(m.date)}</td><td className="bold" style={{fontSize:12}}>{mem?.name||m.memberCode}</td><td style={{fontSize:11}}>{cat?.icon} {cat?.label}</td><td className="acc mono bold">{fmtMoney(m.amount)}</td><td><button className="bico" style={{color:"var(--acc)"}} onClick={()=>onDeleteMulta(m.id)}>🗑️</button></td></tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {modal && (
        <Modal title="⚠️ Nueva Multa" onClose={()=>setModal(false)} footer={<><button className="btn bs" onClick={()=>setModal(false)}>Cancelar</button><button className="btn bp" onClick={save}>Aplicar</button></>}>
          <div className="fgg">
            <div className="fg"><label className="lb">Músico</label>
              <select className="sel" value={form.memberCode} onChange={e=>setForm({...form,memberCode:e.target.value})}>
                <option value="">Seleccionar</option>
                <optgroup label="Socios">{SOCIOS.map(m=><option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}</optgroup>
                <optgroup label="Trabajadores">{TRABAJADORES.map(m=><option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}</optgroup>
                <optgroup label="Reemplazos">{REEMPLAZOS.map(m=><option key={m.code} value={m.code}>{m.code} — {m.name}</option>)}</optgroup>
              </select>
            </div>
            <div className="fg"><label className="lb">Tipo</label>
              <select className="sel" value={form.type} onChange={e=>{const c=MULTAS_CAT.find(x=>x.id===e.target.value);setForm({...form,type:e.target.value,amount:c?.monto||""});}}>
                {MULTAS_CAT.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="fg"><label className="lb">Fecha</label><input className="inp" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
            <div className="fg"><label className="lb">Monto (Bs.)</label><input className="inp" type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></div>
            <div className="fg" style={{gridColumn:"1/-1"}}><label className="lb">Nota</label><input className="inp" type="text" placeholder="Motivo..." value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── MIEMBROS ─────────────────────────────────────────────────────────────────
function MiembrosPage() {
  return (
    <div>
      <div className="sh"><div><div className="stit">👥 MIEMBROS</div><div className="ssub">Directorio oficial del grupo</div></div></div>
      <div className="card">
        <div className="ct">🌟 Socios (S01–S06)</div>
        <div className="g3">{SOCIOS.map(m=>(<div key={m.code} className="mcard"><div className="mc-code" style={{color:"var(--gold)"}}>{m.code}</div><div className="mc-name">{m.name}</div><div className="mc-role">{m.role}</div><TypeBadge type="socio"/></div>))}</div>
      </div>
      <div className="card">
        <div className="ct">🔵 Trabajadores (T01–T03)</div>
        <div className="g3">{TRABAJADORES.map(m=>(<div key={m.code} className="mcard"><div className="mc-code" style={{color:"var(--tel)"}}>{m.code}</div><div className="mc-name">{m.name}</div><div className="mc-role">{m.role}</div><TypeBadge type="trabajador"/></div>))}</div>
      </div>
      <div className="card">
        <div className="ct">🔄 Reemplazos (R01–R04)</div>
        <div className="g3">{REEMPLAZOS.map(m=>(<div key={m.code} className="mcard"><div className="mc-code" style={{color:"var(--pur)"}}>{m.code}</div><div className="mc-name">{m.name}</div><div className="mc-role">{m.role}</div><TypeBadge type="reemplazo"/></div>))}</div>
      </div>
    </div>
  );
}

// ─── HISTORIAL ────────────────────────────────────────────────────────────────
function HistorialPage({ shows, multas, payments }) {
  const [tab, setTab] = useState("shows");
  const totalGanado = shows.filter(s=>s.status==="Realizado").reduce((s,sh)=>s+sh.price,0);
  const monthlyData = {};
  shows.filter(s=>s.status==="Realizado").forEach(s=>{
    const [y,m]=s.date.split("-"); const k=`${y}-${m}`;
    if(!monthlyData[k])monthlyData[k]={income:0,shows:0,y,m};
    monthlyData[k].income+=s.price; monthlyData[k].shows++;
  });
  return (
    <div>
      <div className="sh"><div><div className="stit">📈 HISTORIAL</div></div></div>
      <div className="sg">
        <div className="st"><div className="sv gld">{fmtMoney(totalGanado)}</div><div className="sl">Ganancias</div></div>
        <div className="st"><div className="sv pur">{shows.filter(s=>s.status==="Realizado").length}</div><div className="sl">Realizados</div></div>
        <div className="st"><div className="sv acc">{fmtMoney(multas.reduce((s,m)=>s+m.amount,0))}</div><div className="sl">Multas</div></div>
        <div className="st"><div className="sv blu">{payments.length}</div><div className="sl">Pagos</div></div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab==="shows"?"on":""}`} onClick={()=>setTab("shows")}>Shows</button>
        <button className={`tab ${tab==="mensual"?"on":""}`} onClick={()=>setTab("mensual")}>Mensual</button>
        <button className={`tab ${tab==="multas"?"on":""}`} onClick={()=>setTab("multas")}>Multas</button>
      </div>
      {tab==="shows" && (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div className="tw">
            <table>
              <thead><tr><th>Fecha</th><th>Lugar</th><th>Precio</th><th>Estado</th></tr></thead>
              <tbody>
                {[...shows].sort((a,b)=>b.date.localeCompare(a.date)).map(s=>(
                  <tr key={s.id}><td className="mono">{fmtDate(s.date)}</td><td className="bold" style={{fontSize:12}}>{s.place}</td><td className="gld mono bold">{fmtMoney(s.price)}</td><td><StatusBadge status={s.status}/></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab==="mensual" && (
        <div>
          {Object.entries(monthlyData).sort((a,b)=>b[0].localeCompare(a[0])).map(([k,d])=>(
            <div key={k} className="card">
              <div className="fb">
                <div><div className="bold" style={{fontSize:15}}>{MONTHS_ES[parseInt(d.m)-1]} {d.y}</div><div className="mut" style={{fontSize:11}}>{d.shows} shows</div></div>
                <div className="gld mono bold" style={{fontSize:20}}>{fmtMoney(d.income)}</div>
              </div>
            </div>
          ))}
          {Object.keys(monthlyData).length===0 && <div className="card"><div className="empty"><div className="ei">📊</div>Sin datos</div></div>}
        </div>
      )}
      {tab==="multas" && (
        <div className="card" style={{padding:0,overflow:"hidden"}}>
          <div className="tw">
            <table>
              <thead><tr><th>Fecha</th><th>Músico</th><th>Tipo</th><th>Monto</th></tr></thead>
              <tbody>
                {multas.length===0&&<tr><td colSpan={4}><div className="empty"><div className="ei">🎉</div>Sin multas</div></td></tr>}
                {[...multas].sort((a,b)=>b.date.localeCompare(a.date)).map(m=>{
                  const cat=MULTAS_CAT.find(c=>c.id===m.type);const mem=getMember(m.memberCode);
                  return <tr key={m.id}><td className="mono">{fmtDate(m.date)}</td><td className="bold" style={{fontSize:12}}>{mem?.name||m.memberCode}</td><td style={{fontSize:11}}>{cat?.icon} {cat?.label}</td><td className="acc mono bold">{fmtMoney(m.amount)}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECIBOS ──────────────────────────────────────────────────────────────────
function RecibosPage({ shows }) {
  const [sel, setSel] = useState(null);
  const done = shows.filter(s=>s.status==="Realizado");
  return (
    <div>
      <div className="sh"><div><div className="stit">🧾 RECIBOS</div></div></div>
      {!sel ? (
        <div>
          <div className="al ai mb12">Selecciona un show realizado para generar su recibo</div>
          {done.length===0 && <div className="card"><div className="empty"><div className="ei">🧾</div>Sin shows realizados</div></div>}
          {done.map(s=>(<div key={s.id} className="card" style={{cursor:"pointer"}} onClick={()=>setSel(s)}>
            <div className="fb"><div><div className="bold" style={{fontSize:13}}>{s.place}</div><div className="mut" style={{fontSize:11}}>{fmtDate(s.date)}</div></div>
            <div className="gld mono bold">{fmtMoney(s.price)}</div></div>
          </div>))}
        </div>
      ) : (
        <div>
          <div className="fc g10 mb12 no-print">
            <button className="btn bs" onClick={()=>setSel(null)}>← Volver</button>
            <button className="btn bp" onClick={()=>window.print()}>🖨️ Imprimir</button>
          </div>
          <div className="receipt">
            <div className="rh"><div className="rl">🎵 ADOLESCENTES SHOW</div><div className="rs">Recibo de Servicio Musical</div><div style={{fontSize:9,color:"#bbb",marginTop:5}}>Nº: {sel.id.toUpperCase()} · {fmtDate(today())}</div></div>
            <div className="rrow"><span>Fecha:</span><strong>{fmtDate(sel.date)}</strong></div>
            <div className="rrow"><span>Lugar:</span><strong>{sel.place}</strong></div>
            <div className="rrow"><span>Horario:</span><strong>{sel.timeStart} ({sel.hours}h)</strong></div>
            <div className="rrow"><span>Método de pago:</span><strong>{sel.paymentMethod||"—"}</strong></div>
            <div className="rtot"><span>TOTAL COBRADO</span><span>Bs. {Number(sel.price).toFixed(2)}</span></div>
            <div className="rfoot">¡Gracias por confiar en Adolescentes Show! 🎶</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESUMEN ──────────────────────────────────────────────────────────────────
function ResumenPage({ shows, multas, principal, cajachica, payments }) {
  const [date, setDate] = useState(today());
  const dayShows = shows.filter(s=>s.date===date&&s.status==="Realizado");
  const dayMultas = multas.filter(m=>m.date===date);
  const dayIn = principal.filter(e=>e.date===date&&e.amount>0).reduce((s,e)=>s+e.amount,0);
  const totPrincipal = principal.reduce((s,e)=>s+e.amount,0);
  const totCajachica = cajachica.reduce((s,e)=>s+e.amount,0);
  return (
    <div>
      <div className="sh">
        <div><div className="stit">📊 RESUMEN</div></div>
        <input className="inp" type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"auto"}}/>
      </div>
      <div className="sg">
        <div className="st"><div className="sv blu">{dayShows.length}</div><div className="sl">Shows del día</div></div>
        <div className="st"><div className="sv grn">{fmtMoney(dayIn)}</div><div className="sl">Ingresado</div></div>
        <div className="st"><div className="sv gld">{fmtMoney(totPrincipal)}</div><div className="sl">Cta. Principal</div></div>
        <div className="st"><div className="sv tel">{fmtMoney(totCajachica)}</div><div className="sl">Caja Chica</div></div>
      </div>
      {dayShows.length===0 ? <div className="al ai">Sin shows realizados para esta fecha.</div>
        : dayShows.map(s=>(
          <div key={s.id} className="card">
            <div className="fb mb8"><div><div className="bold" style={{fontSize:14}}>{s.place}</div><div className="mut">{s.timeStart} · {s.hours}h</div></div><div className="gld mono bold" style={{fontSize:17}}>{fmtMoney(s.price)}</div></div>
            <div className="chips">
              {(s.presentes||[]).map(c=>{const m=getMember(c);return <span key={c} className="chip cp">{m?.name||c}</span>;})}
              {(s.trabajadores||[]).map(c=>{const m=getMember(c);return <span key={c} className="chip ctel">{m?.name||c}</span>;})}
              {(s.ausentes||[]).map(c=>{const m=getMember(c);return <span key={c} className="chip ca">{m?.name||c} ✗</span>;})}
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ shows, multas, principal, cajachica, payments, onNavigate }) {
  const [editing, setEditing] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT_DASH);
  const [draftCfg, setDraftCfg] = useState(cfg);
  const [dashTab, setDashTab] = useState("overview");

  const todayStr = today();
  const nowD = new Date();
  const monthStr = todayStr.slice(0,7);
  const prevMonthStr = (() => { const d=new Date(todayStr+"T12:00:00"); d.setMonth(d.getMonth()-1); return d.toISOString().slice(0,7); })();

  const showsThisMonth = shows.filter(s=>s.date.startsWith(monthStr));
  const showsRealizados = shows.filter(s=>s.status==="Realizado");
  const showsConfirmados = shows.filter(s=>s.status==="Confirmado");
  const showsReservados  = shows.filter(s=>s.status==="Reservado");
  const proximos = shows.filter(s=>s.date>=todayStr&&s.status!=="Realizado").sort((a,b)=>a.date.localeCompare(b.date));
  const ingresosEsteMes = principal.filter(e=>e.amount>0&&e.date.startsWith(monthStr)).reduce((s,e)=>s+e.amount,0);
  const ingresosPrevMes = principal.filter(e=>e.amount>0&&e.date.startsWith(prevMonthStr)).reduce((s,e)=>s+e.amount,0);
  const totalMultas = cajachica.reduce((s,e)=>s+(e.amount>0?e.amount:0),0);
  const totalSaldo = principal.reduce((s,e)=>s+e.amount,0);
  const totalCajachica = cajachica.reduce((s,e)=>s+e.amount,0);
  const totalPendienteCobrar = shows.filter(s=>s.status!=="Realizado").reduce((s,sh)=>s+((sh.price||0)-(sh.advance||0)),0);

  const calYear = nowD.getFullYear(), calMon = nowD.getMonth();
  const firstDay = new Date(calYear,calMon,1).getDay();
  const daysInMonth = new Date(calYear,calMon+1,0).getDate();
  const calCells = [];
  for(let i=0;i<firstDay;i++) calCells.push(null);
  for(let d=1;d<=daysInMonth;d++) calCells.push(d);
  const showsInMonth = {};
  shows.forEach(s=>{ const dd=parseInt(s.date.slice(8,10)); if(s.date.startsWith(monthStr)){ if(!showsInMonth[dd])showsInMonth[dd]=[]; showsInMonth[dd].push(s); }});

  const showGoalPct = Math.min(100,Math.round((showsThisMonth.length/(cfg.showGoalMonthly||8))*100));
  const incGoalPct  = Math.min(100,Math.round((ingresosEsteMes/(cfg.incomeGoalMonthly||12000))*100));
  const saveConfig = () => { setCfg(draftCfg); setEditing(false); };

  return (
    <div>
      <div className="dash-hero">
        <div style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <div className="dash-hero-nm">{cfg.groupName}</div>
              <div className="dash-hero-sub">{cfg.tagline}</div>
            </div>
            <div className="dash-hero-actions no-print">
              <button className="btn bs bsm" onClick={()=>onNavigate("agenda")}>📅 Agenda</button>
              <button className="btn bp bsm" onClick={()=>onNavigate("registro")}>🎤 Registrar</button>
              <button className="bico" onClick={()=>{setDraftCfg(cfg);setEditing(true);}}>✏️</button>
            </div>
          </div>
          <div className="dash-hero-info">
            {cfg.city&&<span className="dash-hero-pill">📍 {cfg.city}</span>}
            {cfg.phone&&<span className="dash-hero-pill">📞 {cfg.phone}</span>}
            <span className="dash-hero-pill" style={{color:"var(--grn)",borderColor:"rgba(24,184,78,.3)",background:"rgba(24,184,78,.07)"}}>
              ● {proximos.length} shows próximos
            </span>
          </div>
        </div>
      </div>

      <div className="dash-kpi-strip">
        <div className="dash-kpi" style={{borderColor:"rgba(255,191,0,.25)"}} onClick={()=>onNavigate("cuentas")}>
          <div className="dash-kpi-val" style={{color:"var(--gold)"}}>{fmtMoney(totalSaldo)}</div>
          <div className="dash-kpi-lbl">Cuenta Principal</div>
        </div>
        <div className="dash-kpi" style={{borderColor:"rgba(0,184,204,.25)"}} onClick={()=>onNavigate("cuentas")}>
          <div className="dash-kpi-val" style={{color:"var(--tel)"}}>{fmtMoney(totalCajachica)}</div>
          <div className="dash-kpi-lbl">Caja Chica</div>
        </div>
        <div className="dash-kpi" style={{borderColor:"rgba(255,77,128,.25)"}} onClick={()=>onNavigate("agenda")}>
          <div className="dash-kpi-val" style={{color:"var(--rose)"}}>{fmtMoney(totalPendienteCobrar)}</div>
          <div className="dash-kpi-lbl">Pendiente Cobrar</div>
        </div>
        <div className="dash-kpi" style={{borderColor:"rgba(139,68,240,.25)"}} onClick={()=>onNavigate("agenda")}>
          <div className="dash-kpi-val" style={{color:"var(--pur)"}}>{proximos.length}</div>
          <div className="dash-kpi-lbl">Shows Próximos</div>
          <div className="dash-kpi-trend" style={{color:"var(--pur)"}}>{showsConfirmados.length} confirm · {showsReservados.length} reserv</div>
        </div>
        <div className="dash-kpi" style={{borderColor:"rgba(45,110,245,.25)"}} onClick={()=>onNavigate("historial")}>
          <div className="dash-kpi-val" style={{color:"var(--blu)"}}>{showsRealizados.length}</div>
          <div className="dash-kpi-lbl">Shows Realizados</div>
          <div className="dash-kpi-trend" style={{color:"var(--txt2)"}}>{showsThisMonth.length} este mes</div>
        </div>
        <div className="dash-kpi" style={{borderColor:"rgba(24,184,78,.25)"}} onClick={()=>onNavigate("rolpago")}>
          <div className="dash-kpi-val" style={{color:"var(--grn)"}}>{fmtMoney(ingresosEsteMes)}</div>
          <div className="dash-kpi-lbl">Ingresos Este Mes</div>
          {ingresosPrevMes>0&&<div className="dash-kpi-trend" style={{color:ingresosEsteMes>=ingresosPrevMes?"var(--grn)":"var(--acc)"}}>{ingresosEsteMes>=ingresosPrevMes?"▲":"▼"} vs {fmtMoney(ingresosPrevMes)}</div>}
        </div>
      </div>

      <div className="tabs mb12">
        <button className={`tab ${dashTab==="overview"?"on":""}`}  onClick={()=>setDashTab("overview")}>📊 Resumen</button>
        <button className={`tab ${dashTab==="proximos"?"on":""}`}  onClick={()=>setDashTab("proximos")}>📅 Shows</button>
        <button className={`tab ${dashTab==="equipo"?"on":""}`}    onClick={()=>setDashTab("equipo")}>🎸 Equipo</button>
      </div>

      {dashTab==="overview" && (
        <div>
          <div className="dash-wgt">
            <div className="dash-wgt-title"><span>📅 PRÓXIMOS SHOWS</span><button className="btn bs bsm" style={{fontSize:9}} onClick={()=>setDashTab("proximos")}>Ver todos →</button></div>
            {proximos.length===0
              ? <div style={{color:"var(--txt2)",fontSize:12,textAlign:"center",padding:"18px 0"}}>Sin shows próximos 🎸</div>
              : proximos.slice(0,5).map(s=>{
                  const sc=STATUS_CFG[s.status]||STATUS_CFG.Disponible;
                  const dDiff=Math.ceil((new Date(s.date+"T12:00:00")-new Date())/86400000);
                  return (
                    <div key={s.id} className="dash-show-row">
                      <div style={{width:10,height:10,borderRadius:"50%",background:sc.color,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div className="bold" style={{fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.place}</div>
                        <div style={{fontSize:9,color:"var(--txt2)"}}>{s.cliente&&`👤 ${s.cliente} · `}{fmtDate(s.date)} · {s.timeStart}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div className="mono bold" style={{fontSize:13,color:"var(--gold)"}}>{fmtMoney(s.price)}</div>
                        <div style={{fontSize:9,fontWeight:700,color:dDiff<=3?"var(--acc)":"var(--txt2)"}}>{dDiff===0?"HOY 🔴":dDiff===1?"MAÑANA":`${dDiff}d`}</div>
                      </div>
                      <StatusBadge status={s.status}/>
                    </div>
                  );
                })
            }
          </div>
          <div className="g2">
            <div className="dash-wgt">
              <div className="dash-wgt-title">🗓️ {MONTHS_ES[calMon].toUpperCase()} {calYear}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:4}}>
                {["D","L","M","M","J","V","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:"var(--txt2)",fontWeight:700,padding:"2px 0"}}>{d}</div>)}
              </div>
              <div className="dash-cal-grid">
                {calCells.map((d,i)=>{
                  if(!d) return <div key={i}/>;
                  const ds=showsInMonth[d]||[];
                  const dateStr=`${calYear}-${String(calMon+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  const isToday=dateStr===todayStr;
                  const topShow=ds[0];
                  return (
                    <div key={i} className={`dash-cal-day ${ds.length?"has-show":""} ${isToday?"today-cal":""}`}
                      style={{background:topShow?STATUS_CFG[topShow.status]?.bg:"transparent",color:topShow?STATUS_CFG[topShow.status]?.color:"var(--txt)"}}
                      onClick={()=>onNavigate("agenda")}>
                      {d}
                      {ds.length>0&&<span className="dash-dot" style={{background:STATUS_CFG[topShow.status]?.color}}/>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="dash-wgt">
              <div className="dash-wgt-title">🎯 METAS DEL MES</div>
              <div style={{marginBottom:14}}>
                <div className="fb" style={{fontSize:12,marginBottom:5}}><span>Shows</span><span className="mono bold" style={{color:"var(--tel)"}}>{showsThisMonth.length} / {cfg.showGoalMonthly}</span></div>
                <div className="dash-progress"><div className="dash-progress-bar" style={{width:`${showGoalPct}%`,background:"var(--tel)"}}/></div>
              </div>
              <div>
                <div className="fb" style={{fontSize:12,marginBottom:5}}><span>Ingresos</span><span className="mono bold" style={{color:"var(--gold)"}}>{fmtMoney(ingresosEsteMes)}</span></div>
                <div className="dash-progress"><div className="dash-progress-bar" style={{width:`${incGoalPct}%`,background:"var(--gold)"}}/></div>
                <div className="fb" style={{fontSize:9,color:"var(--txt2)",marginTop:3}}><span>Meta: {fmtMoney(cfg.incomeGoalMonthly)}</span><span>{incGoalPct}%</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {dashTab==="proximos" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:8,marginBottom:12}}>
            {[["Confirmados","var(--blu)",showsConfirmados.length],["Reservados","var(--gold)",showsReservados.length],["Realizados","var(--pur)",showsRealizados.length],["Total","var(--txt)",shows.length]].map(([l,c,v])=>(
              <div key={l} className="st"><div className="sv" style={{color:c}}>{v}</div><div className="sl">{l}</div></div>
            ))}
          </div>
          {[...shows].sort((a,b)=>a.date.localeCompare(b.date)).map(s=>{
            const sc=STATUS_CFG[s.status]||STATUS_CFG.Disponible;
            return (
              <div key={s.id} className="card" style={{borderLeft:`3px solid ${sc.color}`,marginBottom:8}}>
                <div className="fb mb8">
                  <div><div className="bold" style={{fontSize:14}}>{s.place}</div><div style={{fontSize:11,color:"var(--txt2)"}}>{fmtDate(s.date)} · {s.timeStart} · {s.hours}h</div>{s.cliente&&<div style={{fontSize:11,color:"var(--txt2)"}}>👤 {s.cliente}</div>}</div>
                  <div style={{textAlign:"right"}}><StatusBadge status={s.status}/><div className="gld mono bold" style={{marginTop:4}}>{fmtMoney(s.price)}</div></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dashTab==="equipo" && (
        <div className="g2">
          <div className="dash-wgt">
            <div className="dash-wgt-title" style={{color:"var(--gold)"}}>⭐ SOCIOS</div>
            {SOCIOS.map(m=>(<div key={m.code} className="fb" style={{padding:"8px 0",borderBottom:"1px solid var(--border)"}}><div><span className="mono" style={{fontSize:9,color:"var(--gold)",marginRight:6,fontWeight:700}}>{m.code}</span><span className="bold" style={{fontSize:12}}>{m.name}</span><div style={{fontSize:10,color:"var(--txt2)"}}>{m.role}</div></div><TypeBadge type="socio"/></div>))}
          </div>
          <div>
            <div className="dash-wgt mb12">
              <div className="dash-wgt-title" style={{color:"var(--tel)"}}>🔵 TRABAJADORES</div>
              {TRABAJADORES.map(m=>(<div key={m.code} className="fb" style={{padding:"8px 0",borderBottom:"1px solid var(--border)"}}><div><span className="mono" style={{fontSize:9,color:"var(--tel)",marginRight:6,fontWeight:700}}>{m.code}</span><span className="bold" style={{fontSize:12}}>{m.name}</span><div style={{fontSize:10,color:"var(--txt2)"}}>{m.role}</div></div><TypeBadge type="trabajador"/></div>))}
            </div>
            <div className="dash-wgt">
              <div className="dash-wgt-title" style={{color:"var(--pur)"}}>🔄 REEMPLAZOS</div>
              {REEMPLAZOS.map(m=>(<div key={m.code} className="fb" style={{padding:"8px 0",borderBottom:"1px solid var(--border)"}}><div><span className="mono" style={{fontSize:9,color:"var(--pur)",marginRight:6,fontWeight:700}}>{m.code}</span><span className="bold" style={{fontSize:12}}>{m.name}</span><div style={{fontSize:10,color:"var(--txt2)"}}>{m.role}</div></div><TypeBadge type="reemplazo"/></div>))}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="edit-overlay" onClick={e=>e.target===e.currentTarget&&setEditing(false)}>
          <div className="edit-panel">
            <div className="mh"><span className="mt2">✏️ CONFIGURAR DASHBOARD</span><button className="bico" onClick={()=>setEditing(false)}>✕</button></div>
            <div className="mb2">
              <div className="fgg">
                <div className="fg" style={{gridColumn:"1/-1"}}><label className="lb">Nombre del Grupo</label><input className="inp" value={draftCfg.groupName} onChange={e=>setDraftCfg({...draftCfg,groupName:e.target.value})}/></div>
                <div className="fg" style={{gridColumn:"1/-1"}}><label className="lb">Tagline</label><input className="inp" value={draftCfg.tagline} onChange={e=>setDraftCfg({...draftCfg,tagline:e.target.value})}/></div>
                <div className="fg"><label className="lb">Ciudad</label><input className="inp" value={draftCfg.city} onChange={e=>setDraftCfg({...draftCfg,city:e.target.value})}/></div>
                <div className="fg"><label className="lb">Teléfono</label><input className="inp" value={draftCfg.phone} onChange={e=>setDraftCfg({...draftCfg,phone:e.target.value})}/></div>
                <div className="fg"><label className="lb">Meta Shows/Mes</label><input className="inp" type="number" value={draftCfg.showGoalMonthly} onChange={e=>setDraftCfg({...draftCfg,showGoalMonthly:parseInt(e.target.value)||8})}/></div>
                <div className="fg"><label className="lb">Meta Ingresos (Bs.)</label><input className="inp" type="number" value={draftCfg.incomeGoalMonthly} onChange={e=>setDraftCfg({...draftCfg,incomeGoalMonthly:parseFloat(e.target.value)||12000})}/></div>
              </div>
            </div>
            <div className="mf"><button className="btn bs" onClick={()=>setEditing(false)}>Cancelar</button><button className="btn bp" onClick={saveConfig}>💾 Guardar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROL INDIVIDUAL POR MÚSICO ────────────────────────────────────────────────
function RolIndividualPage({ payments, shows, multas }) {
  const nowD = new Date();
  const [memberCode, setMemberCode] = useState(SOCIOS[0].code);
  const [filterMode, setFilterMode] = useState("mes"); // mes | rango
  const [filterYear,  setFYear]  = useState(nowD.getFullYear());
  const [filterMonth, setFMonth] = useState(nowD.getMonth());
  const [rangeFrom,   setRFrom]  = useState(today());
  const [rangeTo,     setRTo]    = useState(today());
  const [printId,     setPrint]  = useState(null);

  const member = getMember(memberCode);
  const mc = MEMBER_COLOR[member?.type||"socio"];

  // ── Filtro de fecha
  const inRange = (dateStr) => {
    if(filterMode==="mes"){
      const ms=`${filterYear}-${String(filterMonth+1).padStart(2,"0")}`;
      return dateStr.startsWith(ms);
    } else {
      return dateStr>=rangeFrom && dateStr<=rangeTo;
    }
  };

  // Miércoles más cercano anterior
  const prevWed = (ds) => {
    const d=new Date(ds+"T12:00:00");
    const dow=d.getDay(); // 0=dom 3=mie
    const diff=(dow+4)%7; // días desde el miércoles anterior
    d.setDate(d.getDate()-diff);
    return d.toISOString().slice(0,10);
  };
  const nextWed = (ds) => addDays(prevWed(ds),7);

  // ── Calcular ganancia por show para este músico
  const getEarning = (pay) => {
    if(!pay) return 0;
    const show = shows.find(s=>s.id===pay.showId)||{};
    const isSocio = member?.type==="socio";
    const isTrab  = member?.type==="trabajador";
    const isReemp = member?.type==="reemplazo";

    // ¿Estuvo presente?
    const esPresenteSocio = safeArr(pay.sociosPresentes||pay.socioDesglose?.map?.(s=>s?.code)).includes(memberCode);
    const esPresenteTrab  = safeArr(pay.presentesTrabajadores).includes(memberCode);
    const esPresenteReemp = safeArr(pay.reemplazosPresentes).includes(memberCode);

    if(isSocio){
      if(!esPresenteSocio) return 0;
      const sd = safeArr(pay.socioDesglose).find(s=>s?.code===memberCode);
      if(sd) return safeNum(sd.total||sd.base)||safeNum(pay.porSocioBase)||0;
      return safeNum(pay.porSocioBase)||0;
    }
    if(isTrab){
      if(!esPresenteTrab) return 0;
      const ns = safeArr(pay.pagosNoSocios).find(x=>x?.code===memberCode);
      return safeNum(ns?.monto)||0;
    }
    if(isReemp){
      if(!esPresenteReemp) return 0;
      const re = safeArr(pay.pagosReemplazos).find(x=>x?.code===memberCode);
      return safeNum(re?.monto)||0;
    }
    return 0;
  };

  // ── Multas del período para este músico
  const myMultas = multas.filter(m=>m.memberCode===memberCode&&inRange(m.date));

  // ── Payments en el rango
  const myPayments = payments.filter(p=>p&&inRange(p.date)).map(p=>{
    const show=shows.find(s=>s.id===p.showId)||{};
    const earned=getEarning(p);
    const myM=multas.filter(m=>m.memberCode===memberCode&&m.showId===p.showId).reduce((t,m)=>t+safeNum(m.amount),0);
    return {...p,show,earned,myMultas:myM};
  }).filter(p=>p.earned>0||p.myMultas>0).sort((a,b)=>a.date.localeCompare(b.date));

  const totalGanado  = myPayments.reduce((s,p)=>s+p.earned,0);
  const totalMultas  = myMultas.reduce((s,m)=>s+safeNum(m.amount),0);
  const totalNeto    = totalGanado - totalMultas;
  const numShows     = myPayments.filter(p=>p.earned>0).length;

  // ── Agrupación por semana Mié→Mié
  const byWeek = {};
  myPayments.forEach(p=>{
    const wk=prevWed(p.date);
    if(!byWeek[wk])byWeek[wk]={shows:[],total:0,multas:0};
    byWeek[wk].shows.push(p);
    byWeek[wk].total+=p.earned;
    byWeek[wk].multas+=p.myMultas;
  });

  // ── Agrupación por mes
  const byMonth={};
  myPayments.forEach(p=>{
    const mk=p.date.slice(0,7);
    if(!byMonth[mk])byMonth[mk]={shows:[],total:0,multas:0,mk};
    byMonth[mk].shows.push(p);
    byMonth[mk].total+=p.earned;
    byMonth[mk].multas+=p.myMultas;
  });

  // ── RECIBO IMPRIMIBLE
  if(printId){
    const p=payments.find(x=>x.id===printId);
    const show=p?shows.find(s=>s.id===p.showId)||{}:{};
    const earned=p?getEarning(p):0;
    const myM=p?multas.filter(m=>m.memberCode===memberCode&&m.showId===p.showId).reduce((t,m)=>t+safeNum(m.amount),0):0;
    return (
      <div>
        <div className="fc g10 mb12 no-print">
          <button className="btn bs" onClick={()=>setPrint(null)}>← Volver</button>
          <button className="btn bp" onClick={()=>window.print()}>🖨️ Imprimir Recibo</button>
        </div>
        <div className="receipt" style={{maxWidth:480,fontFamily:"'DM Sans',sans-serif"}}>
          <div className="rh">
            <div className="rl" style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:3}}>🎵 ADOLESCENTES SHOW</div>
            <div className="rs">RECIBO DE PAGO INDIVIDUAL</div>
            <div style={{fontSize:9,color:"#aaa",marginTop:4}}>Nº {p?.id?.toUpperCase()} · Emitido: {fmtDate(today())}</div>
          </div>
          <div style={{background:"#f9f9f9",borderRadius:8,padding:"10px 14px",marginBottom:12,border:"1px solid #eee"}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:2}}>{member?.name}</div>
            <div style={{fontSize:11,color:"#666"}}>{member?.role} · <span style={{textTransform:"uppercase",fontWeight:700,fontSize:10,letterSpacing:.8}}>{member?.type}</span></div>
            <div style={{fontFamily:"var(--fm,monospace)",fontSize:12,color:"#444",marginTop:3,fontWeight:700}}>{memberCode}</div>
          </div>
          <div className="rrow"><span>📅 Fecha show:</span><strong>{fmtDate(p?.date)}</strong></div>
          <div className="rrow"><span>📍 Lugar:</span><strong>{show.place||"—"}</strong></div>
          <div className="rrow"><span>🎭 Evento:</span><strong>{show.tipoEvento||"—"}</strong></div>
          <div className="rrow"><span>⏱ Duración:</span><strong>{show.hours}h</strong></div>
          <div className="rrow" style={{background:"#fffbea"}}><span>💰 Pago base:</span><strong style={{color:"#b8860b"}}>Bs. {earned.toFixed(2)}</strong></div>
          {myM>0&&<div className="rrow" style={{background:"#fff5f5"}}><span>⚠️ Descuento multa:</span><strong style={{color:"#c0392b"}}>- Bs. {myM.toFixed(2)}</strong></div>}
          <div className="rtot"><span>TOTAL RECIBIDO</span><span style={{color:totalNeto>=0?"#27ae60":"#c0392b"}}>Bs. {(earned-myM).toFixed(2)}</span></div>
          <div className="rfoot">Adolescentes Show · Santa Cruz de la Sierra · Bolivia<br/>Firma del músico: _______________________</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sh">
        <div><div className="stit">👤 ROL INDIVIDUAL</div><div className="ssub">Ganancias por músico · Semanas Mié→Mié</div></div>
      </div>

      {/* ── SELECTOR MÚSICO ── */}
      <div className="card" style={{marginBottom:10}}>
        <div className="ct" style={{marginBottom:8}}>🎸 SELECCIONAR MÚSICO</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:5}}>
          {ALL_MEMBERS.map(m=>{
            const mc2=MEMBER_COLOR[m.type]||MEMBER_COLOR.socio;
            const sel=memberCode===m.code;
            return (
              <div key={m.code} onClick={()=>setMemberCode(m.code)}
                style={{borderRadius:9,border:`2px solid ${sel?mc2.color:"var(--border)"}`,
                  background:sel?mc2.bg:"var(--bg3)",padding:"9px 10px",cursor:"pointer",transition:"all .14s"}}>
                <div style={{display:"inline-block",background:mc2.bg,color:mc2.color,border:`1px solid ${mc2.border}`,
                  borderRadius:5,padding:"1px 7px",fontFamily:"var(--fm)",fontSize:9,fontWeight:700,marginBottom:4}}>{m.code}</div>
                <div style={{fontSize:11,fontWeight:700,lineHeight:1.3}}>{m.name}</div>
                <div style={{fontSize:8,color:"var(--txt2)",marginTop:1}}>{m.role}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FILTRO PERÍODO ── */}
      <div className="card" style={{marginBottom:10}}>
        <div className="ct" style={{marginBottom:8}}>📅 PERÍODO</div>
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          <button className={`btn bsm ${filterMode==="mes"?"bp":"bs"}`} onClick={()=>setFilterMode("mes")}>Por Mes</button>
          <button className={`btn bsm ${filterMode==="rango"?"bp":"bs"}`} onClick={()=>setFilterMode("rango")}>Rango Libre</button>
        </div>
        {filterMode==="mes" ? (
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <select className="sel" style={{width:"auto"}} value={filterYear} onChange={e=>setFYear(parseInt(e.target.value))}>
              {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
            </select>
            <select className="sel" style={{width:"auto"}} value={filterMonth} onChange={e=>setFMonth(parseInt(e.target.value))}>
              {MONTHS_ES.map((m,i)=><option key={i} value={i}>{m}</option>)}
            </select>
          </div>
        ) : (
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <div className="fg" style={{marginBottom:0}}><label className="lb">Desde</label><input className="inp" type="date" value={rangeFrom} onChange={e=>setRFrom(e.target.value)}/></div>
            <div style={{color:"var(--txt2)",paddingTop:14}}>→</div>
            <div className="fg" style={{marginBottom:0}}><label className="lb">Hasta</label><input className="inp" type="date" value={rangeTo} onChange={e=>setRTo(e.target.value)}/></div>
          </div>
        )}
      </div>

      {/* ── KPIs ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:12}}>
        {[
          ["Shows",numShows,"var(--blu)"],
          ["Ganado",fmtMoney(totalGanado),"var(--gold)"],
          ["Multas",fmtMoney(totalMultas),"var(--acc)"],
          ["Neto",fmtMoney(totalNeto),"var(--grn)"],
        ].map(([l,v,c])=>(
          <div key={l} style={{background:"var(--card)",border:`1px solid ${c}33`,borderRadius:10,padding:"13px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"var(--fd)",fontSize:22,color:c,letterSpacing:.5}}>{v}</div>
            <div style={{fontSize:9,color:"var(--txt2)",textTransform:"uppercase",letterSpacing:1,marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── DETALLE POR SEMANAS (Mié→Mié) ── */}
      {Object.keys(byWeek).length>0&&(
        <div className="card" style={{marginBottom:10}}>
          <div className="ct">📆 SEMANAS MIÉRCOLES → MIÉRCOLES</div>
          {Object.entries(byWeek).sort((a,b)=>a[0].localeCompare(b[0])).map(([wk,wd])=>{
            const wkEnd=addDays(wk,6);
            const neto=wd.total-wd.multas;
            return (
              <div key={wk} style={{background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,padding:"11px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:6}}>
                  <div>
                    <div style={{fontFamily:"var(--fd)",fontSize:14,letterSpacing:1}}>
                      Semana: {fmtDate(wk)} → {fmtDate(wkEnd)}
                    </div>
                    <div style={{fontSize:10,color:"var(--txt2)"}}>
                      {wd.shows.length} show{wd.shows.length!==1?"s":""}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"var(--fd)",fontSize:20,color:"var(--gold)"}}>{fmtMoney(wd.total)}</div>
                    {wd.multas>0&&<div style={{fontSize:10,color:"var(--acc)"}}>⚠️ -{fmtMoney(wd.multas)}</div>}
                    <div style={{fontSize:12,color:"var(--grn)",fontWeight:700}}>Neto: {fmtMoney(neto)}</div>
                  </div>
                </div>
                {wd.shows.map(p=>(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderTop:"1px solid var(--border)",fontSize:12}}>
                    <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--txt2)",width:70,flexShrink:0}}>{fmtDate(p.date)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.show.place||"—"}</div>
                      <div style={{fontSize:10,color:"var(--txt2)"}}>{p.show.tipoEvento} · {p.show.hours}h</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{color:"var(--gold)",fontFamily:"var(--fm)",fontWeight:700}}>{fmtMoney(p.earned)}</div>
                      {p.myMultas>0&&<div style={{fontSize:9,color:"var(--acc)"}}>-{fmtMoney(p.myMultas)}</div>}
                    </div>
                    <button className="btn bsm" style={{fontSize:9,background:"rgba(139,68,240,.1)",color:"var(--pur)",border:"1px solid rgba(139,68,240,.3)"}} onClick={()=>setPrint(p.id)}>🧾</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── RESUMEN MENSUAL ── */}
      {filterMode==="rango"&&Object.keys(byMonth).length>1&&(
        <div className="card" style={{marginBottom:10}}>
          <div className="ct">📅 RESUMEN POR MES</div>
          {Object.entries(byMonth).sort((a,b)=>a[0].localeCompare(b[0])).map(([mk,md])=>(
            <div key={mk} className="fb" style={{padding:"9px 0",borderBottom:"1px solid var(--border)",fontSize:12}}>
              <div>
                <div className="bold">{MONTHS_ES[parseInt(mk.slice(5,7))-1]} {mk.slice(0,4)}</div>
                <div className="mut" style={{fontSize:10}}>{md.shows.length} shows</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div className="gld mono bold">{fmtMoney(md.total)}</div>
                {md.multas>0&&<div style={{fontSize:9,color:"var(--acc)"}}>⚠️ -{fmtMoney(md.multas)}</div>}
                <div style={{fontSize:11,color:"var(--grn)",fontWeight:700}}>Neto: {fmtMoney(md.total-md.multas)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SIN DATOS ── */}
      {myPayments.length===0&&(
        <div className="card"><div className="empty">
          <div className="ei">💸</div>
          <div style={{fontFamily:"var(--fd)",fontSize:16,letterSpacing:1,marginBottom:6}}>SIN PAGOS EN EL PERÍODO</div>
          <div style={{fontSize:11}}>Registra shows con asistencia para ver el historial de {member?.name}</div>
        </div></div>
      )}
    </div>
  );
}

// ─── PAGES CONFIG ─────────────────────────────────────────────────────────────
const PAGES = [
  {id:"dashboard",     icon:"🏠", label:"Inicio"},
  {id:"agenda",        icon:"📅", label:"Agenda"},
  {id:"registro",      icon:"🎤", label:"Registro"},
  {id:"rolpago",       icon:"💵", label:"Pagos"},
  {id:"rolindividual", icon:"👤", label:"Individual"},
  {id:"cuentas",       icon:"🏦", label:"Cuentas"},
  {id:"multas",        icon:"⚠️", label:"Multas"},
  {id:"resumen",       icon:"📊", label:"Resumen"},
  {id:"recibos",       icon:"🧾", label:"Recibos"},
  {id:"historial",     icon:"📈", label:"Historial"},
  {id:"miembros",      icon:"👥", label:"Miembros"},
];

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
function App() {
  const [page, setPage]           = useState("dashboard");
  const [shows, setShows]         = useState(SEED_SHOWS);
  const [multas, setMultas]       = useState(SEED_MULTAS);
  const [payments, setPayments]   = useState(SEED_PAYMENTS);
  const [principal, setPrincipal] = useState(SEED_PRINCIPAL);
  const [cajachica, setCajachica] = useState(SEED_CAJACHICA);
  const [paquetes, setPaquetes]   = useState(PAQUETES_DEFAULT);
  const [showProfile, setShowProfile] = useState(false);

  const addShow    = useCallback(s=>setShows(p=>[...p,{...s,id:generateId()}]),[]);
  const updateShow = useCallback(u=>setShows(p=>p.map(s=>s.id===u.id?u:s)),[]);
  const deleteShow = useCallback(id=>{if(!window.confirm("¿Eliminar este show?"))return;setShows(p=>p.filter(s=>s.id!==id));setPayments(p=>p.filter(x=>x.showId!==id));setMultas(p=>p.filter(m=>m.showId!==id));},[]);

  const addMulta = useCallback(m=>{
    const f={...m,id:generateId()};
    setMultas(p=>[...p,f]);
    const mem=getMember(m.memberCode);
    setCajachica(p=>[...p,{id:generateId(),date:m.date,type:"multa",concept:`Multa — ${mem?.name||m.memberCode}`,amount:m.amount}]);
  },[]);
  const deleteMulta = useCallback(id=>{if(!window.confirm("¿Eliminar esta multa?"))return;setMultas(p=>p.filter(m=>m.id!==id));},[]);

  const registerShow = useCallback((form, showMultas)=>{
    const price=parseFloat(form.price), advance=parseFloat(form.advance)||0;
    const multasTotal=showMultas.reduce((s,m)=>s+m.amount,0);
    const totalPresentes=(form.presentesSocios?.length||0)+(form.presentesTrabajadores?.length||0)+(form.reemplazos?.length||0);
    const payment={id:generateId(),showId:form.showId,date:form.date,totalShow:price,advance,
      sociosPresentes:form.presentesSocios,presentesTrabajadores:form.presentesTrabajadores,
      reemplazosPresentes:form.reemplazos,ausentes:form.ausentes,multasTotal,
      pagosNoSocios:form.presentesTrabajadores.map(c=>{const m=getMember(c);return{code:c,name:m?.name||c,monto:""}}),
      pagosReemplazos:form.reemplazos.map(c=>{const m=getMember(c);return{code:c,name:m?.name||c,monto:""}}),
      socioDesglose:form.presentesSocios.map(c=>{const m=getMember(c);return{code:c,name:m?.name||c,base:"",total:""}}),
      gastosAdmin:[{concepto:"",monto:""}]};
    setPayments(p=>[...p,payment]);
    const movs=[];
    if(advance>0) movs.push({id:generateId(),date:form.date,type:"adelanto",concept:`Adelanto — ${form.place}`,amount:advance});
    const saldo=price-advance;
    if(saldo>0) movs.push({id:generateId(),date:form.date,type:"saldo",concept:`Saldo — ${form.place}`,amount:saldo});
    setPrincipal(p=>[...p,...movs]);
    const showData={status:"Realizado",paymentMethod:form.paymentMethod,presentes:form.presentesSocios,trabajadores:form.presentesTrabajadores,reemplazos:form.reemplazos,ausentes:form.ausentes,tarde:form.tarde,price};
    if(form.showId) setShows(p=>p.map(s=>s.id===form.showId?{...s,...showData}:s));
    else setShows(p=>[...p,{id:generateId(),date:form.date,timeStart:"20:00",hours:3,place:form.place,price,advance,notas:"",paymentMethod:form.paymentMethod,...showData}]);
    return {totalShow:price,totalPresentes,multasTotal};
  },[]);

  const savePayment = useCallback(wp=>{
    setPayments(p=>p.map(pay=>pay.id===wp.id?{...pay,...wp}:pay));
    const totalPagado=[...(wp.pagosNoSocios||[]),...(wp.pagosReemplazos||[])].reduce((s,x)=>s+(parseFloat(x.monto)||0),0)
      +(wp.socioDesglose||[]).reduce((s,x)=>s+(parseFloat(x.total)||parseFloat(x.base)||0),0);
    setPrincipal(p=>[...p,{id:generateId(),date:wp.date,type:"pago",concept:`Pago músicos — ${wp.show?.place||"Show"}`,amount:-totalPagado}]);
  },[]);
  const deletePayment = useCallback(id=>{if(!window.confirm("¿Eliminar?"))return;setPayments(p=>p.filter(x=>x.id!==id));},[]);
  const addMovimiento = useCallback((cuenta,entry)=>{
    const m={...entry,id:generateId()};
    if(cuenta==="principal") setPrincipal(p=>[...p,m]);
    else setCajachica(p=>[...p,m]);
  },[]);

  const nowDate = new Date().toLocaleDateString("es-BO",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  return (
    <>
      
      <div className="app">
        <header className="hdr no-print">
          <div className="hdr-logo">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#e8294a"/><stop offset="1" stopColor="#8b44f0"/></linearGradient>
                <linearGradient id="strGrad" x1="22" y1="4" x2="22" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff" stopOpacity=".95"/><stop offset="1" stopColor="#ddddff" stopOpacity=".7"/></linearGradient>
              </defs>
              <rect width="44" height="44" rx="11" fill="url(#logoGrad)"/>
              <ellipse cx="21" cy="30" rx="8" ry="9.5" fill="url(#strGrad)" fillOpacity=".92"/>
              <rect x="19.8" y="6" width="2.4" height="17" rx="1.2" fill="url(#strGrad)" fillOpacity=".9"/>
              <rect x="18.8" y="9" width="4.4" height="1.2" rx=".6" fill="#ffbf00" fillOpacity=".9"/>
              <rect x="18.8" y="12.5" width="4.4" height="1.2" rx=".6" fill="#ffbf00" fillOpacity=".9"/>
              <circle cx="21" cy="30" r="2.5" fill="#05050d" fillOpacity=".65"/>
              <text x="28" y="17" fontSize="11" fill="#ffbf00" fillOpacity=".9" fontWeight="900">♪</text>
            </svg>
            <div>
              <div className="hdr-nm">ADOLESCENTES SHOW</div>
              <div className="hdr-sub">🎵 Sistema de Gestión Musical</div>
            </div>
          </div>
          <div className="hdr-right">
            <div className="hdr-dt">{nowDate}</div>
            <div className="hdr-profile" onClick={()=>setShowProfile(!showProfile)}>
              <div className="hdr-avatar">🎸</div>
              <div><div className="hdr-pname">ADOLESCENTES SHOW</div><div className="hdr-prole">Admin · Santa Cruz</div></div>
            </div>
          </div>
        </header>

        {showProfile && (
          <div className="prof-ov" onClick={e=>e.target===e.currentTarget&&setShowProfile(false)}>
            <div className="prof-panel">
              <div className="prof-hero">
                <div className="prof-hero-bg"/>
                <button className="prof-close" onClick={()=>setShowProfile(false)}>✕</button>
                <div className="prof-hero-content">
                  <div className="prof-logo-big"><div className="prof-logo-inner2"><span style={{fontSize:40}}>🎸</span></div></div>
                  <div className="prof-hero-text">
                    <div className="prof-name">ADOLESCENTES</div>
                    <div className="prof-tag">Grupo Musical Profesional</div>
                    <div className="prof-location">🌆 Santa Cruz de la Sierra, Bolivia</div>
                  </div>
                </div>
              </div>
              <div className="prof-stats">
                <div className="prof-stat"><div className="prof-stat-v" style={{color:"var(--acc)"}}>{shows.length}</div><div className="prof-stat-l">Shows</div></div>
                <div className="prof-stat"><div className="prof-stat-v" style={{color:"var(--gold)",fontSize:16,marginTop:4}}>{fmtMoney(principal.filter(e=>e.amount>0).reduce((s,e)=>s+e.amount,0))}</div><div className="prof-stat-l">Ingresos</div></div>
                <div className="prof-stat"><div className="prof-stat-v" style={{color:"var(--tel)"}}>13</div><div className="prof-stat-l">Músicos</div></div>
              </div>
              <div className="prof-section">
                <div className="prof-section-title">⭐ SOCIOS</div>
                <div className="prof-member-grid">
                  {SOCIOS.map(m=>(<div key={m.code} className="prof-member"><div className="prof-member-code" style={{background:"rgba(255,191,0,.1)",color:"var(--gold)"}}>{m.code.slice(1)}</div><div style={{flex:1,minWidth:0}}><div className="prof-member-name">{m.name}</div><div className="prof-member-role">{m.role}</div></div></div>))}
                </div>
              </div>
              <div className="prof-section" style={{borderBottom:"none"}}>
                <div className="prof-section-title">🔵 TRABAJADORES & REEMPLAZOS</div>
                <div className="prof-member-grid">
                  {[...TRABAJADORES,...REEMPLAZOS].map(m=>(<div key={m.code} className="prof-member"><div className="prof-member-code" style={{background:m.type==="trabajador"?"rgba(0,184,204,.1)":"rgba(139,68,240,.1)",color:m.type==="trabajador"?"var(--tel)":"var(--pur)"}}>{m.code.slice(1)}</div><div style={{flex:1,minWidth:0}}><div className="prof-member-name">{m.name}</div><div className="prof-member-role">{m.role}</div></div></div>))}
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="nav no-print">
          {PAGES.map(p=>(
            <button key={p.id} className={`nb ${page===p.id?"on":""}`} onClick={()=>setPage(p.id)}>
              <span>{p.icon}</span><span>{p.label}</span>
            </button>
          ))}
        </nav>

        <main className="main">
          {page==="dashboard"     && <DashboardPage shows={shows} multas={multas} principal={principal} cajachica={cajachica} payments={payments} onNavigate={setPage}/>}
          {page==="agenda"        && <AgendaPage shows={shows} onAddShow={addShow} onUpdateShow={updateShow} onDeleteShow={deleteShow} multas={multas} onAddMulta={addMulta}/>}
          {page==="registro"      && <RegistroPage shows={shows} multas={multas} onRegisterShow={registerShow} onAddMulta={addMulta} onUpdateShow={updateShow} onDeleteShow={deleteShow} paquetes={paquetes} onUpdatePaquetes={setPaquetes}/>}
          {page==="rolpago"       && <RolPagoPage payments={payments} shows={shows} multas={multas} onSavePayment={savePayment} onDeletePayment={deletePayment}/>}
          {page==="rolindividual" && <RolIndividualPage payments={payments} shows={shows} multas={multas}/>}
          {page==="cuentas"       && <CuentasPage principal={principal} cajachica={cajachica} onAddMovimiento={addMovimiento} shows={shows}/>}
          {page==="multas"        && <MultasPage multas={multas} onAddMulta={addMulta} onDeleteMulta={deleteMulta}/>}
          {page==="resumen"       && <ResumenPage shows={shows} multas={multas} principal={principal} cajachica={cajachica} payments={payments}/>}
          {page==="recibos"       && <RecibosPage shows={shows}/>}
          {page==="historial"     && <HistorialPage shows={shows} multas={multas} payments={payments}/>}
          {page==="miembros"      && <MiembrosPage/>}
        </main>
      </div>
    </>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
