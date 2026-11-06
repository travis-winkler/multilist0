import { test, expect } from "@playwright/test";
import {
  formatWelcomeDate,
  WelcomeBanner,
} from "../apps/web/src/components/WelcomeBanner";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("welcome date uses weekday, month, and day; verified names render without invented account data", () => {
  expect(formatWelcomeDate(new Date(2021, 9, 5, 12))).toBe(
    "Tuesday, October 5",
  );
  const html = renderToStaticMarkup(
    createElement(WelcomeBanner, {
      onConnect() {},
      profile: {
        username: "test-fixture",
        displayName: "Fixture name",
        avatarUrl: "https://example.invalid/avatar.png",
      },
    }),
  );
  expect(html).toContain("Fixture name");
  expect(html).toContain("https://example.invalid/avatar.png");
  const disconnected = renderToStaticMarkup(
    createElement(WelcomeBanner, { profile: null, onConnect() {} }),
  );
  expect(disconnected).toContain("Connect your Depop");
  expect(disconnected).not.toContain("<img");
});

test("Home has welcome banner and consistently slim footer; descriptions open via info buttons", async ({
  page,
}) => {
  await page.goto("/app/");
  await expect(
    page.getByRole("link", { name: "Home", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Welcome to MultiList" }),
  ).toBeVisible();
  await expect(page.locator(".welcome-profile")).toContainText(
    "Connect your Depop",
  );
  await expect(page.locator(".welcome-banner time")).toHaveText(
    /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), [A-Z][a-z]+ \d{1,2}$/,
  );
  let footerHeight = 0;
  for (const route of [
    "",
    "actions",
    "settings",
    "tasks",
    "account",
    "connection",
    "privacy",
  ]) {
    await page.goto(`/app/${route}`);
    const footer = await page.locator(".page-footer").boundingBox();
    if (!footerHeight) footerHeight = footer!.height;
    expect(footer!.height).toBe(footerHeight);
    expect(footer!.height).toBeLessThanOrEqual(50);
    expect((await page.locator(".topbar").boundingBox())!.height).toBe(68);
  }
  await page.goto("/app/actions");
  const pageInfo = page.getByRole("button", {
    name: "About Shop actions",
    exact: true,
  });
  await pageInfo.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("note")).toContainText("Your everyday toolkit");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("note")).toHaveCount(0);
  await page
    .getByRole("button", { name: "About Listings", exact: true })
    .click();
  await expect(page.getByRole("note")).toContainText("Keep your shop fresh");
  await expect(
    page.locator('.accordion-toggle[aria-expanded="false"]'),
  ).toHaveCount(4);
  await page.locator(".topbar").click();
  await expect(page.getByRole("note")).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 800 });
  await pageInfo.click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("Home cards fill the desktop viewport without scrolling and connect buttons open Depop Connection", async ({
  page,
}) => {
  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [1024, 768],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/app/");
    await expect(page.locator(".home-metrics .summary-card")).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const footer = (await page.locator(".page-footer").boundingBox())!;
    expect(footer.y + footer.height).toBeLessThanOrEqual(height);
    const boxes = await page.locator(".home-metrics .summary-card").all();
    for (const box of boxes)
      expect((await box.boundingBox())!.height).toBeGreaterThan(250);
  }
  for (const scope of [".welcome-banner", ".topbar"]) {
    await page.goto("/app/");
    await page
      .locator(scope)
      .getByRole("button", { name: "Connect your Depop", exact: true })
      .click();
    await expect(page).toHaveURL(/\/app\/account$/);
    await expect(
      page.getByRole("link", { name: "Depop Connection", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }
});
