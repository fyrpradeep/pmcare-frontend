"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setAuth, goTo } from "@/lib/api";
export default function AuthCallback() {
  const sq = useSearchParams();
  useEffect(()=>{
    const token=sq.get("token")||"";const role=sq.get("role")||"patient";
    if(token){setAuth(token,role,{},undefined);goTo(role);}
    else window.location.href="/login";
  },[]);
  return(<div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#020D1A",color:"#E8F4FF",fontSize:16}}>Logging in...</div>);
}
