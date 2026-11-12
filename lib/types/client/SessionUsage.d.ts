import type { SessionTokenUsage } from '../wire.ts';
import type { UsageStatsTranslator } from './index.tsx';
export interface SessionUsageProps {
    /** The range's session rows, sorted by tokens desc (host order, trusted). */
    sessions: readonly SessionTokenUsage[];
    /** Exact number of distinct sessions in the range (may exceed `sessions`,
     *  but the delta is disclosed rather than silently dropped). */
    sessionCount: number;
    /** Range total tokens — the denominator of every row's share bar. */
    tokens: number;
    /** Requests the host could not attribute to a model; disclosed next to the
     *  section title rather than silently dropped. */
    unknownRequests?: number;
    t: UsageStatsTranslator;
    /** Rank colour of a model ref (the panel's shared model palette), so a row's
     *  accent and its expanded model list agree with the model section. */
    colorForModel?: (model: string) => string;
}
export declare function SessionUsage({ sessions, sessionCount, tokens, unknownRequests, t, colorForModel, }: SessionUsageProps): JSX.Element | null;
