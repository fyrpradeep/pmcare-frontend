"use client";
import { useState, useRef, useEffect } from "react";
import { apiPost, setAuth, goTo } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
  @keyframes spin{to{transform:rotate(360deg)}}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}
  @keyframes fy{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes pop{0%{transform:scale(.85)}60%{transform:scale(1.1)}to{transform:scale(1)}}
  @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}
  .inp{width:100%;padding:13px 16px;border-radius:13px;font-size:14px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
  .inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(0,255,209,.5);background:rgba(0,255,209,.04)}
  .btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border-radius:14px;font-weight:800;font-size:14px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);box-shadow:0 6px 24px rgba(0,201,167,.3);transition:all .3s;font-family:inherit}
  .btn:disabled{opacity:.5;cursor:not-allowed}.btn:hover:not(:disabled){transform:translateY(-2px)}
  .btn-g{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border-radius:14px;font-weight:700;font-size:13px;color:#E8F4FF;border:1.5px solid rgba(255,255,255,.12);cursor:pointer;background:rgba(255,255,255,.05);transition:all .3s;font-family:inherit}
  .btn-g:hover{background:rgba(255,255,255,.09)}
  .ob{width:46px;height:54px;border-radius:12px;text-align:center;font-size:22px;font-weight:900;outline:none;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.1);color:#E8F4FF;transition:all .2s;font-family:inherit}
  .ob:focus{border-color:rgba(0,255,209,.7);background:rgba(0,255,209,.07);transform:scale(1.05)}.ob.f{border-color:rgba(0,255,209,.5)}
  .err{color:#FF6B6B;font-size:12px;padding:8px 12px;background:rgba(255,107,107,.08);border-radius:9px;border:1px solid rgba(255,107,107,.2);display:block;margin-top:6px}
  .spl{display:flex;align-items:center;gap:12px;margin:16px 0;color:rgba(232,244,255,.3);font-size:12px}.spl::before,.spl::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08)}
  .ld{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
  .ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}
