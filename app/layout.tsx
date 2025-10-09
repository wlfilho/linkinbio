import type { Metadata } from "next";
import { Fira_Sans, Fira_Sans_Condensed } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// Fira Sans para textos gerais (body)
const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
  display: "swap",
});

// Fira Sans Condensed para títulos (headings)
const firaSansCondensed = Fira_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-fira-sans-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Link in Bio - Plataforma de Links Personalizados",
  description: "Crie sua página de links personalizada e capture leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${firaSans.variable} ${firaSansCondensed.variable} font-body antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

