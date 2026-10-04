import Link from "next/link";
import ThemeToggle from "@/components/behavior/ThemeToggle";
import FloatingElements from "@/components/layout/FloatingElements";
import LinkCard from "@/components/links/LinkCard";
import ProfileImage from "@/components/ui/ProfileImage";
import { CV_PATH, GITHUB_URL, LINKEDIN_URL, MAILTO, EMAIL, TROSC_URL } from "@/data/site";

const links = [
  {
    href: "/",
    iconClass: "bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]",
    icon: "fas fa-briefcase",
    title: "Portfolio Website",
    description: "View my full portfolio and projects",
  },
  {
    href: GITHUB_URL,
    iconClass: "bg-[linear-gradient(135deg,#24292e_0%,#000000_100%)]",
    icon: "fab fa-github",
    title: "GitHub",
    description: "Check out my code and projects",
    external: true,
  },
  {
    href: LINKEDIN_URL,
    iconClass: "bg-[linear-gradient(135deg,#0077b5_0%,#00a0dc_100%)]",
    icon: "fab fa-linkedin-in",
    title: "LinkedIn",
    description: "Let's connect professionally",
    external: true,
  },
  {
    href: MAILTO,
    iconClass: "bg-[linear-gradient(135deg,#ea4335_0%,#e94057_100%)]",
    icon: "fas fa-envelope",
    title: "Email Me",
    description: EMAIL,
  },
  {
    href: TROSC_URL,
    iconClass: "bg-[linear-gradient(135deg,#11998e_0%,#38ef7d_100%)]",
    icon: "fas fa-globe",
    title: "Trosc Club Website",
    description: "Backend development project",
    external: true,
  },
  {
    href: CV_PATH,
    iconClass: "bg-[linear-gradient(135deg,#f093fb_0%,#f5576c_100%)]",
    icon: "fas fa-file-pdf",
    title: "Download Resume",
    description: "View my CV and experience",
    download: true,
  },
];

const floatingButton =
  "fixed top-[30px] z-[100] flex size-[50px] cursor-pointer items-center justify-center rounded-full border-2 border-transparent bg-white text-dark-text no-underline shadow-md transition-all duration-300 ease-[ease] select-none [-webkit-tap-highlight-color:transparent] [touch-action:manipulation] hover:scale-110 hover:border-secondary hover:bg-secondary hover:text-white focus:shadow-[0_0_0_3px_var(--c-secondary)] focus:outline-none max-md:top-5 max-md:size-[45px] dark:border dark:border-[rgba(100,116,139,0.3)] dark:bg-[rgba(30,41,59,0.9)] dark:backdrop-blur-[20px] dark:hover:border-secondary dark:hover:bg-secondary dark:hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)]";

export default function LinksPage() {
  return (
    <>
      <FloatingElements />

      <Link href="/" className={`${floatingButton} left-[30px] max-md:left-5`} aria-label="Back to portfolio">
        <i className="fas fa-arrow-left text-[1.2rem]"></i>
      </Link>

      <ThemeToggle
        id="themeToggle"
        className={`${floatingButton} right-[30px] max-md:right-5`}
        iconClassName="text-[1.2rem]"
      />

      <div className="relative z-[1] mx-auto flex min-h-screen max-w-[600px] flex-col justify-center px-5 pt-20 pb-10 max-md:px-[15px] max-md:pt-[70px] max-md:pb-[30px]">
        <div className="mb-10 text-center">
          <ProfileImage
            alt="Basem Esam"
            className="mb-5 max-md:size-[150px]"
            imgClassName="size-full border-[3px]"
          />
          <h1 className="mb-2.5 text-[2rem] font-bold tracking-[-0.5px] max-md:text-[1.75rem] dark:[text-shadow:0_2px_10px_rgba(0,0,0,0.3)]">
            Basem Esam
          </h1>
          <p className="mb-2.5 leading-[1.6] dark:text-light-text">
            Backend Developer & CS Student
            <br />
            Building scalable systems with Node.js & Express
          </p>
          <p className="text-[0.9rem] dark:text-muted-text">
            <i className="fas fa-map-marker-alt mr-[5px]"></i> Port Said, Egypt
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-[15px]">
          {links.map((link) => (
            <LinkCard key={link.title} {...link} />
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-black/5 px-5 py-[30px] text-center text-[0.9rem] text-light-text dark:border-[rgba(100,116,139,0.3)]">
        <p>&copy; 2025 Basem Esam. All rights reserved.</p>
      </div>
    </>
  );
}
