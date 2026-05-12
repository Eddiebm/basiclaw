import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("answers search shows results or empty state", async ({ page }) => {
  await page.goto("/en/answers");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15000 });

  const q = page.locator("#answers-q");
  await expect(q).toBeVisible({ timeout: 15000 });
  await q.fill("rights");
  await page.getByRole("button", { name: /^Search$/i }).click();

  const list = page.locator("main ul").filter({ has: page.locator("li") });
  const empty = page.getByText(/No public answers|No answers match/i);
  await expect(list.or(empty).first()).toBeVisible({ timeout: 15000 });
});
