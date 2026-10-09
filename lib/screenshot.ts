// Website previews: a screenshot of the hero and about half of the next section,
// taken by Microlink (free tier: 25 a day per visitor, no key; runs from the browser).

const WIDTH = 1280
/** 1.5 screens of a 800px-tall desktop window */
const HEIGHT = 1200

export class ScreenshotError extends Error {}

/** Capture `url` and return the image. Takes ~5–15 s. */
export async function captureWebsite(url: string): Promise<Blob> {
  const api = new URL("https://api.microlink.io/")
  api.searchParams.set("url", url)
  api.searchParams.set("screenshot", "true")
  api.searchParams.set("meta", "false")
  api.searchParams.set("type", "jpeg")
  api.searchParams.set("viewport.width", String(WIDTH))
  api.searchParams.set("viewport.height", String(HEIGHT))
  api.searchParams.set("viewport.deviceScaleFactor", "1")
  // Let client-rendered sites (Lovable, Framer…) paint and play their intro first
  api.searchParams.set("waitForTimeout", "1500")

  let res: Response
  try {
    res = await fetch(api)
  } catch {
    throw new ScreenshotError("We couldn't reach the preview service. Check your connection and try again.")
  }
  if (res.status === 429) {
    throw new ScreenshotError("Too many previews for now. Try again in a little while.")
  }
  const body = (await res.json().catch(() => null)) as {
    status?: string
    message?: string
    data?: { screenshot?: { url?: string } }
  } | null
  const shot = body?.data?.screenshot?.url
  if (!res.ok || body?.status !== "success" || !shot) {
    throw new ScreenshotError("We couldn't open that site. Check the link is public and try again.")
  }
  const image = await fetch(shot).catch(() => null)
  if (!image?.ok) throw new ScreenshotError("The preview didn't load. Try again.")
  return image.blob()
}
