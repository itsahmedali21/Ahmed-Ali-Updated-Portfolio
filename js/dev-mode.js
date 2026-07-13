/* =========================================================
   Developer Mode
   Toggling injects a technical breakdown panel into every
   .project-card that has a matching entry in data.projects.
   State persists in localStorage.
   ========================================================= */
(function(){
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  function row(label, value){
    if (!value || (Array.isArray(value) && !value.length)) return '';
    const val = Array.isArray(value) ? `<ul>${value.map(v => `<li>${v}</li>`).join('')}</ul>` : `<p>${value}</p>`;
    return `<div class="dev-row"><div class="dev-row-label">${label}</div>${val}</div>`;
  }

  function buildPanel(dev){
    return `
      <div class="dev-panel">
        <div class="dev-panel-head">Developer Notes</div>
        ${row('Tech stack', dev.techStack)}
        ${row('Folder structure', dev.folderStructure)}
        ${row('Challenge', dev.challenges)}
        ${row('Solution', dev.solutions)}
        ${row('Performance optimizations', dev.performanceOptimizations)}
        ${row('Development timeline', dev.developmentTimeline)}
        ${row('AI tools used', dev.aiToolsUsed)}
        ${row('Git workflow', dev.gitWorkflow)}
        ${row('Architecture notes', dev.architectureNotes)}
      </div>`;
  }

  function injectPanels(){
    document.querySelectorAll('.project-card[data-project-id]').forEach(card => {
      if (card.querySelector('.dev-panel')) return;
      const proj = DATA.projects.find(p => p.id === card.dataset.projectId);
      if (!proj || !proj.devMode) return;
      const body = card.querySelector('.project-body');
      body.insertAdjacentHTML('beforeend', buildPanel(proj.devMode));
    });
  }

  function setMode(on){
    document.body.classList.toggle('dev-mode', on);
    localStorage.setItem('devMode', on ? '1' : '0');
    document.querySelectorAll('#dev-mode-toggle').forEach(b => b.setAttribute('aria-pressed', String(on)));
    if (on && window.trackEvent) window.trackEvent('dev_mode_enabled', {});
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectPanels();
    const saved = localStorage.getItem('devMode') === '1';
    setMode(saved);
    document.querySelectorAll('#dev-mode-toggle').forEach(btn => {
      btn.addEventListener('click', () => setMode(!document.body.classList.contains('dev-mode')));
    });
  });
})();
