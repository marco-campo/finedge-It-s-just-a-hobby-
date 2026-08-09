'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // === SCROLL PROGRESS & NAVBAR ===
  const sp = document.getElementById('sp');
  const nav = document.getElementById('nav');
  if (sp || nav) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (sp && h > 0) sp.style.width = (window.scrollY / h * 100) + '%';
      if (nav) nav.classList.toggle('sc', window.scrollY > 60);
    });
  }

  // === MOBILE MENU ===
  const hbg = document.getElementById('hbg');
  const mm = document.getElementById('mm');
  if (hbg && mm) {
    hbg.addEventListener('click', () => mm.classList.toggle('op'));
  }

  // === SCROLL REVEAL ===
  const revElements = document.querySelectorAll('.rv');
  if (revElements.length > 0) {
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revElements.forEach(el => revObs.observe(el));
  }

  // === COUNTERS ===
  const counterElements = document.querySelectorAll('.counter');
  if (counterElements.length > 0) {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const t = +e.target.dataset.t;
          let c = 0;
          const d = 40;
          const s = t / d;
          const iv = setInterval(() => {
            c += s;
            if (c >= t) { c = t; clearInterval(iv); }
            e.target.textContent = Math.round(c);
          }, 30);
          cObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counterElements.forEach(el => cObs.observe(el));
  }

  // === FORMAT COP ===
  function fCOP(n) {
    return '$' + Math.round(n || 0).toLocaleString('es-CO');
  }

  // === TAB SWITCHING ===
  window.switchTab = function(id, btn) {
    document.querySelectorAll('.sbp').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.stab').forEach(b => b.classList.remove('on'));
    const targetPanel = document.getElementById(id);
    if (targetPanel) targetPanel.classList.add('on');
    if (btn) btn.classList.add('on');
  };

  // === GASTOS STATE ===
  let gastos = [
    { name: 'Arriendo', cat: 'fijo', val: 850000 },
    { name: 'Alimentación', cat: 'variable', val: 450000 },
    { name: 'Transporte', cat: 'fijo', val: 180000 },
    { name: 'Servicios públicos', cat: 'fijo', val: 120000 }
  ];

  window.addGasto = function() {
    const etName = document.getElementById('etName');
    const etCat = document.getElementById('etCat');
    const etVal = document.getElementById('etVal');
    if (!etName || !etCat || !etVal) return;

    const n = etName.value.trim();
    const c = etCat.value;
    const v = parseFloat(etVal.value);

    if (!n || isNaN(v) || v <= 0) return;

    gastos.push({ name: n, cat: c, val: v });
    etName.value = '';
    etVal.value = '';
    renderGastos();
    calcular();
  };

  window.delGasto = function(i) {
    gastos.splice(i, 1);
    renderGastos();
    calcular();
  };

  function renderGastos() {
    const list = document.getElementById('etList');
    const totalGastos = gastos.reduce((s, g) => s + g.val, 0);
    const totalFijos = gastos.filter(g => g.cat === 'fijo').reduce((s, g) => s + g.val, 0);
    const totalVars = gastos.filter(g => g.cat === 'variable').reduce((s, g) => s + g.val, 0);
    const nFijos = gastos.filter(g => g.cat === 'fijo').length;
    const nVars = gastos.filter(g => g.cat === 'variable').length;

    const etTotal = document.getElementById('etTotal');
    if (etTotal) etTotal.textContent = fCOP(totalGastos);

    if (list) {
      list.innerHTML = gastos.map((g, i) => `
        <div class="et-item">
          <div class="et-left">
            <span class="et-name">${g.name}</span>
            <span class="pill ${g.cat === 'fijo' ? 'po' : 'pt'}" style="font-size:.48rem;padding:1px 5px">${g.cat}</span>
          </div>
          <div class="et-right">
            <span class="et-v">${fCOP(g.val)}</span>
          </div>
          <button class="et-del" onclick="delGasto(${i})" title="Eliminar gasto">✕</button>
        </div>`).join('');
    }

    const catFijoVal = document.getElementById('catFijoVal');
    const catFijoN = document.getElementById('catFijoN');
    const catVarVal = document.getElementById('catVarVal');
    const catVarN = document.getElementById('catVarN');

    if (catFijoVal) catFijoVal.textContent = fCOP(totalFijos);
    if (catFijoN) catFijoN.textContent = nFijos + ' item' + (nFijos !== 1 ? 's' : '');
    if (catVarVal) catVarVal.textContent = fCOP(totalVars);
    if (catVarN) catVarN.textContent = nVars + ' item' + (nVars !== 1 ? 's' : '');

    updateFicheros();
  }

  function updateFicheros() {
    const rIngreso = document.getElementById('rIngreso');
    const ingreso = rIngreso ? +rIngreso.value || 0 : 0;
    const cuota = calcCuota();
    const totalGastos = gastos.reduce((s, g) => s + g.val, 0);
    const libre = ingreso - cuota - totalGastos;
    const pctCuota = ingreso > 0 ? (cuota / ingreso * 100) : 0;
    const pctGastos = ingreso > 0 ? (totalGastos / ingreso * 100) : 0;
    const pctLibre = ingreso > 0 ? Math.max(0, libre / ingreso * 100) : 0;
    const pctComprometido = ingreso > 0 ? ((cuota + totalGastos) / ingreso * 100) : 0;

    const segCuota = document.getElementById('segCuota');
    const segGastos = document.getElementById('segGastos');
    const segLibre = document.getElementById('segLibre');

    if (segCuota) segCuota.style.width = Math.min(pctCuota, 100) + '%';
    if (segGastos) segGastos.style.width = Math.min(pctGastos, 100 - pctCuota) + '%';
    if (segLibre) segLibre.style.width = Math.max(0, Math.min(pctLibre, 100 - pctCuota - pctGastos)) + '%';

    const dValCuota = document.getElementById('dValCuota');
    const dValGastos = document.getElementById('dValGastos');
    const dValLibre = document.getElementById('dValLibre');

    if (dValCuota) dValCuota.textContent = fCOP(cuota);
    if (dValGastos) dValGastos.textContent = fCOP(totalGastos);
    if (dValLibre) {
      dValLibre.textContent = fCOP(Math.max(0, libre));
      dValLibre.style.color = libre > 0 ? 'var(--ok)' : 'var(--red)';
    }

    renderGauge(pctComprometido);

    const el = document.getElementById('gastoInsight');
    const ev = document.getElementById('gastoVal');
    if (el && ev) {
      if (gastos.length > 0) {
        el.textContent = `Cuota + gastos = ${pctComprometido.toFixed(1)}% de tu ingreso. Dinero libre: ${fCOP(libre)}/mes.`;
        ev.textContent = libre > 0 ? fCOP(libre) + '/mes libre' : '⚠️ Balance negativo';
        ev.style.color = libre > 0 ? 'var(--ok)' : 'var(--red)';
      } else {
        el.textContent = 'Agrega tus gastos para ver cuánto dinero libre te queda después de las cuotas del crédito.';
        ev.textContent = '';
      }
    }
  }

  // === GAUGE SVG ===
  function renderGauge(pct) {
    const container = document.getElementById('gaugeSvg');
    if (!container) return;

    const clampedPct = Math.min(pct, 100);
    const r = 36;
    const c = 2 * Math.PI * r;
    const filled = (clampedPct / 100) * c;
    const offset = c - filled;

    let color = 'var(--ok)';
    let statusClass = 'ok';
    let statusText = '✓ Saludable';
    if (pct > 60) { color = 'var(--red)'; statusClass = 'bad'; statusText = '✗ Sobreendeudado'; }
    else if (pct > 40) { color = 'var(--gold)'; statusClass = 'warn'; statusText = '⚠ Ajustado'; }
    else if (pct > 30) { color = 'var(--gold)'; statusClass = 'warn'; statusText = '⚠ Al límite'; }

    container.innerHTML = `
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r="${r}" fill="none" stroke="var(--s3)" stroke-width="8" stroke-linecap="round"/>
        <circle cx="44" cy="44" r="${r}" fill="none" stroke="${color}" stroke-width="8" stroke-dasharray="${filled} ${offset}" stroke-dashoffset="0" transform="rotate(-90 44 44)" stroke-linecap="round" style="transition:stroke-dasharray .6s ease,stroke .3s"/>
        <text x="44" y="42" text-anchor="middle" font-family="var(--mono)" font-size="14" font-weight="700" fill="var(--txt)">${Math.round(clampedPct)}%</text>
        <text x="44" y="54" text-anchor="middle" font-family="var(--mono)" font-size="6" fill="var(--dim)" letter-spacing="0.5">COMPROMETIDO</text>
      </svg>`;

    const gs = document.getElementById('gaugeStatus');
    const gp = document.getElementById('gaugePct');
    if (gs) {
      gs.className = 'gauge-status ' + statusClass;
      gs.textContent = statusText;
    }
    if (gp) {
      gp.textContent = Math.round(clampedPct) + '%';
      gp.style.color = color;
    }
  }

  // === SELECT BANK ===
  window.selectBank = function(el, tasa) {
    document.querySelectorAll('.bk-card').forEach(c => c.classList.remove('on'));
    if (el) el.classList.add('on');
    const rTasa = document.getElementById('rTasa');
    if (rTasa) rTasa.value = tasa;
    calcular();
  };

  // === CALC CUOTA ===
  function calcCuota() {
    const rMonto = document.getElementById('rMonto');
    const rTasa = document.getElementById('rTasa');
    const rPlazo = document.getElementById('rPlazo');

    const P = rMonto ? +rMonto.value || 0 : 0;
    const ea = rTasa ? (+rTasa.value || 0) / 100 : 0;
    const n = rPlazo ? +rPlazo.value || 1 : 1;

    const r = Math.pow(1 + ea, 1 / 12) - 1;
    if (r === 0) return P / n;
    return P * r / (1 - Math.pow(1 + r, -n));
  }

  // === AMORTIZATION DATA ===
  let amortData = [];
  let amortPage = 0;
  const PER_PAGE = 12;

  // === MINI DONUT ===
  function updateDonut(capital, intereses) {
    const total = capital + intereses;
    if (total === 0) return;
    const circ = 2 * Math.PI * 50;
    const capPct = capital / total;
    const intPct = intereses / total;
    const capDash = capPct * circ;
    const intDash = intPct * circ;
    const intOffset = -capDash;

    const donutCap = document.getElementById('donutCap');
    const donutInt = document.getElementById('donutInt');
    if (donutCap) donutCap.setAttribute('stroke-dasharray', capDash + ' ' + (circ - capDash));
    if (donutInt) {
      donutInt.setAttribute('stroke-dasharray', intDash + ' ' + (circ - intDash));
      donutInt.setAttribute('stroke-dashoffset', intOffset);
    }

    const elements = {
      donutPct: Math.round(intPct * 100) + '%',
      donutCapPct: Math.round(capPct * 100) + '%',
      donutIntPct: Math.round(intPct * 100) + '%',
      donutCapVal: fCOP(capital),
      donutIntVal: fCOP(intereses),
      donutCostVal: fCOP(intereses)
    };

    for (const [id, val] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    const donutCapBar = document.getElementById('donutCapBar');
    const donutIntBar = document.getElementById('donutIntBar');
    if (donutCapBar) donutCapBar.style.width = Math.round(capPct * 100) + '%';
    if (donutIntBar) donutIntBar.style.width = Math.round(intPct * 100) + '%';
  }

  // === CALCULAR ===
  window.calcular = function() {
    const rMonto = document.getElementById('rMonto');
    const rTasa = document.getElementById('rTasa');
    const rPlazo = document.getElementById('rPlazo');
    const rIngreso = document.getElementById('rIngreso');

    if (!rMonto || !rTasa || !rPlazo || !rIngreso) return;

    const P = +rMonto.value || 0;
    const ea = (+rTasa.value || 0) / 100;
    const n = +rPlazo.value || 1;
    const ingreso = +rIngreso.value || 1;

    const lMonto = document.getElementById('lMonto');
    const lTasa = document.getElementById('lTasa');
    const lPlazo = document.getElementById('lPlazo');
    const lIngreso = document.getElementById('lIngreso');

    if (lMonto) lMonto.textContent = fCOP(P);
    if (lTasa) lTasa.textContent = rTasa.value + '% E.A.';
    if (lPlazo) lPlazo.textContent = n + ' meses';
    if (lIngreso) lIngreso.textContent = fCOP(ingreso);

    const r = Math.pow(1 + ea, 1 / 12) - 1;
    const cuota = r === 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n));

    amortData = [];
    let saldo = P;
    for (let i = 1; i <= n; i++) {
      const interes = saldo * r;
      const capital = cuota - interes;
      saldo = Math.max(0, saldo - capital);
      amortData.push({ mes: i, cuota, interes, capital, saldo });
    }

    const totalPagado = cuota * n;
    const totalInteres = totalPagado - P;
    const ratio = (cuota / ingreso) * 100;

    const rCuota = document.getElementById('rCuota');
    const rTotal = document.getElementById('rTotal');
    const rInteres = document.getElementById('rInteres');
    const rRatio = document.getElementById('rRatio');

    if (rCuota) rCuota.textContent = fCOP(cuota);
    if (rTotal) rTotal.textContent = fCOP(totalPagado);
    if (rInteres) rInteres.textContent = fCOP(totalInteres);
    if (rRatio) rRatio.textContent = ratio.toFixed(1) + '%';

    const st = document.getElementById('rStatus');
    if (st) {
      if (ratio <= 20) {
        st.className = 'st-pill ok';
        st.textContent = '✓ Cuota cómoda — Ratio ' + ratio.toFixed(1) + '% (ideal < 20%)';
      } else if (ratio <= 30) {
        st.className = 'st-pill warn';
        st.textContent = '⚠ Cuota ajustada — Ratio ' + ratio.toFixed(1) + '% (límite 30%)';
      } else {
        st.className = 'st-pill bad';
        st.textContent = '✗ Cuota riesgosa — Ratio ' + ratio.toFixed(1) + '% (supera 30%)';
      }
    }

    const insightText = document.getElementById('insightText');
    const insightVal = document.getElementById('insightVal');
    const libre = ingreso - cuota;

    if (insightText && insightVal) {
      if (ratio <= 20) {
        insightText.textContent = `Tu cuota representa ${ratio.toFixed(1)}% de tu ingreso. Tienes ${fCOP(libre)} libres al mes. Buena capacidad de pago.`;
        insightVal.textContent = fCOP(libre) + '/mes libre';
        insightVal.style.color = 'var(--ok)';
      } else if (ratio <= 30) {
        insightText.textContent = `Tu cuota es ${ratio.toFixed(1)}% de tu ingreso. Te quedan ${fCOP(libre)} libres. Es ajustado pero viable si controlas gastos.`;
        insightVal.textContent = fCOP(libre) + '/mes libre';
        insightVal.style.color = 'var(--gold)';
      } else {
        insightText.textContent = `¡Cuidado! Tu cuota es ${ratio.toFixed(1)}% de tu ingreso. Solo te quedarían ${fCOP(libre)}. Considera monto menor o plazo más largo.`;
        insightVal.textContent = fCOP(libre) + '/mes libre';
        insightVal.style.color = 'var(--red)';
      }
    }

    updateDonut(P, totalInteres);
    updateFicheros();
    renderChart();
    amortPage = 0;
    renderTable();
  };

  // === RENDER CHART ===
  function renderChart() {
    const chart = document.getElementById('amortChart');
    if (!chart || amortData.length === 0) return;

    const n = amortData.length;
    const step = n <= 24 ? 1 : n <= 60 ? 2 : n <= 120 ? 4 : 6;
    const maxCuota = Math.max(...amortData.map(d => d.cuota));
    let html = '';

    for (let i = 0; i < n; i += step) {
      const d = amortData[i];
      const hK = (d.capital / maxCuota * 100).toFixed(1);
      const hI = (d.interes / maxCuota * 100).toFixed(1);
      html += `<div class="ac-bar"><div class="ac-cap">Mes ${d.mes}: ${fCOP(d.cuota)}</div><div class="ac-k" style="height:${hK}%"></div><div class="ac-i" style="height:${hI}%"></div></div>`;
    }
    chart.innerHTML = html;
  }

  // === RENDER TABLE ===
  function renderTable() {
    const body = document.getElementById('amortBody');
    if (!body) return;

    const start = amortPage * PER_PAGE;
    const slice = amortData.slice(start, start + PER_PAGE);
    body.innerHTML = slice.map(d => `
      <tr>
        <td>${d.mes}</td>
        <td>${fCOP(d.cuota)}</td>
        <td class="ao">${fCOP(d.interes)}</td>
        <td class="ag">${fCOP(d.capital)}</td>
        <td>${fCOP(d.saldo)}</td>
      </tr>`).join('');

    const totalPages = Math.ceil(amortData.length / PER_PAGE);
    const pag = document.getElementById('amortPag');
    if (!pag) return;

    if (totalPages <= 1) { pag.innerHTML = ''; return; }

    let ph = '';
    const maxShow = 5;
    let s = Math.max(0, amortPage - Math.floor(maxShow / 2));
    let e = Math.min(totalPages, s + maxShow);
    s = Math.max(0, e - maxShow);

    if (amortPage > 0) ph += `<button class="apg" onclick="goPage(${amortPage - 1})">‹</button>`;
    for (let i = s; i < e; i++) {
      ph += `<button class="apg${i === amortPage ? ' on' : ''}" onclick="goPage(${i})">${i + 1}</button>`;
    }
    if (amortPage < totalPages - 1) ph += `<button class="apg" onclick="goPage(${amortPage + 1})">›</button>`;
    pag.innerHTML = ph;
  }

  window.goPage = function(p) {
    amortPage = p;
    renderTable();
  };

  // === TYPE CHANGE ===
  const tipoCred = document.getElementById('tipoCred');
  if (tipoCred) {
    tipoCred.addEventListener('change', function() {
      const tasa = +this.value;
      const rTasa = document.getElementById('rTasa');
      if (rTasa) rTasa.value = tasa;

      const plazo = document.getElementById('rPlazo');
      if (plazo) {
        if (tasa <= 14) { plazo.max = 360; plazo.value = Math.min(+plazo.value, 360); }
        else if (tasa <= 16) { plazo.max = 60; plazo.value = Math.min(+plazo.value, 60); }
        else { plazo.max = 84; plazo.value = Math.min(+plazo.value, 84); }
      }
      calcular();
    });
  }

  // === ENTER KEY FOR GASTOS ===
  const etVal = document.getElementById('etVal');
  const etName = document.getElementById('etName');
  if (etVal) {
    etVal.addEventListener('keydown', function(e) { if (e.key === 'Enter') addGasto(); });
  }
  if (etName) {
    etName.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const target = document.getElementById('etVal');
        if (target) target.focus();
      }
    });
  }

  // === INITIALIZATION ===
  renderGastos();
  calcular();
});