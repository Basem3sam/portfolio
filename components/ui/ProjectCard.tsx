import { Fragment } from "react";
import Badge from "@/components/ui/Badge";
import {
  buttonGroupClass,
  buttonGroupItemClass,
  buttonStyles,
} from "@/components/ui/buttonStyles";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

type ProjectAction = {
  label: string;
  variant: "primary" | "outlinePrimary";
  href?: string;
  className?: string;
};

export type ProjectCardProps = {
  image: string;
  fallbackImage: string;
  alt: string;
  title: string;
  description: string;
  badges: string[];
  actions: ProjectAction[];
};

export default function ProjectCard({
  index,
  image,
  fallbackImage,
  alt,
  title,
  description,
  badges,
  actions,
}: ProjectCardProps & { index: number }) {
  const single = actions.length === 1;

  return (
    <div className="mb-6 w-full shrink-0 px-3 md:w-1/2 lg:w-1/3">
      <div
        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-black/5 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-2.5 hover:border-secondary hover:shadow-xl max-md:mb-5 dark:border-[#334155] dark:hover:border-secondary dark:hover:shadow-lg data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
        data-reveal
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <ImageWithFallback
          src={image}
          fallbackSrc={fallbackImage}
          alt={alt}
          className="h-[220px] w-full object-cover transition-transform duration-500 group-hover:scale-110 max-sm:h-[180px]"
        />
        <div className="flex min-h-[200px] flex-1 flex-col p-[25px] max-sm:p-5">
          <h5 className="mb-[15px] text-[1.25rem] leading-[1.2] font-bold text-dark-text">
            {title}
          </h5>
          <p className="mb-5 grow leading-[1.7] text-light-text">{description}</p>
          <div className="mb-6">
            {badges.map((badge, badgeIndex) => (
              <Fragment key={badge}>
                {badgeIndex > 0 && " "}
                <Badge variant="project">{badge}</Badge>
              </Fragment>
            ))}
          </div>
          <div className={buttonGroupClass(single)}>
            {actions.map((action) => {
              const className = `${buttonStyles(action.variant, "card")} ${buttonGroupItemClass(single)} ${action.className ?? ""}`;
              return action.href ? (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  aria-label={action.label}
                >
                  <span className="relative z-[2] flex w-full items-center justify-center gap-2">
                    {action.label}
                  </span>
                </a>
              ) : (
                <button
                  key={action.label}
                  className={className}
                  disabled
                  aria-label={action.label}
                >
                  <span className="relative z-[2] flex w-full items-center justify-center gap-2">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
