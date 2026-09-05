const ZETA_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": "default-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' https: data: blob:; font-src 'self' https: data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
};

function withZetaSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  Object.entries(ZETA_SECURITY_HEADERS).forEach(([name, value]) => headers.set(name, value));
  if (new URL(response.url || 'https://zeta-biotech.com/').protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
