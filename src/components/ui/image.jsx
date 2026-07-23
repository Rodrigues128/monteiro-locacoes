import { forwardRef } from "react"

/**
 * @typedef {import("react").ImgHTMLAttributes<HTMLImageElement> & {
 *   fittingType?: "fit" | "fill"
 * }} ImageProps
 */

const Image = forwardRef((
  /** @type {ImageProps} */ { fittingType = "fill", style, ...props },
  /** @type {import("react").ForwardedRef<HTMLImageElement>} */ ref
) => (
  <img
    ref={ref}
    loading="lazy"
    {...props}
    style={{
      objectFit: fittingType === "fit" ? "contain" : "cover",
      ...style,
    }}
  />
))

Image.displayName = "Image"

export { Image }
