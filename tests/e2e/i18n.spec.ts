import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

const cases: { path: string; needle: RegExp }[] = [
  { path: "/es", needle: /Constituciones|Preguntar|Precios/ },
  { path: "/fr", needle: /Demander|Tarifs|Constitutions/ },
  { path: "/ar", needle: /الدساتير|اسأل|الأسعار/ },
  { path: "/pt", needle: /Constituições|Perguntar|Preços/ },
  { path: "/hi", needle: /संविधान|पूछें|मूल्य/ },
  { path: "/zh", needle: /宪法|提问|定价/ },
];

for (const { path, needle } of cases) {
  test(`locale page loads without stuck loading — ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status(), path).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible({ timeout: 15000 });

    await expect(page.getByText(needle).first()).toBeVisible({ timeout: 15000 });
  });
}
