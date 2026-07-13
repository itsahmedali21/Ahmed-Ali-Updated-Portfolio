/* =========================================================
   Live Project Status
   Renders a status card for every project that has a
   `status` object in data.js.
   ========================================================= */
(function(){
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  function timeAgo(dateStr){
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)} mo ago`;
  }

  function card(proj){
    const s = proj.status;
    return `
      <div class="status-card glass-panel reveal in-view">
        <div class="status-card-head">
          <h4>${proj.name}</h4>
          <span class="status-live-dot" title="Live">● live</span>
        </div>
        <div class="status-progress-track"><div class="status-progress-fill" style="width:${s.progress}%"></div></div>
        <div class="status-progress-label">${s.progress}% — ${s.milestone}</div>
        <div class="status-grid">
          <div>
            <div class="status-label">Changelog</div>
            <ul class="status-list">
              ${s.changelog.map(c => `<li><span>${c.date}</span>${c.text}</li>`).join('')}
            </ul>
          </div>
          <div>
            <div class="status-label">Roadmap</div>
            <ul class="status-list">
              ${s.roadmap.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="status-updated">Last updated ${timeAgo(s.lastUpdated)}</div>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('project-status-root');
    if (!root) return;
    const withStatus = DATA.projects.filter(p => p.status);
    root.innerHTML = withStatus.map(card).join('') || '<p class="skill-detail-empty">No active projects tracked right now.</p>';
  });
})();
