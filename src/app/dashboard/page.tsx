"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiGet, getUser, getRole, getMobile, clearAuth } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api";

const S = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes rp{0%{transform:scale(.8);opacity:1}to{transform:scale(2.4);opacity:0}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:14px;margin-bottom:11px;transition:all .3s}
.card:hover{border-color:rgba(0,255,209,.2);transform:translateY(-2px)}
.btn-p{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;border-radius:12px;font-weight:700;font-size:13px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit;transition:all .2s;text-decoration:none}
.btn-o{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;border-radius:12px;font-weight:600;font-size:12px;color:#00FFD1;border:1px solid rgba(0,255,209,.25);background:rgba(0,255,209,.05);cursor:pointer;font-family:inherit;text-decoration:none}
.qb{display:flex;flex-direction:column;align-items:center;gap:7px;padding:16px 10px;border-radius:16px;cursor:pointer;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);text-decoration:none;transition:all .2s}
.qb:hover{border-color:rgba(0,255,209,.22);transform:translateY(-2px)}
.ni{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;cursor:pointer;border:none;background:none;font-family:inherit;flex:1;border-top:2px solid transparent;transition:all .2s}
.ni.on{border-top-color:#00FFD1}
.dot{width:7px;height:7px;border-radius:50%;background:#00FFD1;display:inline-block;position:relative;flex-shrink:0}
.dot::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:rgba(0,255,209,.3);animation:rp 1.8s infinite}
.sp{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}
.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;

type Tab = "home"|"doctors"|"prescriptions"|"orders"|"profile";

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab]         = useState<Tab>("home");
  const [user, setUser]       = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const sockRef = useRef<any>(null);

  useEffect(() => {
    const role = getRole();
    if (!localStorage.getItem("pm_token")) { router.replace("/login"); return; }
    if (role === "doctor") { router.replace("/doctor/dashboard"); return; }
    if (role === "admin")  { router.replace("/admin/dashboard"); return; }
    if (role === "staff")  { router.replace("/staff/dashboard"); return; }
    if (role === "pharma") { router.replace("/pharma/dashboard"); return; }
    setUser(getUser());
    connectSocket();
    loadData();
  }, []);

  const connectSocket = () => {
    const URL = (process.env.NEXT_PUBLIC_API_URL||"http://localhost:10000/api").replace("/api","");
    import("socket.io-client").then(({io}) => {
      const s = io(`${URL}/call`, {transports:["websocket","polling"]});
      sockRef.current = s;
      s.on("connect", () => {
        const u = getUser();
        s.emit("register", {userId:u?._id||getMobile(), role:"patient", name:u?.name||"Patient"});
      });
      s.on("call:doctor-offline", () => alert("Doctor is offline. Try another doctor."));
      s.on("call:rejected", () => alert("Doctor declined the call."));
    }).catch(() => {});
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, rxs, ords] = await Promise.all([
        apiGet("/doctors").catch(() => []),
        apiGet("/prescriptions/my/list").catch(() => []),
        apiGet("/orders/my").catch(() => []),
      ]);
      if (Array.isArray(docs)) setDoctors(docs);
      if (Array.isArray(rxs))  setPrescriptions(rxs);
      if (Array.isArray(ords)) setOrders(ords);
    } finally { setLoading(false); }
  };

  const callDoctor = (d: any, type: "video"|"audio") => {
    const u = getUser();
    const pid = u?._id || getMobile();
    const roomId = `room_${pid}_${d._id}_${Date.now()}`;
    if (sockRef.current?.connected) {
      sockRef.current.emit("call:request", { roomId, patientId:pid, patientName:u?.name||"Patient", doctorId:d._id, doctorName:d.name, callType:type });
    }
    router.push(`/call/${roomId}?role=patient&userId=${pid}&userName=${encodeURIComponent(u?.name||"Patient")}&doctorId=${d._id}&doctorName=${encodeURIComponent(d.name)}&callType=${type}`);
  };

  const gr = () => { const h=new Date().getHours(); return h<12?"Shubh Prabhat 🌅":h<17?"Namaste ☀️":"Shubh Sandhya 🌇"; };
  const fn = (user?.name||"").split(" ")[0] || "Dost";

  const DoctorCard = ({d}:{d:any}) => (
    <div className="card">
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:11}}>
        <div style={{width:48,height:48,borderRadius:14,background:"rgba(0,255,209,.07)",border:"1px solid rgba(0,255,209,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,overflow:"hidden"}}>
          {d.photo ? <img src={d.photo} alt={d.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:14}}/> : "👨‍⚕️"}
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
            <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>{d.name}</p>
            {d.isOnline&&<span className="dot"/>}
          </div>
          <p style={{color:"rgba(232,244,255,.45)",fontSize:11}}>{d.specialty||"General Physician"}{d.experience?` · ${d.experience} yrs`:""}</p>
          {d.rating&&<p style={{color:"#FFB347",fontSize:10,marginTop:2}}>⭐ {d.rating} · {d.totalConsults||0} consults</p>}
        </div>
        <div style={{textAlign:"right"}}>
          <p style={{color:"#00FFD1",fontWeight:800,fontSize:14}}>₹{d.fee||299}</p>
          <p style={{color:"rgba(232,244,255,.3)",fontSize:10}}>per consult</p>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button className="btn-p" style={{flex:2,padding:"10px",fontSize:12}} onClick={()=>callDoctor(d,"video")}>📹 Video Call</button>
        <button className="btn-o" style={{flex:1,fontSize:11}} onClick={()=>callDoctor(d,"audio")}>📞 Audio</button>
        <a href={`/chat/${d._id}`} className="btn-o" style={{flex:1,fontSize:11}}>💬 Chat</a>
      </div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
      <style>{S}</style>
      {/* Header */}
      <div style={{flexShrink:0,padding:"14px 18px 13px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><p style={{color:"rgba(232,244,255,.4)",fontSize:11}}>{gr()},</p><h2 style={{fontSize:18,fontWeight:900}} className="sh">{fn} 👋</h2></div>
          <div style={{display:"flex",gap:8}}>
            <a href="/notifications" style={{width:36,height:36,borderRadius:11,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.09)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer",textDecoration:"none"}}>🔔</a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ns" style={{flex:1,overflowY:"auto",padding:"0 18px"}}>
        {tab==="home"&&(
          <div style={{paddingTop:16,paddingBottom:16,animation:"fu .5s ease"}}>
            {/* Stats */}
            <div style={{display:"flex",gap:10,marginBottom:18}}>
              {[{n:doctors.filter(d=>d.isOnline).length,l:"Doctors Live",c:"#00FFD1"},{n:prescriptions.length,l:"Prescriptions",c:"#4DB8FF"},{n:orders.length,l:"Orders",c:"#A78BFA"}].map(s=>(
                <div key={s.l} style={{flex:1,textAlign:"center",padding:"12px 8px",borderRadius:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
                  <p style={{fontWeight:900,fontSize:20,color:s.c}}>{s.n}</p>
                  <p style={{fontSize:9,color:"rgba(232,244,255,.35)",marginTop:2}}>{s.l}</p>
                </div>
              ))}
            </div>
            {/* Quick actions */}
            <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:12}}>Quick Actions</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9,marginBottom:20}}>
              {[{ic:"🩺",l:"Doctors",h:"/doctors"},{ic:"💊",l:"Medicines",h:"/medicines"},{ic:"📋",l:"Records",h:"/prescriptions"},{ic:"📦",l:"Orders",h:"/orders"}].map(q=>(
                <a key={q.l} href={q.h} className="qb"><span style={{fontSize:26}}>{q.ic}</span><span style={{fontSize:10,fontWeight:600,color:"rgba(232,244,255,.65)"}}>{q.l}</span></a>
              ))}
            </div>
            {/* Welcome */}
            {prescriptions.length===0&&!loading&&(
              <div style={{background:"linear-gradient(135deg,rgba(0,201,167,.12),rgba(11,111,204,.15))",border:"1px solid rgba(0,255,209,.18)",borderRadius:18,padding:18,marginBottom:18}}>
                <p style={{fontSize:14,fontWeight:800,color:"#E8F4FF",marginBottom:4}}>👋 Welcome, {fn}!</p>
                <p style={{color:"rgba(232,244,255,.5)",fontSize:13,lineHeight:1.7,marginBottom:14}}>Abhi ek doctor se consult karo — free!<br/>Live doctors available hain.</p>
                <a href="/doctors" className="btn-p" style={{display:"flex",justifyContent:"center"}}>🩺 Doctor Dhundo</a>
              </div>
            )}
            {/* Online Doctors */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1.2}}>Online Doctors</p>
              <a href="/doctors" style={{color:"#00FFD1",fontSize:11,fontWeight:600,textDecoration:"none"}}>Sab dekho →</a>
            </div>
            {loading ? <div style={{display:"flex",justifyContent:"center",padding:"28px 0"}}><span className="sp"/></div>
            : doctors.filter(d=>d.isOnline).length===0 ? (
              <div style={{textAlign:"center",padding:"28px 20px",background:"rgba(255,255,255,.02)",borderRadius:16,border:"1px solid rgba(255,255,255,.06)"}}>
                <p style={{fontSize:32,marginBottom:8}}>🩺</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>Abhi koi doctor online nahi. Thodi der mein check karo.</p>
              </div>
            ) : doctors.filter(d=>d.isOnline).slice(0,3).map((d:any)=><DoctorCard key={d._id} d={d}/>)}
          </div>
        )}

        {tab==="doctors"&&(
          <div style={{paddingTop:16,paddingBottom:16}}>
            <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:14}}>All Doctors ({doctors.length})</p>
            {loading?<div style={{display:"flex",justifyContent:"center",padding:"28px"}}><span className="sp"/></div>
            :doctors.length===0?<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:36,marginBottom:10}}>🩺</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>Koi doctor available nahi</p></div>
            :doctors.map((d:any)=><DoctorCard key={d._id} d={d}/>)}
          </div>
        )}

        {tab==="prescriptions"&&(
          <div style={{paddingTop:16,paddingBottom:16}}>
            <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:14}}>Meri Prescriptions ({prescriptions.length})</p>
            {loading?<div style={{display:"flex",justifyContent:"center",padding:"28px"}}><span className="sp"/></div>
            :prescriptions.length===0?<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:40,marginBottom:10}}>📋</p><p style={{fontWeight:700,fontSize:14,color:"#E8F4FF",marginBottom:4}}>Koi prescription nahi</p><p style={{color:"rgba(232,244,255,.38)",fontSize:12,marginBottom:16}}>Doctor se consult karo</p><a href="/doctors" className="btn-p" style={{display:"inline-flex",padding:"11px 22px",width:"auto"}}>🩺 Doctor Dhundo</a></div>
            :prescriptions.map((rx:any)=>(
              <a key={rx._id} href={`/prescriptions/${rx._id}`} className="card" style={{display:"block",textDecoration:"none",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>RX-{rx._id?.slice(-6)?.toUpperCase()}</p>
                  <span style={{padding:"3px 9px",borderRadius:100,background:"rgba(0,255,209,.08)",color:"#00FFD1",fontSize:10,fontWeight:700}}>✓ Valid</span>
                </div>
                <p style={{color:"rgba(232,244,255,.5)",fontSize:12,marginBottom:3}}>{rx.diagnosis}</p>
                <p style={{color:"rgba(232,244,255,.3)",fontSize:10}}>Dr. {rx.doctorName} · {new Date(rx.createdAt).toLocaleDateString("en-IN")}</p>
              </a>
            ))}
          </div>
        )}

        {tab==="orders"&&(
          <div style={{paddingTop:16,paddingBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1.2}}>Mere Orders ({orders.length})</p>
              <a href="/medicines" className="btn-p" style={{padding:"7px 14px",fontSize:11,width:"auto"}}>+ New Order</a>
            </div>
            {loading?<div style={{display:"flex",justifyContent:"center",padding:"28px"}}><span className="sp"/></div>
            :orders.length===0?<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:40,marginBottom:10}}>📦</p><p style={{fontWeight:700,fontSize:14,color:"#E8F4FF",marginBottom:4}}>Koi order nahi</p><a href="/medicines" className="btn-p" style={{display:"inline-flex",padding:"11px 22px",width:"auto",marginTop:12}}>💊 Medicines Order Karo</a></div>
            :orders.map((o:any)=>(
              <a key={o._id} href={`/orders/${o._id}`} className="card" style={{display:"block",textDecoration:"none",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF"}}>ORD-{o._id?.slice(-6)?.toUpperCase()}</p>
                  <span style={{padding:"3px 9px",borderRadius:100,fontSize:10,fontWeight:700,background:o.status==="delivered"?"rgba(0,255,209,.08)":o.status==="dispatched"?"rgba(255,179,71,.08)":"rgba(255,107,107,.08)",color:o.status==="delivered"?"#00FFD1":o.status==="dispatched"?"#FFB347":"#FF6B6B"}}>{o.status?.toUpperCase()}</span>
                </div>
                <p style={{color:"rgba(232,244,255,.5)",fontSize:12,marginBottom:3}}>{o.items?.length} items · ₹{o.total}</p>
                <p style={{color:"rgba(232,244,255,.3)",fontSize:10}}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</p>
              </a>
            ))}
          </div>
        )}

        {tab==="profile"&&(
          <div style={{paddingTop:16,paddingBottom:16}}>
            <div style={{background:"linear-gradient(135deg,rgba(0,201,167,.1),rgba(11,111,204,.12))",border:"1px solid rgba(0,255,209,.15)",borderRadius:18,padding:18,marginBottom:16,textAlign:"center"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(0,255,209,.1)",border:"2px solid rgba(0,255,209,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 10px",overflow:"hidden"}}>
                {user?.photo?<img src={user.photo} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>:"🧑"}
              </div>
              <h3 style={{fontWeight:800,fontSize:17,color:"#E8F4FF",marginBottom:3}}>{user?.name||"Patient"}</h3>
              <p style={{color:"#00FFD1",fontSize:12,fontWeight:600}}>Patient</p>
              <p style={{color:"rgba(232,244,255,.35)",fontSize:11,marginTop:2}}>{user?.mobile?`+91 ${user.mobile}`:user?.email||getMobile()}</p>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              {[{n:prescriptions.length,l:"Consults",c:"#00FFD1"},{n:orders.length,l:"Orders",c:"#4DB8FF"}].map(s=>(
                <div key={s.l} style={{flex:1,textAlign:"center",padding:"12px",borderRadius:13,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)"}}>
                  <p style={{fontWeight:900,fontSize:20,color:s.c}}>{s.n}</p>
                  <p style={{fontSize:10,color:"rgba(232,244,255,.38)",marginTop:2}}>{s.l}</p>
                </div>
              ))}
            </div>
            {[{i:"👤",l:"Edit Profile",h:"/profile"},{i:"📋",l:"Health Records",h:"/prescriptions"},{i:"📦",l:"My Orders",h:"/orders"},{i:"💊",l:"Medicines",h:"/medicines"},{i:"📅",l:"Appointments",h:"/appointments"},{i:"❓",l:"Help & Support",h:"/contact"}].map(it=>(
              <a key={it.l} href={it.h} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:13,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:9,textDecoration:"none",color:"#E8F4FF"}}>
                <span style={{fontSize:19}}>{it.i}</span><span style={{fontWeight:600,fontSize:13,flex:1}}>{it.l}</span><span style={{color:"rgba(232,244,255,.25)"}}>→</span>
              </a>
            ))}
            <button onClick={()=>{clearAuth();window.location.href="/login";}} style={{width:"100%",padding:"13px",borderRadius:13,background:"rgba(255,107,107,.07)",border:"1px solid rgba(255,107,107,.18)",color:"#FF6B6B",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>Sign Out</button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{flexShrink:0,display:"flex",background:"rgba(2,13,26,.97)",backdropFilter:"blur(24px)",borderTop:"1px solid rgba(255,255,255,.07)"}}>
        {([["home","🏠","Home"],["doctors","🩺","Doctors"],["prescriptions","📋","Rx"],["orders","📦","Orders"],["profile","👤","Profile"]] as [Tab,string,string][]).map(([t,ic,lb])=>(
          <button key={t} className={"ni"+(tab===t?" on":"")} onClick={()=>setTab(t)} style={{color:tab===t?"#00FFD1":"rgba(232,244,255,.3)"}}>
            <span style={{fontSize:19}}>{ic}</span><span style={{fontSize:9,fontWeight:tab===t?700:500}}>{lb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
