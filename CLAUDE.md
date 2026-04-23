# CRM Partiu Pra Boa — Frontend

## Stack
- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript 5
- **Estilização:** Tailwind CSS 4 + PostCSS
- **Gráficos:** recharts
- **Animações:** framer-motion
- **Ícones:** lucide-react
- **Auth:** Supabase Auth + JWT em localStorage
- **Testes:** Playwright (e2e)
- **Hosting:** Vercel

## Variáveis de ambiente (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL=https://backend-crmpartiu.onrender.com
```

## Estrutura de arquivos
```
src/
  app/
    layout.tsx                    # Layout raiz (fonte Geist)
    page.tsx                      # Redireciona para /auth/login
    auth/login/page.tsx           # Login
    register/page.tsx             # Cadastro público (sem auth)
    dashboard/
      page.tsx                    # Dashboard com 4 abas de analytics
      clients/page.tsx            # Listagem paginada de clientes
  components/
    ClientView.tsx                # Ficha do cliente (botões WhatsApp, Email, Editar, Excluir)
    ClientModal.tsx               # Modal container (ClientView + ClientEditForm)
    ClientEditForm.tsx            # Formulário de edição
    ClientCreateModal.tsx         # Criação manual de cliente
    ImportClientsModal.tsx        # Importação em massa Excel/CSV
    BirthdayList.tsx              # Aniversariantes do mês (dashboard)
    RecentClients.tsx             # Últimos 5 clientes
    DashboardCards.tsx            # Cards de métricas (total, semana, mês)
    DashboardQuickStats.tsx       # Stats rápidas
    ClientsByCityChart.tsx        # Gráfico por cidade
    ConversionFunnelChart.tsx     # Funil de conversão
    EngagementTrendChart.tsx      # Tendência de engajamento
    TopSourcesPieChart.tsx        # Pizza de origens de lead
    InactiveClientsList.tsx       # Clientes inativos
    RetentionCohortHeatmap.tsx    # Heatmap de retenção por coorte
    CityAutocomplete.tsx          # Autocomplete cidades (3 camadas: static → cache → IBGE)
    Header.tsx                    # Cabeçalho com nav
    SuccessModal.tsx              # Modal de sucesso genérico
    ClientProviders.tsx           # Providers wrapper
  hooks/
    usePublicRegister.ts          # Lógica do formulário público
    useAuthRefresh.ts             # Refresh de token
  lib/
    api.ts                        # apiFetch() — wrapper fetch com auth + refresh automático
    auth.ts                       # login(), logout(), refreshToken()
    protected.tsx                 # HOC para rotas protegidas
    supabaseClient.ts             # Cliente Supabase
    normalizeClients.ts           # Normalização de dados de importação
    cities.ts                     # Lista estática de 50+ cidades
    cityCache.ts                  # Cache localStorage para IBGE
  types/
    client.ts                     # Tipos TypeScript do domínio
```

## Como fazer chamadas ao backend

Sempre usar `apiFetch()` de `/src/lib/api.ts`:

```typescript
import { apiFetch } from '@/lib/api';

// GET
const data = await apiFetch('/clients?page=1&limit=20');

// POST
await apiFetch('/clients', { method: 'POST', body: { name, phone, ... } });

// PATCH
await apiFetch(`/clients/${id}`, { method: 'PATCH', body: { contacted: true } });

// DELETE
await apiFetch(`/clients/${id}`, { method: 'DELETE' });
```

- Usa `credentials: 'include'` (cookies httpOnly)
- Trata erro 401 com refresh automático
- Se refresh falhar, redireciona para `/auth/login`

## Rotas da aplicação

| Rota | Auth | Descrição |
|------|------|-----------|
| `/` | Pública | Redireciona para `/auth/login` |
| `/auth/login` | Pública | Login email/senha |
| `/register` | Pública | Cadastro público de cliente |
| `/dashboard` | Protegida | Dashboard analytics (4 abas) |
| `/dashboard/clients` | Protegida | Listagem e gestão de clientes |

## Componente ClientView — estado atual

Localizado em `src/components/ClientView.tsx`.

Botões de ação existentes:
- **WhatsApp** — abre `https://wa.me/{phone}` (link direto, sem API)
- **Email** — abre `mailto:{email}`
- **Editar dados** — abre ClientEditForm
- **Excluir** — com confirmação

## Padrão visual

- Tema escuro: `from-gray-900 via-gray-800 to-black`
- Glass-morphism: `backdrop-blur-xl bg-white/10 border border-white/10`
- Cores de ação:
  - Verde: `emerald-500` (WhatsApp, confirmações)
  - Azul: `blue-600` (edição)
  - Vermelho: `red-600` (delete)
- Mobile-first: `grid-cols-1 md:grid-cols-2`

## Tipo Client

```typescript
interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  birth_date?: string;
  gender?: 'Masculino' | 'Feminino';
  lead_source?: string;
  favorite_event?: { id: string; name: string } | string;
  bought_with_partiu?: boolean;
  music_genres?: string[];
  contacted?: boolean;
  deleted_at?: string;
}
```

## Endpoints do backend consumidos

| Endpoint | Usado em |
|----------|----------|
| `POST /auth/login` | auth.ts |
| `POST /auth/logout` | auth.ts |
| `POST /auth/refresh` | api.ts |
| `GET /clients` | clients/page.tsx |
| `POST /clients` | ClientCreateModal |
| `PUT /clients/:id` | ClientEditForm |
| `DELETE /clients/:id` | ClientView |
| `PATCH /clients/:id` | ClientView (contacted) |
| `POST /clients/bulk` | ImportClientsModal |
| `GET /dashboard/recent` | RecentClients |
| `GET /dashboard/birthdays` | BirthdayList |
| `GET /dashboard/clients-by-city` | ClientsByCityChart |
| `GET /music-genres` | ClientCreateModal, ClientEditForm |

## Componente ClientView — estado atual

Localizado em `src/components/ClientView.tsx`.

Botões de ação existentes:
- **WhatsApp** — abre `https://wa.me/{phone}` (link direto, sem API)
- **Email** — abre `mailto:{email}`
- **Editar dados** — abre ClientEditForm
- **Excluir** — com confirmação
- **Marcar como convertido** — chama `POST /api/birthday/:clientId/convert`, desabilita após conversão, mostra "✓ Já convertido" em verde

## Tipo Client — campos adicionados

```typescript
birthday_converted_year?: number | null; // ano em que converteu pelo aniversário
```

## Próximos passos pendentes

1. **Histórico de mensagens** — na ficha do cliente, consumindo `message_logs` do backend
2. **Templates editáveis** — interface para editar prompts de mensagem
