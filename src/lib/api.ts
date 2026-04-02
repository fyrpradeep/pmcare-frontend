export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api";
export const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "df9a9d941e3743daaeb6a418ddb26f04";

export const getToken  = () => { try { return localStorage.getItem("pm_token")||""; } catch { return ""; } };
export const getUser   = () => { try { return JSON.parse(localStorage.getItem("pm_user")||"null"); } catch { return null; } };
export const getRole   = () => { try { return localStorage.getItem("pm_role")||""; } catch { return ""; } };
export const getMobile = () => { try { return localStorage.getItem("pm_mobile")||""; } catch { return ""; } };

export const setAuth = (token:string, role:string, user:any, mobile?:string) => {
  localStorage.setItem("pm_token", token);
  localStorage.setItem("pm_role",  role);
  localStorage.setItem("pm_user",  JSON.stringify(user||{}));
  if (mobile) localStorage.setItem("pm_mobile", mobile);
  const id = mobile||user?.mobile||user?.email||"";
  if (id) localStorage.setItem(`pm_u_${id}`, JSON.stringify({...user,role}));
};

export const clearAuth = () => {
  ["pm_token","pm_role","pm_user"].forEach(k => { try{localStorage.removeItem(k);}catch{} });
};

export const goTo = (role:string) => {
  window.location.href = role==="doctor"?"/doctor/dashboard":role==="admin"?"/admin/dashboard":role==="staff"?"/staff/dashboard":role==="pharma"?"/pharma/dashboard":"/dashboard";
};

export async function apiFetch(path:string, opts?:RequestInit) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}), ...(opts?.headers||{}) },
  });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.message||`Error ${res.status}`);
  return data;
}

export const apiGet  = (path:string)            => apiFetch(path);
export const apiPost = (path:string, body:any)  => apiFetch(path,{method:"POST",  body:JSON.stringify(body)});
export const apiPut  = (path:string, body:any)  => apiFetch(path,{method:"PUT",   body:JSON.stringify(body)});
export const apiDel  = (path:string)            => apiFetch(path,{method:"DELETE"});
