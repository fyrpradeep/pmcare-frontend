"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;margin-bottom:12px}.btn-p{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:13px;border-radius:13px;font-weight:700;font-size:13px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit;text-decoration:none}.sp{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function PrescriptionDetail(){
  const {id}=useParams();const router=useRouter();const [rx,setRx]=useState<any>(null);const [loading,setLoading]=useState(true);
  useEffect(()=>{apiGet(`/prescriptions/${id}`).then(d=>setRx(d)).catch(()=>router.replace("/prescriptions")).finally(()=>setLoading(false));});
  const print=()=>{const w=window.open("","_blank");if(!w)return;w.document.write(`<html><head><title>Prescription</title><style>body{font-family:Arial;padding:30px;max-width:600px;margin:0 auto}h1{color:#0B6FCC;border-bottom:2px solid #0B6FCC;padding-bottom:8px}h2{color:#333;font-size:16px;margin-top:20px}p{color:#555;line-height:1.6}.med{background:#f8f9fa;padding:10px;border-radius:6px;margin:8px 0;border-left:3px solid #0B6FCC}.valid{color:#28a745;font-weight:bold}.footer{margin-top:30px;padding-top:10px;border-top:1px solid #ddd;color:#888;font-size:12px}</style></head><body><h1>🏥 PMCare Digital Prescription</h1><p><b>Prescription ID:</b> ${rx._id?.slice(-6)?.toUpperCase()}&nbsp;&nbsp;<b>Date:</b> ${new Date(rx.createdAt).toLocaleDateString("en-IN")}</p><p><b>Patient:</b> ${rx.patientName}&nbsp;&nbsp;<b>Doctor:</b> Dr. ${rx.doctorName}</p><h2>Diagnosis</h2><p>${rx.diagnosis}</p><h2>Medicines Prescribed</h2>${(rx.medicines||[]).map((m:any)=>`<div class="med"><b>${m.name}</b><br>Dosage: ${m.dosage||""} | Duration: ${m.duration||""} | Timing: ${m.timing||""}</div>`).join("")}<h2>Doctor's Advice</h2><p>${rx.advice||"Follow medication as prescribed"}</p><p class="valid">✓ This is a legally valid digital prescription</p><div class="footer"><p>PMCare · pmcare.org · This prescription is valid for 30 days from issue date</p></div></body></html>`);w.document.close();w.print();};
  if(loading)return(<div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#020D1A"}}><span className="sp"/></div>);
  if(!rx)return null;
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/prescriptions" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">Prescription</h2>
      <button onClick={print} style={{padding:"7px 14px",borderRadius:100,background:"rgba(0,255,209,.08)",border:"1px solid rgba(0,255,209,.2)",color:"#00FFD1",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🖨️ Print</button>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
      <div style={{background:"linear-gradient(135deg,rgba(0,201,167,.08),rgba(11,111,204,.1))",border:"1px solid rgba(0,255,209,.2)",borderRadius:16,padding:16,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><p style={{color:"rgba(232,244,255,.4)",fontSize:10,marginBottom:3}}>Prescription ID</p><p style={{fontWeight:800,fontSize:18,color:"#00FFD1"}}>Rx #{rx._id?.slice(-6)?.toUpperCase()}</p><p style={{color:"rgba(232,244,255,.4)",fontSize:11,marginTop:4}}>🗓 {new Date(rx.createdAt).toLocaleDateString("en-IN")}</p></div>
          <span style={{padding:"5px 12px",borderRadius:100,background:"rgba(0,255,209,.1)",color:"#00FFD1",fontSize:11,fontWeight:700}}>✓ Valid</span>
        </div>
      </div>
      <div className="card">
        <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Patient & Doctor</p>
        {[{l:"Patient",v:rx.patientName},{l:"Doctor",v:`Dr. ${rx.doctorName}`}].map(r=>(<div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><p style={{color:"rgba(232,244,255,.45)",fontSize:12}}>{r.l}</p><p style={{color:"#E8F4FF",fontWeight:600,fontSize:12}}>{r.v}</p></div>))}
      </div>
      <div className="card">
        <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Diagnosis</p>
        <p style={{color:"#E8F4FF",fontSize:14,fontWeight:600,lineHeight:1.6}}>{rx.diagnosis}</p>
      </div>
      <div className="card">
        <p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Medicines ({(rx.medicines||[]).length})</p>
        {(rx.medicines||[]).map((m:any,i:number)=>(<div key={i} style={{padding:"10px 12px",background:"rgba(0,255,209,.04)",border:"1px solid rgba(0,255,209,.12)",borderRadius:11,marginBottom:8}}>
          <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:4}}>{m.name}</p>
          <div style={{display:"flex",gap:12}}>{[{l:"Dosage",v:m.dosage},{l:"Duration",v:m.duration},{l:"Timing",v:m.timing}].filter(x=>x.v).map(x=>(<p key={x.l} style={{color:"rgba(232,244,255,.45)",fontSize:11}}><span style={{color:"rgba(232,244,255,.3)"}}>{x.l}: </span>{x.v}</p>))}</div>
        </div>))}
      </div>
      {rx.advice&&<div className="card"><p style={{fontSize:10,fontWeight:700,color:"rgba(232,244,255,.35)",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Doctor's Advice</p><p style={{color:"rgba(232,244,255,.65)",fontSize:13,lineHeight:1.7}}>{rx.advice}</p></div>}
      <div style={{display:"flex",gap:10}}>
        <button onClick={print} className="btn-p">🖨️ Download PDF</button>
        <a href="/medicines" className="btn-p" style={{background:"linear-gradient(135deg,#A78BFA,#6D28D9)"}}>💊 Order Medicines</a>
      </div>
    </div>
  </div>);
}
