import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-24">
      <div className="w-full max-w-xl rounded-xl border border-hairline bg-surface p-8 text-center shadow-sm sm:p-12">
        <p className="font-mono text-sm font-medium tracking-[0.2em] text-secondary uppercase">
          <span aria-hidden="true">● </span>HTTP 404
        </p>
        <h1 className="mt-4 text-4xl font-bold text-dark-text sm:text-5xl">Page not found</h1>
        <p className="mt-2 text-2xl font-semibold text-dark-text" dir="rtl" lang="ar">
          الصفحة غير موجودة
        </p>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-light-text" dir="ltr" lang="en">
          This page does not exist. It may have moved, or the address might be mistyped.
        </p>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-light-text" dir="rtl" lang="ar">
          هذه الصفحة غير موجودة — ربما تم نقلها أو أن العنوان غير صحيح.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-secondary bg-secondary px-6 font-semibold text-on-secondary no-underline transition-colors duration-200 hover:bg-secondary/90"
          >
            Back to home
          </Link>
          <Link
            href="/ar"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-secondary px-6 font-semibold text-secondary no-underline transition-colors duration-200 hover:bg-secondary/10"
          >
            الرئيسية
          </Link>
          <Link
            href="/links"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-hairline px-6 font-semibold text-dark-text no-underline transition-colors duration-200 hover:border-secondary hover:text-secondary"
          >
            All my links
          </Link>
        </div>
      </div>
    </main>
  );
}
