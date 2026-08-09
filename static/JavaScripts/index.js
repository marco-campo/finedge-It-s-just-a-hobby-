/* ═══════════════════════════════════
   FINEDGE — INDEX JAVASCRIPT
═══════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAVBAR SCROLL ----
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // ---- HAMBURGER ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    document.querySelectorAll('.mobile-menu a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // ---- SCROLL REVEAL ----
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
  }

  // ---- COUNTER ANIMATION ----
  function animateCounter(el) {
    const target = parseInt(el.dataset.target) || 0;
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    };
    requestAnimationFrame(update);
  }

  const counterContainers = document.querySelectorAll('.hero-stats, .stats-row');
  if (counterContainers.length > 0) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.counter').forEach(c => animateCounter(c));
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    counterContainers.forEach(el => counterObs.observe(el));
  }

  // ---- CHATBOT DEMO ----
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const chatMessages = document.getElementById('chatMessages');

  if (chatInput && chatSend && chatMessages) {
    const conversationHistory = [
      { role: 'assistant', content: '¡Hola! Soy Finn 👋 Tu asesor financiero. ¿En qué te puedo ayudar hoy?' },
      { role: 'user', content: '¿Cómo puedo empezar a ahorrar si gano el salario mínimo?' },
      { role: 'assistant', content: '¡Excelente pregunta! Con el salario mínimo en Colombia aplica la regla 50/30/20: destina el 50% a necesidades, 30% a gustos y 20% al ahorro. ¿Quieres que te muestre cómo crear tu presupuesto personalizado?' }
    ];

    function addMessage(text, type, delay = 0) {
      setTimeout(() => {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${type}`;
        msg.innerHTML = `<div class="msg-bubble">${text}</div><div class="chat-time">Ahora</div>`;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, delay);
    }

    function addTyping() {
      const el = document.createElement('div');
      el.className = 'chat-msg bot typing-indicator';
      el.id = 'typing';
      el.innerHTML = '<div class="msg-bubble" style="color:var(--gray);font-style:italic;font-size:.75rem">Finn está escribiendo…</div>';
      chatMessages.appendChild(el);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendToFinn(userMsg) {
      conversationHistory.push({ role: 'user', content: userMsg });
      addTyping();

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: `Eres Finn, el asistente financiero de FinEdge, una plataforma para jóvenes colombianos.
    Ayudas con educación financiera, ahorro, presupuesto, créditos, emprendimiento y comercio.
    Usa ejemplos con pesos colombianos. Responde en máximo 2 párrafos cortos. Sé amigable y motivador.`,
            messages: conversationHistory.map(m => ({ role: m.role, content: m.content }))
          })
        });

        const data = await response.json();
        const reply = data.content?.[0]?.text || 'Disculpa, intenta de nuevo.';

        document.getElementById('typing')?.remove();
        conversationHistory.push({ role: 'assistant', content: reply });
        addMessage(reply, 'bot');
      } catch {
        // Al dar error CORS/Key desde el frontend, cae al modo demo automático
        document.getElementById('typing')?.remove();
        addMessage('En este momento estoy en modo demo. ¡Próximamente estaré completamente activo! 🤖', 'bot');
      }
    }

    async function handleSend() {
      const msg = chatInput.value.trim();
      if (!msg) return;
      chatInput.value = '';
      addMessage(msg, 'user');
      await sendToFinn(msg);
    }

    chatSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
  }

  // ---- SMOOTH SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  console.log("Index JS cargado correctamente.");
});