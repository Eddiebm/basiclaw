import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("search United States opens detail with summary and sources", async ({ page }) => {
  await page.goto("/en/constitutions");
  await expect(page.getByRole("searchbox").first()).toBeVisible({ timeout: 15000 });

  await page.getByRole("searchbox").first().fill("United States");
  const hit = page.getByRole("link", { name: /United States/i }).first();
  await expect(hit).toBeVisible({ timeout: 15000 });
  await hit.click();

  await expect(page).toHaveURL(/\/en\/constitutions\/us\b/i);
  await expect(page.locator("#summary")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { name: /^Sources$/i })).toBeVisible({ timeout: 15000 });
});
