/**
 * api/analytics-stats.js
 * Read-only aggregate stats for the Developer Mode analytics dashboard.
 * See api/_lib/redis-client.js + DEPLOY-VERCEL.md §6 for setup notes.
 */

const { getClient } = require('./_lib/redis-client');

function topN(hash, n){
  return Object.entries(hash || {})
    .map(([name, count]) => ({ name, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

module.exports = async (req, res) => {
  let redis;
  try {
    redis = await getClient();
  } catch (e) {
    redis = null;
  }

  if (!redis) {
    res.status(503).json({ error: 'Analytics store not configured.' });
    return;
  }

  try {
    const [pageViews, sections, skills, projects, sessions, sessionDurationTotalMs, scrollSamples, scrollDepthTotal] = await Promise.all([
      redis.get('analytics:pageViews'),
      redis.hgetall('analytics:sections'),
      redis.hgetall('analytics:skills'),
      redis.hgetall('analytics:projects'),
      redis.get('analytics:sessions'),
      redis.get('analytics:sessionDurationTotalMs'),
      redis.get('analytics:scrollSamples'),
      redis.get('analytics:scrollDepthTotal'),
    ]);

    const avgSessionSeconds = sessions ? Math.round((sessionDurationTotalMs || 0) / sessions / 1000) : 0;
    const avgScrollDepth = scrollSamples ? Math.round((scrollDepthTotal || 0) / scrollSamples) : 0;

    res.status(200).json({
      pageViews: pageViews || 0,
      avgSessionSeconds,
      avgScrollDepth,
      topSections: topN(sections, 5),
      topSkills: topN(skills, 5),
      topProjects: topN(projects, 5),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
