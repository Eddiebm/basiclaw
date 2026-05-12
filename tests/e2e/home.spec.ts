import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("hero and primary Ask CTA reach chat with composer", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText(/Stop guessing/i)).toBeVisible({ timeout: 15000 });

  const askCta = page.getByRole("link", { name: /ask a question/i }).first();
  await expect(askCta).toBeVisible({ timeout: 15000 });
  await askCta.click();

  await expect(page).toHaveURL(/\/en\/chat/);
  await expect(page.getByTestId("chat-composer-textarea")).toBeVisible({ timeout: 15000 });
});
