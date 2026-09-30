/* ---------------------------------------------------------------
   Sticky bar behaviour, shared by every page.

   The bar is transparent while it sits on the dark panel at the top of
   the page and gains a theme-coloured backing once the page scrolls —
   otherwise the nav would land on the light content below.

   It also publishes its own height as --header-h. The panel underneath
   is pulled up by exactly that much, and the value cannot be hardcoded:
   the bar is shorter on phones and grows if the nav wraps.
   --------------------------------------------------------------- */
(function () {
  var header = document.querySelector('.site-header, .doc-header');
  if (!header) return;

  var sync = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
  window.addEventListener('scroll', sync, { passive: true });

  var measure = function () {
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  };
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header);
  else window.addEventListener('resize', measure);

  measure();
  sync();
})();
