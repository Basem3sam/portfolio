import Script from "next/script";

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches){t="dark"}if(t!=="dark")return;var b=document.body;if(b){b.classList.add("dark-mode");return}var d=document.documentElement;d.classList.add("dark-mode");var o=new MutationObserver(function(){if(document.body){o.disconnect();d.classList.remove("dark-mode");document.body.classList.add("dark-mode")}});o.observe(d,{childList:true})}catch(e){}})();`;

export default function ThemeScript() {
  return (
    <Script id="theme-init" strategy="beforeInteractive">
      {themeScript}
    </Script>
  );
}