const SESSION_COOKIE = "zeta_admin_session";
const SESSION_TTL_SECONDS = 28800;
const WORKER_VERSION = "cms-github-2026-09-04-12";
const OWNER = "saeedgmal6-tech";
const REPO = "zeta-biotech1";
const BRANCH = "main";
const MAX_UPLOAD = 10 * 1024 * 1024;
const MAX_JSON = 2 * 1024 * 1024;
const CONTENT = new Set([
  "site", "products", "brochures", "news", "certifications", "jobs", "faqs",
  "leads", "analytics", "job-applications", "activity", "testimonials"
]);

const enc = new TextEncoder();
const dec = new TextDecoder();

function base64Encode(value) {
  const bytes = value instanceof Uint8Array ? value : enc.encode(value);
  let result = "";
  for (let i = 0; i < bytes.length; i += 32768) {
    result += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  return btoa(result);
}

function base64Decode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sign(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return base64Encode(new Uint8Array(signature))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function getCookie(request, name) {
  const cookies = (request.headers.get("Cookie") || "").split(";");
  for (const cookie of cookies) {
    const value = cookie.trim();
    const position = value.indexOf("=");
    if (position > 0 && value.slice(0, position) === name) {
      return decodeURIComponent(value.slice(position + 1));
    }
  }
  return null;
}

async function getSession(request, env) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || !env.SESSION_SECRET) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const expected = await sign(env.SESSION_SECRET, parts[0]);
  if (!safeEqual(parts[1], expected)) return null;

  try {
    const data = JSON.parse(dec.decode(base64Decode(parts[0])));
    if (Number(data.exp) < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Zeta-Worker-Version": WORKER_VERSION,
      ...extraHeaders
    }
  });
}

function githubUrl(path) {
  return "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/" + path.split("/").map(encodeURIComponent).join("/");
}

function githubHeaders(env) {
  return {
    "Authorization": "Bearer " + env.GITHUB_TOKEN,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Zeta-Biotech-CMS"
  };
}

function contentName(path) {
  const name = String(path || "")
    .replace(/^\/+/, "")
    .replace(/^content\//, "")
    .replace(/\.json$/i, "");
  return CONTENT.has(name) ? name : null;
}

async function readGithubFile(env, path) {
  const response = await fetch(githubUrl(path) + "?ref=" + BRANCH, {
    headers: githubHeaders(env)
  });

  if (response.status === 404) return { exists: false };
  if (!response.ok) return { error: "GitHub read failed.", status: response.status };

  const data = await response.json();
  const encoded = String(data.content || "").replace(/\s/g, "");
  return {
    exists: true,
    sha: data.sha,
    text: dec.decode(base64Decode(encoded))
  };
}

async function writeGithubFile(env, path, text, message, backup = false, logging = true) {
  const current = await readGithubFile(env, path);
  if (current.error) return current;

  if (backup && current.exists && current.text !== text) {
    const backupPath = "content/backups/" + new Date().toISOString().replace(/[:.]/g, "-") + "-" + path.split("/").pop();
    const backupResponse = await fetch(githubUrl(backupPath), {
      method: "PUT",
      headers: { ...githubHeaders(env), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "CMS backup before update " + path,
        content: base64Encode(current.text),
        branch: BRANCH
      })
    });
    if (!backupResponse.ok) {
      return { error: "Backup failed. The content was not changed.", status: 502 };
    }
  }

  const body = {
    message,
    content: base64Encode(text),
    branch: BRANCH
  };

  if (current.exists) body.sha = current.sha;

  const response = await fetch(githubUrl(path), {
    method: "PUT",
    headers: { ...githubHeaders(env), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: data.message || "GitHub write failed.", status: response.status };
  }

  if (logging && path !== "content/activity.json") {
    await appendActivity(env, {
      action: "update",
      path,
      at: new Date().toISOString()
    });
  }

  return { ok: true, commit: data.commit?.sha || null };
}

async function appendActivity(env, event) {
  const current = await readGithubFile(env, "content/activity.json");
  if (current.error || !current.exists) return current.error ? current : { ok: true };

  let data = { events: [] };
  try {
    data = JSON.parse(current.text);
  } catch {
    data = { events: [] };
  }

  if (!Array.isArray(data.events)) data.events = [];
  data.events.unshift(event);
  data.events = data.events.slice(0, 500);

  return writeGithubFile(
    env,
    "content/activity.json",
    JSON.stringify(data, null, 2) + "\n",
    "Activity log",
    false,
    false
  );
}

async function sendEmail(env, subject, text) {
  if (!env.RESEND_API_KEY) return { ok: false, skipped: true };

  let recipient = "";
  try {
    const current = await readGithubFile(env, "content/site.json");
    if (current.exists) {
      const site = JSON.parse(current.text);
      if (site.company?.emailAlerts === false) return { ok: false, disabled: true };
      recipient = String(site.company?.notificationEmail || site.company?.email || "").trim();
    }
  } catch {
    return { ok: false, noRecipient: true };
  }

  if (!recipient) return { ok: false, noRecipient: true };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: String(env.EMAIL_FROM || "ZETA BIOTECH <onboarding@resend.dev>"),
      to: [recipient],
      subject,
      text
    })
  });

  return response.ok ? { ok: true } : { ok: false, status: response.status };
}

