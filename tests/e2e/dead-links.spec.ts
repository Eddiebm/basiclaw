import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("homepage internal links respond and no hash-only anchors", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

  const hashOnly = page.locator('a[href="#"]');
  await expect(hashOnly).toHaveCount(0);

  const hrefs = await page.$$eval("a[href]", (anchors) =>
    anchors
      .map((a) => a.getAttribute("href"))
      .filter((h): h is string => Boolean(h && h.trim()))
  );

  const internal = [...new Set(hrefs)].filter((h) => {
    if (h.startsWith("mailto:") || h.startsWith("tel:") || h.startsWith("javascript:")) return false;
    if (h.startsWith("http://") || h.startsWith("https://")) return false;
    return h.startsWith("/en") || h.startsWith("/");
  });

  const capped = internal.slice(0, 20);
  expect(capped.length).toBeGreaterThan(0);

  for (const path of capped) {
    const res = await page.request.get(path);
    expect(res.status(), path).toBeLessThan(400);
  }
});
