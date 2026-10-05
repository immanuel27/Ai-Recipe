import type { Listing, MediaCredit, Recipe, ToolId } from "@/lib/types"

/*
 * Cartoon and animated placeholder videos for the demo.
 *
 * Footage is NOT AI-generated. It's openly licensed animation used as stand-in
 * content until creators upload real work:
 * - Blender Studio open movies (CC BY), streamed from Wikimedia Commons; each
 *   listing plays a short clip of the film and credits it.
 * - Mixkit clips under the Mixkit Stock Video Free License.
 * Posters are frames saved in /public/posters.
 */

const COMMONS = "https://upload.wikimedia.org/wikipedia/commons"

const FILMS = {
  wingit: {
    path: "3/38/WING_IT%21_-_Blender_Open_Movie-full_movie.webm",
    work: "WING IT!",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:WING_IT!_-_Blender_Open_Movie-full_movie.webm",
  },
  sprite: {
    path: "7/76/Sprite_Fright_-_Blender_Open_Movie-full_movie.webm",
    work: "Sprite Fright",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Sprite_Fright_-_Blender_Open_Movie-full_movie.webm",
  },
  hero: {
    path: "a/a9/HERO_-_Blender_Open_Movie-full_movie.webm",
    work: "HERO",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:HERO_-_Blender_Open_Movie-full_movie.webm",
  },
  llama: {
    path: "a/ab/Caminandes_3_-_Llamigos_-_Blender_Animated_Short.webm",
    work: "Caminandes 3: Llamigos",
    license: "CC BY 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Caminandes_3_-_Llamigos_-_Blender_Animated_Short.webm",
  },
  glass: {
    path: "0/02/Glass_Half_-_Blender_Open_Movie-full_movie.webm",
    work: "Glass Half",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Glass_Half_-_Blender_Open_Movie-full_movie.webm",
  },
  coffee: {
    path: "3/3f/Coffee_Run_-_Blender_Open_Movie-full_movie.webm",
    work: "Coffee Run",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Coffee_Run_-_Blender_Open_Movie-full_movie.webm",
  },
  spring: {
    path: "a/a5/Spring_-_Blender_Open_Movie.webm",
    work: "Spring",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Spring_-_Blender_Open_Movie.webm",
  },
  cosmos: {
    path: "3/36/Cosmos_Laundromat_-_First_Cycle_-_Official_Blender_Foundation_release.webm",
    work: "Cosmos Laundromat",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Cosmos_Laundromat_-_First_Cycle_-_Official_Blender_Foundation_release.webm",
  },
  charge: {
    path: "7/7a/Charge_-_Blender_Open_Movie-full_movie.webm",
    work: "Charge",
    license: "CC BY 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Charge_-_Blender_Open_Movie-full_movie.webm",
  },
} as const

const LICENSE_URLS: Record<string, string> = {
  "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
  "CC BY 3.0": "https://creativecommons.org/licenses/by/3.0/",
  "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/",
}

/** A short clip of a Blender open movie (720p VP9 transcode on Commons). */
function film(key: keyof typeof FILMS, start: number, poster: string) {
  const f = FILMS[key]
  const file = f.path.split("/").pop()!
  const credit: MediaCredit = {
    work: f.work,
    author: "Blender Foundation / Blender Studio",
    license: f.license,
    licenseUrl: LICENSE_URLS[f.license],
    sourceUrl: f.page,
  }
  return {
    type: "video" as const,
    mediaUrl: `${COMMONS}/transcoded/${f.path}/${file}.720p.vp9.webm`,
    posterUrl: `/posters/${poster}.jpg`,
    clip: { start, end: start + 12 },
    credit,
  }
}

/** A Mixkit clip under the Mixkit Stock Video Free License. */
function mixkit(id: number, work: string, page: string) {
  return {
    type: "video" as const,
    mediaUrl: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
    posterUrl: `/posters/mixkit-${id}.jpg`,
    credit: {
      work,
      author: "Mixkit",
      license: "Mixkit Stock Video Free License",
      licenseUrl: "https://mixkit.co/license/#videoFree",
      sourceUrl: page,
    } satisfies MediaCredit,
  }
}

