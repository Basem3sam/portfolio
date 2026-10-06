import GitHubProjects from "@/components/github/GitHubProjects";
import ProjectCard, { type ProjectCardProps } from "@/components/ui/ProjectCard";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { TROSC_URL } from "@/data/site";

const projects: ProjectCardProps[] = [
  {
    image: "/assets/images/projects/project1.jpeg",
    fallbackImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80",
    alt: "Trosc Club Website - Backend development project",
    title: "Trosc Club Website",
    description:
      "Backend development for the Trosc Student Club website using Node.js, Express, and MongoDB.",
    badges: ["Node.js", "Express", "MongoDB"],
    actions: [
      { label: "Visit Website", variant: "primary", href: TROSC_URL, className: "mr-2" },
      {
        label: "View Code",
        variant: "outlinePrimary",
        href: "https://github.com/Basem3sam/trosc-backend",
      },
    ],
  },
  {
    image: "/assets/images/projects/placeholder.png",
    fallbackImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=80",
    alt: "REST API Project with authentication",
    title: "REST API Project",
    description:
      "A complete RESTful API with authentication and authorization built with Node.js and Express.",
    badges: ["Node.js", "Express", "JWT", "MongoDB"],
    actions: [{ label: "Coming Soon", variant: "outlinePrimary" }],
  },
  {
    image: "/assets/images/projects/github-placeholder.png",
    fallbackImage:
      "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=500&q=80",
    alt: "Laravel E-commerce platform project",
    title: "Laravel E-commerce",
    description:
      "An e-commerce platform developed with Laravel framework during my PHP course.",
    badges: ["PHP", "Laravel", "MySQL"],
    actions: [
      {
        label: "View on GitHub",
        variant: "primary",
        href: "https://github.com/Basem3sam/laravel-ecommerce-app",
      },
    ],
  },
];

export default function Projects() {
  return (
    <Section id="projects">
      <div className="container">
        <SectionTitle>Projects</SectionTitle>

        <div className="-mx-3 mb-12 flex flex-wrap">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} index={index} {...project} />
          ))}
        </div>

        <h3 className="mb-6 text-[calc(1.3rem_+_0.6vw)] leading-[1.2] font-medium xl:text-[1.75rem]">
          More Projects from GitHub
        </h3>
        <GitHubProjects />
      </div>
    </Section>
  );
}
