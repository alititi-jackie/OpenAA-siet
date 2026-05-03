/**
 * OpenAA subpages include.js (fixed base path)
 *
 * 目标：所有子页面统一用绝对路径 /subpages-assets/ 进行组件注入与脚本加载，
 * 避免因为 script src 推算路径导致去请求 /nav/.../components/ 或 /subpages-assets/js/components/ 等错误路径。
 */
(function () {
  'use strict';

  // 固定基准路径（绝对路径）
  var SITE_ROOT = '/';
  var SUB_ASSETS_BASE = '/subpages-assets/';
  var COMPONENT_BASE = SUB_ASSETS_BASE + 'components/';
  var JS_BASE = SUB_ASSETS_BASE + 'js/';

  function fetchText(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' loading ' + url);
      return r.text();
    });
  }

  function injectHTML(placeholderId, html) {
    var placeholder = document.getElementById(placeholderId);
    if (!placeholder) return false;

    var tmp = document.createElement('div');
    tmp.innerHTML = html;

    var parent = placeholder.parentNode;
    while (tmp.firstChild) {
      parent.insertBefore(tmp.firstChild, placeholder);
    }
    parent.removeChild(placeholder);
    return true;
  }

  function loadScript(src, onload) {
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    if (onload) s.onload = onload;
    document.body.appendChild(s);
  }

  // 分类栏点击监听（注入后统一绑定）
  function bindCategoryBar() {
    var categoryBarWrap = document.getElementById('categoryBarWrap');
    if (!categoryBarWrap) return;
    categoryBarWrap.addEventListener(
      'click',
      function (event) {
        var button = event.target.closest('.cat-tab');
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var category = button.getAttribute('data-cat') || 'all';
        if (typeof window.switchCategory === 'function') {
          window.switchCategory(category, button);
        }
      },
      true
    );
  }

  var components = [
    { id: 'site-header-placeholder', url: COMPONENT_BASE + 'site-header.html' },
    { id: 'site-inner-top-placeholder', url: COMPONENT_BASE + 'site-inner-top.html' },
    { id: 'site-bottom-nav-placeholder', url: COMPONENT_BASE + 'site-bottom-nav.html' }
  ];

  var pending = components.filter(function (c) {
    return !!document.getElementById(c.id);
  });

  if (pending.length === 0) {
    // 页面不使用组件注入，直接加载子页面专用 script
    loadScript(JS_BASE + 'script.js');
    return;
  }

  var done = 0;
  var total = pending.length;

  function onComponentDone() {
    done++;
    if (done === total) onAllInjected();
  }

  pending.forEach(function (c) {
    fetchText(c.url)
      .then(function (html) {
        injectHTML(c.id, html);
        onComponentDone();
      })
      .catch(function (err) {
        console.warn('[subpages include.js] 加载组件失败:', c.url, err);
        onComponentDone();
      });
  });

  function onAllInjected() {
    // 若页面本身没有定义 switchCategory（非首页），提供一个不崩溃的空实现
    if (typeof window.switchCategory !== 'function') {
      window.switchCategory = function () {};
    }

    // 组件注入完毕后再加载 script.js
    loadScript(JS_BASE + 'script.js', function () {
      bindCategoryBar();
    });
  }
}());
