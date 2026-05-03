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

  function loadScript(src, onload) {
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    if (onload) s.onload = onload;
    document.body.appendChild(s);
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
      // still try to set default active from attribute
      setActiveTab(containerEl.getAttribute('data-cat-active'));
      return Promise.resolve();
    }

    // allow relative URL (relative to current page)
    var resolvedCfgUrl = cfgUrl;

    return fetchJSON(resolvedCfgUrl).then(function (cfg) {
      var pin = containerEl.querySelector('#catPinArea') || containerEl.querySelector('.cat-pin-area');
      var bar = containerEl.querySelector('#categoryBar') || containerEl.querySelector('.category-bar');
      if (!pin || !bar) return;

      // left pinned button
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

      // tabs
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

      // active tab
      setActiveTab(containerEl.getAttribute('data-cat-active'));
    });
  }

  function includeAll() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
    if (nodes.length === 0) return Promise.resolve([]);

    var tasks = nodes.map(function (el) {
      var key = (el.getAttribute('data-include') || '').trim();
      if (!key) return Promise.resolve();

      // Support legacy placeholders (id-based) still present
      // If user sets data-include="site-header" -> site-header.html
      var url = COMPONENT_BASE + key.replace(/\.html$/i, '') + '.html';

      return fetchText(url)
        .then(function (html) {
          injectInto(el, html);

          // category bar post processing
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

  // Bind legacy category bar click handler only when switchCategory exists
  function bindCategoryBarDelegation() {
    var wrap = document.getElementById('categoryBarWrap');
    if (!wrap) return;
    wrap.addEventListener(
      'click',
      function (event) {
        var button = event.target.closest('.cat-tab');
        if (!button) return;
        var cat = button.getAttribute('data-cat');
        if (!cat) return; // ignore pinned "返回"
        if (typeof window.switchCategory === 'function') {
          window.switchCategory(cat, button);
        }
      },
      true
    );
  }

  includeAll().then(function () {
    // ensure switchCategory exists to avoid crashes on pages without script.js logic
    if (typeof window.switchCategory !== 'function') {
      window.switchCategory = function () {};
    }

    // load shared interaction script after DOM injected
    loadScript(JS_BASE + 'script.js', function () {
      bindCategoryBarDelegation();
    });
  });
}());
