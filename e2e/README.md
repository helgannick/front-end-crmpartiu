# Testes E2E — Playwright

## Pré-requisitos

```bash
# Instalar browsers com dependências do sistema (Linux/WSL)
sudo npx playwright install --with-deps chromium

# Ou apenas o browser (se as libs já estiverem instaladas)
npx playwright install chromium
```

## Como rodar

```bash
# Rodar todos os testes (inicia o Next.js automaticamente)
npm run test:e2e

# Modo UI interativo
npm run test:e2e:ui

# Ver relatório do último run
npm run test:e2e:report
```

## Estrutura

```
e2e/
├── auth.spec.ts          — Login, logout, proteção de rotas (5 testes)
├── clients.spec.ts       — Lista, busca, modal de criação, importação (6 testes)
├── dashboard.spec.ts     — Tabs, métricas, contadores (5 testes)
├── helpers/
│   └── mockApi.ts        — Interceptors page.route() para todos os endpoints
└── fixtures/
    └── clients.csv       — Fixture de importação
```

## Estratégia de mock

Todos os testes usam `page.route()` para interceptar chamadas ao backend (`localhost:3001`).
Isso garante que os testes são isolados, rápidos e não dependem do backend estar rodando.

## WSL / CI

Em WSL sem acesso sudo, instale as dependências manualmente:
```bash
sudo apt-get install libnspr4 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
  libxrandr2 libgbm1 libasound2
```

Em GitHub Actions, use a action oficial que já inclui as dependências:
```yaml
- uses: microsoft/playwright-github-action@v1
```
