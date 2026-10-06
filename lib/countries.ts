/** ISO 3166-1 alpha-2 codes, used for the flag next to each name */
export const COUNTRY_CODES: Record<string, string> = {
  Australia: "au",
  Brazil: "br",
  Canada: "ca",
  France: "fr",
  Germany: "de",
  India: "in",
  Japan: "jp",
  Mexico: "mx",
  Netherlands: "nl",
  Nigeria: "ng",
  Spain: "es",
  "United Kingdom": "gb",
  "United States": "us",
}

export const COUNTRIES = Object.keys(COUNTRY_CODES)

export const PAYOUT_METHODS = [
  { value: "stripe", label: "Stripe Connect" },
  { value: "paypal", label: "PayPal" },
  { value: "bank", label: "Bank transfer" },
]
