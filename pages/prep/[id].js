import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kkexwatcagkuixnroryw.supabase.co";
const SUPABASE_KEY = "sb_publishable_NtZojTQ1UyJVSFZKk66EUw_UrLMXa5V";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const QUESTION_TYPES = ["Behavioral","Technical","Case","Culture"];
const ROUND_STATUSES = ["Upcoming","Completed","Cancelled"];

const Icon = ({ name, size=16, color="currentColor" }) => {
  const paths = {
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    edit:    <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash:   <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    back:    <><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>,
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff:  <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    check:   <><polyline points="20 6 9 17 4 12"/></>,
    save:    <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    link:    <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    star:    <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const TYPE_COLORS = {
  Behavioral: { color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
  Technical:  { color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
  Case:       { color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  Culture:    { color:"#059669", bg:"#ecfdf5", border:"#a7f3d0" },
};

const ROUND_STATUS_COLORS = {
  Upcoming:  { color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
  Completed: { color:"#059669", bg:"#ecfdf5", border:"#a7f3d0" },
  Cancelled: { color:"#dc2626", bg:"#fef2f2", border:"#fecaca" },
};

export default function PrepPage() {
  const router = useRouter();
  const { id } = router.query;

  const [session, setSession] = useState(null);
  const [app, setApp] = useState(null);
  const [prep, setPrep] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [questions, setQuestions] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  const [filterType, setFilterType] = useState("All");

  // Modals
  const [modal, setModal] = useState(null);
  const [roundForm, setRoundForm] = useState({ round_name:"", interview_date:"", interviewer_name:"", interviewer_title:"", status:"Upcoming" });
  const [editRoundId, setEditRoundId] = useState(null);
  const [qForm, setQForm] = useState({ question:"", type:"Behavioral", answer:"", star_situation:"", star_task:"", star_action:"", star_result:"" });
  const [editQId, setEditQId] = useState(null);
  const [prepNotes, setPrepNotes] = useState("");
  const [researchLinks, setResearchLinks] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [revealedQ, setRevealedQ] = useState({});

  const toast$ = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),2500); };

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if (!session) { router.push("/"); return; }
      setSession(session);
    });
  },[]);

  useEffect(()=>{
    if (!id || !session) return;
    (async()=>{
      // Load application
      const {data:appData} = await supabase.from("applications").select("*").eq("id",id).single();
      if (!appData || appData.user_id!==session.user.id) { router.push("/"); return; }
      setApp(appData);

      // Load or create prep
      let {data:prepData} = await supabase.from("interview_prep").select("*").eq("application_id",id).single();
      if (!prepData) {
        const {data:newPrep} = await supabase.from("interview_prep").insert({ application_id:id, user_id:session.user.id, prep_notes:"", research_links:[] }).select().single();
        prepData = newPrep;
      }
      setPrep(prepData);
      setPrepNotes(prepData.prep_notes||"");
      setResearchLinks(prepData.research_links?.length ? prepData.research_links : [""]);

      // Load rounds
      const {data:roundsData} = await supabase.from("interview_rounds").select("*").eq("prep_id",prepData.id).order("created_at");
      const rs = roundsData||[];
      setRounds(rs);
      if (rs.length>0) setActiveRound(rs[0].id);

      // Load questions for all rounds
      if (rs.length>0) {
        const {data:qData} = await supabase.from("interview_questions").select("*").in("round_id",rs.map(r=>r.id)).order("created_at");
        const qMap = {};
        rs.forEach(r=>{ qMap[r.id]=[]; });
        (qData||[]).forEach(q=>{ if(qMap[q.round_id]) qMap[q.round_id].push(q); });
        setQuestions(qMap);
      }
      setLoaded(true);
    })();
  },[id,session]);

  // ── Round CRUD ──
  const openAddRound = () => { setRoundForm({round_name:"",interview_date:"",interviewer_name:"",interviewer_title:"",status:"Upcoming"}); setEditRoundId(null); setModal("round"); };
  const openEditRound = (r) => { setRoundForm({round_name:r.round_name,interview_date:r.interview_date?r.interview_date.slice(0,16):"",interviewer_name:r.interviewer_name||"",interviewer_title:r.interviewer_title||"",status:r.status}); setEditRoundId(r.id); setModal("round"); };

  const saveRound = async () => {
    if (!roundForm.round_name.trim()) return toast$("Round name required",false);
    setSaving(true);
    const payload = { prep_id:prep.id, user_id:session.user.id, ...roundForm, interview_date:roundForm.interview_date||null };
    if (editRoundId) {
      const {data} = await supabase.from("interview_rounds").update(payload).eq("id",editRoundId).select().single();
      if(data) { setRounds(rounds.map(r=>r.id===editRoundId?data:r)); }
    } else {
      const {data} = await supabase.from("interview_rounds").insert(payload).select().single();
      if(data) { setRounds([...rounds,data]); setQuestions(q=>({...q,[data.id]:[]})); setActiveRound(data.id); }
    }
    setSaving(false); setModal(null); toast$("Saved!");
  };

  const deleteRound = async (rid) => {
    await supabase.from("interview_rounds").delete().eq("id",rid);
    const newRounds = rounds.filter(r=>r.id!==rid);
    setRounds(newRounds);
    const newQ = {...questions}; delete newQ[rid]; setQuestions(newQ);
    setActiveRound(newRounds.length>0?newRounds[0].id:null);
    setModal(null); toast$("Round deleted.");
  };

  // ── Question CRUD ──
  const openAddQ = () => { setQForm({question:"",type:"Behavioral",answer:"",star_situation:"",star_task:"",star_action:"",star_result:""}); setEditQId(null); setModal("question"); };
  const openEditQ = (q) => { setQForm({question:q.question,type:q.type,answer:q.answer||"",star_situation:q.star_situation||"",star_task:q.star_task||"",star_action:q.star_action||"",star_result:q.star_result||""}); setEditQId(q.id); setModal("question"); };

  const saveQ = async () => {
    if (!qForm.question.trim()) return toast$("Question required",false);
    setSaving(true);
    const payload = { round_id:activeRound, user_id:session.user.id, ...qForm };
    if (editQId) {
      const {data} = await supabase.from("interview_questions").update(payload).eq("id",editQId).select().single();
      if(data) setQuestions(q=>({...q,[activeRound]:q[activeRound].map(x=>x.id===editQId?data:x)}));
    } else {
      const {data} = await supabase.from("interview_questions").insert(payload).select().single();
      if(data) setQuestions(q=>({...q,[activeRound]:[...(q[activeRound]||[]),data]}));
    }
    setSaving(false); setModal(null); toast$("Saved!");
  };

  const deleteQ = async (qid) => {
    await supabase.from("interview_questions").delete().eq("id",qid);
    setQuestions(q=>({...q,[activeRound]:q[activeRound].filter(x=>x.id!==qid)}));
    toast$("Deleted.");
  };

  // ── Prep notes save ──
  const savePrep = async () => {
    setSaving(true);
    const links = researchLinks.filter(l=>l.trim());
    await supabase.from("interview_prep").update({ prep_notes:prepNotes, research_links:links }).eq("id",prep.id);
    setSaving(false); toast$("Prep notes saved!");
  };

  const activeRoundData = rounds.find(r=>r.id===activeRound);
  const activeQs = (questions[activeRound]||[]).filter(q=>filterType==="All"||q.type===filterType);

  const S = {
    page:    { fontFamily:"'DM Mono',monospace", background:"#f8fafc", minHeight:"100vh", color:"#1e293b" },
    header:  { background:"#fff", borderBottom:"1px solid #e2e8f0", padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
    btn:     { display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px", borderRadius:"6px", border:"none", cursor:"pointer", fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", transition:"all 0.15s" },
    btnP:    { background:"#3b82f6", color:"#fff" },
    btnG:    { background:"#fff", color:"#64748b", border:"1px solid #e2e8f0" },
    btnA:    { background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe" },
    body:    { padding:"28px", display:"grid", gridTemplateColumns:"260px 1fr", gap:"24px", maxWidth:"1200px", margin:"0 auto" },
    card:    { background:"#fff", border:"1px solid #e2e8f0", borderRadius:"10px", padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
    lbl:     { display:"block", fontSize:"0.68rem", color:"#94a3b8", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.08em" },
    inp:     { width:"100%", padding:"9px 12px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"6px", color:"#1e293b", fontSize:"0.78rem", fontFamily:"'DM Mono',monospace", outline:"none", boxSizing:"border-box" },
    tag:     { fontSize:"0.62rem", padding:"2px 8px", borderRadius:"20px", border:"1px solid", display:"inline-block" },
    ov:      { position:"fixed", inset:0, background:"rgba(15,23,42,0.45)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
    mb:      { background:"#fff", border:"1px solid #e2e8f0", borderRadius:"12px", padding:"28px", width:"100%", maxWidth:"540px", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.12)" },
    mt:      { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.05rem", marginBottom:"18px", color:"#0f172a" },
    frow:    { marginBottom:"14px" },
    fgrid:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" },
    mfoot:   { display:"flex", gap:"10px", marginTop:"20px", justifyContent:"flex-end" },
    toastBox:{ position:"fixed", bottom:"24px", left:"50%", transform:"translateX(-50%)", padding:"10px 20px", borderRadius:"8px", fontSize:"0.75rem", fontFamily:"'DM Mono',monospace", zIndex:999, display:"flex", alignItems:"center", gap:"8px" },
  };

  if (!loaded) return (
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:"#3b82f6",letterSpacing:"0.15em"}}>loading...</span>
    </div>
  );

  return (
    <>
      <Head>
        <title>Interview Prep — {app?.company}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400&display=swap"/>
      </Head>
      <div style={S.page}>
        {/* HEADER */}
        <header style={S.header}>
          <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
            <button style={{...S.btn,...S.btnG}} onClick={()=>router.push("/")}><Icon name="back" size={14}/> Back</button>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.1rem",color:"#0f172a"}}>{app?.company}</div>
              <div style={{fontSize:"0.72rem",color:"#94a3b8"}}>{app?.role} · Interview Prep</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <button style={{...S.btn,...(mockMode?S.btnA:S.btnG)}} onClick={()=>{setMockMode(m=>!m);setRevealedQ({});}}>
              <Icon name={mockMode?"eyeoff":"eye"} size={14}/>{mockMode?"Exit Mock Mode":"Mock Mode"}
            </button>
            <button style={{...S.btn,...S.btnP}} onClick={savePrep} disabled={saving}><Icon name="save" size={14}/>{saving?"Saving...":"Save Prep Notes"}</button>
          </div>
        </header>

        <div style={S.body}>
          {/* LEFT SIDEBAR */}
          <div>
            {/* Rounds */}
            <div style={{...S.card,marginBottom:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.85rem",color:"#0f172a"}}>Interview Rounds</div>
                <button style={{...S.btn,...S.btnP,padding:"5px 10px",fontSize:"0.68rem"}} onClick={openAddRound}><Icon name="plus" size={12}/> Add</button>
              </div>
              {rounds.length===0&&<div style={{fontSize:"0.72rem",color:"#cbd5e1",textAlign:"center",padding:"12px 0"}}>No rounds yet</div>}
              {rounds.map(r=>{
                const sc=ROUND_STATUS_COLORS[r.status]||ROUND_STATUS_COLORS.Upcoming;
                const isActive=activeRound===r.id;
                return (
                  <div key={r.id} style={{padding:"10px 12px",borderRadius:"8px",marginBottom:"6px",cursor:"pointer",background:isActive?"#eff6ff":"#f8fafc",border:`1px solid ${isActive?"#bfdbfe":"#e2e8f0"}`}}
                    onClick={()=>setActiveRound(r.id)}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:"0.78rem",color:isActive?"#2563eb":"#0f172a"}}>{r.round_name}</div>
                      <button style={{...S.btn,padding:"2px 5px",background:"transparent",border:"none",color:"#94a3b8"}} onClick={e=>{e.stopPropagation();openEditRound(r);}}><Icon name="edit" size={12}/></button>
                    </div>
                    {r.interview_date&&<div style={{fontSize:"0.65rem",color:"#94a3b8",marginTop:"2px"}}>{new Date(r.interview_date).toLocaleDateString("en",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>}
                    {r.interviewer_name&&<div style={{fontSize:"0.65rem",color:"#64748b",marginTop:"2px"}}>👤 {r.interviewer_name}{r.interviewer_title?` · ${r.interviewer_title}`:""}</div>}
                    <div style={{marginTop:"6px"}}>
                      <span style={{...S.tag,color:sc.color,background:sc.bg,borderColor:sc.border,fontSize:"0.6rem"}}>{r.status}</span>
                      <span style={{marginLeft:"6px",fontSize:"0.62rem",color:"#94a3b8"}}>{(questions[r.id]||[]).length} Q</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prep Materials */}
            <div style={S.card}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"0.85rem",color:"#0f172a",marginBottom:"14px"}}>Prep Materials</div>
              <div style={{marginBottom:"14px"}}>
                <label style={S.lbl}>Research Links</label>
                {researchLinks.map((link,i)=>(
                  <div key={i} style={{display:"flex",gap:"6px",marginBottom:"6px"}}>
                    <input style={{...S.inp,flex:1,fontSize:"0.72rem"}} placeholder="https://..." value={link} onChange={e=>{const n=[...researchLinks];n[i]=e.target.value;setResearchLinks(n);}}/>
                    <button style={{...S.btn,padding:"5px 8px",...S.btnG,color:"#ef4444"}} onClick={()=>setResearchLinks(researchLinks.filter((_,j)=>j!==i))}><Icon name="x" size={12}/></button>
                  </div>
                ))}
                <button style={{...S.btn,...S.btnG,fontSize:"0.68rem",marginTop:"4px"}} onClick={()=>setResearchLinks([...researchLinks,""])}><Icon name="plus" size={12}/> Add link</button>
              </div>
              <div>
                <label style={S.lbl}>Company Notes</label>
                <textarea style={{...S.inp,minHeight:"120px",resize:"vertical",fontSize:"0.72rem"}} value={prepNotes} onChange={e=>setPrepNotes(e.target.value)} placeholder="Company background, culture, things to mention, talking points..."/>
              </div>
            </div>
          </div>

          {/* MAIN AREA */}
          <div>
            {!activeRound ? (
              <div style={{...S.card,textAlign:"center",padding:"60px",color:"#94a3b8"}}>
                <div style={{fontSize:"0.85rem",marginBottom:"12px"}}>No round selected</div>
                <button style={{...S.btn,...S.btnP,margin:"0 auto"}} onClick={openAddRound}><Icon name="plus" size={14}/> Add your first round</button>
              </div>
            ) : (
              <>
                {/* Round header */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:"1rem",color:"#0f172a"}}>{activeRoundData?.round_name}</div>
                    {activeRoundData?.interviewer_name&&<div style={{fontSize:"0.72rem",color:"#64748b",marginTop:"2px"}}>with {activeRoundData.interviewer_name}{activeRoundData.interviewer_title?`, ${activeRoundData.interviewer_title}`:""}</div>}
                  </div>
                  <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                    {/* Filter */}
                    <div style={{display:"flex",border:"1px solid #e2e8f0",borderRadius:"6px",overflow:"hidden"}}>
                      {["All",...QUESTION_TYPES].map(t=>(
                        <button key={t} style={{...S.btn,borderRadius:0,border:"none",padding:"5px 10px",fontSize:"0.67rem",
                          background:filterType===t?"#eff6ff":"#f8fafc",color:filterType===t?"#2563eb":"#94a3b8",fontWeight:filterType===t?600:400}}
                          onClick={()=>setFilterType(t)}>{t}</button>
                      ))}
                    </div>
                    <button style={{...S.btn,...S.btnP}} onClick={openAddQ}><Icon name="plus" size={14}/> Add Question</button>
                  </div>
                </div>

                {activeQs.length===0&&(
                  <div style={{...S.card,textAlign:"center",padding:"40px",color:"#94a3b8",fontSize:"0.78rem"}}>
                    No questions yet{filterType!=="All"?` for ${filterType} type`:""} — add one!
                  </div>
                )}

                {activeQs.map((q,idx)=>{
                  const tc=TYPE_COLORS[q.type]||TYPE_COLORS.Behavioral;
                  const revealed=revealedQ[q.id];
                  const isBehavioral=q.type==="Behavioral";
                  const hasSTAR=q.star_situation||q.star_task||q.star_action||q.star_result;
                  return (
                    <div key={q.id} style={{...S.card,marginBottom:"12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
                            <span style={{...S.tag,color:tc.color,background:tc.bg,borderColor:tc.border}}>{q.type}</span>
                            <span style={{fontSize:"0.65rem",color:"#94a3b8"}}>#{idx+1}</span>
                          </div>
                          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:"0.85rem",color:"#0f172a"}}>{q.question}</div>
                        </div>
                        <div style={{display:"flex",gap:"4px",marginLeft:"12px"}}>
                          <button style={{...S.btn,padding:"4px 8px",...S.btnG}} onClick={()=>openEditQ(q)}><Icon name="edit" size={12}/></button>
                          <button style={{...S.btn,padding:"4px 8px",background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca"}} onClick={()=>deleteQ(q.id)}><Icon name="trash" size={12}/></button>
                        </div>
                      </div>

                      {mockMode ? (
                        <div>
                          {!revealed ? (
                            <button style={{...S.btn,...S.btnG,fontSize:"0.7rem"}} onClick={()=>setRevealedQ(r=>({...r,[q.id]:true}))}><Icon name="eye" size={13}/> Reveal Answer</button>
                          ) : (
                            <div>
                              {isBehavioral&&hasSTAR ? (
                                <div style={{background:"#f8fafc",borderRadius:"8px",padding:"12px",border:"1px solid #e2e8f0"}}>
                                  {[["S","Situation",q.star_situation],["T","Task",q.star_task],["A","Action",q.star_action],["R","Result",q.star_result]].map(([letter,label,val])=>val&&(
                                    <div key={letter} style={{marginBottom:"8px"}}>
                                      <span style={{fontSize:"0.65rem",fontWeight:700,color:"#3b82f6",marginRight:"6px"}}>{letter} — {label}</span>
                                      <div style={{fontSize:"0.75rem",color:"#475569",marginTop:"2px"}}>{val}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{background:"#f8fafc",borderRadius:"8px",padding:"12px",border:"1px solid #e2e8f0",fontSize:"0.75rem",color:"#475569",whiteSpace:"pre-wrap"}}>{q.answer||"No answer saved."}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {isBehavioral&&hasSTAR ? (
                            <div style={{background:"#f8fafc",borderRadius:"8px",padding:"12px",border:"1px solid #e2e8f0"}}>
                              <div style={{fontSize:"0.65rem",color:"#3b82f6",fontWeight:600,marginBottom:"8px",display:"flex",alignItems:"center",gap:"5px"}}><Icon name="star" size={11} color="#3b82f6"/> STAR Format</div>
                              {[["S","Situation",q.star_situation],["T","Task",q.star_task],["A","Action",q.star_action],["R","Result",q.star_result]].map(([letter,label,val])=>val&&(
                                <div key={letter} style={{marginBottom:"6px"}}>
                                  <span style={{fontSize:"0.65rem",fontWeight:700,color:"#3b82f6"}}>{letter} — {label}:</span>
                                  <div style={{fontSize:"0.73rem",color:"#475569",marginTop:"2px"}}>{val}</div>
                                </div>
                              ))}
                            </div>
                          ) : q.answer ? (
                            <div style={{background:"#f8fafc",borderRadius:"8px",padding:"12px",border:"1px solid #e2e8f0",fontSize:"0.75rem",color:"#475569",whiteSpace:"pre-wrap"}}>{q.answer}</div>
                          ) : (
                            <div style={{fontSize:"0.72rem",color:"#cbd5e1",fontStyle:"italic"}}>No answer yet — click edit to add one.</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* ROUND MODAL */}
        {modal==="round"&&(
          <div style={S.ov} onClick={()=>setModal(null)}>
            <div style={S.mb} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
                <div style={S.mt}>{editRoundId?"Edit Round":"Add Round"}</div>
                <button style={{...S.btn,...S.btnG,padding:"5px 8px"}} onClick={()=>setModal(null)}><Icon name="x" size={14}/></button>
              </div>
              <div style={S.frow}><label style={S.lbl}>Round Name *</label><input style={S.inp} placeholder="e.g. Phone Screen, Technical, Final" value={roundForm.round_name} onChange={e=>setRoundForm(f=>({...f,round_name:e.target.value}))}/></div>
              <div style={S.frow}><label style={S.lbl}>Interview Date & Time</label><input type="datetime-local" style={S.inp} value={roundForm.interview_date} onChange={e=>setRoundForm(f=>({...f,interview_date:e.target.value}))}/></div>
              <div style={S.fgrid}>
                <div><label style={S.lbl}>Interviewer Name</label><input style={S.inp} placeholder="Jane Smith" value={roundForm.interviewer_name} onChange={e=>setRoundForm(f=>({...f,interviewer_name:e.target.value}))}/></div>
                <div><label style={S.lbl}>Title / Role</label><input style={S.inp} placeholder="Senior PM" value={roundForm.interviewer_title} onChange={e=>setRoundForm(f=>({...f,interviewer_title:e.target.value}))}/></div>
              </div>
              <div style={S.frow}>
                <label style={S.lbl}>Status</label>
                <select style={S.inp} value={roundForm.status} onChange={e=>setRoundForm(f=>({...f,status:e.target.value}))}>
                  {ROUND_STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={S.mfoot}>
                {editRoundId&&<button style={{...S.btn,background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",marginRight:"auto"}} onClick={()=>deleteRound(editRoundId)}><Icon name="trash" size={13}/> Delete</button>}
                <button style={{...S.btn,...S.btnG}} onClick={()=>setModal(null)}>Cancel</button>
                <button style={{...S.btn,...S.btnP}} onClick={saveRound} disabled={saving}><Icon name="check" size={13}/>{saving?"Saving...":"Save"}</button>
              </div>
            </div>
          </div>
        )}

        {/* QUESTION MODAL */}
        {modal==="question"&&(
          <div style={S.ov} onClick={()=>setModal(null)}>
            <div style={S.mb} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
                <div style={S.mt}>{editQId?"Edit Question":"Add Question"}</div>
                <button style={{...S.btn,...S.btnG,padding:"5px 8px"}} onClick={()=>setModal(null)}><Icon name="x" size={14}/></button>
              </div>
              <div style={S.frow}><label style={S.lbl}>Question *</label><textarea style={{...S.inp,minHeight:"70px",resize:"vertical"}} placeholder="e.g. Tell me about a time you led a project..." value={qForm.question} onChange={e=>setQForm(f=>({...f,question:e.target.value}))}/></div>
              <div style={S.frow}>
                <label style={S.lbl}>Type</label>
                <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                  {QUESTION_TYPES.map(t=>{
                    const tc=TYPE_COLORS[t]; const on=qForm.type===t;
                    return <button key={t} style={{...S.btn,padding:"5px 12px",fontSize:"0.7rem",background:on?tc.bg:"#f8fafc",color:on?tc.color:"#94a3b8",border:`1px solid ${on?tc.border:"#e2e8f0"}`}} onClick={()=>setQForm(f=>({...f,type:t}))}>{t}</button>;
                  })}
                </div>
              </div>

              {qForm.type==="Behavioral" ? (
                <div>
                  <div style={{fontSize:"0.7rem",color:"#3b82f6",fontWeight:600,marginBottom:"12px",display:"flex",alignItems:"center",gap:"5px"}}><Icon name="star" size={12} color="#3b82f6"/> STAR Format</div>
                  {[["star_situation","S — Situation","Set the context. Where/when did this happen?"],["star_task","T — Task","What was your responsibility?"],["star_action","A — Action","What did YOU specifically do?"],["star_result","R — Result","What was the outcome? Use numbers if possible."]].map(([field,label,ph])=>(
                    <div key={field} style={S.frow}>
                      <label style={S.lbl}>{label}</label>
                      <textarea style={{...S.inp,minHeight:"60px",resize:"vertical",fontSize:"0.72rem"}} placeholder={ph} value={qForm[field]} onChange={e=>setQForm(f=>({...f,[field]:e.target.value}))}/>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={S.frow}>
                  <label style={S.lbl}>Your Answer / Notes</label>
                  <textarea style={{...S.inp,minHeight:"100px",resize:"vertical",fontSize:"0.72rem"}} placeholder="Write your answer or key points to cover..." value={qForm.answer} onChange={e=>setQForm(f=>({...f,answer:e.target.value}))}/>
                </div>
              )}

              <div style={S.mfoot}>
                {editQId&&<button style={{...S.btn,background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca",marginRight:"auto"}} onClick={()=>{deleteQ(editQId);setModal(null);}}><Icon name="trash" size={13}/> Delete</button>}
                <button style={{...S.btn,...S.btnG}} onClick={()=>setModal(null)}>Cancel</button>
                <button style={{...S.btn,...S.btnP}} onClick={saveQ} disabled={saving}><Icon name="check" size={13}/>{saving?"Saving...":"Save"}</button>
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
