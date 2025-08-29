
    document.querySelectorAll('.android-conversa .cards-scroll').forEach(scroller => {
      let isDown = false, startX = 0, scrollLeft = 0;
      scroller.addEventListener('mousedown', e => {
        isDown = true; startX = e.pageX - scroller.offsetLeft; scrollLeft = scroller.scrollLeft;
      });
      ['mouseleave', 'mouseup'].forEach(ev => scroller.addEventListener(ev, () => isDown = false));
      scroller.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroller.offsetLeft;
        scroller.scrollLeft = scrollLeft - (x - startX);
      });
    });


    document.addEventListener('DOMContentLoaded', () => {
      const small = document.querySelector('.conv-logo.conv-appbar');
      const big = document.querySelector('.center-logo');
      if (!small || !big) return;
      const sync = () => big.src = small.getAttribute('src') || '';
      new MutationObserver(sync).observe(small, { attributes: true, attributeFilter: ['src'] });
      sync();
    });

(() => {
  const scrollers = document.querySelectorAll('.cards-scroll');

  scrollers.forEach(sc => {
    // impede que as imagens virem “draggable” no desktop
    sc.querySelectorAll('img').forEach(img => img.setAttribute('draggable','false'));

    let startX = 0, startY = 0, dragging = false;

    const down = (x, y) => {
      startX = x; startY = y; dragging = false;
      sc.classList.add('is-dragging');
    };
    const move = (x, y) => {
      if (Math.abs(x - startX) > 5 || Math.abs(y - startY) > 5) dragging = true;
    };
    const up = () => {
      sc.classList.remove('is-dragging');
      // solta a flag logo após o mouseup/touchend
      setTimeout(() => dragging = false, 0);
    };

    sc.addEventListener('pointerdown', e => down(e.clientX, e.clientY), {passive:true});
    sc.addEventListener('pointermove',  e => move(e.clientX,  e.clientY),  {passive:true});
    window.addEventListener('pointerup', up, {passive:true});
    window.addEventListener('pointercancel', up, {passive:true});

    // se arrastou, suprime o clique no conteúdo (evita abrir links sem querer)
    sc.addEventListener('click', (e) => {
      if (dragging && !e.target.closest('.card-cta')) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });
})();
