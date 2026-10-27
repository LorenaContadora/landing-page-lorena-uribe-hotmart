/* ════════════════════════════════════════════════════
   EscueLU — script.js  |  JS vainilla, sin dependencias
   ════════════════════════════════════════════════════ */

/* ─── CONFIGURACIÓN ─────────────────────────────── */
var GA_ID    = 'G-XXXXXXXXXX';
var PIXEL_ID = 'XXXXXXXXXXXXXXX';

/* ─── ANALÍTICA ─────────────────────────────────── */
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
var gaOn = GA_ID.indexOf('XXXX') === -1;
var pxOn = PIXEL_ID.indexOf('XXXX') === -1;

if (gaOn) {
  var g = document.createElement('script');
  g.async = true;
  g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(g);
  gtag('js', new Date());
  gtag('config', GA_ID);
}
if (pxOn) {
  !function(f,b,e,v,n,t,s){
    if(f.fbq)return;
    n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=!0;t.src=v;
    s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
  }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
}

/**
 * Dispara un evento a GA4 y Meta Pixel (solo si los IDs están configurados).
 * @param {string}  gaName  - Nombre del evento GA4
 * @param {Object}  params  - Parámetros del evento
 * @param {string}  fbName  - Nombre del evento Meta Pixel
 * @param {boolean} custom  - true → fbq('trackCustom'), false → fbq('track')
 */
function track(gaName, params, fbName, custom) {
  if (gaOn) gtag('event', gaName, params || {});
  if (pxOn) fbq(custom ? 'trackCustom' : 'track', fbName, params || {});
}

/* ─── CLICS: HOTMART, WHATSAPP Y CTAs ──────────── */
document.addEventListener('click', function (e) {
  var a = e.target.closest('a');
  if (!a) return;
  var href  = a.getAttribute('href') || '';
  var label = (a.dataset.item || a.textContent).trim().slice(0, 60);

  if (href.indexOf('pay.hotmart.com') > -1) {
    var plan = a.closest('.plan--vip') ? 'plan_vip' : 'plan_individual';
    track('begin_checkout', { item_name: label, item_category: plan }, 'InitiateCheckout');
  } else if (href.indexOf('wa.me') > -1) {
    track('contact', { method: 'whatsapp' }, 'Contact');
  } else if (a.classList.contains('btn')) {
    track('cta_click', { label: label }, 'CtaClick', true);
  }
});

/* ─── HEADER: clase "scrolled" al hacer scroll ─── */
var header = document.querySelector('.top');
if (header) {
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // estado inicial
}

/* ─── ACORDEONES ────────────────────────────────── */
/* true = se abre uno a la vez · false = cada panel se abre y cierra por separado */
var SOLO_UNO = true;

document.querySelectorAll('.acc').forEach(function (acc) {
  var tipo  = acc.classList.contains('acc--courses') ? 'curso' : 'faq';
  var LADOS = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth'];

  /* Medidas actuales del panel (altura, relleno y bordes) */
  function medir(panel) {
    var cs = getComputedStyle(panel);
    var m  = { height: panel.offsetHeight + 'px', opacity: 1 };
    LADOS.forEach(function (p) { m[p] = cs[p]; });
    return m;
  }
  /* Estado plegado: todo en cero, para que no quede ni 1 px de relleno */
  function plegado() {
    var m = { height: '0px', opacity: 0 };
    LADOS.forEach(function (p) { m[p] = '0px'; });
    return m;
  }
  function animar(panel, desde, hasta, alTerminar) {
    var anim = panel._anim = panel.animate([desde, hasta], {
      duration: reduce ? 0 : 260,
      easing: 'cubic-bezier(.4, 0, .2, 1)',
      fill: 'forwards'
    });
    panel.style.overflow = 'hidden';
    anim.onfinish = function () {
      panel._anim = null;
      alTerminar();
      anim.cancel();
      panel.style.overflow = '';
    };
  }
  function cerrar(btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', 'false');
    if (!panel || panel.hidden) return;
    var desde = medir(panel);
    if (panel._anim) { panel._anim.cancel(); panel._anim = null; }
    animar(panel, desde, plegado(), function () { panel.hidden = true; });
  }
  function abrir(btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', 'true');
    if (!panel) return;
    var desde = panel._anim ? medir(panel) : plegado();
    if (panel._anim) { panel._anim.cancel(); panel._anim = null; }
    panel.hidden = false;
    animar(panel, desde, medir(panel), function () {});
  }

  acc.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') { cerrar(btn); return; }
      if (SOLO_UNO) {
        acc.querySelectorAll('.acc__btn').forEach(function (b) {
          if (b.getAttribute('aria-expanded') === 'true') cerrar(b);
        });
      }
      abrir(btn);
      track('select_content', {
        content_type: tipo,
        item_id: btn.textContent.trim().slice(0, 50)
      }, 'ViewContent');
    });
  });
});

