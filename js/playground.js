/* =========================================================
   Project Playground
   For projects with a `playground.themes` array, injects a
   swatch row into the project card. Clicking a swatch
   re-themes a small live mockup preview (not the real site —
   an in-page representation you can safely play with).
   ========================================================= */
(function(){
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  function buildPlayground(proj){
    const themes = proj.playground.themes;
    const wrap = document.createElement('div');
    wrap.className = 'playground';
    wrap.innerHTML = `
      <div class="playground-head">Playground — preview a theme</div>
      <div class="playground-mock" style="--pg-accent:${themes[0].accent}; --pg-bg:${themes[0].bg}">
        <div class="playground-mock-bar"></div>
        <div class="playground-mock-title">${proj.name}</div>
        <div class="playground-mock-btn">Primary action</div>
      </div>
      <div class="playground-swatches">
        ${themes.map((t, i) => `<button type="button" class="playground-swatch ${i === 0 ? 'active' : ''}" style="--sw:${t.accent}" data-accent="${t.accent}" data-bg="${t.bg}" aria-label="${t.name} theme">${t.name}</button>`).join('')}
      </div>`;

    wrap.querySelectorAll('.playground-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.playground-swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mock = wrap.querySelector('.playground-mock');
        mock.style.setProperty('--pg-accent', btn.dataset.accent);
        mock.style.setProperty('--pg-bg', btn.dataset.bg);
        if (window.trackEvent) window.trackEvent('playground_theme', { project: proj.id, theme: btn.textContent });
      });
    });
    return wrap;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-card[data-project-id]').forEach(card => {
      const proj = DATA.projects.find(p => p.id === card.dataset.projectId);
      if (!proj || !proj.playground) return;
      card.querySelector('.project-body').appendChild(buildPlayground(proj));
    });
  });
})();
