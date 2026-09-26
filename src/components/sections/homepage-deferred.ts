import type { CSSProperties } from "react";

type HomepageDeferredStyle = CSSProperties & {
  "--home-deferred-mobile-size": string;
  "--home-deferred-desktop-size": string;
};

export function homepageDeferredSizeStyle(
  mobileSize: number,
  desktopSize: number,
): HomepageDeferredStyle {
  return {
    "--home-deferred-mobile-size": `${Math.ceil(mobileSize)}px`,
    "--home-deferred-desktop-size": `${Math.ceil(desktopSize)}px`,
  };
}
