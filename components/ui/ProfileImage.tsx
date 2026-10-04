import { PROFILE_IMAGE } from "@/data/site";

type ProfileImageProps = {
  alt: string;
  className?: string;
  imgClassName?: string;
  lazy?: boolean;
};

const container =
  "group relative inline-block rounded-full bg-avatar p-1.5 shadow-lg transition-transform duration-300 hover:scale-105 hover:rotate-2 before:absolute before:-inset-1 before:z-[-1] before:animate-glowing before:rounded-full before:bg-[linear-gradient(45deg,#ff6b6b,#4ecdc4,#45b7d1,#96ceb4,#ffeaa7,#dda0dd,#98d8c8)] before:bg-[length:400%] before:opacity-0 before:transition-opacity before:duration-300 before:content-[''] hover:before:opacity-70";

const image =
  "block rounded-full border-white object-cover object-center select-none transition-transform duration-300 group-hover:scale-[1.02] dark:border-light-bg";

export default function ProfileImage({
  alt,
  className = "",
  imgClassName = "",
  lazy,
}: ProfileImageProps) {
  return (
    <picture className={`${container} ${className}`}>
      <source srcSet={PROFILE_IMAGE} type="image/webp" />
      <img
        src={PROFILE_IMAGE}
        alt={alt}
        className={`${image} ${imgClassName}`}
        loading={lazy ? "lazy" : undefined}
      />
    </picture>
  );
}
