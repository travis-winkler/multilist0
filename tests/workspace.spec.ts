import { test, expect } from "@playwright/test";

test("prototype actions explain unavailable integration and navigate to connection", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/app/");
  await expect(
    page.getByRole("heading", { name: "Your shop, in a little more harmony." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Bump Items", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Bump Items", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("cannot run yet");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Likes Manage how" }).click();
  await expect(
    page.getByRole("button", { name: "Like Products", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Set up your connection" }).click();
  await expect(page).toHaveURL(/\/app\/connection$/);
  await expect(
    page.getByRole("heading", { name: "What works today" }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Shop actions" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("local preferences persist and can be reset", async ({ page }) => {
  await page.goto("/app/settings");
  const toggle = page.getByRole("switch", { name: "Disable animations" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await page.getByRole("slider", { name: /Action speed/ }).fill("15");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("slider", { name: /Action speed/ })).toHaveValue(
    "15",
  );
  await page.getByRole("button", { name: "Reset to defaults" }).click();
  await page
    .getByRole("button", { name: "Reset settings", exact: true })
    .click();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("slider", { name: /Action speed/ })).toHaveValue(
    "5",
  );
});

test("drafts persist and delete without creating tasks or remote requests", async ({
  page,
}) => {
  const remoteRequests: string[] = [];
  page.on("request", (r) => {
    if (!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      remoteRequests.push(r.url());
  });
  await page.goto("/app/tasks");
  for (const label of ["All", "Active", "Scheduled", "Completed"]) {
    await page.getByRole("tab", { name: label, exact: true }).click();
    await expect(page.getByRole("tabpanel")).toContainText(/No .*tasks yet/);
  }
  await page.getByRole("button", { name: "Create schedule draft" }).click();
  await page.getByRole("spinbutton", { name: "Interval (hours)" }).fill("3");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("will not execute");
  await page.getByRole("tab", { name: "Drafts (1)" }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Every 3 hours · Local draft · Not enabled",
  );
  await page.reload();
  await page.getByRole("tab", { name: "Drafts (1)" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Auto Bump Items");
  await page
    .getByRole("button", { name: "Delete Auto Bump Items draft" })
    .click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "No schedule drafts yet",
  );
  expect(remoteRequests).toEqual([]);
});

test("account never fabricates authentication and survives corrupt stored preferences", async ({
  page,
}) => {
  await page.goto("/app/");
  await page.evaluate(() => {
    localStorage.setItem("multilist.settings.v1", "{broken");
    localStorage.setItem("multilist.drafts.v1", '{"invalid":true}');
  });
  await page.goto("/app/account");
  await expect(
    page.getByRole("heading", { name: "Not signed in" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Manage account", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "No account or subscription will be created",
  );
});

test("mobile menu and desktop layout fit the viewport", async ({ page }) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/app/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Make it work your way." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/app/");
  await page.screenshot({ path: "/tmp/multilist-desktop.png", fullPage: true });
});
