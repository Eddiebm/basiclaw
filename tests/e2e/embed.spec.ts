import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("embed ask widget without site navigation", async ({ page }) => {
  await page.goto("/embed/ask?country=US&theme=light");
  await expect(page.getByRole("textbox").first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByText("Powered by BasicLaw")).toBeVisible({ timeout: 15000 });
});