async function saveCollection(request, env, file, key, builder) {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid request." }, 400);
  }

  const item = builder(body);
  if (item.error) return jsonResponse({ ok: false, error: item.error }, 400);

  const current = await readGithubFile(env, file);
  if (current.error) return jsonResponse({ ok: false, error: current.error }, current.status);

  let data = {};
  try {
    data = current.exists ? JSON.parse(current.text) : {};
  } catch {
    data = {};
  }

  if (!Array.isArray(data[key])) data[key] = [];
  data[key].unshift(item.value);
  data[key] = data[key].slice(0, 1000);

  const saved = await writeGithubFile(
    env,
    file,
    JSON.stringify(data, null, 2) + "\n",
    item.message || "Website submission",
    false,
    true
  );

  if (saved.ok && item.emailSubject) {
    sendEmail(env, item.emailSubject, item.emailText || JSON.stringify(item.value, null, 2)).catch(() => {});
  }

  return saved.ok
    ? jsonResponse({ ok: true, id: item.value.id })
    : jsonResponse({ ok: false, error: saved.error }, saved.status);
}

function buildLead(body) {
  const item = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: "New",
    name: String(body.name || "").trim().slice(0, 120),
    company: String(body.company || "").trim().slice(0, 160),
    email: String(body.email || "").trim().slice(0, 180),
    phone: String(body.phone || "").trim().slice(0, 80),
    subject: String(body.subject || "").trim().slice(0, 180),
    message: String(body.message || "").trim().slice(0, 4000),
    lang: String(body.lang || "ar").slice(0, 5)
  };

  if (!item.name || !item.message) return { error: "Name and message are required." };

  return {
    value: item,
    message: "New website contact lead",
    emailSubject: "ZETA BIOTECH — New Lead: " + item.subject,
    emailText:
      "New website lead\n\n" +
      "Name: " + item.name + "\n" +
      "Company: " + item.company + "\n" +
      "Email: " + item.email + "\n" +
      "Phone: " + item.phone + "\n" +
      "Subject: " + item.subject + "\n\n" +
      item.message
  };
}

function buildJobApplication(body) {
  const item = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: "New",
    jobId: String(body.jobId || "").slice(0, 120),
    jobTitle: String(body.jobTitle || "").slice(0, 180),
    name: String(body.name || "").trim().slice(0, 120),
    email: String(body.email || "").trim().slice(0, 180),
    phone: String(body.phone || "").trim().slice(0, 80),
    message: String(body.message || "").trim().slice(0, 3000),
    cvUrl: String(body.cvUrl || "").trim().slice(0, 500)
  };

  if (!item.name || !item.email || !item.jobTitle) {
    return { error: "Name, email and job title are required." };
  }

  return {
    value: item,
    message: "New job application",
    emailSubject: "ZETA BIOTECH — New Job Application: " + item.jobTitle,
    emailText:
      "New job application\n\n" +
      "Name: " + item.name + "\n" +
      "Email: " + item.email + "\n" +
      "Phone: " + item.phone + "\n" +
      "Job: " + item.jobTitle + "\n" +
      "CV: " + item.cvUrl + "\n\n" +
      item.message
  };
}

