import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ThemeToggle from '@/components/behavior/ThemeToggle';
import FloatingElements from '@/components/layout/FloatingElements';
import LinkCard from '@/components/links/LinkCard';
import ProfileImage from '@/components/ui/ProfileImage';
import {
  CV_PATH,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  MAILTO,
  TROSC_URL,
} from '@/data/site';
import { getDictionary, isLocale, type Locale } from '@/lib/i18n';

type LinksPageProps = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({
  params,
}: LinksPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'en';
  const dict = getDictionary(locale);

  return {
    title: dict.links.metadataTitle,
    description: dict.links.metadataDescription,
  };
}

export default async function LinksPage({ params }: LinksPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const t = dict.links;
  const homeHref = locale === 'ar' ? '/ar' : '/';

  const links = [
    {
      href: homeHref,
      iconClass: 'bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]',
      icon: 'fas fa-briefcase',
      title: t.cards.portfolio,
      description: t.cards.portfolioDesc,
    },
    {
      href: GITHUB_URL,
      iconClass: 'bg-[linear-gradient(135deg,#24292e_0%,#000000_100%)]',
      icon: 'fab fa-github',
      title: t.cards.github,
      description: t.cards.githubDesc,
      external: true,
    },
    {
      href: LINKEDIN_URL,
      iconClass: 'bg-[linear-gradient(135deg,#0077b5_0%,#00a0dc_100%)]',
      icon: 'fab fa-linkedin-in',
      title: t.cards.linkedin,
      description: t.cards.linkedinDesc,
      external: true,
    },
    {
      href: MAILTO,
      iconClass: 'bg-[linear-gradient(135deg,#ea4335_0%,#e94057_100%)]',
      icon: 'fas fa-envelope',
      title: t.cards.email,
      description: EMAIL,
    },
    {
      href: TROSC_URL,
      iconClass: 'bg-[linear-gradient(135deg,#11998e_0%,#38ef7d_100%)]',
      icon: 'fas fa-globe',
      title: t.cards.trosc,
      description: t.cards.troscDesc,
      external: true,
    },
    {
      href: CV_PATH,
      iconClass: 'bg-[linear-gradient(135deg,#f093fb_0%,#f5576c_100%)]',
      icon: 'fas fa-file-pdf',
      title: t.cards.cv,
      description: t.cards.cvDesc,
      download: true,
    },
  ];

  const floatingButton =
    'fixed top-[30px] z-[100] flex size-[50px] cursor-pointer items-center justify-center rounded-full border-2 border-transparent bg-white text-dark-text no-underline shadow-md transition-all duration-300 ease-[ease] select-none [-webkit-tap-highlight-color:transparent] [touch-action:manipulation] hover:scale-110 hover:border-secondary hover:bg-secondary hover:text-on-secondary focus:shadow-[0_0_0_3px_var(--c-secondary)] focus:outline-none max-md:top-5 max-md:size-[45px] dark:border dark:border-[rgba(161,161,170,0.3)] dark:bg-[rgba(22,25,30,0.9)] dark:text-dark-text dark:backdrop-blur-[20px] dark:hover:border-secondary dark:hover:bg-secondary dark:hover:text-on-secondary dark:hover:shadow-[0_4px_20px_rgba(251,191,36,0.25)]';

  return (
    <>
      <FloatingElements />

      <Link
        href={homeHref}
        className={`${floatingButton} start-[30px] max-md:start-5`}
        aria-label={t.backToPortfolio}
      >
        <i
          className="fas fa-arrow-left text-[1.2rem] rtl:rotate-180"
          aria-hidden="true"
        ></i>
      </Link>

      <ThemeToggle
        id="themeToggle"
        className={`${floatingButton} end-[30px] max-md:end-5`}
        iconClassName="text-[1.2rem]"
        labels={dict.theme}
      />

      <div className="relative z-[1] mx-auto flex min-h-screen max-w-[600px] flex-col justify-center px-5 pt-20 pb-10 max-md:px-[15px] max-md:pt-[70px] max-md:pb-[30px]">
        <div className="mb-10 text-center">
          <ProfileImage
            alt={t.name}
            className="mb-5 max-md:size-[150px]"
            imgClassName="size-full border-[3px]"
          />
          <h1 className="mb-2.5 text-[2rem] font-bold tracking-[-0.5px] max-md:text-[1.75rem] dark:[text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
            {t.name}
          </h1>
          <p className="mb-2.5 leading-[1.6] dark:text-light-text">
            {t.role}
            <br />
            {t.tagline}
          </p>
          <p className="text-[0.9rem] dark:text-muted-text">
            <i
              className="fas fa-map-marker-alt me-[5px]"
              aria-hidden="true"
            ></i>{' '}
            {t.location}
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-[15px]">
          {links.map((link) => (
            <LinkCard key={link.title} {...link} />
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-black/5 px-5 py-[30px] text-center text-[0.9rem] text-light-text dark:border-[rgba(161,161,170,0.3)]">
        <p>&copy; 2025 Basem Esam. {dict.footer.rights}</p>
      </div>
    </>
  );
}
