document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.mobile-menu-close');
  const scrim = document.querySelector('.scrim');
  const openMenu = () => { menu?.classList.add('open'); scrim?.classList.add('open'); };
  const closeMenu = () => { menu?.classList.remove('open'); scrim?.classList.remove('open'); };
  toggle?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);
  scrim?.addEventListener('click', closeMenu);

  // Header shadow on scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Category filter pills (shop page)
  const pills = document.querySelectorAll('.pill-row .pill');
  const cards = document.querySelectorAll('[data-cat]');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.dataset.filter;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // Show contact-form errors passed back from contact.php via ?error=
  const errParam = new URLSearchParams(window.location.search).get('error');
  const errBox = document.getElementById('formError');
  if (errParam && errBox) {
    errBox.textContent = errParam;
    errBox.style.display = 'block';
    errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Contact / newsletter forms — static demo
  document.querySelectorAll('form[data-demo-form]').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const msg = f.dataset.successMessage || 'Thank you — we will get back to you shortly.';
      alert(msg);
      f.reset();
    });
  });

  // Simple stat count-up on scroll into view
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.countTo, 10);
        const suffix = el.dataset.suffix || '';
        const dur = 1200;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / dur);
          el.textContent = Math.round(target * p) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => obs.observe(c));
  }
});

// ---- 3D tilt interaction (hero visual + product/repair cards) ----
(function initTilt(){
  function apply3D(el, {max=10, scale=1.02, glare=false} = {}) {
    let rect;
    function onMove(e){
      rect = rect || el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0..1
      const y = (e.clientY - rect.top) / rect.height;    // 0..1
      const rx = (0.5 - y) * (max * 2);
      const ry = (x - 0.5) * (max * 2);
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale},${scale},${scale})`;
    }
    function onEnter(){ rect = el.getBoundingClientRect(); el.style.transition = 'transform 0.05s linear'; }
    function onLeave(){
      el.style.transition = 'transform 0.4s cubic-bezier(.22,1,.36,1)';
      el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
      rect = null;
    }
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch devices

  const hero = document.getElementById('tiltHero');
  if (hero) apply3D(hero, { max: 6, scale: 1.015 });

  document.querySelectorAll('.tilt-grid .tag-card, .tilt-grid .repair-card').forEach(card => {
    apply3D(card, { max: 8, scale: 1.03 });
  });
})();

// ---- Demo cart (localStorage-free, in-memory per session via query-free demo) ----
const SHOP_PRODUCTS = [
  { id: 1, name: "Flexible Copper Wire (90m)", cat: "wires", price: 1450, img: "images/wires.jpg" },
  { id: 2, name: "Modular Switch (2-Gang)", cat: "switches", price: 145, img: "images/switch.jpg" },
  { id: 3, name: "Designer Socket Plate", cat: "switches", price: 220, img: "images/switch2.jpg" },
  { id: 4, name: "MCB Circuit Breaker C16", cat: "breakers", price: 210, img: "images/cir.jpg" },
  { id: 5, name: "9W LED Bulb", cat: "lights", price: 95, img: "images/light.jpg" },
  { id: 6, name: "Smart Wi-Fi Plug", cat: "smart", price: 899, img: "images/smarth.jpg" },
  { id: 7, name: "House Wire — Single Colour (90m)", cat: "wires", price: 1250, img: "https://images.unsplash.com/photo-1563884705074-7c8b15f16295?auto=format&fit=crop&w=800&q=80" },
  { id: 8, name: "AA / 9V Batteries (Pack)", cat: "power", price: 80, img: "https://images.unsplash.com/photo-1576834975354-ee694be1f0d1?auto=format&fit=crop&w=800&q=80" },
];

function addToCartDemo(id, btn) {
  const p = SHOP_PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (btn) {
    const original = btn.textContent;
    btn.textContent = 'Added ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1200);
  }
}

// Cart page: Store Pickup vs Home Delivery toggle (demo — both currently free)
function setDeliveryMode(input) {
  document.querySelectorAll('.delivery-option').forEach(el => el.classList.remove('active'));
  input.closest('.delivery-option').classList.add('active');
  const fee = document.getElementById('deliveryFee');
  if (!fee) return;
  fee.textContent = input.value === 'delivery' ? 'Free (home delivery)' : 'Free (pickup)';
}
