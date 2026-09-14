// Public Supabase client configuration.
// This file is intentionally safe to ship in the browser: it contains only the
// project's publishable key. Never put a secret/service_role key here.
window.MAISON_SUPABASE = {
  url: 'https://mbjgirwuqzcjrllnokzj.supabase.co',
  anonKey: 'sb_publishable_gEivTgSBsntxUkkJc3h9AA_-cmDpszh'
};

// Reliable camera controls for the Admin > Ajouter un produit and Edit Product screens.
(function () {
  if (!/admin\.html$/i.test(location.pathname)) return;

  function makeButton(text, className, handler, id) {
    const b = document.createElement('button');
    b.type = 'button'; b.id = id; b.className = 'btn ' + className;
    b.textContent = text; b.onclick = handler;
    return b;
  }

  async function stop(instance) {
    if (!instance) return;
    try { if (instance.isScanning) await instance.stop(); } catch (_) {}
    try { await instance.clear(); } catch (_) {}
  }

  async function runScanner(viewId, statusEl, inputEl, onResult) {
    if (typeof Html5Qrcode === 'undefined') {
      statusEl.textContent = 'قارئ الكاميرا مازال كيتحمل... عاود الضغط.';
      return null;
    }
    const view = document.getElementById(viewId);
    if (!view) throw new Error('Scanner view introuvable');
    const scanner = new Html5Qrcode(viewId);
    const config = {fps: 10, qrbox: {width: 280, height: 140}, aspectRatio: 1.777};
    const success = async decoded => {
      const value = String(decoded || '').trim();
      if (!value) return;
      inputEl.value = value;
      inputEl.dispatchEvent(new Event('input', {bubbles: true}));
      inputEl.dispatchEvent(new Event('change', {bubbles: true}));
      await onResult(value, scanner);
    };
    try {
      await scanner.start({facingMode: 'environment'}, config, success, () => {});
    } catch (firstError) {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || !cameras.length) throw firstError;
        const back = cameras.find(c => /back|rear|environment|arrière|trasera|dorsal/i.test(c.label || '')) || cameras[cameras.length - 1];
        await scanner.start(back.id, config, success, () => {});
      } catch (secondError) {
        await stop(scanner);
        throw secondError || firstError;
      }
    }
    statusEl.textContent = 'الكاميرا شغالة — وجّهها نحو Barcode';
    return scanner;
  }

  function setupAdd() {
    const input = document.getElementById('barcode');
    const reader = document.getElementById('addBarcodeReader');
    const status = document.getElementById('addBarcodeStatus');
    if (!input) return;
    const tools = input.closest('.barcode-tools');
    if (!tools) return;

    tools.querySelectorAll('button').forEach(b => b.remove());
    if (reader) {
      reader.classList.add('hidden');
      reader.innerHTML = '<div id="addBarcodeReaderView"></div>';
    }
    if (status) status.textContent = 'الكاميرا متوقفة — اضغط تشغيل الكاميرا';
    let scanner = null;

    const startBtn = makeButton('📷 تشغيل الكاميرا', 'gold', async () => {
      if (scanner) return;
      if (reader) reader.classList.remove('hidden');
      startBtn.disabled = true; stopBtn.disabled = false;
      try {
        scanner = await runScanner('addBarcodeReaderView', status, input, async (value, instance) => {
          status.textContent = 'تمت قراءة Barcode ✓';
          await stop(instance); scanner = null;
          if (reader) reader.classList.add('hidden');
          startBtn.disabled = false; stopBtn.disabled = true;
        });
      } catch (e) {
        scanner = null;
        if (reader) reader.classList.add('hidden');
        status.textContent = 'تعذر تشغيل الكاميرا. سمح للمتصفح بالكاميرا وتأكد أن الصفحة HTTPS.';
        startBtn.disabled = false; stopBtn.disabled = true;
        console.error('ADMIN ADD SCANNER', e);
      }
    }, 'adminAddScannerStart');

    const stopBtn = makeButton('✕ إيقاف', 'danger', async () => {
      await stop(scanner); scanner = null;
      if (reader) reader.classList.add('hidden');
      status.textContent = 'الكاميرا متوقفة — اضغط تشغيل الكاميرا';
      startBtn.disabled = false; stopBtn.disabled = true;
    }, 'adminAddScannerStop');
    stopBtn.disabled = true;
    tools.append(startBtn, stopBtn);
  }

  function setupEdit() {
    const input = document.getElementById('edit_barcode');
    const reader = document.getElementById('barcodeReader');
    const status = document.getElementById('scannerStatus');
    if (!input || !reader || !status) return;
    const tools = input.closest('.barcode-tools');
    if (!tools) return;

    tools.querySelectorAll('button').forEach(b => b.remove());
    reader.classList.add('hidden');
    const view = document.getElementById('barcodeReaderView');
    if (view) view.innerHTML = '';
    status.textContent = 'الكاميرا متوقفة';
    let scanner = null;

    const startBtn = makeButton('📷 تشغيل الكاميرا', 'gold', async () => {
      if (scanner) return;
      reader.classList.remove('hidden');
      startBtn.disabled = true; stopBtn.disabled = false;
      try {
        scanner = await runScanner('barcodeReaderView', status, input, async (value, instance) => {
          status.textContent = 'تمت قراءة Barcode ✓';
          await stop(instance); scanner = null;
          reader.classList.add('hidden');
          startBtn.disabled = false; stopBtn.disabled = true;
        });
      } catch (e) {
        scanner = null; reader.classList.add('hidden');
        status.textContent = 'تعذر تشغيل الكاميرا. سمح للمتصفح بالكاميرا وتأكد أن الصفحة HTTPS.';
        startBtn.disabled = false; stopBtn.disabled = true;
        console.error('ADMIN EDIT SCANNER', e);
      }
    }, 'adminEditScannerStart');

    const stopBtn = makeButton('✕ إيقاف', 'danger', async () => {
      await stop(scanner); scanner = null;
      reader.classList.add('hidden');
      status.textContent = 'الكاميرا متوقفة';
      startBtn.disabled = false; stopBtn.disabled = true;
    }, 'adminEditScannerStop');
    stopBtn.disabled = true;
    tools.append(startBtn, stopBtn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { setupAdd(); setupEdit(); }, 400);
  });
})();
