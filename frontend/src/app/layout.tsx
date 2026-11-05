import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Gbairai — Confessions & Potins Anonymes",
  description: "Réseau social 100% anonyme de confessions, secrets et anecdotes locales.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gbairai",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark h-full">
      <body
        className="min-h-full bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-rose-500/30 selection:text-rose-200"
      >
        <QueryProvider>
          {children}
          <ServiceWorkerRegister />
        </QueryProvider>
      </body>
    </html>
  );
}
