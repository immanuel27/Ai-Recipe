import Image from "next/image"

/**
 * next/image wrapper that skips optimisation for local uploads (data:/blob:)
 * which the optimiser can't fetch.
 */
export function MediaImage({
  src,
  alt,
  ...props
}: Omit<React.ComponentProps<typeof Image>, "src"> & { src: string }) {
  const local = src.startsWith("data:") || src.startsWith("blob:")
  return <Image src={src} alt={alt} unoptimized={local} {...props} />
}
