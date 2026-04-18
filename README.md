# Frontend CRM Partiu

Next.js App Router com autenticação via httpOnly cookies.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase JS (apenas para `supabaseClient.ts` — auth delegada ao backend)

## Variáveis de ambiente

Crie um `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001   # produção: https://backend-crmpartiu.onrender.com
```

## Instalação e execução local

```bash
npm install
npm run dev
```

## Regras de desenvolvimento

- **Testar o build (`npm run build`) antes de qualquer commit ou push**
- Todas as chamadas à API usam `credentials: 'include'` — nunca omitir essa opção
- Nunca armazenar tokens em `localStorage` — autenticação exclusivamente via cookie httpOnly

---

## Arquitetura de autenticação

### Fluxo

```
Login Page → login(email, password) → POST /auth/login →
  → Backend seta cookie auth_token (httpOnly) →
  → redirect para /dashboard

Protected → GET /auth/me (cookie enviado automaticamente) →
  → 401 → redirect /auth/login
  → 200 → renderiza página

Logout → logout() → POST /auth/logout →
  → Backend limpa cookie → redirect /auth/login
```

### Fluxo de refresh automático

```
apiFetch() → 401 → refreshToken() → POST /auth/refresh →
  → ok  → retry da request original
  → fail → redirect /auth/login

useAuthRefresh (a cada 50 min) → refreshToken() →
  → fail → redirect /auth/login
```

