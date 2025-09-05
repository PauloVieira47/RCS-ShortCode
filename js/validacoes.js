
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById("form-agente-rcs");
  const btnSalvar = document.getElementById("btnSalvar");
  if (!form) { console.error('[form-agente-rcs] não encontrado.'); return; }

  /* === Campos === */
  const q = id => document.getElementById(id);
  const nomeAgente = q("nomeAgente");
  const descAgente = q("descAgente");
  const telInput = q("telSac");
  const siteInput = q("siteOficial");
  const emailInput = q("emailSac");
  const logoQuadrada = q("logoQuadrada");
  const logoBanner = q("logoBanner");
  const urlPolitica = q("urlPolitica");
  const urlTermos = q("urlTermos");
  const collapseEl = q("linksPrivacidade");
  const cnpjInput = q("cnpjResponsavel");
  const nomeResp = q("nomeResponsavel");

  [nomeAgente, descAgente, telInput, siteInput, emailInput,
    logoQuadrada, logoBanner, urlPolitica, urlTermos, cnpjInput, nomeResp]
    .forEach(el => el?.setAttribute("required", ""));

  /* === Helpers visuais === */
  function ensureFeedback(el) {
    if (!el) return null;
    let fb = el.parentElement?.querySelector('.invalid-feedback');
    if (!fb) {
      fb = document.createElement('div');
      fb.className = 'invalid-feedback';
      el.parentElement?.appendChild(fb);
    }
    return fb;
  }
  function showFieldError(el, msg = 'Campo obrigatório') {
    el.classList.add('is-invalid');
    const fb = ensureFeedback(el);
    if (fb) fb.textContent = msg;
    try { el.setCustomValidity(' '); } catch { }
  }
  function clearFieldError(el) {
    el.classList.remove('is-invalid');
    try { el.setCustomValidity(''); } catch { }
  }

  let tipEl;
  function showErrorTip(el, msg) {
    hideErrorTip();
    const r = el.getBoundingClientRect();
    tipEl = document.createElement('div');
    tipEl.className = 'error-tip';
    tipEl.textContent = msg || 'Corrija este campo';
    document.body.appendChild(tipEl);
    const top = Math.max(10, r.top + window.scrollY - tipEl.offsetHeight - 12);
    const left = Math.min(
      window.scrollX + document.documentElement.clientWidth - tipEl.offsetWidth - 10,
      Math.max(10, r.left + window.scrollX)
    );
    tipEl.style.top = `${top}px`;
    tipEl.style.left = `${left}px`;
    setTimeout(hideErrorTip, 2600);
  }
  function hideErrorTip() { if (tipEl?.parentNode) tipEl.parentNode.removeChild(tipEl); tipEl = null; }

  // Toasts
  const toasts = (() => {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box); }
    function show(type, title, text, timeout = 2200) {
      const el = document.createElement('div');
      el.className = `toastx ${type}`;
      el.innerHTML = `<span class="icon">${type === 'success' ? '✅' : type === 'error' ? '⛔' : 'ℹ️'
        }</span><div><strong>${title || ''}</strong><div>${text || ''}</div></div>`;
      box.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0'; el.style.transform = 'translateY(-6px)';
        setTimeout(() => el.remove(), 200);
      }, timeout);
    }
    return { show };
  })();

  /* === Validadores === */
  function aplicarMascaraTelefone(v) {
    v = (v || '').replace(/\D/g, '');
    if (v.startsWith('0800')) {
      if (v.length <= 7) return v;
      if (v.length <= 10) return v.replace(/^(\d{4})(\d{3})(\d{0,3}).*/, '0800 $2 $3').trim();
      return v.replace(/^(\d{4})(\d{3})(\d{4}).*/, '0800 $2 $3');
    }
    if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    if (v.length > 0) return v.replace(/^(\d{0,2})/, '($1');
    return v;
  }
  const DDD_VALIDOS = new Set(["11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "24", "27", "28", "31", "32", "33", "34", "35", "37", "38", "41", "42", "43", "44", "45", "46", "47", "48", "49", "51", "53", "54", "55", "61", "62", "64", "63", "65", "66", "67", "68", "69", "71", "73", "74", "75", "77", "79", "81", "87", "82", "83", "84", "85", "88", "86", "89", "91", "93", "94", "92", "97", "95", "96", "98", "99"]);
  function seq(s, min = 6) { const a = "01234567890123456789", d = "98765432109876543210"; for (let i = 0; i <= s.length - min; i++) { const w = s.slice(i, i + min); if (a.includes(w) || d.includes(w)) return true; } return false; }
  function rep(s, run = 5) { return new RegExp(String.raw`(\d)\1{${run - 1},}`).test(s); }
  function uniq(s) { return new Set(s.split("")).size; }
  function validarTelefone(v) {
    const d = (v || '').replace(/\D/g, '');
    if (d.startsWith('0800')) {
      const sub = d.slice(4);
      if (!/^\d{6,7}$/.test(sub)) return false;
      if (rep(sub, 5) || seq(sub, 6) || uniq(sub) < 3) return false;
      return true;
    }
    if (d.length === 11) {
      const ddd = d.slice(0, 2), assin = d.slice(2);
      if (!DDD_VALIDOS.has(ddd) || assin[0] !== '9') return false;
      if (rep(assin, 5) || seq(assin, 6) || uniq(assin) < 3) return false;
      return true;
    }
    if (d.length === 10) {
      const ddd = d.slice(0, 2), assin = d.slice(2);
      if (!DDD_VALIDOS.has(ddd) || !/^[2-5]/.test(assin)) return false;
      if (rep(assin, 5) || seq(assin, 6) || uniq(assin) < 3) return false;
      return true;
    }
    return false;
  }
  function validarEmailLower(v) { return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test((v || '').trim()); }

  function ensureScheme(v) { v = (v || '').trim(); if (v && !/^https?:\/\//i.test(v)) v = 'https://' + v; return v; }
  function isValidUrlStrict(v) {
    if (!v) return false;
    try {
      const u = new URL(ensureScheme(v));
      if (!/^https?:$/.test(u.protocol)) return false;
      const host = u.hostname;
      if (host === 'localhost') return true;
      if (!/^[a-z0-9.-]+$/i.test(host)) return false;
      const parts = host.split('.');
      if (parts.length < 2 || parts.at(-1).length < 2) return false;
      return true;
    } catch { return false; }
  }
  function validarUrlInput(input) {
    if (!input) return true;
    input.value = ensureScheme(input.value);
    const ok = isValidUrlStrict(input.value);
    ok ? clearFieldError(input) : showFieldError(input, 'URL inválida');
    return ok;
  }

  // CNPJ
  function validarCNPJ(cnpj) {
    cnpj = (cnpj || '').replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let soma = 0, pos = 5; for (let i = 0; i < 12; i++) { soma += Number(cnpj[i]) * pos; pos = (pos === 2 ? 9 : pos - 1); }
    const d1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (d1 !== Number(cnpj[12])) return false;
    soma = 0; pos = 6; for (let i = 0; i < 13; i++) { soma += Number(cnpj[i]) * pos; pos = (pos === 2 ? 9 : pos - 1); }
    const d2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return d2 === Number(cnpj[13]);
  }
  function maskCNPJ(v) {
    v = (v || '').replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    return v;
  }

  /* === Listeners campo a campo (UX) === */
  function validarObrigatorio(campo, msg = 'Campo obrigatório') {
    if (!campo) return;
    campo.addEventListener('blur', () => {
      const vazio = campo.type === 'file'
        ? !(campo.files && campo.files.length)
        : !String(campo.value || '').trim();
      vazio ? showFieldError(campo, msg) : clearFieldError(campo);
    });
    campo.addEventListener('input', () => clearFieldError(campo));
  }
  [nomeAgente, descAgente, urlPolitica, urlTermos, nomeResp].forEach(el => validarObrigatorio(el));

  // Tel
  if (telInput) {
    telInput.addEventListener('input', () => telInput.value = aplicarMascaraTelefone(telInput.value));
    telInput.addEventListener('blur', () => {
      validarTelefone(telInput.value) ? clearFieldError(telInput) : showFieldError(telInput, 'Digite um número válido (fixo, celular ou 0800).');
    });
  }
  // E-mail
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const before = emailInput.value, lower = before.toLowerCase();
      if (before !== lower) { emailInput.value = lower; try { const p = emailInput.selectionStart; emailInput.setSelectionRange(p, p); } catch { } }
    });
    emailInput.addEventListener('blur', () => {
      validarEmailLower(emailInput.value) ? clearFieldError(emailInput) : showFieldError(emailInput, 'E-mail inválido');
    });
  }
  // URLs
  [siteInput, urlPolitica, urlTermos].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('blur', () => validarUrlInput(inp));
    inp.addEventListener('input', () => clearFieldError(inp));
  });
  // Arquivos
  function validarArquivoObrigatorio(input) {
    const ok = input?.files && input.files.length > 0;
    ok ? clearFieldError(input) : showFieldError(input, 'Campo obrigatório');
    return ok;
  }
  [logoQuadrada, logoBanner].forEach(inp => {
    inp?.addEventListener('change', () => validarArquivoObrigatorio(inp));
    inp?.addEventListener('blur', () => validarArquivoObrigatorio(inp));
  });
  // CNPJ + Nome responsável (podem estar fora do form, mas validamos aqui)
  if (cnpjInput) {
    cnpjInput.addEventListener('input', () => cnpjInput.value = maskCNPJ(cnpjInput.value));
    cnpjInput.addEventListener('blur', () => {
      validarCNPJ(cnpjInput.value) ? clearFieldError(cnpjInput) : showFieldError(cnpjInput, 'CNPJ inválido');
    });
  }
  if (nomeResp) {
    nomeResp.addEventListener('blur', () => {
      const ok = !!String(nomeResp.value || '').trim();
      ok ? clearFieldError(nomeResp) : showFieldError(nomeResp, 'Informe o nome do responsável');
    });
    nomeResp.addEventListener('input', () => clearFieldError(nomeResp));
  }

  function abrirCollapseSePrecisar() {
    const temErro = (urlPolitica && urlPolitica.classList.contains('is-invalid')) ||
      (urlTermos && urlTermos.classList.contains('is-invalid'));
    if (temErro && collapseEl) collapseEl.classList.add('show');
  }
  function focarPrimeiroInvalido() {
    const primeiro = form.querySelector('.is-invalid') || form.querySelector(':invalid');
    if (!primeiro) return;
    primeiro.focus({ preventScroll: true });
    primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return primeiro;
  }


