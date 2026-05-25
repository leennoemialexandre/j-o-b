import { useState, useEffect } from "react";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kkexwatcagkuixnroryw.supabase.co";
const SUPABASE_KEY = "sb_publishable_NtZojTQ1UyJVSFZKk66EUw_UrLMXa5V";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_STAGES = ["Saved","Applied","HireVue","Phone Screen","Interview","Offer","Rejected"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const STAGE_COLORS = {
  Saved:          { accent:"#94a3b8", bg:"#f1f5f9", text:"#64748b" },
  Applied:        { accent:"#3b82f6", bg:"#eff6ff",  text:"#2563eb" },
  HireVue:        { accent:"#8b5cf6", bg:"#f5f3ff",  text:"#7c3aed" },
  "Phone Screen": { accent:"#f59e0b", bg:"#fffbeb",  text:"#d97706" },
  Interview:      { accent:"#0891b2", bg:"#ecfeff",  text:"#0e7490" },
  Offer:          { accent:"#10b981", bg:"#ecfdf5",  text:"#059669" },
  Rejected:       { accent:"#ef4444", bg:"#fef2f2",  text:"#dc2626" },
};
const fallbackColor = { accent:"#a855f7", bg:"#faf5ff", text:"#9333ea" };
const sc = (s) => STAGE_COLORS[s] || fallbackColor;

const INDUSTRY_PRESETS = ["Technology","Finance","Healthcare","Education","Media","Consulting","Government","Retail","Non-profit","Other"];
const JOB_TYPE_PRESETS = ["Full-time","Part-time","Internship","Co-op","Contract","Freelance"];

const EMPTY_FORM = {
  company:"", role:"", status:"Saved", industry:"", industryCustom:"",
  jobType:"", jobTypeCustom:"", cycle:"", link:"", email:"", notes:"",
  resumeText:"", coverLetter:"", location:"", workType:"",
  dateAdded: new Date().toISOString().split("T")[0],
};

const DEFAULT_GOAL = { enabled:false, type:"weekly", target:5, days:[1,2,3,4,5] };

const Icon = ({ name, size=16, color="currentColor" }) => {
  const paths = {
    plus:     <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:    <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    link:     <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    board:    <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    list:     <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    search:   <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    warn:     <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    check:    <><polyline points="20 6 9 17 4 12"/></>,
    target:   <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    eye:      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    logout:   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

function GoalBar({ goal, apps }) {
  if (!goal.enabled) return null;
  const today = new Date();
  const todayIdx = today.getDay();
  const todayStr = today.toISOString().split("T")[0];
  let count=0, label="", pct=0, inactive=false, inactiveMsg="";
  if (goal.type==="weekly") {
    const ws=new Date(today); ws.setDate(today.getDate()-todayIdx); ws.setHours(0,0,0,0);
    const we=new Date(ws); we.setDate(ws.getDate()+7);
    count=apps.filter(a=>{const d=new Date(a.date_added);return d>=ws&&d<we&&a.status!=="Saved";}).length;
    label=`${count}/${goal.target} this week`; pct=Math.min(count/goal.target,1);
  } else {
    if (!goal.days.includes(todayIdx)) {
      inactive=true;
      const next=goal.days.find(d=>d>todayIdx)??goal.days[0];
      inactiveMsg=`No goal today · next: ${DAY_FULL[next]}`;
    } else {
      count=apps.filter(a=>a.date_added===todayStr&&a.status!=="Saved").length;
      label=`${count}/${goal.target} today`; pct=Math.min(count/goal.target,1);
    }
  }
  if (inactive) return (
    <div style={{display:"flex",alignItems:"center",gap:"7px",fontSize:"0.7rem",color:"#94a3b8"}}>
      <Icon name="target" size={13} color="#cbd5e1"/>{inactiveMsg}
    </div>
  );
  const done=pct>=1;
  return (
    <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:"190px"}}>
      <Icon name="target" size={13} color={done?"#10b981":"#3b82f6"}/>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}>
          <span style={{fontSize:"0.68rem",color:done?"#059669":"#64748b",fontWeight:done?600:400}}>{label}</span>
          {done&&<span style={{fontSize:"0.65rem",color:"#059669",fontWeight:600}}>✓ Goal met!</span>}
        </div>
        <div style={{background:"#e2e8f0",borderRadius:"99px",height:"5px"}}>
          <div style={{background:done?"#10b981":"#3b82f6",width:`${pct*100}%`,height:"5px",borderRadius:"99px",transition:"width 0.4s ease"}}/>
        </div>
      </div>
    </div>
  );
}

// ── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const S = {
    wrap:  { minHeight:"100vh", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Mono',monospace" },
    box:   { background:"#fff", border:"1px solid #e2e8f0", borderRadius:"12px", padding:"36px", width:"100%", maxWidth:"380px", boxShadow:"0 4px 24px rgba(0,0,0,0.07)" },
    logo:  { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.4rem", color:"#0f172a", marginBottom:"6px" },
    sub:   { fontSize:"0.75rem", color:"#94a3b8", marginBottom:"28px" },
    label: { display:"block", fontSize:"0.68rem", color:"#94a3b8", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.08em" },
    input: { width:"100%", padding:"10px 12px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"6px", color:"#1e293b", fontSize:"0.82rem", fontFamily:"'DM Mono',monospace", outline:"none", boxSizing:"border-box", marginBottom:"14px" },
    btn:   { width:"100%", padding:"11px", background:"#3b82f6", color:"#fff", border:"none", borderRadius:"6px", fontSize:"0.8rem", fontFamily:"'DM Mono',monospace", cursor:"pointer", fontWeight:600 },
    toggle:{ textAlign:"center", marginTop:"16px", fontSize:"0.73rem", color:"#64748b" },
    link:  { color:"#3b82f6", cursor:"pointer", textDecoration:"underline" },
    err:   { fontSize:"0.72rem", color:"#dc2626", marginBottom:"12px", padding:"8px 10px", background:"#fef2f2", borderRadius:"6px", border:"1px solid #fecaca" },
    ok:    { fontSize:"0.72rem", color:"#059669", marginBottom:"12px", padding:"8px 10px", background:"#ecfdf5", borderRadius:"6px", border:"1px solid #a7f3d0" },
  };

  const submit = async () => {
    setError(""); setSuccess(""); setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setSuccess("Account created! You can now log in.");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Job Hunt</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400&display=swap"/>
      </Head>
      <div style={S.wrap}>
        <div style={S.box}>
          <div style={S.logo}>Job<span style={{color:"#3b82f6"}}> Hunt</span></div>
          <div style={S.sub}>{mode==="login"?"Sign in to your account":"Create your account"}</div>
          {error && <div style={S.err}>{error}</div>}
          {success && <div style={S.ok}>{success}</div>}
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()}/>
          <button style={S.btn} onClick={submit} disabled={loading}>
            {loading ? "..." : mode==="login" ? "Sign In" : "Create Account"}
          </button>
          <div style={S.toggle}>
            {mode==="login" ? <>No account? <span style={S.link} onClick={()=>{setMode("signup");setError("");}}>Sign up</span></> 
                           : <>Have an account? <span style={S.link} onClick={()=>{setMode("login");setError("");}}>Sign in</span></>}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc",fontFamily:"'DM Mono',monospace"}}>
      <span style={{color:"#3b82f6",letterSpacing:"0.15em"}}>loading...</span>
    </div>
  );

  if (!session) return <AuthScreen/>;
  return <Tracker session={session}/>;
}

function Tracker({ session }) {
  const [apps, setApps]       = useState([]);
  const [stages, setStages]   = useState(DEFAULT_STAGES);
  const [goal, setGoal]       = useState(DEFAULT_GOAL);
  const [loaded, setLoaded]   = useState(false);
  const [view, setView]       = useState("board");
  const [filterStage, setFS]  = useState("All");
  const [filterInd, setFI]    = useState("All");
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editId, setEditId]   = useState(null);
  const [detailApp, setDA]    = useState(null);
  const [resumeTab, setRT]    = useState("resume");
  const [viewRes, setViewRes] = useState(false);
  const [viewCL, setViewCL]   = useState(false);
  const [stageInput, setStgIn]= useState("");
  const [goalDraft, setGD]    = useState(DEFAULT_GOAL);
  const [toast, setToast]     = useState(null);
  const [saving, setSaving]   = useState(false);

  const uid = session.user.id;
  const toast$ = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),2800); };

  // Load data
  useEffect(() => {
    (async () => {
      const [{ data: appsData }, { data: goalData }, { data: stagesData }] = await Promise.all([
        supabase.from("applications").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("goals").select("*").eq("user_id", uid).single(),
        supabase.from("stages").select("*").eq("user_id", uid).single(),
      ]);
      if (appsData) setApps(appsData);
      if (goalData) { const g={enabled:goalData.enabled,type:goalData.type,target:goalData.target,days:goalData.days}; setGoal(g); setGD(g); }
      if (stagesData) setStages(stagesData.stages);
      setLoaded(true);
    })();
  }, [uid]);

  const persistApps = (next) => setApps(next);

  const persistStages = async (next) => {
    setStages(next);
    await supabase.from("stages").upsert({ user_id: uid, stages: next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  };

  const persistGoal = async (next) => {
    setGoal(next);
    await supabase.from("goals").upsert({ user_id: uid, ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  };

  const openAdd    = () => { setForm(EMPTY_FORM); setEditId(null); setRT("resume"); setModal("add"); };
  const openEdit   = a  => { setForm({
    company: a.company, role: a.role, status: a.status, industry: a.industry||"",
    industryCustom:"", jobType: a.job_type||"", jobTypeCustom:"", cycle: a.cycle||"",
    link: a.link||"", email: a.email||"", notes: a.notes||"",
    resumeText: a.resume_text||"", coverLetter: a.cover_letter||"",
    location: a.location||"", workType: a.work_type||"",
    dateAdded: a.date_added||new Date().toISOString().split("T")[0],
  }); setEditId(a.id); setRT("resume"); setModal("edit"); };
  const openDetail = a  => { setDA(a); setViewRes(false); setViewCL(false); setModal("detail"); };

  const submitForm = async () => {
    if (!form.company.trim()||!form.role.trim()) return toast$("Company & Role required", false);
    setSaving(true);
    const industry = form.industry==="__custom__"?form.industryCustom:form.industry;
    const jobType  = form.jobType==="__custom__"?form.jobTypeCustom:form.jobType;
    const payload = {
      user_id: uid, company: form.company, role: form.role, status: form.status,
      industry, job_type: jobType, cycle: form.cycle, link: form.link,
      email: form.email, notes: form.notes, resume_text: form.resumeText,
      cover_letter: form.coverLetter, date_added: form.dateAdded,
      location: form.location, work_type: form.workType,
    };
    if (editId) {
      const { data } = await supabase.from("applications").update(payload).eq("id", editId).select().single();
      if (data) setApps(apps.map(a=>a.id===editId?data:a));
    } else {
      const { data } = await supabase.from("applications").insert(payload).select().single();
      if (data) setApps([data, ...apps]);
    }
    setSaving(false); setModal(null); toast$(editId?"Updated!":"Application added!");
  };

  const deleteApp = async (id) => {
    await supabase.from("applications").delete().eq("id", id);
    setApps(apps.filter(a=>a.id!==id)); setModal(null); toast$("Deleted.");
  };

  const updateStatus = async (id, status) => {
    await supabase.from("applications").update({ status }).eq("id", id);
    setApps(apps.map(a=>a.id===id?{...a,status}:a));
  };

  const industries = ["All",...Array.from(new Set(apps.map(a=>a.industry).filter(Boolean)))];
  const filtered = apps.filter(a=>{
    const ms=filterStage==="All"||a.status===filterStage;
    const mi=filterInd==="All"||a.industry===filterInd;
    const mq=!search||a.company.toLowerCase().includes(search.toLowerCase())||a.role.toLowerCase().includes(search.toLowerCase());
    return ms&&mi&&mq;
  });
  const byStage = s => filtered.filter(a=>a.status===s);
  const total  = apps.length;
  const active = apps.filter(a=>!["Rejected","Offer"].includes(a.status)).length;

  const S = {
    app:      { fontFamily:"'DM Mono',monospace", background:"#f8fafc", minHeight:"100vh", color:"#1e293b", padding:0 },
    header:   { borderBottom:"1px solid #e2e8f0", padding:"14px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", gap:"16px", flexWrap:"wrap" },
    logo:     { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.1rem", color:"#0f172a", letterSpacing:"-0.02em" },
    logoSpan: { color:"#3b82f6" },
    stats:    { display:"flex", gap:"20px", fontSize:"0.72rem", color:"#94a3b8" },
    statVal:  { color:"#475569", fontWeight:600 },
    btn:      { display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", transition:"all 0.15s" },
    btnP:     { background:"#3b82f6", color:"#fff" },
    btnG:     { background:"#fff", color:"#64748b", border:"1px solid #e2e8f0" },
    btnA:     { background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe" },
    toolbar:  { padding:"14px 28px", display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap", borderBottom:"1px solid #e2e8f0", background:"#fff" },
    sw:       { position:"relative", flex:1, minWidth:"180px" },
    si:       { width:"100%", padding:"7px 12px 7px 34px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"6px", color:"#1e293b", fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", outline:"none", boxSizing:"border-box" },
    sico:     { position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", opacity:0.35 },
    sel:      { padding:"7px 12px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"6px", color:"#475569", fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", outline:"none" },
    body:     { padding:"24px 28px" },
    board:    { display:"flex", gap:"14px", overflowX:"auto", paddingBottom:"16px" },
    col:      { minWidth:"230px", flex:"0 0 230px" },
    colH:     { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px", padding:"0 2px" },
    colT:     { fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.78rem", letterSpacing:"0.06em", textTransform:"uppercase" },
    colC:     { fontSize:"0.68rem", color:"#94a3b8", background:"#f1f5f9", padding:"2px 7px", borderRadius:"20px" },
    card:     { background:"#fff", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"13px 14px", marginBottom:"9px", cursor:"pointer", transition:"all 0.15s", boxShadow:"0 1px 2px rgba(0,0,0,0.04)" },
    cardCo:   { fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.82rem", color:"#0f172a", marginBottom:"2px" },
    cardR:    { fontSize:"0.72rem", color:"#94a3b8", marginBottom:"8px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
    cardM:    { display:"flex", gap:"6px", flexWrap:"wrap" },
    tag:      { fontSize:"0.62rem", padding:"2px 7px", borderRadius:"20px", border:"1px solid" },
    table:    { width:"100%", borderCollapse:"collapse", fontSize:"0.75rem" },
    th:       { textAlign:"left", padding:"10px 14px", borderBottom:"1px solid #e2e8f0", color:"#94a3b8", fontWeight:400, fontFamily:"'DM Mono',monospace", fontSize:"0.68rem", textTransform:"uppercase", letterSpacing:"0.08em", background:"#fff" },
    td:       { padding:"11px 14px", borderBottom:"1px solid #f1f5f9", verticalAlign:"middle" },
    ov:       { position:"fixed", inset:0, background:"rgba(15,23,42,0.4)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
    mb:       { background:"#fff", border:"1px solid #e2e8f0", borderRadius:"12px", padding:"28px", width:"100%", maxWidth:"540px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.12)" },
    mt:       { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.1rem", marginBottom:"20px", color:"#0f172a" },
    lbl:      { display:"block", fontSize:"0.68rem", color:"#94a3b8", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.08em" },
    inp:      { width:"100%", padding:"9px 12px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"6px", color:"#1e293b", fontSize:"0.78rem", fontFamily:"'DM Mono',monospace", outline:"none", boxSizing:"border-box" },
    frow:     { marginBottom:"14px" },
    fgrid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" },
    mfoot:    { display:"flex", gap:"10px", marginTop:"24px", justifyContent:"flex-end" },
    toastBox: { position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", padding:"10px 20px", borderRadius:"8px", fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", zIndex:999, display:"flex", alignItems:"center", gap:"8px" },
  };

  if (!loaded) return (
    <div style={{...S.app,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}>
      <span style={{color:"#3b82f6",fontSize:"0.8rem",letterSpacing:"0.15em"}}>loading...</span>
    </div>
  );

  return (
    <>
      <Head>
        <title>Job Hunt</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400&display=swap"/>
      </Head>
      <div style={S.app}>
        {/* HEADER */}
        <header style={S.header}>
          <div style={{display:"flex",alignItems:"center",gap:"24px",flexWrap:"wrap"}}>
            <div style={S.logo}>Job<span style={S.logoSpan}> Hunt</span></div>
            <div style={S.stats}>
              <span><span style={S.statVal}>{total}</span> total</span>
              <span><span style={S.statVal}>{active}</span> active</span>
              <span><span style={{...S.statVal,color:"#059669"}}>{apps.filter(a=>a.status==="Offer").length}</span> offers</span>
            </div>
            <GoalBar goal={goal} apps={apps}/>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:"0.7rem",color:"#94a3b8",maxWidth:"150px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.user.email}</span>
            <button style={{...S.btn,...S.btnG}} onClick={()=>{setGD({...goal});setModal("settings")}}><Icon name="settings" size={14}/></button>
            <button style={{...S.btn,...(view==="board"?S.btnA:S.btnG)}} onClick={()=>setView("board")}><Icon name="board" size={14}/> Board</button>
            <button style={{...S.btn,...(view==="list"?S.btnA:S.btnG)}}  onClick={()=>setView("list")}><Icon name="list"  size={14}/> List</button>
            <button style={{...S.btn,...S.btnP}} onClick={openAdd}><Icon name="plus" size={14}/> Add Job</button>
            <button style={{...S.btn,...S.btnG,color:"#ef4444"}} onClick={()=>supabase.auth.signOut()}><Icon name="logout" size={14}/></button>
          </div>
        </header>

        {/* TOOLBAR */}
        <div style={S.toolbar}>
          <div style={S.sw}>
            <span style={S.sico}><Icon name="search" size={14}/></span>
            <input style={S.si} placeholder="Search company or role..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select style={S.sel} value={filterStage} onChange={e=>setFS(e.target.value)}>
            <option>All</option>{stages.map(s=><option key={s}>{s}</option>)}
          </select>
          <select style={S.sel} value={filterInd} onChange={e=>setFI(e.target.value)}>
            {industries.map(i=><option key={i}>{i}</option>)}
          </select>
          <span style={{fontSize:"0.7rem",color:"#94a3b8",marginLeft:"auto"}}>{filtered.length} result{filtered.length!==1?"s":""}</span>
        </div>

        {/* BODY */}
        <div style={S.body}>
          {view==="board" ? (
            <div style={S.board}>
              {stages.map(s=>{
                const cards=byStage(s),c=sc(s);
                return (
                  <div key={s} style={S.col}>
                    <div style={S.colH}>
                      <span style={{...S.colT,color:c.text}}>{s}</span>
                      <span style={S.colC}>{cards.length}</span>
                    </div>
                    {cards.length===0&&<div style={{border:"1px dashed #e2e8f0",borderRadius:"8px",padding:"20px",textAlign:"center",color:"#cbd5e1",fontSize:"0.68rem"}}>empty</div>}
                    {cards.map(app=>(
                      <div key={app.id} style={{...S.card,borderLeft:`3px solid ${c.accent}`}}
                        onClick={()=>openDetail(app)}
                        onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
                        <div style={S.cardCo}>{app.company}</div>
                        <div style={S.cardR}>{app.role}</div>
                        <div style={S.cardM}>
                          {app.job_type&&<span style={{...S.tag,color:"#2563eb",borderColor:"#bfdbfe",background:"#eff6ff"}}>{app.job_type}</span>}
                          {app.work_type&&<span style={{...S.tag,color:"#0e7490",borderColor:"#a5f3fc",background:"#ecfeff"}}>{app.work_type}</span>}
                          {app.cycle&&<span style={{...S.tag,color:"#94a3b8",borderColor:"#e2e8f0",background:"#f8fafc"}}>{app.cycle}</span>}
                          {app.resume_text&&<span style={{...S.tag,color:"#059669",borderColor:"#a7f3d0",background:"#ecfdf5"}}>resume</span>}
                          {app.cover_letter&&<span style={{...S.tag,color:"#7c3aed",borderColor:"#ddd6fe",background:"#f5f3ff"}}>cover letter</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <table style={S.table}>
              <thead><tr>{["Company","Role","Status","Type","Industry","Cycle","Date","Docs",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.length===0&&<tr><td colSpan={9} style={{...S.td,color:"#cbd5e1",textAlign:"center",padding:"40px"}}>No applications found.</td></tr>}
                {filtered.map(app=>{
                  const c=sc(app.status);
                  return (
                    <tr key={app.id} style={{cursor:"pointer"}} onClick={()=>openDetail(app)}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{...S.td,fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#0f172a"}}>{app.company}</td>
                      <td style={{...S.td,color:"#475569"}}>{app.role}</td>
                      <td style={S.td}><span style={{...S.tag,color:c.text,borderColor:c.accent+"55",background:c.bg,fontSize:"0.68rem"}}>{app.status}</span></td>
                      <td style={{...S.td,color:"#94a3b8"}}>{app.job_type||"—"}</td>
                      <td style={{...S.td,color:"#94a3b8"}}>{app.industry||"—"}</td>
                      <td style={{...S.td,color:"#94a3b8"}}>{app.cycle||"—"}</td>
                      <td style={{...S.td,color:"#94a3b8"}}>{app.date_added||"—"}</td>
                      <td style={S.td}>
                        <div style={{display:"flex",gap:"4px"}}>
                          {app.resume_text&&<span style={{...S.tag,color:"#059669",borderColor:"#a7f3d0",background:"#ecfdf5",fontSize:"0.62rem"}}>R</span>}
                          {app.cover_letter&&<span style={{...S.tag,color:"#7c3aed",borderColor:"#ddd6fe",background:"#f5f3ff",fontSize:"0.62rem"}}>CL</span>}
                        </div>
                      </td>
                      <td style={S.td} onClick={e=>{e.stopPropagation();openEdit(app);}}><span style={{color:"#cbd5e1",cursor:"pointer"}}><Icon name="edit" size={14}/></span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ADD/EDIT MODAL */}
        {(modal==="add"||modal==="edit")&&(
          <div style={S.ov} onClick={()=>setModal(null)}>
            <div style={S.mb} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
                <div style={S.mt}>{modal==="edit"?"Edit Application":"New Application"}</div>
                <button style={{...S.btn,...S.btnG,padding:"5px 8px"}} onClick={()=>setModal(null)}><Icon name="x" size={14}/></button>
              </div>
              <div style={S.frow}>
                <label style={S.lbl}>Job Posting URL</label>
                <input style={S.inp} placeholder="https://..." value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))}/>
              </div>
              <div style={S.fgrid}>
                <div><label style={S.lbl}>Company *</label><input style={S.inp} value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} placeholder="Google"/></div>
                <div><label style={S.lbl}>Role *</label><input style={S.inp} value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="APM Intern"/></div>
              </div>
              <div style={S.fgrid}>
                <div>
                  <label style={S.lbl}>Status</label>
                  <select style={S.inp} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>{stages.map(s=><option key={s}>{s}</option>)}</select>
                </div>
                <div><label style={S.lbl}>Date Added</label><input type="date" style={S.inp} value={form.dateAdded} onChange={e=>setForm(f=>({...f,dateAdded:e.target.value}))}/></div>
              </div>
              <div style={S.fgrid}>
                <div>
                  <label style={S.lbl}>Job Type</label>
                  <select style={S.inp} value={form.jobType} onChange={e=>setForm(f=>({...f,jobType:e.target.value}))}>
                    <option value="">Select...</option>{JOB_TYPE_PRESETS.map(j=><option key={j}>{j}</option>)}<option value="__custom__">Other</option>
                  </select>
                  {form.jobType==="__custom__"&&<input style={{...S.inp,marginTop:"6px"}} placeholder="e.g. Fellowship" value={form.jobTypeCustom} onChange={e=>setForm(f=>({...f,jobTypeCustom:e.target.value}))}/>}
                </div>
                <div>
                  <label style={S.lbl}>Industry</label>
                  <select style={S.inp} value={form.industry} onChange={e=>setForm(f=>({...f,industry:e.target.value}))}>
                    <option value="">Select...</option>{INDUSTRY_PRESETS.filter(i=>i!=="Other").map(i=><option key={i}>{i}</option>)}<option value="__custom__">Other (specify)</option>
                  </select>
                  {form.industry==="__custom__"&&<input style={{...S.inp,marginTop:"6px"}} placeholder="e.g. Biotech" value={form.industryCustom} onChange={e=>setForm(f=>({...f,industryCustom:e.target.value}))}/>}
                </div>
              </div>
              <div style={S.fgrid}>
                <div><label style={S.lbl}>Location</label><input style={S.inp} placeholder="e.g. New York, NY" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/></div>
                <div>
                  <label style={S.lbl}>Work Type</label>
                  <select style={S.inp} value={form.workType} onChange={e=>setForm(f=>({...f,workType:e.target.value}))}>
                    <option value="">Select...</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </div>
              </div>
              <div style={S.frow}><label style={S.lbl}>Application Cycle</label><input style={S.inp} placeholder="e.g. Fall 2026" value={form.cycle} onChange={e=>setForm(f=>({...f,cycle:e.target.value}))}/></div>
              <div style={S.frow}><label style={S.lbl}>Email Used</label><input style={S.inp} placeholder="you@email.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
              <div style={S.frow}>
                <label style={S.lbl}>Notes</label>
                <textarea style={{...S.inp,minHeight:"60px",resize:"vertical"}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Password hints, contacts, etc."/>
              </div>
              {/* Resume / Cover Letter tabs */}
              <div style={S.frow}>
                <div style={{display:"flex",marginBottom:"10px",border:"1px solid #e2e8f0",borderRadius:"6px",overflow:"hidden",width:"fit-content"}}>
                  {[["resume","Resume"],["cover","Cover Letter"]].map(([t,l])=>(
                    <button key={t} style={{...S.btn,borderRadius:0,border:"none",padding:"6px 16px",fontSize:"0.7rem",
                      background:resumeTab===t?"#eff6ff":"#f8fafc",color:resumeTab===t?"#2563eb":"#94a3b8",fontWeight:resumeTab===t?600:400}}
                      onClick={()=>setRT(t)}>{l}</button>
                  ))}
                </div>
                {resumeTab==="resume"
                  ? <textarea style={{...S.inp,minHeight:"100px",resize:"vertical",fontSize:"0.72rem"}} value={form.resumeText} onChange={e=>setForm(f=>({...f,resumeText:e.target.value}))} placeholder="Paste your resume text here..."/>
                  : <textarea style={{...S.inp,minHeight:"100px",resize:"vertical",fontSize:"0.72rem"}} value={form.coverLetter} onChange={e=>setForm(f=>({...f,coverLetter:e.target.value}))} placeholder="Paste your cover letter here..."/>
                }
              </div>
              <div style={S.mfoot}>
                {modal==="edit"&&<button style={{...S.btn,background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",marginRight:"auto"}} onClick={()=>deleteApp(editId)}><Icon name="trash" size={13}/> Delete</button>}
                <button style={{...S.btn,...S.btnG}} onClick={()=>setModal(null)}>Cancel</button>
                <button style={{...S.btn,...S.btnP}} onClick={submitForm} disabled={saving}><Icon name="check" size={13}/>{saving?"Saving...":modal==="edit"?"Save Changes":"Add Application"}</button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL MODAL */}
        {modal==="detail"&&detailApp&&(()=>{
          const app=apps.find(a=>a.id===detailApp.id)||detailApp;
          return (
            <div style={S.ov} onClick={()=>setModal(null)}>
              <div style={{...S.mb,maxWidth:"500px"}} onClick={e=>e.stopPropagation()}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#0f172a"}}>{app.company}</div>
                    <div style={{color:"#94a3b8",fontSize:"0.82rem",marginTop:"2px"}}>{app.role}</div>
                  </div>
                  <button style={{...S.btn,...S.btnG,padding:"5px 8px"}} onClick={()=>setModal(null)}><Icon name="x" size={14}/></button>
                </div>
                <div style={{marginBottom:"18px"}}>
                  <label style={S.lbl}>Status</label>
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                    {stages.map(s=>{const cc=sc(s),on=app.status===s;
                      return <button key={s} style={{...S.btn,padding:"5px 11px",fontSize:"0.68rem",background:on?cc.bg:"#f8fafc",color:on?cc.text:"#94a3b8",border:`1px solid ${on?cc.accent+"88":"#e2e8f0"}`}}
                        onClick={()=>updateStatus(app.id,s)}>{s}</button>;
                    })}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 20px",fontSize:"0.75rem",marginBottom:"16px"}}>
                  {[["Job Type",app.job_type],["Industry",app.industry],["Location",app.location],["Work Type",app.work_type],["Cycle",app.cycle],["Date Added",app.date_added]].map(([k,v])=>v&&(
                    <div key={k}><div style={{...S.lbl,marginBottom:"2px"}}>{k}</div><div style={{color:"#475569"}}>{v}</div></div>
                  ))}
                </div>
                {app.email&&<div style={{marginBottom:"12px"}}><div style={S.lbl}>Email Used</div><div style={{color:"#2563eb",fontSize:"0.75rem"}}>{app.email}</div></div>}
                {app.link&&<div style={{marginBottom:"12px"}}>
                  <div style={S.lbl}>Link</div>
                  <a href={app.link} target="_blank" rel="noreferrer" style={{color:"#2563eb",fontSize:"0.72rem",display:"flex",gap:"5px",alignItems:"center"}} onClick={e=>e.stopPropagation()}>
                    <Icon name="link" size={12}/>{app.link.length>55?app.link.slice(0,55)+"…":app.link}
                  </a>
                </div>}
                {app.notes&&<div style={{marginBottom:"16px"}}>
                  <div style={S.lbl}>Notes</div>
                  <div style={{color:"#475569",fontSize:"0.75rem",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"6px",padding:"10px",whiteSpace:"pre-wrap"}}>{app.notes}</div>
                </div>}
                {app.resume_text&&<div style={{marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                    <label style={S.lbl}>Resume</label>
                    <button style={{...S.btn,...S.btnG,padding:"4px 10px",fontSize:"0.65rem"}} onClick={()=>setViewRes(v=>!v)}><Icon name="eye" size={11}/>{viewRes?"Hide":"View"}</button>
                  </div>
                  {viewRes?<div style={{color:"#475569",fontSize:"0.7rem",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"6px",padding:"12px",whiteSpace:"pre-wrap",maxHeight:"180px",overflowY:"auto",lineHeight:1.6}}>{app.resume_text}</div>
                  :<div style={{fontSize:"0.7rem",color:"#059669"}}>✓ Resume saved</div>}
                </div>}
                {app.cover_letter&&<div style={{marginBottom:"16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                    <label style={S.lbl}>Cover Letter</label>
                    <button style={{...S.btn,...S.btnG,padding:"4px 10px",fontSize:"0.65rem"}} onClick={()=>setViewCL(v=>!v)}><Icon name="eye" size={11}/>{viewCL?"Hide":"View"}</button>
                  </div>
                  {viewCL?<div style={{color:"#475569",fontSize:"0.7rem",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"6px",padding:"12px",whiteSpace:"pre-wrap",maxHeight:"180px",overflowY:"auto",lineHeight:1.6}}>{app.cover_letter}</div>
                  :<div style={{fontSize:"0.7rem",color:"#7c3aed"}}>✓ Cover letter saved</div>}
                </div>}
                <div style={S.mfoot}>
                  <button style={{...S.btn,background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",marginRight:"auto"}} onClick={()=>deleteApp(app.id)}><Icon name="trash" size={13}/> Delete</button>
                  <button style={{...S.btn,...S.btnG}} onClick={()=>setModal(null)}>Close</button>
                  <button style={{...S.btn,...S.btnP}} onClick={()=>openEdit(app)}><Icon name="edit" size={13}/> Edit</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SETTINGS */}
        {modal==="settings"&&(
          <div style={S.ov} onClick={()=>setModal(null)}>
            <div style={{...S.mb,maxWidth:"460px"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
                <div style={S.mt}>Settings</div>
                <button style={{...S.btn,...S.btnG,padding:"5px 8px"}} onClick={()=>setModal(null)}><Icon name="x" size={14}/></button>
              </div>
              <div style={{marginBottom:"24px"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.88rem",color:"#0f172a",marginBottom:"14px",display:"flex",alignItems:"center",gap:"7px"}}>
                  <Icon name="target" size={15} color="#3b82f6"/> Application Goal
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
                  <input type="checkbox" id="ge" checked={goalDraft.enabled} onChange={e=>setGD(g=>({...g,enabled:e.target.checked}))} style={{width:"16px",height:"16px",accentColor:"#3b82f6",cursor:"pointer"}}/>
                  <label htmlFor="ge" style={{fontSize:"0.78rem",color:"#475569",cursor:"pointer"}}>Enable goal tracking</label>
                </div>
                {goalDraft.enabled&&<>
                  <div style={S.fgrid}>
                    <div>
                      <label style={S.lbl}>Goal Type</label>
                      <select style={S.inp} value={goalDraft.type} onChange={e=>setGD(g=>({...g,type:e.target.value}))}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly total</option>
                        <option value="specific_days">Specific days</option>
                      </select>
                    </div>
                    <div>
                      <label style={S.lbl}>Target # of Apps</label>
                      <input type="number" min="1" max="99" style={S.inp} value={goalDraft.target} onChange={e=>setGD(g=>({...g,target:parseInt(e.target.value)||1}))}/>
                    </div>
                  </div>
                  {(goalDraft.type==="daily"||goalDraft.type==="specific_days")&&<div style={S.frow}>
                    <label style={S.lbl}>Active on</label>
                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                      {DAYS.map((d,i)=>{const on=goalDraft.days.includes(i);
                        return <button key={d} style={{...S.btn,padding:"5px 12px",fontSize:"0.68rem",background:on?"#eff6ff":"#f8fafc",color:on?"#2563eb":"#94a3b8",border:`1px solid ${on?"#bfdbfe":"#e2e8f0"}`}}
                          onClick={()=>setGD(g=>({...g,days:on?g.days.filter(x=>x!==i):[...g.days,i].sort()}))}>{d}</button>;
                      })}
                    </div>
                  </div>}
                </>}
              </div>
              <hr style={{border:"none",borderTop:"1px solid #f1f5f9",marginBottom:"20px"}}/>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.88rem",color:"#0f172a",marginBottom:"14px"}}>Manage Stages</div>
                <div style={{marginBottom:"12px"}}>
                  {stages.map((s,i)=>(
                    <div key={s} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"6px",marginBottom:"6px"}}>
                      <span style={{fontSize:"0.78rem",color:sc(s).text}}>{s}</span>
                      {!DEFAULT_STAGES.includes(s)&&<button style={{...S.btn,padding:"3px 7px",background:"transparent",color:"#94a3b8",border:"none"}}
                        onClick={()=>persistStages(stages.filter((_,j)=>j!==i))}><Icon name="x" size={12}/></button>}
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:"8px"}}>
                  <input style={{...S.inp,flex:1}} placeholder="New custom stage..." value={stageInput} onChange={e=>setStgIn(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&stageInput.trim()&&!stages.includes(stageInput.trim())){persistStages([...stages,stageInput.trim()]);setStgIn("");}}}/>
                  <button style={{...S.btn,...S.btnP}} onClick={()=>{if(stageInput.trim()&&!stages.includes(stageInput.trim())){persistStages([...stages,stageInput.trim()]);setStgIn("");}}}><Icon name="plus" size={13}/></button>
                </div>
                <div style={{marginTop:"6px",fontSize:"0.68rem",color:"#cbd5e1"}}>Default stages cannot be removed.</div>
              </div>
              <div style={S.mfoot}>
                <button style={{...S.btn,...S.btnG}} onClick={()=>setModal(null)}>Cancel</button>
                <button style={{...S.btn,...S.btnP}} onClick={()=>{persistGoal(goalDraft);setModal(null);toast$("Settings saved!");}}>
                  <Icon name="check" size={13}/> Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {toast&&(
          <div style={{...S.toastBox,background:toast.ok?"#ecfdf5":"#fef2f2",border:`1px solid ${toast.ok?"#6ee7b7":"#fca5a5"}`,color:toast.ok?"#059669":"#dc2626"}}>
            <Icon name={toast.ok?"check":"warn"} size={13}/>{toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
