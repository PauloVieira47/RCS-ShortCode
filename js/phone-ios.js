
(() => {
  const phone      = document.querySelector('.telefone-sim');             // toggle data-os
  const iosStack   = document.querySelector('.stack-ios');                // telas iOS
  const ctrlsIOS   = document.querySelector('.preview-controls-ios');     // botoes iOS (fora)
  const ctrlsAND   = document.querySelector('.preview-controls');         // botoes Android (fora)
  if (!phone || !iosStack || !ctrlsIOS) return;

  const screens    = [...iosStack.querySelectorAll('.screen')];
  const dotsBox    = ctrlsIOS.querySelector('.preview-dots-i');

  function paintDots(active){
    dotsBox.innerHTML = screens.map((_,i)=>`<span class="${i===active?'on':''}"></span>`).join('');
  }
  function setActive(idx){
    const i = Math.max(0, Math.min(screens.length-1, idx));
    screens.forEach(s => s.classList.remove('ativo'));
    screens[i].classList.add('ativo');
    current = i;
    paintDots(i);
  }

  // começa na que tiver .ativo; se não houver, abre a 2 (lista)
  let current = screens.findIndex(s => s.classList.contains('ativo'));
  if (current < 0) current = 1;
  paintDots(current);

  // cliques nas setas e nos pontinhos
  ctrlsIOS.addEventListener('click', (e)=>{
    if (e.target.closest('.btn-prev-i')) { setActive(current - 1); return; }
    if (e.target.closest('.btn-next-i')) { setActive(current + 1); return; }
    const i = [...dotsBox.children].indexOf(e.target);
    if (i >= 0) setActive(i);
  });

  // show/hide controles + stack conforme toggle
  function applyOS(){
    const isIOS = (phone.getAttribute('data-os') || '').toLowerCase() === 'ios';
    iosStack.style.display = isIOS ? 'block' : 'none';
    if (ctrlsIOS) ctrlsIOS.style.display = isIOS ? 'flex' : 'none';
    if (ctrlsAND) ctrlsAND.style.display = isIOS ? 'none' : 'flex';
  }
  applyOS();
  new MutationObserver(applyOS).observe(phone, { attributes:true, attributeFilter:['data-os'] });
})();
