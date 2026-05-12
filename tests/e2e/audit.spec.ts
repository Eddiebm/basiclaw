import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

const SAMPLE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor reprehenderit.";

test("paste-text audit returns report or inline error", async ({ page }) => {
  await page.goto("/en/audit");
  await expect(page.locator('label[for="audit-text"]')).toBeVisible({ timeout: 15000 });

  const box = page.locator("#audit-text");
  await expect(box).toBeVisible({ timeout: 15000 });
  await box.fill(SAMPLE);
  expect(SAMPLE.length).toBeGreaterThanOrEqual(200);

  await page.getByRole("button", { name: /run audit/i }).click();

  const riskPanel = page.locator(".border-double");
  const softError = page.getByText(/Audit failed|Network error|Paste at least/i);
  const quotaOrHint = page.getByText(/pricing|upgrade|limit/i);

  await expect(riskPanel.or(softError).or(quotaOrHint).first()).toBeVisible({ timeout: 90_000 });
});
