/* =========================================================
   Analytics Dashboard
   Read-only view of the aggregate stats collected by
   js/analytics.js + api/analytics.js. Rendered inside the
   Developer Mode panel so casual visitors don't stumble into
   it, while staying honest that it isn't authenticated.
   ========================================================= */
(function(){
  async function load(root){
    root.innerHTML = '<div class="analytics-loading">Loading…</div>';
    try {
      const res = await fetch('/api/analytics-stats');
      if (!res.ok) throw new Error('not configured');
      const stats = await res.json();

      const chipRow = (items) => (items && items.length)
        ? `<div class="analytics-chips">${items.map(s => `<span class="analytics-chip">${s.name}<b>${s.count}</b></span>`).join('')}</div>`
        : '<div class="analytics-chip-empty">—</div>';

      root.innerHTML = `
        <div class="analytics-grid">
          <div class="analytics-stat"><div class="analytics-num">${stats.pageViews || 0}</div><div class="analytics-label">Views</div></div>
          <div class="analytics-stat"><div class="analytics-num">${stats.avgSessionSeconds || 0}s</div><div class="analytics-label">Avg. session</div></div>
          <div class="analytics-stat"><div class="analytics-num">${stats.avgScrollDepth || 0}%</div><div class="analytics-label">Avg. scroll</div></div>
        </div>
        <div class="analytics-lists">
          <div><div class="status-label">Sections</div>${chipRow(stats.topSections)}</div>
          <div><div class="status-label">Skills</div>${chipRow(stats.topSkills)}</div>
          <div><div class="status-label">Projects</div>${chipRow(stats.topProjects)}</div>
        </div>`;
    } catch (e) {
      root.innerHTML = `<div class="analytics-loading">Not connected yet — see DEPLOY-VERCEL.md §6.</div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('analytics-dashboard-root');
    const toggle = document.getElementById('dev-mode-toggle');
    if (!root || !toggle) return;
    let loaded = false;
    const obs = new MutationObserver(() => {
      if (document.body.classList.contains('dev-mode') && !loaded) {
        loaded = true;
        load(root);
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (document.body.classList.contains('dev-mode')) { loaded = true; load(root); }
  });
})();
