/* ---------------------------------------------------------------
   Theme menu shared by every page: system / light / dark.
   'system' stores nothing and drops the attribute so the page follows
   the OS again; a stored value wins over it. The pre-paint snippet that
   reads the same key lives inline in each <head> — it has to run before
   first paint, so it cannot wait for this file to load.
   --------------------------------------------------------------- */
(function () {
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;
  var wrap = document.querySelector('.theme-menu');
  var toggle = wrap && wrap.querySelector('.theme-toggle');
  var list = wrap && wrap.querySelector('.theme-list');
  var items = list ? Array.prototype.slice.call(list.querySelectorAll('[data-choice]')) : [];
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  var LABEL = { system: 'podle systému', light: 'světlý', dark: 'tmavý' };

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage is optional */ }
  var mode = (stored === 'light' || stored === 'dark') ? stored : 'system';

  var apply = function () {
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);

    // Native controls and scrollbars follow the effective theme too.
    var dark = mode === 'dark' || (mode === 'system' && systemDark.matches);
    root.style.colorScheme = dark ? 'dark' : 'light';

    if (toggle) {
      toggle.setAttribute('data-mode', mode);
      toggle.setAttribute('data-effective', dark ? 'dark' : 'light');
      toggle.setAttribute('aria-label', 'Motiv vzhledu: ' + LABEL[mode]);
    }
    items.forEach(function (item) {
      item.setAttribute('aria-checked', String(item.dataset.choice === mode));
    });
  };

  var open = function (focusFirst) {
    if (!list) return;
    list.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (focusFirst) {
      var active = items.filter(function (i) { return i.dataset.choice === mode; })[0];
      (active || items[0]).focus();
    }
  };
  var close = function (focusToggle) {
    if (!list) return;
    list.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (focusToggle) toggle.focus();
  };

  if (toggle) {
    toggle.addEventListener('click', function () {
      if (list.hidden) open(false); else close(false);
    });
    // Arrow keys on the trigger open the menu straight into the list.
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(true); }
    });
  }

  items.forEach(function (item, index) {
    item.addEventListener('click', function () {
      mode = item.dataset.choice;
      try {
        if (mode === 'system') localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, mode);
      } catch (e) { /* storage is optional */ }
      apply();
      close(true);
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(index + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(index - 1 + items.length) % items.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && list && !list.hidden) close(true);
  });
  document.addEventListener('click', function (e) {
    if (wrap && list && !list.hidden && !wrap.contains(e.target)) close(false);
  });

  // In system mode, follow the OS switching themes while the page is open.
  systemDark.addEventListener('change', function () {
    if (mode === 'system') apply();
  });
  apply();
})();
