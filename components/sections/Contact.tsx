import type { CSSProperties } from "react";
import CairoClock from "@/components/ui/CairoClock";
import Icon, { type IconName } from "@/components/ui/Icon";
import SectionHeader from "@/components/ui/SectionHeader";
import TideCanvas from "@/components/sections/TideCanvas";
import {
  CV_PATH,
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  MAILTO,
  PHONE_DISPLAY,
  PHONE_TEL,
} from "@/data/site";
import type { Dictionary } from "@/lib/dictionaries/en";
import "@/components/sections/TideBand.css";
import "./Contact.css";

type ContactProps = {
  dict: Dictionary["contact"];
};

/** "https://linkedin.com/in/BasemEsam" → "linkedin.com/in/BasemEsam". */
const displayUrl = (url: string) => url.replace(/^[a-z]+:\/\//i, "");

type Card = {
  label: string;
  value: string;
  href?: string;
  icon: IconName;
  external?: boolean;
};

export default function Contact({ dict }: ContactProps) {
  const cards: Card[] = [
    {
      label: dict.phoneLabel,
      value: PHONE_DISPLAY,
      href: PHONE_TEL,
      icon: "arrowRight",
    },
    {
      label: dict.linkedinLabel,
      value: displayUrl(LINKEDIN_URL),
      href: LINKEDIN_URL,
      icon: "externalLink",
      external: true,
    },
    {
      label: dict.githubLabel,
      value: displayUrl(GITHUB_URL),
      href: GITHUB_URL,
      icon: "externalLink",
      external: true,
    },
  ];

  return (
    <section id="contact" className="sec sec-deep contact">
      <TideCanvas />

      <div className="ct-in">
        <SectionHeader number="05" title={dict.title} />

        <p
          className="ct-big data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
          data-reveal
          data-story="enter"
        >
          {dict.big}
        </p>

        <div
          className="ct-intro data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
          data-reveal
        >
          <p className="ct-lead">{dict.lead}</p>
          <p className="status ct-status">
            <span className="dot" aria-hidden="true"></span>
            <span className="st st-live">{dict.status}</span>
          </p>
        </div>

        {/* The address itself stays in the accessible name: an action-only
            aria-label would hide the visible text from screen readers. */}
        <a
          className="ct-mail data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
          href={MAILTO}
          aria-label={`${dict.sendEmail}: ${EMAIL}`}
          data-reveal
        >
          <span className="ct-v" dir="ltr">
            {EMAIL}
          </span>
          <span className="go" aria-hidden="true">
            <Icon name="arrowRight" className="ct-i rtl:-scale-x-100" />
          </span>
        </a>

        <div
          className="actions data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
          data-reveal
        >
          <a className="btn btn-primary" href={MAILTO}>
            <Icon name="mail" className="ct-i" />
            <span>{dict.sendEmail}</span>
          </a>
          <a className="btn btn-ghost" href={CV_PATH} download>
            <Icon name="fileDown" className="ct-i" />
            <span>{dict.downloadCv}</span>
          </a>
        </div>

        <div className="ct-grid stagger-60" data-reveal data-stagger>
          {cards.map((card, index) => {
            const content = (
              <>
                <span className="lbl">{card.label}</span>
                <span className="ct-v" dir="ltr">
                  {card.value}
                </span>
                <span className="go" aria-hidden="true">
                  <Icon name={card.icon} className="ct-i rtl:-scale-x-100" />
                </span>
              </>
            );

            return card.href ? (
              <a
                key={card.label}
                className="crd"
                href={card.href}
                {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                style={{ "--stagger-index": index } as CSSProperties}
              >
                {content}
              </a>
            ) : null;
          })}

          <div className="crd" style={{ "--stagger-index": cards.length } as CSSProperties}>
            <span className="lbl">{dict.locationLabel}</span>
            <span>{dict.location}</span>
            <span className="crd-x">
              <span className="lbl">{dict.timeLabel}</span>
              <CairoClock className="ct-clock" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
