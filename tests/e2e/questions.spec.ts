import { expect, test } from "@playwright/test";

test("questions filter and chat prefill", async ({ page }) => {
  await page.goto("/en/questions");
  await page.getByLabel("Stage").selectOption("child");
  await page.getByRole("link", { name: /ask in chat/i }).first().click();
  await expect(page).toHaveURL(/\/en\/chat/);
  await expect(page.getByTestId("chat-composer-textarea")).toBeVisible();
});
