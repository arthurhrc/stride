import Link from "next/link";
import { Zap, ArrowRight, Kanban, LayoutGrid, Target, Layers, RotateCcw, CheckCircle2, Github } from "lucide-react";

const METHODOLOGIES = [
  { icon: Kanban, emoji: "🗂️", name: "Kanban", desc: "Quadro visual com drag & drop. Veja o trabalho fluir de A fazer até Concluído.", color: "from-violet-500 to-violet-700", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { icon: LayoutGrid, emoji: "🏃", name: "Scrum", desc: "Backlog, sprints e story points. Ritmo ágil para times que entregam em ciclos.", color: "from-blue-500 to-blue-700", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  { icon: Target, emoji: "🎯", name: "OKR", desc: "Defina objetivos ambiciosos e meça com resultados-chave. Foco no que importa.", color: "from-emerald-500 to-emerald-700", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { icon: Layers, emoji: "🧩", name: "Business Canvas", desc: "9 blocos do modelo de negócio em sticky notes. Estratégia visual para o time.", color: "from-amber-500 to-amber-700", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { icon: RotateCcw, emoji: "🔄", name: "Retrospectiva", desc: "Start, Stop, Continue com votação. Transforme aprendizados em ação.", color: "from-rose-500 to-rose-700", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Stride</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300">
            <Zap className="h-3.5 w-3.5" />
            Gestão de projetos para times modernos
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Work smarter,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              move faster
            </span>
          </h1>

          <p className="mx-auto mb-6 max-w-2xl text-xl text-gray-400 leading-relaxed">
            Escolha a metodologia certa para cada time. Kanban, Scrum, OKR, Canvas ou Retrospectiva — tudo em um só lugar.
          </p>

          {/* Methodology pills */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            {METHODOLOGIES.map((m) => (
              <span key={m.name} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300">
                {m.emoji} {m.name}
              </span>
            ))}
          </div>

          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-900/50 hover:bg-violet-500 transition-all hover:-translate-y-0.5">
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            {["Grátis para sempre", "Sem cartão de crédito", "Setup em 2 minutos"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodologies */}
      <section className="border-t border-white/5 bg-gray-900 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Escolha como seu time trabalha</h2>
            <p className="mt-4 text-lg text-gray-400">Cada espaço tem sua própria metodologia. Mude quando quiser.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {METHODOLOGIES.map((m) => (
              <div key={m.name} className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/8">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${m.color}`}>
                  <m.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                  {m.emoji} {m.name}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">{m.desc}</p>
              </div>
            ))}
            {/* 6th card: CTA */}
            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6 flex flex-col justify-between">
              <div>
                <div className="mb-4 text-3xl">✨</div>
                <h3 className="mb-2 text-lg font-semibold">Comece agora</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Crie sua conta e escolha a metodologia no momento de criar o espaço.</p>
              </div>
              <Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors self-start">
                Começar grátis <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Pronto para dar o próximo passo?</h2>
          <p className="mb-8 text-lg text-gray-400">Sem curva de aprendizado, sem complicação. Em dois minutos seu time já está trabalhando.</p>
          <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" />
            <span className="font-semibold text-gray-300">Stride</span>
          </div>
          <p>© 2025 Stride. Work smarter, move faster.</p>

          <p className="mt-1">
            Desenvolvido por{" "}
            <a href="https://github.com/arthurhrc" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1">
              <Github className="h-3.5 w-3.5" /> Arthur Carvalho
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
