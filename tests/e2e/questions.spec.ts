import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("stage sections and Ask in Chat opens prefill URL", async ({ page }) => {
  await page.goto("/en/questions");
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole("link", { name: /ask in chat/i }).first().click();
  await expect(page).toHaveURL(/\/chat\?[^#]*prefill=/i);
});
