"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "df9a9d941e3743daaeb6a418ddb26f04";
declare const AgoraRTC: any;

const S = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
@keyframes rp{0%{transform:scale(1);opacity:.8}to{transform:scale(2.5);opacity:0}}@keyframes ps{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}@keyframes spin{to{transform:rotate(360deg)}}
.ring{position:absolute;width:100%;height:100%;border-radius:50%;border:2px solid rgba(0,255,209,.4);animation:rp 2s infinite}.r2{animation-delay:.7s}
.ctrl{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;font-size:22px;transition:all .2s}
.end-btn{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;font-size:26px;background:linear-gradient(135deg,#FF4B4B,#CC0000);box-shadow:0 0 24px rgba(255,75,75,.5)}
.acc-btn{width:68px;height:68px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;font-size:28px;background:linear-gradient(135deg,#00C9A7,#0B6FCC);animation:ps 1.5s infinite}
.sp{width:24px;height:24px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}`;

export default function CallPage() {
  const p  = useParams();
  const sq = useSearchParams();
  const roomId     = p.roomId as string;
  const role       = sq.get("role")       || "patient";
  const userId     = sq.get("userId")     || "u1";
  const userName   = decodeURIComponent(sq.get("userName")   || "User");
  const doctorId   = sq.get("doctorId")   || "d1";
  const doctorName = decodeURIComponent(sq.get("doctorName") || "Doctor");
  const callType   = sq.get("callType")   || "video";

  const sockRef     = useRef<any>(null);
  const agoraClient = useRef<any>(null);
  const localTracks = useRef<any[]>([]);
  const localVideoRef  = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const [status, setStatus]   = useState<"calling"|"incoming"|"connecting"|"connected"|"ended"|"rejected"|"error">(role==="doctor"?"incoming":"calling");
  const [inc, setInc]         = useState<any>(null);
  const [dur, setDur]         = useState(0);
  const [muted, setMuted]     = useState(false);
  const [vidOff, setVidOff]   = useState(false);
  const [errMsg, setErrMsg]   = useState("");

  useEffect(() => {
    const URL = (process.env.NEXT_PUBLIC_API_URL||"http://localhost:10000/api").replace("/api","");
    import("socket.io-client").then(({ io }) => {
      const sk = io(`${URL}/call`, { transports: ["websocket","polling"] });
      sockRef.current = sk;
      sk.on("connect", () => {
        sk.emit("register", { userId, role, name: userName });
        if (role === "patient") {
          sk.emit("call:request", { roomId, patientId:userId, patientName:userName, doctorId, doctorName, callType });
        }
      });
      sk.on("call:incoming",       (d: any) => { setInc(d); setStatus("incoming"); });
      sk.on("call:accepted",       async () => { setStatus("connecting"); await joinAgora(); });
      sk.on("call:rejected",       () => setStatus("rejected"));
      sk.on("call:doctor-offline", () => { setStatus("error"); setErrMsg("Doctor is offline"); });
      sk.on("call:ended",          () => { setStatus("ended"); leaveAgora(); });
    }).catch(() => {});
    return () => { leaveAgora(); sockRef.current?.disconnect(); };
  }, []);

  useEffect(() => {
    if (status !== "connected") return;
    const t = setInterval(() => setDur(d=>d+1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const joinAgora = async () => {
    try {
      if (typeof AgoraRTC === "undefined") { setStatus("error"); setErrMsg("Agora SDK not loaded. Please refresh."); return; }
      const { token, appId } = await apiPost("/call/agora-token", { channelName: roomId });
      const client = AgoraRTC.createClient({ mode:"rtc", codec:"vp8" });
      agoraClient.current = client;

      client.on("user-published", async (user: any, mediaType: string) => {
        await client.subscribe(user, mediaType);
        if (mediaType==="video" && remoteVideoRef.current) { remoteVideoRef.current.innerHTML=""; user.videoTrack?.play(remoteVideoRef.current); }
        if (mediaType==="audio") user.audioTrack?.play();
      });

      await client.join(appId || AGORA_APP_ID, roomId, token || null, null);

      const tracks = callType==="video"
        ? await AgoraRTC.createMicrophoneAndCameraTracks({},{encoderConfig:"480p_1"}).catch(async()=>[await AgoraRTC.createMicrophoneAudioTrack()])
        : [await AgoraRTC.createMicrophoneAudioTrack()];

      localTracks.current = Array.isArray(tracks[0]) ? tracks[0] : tracks;
      if (callType==="video" && localVideoRef.current && localTracks.current[1]) localTracks.current[1].play(localVideoRef.current);
      await client.publish(localTracks.current);
      setStatus("connected");
    } catch(e: any) {
      console.error("Agora error:", e);
      // Fallback to browser WebRTC
      setStatus("error");
      setErrMsg(e.message || "Could not start video. Please check camera/microphone permissions.");
    }
  };

  const leaveAgora = async () => {
    localTracks.current.forEach(t => { try{t.stop();t.close();}catch{} });
    localTracks.current = [];
    await agoraClient.current?.leave().catch(()=>{});
  };

  const acceptCall = async () => {
    sockRef.current?.emit("call:accept", { roomId:inc?.roomId||roomId, doctorId:userId, doctorName:userName });
    setStatus("connecting");
    await joinAgora();
    setInc(null);
  };
  const rejectCall = () => { sockRef.current?.emit("call:reject",{roomId:inc?.roomId||roomId,doctorId:userId}); window.location.href="/doctor/dashboard"; };
  const endCall = () => { sockRef.current?.emit("call:end",{roomId,userId}); leaveAgora(); setStatus("ended"); };
  const toggleMic = () => { const t=localTracks.current[0]; if(t){t.setEnabled(!t.enabled);setMuted(!t.enabled);} };
  const toggleCam = () => { const t=localTracks.current[1]; if(t){t.setEnabled(!t.enabled);setVidOff(!t.enabled);} };
  const fmt = (n: number) => `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;

  return (
    <div style={{position:"fixed",inset:0,background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF",display:"flex",flexDirection:"column"}}>
      <style>{S}</style>

      {/* CALLING */}
      {status==="calling"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#020D1A,#0D2040)"}}>
          <div style={{position:"relative",width:110,height:110,marginBottom:24}}><div className="ring"/><div className="ring r2"/>
            <div style={{position:"relative",zIndex:2,width:110,height:110,borderRadius:"50%",background:"rgba(0,255,209,.08)",border:"2px solid rgba(0,255,209,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>👨‍⚕️</div>
          </div>
          <p style={{color:"rgba(232,244,255,.5)",fontSize:14,marginBottom:6}}>Calling...</p>
          <h2 style={{fontSize:22,fontWeight:900,marginBottom:4}}>{doctorName}</h2>
          <p style={{color:"#00FFD1",fontSize:12,marginBottom:32}}>Doctor ke answer karne ka wait kar rahe hain</p>
          <button onClick={endCall} style={{padding:"12px 28px",borderRadius:100,background:"rgba(255,107,107,.15)",border:"1px solid rgba(255,107,107,.3)",color:"#FF6B6B",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
        </div>
      )}

      {/* INCOMING */}
      {status==="incoming"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#020D1A,#0D2040)"}}>
          <div style={{position:"relative",width:120,height:120,marginBottom:24}}><div className="ring"/><div className="ring r2"/>
            <div style={{position:"relative",zIndex:2,width:120,height:120,borderRadius:"50%",background:"rgba(0,255,209,.08)",border:"2px solid rgba(0,255,209,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52}}>🧑</div>
          </div>
          <p style={{color:"rgba(232,244,255,.5)",fontSize:14,marginBottom:6}}>Incoming {callType} call</p>
          <h2 style={{fontSize:24,fontWeight:900,marginBottom:32}}>{inc?.patientName||"Patient"}</h2>
          <div style={{display:"flex",gap:40}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><button onClick={rejectCall} className="end-btn">📵</button><p style={{color:"rgba(232,244,255,.5)",fontSize:12}}>Decline</p></div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}><button onClick={acceptCall} className="acc-btn">📞</button><p style={{color:"#00FFD1",fontSize:12,fontWeight:700}}>Accept</p></div>
          </div>
        </div>
      )}

      {/* CONNECTING */}
      {status==="connecting"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:"linear-gradient(180deg,#020D1A,#0D2040)"}}>
          <span className="sp" style={{marginBottom:16}}/>
          <p style={{color:"#00FFD1",fontWeight:700,fontSize:16,marginBottom:6}}>Connecting...</p>
          <p style={{color:"rgba(232,244,255,.4)",fontSize:13}}>Secure video call setup ho raha hai</p>
        </div>
      )}

      {/* CONNECTED */}
      {status==="connected"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",position:"relative"}}>
          <div ref={remoteVideoRef} style={{width:"100%",height:"100%",background:"#0D1B35",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {callType==="audio"&&(
              <div style={{textAlign:"center"}}>
                <div style={{width:90,height:90,borderRadius:"50%",background:"rgba(0,255,209,.08)",border:"2px solid rgba(0,255,209,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 12px"}}>
                  {role==="patient"?"👨‍⚕️":"🧑"}
                </div>
                <p style={{fontWeight:700,fontSize:16}}>{role==="patient"?doctorName:inc?.patientName||"Patient"}</p>
                <p style={{color:"#00FFD1",fontSize:12,marginTop:4}}>🎵 Audio call connected</p>
              </div>
            )}
          </div>
          {callType==="video"&&!vidOff&&<div ref={localVideoRef} style={{position:"absolute",top:16,right:16,width:90,height:130,borderRadius:12,border:"2px solid rgba(0,255,209,.3)",overflow:"hidden",background:"#0D1B35"}}/>}
          <div style={{position:"absolute",top:16,left:16,display:"flex",alignItems:"center",gap:7,padding:"6px 13px",borderRadius:100,background:"rgba(2,13,26,.85)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#FF4B4B"}}/>
            <span style={{fontWeight:700,fontSize:12}}>{fmt(dur)}</span>
          </div>
          <div style={{flexShrink:0,padding:"14px 20px 28px",background:"rgba(2,13,26,.9)",backdropFilter:"blur(20px)",display:"flex",alignItems:"center",justifyContent:"center",gap:16}}>
            <button className="ctrl" onClick={toggleMic} style={{background:muted?"rgba(255,107,107,.2)":"rgba(255,255,255,.08)"}}>{muted?"🔇":"🎙️"}</button>
            {callType==="video"&&<button className="ctrl" onClick={toggleCam} style={{background:vidOff?"rgba(255,107,107,.2)":"rgba(255,255,255,.08)"}}>{vidOff?"📷":"📹"}</button>}
            <button className="end-btn" onClick={endCall}>📵</button>
            <button className="ctrl" style={{background:"rgba(255,255,255,.08)"}} onClick={()=>window.location.href=`/chat/${role==="patient"?doctorId:userId}`}>💬</button>
          </div>
        </div>
      )}

      {/* ENDED/REJECTED/ERROR */}
      {(status==="ended"||status==="rejected"||status==="error")&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:16}}>{status==="ended"?"📵":status==="rejected"?"😔":"⚠️"}</div>
          <h2 style={{fontSize:20,fontWeight:800,marginBottom:8}}>{status==="ended"?"Call Khatam":status==="rejected"?"Call Declined":"Connection Failed"}</h2>
          <p style={{color:"rgba(232,244,255,.45)",fontSize:13,marginBottom:8}}>
            {status==="ended"?`Duration: ${fmt(dur)}`:status==="rejected"?"Doctor available nahi hain":errMsg}
          </p>
          <button onClick={()=>window.location.href=role==="doctor"?"/doctor/dashboard":"/dashboard"}
            style={{marginTop:16,padding:"13px 28px",borderRadius:14,background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",color:"#fff",fontWeight:700,fontSize:14,border:"none",cursor:"pointer",fontFamily:"inherit"}}>
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
