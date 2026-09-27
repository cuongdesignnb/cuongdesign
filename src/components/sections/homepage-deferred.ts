import type { CSSProperties } from "react";

type HomepageDeferredStyle = CSSProperties & {
  "--home-deferred-mobile-size": string;
  "--home-deferred-desktop-size": string;
};

export interface HomepageDeferredSizes {
  mobile: number;
  desktop: number;
}

export function homepageDeferredSizeStyle(
  mobileSize: number,
  desktopSize: number,
): HomepageDeferredStyle {
  return {
    "--home-deferred-mobile-size": `${Math.ceil(mobileSize)}px`,
    "--home-deferred-desktop-size": `${Math.ceil(desktopSize)}px`,
  };
}

export function homepageServicesDeferredSizes(
  serviceCount: number,
  desktopRowCount: number,
): HomepageDeferredSizes {
  return {
    mobile: Math.max(520, 290 + serviceCount * 390),
    desktop: Math.max(460, 230 + desktopRowCount * 380),
  };
}

export function homepageProjectsDeferredSizes(
  projectCount: number,
): HomepageDeferredSizes {
  if (projectCount === 0) return { mobile: 625, desktop: 480 };

  const desktopRows = Math.ceil(projectCount / 3);
  return {
    mobile: 426 + projectCount * 490 + (projectCount - 1) * 32,
    desktop: 284 + desktopRows * 530 + (desktopRows - 1) * 32,
  };
}

export function homepageProductsDeferredSizes(
  productCount: number,
): HomepageDeferredSizes {
  if (productCount === 0) return { mobile: 200, desktop: 165 };

  const desktopRows = Math.ceil(productCount / 3);
  return {
    mobile: 200 + productCount * 535 + (productCount - 1) * 32,
    desktop: 165 + desktopRows * 565 + (desktopRows - 1) * 32,
  };
}

export function homepageTestimonialsDeferredSizes(
  testimonialCount: number,
): HomepageDeferredSizes {
  return {
    mobile: 190 + testimonialCount * 285,
    desktop: 150 + Math.ceil(testimonialCount / 2) * 260,
  };
}
