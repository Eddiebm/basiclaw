import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("composer submits and shows assistant, fallback copy, or error — composer stays", async ({ page }) => {
  await page.goto("/en/chat");
  const textarea = page.getByTestId("chat-composer-textarea");
  await expect(textarea).toBeVisible({ timeout: 15000 });

  await textarea.fill("hello");
  await page.getByTestId("chat-composer-send").click();

  const assistantMarkdown = page.locator("main .rounded-2xl.bg-secondary .max-w-none");
  const errorBanner = page.getByRole("alert");
  const configuredFallback = page.getByText(/not configured properly/i);

  await expect(assistantMarkdown.or(errorBanner).or(configuredFallback).first()).toBeVisible({ timeout: 30_000 });
  await expect(textarea).toBeVisible({ timeout: 15000 });
});
