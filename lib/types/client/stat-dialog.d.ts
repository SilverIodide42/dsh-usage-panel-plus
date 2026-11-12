/**
 * One trigger-anchored stat dialog seat for the composer-dock pills.
 * Replicates the official ui-chat stat-dialog.ts: open state (optionally
 * controlled so sibling dialogs share one exclusive slot), viewport-clamped
 * placement above the trigger, outside-pointer close, and Escape close.
 *
 * The document-level capture-phase `click` close is what keeps at most one
 * dialog open once each pill owns its own state (DSH 0.2.1-alpha.1 split the
 * dock row into one entry per pill, so the shared controlled slot is only
 * reachable from the pre-split single-entry row). A mouse click on a sibling
 * pill is outside this trigger AND this panel, so this listener closes the
 * incumbent during the capture phase — before the sibling's own onClick
 * bubble handler opens it. Keyboard activation of a sibling pill never
 * stacks a second dialog either, because the sibling's root is outside this
 * one. All imports are platform externals (react + primitives), so the
 * client-bundle purity gate accepts this module.
 */
import { type CSSProperties, type MutableRefObject } from 'react';
/**
 * Unplaced portal panel: hidden but laid out so the clamp measures real
 * dimensions (the `useAnchoredPosition` measure pass).
 */
export declare const MEASURE_STYLE: CSSProperties;
/** Open state, refs, and clamped placement for one stat dialog. */
export interface StatDialogSeat {
    open: boolean;
    setOpen: (open: boolean) => void;
    rootRef: MutableRefObject<HTMLSpanElement | null>;
    panelRef: MutableRefObject<HTMLDivElement | null>;
    pos: CSSProperties | null;
}
/**
 * One trigger-anchored dialog seat: open state, viewport-clamped placement,
 * outside-close.
 * @param controlled - external open state; when given the seat reads and
 *   writes it instead of owning its own, letting sibling dialogs share one
 *   exclusive slot (the pre-split single-entry row).
 */
export declare function useStatDialog(controlled?: Pick<StatDialogSeat, 'open' | 'setOpen'>): StatDialogSeat;
