/**
 * Deferred mounts its children only once their placeholder comes within one
 * viewport-and-a-bit of the reader, so the first paint of the panel does not
 * build every chart and list at once (the trend's SVG, the session rows, both
 * rings and their detail lists all compose in one synchronous commit today).
 *
 * The placeholder is a fixed-height skeleton with the same footprint, so the
 * page does not jump when the real content replaces it. It is `aria-hidden`
 * and empty: the sections that own the real content announce themselves when
 * they mount, and a screen reader has nothing useful to say about a spacer.
 *
 * Server rendering and the test environment have no IntersectionObserver;
 * there the children render immediately (deferring nothing is always correct,
 * just less eager), which is also why a host rendering the panel to static
 * HTML cannot end up with a permanent skeleton.
 */
import { type ReactNode } from 'react';
export interface DeferredProps {
    children: ReactNode;
    /** Height the placeholder reserves, in px. Roughly the height of the
     *  deferred sections, so the scrollbar and the trigger point stay stable. */
    placeholderHeight?: number;
    /** How far OUTSIDE the viewport the placeholder may sit and still mount, in
     *  px. Wide enough that scrolling normally finds the content already built
     *  (no pop), narrow enough that the first paint stays cheap. */
    rootMarginPx?: number;
}
export declare function Deferred({ children, placeholderHeight, rootMarginPx }: DeferredProps): JSX.Element;
