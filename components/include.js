/**
 * OpenAA 华人导航 - components/include.js
 *
 * 通过 fetch 异步注入公共头部/内容顶部/底部组件，避免各页面复制粘贴。
 * 注入完成后动态加载 script.js，确保 banner 等初始化能找到 DOM 节点。
 *
 * 用法（以页面到根目录的相对路径引用本文件即可）：
 *   根目录页面:  <script src="components/include.js"></script>
 *   子目录页面:  <script src="../components/include.js"></script>
 */
(function () {
  'use strict';

  /* ---- 1. 通过本脚本的 src 推算站点根路径 ---- */
  var thisScript = document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    }());

  var scriptSrc = (thisScript && thisScript.src) || '';
  // componentBase: 例如 "https://openaa.com/components/"
  var componentBase = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
  // siteRoot:      例如 "https://openaa.com/"
  var siteRoot = componentBase.replace(/\/components\/$/, '/').replace(/\/components$/, '/');
  if (!siteRoot.endsWith('/')) siteRoot += '/';

  /* ---- 2. 工具函数 ---- */
  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' loading ' + url);
      return r.text();
    });
  }

  /**
   * 将 HTML 片段注入到占位容器（替换占位节点本身）。
   * @param {string} placeholderId
   * @param {string} html
   */
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

  /**
   * 动态加载脚本，支持 onload 回调。
   * @param {string} src
   * @param {Function=} onload
   */
  function loadScript(src, onload) {
    var s = document.createElement('script');
    s.src = src;
    if (onload) s.onload = onload;
    document.body.appendChild(s);
  }

  /* ---- 3. 分类栏点击监听（注入后由 include.js 统一绑定） ---- */
  function bindCategoryBar() {
    var categoryBarWrap = document.getElementById('categoryBarWrap');
    if (!categoryBarWrap) return;
    categoryBarWrap.addEventListener('click', function (event) {
      var button = event.target.closest('.cat-tab');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var category = button.getAttribute('data-cat') || 'all';
      if (typeof window.switchCategory === 'function') {
        window.switchCategory(category, button);
      }
    }, true);
  }

  /* ---- 4. 注入所有占位组件 ---- */
  var components = [
    { id: 'site-header-placeholder',    url: componentBase + 'site-header.html'     },
    { id: 'site-inner-top-placeholder', url: componentBase + 'site-inner-top.html'  },
    { id: 'site-bottom-nav-placeholder',url: componentBase + 'site-bottom-nav.html' }
  ];

  // 只获取页面中实际存在的占位符
  var pending = components.filter(function (c) {
    return !!document.getElementById(c.id);
  });

  if (pending.length === 0) {
    // 页面不使用组件注入，直接加载 script.js
    loadScript(siteRoot + 'script.js');
    return;
  }

  var done = 0;
  var total = pending.length;

  function onComponentDone() {
    done++;
    if (done === total) {
      onAllInjected();
    }
  }

  pending.forEach(function (c) {
    fetchText(c.url)
      .then(function (html) {
        injectHTML(c.id, html);
        onComponentDone();
      })
      .catch(function (err) {
        console.warn('[include.js] 加载组件失败:', c.url, err);
        onComponentDone();
      });
  });

  /* ---- 5. 全部组件注入完毕后的初始化 ---- */
  function onAllInjected() {
    // 若页面本身没有定义 switchCategory（非首页），提供一个不崩溃的空实现
    if (typeof window.switchCategory !== 'function') {
      window.switchCategory = function () {};
    }

    // 动态加载 script.js（此时 banner/search DOM 已存在）
    loadScript(siteRoot + 'script.js', function () {
      // script.js 加载完毕后，绑定分类栏点击监听
      bindCategoryBar();
    });
  }
}());
