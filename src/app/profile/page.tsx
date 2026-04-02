"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPut, getUser, getToken } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}.inp{width:100%;padding:12px 14px;border-radius:12px;font-size:13px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}.inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(0,255,209,.4)}.btn-p{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:14px;border-radius:14px;font-weight:800;font-size:14px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit}.suc{color:#00FFD1;font-size:12px;padding:8px 12px;background:rgba(0,255,209,.07);border-radius:9px;border:1px solid rgba(0,255,209,.2);display:block;margin-top:6px}.ld{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function Profile(){
  const router=useRouter();
  const [form,setForm]=useState<any>({name:"",email:"",age:"",gender:"",bloodGroup:"",city:"",allergies:"",conditions:"",emergencyContact:"",emergencyName:""});
  const [saving,setSaving]=useState(false);const [ok,setOk]=useState("");
  useEffect(()=>{if(!getToken()){router.replace("/login");return;}const u=getUser();if(u)setForm({name:u.name||"",email:u.email||"",age:u.age||"",gender:u.gender||"",bloodGroup:u.bloodGroup||"",city:u.city||"",allergies:(u.allergies||[]).join(", "),conditions:(u.conditions||[]).join(", "),emergencyContact:u.emergencyContact||"",emergencyName:u.emergencyName||""});});
  const save=async()=>{setSaving(true);setOk("");try{const u=getUser();const data={...form,age:+form.age,allergies:form.allergies.split(",").map((x:string)=>x.trim()).filter(Boolean),conditions:form.conditions.split(",").map((x:string)=>x.trim()).filter(Boolean)};await apiPut(`/patients/${u?._id}`,data);localStorage.setItem("pm_user",JSON.stringify({...u,...data}));setOk("✅ Profile updated!");}catch{}finally{setSaving(false);}};
  const sf=(k:string,v:string)=>setForm((p:any)=>({...p,[k]:v}));
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/dashboard" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">My Profile</h2>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
      <div style={{background:"rgba(0,255,209,.04)",border:"1px solid rgba(0,255,209,.1)",borderRadius:16,padding:16,marginBottom:14}}>
        <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>👤 Personal Info</p>
        {[{k:"name",l:"Full Name",ph:"Rahul Sharma"},{k:"email",l:"Email",ph:"you@email.com",t:"email"},{k:"age",l:"Age",ph:"28",t:"number"},{k:"city",l:"City",ph:"Mumbai"}].map(f=>(
          <div key={f.k} style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{f.l}</label>
            <input className="inp" type={f.t||"text"} placeholder={f.ph} value={form[f.k]||""} onChange={e=>sf(f.k,e.target.value)}/>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:11}}>
          <div><label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Gender</label>
            <select className="inp" value={form.gender||""} onChange={e=>sf("gender",e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select>
          </div>
          <div><label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Blood Group</label>
            <select className="inp" value={form.bloodGroup||""} onChange={e=>sf("bloodGroup",e.target.value)}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}</select>
          </div>
        </div>
      </div>
      <div style={{background:"rgba(255,107,107,.04)",border:"1px solid rgba(255,107,107,.1)",borderRadius:16,padding:16,marginBottom:14}}>
        <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>🏥 Medical History</p>
        {[{k:"allergies",l:"Allergies (comma separated)",ph:"Penicillin, Sulfa drugs"},{k:"conditions",l:"Chronic Conditions (comma separated)",ph:"Diabetes, Hypertension"}].map(f=>(
          <div key={f.k} style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{f.l}</label>
            <input className="inp" placeholder={f.ph} value={form[f.k]||""} onChange={e=>sf(f.k,e.target.value)}/>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(77,184,255,.04)",border:"1px solid rgba(77,184,255,.1)",borderRadius:16,padding:16,marginBottom:14}}>
        <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>🆘 Emergency Contact</p>
        {[{k:"emergencyName",l:"Contact Name",ph:"Priya Sharma"},{k:"emergencyContact",l:"Contact Mobile",ph:"9876543210"}].map(f=>(
          <div key={f.k} style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{f.l}</label>
            <input className="inp" placeholder={f.ph} value={form[f.k]||""} onChange={e=>sf(f.k,e.target.value)}/>
          </div>
        ))}
      </div>
      {ok&&<span className="suc">{ok}</span>}
      <button className="btn-p" style={{marginTop:12}} onClick={save} disabled={saving}>{saving?<span className="ld"/>:"💾 Save Profile"}</button>
    </div>
  </div>);
}
