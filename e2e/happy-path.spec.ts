import { test, expect } from "@playwright/test";

/**
 * Minimal smoke: public routes reachable (no auth).
 * Aligns with audit plan: landing → auth → compare/dispatch surface.
 */
test.describe("public navigation smoke", () => {
  test("landing, auth, compare", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    await page.goto("/auth");
    await expect(page).toHaveURL(/\/auth/);

    await page.goto("/compare");
    await expect(page).toHaveURL(/\/compare/);
  });
});
