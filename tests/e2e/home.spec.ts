import { expect, test } from "@playwright/test";

test("home hero opens chat", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /ask a question/i }).first().click();
  await expect(page).toHaveURL(/\/en\/chat/);
});
