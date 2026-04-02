"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, getToken } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes rp{0%{transform:scale(.8);opacity:1}to{transform:scale(2.4);opacity:0}}.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:14px;margin-bottom:11px;transition:all .3s}.card:hover{border-color:rgba(0,255,209,.2)}.btn-p{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border-radius:12px;font-weight:700;font-size:12px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit;flex:1}.btn-o{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 12px;border-radius:12px;font-weight:600;font-size:11px;color:#00FFD1;border:1px solid rgba(0,255,209,.25);background:rgba(0,255,209,.05);cursor:pointer;font-family:inherit;flex:1;text-decoration:none}.inp{width:100%;padding:11px 13px;border-radius:11px;font-size:13px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit}.inp:focus{border-color:rgba(0,255,209,.4)}.dot{width:7px;height:7px;border-radius:50%;background:#00FFD1;display:inline-block;position:relative;flex-shrink:0}.dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:rgba(0,255,209,.3);animation:rp 1.8s infinite}.sp{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}.chip{padding:6px 12px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:11px;font-weight:600;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(232,244,255,.65);white-space:nowrap;transition:all .2s;flex-shrink:0}.chip.on{background:linear-gradient(135deg,#00C9A7,#0B6FCC);border-color:transparent;color:#fff}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function Doctors(){
  const router=useRouter();const [docs,setDocs]=useState<any[]>([]);const [loading,setLoading]=useState(true);const [search,setSearch]=useState("");const [selSpec,setSelSpec]=useState("");const [onlineOnly,setOnlineOnly]=useState(false);
  const specs=["General Physician","Cardiologist","Dermatologist","Gynecologist","Orthopedic","Neurologist","Pediatrician","Psychiatrist","Ophthalmologist","ENT Specialist","Dentist"];
  useEffect(()=>{if(!getToken()){router.replace("/login");return;}apiGet("/doctors").then(d=>{if(Array.isArray(d))setDocs(d);}).catch(()=>{}).finally(()=>setLoading(false));});
  const filtered=docs.filter(d=>{const ms=!search||(d.name||"").toLowerCase().includes(search.toLowerCase())||(d.specialty||"").toLowerCase().includes(search.toLowerCase());const msp=!selSpec||d.specialty===selSpec;const mo=!onlineOnly||d.isOnline;return ms&&msp&&mo;}).sort((a:any,b:any)=>Number(b.isOnline)-Number(a.isOnline));
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/dashboard" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">Find Doctors 🩺</h2>
      <button onClick={()=>setOnlineOnly(p=>!p)} style={{padding:"6px 12px",borderRadius:100,background:onlineOnly?"linear-gradient(135deg,#00C9A7,#0B6FCC)":"rgba(0,255,209,.05)",border:"1px solid rgba(0,255,209,.25)",color:onlineOnly?"#fff":"#00FFD1",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🟢 Online</button>
    </div>
    <div style={{flexShrink:0,padding:"12px 18px 0"}}>
      <div style={{position:"relative",marginBottom:10}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14}}>🔍</span><input className="inp" style={{paddingLeft:34}} placeholder="Search doctors, specialties..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12}} className="ns">
        <button className={`chip${!selSpec?" on":""}`} onClick={()=>setSelSpec("")}>All</button>
        {specs.map(s=><button key={s} className={`chip${selSpec===s?" on":""}`} onClick={()=>setSelSpec(selSpec===s?"":s)}>{s}</button>)}
      </div>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"0 18px 16px"}}>
      {loading&&<div style={{display:"flex",justifyContent:"center",padding:"40px"}}><span className="sp"/></div>}
      {!loading&&filtered.length===0&&<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:40,marginBottom:10}}>🩺</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>No doctors found</p></div>}
      {filtered.map((d:any)=>(
        <div key={d._id} className="card">
          <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
            <div style={{width:52,height:52,borderRadius:15,background:"rgba(0,255,209,.07)",border:"1px solid rgba(0,255,209,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,overflow:"hidden",position:"relative"}}>
              {d.photo?<img src={d.photo} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:15}}/>:"👨‍⚕️"}
              {d.isOnline&&<div style={{position:"absolute",bottom:2,right:2,width:10,height:10,borderRadius:"50%",background:"#00FFD1",border:"2px solid #020D1A"}}/>}
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <p style={{fontWeight:700,fontSize:14,color:"#E8F4FF"}}>{d.name}</p>
                {d.isOnline&&<span className="dot"/>}
              </div>
              <p style={{color:"rgba(232,244,255,.45)",fontSize:11,marginBottom:3}}>{d.specialty||"General Physician"}{d.experience?` · ${d.experience} yrs exp`:""}</p>
              {d.rating&&<p style={{color:"#FFB347",fontSize:11}}>⭐ {d.rating} · {d.totalConsults||0} consultations</p>}
              {d.languages&&<p style={{color:"rgba(232,244,255,.3)",fontSize:10,marginTop:2}}>🗣 {Array.isArray(d.languages)?d.languages.join(", "):d.languages}</p>}
            </div>
            <div style={{textAlign:"right"}}>
              <p style={{color:"#00FFD1",fontWeight:900,fontSize:16}}>₹{d.fee||299}</p>
              <p style={{color:"rgba(232,244,255,.3)",fontSize:9,marginTop:1}}>per consult</p>
            </div>
          </div>
          {d.bio&&<p style={{color:"rgba(232,244,255,.4)",fontSize:11,lineHeight:1.6,marginBottom:12,padding:"8px 12px",background:"rgba(255,255,255,.02)",borderRadius:10}}>{d.bio.slice(0,100)}{d.bio.length>100?"...":""}</p>}
          <div style={{display:"flex",gap:8}}>
            <button className="btn-p" style={{flex:2,fontSize:12}} onClick={()=>router.push(`/call/room_${Date.now()}?role=patient&userId=${getToken()}&doctorId=${d._id}&doctorName=${encodeURIComponent(d.name)}&callType=video`)}>📹 Video Call</button>
            <button className="btn-o" style={{flex:1}} onClick={()=>router.push(`/call/room_${Date.now()}?role=patient&doctorId=${d._id}&doctorName=${encodeURIComponent(d.name)}&callType=audio`)}>📞</button>
            <a href={`/chat/${d._id}`} className="btn-o" style={{flex:1}}>💬</a>
          </div>
        </div>
      ))}
    </div>
  </div>);
}
