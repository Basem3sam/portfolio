import type { ReactNode } from "react";
import FloatingElements from "@/components/layout/FloatingElements";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, MAILTO } from "@/data/site";

const glass =
  "border border-white/20 bg-white/10 backdrop-blur-[20px] dark:border-[rgba(100,116,139,0.3)] dark:bg-[rgba(30,41,59,0.6)]";

const socialLink =
  "relative flex size-[60px] items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-[1.4rem] text-white no-underline backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-[5px] hover:scale-110 hover:border-white/40 hover:bg-white/20 hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] before:absolute before:top-0 before:left-[-100%] before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] before:transition-[left] before:duration-500 before:content-[''] hover:before:left-full dark:border-white/10 dark:bg-white/5";

function ContactCard({
  icon,
  title,
  note,
  children,
}: {
  icon: string;
  title: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`group relative w-full max-w-full overflow-hidden rounded-[20px] px-[30px] py-10 text-center transition-all duration-300 before:absolute before:top-0 before:left-[-100%] before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] before:transition-[left] before:duration-500 before:content-[''] hover:-translate-y-2.5 hover:border-white/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:before:left-full max-md:px-5 max-md:py-[30px] ${glass}`}
    >
      <div className="mx-auto mb-[25px] flex size-20 items-center justify-center rounded-full border-2 border-white/30 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.1))] text-[2rem] transition-all duration-300 group-hover:scale-110 group-hover:rotate-[10deg] group-hover:border-transparent group-hover:bg-[linear-gradient(135deg,var(--c-secondary),var(--c-gradient-start))] dark:border dark:border-white/10 dark:bg-white/5">
        <i className={icon}></i>
      </div>
      <h3 className="mb-[15px] text-[1.5rem] leading-[1.2] font-semibold">{title}</h3>
      {children}
      <p className="mt-4 text-[0.9rem] opacity-70">{note}</p>
    </div>
  );
}

const cardText =
  "text-[1.2rem] text-white no-underline opacity-90 transition-opacity duration-300";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative w-full max-w-full overflow-hidden bg-hero-gradient p-0"
    >
      <FloatingElements />

      <div className="relative flex w-full max-w-full items-center overflow-hidden py-20 text-white before:absolute before:inset-0 before:animate-bg-shift before:bg-[radial-gradient(circle_at_20%_80%,rgba(52,152,219,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(231,76,60,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(46,204,113,0.05)_0%,transparent_50%)] before:content-[''] dark:before:bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.05)_0%,transparent_50%)]">
        <div className="container">
          <div className="relative z-[2] w-full max-w-full px-5 py-20 text-center">
            <h1 className="mb-5 bg-[linear-gradient(135deg,#ffffff_0%,#4ecdc4_100%)] bg-clip-text text-[3.5rem] leading-[1.2] font-extrabold text-transparent [text-shadow:0_5px_15px_rgba(0,0,0,0.3)] max-md:text-[2.5rem] max-sm:max-w-full max-sm:text-[2rem] max-sm:break-words">
              Let&apos;s Build Something Amazing
            </h1>
            <p className="mx-auto mb-[50px] max-w-[600px] text-[1.3rem] opacity-90">
              Ready to bring your ideas to life? Whether you need a robust backend
              system or want to discuss technology, I&apos;m here to help.
            </p>

            <div className="mx-auto mb-[50px] grid w-full max-w-[1000px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[30px] px-5 max-md:grid-cols-1 max-md:gap-5">
              <ContactCard
                icon="fas fa-paper-plane"
                title="Send an Email"
                note="Typically replies within hours"
              >
                <a href={MAILTO} className={`${cardText} hover:opacity-100 hover:[text-shadow:0_0_10px_rgba(255,255,255,0.5)]`}>
                  {EMAIL}
                </a>
              </ContactCard>

              <ContactCard
                icon="fas fa-map-marker-alt"
                title="Based In"
                note="Open to remote opportunities worldwide"
              >
                <p className={cardText}>Port Said, Egypt</p>
              </ContactCard>

              <ContactCard
                icon="fas fa-code"
                title="Currently Available"
                note="Backend development & system architecture"
              >
                <p className={cardText}>For new projects</p>
              </ContactCard>
            </div>

            <div className="mt-[50px]">
              <h4 className="mb-[25px] text-[1.3rem] leading-[1.2] font-medium opacity-90">
                Connect with me
              </h4>
              <div className="flex flex-wrap justify-center gap-5">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialLink}
                  aria-label="LinkedIn"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialLink}
                  aria-label="GitHub"
                >
                  <i className="fab fa-github"></i>
                </a>
                <a href={MAILTO} className={socialLink} aria-label="Email">
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
