import type { Creator } from "@/lib/types"

// Saturated backdrops so avatars read as bright chips on the dark canvas
const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=ff5e5b,3d5afe,ffd23f,2ec4b6,c77dff,ff9f1c`

export const CREATORS: Creator[] = [
  {
    id: "c1",
    username: "mira.frames",
    displayName: "Mira Okafor",
    avatarUrl: avatar("mira"),
    bio: "Cinematic product shots and moody light. Ex-commercial DP.",
  },
  {
    id: "c2",
    username: "kenji_lab",
    displayName: "Kenji Ito",
    avatarUrl: avatar("kenji"),
    bio: "Stylised motion, loops and anime-adjacent worlds.",
  },
  {
    id: "c3",
    username: "solenne",
    displayName: "Solenne Marchetti",
    avatarUrl: avatar("solenne"),
    bio: "Editorial portraits and fashion stills.",
  },
  {
    id: "c5",
    username: "toonsmith",
    displayName: "Ava Lindqvist",
    avatarUrl: avatar("ava"),
    bio: "Cartoon worlds, squash-and-stretch characters and chaotic pets.",
  },
  {
    id: "c6",
    username: "pixelmonk",
    displayName: "Ravi Desai",
    avatarUrl: avatar("ravi"),
    bio: "Anime-style action and hand-drawn looks from video models.",
  },
  {
    id: "c4",
    username: "dax.builds",
    displayName: "Dax Romero",
    avatarUrl: avatar("dax"),
    bio: "Architecture, interiors, and impossible spaces.",
  },
]
