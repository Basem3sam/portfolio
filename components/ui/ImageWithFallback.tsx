"use client";

import { useEffect, useRef, useState } from "react";

type ImageWithFallbackProps = {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
};

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
}: ImageWithFallbackProps) {
  const [current, setCurrent] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setCurrent(fallbackSrc);
  }, [fallbackSrc]);

  return (
    <img
      ref={imageRef}
      src={current}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setCurrent(fallbackSrc)}
    />
  );
}
