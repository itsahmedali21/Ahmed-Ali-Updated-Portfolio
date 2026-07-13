/**
 * api/_lib/redis-client.js
 * Shared helper so api/analytics.js and api/analytics-stats.js don't care
 * which Redis integration you connected in the Vercel Marketplace.
 *
 * Supports both of the current options (Vercel KV is sunset — see
 * DEPLOY-VERCEL.md §6):
 *   - "Upstash" → REST API, env vars KV_REST_API_URL/TOKEN or
 *     UPSTASH_REDIS_REST_URL/TOKEN → uses @upstash/redis
 *   - "Redis" (Redis Cloud, official) → a connection string env var named
 *     after your database, e.g. REDIS_URL or <name>_REDIS_URL → uses the
 *     standard `redis` (node-redis) package
 *
 * Files/folders prefixed with `_` are ignored by Vercel's file-based
 * routing, so this helper is never itself exposed as an endpoint.
 */

function findConnectionStringUrl(){
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  const key = Object.keys(process.env).find(k => /_REDIS_URL$/i.test(k));
  return key ? process.env[key] : null;
}

let clientPromise = null;

async function getClient(){
  if (clientPromise) return clientPromise;

  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // Option A: Upstash-style REST API
  if (restUrl && restToken) {
    const { Redis } = require('@upstash/redis');
    const redis = new Redis({ url: restUrl, token: restToken });
    clientPromise = Promise.resolve({
      get: (k) => redis.get(k),
      incr: (k) => redis.incr(k),
      incrby: (k, n) => redis.incrby(k, n),
      hincrby: (k, f, n) => redis.hincrby(k, f, n),
      hgetall: (k) => redis.hgetall(k),
    });
    return clientPromise;
  }

  // Option B: standard Redis connection string (Redis Cloud / "Redis" integration)
  const connUrl = findConnectionStringUrl();
  if (connUrl) {
    const { createClient } = require('redis');
    const client = createClient({ url: connUrl });
    client.on('error', () => { /* swallow — analytics must never crash the site */ });
    clientPromise = client.connect().then(() => ({
      get: (k) => client.get(k),
      incr: (k) => client.incr(k),
      incrby: (k, n) => client.incrBy(k, n),
      hincrby: (k, f, n) => client.hIncrBy(k, f, n),
      hgetall: (k) => client.hGetAll(k),
    })).catch(() => null);
    return clientPromise;
  }

  return null;
}

module.exports = { getClient };
