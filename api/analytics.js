/**
 * api/analytics.js
 * Vercel serverless function — receives anonymous visitor-journey
 * events from js/analytics.js and increments aggregate counters in
 * Redis (works with either Marketplace option — Upstash or Redis
 * Cloud — see api/_lib/redis-client.js). Stores NO personal data,
 * NO IP addresses, NO cookies — just counts and running averages.
 *
 * See DEPLOY-VERCEL.md §6 for one-time setup. Until a store is
 * connected, this endpoint fails quietly and the site keeps working
 * normally — analytics is additive, never blocking.
 */

const { getClient } = require('./_lib/redis-client');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Invalid request method.' });
    return;
  }

  let redis;
  try {
    redis = await getClient();
  } catch (e) {
    redis = null;
  }

  if (!redis) {
    res.status(200).json({ success: true, stored: false });
    return;
  }

  try {
    const { event, data } = req.body || {};
    if (!event) {
      res.status(200).json({ success: false, error: 'Missing event name.' });
      return;
    }

    switch (event) {
      case 'page_view':
        await redis.incr('analytics:pageViews');
        break;
      case 'section_view':
        if (data?.section) await redis.hincrby('analytics:sections', data.section, 1);
        break;
      case 'skill_click':
        if (data?.skill) await redis.hincrby('analytics:skills', data.skill, 1);
        break;
      case 'project_view':
        if (data?.project) await redis.hincrby('analytics:projects', data.project, 1);
        break;
      case 'ai_guide_opened':
        await redis.incr('analytics:aiGuideOpens');
        break;
      case 'resume_generated':
        if (data?.role) await redis.hincrby('analytics:resumeRoles', data.role, 1);
        break;
      case 'session_end':
        if (typeof data?.durationMs === 'number') {
          await redis.incr('analytics:sessions');
          await redis.incrby('analytics:sessionDurationTotalMs', Math.round(data.durationMs));
        }
        if (typeof data?.scrollDepth === 'number') {
          await redis.incr('analytics:scrollSamples');
          await redis.incrby('analytics:scrollDepthTotal', Math.round(data.scrollDepth));
        }
        break;
      default:
        await redis.hincrby('analytics:misc', event, 1);
    }

    res.status(200).json({ success: true, stored: true });
  } catch (err) {
    // Never let analytics errors surface to the visitor.
    res.status(200).json({ success: false, error: err.message });
  }
};
