// main.js - handle copy, bookmark, scroll-to-top, toggle, toast, etc.

document.addEventListener('DOMContentLoaded', function() {
  // Copy 69nav link
  const btn = document.getElementById('copy69nav');
  const toast = document.getElementById('copyToast');
  if (btn && toast) {
    btn.addEventListener('click', function () {
      const link = "https://69nav.com/";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
          showToast();
        }).catch(err => {
          console.error("复制失败：", err);
          alert("复制失败，请手动复制：" + link);
        });
      } else {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        try { 
          document.execCommand('copy'); 
          showToast();
        } catch (e) { 
          alert('请手动复制：' + link); 
        }
        document.body.removeChild(ta);
      }
    });
  }

  // Bookmark button
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', addBookmark);
  }

  // Back to top button visibility
  const backBtn = document.getElementById('backToTopBtn');
  window.addEventListener('scroll', function() {
    if (!backBtn) return;
    if (window.scrollY > 200) {
      backBtn.style.display = 'block';
    } else {
      backBtn.style.display = 'none';
    }
  });
});

// show toast helper
function showToast() {
  const toast = document.getElementById('copyToast');
  if (!toast) return;
  toast.style.visibility = "visible";
  setTimeout(() => { toast.style.visibility = "hidden"; }, 1500);
}

// 收藏
function addBookmark() {
  // 提示并引导使用浏览器收藏
  alert('请使用 Ctrl+D (或 Cmd+D) 收藏本网站，或在浏览器菜单中选择“添加书签”');
}

// 回到顶部
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 折叠区动画开关（修复了原 HTML 中脚本未闭合的问题）
function toggleSection(id) {
  const section = document.getElementById(id);
  if (section) {
    const expanded = section.classList.toggle('open');
    section.setAttribute('aria-expanded', expanded);
  }
}