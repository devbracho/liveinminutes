import { expect, test } from "@playwright/test";

test("home page renders hero and primary CTAs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ship your app");
  await expect(page.getByRole("link", { name: /start a guide/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /browse demo apps/i })).toBeVisible();
});

test("home page has no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});
