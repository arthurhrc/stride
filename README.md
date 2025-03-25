# Stride

> Work smarter, move faster.

Gestão de projetos moderna inspirada no ClickUp — com suporte a múltiplas metodologias ágeis, Kanban drag & drop, múltiplas vistas e colaboração em tempo real.

**Demo ao vivo:** [stride-orpin-ten.vercel.app](https://stride-orpin-ten.vercel.app)

## Metodologias suportadas

| Metodologia | Descrição |
|---|---|
| 🗂️ **Kanban** | Quadro visual com drag & drop entre colunas de status |
| 🏃 **Scrum** | Product backlog, sprints, board e burndown por story points |
| 🎯 **OKR** | Objetivos com resultados-chave e barras de progresso |
| 🧩 **Business Canvas** | 9 blocos do Business Model Canvas com sticky notes |
| 🔄 **Retrospectiva** | Start/Stop/Continue com votação e exportação de ações |

## Features

- **Kanban board** com drag & drop entre colunas de status
- **Vista de lista** com agrupamento por lista e collapse
- **Task detail** em painel lateral com edição inline
- **Comentários** em cada tarefa
- **Prioridades** (Urgente, Alta, Normal, Baixa)
- **Story points** no Scrum (calculado a partir da prioridade)
- **Responsáveis** com avatares coloridos
- **Prazos** com indicador visual de atraso
- **Status customizáveis** por espaço
- **Múltiplos workspaces e espaços**
- **Busca** de tarefas em tempo real
- **Criação de espaços** com seletor de metodologia, ícone e cor
- **Dark mode** com alternância manual e persistência via localStorage
- **Layout responsivo** com drawer mobile e header compacto

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + Radix UI |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Backend | Next.js Route Handlers (REST API) |
| Banco de dados | Prisma 7 + PostgreSQL (Neon) |
| Auth | Sessões com cookies httpOnly |
| Deploy | Vercel |

## Rodando localmente

```bash
git clone https://github.com/arthurhrc/stride.git
cd stride
yarn install
cp .env.example .env
# Edite .env com sua DATABASE_URL e DIRECT_URL do Neon (neon.tech)
yarn prisma generate
node -e "require('pg').Client && console.log('pg ok')" # verifique conexão
node_modules/.bin/tsx prisma/seed.ts
yarn dev
```

Acesse: <http://localhost:3000>

## Credenciais demo

| Usuário | E-mail | Senha |
|---|---|---|
| Arthur Carvalho | arthur@demo.com | demo123 |

---

Desenvolvido por Arthur Carvalho como projeto de portfólio full stack.
