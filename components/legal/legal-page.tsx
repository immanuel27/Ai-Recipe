import Link from "next/link"

/** A long-form legal page: title, last updated date, a short intro, then numbered sections. */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string
  updated: string
  intro: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pt-8 pb-16 md:px-6 md:pt-12">
      <header className="flex flex-col gap-3">
        <p className="label-caps">Last updated {updated}</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <div className="type-read text-muted-foreground">{intro}</div>
      </header>
      <div className="flex flex-col gap-8">{children}</div>
      <footer className="border-t border-foreground/10 pt-6 type-body text-muted-foreground">
        See also our{" "}
        <Link href="/privacy" className="text-link underline underline-offset-2">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="text-link underline underline-offset-2">
          Terms of Use
        </Link>
        .
      </footer>
    </article>
  )
}

export function LegalSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`section-${n}`} className="flex flex-col gap-3">
      <h2 id={`section-${n}`} className="text-xl font-semibold tracking-tight">
        {n}. {title}
      </h2>
      <div className="flex flex-col gap-3 type-read leading-7 text-foreground/90 [&_a]:text-link [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  )
}

export const CONTACT_EMAIL = "atomtheecreator@gmail.com"
export const OPERATOR = "Emmanuel Ovie Joseph"
export const UPDATED = "October 17, 2026"
