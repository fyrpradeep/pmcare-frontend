"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { apiGet, getUser, getMobile } from "@/lib/api";

const S = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}
.msg-in{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:18px 18px 18px 4px;padding:10px 14px;max-width:80%;font-size:13px;line-height:1.6;animation:fu .2s ease}
.msg-out{background:linear-gradient(135deg,rgba(0,201,167,.2),rgba(11,111,204,.2));border:1px solid rgba(0,255,209,.15);border-radius:18px 18px 4px 18px;padding:10px 14px;max-width:80%;font-size:13px;line-height:1.6;animation:fu .2s ease;align-self:flex-end}
.inp{flex:1;padding:11px 16px;border-radius:100px;font-size:13px;outline:none;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit}
.inp:focus{border-color:rgba(0,255,209,.4)}
.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;

export default function Chat() {
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [msgs, setMsgs]     = useState<any[]>([]);
  const [text, setText]     = useState("");
  const [typing, setTyping] = useState(false);
  const sockRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const user = getUser();
  const myId = user?._id || getMobile();

  useEffect(() => {
    apiGet(`/doctors/${doctorId}`).then(d=>setDoctor(d)).catch(()=>{});
    // Connect chat socket
    const URL=(process.env.NEXT_PUBLIC_API_URL||"http://localhost:10000/api").replace("/api","");
    import("socket.io-client").then(({io})=>{
      const s=io(`${URL}/chat`,{transports:["websocket","polling"]});
      sockRef.current=s;
      s.on("connect",()=>{ s.emit("chat:register",{userId:myId}); });
      s.on("chat:message",(d:any)=>{ setMsgs(p=>[...p,d]); setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100); });
      s.on("chat:typing",(d:any)=>{ if(d.toId===myId){setTyping(d.isTyping);if(d.isTyping)setTimeout(()=>setTyping(false),3000);} });
    }).catch(()=>{});
    return ()=>sockRef.current?.disconnect();
  },[doctorId]);

  const send=()=>{
    if(!text.trim())return;
    sockRef.current?.emit("chat:send",{toId:doctorId,fromId:myId,fromName:user?.name||"Patient",message:text.trim(),type:"text"});
    setText("");
    sockRef.current?.emit("chat:typing",{toId:doctorId,isTyping:false});
  };

  const onType=(v:string)=>{
    setText(v);
    if(v.length>0){sockRef.current?.emit("chat:typing",{toId:doctorId,isTyping:true});}
    else{sockRef.current?.emit("chat:typing",{toId:doctorId,isTyping:false});}
  };

  const fmt=(ts:string)=>new Date(ts).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});

  return (
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
      <style>{S}</style>
      {/* Header */}
      <div style={{flexShrink:0,padding:"12px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
        <a href="/dashboard" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
        <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(0,255,209,.1)",border:"1px solid rgba(0,255,209,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,overflow:"hidden",flexShrink:0}}>
          {doctor?.photo?<img src={doctor.photo} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"👨‍⚕️"}
        </div>
        <div style={{flex:1}}>
          <p style={{fontWeight:700,fontSize:14,color:"#E8F4FF"}}>{doctor?.name||"Doctor"}</p>
          <p style={{color:"rgba(232,244,255,.4)",fontSize:11}}>{doctor?.specialty||"Doctor"} {doctor?.isOnline?"· 🟢 Online":"· ⚫ Offline"}</p>
        </div>
        <a href={`/call/room_${myId}_${doctorId}_${Date.now()}?role=patient&userId=${myId}&userName=${encodeURIComponent(user?.name||"Patient")}&doctorId=${doctorId}&doctorName=${encodeURIComponent(doctor?.name||"Doctor")}&callType=video`}
          style={{width:36,height:36,borderRadius:11,background:"rgba(0,255,209,.08)",border:"1px solid rgba(0,255,209,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,textDecoration:"none"}}>📹</a>
      </div>

      {/* Messages */}
      <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",color:"rgba(232,244,255,.35)",fontSize:13"}}>
            <p style={{fontSize:36,marginBottom:10}}>💬</p>
            <p>Doctor se baat karo!</p>
            <p style={{fontSize:12,marginTop:4}}>Apni symptoms, reports share karo</p>
          </div>
        )}
        {msgs.map((m,i)=>{
          const isMe=m.fromId===myId;
          return (
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start"}}>
              <div className={isMe?"msg-out":"msg-in"}>{m.message}</div>
              <p style={{fontSize:10,color:"rgba(232,244,255,.25)",marginTop:3,paddingLeft:4,paddingRight:4}}>{m.fromName} · {fmt(m.timestamp)}</p>
            </div>
          );
        })}
        {typing&&<div className="msg-in" style={{opacity:.6,fontSize:12}}>Doctor is typing...</div>}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{flexShrink:0,padding:"12px 18px 20px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",gap:10,alignItems:"center"}}>
        <input className="inp" placeholder="Message likhiye..." value={text} onChange={e=>onType(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}/>
        <button onClick={send} disabled={!text.trim()} style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,opacity:text.trim()?1:.5}}>📤</button>
      </div>
    </div>
  );
}
