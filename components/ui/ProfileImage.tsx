import { PROFILE_IMAGE } from "@/data/site";

type ProfileImageProps = {
  alt: string;
  className?: string;
  imgClassName?: string;
  lazy?: boolean;
};

export default function ProfileImage({
  alt,
  className = "",
  imgClassName = "",
  lazy,
}: ProfileImageProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <picture className="block rounded-full border border-hairline bg-surface p-1.5 shadow-md transition-shadow duration-300 hover:shadow-xl motion-reduce:transition-none">
        <source srcSet={PROFILE_IMAGE} type="image/webp" />
        <img
          src={PROFILE_IMAGE}
          alt={alt}
          className={`block rounded-full object-cover object-center select-none ${imgClassName}`}
          loading={lazy ? "lazy" : undefined}
        />
      </picture>
      <span
        className="absolute bottom-2 end-2 size-4 rounded-full bg-status shadow-[0_0_8px_rgba(74,222,128,0.6)] ring-4 ring-[var(--c-surface)]"
        aria-hidden="true"
      ></span>
    </span>
  );
}