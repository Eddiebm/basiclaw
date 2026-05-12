# Hacker News drafts (3)

UTM: `?utm_source=hackernews&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=`

---

## Show HN: BasicLaw — constitution literacy + embedding retrieval for citations

**Title:** Show HN: BasicLaw – constitution guides with local embedding retrieval (no vector DB)

**Text:**  
BasicLaw is a Next.js app with per-country constitution overviews, topic guides, and an educational chat. We replaced token-overlap snippet ranking with **precomputed embeddings** (384-d MiniLM via Transformers.js) stored as JSON; runtime does cosine similarity + falls back to keyword search if files are missing. Landmark case summaries (with source URLs) are retrieved the same way.

Not legal advice. Code is in the open repo for contributors who want to improve country coverage.

**Link:** `https://basiclaw.app/en?utm_source=hackernews&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=showhn`

**Angle:** Engineering + civic tech.

---

## Ask HN: How do you ground consumer legal assistants without hallucinating citations?

**Title:** Ask HN: Grounding legal ed-tech assistants without inventing citations?

**Text:**  
We whitelist outbound links to curated country sources + explicit landmark URLs, and we force snippet/case IDs for non-URL references. What patterns have worked for you (tooling, evals, human review loops)?

**Link (example destination):** `https://basiclaw.app/en/chat?utm_source=hackernews&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=askhn`

---

## Show HN: Side-by-side constitutional topic comparison across countries

**Title:** Show HN: Compare constitutional highlights across two countries by topic

**Text:**  
Educational comparison UI with curated snippets where available. Useful for students, journalists, and devs building civics tools.

**Link:** `https://basiclaw.app/en/compare?utm_source=hackernews&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=compare`