function recipe(r: Partial<Recipe> & Pick<Recipe, "prompts">): Recipe {
  return { settings: [], assets: [], editStack: [], failures: [], ...r }
}

const fail = (seed: string, note: string) => ({
  imageUrl: `https://picsum.photos/seed/${seed}/480/480`,
  note,
})

type Seed = Omit<Listing, "id" | "pricing" | "stats"> & {
  stats: Omit<Listing["stats"], "likes"> & { likes?: number }
}

const seeds: Seed[] = [
  {
    slug: "junkyard-rocket-pets",
    title: "Junkyard rocket pets",
    description:
      "A cat and a dog strap into a scrap-metal rocket. Rubbery squash-and-stretch, consistent characters across every cut.",
    creatorId: "c5",
    ...film("wingit", 96, "wingit-rocket"),
    tool: "kling",
    toolVersion: "2.5",
    tags: ["cartoon", "pets", "comedy", "3d"],
    price: 1400,
    createdAt: "2026-10-04T09:00:00Z",
    stats: { views: 31200, sales: 410, saves: 2900 },
    trendingScore: 99,
    recipe: recipe({
      prompts: [
        {
          label: "Character sheet",
          text: "Stylised 3D cartoon, a scrappy orange tabby cat and a goofy brown dog, big expressive eyes, chunky silhouettes, Pixar-like subsurface skin, turnaround sheet, neutral background",
        },
        {
          label: "Shot · lift-off",
          text: "The cat and dog clutch the controls of a rickety rocket built from junkyard scraps, bolts popping off, exaggerated squash and stretch, camera shakes on ignition, warm farmyard sunset",
        },
        { label: "Negative", text: "realistic fur, extra limbs, text, logo, warped faces" },
      ],
      settings: [
        { key: "Mode", value: "Professional" },
        { key: "Aspect", value: "9:16" },
        { key: "Duration", value: "10s" },
        { key: "Character ref", value: "Sheet A, weight 0.8" },
        { key: "Seed", value: "77120" },
      ],
      assets: [
        { name: "Cat & dog turnaround sheet", note: "Generated first, then used as reference" },
        { name: "Junkyard rocket concept", note: "Midjourney v7, 4 variations" },
      ],
      editStack: [
        { tool: "CapCut", note: "Speed ramp at ignition, 1.4×" },
        { tool: "Topaz Video AI", note: "Upscale + frame interpolation to 48fps" },
      ],
      failures: [
        fail("fail-rocket-1", "Dog turned into a cat halfway: no character sheet attached."),
        fail("fail-rocket-2", "Rocket melted on lift-off. 'Rigid metal parts' fixed it."),
      ],
    }),
  },
  {
    slug: "anime-lightning-duel",
    title: "Anime lightning duel",
    description:
      "Hand-drawn anime look with crackling lightning and smear frames. Reads like 2D cel animation, not 3D.",
    creatorId: "c6",
    ...film("hero", 97, "hero-lightning"),
    tool: "runway",
    toolVersion: "Gen-4",
    tags: ["anime", "2d", "action", "lightning"],
    price: 1800,
    createdAt: "2026-10-03T15:00:00Z",
    stats: { views: 28700, sales: 330, saves: 2410 },
    trendingScore: 97,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "2D hand-drawn anime action, a young hero raises a sword as forked lightning crackles across a stormy sky, thick ink outlines, cel shading, smear frames on fast motion, 12fps on twos",
        },
        { label: "Negative", text: "3D render, glossy, photoreal, motion blur" },
      ],
      settings: [
        { key: "Style ref", value: "Hand-drawn keyframe set" },
        { key: "Motion", value: "7" },
        { key: "Duration", value: "10s" },
      ],
      assets: [{ name: "Ink keyframes (6)", note: "Drawn roughs used as image prompts" }],
      editStack: [
        { tool: "After Effects", note: "Hold every other frame for on-twos timing" },
        { tool: "After Effects", note: "Flash frames on each lightning strike" },
      ],
      failures: [fail("fail-anime-1", "Came out glossy 3D until '3D render' went in the negative.")],
    }),
  },
  {
    slug: "mushroom-sprite-ambush",
    title: "Mushroom sprite ambush",
    description: "Tiny forest sprites spring out of the moss. Saturated, storybook-gone-wrong energy.",
    creatorId: "c5",
    ...film("sprite", 35, "sprite-ambush"),
    tool: "veo",
    toolVersion: "3.1",
    tags: ["cartoon", "creatures", "forest", "spooky"],
    price: 1600,
    createdAt: "2026-10-02T12:00:00Z",
    stats: { views: 25100, sales: 290, saves: 2200 },
    trendingScore: 96,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Stylised 3D animation, a mossy forest floor at dusk, tiny mushroom-capped sprites with glowing eyes pop out of the moss all at once, playful-creepy, saturated greens and magentas, low dolly in",
        },
      ],
      settings: [
        { key: "Aspect", value: "9:16" },
        { key: "Seed", value: "31337" },
        { key: "Guidance", value: "8" },
      ],
      editStack: [{ tool: "DaVinci Resolve", note: "Teal-magenta grade, +12 saturation" }],
      failures: [fail("fail-sprite-1", "Sprites looked like real mushrooms without 'glowing eyes'.")],
    }),
  },
  {
    slug: "llama-vs-penguin",
    title: "Llama vs penguin standoff",
    description: "A smug llama and a tiny penguin square off in the snow. Free recipe, great starter.",
    creatorId: "c5",
    ...film("llama", 78, "llama-penguin"),
    tool: "veo",
    toolVersion: "3.1",
    tags: ["cartoon", "animals", "snow", "free"],
    price: 0,
    createdAt: "2026-10-01T10:00:00Z",
    stats: { views: 40300, sales: 2100, saves: 3300 },
    trendingScore: 94,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Cartoon 3D short, a fluffy llama with a smug expression stares down a tiny penguin on a snowy Patagonian plain, comedic timing, wide lens, bright overcast light",
        },
      ],
      settings: [
        { key: "Aspect", value: "16:9" },
        { key: "Duration", value: "8s" },
      ],
      failures: [fail("fail-llama-1", "Penguin grew to llama size. Say 'tiny' twice.")],
    }),
  },
  {
    slug: "caffeine-rush-trip",
    title: "Caffeine rush trip",
    description: "One sip and the world melts into neon swirls. A psychedelic transition you can reuse.",
    creatorId: "c2",
    ...film("coffee", 120, "coffee-rush"),
    tool: "sora",
    toolVersion: "2",
    tags: ["psychedelic", "transition", "cartoon"],
    price: 1500,
    createdAt: "2026-10-03T08:00:00Z",
    stats: { views: 19800, sales: 240, saves: 1700 },
    trendingScore: 93,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Stylised animation, a sleepy young woman gulps espresso and the café melts into swirling neon paint, colours bleed and spiral, camera pushes in fast, playful psychedelic transition",
        },
      ],
      settings: [
        { key: "Duration", value: "12s" },
        { key: "Seed", value: "99001" },
      ],
      editStack: [{ tool: "After Effects", note: "Radial blur + chromatic aberration on the swirl" }],
      failures: [fail("fail-coffee-1", "Swirl started too early: split into two prompts.")],
    }),
  },
  {
    slug: "forest-spirit-awakening",
    title: "Forest spirit awakening",
    description: "A painterly fantasy moment: a girl meets a giant forest spirit. Big, soft, cinematic.",
    creatorId: "c2",
    ...film("spring", 312, "spring-spirit"),
    tool: "veo",
    toolVersion: "3.1",
    tags: ["fantasy", "painterly", "cinematic"],
    price: 2000,
    createdAt: "2026-09-30T18:00:00Z",
    stats: { views: 16400, sales: 180, saves: 1500 },
    trendingScore: 92,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Painterly 3D fantasy, a shepherd girl in a misty mountain forest looks up as an enormous ancient forest spirit opens its glowing eyes, god rays, soft volumetric fog, slow crane up",
        },
      ],
      settings: [
        { key: "Aspect", value: "21:9 → crop 9:16" },
        { key: "Seed", value: "40404" },
      ],
      assets: [{ name: "Spirit silhouette sketch" }],
      editStack: [{ tool: "DaVinci Resolve", note: "Film grain + halation" }],
      failures: [fail("fail-spirit-1", "Spirit kept appearing as a bear. 'Ancient, mossy, antlers' fixed it.")],
    }),
  },
  {
    slug: "pop-art-heart-burst",
    title: "Pop-art heart burst",
    description: "Flat 2D pop-art with bouncing hearts and bold colour blocks. Perfect for loops and stickers.",
    creatorId: "c6",
    ...film("glass", 30, "glass-heart"),
    tool: "midjourney",
    toolVersion: "v7 video",
    tags: ["2d", "pop art", "loop", "colorful"],
    price: 700,
    createdAt: "2026-09-29T11:00:00Z",
    stats: { views: 12300, sales: 150, saves: 1100 },
    trendingScore: 90,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Flat 2D cartoon, pop-art colour blocks, a character with a huge grin as red hearts burst and bounce around them, bold outlines, limited palette, looping",
        },
      ],
      settings: [
        { key: "Motion", value: "high" },
        { key: "Stylize", value: "400" },
      ],
      failures: [fail("fail-pop-1", "Too many hearts: became wallpaper. Cap it at 'five hearts'.")],
    }),
  },
  {
    slug: "cosmic-vortex-dive",
    title: "Cosmic vortex dive",
    description: "Fall through a kaleidoscope of colour. An endlessly loopable sci-fi tunnel.",
    creatorId: "c4",
    ...film("cosmos", 496, "cosmos-vortex"),
    tool: "runway",
    toolVersion: "Gen-4",
    tags: ["sci-fi", "psychedelic", "loop"],
    price: 1200,
    createdAt: "2026-09-28T20:00:00Z",
    stats: { views: 14900, sales: 160, saves: 1250 },
    trendingScore: 89,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Surreal sci-fi animation, the camera dives into a swirling cosmic vortex of liquid colour, fractal petals unfolding, hyper-saturated magenta and gold, seamless loop",
        },
      ],
      settings: [
        { key: "Loop", value: "On" },
        { key: "Seed", value: "60606" },
      ],
      failures: [fail("fail-vortex-1", "Loop seam jumped. Match first and last frame prompts.")],
    }),
  },
  {
    slug: "hand-drawn-hero-walk",
    title: "Hand-drawn hero walk",
    description: "A confident 2D walk cycle with real hand-drawn wobble. Swap in your own character.",
    creatorId: "c6",
    ...film("hero", 38, "hero-walk"),
    tool: "kling",
    toolVersion: "2.5",
    tags: ["2d", "anime", "walk cycle"],
    price: 1100,
    createdAt: "2026-09-27T09:00:00Z",
    stats: { views: 9800, sales: 120, saves: 860 },
    trendingScore: 85,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "2D hand-drawn animation, a young swordsman strides toward camera with a cocky smile, line boil on the outlines, flat cel colours, dusty village street",
        },
      ],
      settings: [{ key: "Duration", value: "5s ×2" }],
      failures: [fail("fail-walk-1", "Legs swapped mid-stride. Generate 5s chunks.")],
    }),
  },
  {
    slug: "barnyard-launch-gone-wrong",
    title: "Barnyard launch gone wrong",
    description: "The rocket sputters, the chickens scatter, chaos ensues. Comedy timing is in the recipe.",
    creatorId: "c5",
    ...film("wingit", 126, "wingit-launch"),
    tool: "sora",
    toolVersion: "2",
    tags: ["cartoon", "comedy", "chaos"],
    price: 900,
    createdAt: "2026-09-26T14:00:00Z",
    stats: { views: 11200, sales: 130, saves: 940 },
    trendingScore: 83,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Cartoon 3D comedy, a homemade rocket sputters smoke in a barnyard, chickens scatter, a cat clings to the hull, exaggerated reactions, bright midday light",
        },
      ],
      settings: [{ key: "Duration", value: "12s" }],
      failures: [fail("fail-barn-1", "Chickens multiplied to 40. 'Three chickens' fixed it.")],
    }),
  },
  {
    slug: "campfire-squad",
    title: "Campfire squad close-ups",
    description: "Expressive cartoon faces around a campfire. A masterclass in consistent characters.",
    creatorId: "c5",
    ...film("sprite", 190, "sprite-campfire"),
    tool: "kling",
    toolVersion: "2.5",
    tags: ["cartoon", "characters", "night"],
    price: 1000,
    createdAt: "2026-09-25T19:00:00Z",
    stats: { views: 8700, sales: 95, saves: 700 },
    trendingScore: 82,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Stylised 3D cartoon, five friends around a campfire in a dark forest, warm firelight on expressive faces, slow push-in, cosy-creepy mood",
        },
      ],
      settings: [{ key: "Character refs", value: "5 sheets, weight 0.7" }],
      failures: [fail("fail-camp-1", "Faces swapped between friends. One ref sheet per character.")],
    }),
  },
  {
    slug: "last-stand-vs-robot",
    title: "Last stand vs the robot",
    description: "A gritty sci-fi standoff with a towering machine. Moody, cinematic and tense.",
    creatorId: "c4",
    ...film("charge", 75, "charge-robot"),
    tool: "sora",
    toolVersion: "2",
    tags: ["sci-fi", "robot", "cinematic"],
    price: 1300,
    createdAt: "2026-09-24T21:00:00Z",
    stats: { views: 10100, sales: 110, saves: 820 },
    trendingScore: 81,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Cinematic 3D animation, an old man in a wrecked industrial yard faces a towering security robot, red warning lights, rain, low angle, tense standoff",
        },
      ],
      settings: [{ key: "Aspect", value: "2.39:1" }],
      failures: [fail("fail-robot-1", "Robot looked cute. 'Industrial, menacing, scratched paint'.")],
    }),
  },
  {
    slug: "enchanted-steam-creek",
    title: "Enchanted steam creek",
    description: "A glowing river winds through a fantasy forest at night. Calm, magical and loopable.",
    creatorId: "c3",
    ...mixkit(
      51713,
      "A steamy river crosses a fantasy forest at night",
      "https://mixkit.co/free-stock-video/a-steamy-river-crosses-a-fantasy-forest-at-night-51713/"
    ),
    tool: "runway",
    toolVersion: "Gen-4",
    tags: ["fantasy", "forest", "night", "loop"],
    price: 800,
    createdAt: "2026-09-23T22:00:00Z",
    stats: { views: 7600, sales: 80, saves: 640 },
    trendingScore: 80,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Fantasy forest at night, a steaming river glows softly as it winds between ancient trees, fireflies, moonlight through mist, slow forward glide, seamless loop",
        },
      ],
      settings: [{ key: "Loop", value: "On" }],
    }),
  },
  {
    slug: "neon-frontier-flyover",
    title: "Neon frontier flyover",
    description: "Glide over a futuristic landscape of glowing structures. Synthwave in motion.",
    creatorId: "c4",
    ...mixkit(99544, "Futuristic landscape animation", "https://mixkit.co/free-stock-video/futuristic-landscape-animation-99544/"),
    tool: "kling",
    toolVersion: "2.5",
    tags: ["sci-fi", "neon", "synthwave"],
    price: 900,
    createdAt: "2026-09-22T17:00:00Z",
    stats: { views: 6900, sales: 70, saves: 520 },
    trendingScore: 78,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Futuristic animated landscape, glowing neon structures on a dark plain, synthwave palette, smooth aerial flyover at dusk",
        },
      ],
    }),
  },
  {
    slug: "speed-line-cyclist",
    title: "Speed-line cyclist loop",
    description: "A stylised cyclist tears through the frame with comic-book speed lines.",
    creatorId: "c2",
    ...mixkit(99584, "Animation of a cyclist moving fast", "https://mixkit.co/free-stock-video/animation-of-a-cyclist-moving-fast-99584/"),
    tool: "sora",
    toolVersion: "2",
    tags: ["2d", "motion", "loop", "sport"],
    price: 600,
    createdAt: "2026-09-21T07:00:00Z",
    stats: { views: 5400, sales: 60, saves: 410 },
    trendingScore: 77,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Stylised 2D animation, a cyclist racing at full speed, comic-book speed lines and motion smears, bold flat colours, seamless loop",
        },
      ],
    }),
  },
]

export const CARTOON_LISTINGS: Listing[] = seeds.map((s, i) => ({
  ...s,
  id: `cartoon-${i + 1}`,
  tool: s.tool as ToolId,
  pricing: { mode: "single" },
  stats: { ...s.stats, likes: s.stats.likes ?? Math.round(s.stats.saves * 3.4) },
}))
