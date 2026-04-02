"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, getToken } from "@/lib/api";

const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}
.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:14px;margin-bottom:11px}
.btn-p{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border-radius:14px;font-weight:800;font-size:14px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit;transition:all .2s;text-decoration:none}
.btn-p:disabled{opacity:.5;cursor:not-allowed}
.inp{width:100%;padding:11px 13px;border-radius:11px;font-size:13px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
.inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(0,255,209,.4)}
.suc{color:#00FFD1;font-size:12px;padding:8px 12px;background:rgba(0,255,209,.07);border-radius:9px;border:1px solid rgba(0,255,209,.2);display:block}
.err{color:#FF6B6B;font-size:12px;padding:8px 12px;background:rgba(255,107,107,.08);border-radius:9px;border:1px solid rgba(255,107,107,.2);display:block}
.ld{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;

export default function Cart() {
  const router = useRouter();
  const [cart, setCart]         = useState<any[]>([]);
  const [coupon, setCoupon]     = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState("");
  const [couponErr, setCouponErr]= useState("");
  const [couponOk, setCouponOk] = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(()=>{
    if(!getToken()){router.replace("/login");return;}
    try{const c=JSON.parse(localStorage.getItem("pm_cart")||"[]");setCart(c);}catch{}
  },[]);

  const updateQty=(id:string,delta:number)=>{
    setCart(prev=>{const u=prev.map(x=>x._id===id?{...x,qty:Math.max(0,x.qty+delta)}:x).filter(x=>x.qty>0);localStorage.setItem("pm_cart",JSON.stringify(u));return u;});
  };
  const removeItem=(id:string)=>{
    setCart(prev=>{const u=prev.filter(x=>x._id!==id);localStorage.setItem("pm_cart",JSON.stringify(u));return u;});
  };

  const subtotal=cart.reduce((a:number,b:any)=>a+(b.discount?Math.round(b.price*(1-b.discount/100)):b.price)*b.qty,0);
  const delivery=subtotal>499?0:50;
  const total=subtotal+delivery-discount;

  const applyCoupon=async()=>{
    if(!coupon.trim())return;
    setCouponErr("");setCouponOk("");
    try{
      const r=await apiPost("/coupons/validate",{code:coupon.toUpperCase(),amount:subtotal});
      setDiscount(r.discount);setCouponId(r.couponId);
      setCouponOk(`✅ Coupon applied! ₹${r.discount} off`);
    }catch(e:any){setCouponErr(e.message||"Invalid coupon");setDiscount(0);setCouponId("");}
  };

  const checkout=()=>{
    // Save cart summary for checkout page
    localStorage.setItem("pm_checkout",JSON.stringify({cart,subtotal,delivery,discount,couponId,total}));
    router.push("/checkout");
  };

  if(cart.length===0) return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF",padding:24,textAlign:"center"}}>
      <style>{S}</style>
      <p style={{fontSize:52,marginBottom:16}}>🛒</p>
      <h2 style={{fontSize:20,fontWeight:900,marginBottom:8}}>Cart Khali Hai</h2>
      <p style={{color:"rgba(232,244,255,.45)",fontSize:13,marginBottom:24}}>Medicines add karo phir checkout karo</p>
      <a href="/medicines" className="btn-p" style={{display:"inline-flex",width:"auto",padding:"13px 28px"}}>💊 Medicines Browse Karo</a>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
      <style>{S}</style>
      <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
        <a href="/medicines" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
        <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">My Cart 🛒</h2>
        <p style={{color:"rgba(232,244,255,.4)",fontSize:12}}>{cart.length} items</p>
      </div>

      <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        {cart.map((item:any)=>{
          const price=item.discount?Math.round(item.price*(1-item.discount/100)):item.price;
          return(
            <div key={item._id} className="card">
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:12,background:"rgba(0,255,209,.05)",border:"1px solid rgba(0,255,209,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0,overflow:"hidden"}}>
                  {item.image?<img src={item.image} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:12}}/>:"💊"}
                </div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:2}}>{item.name}</p>
                  <p style={{color:"rgba(232,244,255,.4)",fontSize:10,marginBottom:6}}>{item.brand}</p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button onClick={()=>updateQty(item._id,-1)} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:"none",cursor:"pointer",fontSize:16,color:"#E8F4FF"}}>−</button>
                      <span style={{fontWeight:700,fontSize:14,color:"#00FFD1",minWidth:20,textAlign:"center"}}>{item.qty}</span>
                      <button onClick={()=>updateQty(item._id,1)} style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",border:"none",cursor:"pointer",fontSize:16,color:"#fff"}}>+</button>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{fontWeight:800,fontSize:14,color:"#00FFD1"}}>₹{price*item.qty}</p>
                      {item.discount>0&&<p style={{fontSize:10,color:"rgba(232,244,255,.3)",textDecoration:"line-through"}}>₹{item.price*item.qty}</p>}
                    </div>
                  </div>
                </div>
                <button onClick={()=>removeItem(item._id)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,107,107,.6)",fontSize:18,padding:"4px"}}>🗑️</button>
              </div>
            </div>
          );
        })}

        {/* Coupon */}
        <div className="card">
          <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:10}}>🎟️ Coupon Code</p>
          <div style={{display:"flex",gap:8}}>
            <input className="inp" style={{flex:1}} placeholder="Enter coupon code" value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&applyCoupon()}/>
            <button onClick={applyCoupon} style={{padding:"11px 16px",borderRadius:11,background:"linear-gradient(135deg,#00C9A7,#0B6FCC)",border:"none",cursor:"pointer",color:"#fff",fontWeight:700,fontSize:12,fontFamily:"inherit",whiteSpace:"nowrap"}}>Apply</button>
          </div>
          {couponOk&&<span className="suc" style={{marginTop:8}}>{couponOk}</span>}
          {couponErr&&<span className="err" style={{marginTop:8}}>{couponErr}</span>}
        </div>

        {/* Bill Summary */}
        <div className="card">
          <p style={{fontWeight:700,fontSize:13,color:"#E8F4FF",marginBottom:12}}>Bill Summary</p>
          {[{l:"Subtotal",v:`₹${subtotal}`},{l:`Delivery${subtotal>499?" (Free above ₹499)":""}`,v:delivery===0?"FREE":`₹${delivery}`},{...(discount>0?{l:"Coupon Discount",v:`-₹${discount}`}:{})}].filter(x=>x.l).map((r:any)=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <p style={{color:"rgba(232,244,255,.5)",fontSize:12}}>{r.l}</p>
              <p style={{color:r.v?.startsWith("-")?"#00FFD1":r.v==="FREE"?"#00FFD1":"#E8F4FF",fontWeight:600,fontSize:12}}>{r.v}</p>
            </div>
          ))}
          <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:10,display:"flex",justifyContent:"space-between"}}>
            <p style={{fontWeight:800,fontSize:15}}>Total Payable</p>
            <p style={{fontWeight:900,fontSize:17,color:"#00FFD1"}}>₹{total}</p>
          </div>
        </div>
      </div>

      <div style={{flexShrink:0,padding:"12px 18px 24px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,.06)"}}>
        <button className="btn-p" onClick={checkout}>Proceed to Checkout → ₹{total}</button>
      </div>
    </div>
  );
}
