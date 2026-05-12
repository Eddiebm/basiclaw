# BasicLaw embed widgets

Third-party sites can embed **Ask BasicLaw** (jurisdiction-aware Q&A) or **Audit my contract** (paste-text risk read) using a simple `<iframe>` or the auto-resize **loader script**.

## URLs

| Surface | URL pattern |
|---------|-------------|
| Q&A widget (iframe) | `https://basiclaw.app/embed/ask?country=US&theme=light` |
| Audit widget (iframe) | `https://basiclaw.app/embed/audit?country=GH&theme=auto&auditType=general` |
| Loader script | `https://basiclaw.app/embed/loader.js` |
| Developer landing (snippets + live preview) | `https://basiclaw.app/en/embed` (locale prefix required) |
| Health check (JSON) | `https://basiclaw.app/api/embed/health` |

Replace the host with your deployment’s `NEXT_PUBLIC_SITE_URL` when self-hosting.

## Iframe snippet (simple)

```html
<iframe
  src="https://basiclaw.app/embed/ask?country=US&theme=light&border=rounded"
  style="width:100%;height:560px;border:0"
  loading="lazy"
  title="BasicLaw"
></iframe>
```

Recommended starting height: **520–640px** for Q&A, **640–800px** for audit (long paste). The loader script adjusts height automatically.

## Loader snippet (auto-resize)

The loader inserts an iframe into the first `[data-basiclaw-embed]` container and listens for `postMessage` events shaped as:

```json
{ "source": "basiclaw", "type": "resize", "height": 1234 }
```

Only messages whose `event.origin` matches the script’s origin (derived from `loader.js` URL) are applied.

```html
<script
  async
  src="https://basiclaw.app/embed/loader.js"
  data-variant="ask"
  data-country="GH"
  data-theme="auto"
  data-border="rounded"
  data-locale="en"
></script>
<div data-basiclaw-embed></div>
```

### Loader `data-*` attributes

| Attribute | Values | Notes |
|-----------|--------|-------|
| `data-variant` | `ask`, `audit` | Required for behaviour |
| `data-country` / `data-jurisdiction` | ISO alpha-2, e.g. `us`, `gh` | Default jurisdiction |
| `data-theme` | `light`, `dark`, `auto` | |
| `data-accent` | `#RGB` or `#RRGGBB` | Optional; tints primary actions |
| `data-border` | `rounded`, `square` | |
| `data-locale` | `en`, `es`, … | Passed to quota/pricing links |
| `data-audit-type` | `general`, `lease`, `employment`, `terms`, … | Audit widget only |

## Query parameters (iframe URLs)

Same knobs as the loader: `country`, `theme`, `accent`, `border`, `locale`, `auditType`.

## Security & privacy

- Widgets run **only inside the iframe**; the parent page cannot read BasicLaw cookies or tokens.
- Embed HTML routes send a **strict Content-Security-Policy**, **`noindex`**, and **do not load PostHog** in the parent shell. Optional usage telemetry is posted to `/api/embed/event` from inside the iframe and **logged server-side** (and can be wired to PostHog separately if desired).
- Voice / read-aloud is **off** in embed surfaces to reduce surprise autoplay.

## Fair use

Anonymous embed traffic shares the same **IP-based rate limits** as the main site. On `429`, the widget shows a short message and a link to BasicLaw pricing.

## FAQ

**Can I remove the “Powered by BasicLaw” footer?**  
Not in the free embed; attribution keeps users oriented to the source and disclaimer context.

**Will this slow my page?**  
Use `loading="lazy"` on the iframe and load the script `async`. The iframe is isolated; cost is mainly one extra document and network calls when the user interacts.

**Can I pass my site’s name?**  
Not yet; referer and optional future signed tokens are the v2 direction (see product roadmap).
