// Small UI sounds, synthesised with the Web Audio API (no audio files to load).

let ctx: AudioContext | null = null

function audio() {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null
  ctx ??= new AudioContext()
  // Browsers start the context suspended until a user gesture; likes are gestures
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

function tone(
  ac: AudioContext,
  { from, to, start, duration, volume }: { from: number; to: number; start: number; duration: number; volume: number }
) {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = "sine"
  osc.frequency.setValueAtTime(from, start)
  osc.frequency.exponentialRampToValueAtTime(to, start + duration * 0.5)
  // Quick fade in/out so it never clicks
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** A soft, rising two-note "pop" for likes. Quiet on purpose. */
export function playLikeSound() {
  try {
    const ac = audio()
    if (!ac) return
    const t = ac.currentTime
    tone(ac, { from: 620, to: 1240, start: t, duration: 0.16, volume: 0.06 })
    tone(ac, { from: 1240, to: 1860, start: t + 0.05, duration: 0.14, volume: 0.025 })
  } catch {
    // Audio unavailable: likes still work silently
  }
}
