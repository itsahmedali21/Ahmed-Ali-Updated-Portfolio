/* =========================================================
   Visitor Journey Analytics (privacy-friendly, anonymous)
   No cookies, no personal data, no cross-site tracking —
   just aggregate counts stored in Vercel KV via /api/analytics:
     - section views, skill/project clicks (see other modules
       calling window.trackEvent)
     - max scroll depth per session
     - session duration on page leave
   Requires Vercel KV to be linked to the project (see
   DEPLOY-VERCEL.md). If it isn't configured yet, events are
   silently dropped instead of throwing errors.
   ========================================================= */
(function(){
  const sessionStart = Date.now();
  let maxScrollDepth = 0;
  let sent = false;

  function post(event, data){
    try {
      const payload = JSON.stringify({ event, data: data || {}, t: Date.now() });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/analytics', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
      }
    } catch (e) { /* analytics must never break the page */ }
  }

  window.trackEvent = post;

  document.addEventListener('DOMContentLoaded', () => {
    post('page_view', { path: location.pathname });

    // Most-visited sections, via existing scroll-reveal infrastructure
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          post('section_view', { section: entry.target.id });
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('section[id]').forEach(s => sectionIO.observe(s));

    // Most-viewed projects
    document.querySelectorAll('.project-card[data-project-id]').forEach(card => {
      card.addEventListener('click', () => post('project_view', { project: card.dataset.projectId }), { once: false });
    });

    // Scroll depth
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY + window.innerHeight;
      const depth = Math.min(100, Math.round((scrolled / document.documentElement.scrollHeight) * 100));
      if (depth > maxScrollDepth) maxScrollDepth = depth;
    }, { passive: true });

    function sendSessionSummary(){
      if (sent) return;
      sent = true;
      post('session_end', {
        durationMs: Date.now() - sessionStart,
        scrollDepth: maxScrollDepth
      });
    }
    window.addEventListener('pagehide', sendSessionSummary);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') sendSessionSummary(); });
  });
})();
