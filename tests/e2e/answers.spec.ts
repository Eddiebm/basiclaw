import { expect, test } from "@playwright/test";

test("answers archive search renders results UI", async ({ page }) => {
  await page.goto("/en/answers?q=rights");
  await expect(page.locator("form")).toBeVisible();
  await expect(
    page.locator("ul li").first().or(page.getByText(/no public|no answers|empty|try a different search/i))
  ).toBeVisible({ timeout: 20_000 });
});