form.addEventListener('submit', (e) => {
  hideErrorTip();

  // dispara blur para pintar erros abaixo dos campos
  form.querySelectorAll('input, textarea, select')
      .forEach(el => el.dispatchEvent(new Event('blur')));

  const telOk  = telInput ? validarTelefone(telInput.value) : true;
  if (telInput && !telOk) showFieldError(telInput, 'Telefone inválido');

  const siteOk = validarUrlInput(siteInput);
  const polOk  = validarUrlInput(urlPolitica);
  const termOk = validarUrlInput(urlTermos);
  const logoOk = validarArquivoObrigatorio(logoQuadrada);
  const bannOk = validarArquivoObrigatorio(logoBanner);
  const cnpjOk = cnpjInput ? validarCNPJ(cnpjInput.value) : true;
  if (cnpjInput && !cnpjOk) showFieldError(cnpjInput, 'CNPJ inválido');

  const nomeOk = nomeResp ? !!String(nomeResp.value||'').trim() : true;
  if (nomeResp && !nomeOk) showFieldError(nomeResp, 'Informe o nome do responsável');

  const tudoOk = form.checkValidity() && telOk && siteOk && polOk && termOk && logoOk && bannOk && cnpjOk && nomeOk;

  if (!tudoOk) {
    e.preventDefault();
    e.stopPropagation();
    abrirCollapseSePrecisar();

    toasts.show('error', 'Ops, falta corrigir', 'Revise os campos destacados.');
    const first = focarPrimeiroInvalido();
    if (first) {
      const msg = first.parentElement?.querySelector('.invalid-feedback')?.textContent || 'Corrija este campo';
      showErrorTip(first, msg);
    }
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  toasts.show('success', 'Tudo certo!', 'Salvando suas informações…', 3000);
  if (btnSalvar) btnSalvar.disabled = true;

  setTimeout(() => {
  window.location.href = 'index.html';
}, 3000);
});

});


