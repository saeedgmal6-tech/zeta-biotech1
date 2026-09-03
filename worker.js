const SESSION_COOKIE = "zeta_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const WORKER_VERSION = "cms-github-2026-09-04-01";
const GITHUB_OWNER = "saeedgmal6-tech";
const GITHUB_REPO = "zeta-biotech";
const GITHUB_BRANCH = "main";
const CONTENT_PATHS = new Set([
  "content/site.json",
  "content/products.json",
  "content/brochures.json",
  "content/news.json",
  "content/certifications.json",
  "content/jobs.json",
  "content/leads.json",
  "content/analytics.json"
]);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_JSON_BYTES = 2 * 1024 * 1024;

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i++) result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return result === 0;
}

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const item = part.trim();
    const separator = item.indexOf("=");
    if (separator !== -1 && item.substring(0, separator) === name) return decodeURIComponent(item.substring(separator + 1));
  }
  return null;
}

async function createSession(username, secret) {
  const payload = { sub: username, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return encoded + "." + await hmac(secret, encoded);
}

async function verifySession(request, secret) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const signature = await hmac(secret, parts[0]);
  if (!constantTimeEqual(parts[1], signature)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[0])));
    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function json(data, status, extraHeaders) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Zeta-Worker-Version": WORKER_VERSION };
  if (extraHeaders) Object.assign(headers, extraHeaders);
  return new Response(JSON.stringify(data), { status: status || 200, headers });
}

function sessionCookie(value) {
  return SESSION_COOKIE + "=" + encodeURIComponent(value) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + SESSION_TTL_SECONDS;
}

function expiredSessionCookie() {
  return SESSION_COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}

async function requireAdmin(request, env) {
  return verifySession(request, env.SESSION_SECRET);
}

function githubHeaders(env) {
  return {
    "Authorization": "Bearer " + env.GITHUB_TOKEN,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Zeta-Biotech-CMS"
  };
}

function githubUrl(path) {
  return "https://api.github.com/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/");
}

function isAllowedContentPath(path) {
  return CONTENT_PATHS.has(path);
}

function isAllowedUploadPath(path) {
  return /^assets\/uploads\/[A-Za-z0-9._-]+$/.test(path);
}

function toBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary);
}

async function githubGetFile(env, path) {
  if (!env.GITHUB_TOKEN) return { ok: false, status: 503, error: "GITHUB_TOKEN is not configured in Cloudflare." };
  const response = await fetch(githubUrl(path) + "?ref=" + encodeURIComponent(GITHUB_BRANCH), { headers: githubHeaders(env) });
  if (response.status === 404) return { ok: true, exists: false, content: null };
  if (!response.ok) return { ok: false, status: response.status, error: "GitHub read failed." };
  const data = await response.json();
  const decoded = atob(String(data.content || "").replace(/\n/g, ""));
  const bytes = Uint8Array.from(decoded, c => c.charCodeAt(0));
  return { ok: true, exists: true, sha: data.sha, content: new TextDecoder().decode(bytes) };
}

