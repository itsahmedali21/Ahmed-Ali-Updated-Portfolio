/* =========================================================
   Interactive Skill Map
   Renders into #skill-map-root. Clicking a skill shows a
   detail panel with related projects, tech, experience, and
   certifications — all sourced from js/data.js.
   ========================================================= */
(function(){
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  function projectsFor(skill){
    return DATA.projects.filter(p => p.skills && p.skills.includes(skill.id));
  }

  function renderDetail(skill, panel){
    const related = projectsFor(skill);
    panel.innerHTML = `
      <div class="skill-detail-head">
        <h4>${skill.name}</h4>
        <span class="skill-detail-level">${skill.level}%</span>
      </div>
      <p class="skill-detail-exp">${skill.experience}</p>
      <div class="skill-detail-block">
        <div class="skill-detail-label">Related projects</div>
        <div class="skill-detail-projects">
          ${related.length
            ? related.map(p => `<a href="${p.url}" target="_blank" rel="noopener" class="skill-detail-project-chip">${p.name}</a>`).join('')
            : '<span class="skill-detail-empty">No linked projects yet</span>'}
        </div>
      </div>
      <div class="skill-detail-block">
        <div class="skill-detail-label">Certifications</div>
        <div class="skill-detail-projects">
          ${skill.certifications && skill.certifications.length
            ? skill.certifications.map(c => `<span class="skill-detail-project-chip cert">${c}</span>`).join('')
            : '<span class="skill-detail-empty">None listed</span>'}
        </div>
      </div>`;
    panel.hidden = false;
  }

  function buildMap(root){
    const categories = [...new Set(DATA.skills.map(s => s.category))];
    root.innerHTML = `
      <div class="skill-map-nodes">
        ${categories.map(cat => `
          <div class="skill-map-group">
            <div class="skill-map-group-title">${cat}</div>
            <div class="skill-map-bubbles">
              ${DATA.skills.filter(s => s.category === cat).map(s => `
                <button type="button" class="skill-node" data-skill="${s.id}" style="--lvl:${s.level}">
                  <span class="skill-node-name">${s.name}</span>
                  <span class="skill-node-level">${s.level}%</span>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="skill-detail-panel glass-panel" id="skill-detail-panel" hidden aria-live="polite"></div>
    `;

    const panel = root.querySelector('#skill-detail-panel');
    root.querySelectorAll('.skill-node').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.skill-node').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const skill = DATA.skills.find(s => s.id === btn.dataset.skill);
        renderDetail(skill, panel);
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (window.trackEvent) window.trackEvent('skill_click', { skill: skill.id });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('skill-map-root');
    if (root) buildMap(root);
  });
})();
