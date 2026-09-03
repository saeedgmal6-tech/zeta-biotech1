const SESSION_COOKIE = "zeta_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const WORKER_VERSION = "runtime-check-2026-09-03-01";

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < left.length; i++) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = cookieHeader.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const part = cookies[i].trim();
    const separator = part.indexOf("=");
    if (separator === -1) {
      continue;
    }
    if (part.substring(0, separator) === name) {
      return decodeURIComponent(part.substring(separator + 1));
    }
  }
  return null;
}

async function createSession(username, secret) {
  const payload = {
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(secret, encodedPayload);
  return encodedPayload + "." + signature;
}

async function verifySession(request, secret) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || !secret) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const expectedSignature = await hmac(secret, parts[0]);
  if (!constantTimeEqual(parts[1], expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function json(data, status, extraHeaders) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: headers
  });
}

function sessionCookie(value) {
  return SESSION_COOKIE + "=" + encodeURIComponent(value) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + SESSION_TTL_SECONDS;
}

function expiredSessionCookie() {
  return SESSION_COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}

async function handleLogin(request, env) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ ok: false, error: "Admin authentication is not configured in Cloudflare yet." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password || username.length > 120 || password.length > 200) {
    return json({ ok: false, error: "Enter your username and password." }, 400);
  }

  const validUser = constantTimeEqual(username, env.ADMIN_USERNAME);
  const validPassword = constantTimeEqual(password, env.ADMIN_PASSWORD);

  if (!validUser || !validPassword) {
    return json({ ok: false, error: "Invalid username or password." }, 401);
  }

  const token = await createSession(username, env.SESSION_SECRET);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": sessionCookie(token),
      "X-Zeta-Worker-Version": WORKER_VERSION
    }
  });
}

async function handleMe(request, env) {
  const session = await verifySession(request, env.SESSION_SECRET);
  if (!session) {
    return json({ authenticated: false }, 401, { "X-Zeta-Worker-Version": WORKER_VERSION });
  }
  return json({ authenticated: true, username: session.sub, expiresAt: session.exp }, 200, { "X-Zeta-Worker-Version": WORKER_VERSION });
}

async function handleLogout() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": expiredSessionCookie(),
      "X-Zeta-Worker-Version": WORKER_VERSION
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({ ok: true, worker: "zeta-biotech", version: WORKER_VERSION }, 200, { "X-Zeta-Worker-Version": WORKER_VERSION });
    }

    if (url.pathname === "/api/admin/login") {
      return handleLogin(request, env);
    }

    if (url.pathname === "/api/admin/me") {
      return handleMe(request, env);
    }

    if (url.pathname === "/api/admin/logout") {
      return handleLogout();
    }

    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      const session = await verifySession(request, env.SESSION_SECRET);
      if (!session) {
        return Response.redirect(new URL("/admin/login.html", request.url), 302);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
