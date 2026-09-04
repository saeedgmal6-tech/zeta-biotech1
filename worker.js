const SESSION_COOKIE = "zeta_admin_session";
const SESSION_TTL_SECONDS = 28800;
const WORKER_VERSION = "cms-github-2026-09-04-11";
const OWNER = "saeedgmal6-tech";
const REPO = "zeta-biotech1";
const BRANCH = "main";
const MAX_UPLOAD = 10 * 1024 * 1024;
const MAX_JSON = 2 * 1024 * 1024;
const CONTENT = new Set(["site", "products", "brochures", "news", "certifications", "jobs", "faqs", "leads", "analytics", "job-applications", "activity", "testimonials"]);
const enc = new TextEncoder();
const dec = new TextDecoder();

function b64(value) {
  const bytes = value instanceof Uint8Array ? value : enc.encode(value);
  let result = "";
  for (let i = 0; i < bytes.length; i += 32768) {
    result += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  return btoa(result);
}

function ub64(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(secret, value) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(value))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function eq(a, b) {
  if (a.length !== b.length) return false;
  let n = 0;
  for (let i = 0; i < a.length; i++) n |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return n === 0;
}

function cookie(request, name) {
  for (const item of (request.headers.get("Cookie") || "").split(";")) {
    const value = item.trim();
    const pos = value.indexOf("=");
    if (pos > 0 && value.slice(0, pos) === name) return decodeURIComponent(value.slice(pos + 1));
  }
  return null;
}

async function session(request, env) {
  const token = cookie(request, SESSION_COOKIE);
  if (!token || !env.SESSION_SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !eq(parts[1], await sign(env.SESSION_SECRET, parts[0]))) return null;
  try {
    const data = JSON.parse(dec.decode(ub64(parts[0])));
    return data.exp >= Date.now() / 1000 ? data : null;
  } catch {
    return null;
  }
}

function out(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store",
      "X-Zeta-Worker-Version": WORKER_VERSION,
      ...headers
    }
  });
}

function gh(path) {
  return "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/");
}

function ghh(env) {
  return {
    Authorization: "Bearer " + env.GITHUB_TOKEN,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Zeta-Biotech-CMS"
  };
}

function pname(path) {
  path = String(path || "").replace(/^\/+/, "").replace(/^content\//, "").replace(/\.json$/i, "");
  return CONTENT.has(path) ? path : null;
}

async function getf(env, path) {
  const response = await fetch(gh(path) + "?ref=" + BRANCH, { headers: ghh(env) });
  if (response.status === 404) return { exists: false };
  if (!response.ok) return { error: "GitHub read failed.", status: response.status };
  const data = await response.json();
  return { exists: true, sha: data.sha, text: dec.decode(ub64(String(data.content || "").replace(/\n/g, ""))) };
}

async function log(env, event) {
  const current = await getf(env, "content/activity.json");
  if (current.error || !current.exists) return current.error ? current : { ok: true };
  let data = { events: [] };
  try { data = JSON.parse(current.text); } catch {}
  if (!Array.isArray(data.events)) data.events = [];
  data.events.unshift(event);
  data.events = data.events.slice(0, 500);
  return putf(env, "content/activity.json", JSON.stringify(data, null, 2) + "\n", "Activity log", false, false);
}

async function putf(env, path, text, message, backup = false, logging = true) {
  const current = await getf(env, path);
  if (current.error) return current;

  if (backup && current.exists && current.text !== text) {
    const backupPath = "content/backups/" + new Date().toISOString().replace(/[:.]/g, "-") + "-" + path.split("/").pop();
    const backupResponse = await fetch(gh(backupPath), {
      method: "PUT",
      headers: { ...ghh(env), "Content-Type": "application/json" },
      body: JSON.stringify({ message: "CMS backup before update " + path, content: b64(current.text), branch: BRANCH })
    });
    if (!backupResponse.ok) return { error: "Backup failed. The content was not changed.", status: 502 };
  }

  const body = { message, content: b64(text), branch: BRANCH };
  if (current.exists) body.sha = current.sha;
  const response = await fetch(gh(path), {
    method: "PUT",
    headers: { ...ghh(env), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return { error: data.message || "GitHub write failed.", status: response.status };
  if (logging && path !== "content/activity.json") await log(env, { action: "update", path, at: new Date().toISOString() });
  return { ok: true, commit: data.commit?.sha || null };
}

async function sendEmail(env, subject, text) {
  if (!env.RESEND_API_KEY) return { ok: false, skipped: true };
  let recipient = "";
  try {
    const current = await getf(env, "content/site.json");
    if (current.exists) {
      const site = JSON.parse(current.text);
      if (site.company?.emailAlerts === false) return { ok: false, disabled: true };
      recipient = String(site.company?.notificationEmail || site.company?.email || "").trim();
    }
  } catch {}
  if (!recipient) return { ok: false, noRecipient: true };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: String(env.EMAIL_FROM || "ZETA BIOTECH <onboarding@resend.dev>"),
      to: [recipient],
      subject,
      text
    })
  });
  return response.ok ? { ok: true } : { ok: false, status: response.status };
}

