import { Page } from '@playwright/test';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const MOCK_USER = {
  id: 'test-uid',
  email: 'admin@partiu.com',
  role: 'admin',
};

/** Intercept GET /auth/me → autenticado */
export async function mockAuthMe(page: Page) {
  await page.route(`${API}/auth/me`, (route) =>
    route.fulfill({ status: 200, json: { user: MOCK_USER } })
  );
}

/** Intercept POST /auth/login → sucesso */
export async function mockLoginSuccess(page: Page) {
  await page.route(`${API}/auth/login`, (route) =>
    route.fulfill({ status: 200, json: { user: MOCK_USER } })
  );
}

/** Intercept POST /auth/login → credenciais erradas */
export async function mockLoginFail(page: Page) {
  await page.route(`${API}/auth/login`, (route) =>
    route.fulfill({ status: 401, json: { message: 'Credenciais inválidas' } })
  );
}

/** Intercept GET /clients → lista paginada */
export async function mockClientsList(page: Page, clients = SAMPLE_CLIENTS) {
  await page.route(`${API}/clients**`, (route) =>
    route.fulfill({
      status: 200,
      json: { data: clients, total: clients.length, page: 1, limit: 10 },
    })
  );
}

/** Intercept POST /clients → criação bem-sucedida */
export async function mockClientCreate(page: Page) {
  await page.route(`${API}/clients`, (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({ status: 201, json: { id: 'new-id', name: 'João Silva' } });
    }
    route.fallback();
  });
}

/** Intercept GET /dashboard/* → zeros */
export async function mockDashboard(page: Page) {
  const routes = [
    [`${API}/dashboard/total`, { total: 42 }],
    [`${API}/dashboard/week`, { new_clients_week: 5 }],
    [`${API}/dashboard/month`, { new_clients_month: 12 }],
    [`${API}/dashboard/birthdays`, []],
    [`${API}/dashboard/recent`, []],
    [`${API}/dashboard/status`, { active: 30, inactive: 12 }],
    [`${API}/dashboard/clients-by-city`, []],
  ] as const;

  for (const [url, body] of routes) {
    await page.route(url, (route) => route.fulfill({ status: 200, json: body }));
  }
}

/** Intercept GET /music-genres */
export async function mockMusicGenres(page: Page) {
  await page.route(`${API}/music-genres`, (route) =>
    route.fulfill({ status: 200, json: [{ id: '1', name: 'Eletrônico' }] })
  );
}

export const SAMPLE_CLIENTS = [
  { id: 'c1', name: 'Maria Santos', email: 'maria@test.com', city: 'São Paulo', status: 'novo', contacted: false },
  { id: 'c2', name: 'Pedro Costa', email: 'pedro@test.com', city: 'Rio de Janeiro', status: 'engajando', contacted: true },
];
