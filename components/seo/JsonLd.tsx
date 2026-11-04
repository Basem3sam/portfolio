"use client";

import { GITHUB_URL, LINKEDIN_URL, SITE_URL } from "@/data/site";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Basem Esam",
  jobTitle: "Backend Engineer",
  description:
    "Backend engineer specializing in Node.js, Express, and MongoDB. Built and runs a 100+ endpoint production API serving 200+ members.",
  url: SITE_URL,
  email: "mailto:basem.esam.omar@gmail.com",
  telephone: "+201123505981",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Port Said",
    addressCountry: "EG",
  },
  sameAs: [LINKEDIN_URL, GITHUB_URL],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Suez Canal University",
  },
  knowsAbout: [
    "Node.js",
    "Express.js",
    "MongoDB",
    "REST API design",
    "Authentication",
    "Backend architecture",
  ],
};

export default function JsonLd() {
  return (
    <script
      type={typeof window === "undefined" ? "application/ld+json" : "application/json"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
    />
  );
}
