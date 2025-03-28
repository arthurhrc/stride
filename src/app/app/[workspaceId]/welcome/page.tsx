import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

const METHODOLOGIES = [
  { emoji: "🗂️", name: "Kanban", type: "kanban", desc: "Quadro visual com colunas de status. Ideal para times que querem visualizar o fluxo de trabalho.", color: "border-violet-200 hover:border-violet-400 hover:bg-violet-50" },
  { emoji: "🏃", name: "Scrum", type: "scrum", desc: "Backlog, sprints e story points. Para times que trabalham em ciclos de entrega.", color: "border-blue-200 hover:border-blue-400 hover:bg-blue-50" },
  { emoji: "🎯", name: "OKR", type: "okr", desc: "Objetivos e Resultados-Chave. Conecte o trabalho do dia a dia com as metas da empresa.", color: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50" },
  { emoji: "🧩", name: "Business Canvas", type: "canvas", desc: "Os 9 blocos do modelo de negócio em sticky notes digitais. Ótimo para estratégia.", color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50" },
  { emoji: "🔄", name: "Retrospectiva", type: "retro", desc: "Start, Stop e Continue com votação. Transforme aprendizados do time em ações concretas.", color: "border-rose-200 hover:border-rose-400 hover:bg-rose-50" },
];

export default async function WelcomePage({ params }: Props) {
  const { workspaceId } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceId },
  });
  if (!workspace) redirect("/login");

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        {/* Logo */}
        <div className="mb-12 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Stride</span>
        </div>

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Bem-vindo, {firstName}! 👋
          </h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">
            Seu workspace <span className="font-semibold text-gray-700 dark:text-gray-200">{workspace.name}</span> está pronto.
            Agora crie seu primeiro espaço escolhendo como seu time prefere trabalhar:
          </p>
        </div>

        {/* Methodology cards */}
        <div className="flex flex-col gap-3 mb-8">
          {METHODOLOGIES.map((m) => (
            <Link
              key={m.type}
              href={`/app/${workspaceId}?openCreate=true&methodology=${m.type}`}
              className={`group flex items-center gap-4 rounded-2xl border-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-500 p-5 transition-all ${m.color}`}
            >
              <span className="text-3xl shrink-0">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{m.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{m.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 dark:text-gray-600 dark:group-hover:text-gray-300 transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        {/* Skip */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          Já sabe o que quer?{" "}
          <Link href={`/app/${workspaceId}`} className="text-violet-600 hover:underline font-medium">
            Ir para o workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
