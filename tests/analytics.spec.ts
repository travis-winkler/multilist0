import { test, expect } from "@playwright/test";
import { daysInMonth, SalesChart } from "../apps/web/src/components/Analytics";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("monthly chart covers 28, 29, 30 and 31 day months and can render supplied recorded counts", () => {
  expect(daysInMonth(new Date(2025, 1, 1))).toBe(28);
  expect(daysInMonth(new Date(2024, 1, 1))).toBe(29);
  expect(daysInMonth(new Date(2025, 3, 1))).toBe(30);
  expect(daysInMonth(new Date(2025, 0, 1))).toBe(31);
  const html = renderToStaticMarkup(
    createElement(SalesChart, { dailyCounts: { 1: 3 } }),
  );
  expect(html).toContain("1: 3 sales");
  expect(html).toContain('class="sales-bar"');
  expect(html).not.toContain("No sales data available.");
});

test("Home and Analytics show honest metrics and daily chart with no fabricated revenue", async ({
  page,
}) => {
  await page.goto("/app/");
  for (const title of ["Revenue", "Revenue with MultiList", "Sales"]) {
    await expect(
      page.getByRole("region", { name: title, exact: true }),
    ).toContainText("—");
  }
  const days = new Date();
  await expect(page.locator(".sales-day")).toHaveCount(daysInMonth(days));
  await expect(page.locator(".sales-bar")).toHaveCount(0);
  await expect(
    page.getByText("No sales data available.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/analytics$/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Analytics", exact: true }),
  ).toBeVisible();
  for (const title of [
    "Total revenue",
    "Revenue with MultiList",
    "Revenue without MultiList",
    "Created with MultiList",
    "Created without MultiList",
    "Total sales since installation",
  ]) {
    await expect(
      page.getByRole("region", { name: title, exact: true }),
    ).toContainText("—");
  }
  await expect(
    page.getByText("Installation date unavailable", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "About Revenue without MultiList",
      exact: true,
    })
    .click();
  await expect(page.getByRole("note")).toContainText(
    "Unknown attribution is not counted here",
  );
  await page.keyboard.press("Escape");
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
