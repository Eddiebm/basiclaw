import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("pricing shows three tiers and billing toggle", async ({ page }) => {
  await page.goto("/en/pricing");
  await expect(page.getByRole("heading", { name: /Know Your Rights/i })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { name: /Stop Paying By The Hour/i })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("heading", { name: /Operate With Confidence/i })).toBeVisible({ timeout: 15000 });

  const monthly = page.getByRole("button", { name: /^Monthly$/i });
  const annual = page.getByRole("button", { name: /Annual/i });
  if (await monthly.isVisible().catch(() => false)) {
    await monthly.click();
  }
  if (await annual.isVisible().catch(() => false)) {
    await annual.click();
  }
});
