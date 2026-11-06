import { test, expect } from "@playwright/test";

test("page entrances, dropdowns and dialogs animate without moving fixed info tips or the Home layout", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/app/");
  await expect(page.locator(".welcome-banner")).toHaveCSS(
    "animation-name",
    "ml-reveal",
  );
  await expect(page.locator(".home-metrics .summary-card").nth(1)).toHaveCSS(
    "animation-delay",
    "0.045s",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight <= innerHeight,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Account options" }).click();
  await expect(page.locator(".account-dropdown")).toHaveCSS(
    "animation-name",
    "ml-popover",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Interface Preview", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCSS(
    "animation-name",
    "ml-dialog",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Actions", exact: true }).click();
  await expect(page.locator(".page-heading")).toHaveCSS(
    "animation-name",
    "ml-reveal",
  );
  // Moving parent containers would change the coordinate system of fixed tooltips.
  await expect(page.locator("#main-content")).toHaveCSS("transform", "none");
  await page
    .getByRole("button", { name: "About Listings", exact: true })
    .click();
  await expect(page.getByRole("note")).toHaveCSS("position", "fixed");
  const rect = (await page.getByRole("note").boundingBox())!;
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(rect.x + rect.width).toBeLessThanOrEqual(1366);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Listings", exact: true }).click();
  await expect(page.locator("#section-Listings .action-buttons")).toHaveCSS(
    "animation-name",
    "ml-reveal",
  );
  await expect(
    page.getByRole("button", { name: "Bump Items", exact: true }),
  ).toBeVisible();
});

test("Disable animations persists and suppresses motion, including modal backdrops", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/app/settings");
  await page.getByRole("switch", { name: "Disable animations" }).click();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page.locator(".welcome-banner")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".home-metrics .summary-card").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.reload();
  await expect(page.locator(".welcome-banner")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.getByRole("button", { name: "Account options" }).click();
  await expect(page.locator(".account-dropdown")).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Interface Preview", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCSS("animation-name", "none");
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el, "::backdrop").animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("switch", { name: "Disable animations" }).click();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page.locator(".welcome-banner")).toHaveCSS(
    "animation-name",
    "ml-reveal",
  );
});

test("browser reduced motion independently disables effects", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/app/");
  await expect(page.locator(".welcome-banner")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".home-metrics .summary-card").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.getByRole("button", { name: "Account options" }).click();
  await expect(page.locator(".account-dropdown")).toHaveCSS(
    "animation-name",
    "none",
  );
});
