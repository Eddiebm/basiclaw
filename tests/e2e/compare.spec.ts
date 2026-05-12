import { expect, test } from "@playwright/test";

test("compare page renders two country panels", async ({ page }) => {
  await page.goto("/en/compare?a=US&b=GH&topic=rights");
  await expect(page.getByText(/United States/i).first()).toBeVisible();
  await expect(page.getByText(/Ghana/i).first()).toBeVisible();
  await expect(page.getByText(/key principles|sources|similarities|differences/i).first()).toBeVisible({ timeout: 20_000 });
});
