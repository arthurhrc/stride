# Stride

> Work smarter, move faster.

Gestão de projetos moderna inspirada no ClickUp — com Kanban drag & drop, múltiplas vistas e colaboração em tempo real.

## Features

- **Kanban board** com drag & drop entre colunas de status
- **Vista de lista** com agrupamento por lista e collapse
- **Task detail** em painel lateral com edição inline
- **Comentários** em cada tarefa
- **Prioridades** (Urgente, Alta, Normal, Baixa)
- **Responsáveis** com avatares coloridos
- **Prazos** com indicador visual de atraso
- **Status customizáveis** por espaço
- **Múltiplos workspaces e espaços**
- **Busca** de tarefas em tempo real

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + Radix UI |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Backend | Next.js Route Handlers (REST API) |
| Banco de dados | Prisma 7 + PostgreSQL (Neon) |
| Auth | Sessões com cookies httpOnly |

## Rodando localmente

```bash
git clone https://github.com/arthurhrc/stride.git
cd stride
yarn install
cp .env.example .env
# Edite .env com sua DATABASE_URL do Neon (neon.tech)
yarn prisma generate
yarn prisma migrate dev --name init
yarn tsx prisma/seed.ts
yarn dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Credenciais demo

| Usuário | E-mail | Senha |
|---|---|---|
| Arthur Carvalho | arthur@demo.com | demo123 |
| Barbara Lima | barbara@demo.com | demo123 |
| William Santos | william@demo.com | demo123 |

---

Desenvolvido por Arthur Carvalho como projeto de portfólio full stack.
