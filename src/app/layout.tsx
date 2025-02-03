import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stride — Work smarter, move faster",
  description: "Gestão de projetos moderna para times que querem avançar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