### Arquivos de auth

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/auth.ts` | `login()`, `logout()`, `refreshToken()` — fonte de verdade para auth |
| `src/lib/api.ts` | `apiFetch()` — intercepta 401 e renova token automaticamente |
| `src/lib/protected.tsx` | Wrapper que verifica sessão via `GET /auth/me` |
| `src/hooks/useAuthRefresh.ts` | Hook que renova token silenciosamente a cada 50 min |
| `src/components/ClientProviders.tsx` | Client Component que ativa `useAuthRefresh` no layout |
| `src/components/Header.tsx` | Botão de logout usando `logout()` |

---

## Rotas

| Rota | Auth | Descrição |
|------|------|-----------|
| `/` | Não | Redireciona para `/auth/login` |
| `/auth/login` | Não | Página de login |
| `/register` | Não | Cadastro público de cliente |
| `/dashboard` | Sim | Dashboard principal |
| `/dashboard/clients` | Sim | Lista de clientes |

---

## Histórico de mudanças

### 2026-04-18 — Migração para httpOnly cookies

**Problema:** Token JWT armazenado em `localStorage` é vulnerável a ataques XSS.

**Solução:**
- `lib/auth.ts` reescrito: removido `setToken/getToken/clearToken`; criados `login()` e `logout()` que chamam o backend
- `lib/api.ts`: removido header `Authorization` e leitura de `localStorage`; adicionado `credentials: 'include'` em todos os `fetch()`
- `lib/protected.tsx`: substituída verificação de sessão Supabase por `GET /auth/me`
- `app/auth/login/page.tsx`: usa `login()` de `lib/auth.ts` em vez de Supabase direto
- `components/Header.tsx`: usa `logout()` de `lib/auth.ts`
- `dashboard/page.tsx` e `dashboard/clients/page.tsx`: removidas chamadas a `getToken()`

**Arquivos alterados:**
- `src/lib/auth.ts`
- `src/lib/api.ts`
- `src/lib/protected.tsx`
- `src/app/auth/login/page.tsx`
- `src/components/Header.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/clients/page.tsx`

---

### 2026-04-18 — Refresh automático de token JWT

**Problema:** `access_token` expira após ~1h; o usuário era deslogado no meio do uso.

**Solução:**
- `refreshToken()` adicionado em `lib/auth.ts` — chama `POST /auth/refresh` com `credentials: 'include'`
- `apiFetch()` em `lib/api.ts` intercepta respostas 401, tenta renovar e faz retry; se falhar, redireciona para login
- `hooks/useAuthRefresh.ts` — hook que dispara renovação silenciosa a cada 50 min
- `components/ClientProviders.tsx` — Client Component que usa `useAuthRefresh`; envolve a aplicação no layout
- `app/layout.tsx` — `children` envolvidos em `<ClientProviders>`

**Arquivos criados/alterados:**
- `src/lib/auth.ts` — adicionado `refreshToken()`
- `src/lib/api.ts` — interceptação de 401 + retry
- `src/hooks/useAuthRefresh.ts` — novo
- `src/components/ClientProviders.tsx` — novo
- `src/app/layout.tsx` — usa ClientProviders

---

### 2026-04-18 — Cache local para autocomplete de cidades

**Problema:** Cada keystroke disparava uma query na lista completa do IBGE; sem fallback se a API caísse.

**Solução — estratégia cache-first em 3 camadas:**
1. **Lista estática** (`lib/cities.ts`) — 100 cidades principais, retorno <10ms, sempre disponível offline
2. **Cache localStorage** (`lib/cityCache.ts`) — lista completa do IBGE armazenada por 7 dias; `clearCitiesCache()` para forçar atualização
3. **API IBGE** — chamada apenas na primeira vez (sem cache) ou ao clicar em "Atualizar lista"

`CityAutocomplete` exibe badge com a fonte (`lista local` / `cache` / `IBGE`) e botão "Atualizar lista" quando servindo do cache.

**Arquivos criados/alterados:**
- `src/lib/cities.ts` — novo (100 cidades estáticas)
- `src/lib/cityCache.ts` — novo (get/set/clear com TTL de 7 dias)
- `src/hooks/usePublicRegister.ts` — lógica cache-first substituindo fetch direto
- `src/components/CityAutocomplete.tsx` — props `cacheSource` e `onRefreshCache`
- `src/app/register/page.tsx` — passa novos props ao componente

---

### 2026-04-18 — Dashboard de métricas avançadas

**Problema:** Dashboard mostrava apenas totais básicos sem análise de negócio.

**Solução:**
- Tabs no dashboard: **Visão Geral** / **Conversão** / **Engajamento** / **Retenção**
- Métricas avançadas carregadas sob demanda (lazy load por tab)
- Filtro de período para clientes inativos (30/90/180/365 dias)
- Exportação CSV em "Clientes Inativos" e "Retenção por Coorte"

**Componentes criados:**
- `ConversionFunnelChart` — BarChart horizontal com taxas de conversão entre estágios
- `EngagementTrendChart` — LineChart com clientes ativos e média de interações por mês
- `TopSourcesPieChart` — PieChart/Donut das top 5 origens de leads
- `InactiveClientsList` — Tabela com badge de dias inativo + exportar CSV
- `RetentionCohortHeatmap` — Grid colorido (heatmap) de retenção 30/60/90d por coorte

**Arquivos alterados:**
- `src/app/dashboard/page.tsx` — tabs + lazy load + filtros
- `src/components/ConversionFunnelChart.tsx` — novo
- `src/components/EngagementTrendChart.tsx` — novo
- `src/components/TopSourcesPieChart.tsx` — novo
- `src/components/InactiveClientsList.tsx` — novo
- `src/components/RetentionCohortHeatmap.tsx` — novo

---

### 2026-04-18 — Testes E2E com Playwright

**Problema:** Sem testes de ponta-a-ponta, regressões na UI passam despercebidas.

**Solução:** 16 testes em 3 specs usando Playwright com mocks de API via `page.route()`.

| Spec | Testes | O que cobre |
|------|--------|-------------|
| `auth.spec.ts` | 5 | Login, redirect sem auth, alert de erro, estado de loading |
| `clients.spec.ts` | 6 | Tabela, estado vazio, busca, modal de criação, modal de importação |
| `dashboard.spec.ts` | 5 | Título, tabs, métricas, troca de aba avançada |

**Como rodar:**
```bash
# Instalar dependências do sistema (uma vez, requer sudo)
sudo npx playwright install --with-deps chromium

npm run test:e2e           # todos os testes
npm run test:e2e:ui        # modo interativo
npm run test:e2e:report    # ver relatório
```

**Arquivos criados:**
- `playwright.config.ts` — config com webServer automático
- `e2e/auth.spec.ts` — testes de autenticação
- `e2e/clients.spec.ts` — testes de clientes e modais
- `e2e/dashboard.spec.ts` — testes do dashboard
- `e2e/helpers/mockApi.ts` — interceptors reutilizáveis para todos os endpoints
- `e2e/fixtures/clients.csv` — fixture de importação
