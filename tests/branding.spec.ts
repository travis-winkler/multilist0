import { test, expect } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DepopSetupCard } from "../apps/web/src/components/DepopSetupCard";

test("setup card is omitted for a verified connected state", () => {
  expect(
    renderToStaticMarkup(
      createElement(DepopSetupCard, { connected: true, onConnect() {} }),
    ),
  ).toBe("");
  expect(
    renderToStaticMarkup(
      createElement(DepopSetupCard, { connected: false, onConnect() {} }),
    ),
  ).toContain("Connect your Depop");
});

test("logo, favicon, setup navigation, breadcrumbs and preview disclosure", async ({
  page,
}) => {
  await page.goto("/app/");
  const image = page.locator(".brand-logo");
  await expect(image).toBeVisible();
  expect(
    await image.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
    ),
  ).toBe(true);
  const favicon = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(favicon).toBe("/app/multilist-favicon.png");
  const response = await page.request.get(favicon!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  const setup = page.getByRole("button", { name: /Your browser companion/ });
  await expect(setup).toContainText(
    "Finish setup - Connect your Depop account to MultiList",
  );
  await expect(setup.locator(".mini-icon")).toHaveCount(0);
  await setup.click();
  await expect(page).toHaveURL(/\/app\/account$/);
  await expect(
    page.getByRole("link", { name: "Depop Connection", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  for (const route of [
    "",
    "actions",
    "tasks",
    "settings",
    "account",
    "connection",
    "help",
    "privacy",
    "terms",
    "documentation",
  ]) {
    await page.goto(`/app/${route}`);
    await expect(page.locator(".breadcrumb > span").first()).toHaveText(
      "MultiList",
    );
    await expect(page.locator(".preview-note")).toHaveCount(0);
    await expect(page.getByText(/You're exploring the interface/)).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("button", { name: "Interface Preview", exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Interface Preview", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("not implemented");
});

test("actions collapse on load and when returning to Actions", async ({
  page,
}) => {
  await page.goto("/app/actions");
  await expect(
    page.locator('.accordion-toggle[aria-expanded="false"]'),
  ).toHaveCount(4);
  await page.locator(".accordion-toggle").first().click();
  await expect(
    page.getByRole("button", { name: "Bump Items", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await page.getByRole("link", { name: "Actions", exact: true }).click();
  await expect(
    page.locator('.accordion-toggle[aria-expanded="false"]'),
  ).toHaveCount(4);
});
