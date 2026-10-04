import { Fragment } from "react";
import Badge from "@/components/ui/Badge";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";

const badges = [
  "Backend Development",
  "Node.js",
  "Express",
  "MongoDB",
  "REST APIs",
  "Competitive Programming",
];

export default function About() {
  return (
    <Section id="about" className="bg-light-bg">
      <div className="container">
        <SectionTitle>About Me</SectionTitle>
        <div className="-mx-3 flex flex-wrap">
          <div className="mx-auto w-full shrink-0 px-3 lg:w-2/3">
            <p className="mb-4 text-[1.25rem] font-light">
              A passionate backend developer and ICPC competitive programmer with a
              strong foundation in system design, OOP, and clean architecture
              principles.
            </p>

            <p className="mb-4">
              My journey in technology started early, inspired by a teacher&apos;s
              encouragement of my first website at age 11. Growing up in a family
              electronics repair shop gave me a unique, hands-on perspective on
              technology that continues to influence my approach to software
              development.
            </p>

            <p className="mb-4">
              Currently in my 3rd year at Suez Canal University, I&apos;ve been
              focused on programming since 2022. Beyond coding, I&apos;m passionate
              about knowledge sharing, having served as an OOP instructor at GDG and
              as an active member of the Mech Hackers community.
            </p>

            <p className="mb-4">
              Currently, I serve as the Vice IT Head at Trosc Student Club, leading
              the backend development for the club&apos;s website.
            </p>

            <div className="mt-6">
              {badges.map((badge, index) => (
                <Fragment key={badge}>
                  {index > 0 && " "}
                  <Badge variant="primary">{badge}</Badge>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
