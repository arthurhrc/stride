import Link from "next/link";
import { Zap, Kanban, List, MessageSquare, Users, Target, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  { icon: Kanban, title: "Kanban com drag & drop", desc: "Mova tarefas entre status com arrastar e soltar. Visualize o fluxo de trabalho em tempo real." },
  { icon: List, title: "Vista de lista avançada", desc: "Filtre, ordene e agrupe tarefas. Encontre qualquer coisa em segundos." },
  { icon: Target, title: "Prioridades inteligentes", desc: "Urgente, Alta, Normal, Baixa. Foque no que realmente importa hoje." },
  { icon: MessageSquare, title: "Comentários em tarefas", desc: "Discussões centralizadas em cada tarefa. Chega de e-mail perdido." },
  { icon: Users, title: "Times e workspaces", desc: "Organize times em workspaces. Cada espaço com seus próprios status." },
  { icon: BarChart3, title: "Status customizáveis", desc: "Crie o fluxo ideal para seu time. Do \"A Fazer\" ao \"Concluído\"." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Stride</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50 py-24 md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
            <Zap className="h-3.5 w-3.5" />
            Gestão de projetos reimaginada
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            Work smarter,{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              move faster
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-500 leading-relaxed">
            Tudo que seu time precisa para organizar, priorizar e entregar — em um lugar só. Sem complicação.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all hover:shadow-violet-300">
              Começar grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Ver demonstração
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            {["Grátis para sempre", "Sem cartão de crédito", "Setup em 2 minutos"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-violet-500" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-5xl px-6">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <div key={c} className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
              ))}
              <div className="ml-2 h-5 flex-1 max-w-48 rounded-md bg-gray-200" />
            </div>
            <div className="flex h-96 overflow-hidden">
              <div className="w-52 shrink-0 border-r border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-violet-600" />
                  <div className="h-4 w-20 rounded bg-gray-200" />
                </div>
                {["🚀 Geral", "📋 Design", "⚙️ Dev", "📊 Marketing"].map((s, i) => (
                  <div key={i} className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${i === 0 ? "bg-violet-100 text-violet-700 font-medium" : "text-gray-500"}`}>
                    {s}
                  </div>
                ))}
              </div>
              <div className="flex flex-1 gap-3 overflow-x-auto p-4">
                {[
                  { status: "A fazer", color: "#94a3b8", tasks: ["Revisar proposta", "Pesquisa UX", "Criar wireframes"] },
                  { status: "Em andamento", color: "#3b82f6", tasks: ["Landing page", "API de usuários"] },
                  { status: "Revisão", color: "#f59e0b", tasks: ["Design system"] },
                  { status: "Concluído", color: "#22c55e", tasks: ["Briefing", "Reunião inicial", "Setup do projeto"] },
                ].map((col) => (
                  <div key={col.status} className="w-48 shrink-0">
                    <div className="mb-2 flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="text-xs font-medium text-gray-600">{col.status}</span>
                      <span className="ml-auto text-xs text-gray-400">{col.tasks.length}</span>
                    </div>
                    {col.tasks.map((t) => (
                      <div key={t} className="mb-2 rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                        <p className="text-xs text-gray-700">{t}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-violet-400" />
                          <div className="h-2 w-12 rounded bg-gray-100" />
                        </div>
                      </div>
                    ))}
                    <div className="rounded-lg border border-dashed border-gray-200 p-2 text-center text-xs text-gray-400">
                      + Adicionar
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Tudo que você precisa, nada do que você não precisa</h2>
            <p className="mt-4 text-lg text-gray-500">Ferramentas poderosas, interface simples. O equilíbrio perfeito.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 group-hover:bg-violet-100 transition-colors">
                  <f.icon className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-violet-600 to-purple-700 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Pronto para dar o próximo passo?</h2>
          <p className="mb-8 text-lg text-violet-100">Junte-se a times que já escolheram trabalhar com mais clareza e velocidade.</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-violet-700 shadow-lg hover:bg-violet-50 transition-colors">
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-400">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" />
            <span className="font-semibold text-gray-700">Stride</span>
          </div>
          <p>© {new Date().getFullYear()} Stride. Work smarter, move faster.</p>
        </div>
      </footer>
    </div>
  );
}
