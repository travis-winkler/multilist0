import { test, expect } from "@playwright/test";

test("shared footer pages navigate, refresh, and never show Your Workspace", async ({
  page,
}) => {
  const routes = [
    "",
    "actions",
    "tasks",
    "settings",
    "account",
    "connection",
    "help",
    "documentation",
    "privacy",
    "terms",
  ];
  for (const route of routes) {
    await page.goto(`/app/${route}`);
    await expect(page.getByText("Your Workspace", { exact: true })).toHaveCount(
      0,
    );
    const footer = page.getByRole("navigation", { name: "Footer navigation" });
    for (const name of [
      "Help",
      "Documentation",
      "Privacy Policy",
      "Terms & Conditions",
    ]) {
      await expect(
        footer.getByRole("link", { name, exact: true }),
      ).toBeVisible();
    }
  }
  for (const [label, route] of [
    ["Privacy Policy", "privacy"],
    ["Terms & Conditions", "terms"],
    ["Help", "help"],
    ["Documentation", "documentation"],
  ]) {
    await page
      .getByRole("navigation", { name: "Footer navigation" })
      .getByRole("link", { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/app/${route}$`));
    await page.reload();
    await expect(
      page.getByRole("heading", { name: label, exact: true }),
    ).toBeVisible();
    if (route === "privacy" || route === "terms")
      await expect(
        page.getByText(`${label} content has not been published yet.`),
      ).toBeVisible();
  }
});

test("account disclosure supports keyboard, outside dismissal, and separate logout notices", async ({
  page,
}) => {
  await page.goto("/app/");
  const trigger = page.getByRole("button", { name: "Account options" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Log out of MultiList", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await page.locator(".summary-grid").click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await page
    .getByRole("button", { name: "Log out of MultiList", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "there is no session to end",
  );
  await page.keyboard.press("Escape");
  await trigger.click();
  await page
    .getByRole("button", { name: "Log out of Depop", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "No MultiList session or browser Depop login was changed",
  );
  await page.keyboard.press("Escape");
  await expect(
    page
      .getByRole("button", { name: "Connect your Depop", exact: true })
      .first(),
  ).toBeVisible();
  await expect(page.locator(".depop-avatar")).toHaveCount(0);
});

test("connectivity never invents success and connect reports unavailable integration", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (r) => {
    if (!["localhost", "127.0.0.1"].includes(new URL(r.url()).hostname))
      remote.push(r.url());
  });
  await page.goto("/app/connection");
  const section = page.getByRole("region", { name: "Extension connectivity" });
  await expect(section).toContainText("Not detected");
  await expect(section).toContainText("installation cannot be determined");
  await expect(section.getByText("Disconnected", { exact: true })).toHaveCount(
    2,
  );
  await expect(
    section.getByRole("button", { name: "Disconnect extension", exact: true }),
  ).toBeDisabled();
  await section
    .getByRole("button", { name: "Connect extension", exact: true })
    .click();
  await expect(section.getByRole("alert")).toContainText(
    "No connection was established",
  );
  await expect(section.getByText("Disconnected", { exact: true })).toHaveCount(
    2,
  );
  await page.reload();
  await expect(section.getByText("Disconnected", { exact: true })).toHaveCount(
    2,
  );
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(remote).toEqual([]);
});
