import { expect, test } from "@playwright/test";

test("chat composer submits and returns assistant or offline copy", async ({ page }) => {
  await page.goto("/en/chat");
  await expect(page.getByTestId("chat-composer-textarea")).toBeVisible();
  await page.getByTestId("chat-composer-textarea").fill("What is habeas corpus in plain language?");
  await page.getByTestId("chat-composer-send").click();
  const banner = page.getByText(/not configured properly/i);
  const reply = page.locator("main").getByText(/habeas|educational|disclaimer|rights|law/i);
  await expect(banner.or(reply).first()).toBeVisible({ timeout: 30_000 });
});
