/* eslint-disable @next/next/no-img-element */
import { media as wixMedia } from "@wix/sdk";
import { ImgHTMLAttributes } from "react";

type BaseWixImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "width" | "height" | "alt"
> & {
  mediaIdentifier: string | undefined;
  placeholder?: string;
  alt?: string | null | undefined;
};

type ScaledImageProps = BaseWixImageProps & {
  scaleToFill?: true;
  width: number;
  height: number;
};

type UnscaledImageProps = BaseWixImageProps & {
  scaleToFill: false;
};

type WixImageProps = ScaledImageProps | UnscaledImageProps;

export default function WixImage({
  mediaIdentifier,
  placeholder = "/placeholder.png",
  alt,
  ...props
}: WixImageProps) {
  const imageUrl = getImageUrl(
    mediaIdentifier,
    placeholder,
    props as ScaledImageProps,
  );

  return <img src={imageUrl} alt={alt ?? ""} {...props} />;
}

function getImageUrl(
  mediaIdentifier: string | undefined,
  placeholder: string,
  props: ScaledImageProps,
) {
  if (!mediaIdentifier) {
    return placeholder;
  }

  const shouldScaleToFill =
    props.scaleToFill || props.scaleToFill === undefined;

  return shouldScaleToFill
    ? wixMedia.getScaledToFillImageUrl(
        mediaIdentifier,
        props.width,
        props.height,
        {},
      )
    : wixMedia.getImageUrl(mediaIdentifier).url;
}
