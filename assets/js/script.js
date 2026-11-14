const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------------- Theme: dark <-> light ---------------- */
const toggleBtn = document.getElementById('themeToggle');
const metaTheme = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === 'dark';
  toggleBtn?.setAttribute('aria-pressed', String(dark));
  toggleBtn?.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  if (metaTheme) metaTheme.content = dark ? '#0b0f1f' : '#eef1f7';
  document.dispatchEvent(new Event('themechange'));
}

applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');

toggleBtn?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch (e) {}

  // circular reveal that grows out of the toggle button, where supported
  if (!document.startViewTransition || reduceMotion.matches) { applyTheme(next); return; }
  const r = toggleBtn.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const vt = document.startViewTransition(() => applyTheme(next));
  vt.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
    );
  });
});

/* ---------------- Mobile menu ---------------- */
const menuBtn = document.getElementById('menuBtn');
const navWrap = document.getElementById('navWrap');

function setMenu(open) {
  navWrap.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
}

menuBtn?.addEventListener('click', () => setMenu(!navWrap.classList.contains('open')));
navWrap?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navWrap?.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
});
document.addEventListener('click', e => {
  if (navWrap?.classList.contains('open') && !navWrap.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
});

/* ---------------- Scroll: header state, progress bar, timeline ---------------- */
const head = document.querySelector('.site-head');
const progress = document.getElementById('progress');
const timeline = document.getElementById('timeline');
const navLinks = [...document.querySelectorAll('.nav a')];
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  head.classList.toggle('scrolled', y > 8);
  progress?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const start = innerHeight * 0.75;
    const p = Math.min(1, Math.max(0, (start - r.top) / r.height));
    timeline.style.setProperty('--tp', p.toFixed(4));
    timeline.querySelectorAll(':scope > li').forEach(li => {
      li.classList.toggle('passed', li.offsetTop <= p * r.height + 8);
    });
  }

  if (y < 200) navLinks.forEach(a => a.removeAttribute('aria-current'));
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
onScroll();

/* ---------------- Active section in the nav ---------------- */
if ('IntersectionObserver' in window) {
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => {
        if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
}

/* ---------------- Scroll reveals and count-up ---------------- */
function countUp(el) {
  const target = Number(el.dataset.count);
  if (reduceMotion.matches || !target) return;
  const dur = 900 + target * 60;
  const t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.max(1, Math.round(eased * target));
    if (k < 1) requestAnimationFrame(step);
  };
  el.textContent = '0';
  requestAnimationFrame(step);
}

const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group], .timeline > li');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-in'));
}

/* ---------------- Certificate and letter viewer ---------------- */
const viewer = document.getElementById('viewer');
const viewerImg = document.getElementById('viewerImg');
let opener = null;

document.querySelectorAll('[data-full]').forEach(btn => {
  btn.addEventListener('click', () => {
    viewerImg.src = btn.dataset.full;
    viewerImg.alt = btn.dataset.alt || '';
    opener = btn;
    if (viewer.showModal) viewer.showModal();
    else window.open(btn.dataset.full, '_blank');
  });
});

if (viewer) {
  // play the closing animation before the dialog actually closes
  const closeViewer = () => {
    if (reduceMotion.matches) { viewer.close(); return; }
    viewer.classList.add('closing');
    viewer.addEventListener('animationend', () => {
      viewer.classList.remove('closing');
      viewer.close();
    }, { once: true });
  };
  viewer.addEventListener('cancel', e => { e.preventDefault(); closeViewer(); });
  viewer.addEventListener('click', e => { if (e.target === viewer) closeViewer(); });
  viewer.querySelector('form')?.addEventListener('submit', e => { e.preventDefault(); closeViewer(); });
  viewer.addEventListener('close', () => opener?.focus());
}

/* ---------------- Contact form (Web3Forms) ---------------- */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form?.addEventListener('submit', async e => {
  e.preventDefault();

  const fields = [...form.querySelectorAll('input[required], textarea[required]')];
  let firstBad = null;
  fields.forEach(f => {
    const bad = !f.checkValidity();
    f.setAttribute('aria-invalid', bad ? 'true' : 'false');
    if (bad && !firstBad) firstBad = f;
  });
  if (firstBad) {
    status.className = 'form-status err';
    status.textContent = firstBad.type === 'email' && firstBad.value
      ? 'Enter a valid email address so I can reply.'
      : 'Fill in your name, email and message, then send again.';
    firstBad.focus();
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  status.className = 'form-status';
  status.textContent = '';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Send failed');
    status.className = 'form-status ok';
    status.textContent = "Message sent. I’ll reply to the email you gave.";
    form.reset();
    fields.forEach(f => f.removeAttribute('aria-invalid'));
  } catch (err) {
    status.className = 'form-status err';
    status.textContent = "Your message didn’t send. Check your connection and try again, or email me directly.";
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send message';
  }
});
