/**
 * OpenAA subpages include.js (declarative includes)
 *
 * Features:
 * - Inject any component via: <div data-include="path/to/component"></div>
 *   It loads: /subpages-assets/components/<path/to/component>.html
 * - Category bar: data-include="inner/category-bar" supports:
 *   - data-cat-config: URL to JSON config (absolute or relative)
 *   - data-cat-active: active tab id
 */
(function () {
  'use strict';

  var SUB_ASSETS_BASE = '/subpages-assets/';
  var COMPONENT_BASE = SUB_ASSETS_BASE + 'components/';
  var JS_BASE = SUB_ASSETS_BASE + 'js/';

  function fetchText(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' loading ' + url);
      return r.text();
    });
  }

  function fetchJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' loading ' + url);
      return r.json();
    });
  }

  function injectInto(el, html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    el.innerHTML = '';
    while (tmp.firstChild) el.appendChild(tmp.firstChild);
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Failed to load script ' + src)); };
      document.body.appendChild(s);
    });
  }

  function setActiveTab(activeId) {
    if (!activeId) return;
    document.querySelectorAll('.cat-tab').forEach(function (t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    var active = document.querySelector('.cat-tab[data-cat="' + activeId + '"]');
    if (active) {
      active.classList.add('active');
      active.setAttribute('aria-selected', 'true');
    }
  }

  function renderCategoryBar(containerEl) {
    var cfgUrl = containerEl.getAttribute('data-cat-config');
    if (!cfgUrl) {
      setActiveTab(containerEl.getAttribute('data-cat-active'));
      return Promise.resolve();
    }

    return fetchJSON(cfgUrl).then(function (cfg) {
      var pin = containerEl.querySelector('#catPinArea') || containerEl.querySelector('.cat-pin-area');
      var bar = containerEl.querySelector('#categoryBar') || containerEl.querySelector('.category-bar');
      if (!pin || !bar) return;

      pin.innerHTML = '';
      if (cfg.left && cfg.left.text) {
        var leftBtn = document.createElement('button');
        leftBtn.className = 'cat-tab';
        leftBtn.type = 'button';
        leftBtn.textContent = cfg.left.text;
        leftBtn.addEventListener('click', function () {
          window.location.href = cfg.left.href || 'https://openaa.com/';
        });
        pin.appendChild(leftBtn);
      }

      bar.innerHTML = '';
      (cfg.tabs || []).forEach(function (t) {
        var btn = document.createElement('button');
        btn.className = 'cat-tab';
        btn.type = 'button';
        btn.textContent = t.text || t.id;
        btn.setAttribute('data-cat', t.id || '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', 'false');
        btn.addEventListener('click', function () {
          if (t.href) window.location.href = t.href;
        });
        bar.appendChild(btn);
      });

      setActiveTab(containerEl.getAttribute('data-cat-active'));
    });
  }

  function includeAll() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    if (nodes.length === 0) return Promise.resolve([]);

    var tasks = nodes.map(function (el) {
      var key = (el.getAttribute('data-include') || '').trim();
      if (!key) return Promise.resolve();

      var url = COMPONENT_BASE + key.replace(/\.html$/i, '') + '.html';

      return fetchText(url)
        .then(function (html) {
          injectInto(el, html);
          if (key === 'inner/category-bar') {
            return renderCategoryBar(el);
          }
        })
        .catch(function (err) {
          console.warn('[include.js] component load failed:', url, err);
        });
    });

    return Promise.all(tasks);
  }

  function bindCategoryBarDelegation() {
    var wrap = document.getElementById('categoryBarWrap');
    if (!wrap) return;
    wrap.addEventListener(
      'click',
      function (event) {
        var button = event.target.closest('.cat-tab');
        if (!button) return;
        var cat = button.getAttribute('data-cat');
        if (!cat) return;
        if (typeof window.switchCategory === 'function') {
          window.switchCategory(cat, button);
        }
      },
      true
    );
  }

  // IMPORTANT:
  // - Include HTML fragments first
  // - Then load search helpers (so inline handlers exist)
  // - Then load main interaction script (banner/category/share)
  includeAll().then(function () {
    var chain = Promise.resolve();

    chain = chain
      .then(function () { return loadScript(JS_BASE + 'search.js'); })
      .catch(function () {
        // search.js is optional on pages without search
      })
      .then(function () { return loadScript(JS_BASE + 'script.js'); })
      .then(function () {
        // ensure switchCategory exists to avoid crashes
        if (typeof window.switchCategory !== 'function') {
          window.switchCategory = function () {};
        }
        bindCategoryBarDelegation();

        // Re-initialize banner after includes (for pages where script.js ran before DOM existed)
        // If banner elements exist, the IIFE in script.js already ran on load; here we just force reload.
        // NOTE: script.js banner init is an IIFE, so this won't rerun. Keeping for future refactor.
      })
      .catch(function (err) {
        console.warn('[include.js] post-load script failed:', err);
      });

    return chain;
  });
}());