async function githubPutFile(env, path, content, message, createBackup) {
  if (!env.GITHUB_TOKEN) return { ok: false, status: 503, error: "GITHUB_TOKEN is not configured in Cloudflare." };
  const current = await githubGetFile(env, path);
  if (!current.ok) return current;
  if (createBackup && current.exists && current.content !== content) {
    const safeName = path.substring(path.lastIndexOf("/") + 1).replace(/[^A-Za-z0-9._-]/g, "_");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = "content/backups/" + timestamp + "-" + safeName;
    const backupResponse = await fetch(githubUrl(backupPath), {
      method: "PUT",
      headers: { ...githubHeaders(env), "Content-Type": "application/json" },
      body: JSON.stringify({ message: "CMS backup before update " + path, content: toBase64Utf8(current.content), branch: GITHUB_BRANCH })
    });
    const backupData = await backupResponse.json().catch(() => ({}));
    if (!backupResponse.ok) return { ok: false, status: 502, error: "Backup failed. The content was not changed." };
    const body = { message, content: toBase64Utf8(content), branch: GITHUB_BRANCH, sha: current.sha };
    const response = await fetch(githubUrl(path), { method: "PUT", headers: { ...githubHeaders(env), "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, status: response.status, error: data.message || "GitHub write failed." };
    return { ok: true, commit: data.commit?.sha || null, contentSha: data.content?.sha || null, backup: backupPath, backupCommit: backupData.commit?.sha || null };
  }
  const body = { message, content: toBase64Utf8(content), branch: GITHUB_BRANCH };
  if (current.exists) body.sha = current.sha;
  const response = await fetch(githubUrl(path), { method: "PUT", headers: { ...githubHeaders(env), "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, status: response.status, error: data.message || "GitHub write failed." };
  return { ok: true, commit: data.commit?.sha || null, contentSha: data.content?.sha || null, backup: null };
}

async function githubDeleteFile(env, path) {
  const current = await githubGetFile(env, path);
  if (!current.ok) return current;
  if (!current.exists) return { ok: true, deleted: false };
  const response = await fetch(githubUrl(path), { method: "DELETE", headers: { ...githubHeaders(env), "Content-Type": "application/json" }, body: JSON.stringify({ message: "CMS delete " + path, sha: current.sha, branch: GITHUB_BRANCH }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { ok: false, status: response.status, error: data.message || "GitHub delete failed." };
  return { ok: true, deleted: true, commit: data.commit?.sha || null };
}

async function handleLogin(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({ ok: false, error: "Admin authentication is not configured in Cloudflare yet." }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Invalid request." }, 400); }
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (!username || !password || username.length > 120 || password.length > 200) return json({ ok: false, error: "Enter your username and password." }, 400);
  if (!constantTimeEqual(username, env.ADMIN_USERNAME) || !constantTimeEqual(password, env.ADMIN_PASSWORD)) return json({ ok: false, error: "Invalid username or password." }, 401);
  const token = await createSession(username, env.SESSION_SECRET);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Set-Cookie": sessionCookie(token), "X-Zeta-Worker-Version": WORKER_VERSION } });
}

async function handleMe(request, env) {
  const session = await requireAdmin(request, env);
  if (!session) return json({ authenticated: false }, 401);
  return json({ authenticated: true, username: session.sub, expiresAt: session.exp });
}

function handleLogout() {
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Set-Cookie": expiredSessionCookie(), "X-Zeta-Worker-Version": WORKER_VERSION } });
}

async function handleContent(request, env, path) {
  if (!isAllowedContentPath(path)) return json({ ok: false, error: "Invalid content path." }, 400);
  const session = await requireAdmin(request, env);
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);
  if (request.method === "GET") {
    const result = await githubGetFile(env, path);
    if (!result.ok) return json({ ok: false, error: result.error }, result.status);
    if (!result.exists) return json({ ok: true, data: null });
    try { return json({ ok: true, data: JSON.parse(result.content) }); } catch { return json({ ok: false, error: "Stored JSON is invalid." }, 500); }
  }
  if (request.method !== "PUT") return json({ ok: false, error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Invalid JSON." }, 400); }
  const payload = Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body;
  if (payload === undefined) return json({ ok: false, error: "Missing data." }, 400);
  const content = JSON.stringify(payload, null, 2) + "\n";
  if (content.length > MAX_JSON_BYTES) return json({ ok: false, error: "Content is too large." }, 413);
  const result = await githubPutFile(env, path, content, "CMS update " + path, true);
  if (!result.ok) return json({ ok: false, error: result.error }, result.status);
  return json({ ok: true, commit: result.commit, contentSha: result.contentSha, backup: result.backup || null });
}

async function handleUpload(request, env) {
  const session = await requireAdmin(request, env);
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Invalid JSON." }, 400); }
  const name = String(body.name || "").trim().replace(/[^A-Za-z0-9._-]/g, "_");
  const mime = String(body.mime || "application/octet-stream").toLowerCase();
  const data = String(body.data || "");
  if (!name || !data) return json({ ok: false, error: "File name and data are required." }, 400);
  const allowedMime = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"];
  if (!allowedMime.includes(mime) || !/\.(png|jpe?g|webp|svg|pdf)$/i.test(name)) return json({ ok: false, error: "Only PNG, JPG, WEBP, SVG and PDF files are allowed." }, 415);
  if (Math.floor(data.length * 3 / 4) > MAX_UPLOAD_BYTES) return json({ ok: false, error: "Maximum upload size is 10 MB." }, 413);
  const path = "assets/uploads/" + Date.now() + "-" + name;
  const response = await fetch(githubUrl(path), { method: "PUT", headers: { ...githubHeaders(env), "Content-Type": "application/json" }, body: JSON.stringify({ message: "CMS upload " + name, content: data, branch: GITHUB_BRANCH }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return json({ ok: false, error: result.message || "GitHub upload failed." }, response.status);
  return json({ ok: true, path, url: "/" + path, commit: result.commit?.sha || null });
}

async function handleDeleteFile(request, env) {
  const session = await requireAdmin(request, env);
  if (!session) return json({ ok: false, error: "Unauthorized" }, 401);
  const path = new URL(request.url).searchParams.get("path") || "";
  if (!isAllowedUploadPath(path)) return json({ ok: false, error: "Invalid file path." }, 400);
  const result = await githubDeleteFile(env, path);
  if (!result.ok) return json({ ok: false, error: result.error }, result.status);
  return json(result);
}

async function handlePublicLead(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Invalid JSON." }, 400); }
  const lead = { id: crypto.randomUUID(), date: new Date().toISOString(), status: "New", name: String(body.name || "").trim().slice(0,120), company: String(body.company || "").trim().slice(0,160), email: String(body.email || "").trim().slice(0,180), phone: String(body.phone || "").trim().slice(0,80), subject: String(body.subject || "").trim().slice(0,180), message: String(body.message || "").trim().slice(0,4000), lang: String(body.lang || "ar").slice(0,5) };
  if (!lead.name || !lead.message) return json({ ok: false, error: "Name and message are required." }, 400);
  const current = await githubGetFile(env, "content/leads.json");
  if (!current.ok) return json({ ok: false, error: current.error }, current.status);
  let data = { leads: [] };
  if (current.exists) { try { data = JSON.parse(current.content); } catch {} }
  if (!Array.isArray(data.leads)) data.leads = [];
  data.leads.unshift(lead);
  data.leads = data.leads.slice(0, 1000);
  const result = await githubPutFile(env, "content/leads.json", JSON.stringify(data, null, 2) + "\n", "New website contact lead", false);
  if (!result.ok) return json({ ok: false, error: result.error }, result.status);
  return json({ ok: true, id: lead.id });
}

async function handlePublicAnalytics(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Invalid JSON." }, 400); }
  const type = String(body.type || "page").slice(0,20);
  const id = String(body.id || body.path || "unknown").slice(0,180).replace(/[^A-Za-z0-9._\/-]/g, "_");
  const current = await githubGetFile(env, "content/analytics.json");
  if (!current.ok) return json({ ok: false, error: current.error }, current.status);
  let data = { pageViews: 0, productViews: {}, newsViews: {}, brochureViews: {} };
  if (current.exists) { try { data = JSON.parse(current.content); } catch {} }
  data.productViews = data.productViews || {}; data.newsViews = data.newsViews || {}; data.brochureViews = data.brochureViews || {};
  if (type === "page") data.pageViews = Number(data.pageViews || 0) + 1;
  else if (type === "product") data.productViews[id] = Number(data.productViews[id] || 0) + 1;
  else if (type === "news") data.newsViews[id] = Number(data.newsViews[id] || 0) + 1;
  else if (type === "brochure") data.brochureViews[id] = Number(data.brochureViews[id] || 0) + 1;
  const result = await githubPutFile(env, "content/analytics.json", JSON.stringify(data, null, 2) + "\n", "Website analytics update", false);
  if (!result.ok) return json({ ok: false, error: result.error }, result.status);
  return json({ ok: true });
}

async function injectPublicEnhancements(request, response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  const url = new URL(request.url);
  if (!["/", "/index.html", "/product-details.html", "/news-details.html"].includes(url.pathname)) return response;
  return new HTMLRewriter().on("body", { element(element) { element.append('<script src="/public-enhancements.js?v=20260904"></script>', { html: true }); } }).transform(response);
}

async function injectAdminEnhancements(response) {
  return new HTMLRewriter().on("body", { element(element) { element.append('<script src="/admin/enhancements.js?v=20260904"></script>', { html: true }); } }).transform(response);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") return json({ ok: true, worker: "zeta-biotech", version: WORKER_VERSION });
    if (url.pathname === "/api/leads") return handlePublicLead(request, env);
    if (url.pathname === "/api/analytics") return handlePublicAnalytics(request, env);
    if (url.pathname === "/api/admin/login") return handleLogin(request, env);
    if (url.pathname === "/api/admin/me") return handleMe(request, env);
    if (url.pathname === "/api/admin/logout") return handleLogout();
    if (url.pathname.startsWith("/api/admin/content/")) return handleContent(request, env, url.pathname.substring("/api/admin/content/".length).replace(/^\/+/, ""));
    if (url.pathname === "/api/admin/upload") return handleUpload(request, env);
    if (url.pathname === "/api/admin/file") return handleDeleteFile(request, env);
    if (url.pathname === "/admin" || url.pathname === "/admin/" || url.pathname === "/admin/index.html") {
      const session = await requireAdmin(request, env);
      if (!session) return Response.redirect(new URL("/admin/login.html", request.url), 302);
    }
    const assetResponse = await env.ASSETS.fetch(request);
    if (url.pathname === "/admin/index.html" && request.method === "GET" && assetResponse.ok) return injectAdminEnhancements(assetResponse);
    return injectPublicEnhancements(request, assetResponse);
  }
};
