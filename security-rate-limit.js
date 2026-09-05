const ZETA_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const ZETA_RATE_LIMIT_MAX = 60;
const zetaRateBuckets = new Map();

function zetaClientKey(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'anonymous';
}

function zetaRateLimit(request) {
  const now = Date.now();
  const key = zetaClientKey(request);
  const current = zetaRateBuckets.get(key);
  if (!current || now - current.started >= ZETA_RATE_LIMIT_WINDOW_MS) {
    zetaRateBuckets.set(key, { started: now, count: 1 });
    return null;
  }
  current.count += 1;
  if (current.count > ZETA_RATE_LIMIT_MAX) {
    return new Response(JSON.stringify({ ok:false, error:'Too many requests' }), { status:429, headers:{ 'Content-Type':'application/json', 'Cache-Control':'no-store', 'Retry-After':'60' } });
  }
  return null;
}
