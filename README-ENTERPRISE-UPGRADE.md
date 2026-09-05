# ZETA BIOTECH — Enterprise Hardening

This upgrade is additive. Existing CMS, products, AI, bilingual UI, SEO, analytics, forms and administration remain in place.

## Added
- Offline-capable PWA shell with service worker.
- Central security-header helper for future Worker integration.
- Dynamic WebPage, BreadcrumbList and Product JSON-LD layer.
- Public bootstrap modules kept separate from existing application logic.

## Important security note
SVG uploads should be treated as active content. The existing upload path should be migrated to sanitized SVG or a non-SVG policy before accepting untrusted SVG files in production.

## Analytics roadmap
Existing analytics remains untouched. The next infrastructure migration can move event aggregation away from per-event GitHub writes without changing the public UI or dashboard contract.
