// ===== Mobile nav toggle =====
const toggle = document.getElementById('navtoggle');
const links = document.getElementById('navlinks');

if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      links.querySelectorAll('a').forEach(x => x.classList.remove('active'));
      a.classList.add('active');
    });
  });
}

// ===== Scroll reveal =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

// ===== Project filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.proj-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.style.display = show ? 'block' : 'none';
    });
  });
});

// ===== Contact form (placeholder — wire up to Formspree or an API route) =====
// ===== Contact form (Formspree) =====
const contactForm = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);

    formMsg.textContent = '> sending...';
    formMsg.style.display = 'block';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        formMsg.textContent = '> message sent. thanks — I\'ll get back to you soon.';
        contactForm.reset();
      } else {
        formMsg.textContent = '> something went wrong. try emailing me directly instead.';
      }
    } catch (err) {
      formMsg.textContent = '> network error. try emailing me directly instead.';
    }
  });
}
