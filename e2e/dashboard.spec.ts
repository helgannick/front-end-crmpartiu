import { test, expect } from '@playwright/test';
import { mockAuthMe, mockDashboard, mockMusicGenres } from './helpers/mockApi';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthMe(page);
    await mockDashboard(page);
    await mockMusicGenres(page);
  });

  test('renders Dashboard title', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard', { timeout: 6000 });
  });

  test('renders the 4 navigation tabs', async ({ page }) => {
    await page.goto('/dashboard');
    for (const tab of ['Visão Geral', 'Conversão', 'Engajamento', 'Retenção']) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible({ timeout: 6000 });
    }
  });

  test('switches to Conversão tab and loads advanced metrics', async ({ page }) => {
    await page.route(`${API}/dashboard/conversion-funnel`, (route) =>
      route.fulfill({ status: 200, json: { novo: 10, engajando: 5, recorrente: 2, vip: 1, total: 18, conversion_rate: { novo_to_engajando: 50, engajando_to_recorrente: 40, recorrente_to_vip: 50 } } })
    );
    await page.route(`${API}/dashboard/top-sources`, (route) =>
      route.fulfill({ status: 200, json: [{ source: 'Instagram', count: 10, percentage: 100 }] })
    );

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Conversão' }).click();
    await expect(page.getByText('Funil de Conversão')).toBeVisible({ timeout: 6000 });
  });

  test('switches to Engajamento tab', async ({ page }) => {
    await page.route(`${API}/dashboard/engagement-trends**`, (route) =>
      route.fulfill({ status: 200, json: [] })
    );
    await page.route(`${API}/dashboard/inactive-clients**`, (route) =>
      route.fulfill({ status: 200, json: { count: 0, percentage: 0, clients: [] } })
    );

    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'Engajamento' }).click();
    await expect(page.getByText('Tendência de Engajamento')).toBeVisible({ timeout: 6000 });
  });

  test('shows total clients count from API', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('42')).toBeVisible({ timeout: 6000 });
  });
});
