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

// ===== Contact =====
const contactForm = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

contactForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    formMsg.style.display = "block";
    formMsg.textContent = "> Sending...";

    const formData = new FormData(contactForm);

    try {

        const response = await fetch(contactForm.action, {

            method: "POST",
            body: formData

        });

        const result = await response.json();

        if (result.success) {

            formMsg.textContent =
                "> Message sent successfully. Thank you!";

            contactForm.reset();

        } else {

            formMsg.textContent =
                "> Failed to send message.";

        }

    } catch (error) {

        formMsg.textContent =
            "> Network error. Please try again.";

    }

});
