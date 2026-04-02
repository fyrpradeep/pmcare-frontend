"use client";
import { useState, useRef, useEffect } from "react";
import { apiPost, setAuth, goTo } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
  @keyframes spin{to{transform:rotate(360deg)}}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}
  @keyframes fy{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{0%{transform:scale(.85)}60%{transform:scale(1.1)}to{transform:scale(1)}}
  .sh2{background:linear-gradient(90deg,#4DB8FF,#00FFD1,#4DB8FF);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 3s linear infinite}
  .inp{width:100%;padding:13px 16px;border-radius:13px;font-size:14px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
  .inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(77,184,255,.5);background:rgba(77,184,255,.04)}
  select.inp option{background:#0D1B35;color:#E8F4FF}
  .btn{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border-radius:14px;font-weight:800;font-size:14px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#4DB8FF,#0B6FCC);transition:all .3s;font-family:inherit}
  .btn:disabled{opacity:.5;cursor:not-allowed}
  .btn-g{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;border-radius:14px;font-weight:700;font-size:13px;color:#E8F4FF;border:1.5px solid rgba(255,255,255,.12);cursor:pointer;background:rgba(255,255,255,.05);transition:all .3s;font-family:inherit}
  .ob{width:46px;height:54px;border-radius:12px;text-align:center;font-size:22px;font-weight:900;outline:none;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.1);color:#E8F4FF;transition:all .2s;font-family:inherit}
  .ob:focus{border-color:rgba(77,184,255,.7);transform:scale(1.05)}.ob.f{border-color:rgba(77,184,255,.5);animation:pop .2s ease}
  .err{color:#FF6B6B;font-size:12px;padding:8px 12px;background:rgba(255,107,107,.08);border-radius:9px;border:1px solid rgba(255,107,107,.2);display:block;margin-top:6px}
  .spl{display:flex;align-items:center;gap:12px;margin:16px 0;color:rgba(232,244,255,.3);font-size:12px}.spl::before,.spl::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08)}
  .ld{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
  .pcard{background:rgba(77,184,255,.07);border:1px solid rgba(77,184,255,.2);border-radius:16px;padding:20px;text-align:center;margin-bottom:16px}
  .ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}
  .step-bar{display:flex;gap:6px;margin-bottom:24px}.step-dot{flex:1;height:3px;border-radius:100px;transition:all .3s}
`;

const SPECIALTIES = ["General Physician","Cardiologist","Dermatologist","Gynecologist","Orthopedic","Neurologist","Pediatrician","Psychiatrist","Ophthalmologist","ENT Specialist","Dentist","Urologist","Pulmonologist","Gastroenterologist","Endocrinologist","Rheumatologist"];

type Step = "start"|"otp"|"details"|"pending";

export default function DoctorRegister() {
  const [step, setStep]     = useState<Step>("start");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp]       = useState(["","","","","",""]);
  const [form, setForm]     = useState({ name:"", email:"", specialty:"General Physician", degree:"", regNo:"", experience:"", fee:"499" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const [resend, setResend] = useState(0);
  const refs = useRef<(HTMLInputElement|null)[]>([]);

  useEffect(() => {
    try { const t=localStorage.getItem("pm_token")||""; const r=localStorage.getItem("pm_role")||""; if(t&&r)goTo(r); } catch {}
  }, []);
  useEffect(() => { if(resend<=0)return; const t=setTimeout(()=>setResend(p=>p-1),1000); return ()=>clearTimeout(t); }, [resend]);
  useEffect(() => { if(step==="otp")setTimeout(()=>refs.current[0]?.focus(),150); }, [step]);

  const sendOtp = async () => {
    const n = mobile.replace(/\D/g,"").slice(-10);
    if (n.length<10) { setErr("Valid 10-digit mobile daalo"); return; }
    setLoading(true); setErr("");
    try {
      const r = await apiPost("/auth/send-otp", { mobile:n });
      if (r.dev_otp) setOtp(String(r.dev_otp).split("").slice(0,6));
      setStep("otp"); setResend(30);
    } catch(e:any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const verifyOtp = async (code: string) => {
    if (code.length<6) return;
    setLoading(true); setErr("");
    try {
      const r = await apiPost("/auth/verify-otp", { mobile, otp:code });
      if (!r.isNew) {
        setAuth(r.token, r.role, r.user, mobile);
        goTo(r.role); return;
      }
      setStep("details");
    } catch(e:any) {
      setErr(e.message);
      setOtp(["","","","","",""]);
      setTimeout(()=>refs.current[0]?.focus(),50);
    }
    finally { setLoading(false); }
  };

  const register = async () => {
    if (!form.name.trim()) { setErr("Full name daalo"); return; }
    if (!form.specialty)   { setErr("Specialty select karo"); return; }
    if (!form.degree.trim()){ setErr("Degree daalo (e.g. MBBS)"); return; }
    if (!form.regNo.trim()) { setErr("MCI registration number daalo"); return; }
    setLoading(true); setErr("");
    try {
      const r = await apiPost("/auth/doctor/register", { mobile, ...form, experience:+form.experience, fee:+form.fee });
      setAuth(r.token, "doctor", r.user, mobile);
      setStep("pending");
    } catch(e:any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const ho=(i:number,v:string)=>{const d=v.replace(/\D/g,"").slice(-1);const n=[...otp];n[i]=d;setOtp(n);setErr("");if(d&&i<5)refs.current[i+1]?.focus();if(d&&i===5)verifyOtp(n.join(""));};
  const hk=(i:number,e:React.KeyboardEvent)=>{if(e.key==="Backspace"&&!otp[i]&&i>0){const n=[...otp];n[i-1]="";setOtp(n);refs.current[i-1]?.focus();}if(e.key==="Enter")verifyOtp(otp.join(""));};
  const hp=(e:React.ClipboardEvent)=>{e.preventDefault();const p=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);if(p.length===6){setOtp(p.split(""));verifyOtp(p);}};
  const setF = (k:string,v:string) => { setForm(p=>({...p,[k]:v})); setErr(""); };

  const stepNum = step==="start"?1:step==="otp"?2:step==="details"?3:4;

  return (
    <div style={{position:"fixed",inset:0,background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF",display:"flex",flexDirection:"column"}}>
      <style>{S}</style>
      <div style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
        <a href="/" style={{display:"flex",alignItems:"center",gap:8,textDecoration:"none",color:"#E8F4FF"}}>
          <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#4DB8FF,#0B6FCC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏥</div>
          <span style={{fontWeight:900,fontSize:16}} className="sh2">PMCare Doctors</span>
        </a>
        <a href="/doctor/login" style={{color:"#4DB8FF",fontSize:13,fontWeight:600,textDecoration:"none"}}>Already registered? Login</a>
      </div>

      <div className="ns" style={{flex:1,overflowY:"auto",padding:"20px 22px"}}>
        {step!=="pending" && (
          <div style={{display:"flex",gap:6,marginBottom:24,maxWidth:400,margin:"0 auto 20px"}}>
            {[1,2,3].map(n=>(
              <div key={n} style={{flex:1,height:3,borderRadius:100,background:stepNum>=n?"linear-gradient(90deg,#4DB8FF,#0B6FCC)":"rgba(255,255,255,.1)",transition:"all .3s"}}/>
            ))}
          </div>
        )}

        <div style={{maxWidth:400,margin:"0 auto",width:"100%"}}>

          {/* START */}
          {step==="start"&&(
            <div style={{animation:"fu .4s ease"}}>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{fontSize:36,marginBottom:10,animation:"fy 4s ease-in-out infinite"}}>👨‍⚕️</div>
                <h1 style={{fontSize:22,fontWeight:900,marginBottom:6}}><span className="sh2">Doctor ke roop mein Join Karo</span></h1>
                <p style={{color:"rgba(232,244,255,.45)",fontSize:13,lineHeight:1.7}}>Ghar se patients consult karo aur <strong style={{color:"#4DB8FF"}}>₹30K–₹1.5L/month</strong> kamao</p>
              </div>
              <button className="btn-g" onClick={()=>window.location.href=`${API}/auth/google/doctor`} style={{marginBottom:4}}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google se Register Karo
              </button>
              <div className="spl">ya Mobile se</div>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.4,marginBottom:8}}>Mobile Number</label>
              <div style={{position:"relative",marginBottom:6}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"rgba(232,244,255,.5)",fontSize:13,fontWeight:600}}>+91</span>
                <input className="inp" style={{paddingLeft:46}} type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number"
                  value={mobile} onChange={e=>{setMobile(e.target.value.replace(/\D/g,""));setErr("");}} onKeyDown={e=>e.key==="Enter"&&sendOtp()} autoFocus/>
              </div>
              {err&&<span className="err">{err}</span>}
              <button className="btn" style={{marginTop:14}} onClick={sendOtp} disabled={loading||mobile.length<10}>
                {loading?<span className="ld"/>:"OTP Send Karo →"}
              </button>
              <div style={{marginTop:20,padding:"14px",borderRadius:13,background:"rgba(77,184,255,.06)",border:"1px solid rgba(77,184,255,.15)"}}>
                {["✅ Pehle approval maa baad consult","💰 Weekly payouts","🕐 Flexible hours","🛡️ MCI compliant"].map(b=>(
                  <p key={b} style={{color:"rgba(232,244,255,.6)",fontSize:12,marginBottom:4}}>{b}</p>
                ))}
              </div>
            </div>
          )}

          {/* OTP */}
          {step==="otp"&&(
            <div style={{animation:"fu .4s ease"}}>
              <div style={{textAlign:"center",marginBottom:24}}>
                <div style={{fontSize:36,marginBottom:10}}>🔐</div>
                <h2 style={{fontSize:20,fontWeight:900,marginBottom:6}}>OTP Verify Karo</h2>
                <p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>Sent to +91 {mobile}</p>
                <button onClick={()=>{setStep("start");setOtp(["","","","","",""]);}} style={{background:"none",border:"none",color:"#4DB8FF",fontSize:12,cursor:"pointer",fontFamily:"inherit",marginTop:6}}>← Change</button>
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}} onPaste={hp}>
                {otp.map((d,i)=>(<input key={i} ref={el=>{refs.current[i]=el;}} className={"ob"+(d?" f":"")} type="tel" inputMode="numeric" maxLength={1} value={d}
                  onChange={e=>ho(i,e.target.value)} onKeyDown={e=>hk(i,e)} onClick={e=>(e.target as HTMLInputElement).select()} disabled={loading}/>))}
              </div>
              {loading&&<div style={{textAlign:"center",padding:"10px 0"}}><span className="ld"/></div>}
              {err&&<span className="err" style={{textAlign:"center"}}>{err}</span>}
              {!loading&&<button className="btn" onClick={()=>verifyOtp(otp.join(""))} disabled={otp.join("").length<6}>Verify ✓</button>}
              <div style={{textAlign:"center",marginTop:14}}>
                {resend>0?<p style={{color:"rgba(232,244,255,.3)",fontSize:12}}>Resend in <strong style={{color:"#E8F4FF"}}>{resend}s</strong></p>
                :<button onClick={sendOtp} style={{background:"none",border:"none",color:"#4DB8FF",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🔄 Resend</button>}
              </div>
            </div>
          )}

          {/* DETAILS */}
          {step==="details"&&(
            <div style={{animation:"fu .4s ease"}}>
              <div style={{textAlign:"center",marginBottom:22}}>
                <h2 style={{fontSize:20,fontWeight:900,marginBottom:4}}>Professional Details</h2>
                <p style={{color:"rgba(232,244,255,.45)",fontSize:13}}>Sahi details bharo — admin verify karega</p>
              </div>
              {[{k:"name",l:"Full Name *",ph:"Dr. Rahul Sharma",t:"text"},{k:"email",l:"Email",ph:"doctor@email.com",t:"email"},{k:"degree",l:"Degree *",ph:"e.g. MBBS, MD, BDS",t:"text"},{k:"regNo",l:"MCI Registration No. *",ph:"e.g. MH-12345",t:"text"},{k:"experience",l:"Experience (Years)",ph:"e.g. 8",t:"number"},{k:"fee",l:"Consultation Fee (₹) *",ph:"e.g. 499",t:"number"}].map(f=>(
                <div key={f.k} style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>{f.l}</label>
                  <input className="inp" type={f.t} placeholder={f.ph} value={(form as any)[f.k]} onChange={e=>setF(f.k,e.target.value)}/>
                </div>
              ))}
              <div style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>Specialty *</label>
                <select className="inp" value={form.specialty} onChange={e=>setF("specialty",e.target.value)}>
                  {SPECIALTIES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              {err&&<span className="err">{err}</span>}
              <button className="btn" onClick={register} disabled={loading}>
                {loading?<span className="ld"/>:"Submit for Approval →"}
              </button>
              <p style={{color:"rgba(232,244,255,.3)",fontSize:11,textAlign:"center",marginTop:10}}>Approval usually within 24 hours</p>
            </div>
          )}

          {/* PENDING */}
          {step==="pending"&&(
            <div style={{animation:"fu .4s ease",textAlign:"center",paddingTop:20}}>
              <div style={{fontSize:52,marginBottom:16}}>⏳</div>
              <h2 style={{fontSize:22,fontWeight:900,marginBottom:10}}>Registration Submitted!</h2>
              <div className="pcard">
                <p style={{color:"#4DB8FF",fontWeight:700,fontSize:14,marginBottom:8}}>Admin Approval Pending</p>
                <p style={{color:"rgba(232,244,255,.55)",fontSize:13,lineHeight:1.8}}>
                  Aapka doctor account review mein hai.<br/>
                  Approval ke baad aap patients consult kar sakte hain.<br/>
                  <strong style={{color:"#E8F4FF"}}>Usually within 24 hours.</strong>
                </p>
              </div>
              {[{l:"Mobile",v:`+91 ${mobile}`},{l:"Name",v:form.name},{l:"Specialty",v:form.specialty},{l:"Status",v:"⏳ Pending"}].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"9px 14px",borderRadius:11,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:8}}>
                  <span style={{color:"rgba(232,244,255,.45)",fontSize:12}}>{r.l}</span>
                  <span style={{color:"#E8F4FF",fontWeight:600,fontSize:12}}>{r.v}</span>
                </div>
              ))}
              <button className="btn" style={{marginTop:16}} onClick={()=>window.location.href="/"}>🏠 Home pe Jao</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
