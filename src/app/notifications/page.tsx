"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPut, getToken } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}.sp{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function Notifications(){
  const router=useRouter();const [notifs,setNotifs]=useState<any[]>([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{if(!getToken()){router.replace("/login");return;}apiGet("/notifications").then(d=>{if(Array.isArray(d))setNotifs(d);}).catch(()=>{}).finally(()=>setLoading(false));});
  const markRead=async(id:string)=>{await apiPut(`/notifications/${id}/read`,{}).catch(()=>{});setNotifs(p=>p.map(n=>n._id===id?{...n,isRead:true}:n));};
  const markAll=async()=>{await apiPut("/notifications/read-all",{}).catch(()=>{});setNotifs(p=>p.map(n=>({...n,isRead:true})));};
  const getIcon=(type:string)=>type==="appointment"?"📅":type==="order"?"📦":type==="prescription"?"💊":type==="payment"?"💳":type==="call"?"📹":"🔔";
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/dashboard" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">Notifications 🔔</h2>
      {notifs.some(n=>!n.isRead)&&<button onClick={markAll} style={{background:"none",border:"none",color:"#00FFD1",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Mark All Read</button>}
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"12px 18px"}}>
      {loading&&<div style={{display:"flex",justifyContent:"center",padding:"40px"}}><span className="sp"/></div>}
      {!loading&&notifs.length===0&&<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:40,marginBottom:10}}>🔔</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>Koi notification nahi</p></div>}
      {notifs.map((n:any)=>(<div key={n._id} onClick={()=>markRead(n._id)} style={{display:"flex",gap:12,padding:"13px 14px",borderRadius:14,background:n.isRead?"rgba(255,255,255,.02)":"rgba(0,255,209,.05)",border:`1px solid ${n.isRead?"rgba(255,255,255,.06)":"rgba(0,255,209,.15)"}`,marginBottom:9,cursor:"pointer",transition:"all .2s"}}>
        <span style={{fontSize:22,flexShrink:0}}>{getIcon(n.type)}</span>
        <div style={{flex:1}}>
          <p style={{fontWeight:n.isRead?600:800,fontSize:13,color:n.isRead?"rgba(232,244,255,.7)":"#E8F4FF",marginBottom:3}}>{n.title}</p>
          {n.body&&<p style={{color:"rgba(232,244,255,.45)",fontSize:12,lineHeight:1.5}}>{n.body}</p>}
          <p style={{color:"rgba(232,244,255,.25)",fontSize:10,marginTop:5}}>{new Date(n.createdAt).toLocaleString("en-IN")}</p>
        </div>
        {!n.isRead&&<div style={{width:8,height:8,borderRadius:"50%",background:"#00FFD1",flexShrink:0,marginTop:4}}/>}
      </div>))}
    </div>
  </div>);
}
