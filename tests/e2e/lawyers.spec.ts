import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("lawyers directory or empty state", async ({ page }) => {
  await page.goto("/en/lawyers");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15000 });

  const grid = page.locator("main ul.grid");
  const empty = page.getByText(/No matching lawyers yet/i);
  await expect(grid.or(empty).first()).toBeVisible({ timeout: 15000 });
});
