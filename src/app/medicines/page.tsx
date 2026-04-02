"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet, getToken } from "@/lib/api";

const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}
.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;transition:all .3s}
.card:hover{border-color:rgba(0,255,209,.2)}
.btn-p{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 16px;border-radius:11px;font-weight:700;font-size:13px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit;width:100%;transition:all .2s}
.btn-o{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 14px;border-radius:11px;font-weight:600;font-size:12px;color:#00FFD1;border:1px solid rgba(0,255,209,.25);background:rgba(0,255,209,.05);cursor:pointer;font-family:inherit;width:100%}
.inp{width:100%;padding:11px 13px;border-radius:11px;font-size:13px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
.inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(0,255,209,.4)}
.cat-chip{padding:7px 14px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(232,244,255,.65);white-space:nowrap;transition:all .2s;flex-shrink:0}
.cat-chip.on{background:linear-gradient(135deg,#00C9A7,#0B6FCC);border-color:transparent;color:#fff}
.sp{width:20px;height:20px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#00FFD1;border-radius:50%;animation:spin .8s linear infinite}
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700}
.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;

export default function Medicines() {
  const router = useRouter();
  const [meds, setMeds]         = useState<any[]>([]);
  const [categories, setCats]   = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selCat, setSelCat]     = useState("");
  const [cart, setCart]         = useState<any[]>([]);

  useEffect(()=>{
    if(!getToken()){router.replace("/login");return;}
    // Load cart from localStorage
    try{const c=JSON.parse(localStorage.getItem("pm_cart")||"[]");setCart(c);}catch{}
    loadData();
  },[]);

  const loadData=async()=>{
    setLoading(true);
    try{
      const [m,c]=await Promise.all([apiGet("/medicines"),apiGet("/medicines/categories").catch(()=>[])]);
      if(Array.isArray(m)) setMeds(m.filter((x:any)=>x.isActive!==false));
      if(Array.isArray(c)) setCats(c);
    }finally{setLoading(false);}
  };

  const filtered=meds.filter(m=>{
    const matchSearch=!search||(m.name||"").toLowerCase().includes(search.toLowerCase())||(m.brand||"").toLowerCase().includes(search.toLowerCase());
    const matchCat=!selCat||m.category===selCat;
    return matchSearch&&matchCat;
  });

  const addToCart=(m:any)=>{
    setCart(prev=>{
      const existing=prev.find(x=>x._id===m._id);
      const updated=existing?prev.map(x=>x._id===m._id?{...x,qty:x.qty+1}:x):[...prev,{...m,qty:1}];
      localStorage.setItem("pm_cart",JSON.stringify(updated));
      return updated;
    });
  };

  const getQty=(id:string)=>cart.find(x=>x._id===id)?.qty||0;
  const totalItems=cart.reduce((a:number,b:any)=>a+b.qty,0);

  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
      <style>{S}</style>
      {/* Header */}
      <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
        <a href="/dashboard" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
        <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">Medicine Store 💊</h2>
        {totalItems>0&&(
          <a href="/cart" style={{position:"relative",width:36,height:36,borderRadius:11,background:"rgba(0,255,209,.08)",border:"1px solid rgba(0,255,209,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,textDecoration:"none"}}>
            🛒
            <div style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff"}}>{totalItems}</div>
          </a>
        )}
      </div>

      {/* Search */}
      <div style={{flexShrink:0,padding:"12px 18px 0"}}>
        <div style={{position:"relative",marginBottom:12}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15}}>🔍</span>
          <input className="inp" style={{paddingLeft:36}} placeholder="Search medicines, brands..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        {/* Categories */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:12}} className="ns">
          <button className={`cat-chip${!selCat?" on":""}`} onClick={()=>setSelCat("")}>All</button>
          {categories.map(c=><button key={c} className={`cat-chip${selCat===c?" on":""}`} onClick={()=>setSelCat(selCat===c?"":c)}>{c}</button>)}
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="ns" style={{flex:1,overflowY:"auto",padding:"0 18px 16px"}}>
        {loading&&<div style={{display:"flex",justifyContent:"center",padding:"40px"}}><span className="sp"/></div>}
        {!loading&&filtered.length===0&&<div style={{textAlign:"center",padding:"40px 20px"}}><p style={{fontSize:40,marginBottom:10}}>💊</p><p style={{color:"rgba(232,244,255,.38)",fontSize:13}}>No medicines found</p></div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
          {filtered.map((m:any)=>{
            const qty=getQty(m._id);
            const discountedPrice=m.discount?Math.round(m.price*(1-m.discount/100)):m.price;
            return(
              <div key={m._id} className="card">
                <div style={{width:"100%",height:80,borderRadius:10,background:"rgba(0,255,209,.04)",border:"1px solid rgba(0,255,209,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,marginBottom:10,overflow:"hidden"}}>
                  {m.image?<img src={m.image} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}/>:"💊"}
                </div>
                {m.requiresPrescription&&<span className="badge" style={{background:"rgba(255,107,107,.1)",color:"#FF6B6B",marginBottom:5}}>Rx Required</span>}
                {m.discount>0&&<span className="badge" style={{background:"rgba(0,255,209,.1)",color:"#00FFD1",marginBottom:5,marginLeft:4}}>{m.discount}% OFF</span>}
                <p style={{fontWeight:700,fontSize:12,color:"#E8F4FF",marginBottom:2,lineHeight:1.4}}>{m.name}</p>
                <p style={{color:"rgba(232,244,255,.4)",fontSize:10,marginBottom:6}}>{m.brand}</p>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                  <p style={{fontWeight:800,fontSize:14,color:"#00FFD1"}}>₹{discountedPrice}</p>
                  {m.discount>0&&<p style={{fontSize:10,color:"rgba(232,244,255,.3)",textDecoration:"line-through"}}>₹{m.price}</p>}
                </div>
                {m.stock===0?(
                  <p style={{textAlign:"center",color:"#FF6B6B",fontSize:11,fontWeight:600,padding:"8px 0"}}>Out of Stock</p>
                ):qty>0?(
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                    <button onClick={()=>{setCart(prev=>{const u=prev.map(x=>x._id===m._id?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0);localStorage.setItem("pm_cart",JSON.stringify(u));return u;});}} style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:"none",cursor:"pointer",fontSize:18,color:"#E8F4FF"}}>−</button>
                    <span style={{fontWeight:700,fontSize:14,color:"#00FFD1"}}>{qty}</span>
                    <button onClick={()=>addToCart(m)} style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",border:"none",cursor:"pointer",fontSize:18,color:"#fff"}}>+</button>
                  </div>
                ):(
                  <button className="btn-p" style={{padding:"9px",fontSize:12}} onClick={()=>addToCart(m)}>+ Add to Cart</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart Button */}
      {totalItems>0&&(
        <div style={{flexShrink:0,padding:"12px 18px 20px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <a href="/cart" className="btn-p" style={{display:"flex",justifyContent:"center",textDecoration:"none"}}>
            🛒 View Cart ({totalItems} items) — ₹{cart.reduce((a:number,b:any)=>a+(b.discount?Math.round(b.price*(1-b.discount/100)):b.price)*b.qty,0)}
          </a>
        </div>
      )}
    </div>
  );
}
