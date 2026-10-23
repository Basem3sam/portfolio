import { notFound } from "next/navigation";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Stack from "@/components/sections/Stack";
import { preload } from "react-dom";
import Work from "@/components/sections/Work";
import { PROFILE_CUTOUT, PROFILE_CUTOUT_SIZES_HERO, PROFILE_CUTOUT_SRCSET } from "@/data/site";
import { getDictionary, isLocale } from "@/lib/i18n";

type HomePageProps = {
  params: Promise<{ lang: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  // The hero portrait is the LCP element, and it only exists on this route,
  // so the preload lives here rather than in the shared layout.
  // imageSrcSet/imageSizes must match the <img>, or the browser fetches twice.
  preload(PROFILE_CUTOUT, {
    as: "image",
    imageSrcSet: PROFILE_CUTOUT_SRCSET,
    imageSizes: PROFILE_CUTOUT_SIZES_HERO,
    fetchPriority: "high",
  });

  // Section order matches the mockup: Work (01) → Experience (02) →
  // Stack (03) → About (04, with education merged in) → Contact (05).
  // Education no longer exists as its own section.
  return (
    <main id="main-content">
      <Hero dict={dict.hero} />
      <Marquee label={dict.hero.builtWith} />
      <Work dict={dict.work} github={dict.github} locale={lang} />
      <Experience dict={dict.experience} locale={lang} />
      <Stack dict={dict.stack} />
      <About dict={dict.about} />
      <Contact dict={dict.contact} />
    </main>
  );
}
