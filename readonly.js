(() => {
  'use strict';
  const blocked = '#add-shot,#undo-delete,.row-actions,.drag-handle,input[type="file"]';
  const badge = document.createElement('span');
  badge.className = 'online-badge';
  badge.textContent = '在线查看';
  document.querySelector('.topbar .actions').append(badge);
  document.getElementById('plot-status').textContent = '当前五场完整稿 · 待导演审阅 · 在线查看';
  document.getElementById('plot-editor').setAttribute('aria-label', '剧本正文，只读');

  const applyReadonly = () => {
    document.querySelectorAll('textarea,input:not([type="file"])').forEach(el => { el.readOnly = true; });
    document.querySelectorAll('select[data-board-field]').forEach(el => { el.disabled = true; });
    document.querySelectorAll('[draggable="true"]').forEach(el => { el.draggable = false; });
    document.querySelectorAll('.frame-empty span').forEach(el => { el.textContent = '分镜草图待补'; });
    document.querySelectorAll('[data-board-image]').forEach(el => {
      el.setAttribute('aria-label', el.querySelector('img') ? '放大查看分镜草图' : '分镜草图待补');
    });
    document.querySelectorAll('.asset-image,.schedule-card img').forEach(el => {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', '放大查看：' + el.alt);
      el.loading = 'lazy';
    });
    document.querySelectorAll('.frame-links a').forEach(el => {
      if (el.textContent === '查看原图') el.textContent = '查看大图';
    });
    document.querySelectorAll('[data-view="shots"] .helper').forEach(el => {
      el.textContent = '可切换剧情组、查看分镜大图或复制整组提示词。当前造型与草图的审核状态以正文标注为准。';
    });
  };
  applyReadonly();
  new MutationObserver(applyReadonly).observe(document.getElementById('shot-body'), {childList:true});

  const viewer = document.createElement('dialog');
  viewer.className = 'online-viewer';
  viewer.setAttribute('aria-label', '图片大图');
  viewer.innerHTML = '<header><span></span><button type="button" aria-label="关闭大图">关闭 ×</button></header><img alt="">';
  document.body.append(viewer);
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
  });
  let previousOverflow = '';
  viewer.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
  const openImage = element => {
    const image = element.matches('img') ? element : element.querySelector('img');
    if (!image) return;
    viewer.querySelector('img').src = image.currentSrc || image.src;
    viewer.querySelector('img').alt = image.alt;
    viewer.querySelector('span').textContent = image.alt || '图片大图';
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewer.showModal();
  };
  const imageSelector = '[data-board-image],.asset-image,.schedule-card img';
  document.addEventListener('click', event => {
    if (event.target.closest(blocked)) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    const image = event.target.closest(imageSelector);
    if (image) { event.preventDefault(); event.stopImmediatePropagation(); openImage(image); }
  }, true);
  document.addEventListener('keydown', event => {
    const image = event.target.closest(imageSelector);
    if (image && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); event.stopImmediatePropagation(); openImage(image);
    }
  }, true);
  ['paste','drop','dragstart'].forEach(name => document.addEventListener(name, event => {
    event.preventDefault(); event.stopImmediatePropagation();
  }, true));
})();