async function analytics(request, env) {
  if (request.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const type = String(body.type || "page").slice(0, 20);
  const id = String(body.id || body.path || "unknown")
    .slice(0, 180)
    .replace(/[^A-Za-z0-9._\/-]/g, "_");

  const current = await readGithubFile(env, "content/analytics.json");
  if (current.error) return jsonResponse({ ok: false, error: current.error }, current.status);

  let data = {
    pageViews: 0,
    productViews: {},
    newsViews: {},
    brochureViews: {}
  };

  try {
    if (current.exists) data = JSON.parse(current.text);
  } catch {}

  data.pageViews = Number(data.pageViews || 0);
  data.productViews = data.productViews || {};
  data.newsViews = data.newsViews || {};
  data.brochureViews = data.brochureViews || {};

  if (type === "page") data.pageViews += 1;
  if (type === "product") data.productViews[id] = Number(data.productViews[id] || 0) + 1;
  if (type === "news") data.newsViews[id] = Number(data.newsViews[id] || 0) + 1;
  if (type === "brochure") data.brochureViews[id] = Number(data.brochureViews[id] || 0) + 1;

  const saved = await writeGithubFile(
    env,
    "content/analytics.json",
    JSON.stringify(data, null, 2) + "\n",
    "Website analytics update",
    false,
    false
  );

  return saved.ok
    ? jsonResponse({ ok: true })
    : jsonResponse({ ok: false, error: saved.error }, saved.status);
}

async function adminContent(request, env, path) {
  const name = contentName(path);
  if (!name) return jsonResponse({ ok: false, error: "Invalid content path." }, 400);
  if (!await getSession(request, env)) return jsonResponse({ ok: false, error: "Unauthorized" }, 401);

  const file = "content/" + name + ".json";

  if (request.method === "GET") {
    const current = await readGithubFile(env, file);
    if (current.error) return jsonResponse({ ok: false, error: current.error }, current.status);
    if (!current.exists) return jsonResponse({ ok: true, data: null });

    try {
      return jsonResponse({ ok: true, data: JSON.parse(current.text) });
    } catch {
      return jsonResponse({ ok: false, error: "Stored JSON is invalid." }, 500);
    }
  }

  if (request.method !== "PUT") return jsonResponse({ ok: false, error: "Method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const value = Object.prototype.hasOwnProperty.call(body, "data") ? body.data : body;
  const text = JSON.stringify(value, null, 2) + "\n";
  if (text.length > MAX_JSON) return jsonResponse({ ok: false, error: "Content is too large." }, 413);

  const saved = await writeGithubFile(env, file, text, "CMS update " + file, true, true);
  return saved.ok
    ? jsonResponse(saved)
    : jsonResponse({ ok: false, error: saved.error }, saved.status);
}

async function login(request, env) {
  if (request.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed" }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid request." }, 400);
  }

  const missing = [];
  if (!env.ADMIN_USERNAME) missing.push("ADMIN_USERNAME");
  if (!env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!env.SESSION_SECRET) missing.push("SESSION_SECRET");

  if (missing.length) {
    return jsonResponse({
      ok: false,
      error: "Admin authentication is not configured in Cloudflare yet.",
      missing
    }, 503);
  }

  if (!safeEqual(String(body.username || "").trim(), env.ADMIN_USERNAME) ||
      !safeEqual(String(body.password || ""), env.ADMIN_PASSWORD)) {
    return jsonResponse({ ok: false, error: "Invalid username or password." }, 401);
  }

  const payload = base64Encode(JSON.stringify({
    sub: env.ADMIN_USERNAME,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const token = payload + "." + await sign(env.SESSION_SECRET, payload);

  return jsonResponse({ ok: true }, 200, {
    "Set-Cookie": SESSION_COOKIE + "=" + encodeURIComponent(token) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + SESSION_TTL_SECONDS
  });
}

async function upload(request, env) {
  if (!await getSession(request, env)) return jsonResponse({ ok: false, error: "Unauthorized" }, 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON." }, 400);
  }

  const name = String(body.name || "").trim().replace(/[^A-Za-z0-9._-]/g, "_");
  const mime = String(body.mime || "").toLowerCase();
  const data = String(body.data || "");

  if (!name || !data) return jsonResponse({ ok: false, error: "File name and data are required." }, 400);
  if (!/^(image\/(png|jpeg|webp|svg\+xml)|application\/pdf)$/.test(mime) || !/\.(png|jpe?g|webp|svg|pdf)$/i.test(name)) {
    return jsonResponse({ ok: false, error: "Only PNG, JPG, WEBP, SVG and PDF files are allowed." }, 415);
  }
  if (data.length * 0.75 > MAX_UPLOAD) return jsonResponse({ ok: false, error: "Maximum upload size is 10 MB." }, 413);

  const path = "assets/uploads/" + Date.now() + "-" + name;
  const response = await fetch(githubUrl(path), {
    method: "PUT",
    headers: { ...githubHeaders(env), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "CMS upload " + name,
      content: data,
      branch: BRANCH
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) return jsonResponse({ ok: false, error: result.message || "GitHub upload failed." }, response.status);

  await appendActivity(env, { action: "upload", path, at: new Date().toISOString() });
  return jsonResponse({ ok: true, path, url: "/" + path });
}

async function deleteUpload(request, env) {
  if (!await getSession(request, env)) return jsonResponse({ ok: false, error: "Unauthorized" }, 401);

  const path = new URL(request.url).searchParams.get("path") || "";
  if (!/^assets\/uploads\/[A-Za-z0-9._-]+$/.test(path)) return jsonResponse({ ok: false, error: "Invalid file path." }, 400);

  const current = await readGithubFile(env, path);
  if (current.error) return jsonResponse({ ok: false, error: current.error }, current.status);
  if (!current.exists) return jsonResponse({ ok: true, deleted: false });

  const response = await fetch(githubUrl(path), {
    method: "DELETE",
    headers: { ...githubHeaders(env), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "CMS delete " + path,
      sha: current.sha,
      branch: BRANCH
    })
  });

  if (!response.ok) return jsonResponse({ ok: false, error: "GitHub delete failed." }, response.status);

  await appendActivity(env, { action: "delete", path, at: new Date().toISOString() });
  return jsonResponse({ ok: true, deleted: true });
}

async function serveAsset(request, env) {
  const assetResponse = await env.ASSETS.fetch(request);
  const contentType = assetResponse.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return assetResponse;

  let html = await assetResponse.text();
  const pathname = new URL(request.url).pathname;
  const version = "?v=" + WORKER_VERSION;

  let scripts =
    "<script src=\"/public-enhancements.js" + version + "\"></script>" +
    "<script src=\"/public-features.js" + version + "\"></script>" +
    "<script src=\"/public-next.js" + version + "\"></script>";

  const isAdmin = pathname === "/admin" || pathname === "/admin/" || pathname === "/admin/index.html";
  if (isAdmin) {
    scripts =
      "<script src=\"/admin/enhancements.js" + version + "\"></script>" +
      "<script src=\"/admin/features.js" + version + "\"></script>" +
      "<script src=\"/admin/next-features.js" + version + "\"></script>";
  }

  if (pathname === "/" || pathname.endsWith(".html") || isAdmin) {
    const marker = "</body>";
    const position = html.toLowerCase().lastIndexOf(marker);
    if (position >= 0) {
      html = html.slice(0, position) + scripts + html.slice(position);
    } else {
      html += scripts;
    }
  }

  const headers = new Headers(assetResponse.headers);
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  headers.set("X-Zeta-Worker-Version", WORKER_VERSION);

  return new Response(html, {
    status: assetResponse.status,
    headers
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return jsonResponse({
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
    }

    if (url.pathname === "/api/leads") return saveCollection(request, env, "content/leads.json", "leads", buildLead);
    if (url.pathname === "/api/job-applications") return saveCollection(request, env, "content/job-applications.json", "applications", buildJobApplication);
    if (url.pathname === "/api/analytics") return analytics(request, env);
    if (url.pathname === "/api/admin/login") return login(request, env);

    if (url.pathname === "/api/admin/me") {
      const session = await getSession(request, env);
      return session
        ? jsonResponse({ authenticated: true, username: session.sub })
        : jsonResponse({ authenticated: false }, 401);
    }

    if (url.pathname === "/api/admin/logout") {
      return jsonResponse({ ok: true }, 200, {
        "Set-Cookie": SESSION_COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
      });
    }

    if (url.pathname.startsWith("/api/admin/content/")) {
      return adminContent(request, env, url.pathname.slice("/api/admin/content/".length));
    }

    if (url.pathname === "/api/admin/upload") return upload(request, env);
    if (url.pathname === "/api/admin/media/delete") return deleteUpload(request, env);

    return serveAsset(request, env);
  }
};
