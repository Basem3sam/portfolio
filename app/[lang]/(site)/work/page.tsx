import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

type WorkIndexPageProps = {
  params: Promise<{ lang: string }>;
};

export default async function WorkIndexPage({ params }: WorkIndexPageProps) {
  const { lang } = await params;
  const prefix = lang === "ar" ? "/ar" : "";
  redirect(`${prefix}/#work`);
}