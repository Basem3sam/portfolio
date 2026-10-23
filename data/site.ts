export const SITE_URL = "https://basemesam.vercel.app/";
export const PROFILE_IMAGE = "/assets/images/profile_256.webp";
/** The hero/link-stage portrait: a transparent cut-out (mockup `PHOTO`, 640×598). */
export const PROFILE_CUTOUT = "/assets/images/portrait-cutout.webp";
/** The same cut-out at three widths (the full file is 2508px square and decodes
    to ~25 MB). The browser picks the smallest that still covers the display
    size at its pixel ratio, so phones fetch ~40-75 KB instead of 150 KB. */
export const PROFILE_CUTOUT_SRCSET = [
  "/assets/images/portrait-cutout-900.webp 900w",
  "/assets/images/portrait-cutout-1300.webp 1300w",
  "/assets/images/portrait-cutout-1800.webp 1800w",
  "/assets/images/portrait-cutout.webp 2508w",
].join(", ");
/** Hero: the photo is 125.6% of the portrait frame (see Hero.css). */
export const PROFILE_CUTOUT_SIZES_HERO = "(max-width: 900px) min(603px, 126vw), min(1080px, 63vw)";
/** Links card: the photo is ~1.28 x the stage height. */
export const PROFILE_CUTOUT_SIZES_LINKS = "420px";
export const CV_PATH = "/assets/documents/basem-esam-cv.pdf";
export const LINKEDIN_URL = "https://linkedin.com/in/BasemEsam";
export const GITHUB_URL = "https://github.com/basem3sam";
export const EMAIL = "basem.esam.omar@gmail.com";
export const MAILTO = `mailto:${EMAIL}`;
export const TROSC_URL = "https://trosc.vercel.app/";
export const PHONE_DISPLAY = "+20 112 350 5981";
export const PHONE_TEL = "tel:+201123505981";
export const TROSC_REPO_URL = "https://github.com/Basem3sam/trosc-backend";
export const TROSC_API_DOCS_URL = "https://github.com/Basem3sam/trosc-backend/blob/HEAD/API.md";
export const LARAVEL_REPO_URL = "https://github.com/Basem3sam/laravel-ecommerce-app";
export const NEUROSCAN_REPO_URL = "https://github.com/Basem3sam/neuroscan-ai";
export const ZABTHALAHAK_URL = "https://zabthalahak.vercel.app/";
