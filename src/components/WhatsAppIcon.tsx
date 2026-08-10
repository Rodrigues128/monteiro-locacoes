/**
 * @typedef {{
 *   size?: number,
 *   white?: boolean,
 *   className?: string
 * }} WhatsAppIconProps
 */

export default function WhatsAppIcon(
  /** @type {WhatsAppIconProps} */ {
    size = 20,
    white = false,
    className = "",
  }
) {
  return (
    <img
      src={white ? "/images/whatsapp-white.svg" : "/images/whatsapp.svg"}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  )
}
