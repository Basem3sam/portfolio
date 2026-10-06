import ProfileImage from "@/components/ui/ProfileImage";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { CV_PATH, GITHUB_URL, LINKEDIN_URL, MAILTO } from "@/data/site";

const shadow = "[text-shadow:0_2px_10px_rgba(0,0,0,0.2)]";

const socialLink =
  "group inline-flex size-[45px] items-center justify-center rounded-full border-2 border-transparent bg-white/10 text-white no-underline backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-[5px] hover:scale-110 hover:border-white/30 hover:bg-secondary hover:shadow-[0_10px_25px_rgba(52,152,219,0.4)] max-md:mx-[5px] max-md:size-10 max-sm:size-[38px] dark:border dark:border-[#475569] dark:bg-[#334155] dark:text-dark-text dark:hover:border-secondary";

const socialIcon =
  "text-[1.2rem] transition-transform duration-150 group-hover:scale-110 max-sm:text-[1rem]";

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-hero-gradient pt-[120px] pb-20 text-white before:pointer-events-none before:absolute before:inset-0 before:animate-wave before:bg-(image:--wave-image) before:bg-cover before:bg-center before:opacity-30 before:content-[''] max-lg:min-h-0 max-lg:pt-[100px] max-lg:pb-[60px] max-lg:text-center max-md:pt-20 max-md:pb-10"
    >
      <div className="container relative z-[2] max-lg:pt-[15px] max-md:pt-2.5">
        <div className="-mx-3 flex flex-wrap items-center">
          <div className="mb-12 w-full shrink-0 px-3 text-center lg:mb-0 lg:w-1/3">
            <ProfileImage
              alt="Basem Esam - Backend Developer"
              lazy
              className="max-md:mt-[15px] max-sm:mt-2.5"
              imgClassName="size-[250px] border-[5px] max-lg:size-[200px] max-md:size-[180px] max-sm:size-[150px] max-sm:border-[3px] max-xs:size-[130px] motion-safe:animate-hero-in-1"
            />
          </div>
          <div className="w-full shrink-0 px-3 text-center lg:w-2/3 lg:text-left">
            <h1
              id="hero-title"
              className={`mb-4 text-[calc(1.525rem_+_3.3vw)] leading-[1.2] font-bold xl:text-[4rem] max-md:text-[2.5rem] max-sm:text-[2rem] max-xs:text-[1.75rem] motion-safe:animate-hero-in-2 ${shadow}`}
            >
              Basem Esam
            </h1>
            <h2
              className={`mb-6 text-[calc(1.325rem_+_0.9vw)] leading-[1.2] font-medium text-[#4ecdc4] xl:text-[2rem] max-md:text-[1.5rem] max-sm:text-[1.25rem] motion-safe:animate-hero-in-3 ${shadow}`}
            >
              Backend Developer & CS Student
            </h2>
            <p className={`mb-6 text-[1.25rem] font-light ${shadow}`}>
              Focused on building reliable, scalable backend systems using strong
              foundations in system design, OOP, and clean architecture.
            </p>

            <div className="mt-4 inline-flex flex-col items-center max-lg:w-full">
              <div
                className="mb-4 flex flex-wrap justify-center gap-4 pl-2.5 max-lg:pl-0 max-sm:gap-3"
                role="list"
                aria-label="Social media links"
              >
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialLink}
                  aria-label="LinkedIn Profile"
                >
                  <i className={`fab fa-linkedin-in ${socialIcon}`} aria-hidden="true"></i>
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialLink}
                  aria-label="GitHub Profile"
                >
                  <i className={`fab fa-github ${socialIcon}`} aria-hidden="true"></i>
                </a>
                <a href={MAILTO} className={socialLink} aria-label="Email Basem Esam">
                  <i className={`fas fa-envelope ${socialIcon}`} aria-hidden="true"></i>
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#projects" className={`${buttonStyles("light", "lg")} min-w-[180px]`}>
                  <i className="fas fa-code mr-2" aria-hidden="true"></i>View My Work
                </a>
                <a
                  href={CV_PATH}
                  download
                  className={`${buttonStyles("outlineLight", "lg")} min-w-[180px]`}
                >
                  <i className="fas fa-file-pdf mr-2" aria-hidden="true"></i>Download CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
