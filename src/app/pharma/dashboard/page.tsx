"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPut, apiPost, getRole, clearAuth } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh2{background:linear-gradient(90deg,#F59E0B,#D97706,#F59E0B);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 3s linear infinite}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;margin-bottom:11px}.btn-p{display:inline-flex;align-items:center;justify-content:center;padding:9px 14px;border-radius:11px;font-weight:700;font-size:12px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#F59E0B,#D97706);font-family:inherit}.inp{width:100%;padding:10px 12px;border-radius:10px;font-size:12px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit}.sp{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#F59E0B;border-radius:50%;animation:spin .8s linear infinite}.ni{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;cursor:pointer;border:none;background:none;font-family:inherit;flex:1;border-top:2px solid transparent}.ni.on{border-top-color:#F59E0B}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function PharmaDashboard(){
  const router=useRouter();const [tab,setTab]=useState<"orders"|"inventory">("orders");const [orders,setOrders]=useState<any[]>([]);const [meds,setMeds]=useState<any[]>([]);const [loading,setLoading]=useState(true);const [dispatching,setDispatching]=useState<string>("");
  useEffect(()=>{if(getRole()!=="pharma"){router.replace("/pharma/login");return;}Promise.all([apiGet("/orders?status=pending").catch(()=>[]),apiGet("/medicines").catch(()=>[])]).then(([o,m])=>{if(Array.isArray(o))setOrders(o);if(Array.isArray(m))setMeds(m);}).finally(()=>setLoading(false));});
  const dispatch=async(id:string)=>{setDispatching(id);await apiPut(`/orders/${id}/dispatch`,{tracking:`PHARMA-${Date.now()}`}).catch(()=>{});setOrders(p=>p.filter(x=>x._id!==id));setDispatching("");};
  const updateStock=async(id:string,qty:number)=>{await apiPut(`/medicines/${id}/stock`,{qty}).catch(()=>{});setMeds(p=>p.map(x=>x._id===id?{...x,stock:Math.max(0,x.stock+qty)}:x));};
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"13px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div><p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>Pharma Portal</p><h2 style={{fontSize:16,fontWeight:800}} className="sh2">PMCare Pharmacy</h2></div>
      <button onClick={()=>{clearAuth();router.replace("/pharma/login");}} style={{padding:"6px 12px",borderRadius:10,background:"rgba(255,107,107,.08)",border:"1px solid rgba(255,107,107,.2)",color:"#FF6B6B",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Exit</button>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"0 18px"}}>
      {tab==="orders"&&(<div style={{paddingTop:14,paddingBottom:14}}>
        <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Pending Orders ({orders.length})</p>
        {loading&&<div style={{display:"flex",justifyContent:"center",padding:"28px"}}><span className="sp"/></div>}
        {!loading&&orders.length===0&&<div style={{textAlign:"center",padding:"32px"}}><p style={{fontSize:36,marginBottom:8}}>✅</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>Sab orders dispatch ho gaye!</p></div>}
        {orders.map((o:any)=>(<div key={o._id} className="card">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <div><p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>{o._id?.slice(-8)?.toUpperCase()}</p><p style={{color:"rgba(232,244,255,.4)",fontSize:10,marginTop:1}}>{o.patientName}</p><p style={{color:"rgba(232,244,255,.3)",fontSize:10}}>📍 {o.address?.line1}, {o.address?.city}</p></div>
            <p style={{color:"#F59E0B",fontWeight:800,fontSize:14}}>₹{o.total}</p>
          </div>
          <div style={{marginBottom:8}}>{(o.items||[]).map((i:any,idx:number)=>(<p key={idx} style={{color:"rgba(232,244,255,.5)",fontSize:11,marginBottom:3}}>• {i.name} × {i.qty}</p>))}</div>
          <button className="btn-p" style={{width:"100%"}} onClick={()=>dispatch(o._id)} disabled={dispatching===o._id}>{dispatching===o._id?"Dispatching...":"🚚 Mark Dispatched"}</button>
        </div>))}
      </div>)}
      {tab==="inventory"&&(<div style={{paddingTop:14,paddingBottom:14}}>
        <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Medicine Inventory</p>
        {meds.filter(m=>m.isActive!==false).sort((a:any,b:any)=>a.stock-b.stock).map((m:any)=>(<div key={m._id} className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div><p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:2}}>{m.name}</p><p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>{m.brand} · {m.category}</p></div>
            <span style={{fontWeight:800,fontSize:14,color:m.stock===0?"#FF6B6B":m.stock<10?"#FFB347":"#00FFD1"}}>{m.stock===0?"Out":"Stock: "+m.stock}</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>updateStock(m._id,-1)} style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:"none",cursor:"pointer",fontSize:16,color:"#E8F4FF"}} disabled={m.stock===0}>−</button>
            <div style={{flex:1,height:6,borderRadius:100,background:"rgba(255,255,255,.08)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:100,background:m.stock===0?"#FF6B6B":m.stock<10?"#FFB347":"#00FFD1",width:`${Math.min(100,(m.stock/100)*100)}%`}}/></div>
            <button onClick={()=>updateStock(m._id,10)} style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",cursor:"pointer",fontSize:14,color:"#fff"}}>+10</button>
          </div>
        </div>))}
      </div>)}
    </div>
    <div style={{flexShrink:0,display:"flex",background:"rgba(2,13,26,.97)",backdropFilter:"blur(24px)",borderTop:"1px solid rgba(255,255,255,.07)"}}>
      {[["orders","📦","Orders"],["inventory","💊","Inventory"]].map(([t,ic,lb])=>(
        <button key={t} className={"ni"+(tab===t?" on":"")} onClick={()=>setTab(t as any)} style={{color:tab===t?"#F59E0B":"rgba(232,244,255,.3)"}}>
          <span style={{fontSize:19}}>{ic}</span><span style={{fontSize:9,fontWeight:tab===t?700:500}}>{lb}</span>
        </button>
      ))}
    </div>
  </div>);
}
