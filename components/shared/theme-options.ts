import { DarkIcon, LightIcon, SystemIcon } from "@/components/icons"

export const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: LightIcon },
  { value: "dark", label: "Dark", icon: DarkIcon },
  { value: "system", label: "System", icon: SystemIcon },
] as const
