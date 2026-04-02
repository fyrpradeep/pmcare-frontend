"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPut, getUser, getRole } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh2{background:linear-gradient(90deg,#4DB8FF,#00FFD1,#4DB8FF);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 3s linear infinite}.inp{width:100%;padding:12px 14px;border-radius:12px;font-size:13px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}.inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(77,184,255,.5)}.btn-p{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:14px;border-radius:14px;font-weight:800;font-size:14px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#4DB8FF,#0B6FCC);font-family:inherit}.suc{color:#00FFD1;font-size:12px;padding:8px 12px;background:rgba(0,255,209,.07);border-radius:9px;border:1px solid rgba(0,255,209,.2);display:block;margin-top:6px}.sp{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#4DB8FF;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}.ld{width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
const SPECS=["General Physician","Cardiologist","Dermatologist","Gynecologist","Orthopedic","Neurologist","Pediatrician","Psychiatrist","Ophthalmologist","ENT Specialist","Dentist","Urologist","Pulmonologist","Gastroenterologist","Endocrinologist","Rheumatologist"];
export default function DoctorProfile(){
  const router=useRouter();
  const [form,setForm]=useState<any>({name:"",specialty:"",degree:"",regNo:"",experience:"",fee:"",bio:"",languages:"",bankAccount:"",ifsc:"",accountName:"",upi:""});
  const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [ok,setOk]=useState("");
  useEffect(()=>{if(getRole()!=="doctor"){router.replace("/doctor/login");return;}const u=getUser();if(u)setForm({name:u.name||"",specialty:u.specialty||"General Physician",degree:u.degree||"",regNo:u.regNo||"",experience:u.experience||"",fee:u.fee||"499",bio:u.bio||"",languages:(u.languages||[]).join(", "),bankAccount:u.bankAccount||"",ifsc:u.ifsc||"",accountName:u.accountName||"",upi:u.upi||""});setLoading(false);});
  const save=async()=>{setSaving(true);setOk("");try{const data={...form,experience:+form.experience,fee:+form.fee,languages:form.languages.split(",").map((x:string)=>x.trim()).filter(Boolean)};await apiPut("/doctors/me",data);const u=getUser();localStorage.setItem("pm_user",JSON.stringify({...u,...data}));setOk("✅ Profile saved successfully!");}catch{}finally{setSaving(false);}};
  const sf=(k:string,v:string)=>setForm((p:any)=>({...p,[k]:v}));
  if(loading)return(<div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#020D1A"}}><span className="sp"/></div>);
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/doctor/dashboard" style={{color:"#4DB8FF",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh2">My Doctor Profile</h2>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
      <div style={{background:"rgba(77,184,255,.06)",border:"1px solid rgba(77,184,255,.15)",borderRadius:16,padding:16,marginBottom:16}}>
        <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>👨‍⚕️ Professional Info</p>
        {[{k:"name",l:"Full Name",ph:"Dr. Rahul Sharma"},{k:"degree",l:"Degree",ph:"MBBS, MD"},{k:"regNo",l:"MCI Registration No.",ph:"MH-12345"},{k:"experience",l:"Experience (Years)",ph:"8",t:"number"},{k:"fee",l:"Consultation Fee (₹)",ph:"499",t:"number"},{k:"bio",l:"About / Bio",ph:"Describe yourself...",ta:true},{k:"languages",l:"Languages (comma separated)",ph:"Hindi, English, Marathi"}].map(f=>(
          <div key={f.k} style={{marginBottom:11}}>
            <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{f.l}</label>
            {f.ta?<textarea rows={3} className="inp" placeholder={f.ph} value={form[f.k]||""} onChange={e=>sf(f.k,e.target.value)} style={{resize:"none",lineHeight:1.6}}/>:<input className="inp" type={f.t||"text"} placeholder={f.ph} value={form[f.k]||""} onChange={e=>sf(f.k,e.target.value)}/>}
          </div>
        ))}
        <div style={{marginBottom:11}}>
          <label style={{display:"block",fontSize:9,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Specialty</label>
          <select className="inp" value={form.specialty||""} onChange={e=>sf("specialty",e.target.value)}>{SPECS.map(s=><option key={s}>{s}</option>)}</select>
        </div>
      </div>
      <div style={{background:"rgba(0,255,209,.04)",border:"1px solid rgba(0,255,209,.1)",borderRadius:16,padding:16,marginBottom:16}}>
        <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>💳 Bank Details (for payouts)</p>
        {[{k:"bankAccount",l:"Account Number",ph:"123456789012"},{k:"ifsc",l:"IFSC Code",ph:"SBIN0001234"},{k:"accountName",l:"Account Holder Name",ph:"Rahul Sharma"},{k:"upi",l:"UPI ID (optional)",ph:"doctor@upi"}].map(f=>(
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
