import type { Metadata } from "next";
import { preconnect, preload } from "react-dom";
import type { ReactNode } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/app/globals.css";
import RevealOnScroll from "@/components/behavior/RevealOnScroll";
import ScrollManager from "@/components/behavior/ScrollManager";
import ThemeEffects from "@/components/behavior/ThemeEffects";
import ThemeScript from "@/components/behavior/ThemeScript";
import EasterEgg from "@/components/easter-egg/EasterEgg";
import BackToTop from "@/components/layout/BackToTop";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SkipLink from "@/components/layout/SkipLink";
import { PROFILE_IMAGE, SITE_URL } from "@/data/site";

const title = "Basem Esam | Backend Developer";
const shareDescription =
  "Backend Developer & CS Student specializing in Node.js, Express, and scalable systems.";
const shareImage = `${SITE_URL.replace(/\/$/, "")}${PROFILE_IMAGE}`;

export const metadata: Metadata = {
  title,
  description:
    "Basem Esam - Backend Developer & CS Student specializing in Node.js, Express, and scalable systems",
  keywords: "Backend Developer, Node.js, Express, MongoDB, Web Development",
  authors: [{ name: "Basem Esam" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title,
    description: shareDescription,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: shareDescription,
    images: [shareImage],
  },
  icons: {
    apple: [{ url: "/assets/icons/light/apple-touch-icon.png", sizes: "180x180" }],
    icon: [
      { url: "/assets/icons/light/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icons/light/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
  },
  manifest: "/assets/icons/light/site.webmanifest",
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  preconnect("https://api.github.com", { crossOrigin: "anonymous" });
  preconnect("https://images.unsplash.com");
  preload(PROFILE_IMAGE, { as: "image", fetchPriority: "high" });

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <ThemeScript />
        <SkipLink />
        <Navbar />
        {children}
        <Footer />
        <BackToTop />
        <ThemeEffects />
        <ScrollManager />
        <RevealOnScroll />
        <EasterEgg />
      </body>
    </html>
  );
}
