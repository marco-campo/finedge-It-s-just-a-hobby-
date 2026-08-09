'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── UI GLOBALS ──
  let isTyping = false;
  let msgCount = 0;

  // ── NAVIGATION ──
  window.showTab = function(id) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));

    const targetPanel = document.getElementById('panel-' + id);
    const targetTab = document.getElementById('tab-' + id);
    if (targetPanel) targetPanel.classList.add('on');
    if (targetTab) targetTab.classList.add('on');

    const titles = {
      chat:  ['Chat con Finn IA',          'Asistente de educación financiera · En línea'],
      tools: ['Herramientas Financieras', 'Calculadoras precisas · Sin IA'],
      info:  ['Glosario & Tips',            'Conceptos clave para jóvenes emprendedores']
    };

    const topbarTitle = document.getElementById('topbarTitle');
    const topbarSub = document.getElementById('topbarSub');
    if (topbarTitle && titles[id]) topbarTitle.textContent = titles[id][0];
    if (topbarSub && titles[id]) topbarSub.textContent = titles[id][1];
  };

  // ── HAMBURGER ──
  const hbg = document.getElementById('hbg');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hbg && mobileMenu) {
    hbg.addEventListener('click', () => {
      mobileMenu.classList.toggle('op');
    });
    document.querySelectorAll('.mobile-menu a, .mobile-menu button').forEach(el =>
      el.addEventListener('click', () => mobileMenu.classList.remove('op'))
    );
  }

  // ── SCROLL PROGRESS ──
  const sp = document.getElementById('sp');
  if (sp) {
    window.addEventListener('scroll', () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      sp.style.width = Math.min(pct, 100) + '%';
    });
  }

  // ── TEXTAREA HELPERS ──
  window.autoResize = function(ta) {
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  window.updateCharCount = function() {
    const userInput = document.getElementById('userInput');
    const charCount = document.getElementById('charCount');
    if (userInput && charCount) {
      charCount.textContent = userInput.value.length;
    }
  };

  window.handleKey = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── HELPERS ──
  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('es-CO');
  }

  function now() {
    return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  function scrollBottom() {
    const c = document.getElementById('chatMessages');
    if (c) {
      setTimeout(() => c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' }), 50);
    }
  }

  // ── HIDE WELCOME ──
  function hideWelcome() {
    const w = document.getElementById('chatWelcome');
    if (w) { w.style.display = 'none'; }
  }

  // ── ADD MESSAGE BUBBLE ──
  function addMessage(role, text) {
    hideWelcome();
    msgCount++;
    const c = document.getElementById('chatMessages');
    if (!c) return;

    const div = document.createElement('div');
    div.className = 'msg ' + role;
    div.id = 'msg-' + msgCount;

    const initials = role === 'user' ? 'TÚ' : '🤖';
    const nameLabel = role === 'user' ? 'Tú' : 'Finn';

    let formattedText = text;
    if (role === 'finn') {
      formattedText = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        .replace(/\n/g, '<br>');
    }

    div.innerHTML = `
      <div class="msg-avatar">${initials}</div>
      <div class="msg-body">
        <div class="msg-name">${nameLabel}</div>
        <div class="msg-bubble">${formattedText}</div>
        <div class="msg-time">${now()}</div>
      </div>`;

    c.appendChild(div);
    scrollBottom();
    return msgCount;
  }

  // ── TYPING INDICATOR ──
  function showTyping() {
    hideWelcome();
    const c = document.getElementById('chatMessages');
    if (!c) return;
    const div = document.createElement('div');
    div.className = 'msg finn';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-body">
        <div class="msg-name">Finn</div>
        <div class="typing-indicator">
          <div class="typing-dots"><span></span><span></span><span></span></div>
          <div class="typing-text">escribiendo...</div>
        </div>
      </div>`;
    c.appendChild(div);
    scrollBottom();
  }

  function hideTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  // ── CLEAR CHAT ──
  window.clearChat = function() {
    const c = document.getElementById('chatMessages');
    if (!c) return;
    c.innerHTML = `
      <div class="chat-welcome" id="chatWelcome">
        <div class="cw-avatar">🤖</div>
        <h2 class="cw-title">Hola, soy <span>Finn</span></h2>
        <p class="cw-sub">Tu asistente de educación financiera. ¡Pregúntame lo que quieras!</p>
        <div class="cw-chips">
          <button class="chip" onclick="sendQuick('¿Cómo funciona un CDT?')">¿Qué es un CDT?</button>
          <button class="chip" onclick="sendQuick('¿Cómo hago un presupuesto personal?')">Hacer un presupuesto</button>
          <button class="chip" onclick="sendQuick('¿Cómo inicio mi negocio con poco dinero?')">Empezar un negocio</button>
          <button class="chip" onclick="sendQuick('¿Qué es el gota a gota?')">¿Qué es el gota a gota?</button>
        </div>
      </div>`;
    msgCount = 0;
  };

  // ── QUICK SEND ──
  window.sendQuick = function(text) {
    const userInput = document.getElementById('userInput');
    if (userInput) userInput.value = text;
    showTab('chat');
    sendMessage();
  };

  // ================================================================
  // FETCH → BACKEND FLASK (ia.py)
  // ================================================================
  window.sendMessage = async function() {
    const input = document.getElementById('userInput');
    const btn   = document.getElementById('sendBtn');
    if (!input || !btn) return;

    const text = input.value.trim();
    if (!text || isTyping) return;

    addMessage('user', text);
    input.value = '';
    input.style.height = 'auto';
    updateCharCount();

    isTyping = true;
    btn.disabled = true;
    showTyping();

    try {
      // Petición al endpoint expuesto por ia.py
      const res = await fetch('/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mensaje: text })
      });

      if (!res.ok) throw new Error('Error del servidor: ' + res.status);

      const data = await res.json();
      hideTyping();

      // Lee la respuesta devolviendo un mensaje por defecto si la propiedad no existe
      const respuesta = data.respuesta || data.response || data.message || 'Sin respuesta del servidor.';
      addMessage('finn', respuesta);

    } catch (err) {
      hideTyping();
      addMessage('finn',
        '⚠️ No pude conectarme con el servidor. Verifica que Flask esté en ejecución.\n\nError técnico: ' + err.message
      );
    } finally {
      isTyping = false;
      btn.disabled = false;
      input.focus();
    }
  };

  // ── HERRAMIENTAS NATIVAS ──

  window.calcCredito = function() {
    const monto = parseFloat(document.getElementById('cMonto')?.value);
    const tasa  = parseFloat(document.getElementById('cTasa')?.value);
    const meses = parseInt(document.getElementById('cMeses')?.value);
    const res   = document.getElementById('rCredito');
    if (!res) return;

    if (!monto || !tasa || !meses || monto <= 0 || tasa <= 0 || meses <= 0) {
      res.innerHTML = '<div class="rh">⚠ Error</div>Ingresa valores válidos mayores a cero.';
      res.classList.add('show'); return;
    }

    const r     = (tasa / 100) / 12;
    const cuota = (monto * r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1);
    const total = cuota * meses;
    const ints  = total - monto;

    res.innerHTML = `
  <div class="rh">📊 Resultado del crédito</div>
  <div class="cuadre-display">
    <div class="cuadre-row"><span class="lbl">Monto solicitado</span><span class="val">${fmt(monto)}</span></div>
    <div class="cuadre-row"><span class="lbl">Tasa mensual</span><span class="val">${(r*100).toFixed(4)}% M.V.</span></div>
    <div class="cuadre-row"><span class="lbl">Plazo</span><span class="val">${meses} meses</span></div>
    <div class="cuadre-row total"><span class="lbl">Cuota mensual</span><span class="val ok">${fmt(cuota)}</span></div>
    <div class="cuadre-row"><span class="lbl">Total a pagar</span><span class="val warn">${fmt(total)}</span></div>
    <div class="cuadre-row"><span class="lbl">Intereses totales</span><span class="val danger">${fmt(ints)}</span></div>
  </div>
  💡 Asegúrate de que la cuota no supere el 30% de tus ingresos libres.`;
    res.classList.add('show');
  };

  window.calcCuadre = function() {
    const base   = parseFloat(document.getElementById('qBase')?.value)   || 0;
    const ventas = parseFloat(document.getElementById('qVentas')?.value) || 0;
    const gastos = parseFloat(document.getElementById('qGastos')?.value) || 0;
    const real   = parseFloat(document.getElementById('qReal')?.value);
    const res    = document.getElementById('rCuadre');
    if (!res) return;

    if (isNaN(real)) {
      res.innerHTML = '<div class="rh">⚠ Error</div>Ingresa todos los campos incluyendo el efectivo real.';
      res.classList.add('show'); return;
    }

    const calc       = base + ventas - gastos;
    const diferencia = real - calc;
    const estado     = Math.abs(diferencia) < 1 ? '✅ CAJA CUADRADA' : diferencia > 0 ? '⚠ SOBRANTE' : '🔴 FALTANTE';
    const valClass   = Math.abs(diferencia) < 1 ? 'ok' : diferencia > 0 ? 'warn' : 'danger';

    res.innerHTML = `
  <div class="rh">🧾 Resultado del cuadre</div>
  <div class="cuadre-display">
    <div class="cuadre-row"><span class="lbl">Saldo inicial</span><span class="val">${fmt(base)}</span></div>
    <div class="cuadre-row"><span class="lbl">(+) Ventas del día</span><span class="val ok">+ ${fmt(ventas)}</span></div>
    <div class="cuadre-row"><span class="lbl">(−) Gastos del día</span><span class="val danger">− ${fmt(gastos)}</span></div>
    <div class="cuadre-row total"><span class="lbl">Valor calculado</span><span class="val">${fmt(calc)}</span></div>
    <div class="cuadre-row total"><span class="lbl">Efectivo real</span><span class="val">${fmt(real)}</span></div>
    <div class="cuadre-row total"><span class="lbl">Diferencia</span><span class="val ${valClass}">${diferencia >= 0 ? '+' : ''}${fmt(diferencia)}</span></div>
    <div class="cuadre-row"><span class="lbl">Estado</span><span class="val ${valClass}">${estado}</span></div>
  </div>`;
    res.classList.add('show');
  };

  window.calcPE = function() {
    const fijos  = parseFloat(document.getElementById('pFijos')?.value);
    const precio = parseFloat(document.getElementById('pPrecio')?.value);
    const costo  = parseFloat(document.getElementById('pCosto')?.value) || 0;
    const res    = document.getElementById('rPE');
    if (!res) return;

    if (!fijos || !precio || fijos <= 0 || precio <= 0) {
      res.innerHTML = '<div class="rh">⚠ Error</div>Ingresa los gastos fijos y el precio de venta.';
      res.classList.add('show'); return;
    }
    const margen = precio - costo;
    if (margen <= 0) {
      res.innerHTML = '<div class="rh">⚠ Error</div>El precio de venta debe ser mayor al costo de fabricación.';
      res.classList.add('show'); return;
    }
    const unidades = Math.ceil(fijos / margen);
    const ventasMin = unidades * precio;

    res.innerHTML = `
  <div class="rh">⚖️ Punto de equilibrio</div>
  <div class="cuadre-display">
    <div class="cuadre-row"><span class="lbl">Margen por unidad</span><span class="val ok">${fmt(margen)}</span></div>
    <div class="cuadre-row"><span class="lbl">Gastos fijos</span><span class="val danger">${fmt(fijos)}</span></div>
    <div class="cuadre-row total"><span class="lbl">Unidades mínimas/mes</span><span class="val ok">${unidades.toLocaleString('es-CO')} uds.</span></div>
    <div class="cuadre-row total"><span class="lbl">Ventas mínimas/mes</span><span class="val warn">${fmt(ventasMin)}</span></div>
  </div>
  💡 Por debajo de ${unidades} unidades el negocio pierde dinero.`;
    res.classList.add('show');
  };

  window.calcRegla = function() {
    const inc = parseFloat(document.getElementById('rInc')?.value);
    const res = document.getElementById('rRegla');
    if (!res) return;

    if (!inc || inc <= 0) {
      res.innerHTML = '<div class="rh">⚠ Error</div>Ingresa un ingreso mensual válido.';
      res.classList.add('show'); return;
    }

    res.innerHTML = `
  <div class="rh">💰 Distribución 50/30/20</div>
  <div class="cuadre-display">
    <div class="cuadre-row"><span class="lbl">🏠 Necesidades (50%)</span><span class="val ok">${fmt(inc * 0.5)}/mes</span></div>
    <div class="cuadre-row"><span class="lbl">🎮 Gustos (30%)</span><span class="val warn">${fmt(inc * 0.3)}/mes</span></div>
    <div class="cuadre-row total"><span class="lbl">💰 Ahorro (20%)</span><span class="val ok">${fmt(inc * 0.2)}/mes</span></div>
    <div class="cuadre-row"><span class="lbl">📅 Ahorro anual</span><span class="val ok">${fmt(inc * 0.2 * 12)}</span></div>
  </div>
  💡 Separa el 20% apenas recibas tu ingreso. Lo que no ves, no lo gastas.`;
    res.classList.add('show');
  };

  // Auto-focus inicial
  const userInput = document.getElementById('userInput');
  if (userInput) userInput.focus();
});