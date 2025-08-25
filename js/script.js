
(() => {
  const telSim = document.querySelector('.telefone-sim');
  if (!telSim) return;

  // ===== HORA =====
  function atualizaHora(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    document
      .querySelectorAll('.status-bar .hora-ao-vivo, .status-bar .lado-centro, .status-bar .lado-centro.ios')
      .forEach(el => el.textContent = `${hh}:${mm}`);
  }
  atualizaHora();
  setInterval(atualizaHora, 1000);

  // ===== ABAS / PAINÉIS =====
  const abaInfos    = document.querySelector('.aba-infos');
  const abaOpcoes   = document.querySelector('.aba-opcoes');
  const painelInfos = document.querySelector('.painel-infos');
  const painelOpcoes= document.querySelector('.painel-opcoes');

  window.__simSetTab = function setTab(tab){
    const isAndroid = (telSim.dataset.os || 'android') === 'android';
    const irOpcoes  = (tab === 'opcoes') && isAndroid;
    abaInfos && abaInfos.classList.toggle('ativa', !irOpcoes);
    abaOpcoes && abaOpcoes.classList.toggle('ativa', !!irOpcoes);
    if (painelInfos)  painelInfos.hidden  = irOpcoes;
    if (painelOpcoes) painelOpcoes.hidden = !irOpcoes;
  };

  abaInfos  && abaInfos.addEventListener('click',  () => window.__simSetTab('infos'));
  abaOpcoes && abaOpcoes.addEventListener('click', () => window.__simSetTab('opcoes'));

  // ===== POLÍTICA / TERMOS =====
  const urlPolitica = document.getElementById('urlPolitica');
  const urlTermos   = document.getElementById('urlTermos');
  const liPolitica  = document.querySelector('.opt-politica');
  const liTermos    = document.querySelector('.opt-termos');

  function syncOptionsVisibility() {
    const hasPolitica = !!(urlPolitica && urlPolitica.value.trim());
    const hasTermos   = !!(urlTermos   && urlTermos.value.trim());
    if (liPolitica) liPolitica.hidden = !hasPolitica;
    if (liTermos)   liTermos.hidden   = !hasTermos;
  }
  [urlPolitica, urlTermos].forEach(el => el && el.addEventListener('input', syncOptionsVisibility));
  syncOptionsVisibility();

  // ===== COLLAPSE (Bootstrap) -> alterna aba =====
  const btnLinks =
    document.getElementById('btnAdicionarLinks') ||
    document.querySelector('[data-bs-target="#linksPrivacidade"]');
  const colLinks = document.getElementById('linksPrivacidade');

  function syncByCollapse() {
    const aberto = colLinks && (
      colLinks.classList.contains('show') ||
      (btnLinks && btnLinks.getAttribute('aria-expanded') === 'true')
    );
    window.__simSetTab(aberto ? 'opcoes' : 'infos');
  }
  if (colLinks) {
    colLinks.addEventListener('shown.bs.collapse',  syncByCollapse);
    colLinks.addEventListener('hidden.bs.collapse', syncByCollapse);
  }
  if (btnLinks) btnLinks.addEventListener('click', () => setTimeout(syncByCollapse, 150));
  syncByCollapse();

  // ===== TEMA =====
  const chkTema = document.getElementById('sim-toggle-tema');
  function aplicarTema(isEscuro){
    telSim.setAttribute('data-tema', isEscuro ? 'escuro' : 'claro');
    try { localStorage.setItem('sim_tema', isEscuro ? 'escuro' : 'claro'); } catch(e){}
  }
  (function initTema(){
    let salvo = null;
    try { salvo = localStorage.getItem('sim_tema'); } catch(e){}
    const usarEscuro = salvo ? (salvo === 'escuro') : (chkTema?.checked || false);
    if (chkTema) chkTema.checked = usarEscuro;
    aplicarTema(usarEscuro);
  })();
  chkTema && chkTema.addEventListener('change', () => aplicarTema(chkTema.checked));

  // ===== SISTEMA (Android / iOS) =====
  const rAndroid = document.getElementById('sim-os-android');
  const rIos     = document.getElementById('sim-os-ios');

  function aplicarOS(){
    const os = (rIos && rIos.checked) ? 'ios' : 'android';
    telSim.setAttribute('data-os', os);

    const pgAndroid = telSim.querySelector('.android-page');
    const pgIos     = telSim.querySelector('.ios-page');
    if (pgAndroid) pgAndroid.hidden = (os === 'ios');
    if (pgIos)     pgIos.hidden     = (os !== 'ios');

    if (os === 'ios') window.__simSetTab('infos');
    else              syncByCollapse();
  }
  if (rAndroid) rAndroid.addEventListener('change', aplicarOS);
  if (rIos)     rIos.addEventListener('change', aplicarOS);
  aplicarOS(); // << inicial

  // ===== HELPERS / FALLBACKS =====
  function formatTelBR(v){
    const d = v.replace(/\D+/g,'');
    if (d.length <= 10){
      return d.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (m,a,b,c)=>
        (a?`(${a}`:'') + (a.length===2?') ':'') + b + (c?`-${c}`:'')
      ).trim();
    }
    return d.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, (m,a,b,c)=>
      (a?`(${a}`:'') + (a.length===2?') ':'') + b + (c?`-${c}`:'')
    ).trim();
  }

  const FALLBACKS = {
    nome:  document.querySelector('.pv-nome')?.textContent || '',
    desc:  document.querySelector('.pv-descricao')?.textContent || '',
    tel:   document.querySelector('.pv-telefone')?.textContent || '',
    site:  document.querySelector('.pv-site')?.textContent || '',
    email: document.querySelector('.pv-email')?.textContent || '',
    oper:  document.querySelector('.pv-operadora')?.textContent || 'Verificado por Vivo'
  };

  function applyToPv(selector, value){
    document.querySelectorAll(selector).forEach(el => {
      if (el.tagName === 'A'){
        if (el.classList.contains('pv-site')){
          const clean = (value||'').replace(/^https?:\/\//,'');
          el.textContent = clean || '';
          el.href = value ? (value.startsWith('http') ? value : `https://${clean}`) : '#';
        } else if (el.classList.contains('pv-telefone')){
          const numeros = (value||'').replace(/\D/g,'');
          el.textContent = value || '';
          el.href = numeros ? `tel:${numeros}` : 'tel:';
        } else if (el.classList.contains('pv-email')){
          el.textContent = value || '';
          el.href = value ? `mailto:${value}` : 'mailto:';
        } else {
          el.textContent = value || '';
        }
      } else {
        el.textContent = value || '';
      }
    });
  }

  function bindComFallback(srcIdList, targetSel, fallback, formatter){
    const ids = Array.isArray(srcIdList) ? srcIdList : [srcIdList];
    const src = ids.map(id => document.getElementById(id)).find(Boolean);
    if (!src) { applyToPv(targetSel, fallback); return; }
    const apply = () => {
      const raw = (src.value || '').trim();
      const val = raw ? (formatter ? formatter(raw) : raw) : fallback;
      applyToPv(targetSel, val);
    };
    src.addEventListener('input', apply);
    apply();
  }

  bindComFallback(['nomeAgente'],                 '.pv-nome',       FALLBACKS.nome);
  bindComFallback(['descricaoAgente','descAgente'], '.pv-descricao', FALLBACKS.desc);
  bindComFallback(['telSac','telefoneAgente'],     '.pv-telefone',   FALLBACKS.tel,  formatTelBR);
  bindComFallback(['siteOficial','siteAgente'],    '.pv-site',       FALLBACKS.site);
  bindComFallback(['emailSac','emailAgente'],      '.pv-email',      FALLBACKS.email);
  bindComFallback(['operadoraAgente'],             '.pv-operadora',  FALLBACKS.oper);

  // ===== IMAGENS (logo + banner) =====
  const avatarImg    = document.querySelector('.avatar'); // Android
  const iosLogoImgs  = Array.from(document.querySelectorAll('.ios-logo, .ios-appicon')); // iOS (pode ter 1 ou 2)
  const bannerImg    = document.querySelector('.banner-img');
  const bannerFake   = document.querySelector('.banner-fake');

  const DEFAULT_AVATAR  = avatarImg?.getAttribute('src') || '';
  const DEFAULT_IOSLOGO = iosLogoImgs[0]?.getAttribute('src') || '';

  function previewImagem(input, targetImg, onShow, onHide){
    if (!input || !targetImg) return;
    const file = input.files && input.files[0];
    if (file){
      const url = URL.createObjectURL(file);
      targetImg.src = url;
      targetImg.hidden = false;
      onShow && onShow();
      targetImg.onload = () => URL.revokeObjectURL(url);
    } else {
      if (targetImg === avatarImg && DEFAULT_AVATAR){
        targetImg.src = DEFAULT_AVATAR; targetImg.hidden = false;
      } else if (iosLogoImgs.includes(targetImg) && DEFAULT_IOSLOGO){
        targetImg.src = DEFAULT_IOSLOGO; targetImg.hidden = false;
      } else {
        targetImg.removeAttribute('src'); targetImg.hidden = true;
      }
      onHide && onHide();
    }
  }

  const inpLogo   = document.getElementById('logoQuadrada');
  const inpBanner = document.getElementById('logoBanner');

  if (inpLogo){
    inpLogo.addEventListener('change', () => {
      previewImagem(inpLogo, avatarImg);
      iosLogoImgs.forEach(img => previewImagem(inpLogo, img));
    });
  }
  if (inpBanner){
    inpBanner.addEventListener('change', () => {
      previewImagem(
        inpBanner,
        bannerImg,
        () => { if (bannerFake) bannerFake.style.display = 'none'; },
        () => { if (bannerFake) bannerFake.style.display = ''; }
      );
    });
  }
})();
