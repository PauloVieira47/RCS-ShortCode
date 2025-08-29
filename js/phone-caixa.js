
document.addEventListener('DOMContentLoaded', () => {
  const phone = document.querySelector('.telefone-sim[data-os="android"]');
  if (!phone) return;
  const tela = phone.querySelector('.tela');
  if (!tela) return;

  /* 1) Normalizar telas */
  const page0 = tela.querySelector('.android-page');               // TELA 1
  let page1   = tela.querySelector(':scope > .android-mensagens'); // TELA 2
  if (!page1) {
    const nested = page0?.querySelector('.android-mensagens');
    if (nested) {
      nested.classList.add('screen');
      nested.removeAttribute('hidden');
      page0.after(nested);
      page1 = nested;
    }
  }
  if (page0 && !page0.classList.contains('screen')) page0.classList.add('screen');
  if (page1 && !page1.classList.contains('screen')) page1.classList.add('screen');

  let screens = Array.from(tela.children).filter(el => el.classList.contains('screen'));
  if (screens.length < 2) return;

  if (!screens.some(s => s.classList.contains('ativo'))) {
    screens.forEach(s => s.classList.remove('ativo'));
    screens[0].classList.add('ativo');
  }

  /* 2) Navegação (prev/next/dots) */
  const controls = document.querySelector('.preview-controls') || document;
  const prevBtn  = controls.querySelector('.btn-prev');
  const nextBtn  = controls.querySelector('.btn-next');
  const dotsBox  = controls.querySelector('.preview-dots');

  let idx = screens.findIndex(s => s.classList.contains('ativo'));
  if (idx < 0) idx = 0;

  function show(i){
    idx = (i + screens.length) % screens.length;
    screens.forEach((s,k) => s.classList.toggle('ativo', k === idx));
    dots?.forEach((d,k)   => d.classList.toggle('ativo', k === idx));
  }

  prevBtn?.addEventListener('click', () => show(idx - 1));
  nextBtn?.addEventListener('click', () => show(idx + 1));

  let dots = null;
  if (dotsBox) {
    dotsBox.innerHTML = '';
    screens.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot' + (i === idx ? ' ativo' : '');
      b.setAttribute('aria-label', 'Tela ' + (i + 1));
      b.addEventListener('click', () => show(i));
      dotsBox.appendChild(b);
    });
    dots = dotsBox.querySelectorAll('.dot');
  }

  // data-goto="1|2|3"
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      const n = parseInt(el.getAttribute('data-goto'), 10);
      if (!isNaN(n)) show(n - 1);
    });
  });

  // Gatilhos extras dentro do telefone
  function wireNavTriggers(root){
    root.querySelectorAll('.btn-prev').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); show(idx - 1); });
    });
    root.querySelectorAll('.btn-next').forEach(el => {
      el.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); show(idx + 1); });
    });
  }
  wireNavTriggers(phone);

  /* 3) Preencher 1º item da TELA 2 (agente) */
  const itemAg       = phone.querySelector('.android-mensagens .msg-item.agente[data-origem="form"]');
  const nomeEl       = itemAg?.querySelector('.agente-nome');
  const logoImg      = itemAg?.querySelector('img.avatar.logo');
  const userFallback = itemAg?.querySelector('.avatar.user');

  const inputNome = document.getElementById('nomeAgente');
  const inputLogo = document.getElementById('logoQuadrada');

  function setName(name){ const final = (name || '').trim() || 'Short Code'; if (nomeEl) nomeEl.textContent = final; }
  function useLogoFromUrl(url){
    if (!logoImg || !userFallback) return;
    if (url){ logoImg.src = url; logoImg.hidden = false; userFallback.setAttribute('hidden',''); }
    else { logoImg.hidden = true; userFallback.removeAttribute('hidden'); }
  }
  function useLogoFromFile(file){
    if (!file) { useLogoFromUrl(''); return; }
    const reader = new FileReader();
    reader.onload  = e => useLogoFromUrl(e.target.result);
    reader.onerror = () => useLogoFromUrl('');
    reader.readAsDataURL(file);
  }

  const nomeInicial = (inputNome?.value || phone.querySelector('.pv-nome')?.textContent || '').trim();
  setName(nomeInicial);
  if (inputLogo?.files?.[0]) useLogoFromFile(inputLogo.files[0]);
  else useLogoFromUrl(phone.querySelector('.banner .avatar')?.getAttribute('src') || '');

  inputNome?.addEventListener('input', e => setName(e.target.value));
  inputLogo?.addEventListener('change', e => useLogoFromFile(e.target.files?.[0] || null));

  /* 4) Tema */
  const tema = phone.getAttribute('data-tema') || 'escuro';
  phone.querySelectorAll('.android-mensagens .android-app')
       .forEach(el => el.setAttribute('data-tema', tema));

  /* 5) TELA 3 (.android-conversa) – só roda se ela existir */
  const conv = phone.querySelector('.android-conversa');
  if (conv){
    const convNomeEls = conv.querySelectorAll('.conv-nome, .conv-nome-inline');
    const convDesc    = conv.querySelector('.conv-desc');
    const convLogo    = conv.querySelector('img.conv-logo');
    const convUser    = conv.querySelector('.conv-user');
    const inputDesc   = document.getElementById('descricaoAgente');

    function setConvName(name){
      const final = (name || '').trim() || 'Short Code';
      convNomeEls.forEach(el => el.textContent = final);
    }
    function setConvDesc(desc){
      const fallback = 'Plataforma de envio e gestão de SMS em massa via web/API, com suporte e relatórios.';
      if (convDesc) convDesc.textContent = (desc || '').trim() || fallback;
    }
    function useConvLogoUrl(url){
      if (!convLogo || !convUser) return;
      if (url){ convLogo.src = url; convLogo.hidden = false; convUser.setAttribute('hidden',''); }
      else { convLogo.hidden = true; convUser.removeAttribute('hidden'); }
    }

    setConvName(nomeInicial);
    setConvDesc(inputDesc?.value || '');
    if (inputLogo?.files?.[0]) {
      const r = new FileReader();
      r.onload  = e => useConvLogoUrl(e.target.result);
      r.onerror = () => useConvLogoUrl('');
      r.readAsDataURL(inputLogo.files[0]);
    } else {
      useConvLogoUrl(phone.querySelector('.banner .avatar')?.getAttribute('src') || '');
    }

    inputNome?.addEventListener('input',  e => setConvName(e.target.value));
    inputDesc?.addEventListener('input',  e => setConvDesc(e.target.value));
    inputLogo?.addEventListener('change', e => {
      const f = e.target.files?.[0];
      if (!f) return useConvLogoUrl('');
      const r2 = new FileReader();
      r2.onload  = ev => useConvLogoUrl(ev.target.result);
      r2.onerror = () => useConvLogoUrl('');
      r2.readAsDataURL(f);
    });

    phone.querySelectorAll('.android-conversa .android-app')
         .forEach(el => el.setAttribute('data-tema', tema));
  }

  // utilitário
  window.showPreviewScreen = n => show((n - 1) | 0);
});

