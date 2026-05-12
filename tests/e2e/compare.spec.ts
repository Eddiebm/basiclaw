import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("compare query shows both country panels", async ({ page }) => {
  await page.goto("/en/compare?a=US&b=GH&topic=rights");
  await expect(page.getByRole("heading", { name: /United States/i })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { name: /Ghana/i })).toBeVisible({ timeout: 15000 });
});
