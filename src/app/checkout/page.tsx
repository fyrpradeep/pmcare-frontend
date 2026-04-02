"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, getUser, getToken } from "@/lib/api";

declare const Razorpay: any;

const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;overflow:hidden}
@keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.sh{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}
.card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:16px;margin-bottom:14px}
.btn-p{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border-radius:14px;font-weight:800;font-size:15px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);font-family:inherit;transition:all .2s}
.btn-p:disabled{opacity:.5;cursor:not-allowed}
.inp{width:100%;padding:12px 14px;border-radius:12px;font-size:13px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
.inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(0,255,209,.4)}
.ld{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
.err{color:#FF6B6B;font-size:12px;padding:8px 12px;background:rgba(255,107,107,.08);border-radius:9px;border:1px solid rgba(255,107,107,.2);display:block;margin-top:6px}
.ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}`;

export default function Checkout() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [address, setAddress] = useState({line1:"",line2:"",city:"",state:"",pincode:""});
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [success, setSuccess] = useState(false);
  const user = getUser();

  useEffect(()=>{
    if(!getToken()){router.replace("/login");return;}
    try{const s=JSON.parse(localStorage.getItem("pm_checkout")||"null");if(!s){router.replace("/cart");return;}setSummary(s);}
    catch{router.replace("/cart");}
    // Prefill saved address
    try{const saved=JSON.parse(localStorage.getItem("pm_address")||"null");if(saved)setAddress(saved);}catch{}
  },[]);

  const isValid=()=>address.line1.trim()&&address.city.trim()&&address.state.trim()&&address.pincode.trim()&&address.pincode.length===6;

  const saveAddress=()=>{localStorage.setItem("pm_address",JSON.stringify(address));};

  const placeOrder=async()=>{
    if(!isValid()){setErr("Sab address fields bharo (pincode 6 digits)");return;}
    setLoading(true);setErr("");saveAddress();
    const RZPKEY=process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    try{
      const orderData={
        items:summary.cart.map((x:any)=>({medicineId:x._id,name:x.name,qty:x.qty,price:x.discount?Math.round(x.price*(1-x.discount/100)):x.price,total:(x.discount?Math.round(x.price*(1-x.discount/100)):x.price)*x.qty})),
        patientId:user?._id,patientName:user?.name,patientMobile:user?.mobile,
        address,subtotal:summary.subtotal,deliveryCharge:summary.delivery,discount:summary.discount,total:summary.total,
      };

      if(!RZPKEY||RZPKEY==="PLACEHOLDER_ADD_WHEN_READY"){
        // COD fallback when Razorpay not configured
        const r=await apiPost("/orders",{...orderData,status:"pending"});
        localStorage.removeItem("pm_cart");localStorage.removeItem("pm_checkout");
        setSuccess(true);
        setTimeout(()=>router.push(`/orders/${r._id}`),2000);
        return;
      }

      // Create Razorpay order
      const rzpOrder=await apiPost("/payments/create-order",{amount:summary.total,type:"medicine",refId:"cart"});

      const options={
        key:RZPKEY,amount:summary.total*100,currency:"INR",name:"PMCare",description:"Medicine Order",
        order_id:rzpOrder.orderId,
        prefill:{name:user?.name||"",contact:user?.mobile||"",email:user?.email||""},
        theme:{color:"#00C9A7"},
        handler:async(res:any)=>{
          // Verify payment
          await apiPost("/payments/verify",{razorpayOrderId:res.razorpay_order_id,razorpayPaymentId:res.razorpay_payment_id,signature:res.razorpay_signature});
          // Create order in DB
          const dbOrder=await apiPost("/orders",{...orderData,razorpayOrderId:res.razorpay_order_id,razorpayPaymentId:res.razorpay_payment_id});
          localStorage.removeItem("pm_cart");localStorage.removeItem("pm_checkout");
          setSuccess(true);
          setTimeout(()=>router.push(`/orders/${dbOrder._id}`),2000);
        },
        modal:{ondismiss:()=>{setLoading(false);setErr("Payment cancelled");}},
      };
      const rzp=new Razorpay(options);
      rzp.open();
    }catch(e:any){setErr(e.message||"Order place karne mein error");setLoading(false);}
  };

  if(success) return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF",textAlign:"center",padding:24}}>
      <style>{S}</style>
      <div style={{fontSize:64,marginBottom:20}}>🎉</div>
      <h2 style={{fontSize:24,fontWeight:900,marginBottom:8,color:"#00FFD1"}}>Order Placed!</h2>
      <p style={{color:"rgba(232,244,255,.5)",fontSize:14}}>Aapka order successfully place ho gaya hai</p>
    </div>
  );

  if(!summary) return null;

  return(
    <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",background:"#020D1A",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#E8F4FF"}}>
      <style>{S}</style>
      <div style={{flexShrink:0,padding:"14px 18px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
        <a href="/cart" style={{color:"#00FFD1",fontSize:20,textDecoration:"none"}}>←</a>
        <h2 style={{fontSize:16,fontWeight:800,flex:1}} className="sh">Checkout</h2>
      </div>

      <div className="ns" style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        {/* Delivery Address */}
        <div className="card">
          <p style={{fontWeight:700,fontSize:14,color:"#E8F4FF",marginBottom:14}}>📍 Delivery Address</p>
          {[{k:"line1",l:"House/Flat/Building *",ph:"e.g. 42 MG Road, Flat 3B"},{k:"line2",l:"Area/Locality",ph:"e.g. Koregaon Park"},{k:"city",l:"City *",ph:"e.g. Pune"},{k:"state",l:"State *",ph:"e.g. Maharashtra"}].map(f=>(
            <div key={f.k} style={{marginBottom:10}}>
              <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{f.l}</label>
              <input className="inp" placeholder={f.ph} value={(address as any)[f.k]} onChange={e=>setAddress(p=>({...p,[f.k]:e.target.value}))}/>
            </div>
          ))}
          <div style={{marginBottom:4}}>
            <label style={{display:"block",fontSize:10,fontWeight:700,color:"rgba(232,244,255,.4)",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Pincode *</label>
            <input className="inp" type="tel" inputMode="numeric" maxLength={6} placeholder="6-digit pincode" value={address.pincode} onChange={e=>setAddress(p=>({...p,pincode:e.target.value.replace(/\D/g,"")}))}/>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card">
          <p style={{fontWeight:700,fontSize:14,color:"#E8F4FF",marginBottom:12}}>🧾 Order Summary</p>
          {summary.cart.map((item:any)=>{
            const price=item.discount?Math.round(item.price*(1-item.discount/100)):item.price;
            return(<div key={item._id} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <p style={{color:"rgba(232,244,255,.5)",fontSize:12}}>{item.name} × {item.qty}</p>
              <p style={{color:"#E8F4FF",fontWeight:600,fontSize:12}}>₹{price*item.qty}</p>
            </div>);
          })}
          <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:10,marginTop:4}}>
            {[{l:"Subtotal",v:`₹${summary.subtotal}`},{l:"Delivery",v:summary.delivery===0?"FREE":`₹${summary.delivery}`},{...(summary.discount>0?{l:"Coupon Discount",v:`-₹${summary.discount}`}:{})}].filter(x=>x.l).map((r:any)=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <p style={{color:"rgba(232,244,255,.5)",fontSize:12}}>{r.l}</p>
                <p style={{color:r.v?.startsWith("-")?"#00FFD1":r.v==="FREE"?"#00FFD1":"#E8F4FF",fontWeight:600,fontSize:12}}>{r.v}</p>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:8,marginTop:4}}>
              <p style={{fontWeight:800,fontSize:15}}>Total</p>
              <p style={{fontWeight:900,fontSize:17,color:"#00FFD1"}}>₹{summary.total}</p>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div style={{padding:"12px 16px",borderRadius:13,background:"rgba(0,255,209,.05)",border:"1px solid rgba(0,255,209,.15)",marginBottom:14}}>
          <p style={{color:"rgba(232,244,255,.6)",fontSize:12,lineHeight:1.7}}>
            💳 Payment via <strong style={{color:"#00FFD1"}}>Razorpay</strong> — UPI, Card, Net Banking, Wallet<br/>
            🔒 100% Secure · Encrypted · PCI-DSS Compliant
          </p>
        </div>

        {err&&<span className="err">{err}</span>}
      </div>

      <div style={{flexShrink:0,padding:"12px 18px 28px",background:"rgba(2,13,26,.97)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,.06)"}}>
        <button className="btn-p" onClick={placeOrder} disabled={loading||!isValid()}>
          {loading?<span className="ld"/>:`💳 Pay ₹${summary?.total} & Place Order`}
        </button>
      </div>
    </div>
  );
}
