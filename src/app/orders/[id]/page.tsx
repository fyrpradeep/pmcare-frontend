"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPut } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;margin-bottom:12px}.btn-p{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:13px;border-radius:13px;font-weight:700;font-size:13px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit}.inp{width:100%;padding:11px 13px;border-radius:11px;font-size:13px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit}.sp{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function OrderDetail(){
  const {id}=useParams();const router=useRouter();const [order,setOrder]=useState<any>(null);const [loading,setLoading]=useState(true);const [editing,setEditing]=useState(false);const [addr,setAddr]=useState<any>({});
  useEffect(()=>{apiGet(`/orders/${id}`).then(d=>{setOrder(d);setAddr(d?.address||{});}).catch(()=>router.replace("/orders")).finally(()=>setLoading(false));});
  const sc=(s:string)=>s==="delivered"?"#00FFD1":s==="dispatched"?"#FFB347":s==="cancelled"?"#FF6B6B":"#4DB8FF";
  const saveAddr=async()=>{await apiPut(`/orders/${id}/address`,{address:addr}).catch(()=>{});setOrder((p:any)=>({...p,address:addr}));setEditing(false);};
  if(loading)return(<div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#020D1A"}}><span className="sp"/></div>);
  if(!order)return null;
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/orders" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">Order Details</h2>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div><p style={{fontWeight:800,fontSize:15,color:"#E8F4FF",marginBottom:3}}>ORD-{order._id?.slice(-8)?.toUpperCase()}</p><p style={{color:"rgba(232,244,255,.4)",fontSize:11}}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</p></div>
          <span style={{padding:"5px 12px",borderRadius:100,fontSize:12,fontWeight:700,background:sc(order.status)+"18",color:sc(order.status)}}>{(order.status||"PENDING").toUpperCase()}</span>
        </div>
        {order.tracking&&<div style={{padding:"10px 12px",borderRadius:11,background:"rgba(255,179,71,.07)",border:"1px solid rgba(255,179,71,.18)",marginTop:8}}><p style={{color:"rgba(232,244,255,.5)",fontSize:10}}>Tracking</p><p style={{color:"#FFB347",fontWeight:700,fontSize:13,marginTop:2}}>{order.tracking}</p></div>}
      </div>
      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>📍 Delivery Address</p>
          {order.status==="pending"&&<button onClick={()=>setEditing(!editing)} style={{background:"none",border:"none",color:"#00FFD1",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>{editing?"Cancel":"Edit"}</button>}
        </div>
        {editing?(<div>{["line1","line2","city","state","pincode"].map(k=>(<input key={k} className="inp" style={{marginBottom:8}} placeholder={k} value={addr[k]||""} onChange={e=>setAddr((p:any)=>({...p,[k]:e.target.value}))}/>))<button className="btn-p" style={{marginTop:4}} onClick={saveAddr}>💾 Save Address</button></div>):(<div>
          <p style={{color:"rgba(232,244,255,.5)",fontSize:13,lineHeight:1.7}}>{order.address?.line1}{order.address?.line2?`, ${order.address?.line2}`:""}<br/>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
        </div>)}
      </div>
      <div className="card">
        <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>🛒 Items</p>
        {(order.items||[]).map((item:any,i:number)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
          <p style={{color:"rgba(232,244,255,.5)",fontSize:12}}>{item.name} × {item.qty}</p>
          <p style={{color:"#E8F4FF",fontWeight:600,fontSize:12}}>₹{item.total||item.price*item.qty}</p>
        </div>))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"1px solid rgba(255,255,255,.08)",marginTop:4}}>
          <p style={{fontWeight:800,fontSize:14}}>Total Paid</p><p style={{fontWeight:900,fontSize:16,color:"#00FFD1"}}>₹{order.total}</p>
        </div>
      </div>
      {order.razorpayPaymentId&&<div className="card"><p style={{color:"rgba(232,244,255,.45)",fontSize:12}}>💳 Payment ID: {order.razorpayPaymentId}</p></div>}
    </div>
  </div>);
}
