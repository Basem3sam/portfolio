import SectionLink from "@/components/layout/SectionLink";
import TerminalButton from "@/components/layout/TerminalButton";
import CairoClock from "@/components/ui/CairoClock";
import Icon from "@/components/ui/Icon";
import Mark from "@/components/ui/Mark";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, MAILTO, PHONE_DISPLAY, PHONE_TEL } from "@/data/site";
import { getDictionary, type Locale } from "@/lib/i18n";
import Link from "next/link";
import type { CSSProperties } from "react";
import "./Footer.css";

type FooterProps = {
  locale?: Locale;
};

const exploreSections = [
  { hash: "#work", key: "work" },
  { hash: "#experience", key: "experience" },
  { hash: "#stack", key: "stack" },
  { hash: "#about", key: "about" },
  { hash: "#contact", key: "contact" },
] as const;

/**
 * The closing band: always dark in both themes (the mockup re-declares the
 * ink/rule tokens on `.foot`, see Footer.css). Four columns — brand, explore,
 * reach, location — under a giant outlined `basem.esam` watermark, then the
 * quiet line and the secret-terminal glyph.
 */
export default function Footer({ locale = "en" }: FooterProps) {
  const dict = getDictionary(locale);
  const nav = dict.nav;
  const footer = dict.footer;
  const contact = dict.contact;
  const linksHref = locale === "ar" ? "/ar/links" : "/links";

  return (
    <footer className="foot">
      <div
        className="ag"
        data-variant="mist"
        aria-hidden="true"
        style={{ "--ag-speed": ".6", "--ag-opacity": ".8" } as CSSProperties}
      >
        <i></i>
        <i></i>
        <i></i>
      </div>

      <div className="foot-in">
        <div className="ft-top">
          <div className="ft-brand">
            <SectionLink hash="#hero" locale={locale} className="logo">
              <Mark className="mrk" />
              <span>basem.esam</span>
            </SectionLink>
            <p className="ft-line">{footer.line}</p>
            <span className="foot-avail">
              <i aria-hidden="true"></i>
              {footer.avail}
            </span>
          </div>

          <nav className="ft-col ft-ex" aria-label={footer.navLabel}>
            <p className="lbl">{footer.exploreLabel}</p>
            {exploreSections.map(({ hash, key }) => (
              <SectionLink key={hash} hash={hash} locale={locale}>
                {nav[key]}
              </SectionLink>
            ))}
            <Link href={linksHref}>{nav.allLinks}</Link>
          </nav>

          <div className="ft-col ft-rc">
            <p className="lbl">{footer.reachLabel}</p>
            <a className="tel" href={PHONE_TEL}>
              <Icon name="phone" className="size-4" />
              <span dir="ltr">{PHONE_DISPLAY}</span>
            </a>
            <a href={MAILTO}>
              <Icon name="mail" className="size-4" />
              <span dir="ltr">{EMAIL}</span>
            </a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              <Icon name="linkedIn" className="size-4" />
              <span>{contact.linkedinLabel}</span>
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Icon name="github" className="size-4" />
              <span>{contact.githubLabel}</span>
            </a>
          </div>

          <div className="ft-col ft-loc">
            <p className="lbl">{footer.basedLabel}</p>
            <p className="ft-city">{footer.city}</p>
            <p className="ft-time">
              <CairoClock />
              <small>{footer.timeLabel}</small>
            </p>
            <SectionLink hash="#hero" locale={locale} className="ft-up">
              <span>{footer.backToTop}</span>
              <i aria-hidden="true">
                <Icon name="arrowUp" className="size-[15px]" />
              </i>
            </SectionLink>
          </div>
        </div>

        <div className="foot-word-box" aria-hidden="true">
          <div className="foot-word">basem.esam</div>
        </div>

        <div className="foot-bot">
          <span>
            &copy; {new Date().getFullYear()} Basem Esam. {footer.rights}
          </span>
          <span className="foot-end">
            <span className="foot-quiet">{footer.quiet}</span>
            <TerminalButton label={footer.openTerminal} className="foot-glyph" />
          </span>
        </div>
      </div>
    </footer>
  );
}
