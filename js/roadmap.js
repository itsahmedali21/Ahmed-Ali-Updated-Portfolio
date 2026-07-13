/* ========================================================= 
   Future Roadmap — interactive timeline, filterable by status.
   ========================================================= */
(function(){
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  const STATUS_LABEL = { 'in-progress': 'In progress', planned: 'Planned', goal: 'Career goal' };

  function render(root, filter){
    const items = DATA.roadmap.filter(r => filter === 'all' || r.status === filter);
    root.innerHTML = items.map(item => `
      <div class="roadmap-item status-${item.status} reveal in-view">
        <div class="roadmap-dot"></div>
        <div class="roadmap-content">
          <div class="roadmap-meta"><span class="roadmap-date">${item.date}</span><span class="roadmap-status">${STATUS_LABEL[item.status]}</span></div>
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
      </div>
    `).join('') || '<p class="skill-detail-empty">Nothing in this category yet.</p>';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('roadmap-root');
    const filterBar = document.getElementById('roadmap-filters');
    if (!root) return;

    render(root, 'all');
    if (filterBar) {
      filterBar.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-filter]');
        if (!btn) return;
        filterBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(root, btn.dataset.filter);
      });
    }
  });
})();
