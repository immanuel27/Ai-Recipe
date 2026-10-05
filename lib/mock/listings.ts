import { CARTOON_LISTINGS } from "@/lib/mock/cartoon-listings"
import type { Listing, Recipe } from "@/lib/types"

// Placeholder media until real uploads exist: short public test clips
// (test-videos.co.uk, MDN CC0) and seeded portrait photos from picsum.
const SAMPLE_VIDEOS = {
  jellyfish: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4",
  sintel: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_2MB.mp4",
  bunny: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",
  flower: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  friday: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
}
const video = (name: keyof typeof SAMPLE_VIDEOS) => ({
  mediaUrl: SAMPLE_VIDEOS[name],
  posterUrl: `https://picsum.photos/seed/poster-${name}/900/1600`,
})
const image = (seed: string) => {
  const url = `https://picsum.photos/seed/${seed}/900/1600`
  return { mediaUrl: url, posterUrl: url }
}
/** Several images of mixed shapes: [seed, width, height] */
const gallery = (...shots: [string, number, number][]) => {
  const images = shots.map(([seed, w, h]) => `https://picsum.photos/seed/${seed}/${w}/${h}`)
  return { mediaUrl: images[0]!, posterUrl: images[0]!, images }
}
const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/480/480`

function recipe(partial: Partial<Recipe> & Pick<Recipe, "prompts">): Recipe {
  return {
    settings: [],
    assets: [],
    editStack: [],
    failures: [],
    ...partial,
  }
}

const BASE_LISTINGS: Listing[] = [
  {
    id: "l1",
    slug: "neon-alley-chase",
    title: "Neon alley chase at golden hour",
    description:
      "A handheld chase through a wet neon alley. Consistent subject across four cuts with no identity drift.",
    creatorId: "c1",
    type: "video",
    ...video("sintel"),
    tool: "veo",
    toolVersion: "3.1",
    tags: ["cinematic", "chase", "neon"],
    price: 1200,
    pricing: { mode: "single" },
    createdAt: "2026-09-28T10:00:00Z",
    stats: { views: 18420, sales: 214, saves: 1302, likes: 4427 },
    trendingScore: 98,
    recipe: recipe({
      prompts: [
        {
          label: "Shot 1 · establishing",
          text: "Handheld 35mm, low angle, a runner in a yellow rain jacket bursts out of a narrow alley, wet asphalt reflecting pink and teal neon, golden hour haze spilling from the street behind, shallow depth of field, slight motion blur",
        },
        {
          label: "Shot 2 · tracking",
          text: "Tracking shot at waist height following the same runner, steam vents, puddle splashes in slow motion at 48fps, keep jacket colour and face identical to reference",
        },
        {
          label: "Shot 3 · reveal",
          text: "Whip pan to the end of the alley revealing a crowded night market, warm practical lights, the runner slows and looks back over shoulder",
        },
      ],
      settings: [
        { key: "Aspect", value: "9:16" },
        { key: "Duration", value: "8s per shot" },
        { key: "Seed", value: "449120" },
        { key: "Guidance", value: "7.5" },
        { key: "Camera control", value: "Handheld · medium shake" },
      ],
      assets: [
        { name: "Runner reference sheet", note: "3 angles, used as subject ref" },
        { name: "Neon colour board", note: "Pink #ff3e9a / teal mix" },
      ],
      editStack: [
        { tool: "DaVinci Resolve", note: "Cut 4 shots, speed ramp into shot 3" },
        { tool: "Topaz Video AI", note: "Upscale to 4K, Proteus model" },
        { tool: "Resolve Color", note: "Film emulation LUT at 40%" },
      ],
      failures: [
        { imageUrl: thumb("fail-neon-1"), note: "Jacket turned red between shots: no subject reference attached." },
        { imageUrl: thumb("fail-neon-2"), note: "Too much shake. 'Handheld heavy' reads as a found-footage look." },
        { imageUrl: thumb("fail-neon-3"), note: "Neon bled into skin tones; fixed with 'practical lights only'." },
      ],
    }),
  },
  {
    id: "l2",
    slug: "liquid-chrome-sneaker",
    title: "Liquid chrome sneaker reveal",
    description: "Product hero loop: a sneaker forms out of liquid chrome on a seamless backdrop.",
    creatorId: "c1",
    type: "video",
    ...video("flower"),
    tool: "sora",
    toolVersion: "2",
    tags: ["product", "chrome", "loop"],
    price: 1800,
    pricing: { mode: "single" },
    createdAt: "2026-09-21T10:00:00Z",
    stats: { views: 12010, sales: 160, saves: 980, likes: 3332 },
    trendingScore: 91,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Studio macro, a pool of liquid chrome rises and folds into a high-top sneaker, seamless off-white backdrop, softbox key from top left, caustic reflections, perfectly looping",
        },
      ],
      settings: [
        { key: "Aspect", value: "9:16" },
        { key: "Duration", value: "10s" },
        { key: "Loop", value: "On" },
        { key: "Seed", value: "88213" },
      ],
      assets: [{ name: "Sneaker silhouette mask" }],
      editStack: [{ tool: "After Effects", note: "Seamless loop crossfade, 12 frames" }],
      failures: [
        { imageUrl: thumb("fail-chrome-1"), note: "Chrome read as grey plastic without the caustics keyword." },
        { imageUrl: thumb("fail-chrome-2"), note: "Shoe had six eyelets on one side, four on the other." },
      ],
    }),
  },
  {
    id: "l3",
    slug: "paper-city-timelapse",
    title: "Paper city day-to-night timelapse",
    description: "A papercraft city folds itself up as the sun sets. Stop-motion feel without the jitter.",
    creatorId: "c2",
    type: "video",
    ...video("bunny"),
    tool: "kling",
    toolVersion: "2.5",
    tags: ["papercraft", "timelapse", "stylised"],
    price: 900,
    pricing: { mode: "single" },
    createdAt: "2026-09-30T10:00:00Z",
    stats: { views: 9030, sales: 88, saves: 760, likes: 2584 },
    trendingScore: 87,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Papercraft city diorama, sun arcs across the sky, buildings fold flat one by one as night falls, tiny LED windows switch on, 12fps stop-motion cadence, top-down three-quarter view",
        },
        { label: "Negative", text: "jitter, warping, melting paper, text" },
      ],
      settings: [
        { key: "Mode", value: "Professional" },
        { key: "Duration", value: "10s" },
        { key: "Creativity", value: "0.4" },
      ],
      editStack: [{ tool: "Premiere Pro", note: "Frame-hold every other frame for 12fps" }],
      failures: [{ imageUrl: thumb("fail-paper-1"), note: "Paper melted instead of folding at creativity 0.7." }],
    }),
  },
  {
    id: "l4",
    slug: "koi-pond-loop",
    title: "Koi pond ink-wash loop",
    description: "Sumi-e style koi circling in a seamless loop. Great for ambient screens.",
    creatorId: "c2",
    type: "video",
    ...video("jellyfish"),
    tool: "runway",
    toolVersion: "Gen-4",
    tags: ["ink", "loop", "ambient"],
    price: 0,
    pricing: { mode: "single" },
    createdAt: "2026-09-12T10:00:00Z",
    stats: { views: 22100, sales: 1430, saves: 2200, likes: 7480 },
    trendingScore: 84,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Traditional sumi-e ink wash painting of three koi circling slowly in a pond, rice paper texture, ink bleeding softly at the edges, seamless loop, overhead view",
        },
      ],
      settings: [
        { key: "Duration", value: "10s" },
        { key: "Motion", value: "3" },
      ],
      editStack: [{ tool: "After Effects", note: "Paper grain overlay at 15%" }],
      failures: [{ imageUrl: thumb("fail-koi-1"), note: "Koi multiplied to seven without 'three koi' in the first clause." }],
    }),
  },
  {
    id: "l5",
    slug: "desert-drone-sweep",
    title: "Desert drone sweep over a lost city",
    description: "A long FPV-style sweep over sandstone ruins with consistent geography.",
    creatorId: "c4",
    type: "video",
    ...video("friday"),
    tool: "veo",
    toolVersion: "3.1",
    tags: ["drone", "landscape", "epic"],
    price: 1500,
    pricing: { mode: "single" },
    createdAt: "2026-09-25T10:00:00Z",
    stats: { views: 7400, sales: 61, saves: 512, likes: 1741 },
    trendingScore: 79,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "FPV drone sweep low over sandstone ruins of an ancient city at dawn, long shadows, dust in the air, accelerating through an archway then rising to reveal the full valley",
        },
      ],
      settings: [
        { key: "Aspect", value: "9:16" },
        { key: "Seed", value: "70031" },
      ],
      assets: [{ name: "Valley layout sketch" }],
      editStack: [{ tool: "DaVinci Resolve", note: "Speed ramp 100→140%" }],
      failures: [{ imageUrl: thumb("fail-desert-1"), note: "Archway duplicated mid-shot without the layout reference." }],
    }),
  },
  {
    id: "l6",
    slug: "velvet-portrait-series",
    title: "Velvet portrait series",
    description: "Editorial portraits with deep velvet backdrops and painterly skin.",
    creatorId: "c3",
    type: "image",
    ...gallery(
      ["velvet-portrait", 900, 1600],
      ["velvet-portrait-2", 1200, 1200],
      ["velvet-portrait-3", 1080, 1350]
    ),
    tool: "midjourney",
    toolVersion: "v7",
    tags: ["portrait", "editorial", "painterly"],
    price: 800,
    pricing: { mode: "single" },
    createdAt: "2026-09-29T10:00:00Z",
    stats: { views: 15300, sales: 302, saves: 1890, likes: 6426 },
    trendingScore: 95,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Editorial portrait of a woman in a deep emerald velvet blazer against crushed burgundy velvet, Rembrandt lighting, painterly skin texture, medium format film, 85mm",
        },
      ],
      settings: [
        { key: "Aspect", value: "--ar 9:16" },
        { key: "Stylize", value: "250" },
        { key: "Style ref", value: "--sref 2219400" },
      ],
      assets: [{ name: "Moodboard (6 images)" }],
      editStack: [
        { tool: "Photoshop", note: "Frequency separation, light dodge & burn" },
        { tool: "Lightroom", note: "Grain 20, split tone" },
      ],
      failures: [
        { imageUrl: thumb("fail-velvet-1"), note: "Stylize 750 made faces waxy." },
        { imageUrl: thumb("fail-velvet-2"), note: "'Velvet' alone read as satin; 'crushed velvet' fixed it." },
      ],
    }),
  },
  {
    id: "l7",
    slug: "brutalist-greenhouse",
    title: "Brutalist greenhouse interior",
    description: "Concrete and fern interiors with soft overcast light.",
    creatorId: "c4",
    type: "image",
    ...gallery(["brutalist-greenhouse", 1200, 1200]),
    tool: "flux",
    toolVersion: "1.1 Pro",
    tags: ["architecture", "interior", "plants"],
    price: 600,
    pricing: { mode: "single" },
    createdAt: "2026-09-18T10:00:00Z",
    stats: { views: 6100, sales: 74, saves: 640, likes: 2176 },
    trendingScore: 72,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Interior of a brutalist concrete greenhouse, tall board-formed walls, hanging ferns and monstera, overcast skylight, soft mist, architectural photography, tilt-shift lens",
        },
      ],
      settings: [
        { key: "Steps", value: "40" },
        { key: "Guidance", value: "3.5" },
        { key: "Seed", value: "120045" },
      ],
      editStack: [{ tool: "Lightroom", note: "Perspective correction" }],
      failures: [{ imageUrl: thumb("fail-green-1"), note: "Guidance 6 over-sharpened the concrete into CGI." }],
    }),
  },
  {
    id: "l8",
    slug: "retro-poster-type",
    title: "Retro travel poster with perfect type",
    description: "1960s travel-poster style with legible, correctly kerned headline type.",
    creatorId: "c3",
    type: "image",
    ...gallery(["retro-poster", 1600, 1000], ["retro-poster-2", 1080, 1350]),
    tool: "ideogram",
    toolVersion: "3.0",
    tags: ["poster", "typography", "retro"],
    price: 500,
    pricing: { mode: "single" },
    createdAt: "2026-09-08T10:00:00Z",
    stats: { views: 4300, sales: 52, saves: 410, likes: 1394 },
    trendingScore: 64,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: 'Vintage 1960s travel poster for "LISBOA", screen-printed look, limited palette of five colours, tram climbing a hill, bold condensed sans-serif headline',
        },
      ],
      settings: [
        { key: "Magic prompt", value: "Off" },
        { key: "Style", value: "Design" },
      ],
      failures: [{ imageUrl: thumb("fail-poster-1"), note: "Magic prompt rewrote the city name." }],
    }),
  },
  {
    id: "l9",
    slug: "macro-dew-insects",
    title: "Macro dew on iridescent beetles",
    description: "Ultra-macro nature shots with believable depth of field.",
    creatorId: "c1",
    type: "image",
    ...image("macro-beetle"),
    tool: "imagen",
    toolVersion: "4",
    tags: ["macro", "nature"],
    price: 0,
    pricing: { mode: "single" },
    createdAt: "2026-09-02T10:00:00Z",
    stats: { views: 8800, sales: 900, saves: 700, likes: 2380 },
    trendingScore: 70,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Ultra macro photograph of an iridescent jewel beetle covered in morning dew on a fern frond, focus stacked, soft green bokeh, 100mm macro lens",
        },
      ],
      settings: [{ key: "Aspect", value: "9:16" }],
      failures: [{ imageUrl: thumb("fail-macro-1"), note: "Beetle had eight legs. Name the species to anchor anatomy." }],
    }),
  },
  {
    id: "l10",
    slug: "floating-islands-matte",
    title: "Floating islands matte painting",
    description: "Classic matte painting look for fantasy establishing shots.",
    creatorId: "c2",
    type: "image",
    ...gallery(
      ["floating-islands", 1600, 900],
      ["floating-islands-2", 900, 1600],
      ["floating-islands-3", 1200, 1200],
      ["floating-islands-4", 1600, 1000]
    ),
    tool: "midjourney",
    toolVersion: "v7",
    tags: ["fantasy", "matte painting"],
    price: 1000,
    pricing: { mode: "single" },
    createdAt: "2026-09-26T10:00:00Z",
    stats: { views: 10200, sales: 120, saves: 990, likes: 3366 },
    trendingScore: 88,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Matte painting of floating islands with waterfalls pouring into clouds, tiny monastery on the largest island, golden rim light, painted by a 1980s film matte artist",
        },
      ],
      settings: [
        { key: "Aspect", value: "--ar 9:16" },
        { key: "Chaos", value: "10" },
      ],
      editStack: [{ tool: "Photoshop", note: "Generative expand for the top sky" }],
      failures: [{ imageUrl: thumb("fail-islands-1"), note: "Chaos 40 gave a different world each time." }],
    }),
  },
  {
    id: "l11",
    slug: "ceramic-still-life",
    title: "Soft ceramic still life",
    description: "Minimal still lifes of matte ceramics and dried flowers.",
    creatorId: "c3",
    type: "image",
    ...image("ceramic-still"),
    tool: "flux",
    toolVersion: "1.1 Pro",
    tags: ["still life", "minimal"],
    price: 400,
    pricing: { mode: "single" },
    createdAt: "2026-09-15T10:00:00Z",
    stats: { views: 3900, sales: 33, saves: 280, likes: 952 },
    trendingScore: 58,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Minimal still life, matte off-white ceramic vases of varying heights, a single stem of dried pampas grass, warm side light, linen backdrop",
        },
      ],
      settings: [{ key: "Steps", value: "32" }],
    }),
  },
  {
    id: "l12",
    slug: "rooftop-rain-portrait",
    title: "Rooftop rain portrait",
    description: "Night portrait in the rain with city bokeh. Sharp eyes, believable water.",
    creatorId: "c4",
    type: "image",
    ...image("rooftop-rain"),
    tool: "runway",
    toolVersion: "Frames",
    tags: ["portrait", "rain", "night"],
    price: 700,
    pricing: { mode: "single" },
    createdAt: "2026-09-27T10:00:00Z",
    stats: { views: 5200, sales: 45, saves: 390, likes: 1326 },
    trendingScore: 76,
    recipe: recipe({
      prompts: [
        {
          label: "Main",
          text: "Night portrait of a man on a rooftop in heavy rain, city bokeh behind, water droplets on skin, umbrella-less, cinematic teal and amber, 50mm f/1.4",
        },
      ],
      settings: [{ key: "Style", value: "Cinematic" }],
      failures: [{ imageUrl: thumb("fail-rain-1"), note: "Rain froze into streaks. Add 'shutter 1/1000'." }],
    }),
  },
]

export const LISTINGS: Listing[] = [...CARTOON_LISTINGS, ...BASE_LISTINGS]
