import { notFound } from "next/navigation";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Education from "@/components/sections/Education";
import Experience from "@/components/sections/Experience";
import Hero from "@/components/sections/Hero";
import Stack from "@/components/sections/Stack";
import Work from "@/components/sections/Work";
import { getDictionary, isLocale } from "@/lib/i18n";

type HomePageProps = {
  params: Promise<{ lang: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <main id="main-content">
      <Hero dict={dict.hero} />
      <Work dict={dict.work} github={dict.github} locale={lang} />
      <Stack dict={dict.stack} />
      <About dict={dict.about} />
      <Experience dict={dict.experience} />
      <Education dict={dict.education} />
      <Contact dict={dict.contact} />
    </main>
  );
}