async function postCollection(request, env, file, key, make) {
  if (request.method !== "POST") return out({ ok: false, error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return out({ ok: false, error: "Invalid request." }, 400); }
  const item = make(body);
  if (item.error) return out({ ok: false, error: item.error }, 400);
  const current = await getf(env, file);
  if (current.error) return out({ ok: false, error: current.error }, current.status);
  let data = { [key]: [] };
  if (current.exists) try { data = JSON.parse(current.text); } catch {}
  if (!Array.isArray(data[key])) data[key] = [];
  data[key].unshift(item.value);
  data[key] = data[key].slice(0, 1000);
  const saved = await putf(env, file, JSON.stringify(data, null, 2) + "\n", item.message || "Website submission", false, true);
  if (saved.ok && item.emailSubject) sendEmail(env, item.emailSubject, item.emailText || JSON.stringify(item.value, null, 2)).catch(() => {});
  return saved.ok ? out({ ok: true, id: item.value.id }) : out({ ok: false, error: saved.error }, saved.status);
}

async function lead(request, env) {
  return postCollection(request, env, "content/leads.json", "leads", body => {
    const item = {
      id: crypto.randomUUID(), date: new Date().toISOString(), status: "New",
      name: String(body.name || "").trim().slice(0, 120), company: String(body.company || "").trim().slice(0, 160),
      email: String(body.email || "").trim().slice(0, 180), phone: String(body.phone || "").trim().slice(0, 80),
      subject: String(body.subject || "").trim().slice(0, 180), message: String(body.message || "").trim().slice(0, 4000),
      lang: String(body.lang || "ar").slice(0, 5)
    };
    return !item.name || !item.message ? { error: "Name and message are required." } : {
      value: item,
      message: "New website contact lead",
      emailSubject: "ZETA BIOTECH — New Lead: " + item.subject,
      emailText: "New website lead\n\nName: " + item.name + "\nCompany: " + item.company + "\nEmail: " + item.email + "\nPhone: " + item.phone + "\nSubject: " + item.subject + "\n\n" + item.message
    };
  });
}

async function jobApplication(request, env) {
  return postCollection(request, env, "content/job-applications.json", "applications", body => {
    const item = {
      id: crypto.randomUUID(), date: new Date().toISOString(), status: "New",
      jobId: String(body.jobId || "").slice(0, 120), jobTitle: String(body.jobTitle || "").slice(0, 180),
      name: String(body.name || "").trim().slice(0, 120), email: String(body.email || "").trim().slice(0, 180),
      phone: String(body.phone || "").trim().slice(0, 80), message: String(body.message || "").trim().slice(0, 3000),
      cvUrl: String(body.cvUrl || "").trim().slice(0, 500)
    };
    return !item.name || !item.email || !item.jobTitle ? { error: "Name, email and job title are required." } : {
      value: item,
      message: "New job application",
      emailSubject: "ZETA BIOTECH — New Job Application: " + item.jobTitle,
      emailText: "New job application\n\nName: " + item.name + "\nEmail: " + item.email + "\nPhone: " + item.phone + "\nJob: " + item.jobTitle + "\nCV: " + item.cvUrl + "\n\n" + item.message
    };
  });
}

async function analytics(request, env) {
  if (request.method !== "POST") return out({ ok: false, error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return out({ ok: false, error: "Invalid JSON." }, 400); }
  const type = String(body.type || "page").slice(0, 20);
  const id = String(body.id || body.path || "unknown").slice(0, 180).replace(/[^A-Za-z0-9._\/-]/g, "_");
  const current = await getf(env, "content/analytics.json");
  if (current.error) return out({ ok: false, error: current.error }, current.status);
  let data = { pageViews: 0, productViews: {}, newsViews: {}, brochureViews: {} };
  if (current.exists) try { data = JSON.parse(current.text); } catch {}
  data.productViews = data.productViews || {};
  data.newsViews = data.newsViews || {};
  data.brochureViews = data.brochureViews || {};
  if (type === "page") data.pageViews = Number(data.pageViews || 0) + 1;
  else if (type === "product") data.productViews[id] = Number(data.productViews[id] || 0) + 1;
  else if (type === "news") data.newsViews[id] = Number(data.newsViews[id] || 0) + 1;
  else if (type === "brochure") data.brochureViews[id] = Number(data.brochureViews[id] || 0) + 1;
  const saved = await putf(env, "content/analytics.json", JSON.stringify(data, null, 2) + "\n", "Website analytics update", false, true);
  return saved.ok ? out({ ok: true }) : out({ ok: false, error: saved.error }, saved.status);
}

async function adminContent(request, env, path) {
  const name = pname(path);
  if (!name) return out({ ok: false, error: "Invalid content path." }, 400);
  if (!await session(request, env)) return out({ ok: false, error: "Unauthorized" }, 401);
  const file = "content/" + name + ".json";
  if (request.method === "GET") {
    const current = await getf(env, file);
    if (current.error) return out({ ok: false, error: current.error }, current.status);
    if (!current.exists) return out({ ok: true, data: null });
    try { return out({ ok: true, data: JSON.parse(current.text) }); }
    catch { return out({ ok: false, error: "Stored JSON is invalid." }, 500); }
  }
  if (request.method !== "PUT") return out({ ok: false, error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return out({ ok: false, error: "Invalid JSON." }, 400); }
  const text = JSON.stringify(Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body, null, 2) + "\n";
  if (text.length > MAX_JSON) return out({ ok: false, error: "Content is too large." }, 413);
  const saved = await putf(env, file, text, "CMS update " + file, true, true);
  return saved.ok ? out(saved) : out({ ok: false, error: saved.error }, saved.status);
}

async function login(request, env) {
  if (request.method !== "POST") return out({ ok: false, error: "Method not allowed" }, 405);
  let body;
  try { body = await request.json(); } catch { return out({ ok: false, error: "Invalid request." }, 400); }
  const missing = [];
  if (!env.ADMIN_USERNAME) missing.push("ADMIN_USERNAME");
  if (!env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!env.SESSION_SECRET) missing.push("SESSION_SECRET");
  if (missing.length) return out({ ok: false, error: "Admin authentication is not configured in Cloudflare yet.", missing }, 503);
  if (!eq(String(body.username || "").trim(), env.ADMIN_USERNAME) || !eq(String(body.password || ""), env.ADMIN_PASSWORD)) return out({ ok: false, error: "Invalid username or password." }, 401);
  const payload = b64(JSON.stringify({ sub: env.ADMIN_USERNAME, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const token = payload + "." + await sign(env.SESSION_SECRET, payload);
  return out({ ok: true }, 200, { "Set-Cookie": SESSION_COOKIE + "=" + encodeURIComponent(token) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + SESSION_TTL_SECONDS });
}

async function upload(request, env) {
  if (!await session(request, env)) return out({ ok: false, error: "Unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch { return out({ ok: false, error: "Invalid JSON." }, 400); }
  const name = String(body.name || "").trim().replace(/[^A-Za-z0-9._-]/g, "_");
  const mime = String(body.mime || "").toLowerCase();
  const data = String(body.data || "");
  if (!name || !data) return out({ ok: false, error: "File name and data are required." }, 400);
  if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"].includes(mime) || !/\.(png|jpe?g|webp|svg|pdf)$/i.test(name)) return out({ ok: false, error: "Only PNG, JPG, WEBP, SVG and PDF files are allowed." }, 415);
  if (data.length * 0.75 > MAX_UPLOAD) return out({ ok: false, error: "Maximum upload size is 10 MB." }, 413);
  const path = "assets/uploads/" + Date.now() + "-" + name;
  const response = await fetch(gh(path), {
    method: "PUT",
    headers: { ...ghh(env), "Content-Type": "application/json" },
    body: JSON.stringify({ message: "CMS upload " + name, content: data, branch: BRANCH })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return out({ ok: false, error: result.message || "GitHub upload failed." }, response.status);
  await log(env, { action: "upload", path, at: new Date().toISOString() });
  return out({ ok: true, path, url: "/" + path });
}

async function del(request, env) {
  if (!await session(request, env)) return out({ ok: false, error: "Unauthorized" }, 401);
  const path = new URL(request.url).searchParams.get("path") || "";
  if (!/^assets\/uploads\/[A-Za-z0-9._-]+$/.test(path)) return out({ ok: false, error: "Invalid file path." }, 400);
  const current = await getf(env, path);
  if (current.error) return out({ ok: false, error: current.error }, current.status);
  if (!current.exists) return out({ ok: true, deleted: false });
  const response = await fetch(gh(path), {
    method: "DELETE",
    headers: { ...ghh(env), "Content-Type": "application/json" },
    body: JSON.stringify({ message: "CMS delete " + path, sha: current.sha, branch: BRANCH })
  });
  if (!response.ok) return out({ ok: false, error: "GitHub delete failed." }, response.status);
  await log(env, { action: "delete", path, at: new Date().toISOString() });
  return out({ ok: true, deleted: true });
}

async function serve(request, env) {
  const asset = await env.ASSETS.fetch(request);
  const contentType = asset.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return asset;

  let html = await asset.text();
  const path = new URL(request.url).pathname;
  const version = "?v=" + WORKER_VERSION;
  let scripts = "<script src=\"/public-enhancements.js" + version + "\"></script>" +
    "<script src=\"/public-features.js" + version + "\"></script>" +
    "<script src=\"/public-next.js" + version + "\"></script>";

  if (path === "/admin" || path === "/admin/" || path === "/admin/index.html") {
    scripts = "<script src=\"/admin/enhancements.js" + version + "\"></script>" +
      "<script src=\"/admin/features.js" + version + "\"></script>" +
      "<script src=\"/admin/next-features.js" + version + "\"></script>";
  }

  if (path === "/admin" || path === "/admin/" || path === "/admin/index.html" || path === "/" || path.endsWith(".html")) {
    const marker = "</body>";
    const position = html.toLowerCase().lastIndexOf(marker);
    if (position >= 0) {
      html = html.slice(0, position) + scripts + html.slice(position);
    } else {
      html += scripts;
    }
  }

  const headers = new Headers(asset.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("X-Zeta-Worker-Version", WORKER_VERSION);
  return new Response(html, { status: asset.status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") return out({
      ok: true,
      worker: "zeta-biotech",
      version: WORKER_VERSION,
      repo: REPO,
      bindings: {
        ADMIN_USERNAME: !!env.ADMIN_USERNAME,
        ADMIN_PASSWORD: !!env.ADMIN_PASSWORD,
        GITHUB_TOKEN: !!env.GITHUB_TOKEN,
        SESSION_SECRET: !!env.SESSION_SECRET,
        RESEND_API_KEY: !!env.RESEND_API_KEY
      }
    });
    if (url.pathname === "/api/leads") return lead(request, env);
    if (url.pathname === "/api/job-applications") return jobApplication(request, env);
    if (url.pathname === "/api/analytics") return analytics(request, env);
    if (url.pathname === "/api/admin/login") return login(request, env);
    if (url.pathname === "/api/admin/me") {
      const current = await session(request, env);
      return current ? out({ authenticated: true, username: current.sub }) : out({ authenticated: false }, 401);
    }
    if (url.pathname === "/api/admin/logout") return out({ ok: true }, 200, { "Set-Cookie": SESSION_COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
    if (url.pathname.startsWith("/api/admin/content/")) return adminContent(request, env, url.pathname.slice("/api/admin/content/".length));
    if (url.pathname === "/api/admin/upload") return upload(request, env);
    if (url.pathname === "/api/admin/media/delete") return del(request, env);
    return serve(request, env);
  }
};