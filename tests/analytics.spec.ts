import { test, expect } from "@playwright/test";
import {
  daysInMonth,
  SalesChart,
  salesBuckets,
} from "../apps/web/src/components/Analytics";
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
  await expect(page.locator(".sales-day")).toHaveCount(0);
  await expect(page.locator(".weekly-days li")).toHaveCount(7);
  await expect(page.locator(".summary-card")).toHaveCount(3);
  await expect(
    page.getByRole("combobox", { name: "Sales period" }),
  ).toHaveValue("Week");
  await expect(page.locator(".sales-bar")).toHaveCount(0);
  await expect(
    page.getByText("Sales data unavailable", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/analytics$/);
  await page.reload();
  await expect(page.locator(".sales-day")).toHaveCount(daysInMonth(days));
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

test("nonweekly Home options open the selected Analytics period and survive refresh", async ({
  page,
}) => {
  for (const period of ["Month", "Q1", "Q2", "Q3", "Q4", "Year"]) {
    await page.goto("/app/");
    await page
      .getByRole("combobox", { name: "Sales period" })
      .selectOption(period);
    await expect(page).toHaveURL(
      new RegExp(`/app/analytics\\?period=${period.toLowerCase()}$`),
    );
    await expect(
      page.getByRole("combobox", { name: "Sales period" }),
    ).toHaveValue(period);
    await page.reload();
    await expect(
      page.getByRole("combobox", { name: "Sales period" }),
    ).toHaveValue(period);
    await expect(page.locator(".sales-day")).toHaveCount(
      period === "Year" ? 12 : period === "Month" ? daysInMonth(new Date()) : 3,
    );
  }
  await page
    .getByRole("combobox", { name: "Sales period" })
    .selectOption("Week");
  await expect(page.locator(".sales-day")).toHaveCount(7);
  await page.goBack();
  await expect(
    page.getByRole("combobox", { name: "Sales period" }),
  ).toHaveValue("Year");
});

test("week and quarter buckets use correct calendar boundaries", () => {
  const week = salesBuckets(new Date(2027, 0, 1), "Week");
  expect(week[0].getFullYear()).toBe(2026);
  expect(week[0].getMonth()).toBe(11);
  expect(week[0].getDate()).toBe(28);
  expect(week[6].getFullYear()).toBe(2027);
  for (const [q, first] of [
    ["Q1", 0],
    ["Q2", 3],
    ["Q3", 6],
    ["Q4", 9],
  ] as const) {
    expect(
      salesBuckets(new Date(2026, 10, 5), q).map((d) => d.getMonth()),
    ).toEqual([first, first + 1, first + 2]);
  }
});
