/**
 * The "R" with a four-point star in its bowl (viewBox 0 0 110 122). Plain SVG so
 * it renders both in the app and in ImageResponse icons.
 */
export function LogoGlyph({ fill, width, height }: { fill: string; width?: number | string; height?: number | string }) {
  return (
    <svg viewBox="0 0 110 122" width={width} height={height} aria-hidden>
      <rect x="0" y="0" width="30" height="121" rx="6" fill={fill} />
      <path
        fill={fill}
        fillRule="evenodd"
        d="M35 0H65A43 43 0 0 1 65 86H35Z M67 26Q69 43 86 45Q69 47 67 64Q65 47 48 45Q65 43 67 26Z"
      />
      <path fill={fill} d="M35 88H64L107 116Q109 121 103 122H74L35 94Z" />
    </svg>
  )
}
