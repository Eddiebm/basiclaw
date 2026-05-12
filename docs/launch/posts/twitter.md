# X (Twitter) drafts

UTM suffix: `?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=`

## 10 short posts

1. Constitutions are amended faster than vibes. BasicLaw keeps plain-language overviews + official links in one place: `https://basiclaw.app/en?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p1`

2. “Is this constitutional?” is usually the wrong first question. First: which layer—text, statute, or agency rule? Map it: `https://basiclaw.app/en/chat?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p2`

3. Compare rights language across two countries (educational): `https://basiclaw.app/en/compare?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p3`

4. Tenant stress? Start with the pattern of notices—not the drama. US guide: `https://basiclaw.app/en/us/landlord?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p4`

5. Police stop guides are jurisdiction-sensitive by design. US framing: `https://basiclaw.app/en/us/police-stop?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p5`

6. India constitutional milestones (plain language + links): `https://basiclaw.app/en/constitutions/in?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p6`

7. Nigeria overview + educational chat: `https://basiclaw.app/en/constitutions/ng?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p7`

8. Ghana 1992 constitutional order—overview: `https://basiclaw.app/en/constitutions/gh?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p8`

9. UK constitutional grammar ≠ US constitutional grammar. Start here: `https://basiclaw.app/en/constitutions/gb?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p9`

10. We’re listing verified lawyers who review pages (informational, not referrals): `https://basiclaw.app/en/lawyers?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=p10`

---

## Thread skeleton A — “3 layers of law” (6 posts)

1/6 People mix up constitutions, statutes, and policies. They’re different doors to different rooms.

2/6 Constitutions: big principles + structure. Rarely tells you Tuesday’s rent due date.

3/6 Statutes: where most “real life” rules live (deadlines, forms, agencies).

4/6 Policies/manuals: what an institution actually does—until a court or statute disagrees.

5/6 BasicLaw helps you orient on constitutions + cross links to official sources when we have them: `https://basiclaw.app/en?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=thread_layers`

6/6 For your specific fact pattern, a licensed lawyer in your jurisdiction still wins. We’re education, not representation.

---

## Thread skeleton B — Retrieval upgrade (8 posts)

1/8 We shipped embedding retrieval over curated snippets + landmark cases (JSON on disk—no vector DB).

2/8 Why: token overlap misses semantic matches (“search incident to arrest” vs “phone warrant”).

3/8 Build step embeds with MiniLM; runtime embeds query with the same model (Transformers.js).

4/8 Fallback: keyword ranker if embeddings missing—deploy safety.

5/8 Cases include outbound Wikipedia/court links the model is allowed to cite.

6/8 Snippets stay “no URL” on purpose—they’re BasicLaw-authored summaries.

7/8 Try US chat with citations panel: `https://basiclaw.app/en/chat?country=us&utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=thread_rag`

8/8 If you want this for your country, contribute snippets/cases via GitHub.

---

## Thread skeleton C — Landlord week (5 posts)

1/5 Housing disputes are local; panic is global.

2/5 Read notices slowly. Dates matter more than tone.

3/5 US landlord/tenant orientation (not advice): `https://basiclaw.app/en/us/landlord?utm_source=twitter&utm_medium=organic&utm_campaign=launch_2026_05&utm_content=thread_landlord`

4/5 Pair with local legal aid—they know court culture.

5/5 If you’re safe right now, bookmark your state page on BasicLaw for later.
