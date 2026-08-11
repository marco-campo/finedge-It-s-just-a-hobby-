'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── NAV & TASKBAR CLOCK ── */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  function updateClock() {
    const el = document.getElementById('task-clock');
    if (!el) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }
  setInterval(updateClock, 1000);
  updateClock();

  /* ── REVEAL ON SCROLL ── */
  const rObs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        rObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => rObs.observe(el));

  /* ── COUNTERS ── */
  function animCnt(el) {
    const t = parseInt(el.dataset.t, 10);
    if (isNaN(t)) return;
    const dur = 1800;
    const s0 = performance.now();

    const tick = (n) => {
      const p = Math.min((n - s0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.floor(e * t);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = t;
      }
    };
    requestAnimationFrame(tick);
  }

  const cObs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.counter').forEach(animCnt);
        cObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.c-strip').forEach((el) => cObs.observe(el));

  /* ── TABS ── */
  window.showTab = function(id, btn) {
    document.querySelectorAll('.tp').forEach((p) => p.classList.remove('active'));
    document.querySelectorAll('.tb').forEach((b) => b.classList.remove('active'));

    const targetPanel = document.getElementById('tp-' + id);
    if (targetPanel) targetPanel.classList.add('active');
    if (btn) btn.classList.add('active');

    setTimeout(() => {
      renderAllBars();
      if (id === 'emp') draw3DPie();
      if (id === 'ten') setTimeout(drawChart, 80);
    }, 50);
  };

  /* ══════════════════════════════════════════
     3D INTERACTIVE PIE CHART
  ══════════════════════════════════════════ */
  function draw3DPie() {
    const svg = document.getElementById('pie3d');
    const legend = document.getElementById('pieLegend');
    if (!svg || !legend) return;

    const data = [
      { n: '🍔 Comidas y alimentos', p: 42, c: 'var(--p1, #a855f7)' },
      { n: '🛍️ E-commerce', p: 28, c: 'var(--cy, #22d3ee)' },
      { n: '💈 Estética', p: 18, c: 'var(--gold, #fbbf24)' },
      { n: '📱 Soporte técnico', p: 12, c: 'var(--blue, #60a5fa)' }
    ];

    const cx = 100, cy = 100, r = 80;
    let startAngle = 0;
    let pathsHTML = '';
    let legendHTML = '';

    data.forEach((d) => {
      const angle = (d.p / 100) * 360;
      const endAngle = startAngle + angle;

      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      pathsHTML += `<path class="pie-slice" d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${d.c}" style="color:${d.c}" data-name="${d.n}" data-pct="${d.p}%"></path>`;
      legendHTML += `<div class="pie-leg-item"><div class="pie-leg-dot" style="background:${d.c}; box-shadow:0 0 6px ${d.c}"></div>${d.n} (${d.p}%)</div>`;

      startAngle = endAngle;
    });

    svg.innerHTML = pathsHTML;
    legend.innerHTML = legendHTML;
  }

  /* ══════════════════════════════════════════
     BAR CHARTS DATA
  ══════════════════════════════════════════ */
  const BD = {
    'b-frac': [
      { n: 'Falta de capital de trabajo operativo', p: 54, l: '54%', c: 'bg-r' },
      { n: 'No separar finanzas del negocio', p: 48, l: '48%', c: 'bg-r' },
      { n: 'Sin plan financiero ni proyecciones', p: 41, l: '41%', c: 'bg-or' },
      { n: 'Deudas con crédito informal gota a gota', p: 33, l: '33%', c: 'bg-or' },
      { n: 'Gastos hormiga no controlados', p: 29, l: '29%', c: 'bg-go' },
      { n: 'Desconocimiento del mercado local', p: 22, l: '22%', c: 'bg-b' },
      { n: 'Productos sin diferenciación real', p: 18, l: '18%', c: 'bg-t' }
    ],
    'b-gas1': [
      { n: 'Mercancía y materia prima (45%)', p: 45, l: '$540k', c: 'bg-g' },
      { n: 'Gastos personales / hormiga (30%)', p: 30, l: '$360k', c: 'bg-r' },
      { n: 'Reinversión en el negocio (15%)', p: 15, l: '$180k', c: 'bg-b' },
      { n: 'Ahorro formal o fondo (10%)', p: 10, l: '$120k', c: 'bg-go' }
    ],
    'b-gas2': [
      { n: 'Operación del negocio (50%)', p: 50, l: '$600k', c: 'bg-g' },
      { n: 'Crecimiento y mejoras (30%)', p: 30, l: '$360k', c: 'bg-b' },
      { n: 'Ahorro y emergencias (20%)', p: 20, l: '$240k', c: 'bg-go' }
    ],
    'b-cmp': [
      { n: '🌟 Fondo Emprender SENA', p: 5, l: '$2.0M total', c: 'bg-g' },
      { n: 'Bancóldex jóvenes', p: 14, l: '$2.3M total', c: 'bg-g' },
      { n: 'Microcrédito bancario 18%', p: 24, l: '$2.4M total', c: 'bg-t' },
      { n: 'Crédito de consumo 28%', p: 42, l: '$2.6M total', c: 'bg-go' },
      { n: 'Tarjeta de crédito 32%', p: 52, l: '$2.7M total', c: 'bg-or' },
      { n: '⛔ Gota a gota 240%', p: 95, l: '$7.6M total', c: 'bg-r' }
    ],
    'b-bar': [
      { n: 'No tengo historial crediticio', p: 62, l: '62%', c: 'bg-r' },
      { n: 'No entiendo los requisitos del banco', p: 54, l: '54%', c: 'bg-or' },
      { n: 'El trámite es muy complicado', p: 48, l: '48%', c: 'bg-or' },
      { n: 'No tengo codeudor ni aval', p: 41, l: '41%', c: 'bg-go' },
      { n: 'Montos bancarios muy altos para mí', p: 35, l: '35%', c: 'bg-go' },
      { n: 'No confío en los bancos', p: 27, l: '27%', c: 'bg-b' }
    ],
    'b-ciu': [
      { n: 'Bogotá D.C.', p: 92, l: '48.200 neg.', c: 'bg-g' },
      { n: 'Medellín (Valle Aburrá)', p: 75, l: '28.600 neg.', c: 'bg-g' },
      { n: 'Cali y área metropolitana', p: 60, l: '21.400 neg.', c: 'bg-b' },
      { n: 'Barranquilla y Soledad', p: 44, l: '14.200 neg.', c: 'bg-b' },
      { n: 'Bucaramanga y área', p: 32, l: '9.800 neg.', c: 'bg-go' },
      { n: 'Caucasia / Bajo Cauca', p: 12, l: '2.100 neg.', c: 'bg-or' }
    ],
    'b-ing': [
      { n: 'Bogotá D.C.', p: 88, l: '$2.200.000', c: 'bg-g' },
      { n: 'Medellín', p: 72, l: '$1.800.000', c: 'bg-g' },
      { n: 'Cali', p: 58, l: '$1.450.000', c: 'bg-b' },
      { n: 'Barranquilla', p: 48, l: '$1.200.000', c: 'bg-b' },
      { n: 'Caucasia / Bajo Cauca', p: 35, l: '$875.000', c: 'bg-or' }
    ],
    'b-con': [
      { n: 'Ahorro básico', p: 72, l: '7.2/10', c: 'bg-g' },
      { n: 'Presupuesto personal', p: 58, l: '5.8/10', c: 'bg-b' },
      { n: 'Interés simple y compuesto', p: 41, l: '4.1/10', c: 'bg-go' },
      { n: 'Cómo funciona el crédito', p: 38, l: '3.8/10', c: 'bg-or' },
      { n: 'Inversión y portafolios', p: 18, l: '1.8/10', c: 'bg-r' },
      { n: 'Punto de equilibrio del negocio', p: 15, l: '1.5/10', c: 'bg-r' }
    ]
  };

  function renderBars(id, data) {
    const c = document.getElementById(id);
    if (!c) return;

    c.innerHTML = data.map((d, i) => `
      <div class="bar-item">
        <div class="bar-hd">
          <span class="bar-name">${d.n}</span>
          <div class="bar-right">
            <span class="bar-chip">${d.l}</span>
            <span class="bar-pct">${d.p}%</span>
          </div>
        </div>
        <div class="bar-track">
          <div class="bar-fill ${d.c}" id="bf-${id}-${i}"></div>
        </div>
      </div>`).join('');

    setTimeout(() => {
      data.forEach((d, i) => {
        const el = document.getElementById(`bf-${id}-${i}`);
        if (el) el.style.width = d.p + '%';
      });
    }, 90);
  }

  function renderAllBars() {
    Object.entries(BD).forEach(([id, data]) => {
      if (document.getElementById(id)) renderBars(id, data);
    });
  }

  /* ── LINE CHART ── */
  function drawChart() {
    const cv = document.getElementById('lineChart');
    if (!cv || !cv.parentElement) return;

    const ctx = cv.getContext('2d');
    const W = cv.parentElement.clientWidth - 48;
    if (W <= 0) return;

    cv.width = W;
    cv.height = 240;

    const yrs = ['2018', '2019', '2020', '2021', '2022', '2023', '2024*'];
    const sena = [18, 24, 22, 31, 38, 47, 58];
    const noFm = [42, 48, 45, 52, 60, 72, 78];
    const tot = [60, 72, 67, 83, 98, 119, 136];
    const dig = [8, 12, 28, 40, 54, 72, 89];

    const pad = { t: 24, r: 28, b: 40, l: 52 };
    const cW = W - pad.l - pad.r;
    const cH = 240 - pad.t - pad.b;
    const mn = 0;
    const mx = 160;

    const xP = (i) => pad.l + i * (cW / (yrs.length - 1));
    const yP = (v) => pad.t + cH - ((v - mn) / (mx - mn)) * cH;

    ctx.clearRect(0, 0, W, 240);

    // Ejes horizontales
    ctx.strokeStyle = 'rgba(147,51,234,.06)';
    ctx.lineWidth = 1;
    [0, 40, 80, 120, 160].forEach((v) => {
      ctx.beginPath();
      ctx.moveTo(pad.l, yP(v));
      ctx.lineTo(pad.l + cW, yP(v));
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,.22)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(v + 'k', pad.l - 7, yP(v) + 4);
    });

    // Líneas verticales de guía
    ctx.strokeStyle = 'rgba(147,51,234,.03)';
    yrs.forEach((_, i) => {
      ctx.beginPath();
      ctx.moveTo(xP(i), pad.t);
      ctx.lineTo(xP(i), pad.t + cH);
      ctx.stroke();
    });

    // Etiquetas del eje X
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    yrs.forEach((y, i) => ctx.fillText(y, xP(i), 240 - 10));

    function drawLine(data, color, fill, glow) {
      ctx.save();
      if (fill) {
        const fg = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
        fg.addColorStop(0, fill);
        fg.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(xP(0), yP(data[0]));
        data.forEach((v, i) => ctx.lineTo(xP(i), yP(v)));
        ctx.lineTo(xP(data.length - 1), pad.t + cH);
        ctx.lineTo(xP(0), pad.t + cH);
        ctx.closePath();
        ctx.fillStyle = fg;
        ctx.fill();
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = glow ? 3 : 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      if (glow) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
      }

      ctx.beginPath();
      data.forEach((v, i) => (i === 0 ? ctx.moveTo(xP(i), yP(v)) : ctx.lineTo(xP(i), yP(v))));
      ctx.stroke();
      ctx.shadowBlur = 0;

      data.forEach((v, i) => {
        if (glow) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
        }
        ctx.beginPath();
        ctx.arc(xP(i), yP(v), 4.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      ctx.restore();
    }

    drawLine(dig, 'rgba(34,211,238,.85)', 'rgba(34,211,238,.06)', false);
    drawLine(noFm, '#60a5fa', 'rgba(96,165,250,.06)', false);
    drawLine(sena, '#a855f7', 'rgba(168,85,247,.1)', true);
    drawLine(tot, '#fbbf24', null, false);
  }

  /* ── HEATMAP ── */
  function buildHeatmap() {
    const el = document.getElementById('heatmap');
    if (!el) return;

    const weeks = Array.from({ length: 52 }, (_, i) => {
      if (i < 4) return 4;
      if (i < 10) return 3;
      if (i < 18) return 2;
      if (i < 29) return 0;
      if (i < 34) return 1;
      if (i < 43) return 3;
      return 1;
    });

    el.innerHTML = weeks.map((h, i) =>
      `<div class="h-cell h${h}" title="Sem. ${i + 1}: ${['<5%', '15%', '35%', '60%', '85%'][h]} ahorradores">W${i + 1}</div>`
    ).join('');
  }

  /* ── OBSERVERS & EVENTS ── */
  const bObs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        renderAllBars();
        draw3DPie();
        bObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  const statsEl = document.getElementById('stats');
  if (statsEl) bObs.observe(statsEl);

  const cvEl = document.getElementById('lineChart');
  if (cvEl && cvEl.parentElement) {
    const chObs = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          drawChart();
          chObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    chObs.observe(cvEl.parentElement);
  }

  // Evento resize responsivo
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drawChart();
    }, 150);
  });

  /* ── INICIALIZACIÓN ── */
  renderAllBars();
  draw3DPie();
  buildHeatmap();
});