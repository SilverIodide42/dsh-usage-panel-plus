import type { PropsLocale, SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots';
import { LOCALE_NS } from './locales.ts';
import { type ConversationNodeLike, type PartialAssistantLike, type UseProjection } from './stats-line-core.ts';
/**
 * Structural type for the `useChat` seat: the standard snapshot selector over
 * the ui-chat ChatSnapshot, whose `legacy.nodes` compatibility projection
 * carries the ConversationNode[] the official pills read and whose
 * `legacy.partial` carries the in-flight assistant output. Declared locally
 * because the seat is consumed structurally at runtime (injected by the slot
 * declaration) and never value-imported.
 */
type ChatSnapshotSelectorHook = SnapshotSelectorHook<{
    legacy: {
        nodes?: readonly ConversationNodeLike[];
        partial?: PartialAssistantLike | null;
    };
}>;
/**
 * Full props: the standard session kit (selector + projection seat) plus the
 * locale seat this entry declares. `useChat` is injected by the slot
 * declaration on DSH >= 0.1.2-rc.1.
 */
export interface StatsLineEnhancedProps {
    /** The chat-view snapshot selector (path `legacy.nodes`). */
    useChat: ChatSnapshotSelectorHook;
    useProjection: UseProjection;
    t: PropsLocale<typeof LOCALE_NS>['t'];
}
/**
 * The pre-split whole-row entry: DSH <= 0.2.0-rc.2 exposes ONE
 * `conversation.composer.dock` entry (id 'stats'), so this component owns the
 * row container, the host-container marker, and the two pills' shared
 * exclusive dialog slot. On 0.2.1-alpha.1+ the two entries below replace it.
 */
export declare const StatsLineEnhanced: import("react").NamedExoticComponent<StatsLineEnhancedProps>;
/**
 * The split-mode `activity` dock entry (DSH >= 0.2.1-alpha.1): the gauge pill
 * alone, at the official entry's id so priority -1 shadows it. The host's
 * `.dock` flex row owns the layout the pre-split row used to build, and the
 * `usage` entry mounts as an independent sibling — so this component reads
 * only what its own pill needs, and its dialog state is its own (the seat's
 * outside click closes it when the sibling opens).
 *
 * The empty check is per entry, exactly as the official pill's: the counts
 * pill is gated on settled steps.
 */
export declare const StatsActivityEntry: import("react").NamedExoticComponent<StatsLineEnhancedProps>;
/**
 * The split-mode `usage` dock entry (DSH >= 0.2.1-alpha.1): the database pill
 * alone, at the official entry's id so priority -1 shadows it. Gated on actual
 * token activity, as the official pill is and as the pre-split row's own
 * `hasTokens` did.
 */
export declare const StatsUsageEntry: import("react").NamedExoticComponent<StatsLineEnhancedProps>;
export {};
