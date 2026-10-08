"use client";

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches){t="dark"}if(t==="dark"){document.body.classList.add("dark-mode")}}catch(e){}})();`;

export default function ThemeScript() {
  return (
    <script
      id="theme-init"
      type={typeof window === "undefined" ? undefined : "application/json"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}