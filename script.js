/* ==========================================================================
   Asesoría y Gestiones Rguez · script.js
   Vanilla JS, sin dependencias: si algo falla, la página sigue visible y usable.
   Módulos: WhatsApp · Cargador · Cabecera · Revelado · Manifiesto · Contadores
            Escenas de scroll (promo, ruta, pila, parallax) · Hero (canvas + tarjeta 3D)
            Globo · Cotizador · Formulario · FAQ · Efectos de puntero
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- Configuración: el número de WhatsApp vive SOLO aquí ----------
     Formato: 52 + 10 dígitos. Si queda vacío, los botones de WhatsApp y el envío del
     formulario se ocultan con elegancia. */
  const WHATSAPP_NUMERO = '529661172953';
  const ASESOR = 'José Luis';

  const root = document.documentElement;
  clearTimeout(window.__rvT); // script.js arrancó: se cancela el respaldo "sin JS"

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const suave = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const fmt = (n) => Math.round(n).toLocaleString('es-MX');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // Solo se anima si el marcador "js" sigue puesto y el usuario no pidió menos movimiento
  const animar = root.classList.contains('js') && !reduce;

  /* ---------- WhatsApp ---------- */
  const tieneNumero = /^\d{10,15}$/.test(WHATSAPP_NUMERO);
  const waUrl = (msg) => `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`;

  function abrirWhatsApp(msg) {
    const a = document.createElement('a');
    a.href = waUrl(msg);
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function iniciarWhatsApp() {
    $$('[data-wa]').forEach((a) => {
      if (!tieneNumero) { a.style.display = 'none'; return; }
      a.href = waUrl(a.dataset.waMsg || 'Hola, quiero cotizar un crédito vía nómina.');
      a.target = '_blank';
      a.rel = 'noopener';
    });
    if (!tieneNumero) {
      const enviar = $('#enviarWa');
      if (enviar) enviar.style.display = 'none';
      const legal = $('.formu__legal');
      if (legal) legal.textContent = 'Estamos activando nuestro WhatsApp. Por ahora, déjanos tus datos en Facebook.';
    }
  }

  /* ---------- Cargador ---------- */
  function iniciarCargador() {
    const c = $('#cargador');
    if (!c) { root.classList.add('listo'); return; }
    if (!animar) { c.remove(); root.classList.add('listo'); return; }
    const pct = $('#pct');
    let hecho = false;
    const salir = () => {
      if (hecho) return;
      hecho = true;
      if (pct) pct.textContent = '100';
      c.classList.add('salir');
      root.classList.add('listo');
      setTimeout(() => c.remove(), 950);
    };
    const t0 = performance.now();
    const DUR = 1400;
    const paso = (ahora) => {
      const p = clamp((ahora - t0) / DUR);
      if (pct) pct.textContent = Math.round((1 - Math.pow(1 - p, 3)) * 100);
      if (p < 1 && !hecho) requestAnimationFrame(paso); else salir();
    };
    requestAnimationFrame(paso);
    setTimeout(salir, 1600); // respaldo si el navegador pausa requestAnimationFrame
  }

  /* ---------- Cabecera, menú móvil, progreso y botón flotante ---------- */
  function iniciarCabecera() {
    const cab = $('#cab');
    const barra = $('#progresoBarra');
    const wa = $('#waFlotante');
    const burger = $('#burger');
    const nav = $('#nav');
    let waMostrado = false;

    const alScroll = () => {
      const y = window.scrollY;
      if (cab) cab.classList.toggle('cab--sol', y > 40);
      if (barra) {
        const max = root.scrollHeight - window.innerHeight;
        barra.style.transform = `scaleX(${max > 0 ? clamp(y / max).toFixed(4) : 0})`;
      }
      if (wa && !waMostrado && y > 700) {
        waMostrado = true;
        wa.classList.add('mostrar');
        setTimeout(() => wa.classList.remove('mostrar'), 5500);
      }
    };
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', alScroll);
    alScroll();

    if (burger && nav) {
      const cerrar = () => { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); nav.classList.remove('abierto'); };
      burger.addEventListener('click', () => {
        const abre = burger.getAttribute('aria-expanded') !== 'true';
        burger.setAttribute('aria-expanded', String(abre));
        burger.setAttribute('aria-label', abre ? 'Cerrar menú' : 'Abrir menú');
        nav.classList.toggle('abierto', abre);
      });
      $$('a', nav).forEach((a) => a.addEventListener('click', cerrar));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrar(); });
    }
  }

  /* ---------- Revelado al hacer scroll ---------- */
  function iniciarRevelado() {
    const els = $$('.rv');
    if (!animar || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    els.forEach((el) => {
      if (el.style.getPropertyValue('--d')) return;
      const hermanos = $$(':scope > .rv', el.parentElement);
      const i = hermanos.indexOf(el);
      if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 70}ms`);
    });
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Manifiesto: palabras que se iluminan con el scroll ---------- */
  function prepararManifiesto() {
    const h = $('[data-scrub]');
    if (!h) return null;
    const texto = h.textContent.trim().replace(/\s+/g, ' ');
    const palabras = texto.split(' ');
    h.textContent = '';
    const spans = palabras.map((p, i) => {
      const s = document.createElement('span');
      s.className = 'pal' + (/^(n[óo]mina|WhatsApp\.?|ti:)$/i.test(p) ? ' pal--oro' : '');
      s.textContent = p;
      h.appendChild(s);
      if (i < palabras.length - 1) h.appendChild(document.createTextNode(' '));
      return s;
    });
    if (!animar) return null;
    h.classList.add('scrub');
    let previo = -1;
    return () => {
      const r = h.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.88 - r.top) / (r.height + window.innerHeight * 0.38));
      const n = Math.floor(p * (spans.length + 3));
      if (n === previo) return;
      previo = n;
      spans.forEach((s, i) => s.classList.toggle('on', i < n));
    };
  }

  /* ---------- Contadores ---------- */
  function animarNumero(el, desde, hasta, ms) {
    const t0 = performance.now();
    const f = (ahora) => {
      const p = clamp((ahora - t0) / ms);
      el.textContent = fmt(lerp(desde, hasta, 1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }

  function iniciarContadores() {
    const els = $$('[data-contar]');
    if (!els.length || !animar || !('IntersectionObserver' in window)) return;
    els.forEach((el) => { el.textContent = fmt(+(el.dataset.desde || 0)); });
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        animarNumero(el, +(el.dataset.desde || 0), +el.dataset.contar, 2200);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  function iniciarMontoTarjeta() {
    const el = $('#cicloMonto');
    if (!el || !animar) return;
    const valores = [5000, 20000, 50000, 100000, 500000];
    let i = valores.length - 1;
    let actual = valores[i];
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % valores.length;
      animarNumero(el, actual, valores[i], 1100);
      actual = valores[i];
    }, 3200);
  }

  /* ---------- Escenas ligadas al scroll ---------- */
  function escenaPromo() {
    const sec = $('.abre');
    if (!sec) return null;
    if (!animar) { sec.classList.add('abierto'); return null; }
    let p = 0;
    let previo = -1;
    return (dt) => {
      const r = sec.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const destino = total > 0 ? suave(0.04, 0.7, clamp(-r.top / total)) : 1;
      const lejos = r.bottom < -300 || r.top > window.innerHeight + 300;
      p = lejos ? destino : lerp(p, destino, 1 - Math.exp(-dt * 8));
      if (Math.abs(p - destino) < 0.0005) p = destino;
      if (Math.abs(p - previo) > 0.0003) {
        previo = p;
        sec.style.setProperty('--p', p.toFixed(4));
        sec.classList.toggle('abierto', p > 0.9);
      }
    };
  }

  function escenaRuta() {
    const ruta = $('#ruta');
    const pasos = $$('[data-paso]');
    if (!ruta) return null;
    if (!animar) { pasos.forEach((p) => p.classList.add('on')); return null; }
    let v = 0;
    let previo = -1;
    return (dt) => {
      const r = ruta.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) {
        v = r.top > 0 ? 0 : 1;
      } else {
        v = lerp(v, clamp((window.innerHeight * 0.6 - r.top) / r.height), 1 - Math.exp(-dt * 6));
      }
      if (Math.abs(v - previo) > 0.0005) {
        previo = v;
        ruta.style.setProperty('--rp', v.toFixed(4));
        pasos.forEach((p) => p.classList.toggle('on', p.getBoundingClientRect().top < window.innerHeight * 0.62));
      }
    };
  }

  function escenaPila() {
    const cartas = $$('[data-pila]');
    if (cartas.length < 2 || !animar) return null;
    let tops = [];
    const medir = () => { tops = cartas.map((c) => parseFloat(getComputedStyle(c).top) || 0); };
    medir();
    window.addEventListener('resize', medir);
    const previo = cartas.map(() => -1);
    return () => {
      const primera = cartas[0].getBoundingClientRect();
      const ultima = cartas[cartas.length - 1].getBoundingClientRect();
      if (primera.top > window.innerHeight || ultima.bottom < 0) return;
      const q = cartas.map((c, i) => {
        if (i === cartas.length - 1) return 0;
        const sig = cartas[i + 1].getBoundingClientRect().top;
        return clamp(1 - (sig - tops[i] - 16) / c.offsetHeight);
      });
      cartas.forEach((c, i) => {
        let acum = 0;
        for (let k = i; k < q.length; k += 1) acum += q[k];
        const s = 1 - acum * 0.035;
        if (Math.abs(s - previo[i]) > 0.0004) {
          previo[i] = s;
          c.style.transform = s >= 0.9995 ? '' : `scale(${s.toFixed(4)})`;
        }
      });
    };
  }

  function escenaParallax() {
    const els = $$('[data-par]');
    if (!els.length || !animar) return null;
    return () => {
      els.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > window.innerHeight + 100) return;
        const y = (r.top + r.height / 2 - window.innerHeight / 2) * parseFloat(el.dataset.par);
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      });
    };
  }

  /* ---------- Hero: cintas de oro (canvas) ---------- */
  function escenaFlujo() {
    const cv = $('#flujo');
    const hero = $('.hero');
    const ctx = cv && cv.getContext('2d');
    if (!ctx) return null;
    let W = 0;
    let H = 0;
    let t = 0;
    let visible = true;
    let cintas = [];
    let motas = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = hero.clientWidth;
      H = hero.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W < 720 ? 4 : 7;
      cintas = Array.from({ length: n }, (_, i) => ({
        y: H * (0.16 + (0.68 * i) / (n - 1)),
        amp: H * (0.04 + Math.random() * 0.06),
        f: ((1.1 + Math.random() * 1.5) * Math.PI * 2) / W,
        s: 0.25 + Math.random() * 0.4,
        ph: Math.random() * 6.28,
        w: 1 + Math.random() * 1.6,
        par: 0.02 + Math.random() * 0.05,
        v: 0.025 + Math.random() * 0.04,
        n: 5,
        pr: 1.6 + Math.random() * 1.4,
        mint: i % 3 === 1,
      }));
      motas = Array.from({ length: W < 720 ? 34 : 80 }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: 0.6 + Math.random() * 1.8,
        v: 4 + Math.random() * 14, a: 0.2 + Math.random() * 0.6, ph: Math.random() * 6.28,
      }));
    }

    const yCinta = (c, x, tt) => c.y + Math.sin(x * c.f + tt * c.s + c.ph) * c.amp + Math.sin(x * c.f * 2.1 - tt * c.s * 0.8 + c.ph) * c.amp * 0.4 + mouse.y * c.par * H;

    function dibujar() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      cintas.forEach((c) => {
        const col = c.mint ? '111,211,174' : '244,201,92';
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, `rgba(${col},0)`);
        g.addColorStop(0.5, `rgba(${col},0.5)`);
        g.addColorStop(1, `rgba(${col},0)`);
        const dx = mouse.x * c.par * W;
        ctx.beginPath();
        for (let x = -20; x <= W + 20; x += 12) {
          const y = yCinta(c, x, t);
          if (x === -20) ctx.moveTo(x + dx, y); else ctx.lineTo(x + dx, y);
        }
        ctx.strokeStyle = g;
        ctx.lineWidth = c.w;
        ctx.stroke();
        for (let k = 0; k < c.n; k += 1) {
          const u = (((t * c.v + k / c.n + c.ph) % 1) + 1) % 1;
          const x = -20 + u * (W + 40);
          const y = yCinta(c, x, t);
          const rr = c.pr * (0.7 + 0.3 * Math.sin(t * 3 + k));
          ctx.fillStyle = `rgba(${col},0.16)`;
          ctx.beginPath(); ctx.arc(x + dx, y, rr * 3.4, 0, 6.283); ctx.fill();
          ctx.fillStyle = `rgba(${col},0.95)`;
          ctx.beginPath(); ctx.arc(x + dx, y, rr, 0, 6.283); ctx.fill();
        }
      });
      motas.forEach((m) => {
        const y = (((m.y - t * m.v) % H) + H) % H;
        const a = m.a * (0.55 + 0.45 * Math.sin(t * 1.6 + m.ph));
        ctx.fillStyle = `rgba(255,236,170,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(m.x + mouse.x * 18 * m.r, y, m.r, 0, 6.283); ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }

    medir();
    let temporizador;
    const remedir = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => { medir(); if (!animar) dibujar(); }, 150);
    };
    if ('ResizeObserver' in window) new ResizeObserver(remedir).observe(hero);
    else window.addEventListener('resize', remedir);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(hero);
    }
    if (punteroFino && animar) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.width - 0.5;
        mouse.ty = (e.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener('pointerleave', () => { mouse.tx = 0; mouse.ty = 0; });
    }
    const actualizar = (dt) => {
      if (!visible) return;
      t += dt;
      mouse.x = lerp(mouse.x, mouse.tx, 1 - Math.exp(-dt * 3));
      mouse.y = lerp(mouse.y, mouse.ty, 1 - Math.exp(-dt * 3));
      dibujar();
    };
    actualizar.estatico = () => { t = 4; dibujar(); };
    return actualizar;
  }

  /* ---------- Hero: tarjeta 3D que sigue al puntero ---------- */
  function escenaTarjeta() {
    const tilt = $('#tilt');
    const fondo = $('.tarjeta__fondo');
    const hero = $('.hero');
    if (!tilt || !hero) return null;
    let px = 0;
    let py = 0;
    let cx = 0;
    let cy = 0;
    let t = 0;
    let visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(hero);
    }
    if (punteroFino && animar) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        px = (e.clientX - r.left) / r.width - 0.5;
        py = (e.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener('pointerleave', () => { px = 0; py = 0; });
    }
    const aplicar = () => {
      const ry = cx * 26 + Math.sin(t * 0.7) * 7;
      const rx = -cy * 18 + Math.cos(t * 0.55) * 4 + 4;
      tilt.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      if (fondo) {
        fondo.style.setProperty('--hx', `${(50 + ry * 2.4).toFixed(1)}%`);
        fondo.style.setProperty('--hy', `${(30 - rx * 3).toFixed(1)}%`);
      }
    };
    const actualizar = (dt) => {
      if (!visible) return;
      t += dt;
      cx = lerp(cx, px, 1 - Math.exp(-dt * 5));
      cy = lerp(cy, py, 1 - Math.exp(-dt * 5));
      aplicar();
    };
    actualizar.estatico = aplicar;
    return actualizar;
  }

  /* ---------- Cobertura: globo de puntos (canvas 2D, proyección ortográfica) ---------- */
  function escenaGlobo() {
    const cv = $('#globo');
    const ctx = cv && cv.getContext('2d');
    if (!ctx) return null;
    const D = Math.PI / 180;
    const FUENTE = '"Manrope Variable", Manrope, system-ui, sans-serif';
    // Territorio resaltado (elipses aproximadas): lat, lon, radio lat, radio lon
    const ZONAS = [
      { lat: 16.3, lon: -92.5, rl: 1.75, ro: 1.95 }, // Chiapas
      { lat: 17.0, lon: -96.3, rl: 1.7, ro: 2.3 },   // Oaxaca
      { lat: 17.9, lon: -92.6, rl: 0.75, ro: 1.5 },  // Tabasco
    ];
    const TONALA = { lat: 16.09, lon: -93.75 };
    const paso = 1.5;
    const pts = [];
    for (let lat = -20; lat <= 52; lat += paso) {
      const cl = Math.cos(lat * D);
      const n = Math.max(1, Math.round((360 * cl) / paso));
      const salto = 360 / n;
      for (let k = 0; k < n; k += 1) {
        const lon = -180 + k * salto + (Math.round((lat + 90) / paso) % 2) * salto * 0.5;
        if (lon < -140 || lon > -50) continue;
        const sl = Math.sin(lon * D);
        const co = Math.cos(lon * D);
        let zona = -1;
        ZONAS.forEach((z, i) => {
          const a = (lat - z.lat) / z.rl;
          const b = (lon - z.lon) / z.ro;
          if (a * a + b * b <= 1) zona = i;
        });
        pts.push({ x: cl * sl, y: Math.sin(lat * D), z: cl * co, zona, ph: Math.random() * 6.28 });
      }
    }
    let S = 0;
    let dpr = 1;
    let t = 0;
    let visible = false;

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      S = cv.clientWidth;
      cv.width = Math.round(S * dpr);
      cv.height = Math.round(S * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function proyectar(lat, lon, c) {
      const cl = Math.cos(lat * D);
      const x = cl * Math.sin(lon * D);
      const y = Math.sin(lat * D);
      const z = cl * Math.cos(lon * D);
      const x1 = x * c.cl0 - z * c.sl0;
      const z1 = x * c.sl0 + z * c.cl0;
      const y2 = y * c.cp0 - z1 * c.sp0;
      const z2 = y * c.sp0 + z1 * c.cp0;
      return { x: c.cx + c.R * x1, y: c.cy - c.R * y2, z: z2 };
    }

    function dibujar() {
      ctx.clearRect(0, 0, S, S);
      const lon0 = -94.5 + Math.sin(t * 0.22) * 13;
      const lat0 = 17 + Math.sin(t * 0.17) * 3;
      const c = {
        cl0: Math.cos(lon0 * D), sl0: Math.sin(lon0 * D), cp0: Math.cos(lat0 * D), sp0: Math.sin(lat0 * D),
        R: S * 0.95, cx: S / 2, cy: S / 2,
      };
      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        const x1 = p.x * c.cl0 - p.z * c.sl0;
        const z1 = p.x * c.sl0 + p.z * c.cl0;
        const y2 = p.y * c.cp0 - z1 * c.sp0;
        const z2 = p.y * c.sp0 + z1 * c.cp0;
        if (z2 <= 0.04) continue;
        const sx = c.cx + c.R * x1;
        const sy = c.cy - c.R * y2;
        if (sx < -6 || sx > S + 6 || sy < -6 || sy > S + 6) continue;
        if (p.zona >= 0) {
          const pulso = 0.6 + 0.4 * Math.sin(t * 2.2 + p.ph);
          const r = (1.5 + z2 * 1.5) * (S / 520) + pulso * 0.5;
          ctx.globalAlpha = 0.16 * pulso;
          ctx.fillStyle = '#f4c95c';
          ctx.beginPath(); ctx.arc(sx, sy, r * 2.6, 0, 6.283); ctx.fill();
          ctx.globalAlpha = 0.95;
          ctx.beginPath(); ctx.arc(sx, sy, r, 0, 6.283); ctx.fill();
        } else {
          ctx.globalAlpha = 0.12 + 0.5 * Math.pow(z2, 1.6);
          ctx.fillStyle = '#9fe6c9';
          const r = (0.9 + z2 * 0.9) * (S / 520);
          ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
        }
      }
      ctx.globalAlpha = 1;

      // Pulsos de radar en Tonalá
      const m = proyectar(TONALA.lat, TONALA.lon, c);
      for (let k = 0; k < 3; k += 1) {
        const u = ((t * 0.45 + k / 3) % 1);
        ctx.strokeStyle = `rgba(244,201,92,${(0.7 * (1 - u)).toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(m.x, m.y, 6 + u * S * 0.09, 0, 6.283); ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(m.x, m.y, 3.4 * (S / 520) + 1, 0, 6.283); ctx.fill();
      ctx.strokeStyle = '#f4c95c';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(m.x, m.y, 6.5 * (S / 520) + 1.5, 0, 6.283); ctx.stroke();

      // Etiquetas con línea guía
      const k = S / 560;
      const fs = Math.max(11, 14 * k);
      const etiquetas = [
        { n: 'Oaxaca', z: ZONAS[1], dx: -0.2 * S, dy: -0.13 * S, al: 'right' },
        { n: 'Tabasco', z: ZONAS[2], dx: 0.15 * S, dy: -0.19 * S, al: 'left' },
        { n: 'Chiapas', z: ZONAS[0], dx: 0.17 * S, dy: 0.17 * S, al: 'left' },
      ];
      ctx.font = `800 ${fs}px ${FUENTE}`;
      ctx.textBaseline = 'middle';
      etiquetas.forEach((e) => {
        const a = proyectar(e.z.lat, e.z.lon, c);
        if (a.z <= 0.2) return;
        const lx = a.x + e.dx;
        const ly = a.y + e.dy;
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(lx, ly); ctx.lineTo(lx + (e.al === 'left' ? 14 * k : -14 * k), ly); ctx.stroke();
        const tx = lx + (e.al === 'left' ? 20 * k : -20 * k);
        const ancho = ctx.measureText(e.n).width;
        const bx = e.al === 'left' ? tx - 8 * k : tx - ancho - 8 * k;
        ctx.fillStyle = 'rgba(3,32,26,0.78)';
        ctx.strokeStyle = 'rgba(244,201,92,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, ly - fs * 0.95, ancho + 16 * k, fs * 1.9, 999); else ctx.rect(bx, ly - fs * 0.95, ancho + 16 * k, fs * 1.9);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.textAlign = e.al;
        ctx.fillText(e.n, tx, ly + 1);
      });
    }

    medir();
    let temporizador;
    window.addEventListener('resize', () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => { medir(); if (!animar) dibujar(); }, 150);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '120px' }).observe(cv);
    } else {
      visible = true;
    }
    const actualizar = (dt) => {
      if (!visible) return;
      t += dt;
      dibujar();
    };
    actualizar.estatico = () => { t = 0.6; dibujar(); };
    return actualizar;
  }

  /* ---------- Cotizador interactivo ---------- */
  function iniciarCotizador() {
    const rango = $('#monto');
    const salida = $('#montoOut');
    const resumen = $('#resumen');
    const cont = $('#quincenas');
    if (!rango || !salida || !cont) return;
    const radios = $$('input[name="plazo"]');
    for (let i = 0; i < 120; i += 1) {
      const d = document.createElement('i');
      d.style.setProperty('--k', i);
      cont.appendChild(d);
    }
    const puntos = $$('i', cont);
    const plazoActual = () => +($('input[name="plazo"]:checked') || { value: 72 }).value;

    const pintarPuntos = () => { const pl = plazoActual(); puntos.forEach((d, i) => d.classList.toggle('on', i < pl)); };
    const actualizar = () => {
      const v = +rango.value;
      const pl = plazoActual();
      salida.textContent = fmt(v);
      rango.style.setProperty('--fill', `${((v - +rango.min) / (+rango.max - +rango.min)) * 100}%`);
      if (resumen) resumen.textContent = `Tu crédito: $${fmt(v)} a ${pl} quincenas (unos ${pl / 24} años).`;
      pintarPuntos();
    };
    rango.addEventListener('input', actualizar);
    radios.forEach((r) => r.addEventListener('change', actualizar));
    actualizar();

    // Al llegar a la sección, las quincenas "se encienden" una tras otra
    if (animar && 'IntersectionObserver' in window) {
      const panel = $('.armador');
      const io = new IntersectionObserver((e) => {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        puntos.forEach((d) => d.classList.remove('on'));
        requestAnimationFrame(() => requestAnimationFrame(pintarPuntos));
      }, { threshold: 0.35 });
      if (panel) io.observe(panel);
    }
  }

  /* ---------- Formulario → WhatsApp ---------- */
  function iniciarFormulario() {
    const f = $('#formulario');
    if (!f) return;
    const campo = (n) => f.elements[n];
    const error = (id, msg) => {
      const el = $(`#err-${id}`);
      if (el) el.textContent = msg;
      const c = campo(id);
      if (c && c.closest('.campo')) c.closest('.campo').classList.toggle('error', Boolean(msg));
    };
    ['nombre', 'institucion'].forEach((n) => {
      const c = campo(n);
      if (c) c.addEventListener('input', () => error(n, ''));
      if (c) c.addEventListener('change', () => error(n, ''));
    });

    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = campo('nombre').value.trim();
      const inst = campo('institucion').value;
      const estado = campo('estado').value;
      const tipo = campo('tipo').value;
      const notas = campo('mensaje').value.trim();
      let primero = null;
      if (nombre.length < 2) { error('nombre', 'Escribe tu nombre para saber con quién hablamos.'); primero = primero || campo('nombre'); } else error('nombre', '');
      if (!inst) { error('institucion', 'Elige dónde trabajas.'); primero = primero || campo('institucion'); } else error('institucion', '');
      if (primero) { primero.focus(); return; }
      if (!tieneNumero) return;
      const monto = fmt(+$('#monto').value);
      const plazo = ($('input[name="plazo"]:checked') || { value: 72 }).value;
      const lineas = [
        `Hola ${ASESOR}, soy ${nombre}.`,
        `Trabajo en ${inst}${estado ? ` (${estado})` : ''}.`,
        `Me interesa: ${tipo}.`,
        `Monto: $${monto}. Plazo: ${plazo} quincenas.`,
        notas ? `Comentario: ${notas}` : '',
        'Te escribo desde tu página web. Quedo atento a mi cotización.',
      ].filter(Boolean);
      abrirWhatsApp(lineas.join('\n'));
    });
  }

  /* ---------- Preguntas frecuentes ---------- */
  function iniciarFaq() {
    const botones = $$('.faq__q');
    botones.forEach((b) => {
      b.addEventListener('click', () => {
        const estabaAbierto = b.getAttribute('aria-expanded') === 'true';
        botones.forEach((o) => {
          o.setAttribute('aria-expanded', 'false');
          o.closest('.faq__item').classList.remove('abierta');
        });
        if (!estabaAbierto) {
          b.setAttribute('aria-expanded', 'true');
          b.closest('.faq__item').classList.add('abierta');
        }
      });
    });
  }

  /* ---------- Efectos de puntero: foco en tarjetas y botones magnéticos ---------- */
  function iniciarPuntero() {
    if (!punteroFino || !animar) return;
    $$('.tile').forEach((t) => {
      t.addEventListener('pointermove', (e) => {
        const r = t.getBoundingClientRect();
        t.style.setProperty('--mx', `${e.clientX - r.left}px`);
        t.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
    $$('.btn--mag').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        b.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* ---------- Bucle maestro ---------- */
  function iniciarBucle(modulos) {
    const activos = modulos.filter(Boolean);
    if (!animar) { activos.forEach((m) => m.estatico && m.estatico()); return; }
    let ultimo = performance.now();
    const cuadro = (ahora) => {
      requestAnimationFrame(cuadro);
      if (document.hidden) { ultimo = ahora; return; }
      const dt = Math.min(0.05, (ahora - ultimo) / 1000);
      ultimo = ahora;
      for (let i = 0; i < activos.length; i += 1) activos[i](dt);
    };
    requestAnimationFrame(cuadro);
  }

  /* ---------- Arranque ---------- */
  function iniciar() {
    const anio = $('#anio');
    if (anio) anio.textContent = new Date().getFullYear();
    iniciarWhatsApp();
    iniciarCargador();
    iniciarCabecera();
    const manifiesto = prepararManifiesto();
    iniciarRevelado();
    iniciarContadores();
    iniciarMontoTarjeta();
    iniciarCotizador();
    iniciarFormulario();
    iniciarFaq();
    iniciarPuntero();
    iniciarBucle([
      escenaFlujo(),
      escenaTarjeta(),
      escenaGlobo(),
      manifiesto,
      escenaPromo(),
      escenaRuta(),
      escenaPila(),
      escenaParallax(),
    ]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
