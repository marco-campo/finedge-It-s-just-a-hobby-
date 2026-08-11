'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // === NAVBAR ===
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // === REVEAL ON SCROLL ===
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => revObs.observe(el));
  }

  // === FORMAT MONEY (COP) ===
  function fmt(v) {
    const num = parseFloat(v);
    if (isNaN(num)) return '$0';
    return '$' + num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  // === GENERIC BAR RENDERER ===
  function renderBars(containerId, data) {
    const c = document.getElementById(containerId);
    if (!c) return;

    c.innerHTML = data.map((d, i) => `
      <div class="h-bar-row">
        <div class="h-bar-top">
          <span class="h-bar-name">${d.name}</span>
          <span class="h-bar-pct">${d.label || d.pct + '%'}</span>
        </div>
        <div class="h-bar-track">
          <div class="h-bar-fill ${d.cls || 'hb-green'}" id="hb-${containerId}-${i}"></div>
        </div>
      </div>`).join('');

    setTimeout(() => {
      data.forEach((d, i) => {
        const el = document.getElementById(`hb-${containerId}-${i}`);
        if (el) el.style.width = Math.min(Math.max(d.pct, 0), 100) + '%';
      });
    }, 100);
  }

  // === TAB SWITCHING ===
  window.showTab = function(id, btn) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const panel = document.getElementById('tab-' + id);
    if (panel) panel.classList.add('active');
    if (btn) btn.classList.add('active');

    setTimeout(() => {
      if (id === 'punto') window.drawRentabilidad();
      if (id === 'credito') window.renderCrCompara();
    }, 100);
  };

  // === BALANCE 50/30/20 ===
  window.calcBalance = function() {
    const ingEl = document.getElementById('ingresoBalance');
    const fijEl = document.getElementById('gastosFijos');

    const ing = ingEl ? parseFloat(ingEl.value) || 0 : 0;
    const fij = fijEl ? parseFloat(fijEl.value) || 0 : 0;

    const op = ing * 0.5;
    const vari = ing * 0.3;
    const aho = ing * 0.2;
    const margen = ing - fij;

    const updates = {
      resOp: fmt(op),
      resVar: fmt(vari),
      resAhorro: fmt(aho),
      resFijos: fmt(fij),
      legOp: fmt(op),
      legVar: fmt(vari),
      legAhorro: fmt(aho)
    };

    for (const [id, val] of Object.entries(updates)) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    const rm = document.getElementById('resultMain');
    const rf = document.getElementById('resFinal');
    if (rf && ing > 0) {
      rf.textContent = fmt(margen);
      if (rm) rm.className = 'result-main' + (margen < 0 ? ' warn' : '');
    }

    if (ing > 0) {
      const bars = [
        { name: '3 meses', pct: Math.min((aho * 3 / 5000000) * 100, 95), label: fmt(aho * 3), cls: 'hb-green' },
        { name: '6 meses', pct: Math.min((aho * 6 / 5000000) * 100, 95), label: fmt(aho * 6), cls: 'hb-green' },
        { name: '1 año', pct: Math.min((aho * 12 / 5000000) * 100, 95), label: fmt(aho * 12), cls: 'hb-blue' },
        { name: '2 años', pct: Math.min((aho * 24 / 5000000) * 100, 95), label: fmt(aho * 24), cls: 'hb-gold' }
      ];
      renderBars('proyeccionAhorro', bars);
    }
  };

  // === PUNTO DE EQUILIBRIO ===
  window.calcPunto = function() {
    const fijos = parseFloat(document.getElementById('peGastosFijos')?.value) || 0;
    const precio = parseFloat(document.getElementById('pePrecio')?.value) || 0;
    const costo = parseFloat(document.getElementById('peCosto')?.value) || 0;
    const meta = parseFloat(document.getElementById('peMeta')?.value) || 0;

    const margen = precio - costo;
    const peMargen = document.getElementById('peMargen');
    if (peMargen) peMargen.textContent = margen > 0 ? fmt(margen) : '$0';

    if (margen > 0) {
      const pe = Math.ceil(fijos / margen);
      const paraMeta = Math.ceil((fijos + meta) / margen);
      const ingresoReq = paraMeta * precio;
      const diario = Math.ceil(paraMeta / 30);

      const pePuntEq = document.getElementById('pePuntEq');
      const peParaMeta = document.getElementById('peParaMeta');
      const peIngresoReq = document.getElementById('peIngresoReq');
      const peDiario = document.getElementById('peDiario');

      if (pePuntEq) pePuntEq.textContent = pe + ' unidades';
      if (peParaMeta) peParaMeta.textContent = paraMeta + ' unidades';
      if (peIngresoReq) peIngresoReq.textContent = fmt(ingresoReq);
      if (peDiario) peDiario.textContent = diario + ' / día';
    }
    window.drawRentabilidad();
  };

  window.drawRentabilidad = function() {
    const c = document.getElementById('rentabilidadChart');
    if (!c || !c.parentElement) return;

    const ctx = c.getContext('2d');
    const W = c.parentElement.clientWidth || 300;
    c.width = W;
    c.height = 200;

    const fijos = parseFloat(document.getElementById('peGastosFijos')?.value) || 450000;
    const precio = parseFloat(document.getElementById('pePrecio')?.value) || 12000;
    const costo = parseFloat(document.getElementById('peCosto')?.value) || 5000;

    const margen = precio - costo;
    const maxU = margen > 0 ? Math.ceil(fijos / margen) * 2 + 20 : 200;
    const pad = { t: 16, r: 16, b: 28, l: 52 };
    const cW = W - pad.l - pad.r;
    const cH = 200 - pad.t - pad.b;

    const minY = -fijos;
    const maxY = margen > 0 ? maxU * margen - fijos : fijos;

    const xP = u => pad.l + (u / maxU) * cW;
    const yP = v => pad.t + cH - ((v - minY) / (maxY - minY)) * cH;

    ctx.clearRect(0, 0, W, 200);

    // Eje base (0)
    ctx.strokeStyle = 'rgba(147,51,234,.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.l, yP(0));
    ctx.lineTo(pad.l + cW, yP(0));
    ctx.stroke();

    // Línea de utilidad
    ctx.beginPath();
    ctx.moveTo(xP(0), yP(-fijos));
    ctx.lineTo(xP(maxU), yP(maxU * margen - fijos));
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Etiquetas
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0 u.', xP(0), 192);
    ctx.fillText(maxU + ' u.', xP(maxU), 192);

    ctx.fillStyle = 'rgba(239,68,68,.8)';
    ctx.fillText('Pérdida', xP(0) + 35, yP(-fijos / 2));

    ctx.fillStyle = 'rgba(147,51,234,1)';
    ctx.fillText('Ganancia', xP(maxU) - 45, yP((maxU * margen - fijos) / 2));
  };

  // === GASTO HORMIGA ===
  window.calcHormiga = function() {
    const ids = ['hTinto', 'hTransporte', 'hCelular', 'hComida', 'hEntrete', 'hOtros'];
    const vals = ids.map(id => parseFloat(document.getElementById(id)?.value) || 0);

    const total = vals.reduce((a, b) => a + b, 0);
    const mes = total * 30;
    const anio = total * 365;
    const cinco = total * 365 * 5;

    const hDiario = document.getElementById('hDiario');
    const hMes = document.getElementById('hMes');
    const hAnio = document.getElementById('hAnio');
    const hCinco = document.getElementById('hCinco');

    if (hDiario) hDiario.textContent = fmt(total) + ' / día';
    if (hMes) hMes.textContent = fmt(mes) + ' / mes';
    if (hAnio) hAnio.textContent = fmt(anio) + ' / año';
    if (hCinco) hCinco.textContent = fmt(cinco);

    if (total > 0) {
      const bars = [
        { name: 'Por día', pct: Math.min((total / 50000) * 100, 95), label: fmt(total), cls: 'hb-gold' },
        { name: 'Por mes', pct: Math.min((mes / 3000000) * 100, 95), label: fmt(mes), cls: 'hb-orange' },
        { name: 'Por año', pct: Math.min((anio / 15000000) * 100, 95), label: fmt(anio), cls: 'hb-red' },
        { name: 'En 5 años', pct: Math.min((cinco / 50000000) * 100, 95), label: fmt(cinco), cls: 'hb-red' }
      ];
      renderBars('hormigas-comparativa', bars);

      const p = document.getElementById('horPotencial');
      if (p) {
        const items = [
          { ico: '🛒', txt: 'Capital para empezar un negocio de alimentos', val: fmt(anio), ok: anio >= 200000 },
          { ico: '📱', txt: 'Un celular nuevo de gama media', val: '$800.000', ok: anio >= 800000 },
          { ico: '🎓', txt: 'Un curso o capacitación técnica', val: '$500.000', ok: anio >= 500000 },
          { ico: '🏦', txt: 'Fondo de emergencia para 1 mes', val: fmt(mes * 3), ok: anio >= mes * 3 }
        ];

        p.innerHTML = items.map(item => `
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface2, #18181b);border:1px solid ${item.ok ? 'var(--green-line, #22c55e)' : 'var(--border, #27272a)'};border-radius:10px;">
            <span style="font-size:1.1rem;">${item.ico}</span>
            <span style="font-size:.82rem;flex:1;color:var(--white-2, #e4e4e7);">${item.txt}</span>
            <span style="font-size:.85rem;font-weight:700;color:${item.ok ? 'var(--green, #22c55e)' : 'var(--gray, #71717a)'};">${item.ok ? '✓ ' : ''}${item.val}</span>
          </div>`).join('');
      }

      const hPotencial = document.getElementById('hPotencial');
      if (hPotencial) hPotencial.textContent = fmt(anio);
    }
  };

  // === TRACKER DE GASTOS ===
  let gastos = [];
  const cats = {
    operacion: { label: '⚙️ Operación', color: 'green' },
    fijo: { label: '🏠 Fijos', color: 'gold' },
    marketing: { label: '📣 Marketing', color: 'blue' },
    personal: { label: '👤 Personal', color: 'red' },
    ahorro: { label: '🏦 Ahorro', color: 'green' },
    otro: { label: '📦 Otro', color: 'gray' }
  };

  window.addGasto = function() {
    const tDesc = document.getElementById('tDesc');
    const tMonto = document.getElementById('tMonto');
    const tCat = document.getElementById('tCat');

    if (!tDesc || !tMonto || !tCat) return;

    const desc = tDesc.value.trim();
    const monto = parseFloat(tMonto.value) || 0;
    const cat = tCat.value;

    if (!desc || monto <= 0) {
      alert('Por favor completa la descripción y un monto mayor a cero.');
      return;
    }

    gastos.push({ id: Date.now(), desc, monto, cat });
    tDesc.value = '';
    tMonto.value = '';
    renderTracker();
  };

  window.deleteGasto = function(id) {
    gastos = gastos.filter(g => g.id !== id);
    renderTracker();
  };

  window.clearGastos = function() {
    if (confirm('¿Deseas borrar todos los gastos registrados?')) {
      gastos = [];
      renderTracker();
    }
  };

  function renderTracker() {
    const list = document.getElementById('trackerList');
    if (list) {
      if (gastos.length === 0) {
        list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--gray, #a1a1aa);font-size:.84rem;">Aún no hay gastos registrados.<br>¡Empieza añadiendo uno arriba!</div>';
      } else {
        list.innerHTML = gastos.slice().reverse().map(g => `
          <div class="tracker-item">
            <div class="tracker-item-ico">${cats[g.cat]?.label.split(' ')[0] || '📦'}</div>
            <span class="tracker-item-name">${g.desc}</span>
            <span class="tracker-item-amount ${cats[g.cat]?.color || ''}">${fmt(g.monto)}</span>
            <button class="tracker-item-delete" onclick="deleteGasto(${g.id})">✕</button>
          </div>`).join('');
      }
    }

    const total = gastos.reduce((a, g) => a + g.monto, 0);
    const totals = {};
    Object.keys(cats).forEach(k => {
      totals[k] = gastos.filter(g => g.cat === k).reduce((a, g) => a + g.monto, 0);
    });

    const setTotal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = fmt(val);
    };

    setTotal('totalReg', total);
    setTotal('totalOp', totals.operacion);
    setTotal('totalFijo', totals.fijo);
    setTotal('totalMkt', totals.marketing);
    setTotal('totalPers', totals.personal);
    setTotal('totalAho', totals.ahorro);

    if (total > 0) {
      const bars = Object.entries(totals)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
          name: cats[k].label,
          pct: Math.round((v / total) * 100),
          label: fmt(v) + ' (' + Math.round((v / total) * 100) + '%)',
          cls: 'hb-' + cats[k].color
        }));
      renderBars('trackerBars', bars);
    }
  }

  // === CRÉDITO Y COMPARATIVA ===
  window.actualizarTasa = function() {
    const crTipo = document.getElementById('crTipo');
    const crTasa = document.getElementById('crTasa');
    if (crTipo && crTasa) {
      crTasa.value = crTipo.value;
      window.calcCredito();
    }
  };

  window.calcCredito = function() {
    const monto = parseFloat(document.getElementById('crMonto')?.value) || 0;
    const plazo = parseFloat(document.getElementById('crPlazo')?.value) || 0;
    const tasa = parseFloat(document.getElementById('crTasa')?.value) || 0;

    if (monto <= 0 || plazo <= 0 || tasa <= 0) return;

    const r = Math.pow(1 + tasa / 100, 1 / 12) - 1;
    const cuota = monto * (r * Math.pow(1 + r, plazo)) / (Math.pow(1 + r, plazo) - 1);
    const totalPagar = cuota * plazo;
    const intereses = totalPagar - monto;
    const costoPct = (intereses / monto * 100).toFixed(1);

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('crTasaMes', (r * 100).toFixed(2) + '%');
    setTxt('crCuota', fmt(cuota));
    setTxt('crTotal', fmt(totalPagar));
    setTxt('crIntereses', fmt(intereses));
    setTxt('crCostoPct', costoPct + '%');

    const alerta = document.getElementById('crAlerta');
    const alertaTxt = document.getElementById('crAlertaText');
    if (alerta && alertaTxt) {
      if (tasa >= 100) {
        alerta.style.display = 'flex';
        alertaTxt.textContent = `Con una tasa del ${tasa}%, pagarás ${fmt(intereses)} SOLO en intereses sobre un préstamo de ${fmt(monto)}. Evalúa opciones como el Fondo Emprender SENA o crédito bancario formal.`;
      } else {
        alerta.style.display = 'none';
      }
    }
  };

  window.renderCrCompara = function() {
    const monto = 2000000;
    const plazo = 12;
    const tipos = [
      { name: '🌟 Fondo Emprender', tasa: 0, cls: 'hb-green' },
      { name: '🏦 Bancóldex Jóvenes', tasa: 14, cls: 'hb-green' },
      { name: '🏦 Microcrédito bancario', tasa: 18, cls: 'hb-blue' },
      { name: '💳 Crédito consumo', tasa: 28, cls: 'hb-gold' },
      { name: '🟡 Tarjeta crédito', tasa: 32, cls: 'hb-orange' },
      { name: '⛔ Gota a gota', tasa: 240, cls: 'hb-red' }
    ];

    const base = tipos[tipos.length - 1];
    const r2 = Math.pow(1 + base.tasa / 100, 1 / 12) - 1;
    const cMax = monto * (r2 * Math.pow(1 + r2, plazo)) / (Math.pow(1 + r2, plazo) - 1);
    const maxTotal = cMax * plazo;

    const bars = tipos.map(t => {
      let total;
      if (t.tasa === 0) {
        total = monto;
      } else {
        const r = Math.pow(1 + t.tasa / 100, 1 / 12) - 1;
        const cuota = monto * (r * Math.pow(1 + r, plazo)) / (Math.pow(1 + r, plazo) - 1);
        total = cuota * plazo;
      }
      return {
        name: t.name,
        pct: Math.max(Math.round((total / maxTotal) * 100), 5),
        label: fmt(total),
        cls: t.cls
      };
    });

    renderBars('crCompara', bars);
  };

  // === INICIALIZACIÓN ===
  renderTracker();
  window.renderCrCompara();
});