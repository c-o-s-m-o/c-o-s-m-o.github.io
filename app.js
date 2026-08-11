const root = document.documentElement;
const body = document.body;
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');
const themeButton = document.querySelector('[data-theme-toggle]');
const year = document.querySelector('[data-year]');

const storedTheme = localStorage.getItem('portfolio-theme');
const preferredLight = window.matchMedia('(prefers-color-scheme: light)').matches;
root.dataset.theme = storedTheme || (preferredLight ? 'light' : 'dark');

function closeMenu() {
  if (!menuButton || !mobileNav) return;
  menuButton.classList.remove('active');
  mobileNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const open = !mobileNav.classList.contains('open');
  mobileNav.classList.toggle('open', open);
  menuButton.classList.toggle('active', open);
  menuButton.setAttribute('aria-expanded', String(open));
  body.classList.toggle('menu-open', open);
});

mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

window.addEventListener('resize', () => {
  if (window.innerWidth > 1060) closeMenu();
});

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 20);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

themeButton?.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('portfolio-theme', next);
});

if (year) year.textContent = new Date().getFullYear();

const revealItems = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}
