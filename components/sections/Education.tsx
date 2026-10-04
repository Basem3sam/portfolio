import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

const coursework = [
  "Object-Oriented Programming",
  "Backend Development Fundamentals",
  "Linux Administration",
  "PHP/Laravel Development",
  "Node.js Basics",
];

const achievements = [
  "ICPC Competitor",
  "Active member in GDG and Mech Hackers",
  "Vice IT Head at Trosc Student Club",
];

const listItem = "mb-2 leading-[1.7] text-light-text";

export default function Education() {
  return (
    <Section id="education" className="bg-light-bg">
      <div className="container">
        <SectionTitle>Education</SectionTitle>
        <div className="-mx-3 flex flex-wrap">
          <div className="mx-auto w-full shrink-0 px-3 lg:w-2/3">
            <div
              className="relative flex flex-col overflow-hidden rounded-xl border border-black/5 bg-surface shadow-sm transition-all duration-300 before:absolute before:top-0 before:left-0 before:h-full before:w-[5px] before:bg-brand-y before:content-[''] hover:-translate-y-[5px] hover:shadow-md dark:border-[#334155] data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-right"
              data-reveal
            >
              <div className="p-[30px] max-sm:p-5">
                <h4 className="mb-2.5 text-[calc(1.275rem_+_0.3vw)] leading-[1.2] font-bold text-dark-text xl:text-[1.5rem]">
                  Suez Canal University
                </h4>
                <h5 className="mb-4 text-[1.25rem] leading-[1.2] font-semibold text-[rgba(33,37,41,0.75)] dark:text-light-text">
                  Bachelor of Computer Science
                </h5>
                <p className="mb-2 dark:text-light-text">
                  <strong>Expected Graduation:</strong> 2026/2027
                </p>
                <p className="mb-6 dark:text-light-text">
                  <strong>GPA:</strong> 3.48
                </p>
                <h6 className="mt-4 mb-2.5 leading-[1.2] font-semibold text-dark-text">
                  Relevant Coursework:
                </h6>
                <ul className="mb-4 list-disc pl-5">
                  {coursework.map((entry) => (
                    <li key={entry} className={listItem}>
                      {entry}
                    </li>
                  ))}
                </ul>
                <h6 className="mt-4 mb-2.5 leading-[1.2] font-semibold text-dark-text">
                  Achievements:
                </h6>
                <ul className="list-disc pl-5">
                  {achievements.map((entry) => (
                    <li key={entry} className={listItem}>
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
