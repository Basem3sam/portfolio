"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import ThemeToggle from "@/components/behavior/ThemeToggle";
import { CV_PATH } from "@/data/site";

const sectionLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#education", label: "Education" },
  { href: "#contact", label: "Contact" },
];

const sectionIds = sectionLinks.map((link) => link.href.slice(1));

const navLinkBase =
  "relative block px-4 py-2 font-medium text-white/90 transition-colors duration-300 hover:text-secondary dark:text-dark-text after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:-translate-x-1/2 after:rounded-sm after:bg-secondary after:transition-all after:duration-300 after:content-[''] hover:after:w-4/5";

const navLink = (active = false) => `${navLinkBase} ${active ? "after:w-4/5" : "after:w-0"}`;

const navbarTop = "bg-primary py-4 shadow-sm backdrop-blur-[10px]";
const navbarScrolled =
  "bg-[rgba(44,62,80,0.98)] py-3 shadow-md backdrop-blur-[20px] backdrop-saturate-[180%] dark:bg-[rgba(15,23,42,0.95)]";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
      rootMargin: "-72px 0px 0px 0px",
    });

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const current = Array.from(document.querySelectorAll<HTMLElement>("section[id]")).find(
        (section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom > 100;
        },
      );
      setActiveSection(current && sectionIds.includes(current.id) ? current.id : null);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as Element).closest('a[href^="#"]')) setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[1030] flex flex-wrap items-center justify-between transition-all duration-300 print:hidden dark:border-b dark:border-[#334155] ${scrolled ? navbarScrolled : navbarTop}`}
      role="navigation"
      aria-label="Main navigation"
      data-scrolled={scrolled}
      onClick={handleClick}
    >
      <div className="container flex flex-wrap items-center justify-between lg:flex-nowrap">
        <a
          className="mr-4 py-[0.3125rem] text-[1.5rem] font-bold tracking-[-0.5px] whitespace-nowrap text-white transition-transform duration-300 hover:scale-105 dark:text-dark-text"
          href="#hero"
          aria-label="Basem Esam - Home"
        >
          Basem Esam
        </a>
        <button
          className="cursor-pointer rounded-md border-2 border-white/20 bg-transparent px-3 py-2 text-[1.25rem] leading-none transition-all duration-300 hover:scale-105 hover:border-white/40 focus:shadow-[0_0_0_0.2rem_rgba(255,255,255,0.2)] focus:outline-0 lg:hidden"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg viewBox="0 0 30 30" className="inline-block h-[1.5em] w-[1.5em] align-middle" aria-hidden="true">
            <path
              fill="none"
              stroke="rgba(255, 255, 255, 0.55)"
              strokeLinecap="round"
              strokeMiterlimit={10}
              strokeWidth={2}
              d="M4 7h22M4 15h22M4 23h22"
            />
          </svg>
        </button>
        <div
          className={`grid grow basis-full transition-[grid-template-rows,visibility] duration-[350ms] ease-in-out lg:visible lg:flex lg:basis-auto lg:items-center ${menuOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"}`}
          id="navbarNav"
        >
          <div className="min-h-0 overflow-hidden lg:ml-auto lg:overflow-visible">
            <ul className="flex list-none flex-col lg:flex-row">
              {sectionLinks.map((link) => {
                const active = activeSection === link.href.slice(1);
                return (
                  <li key={link.href}>
                    <a
                      className={navLink(active)}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
              <li>
                <Link className={navLink()} href="/links">
                  All My Links
                </Link>
              </li>
              <li>
                <a className={navLink()} href={CV_PATH} download>
                  <i className="fas fa-file-pdf mr-1" aria-hidden="true"></i>
                  Resume
                </a>
              </li>
              <li>
                <ThemeToggle
                  id="darkModeToggle"
                  className={`${navLink()} cursor-pointer border border-transparent bg-transparent leading-normal hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(52,152,219,0.4)]`}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
