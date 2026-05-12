import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("index table links to country detail with chart SVG", async ({ page }) => {
  await page.goto("/en/the-index");
  await expect(page.getByRole("table")).toBeVisible({ timeout: 15000 });

  let usRow = page.getByRole("row", { name: /United States/i }).first();
  if (!(await usRow.isVisible().catch(() => false))) {
    await page.getByPlaceholder("Type a country name or code…").fill("United States");
    usRow = page.getByRole("row", { name: /United States/i }).first();
  }
  await expect(usRow).toBeVisible({ timeout: 15000 });
  await usRow.getByRole("link", { name: /^View$/i }).click();

  await expect(page).toHaveURL(/\/en\/the-index\/us\b/i);
  await expect(page.locator("main svg").first()).toBeVisible({ timeout: 15000 });
});
