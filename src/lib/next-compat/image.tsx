import React from "react";

export function Image({
  src,
  alt = "",
  width,
  height,
  className,
  priority,
  fill,
  ...props
}: {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  [key: string]: any;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
      {...props}
    />
  );
}

export default Image;

