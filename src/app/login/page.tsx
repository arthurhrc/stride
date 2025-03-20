"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao entrar"); return; }
    router.push(`/app/${data.workspaceSlug}/${data.spaceId}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-200">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Entrar no Stride</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bem-vindo de volta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700">
          {error && <p className="rounded-lg bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">E-mail</label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Senha</label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-violet-600 hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
