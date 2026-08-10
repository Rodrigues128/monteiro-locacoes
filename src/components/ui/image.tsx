import { forwardRef, type ImgHTMLAttributes } from "react";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fittingType?: "fit" | "fill";
};

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ fittingType = "fill", style, ...props }, ref) => (
    <img
      ref={ref}
      loading="lazy"
      {...props}
      style={{
        objectFit: fittingType === "fit" ? "contain" : "cover",
        ...style,
      }}
    />
  ),
);

Image.displayName = "Image";

export { Image };
