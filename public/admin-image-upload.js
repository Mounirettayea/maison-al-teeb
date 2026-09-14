// MAISON AL TEEB — Product image upload from device to Supabase Storage
(function () {
  const path = location.pathname + location.search + location.hash;
  if (!/\/admin(?:\.html)?(?:$|[?#])/.test(path)) return;

  const BUCKET = 'product-images';
  let addFile = null;
  let editFile = null;

  const flashMsg = (text, error) => {
    if (typeof window.flash === 'function') window.flash(text, error);
    else console[error ? 'error' : 'log'](text);
  };

  function makeFileInput(id, accept) {
    let input = document.getElementById(id);
    if (input) return input;
    input = document.createElement('input');
    input.type = 'file';
    input.id = id;
    input.accept = accept;
    input.style.display = 'none';
    document.body.appendChild(input);
    return input;
  }

  function addUploadButton(input, fileInput, label) {
    if (!input || document.getElementById(fileInput.id + '_btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = fileInput.id + '_btn';
    btn.className = 'btn dark';
    btn.textContent = '📁 ' + label;
    btn.style.whiteSpace = 'nowrap';
    btn.onclick = () => fileInput.click();
    input.insertAdjacentElement('afterend', btn);
  }

  async function uploadFile(file) {
    if (!file) return null;
    if (!file.type.startsWith('image/')) throw new Error('اختار صورة فقط.');
    if (file.size > 8 * 1024 * 1024) throw new Error('الصورة كبيرة بزاف. الحد الأقصى هو 8MB.');

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const safeBase = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'product';
    const path = 'products/' + Date.now() + '-' + safeBase + '.' + ext;

    const { data: sessionData } = await window.db?.auth?.getSession?.() || { data: { session: null } };
    const session = sessionData?.session;
    if (!session) throw new Error('خاصك تدخل للحساب ديال Admin قبل رفع الصورة.');

    const client = window.db || window.supabase.createClient(window.MAISON_SUPABASE.url, window.MAISON_SUPABASE.anonKey);
    const { error } = await client.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });
    if (error) throw error;

    const { data } = client.storage.from(BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('ما قدرناش نجيبو رابط الصورة.');
    return data.publicUrl;
  }

  function showPreview(container, file) {
    if (!container || !file) return;
    const old = container.querySelector('.mat-upload-preview');
    if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.className = 'mat-upload-preview';
    wrap.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:8px;color:#94a09a;font-size:11px';
    const img = document.createElement('img');
    img.style.cssText = 'width:58px;height:58px;border-radius:10px;object-fit:cover;border:1px solid #26302c';
    img.src = URL.createObjectURL(file);
    wrap.appendChild(img);
    const text = document.createElement('span');
    text.textContent = file.name + ' · جاري الرفع...';
    wrap.appendChild(text);
    container.appendChild(wrap);
    return { wrap, text };
  }

  async function handleFile(file, targetInput, container) {
    if (!file) return;
    const preview = showPreview(container, file);
    try {
      if (preview) preview.text.textContent = file.name + ' · جاري الرفع...';
      const url = await uploadFile(file);
      targetInput.value = url;
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));
      if (preview) preview.text.textContent = 'تم رفع الصورة إلى Supabase ✅';
      if (targetInput.id === 'edit_image') {
        const img = document.getElementById('edit_preview');
        if (img) { img.src = url; img.style.display = 'block'; }
      }
      flashMsg('تم رفع صورة المنتج إلى Supabase بنجاح ✅');
    } catch (err) {
      console.error(err);
      if (preview) preview.text.textContent = 'فشل رفع الصورة';
      flashMsg(err?.message || 'فشل رفع الصورة.', true);
    }
  }

  function setup() {
    const addInput = document.getElementById('image_url');
    const editInput = document.getElementById('edit_image');
    if (addInput && !document.getElementById('matAddImageFile')) {
      const fileInput = makeFileInput('matAddImageFile', 'image/*');
      addUploadButton(addInput, fileInput, 'اختيار صورة');
      const holder = addInput.parentElement;
      fileInput.addEventListener('change', () => {
        addFile = fileInput.files?.[0] || null;
        handleFile(addFile, addInput, holder);
      });
      addInput.placeholder = 'اختار صورة من الهاتف أو الحاسوب';
      addInput.type = 'url';
    }
    if (editInput && !document.getElementById('matEditImageFile')) {
      const fileInput = makeFileInput('matEditImageFile', 'image/*');
      addUploadButton(editInput, fileInput, 'اختيار صورة');
      const holder = editInput.parentElement;
      fileInput.addEventListener('change', () => {
        editFile = fileInput.files?.[0] || null;
        handleFile(editFile, editInput, holder);
      });
      editInput.placeholder = 'اختار صورة جديدة من الهاتف أو الحاسوب';
    }
  }

  function boot() {
    setup();
    const observer = new MutationObserver(setup);
    if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
