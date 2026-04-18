import { test, expect } from '@playwright/test';
import { mockAuthMe, mockClientsList, mockDashboard, mockMusicGenres, SAMPLE_CLIENTS } from './helpers/mockApi';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function loginAndGoTo(page: any, path: string) {
  await mockAuthMe(page);
  await mockDashboard(page);
  await mockClientsList(page);
  await mockMusicGenres(page);
  await page.goto(path);
}

test.describe('Clients list', () => {
  test('renders client table with mocked data', async ({ page }) => {
    await loginAndGoTo(page, '/dashboard/clients');
    await expect(page.locator('table')).toBeVisible({ timeout: 6000 });
    await expect(page.locator('td').filter({ hasText: 'Maria Santos' })).toBeVisible();
    await expect(page.locator('td').filter({ hasText: 'Pedro Costa' })).toBeVisible();
  });

  test('shows "Nenhum cliente encontrado" when list is empty', async ({ page }) => {
    await mockAuthMe(page);
    await mockClientsList(page, []);
    await page.goto('/dashboard/clients');
    await expect(page.getByText('Nenhum cliente encontrado')).toBeVisible({ timeout: 6000 });
  });

  test('renders pagination info', async ({ page }) => {
    await loginAndGoTo(page, '/dashboard/clients');
    await expect(page.getByText(/Página 1/)).toBeVisible({ timeout: 6000 });
    await expect(page.getByText(/registros/)).toBeVisible();
  });

  test('search input triggers API call with query param', async ({ page }) => {
    await mockAuthMe(page);
    await mockMusicGenres(page);

    let capturedUrl = '';
    await page.route(`${API}/clients**`, (route) => {
      capturedUrl = route.request().url();
      route.fulfill({ status: 200, json: { data: [], total: 0, page: 1, limit: 10 } });
    });

    await page.goto('/dashboard/clients');
    await page.fill('input[placeholder*="Buscar"]', 'João');
    await page.click('button:has-text("Buscar")');

    await expect(page.getByText('Nenhum cliente encontrado')).toBeVisible({ timeout: 6000 });
    expect(capturedUrl).toContain('search=João');
  });
});

test.describe('Dashboard — new client modal', () => {
  test('opens ClientCreateModal when clicking "+ Novo cliente"', async ({ page }) => {
    await mockAuthMe(page);
    await mockDashboard(page);
    await mockMusicGenres(page);
    // Necessário para a rota protegida de clients não quebrar
    await page.route(`${API}/clients**`, (route) =>
      route.fulfill({ status: 200, json: { data: [], total: 0, page: 1, limit: 10 } })
    );

    await page.goto('/dashboard');
    await page.click('button:has-text("+ Novo cliente")');

    // Modal deve aparecer com campo de nome
    await expect(page.locator('input[placeholder*="Nome"]').first()).toBeVisible({ timeout: 4000 });
  });
});

test.describe('Import modal', () => {
  test('opens import modal when clicking "Importar planilha"', async ({ page }) => {
    await mockAuthMe(page);
    await mockDashboard(page);
    await mockMusicGenres(page);

    await page.goto('/dashboard');
    await page.click('button:has-text("Importar planilha")');

    // Modal deve aparecer com input de arquivo
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 4000 });
  });
});
