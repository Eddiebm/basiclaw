import { expect, test } from "@playwright/test";

test("home and footer internal links avoid 404 and hash placeholders", async ({ page, baseURL }) => {
  await page.goto("/en");
  const hrefs = await page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll("main a[href], footer a[href], nav a[href]")) {
      const h = (el as HTMLAnchorElement).getAttribute("href");
      if (h) out.push(h);
    }
    return [...new Set(out)];
  });
  for (const href of hrefs) {
    expect(href, "no literal hash-only href").not.toMatch(/^#$/);
    if (href === "#") {
      throw new Error(`Invalid href: ${href}`);
    }
    if (href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (href.startsWith("http://") || href.startsWith("https://")) continue;
    const url = new URL(href, baseURL).toString();
    const res = await page.request.get(url);
    expect(res.status(), url).toBeLessThan(400);
  }
});
