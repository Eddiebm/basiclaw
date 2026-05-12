# BasicLaw — 30-day launch playbook (May 2026)

## UTM convention (use on every external link)

All outbound campaign links use this query string pattern:

`?utm_source=<platform>&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=<slug>`

Examples:

- Reddit r/legaladvice: `utm_source=reddit&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=legaladvice`
- Twitter thread: `utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=thread_rights_us`

Base site: `https://basiclaw.app` (swap for staging when testing).

## Objectives (30 days)

1. **Prove retrieval quality** — chat cites snippets + landmark cases with real URLs where applicable.
2. **Earn trust** — constitution pages, verified-lawyer badges, transparent “educational only” posture.
3. **Seed distribution** — repeatable weekly cadence: 2 Reddit posts, 1 long thread, 1 LinkedIn, 1 niche community touch.

## Weekly cadence

| Week | Focus | Primary channels |
|------|--------|------------------|
| 1 | Awareness + “show HN” style demos | Reddit, HN, Twitter |
| 2 | Country-specific trust (IN, NG, GH, UK…) | Subreddit depth, diaspora Discords |
| 3 | Landlord / tenant + police-stop angles | r/landlords, r/povertyfinance, regional legal subs |
| 4 | Partners (law schools, legal aid intros) | Email templates, cold outreach |

## Link tracking hygiene

- Never shorten UTMs with a generic shortener that strips parameters unless the shortener forwards query strings.
- Use one spreadsheet row per post: date, channel, `utm_content`, destination path, result (upvotes, clicks if known).

## Surfaces to promote

- `/en/constitutions/{code}` — deep constitution overview
- `/en/{country}/rights` — topic guide
- `/en/chat?country={code}` — assistant with jurisdiction
- `/en/compare` — side-by-side topic comparison
- `/en/lawyers` — verified counsel directory (trust)

## Self-promotion / mod rules

Many subreddits restrict self-promotion. Default stance:

- Disclose affiliation in-text (“I’m involved with BasicLaw, a free constitution literacy site”).
- Lead with the **problem** (how to read your rights / compare texts) and put the link once in a context that helps OP.
- Prefer comments on high-traffic threads over standalone promo posts where rules are strict.

## Files in this folder

- `posts/reddit.md` — draft posts
- `posts/hackernews.md` — Show HN / Ask HN
- `posts/twitter.md` — short posts + thread skeletons
- `posts/linkedin.md` — counsel + founder angles
- `posts/product-hunt.md` — checklist + launch copy
- `posts/communities.md` — niche community map
- `email-templates.md` — partnership outreach

Internal HTML dashboard: `/en/launch?key=$LAUNCH_KEY` (set `LAUNCH_KEY` in env; without it, the route returns 404).
