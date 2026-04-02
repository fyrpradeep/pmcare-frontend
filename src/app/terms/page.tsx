"use client";
const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;
export default function Page(){
  const pages:Record<string,any>={
    about:{title:"About PMCare",icon:"🏥",content:[{h:"Our Mission",t:"PMCare ka mission hai India ke har ghar mein quality healthcare pahunchana. Hum believe karte hain ki acchi health service sirf cities mein nahi, balki har jagah available honi chahiye.","},{h:"What We Do",t:"PMCare ek complete telemedicine platform hai jahan patients ghar baithe verified doctors se live video call pe consult kar sakte hain, digital prescription pa sakte hain aur medicines order kar sakte hain."},{h:"Our Doctors",t:"Hamare platform pe sirf MCI-registered aur personally verified doctors hain. Koi bhi unverified doctor patient se consult nahi kar sakta."},{h:"Security & Privacy",t:"Aapka health data 100% safe hai. Saari calls end-to-end encrypted hain. Hum kabhi bhi kisi third party ke saath data share nahi karte."},{h:"Contact Us",t:"Email: support@pmcare.org | Phone: +91 99999 99999 | Website: pmcare.org"}]},
    privacy:{title:"Privacy Policy",icon:"🔒",content:[{h:"Data We Collect",t:"Hum collect karte hain: naam, mobile number, email, medical history (jo aap share karte hain), consultation records aur payment information."},{h:"How We Use It",t:"Aapka data sirf consultation provide karne ke liye use hota hai. Hum kabhi bhi aapka data sell, share ya misuse nahi karte."},{h:"Data Security",t:"Sab data encrypted hai. Hamare servers industry-standard security protocols follow karte hain including SSL/TLS encryption."},{h:"Your Rights",t:"Aap kabhi bhi apna data delete karne ki request kar sakte hain. Contact karo support@pmcare.org"},{h:"Cookies",t:"Hum sirf essential cookies use karte hain jo login aur session ke liye zaroori hain. Koi tracking cookies nahi."}]},
    terms:{title:"Terms of Service",icon:"📋",content:[{h:"Acceptance",t:"PMCare use karke aap hamare Terms of Service accept karte hain. Agar aap agree nahi karte toh platform use mat karo."},{h:"Medical Disclaimer",t:"PMCare ek telemedicine platform hai. Yeh emergency medical care replace nahi karta. Emergency mein 108 ya nearest hospital se contact karo."},{h:"Doctor Verification",t:"Hamare saare doctors MCI registered hain. Lekin PMCare specifically kisi treatment outcome ki guarantee nahi deta."},{h:"Payment Policy",t:"Razorpay se secure payments. Consultation ke baad charge hota hai. Refund policy ke liye 24 hrs mein contact karo."},{h:"Prohibited Use",t:"Platform ka misuse, fake accounts banana, doctors ko harass karna, ya koi bhi illegal activity strictly prohibited hai."}]},
    contact:{title:"Contact Us",icon:"📞",content:[{h:"Customer Support",t:"Email: support@pmcare.org | Available: 9 AM to 9 PM, 7 days a week"},{h:"Phone",t:"+91 99999 99999 | Monday to Saturday: 9 AM - 6 PM"},{h:"Doctor Partnership",t:"doctors@pmcare.org | For doctor onboarding and partnership queries"},{h:"Technical Support",t:"tech@pmcare.org | For app issues, bugs, or technical queries"},{h:"Address",t:"PMCare Healthcare Pvt. Ltd. | India"}]}
  };
  const current="terms";const data=pages[current];
  return(<div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
    <style>{S}</style>
    <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
      <a href="/" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
      <h2 style={{fontSize:16,fontWeight:800}} className="sh">{data.icon} {data.title}</h2>
    </div>
    <div className="ns" style={{flex:1,overflowY:"auto",padding:"20px 20px 32px"}}>
      {data.content.map((s:any,i:number)=>(<div key={i} style={{marginBottom:22}}>
        <h3 style={{fontWeight:700,fontSize:15,color:"#00FFD1",marginBottom:8}}>{s.h}</h3>
        <p style={{color:"rgba(232,244,255,.6)",fontSize:13,lineHeight:1.8}}>{s.t}</p>
      </div>))}
      <div style={{marginTop:24,padding:"14px",borderRadius:13,background:"rgba(0,255,209,.04)",border:"1px solid rgba(0,255,209,.12)",textAlign:"center"}}>
        <p style={{color:"rgba(232,244,255,.4)",fontSize:12}}>© 2026 PMCare (pmcare.org) · All rights reserved</p>
        <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:10,flexWrap:"wrap"}}>
          {[["About","/about"],["Privacy","/privacy"],["Terms","/terms"],["Contact","/contact"]].map(([l,h])=>(<a key={l} href={h} style={{color:"rgba(232,244,255,.35)",fontSize:11,textDecoration:"none"}}>{l}</a>))}
        </div>
      </div>
    </div>
  </div>);
}
