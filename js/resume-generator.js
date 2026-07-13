/* =========================================================
   AI Resume Generator
   Rule-based: composes a role-tailored resume from data.js
   (no external API). Structured so `compose()` could be
   swapped for a real LLM call later without changing the UI.
   ========================================================= */
(function(){
  const DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  function compose(roleKey){
    const role = DATA.resumeRoles[roleKey];
    const skills = role.skillIds.map(id => DATA.skills.find(s => s.id === id)).filter(Boolean);
    const projects = role.projectIds.map(id => DATA.projects.find(p => p.id === id)).filter(Boolean);
    const p = DATA.profile;

    return {
      html: `
        <div class="resume-doc">
          <div class="resume-doc-head">
            <h3>${p.name}</h3>
            <div class="resume-doc-role">${role.title}</div>
            <div class="resume-doc-contact">${p.location} · ${p.email}</div>
          </div>
          <div class="resume-doc-section">
            <h4>Summary</h4>
            <p>${role.summary}</p>
          </div>
          <div class="resume-doc-section">
            <h4>Core Skills</h4>
            <ul class="resume-doc-skills">
              ${skills.map(s => `<li>${s.name} — ${s.level}%</li>`).join('')}
            </ul>
          </div>
          <div class="resume-doc-section">
            <h4>Selected Projects</h4>
            ${projects.map(proj => `
              <div class="resume-doc-project">
                <div class="resume-doc-project-title">${proj.name} <span>— ${proj.tagline}</span></div>
                <div class="resume-doc-project-tags">${(proj.devMode?.techStack || []).slice(0, 5).join(', ')}</div>
              </div>`).join('')}
          </div>
          <div class="resume-doc-section">
            <h4>Experience</h4>
            <p>${p.experienceYears} years across development, Webflow, SEO, and AI-assisted builds — ${p.projectsShipped} projects shipped.</p>
          </div>
        </div>`,
      text: `${p.name}\n${role.title}\n${p.location} · ${p.email}\n\nSUMMARY\n${role.summary}\n\nCORE SKILLS\n${skills.map(s => `- ${s.name} (${s.level}%)`).join('\n')}\n\nSELECTED PROJECTS\n${projects.map(proj => `- ${proj.name} — ${proj.tagline}\n  Stack: ${(proj.devMode?.techStack || []).join(', ')}`).join('\n')}\n\nEXPERIENCE\n${p.experienceYears} years across development, Webflow, SEO, and AI-assisted builds — ${p.projectsShipped} projects shipped.\n`
    };
  }

  function download(text, filename){
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('resume-role-select');
    const output = document.getElementById('resume-output');
    const downloadBtn = document.getElementById('resume-download');
    const printBtn = document.getElementById('resume-print');
    if (!select || !output) return;

    let current = null;

    function generate(){
      const roleKey = select.value;
      current = compose(roleKey);
      output.innerHTML = current.html;
      output.hidden = false;
      downloadBtn.hidden = false;
      printBtn.hidden = false;
      if (window.trackEvent) window.trackEvent('resume_generated', { role: roleKey });
    }

    select.addEventListener('change', generate);
    downloadBtn?.addEventListener('click', () => {
      if (current) download(current.text, `Ahmed-Ali-Resume-${select.value}.txt`);
    });
    printBtn?.addEventListener('click', () => {
      document.body.classList.add('printing-resume');
      window.print();
      setTimeout(() => document.body.classList.remove('printing-resume'), 500);
    });

    // Generate an initial resume for the default selected role
    generate();
  });
})();
