"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPut, getUser, getRole, getMobile, clearAuth } from "@/lib/api";

const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes rp{0%{transform:scale(.8);opacity:1}to{transform:scale(2.4);opacity:0}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes ps{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}@keyframes fi{from{opacity:0}to{opacity:1}}
.sh2{background:linear-gradient(90deg,#4DB8FF,#00FFD1,#4DB8FF);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 3s linear infinite}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:14px;margin-bottom:11px}
.btn-p{display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;border-radius:12px;font-weight:700;font-size:13px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit;text-decoration:none}
.ni{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;cursor:pointer;border:none;background:none;font-family:inherit;flex:1;border-top:2px solid transparent}
.ni.on{border-top-color:#4DB8FF}
.dot{width:8px;height:8px;border-radius:50%;background:#00FFD1;display:inline-block;position:relative}
.dot::after{content:'';position:absolute;inset:-4px;border-radius:50%;background:rgba(0,255,209,.3);animation:rp 1.8s infinite}
.tg{width:44px;height:24px;border-radius:100px;cursor:pointer;transition:all .3s;position:relative;border:none;flex-shrink:0}
.tgk{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:all .3s}
.rn{position:absolute;width:100%;height:100%;border-radius:50%;border:2px solid rgba(0,255,209,.4);animation:rp 2s infinite}
.r2{animation-delay:.7s}
.acc{width:68px;height:68px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;font-size:28px;background:linear-gradient(135deg,#00C9A7,#0B6FCC);animation:ps 1.5s infinite}
.rej{width:68px;height:68px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;font-size:28px;background:linear-gradient(135deg,#FF4B4B,#CC0000)}
.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;

type Tab="queue"|"prescribe"|"history"|"earnings"|"profile";

export default function DoctorDashboard() {
  const router=useRouter();
  const [tab,setTab]=useState<Tab>("queue");
  const [user,setUser]=useState<any>(null);
  const [online,setOnline]=useState(false);
  const [sockSt,setSockSt]=useState<"off"|"connecting"|"on"|"fail">("off");
  const [inc,setInc]=useState<any>(null);
  const [isPending,setIsPending]=useState(false);
  const [earnings,setEarnings]=useState<any>({totalEarnings:0,totalConsults:0,pendingPayout:0});
  const sockRef=useRef<any>(null);

  useEffect(()=>{
    const role=getRole();
    if(!localStorage.getItem("pm_token")){router.replace("/doctor/login");return;}
    if(role==="patient"){router.replace("/dashboard");return;}
    const u=getUser();setUser(u);
    if(u?.status==="pending")setIsPending(true);
    setEarnings({totalEarnings:u?.totalEarnings||0,totalConsults:u?.totalConsults||0,pendingPayout:u?.pendingPayout||0});
  },[]);

  const connectSocket=(u:any)=>{
    setSockSt("connecting");
    const URL=(process.env.NEXT_PUBLIC_API_URL||"http://localhost:10000/api").replace("/api","");
    import("socket.io-client").then(({io})=>{
      const s=io(`${URL}/call`,{transports:["websocket","polling"],timeout:8000,reconnectionAttempts:5});
      sockRef.current=s;
      const did=u?._id||getMobile();
      s.on("connect",()=>{
        setSockSt("on");
        s.emit("register",{userId:did,role:"doctor",name:u?.name||"Doctor"});
        // Update online status
        apiPut("/doctors/me/online",{isOnline:true}).catch(()=>{});
        console.log("✅ Doctor live:", did);
      });
      s.on("disconnect",()=>setSockSt("fail"));
      s.on("connect_error",()=>setSockSt("fail"));
      s.on("call:incoming",(d:any)=>{
        setInc(d);
        try{const ac=new AudioContext();[0,700,1400].forEach(delay=>{const o=ac.createOscillator();const g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.value=520;g.gain.value=0.3;o.start(ac.currentTime+delay/1000);o.stop(ac.currentTime+delay/1000+0.4);});}catch{}
      });
      s.on("call:ended",()=>setInc(null));
      setTimeout(()=>{if(!s.connected)setSockSt("fail");},9000);
    }).catch(()=>setSockSt("fail"));
  };

  const disconnectSocket=()=>{
    sockRef.current?.disconnect();sockRef.current=null;setSockSt("off");
    apiPut("/doctors/me/online",{isOnline:false}).catch(()=>{});
  };

  const toggleOnline=(v:boolean)=>{setOnline(v);if(v)connectSocket(user||getUser());else disconnectSocket();};

  const accept=()=>{
    if(!inc)return;
    const u=user||getUser();const did=u?._id||getMobile();
    sockRef.current?.emit("call:accept",{roomId:inc.roomId,doctorId:did,doctorName:u?.name||"Doctor"});
    router.push(`/call/${inc.roomId}?role=doctor&userId=${did}&userName=${encodeURIComponent(u?.name||"Doctor")}&callType=${inc.callType||"video"}`);
    setInc(null);
  };
  const reject=()=>{sockRef.current?.emit("call:reject",{roomId:inc?.roomId,doctorId:user?._id||getMobile()});setInc(null);};

  if(isPending) return (
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF",padding:24,textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:16}}>⏳</div>
      <h2 style={{fontSize:22,fontWeight:900,marginBottom:8}}>Account Under Review</h2>
      <p style={{color:"rgba(232,244,255,.5)",fontSize:14,lineHeight:1.8,marginBottom:24}}>Aapka doctor account admin approval ka wait kar raha hai.<br/>Usually 24 hours mein approve hota hai.</p>
      <button onClick={()=>{clearAuth();window.location.href="/doctor/login";}} style={{padding:"12px 24px",borderRadius:13,background:"rgba(255,107,107,.07)",border:"1px solid rgba(255,107,107,.18)",color:"#FF6B6B",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Sign Out</button>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
      <style>{S}</style>

      {/* Incoming Call Overlay */}
      {inc&&(
        <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(2,13,26,.95)",backdropFilter:"blur(14px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fi .3s ease"}}>
          <div style={{position:"relative",width:130,height:130,marginBottom:20}}>
            <div className="rn"/><div className="rn r2"/>
            <div style={{position:"relative",zIndex:2,width:130,height:130,borderRadius:"50%",background:"rgba(0,255,209,.1)",border:"2px solid rgba(0,255,209,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56}}>🧑</div>
          </div>
          <p style={{color:"rgba(232,244,255,.5)",fontSize:14,marginBottom:6}}>Incoming {inc.callType||"video"} call</p>
          <h2 style={{fontSize:28,fontWeight:900,marginBottom:6}}>{inc.patientName}</h2>
          <p style={{color:"rgba(232,244,255,.35)",fontSize:12,marginBottom:36}}>Patient · PMCare</p>
          <div style={{display:"flex",gap:48}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><button onClick={reject} className="rej">📵</button><p style={{color:"rgba(232,244,255,.5)",fontSize:12}}>Decline</p></div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><button onClick={accept} className="acc">📞</button><p style={{color:"#00FFD1",fontSize:12,fontWeight:700}}>Accept</p></div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{flexShrink:0,padding:"13px 18px 12px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><p style={{color:"rgba(232,244,255,.4)",fontSize:11}}>Doctor Portal</p><h2 style={{fontSize:17,fontWeight:800}} className="sh2">{user?.name||"Doctor"}</h2></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <p style={{color:online?"#00FFD1":"rgba(232,244,255,.35)",fontSize:11,fontWeight:600}}>{online?"Online":"Offline"}</p>
            <button className="tg" onClick={()=>toggleOnline(!online)} style={{background:online?"#00C9A7":"rgba(255,255,255,.1)"}}>
              <div className="tgk" style={{left:online?23:3}}/>
            </button>
            {online&&sockSt==="on"&&<span className="dot"/>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ns" style={{flex:1,overflowY:"auto",padding:"0 18px"}}>
        {tab==="queue"&&(
          <div style={{paddingTop:14,animation:"fu .4s ease"}}>
            {!online?(
              <div style={{textAlign:"center",padding:"50px 20px"}}>
                <p style={{fontSize:52,marginBottom:12}}>😴</p>
                <p style={{color:"#FF6B6B",fontWeight:700,fontSize:15,marginBottom:8}}>You are Offline</p>
                <p style={{color:"rgba(232,244,255,.4)",fontSize:13,marginBottom:20}}>Toggle Online above to receive patient calls</p>
                <button className="btn-p" style={{margin:"0 auto",width:"auto",padding:"12px 24px"}} onClick={()=>toggleOnline(true)}>Go Online →</button>
              </div>
            ):sockSt==="on"?(
              <div style={{background:"rgba(0,255,209,.05)",border:"1px solid rgba(0,255,209,.2)",borderRadius:16,padding:20,textAlign:"center",marginTop:10}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><span className="dot"/></div>
                <p style={{color:"#00FFD1",fontWeight:800,fontSize:16,marginBottom:6}}>You are Live!</p>
                <p style={{color:"rgba(232,244,255,.45)",fontSize:13,lineHeight:1.7}}>Patients can now call you.<br/>Incoming call will appear as popup with sound.</p>
              </div>
            ):sockSt==="connecting"?(
              <div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:36,marginBottom:10}}>🔄</p><p style={{color:"#FFB347",fontWeight:700,fontSize:14}}>Connecting...</p></div>
            ):(
              <div style={{textAlign:"center",padding:"36px 20px"}}>
                <p style={{fontSize:36,marginBottom:10}}>⚠️</p>
                <p style={{color:"#FFB347",fontWeight:700,fontSize:14,marginBottom:6}}>Connection issue</p>
                <p style={{color:"rgba(232,244,255,.4)",fontSize:12,marginBottom:14}}>You are still marked online. Patients can call.</p>
                <button className="btn-p" style={{margin:"0 auto",width:"auto",padding:"10px 20px",fontSize:12}} onClick={()=>connectSocket(user||getUser())}>Retry</button>
              </div>
            )}
          </div>
        )}

        {tab==="prescribe"&&(
          <div style={{paddingTop:14}}>
            <div className="card">
              <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Write Prescription</p>
              {["Patient Name","Diagnosis","Medicines (name, dosage, duration — one per line)","Doctor's Advice & Instructions"].map(f=>(
                <div key={f} style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{f}</label>
                  <textarea rows={f.includes("Medicines")||f.includes("Advice")?4:1} placeholder={`Enter ${f.toLowerCase()}...`}
                    style={{width:"100%",padding:"11px 13px",borderRadius:11,background:"rgba(255,255,255,.04)",border:"1.5px solid rgba(255,255,255,.08)",color:"#E8F4FF",fontFamily:"inherit",fontSize:12,outline:"none",resize:"none",lineHeight:1.6,transition:"all .3s"}}
                    onFocus={e=>e.target.style.borderColor="rgba(77,184,255,.5)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.08)"}/>
                </div>
              ))}
              <button className="btn-p" style={{width:"100%"}}>💊 Send Prescription</button>
            </div>
          </div>
        )}

        {tab==="history"&&(
          <div style={{paddingTop:14,textAlign:"center",paddingBottom:14}}>
            <p style={{fontSize:36,marginBottom:10}}>📋</p>
            <p style={{fontWeight:700,fontSize:14,color:"#E8F4FF",marginBottom:4}}>Consultation History</p>
            <p style={{color:"rgba(232,244,255,.38)",fontSize:12}}>Aapki consultations yahan dikhegi</p>
          </div>
        )}

        {tab==="earnings"&&(
          <div style={{paddingTop:14,paddingBottom:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[{n:`₹${(earnings.totalEarnings||0).toLocaleString("en-IN")}`,l:"Total Earned",c:"#00FFD1"},{n:earnings.totalConsults||0,l:"Consultations",c:"#4DB8FF"},{n:`₹${(earnings.pendingPayout||0).toLocaleString("en-IN")}`,l:"Pending Payout",c:"#FFB347"},{n:`${(user?.consultCommission||80)}%`,l:"Your Share",c:"#A78BFA"}].map(s=>(
                <div key={s.l} style={{padding:"16px",borderRadius:16,background:`${s.c}10`,border:`1px solid ${s.c}22`}}>
                  <p style={{fontWeight:900,fontSize:20,color:s.c}}>{s.n}</p>
                  <p style={{fontSize:10,color:"rgba(232,244,255,.4)",marginTop:3}}>{s.l}</p>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:16,marginBottom:14}}>
              <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:8}}>Payout Details</p>
              <p style={{color:"rgba(232,244,255,.5)",fontSize:12,marginBottom:4}}>Bank: {user?.bankAccount?`****${user.bankAccount.slice(-4)}`:"Not added"}</p>
              <p style={{color:"rgba(232,244,255,.5)",fontSize:12}}>UPI: {user?.upi||"Not added"}</p>
            </div>
            <a href="/doctor/profile" className="btn-p" style={{display:"flex",justifyContent:"center"}}>💳 Update Bank Details</a>
          </div>
        )}

        {tab==="profile"&&(
          <div style={{paddingTop:14}}>
            <div style={{background:"linear-gradient(135deg,rgba(77,184,255,.1),rgba(11,111,204,.12))",border:"1px solid rgba(77,184,255,.15)",borderRadius:18,padding:18,marginBottom:14,textAlign:"center"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(77,184,255,.1)",border:"2px solid rgba(77,184,255,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 10px",overflow:"hidden"}}>
                {user?.photo?<img src={user.photo} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/>:"👨‍⚕️"}
              </div>
              <h3 style={{fontWeight:800,fontSize:17,color:"#E8F4FF",marginBottom:3}}>{user?.name||"Doctor"}</h3>
              <p style={{color:"#4DB8FF",fontSize:12,fontWeight:600}}>{user?.specialty||"Doctor"}</p>
              <p style={{color:"rgba(232,244,255,.35)",fontSize:11,marginTop:2}}>{user?.mobile?`+91 ${user.mobile}`:user?.email||getMobile()}</p>
              {user?.rating&&<p style={{color:"#FFB347",fontSize:12,marginTop:4}}>⭐ {user.rating} · {user.totalConsults||0} consults</p>}
            </div>
            {[{i:"✏️",l:"Edit Profile & Fee",h:"/doctor/profile"},{i:"📅",l:"My Appointments",h:"/appointments"},{i:"💬",l:"Patient Chats",h:"/doctor/prescriptions"},{i:"📋",l:"My Prescriptions",h:"/doctor/prescriptions"},{i:"❓",l:"Help & Support",h:"/contact"}].map(it=>(
              <a key={it.l} href={it.h} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:13,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:9,textDecoration:"none",color:"#E8F4FF"}}>
                <span style={{fontSize:19}}>{it.i}</span><span style={{fontWeight:600,fontSize:13,flex:1}}>{it.l}</span><span style={{color:"rgba(232,244,255,.25)"}}>→</span>
              </a>
            ))}
            <button onClick={()=>{disconnectSocket();clearAuth();window.location.href="/doctor/login";}} style={{width:"100%",padding:"13px",borderRadius:13,background:"rgba(255,107,107,.07)",border:"1px solid rgba(255,107,107,.18)",color:"#FF6B6B",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Sign Out</button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{flexShrink:0,display:"flex",background:"rgba(2,13,26,.97)",backdropFilter:"blur(24px)",borderTop:"1px solid rgba(255,255,255,.07)"}}>
        {([["queue","🏥","Queue"],["prescribe","💊","Prescribe"],["history","📋","History"],["earnings","💰","Earnings"],["profile","👤","Profile"]] as [Tab,string,string][]).map(([t,ic,lb])=>(
          <button key={t} className={"ni"+(tab===t?" on":"")} onClick={()=>setTab(t)} style={{color:tab===t?"#4DB8FF":"rgba(232,244,255,.3)"}}>
            <span style={{fontSize:18}}>{ic}</span><span style={{fontSize:8,fontWeight:tab===t?700:500}}>{lb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
