// Public Supabase settings.
// Replace these two values with your Supabase project values.
// The anon key is safe to expose in the browser when Row Level Security is enabled.
window.MAISON_SUPABASE = {
  url: "https://mbjgirwuqzcjrllnokzj.supabase.co",
  anonKey: "sb_publishable_gEivTgSBsntxUkkJc3h9AA_-cmDpszh"
};

// Always start the storefront login fresh.
// This clears any previous Supabase Auth session when the visitor opens index.html,
// so an old account is never silently reused on the login screen.
(function () {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const isStorefront = path === '/' || path === '/index.html';
  if (!isStorefront || !window.supabase || !window.MAISON_SUPABASE?.url || !window.MAISON_SUPABASE?.anonKey) return;

  try {
    const client = window.supabase.createClient(
      window.MAISON_SUPABASE.url,
      window.MAISON_SUPABASE.anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
    client.auth.signOut({ scope: 'local' }).catch(() => {});
  } catch (e) {
    console.warn('Unable to clear previous storefront session', e);
  }
})();

// Admin must always ask for email + password again.
// Supabase stores the session in localStorage under sb-<project-ref>-auth-token.
(function () {
  const path = location.pathname + location.search + location.hash;
  const isAdmin = /\/admin(?:\.html)?(?:$|[?#])/.test(path);
  if (!isAdmin) return;

  try {
    const projectRef = new URL(window.MAISON_SUPABASE.url).hostname.split('.')[0];
    const authKey = `sb-${projectRef}-auth-token`;
    localStorage.removeItem(authKey);
    sessionStorage.removeItem(authKey);
  } catch (e) {
    console.warn('Unable to clear previous admin session', e);
  }
})();

// MAISON AL TEEB — Admin barcode scanner
// Loaded from the shared config so the existing admin.html does not need to be rewritten.
(function () {
  if(!/\/admin(?:\.html)?(?:$|[?#])/.test(location.pathname + location.search + location.hash)) return;

  const scannerCss = `
    #matBarcodeScannerOverlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(8px)}
    #matBarcodeScanner{width:min(520px,100%);background:#0d1110;border:1px solid #d6ad5555;border-radius:22px;padding:16px;box-shadow:0 25px 80px #000b;color:#f5f2e9}
    #matBarcodeScanner .mat-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
    #matBarcodeScanner .mat-title{font-weight:800;font-size:17px}.mat-muted{color:#94a09a;font-size:11px;margin-top:3px}
    #matBarcodeVideoWrap{position:relative;overflow:hidden;border-radius:16px;background:#050605;aspect-ratio:4/3;border:1px solid #26302c}
    #matBarcodeVideo{width:100%;height:100%;object-fit:cover;display:block}
    #matBarcodeFrame{position:absolute;left:10%;right:10%;top:25%;height:50%;border:2px solid #f0d58d;border-radius:14px;box-shadow:0 0 0 999px rgba(0,0,0,.18)}
    #matBarcodeStatus{text-align:center;color:#c6cec9;font-size:12px;padding:10px 4px 4px}
    #matBarcodeClose{border:1px solid #26302c;background:#151b18;color:#fff;border-radius:10px;width:38px;height:38px;font-size:20px;line-height:1}
    #matBarcodeScanBtn{white-space:nowrap;min-width:104px}
    .mat-barcode-field{display:flex!important;gap:8px!important;align-items:stretch!important}
    .mat-barcode-field input{flex:1;min-width:0}
    @media(max-width:800px){#matBarcodeScannerOverlay{padding:10px}#matBarcodeScanner{padding:12px;border-radius:18px}.mat-barcode-field{grid-column:1/-1}.mat-barcode-field input{font-size:16px}}
  `;

  function injectCss(){
    if(document.getElementById('matBarcodeScannerCss')) return;
    const style=document.createElement('style');
    style.id='matBarcodeScannerCss';
    style.textContent=scannerCss;
    document.head.appendChild(style);
  }

  function loadZXing(){
    return new Promise((resolve,reject)=>{
      if(window.ZXingBrowser) return resolve(window.ZXingBrowser);
      const s=document.createElement('script');
      s.src='https://unpkg.com/@zxing/browser@0.1.5/umd/index.min.js';
      s.onload=()=>window.ZXingBrowser?resolve(window.ZXingBrowser):reject(new Error('Scanner library unavailable'));
      s.onerror=()=>reject(new Error('تعذر تحميل أداة السكان')); 
      document.head.appendChild(s);
    });
  }

  function setup(){
    if(!window.lucide || !document.getElementById('barcode') || document.getElementById('matBarcodeScanBtn')) return;
    injectCss();

    const input=document.getElementById('barcode');
    const row=input.parentElement;
    row.classList.add('mat-barcode-field');

    const btn=document.createElement('button');
    btn.type='button';
    btn.id='matBarcodeScanBtn';
    btn.className='btn dark';
    btn.innerHTML='📷 Scanner';
    input.insertAdjacentElement('afterend',btn);

    const overlay=document.createElement('div');
    overlay.id='matBarcodeScannerOverlay';
    overlay.innerHTML=`
      <div id="matBarcodeScanner">
        <div class="mat-head">
          <div><div class="mat-title">Scanner Barcode</div><div class="mat-muted">وجّه الكاميرا نحو الباركود</div></div>
          <button id="matBarcodeClose" type="button" aria-label="إغلاق">×</button>
        </div>
        <div id="matBarcodeVideoWrap">
          <video id="matBarcodeVideo" playsinline muted></video>
          <div id="matBarcodeFrame"></div>
        </div>
        <div id="matBarcodeStatus">جاري تجهيز الكاميرا...</div>
      </div>`;
    document.body.appendChild(overlay);

    let controls=null;
    let reader=null;

    const status=(text)=>{const el=document.getElementById('matBarcodeStatus');if(el)el.textContent=text;};
    const stop=()=>{
      try{if(controls&&typeof controls.stop==='function')controls.stop();}catch(e){}
      controls=null;
      const video=document.getElementById('matBarcodeVideo');
      if(video&&video.srcObject){video.srcObject.getTracks().forEach(t=>t.stop());video.srcObject=null;}
      overlay.style.display='none';
    };

    document.getElementById('matBarcodeClose').onclick=stop;
    overlay.addEventListener('click',e=>{if(e.target===overlay)stop();});

    btn.onclick=async()=>{
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
        alert('الكاميرا غير متاحة. استعمل HTTPS واسمح للموقع باستعمال الكاميرا.');
        return;
      }
      overlay.style.display='flex';
      status('جاري تشغيل الكاميرا...');
      try{
        const ZX=await loadZXing();
        reader=reader||new ZX.BrowserMultiFormatReader();
        const video=document.getElementById('matBarcodeVideo');
        status('وجّه الكاميرا نحو Barcode...');
        controls=await reader.decodeFromVideoDevice(undefined,video,(result,error)=>{
          if(result){
            const value=result.getText();
            input.value=value;
            input.dispatchEvent(new Event('input',{bubbles:true}));
            input.dispatchEvent(new Event('change',{bubbles:true}));
            status('تم التعرف على Barcode: '+value);
            setTimeout(stop,450);
          }
        });
      }catch(err){
        console.error(err);
        status('ما قدرناش نشغلو الكاميرا. تأكد من صلاحية Camera.');
      }
    };
  }

  const boot=()=>{injectCss();setup();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  const observer=new MutationObserver(()=>setup());
  if(document.documentElement)observer.observe(document.documentElement,{childList:true,subtree:true});
})();
