"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut, apiDel, getRole, clearAuth } from "@/lib/api";

const S = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fi{from{opacity:0}to{opacity:1}}
.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:14px;margin-bottom:11px;transition:all .3s}
.btn-p{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 14px;border-radius:11px;font-weight:700;font-size:12px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit;transition:all .2s}
.btn-r{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 13px;border-radius:11px;font-weight:600;font-size:11px;color:#FF6B6B;border:1px solid rgba(255,107,107,.25);background:rgba(255,107,107,.06);cursor:pointer;font-family:inherit}
.btn-y{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 13px;border-radius:11px;font-weight:600;font-size:11px;color:#FFB347;border:1px solid rgba(255,179,71,.25);background:rgba(255,179,71,.06);cursor:pointer;font-family:inherit}
.btn-o{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 13px;border-radius:11px;font-weight:600;font-size:11px;color:#00FFD1;border:1px solid rgba(0,255,209,.25);background:rgba(0,255,209,.05);cursor:pointer;font-family:inherit}
.ni{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;cursor:pointer;border:none;background:none;font-family:inherit;flex:1;border-top:2px solid transparent;transition:all .2s}
.ni.on{border-top-color:#00FFD1}
.badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700}
.inp{width:100%;padding:11px 13px;border-radius:11px;font-size:12px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
.inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(0,255,209,.4)}
select.inp option{background:#0D1B35;color:#E8F4FF}
.modal-bg{position:fixed;inset:0;background:rgba(2,13,26,.9);backdrop-filter:blur(12px);z-index:100;display:flex;align-items:flex-end;justify-content:center;animation:fi .2s ease}
.modal{background:#0D1B35;border:1px solid rgba(0,255,209,.15);border-radius:24px 24px 0 0;padding:22px 20px 32px;width:100%;max-width:500px;max-height:92vh;overflow-y:auto}
.modal::-webkit-scrollbar{display:none}
.tg{width:44px;height:24px;border-radius:100px;cursor:pointer;transition:all .3s;position:relative;border:none}
.tgk{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:all .3s}
.sp{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}
.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}
.stat-card{padding:16px;border-radius:18px}`;

type Tab = "overview"|"doctors"|"patients"|"orders"|"medicines"|"staff"|"pharma"|"commissions"|"coupons"|"reports";

function LS(k:string,fb:any){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}
function SLS(k:string,v:any){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab]         = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  // State — persisted locally as cache
  const [doctors, setDoctors]     = useState<any[]>(()=>LS("adm_drs",[]));
  const [pending, setPending]     = useState<any[]>(()=>LS("adm_pend",[]));
  const [patients, setPatients]   = useState<any[]>(()=>LS("adm_pts",[]));
  const [orders, setOrders]       = useState<any[]>(()=>LS("adm_ords",[]));
  const [medicines, setMedicines] = useState<any[]>(()=>LS("adm_meds",[]));
  const [staff, setStaff]         = useState<any[]>(()=>LS("adm_staff",[]));
  const [pharma, setPharma]       = useState<any[]>(()=>LS("adm_pharma",[]));
  const [coupons, setCoupons]     = useState<any[]>(()=>LS("adm_coupons",[]));
  const [stats, setStats]         = useState<any>(()=>LS("adm_stats",{}));
  const [revenue, setRevenue]     = useState<any[]>(()=>LS("adm_rev",[]));

  // Search
  const [search, setSearch]   = useState("");
  const [ordFilter, setOrdF]  = useState("all");

  // Modals
  const [modal, setModal]     = useState<any>(null); // {type, data}
  const [form, setForm]       = useState<any>({});

  // Persist
  useEffect(()=>SLS("adm_drs",doctors),[doctors]);
  useEffect(()=>SLS("adm_pend",pending),[pending]);
  useEffect(()=>SLS("adm_pts",patients),[patients]);
  useEffect(()=>SLS("adm_ords",orders),[orders]);
  useEffect(()=>SLS("adm_meds",medicines),[medicines]);
  useEffect(()=>SLS("adm_staff",staff),[staff]);
  useEffect(()=>SLS("adm_pharma",pharma),[pharma]);
  useEffect(()=>SLS("adm_coupons",coupons),[coupons]);
  useEffect(()=>SLS("adm_stats",stats),[stats]);

  useEffect(()=>{
    if(!localStorage.getItem("pm_token")){router.replace("/admin/login");return;}
    loadAll();
  },[]);

  const loadAll = async() => {
    setLoading(true);
    try {
      const [dRes,ptRes,ordRes,medRes,stRes,phRes,cpRes,stStats,revRes] = await Promise.all([
        apiGet("/doctors/all").catch(()=>apiGet("/admin/doctors").catch(()=>[])),
        apiGet("/patients").catch(()=>[]),
        apiGet("/orders?status=all").catch(()=>[]),
        apiGet("/medicines").catch(()=>[]),
        apiGet("/staff").catch(()=>[]),
        apiGet("/pharma").catch(()=>[]),
        apiGet("/coupons").catch(()=>[]),
        apiGet("/reports/dashboard").catch(()=>({})),
        apiGet("/reports/revenue").catch(()=>[]),
      ]);
      if(Array.isArray(dRes)){setDoctors(dRes.filter((d:any)=>d.status!=="pending"));setPending(dRes.filter((d:any)=>d.status==="pending"));}
      if(Array.isArray(ptRes)) setPatients(ptRes);
      if(Array.isArray(ordRes)) setOrders(ordRes);
      if(Array.isArray(medRes)) setMedicines(medRes);
      if(Array.isArray(stRes)) setStaff(stRes);
      if(Array.isArray(phRes)) setPharma(phRes);
      if(Array.isArray(cpRes)) setCoupons(cpRes);
      if(stStats && typeof stStats==="object") setStats(stStats);
      if(Array.isArray(revRes)) setRevenue(revRes);
    } finally { setLoading(false); }
  };

  // ── Doctor Actions ─────────────────────────────────────────────
  const approveDoctor = async(d:any) => {
    try{await apiPost(`/admin/doctors/${d._id}/approve`,{});}catch{}
    setDoctors(p=>[...p,{...d,status:"approved"}]);
    setPending(p=>p.filter(x=>x._id!==d._id));
  };
  const rejectDoctor = async(id:string,reason:string) => {
    try{await apiPost(`/admin/doctors/${id}/reject`,{reason});}catch{}
    setPending(p=>p.filter(x=>x._id!==id));
    setModal(null);
  };
  const toggleDrBlock = async(id:string,cur:string) => {
    const ns=cur==="approved"?"blocked":"approved";
    try{await apiPut(`/admin/doctors/${id}/block`,{status:ns});}catch{}
    setDoctors(p=>p.map(x=>x._id===id?{...x,status:ns,isOnline:false}:x));
  };
  const setCommission = async(id:string,cc:number,mc:number) => {
    try{await apiPut(`/admin/doctors/${id}/commission`,{consultCommission:cc,medicineCommission:mc});}catch{}
    setDoctors(p=>p.map(x=>x._id===id?{...x,consultCommission:cc,medicineCommission:mc}:x));
    setModal(null);
  };

  // ── Patient Actions ────────────────────────────────────────────
  const togglePtBlock = async(id:string,cur:string) => {
    const ns=(!cur||cur==="active")?"blocked":"active";
    try{await apiPut(`/admin/patients/${id}/block`,{status:ns});}catch{}
    setPatients(p=>p.map(x=>x._id===id?{...x,status:ns}:x));
  };

  // ── Order Actions ──────────────────────────────────────────────
  const dispatchOrder = async(id:string,tracking:string) => {
    try{await apiPut(`/orders/${id}/dispatch`,{tracking});}catch{}
    setOrders(p=>p.map(x=>x._id===id?{...x,status:"dispatched",tracking}:x));
    setModal(null);
  };
  const deliverOrder = async(id:string) => {
    try{await apiPut(`/orders/${id}/deliver`,{});}catch{}
    setOrders(p=>p.map(x=>x._id===id?{...x,status:"delivered"}:x));
  };

  // ── Medicine Actions ───────────────────────────────────────────
  const saveMedicine = async() => {
    try {
      if(form._id){await apiPut(`/medicines/${form._id}`,form);setMedicines(p=>p.map(x=>x._id===form._id?{...x,...form}:x));}
      else{const r=await apiPost("/medicines",form);setMedicines(p=>[...p,r]);}
    }catch{}
    setModal(null);setForm({});
  };
  const deleteMed = async(id:string) => {
    try{await apiDel(`/medicines/${id}`);}catch{}
    setMedicines(p=>p.filter(x=>x._id!==id));
  };

  // ── Staff/Pharma ───────────────────────────────────────────────
  const createStaff = async() => {
    try{const r=await apiPost("/staff",form);setStaff(p=>[...p,r]);}catch{}
    setModal(null);setForm({});
  };
  const createPharma = async() => {
    try{const r=await apiPost("/pharma",form);setPharma(p=>[...p,r]);}catch{}
    setModal(null);setForm({});
  };
  const toggleStaff = async(id:string,cur:boolean) => {
    try{await apiPut(`/staff/${id}/toggle`,{isActive:!cur});}catch{}
    setStaff(p=>p.map(x=>x._id===id?{...x,isActive:!cur}:x));
  };
  const togglePharma = async(id:string,cur:boolean) => {
    try{await apiPut(`/pharma/${id}/toggle`,{isActive:!cur});}catch{}
    setPharma(p=>p.map(x=>x._id===id?{...x,isActive:!cur}:x));
  };

  // ── Coupons ────────────────────────────────────────────────────
  const saveCoupon = async() => {
    try{const r=await apiPost("/coupons",{...form,code:form.code?.toUpperCase()});setCoupons(p=>[...p,r]);}catch{}
    setModal(null);setForm({});
  };
  const toggleCoupon = async(id:string,cur:boolean) => {
    try{await apiPut(`/coupons/${id}/toggle`,{isActive:!cur});}catch{}
    setCoupons(p=>p.map(x=>x._id===id?{...x,isActive:!cur}:x));
  };

  const sc=(s:string)=>s==="delivered"?"#00FFD1":s==="dispatched"?"#FFB347":s==="cancelled"?"#FF6B6B":"#4DB8FF";
  const fp=patients.filter(p=>(p.name||"").toLowerCase().includes(search.toLowerCase())||(p.mobile||"").includes(search));
  const fo=orders.filter(o=>ordFilter==="all"||o.status===ordFilter);
  const totalRev=revenue.reduce((a:number,b:any)=>a+(b.total||0),0);

  const printInvoice=(o:any)=>{const w=window.open("","_blank");if(!w)return;w.document.write(`<html><head><title>Invoice</title><style>body{font-family:Arial;padding:30px}h1{color:#0B6FCC}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ddd;padding:8px}th{background:#f0f0f0}.total{font-size:18px;font-weight:bold;color:#0B6FCC}</style></head><body><h1>PMCare Invoice</h1><p><b>Order:</b> ${o._id?.slice(-8)?.toUpperCase()} &nbsp; <b>Date:</b> ${new Date(o.createdAt).toLocaleDateString("en-IN")}</p><p><b>Patient:</b> ${o.patientName} &nbsp; <b>Mobile:</b> ${o.patientMobile||""}</p><p><b>Address:</b> ${o.address?.line1||""}, ${o.address?.city||""} - ${o.address?.pincode||""}</p><table><tr><th>Medicine</th><th>Qty</th><th>Price</th><th>Total</th></tr>${(o.items||[]).map((i:any)=>`<tr><td>${i.name}</td><td>${i.qty}</td><td>₹${i.price}</td><td>₹${i.total||i.price*i.qty}</td></tr>`).join("")}</table><p class="total">Grand Total: ₹${o.total}</p><p>Payment: ${o.razorpayPaymentId?"Paid ✓":"COD"}</p></body></html>`);w.document.close();w.print();};

  return (
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
      <style>{S}</style>

      {/* Header */}
      <div style={{flexShrink:0,padding:"12px 18px 11px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>Admin Panel</p>
            <h2 style={{fontSize:16,fontWeight:800}} className="sh">PMCare Control</h2>
          </div>
          <div style={{display:"flex",gap:8}}>
            {pending.length>0&&(<div style={{position:"relative"}}>
              <button onClick={()=>setTab("doctors")} style={{width:34,height:34,borderRadius:10,background:"rgba(255,107,107,.1)",border:"1px solid rgba(255,107,107,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer"}}>🔔</button>
              <div style={{position:"absolute",top:-3,right:-3,width:16,height:16,borderRadius:"50%",background:"#FF6B6B",border:"2px solid #020D1A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#fff"}}>{pending.length}</div>
            </div>)}
            <button onClick={()=>{clearAuth();router.replace("/admin/login");}} style={{padding:"6px 11px",borderRadius:10,background:"rgba(255,107,107,.08)",border:"1px solid rgba(255,107,107,.18)",color:"#FF6B6B",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Exit</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ns" style={{flex:1,overflowY:"auto",padding:"0 18px"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            {loading&&<div style={{display:"flex",justifyContent:"center",padding:"20px"}}><span className="sp"/></div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:16}}>
              {[
                {n:stats.doctors||doctors.filter(d=>d.status==="approved").length,l:"Active Doctors",c:"#00FFD1",ic:"🩺"},
                {n:stats.patients||patients.length,l:"Patients",c:"#4DB8FF",ic:"👥"},
                {n:stats.pending||pending.length,l:"Pending Approval",c:"#FF6B6B",ic:"⏳"},
                {n:`₹${totalRev.toLocaleString("en-IN")}`,l:"Total Revenue",c:"#A78BFA",ic:"💰"},
                {n:orders.filter(o=>o.status==="pending").length,l:"Pending Orders",c:"#FFB347",ic:"📦"},
                {n:stats.onlineDrs||doctors.filter(d=>d.isOnline&&d.status==="approved").length,l:"Doctors Online",c:"#34D399",ic:"🟢"},
              ].map(s=>(
                <div key={s.l} className="stat-card" style={{background:`${s.c}10`,border:`1px solid ${s.c}20`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                    <span style={{fontSize:22}}>{s.ic}</span><span style={{fontWeight:900,fontSize:18,color:s.c}}>{s.n}</span>
                  </div>
                  <p style={{color:"rgba(232,244,255,.45)",fontSize:10}}>{s.l}</p>
                </div>
              ))}
            </div>
            {pending.length>0&&(<div style={{background:"rgba(255,107,107,.06)",border:"1px solid rgba(255,107,107,.2)",borderRadius:13,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:9,alignItems:"center"}}><span style={{fontSize:18}}>⚠️</span><div><p style={{color:"#FF6B6B",fontWeight:700,fontSize:12}}>{pending.length} Doctor{pending.length>1?"s":""} Waiting Approval</p><p style={{color:"rgba(255,107,107,.5)",fontSize:10,marginTop:1}}>Review and approve/reject</p></div></div>
              <button className="btn-r" onClick={()=>setTab("doctors")}>Review →</button>
            </div>)}

            {/* Revenue chart (text based) */}
            {revenue.length>0&&(<div className="card">
              <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Monthly Revenue</p>
              {revenue.slice(0,6).map((r:any,i:number)=>{
                const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                const maxVal=Math.max(...revenue.map((x:any)=>x.total||0));
                return(<div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <p style={{fontSize:10,color:"rgba(232,244,255,.4)",width:28}}>{months[(r._id?.month||1)-1]}</p>
                  <div style={{flex:1,height:8,borderRadius:100,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:100,background:"linear-gradient(90deg,#00C9A7,#0B6FCC)",width:`${maxVal>0?(r.total/maxVal)*100:0}%`,transition:"all .5s"}}/>
                  </div>
                  <p style={{fontSize:10,color:"#00FFD1",width:60,textAlign:"right"}}>₹{(r.total||0).toLocaleString("en-IN")}</p>
                </div>);
              })}
            </div>)}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              {(["doctors","orders","medicines","patients","staff","pharma","coupons","reports"] as Tab[]).map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{padding:"13px",borderRadius:13,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:18}}>{t==="doctors"?"🩺":t==="orders"?"📦":t==="medicines"?"💊":t==="patients"?"👥":t==="staff"?"👨‍💼":t==="pharma"?"🏪":t==="coupons"?"🎟️":"📊"}</span>
                  <span style={{fontWeight:600,fontSize:12,color:"#E8F4FF",textTransform:"capitalize"}}>{t}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCTORS ── */}
        {tab==="doctors"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            {pending.length>0&&(<>
              <p style={{fontSize:10,fontWeight:700,color:"#FF6B6B",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>⏳ Pending Approval ({pending.length})</p>
              {pending.map((d:any)=>(
                <div key={d._id} style={{background:"rgba(255,107,107,.05)",border:"1px solid rgba(255,107,107,.2)",borderRadius:15,padding:14,marginBottom:10}}>
                  <div style={{marginBottom:10}}>
                    <p style={{fontWeight:700,fontSize:14,color:"#E8F4FF"}}>{d.name}</p>
                    <p style={{color:"#4DB8FF",fontSize:11,marginTop:2}}>{d.specialty||"Doctor"}</p>
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:10,marginTop:2}}>📱 {d.mobile} {d.regNo?`· MCI: ${d.regNo}`:""}</p>
                    {d.degree&&<p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>🎓 {d.degree} · {d.experience?`${d.experience} yrs exp`:""}</p>}
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>💰 Fee: ₹{d.fee||499}</p>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn-p" style={{flex:1}} onClick={()=>approveDoctor(d)}>✅ Approve</button>
                    <button className="btn-r" style={{flex:1}} onClick={()=>setModal({type:"reject",data:d})}>❌ Reject</button>
                    <button className="btn-o" style={{flex:1}} onClick={()=>setModal({type:"viewDoc",data:d})}>👁 View</button>
                  </div>
                </div>
              ))}
            </>)}

            <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:10,marginTop:pending.length>0?12:0}}>Active Doctors ({doctors.filter(d=>d.status==="approved").length})</p>
            {doctors.map((d:any)=>(
              <div key={d._id} className="card">
                <div style={{display:"flex",gap:11,alignItems:"flex-start",marginBottom:10}}>
                  <div style={{width:44,height:44,borderRadius:13,background:"rgba(0,255,209,.07)",border:"1px solid rgba(0,255,209,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,overflow:"hidden"}}>
                    {d.photo?<img src={d.photo} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:13}}/>:"👨‍⚕️"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                      <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>{d.name}</p>
                      {d.isOnline&&d.status==="approved"&&<div style={{width:6,height:6,borderRadius:"50%",background:"#00FFD1"}}/>}
                      <span className="badge" style={{background:d.status==="approved"?"rgba(0,255,209,.08)":"rgba(255,107,107,.1)",color:d.status==="approved"?"#00FFD1":"#FF6B6B"}}>{d.status}</span>
                    </div>
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>{d.specialty||"Doctor"} · ₹{d.fee}/consult</p>
                    <p style={{color:"rgba(232,244,255,.3)",fontSize:10}}>Comm: {d.consultCommission||80}% consult · {d.medicineCommission||5}% medicine</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button className="btn-o" style={{flex:1}} onClick={()=>{setForm({id:d._id,cc:d.consultCommission||80,mc:d.medicineCommission||5});setModal({type:"commission",data:d});}}>💰 Commission</button>
                  <button className={d.status==="approved"?"btn-r":"btn-p"} style={{flex:1}} onClick={()=>toggleDrBlock(d._id,d.status)}>
                    {d.status==="approved"?"🚫 Block":"✅ Unblock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PATIENTS ── */}
        {tab==="patients"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            <div style={{position:"relative",marginBottom:14}}>
              <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13}}>🔍</span>
              <input className="inp" style={{paddingLeft:32}} placeholder="Search by name or mobile..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            {loading&&<div style={{display:"flex",justifyContent:"center",padding:"20px"}}><span className="sp"/></div>}
            {!loading&&fp.length===0&&<div style={{textAlign:"center",padding:"32px"}}><p style={{fontSize:36,marginBottom:8}}>👥</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>No patients found</p></div>}
            {fp.map((p:any)=>(
              <div key={p._id} className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:2}}>{p.name}</p>
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>📱 {p.mobile||""} {p.email?`· ${p.email}`:""}</p>
                    <p style={{color:"rgba(232,244,255,.3)",fontSize:10,marginTop:2}}>{p.totalConsults||0} consults · Joined {p.createdAt?new Date(p.createdAt).toLocaleDateString("en-IN"):"-"}</p>
                  </div>
                  <span className="badge" style={{background:(!p.status||p.status==="active")?"rgba(0,255,209,.08)":"rgba(255,107,107,.1)",color:(!p.status||p.status==="active")?"#00FFD1":"#FF6B6B"}}>{p.status||"active"}</span>
                </div>
                <button className={(!p.status||p.status==="active")?"btn-r":"btn-p"} style={{width:"100%"}} onClick={()=>togglePtBlock(p._id,p.status)}>
                  {(!p.status||p.status==="active")?"🚫 Block Patient":"✅ Unblock Patient"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab==="orders"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            <div style={{display:"flex",gap:7,overflowX:"auto",marginBottom:14}} className="ns">
              {["all","pending","dispatched","delivered","cancelled"].map(f=>(
                <button key={f} onClick={()=>setOrdF(f)} style={{padding:"5px 12px",borderRadius:100,flexShrink:0,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,background:ordFilter===f?"linear-gradient(135deg,#00C9A7,#0B6FCC)":"rgba(255,255,255,.04)",color:ordFilter===f?"#fff":"rgba(232,244,255,.45)",border:ordFilter===f?"none":"1px solid rgba(255,255,255,.08)",textTransform:"capitalize"}}>
                  {f==="all"?`All (${orders.length})`:f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            {fo.map((o:any)=>(
              <div key={o._id} className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:14,color:"#E8F4FF"}}>{o._id?.slice(-8)?.toUpperCase()}</p>
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:11,marginTop:1}}>{o.patientName} · {o.patientMobile}</p>
                    <p style={{color:"rgba(232,244,255,.3)",fontSize:10,marginTop:1}}>{(o.items||[]).length} items · {new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{color:"#00FFD1",fontWeight:800,fontSize:14}}>₹{o.total}</p>
                    <span className="badge" style={{background:sc(o.status)+"18",color:sc(o.status),marginTop:4}}>{o.status?.toUpperCase()}</span>
                  </div>
                </div>
                {o.tracking&&<p style={{color:"#FFB347",fontSize:11,marginBottom:8}}>📦 Tracking: {o.tracking}</p>}
                <div style={{display:"flex",gap:7}}>
                  <button className="btn-o" style={{flex:1}} onClick={()=>setModal({type:"viewOrder",data:o})}>👁 View</button>
                  <button className="btn-y" style={{flex:1}} onClick={()=>printInvoice(o)}>🖨️ Invoice</button>
                  {o.status==="pending"&&<button className="btn-p" style={{flex:1}} onClick={()=>{setForm({orderId:o._id,tracking:""});setModal({type:"dispatch",data:o});}}>🚚 Dispatch</button>}
                  {o.status==="dispatched"&&<button className="btn-p" style={{flex:1}} onClick={()=>deliverOrder(o._id)}>✓ Delivered</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MEDICINES ── */}
        {tab==="medicines"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontSize:15,fontWeight:800}}>Medicine Catalogue</p>
              <button className="btn-p" onClick={()=>{setForm({price:0,mrp:0,stock:0,requiresPrescription:false,isActive:true,discount:0,lowStockThreshold:10});setModal({type:"editMed",data:null});}}>+ Add New</button>
            </div>
            {medicines.map((m:any)=>(
              <div key={m._id} className="card">
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                      <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>{m.name}</p>
                      {m.requiresPrescription&&<span className="badge" style={{background:"rgba(255,107,107,.1)",color:"#FF6B6B"}}>Rx</span>}
                      {!m.isActive&&<span className="badge" style={{background:"rgba(255,255,255,.06)",color:"rgba(232,244,255,.4)"}}>Inactive</span>}
                    </div>
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>{m.brand} · {m.category} · ₹{m.price} (MRP ₹{m.mrp})</p>
                    <p style={{color:m.stock===0?"#FF6B6B":m.stock<=(m.lowStockThreshold||10)?"#FFB347":"#00FFD1",fontSize:10,fontWeight:600,marginTop:2}}>
                      {m.stock===0?"⚠️ Out of Stock":m.stock<=(m.lowStockThreshold||10)?`⚠️ Low: ${m.stock} left`:`✓ Stock: ${m.stock}`}
                    </p>
                  </div>
                  <div style={{display:"flex",gap:6,flexDirection:"column"}}>
                    <button className="btn-o" style={{padding:"5px 10px",fontSize:10}} onClick={()=>{setForm({...m});setModal({type:"editMed",data:m});}}>✏️ Edit</button>
                    <button className="btn-r" style={{padding:"5px 10px",fontSize:10}} onClick={()=>deleteMed(m._id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STAFF ── */}
        {tab==="staff"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontSize:15,fontWeight:800}}>Staff Management</p>
              <button className="btn-p" onClick={()=>{setForm({permissions:["orders"]});setModal({type:"createStaff"});}}>+ Create Staff</button>
            </div>
            {staff.length===0&&<div style={{textAlign:"center",padding:"32px"}}><p style={{fontSize:36,marginBottom:8}}>👨‍💼</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>No staff created yet</p></div>}
            {staff.map((s:any)=>(
              <div key={s._id} className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:2}}>{s.name}</p>
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>📧 {s.email}</p>
                    <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
                      {(s.permissions||[]).map((p:string)=><span key={p} style={{padding:"2px 7px",borderRadius:100,background:"rgba(167,139,250,.1)",color:"#A78BFA",fontSize:9,fontWeight:700}}>{p}</span>)}
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span className="badge" style={{background:s.isActive?"rgba(0,255,209,.08)":"rgba(255,107,107,.1)",color:s.isActive?"#00FFD1":"#FF6B6B"}}>{s.isActive?"Active":"Inactive"}</span>
                    <button className="tg" onClick={()=>toggleStaff(s._id,s.isActive)} style={{background:s.isActive?"#00C9A7":"rgba(255,255,255,.1)"}}>
                      <div className="tgk" style={{left:s.isActive?23:3}}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PHARMA ── */}
        {tab==="pharma"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontSize:15,fontWeight:800}}>Pharma Management</p>
              <button className="btn-p" onClick={()=>{setForm({});setModal({type:"createPharma"});}}>+ Create Pharma</button>
            </div>
            {pharma.length===0&&<div style={{textAlign:"center",padding:"32px"}}><p style={{fontSize:36,marginBottom:8}}>🏪</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>No pharma created yet</p></div>}
            {pharma.map((p:any)=>(
              <div key={p._id} className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:2}}>{p.name}</p>
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>📧 {p.email} {p.phone?`· 📱 ${p.phone}`:""}</p>
                    {p.address&&<p style={{color:"rgba(232,244,255,.3)",fontSize:10,marginTop:2}}>📍 {p.address}</p>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span className="badge" style={{background:p.isActive?"rgba(0,255,209,.08)":"rgba(255,107,107,.1)",color:p.isActive?"#00FFD1":"#FF6B6B"}}>{p.isActive?"Active":"Inactive"}</span>
                    <button className="tg" onClick={()=>togglePharma(p._id,p.isActive)} style={{background:p.isActive?"#00C9A7":"rgba(255,255,255,.1)"}}>
                      <div className="tgk" style={{left:p.isActive?23:3}}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── COUPONS ── */}
        {tab==="coupons"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontSize:15,fontWeight:800}}>Discount Coupons</p>
              <button className="btn-p" onClick={()=>{setForm({type:"percent",value:10,isActive:true});setModal({type:"createCoupon"});}}>+ Create Coupon</button>
            </div>
            {coupons.length===0&&<div style={{textAlign:"center",padding:"32px"}}><p style={{fontSize:36,marginBottom:8}}>🎟️</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>No coupons created yet</p></div>}
            {coupons.map((c:any)=>(
              <div key={c._id} className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <p style={{fontWeight:800,fontSize:14,color:"#00FFD1",letterSpacing:1}}>{c.code}</p>
                    <p style={{color:"rgba(232,244,255,.4)",fontSize:10,marginTop:2}}>{c.type==="percent"?`${c.value}% off`:``₹{c.value} off`} {c.minOrder?`· Min ₹${c.minOrder}`:""}</p>
                    <p style={{color:"rgba(232,244,255,.3)",fontSize:10,marginTop:2}}>Used: {c.usedCount||0}{c.maxUses?`/${c.maxUses}`:""} times</p>
                    {c.validTill&&<p style={{color:"rgba(232,244,255,.3)",fontSize:10}}>Valid till: {new Date(c.validTill).toLocaleDateString("en-IN")}</p>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span className="badge" style={{background:c.isActive?"rgba(0,255,209,.08)":"rgba(255,107,107,.1)",color:c.isActive?"#00FFD1":"#FF6B6B"}}>{c.isActive?"Active":"Off"}</span>
                    <button className="tg" onClick={()=>toggleCoupon(c._id,c.isActive)} style={{background:c.isActive?"#00C9A7":"rgba(255,255,255,.1)"}}>
                      <div className="tgk" style={{left:c.isActive?23:3}}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab==="reports"&&(
          <div style={{paddingTop:14,paddingBottom:14,animation:"fu .4s ease"}}>
            <p style={{fontSize:15,fontWeight:800,marginBottom:16}}>Platform Reports</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:16}}>
              {[{n:doctors.length,l:"Total Doctors",c:"#00FFD1"},{n:patients.length,l:"Total Patients",c:"#4DB8FF"},{n:orders.length,l:"Total Orders",c:"#FFB347"},{n:`₹${totalRev.toLocaleString("en-IN")}`,l:"Total Revenue",c:"#A78BFA"}].map(s=>(
                <div key={s.l} className="stat-card" style={{background:`${s.c}10`,border:`1px solid ${s.c}20`}}>
                  <p style={{fontWeight:900,fontSize:20,color:s.c}}>{s.n}</p>
                  <p style={{color:"rgba(232,244,255,.45)",fontSize:10,marginTop:3}}>{s.l}</p>
                </div>
              ))}
            </div>
            <div className="card">
              <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>Top Doctors</p>
              {doctors.sort((a:any,b:any)=>(b.totalConsults||0)-(a.totalConsults||0)).slice(0,5).map((d:any)=>(
                <div key={d._id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <div>
                    <p style={{fontSize:12,fontWeight:600,color:"#E8F4FF"}}>{d.name}</p>
                    <p style={{fontSize:10,color:"rgba(232,244,255,.4)"}}>{d.specialty}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:12,color:"#00FFD1",fontWeight:700}}>{d.totalConsults||0} consults</p>
                    <p style={{fontSize:10,color:"rgba(232,244,255,.3)"}}>⭐ {d.rating||4.5}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>Order Status</p>
              {["pending","dispatched","delivered","cancelled"].map(s=>{
                const cnt=orders.filter(o=>o.status===s).length;
                const pct=orders.length>0?(cnt/orders.length)*100:0;
                return(<div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <p style={{fontSize:10,color:"rgba(232,244,255,.4)",width:64,textTransform:"capitalize"}}>{s}</p>
                  <div style={{flex:1,height:8,borderRadius:100,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:100,background:sc(s),width:`${pct}%`}}/>
                  </div>
                  <p style={{fontSize:10,color:"rgba(232,244,255,.4)",width:32,textAlign:"right"}}>{cnt}</p>
                </div>);
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{flexShrink:0,display:"flex",background:"rgba(2,13,26,.97)",backdropFilter:"blur(24px)",borderTop:"1px solid rgba(255,255,255,.07)",overflowX:"auto"}} className="ns">
        {(["overview","doctors","orders","medicines","patients","staff","pharma","coupons","reports"] as Tab[]).map(t=>(
          <button key={t} className={"ni"+(tab===t?" on":"")} onClick={()=>setTab(t)} style={{color:tab===t?"#00FFD1":"rgba(232,244,255,.3)",position:"relative",minWidth:52}}>
            {t==="doctors"&&pending.length>0&&<div style={{position:"absolute",top:5,right:"20%",width:6,height:6,borderRadius:"50%",background:"#FF6B6B"}}/>}
            <span style={{fontSize:16}}>{t==="overview"?"📊":t==="doctors"?"🩺":t==="orders"?"📦":t==="medicines"?"💊":t==="patients"?"👥":t==="staff"?"👨‍💼":t==="pharma"?"🏪":t==="coupons"?"🎟️":"📈"}</span>
            <span style={{fontSize:7,fontWeight:tab===t?700:500,textTransform:"capitalize"}}>{t}</span>
          </button>
        ))}
      </div>

      {/* ── MODALS ── */}
      {modal&&(
        <div className="modal-bg" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontWeight:800,fontSize:15}}>
                {modal.type==="commission"?"Set Commission":modal.type==="viewOrder"?"Order Details":modal.type==="dispatch"?"Dispatch Order":modal.type==="editMed"?`${form._id?"Edit":"Add"} Medicine`:modal.type==="createStaff"?"Create Staff Account":modal.type==="createPharma"?"Create Pharma Account":modal.type==="createCoupon"?"Create Coupon":modal.type==="reject"?"Reject Doctor":"Details"}
              </h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",color:"rgba(232,244,255,.4)",cursor:"pointer",fontSize:20}}>✕</button>
            </div>

            {/* Commission Modal */}
            {modal.type==="commission"&&(<div>
              <p style={{color:"rgba(232,244,255,.45)",fontSize:13,marginBottom:16}}>Dr. {modal.data?.name}</p>
              {[{k:"cc",l:"Consultation Commission (Doctor gets %)",ph:"80"},{k:"mc",l:"Medicine Referral Commission (Doctor gets %)",ph:"5"}].map(f=>(
                <div key={f.k} style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{f.l}</label>
                  <input className="inp" type="number" min="0" max="100" placeholder={f.ph} value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:+e.target.value}))}/>
                </div>
              ))}
              <button className="btn-p" style={{width:"100%",marginTop:8}} onClick={()=>setCommission(form.id,form.cc,form.mc)}>💾 Save Commission</button>
            </div>)}

            {/* View Order Modal */}
            {modal.type==="viewOrder"&&(<div>
              <div style={{marginBottom:14}}>
                <p style={{fontWeight:600,fontSize:13,color:"#E8F4FF",marginBottom:4}}>{modal.data.patientName}</p>
                <p style={{color:"rgba(232,244,255,.4)",fontSize:11}}>📱 {modal.data.patientMobile}</p>
                {modal.data.address&&<p style={{color:"rgba(232,244,255,.4)",fontSize:11,marginTop:3}}>📍 {modal.data.address?.line1}, {modal.data.address?.city} - {modal.data.address?.pincode}</p>}
              </div>
              {(modal.data.items||[]).map((item:any,i:number)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <p style={{color:"#E8F4FF",fontSize:12}}>{item.name} × {item.qty}</p>
                  <p style={{color:"#00FFD1",fontWeight:700,fontSize:12}}>₹{item.total||item.price*item.qty}</p>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid rgba(255,255,255,.08)",marginTop:4}}>
                <p style={{fontWeight:800,fontSize:14}}>Total</p><p style={{fontWeight:900,fontSize:16,color:"#00FFD1"}}>₹{modal.data.total}</p>
              </div>
              <button className="btn-p" style={{width:"100%",marginTop:12}} onClick={()=>printInvoice(modal.data)}>🖨️ Print Invoice</button>
            </div>)}

            {/* Dispatch Modal */}
            {modal.type==="dispatch"&&(<div>
              <p style={{color:"rgba(232,244,255,.45)",fontSize:13,marginBottom:16}}>Order: {modal.data?._id?.slice(-8)?.toUpperCase()}</p>
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Tracking Number (Optional)</label>
                <input className="inp" placeholder="e.g. DTDC123456789IN" value={form.tracking||""} onChange={e=>setForm((p:any)=>({...p,tracking:e.target.value}))}/>
              </div>
              <button className="btn-p" style={{width:"100%"}} onClick={()=>dispatchOrder(form.orderId,form.tracking||`PMC-${Date.now()}`)}>🚚 Mark Dispatched</button>
            </div>)}

            {/* Edit Medicine Modal */}
            {modal.type==="editMed"&&(<div>
              {[{k:"name",l:"Medicine Name *",ph:"Paracetamol 500mg"},{k:"brand",l:"Brand",ph:"Calpol"},{k:"category",l:"Category",ph:"Fever, Antibiotic..."},{k:"description",l:"Description",ph:"Short description"},{k:"composition",l:"Composition",ph:"Paracetamol IP"},{k:"manufacturer",l:"Manufacturer",ph:"GSK"},{k:"dosageForm",l:"Form",ph:"Tablet, Syrup, Capsule"}].map(f=>(
                <div key={f.k} style={{marginBottom:10}}>
                  <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.38)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{f.l}</label>
                  <input className="inp" placeholder={f.ph} value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.value}))}/>
                </div>
              ))}
              {[{k:"price",l:"Price (₹) *",t:"number"},{k:"mrp",l:"MRP (₹)",t:"number"},{k:"stock",l:"Stock *",t:"number"},{k:"discount",l:"Discount %",t:"number"},{k:"lowStockThreshold",l:"Low Stock Alert At",t:"number"}].map(f=>(
                <div key={f.k} style={{marginBottom:10}}>
                  <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.38)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{f.l}</label>
                  <input className="inp" type={f.t} value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:+e.target.value}))}/>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,padding:"10px 0",borderTop:"1px solid rgba(255,255,255,.07)"}}>
                <p style={{fontSize:13,fontWeight:600}}>Requires Prescription</p>
                <button className="tg" onClick={()=>setForm((p:any)=>({...p,requiresPrescription:!p.requiresPrescription}))} style={{background:form.requiresPrescription?"#00C9A7":"rgba(255,255,255,.1)"}}>
                  <div className="tgk" style={{left:form.requiresPrescription?23:3}}/>
                </button>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <p style={{fontSize:13,fontWeight:600}}>Active (visible to patients)</p>
                <button className="tg" onClick={()=>setForm((p:any)=>({...p,isActive:!p.isActive}))} style={{background:form.isActive?"#00C9A7":"rgba(255,255,255,.1)"}}>
                  <div className="tgk" style={{left:form.isActive?23:3}}/>
                </button>
              </div>
              <button className="btn-p" style={{width:"100%"}} onClick={saveMedicine}>{form._id?"💾 Save Changes":"➕ Add Medicine"}</button>
            </div>)}

            {/* Create Staff Modal */}
            {modal.type==="createStaff"&&(<div>
              {[{k:"name",l:"Full Name *",t:"text"},{k:"email",l:"Email *",t:"email"},{k:"password",l:"Password *",t:"password"}].map(f=>(
                <div key={f.k} style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{f.l}</label>
                  <input className="inp" type={f.t} value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.value}))}/>
                </div>
              ))}
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Permissions</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["orders","patients","medicines","reports"].map(p=>(
                    <button key={p} onClick={()=>{const cur=form.permissions||[];setForm((f:any)=>({...f,permissions:cur.includes(p)?cur.filter((x:string)=>x!==p):[...cur,p]}));}}
                      style={{padding:"5px 12px",borderRadius:100,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,background:(form.permissions||[]).includes(p)?"linear-gradient(135deg,#00C9A7,#0B6FCC)":"rgba(255,255,255,.06)",color:(form.permissions||[]).includes(p)?"#fff":"rgba(232,244,255,.45)",border:"none",textTransform:"capitalize"}}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-p" style={{width:"100%"}} onClick={createStaff}>👨‍💼 Create Staff Account</button>
            </div>)}

            {/* Create Pharma Modal */}
            {modal.type==="createPharma"&&(<div>
              {[{k:"name",l:"Pharmacy Name *",t:"text"},{k:"email",l:"Email *",t:"email"},{k:"password",l:"Password *",t:"password"},{k:"phone",l:"Phone",t:"tel"},{k:"address",l:"Address",t:"text"}].map(f=>(
                <div key={f.k} style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{f.l}</label>
                  <input className="inp" type={f.t} value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.value}))}/>
                </div>
              ))}
              <button className="btn-p" style={{width:"100%"}} onClick={createPharma}>🏪 Create Pharma Account</button>
            </div>)}

            {/* Create Coupon Modal */}
            {modal.type==="createCoupon"&&(<div>
              {[{k:"code",l:"Coupon Code *",ph:"SAVE20"},{k:"description",l:"Description",ph:"Get 20% off"},{k:"minOrder",l:"Min Order Amount (₹)",ph:"299"},{k:"maxDiscount",l:"Max Discount (₹)",ph:"100"},{k:"maxUses",l:"Max Uses",ph:"100"}].map(f=>(
                <div key={f.k} style={{marginBottom:10}}>
                  <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.38)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{f.l}</label>
                  <input className="inp" placeholder={f.ph} value={form[f.k]||""} onChange={e=>setForm((p:any)=>({...p,[f.k]:e.target.value}))} style={{textTransform:f.k==="code"?"uppercase":"none"}}/>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div>
                  <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.38)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Type</label>
                  <select className="inp" value={form.type||"percent"} onChange={e=>setForm((p:any)=>({...p,type:e.target.value}))}>
                    <option value="percent">Percent (%)</option><option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.38)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Value *</label>
                  <input className="inp" type="number" placeholder="10" value={form.value||""} onChange={e=>setForm((p:any)=>({...p,value:+e.target.value}))}/>
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.38)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Valid Till</label>
                <input className="inp" type="date" value={form.validTill||""} onChange={e=>setForm((p:any)=>({...p,validTill:e.target.value}))}/>
              </div>
              <button className="btn-p" style={{width:"100%"}} onClick={saveCoupon}>🎟️ Create Coupon</button>
            </div>)}

            {/* Reject Doctor Modal */}
            {modal.type==="reject"&&(<div>
              <p style={{color:"rgba(232,244,255,.45)",fontSize:13,marginBottom:16}}>Rejecting: <strong>{modal.data?.name}</strong></p>
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Reason for Rejection</label>
                <textarea rows={3} className="inp" placeholder="e.g. Documents incomplete, Invalid MCI number..." value={form.reason||""} onChange={e=>setForm((p:any)=>({...p,reason:e.target.value}))} style={{resize:"none",lineHeight:1.6}}/>
              </div>
              <button className="btn-r" style={{width:"100%"}} onClick={()=>rejectDoctor(modal.data._id,form.reason||"Does not meet requirements")}>❌ Confirm Reject</button>
            </div>)}
          </div>
        </div>
      )}
    </div>
  );
}
