"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPut, getRole, clearAuth } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh{background:linear-gradient(90deg,#A78BFA,#6D28D9,#A78BFA);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 3s linear infinite}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;margin-bottom:11px}.btn-p{display:inline-flex;align-items:center;justify-content:center;padding:9px 14px;border-radius:11px;font-weight:700;font-size:12px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#A78BFA,#6D28D9);font-family:inherit}.sp{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#A78BFA;border-radius:50%;animation:spin .8s linear infinite}.ni{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;cursor:pointer;border:none;background:none;font-family:inherit;flex:1;border-top:2px solid transparent}.ni.on{border-top-color:#A78BFA}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function StaffDashboard(){
  const router=useRouter();const [tab,setTab]=useState<"orders"|"patients">("orders");const [orders,setOrders]=useState<any[]>([]);const [patients,setPatients]=useState<any[]>([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{if(getRole()!=="staff"){router.replace("/staff/login");return;}Promise.all([apiGet("/orders?status=pending").catch(()=>[]),apiGet("/patients").catch(()=>[])]).then(([o,p])=>{if(Array.isArray(o))setOrders(o);if(Array.isArray(p))setPatients(p);}).finally(()=>setLoading(false));});
  const dispatch=async(id:string)=>{await apiPut(`/orders/${id}/dispatch`,{tracking:`PMC-${Date.now()}`}).catch(()=>{});setOrders(p=>p.filter(x=>x._id!==id));};
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"13px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div><p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>Staff Portal</p><h2 style={{fontSize:16,fontWeight:800}} className="sh">PMCare Staff</h2></div>
      <button onClick={()=>{clearAuth();router.replace("/staff/login");}} style={{padding:"6px 12px",borderRadius:10,background:"rgba(255,107,107,.08)",border:"1px solid rgba(255,107,107,.2)",color:"#FF6B6B",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Exit</button>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"0 18px"}}>
      {tab==="orders"&&(<div style={{paddingTop:14,paddingBottom:14}}>
        <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Pending Orders ({orders.length})</p>
        {loading&&<div style={{display:"flex",justifyContent:"center",padding:"28px"}}><span className="sp"/></div>}
        {!loading&&orders.length===0&&<div style={{textAlign:"center",padding:"32px"}}><p style={{fontSize:36,marginBottom:8}}>✅</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>All orders processed!</p></div>}
        {orders.map((o:any)=>(<div key={o._id} className="card">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>{o._id?.slice(-8)?.toUpperCase()}</p><p style={{color:"rgba(232,244,255,.4)",fontSize:10,marginTop:1}}>{o.patientName} · {o.patientMobile}</p><p style={{color:"rgba(232,244,255,.3)",fontSize:10}}>📍 {o.address?.city}</p></div>
            <p style={{color:"#00FFD1",fontWeight:800,fontSize:14}}>₹{o.total}</p>
          </div>
          <div style={{display:"flex",gap:8}}>
            <a href={`/orders/${o._id}`} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"9px",borderRadius:11,border:"1px solid rgba(0,255,209,.2)",color:"#00FFD1",fontSize:12,fontWeight:600,textDecoration:"none"}}>👁 View</a>
            <button className="btn-p" style={{flex:1}} onClick={()=>dispatch(o._id)}>🚚 Dispatch</button>
          </div>
        </div>))}
      </div>)}
      {tab==="patients"&&(<div style={{paddingTop:14,paddingBottom:14}}>
        <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>All Patients ({patients.length})</p>
        {patients.map((p:any)=>(<div key={p._id} className="card">
          <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:2}}>{p.name}</p>
          <p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>📱 {p.mobile} {p.email?`· ${p.email}`:""}</p>
          <p style={{color:"rgba(232,244,255,.3)",fontSize:10,marginTop:2}}>{p.totalConsults||0} consults</p>
        </div>))}
      </div>)}
    </div>
    <div style={{flexShrink:0,display:"flex",background:"rgba(2,13,26,.97)",backdropFilter:"blur(24px)",borderTop:"1px solid rgba(255,255,255,.07)"}}>
      {[["orders","📦","Orders"],["patients","👥","Patients"]].map(([t,ic,lb])=>(
        <button key={t} className={"ni"+(tab===t?" on":"")} onClick={()=>setTab(t as any)} style={{color:tab===t?"#A78BFA":"rgba(232,244,255,.3)"}}>
          <span style={{fontSize:19}}>{ic}</span><span style={{fontSize:9,fontWeight:tab===t?700:500}}>{lb}</span>
        </button>
      ))}
    </div>
  </div>);
}
