import Badge, { type BadgeTone } from "@/components/ui/Badge";
import {
  buttonGroupClass,
  buttonGroupItemClass,
  buttonStyles,
} from "@/components/ui/buttonStyles";
import {
  formatCount,
  formatDate,
  formatRepositoryName,
  getLanguageTone,
  isWebUrl,
  truncateDescription,
  type GitHubRepo,
} from "@/lib/github";

type StatBadgeProps = {
  icon: string;
  count: number;
  label: string;
  tone?: BadgeTone;
};

function StatBadge({ icon, count, label, tone = "light" }: StatBadgeProps) {
  return (
    <Badge variant="project" tone={tone} title={`${label}: ${count.toLocaleString()}`}>
      <i className={`fas fa-${icon} mr-1 text-[0.85rem]`} aria-hidden="true"></i>
      {formatCount(count)}
    </Badge>
  );
}

const muted = "text-[rgba(33,37,41,0.75)] dark:text-muted-text";

export default function GitHubRepoCard({ repo, index }: { repo: GitHubRepo; index: number }) {
  const name = formatRepositoryName(repo.name);
  const topics = repo.topics?.slice(0, 3) ?? [];
  const demoUrl = repo.homepage && isWebUrl(repo.homepage) ? repo.homepage : null;
  const single = !demoUrl;

  return (
    <div
      className="mb-6 w-full shrink-0 animate-github-card px-3 md:w-1/2 lg:w-1/3"
      style={{ animationDelay: `${300 + index * 100}ms` }}
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-black/5 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-2.5 hover:border-secondary hover:shadow-xl max-md:mb-5 dark:border-[#334155] dark:hover:border-secondary dark:hover:shadow-lg">
        <div className="relative flex min-h-[200px] flex-1 flex-col p-[25px] max-sm:p-5 dark:text-light-text">
          <div className="mb-4 flex items-start justify-between">
            <h5 className="mr-2 mb-0 grow text-[1.25rem] leading-[1.2] font-bold text-dark-text">
              {name}
            </h5>
          </div>

          <p className={`mb-5 grow leading-[1.7] ${muted}`}>{truncateDescription(repo.description)}</p>

          <div className="mb-4">
            <div className="mb-2">
              {repo.language && (
                <Badge
                  variant="project"
                  tone={getLanguageTone(repo.language)}
                  title={`Primary language: ${repo.language}`}
                >
                  {repo.language}
                </Badge>
              )}{" "}
              {topics.map((topic) => (
                <Badge key={topic} variant="project" tone="light">
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatBadge icon="star" count={repo.stargazers_count} label="Stars" />
              <StatBadge icon="code-branch" count={repo.forks_count} label="Forks" />
              {repo.watchers_count > 0 && (
                <StatBadge icon="eye" count={repo.watchers_count} label="Watchers" />
              )}
              {repo.open_issues_count > 0 && (
                <StatBadge
                  icon="exclamation-circle"
                  count={repo.open_issues_count}
                  label="Issues"
                  tone="warningWhite"
                />
              )}
            </div>
          </div>

          <div className="mt-auto">
            <div className={`mb-2 flex items-center justify-between text-[0.875em] ${muted}`}>
              <span>
                <i className="fas fa-calendar mr-1" aria-hidden="true"></i> Created:{" "}
                {formatDate(repo.created_at)}
              </span>
              <span>
                <i className="fas fa-clock mr-1" aria-hidden="true"></i> Updated:{" "}
                {formatDate(repo.updated_at)}
              </span>
            </div>

            <div className={buttonGroupClass(single)}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonStyles("primary", "cardSm")} ${buttonGroupItemClass(single)}`}
                aria-label={`View ${name} on GitHub`}
              >
                <i className="fab fa-github mr-1" aria-hidden="true"></i>
                View on GitHub
              </a>
              {demoUrl && (
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className={`${buttonStyles("outlinePrimary", "cardSm")} ${buttonGroupItemClass(single)}`}
                  aria-label={`View live demo of ${name}`}
                >
                  <i className="fas fa-external-link-alt mr-1" aria-hidden="true"></i>
                  Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
