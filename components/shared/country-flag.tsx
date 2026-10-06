import Image from "next/image"

import { COUNTRY_CODES } from "@/lib/countries"
import { cn } from "@/lib/utils"

/** A country's flag as a small circle, sitting left of its name. */
export function CountryFlag({ country, className }: { country: string; className?: string }) {
  const code = COUNTRY_CODES[country]
  if (!code) return null
  return (
    <Image
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      width={16}
      height={16}
      className={cn("size-4 shrink-0 rounded-full object-cover ring-1 ring-foreground/15", className)}
    />
  )
}
