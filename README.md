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
