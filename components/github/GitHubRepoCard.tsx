import Icon from "@/components/ui/Icon";
import {
  formatCount,
  formatDate,
  formatRepositoryName,
  isWebUrl,
  truncateDescription,
  type GitHubRepo,
} from "@/lib/github";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Locale } from "@/lib/i18n";

type GitHubRepoCardProps = {
  repo: GitHubRepo;
  index: number;
  locale: Locale;
  dict: Dictionary["github"];
};

const languageChip =
  "rounded-md border border-hairline px-2.5 py-1 text-sm font-medium text-dark-text";
const topicChip = "rounded-md border border-hairline px-2.5 py-1 text-sm text-light-text";
const statClass = "inline-flex items-center gap-1";

const linkButton =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-hairline px-3 text-sm font-medium text-dark-text no-underline transition-colors duration-200 hover:border-secondary hover:text-secondary";

export default function GitHubRepoCard({ repo, index, locale, dict }: GitHubRepoCardProps) {
  const name = formatRepositoryName(repo.name);
  const topics = repo.topics?.slice(0, 3) ?? [];
  const demoUrl = repo.homepage && isWebUrl(repo.homepage) ? repo.homepage : null;

  return (
    <div
      className="mb-4 w-full shrink-0 animate-github-card px-3 md:w-1/2 lg:w-1/3"
      style={{ animationDelay: `${300 + index * 100}ms` }}
    >
      <div className="flex h-full flex-col rounded-lg border border-hairline bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-signal hover:shadow-md focus-within:-translate-y-0.5 focus-within:border-signal focus-within:shadow-md">
        <h3 className="font-mono text-base font-semibold break-words text-dark-text">{name}</h3>

        <p className="mt-2 grow text-sm leading-relaxed text-light-text">
          {truncateDescription(repo.description)}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {repo.language && <span className={languageChip}>{repo.language}</span>}
          {topics.map((topic) => (
            <span key={topic} className={topicChip}>
              {topic}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-text">
          <span
            className={statClass}
            title={`${dict.stars}: ${repo.stargazers_count.toLocaleString()}`}
          >
            <Icon name="star" className="size-3.5" />
            {formatCount(repo.stargazers_count)}
          </span>
          <span
            className={statClass}
            title={`${dict.forks}: ${repo.forks_count.toLocaleString()}`}
          >
            <Icon name="gitBranch" className="size-3.5" />
            {formatCount(repo.forks_count)}
          </span>
          {repo.watchers_count > 0 && (
            <span
              className={statClass}
              title={`${dict.watchers}: ${repo.watchers_count.toLocaleString()}`}
            >
              <Icon name="eye" className="size-3.5" />
              {formatCount(repo.watchers_count)}
            </span>
          )}
          {repo.open_issues_count > 0 && (
            <span
              className={`${statClass} text-accent`}
              title={`${dict.issues}: ${repo.open_issues_count.toLocaleString()}`}
            >
              <Icon name="alertCircle" className="size-3.5" />
              {formatCount(repo.open_issues_count)}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-x-4 font-mono text-[11px] text-muted-text">
          <span>
            {dict.created}: {formatDate(repo.created_at, locale)}
          </span>
          <span>
            {dict.updated}: {formatDate(repo.updated_at, locale)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButton}
            aria-label={`${dict.viewOnGithub}: ${name}`}
          >
            <Icon name="github" className="size-4" />
            {dict.viewOnGithub}
          </a>
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={linkButton}
              aria-label={`${dict.demo}: ${name}`}
            >
              <Icon name="externalLink" className="size-4" />
              {dict.demo}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}