import { expect, test } from "@playwright/test";

test("constitution search opens country with summary and sources", async ({ page }) => {
  await page.goto("/en/constitutions");
  const search = page.getByRole("searchbox").or(page.locator('input[type="search"]')).first();
  await search.fill("United States");
  await page.getByRole("link", { name: /United States/i }).first().click();
  await expect(page.getByText(/constitution|summary|principles/i).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("link", { name: /source|official|read|gov|constituteproject/i }).first()).toBeVisible({
    timeout: 15_000,
  });
});
