// dmv/ny/practice/assets/view.js
function questionsUrl() {
  return new URL('data/questions.json', document.baseURI).href;
}

async function loadQuestions() {
  const resp = await fetch(questionsUrl());
  if (!resp.ok) throw new Error(`Failed to load questions: ${resp.status}`);
  return await resp.json();
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

function renderList(container, questions, keyword, showAnswers) {
  const letters = ['A','B','C','D','E'];
  const kw = (keyword || '').trim();

  const filtered = !kw ? questions : questions.filter(q => {
    const hay = [q.question, ...(q.options || [])].join(' ');
    return hay.includes(kw);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-muted">没有匹配的题目。</p>`;
    return;
  }

  container.innerHTML = filtered.map((q, idx) => {
    const ansIdx = q.answerIndex;
    const ansLetter = (ansIdx >= 0 && ansIdx < letters.length) ? letters[ansIdx] : '?';
    const ansText = (ansIdx >= 0 && ansIdx < (q.options || []).length) ? q.options[ansIdx] : '';

    const opts = (q.options || []).map((opt, i) => {
      const isCorrect = i === ansIdx;
      // 如果 showAnswers=false，就不高亮正确项
      const style = (showAnswers && isCorrect) ? ' style="font-weight:800;color:var(--correct)"' : '';
      return `<li${style}>${letters[i]}. ${esc(opt)}</li>`;
    }).join('');

    return `
      <div class="qa-item" data-qid="${q.id ?? (idx + 1)}">
        <div class="qa-q">${q.id ?? (idx + 1)}. ${esc(q.question)}</div>
        <ol class="qa-opts" type="A">${opts}</ol>

        <div class="qa-ans-wrap" style="${showAnswers ? '' : 'display:none;'}">
          <div class="qa-ans">正确答案：${ansLetter}${ansText ? `（${esc(ansText)}）` : ''}</div>
          ${q.explanation ? `<div class="qa-muted">解析：${esc(q.explanation)}</div>` : ''}
        </div>

        <button class="btn btn-ghost btn-sm qa-toggle-one" type="button">
          ${showAnswers ? '隐藏本题答案' : '显示本题答案'}
        </button>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  const metaLine = document.getElementById('metaLine');
  const qaList = document.getElementById('qaList');
  const filterInput = document.getElementById('filterInput');
  const toggleAnswersBtn = document.getElementById('toggleAnswersBtn');

  let showAnswers = false;
  let questions = [];

  function syncToggleBtn() {
    if (!toggleAnswersBtn) return;
    toggleAnswersBtn.textContent = showAnswers ? '🙈 隐藏答案' : '👁 显示答案';
  }

  function doRender() {
    renderList(qaList, questions, filterInput.value, showAnswers);
    syncToggleBtn();
  }

  try {
    const data = await loadQuestions();
    questions = data.questions || [];
    metaLine.textContent = `共 ${questions.length} 题（版本：${data._meta?.version || '—'}）`;

    doRender();

    filterInput.addEventListener('input', () => doRender());

    // 全局显示/隐藏
    if (toggleAnswersBtn) {
      toggleAnswersBtn.addEventListener('click', () => {
        showAnswers = !showAnswers;
        doRender();
      });
    }

    // 单题显示/隐藏（事件委托）
    qaList.addEventListener('click', (e) => {
      const btn = e.target.closest('.qa-toggle-one');
      if (!btn) return;

      const item = btn.closest('.qa-item');
      const wrap = item.querySelector('.qa-ans-wrap');
      const isHidden = getComputedStyle(wrap).display === 'none';
      wrap.style.display = isHidden ? '' : 'none';
      btn.textContent = isHidden ? '隐藏本题答案' : '显示本题答案';
    });

  } catch (e) {
    console.error(e);
    metaLine.textContent = '题库加载失败。';
    qaList.innerHTML = `<p class="text-muted">无法加载 questions.json，请刷新重试。</p>`;
  }
});