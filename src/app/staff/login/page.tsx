"use client";
import { useState } from "react";
import { apiPost, setAuth } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes spin{to{transform:rotate(360deg)}}
.inp{width:100%;padding:13px 16px;border-radius:13px;font-size:14px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
.inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(167,139,250,.5)}
.btn{display:flex;align-items:center;justify-content:center;width:100%;padding:15px;border-radius:14px;font-weight:800;font-size:14px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#A78BFA,#6D28D9);font-family:inherit}
.ld{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}`;
export default function StaffLogin() {
  const [email,setEmail]=useState("");const [pwd,setPwd]=useState("");const [loading,setLoading]=useState(false);const [err,setErr]=useState("");
  const login=async()=>{setLoading(true);setErr("");try{const r=await apiPost("/staff/login",{email,password:pwd});setAuth(r.token,"staff",r.user);window.location.href="/staff/dashboard";}catch(e:any){setErr(e.message);}finally{setLoading(false);}};
  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF",padding:"28px 24px"}}>
      <style>{S}</style>
      <div style={{width:"100%",maxWidth:340}}>
        <div style={{textAlign:"center",marginBottom:28}}><div style={{fontSize:40,marginBottom:12}}>👨‍💼</div><h1 style={{fontSize:22,fontWeight:900,marginBottom:4,color:"#A78BFA"}}>Staff Login</h1><p style={{color:"rgba(232,244,255,.4)",fontSize:13}}>PMCare Staff Portal</p></div>
        <div style={{marginBottom:12}}><label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:7}}>Email</label><input className="inp" type="email" placeholder="staff@pmcare.org" value={email} onChange={e=>setEmail(e.target.value)} autoFocus/></div>
        <div style={{marginBottom:8}}><label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1.2,marginBottom:7}}>Password</label><input className="inp" type="password" placeholder="Password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/></div>
        {err&&<p style={{color:"#FF6B6B",fontSize:12,textAlign:"center",marginBottom:8}}>{err}</p>}
        <button className="btn" style={{marginTop:16}} onClick={login} disabled={loading||!email||!pwd}>{loading?<span className="ld"/>:"Login →"}</button>
      </div>
    </div>
  );
}
