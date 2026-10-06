import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

const experience = [
  {
    title: "Vice IT Head",
    organization: "Trosc Student Club",
    period: "2025 - Present",
    text: "Leading the backend development for the club's website, managing the technical team, and overseeing IT operations.",
  },
  {
    title: "OOP Instructor",
    organization: "Google Developer Groups (GDG)",
    period: "2023 - 2024",
    text: "Teaching Object-Oriented Programming fundamentals to beginners, helping them understand core programming concepts and best practices.",
  },
  {
    title: "Active Member",
    organization: "Mech Hackers Community",
    period: "2023 - Present",
    text: "Participating in community events, hackathons, and knowledge-sharing sessions focused on software development and technology.",
  },
];

const timeline =
  "relative mt-6 pl-10 before:absolute before:top-0 before:bottom-0 before:left-3.5 before:w-[3px] before:rounded-sm before:bg-brand-y before:content-[''] max-lg:pl-[30px] max-lg:before:left-0.5 max-md:mt-5 max-md:pl-[25px] max-md:before:left-px max-md:before:w-0.5 max-sm:mt-4 max-sm:pl-5 max-sm:before:left-[5px]";

const item = [
  "relative mb-10 rounded-xl border-l-[3px] border-transparent bg-surface p-[25px] shadow-sm transition-all duration-300 [--ring:#ffffff] dark:[--ring:var(--c-dark-bg)]",
  "hover:translate-x-2 hover:border-secondary hover:shadow-md dark:border dark:border-[#334155] dark:hover:border-secondary",
  "before:absolute before:top-[30px] before:left-[-32.5px] before:z-[1] before:size-3 before:rounded-full before:border-[3px] before:border-secondary before:bg-(--ring) before:shadow-[0_0_0_4px_var(--ring)] before:transition-all before:duration-300 before:content-['']",
  "hover:before:scale-[1.4] hover:before:bg-secondary hover:before:shadow-[0_0_0_6px_var(--ring),0_0_20px_rgba(52,152,219,0.5)]",
  "max-lg:before:left-[-36px]",
  "max-md:p-5 max-md:before:top-[25px] max-md:before:left-[-31px] max-md:before:size-2.5 max-md:before:border-2 max-md:before:shadow-[0_0_0_3px_var(--ring)] max-md:hover:before:shadow-[0_0_0_5px_var(--ring),0_0_15px_rgba(52,152,219,0.5)]",
  "max-sm:mb-[25px] max-sm:max-w-[calc(100vw_-_40px)] max-sm:p-[15px] max-sm:before:top-5 max-sm:before:left-[-22px]",
  "data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-left",
].join(" ");

export default function Experience() {
  return (
    <Section id="experience" className="bg-light-bg">
      <div className="container">
        <SectionTitle>Experience</SectionTitle>
        <div className="-mx-3 flex flex-wrap">
          <div className="mx-auto w-full shrink-0 px-3 lg:w-5/6">
            <div className={timeline}>
              {experience.map((entry, index) => (
                <div
                  className={item}
                  key={entry.title}
                  data-reveal
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <h4 className="mb-2 text-[1.25rem] leading-[1.2] font-bold text-dark-text max-sm:text-[1.1rem]">
                    {entry.title}
                  </h4>
                  <h5 className="mb-2 text-[1.1rem] leading-[1.2] font-semibold text-secondary max-sm:text-[1rem]">
                    {entry.organization}
                  </h5>
                  <p className="mb-2 text-[0.9rem] leading-[1.7] text-muted-text">{entry.period}</p>
                  <p className="mb-2 leading-[1.7] text-dark-text dark:text-light-text">
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
