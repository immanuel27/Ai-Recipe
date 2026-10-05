import type { MediaCredit } from "@/lib/types"

/** Attribution line for third-party placeholder footage. */
export function MediaCreditLine({ credit }: { credit: MediaCredit }) {
  const link = "underline underline-offset-2 hover:text-foreground"
  return (
    <p className="text-xs text-muted-foreground">
      Demo footage:{" "}
      <a href={credit.sourceUrl} target="_blank" rel="noreferrer" className={link}>
        {credit.work}
      </a>{" "}
      by {credit.author},{" "}
      {credit.licenseUrl ? (
        <a href={credit.licenseUrl} target="_blank" rel="noreferrer license" className={link}>
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
      . Not AI-generated; shown as placeholder content.
    </p>
  )
}
