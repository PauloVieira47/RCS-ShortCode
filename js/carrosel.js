(() => {
  // ====== CONFIGURAÇÃO ======
  const INTERVALO_MS = 4000;  
  const DURACAO_SCROLL_MS = 700; 

  const scrollers = document.querySelectorAll('.cards-scroll');
  if (!scrollers.length) return;

  scrollers.forEach(scroller => {
    const cards = scroller.querySelectorAll('.rcs-card');
    if (cards.length < 2) return;

    let timer = null;
    let pausado = false;
    let snapOriginal = getComputedStyle(scroller).scrollSnapType || '';

    function passo() {
      const card = cards[0];
      const w = card.getBoundingClientRect().width;
      const cs = getComputedStyle(scroller);
      const gap = parseFloat(cs.columnGap || cs.gap || '0') || 0;
      return w + gap;
    }

    function indiceAtual() {
      const p = passo();
      return Math.round(scroller.scrollLeft / p);
    }

    function irPara(ind) {
      scroller.style.scrollSnapType = 'none';

      const alvo = ind * passo();
      const inicio = scroller.scrollLeft;
      const delta = alvo - inicio;
      const t0 = performance.now();

      function anima(t) {
        const k = Math.min(1, (t - t0) / DURACAO_SCROLL_MS);
        const ease = 0.5 - Math.cos(Math.PI * k) / 2;
        scroller.scrollLeft = inicio + delta * ease;
        if (k < 1) requestAnimationFrame(anima);
        else {
          scroller.style.scrollSnapType = snapOriginal || 'x mandatory';
        }
      }
      requestAnimationFrame(anima);
    }

    function proximo() {
      if (pausado) return;
      const i = indiceAtual();
      const ultimo = cards.length - 1;
      irPara(i >= ultimo ? 0 : i + 1);
    }

    function start() {
      stop();
      pausado = false;
      timer = setInterval(proximo, INTERVALO_MS);
    }

    function stop() {
      pausado = true;
      if (timer) { clearInterval(timer); timer = null; }
    }

    // ====== PAUSAS EM INTERAÇÃO ======
    scroller.addEventListener('pointerdown', stop, {passive:true});
    scroller.addEventListener('pointerenter', stop, {passive:true});
    window.addEventListener('pointerup', () => { pausado = false; start(); }, {passive:true});
    scroller.addEventListener('pointerleave', () => { pausado = false; start(); }, {passive:true});
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else { pausado = false; start(); }
    });

    scroller.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));

    start();

    // re-sincroniza no resize (mudou largura do card)
    window.addEventListener('resize', () => irPara(indiceAtual()));
  });
})();






(function () {
  const deck = document.getElementById('ios3Carousel');
  if (!deck) return;

  // evita inicializar 2x (se o mesmo script for carregado novamente)
  if (deck.dataset.inited === '1') return;
  deck.dataset.inited = '1';

  const cards  = Array.from(deck.querySelectorAll('.ios3-card'));
  const app    = deck.closest('.ios3-app');
  const dots   = app?.querySelectorAll('.ios3-counter .dot') || [];
  const txt    = app?.querySelector('.ios3-counter-text');
  const screen = deck.closest('.screen'); // .ios3

  // ====== CONFIG ======
  const AUTOPLAY_MS   = 2800; // intervalo do autoplay
  const RESUME_MS     = 5000; // pausa pós-interação
  const TRANSITION_MS = 280;  // mesmo tempo do CSS (.28s)
  const MIN_GAP       = TRANSITION_MS + 120; // throttle p/ evitar “pulo duplo”

  let current = 0;        // começa no 1º (1 de 4)
  let timer = null;       // setInterval do autoplay
  let resumeTimer = null; // setTimeout p/ religar sozinho
  let pausedUntil = 0;    // timestamp
  let lastAdvance = 0;    // p/ throttle entre avanços

  function layout() {
    const n = cards.length;
    cards.forEach((card, i) => {
      const p = (i - current + n) % n;   // posição relativa 0..n-1
      if (p > 3) {
        card.classList.add('hidden');
      } else {
        card.classList.remove('hidden');
        card.style.setProperty('--p', p);
        card.style.setProperty('--pe', p === 0 ? 'auto' : 'none');
      }
    });
    if (txt) txt.textContent = `${current + 1} de ${cards.length}`;
    if (dots.length) dots.forEach((d, i) => d.classList.toggle('on', i === current));
  }

  function safeAdvance(fn) {
    const now = Date.now();
    if (now - lastAdvance < MIN_GAP) return; // throttle: bloqueia avanço duplo
    lastAdvance = now;
    fn();
    layout();
  }

  function next() { safeAdvance(() => { current = (current + 1) % cards.length; }); }
  function prev() { safeAdvance(() => { current = (current - 1 + cards.length) % cards.length; }); }

  // ====== AUTOPLAY ======
  function isScreenActive() { return screen?.classList.contains('ativo'); }
  function stopAutoplay() { if (timer) { clearInterval(timer); timer = null; } }
  function startAutoplay() { if (!timer) timer = setInterval(next, AUTOPLAY_MS); }

  function maybeStartAutoplay() {
    const now = Date.now();
    if (document.hidden || !isScreenActive() || now < pausedUntil) {
      stopAutoplay();
      return;
    }
    startAutoplay();
  }

  function pauseFor(ms = RESUME_MS) {
    stopAutoplay();
    pausedUntil = Date.now() + ms;
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { resumeTimer = null; maybeStartAutoplay(); }, ms + 50);
  }

  // Navegação (se você tiver os botões .ios3-next/.ios3-prev)
  deck.querySelector('.ios3-next')?.addEventListener('click', () => { pauseFor(); next(); });
  deck.querySelector('.ios3-prev')?.addEventListener('click', () => { pauseFor(); prev(); });

  // Clique no card ou no botão "Opções" avança 1
  deck.addEventListener('click', (e) => {
    if (e.target.closest('.ios3-card-pill') || e.target.closest('.ios3-card')) {
      pauseFor(); next();
    }
  });

  // Hover/Touch pausam
  deck.addEventListener('mouseenter', stopAutoplay);
  deck.addEventListener('mouseleave', maybeStartAutoplay);
  deck.addEventListener('touchstart', () => pauseFor());

  // Aba em 2º plano
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay(); else maybeStartAutoplay();
  });

  // Só roda autoplay quando a TELA iOS3 está ativa
  if (screen) {
    new MutationObserver(() => { maybeStartAutoplay(); })
      .observe(screen, { attributes: true, attributeFilter: ['class'] });
  }

  // Inicializa
  layout();
  maybeStartAutoplay();
})();

