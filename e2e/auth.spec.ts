import { test, expect } from '@playwright/test';
import { mockLoginSuccess, mockLoginFail, mockAuthMe, mockDashboard } from './helpers/mockApi';

test.describe('Authentication', () => {
  test('redirects to /auth/login when not authenticated', async ({ page }) => {
    // /auth/me retorna 401 → Protected redireciona
    await page.route('**/auth/me', (route) =>
      route.fulfill({ status: 401, json: { message: 'Não autorizado' } })
    );
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('shows login form with email and password fields', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Entrar');
  });

  test('logs in successfully and redirects to /dashboard', async ({ page }) => {
    await mockLoginSuccess(page);
    await mockAuthMe(page);
    await mockDashboard(page);

    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@partiu.com');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard', { timeout: 8000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('shows error alert for invalid credentials', async ({ page }) => {
    await mockLoginFail(page);
    await page.goto('/auth/login');

    // Captura o dialog (alert) antes de clicar em submit
    const dialogPromise = page.waitForEvent('dialog');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('Credenciais inválidas');
    await dialog.dismiss();
  });

  test('disables submit button while loading', async ({ page }) => {
    // Simula resposta lenta para ver o estado de loading
    await page.route('**/auth/login', async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({ status: 200, json: { user: { id: '1', email: 'a@b.com' } } });
    });
    await mockAuthMe(page);
    await mockDashboard(page);

    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@partiu.com');
    await page.fill('input[type="password"]', 'senha123');

    const btn = page.locator('button[type="submit"]');
    await btn.click();
    await expect(btn).toBeDisabled();
  });
});
