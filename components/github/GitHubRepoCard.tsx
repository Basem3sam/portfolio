import Icon from "@/components/ui/Icon";
import Spotlight from "@/components/ui/Spotlight";
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
import type { CSSProperties } from "react";

type GitHubRepoCardProps = {
  repo: GitHubRepo;
  index: number;
  locale: Locale;
  dict: Dictionary["github"];
};

export default function GitHubRepoCard({ repo, index, locale, dict }: GitHubRepoCardProps) {
  const name = formatRepositoryName(repo.name);
  const topics = repo.topics?.slice(0, 3) ?? [];
  const demoUrl = repo.homepage && isWebUrl(repo.homepage) ? repo.homepage : null;

  return (
    <li className="gh-item">
      <Spotlight
        className="gh-card spotlight"
        style={{ "--i": Math.min(index, 8) } as CSSProperties}
      >
        <div className="gh-top">
          <span className="gh-ix" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          {repo.language && <span className="gh-lang">{repo.language}</span>}
          <span className="gh-go" aria-hidden="true">
            <Icon name="arrowRight" className="size-4" />
          </span>
        </div>

        <h3 className="gh-name">
          <a
            className="gh-link"
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${dict.viewOnGithub}: ${name}`}
          >
            {name}
          </a>
        </h3>

        <p className="gh-desc">{truncateDescription(repo.description)}</p>

        {topics.length > 0 && (
          <ul className="gh-topics">
            {topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        )}

        <div className="gh-foot">
          <ul className="gh-stats">
            <li title={`${dict.stars}: ${repo.stargazers_count.toLocaleString()}`}>
              <Icon name="star" className="size-3.5" />
              {formatCount(repo.stargazers_count)}
            </li>
            <li title={`${dict.forks}: ${repo.forks_count.toLocaleString()}`}>
              <Icon name="gitBranch" className="size-3.5" />
              {formatCount(repo.forks_count)}
            </li>
            {repo.watchers_count > 0 && (
              <li title={`${dict.watchers}: ${repo.watchers_count.toLocaleString()}`}>
                <Icon name="eye" className="size-3.5" />
                {formatCount(repo.watchers_count)}
              </li>
            )}
            {repo.open_issues_count > 0 && (
              <li
                className="warn"
                title={`${dict.issues}: ${repo.open_issues_count.toLocaleString()}`}
              >
                <Icon name="alertCircle" className="size-3.5" />
                {formatCount(repo.open_issues_count)}
              </li>
            )}
          </ul>
          <span>
            {dict.updated} {formatDate(repo.updated_at, locale)}
          </span>
        </div>

        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn btn-ghost gh-demo"
            data-peek=""
            aria-label={`${dict.demo}: ${name}`}
          >
            <Icon name="externalLink" className="size-4" />
            {dict.demo}
          </a>
        )}
      </Spotlight>
    </li>
  );
}
