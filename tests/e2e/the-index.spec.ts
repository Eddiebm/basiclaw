import { expect, test } from "@playwright/test";

test("legal literacy index table and US radar", async ({ page }) => {
  await page.goto("/en/the-index");
  await expect(page.locator("table")).toBeVisible();
  await page.getByPlaceholder(/Search countries/i).fill("United States");
  const row = page.getByRole("row").filter({ hasText: /United States/ });
  await row.getByRole("link", { name: /^View$/ }).click();
  await expect(page.getByRole("img", { name: /radar|dimension|score/i })).toBeVisible({ timeout: 20_000 });
});
