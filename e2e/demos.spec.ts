import { expect, test } from "@playwright/test";

// ── Demos index ───────────────────────────────────────────────────────────────

test.describe("Demos index", () => {
  test("renders all 8 demo cards", async ({ page }) => {
    await page.goto("/demos");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("See the stack in action");

    const cards = [
      "Task tracker",
      "Realtime chat",
      "Analytics dashboard",
      "Storefront",
      "Employee time clock",
      "Appointment booking",
      "Invoice generator",
      "Link-in-bio + QR",
    ];

    for (const title of cards) {
      await expect(page.getByText(title)).toBeVisible();
    }
  });

  test("each card has a guide link", async ({ page }) => {
    await page.goto("/demos");
    const guideLinks = page.getByText("Get live in minutes →");
    await expect(guideLinks).toHaveCount(8);
  });

  test("demo cards link to the correct routes", async ({ page }) => {
    await page.goto("/demos");
    const demoLinks = [
      "/demos/tasks",
      "/demos/chat",
      "/demos/dashboard",
      "/demos/store",
      "/demos/timeclock",
      "/demos/booking",
      "/demos/invoice",
      "/demos/links",
    ];
    for (const href of demoLinks) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });
});

// ── Auth-gated demos: must redirect to /login ─────────────────────────────────

const authGatedDemos = [
  { name: "Task tracker", path: "/demos/tasks" },
  { name: "Realtime chat", path: "/demos/chat" },
  { name: "Analytics dashboard", path: "/demos/dashboard" },
  { name: "Employee time clock", path: "/demos/timeclock" },
  { name: "Appointment booking", path: "/demos/booking" },
];

for (const { name, path } of authGatedDemos) {
  test(`${name}: unauthenticated → redirects to login`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back");
  });
}

// ── Public demos: render without auth ────────────────────────────────────────

test.describe("Storefront demo", () => {
  test("renders product grid and guide link", async ({ page }) => {
    await page.goto("/demos/store");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Storefront");
    await expect(page.getByText("See how to get live in minutes →")).toBeVisible();
  });

  test("cart is empty by default", async ({ page }) => {
    await page.goto("/demos/store");
    await expect(page.getByText(/\$0\.00|empty|no items/i).first()).toBeVisible();
  });
});

test.describe("Invoice generator demo", () => {
  test("renders invoice form and guide link", async ({ page }) => {
    await page.goto("/demos/invoice");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Invoice Generator");
    await expect(page.getByText("See how to get live in minutes →")).toBeVisible();
  });

  test("has print button", async ({ page }) => {
    await page.goto("/demos/invoice");
    await expect(page.getByRole("button", { name: /print|save.*pdf/i })).toBeVisible();
  });
});

test.describe("Link-in-bio demo", () => {
  test("renders editor and guide link", async ({ page }) => {
    await page.goto("/demos/links");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Link-in-bio");
    await expect(page.getByText("See how to get live in minutes →")).toBeVisible();
  });

  test("has add link button", async ({ page }) => {
    await page.goto("/demos/links");
    await expect(page.getByRole("button", { name: /add link/i })).toBeVisible();
  });
});

// ── Guide links lead to the right guides ─────────────────────────────────────

test.describe("Demo → guide navigation", () => {
  const demoGuides: [string, string][] = [
    ["/demos/store", "/guides/build-storefront"],
    ["/demos/invoice", "/guides/build-invoice-generator"],
    ["/demos/links", "/guides/build-link-in-bio"],
  ];

  for (const [demoPath, guidePath] of demoGuides) {
    test(`${demoPath} guide link goes to ${guidePath}`, async ({ page }) => {
      await page.goto(demoPath);
      const guideLink = page.getByText("See how to get live in minutes →");
      await expect(guideLink).toHaveAttribute("href", guidePath);
    });
  }
});
