import { test, expect } from "@playwright/test";

const TEST_PASSWORD = "Test123456!";

test.describe("App E2E", () => {
  const email = `e2e-${Date.now()}@travelku.test`;

  test("full flow: register → login → create booking → change status", async ({ page }) => {
    // Register
    await page.goto("/auth/register");
    await page.fill('input[id="name"]', "E2E Test User");
    await page.fill('input[id="email"]', email);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL("/", { timeout: 10000 });
    await expect(page.locator("h2")).toContainText("Pemesanan");

    // Open create booking form
    await page.click("text=Tambah Pemesanan");
    await expect(page.getByText("Tambah Pemesanan Baru")).toBeVisible({ timeout: 5000 });

    // Fill in the form
    await page.fill('input[id="customer_name"]', "E2E Customer");
    await page.fill('input[id="contact"]', "081234567890");

    // Open package dropdown and type a package name
    await page.click('button:has-text("Pilih paket")');
    await page.fill('input[placeholder="Ketik manual..."]', "E2E Test Package");

    // Set departure date
    await page.fill('input[id="departure_date"]', "2099-12-31");
    await page.fill('input[id="participants"]', "3");
    await page.fill('input[id="price_per_person"]', "500000");

    // Submit
    await page.click('button[type="submit"]');
    await expect(page.getByText("Tambah Pemesanan Baru")).not.toBeVisible({ timeout: 5000 });

    // Booking should appear in the table
    await expect(page.getByText("E2E Customer")).toBeVisible();

    // Change status to Dikonfirmasi
    await page.locator('button:has-text("→ Dikonfirmasi")').first().click();
    await page.waitForTimeout(500);

    // Status badge should update
    await expect(page.locator("text=Dikonfirmasi").first()).toBeVisible();
  });

  test("login page redirects when already authenticated", async ({ page }) => {
    const loginEmail = `e2e-login-${Date.now()}@travelku.test`;
    await page.goto("/auth/register");
    await page.fill('input[id="name"]', "Login Test");
    await page.fill('input[id="email"]', loginEmail);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 10000 });

    await page.goto("/auth/login");
    await page.waitForURL("/", { timeout: 5000 });
  });

  test("packages tab is accessible", async ({ page }) => {
    const pkgEmail = `e2e-pkg-${Date.now()}@travelku.test`;
    await page.goto("/auth/register");
    await page.fill('input[id="name"]', "Package Test");
    await page.fill('input[id="email"]', pkgEmail);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 10000 });

    // Navigate to Paket Wisata tab
    await page.click("text=Paket Wisata");
    await expect(page.getByText("Daftar Paket Wisata")).toBeVisible();
  });
});
