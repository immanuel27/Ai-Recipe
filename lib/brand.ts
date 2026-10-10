// Literal colours for contexts that cannot read CSS variables (web manifest,
// ImageResponse icons). Keep in sync with :root tokens in app/globals.css.
export const BRAND = {
  name: "Ai Recipy",
  tagline: "A hub for AI creators: buy and sell the recipes behind amazing shots.",
  description: "Buy the step-by-step recipes behind AI-made videos, images and websites.",
  background: "#faf8f5", // --background
  backgroundDark: "#141210", // .dark --background
  primary: "#e8613c", // --brand (paprika, the single accent)
  onPrimary: "#ffffff",
  logo: "#6422f5", // --logo
  logoForeground: "#f0ece0", // --logo-foreground
}

// Placeholder profile URLs: replace with the real accounts before launch.
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  x: "https://x.com",
  linkedin: "https://linkedin.com",
}
