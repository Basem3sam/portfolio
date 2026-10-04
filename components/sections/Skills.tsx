import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

const skills = [
  {
    icon: "fab fa-node-js",
    title: "Backend Development",
    text: "Node.js, Express, REST APIs, Authentication, PHP, Laravel",
  },
  { icon: "fas fa-database", title: "Databases", text: "MongoDB (with Mongoose), MySQL" },
  {
    icon: "fas fa-cloud",
    title: "DevOps & Tools",
    text: "Docker, Kubernetes, Git, Linux Administration",
  },
  {
    icon: "fas fa-code",
    title: "Programming Languages",
    text: "JavaScript, PHP, Bash/Linux Scripting",
  },
  {
    icon: "fas fa-server",
    title: "System Design",
    text: "OOP, Clean Architecture, Scalable Systems",
  },
  {
    icon: "fas fa-users",
    title: "Soft Skills",
    text: "Teaching, Team Leadership, Problem Solving",
  },
];

export default function Skills() {
  return (
    <Section id="skills">
      <div className="container">
        <SectionTitle>Technical Skills</SectionTitle>
        <div className="-mx-3 flex flex-wrap">
          {skills.map((skill, index) => (
            <div className="mb-6 w-full shrink-0 px-3 md:w-1/2 lg:w-1/3" key={skill.title}>
              <div
                className="group relative h-full overflow-hidden rounded-xl border border-black/5 bg-surface px-[25px] py-[30px] text-center shadow-sm transition-all duration-300 hover:-translate-y-2.5 hover:border-secondary hover:shadow-lg before:absolute before:top-0 before:left-0 before:h-1 before:w-full before:origin-left before:scale-x-0 before:bg-brand-x before:transition-transform before:duration-300 before:content-[''] hover:before:scale-x-100 max-md:mb-5 max-sm:p-5 dark:border-[#334155] data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
                data-reveal
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-5 text-[3rem] text-secondary transition-transform duration-300 group-hover:scale-[1.15] group-hover:rotate-[5deg] group-hover:drop-shadow-[0_5px_15px_rgba(52,152,219,0.3)] max-md:text-[2.5rem] max-sm:mb-[15px] max-sm:text-[2.2rem]">
                  <i className={skill.icon} aria-hidden="true"></i>
                </div>
                <h4 className="mb-[15px] text-[1.3rem] leading-[1.2] font-bold text-dark-text">
                  {skill.title}
                </h4>
                <p className="leading-[1.7] text-light-text">{skill.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
