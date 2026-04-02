"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, getToken } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;margin-bottom:11px;cursor:pointer;transition:all .3s;text-decoration:none;display:block}.card:hover{border-color:rgba(0,255,209,.2)}.sp{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function Orders(){
  const router=useRouter();const [orders,setOrders]=useState<any[]>([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{if(!getToken()){router.replace("/login");return;}apiGet("/orders/my").then(d=>{if(Array.isArray(d))setOrders(d);}).catch(()=>{}).finally(()=>setLoading(false));});
  const sc=(s:string)=>s==="delivered"?"#00FFD1":s==="dispatched"?"#FFB347":s==="cancelled"?"#FF6B6B":"#4DB8FF";
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/dashboard" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">My Orders 📦</h2>
      <a href="/medicines" style={{padding:"7px 14px",borderRadius:100,background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",color:"#fff",fontSize:11,fontWeight:700,textDecoration:"none"}}>+ Order</a>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
      {loading&&<div style={{display:"flex",justifyContent:"center",padding:"40px"}}><span className="sp"/></div>}
      {!loading&&orders.length===0&&(<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:52,marginBottom:12}}>📦</p><p style={{fontWeight:700,fontSize:14,color:"#E8F4FF",marginBottom:4}}>Koi order nahi</p><p style={{color:"rgba(232,244,255,.38)",fontSize:12,marginBottom:16}}>Medicines order karo</p><a href="/medicines" style={{display:"inline-flex",padding:"12px 22px",borderRadius:13,background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none"}}>💊 Browse Medicines</a></div>)}
      {orders.map((o:any)=>(<a key={o._id} href={`/orders/${o._id}`} className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div><p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>ORD-{o._id?.slice(-8)?.toUpperCase()}</p><p style={{color:"rgba(232,244,255,.4)",fontSize:10,marginTop:2}}>{(o.items||[]).length} items · {new Date(o.createdAt).toLocaleDateString("en-IN")}</p></div>
          <div style={{textAlign:"right"}}><p style={{color:"#00FFD1",fontWeight:800,fontSize:14}}>₹{o.total}</p><span style={{display:"inline-block",padding:"3px 9px",borderRadius:100,fontSize:10,fontWeight:700,marginTop:4,background:sc(o.status)+"18",color:sc(o.status)}}>{(o.status||"pending").toUpperCase()}</span></div>
        </div>
        {o.tracking&&<p style={{color:"#FFB347",fontSize:11}}>📦 {o.tracking}</p>}
      </a>))}
    </div>
  </div>);
}
