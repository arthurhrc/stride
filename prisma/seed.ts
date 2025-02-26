import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

const STATUSES = [
  { name: "A fazer", color: "#94a3b8", order: 0, type: "not_started" },
  { name: "Em andamento", color: "#3b82f6", order: 1, type: "active" },
  { name: "Em revisão", color: "#f59e0b", order: 2, type: "active" },
  { name: "Concluído", color: "#22c55e", order: 3, type: "done" },
];

const SPACES = [
  { name: "Design", icon: "🎨", color: "#ec4899" },
  { name: "Desenvolvimento", icon: "⚙️", color: "#6366f1" },
  { name: "Marketing", icon: "📢", color: "#f59e0b" },
];

async function main() {
  console.log("🌱 Iniciando seed...");

  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
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
  const barbara = await prisma.user.create({
    data: { name: "Barbara Lima", email: "barbara@demo.com", password: hash, avatarColor: "#ec4899" },
  });
  const william = await prisma.user.create({
    data: { name: "William Santos", email: "william@demo.com", password: hash, avatarColor: "#f59e0b" },
  });

  const workspace = await prisma.workspace.create({
    data: { name: "Stride Demo", slug: "stride-demo", color: "#6366f1" },
  });

  await prisma.workspaceMember.createMany({
    data: [
      { userId: arthur.id, workspaceId: workspace.id, role: "owner" },
      { userId: barbara.id, workspaceId: workspace.id, role: "member" },
      { userId: william.id, workspaceId: workspace.id, role: "member" },
    ],
  });

  for (const spaceData of SPACES) {
    const space = await prisma.space.create({
      data: { ...spaceData, workspaceId: workspace.id },
    });

    const statuses = await Promise.all(
      STATUSES.map((s) => prisma.taskStatus.create({ data: { ...s, spaceId: space.id } }))
    );

    const list = await prisma.taskList.create({ data: { name: "Backlog", order: 0, spaceId: space.id } });
    const list2 = await prisma.taskList.create({ data: { name: "Sprint 1", order: 1, spaceId: space.id } });

    const tasks = [
      { title: "Criar wireframes das telas principais", priority: "high", statusId: statuses[1].id, assigneeId: barbara.id, order: 0 },
      { title: "Revisar paleta de cores", priority: "normal", statusId: statuses[0].id, assigneeId: arthur.id, order: 1 },
      { title: "Aprovar identidade visual com o cliente", priority: "urgent", statusId: statuses[2].id, assigneeId: william.id, order: 2 },
      { title: "Exportar assets para o time de dev", priority: "normal", statusId: statuses[3].id, assigneeId: barbara.id, order: 3 },
      { title: "Documentar componentes do design system", priority: "low", statusId: statuses[0].id, assigneeId: arthur.id, order: 4 },
    ];

    for (const [i, t] of tasks.entries()) {
      const task = await prisma.task.create({
        data: { ...t, listId: i < 3 ? list2.id : list.id, creatorId: arthur.id },
      });
      if (i === 0) {
        await prisma.taskComment.create({
          data: { content: "Preciso dos wireframes até sexta para enviar ao cliente!", taskId: task.id, userId: william.id },
        });
        await prisma.taskComment.create({
          data: { content: "Já comecei, deve ficar pronto em 2 dias.", taskId: task.id, userId: barbara.id },
        });
      }
    }
  }

  console.log("✅ Seed concluído!");
  console.log("📧 arthur@demo.com / demo123");
  console.log("📧 barbara@demo.com / demo123");
  console.log("📧 william@demo.com / demo123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
