// Shared styles used across all pages
export const FONT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`;

export const BASE_CSS = `
  ${FONT}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:#020D1A;font-family:'Plus Jakarta Sans',sans-serif;color:#E8F4FF}
  ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#020D1A}::-webkit-scrollbar-thumb{background:#00FFD1;border-radius:4px}
  *{-ms-overflow-style:none;scrollbar-width:thin}
  @keyframes sh{0%{background-position:-200% center}to{background-position:200% center}}
  @keyframes fy{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes rp{0%{transform:scale(.8);opacity:1}to{transform:scale(2.4);opacity:0}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pop{0%{transform:scale(.85)}60%{transform:scale(1.1)}to{transform:scale(1)}}
  @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fi{from{opacity:0}to{opacity:1}}
  @keyframes ps{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}

  .shine{background:linear-gradient(90deg,#00FFD1,#4DB8FF,#A78BFA,#00FFD1);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 4s linear infinite}
  .shine2{background:linear-gradient(90deg,#4DB8FF,#00FFD1,#4DB8FF);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:sh 3s linear infinite}

  .btn-p{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:14px 24px;border-radius:14px;font-weight:800;font-size:14px;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,#00C9A7,#0B6FCC);box-shadow:0 6px 24px rgba(0,201,167,.3);transition:all .3s;font-family:inherit;text-decoration:none;width:100%}
  .btn-p:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,201,167,.45)}
  .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none}

  .btn-o{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 24px;border-radius:14px;font-weight:700;font-size:13px;color:#00FFD1;border:1.5px solid rgba(0,255,209,.3);cursor:pointer;background:rgba(0,255,209,.06);transition:all .3s;font-family:inherit;text-decoration:none;width:100%}
  .btn-o:hover{background:rgba(0,255,209,.12)}

  .btn-g{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:13px 24px;border-radius:14px;font-weight:700;font-size:13px;color:#E8F4FF;border:1.5px solid rgba(255,255,255,.12);cursor:pointer;background:rgba(255,255,255,.05);transition:all .3s;font-family:inherit;text-decoration:none;width:100%}
  .btn-g:hover{background:rgba(255,255,255,.09)}

  .inp{width:100%;padding:13px 16px;border-radius:13px;font-size:14px;outline:none;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#E8F4FF;font-family:inherit;transition:all .3s}
  .inp::placeholder{color:rgba(232,244,255,.3)}.inp:focus{border-color:rgba(0,255,209,.5);background:rgba(0,255,209,.04)}

  .card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:18px;transition:all .3s}
  .card:hover{border-color:rgba(0,255,209,.2);transform:translateY(-2px)}

  .tag{display:inline-flex;align-items:center;gap:6px;padding:5px 13px;border-radius:100px;background:rgba(0,255,209,.08);border:1px solid rgba(0,255,209,.2);font-size:11px;font-weight:700;color:#00FFD1}

  .ldot{width:7px;height:7px;border-radius:50%;background:#00FFD1;flex-shrink:0;position:relative;display:inline-block}
  .ldot::after{content:'';position:absolute;inset:-3px;border-radius:50%;background:rgba(0,255,209,.3);animation:rp 1.8s infinite}

  .ob{width:46px;height:54px;border-radius:12px;text-align:center;font-size:22px;font-weight:900;outline:none;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.1);color:#E8F4FF;transition:all .2s;font-family:inherit}
  .ob:focus{border-color:rgba(0,255,209,.7);background:rgba(0,255,209,.07);transform:scale(1.05)}.ob.f{border-color:rgba(0,255,209,.5);animation:pop .2s ease}

  .divider{display:flex;align-items:center;gap:12px;margin:16px 0;color:rgba(232,244,255,.3);font-size:12px}
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08)}

  .err{color:#FF6B6B;font-size:12px;margin-top:6px;padding:8px 12px;background:rgba(255,107,107,.08);border-radius:9px;border:1px solid rgba(255,107,107,.2);display:block}
  .suc{color:#00FFD1;font-size:12px;margin-top:6px;padding:8px 12px;background:rgba(0,255,209,.07);border-radius:9px;border:1px solid rgba(0,255,209,.2);display:block}

  .spin{width:20px;height:20px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block}

  .ni{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 0;cursor:pointer;border:none;background:none;font-family:inherit;flex:1;border-top:2px solid transparent;transition:all .2s}
  .ni.on{border-top-color:#00FFD1}

  .badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700}

  .tg{width:44px;height:24px;border-radius:100px;cursor:pointer;transition:all .3s;position:relative;border:none;flex-shrink:0}
  .tg-k{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:all .3s}

  .orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}
  .ns::-webkit-scrollbar{display:none}.ns{-ms-overflow-style:none;scrollbar-width:none}
  .anim{animation:fu .4s ease}
`;
