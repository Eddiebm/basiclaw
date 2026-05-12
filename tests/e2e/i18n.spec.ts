import { expect, test } from "@playwright/test";

const cases: { path: string; expectText: RegExp }[] = [
  { path: "/es/", expectText: /Privacidad|Constitución|Biblioteca/i },
  { path: "/fr/", expectText: /Confidentialité|Constitution|Bibliothèque/i },
  { path: "/ar/", expectText: /الخصوصية|دستور|مكتبة/i },
  { path: "/pt/", expectText: /Privacidade|Constituição|Biblioteca/i },
  { path: "/hi/", expectText: /गोपनीयता|संविधान|पुस्तकालय/i },
  { path: "/zh/", expectText: /隐私|宪法|图书馆/i },
];

for (const { path, expectText } of cases) {
  test(`locale nav/footer not raw English: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("footer")).toContainText(expectText);
  });
}
