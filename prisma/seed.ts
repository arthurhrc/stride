import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL! });
pool.on("connect", (client) => { client.query("SET search_path TO stride, public").catch(() => {}); });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const STATUSES = [
  { name: "A fazer", color: "#94a3b8", order: 0, type: "not_started" },
  { name: "Em andamento", color: "#3b82f6", order: 1, type: "active" },
  { name: "Em revisão", color: "#f59e0b", order: 2, type: "active" },
  { name: "Concluído", color: "#22c55e", order: 3, type: "done" },
];

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.retroCard.deleteMany();
  await prisma.canvasCard.deleteMany();
  await prisma.keyResult.deleteMany();
  await prisma.objective.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.taskList.deleteMany();
  await prisma.taskStatus.deleteMany();
  await prisma.space.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("demo123", 12);

  const arthur = await prisma.user.create({
    data: { name: "Arthur Carvalho", email: "arthur@demo.com", password: hash, avatarColor: "#6366f1" },
  });

  const workspace = await prisma.workspace.create({
    data: { name: "Portfólio", slug: "portfolio", color: "#6366f1" },
  });

  await prisma.workspaceMember.create({
    data: { userId: arthur.id, workspaceId: workspace.id, role: "owner" },
  });

  // ── Kanban: Design ────────────────────────────────────────────
  const designSpace = await prisma.space.create({
    data: { name: "Design", icon: "🎨", color: "#ec4899", methodologyType: "kanban", workspaceId: workspace.id },
  });
  const dStatuses = await Promise.all(
    STATUSES.map((s) => prisma.taskStatus.create({ data: { ...s, spaceId: designSpace.id } }))
  );
  const dList = await prisma.taskList.create({ data: { name: "Backlog", order: 0, spaceId: designSpace.id } });
  const dList2 = await prisma.taskList.create({ data: { name: "Sprint 1", order: 1, spaceId: designSpace.id } });
  const designTasks = [
    { title: "Criar wireframes das telas principais", priority: "high", statusId: dStatuses[1].id, assigneeId: arthur.id, order: 0 },
    { title: "Revisar paleta de cores", priority: "normal", statusId: dStatuses[0].id, assigneeId: arthur.id, order: 1 },
    { title: "Aprovar identidade visual", priority: "urgent", statusId: dStatuses[2].id, assigneeId: arthur.id, order: 2 },
    { title: "Exportar assets para o time de dev", priority: "normal", statusId: dStatuses[3].id, assigneeId: arthur.id, order: 3 },
    { title: "Documentar componentes do design system", priority: "low", statusId: dStatuses[0].id, assigneeId: arthur.id, order: 4 },
  ];
  for (const [i, t] of designTasks.entries()) {
    const task = await prisma.task.create({
      data: { ...t, listId: i < 3 ? dList2.id : dList.id, creatorId: arthur.id },
    });
    if (i === 0) {
      await prisma.taskComment.create({ data: { content: "Wireframes prioritários para a landing page e dashboard.", taskId: task.id, userId: arthur.id } });
    }
  }

  // ── Scrum: Desenvolvimento ────────────────────────────────────
  const devSpace = await prisma.space.create({
    data: { name: "Desenvolvimento", icon: "⚙️", color: "#6366f1", methodologyType: "scrum", workspaceId: workspace.id },
  });
  const devStatuses = await Promise.all(
    STATUSES.map((s) => prisma.taskStatus.create({ data: { ...s, spaceId: devSpace.id } }))
  );
  const devList = await prisma.taskList.create({ data: { name: "Backlog", order: 0, spaceId: devSpace.id } });

  const sprint1 = await prisma.sprint.create({
    data: { name: "Sprint 1", goal: "MVP funcional com auth e CRUD", status: "active", startDate: new Date("2025-03-01"), endDate: new Date("2025-03-14"), order: 0, spaceId: devSpace.id },
  });
  await prisma.sprint.create({
    data: { name: "Sprint 2", goal: "Integração de APIs e deploy", status: "planning", order: 1, spaceId: devSpace.id },
  });

  const devTasks = [
    { title: "Configurar autenticação com JWT", priority: "urgent", statusId: devStatuses[3].id, storyPoints: 8, sprintId: sprint1.id },
    { title: "Implementar CRUD de tarefas", priority: "high", statusId: devStatuses[1].id, storyPoints: 13, sprintId: sprint1.id },
    { title: "Setup do banco de dados PostgreSQL", priority: "high", statusId: devStatuses[3].id, storyPoints: 5, sprintId: sprint1.id },
    { title: "Criar componentes de UI base", priority: "normal", statusId: devStatuses[2].id, storyPoints: 8, sprintId: sprint1.id },
    { title: "Testes unitários das rotas de API", priority: "normal", statusId: devStatuses[0].id, storyPoints: 5 },
    { title: "Deploy na Vercel", priority: "high", statusId: devStatuses[3].id, storyPoints: 3 },
    { title: "Documentação da API", priority: "low", statusId: devStatuses[0].id, storyPoints: 2 },
  ];
  for (const [i, t] of devTasks.entries()) {
    await prisma.task.create({ data: { ...t, listId: devList.id, creatorId: arthur.id, assigneeId: arthur.id, order: i } });
  }

  // ── OKR: Marketing ───────────────────────────────────────────
  const mktSpace = await prisma.space.create({
    data: { name: "Marketing", icon: "📢", color: "#f59e0b", methodologyType: "okr", workspaceId: workspace.id },
  });
  await Promise.all(STATUSES.map((s) => prisma.taskStatus.create({ data: { ...s, spaceId: mktSpace.id } })));
  await prisma.taskList.create({ data: { name: "Backlog", order: 0, spaceId: mktSpace.id } });

  const obj1 = await prisma.objective.create({
    data: { title: "Aumentar presença de marca", status: "on_track", ownerId: arthur.id, order: 0, spaceId: mktSpace.id },
  });
  await prisma.keyResult.createMany({
    data: [
      { title: "Seguidores no LinkedIn", current: 1200, target: 5000, unit: "", order: 0, objectiveId: obj1.id },
      { title: "Posts publicados por mês", current: 8, target: 12, unit: "", order: 1, objectiveId: obj1.id },
      { title: "Taxa de engajamento", current: 3.2, target: 6, unit: "%", order: 2, objectiveId: obj1.id },
    ],
  });

  const obj2 = await prisma.objective.create({
    data: { title: "Gerar 50 leads qualificados", status: "at_risk", ownerId: arthur.id, order: 1, spaceId: mktSpace.id },
  });
  await prisma.keyResult.createMany({
    data: [
      { title: "Leads gerados via inbound", current: 12, target: 30, unit: "", order: 0, objectiveId: obj2.id },
      { title: "Taxa de conversão landing page", current: 2.1, target: 5, unit: "%", order: 1, objectiveId: obj2.id },
    ],
  });

  // ── Business Canvas: Produto ──────────────────────────────────
  const productSpace = await prisma.space.create({
    data: { name: "Produto", icon: "💡", color: "#22c55e", methodologyType: "canvas", workspaceId: workspace.id },
  });
  await Promise.all(STATUSES.map((s) => prisma.taskStatus.create({ data: { ...s, spaceId: productSpace.id } })));
  await prisma.taskList.create({ data: { name: "Backlog", order: 0, spaceId: productSpace.id } });

  const canvasData = [
    { block: "value_prop", content: "Gestão ágil de projetos intuitiva para times modernos" },
    { block: "value_prop", content: "5 metodologias em uma única plataforma" },
    { block: "customer_segments", content: "Startups e scale-ups (5-50 pessoas)" },
    { block: "customer_segments", content: "Times de produto e tecnologia" },
    { block: "channels", content: "Marketing de conteúdo e SEO" },
    { block: "channels", content: "Word of mouth" },
    { block: "customer_relations", content: "Onboarding guiado" },
    { block: "customer_relations", content: "Suporte via chat" },
    { block: "revenue", content: "Assinatura mensal por usuário (SaaS)" },
    { block: "key_resources", content: "Plataforma cloud escalável" },
    { block: "key_resources", content: "Time de engenharia" },
    { block: "key_activities", content: "Desenvolvimento de produto" },
    { block: "key_activities", content: "Aquisição de clientes" },
    { block: "key_partners", content: "Neon, Vercel, Radix UI" },
    { block: "cost_structure", content: "Salários da equipe" },
    { block: "cost_structure", content: "Infraestrutura de cloud" },
  ];
  const colors = ["#fef9c3", "#dbeafe", "#dcfce7", "#fce7f3", "#ede9fe"];
  for (const [i, c] of canvasData.entries()) {
    await prisma.canvasCard.create({ data: { ...c, color: colors[i % colors.length], order: i, spaceId: productSpace.id } });
  }

  // ── Retrospectiva: Operações ──────────────────────────────────
  const opsSpace = await prisma.space.create({
    data: { name: "Operações", icon: "🔄", color: "#8b5cf6", methodologyType: "retro", workspaceId: workspace.id },
  });
  await Promise.all(STATUSES.map((s) => prisma.taskStatus.create({ data: { ...s, spaceId: opsSpace.id } })));
  await prisma.taskList.create({ data: { name: "Backlog", order: 0, spaceId: opsSpace.id } });

  const retroData = [
    { content: "Fazer pair programming com mais frequência", column: "start", votes: 4 },
    { content: "Code reviews mais detalhados nos PRs", column: "start", votes: 2 },
    { content: "Reuniões de status diárias longas demais", column: "stop", votes: 5 },
    { content: "Mexer em código sem criar uma branch", column: "stop", votes: 3 },
    { content: "Retrospectivas quinzenais — funcionando!", column: "continue", votes: 6 },
    { content: "Documentar decisões técnicas no README", column: "continue", votes: 3 },
    { content: "Daily async via Slack às 9h", column: "continue", votes: 2 },
  ];
  for (const [i, r] of retroData.entries()) {
    await prisma.retroCard.create({ data: { ...r, order: i, authorId: arthur.id, spaceId: opsSpace.id } });
  }

  console.log("✅ Seed concluído!");
  console.log("📧 arthur@demo.com / demo123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
