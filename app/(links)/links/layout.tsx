import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/app/globals.css";
import ScrollManager from "@/components/behavior/ScrollManager";
import ThemeEffects from "@/components/behavior/ThemeEffects";
import ThemeScript from "@/components/behavior/ThemeScript";

export const metadata: Metadata = {
  title: "Basem Esam - All My Links",
  description:
    "All my important links in one place - Basem Esam, Backend Developer & CS Student",
  icons: {
    apple: [{ url: "/assets/icons/light/apple-touch-icon.png", sizes: "180x180" }],
    icon: [
      { url: "/assets/icons/light/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icons/light/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  },
};

export default function LinksLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className="min-h-screen bg-[linear-gradient(135deg,#f5f7fa_0%,#c3cfe2_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)]"
        suppressHydrationWarning
      >
        <ThemeScript />
        {children}
        <ThemeEffects />
        <ScrollManager />
      </body>
    </html>
  );
}
