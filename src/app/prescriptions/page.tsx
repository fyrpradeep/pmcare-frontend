"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, getToken } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;margin-bottom:11px;cursor:pointer;text-decoration:none;display:block;transition:all .3s}.card:hover{border-color:rgba(0,255,209,.2)}.sp{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function Prescriptions(){
  const router=useRouter();const [rxs,setRxs]=useState<any[]>([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{if(!getToken()){router.replace("/login");return;}apiGet("/prescriptions/my/list").then(d=>{if(Array.isArray(d))setRxs(d);}).catch(()=>{}).finally(()=>setLoading(false));});
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/dashboard" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">My Prescriptions 📋</h2>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
      {loading&&<div style={{display:"flex",justifyContent:"center",padding:"40px"}}><span className="sp"/></div>}
      {!loading&&rxs.length===0&&(<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:52,marginBottom:12}}>📋</p><p style={{fontWeight:700,fontSize:14,color:"#E8F4FF",marginBottom:4}}>Koi prescription nahi</p><p style={{color:"rgba(232,244,255,.38)",fontSize:12,marginBottom:16}}>Doctor se consult karne ke baad prescription milegi</p><a href="/doctors" style={{display:"inline-flex",padding:"12px 22px",borderRadius:13,background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none"}}>🩺 Consult Doctor</a></div>)}
      {rxs.map((rx:any)=>(<a key={rx._id} href={`/prescriptions/${rx._id}`} className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div><p style={{fontWeight:800,fontSize:14,color:"#E8F4FF"}}>Rx #{rx._id?.slice(-6)?.toUpperCase()}</p><p style={{color:"rgba(232,244,255,.4)",fontSize:11,marginTop:2}}>Dr. {rx.doctorName}</p></div>
          <span style={{padding:"4px 10px",borderRadius:100,background:"rgba(0,255,209,.08)",color:"#00FFD1",fontSize:10,fontWeight:700}}>✓ Valid</span>
        </div>
        <p style={{fontWeight:600,fontSize:13,color:"#E8F4FF",marginBottom:4}}>{rx.diagnosis}</p>
        <p style={{color:"rgba(232,244,255,.35)",fontSize:10}}>{(rx.medicines||[]).length} medicines · {new Date(rx.createdAt).toLocaleDateString("en-IN")}</p>
      </a>))}
    </div>
  </div>);
}
