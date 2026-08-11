/* ═══════════════════════════════════
   FINEDGE — JAVASCRIPT (SEGURO)
═══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // Scroll progress
  const sp = document.getElementById('sp');
  if (sp) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      sp.style.width = (window.scrollY / h * 100) + '%';
    });
  }

  // Nav scroll effect
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Hamburger
  const hbg = document.getElementById('hbg');
  const mm = document.getElementById('mm');
  if (hbg && mm) {
    hbg.addEventListener('click', () => {
      mm.classList.toggle('op');
      const spans = hbg.querySelectorAll('span');
      if (mm.classList.contains('op')) {
        spans[0].style.transform = 'rotate(45deg) translate(3px,3px)';
        if (spans[1]) spans[1].style.opacity = '0';
        if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(3px,-3px)';
      } else {
        spans[0].style.transform = '';
        if (spans[1]) spans[1].style.opacity = '';
        if (spans[2]) spans[2].style.transform = '';
      }
    });
  }

  // Tabs
  document.querySelectorAll('.inv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('on'));
      document.querySelectorAll('.inv-panel').forEach(p => p.classList.remove('on'));
      tab.classList.add('on');
      const targetPanel = document.getElementById('panel-' + tab.dataset.tab);
      if (targetPanel) targetPanel.classList.add('on');
    });
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.rv');
  if (revealEls.length > 0) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { 
        if (e.isIntersecting) { 
          e.target.classList.add('in'); 
          revealObs.unobserve(e.target); 
        } 
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => revealObs.observe(el));
  }

  // Counter animation
  const counters = document.querySelectorAll('.counter');
  if (counters.length > 0) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const target = parseInt(el.dataset.t) || 0;
          let current = 0;
          const step = Math.max(1, Math.floor(target / 40));
          const timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current;
          }, 30);
          counterObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObs.observe(c));
  }

  // ═══ COMPARADOR ZOOM CONTROLS ═══
  const compBody = document.getElementById('compBody');
  const zoomCollapse = document.getElementById('zoomCollapse');
  const zoomExpand = document.getElementById('zoomExpand');
  const zoomFullscreen = document.getElementById('zoomFullscreen');
  const compModal = document.getElementById('compModal');
  const compModalClose = document.getElementById('compModalClose');

  let currentZoom = 'normal';

  function updateZoomState(state) {
    if (!compBody) return;
    currentZoom = state;
    compBody.classList.remove('collapsed');
    if (zoomCollapse) zoomCollapse.classList.remove('active');
    if (zoomExpand) zoomExpand.classList.remove('active');

    if (state === 'collapsed') {
      compBody.classList.add('collapsed');
      if (zoomCollapse) zoomCollapse.classList.add('active');
    } else if (state === 'expanded') {
      if (zoomExpand) zoomExpand.classList.add('active');
    }
  }

  if (zoomCollapse) {
    zoomCollapse.addEventListener('click', () => {
      updateZoomState(currentZoom === 'collapsed' ? 'normal' : 'collapsed');
    });
  }

  if (zoomExpand) {
    zoomExpand.addEventListener('click', () => {
      updateZoomState(currentZoom === 'expanded' ? 'normal' : 'expanded');
    });
  }

  if (zoomFullscreen && compModal) {
    zoomFullscreen.addEventListener('click', () => {
      compModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (compModalClose && compModal) {
    compModalClose.addEventListener('click', () => {
      compModal.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  if (compModal) {
    compModal.addEventListener('click', (e) => {
      if (e.target === compModal) {
        compModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && compModal.classList.contains('open')) {
        compModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ═══ COMPARADOR — CARD DE DETALLE POR ACTIVO ═══
  const assetInfo = {
    cdt: {
      icon: '🏦',
      name: 'CDT',
      cat: 'Certificado de Depósito a Término · Renta fija',
      desc: 'Le prestas tu dinero a un banco por un plazo fijo (30, 90, 180 o 360 días) a cambio de una tasa de interés pactada de antemano. No puedes retirarlo antes de tiempo sin penalización, pero está protegido por FOGAFIN hasta $50M si el banco quiebra. Es la puerta de entrada más segura para empezar a invertir.',
      stats: [
        { lbl: 'Rendimiento EAA', val: '8 – 11%' },
        { lbl: 'Riesgo', val: 'Bajo' },
        { lbl: 'Liquidez', val: 'Baja' },
        { lbl: 'Monto mínimo', val: '$50.000' }
      ]
    },
    fondos: {
      icon: '📈',
      name: 'Fondos (FIC)',
      cat: 'Fondo de Inversión Colectiva · Renta mixta',
      desc: 'Un gestor profesional junta el dinero de muchas personas y lo invierte en una canasta diversificada de activos (acciones, bonos, CDTs). Tú compras "participaciones" del fondo, así que diversificas automáticamente sin tener que elegir cada activo por tu cuenta. Puedes entrar y salir con más facilidad que en un CDT.',
      stats: [
        { lbl: 'Rendimiento EAA', val: '10 – 15%' },
        { lbl: 'Riesgo', val: 'Moderado' },
        { lbl: 'Liquidez', val: 'Alta' },
        { lbl: 'Monto mínimo', val: '$20.000' }
      ]
    },
    bonos: {
      icon: '📜',
      name: 'Bonos / TES',
      cat: 'Títulos de Deuda · Renta fija',
      desc: 'Le prestas dinero al gobierno colombiano (TES) o a una empresa grande (bonos corporativos) por un plazo determinado. A cambio recibes pagos periódicos de intereses (cupones) y te devuelven el capital al vencimiento. Rinden más que un CDT, pero si necesitas vender antes de tiempo su precio puede variar.',
      stats: [
        { lbl: 'Rendimiento EAA', val: '9 – 13%' },
        { lbl: 'Riesgo', val: 'Bajo' },
        { lbl: 'Liquidez', val: 'Media' },
        { lbl: 'Monto mínimo', val: '$100.000' }
      ]
    },
    acciones: {
      icon: '📉',
      name: 'Acciones BVC',
      cat: 'Bolsa de Valores de Colombia · Renta variable',
      desc: 'Compras una pequeña parte de una empresa que cotiza en la Bolsa de Valores de Colombia. Ganas si el precio de la acción sube o si la empresa reparte dividendos. Tiene mayor potencial de rentabilidad que la renta fija, pero el precio puede subir y bajar con fuerza en el corto plazo.',
      stats: [
        { lbl: 'Rendimiento EAA', val: '12 – 25%' },
        { lbl: 'Riesgo', val: 'Alto' },
        { lbl: 'Liquidez', val: 'Alta' },
        { lbl: 'Monto mínimo', val: '$50.000' }
      ]
    },
    bitcoin: {
      icon: '₿',
      name: 'Bitcoin',
      cat: 'Criptomoneda',
      desc: 'Una criptomoneda descentralizada que no depende de ningún banco ni gobierno. Su precio puede moverse mucho en pocas horas, tanto al alza como a la baja. Se usa como reserva de valor especulativa; su alto potencial de ganancia viene acompañado de un riesgo igual de alto de pérdida.',
      stats: [
        { lbl: 'Rendimiento', val: 'Variable' },
        { lbl: 'Riesgo', val: 'Extremo' },
        { lbl: 'Liquidez', val: 'Muy alta' },
        { lbl: 'Monto mínimo', val: '$10.000' }
      ]
    },
    ethereum: {
      icon: 'Ξ',
      name: 'Ethereum',
      cat: 'Criptomoneda',
      desc: 'Además de una criptomoneda, es una plataforma que permite crear contratos inteligentes y aplicaciones descentralizadas. Su precio es tan volátil como el de Bitcoin, pero tiene más casos de uso tecnológico detrás, lo que le da otra fuente de demanda además de la especulación.',
      stats: [
        { lbl: 'Rendimiento', val: 'Variable' },
        { lbl: 'Riesgo', val: 'Extremo' },
        { lbl: 'Liquidez', val: 'Muy alta' },
        { lbl: 'Monto mínimo', val: '$10.000' }
      ]
    }
  };

  const assetModal = document.getElementById('assetModal');
  const assetModalOverlay = document.getElementById('assetModalOverlay');
  const assetModalClose = document.getElementById('assetModalClose');
  const assetModalIcon = document.getElementById('assetModalIcon');
  const assetModalName = document.getElementById('assetModalName');
  const assetModalCat = document.getElementById('assetModalCat');
  const assetModalDesc = document.getElementById('assetModalDesc');
  const assetModalStats = document.getElementById('assetModalStats');

  function openAssetCard(key) {
    const info = assetInfo[key];
    if (!info || !assetModal) return;

    assetModalIcon.textContent = info.icon;
    assetModalName.textContent = info.name;
    assetModalCat.textContent = info.cat;
    assetModalDesc.textContent = info.desc;
    assetModalStats.innerHTML = info.stats.map(s =>
      `<div class="asset-modal-stat"><div class="asset-modal-stat-lbl">${s.lbl}</div><div class="asset-modal-stat-val">${s.val}</div></div>`
    ).join('');

    assetModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeAssetCard() {
    if (!assetModal) return;
    assetModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.comp-asset-row').forEach(row => {
    row.addEventListener('click', () => openAssetCard(row.dataset.asset));
  });

  if (assetModalClose) assetModalClose.addEventListener('click', closeAssetCard);
  if (assetModalOverlay) assetModalOverlay.addEventListener('click', closeAssetCard);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && assetModal && assetModal.classList.contains('open')) {
      closeAssetCard();
    }
  });

    

  console.log(" FinEdge JS cargado e inicializado sin errores.");
});