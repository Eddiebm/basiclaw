import { expect, test } from "@playwright/test";

test("embed ask is chromeless with attribution", async ({ page }) => {
  await page.goto("/embed/ask?country=US&theme=light");
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByText(/Powered by BasicLaw/i)).toBeVisible();
});