`;

type Step = "start" | "otp" | "name" | "done";

export default function Register() {
  const [step, setStep]     = useState<Step>("start");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp]       = useState(["","","","","",""]);
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const [resend, setResend] = useState(0);
  const refs = useRef<(HTMLInputElement|null)[]>([]);

  useEffect(() => {
    // Already logged in?
    try {
      const t = localStorage.getItem("pm_token")||"";
      const r = localStorage.getItem("pm_role")||"";
      if (t && r) { goTo(r); }
    } catch {}
  }, []);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend(p => p-1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  useEffect(() => {
    if (step === "otp") setTimeout(() => refs.current[0]?.focus(), 150);
  }, [step]);

  const sendOtp = async () => {
    const n = mobile.replace(/\D/g,"").slice(-10);
    if (n.length < 10) { setErr("Valid 10-digit mobile number daalo"); return; }
    setLoading(true); setErr("");
    try {
      const r = await apiPost("/auth/send-otp", { mobile: n });
      if (r.dev_otp) setOtp(String(r.dev_otp).split("").slice(0,6));
      setStep("otp"); setResend(30);
    } catch(e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (code: string) => {
    if (code.length < 6) return;
    setLoading(true); setErr("");
    try {
      const r = await apiPost("/auth/verify-otp", { mobile, otp: code });
      if (!r.isNew) {
        // Already registered → login
        setAuth(r.token, r.role, r.user, mobile);
        goTo(r.role);
      } else {
        // New user → ask name
        setStep("name");
      }
    } catch(e: any) {
      setErr(e.message);
      setOtp(["","","","","",""]);
      setTimeout(() => refs.current[0]?.focus(), 50);
    }
    finally { setLoading(false); }
  };

  const register = async () => {
    if (!name.trim()) { setErr("Apna naam daalo"); return; }
    setLoading(true); setErr("");
    try {
      const r = await apiPost("/auth/patient/register", { mobile, name, email });
      setAuth(r.token, "patient", r.user, mobile);
      setStep("done");
      setTimeout(() => goTo("patient"), 1500);
    } catch(e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const googleLogin = () => {
    window.location.href = `${API}/auth/google/patient`;
  };

  const ho = (i: number, v: string) => {
    const d = v.replace(/\D/g,"").slice(-1);
    const n = [...otp]; n[i]=d; setOtp(n); setErr("");
    if (d && i < 5) refs.current[i+1]?.focus();
    if (d && i === 5) verifyOtp(n.join(""));
  };
  const hk = (i: number, e: React.KeyboardEvent) => {
    if (e.key==="Backspace"&&!otp[i]&&i>0) { const n=[...otp];n[i-1]="";setOtp(n);refs.current[i-1]?.focus(); }
    if (e.key==="Enter") verifyOtp(otp.join(""));
  };
  const hp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (p.length===6) { setOtp(p.split("")); verifyOtp(p); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF",display:"flex",flexDirection:"column"}}>
      <style>{S}</style>

      {/* Header */}
      <div style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none",color:"#E8F4FF"}}>
          <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏥</div>
          <span style={{fontWeight:900,fontSize:16}} className="sh">PMCare</span>
        </a>
        <a href="/login" style={{color:"#00FFD1",fontSize:13,fontWeight:600,textDecoration:"none"}}>Already have account? Login →</a>
      </div>

      <div className="ns" style={{flex:1,overflowY:"auto",padding:"28px 22px",display:"flex",flexDirection:"column",justifyContent:"center"}}>

        {/* STEP: START */}
        {step === "start" && (
          <div style={{animation:"fu .4s ease",maxWidth:400,margin:"0 auto",width:"100%"}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div style={{width:64,height:64,borderRadius:18,background:"linear-gradient(135deg,rgba(0,201,167,.2),rgba(11,111,204,.2))",border:"1.5px solid rgba(0,255,209,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px",animation:"fy 4s ease-in-out infinite"}}>🏥</div>
              <h1 style={{fontSize:24,fontWeight:900,marginBottom:6}}><span className="sh">Patient Register</span></h1>
              <p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>PMCare pe apna account banao</p>
            </div>

            {/* Google OAuth */}
            <button className="btn-g" onClick={googleLogin} style={{marginBottom:4}}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google se Register Karo
            </button>

            <div className="spl">ya Mobile se</div>

            {/* Mobile OTP */}
            <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.4,marginBottom:8}}>Mobile Number</label>
            <div style={{position:"relative",marginBottom:6}}>
              <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"rgba(232,244,255,.5)",fontSize:13,fontWeight:600}}>+91</span>
              <input className="inp" style={{paddingLeft:46}} type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number"
                value={mobile} onChange={e=>{setMobile(e.target.value.replace(/\D/g,""));setErr("");}}
                onKeyDown={e=>e.key==="Enter"&&sendOtp()} autoFocus/>
            </div>
            {err && <span className="err">{err}</span>}
            <button className="btn" style={{marginTop:14}} onClick={sendOtp} disabled={loading||mobile.length<10}>
              {loading ? <span className="ld"/> : "OTP Send Karo →"}
            </button>
            <p style={{color:"rgba(232,244,255,.2)",fontSize:11,textAlign:"center",marginTop:14}}>🔒 Secure · No spam · Free</p>
            <p style={{color:"rgba(232,244,255,.25)",fontSize:11,textAlign:"center",marginTop:8}}>
              Doctor ho? <a href="/doctor/register" style={{color:"#00FFD1",fontWeight:600}}>Doctor Register here</a>
            </p>
          </div>
        )}

        {/* STEP: OTP */}
        {step === "otp" && (
          <div style={{animation:"fu .4s ease",maxWidth:400,margin:"0 auto",width:"100%"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:36,marginBottom:10}}>🔐</div>
              <h2 style={{fontSize:20,fontWeight:900,marginBottom:6}}>OTP Enter Karo</h2>
              <p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>Sent to <strong style={{color:"#E8F4FF"}}>+91 {mobile}</strong></p>
              <button onClick={()=>{setStep("start");setOtp(["","","","","",""]);setErr("");}} style={{background:"none",border:"none",color:"#4DB8FF",fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:6}}>← Change number</button>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}} onPaste={hp}>
              {otp.map((d,i) => (
                <input key={i} ref={el=>{refs.current[i]=el;}} className={"ob"+(d?" f":"")} type="tel" inputMode="numeric" maxLength={1} value={d}
                  onChange={e=>ho(i,e.target.value)} onKeyDown={e=>hk(i,e)} onClick={e=>(e.target as HTMLInputElement).select()} disabled={loading}/>
              ))}
            </div>
            {loading && <div style={{textAlign:"center",padding:"10px 0"}}><span className="ld"/></div>}
            {err && <span className="err" style={{textAlign:"center"}}>{err}</span>}
            {!loading && <button className="btn" onClick={()=>verifyOtp(otp.join(""))} disabled={otp.join("").length<6}>Verify ✓</button>}
            <div style={{textAlign:"center",marginTop:14}}>
              {resend>0 ? <p style={{color:"rgba(232,244,255,.3)",fontSize:12}}>Resend in <strong style={{color:"#E8F4FF"}}>{resend}s</strong></p>
              : <button onClick={sendOtp} style={{background:"none",border:"none",color:"#00FFD1",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🔄 Resend OTP</button>}
            </div>
          </div>
        )}

        {/* STEP: NAME */}
        {step === "name" && (
          <div style={{animation:"fu .4s ease",maxWidth:400,margin:"0 auto",width:"100%"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:36,marginBottom:10}}>👋</div>
              <h2 style={{fontSize:20,fontWeight:900,marginBottom:6}}>Welcome to PMCare!</h2>
              <p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>Apni basic details bharo</p>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:7}}>Full Name *</label>
              <input className="inp" placeholder="e.g. Rahul Sharma" value={name} onChange={e=>{setName(e.target.value);setErr("");}} autoFocus/>
            </div>
            <div style={{marginBottom:8}}>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:7}}>Email (Optional)</label>
              <input className="inp" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&register()}/>
            </div>
            {err && <span className="err">{err}</span>}
            <button className="btn" style={{marginTop:14}} onClick={register} disabled={loading||!name.trim()}>
              {loading ? <span className="ld"/> : "Register Karo 🚀"}
            </button>
          </div>
        )}

        {/* STEP: DONE */}
        {step === "done" && (
          <div style={{textAlign:"center",animation:"fu .4s ease",maxWidth:400,margin:"0 auto"}}>
            <div style={{fontSize:56,marginBottom:16}}>🎉</div>
            <h2 style={{fontSize:22,fontWeight:900,marginBottom:8}}>Registration Successful!</h2>
            <p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>Aapka account ban gaya. Dashboard pe jaa rahe hain...</p>
            <div style={{marginTop:16,display:"flex",justifyContent:"center"}}><span className="ld"/></div>
          </div>
        )}
      </div>
    </div>
  );
}
