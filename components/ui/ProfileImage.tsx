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
    <picture
      className={`inline-block rounded-full border border-hairline bg-surface p-1.5 shadow-md transition-transform duration-300 hover:scale-[1.02] motion-reduce:transition-none ${className}`}
    >
      <source srcSet={PROFILE_IMAGE} type="image/webp" />
      <img
        src={PROFILE_IMAGE}
        alt={alt}
        className={`block rounded-full object-cover object-center select-none ${imgClassName}`}
        loading={lazy ? "lazy" : undefined}
      />
    </picture>
  );
}