/* ─── FORMULARIO DE NEWSLETTER ──────────────────── */
var form = document.getElementById('news-form');
if (form) {
  form.addEventListener('submit', function (e) {
    track('generate_lead', { method: 'newsletter' }, 'Lead');
    if (form.getAttribute('action').indexOf('REEMPLAZA') > -1) {
      e.preventDefault();
      var msg = form.querySelector('.form__msg');
      if (msg) msg.textContent = 'Modo demo: conecta el formulario a tu herramienta de correo.';
    }
  });
}

/* ─── DETECCIÓN DE SOPORTE ──────────────────────── */
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hayIO  = 'IntersectionObserver' in window;

/* ─── ANIMACIONES DE ENTRADA ─────────────────────
   Elementos que reciben la clase .reveal al cargar
   y la clase .in cuando entran al viewport.          */
var revelarGrupo = document.querySelectorAll(
  '.card, .steps li, .plan, .guarantee, .news__img, .about-photo-wrap, .faq'
);
/* Hijos con stagger (se activan en cascada) */
var revelarHijos = document.querySelectorAll('.stats li');

if (hayIO && !reduce) {
  /* --- Elementos simples --- */
  revelarGrupo.forEach(function (el) { el.classList.add('reveal'); });

  var obsReveal = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (!it.isIntersecting) return;
      it.target.classList.add('in');
      obsReveal.unobserve(it.target);
    });
  }, { threshold: 0.12 });
  revelarGrupo.forEach(function (el) { obsReveal.observe(el); });

  /* --- Tarjetas con stagger --- */
  document.querySelectorAll('.grid3').forEach(function (grid) {
    var children = grid.querySelectorAll('.card');
    children.forEach(function (c, i) {
      c.style.transitionDelay = (i * 80) + 'ms';
    });
  });

  /* --- Stats con stagger --- */
  revelarHijos.forEach(function (el, i) {
    el.classList.add('reveal-child');
    el.style.transitionDelay = (i * 100) + 'ms';
  });
  var obsChild = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (!it.isIntersecting) return;
      it.target.classList.add('in');
      obsChild.unobserve(it.target);
    });
  }, { threshold: 0.15 });
  revelarHijos.forEach(function (el) { obsChild.observe(el); });
}

/* ─── CONTADORES ANIMADOS ───────────────────────── */
var contadores = document.querySelectorAll('[data-count]');

function contar(el) {
  var meta = +el.dataset.count;
  var ini  = performance.now();
  var dur  = 1400;
  (function paso(t) {
    var p = Math.min((t - ini) / dur, 1);
    /* Ease out cubic */
    var ease = 1 - Math.pow(1 - p, 3);
    el.textContent = '+' + Math.round(meta * ease).toLocaleString('es-CO');
    if (p < 1) requestAnimationFrame(paso);
  })(ini);
}

if (hayIO) {
  var obsCount = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (!it.isIntersecting) return;
      if (!reduce) contar(it.target);
      obsCount.unobserve(it.target);
    });
  }, { threshold: 0.4 });
  contadores.forEach(function (el) { obsCount.observe(el); });
}

/* ─── CARDS: efecto tilt muy suave en escritorio ── */
if (!reduce && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect   = card.getBoundingClientRect();
      var x      = (e.clientX - rect.left) / rect.width  - .5;
      var y      = (e.clientY - rect.top)  / rect.height - .5;
      card.style.transform = 'translateY(-4px) rotateY(' + (x * 4) + 'deg) rotateX(' + (-y * 4) + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
}

/* ─── BARRA FIJA MÓVIL ──────────────────────────── */
var sticky    = document.getElementById('sticky');
var precios   = document.getElementById('precios');
var enPrecios = false;
var vistoPrecios = false;

function actualizarBarra() {
  if (!sticky) return;
  sticky.classList.toggle('show', window.scrollY > 500 && !enPrecios);
}
window.addEventListener('scroll', actualizarBarra, { passive: true });

if (hayIO && precios && sticky) {
  new IntersectionObserver(function (items) {
    enPrecios = items[0].isIntersecting;
    actualizarBarra();
    if (enPrecios && !vistoPrecios) {
      vistoPrecios = true;
      track('view_item_list', { item_list_name: 'planes' }, 'ViewContent');
    }
  }, { threshold: 0.1 }).observe(precios);
}

/* ─── AÑO EN EL FOOTER ──────────────────────────── */
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── SMOOTH SCROLL PARA ANCLAS INTERNAS ────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var id  = a.getAttribute('href').slice(1);
    var el  = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var offset = header ? header.offsetHeight + 8 : 0;
    var top    = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  });
});
