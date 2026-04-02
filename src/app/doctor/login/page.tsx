"use client";
import { useState, useRef, useEffect } from "react";
import { apiPost, setAuth, goTo, getMobile } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api";
const S = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
  @keyframes spin{to{transform:rotate(360deg)}}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}
  @keyframes fy{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{0%{transform:scale(.85)}60%{transform:scale(1.1)}to{transform:scale(1)}}
  .sh2{background:linear-gradient(90deg,#4DB8FF,#00FFD1,#4DB8FF);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 3s linear infinite}
  .inp{width:100%;padding:13px 16px;border-radius:13px;font-size:14px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
  .inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(77,184,255,.5);background:rgba(77,184,255,.04)}
  .btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border-radius:14px;font-weight:800;font-size:14px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#4DB8FF,#0B6FCC);transition:all .3s;font-family:inherit}
  .btn:disabled{opacity:.5;cursor:not-allowed}
  .btn-o{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:14px;border-radius:14px;font-weight:700;font-size:13px;color:#4DB8FF;border:1.5px solid rgba(77,184,255,.3);cursor:pointer;background:rgba(77,184,255,.06);transition:all .3s;font-family:inherit;margin-top:10px}
  .btn-g{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border-radius:14px;font-weight:700;font-size:13px;color:#E8F4FF;border:1.5px solid rgba(255,255,255,.12);cursor:pointer;background:rgba(255,255,255,.05);transition:all .3s;font-family:inherit}
  .ob{width:46px;height:54px;border-radius:12px;text-align:center;font-size:22px;font-weight:900;outline:none;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.1);color:#E8F4FF;transition:all .2s;font-family:inherit}
  .ob:focus{border-color:rgba(77,184,255,.7);transform:scale(1.05)}.ob.f{border-color:rgba(77,184,255,.5);animation:pop .2s ease}
  .err{color:#FF6B6B;font-size:12px;padding:8px 12px;background:rgba(255,107,107,.08);border-radius:9px;border:1px solid rgba(255,107,107,.2);display:block;margin-top:6px}
  .chip{display:flex;align-items:center;justify-content:space-between;padding:12px 15px;border-radius:13px;background:rgba(77,184,255,.06);border:1px solid rgba(77,184,255,.18);margin-bottom:14px;cursor:pointer}
  .spl{display:flex;align-items:center;gap:12px;margin:16px 0;color:rgba(232,244,255,.3);font-size:12px}.spl::before,.spl::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08)}
  .ld{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
  .ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;

export default function DoctorLogin() {
  const [step,setStep]=useState<"start"|"otp"|"password">("start");
  const [mobile,setMobile]=useState("");const [otp,setOtp]=useState(["","","","","",""]);const [pwd,setPwd]=useState("");
  const [loading,setLoading]=useState(false);const [err,setErr]=useState("");const [resend,setResend]=useState(0);const [saved,setSaved]=useState("");
  const refs=useRef<(HTMLInputElement|null)[]>([]);
  useEffect(()=>{try{const t=localStorage.getItem("pm_token")||"";const r=localStorage.getItem("pm_role")||"";if(t&&r)goTo(r);const sm=getMobile();if(sm)setSaved(sm);}catch{}},[]);
  useEffect(()=>{if(resend<=0)return;const t=setTimeout(()=>setResend(p=>p-1),1000);return()=>clearTimeout(t);},[resend]);
  useEffect(()=>{if(step==="otp")setTimeout(()=>refs.current[0]?.focus(),150);},[step]);
  const hasPwd=(m:string)=>!!localStorage.getItem(`pm_pwd_dr_${m}`);
  const checkPwd=(m:string,p:string)=>{try{return localStorage.getItem(`pm_pwd_dr_${m}`)===btoa(p);}catch{return false;}};
  const proceed=()=>{const n=mobile.replace(/\D/g,"").slice(-10);if(n.length<10){setErr("Valid mobile daalo");return;}setErr("");if(hasPwd(n)){setSaved(n);setStep("password");}else sendOtp(n);};
  const sendOtp=async(num:string)=>{const n=(num||mobile).replace(/\D/g,"").slice(-10);setLoading(true);setErr("");try{const r=await apiPost("/auth/send-otp",{mobile:n});if(r.dev_otp)setOtp(String(r.dev_otp).split("").slice(0,6));setSaved(n);setMobile(n);setStep("otp");setResend(30);}catch(e:any){setErr(e.message);}finally{setLoading(false);}};
  const loginPwd=async()=>{const n=(mobile||saved).replace(/\D/g,"").slice(-10);if(checkPwd(n,pwd)){const u=JSON.parse(localStorage.getItem(`pm_u_${n}`)||"{}");if(u.role){setAuth("local_"+Date.now(),u.role,u,n);goTo(u.role);return;}}setLoading(true);setErr("");try{const r=await apiPost("/auth/login",{identifier:n,password:pwd});setAuth(r.token,r.role,r.user,n);goTo(r.role);}catch(e:any){setErr(e.message);}finally{setLoading(false);}};
  const verifyOtp=async(code:string)=>{if(code.length<6)return;setLoading(true);setErr("");try{const r=await apiPost("/auth/verify-otp",{mobile:mobile||saved,otp:code});if(r.isNew){window.location.href="/doctor/register";return;}setAuth(r.token,r.role,r.user,mobile||saved);goTo(r.role);}catch(e:any){setErr(e.message);setOtp(["","","","","",""]);setTimeout(()=>refs.current[0]?.focus(),50);}finally{setLoading(false);}};
  const ho=(i:number,v:string)=>{const d=v.replace(/\D/g,"").slice(-1);const n=[...otp];n[i]=d;setOtp(n);setErr("");if(d&&i<5)refs.current[i+1]?.focus();if(d&&i===5)verifyOtp(n.join(""));};
  const hk=(i:number,e:React.KeyboardEvent)=>{if(e.key==="Backspace"&&!otp[i]&&i>0){const n=[...otp];n[i-1]="";setOtp(n);refs.current[i-1]?.focus();}if(e.key==="Enter")verifyOtp(otp.join(""));};
  const hp=(e:React.ClipboardEvent)=>{e.preventDefault();const p=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);if(p.length===6){setOtp(p.split(""));verifyOtp(p);}};

  return (
    <div style={{position:"fixed",inset:0,background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF",display:"flex",flexDirection:"column"}}>
      <style>{S}</style>
      <div style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none",color:"#E8F4FF"}}>
          <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#4DB8FF,#0B6FCC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏥</div>
          <span style={{fontWeight:900,fontSize:16}} className="sh2">PMCare Doctors</span>
        </a>
        <a href="/doctor/register" style={{color:"#4DB8FF",fontSize:13,fontWeight:600,textDecoration:"none"}}>Register →</a>
      </div>
      <div className="ns" style={{flex:1,overflowY:"auto",padding:"28px 22px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
        <div style={{maxWidth:400,margin:"0 auto",width:"100%"}}>
          {step==="start"&&(<div style={{animation:"fu .4s ease"}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{fontSize:36,marginBottom:10,animation:"fy 4s ease-in-out infinite"}}>👨‍⚕️</div>
              <h1 style={{fontSize:22,fontWeight:900,marginBottom:6}}><span className="sh2">Doctor Login</span></h1>
              <p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>PMCare Doctor Portal</p>
            </div>
            <button className="btn-g" onClick={()=>window.location.href=`${API}/auth/google/doctor`} style={{marginBottom:4}}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google se Login
            </button>
            <div className="spl">ya Mobile se</div>
            {saved&&<div className="chip" onClick={()=>{if(hasPwd(saved))setStep("password");else sendOtp(saved);}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>📱</span><div><p style={{color:"rgba(232,244,255,.4)",fontSize:10}}>Last used</p><p style={{fontWeight:700,fontSize:14}}>{saved}</p></div></div><span style={{color:"#4DB8FF",fontSize:12,fontWeight:700}}>Continue →</span></div>}
            <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.4,marginBottom:8}}>Mobile Number</label>
            <div style={{position:"relative",marginBottom:6}}><span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"rgba(232,244,255,.5)",fontSize:13,fontWeight:600}}>+91</span>
              <input className="inp" style={{paddingLeft:46}} type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile" value={mobile} onChange={e=>{setMobile(e.target.value.replace(/\D/g,""));setErr("");}} onKeyDown={e=>e.key==="Enter"&&proceed()} autoFocus={!saved}/>
            </div>
            {err&&<span className="err">{err}</span>}
            <button className="btn" style={{marginTop:14}} onClick={proceed} disabled={loading||mobile.length<10}>{loading?<span className="ld"/>:"Continue →"}</button>
            <p style={{color:"rgba(232,244,255,.25)",fontSize:11,textAlign:"center",marginTop:14}}>Patient ho? <a href="/login" style={{color:"#00FFD1",fontWeight:600}}>Patient Login</a></p>
          </div>)}

          {step==="password"&&(<div style={{animation:"fu .4s ease"}}>
            <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:36,marginBottom:10}}>🔒</div><h2 style={{fontSize:20,fontWeight:900,marginBottom:6}}>Welcome Back, Doctor!</h2><p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>+91 {mobile||saved}</p><button onClick={()=>{setStep("start");setPwd("");setErr("");}} style={{background:"none",border:"none",color:"#4DB8FF",fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:6}}>← Change</button></div>
            <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:7}}>Password</label>
            <input className="inp" type="password" placeholder="Apna password daalo" value={pwd} onChange={e=>{setPwd(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&loginPwd()} autoFocus style={{marginBottom:6}}/>
            {err&&<span className="err">{err}</span>}
            <button className="btn" style={{marginTop:14}} onClick={loginPwd} disabled={loading||!pwd.trim()}>{loading?<span className="ld"/>:"🔓 Login"}</button>
            <button className="btn-o" onClick={()=>sendOtp(mobile||saved)}>OTP se Login</button>
          </div>)}

          {step==="otp"&&(<div style={{animation:"fu .4s ease"}}>
            <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:36,marginBottom:10}}>📱</div><h2 style={{fontSize:20,fontWeight:900,marginBottom:6}}>OTP Daalo</h2><p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>Sent to +91 {mobile||saved}</p><button onClick={()=>{setStep("start");setOtp(["","","","","",""]);}} style={{background:"none",border:"none",color:"#4DB8FF",fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:6}}>← Change</button></div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}} onPaste={hp}>
              {otp.map((d,i)=>(<input key={i} ref={el=>{refs.current[i]=el;}} className={"ob"+(d?" f":"")} type="tel" inputMode="numeric" maxLength={1} value={d} onChange={e=>ho(i,e.target.value)} onKeyDown={e=>hk(i,e)} onClick={e=>(e.target as HTMLInputElement).select()} disabled={loading}/>))}
            </div>
            {loading&&<div style={{textAlign:"center",padding:"10px 0"}}><span className="ld"/></div>}
            {err&&<span className="err" style={{textAlign:"center"}}>{err}</span>}
            {!loading&&<button className="btn" onClick={()=>verifyOtp(otp.join(""))} disabled={otp.join("").length<6}>Verify ✓</button>}
            <div style={{textAlign:"center",marginTop:14}}>{resend>0?<p style={{color:"rgba(232,244,255,.3)",fontSize:12}}>Resend in <strong style={{color:"#E8F4FF"}}>{resend}s</strong></p>:<button onClick={()=>{setOtp(["","","","","",""]);sendOtp(mobile||saved);}} style={{background:"none",border:"none",color:"#4DB8FF",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🔄 Resend</button>}</div>
          </div>)}
        </div>
      </div>
    </div>
  );
}
