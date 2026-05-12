import { expect, test } from "@playwright/test";

test("pricing shows three tiers and cadence toggle", async ({ page }) => {
  await page.goto("/en/pricing");
  await expect(page.getByRole("heading", { name: /Know Your Rights/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Stop Paying By The Hour/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Operate With Confidence/i })).toBeVisible();
  await page.getByRole("button", { name: /monthly/i }).click();
  await page.getByRole("button", { name: /annual/i }).click();
});
