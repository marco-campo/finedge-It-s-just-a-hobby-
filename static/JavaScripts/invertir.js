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

  // ═══ COMPARADOR — FILAS EXPANDIBLES (ACORDEÓN) ═══
  document.querySelectorAll('.comp-asset-row').forEach(row => {
    row.addEventListener('click', () => {
     const assetKey = row.dataset.asset;
     const detailRow = row.nextElementSibling;

     // Verificar que la siguiente fila sea el detalle correspondiente
     if (!detailRow || !detailRow.classList.contains('comp-detail-row')) return;

     const isOpen = detailRow.classList.contains('open');

     // Cerrar TODAS las demás filas de detalle en la misma tabla
     const table = row.closest('table');
     if (table) {
      table.querySelectorAll('.comp-detail-row.open').forEach(dr => {
        dr.classList.remove('open');
      });
      table.querySelectorAll('.comp-asset-row.active').forEach(ar => {
        ar.classList.remove('active');
      });
     }

     // Si no estaba abierto, abrirlo
     if (!isOpen) {
      detailRow.classList.add('open');
      row.classList.add('active');
     }
   });
  });

    

  console.log(" FinEdge JS cargado e inicializado sin errores.");
});