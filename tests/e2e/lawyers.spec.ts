import { expect, test } from "@playwright/test";

test("lawyers directory renders", async ({ page }) => {
  await page.goto("/en/lawyers");
  await expect(page.getByRole("main").or(page.locator("main"))).toBeVisible();
  await expect(page.getByText(/lawyer|directory|partner|verified/i).first()).toBeVisible({ timeout: 15_000 });
});
