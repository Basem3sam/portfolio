"use client";

import PauseOffscreen from "./PauseOffscreen";
import RouteFlow from "./RouteFlow";
import ScrollbarTone from "./ScrollbarTone";
import ScrollStory from "./ScrollStory";
import SmoothScroll from "./SmoothScroll";

/**
 * The behaviours that polish the page but are not needed to paint it. They are
 * bundled here, away from the root layout's critical JavaScript, and mounted
 * by `DeferredBehaviors` once the page is idle or the visitor first interacts.
 *
 * Order matters and is unchanged from when they sat in the layout: Lenis
 * (`SmoothScroll`) registers itself before `ScrollStory` asks for it.
 *
 * What stays in the layout on purpose (see app/[lang]/layout.tsx):
 *   - PerfGovernor: its verdict must be in place before these read it.
 *   - ThemeEffects: theme correctness and the theme hotkey.
 *   - ScrollManager: hash landings and in-page anchor offsets; deferring it
 *     would make a `/#work` arrival jump late.
 *   - RevealOnScroll: it hides `[data-reveal]` elements, and doing that late
 *     would flash content that had already painted.
 */
export default function IdleBehaviors() {
  return (
    <>
      <SmoothScroll />
      <ScrollStory />
      <RouteFlow />
      <ScrollbarTone />
      <PauseOffscreen />
    </>
  );
}
