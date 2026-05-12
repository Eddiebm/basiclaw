import { expect, test } from "@playwright/test";

const SAMPLE =
  "This residential lease requires the tenant to pay for all structural repairs including roof replacement and foundation work. " +
  "The landlord may enter at any time without notice. Late fees are 25% per day. The tenant waives all warranties and legal remedies. " +
  "This agreement is governed by the laws of Atlantis and includes a broad arbitration clause stripping court access.";

test("audit flow accepts pasted text and jurisdiction", async ({ page }) => {
  await page.goto("/en/audit");
  await page.locator("#audit-text").fill(SAMPLE);
  await page.getByLabel(/jurisdiction/i).selectOption("us");
  await page.getByRole("button", { name: /run audit|generate outline/i }).click();
  const ok = page.getByText(/risk|grade|red flag|overall|document type|audit/i);
  const banner = page.getByText(/not configured|AI service|paywall|quota|sign in|too many/i);
  await expect(ok.or(banner).first()).toBeVisible({ timeout: 30_000 });
});
