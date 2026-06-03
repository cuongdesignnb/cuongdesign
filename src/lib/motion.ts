/**
 * Motion Design Tokens & Shared Animation Configuration
 * ──────────────────────────────────────────────────────
 * Single source of truth for every animation in the app.
 * Import `motionTokens` or individual variants wherever needed.
 */

/* ─── Duration & Easing ─── */
export const motionTokens = {
  duration: {
    fast: 0.2,
    normal: 0.5,
    slow: 0.8,
    hero: 1.2,
  },
  ease: {
    /** Smooth ease-out for reveals */
    out: [0.16, 1, 0.3, 1] as const,
    /** Subtle ease-in-out for hover / loops */
    inOut: [0.65, 0, 0.35, 1] as const,
    /** Snap for fast micro-interactions */
    snap: [0.87, 0, 0.13, 1] as const,
  },
  spring: {
    /** Default spring for reveals */
    gentle: { type: "spring" as const, stiffness: 100, damping: 15, mass: 0.5 },
    /** Bouncy for attention-grabbing */
    bouncy: { type: "spring" as const, stiffness: 400, damping: 10, mass: 0.8 },
    /** Stiff for magnetic / hover depth */
    stiff: { type: "spring" as const, stiffness: 600, damping: 30, mass: 0.5 },
  },
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },
  blur: {
    sm: "4px",
    md: "10px",
    lg: "20px",
  },
} as const;

/* ─── Reusable Framer Motion Variants ─── */

/** Fade up reveal (most common) */
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 40, filter: `blur(${motionTokens.blur.sm})` },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.ease.out,
    },
  },
};

/** Fade in from left */
export const fadeLeftVariants = {
  hidden: { opacity: 0, x: -60, filter: `blur(${motionTokens.blur.sm})` },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.ease.out,
    },
  },
};

/** Fade in from right */
export const fadeRightVariants = {
  hidden: { opacity: 0, x: 60, filter: `blur(${motionTokens.blur.sm})` },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.ease.out,
    },
  },
};

/** Scale up reveal (for cards, images) */
export const scaleUpVariants = {
  hidden: { opacity: 0, scale: 0.9, filter: `blur(${motionTokens.blur.sm})` },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: motionTokens.duration.slow,
      ease: motionTokens.ease.out,
    },
  },
};

/** Stagger container — wraps children that use individual variants */
export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.normal,
      delayChildren: 0.1,
    },
  },
};

/** Fast stagger for grids with many items */
export const staggerFastContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.fast,
      delayChildren: 0.05,
    },
  },
};

/** Hover depth effect for cards */
export const hoverDepthVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.03,
    y: -6,
    transition: motionTokens.spring.stiff,
  },
};
