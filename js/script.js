
(() => {
  // ---------- HORA ----------
  function atualizaHora(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    document.querySelectorAll('.status-bar .hora-ao-vivo, .status-bar .lado-centro')
      .forEach(el => el.textContent = `${hh}:${mm}`);
  }
  atualizaHora();
  setInterval(atualizaHora, 1000);

  // ---------- ELEMENTOS BASE ----------
  const telSim = document.querySelector('.telefone-sim');
  if (!telSim) return; // nada a fazer sem o simulador

  // ---------- TEMA (claro/escuro) ----------
  const chkTema = document.getElementById('sim-toggle-tema');

  function aplicarTema(isEscuro){
    telSim.setAttribute('data-tema', isEscuro ? 'escuro' : 'claro');
    try { localStorage.setItem('sim_tema', isEscuro ? 'escuro' : 'claro'); } catch(e){}
  }
  // init (restaura do storage; checked = escuro)
  (function initTema(){
    let salvo = null;
    try { salvo = localStorage.getItem('sim_tema'); } catch(e){}
    const usarEscuro = salvo ? (salvo === 'escuro') : (chkTema?.checked || false);
    if (chkTema) chkTema.checked = usarEscuro;
    aplicarTema(usarEscuro);
  })();
  if (chkTema) chkTema.addEventListener('change', () => aplicarTema(chkTema.checked));

  // ---------- OS (android/ios) ----------
  const rAndroid = document.getElementById('sim-os-android');
  const rIos     = document.getElementById('sim-os-ios');

  function aplicarOS(){
    const os = (rIos && rIos.checked) ? 'ios' : 'android';
    telSim.setAttribute('data-os', os);
    // se trocar pra iOS, força voltar pra "Informações" (Opções é Android-only)
    if (os === 'ios') setTab('infos');
  }
  if (rAndroid) rAndroid.addEventListener('change', aplicarOS);
  if (rIos)     rIos.addEventListener('change', aplicarOS);
  aplicarOS();

  // ---------- Helpers ----------
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
    email: document.querySelector('.pv-email')?.textContent || ''
  };

  function bindComFallback(srcId, targetSel, fallback, formatter){
    const src = document.getElementById(srcId);
    if (!src) return;
    const apply = () => {
      const raw = (src.value || '').trim();
      const val = raw ? (formatter ? formatter(raw) : raw) : fallback;
      document.querySelectorAll(targetSel).forEach(el => el.textContent = val);
    };
    src.addEventListener('input', apply);
    apply();
  }

  bindComFallback('nomeAgente', '.pv-nome',      FALLBACKS.nome);
  bindComFallback('descAgente', '.pv-descricao', FALLBACKS.desc);
  bindComFallback('telSac',     '.pv-telefone',  FALLBACKS.tel, formatTelBR);
  bindComFallback('siteOficial','.pv-site',      FALLBACKS.site);
  bindComFallback('emailSac',   '.pv-email',     FALLBACKS.email);

  // ---------- Pré-visualização de imagens ----------
  const avatarImg   = document.querySelector('.avatar');    // Android
  const iosLogoImg  = document.querySelector('.ios-logo');  // iOS
  const bannerImg   = document.querySelector('.banner-img');
  const bannerFake  = document.querySelector('.banner-fake');

  const DEFAULT_AVATAR  = avatarImg?.getAttribute('src')  || '';
  const DEFAULT_IOSLOGO = iosLogoImg?.getAttribute('src') || '';

  function previewImagem(input, targetImg, onShow, onHide){
    if (!input || !targetImg) return;
    const file = input.files && input.files[0];
    if (file){
      const url = URL.createObjectURL(file);
      targetImg.src = url;
      targetImg.hidden = false;
      if (onShow) onShow();
      targetImg.onload = () => URL.revokeObjectURL(url);
    } else {
      if (targetImg === avatarImg && DEFAULT_AVATAR){
        targetImg.src = DEFAULT_AVATAR; targetImg.hidden = false;
      } else if (targetImg === iosLogoImg && DEFAULT_IOSLOGO){
        targetImg.src = DEFAULT_IOSLOGO; targetImg.hidden = false;
      } else {
        targetImg.removeAttribute('src'); targetImg.hidden = true;
      }
      if (onHide) onHide();
    }
  }

  const inpLogo   = document.getElementById('logoQuadrada');
  const inpBanner = document.getElementById('logoBanner');

  if (inpLogo){
    inpLogo.addEventListener('change', () => {
      previewImagem(inpLogo, avatarImg);
      previewImagem(inpLogo, iosLogoImg);
    });
  }
  if (inpBanner){
    inpBanner.addEventListener('change', () => {
      previewImagem(
        inpBanner,
        bannerImg,
        () => { if (bannerFake) bannerFake.style.display = 'none'; },
        () => { if (bannerFake) bannerFake.style.display = '';   }
      );
    });
  }

  // ---------- Tabs/Opções (funções usadas também no Script 2) ----------
  // Torna global no escopo da página:
  window.__simSetTab = function setTab(tab){
    const isAndroid = (telSim.dataset.os || 'android') === 'android';
    const goOpcoes  = (tab === 'opcoes') && isAndroid;

    const abaInfos  = document.querySelector('.aba-infos');
    const abaOpcoes = document.querySelector('.aba-opcoes');
    const pInfos    = document.querySelector('.painel-infos');
    const pOpcoes   = document.querySelector('.painel-opcoes');

    if (abaInfos)  abaInfos.classList.toggle('ativa', !goOpcoes);
    if (abaOpcoes) abaOpcoes.classList.toggle('ativa', !!goOpcoes);
    if (pInfos)    pInfos.hidden  =  goOpcoes;
    if (pOpcoes)   pOpcoes.hidden = !goOpcoes;
  };
})();

