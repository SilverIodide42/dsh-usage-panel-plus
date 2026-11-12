window.__ModuleLoader__.load({
	id: "dsh-external/dsh-usage-panel-plus",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		let react_dom = require("react-dom");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/shared/src/utils.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
		const mergeClasses = (...classes) => classes.filter((className, index, array) => {
			return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
		}).join(" ").trim();
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/defaultAttributes.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		var defaultAttributes = {
			xmlns: "http://www.w3.org/2000/svg",
			width: 24,
			height: 24,
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 2,
			strokeLinecap: "round",
			strokeLinejoin: "round"
		};
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/Icon.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const Icon = (0, react.forwardRef)(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
			return (0, react.createElement)("svg", {
				ref,
				...defaultAttributes,
				width: size,
				height: size,
				stroke: color,
				strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
				className: mergeClasses("lucide", className),
				...rest
			}, [...iconNode.map(([tag, attrs]) => (0, react.createElement)(tag, attrs)), ...Array.isArray(children) ? children : [children]]);
		});
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/createLucideIcon.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const createLucideIcon = (iconName, iconNode) => {
			const Component = (0, react.forwardRef)(({ className, ...props }, ref) => (0, react.createElement)(Icon, {
				ref,
				iconNode,
				className: mergeClasses(`lucide-${toKebabCase(iconName)}`, className),
				...props
			}));
			Component.displayName = `${iconName}`;
			return Component;
		};
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/activity.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const Activity = createLucideIcon("Activity", [["path", {
			d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",
			key: "169zse"
		}]]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/arrow-left.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const ArrowLeft = createLucideIcon("ArrowLeft", [["path", {
			d: "m12 19-7-7 7-7",
			key: "1l729n"
		}], ["path", {
			d: "M19 12H5",
			key: "x3x0zl"
		}]]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/calendar-days.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const CalendarDays = createLucideIcon("CalendarDays", [
			["path", {
				d: "M8 2v4",
				key: "1cmpym"
			}],
			["path", {
				d: "M16 2v4",
				key: "4m81vk"
			}],
			["rect", {
				width: "18",
				height: "18",
				x: "3",
				y: "4",
				rx: "2",
				key: "1hopcy"
			}],
			["path", {
				d: "M3 10h18",
				key: "8toen8"
			}],
			["path", {
				d: "M8 14h.01",
				key: "6423bh"
			}],
			["path", {
				d: "M12 14h.01",
				key: "1etili"
			}],
			["path", {
				d: "M16 14h.01",
				key: "1gbofw"
			}],
			["path", {
				d: "M8 18h.01",
				key: "lrp35t"
			}],
			["path", {
				d: "M12 18h.01",
				key: "mhygvu"
			}],
			["path", {
				d: "M16 18h.01",
				key: "kzsmim"
			}]
		]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/chevron-down.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const ChevronDown = createLucideIcon("ChevronDown", [["path", {
			d: "m6 9 6 6 6-6",
			key: "qrunsl"
		}]]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/chevron-right.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const ChevronRight = createLucideIcon("ChevronRight", [["path", {
			d: "m9 18 6-6-6-6",
			key: "mthhwq"
		}]]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/coins.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const Coins = createLucideIcon("Coins", [
			["circle", {
				cx: "8",
				cy: "8",
				r: "6",
				key: "3yglwk"
			}],
			["path", {
				d: "M18.09 10.37A6 6 0 1 1 10.34 18",
				key: "t5s6rm"
			}],
			["path", {
				d: "M7 6h1v4",
				key: "1obek4"
			}],
			["path", {
				d: "m16.71 13.88.7.71-2.82 2.82",
				key: "1rbuyh"
			}]
		]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/cpu.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const Cpu = createLucideIcon("Cpu", [
			["rect", {
				width: "16",
				height: "16",
				x: "4",
				y: "4",
				rx: "2",
				key: "14l7u7"
			}],
			["rect", {
				width: "6",
				height: "6",
				x: "9",
				y: "9",
				rx: "1",
				key: "5aljv4"
			}],
			["path", {
				d: "M15 2v2",
				key: "13l42r"
			}],
			["path", {
				d: "M15 20v2",
				key: "15mkzm"
			}],
			["path", {
				d: "M2 15h2",
				key: "1gxd5l"
			}],
			["path", {
				d: "M2 9h2",
				key: "1bbxkp"
			}],
			["path", {
				d: "M20 15h2",
				key: "19e6y8"
			}],
			["path", {
				d: "M20 9h2",
				key: "19tzq7"
			}],
			["path", {
				d: "M9 2v2",
				key: "165o2o"
			}],
			["path", {
				d: "M9 20v2",
				key: "i2bqo8"
			}]
		]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/database.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const Database = createLucideIcon("Database", [
			["ellipse", {
				cx: "12",
				cy: "5",
				rx: "9",
				ry: "3",
				key: "msslwz"
			}],
			["path", {
				d: "M3 5V19A9 3 0 0 0 21 19V5",
				key: "1wlel7"
			}],
			["path", {
				d: "M3 12A9 3 0 0 0 21 12",
				key: "mv7ke4"
			}]
		]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/message-square.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const MessageSquare = createLucideIcon("MessageSquare", [["path", {
			d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
			key: "1lielz"
		}]]);
		//#endregion
		//#region node_modules/.pnpm/lucide-react@0.454.0_react@18.3.1/node_modules/lucide-react/dist/esm/icons/messages-square.js
		/**
		* @license lucide-react v0.454.0 - ISC
		*
		* This source code is licensed under the ISC license.
		* See the LICENSE file in the root directory of this source tree.
		*/
		const MessagesSquare = createLucideIcon("MessagesSquare", [["path", {
			d: "M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z",
			key: "p1xzt8"
		}], ["path", {
			d: "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1",
			key: "1cx29u"
		}]]);
		//#endregion
		//#region node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region src/client/api.ts
		/** One wire failure. */
		var UsageApiError = class extends Error {
			code;
			constructor(code, message) {
				super(message);
				this.code = code;
			}
		};
		async function post(method, body) {
			let res;
			try {
				res = await fetch(`usage-panel-plus/api/${method}`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: body === void 0 ? void 0 : JSON.stringify(body)
				});
			} catch (err) {
				throw new UsageApiError("network", err instanceof Error ? err.message : String(err));
			}
			let json;
			try {
				json = await res.json();
			} catch {
				throw new UsageApiError("bad-response", `unexpected response from /usage-panel-plus/api/${method}`);
			}
			const wire = json;
			if (!wire || wire.ok !== true) {
				const failure = wire;
				throw new UsageApiError(failure?.error?.code ?? "error", failure?.error?.message ?? "usage api error");
			}
			return wire.value;
		}
		/** Aggregate the usage panel renders for one range. */
		async function fetchRange(req) {
			return post("range", req);
		}
		/** Module-level response cache. The panel remounts on every panel switch and
		*  re-reads the aggregate on every range flip; the host's aggregation walks
		*  the whole store, so a short TTL removes the worst of that repeat work
		*  without ever serving data the reader would call stale. */
		const rangeCache = /* @__PURE__ */ new Map();
		/** Stable cache key: the request's own fields in a fixed order, so a
		*  `{range, from, to}` posted by two call sites always hits one entry. */
		function rangeCacheKey(req) {
			return JSON.stringify([
				req.range,
				req.from ?? "",
				req.to ?? ""
			]);
		}
		/** {@link fetchRange} through the short TTL cache. */
		async function fetchRangeCached(req, options = {}) {
			const key = rangeCacheKey(req);
			if (options.noCache !== true) {
				const hit = rangeCache.get(key);
				if (hit !== void 0 && Date.now() - hit.at < 2e4) return hit.value;
			}
			const value = await fetchRange(req);
			rangeCache.set(key, {
				at: Date.now(),
				value
			});
			return value;
		}
		/** Drop every cached range. The rebuild wipes the store and replays the logs,
		*  so every cached aggregate describes data that no longer exists. */
		function clearRangeCache() {
			rangeCache.clear();
		}
		/** Rebuild the statistics from the session logs. The host wipes every row plus
		*  the backfill cursor and replays all persisted sessions under the current
		*  attribution rules, so a drifted store converges back onto the logs; it
		*  refuses (409) only while a boot scan is still running. */
		async function rebuildStats() {
			const status = await post("reset", {});
			clearRangeCache();
			return status;
		}
		//#endregion
		//#region src/shared.ts
		/** All local-calendar day keys in [from, to], inclusive. Invalid or reversed
		*  bounds yield an empty list. */
		function daysInRange(from, to) {
			const out = [];
			const start = /* @__PURE__ */ new Date(`${from}T00:00:00`);
			const end = /* @__PURE__ */ new Date(`${to}T00:00:00`);
			if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return out;
			for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
				const y = d.getFullYear();
				const m = String(d.getMonth() + 1).padStart(2, "0");
				const day = String(d.getDate()).padStart(2, "0");
				out.push(`${y}-${m}-${day}`);
			}
			return out;
		}
		/** model refs are "provider/model"; a bare model name has no slash and is
		*  attributed to provider "default". */
		function providerOf(modelRef) {
			const i = modelRef.indexOf("/");
			if (i > 0) return modelRef.slice(0, i);
			return "default";
		}
		/** The display name of a model ref: the part after the provider slash
		*  ("deepseek-chat" of "deepseek/deepseek-chat"); a bare name is unchanged. */
		function modelNameOf(modelRef) {
			const i = modelRef.indexOf("/");
			if (i > 0) return modelRef.slice(i + 1);
			return modelRef;
		}
		//#endregion
		//#region src/client/format.ts
		/** Exact token counts with thousands separators — no 万/亿/k/M units, the
		*  user reads the precise number (long values shrink to fit via FitText).
		*  Compact units stay on the axis labels and card sub-values only. */
		function formatTokens(n) {
			return n.toLocaleString("en-US");
		}
		/** English-style compact (B/M/K) for axis labels and card sub-values. */
		function formatCompact(n) {
			if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
			if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
			if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
			return String(n);
		}
		function formatPercent(p) {
			return (Math.round(p * 10) / 10).toFixed(1) + "%";
		}
		/**
		* Compare two aggregates for the cards' delta badge.
		*
		* Every way the arithmetic can fail is folded into `null` (render no badge)
		* rather than leaking `NaN` / `Infinity` into the UI: a missing side (an old
		* host without `previous`, a rate with no input tokens at all) has nothing to
		* compare, and a previous window of 0 can only report "all new" — dividing by
		* it would print `Infinity%`.
		* @param current - this window's value, or null when it is undefined (a 0/0 rate).
		* @param previous - the preceding window's value, or null likewise.
		* @returns the change to render, or null when there is nothing honest to show.
		*/
		function compareChange(current, previous) {
			if (current === null || previous === null) return null;
			if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
			if (previous <= 0) {
				if (current <= 0) return null;
				return {
					direction: "new",
					percent: 0
				};
			}
			const raw = (current - previous) / previous * 100;
			if (!Number.isFinite(raw)) return null;
			const percent = Math.round(Math.abs(raw) * 10) / 10;
			return {
				direction: raw > 0 ? "up" : raw < 0 ? "down" : "flat",
				percent
			};
		}
		/** Period-over-period change for the SESSION-COUNT card.
		*
		*  The session dimension is reconstructed from session logs, so it only
		*  covers conversations whose logs still exist. A previous window that
		*  carries real token volume but zero session rows therefore means "the
		*  session dimension cannot be reconstructed there" (the old logs were
		*  deleted) — claiming everything is "new" would be a lie, so no badge is
		*  rendered for that window.
		* @param current - this window's session count.
		* @param previous - the preceding window's comparison aggregate, or null.
		* @returns the change to render, or null when the comparison is not honest.
		*/
		function compareSessions(current, previous) {
			if (previous === null) return null;
			if (previous.sessions <= 0 && previous.tokens > 0) return null;
			return compareChange(current, previous.sessions);
		}
		/** Prompt-cache hit ratio as 0..100 from cached/missed input tokens, or null
		*  when there is no usage to judge (0/0). */
		function cacheRate(hit, miss) {
			const total = hit + miss;
			if (total <= 0) return null;
			return hit / total * 100;
		}
		/** Format a hit ratio for display; no data renders as "—". */
		function cacheRateText(hit, miss) {
			const r = cacheRate(hit, miss);
			return r === null ? "—" : formatPercent(r);
		}
		/** Today's local date (plus/minus offsetDays) in "YYYY-MM-DD". */
		function localDay(offsetDays) {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() + offsetDays);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		}
		/** 0 = Monday … 6 = Sunday (GitHub-style heatmap rows). */
		function indexOfDay(day) {
			return ((/* @__PURE__ */ new Date(day + "T00:00:00")).getDay() + 6) % 7;
		}
		function shortDay(day) {
			const parts = day.split("-");
			const m = parts[1];
			const d = parts[2];
			return `${Number(m)}/${Number(d)}`;
		}
		/** A session id shortened for a row label: the `session-` prefix stays (it is
		*  how the log names the id), the opaque tail collapses to its first four
		*  characters. A bare UUID — the older id shape — keeps its first eight.
		*  The full id always rides the row's `title` attribute. */
		function shortSessionId(session) {
			const prefix = session.startsWith("session-") ? "session-" : "";
			const rest = session.slice(prefix.length);
			const head = rest.slice(0, prefix === "" ? 8 : 4);
			return rest.length > head.length ? `${prefix}${head}…` : `${prefix}${head}`;
		}
		/** A short local date from epoch milliseconds: `MM-DD` inside the current
		*  calendar year, `YYYY-MM-DD` outside it (the year is redundant noise for a
		*  range this recent). 0 / a non-date renders as an em dash — the "no sample
		*  in range" case. */
		function shortDate(ms, now = /* @__PURE__ */ new Date()) {
			if (!Number.isFinite(ms) || ms <= 0) return "—";
			const d = new Date(ms);
			const time = d.getTime();
			if (!Number.isFinite(time)) return "—";
			const mm = String(d.getMonth() + 1).padStart(2, "0");
			const dd = String(d.getDate()).padStart(2, "0");
			return d.getFullYear() === now.getFullYear() ? `${mm}-${dd}` : `${d.getFullYear()}-${mm}-${dd}`;
		}
		/** A local wall-clock `HH:MM:SS` — the "updated at" stamp under the panel. */
		function clockTime(d) {
			return [
				d.getHours(),
				d.getMinutes(),
				d.getSeconds()
			].map((n) => String(n).padStart(2, "0")).join(":");
		}
		/** A local `YYYY-MM-DD HH:MM:SS` for CSV rows (readable in Excel); the
		*  same 0 / invalid rule as {@link shortDate}, but an empty cell. */
		function dateTimeText(ms) {
			if (!Number.isFinite(ms) || ms <= 0) return "";
			const d = new Date(ms);
			if (!Number.isFinite(d.getTime())) return "";
			const mm = String(d.getMonth() + 1).padStart(2, "0");
			const dd = String(d.getDate()).padStart(2, "0");
			return `${d.getFullYear()}-${mm}-${dd} ${clockTime(d)}`;
		}
		/** X-axis label for a trend bucket key. Day mode keeps the short date; hour
		*  mode names the day at 00:00 (so a three-day span keeps its day boundaries
		*  readable) and the hour everywhere else. */
		function bucketAxisLabel(key, granularity) {
			if (granularity === "day") return shortDay(key);
			const hour = key.slice(11, 13);
			return hour === "00" ? shortDay(key.slice(0, 10)) : `${hour}:00`;
		}
		/** Tooltip title for a trend bucket key: the date in day mode, date + hour
		*  in hour mode. */
		function bucketTitle(key, granularity) {
			return granularity === "hour" ? `${key.slice(0, 10)} ${key.slice(11, 13)}:00` : key;
		}
		/** model refs are "provider/model"; a bare model name has no slash.
		*  (Re-exported from ../shared.ts at the top of this file.) */
		/** Build a Catmull-Rom spline through the points (converted to cubic
		*  Beziers) so the hit-rate line reads as a smooth curve across data-less
		*  days instead of breaking into segments. */
		function smoothPath(pts) {
			if (pts.length === 0) return "";
			const first = pts[0];
			if (pts.length === 1) return `M ${first.x} ${first.y}`;
			let d = `M ${first.x} ${first.y}`;
			for (let i = 0; i < pts.length - 1; i++) {
				const p0 = pts[i - 1] ?? pts[i];
				const p1 = pts[i];
				const p2 = pts[i + 1];
				const p3 = pts[i + 2] ?? p2;
				const c1x = p1.x + (p2.x - p0.x) / 6;
				const c1y = p1.y + (p2.y - p0.y) / 6;
				const c2x = p2.x - (p3.x - p1.x) / 6;
				const c2y = p2.y - (p3.y - p1.y) / 6;
				d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
			}
			return d;
		}
		/** Nice axis ticks: 1/2/5 × 10^k steps covering [step, max]. Non-positive
		*  maxima produce no ticks (guards the log10 against 0/NaN and the loop
		*  against a zero step). */
		function niceTicks(max, count) {
			if (!(max > 0) || !(count > 0) || !Number.isFinite(max)) return [];
			const raw = max / count;
			const mag = Math.pow(10, Math.floor(Math.log10(raw)));
			const norm = raw / mag;
			const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
			if (!(step > 0)) return [];
			const out = [];
			for (let v = step; v <= max; v += step) out.push(v);
			return out;
		}
		//#endregion
		//#region src/client/csv.ts
		/** Every column, in the order the sheet shows them. The per-scope shapes are
		*  subsets of this list (see the {@link CSV_ROW_FIELDS} table below). */
		const CSV_COLUMNS = [
			"scope",
			"from",
			"to",
			"tokens",
			"requests",
			"turns",
			"sessionCount",
			"activeDays",
			"cacheHit",
			"cacheMiss",
			"day",
			"total",
			"model",
			"provider",
			"percent",
			"session",
			"title",
			"lastSeen",
			"topModel"
		];
		/** The columns each scope fills. Kept as data (not code) so the export and
		*  the tests read the same contract. */
		const CSV_ROW_FIELDS = {
			summary: [
				"from",
				"to",
				"tokens",
				"requests",
				"turns",
				"sessionCount",
				"activeDays",
				"cacheHit",
				"cacheMiss"
			],
			day: [
				"day",
				"total",
				"requests",
				"turns",
				"cacheHit",
				"cacheMiss"
			],
			model: [
				"model",
				"provider",
				"tokens",
				"percent"
			],
			provider: [
				"provider",
				"tokens",
				"percent"
			],
			session: [
				"session",
				"title",
				"tokens",
				"requests",
				"turns",
				"lastSeen",
				"topModel"
			]
		};
		/** Render one cell, quoting it when it carries a delimiter, a quote or a line
		*  break — Excel's own CSV dialect (RFC 4180): double the quotes, wrap the
		*  cell. Titles routinely carry commas and quotes, so this is not optional. */
		function cell(value) {
			if (value === null || value === void 0) return "";
			const text = String(value);
			return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
		}
		/** One data row: the scope, then every column in {@link CSV_COLUMNS} order.
		*  A value the scope does not own is dropped even if the caller passed it, so
		*  a shape mistake can never widen a row. */
		function row(scope, values) {
			const owned = new Set(CSV_ROW_FIELDS[scope]);
			return CSV_COLUMNS.map((column) => column === "scope" ? scope : owned.has(column) ? values[column] : void 0).map(cell).join(",");
		}
		/** A percentage rounded to one decimal: the same precision the UI shows,
		*  kept numeric so a spreadsheet can average the column. */
		function percentValue(percent) {
			if (!Number.isFinite(percent)) return "";
			return String(Math.round(percent * 10) / 10);
		}
		/**
		* Build the CSV text for one aggregate (BOM NOT included — the caller prefixes
		* it at download time; see {@link CSV_BOM}).
		* @param stats - the range aggregate the panel currently renders.
		* @returns the CSV body, rows separated by CRLF (the line ending Excel and
		*   every Windows spreadsheet expects).
		*/
		function buildCsv(stats) {
			const lines = [CSV_COLUMNS.join(",")];
			lines.push(row("summary", {
				from: stats.from,
				to: stats.to,
				tokens: stats.tokens,
				requests: stats.requests,
				turns: stats.turns,
				sessionCount: stats.sessionCount,
				activeDays: stats.activeDays,
				cacheHit: stats.cacheHit,
				cacheMiss: stats.cacheMiss
			}));
			for (const bucket of stats.daily) lines.push(row("day", {
				day: bucket.day,
				total: bucket.total,
				requests: bucket.requests,
				turns: bucket.turns,
				cacheHit: bucket.cacheHit,
				cacheMiss: bucket.cacheMiss
			}));
			for (const model of stats.models) lines.push(row("model", {
				model: model.model,
				provider: model.provider,
				tokens: model.tokens,
				percent: percentValue(model.percent)
			}));
			for (const provider of stats.providers) lines.push(row("provider", {
				provider: provider.provider,
				tokens: provider.tokens,
				percent: percentValue(provider.percent)
			}));
			for (const session of stats.sessions ?? []) lines.push(row("session", {
				session: session.session,
				title: session.title,
				tokens: session.tokens,
				requests: session.requests,
				turns: session.turns,
				lastSeen: dateTimeText(session.lastSeen),
				topModel: session.models[0]?.model ?? ""
			}));
			return lines.join("\r\n");
		}
		/** The download name for one aggregate: `dsh-usage-<from>_<to>.csv`. The
		*  range is already ISO (`YYYY-MM-DD`), so the name sorts chronologically. */
		function csvFileName(stats) {
			return `dsh-usage-${stats.from}_${stats.to}.csv`;
		}
		/** The MIME type of the exported file. The charset declaration is what makes
		*  the browser hand Excel a UTF-8 document even on a locale-default code page. */
		const CSV_MIME = "text/csv;charset=utf-8";
		//#endregion
		//#region dsh-css
		const css$1 = ".-hpfpa_page{box-sizing:border-box;height:100%;color:var(--dsw-alias-label-primary);flex-direction:column;align-items:center;padding:0 clamp(24px,4vw,48px) 48px;display:flex;overflow:auto}.-hpfpa_page>*{width:100%;max-width:960px}.-hpfpa_backRow{box-sizing:border-box;margin-bottom:18px;padding-top:28px;display:flex}.-hpfpa_back{align-items:center;gap:6px;display:inline-flex}.-hpfpa_panel{--usage-radius-frame:10px;--usage-radius-inner:6px;--usage-radius-bar:2px;--usage-radius-swatch:2px;--usage-row-height:36px;--usage-row-pad-x:12px;--usage-row-gap:8px;--usage-swatch:10px;--usage-font-body:13px;--usage-font-meta:11px;--usage-font-title:15px;--usage-ink-value:var(--dsw-alias-label-primary);--usage-ink-label:var(--dsw-alias-label-secondary);--usage-ink-meta:var(--dsw-alias-label-tertiary);--usage-hairline:1px solid var(--dsw-alias-border-l1);--usage-fill-frame:var(--dsw-alias-bg-layer-1);--usage-fill-inset:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 55%, transparent);flex-direction:column;gap:18px;min-width:0;display:flex}.-hpfpa_toolbar{flex-wrap:wrap;align-items:center;gap:10px;display:flex}.-hpfpa_group{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--usage-radius-frame);background:var(--usage-fill-frame);flex-wrap:nowrap;flex:0 auto;align-items:center;gap:2px;min-width:0;padding:3px;display:inline-flex}.-hpfpa_segItem{border-radius:var(--usage-radius-inner);font-variant-numeric:tabular-nums;text-align:center;min-width:34px}.-hpfpa_segItem:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.-hpfpa_segActive,.-hpfpa_segActive:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}.-hpfpa_customRange{align-items:center;gap:6px;display:inline-flex}.-hpfpa_dateInput{flex:none;width:150px}@media (width<=720px){.-hpfpa_customRange{flex-wrap:wrap}.-hpfpa_dateInput{width:138px}}.-hpfpa_customSep{color:var(--dsw-alias-label-tertiary)}.-hpfpa_actions{flex-wrap:nowrap;flex:none;align-items:center;gap:10px;margin-left:auto;display:inline-flex}.-hpfpa_refresh,.-hpfpa_rebuild{flex:none;min-width:92px}.-hpfpa_rebuildArmed,.-hpfpa_rebuildArmed:hover:not(:disabled){color:var(--dsw-alias-state-error-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 8%, transparent);--dsw-alias-interactive-bg-hover:color-mix(in srgb, var(--dsw-alias-state-error-primary) 14%, transparent)}.-hpfpa_errorBanner{border:1px solid var(--dsw-alias-state-warn-primary);border-radius:var(--usage-radius-frame);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);color:var(--dsw-alias-state-warn-label);font-size:var(--usage-font-body);padding:10px 14px}.-hpfpa_loading{text-align:center;color:var(--usage-ink-meta);font-size:var(--usage-font-body);padding:24px}.-hpfpa_empty{text-align:center;color:var(--usage-ink-meta);font-size:var(--usage-font-body);border:1px dashed var(--dsw-alias-border-l2);border-radius:var(--usage-radius-frame);padding:24px}.-hpfpa_progressBar{border-radius:var(--usage-radius-bar);background:color-mix(in srgb, var(--dsw-alias-border-l2) 55%, transparent);height:2px;position:relative;overflow:hidden}.-hpfpa_progressBar:after{content:\"\";border-radius:var(--usage-radius-bar);background:var(--dsw-alias-label-primary);width:40%;animation:-hpfpa_usageBarSlide 1.1s var(--ds-ease-in-out) infinite;position:absolute;inset-block:0}@keyframes -hpfpa_usageBarSlide{0%{inset-inline-start:-40%}to{inset-inline-start:100%}}@media (prefers-reduced-motion:reduce){.-hpfpa_progressBar:after{animation:none;inset-inline-start:30%}}.-hpfpa_errorBannerRow{align-items:flex-start;gap:10px;display:flex}.-hpfpa_errorBannerText{overflow-wrap:anywhere;flex:auto;min-width:0}.-hpfpa_errorRetry{flex:none;margin-block-start:-2px}.-hpfpa_customHint{color:var(--usage-ink-meta);font-size:var(--usage-font-meta);margin-block-start:-2px}.-hpfpa_cards{grid-template-columns:1.3fr repeat(4,1fr) 1.3fr;gap:10px;display:grid}@media (width<=720px){.-hpfpa_cards{grid-template-columns:repeat(4,1fr)}.-hpfpa_cards>:first-child,.-hpfpa_cards>:last-child{grid-column:span 2}}@media (width<=430px){.-hpfpa_cards{grid-template-columns:repeat(2,1fr)}}.-hpfpa_card{border:var(--usage-hairline);border-radius:var(--usage-radius-frame);background:var(--usage-fill-frame);flex-direction:column;gap:6px;min-width:0;padding:12px 14px;display:flex}.-hpfpa_cardHead{align-items:center;gap:6px;display:flex}.-hpfpa_cardIcon{color:var(--usage-ink-meta);flex:none}.-hpfpa_cardLabel{color:var(--usage-ink-label);font-size:var(--usage-font-body);text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.-hpfpa_cardValue{color:var(--usage-ink-value);font-weight:600;line-height:1.15}.-hpfpa_cardValueSm{font-size:14px}.-hpfpa_cardValueWrap{word-break:break-word}.-hpfpa_cardModelLines{flex-direction:column;gap:1px;min-width:0;display:flex}.-hpfpa_cardSub{color:var(--usage-ink-meta);font-size:var(--usage-font-meta);text-overflow:ellipsis;white-space:nowrap;min-width:0;line-height:1.2;overflow:hidden}.-hpfpa_cardFoot{justify-content:space-between;align-items:baseline;gap:8px;min-height:14px;margin-top:auto;display:flex}.-hpfpa_section{flex-direction:column;gap:10px;min-width:0;display:flex}.-hpfpa_sectionHead{flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px;display:flex}.-hpfpa_sectionTitle{font-size:var(--usage-font-title);color:var(--usage-ink-value);margin:0;font-weight:600}.-hpfpa_trendNote{font-size:var(--usage-font-body);color:var(--usage-ink-meta)}.-hpfpa_chartWrap{min-width:0;position:relative}.-hpfpa_heatWrap{min-width:0;position:relative;overflow:hidden}.-hpfpa_heatmap{display:block;transform:translateZ(0)}.-hpfpa_heatLegend{font-size:var(--usage-font-body);color:var(--usage-ink-meta);align-items:center;gap:3px;display:inline-flex}.-hpfpa_heatCell{filter:drop-shadow(0 -.5px 0 var(--dsw-heat-sheen)) drop-shadow(0 .5px .8px var(--dsw-heat-shade));border-radius:3px;display:inline-block}.-hpfpa_heatLevel0{fill:color-mix(in srgb, var(--dsw-heat-0) 82%, transparent);background:color-mix(in srgb, var(--dsw-heat-0) 82%, transparent)}.-hpfpa_heatLevel1{fill:color-mix(in srgb, var(--dsw-heat-1) 82%, transparent);background:color-mix(in srgb, var(--dsw-heat-1) 82%, transparent)}.-hpfpa_heatLevel2{fill:color-mix(in srgb, var(--dsw-heat-2) 82%, transparent);background:color-mix(in srgb, var(--dsw-heat-2) 82%, transparent)}.-hpfpa_heatLevel3{fill:color-mix(in srgb, var(--dsw-heat-3) 82%, transparent);background:color-mix(in srgb, var(--dsw-heat-3) 82%, transparent)}.-hpfpa_heatLevel4{fill:color-mix(in srgb, var(--dsw-heat-4) 82%, transparent);background:color-mix(in srgb, var(--dsw-heat-4) 82%, transparent)}.-hpfpa_heatLevel5{fill:color-mix(in srgb, var(--dsw-heat-5) 82%, transparent);background:color-mix(in srgb, var(--dsw-heat-5) 82%, transparent)}.-hpfpa_chart{display:block}.-hpfpa_grid{stroke:var(--dsw-alias-border-l1);stroke-width:1px}.-hpfpa_axis{fill:var(--dsw-alias-label-tertiary);font-size:10px}.-hpfpa_axisRate{fill:var(--dsw-alias-label-tertiary)}.-hpfpa_bar{transform-box:fill-box;transform-origin:50%;transition:opacity .12s}.-hpfpa_barDim{opacity:.35}.-hpfpa_barHit{fill:#0000;pointer-events:all}.-hpfpa_trend{stroke:var(--dsw-trend-line);stroke-width:2px;opacity:.9;pointer-events:none}.-hpfpa_trendDot{fill:var(--dsw-trend-line);stroke:var(--dsw-alias-bg-layer-1);stroke-width:2px;pointer-events:none}.-hpfpa_legend{font-size:var(--usage-font-body);color:var(--usage-ink-label);flex-wrap:wrap;gap:10px;display:flex}.-hpfpa_legendItem{cursor:default;align-items:center;gap:5px;display:inline-flex}.-hpfpa_legendSwatch{width:var(--usage-swatch);height:var(--usage-swatch);border-radius:var(--usage-radius-swatch);flex:none;display:inline-block}.-hpfpa_legendTrend{background:var(--dsw-trend-line);border-radius:var(--usage-radius-bar);width:14px;height:3px}.-hpfpa_models{flex-wrap:wrap;align-items:center;gap:16px;min-width:0;display:flex}.-hpfpa_donutWrap{flex:none;position:relative}.-hpfpa_donut{display:block}.-hpfpa_donutTrack{stroke:var(--dsw-alias-bg-mask-1)}.-hpfpa_donutSeg{transition:stroke-width .12s,opacity .12s}.-hpfpa_donutDim{opacity:.35}.-hpfpa_donutCenter{fill:var(--usage-ink-value);font-size:18px;font-weight:600}.-hpfpa_donutLabel{fill:var(--usage-ink-meta);font-size:var(--usage-font-meta)}.-hpfpa_modelScroll{overscroll-behavior:contain;border:var(--usage-hairline);border-radius:var(--usage-radius-frame);background:var(--usage-fill-frame);scrollbar-gutter:stable;flex:260px;min-width:0;max-height:336px;overflow-y:auto}.-hpfpa_modelScroll::-webkit-scrollbar{width:8px}.-hpfpa_modelScroll::-webkit-scrollbar-thumb{background-clip:content-box;background-color:var(--dsw-alias-label-tertiary);opacity:.4;border:2px solid #0000;border-radius:4px}.-hpfpa_modelScroll::-webkit-scrollbar-thumb:hover{background-color:var(--dsw-alias-label-secondary)}.-hpfpa_modelScroll::-webkit-scrollbar-track{background:0 0}.-hpfpa_modelList{min-width:0;margin:0;padding:0;list-style:none}.-hpfpa_modelRank{min-width:14px;color:var(--usage-ink-meta);font-size:var(--usage-font-body);font-variant-numeric:tabular-nums;text-align:right;flex:none}.-hpfpa_modelRow{align-items:center;gap:var(--usage-row-gap);box-sizing:border-box;min-height:var(--usage-row-height);padding:8px var(--usage-row-pad-x);font-size:var(--usage-font-body);border-bottom:var(--usage-hairline);display:flex}.-hpfpa_modelRow:last-child{border-bottom:none}.-hpfpa_modelMeta{min-width:0;color:var(--usage-ink-meta);font-size:var(--usage-font-meta);font-variant-numeric:tabular-nums;white-space:nowrap;align-items:center;gap:4px;display:flex}.-hpfpa_modelHitRate{color:var(--usage-ink-meta);font-size:var(--usage-font-meta);font-variant-numeric:tabular-nums;white-space:nowrap;cursor:help;flex:none;align-items:center;gap:2px;display:inline-flex}.-hpfpa_modelHitRate svg{opacity:.7;flex:none}.-hpfpa_modelDot{opacity:.55;flex:none}.-hpfpa_modelRowExpandable{cursor:pointer}.-hpfpa_modelToggle{color:var(--dsw-alias-label-tertiary);cursor:pointer;vertical-align:middle;background:0 0;border:none;justify-content:center;align-items:center;margin-right:4px;padding:0;display:inline-flex}.-hpfpa_modelRowSub{padding-left:calc(var(--usage-row-pad-x) + 14px + 10px + var(--usage-row-gap));background:var(--usage-fill-inset);font-size:var(--usage-font-body)}.-hpfpa_modelRowDeep{padding-left:calc(var(--usage-row-pad-x) + 14px + 10px + var(--usage-row-gap) + 20px)}.-hpfpa_modelOtherWrap{grid-template-rows:0fr;transition:grid-template-rows .25s;display:grid}.-hpfpa_modelOtherOpen{grid-template-rows:1fr}.-hpfpa_modelOtherList{min-height:0;margin:0;padding:0;list-style:none;overflow:hidden}.-hpfpa_modelId{flex-direction:column;flex:auto;gap:1px;min-width:0;display:flex}.-hpfpa_modelValues{flex-direction:column;flex:none;align-items:flex-end;gap:1px;display:flex}.-hpfpa_modelName{color:var(--usage-ink-value);text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.-hpfpa_modelProvider{color:var(--usage-ink-meta);font-size:var(--usage-font-meta);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.-hpfpa_modelTokens{color:var(--usage-ink-value);font-size:var(--usage-font-body);font-variant-numeric:tabular-nums}.-hpfpa_modelPct{color:var(--usage-ink-meta);font-size:var(--usage-font-meta);font-variant-numeric:tabular-nums}.-hpfpa_tip{z-index:1100;pointer-events:none;border-radius:var(--usage-radius-inner);background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);color:var(--usage-ink-value);font-variant-numeric:tabular-nums;box-shadow:0 2px 10px var(--dsw-alias-bg-mask-2);white-space:nowrap;padding:5px 8px;font-size:12px;line-height:1.45;position:fixed}.-hpfpa_tipTitle{margin-bottom:2px;font-weight:600}.-hpfpa_tipRow{align-items:center;gap:5px;display:flex}.-hpfpa_tipRow .-hpfpa_legendSwatch{width:8px;height:8px}.-hpfpa_tipRowOther{color:var(--usage-ink-label);padding-left:6px}.-hpfpa_tipBreakdown{border-top:1px solid var(--dsw-alias-border-l1);margin-top:3px;padding-top:3px}.-hpfpa_foot{font-size:var(--usage-font-body);color:var(--usage-ink-meta)}.-hpfpa_prefGroup{border:var(--usage-hairline);border-radius:var(--usage-radius-frame);background:var(--usage-fill-frame)}.-hpfpa_prefRow{align-items:center;gap:12px;padding:10px 14px;display:flex}.-hpfpa_prefRow+.-hpfpa_prefRow{border-top:1px solid var(--dsw-alias-border-l1)}.-hpfpa_entryOptionText{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.-hpfpa_entryOptionTitle{font-size:var(--usage-font-body);color:var(--usage-ink-value);font-weight:400;line-height:20px}.-hpfpa_entryOptionDesc{color:var(--usage-ink-meta);font-size:12px;line-height:17px}.-hpfpa_switch{cursor:pointer;background:0 0;border:none;flex:none;align-items:center;padding:0;display:inline-flex}.-hpfpa_switchTrack{background:var(--dsw-alias-border-l2);width:40px;height:22px;transition:background-color .12s var(--ds-ease-in-out);border-radius:11px;flex:none;display:inline-block;position:relative}.-hpfpa_switchThumb{background:var(--dsw-alias-bg-layer-1);width:18px;height:18px;transition:transform .12s var(--ds-ease-in-out);border-radius:50%;position:absolute;top:2px;left:2px}.-hpfpa_switchTrack[data-on=true]{background:var(--dsw-alias-state-business-primary)}.-hpfpa_switchTrack[data-on=true] .-hpfpa_switchThumb{transform:translate(18px)}.-hpfpa_exportCsv,.-hpfpa_autoToggle{flex:none;min-width:92px}.-hpfpa_autoToggleOn,.-hpfpa_autoToggleOn:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent)}@media (width<=560px){.-hpfpa_actions{flex-wrap:wrap;justify-content:flex-end}}.-hpfpa_cardDelta{font-size:var(--usage-font-meta);color:var(--usage-ink-meta);font-variant-numeric:tabular-nums;align-items:center;gap:2px;line-height:1.2;display:inline-flex}.-hpfpa_cardDelta[data-kind=up],.-hpfpa_cardDelta[data-kind=down]{color:var(--dsw-alias-label-secondary)}.-hpfpa_sessionScroll{overscroll-behavior:contain;border:var(--usage-hairline);border-radius:var(--usage-radius-frame);background:var(--usage-fill-frame);scrollbar-gutter:stable;max-height:288px;overflow-y:auto}.-hpfpa_sessionScroll::-webkit-scrollbar{width:8px}.-hpfpa_sessionScroll::-webkit-scrollbar-thumb{background-clip:content-box;background-color:var(--dsw-alias-label-tertiary);opacity:.4;border:2px solid #0000;border-radius:4px}.-hpfpa_sessionScroll::-webkit-scrollbar-thumb:hover{background-color:var(--dsw-alias-label-secondary)}.-hpfpa_sessionScroll::-webkit-scrollbar-track{background:0 0}.-hpfpa_sessionList{margin:0;padding:0;list-style:none}.-hpfpa_sessionItem{min-width:0}.-hpfpa_sessionTruncated{padding:7px var(--usage-row-pad-x);border-top:var(--usage-hairline);background:var(--dsw-alias-bg-layer-2);color:var(--usage-ink-meta);font-size:var(--usage-font-meta);font-variant-numeric:tabular-nums;position:sticky;bottom:0}.-hpfpa_sessionRow{align-items:center;column-gap:var(--usage-row-gap);box-sizing:border-box;width:100%;padding:8px var(--usage-row-pad-x);border:none;border-bottom:var(--usage-hairline);color:var(--usage-ink-value);font:inherit;font-size:var(--usage-font-body);text-align:left;cursor:pointer;background:0 0;grid-template-columns:auto auto minmax(0,1fr) auto auto;grid-template-areas:\"-hpfpa_rank -hpfpa_swatch -hpfpa_main -hpfpa_values -hpfpa_chevron\";row-gap:0;display:grid;position:relative}.-hpfpa_sessionItem:last-child .-hpfpa_sessionRow{border-bottom:none}.-hpfpa_sessionRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.-hpfpa_sessionRow:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}.-hpfpa_sessionRowOpen{background:var(--dsw-alias-interactive-bg-active)}.-hpfpa_sessionSwatch{width:var(--usage-swatch);height:var(--usage-swatch);border-radius:var(--usage-radius-swatch);background:var(--dsw-chart-1);grid-area:-hpfpa_swatch;display:block}.-hpfpa_sessionMain{flex-direction:column;grid-area:-hpfpa_main;gap:1px;min-width:0;display:flex}.-hpfpa_sessionTitle{text-overflow:ellipsis;white-space:nowrap;color:var(--usage-ink-value);overflow:hidden}.-hpfpa_sessionSub{min-width:0;color:var(--usage-ink-meta);font-size:var(--usage-font-meta);font-variant-numeric:tabular-nums;white-space:nowrap;align-items:center;gap:5px;display:flex}.-hpfpa_sessionModel{text-overflow:ellipsis;max-width:22ch;overflow:hidden}.-hpfpa_sessionMoreModels{background:var(--dsw-alias-bg-mask-1);color:var(--usage-ink-label);font-variant-numeric:tabular-nums;border-radius:3px;flex:none;padding:0 4px;font-size:10px}.-hpfpa_sessionDot{opacity:.55;flex:none}.-hpfpa_sessionValues{font-variant-numeric:tabular-nums;flex-direction:column;flex:none;grid-area:-hpfpa_values;align-items:flex-end;gap:1px;display:flex}.-hpfpa_sessionTokens{color:var(--usage-ink-value);font-size:var(--usage-font-body)}.-hpfpa_sessionPct{color:var(--usage-ink-meta);font-size:var(--usage-font-meta)}.-hpfpa_sessionMeta{white-space:nowrap;align-items:center;gap:4px;display:flex}.-hpfpa_sessionHitRate{color:var(--usage-ink-meta);font-size:var(--usage-font-meta);font-variant-numeric:tabular-nums;white-space:nowrap;cursor:help;align-items:center;gap:2px;display:inline-flex}.-hpfpa_sessionHitRate svg{opacity:.7;flex:none}.-hpfpa_sessionChevron{color:var(--usage-ink-meta);flex:none;grid-area:-hpfpa_chevron;align-items:center;display:inline-flex}.-hpfpa_sessionDetail{background:var(--usage-fill-inset);margin:0;padding:2px 0 6px;list-style:none}.-hpfpa_sessionDetailRow{align-items:center;gap:var(--usage-row-gap);padding:6px var(--usage-row-pad-x) 6px calc(var(--usage-row-pad-x) + 14px + var(--usage-row-gap) + var(--usage-swatch) + var(--usage-row-gap));font-size:var(--usage-font-body);display:flex}.-hpfpa_sessionDetailId{flex-direction:column;flex:auto;gap:1px;min-width:0;display:flex}.-hpfpa_deferred{flex-direction:column;gap:18px;min-width:0;display:flex}.-hpfpa_deferredSkeleton{border:1px dashed var(--dsw-alias-border-l1);border-radius:var(--usage-radius-frame);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1) 60%, transparent);animation:-hpfpa_deferredPulse 1.4s var(--ds-ease-in-out) infinite}@keyframes -hpfpa_deferredPulse{0%,to{opacity:.55}50%{opacity:.9}}@media (prefers-reduced-motion:reduce){.-hpfpa_deferredSkeleton{animation:none}}.-hpfpa_panel{--dsw-heat-0:#ebedf0;--dsw-heat-1:#dbe3ff;--dsw-heat-2:#b7c5ff;--dsw-heat-3:#8ea4ff;--dsw-heat-4:#6884ff;--dsw-heat-5:#4d6bfe;--dsw-heat-sheen:#ffffff8c;--dsw-heat-shade:#0003;--dsw-trend-line:#4d6bfe;--dsw-chart-1:#509fff;--dsw-chart-2:#6d9a73;--dsw-chart-3:#d69159;--dsw-chart-4:#b68cf5;--dsw-chart-5:#e07db2;--dsw-chart-6:#56adad;--dsw-chart-7:#ca7162;--dsw-chart-8:#a2b15d;--dsw-chart-9:#8179de;--dsw-chart-10:#e1bd5d;--dsw-chart-other:#89919b;--dsw-provider-1:#62a2af;--dsw-provider-2:#97b075;--dsw-provider-3:#bd8d6d;--dsw-provider-4:#a38ec1;--dsw-provider-5:#c8758c;--dsw-provider-other:#89919b}@media (prefers-color-scheme:dark){.-hpfpa_panel{--dsw-heat-0:#21262d;--dsw-heat-1:#2f4bd0;--dsw-heat-2:#4d6bfe;--dsw-heat-3:#6e8bff;--dsw-heat-4:#93aaff;--dsw-heat-5:#c4d0ff;--dsw-heat-sheen:#ffffff4d;--dsw-heat-shade:#00000080;--dsw-trend-line:#7d95ff;--dsw-chart-1:#5da6ff;--dsw-chart-2:#78a17d;--dsw-chart-3:#d99965;--dsw-chart-4:#bb94f6;--dsw-chart-5:#e286b8;--dsw-chart-6:#62b3b3;--dsw-chart-7:#ce7b6d;--dsw-chart-8:#a9b769;--dsw-chart-9:#8a82e0;--dsw-chart-10:#e3c168;--dsw-chart-other:#9299a2;--dsw-provider-1:#6da9b4;--dsw-provider-2:#9eb67f;--dsw-provider-3:#c29578;--dsw-provider-4:#a996c6;--dsw-provider-5:#cc7f94;--dsw-provider-other:#9299a2}}";
		const tagId$1 = "dsh-external/dsh-usage-panel-plus/UsageStatsPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-external/dsh-usage-panel-plus";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var UsageStatsPanel_module_css_default = {
			"actions": "-hpfpa_actions",
			"autoToggle": "-hpfpa_autoToggle",
			"autoToggleOn": "-hpfpa_autoToggleOn",
			"axis": "-hpfpa_axis",
			"axisRate": "-hpfpa_axisRate",
			"back": "-hpfpa_back",
			"backRow": "-hpfpa_backRow",
			"bar": "-hpfpa_bar",
			"barDim": "-hpfpa_barDim",
			"barHit": "-hpfpa_barHit",
			"card": "-hpfpa_card",
			"cardDelta": "-hpfpa_cardDelta",
			"cardFoot": "-hpfpa_cardFoot",
			"cardHead": "-hpfpa_cardHead",
			"cardIcon": "-hpfpa_cardIcon",
			"cardLabel": "-hpfpa_cardLabel",
			"cardModelLines": "-hpfpa_cardModelLines",
			"cardSub": "-hpfpa_cardSub",
			"cardValue": "-hpfpa_cardValue",
			"cardValueSm": "-hpfpa_cardValueSm",
			"cardValueWrap": "-hpfpa_cardValueWrap",
			"cards": "-hpfpa_cards",
			"chart": "-hpfpa_chart",
			"chartWrap": "-hpfpa_chartWrap",
			"chevron": "-hpfpa_chevron",
			"customHint": "-hpfpa_customHint",
			"customRange": "-hpfpa_customRange",
			"customSep": "-hpfpa_customSep",
			"dateInput": "-hpfpa_dateInput",
			"deferred": "-hpfpa_deferred",
			"deferredPulse": "-hpfpa_deferredPulse",
			"deferredSkeleton": "-hpfpa_deferredSkeleton",
			"donut": "-hpfpa_donut",
			"donutCenter": "-hpfpa_donutCenter",
			"donutDim": "-hpfpa_donutDim",
			"donutLabel": "-hpfpa_donutLabel",
			"donutSeg": "-hpfpa_donutSeg",
			"donutTrack": "-hpfpa_donutTrack",
			"donutWrap": "-hpfpa_donutWrap",
			"empty": "-hpfpa_empty",
			"entryOptionDesc": "-hpfpa_entryOptionDesc",
			"entryOptionText": "-hpfpa_entryOptionText",
			"entryOptionTitle": "-hpfpa_entryOptionTitle",
			"errorBanner": "-hpfpa_errorBanner",
			"errorBannerRow": "-hpfpa_errorBannerRow",
			"errorBannerText": "-hpfpa_errorBannerText",
			"errorRetry": "-hpfpa_errorRetry",
			"exportCsv": "-hpfpa_exportCsv",
			"foot": "-hpfpa_foot",
			"grid": "-hpfpa_grid",
			"group": "-hpfpa_group",
			"heatCell": "-hpfpa_heatCell",
			"heatLegend": "-hpfpa_heatLegend",
			"heatLevel0": "-hpfpa_heatLevel0",
			"heatLevel1": "-hpfpa_heatLevel1",
			"heatLevel2": "-hpfpa_heatLevel2",
			"heatLevel3": "-hpfpa_heatLevel3",
			"heatLevel4": "-hpfpa_heatLevel4",
			"heatLevel5": "-hpfpa_heatLevel5",
			"heatWrap": "-hpfpa_heatWrap",
			"heatmap": "-hpfpa_heatmap",
			"legend": "-hpfpa_legend",
			"legendItem": "-hpfpa_legendItem",
			"legendSwatch": "-hpfpa_legendSwatch",
			"legendTrend": "-hpfpa_legendTrend",
			"loading": "-hpfpa_loading",
			"main": "-hpfpa_main",
			"modelDot": "-hpfpa_modelDot",
			"modelHitRate": "-hpfpa_modelHitRate",
			"modelId": "-hpfpa_modelId",
			"modelList": "-hpfpa_modelList",
			"modelMeta": "-hpfpa_modelMeta",
			"modelName": "-hpfpa_modelName",
			"modelOtherList": "-hpfpa_modelOtherList",
			"modelOtherOpen": "-hpfpa_modelOtherOpen",
			"modelOtherWrap": "-hpfpa_modelOtherWrap",
			"modelPct": "-hpfpa_modelPct",
			"modelProvider": "-hpfpa_modelProvider",
			"modelRank": "-hpfpa_modelRank",
			"modelRow": "-hpfpa_modelRow",
			"modelRowDeep": "-hpfpa_modelRowDeep",
			"modelRowExpandable": "-hpfpa_modelRowExpandable",
			"modelRowSub": "-hpfpa_modelRowSub",
			"modelScroll": "-hpfpa_modelScroll",
			"modelToggle": "-hpfpa_modelToggle",
			"modelTokens": "-hpfpa_modelTokens",
			"modelValues": "-hpfpa_modelValues",
			"models": "-hpfpa_models",
			"page": "-hpfpa_page",
			"panel": "-hpfpa_panel",
			"prefGroup": "-hpfpa_prefGroup",
			"prefRow": "-hpfpa_prefRow",
			"progressBar": "-hpfpa_progressBar",
			"rank": "-hpfpa_rank",
			"rebuild": "-hpfpa_rebuild",
			"rebuildArmed": "-hpfpa_rebuildArmed",
			"refresh": "-hpfpa_refresh",
			"section": "-hpfpa_section",
			"sectionHead": "-hpfpa_sectionHead",
			"sectionTitle": "-hpfpa_sectionTitle",
			"segActive": "-hpfpa_segActive",
			"segItem": "-hpfpa_segItem",
			"sessionChevron": "-hpfpa_sessionChevron",
			"sessionDetail": "-hpfpa_sessionDetail",
			"sessionDetailId": "-hpfpa_sessionDetailId",
			"sessionDetailRow": "-hpfpa_sessionDetailRow",
			"sessionDot": "-hpfpa_sessionDot",
			"sessionHitRate": "-hpfpa_sessionHitRate",
			"sessionItem": "-hpfpa_sessionItem",
			"sessionList": "-hpfpa_sessionList",
			"sessionMain": "-hpfpa_sessionMain",
			"sessionMeta": "-hpfpa_sessionMeta",
			"sessionModel": "-hpfpa_sessionModel",
			"sessionMoreModels": "-hpfpa_sessionMoreModels",
			"sessionPct": "-hpfpa_sessionPct",
			"sessionRow": "-hpfpa_sessionRow",
			"sessionRowOpen": "-hpfpa_sessionRowOpen",
			"sessionScroll": "-hpfpa_sessionScroll",
			"sessionSub": "-hpfpa_sessionSub",
			"sessionSwatch": "-hpfpa_sessionSwatch",
			"sessionTitle": "-hpfpa_sessionTitle",
			"sessionTokens": "-hpfpa_sessionTokens",
			"sessionTruncated": "-hpfpa_sessionTruncated",
			"sessionValues": "-hpfpa_sessionValues",
			"swatch": "-hpfpa_swatch",
			"switch": "-hpfpa_switch",
			"switchThumb": "-hpfpa_switchThumb",
			"switchTrack": "-hpfpa_switchTrack",
			"tip": "-hpfpa_tip",
			"tipBreakdown": "-hpfpa_tipBreakdown",
			"tipRow": "-hpfpa_tipRow",
			"tipRowOther": "-hpfpa_tipRowOther",
			"tipTitle": "-hpfpa_tipTitle",
			"toolbar": "-hpfpa_toolbar",
			"trend": "-hpfpa_trend",
			"trendDot": "-hpfpa_trendDot",
			"trendNote": "-hpfpa_trendNote",
			"usageBarSlide": "-hpfpa_usageBarSlide",
			"values": "-hpfpa_values"
		};
		//#endregion
		//#region src/client/ChartTip.tsx
		/**
		* ChartTip renders a chart hover tooltip as a fixed-position portal on
		* document.body. The charts draw in SVG with no DOM wrapper per cell/bar/
		* segment, so the previous absolute-inside-wrap approach could not escape the
		* wrap's clipping (the heatmap's overflow:hidden swallowed the tip entirely)
		* and relied on wrap-relative coordinates that drift under ancestor
		* transforms. This component instead anchors to the hovered SVG element's own
		* viewport rect, clamps inside the usage panel's bounds (falling back to
		* the viewport), and flips above the anchor when there is no room below —
		* re-measuring on scroll (capture phase), resize, and its own size changes
		* while open, mirroring the official ui-primitives useAnchoredPosition/HoverCard
		* pattern.
		*/
		/** The tip renders only while an anchor is set; null hides it entirely. */
		function ChartTip({ anchor, panelRef, children, gap = 8, margin = 8 }) {
			const [pos, setPos] = (0, react.useState)(null);
			const ref = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				const el = ref.current;
				if (el === null || anchor === null) {
					setPos(null);
					return;
				}
				const place = () => {
					const w = el.offsetWidth;
					const h = el.offsetHeight;
					if (w === 0 || h === 0) return;
					const a = anchor.getBoundingClientRect();
					if (a.width === 0 && a.height === 0 && a.left === 0 && a.top === 0) {
						setPos(null);
						return;
					}
					const p = panelRef.current?.getBoundingClientRect();
					const minX = p !== void 0 && p.width > 0 ? p.left + margin : margin;
					const maxX = p !== void 0 && p.width > 0 ? p.right - margin : window.innerWidth - margin;
					const minY = p !== void 0 && p.height > 0 ? p.top + margin : margin;
					const maxY = p !== void 0 && p.height > 0 ? p.bottom - margin : window.innerHeight - margin;
					let left = a.left + a.width / 2 - w / 2;
					left = w <= maxX - minX ? Math.min(Math.max(left, minX), maxX - w) : minX;
					const below = a.bottom + gap;
					const above = a.top - gap - h;
					const top = below + h <= maxY || !(above >= minY) ? Math.max(Math.min(Math.max(below, minY), maxY - h), minY) : Math.max(above, minY);
					setPos((prev) => prev !== null && prev.left === left && prev.top === top ? prev : {
						left,
						top
					});
				};
				place();
				window.addEventListener("scroll", place, true);
				window.addEventListener("resize", place);
				let observer = null;
				if (typeof ResizeObserver !== "undefined") {
					observer = new ResizeObserver(place);
					observer.observe(el);
					const panel = panelRef.current;
					if (panel !== null) observer.observe(panel);
				}
				return () => {
					observer?.disconnect();
					window.removeEventListener("scroll", place, true);
					window.removeEventListener("resize", place);
				};
			}, [
				anchor,
				panelRef,
				gap,
				margin
			]);
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref,
				className: UsageStatsPanel_module_css_default.tip,
				"data-dsh-usage-panel-plus-glass": "tip",
				role: "tooltip",
				style: pos === null ? { visibility: "hidden" } : {
					left: pos.left,
					top: pos.top
				},
				children
			}), document.body);
		}
		//#endregion
		//#region src/client/Deferred.tsx
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
		function Deferred({ children, placeholderHeight = 520, rootMarginPx = 240 }) {
			const [visible, setVisible] = (0, react.useState)(() => typeof IntersectionObserver === "undefined");
			const anchorRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (visible) return;
				const el = anchorRef.current;
				if (el === null || typeof IntersectionObserver === "undefined") {
					setVisible(true);
					return;
				}
				const observer = new IntersectionObserver((entries) => {
					if (!entries.some((entry) => entry.isIntersecting)) return;
					setVisible(true);
					observer.disconnect();
				}, { rootMargin: `${rootMarginPx}px 0px ${rootMarginPx}px 0px` });
				observer.observe(el);
				return () => {
					observer.disconnect();
				};
			}, [visible, rootMarginPx]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: UsageStatsPanel_module_css_default.deferred,
				ref: anchorRef,
				"data-dsh-usage-deferred": visible ? "open" : "closed",
				children: visible ? children : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: UsageStatsPanel_module_css_default.deferredSkeleton,
					style: { height: placeholderHeight },
					"aria-hidden": "true"
				})
			});
		}
		/**
		* Derive the ring's geometry from its diameter.
		* @param size - rendered diameter in px.
		* @returns every value the SVG needs, in user units.
		*/
		function donutGeometry(size) {
			const cx = size / 2;
			const sw = size * .15;
			const r = size * .475 - sw / 2;
			return {
				size,
				cx,
				sw,
				r,
				circ: 2 * Math.PI * r
			};
		}
		/**
		* Resolve the ring's diameter from the row's measured width: grow with the
		* container up to the cap, and never take so much that the list beside it
		* drops under its basis. Below that the row wraps and the floor applies.
		* @param containerWidth - measured width of the row element, in px.
		* @returns the diameter to render at.
		*/
		function resolveDonutSize(containerWidth) {
			const cap = Math.min(280, Math.max(0, containerWidth - 16 - 260));
			return Math.max(200, cap);
		}
		/**
		* Track the row's width and resolve the ring's diameter from it.
		*
		* The observed element is the ROW, whose width the ring cannot influence, so
		* the measurement can never feed back into itself. State is committed only
		* when the resolved diameter actually changes — committing an identical value
		* on every ResizeObserver callback would drive a render loop.
		* @param ref - the row element holding the ring and the list.
		* @returns the current diameter in px.
		*/
		function useDonutSize(ref) {
			const [size, setSize] = (0, react.useState)(200);
			(0, react.useEffect)(() => {
				const el = ref.current;
				if (el === null) return;
				const update = () => {
					const next = resolveDonutSize(el.clientWidth);
					setSize((prev) => prev === next ? prev : next);
				};
				update();
				const ro = new ResizeObserver(update);
				ro.observe(el);
				return () => ro.disconnect();
			}, [ref]);
			return size;
		}
		function Donut({ segments, size, ariaLabel, centerValue, centerCaption, hovered, onHover }) {
			if (segments.length === 0) return null;
			const { cx, sw, r, circ } = donutGeometry(size);
			const total = Math.max(1, segments.reduce((sum, s) => sum + s.tokens, 0));
			let cursor = 0;
			const placed = segments.map((seg) => {
				const dash = seg.tokens / total * circ;
				const entry = {
					seg,
					dash,
					start: cursor
				};
				cursor += dash;
				return entry;
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: UsageStatsPanel_module_css_default.donut,
				width: size,
				height: size,
				viewBox: `0 0 ${size} ${size}`,
				role: "group",
				"aria-label": ariaLabel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: UsageStatsPanel_module_css_default.donutTrack,
						cx,
						cy: cx,
						r,
						fill: "none",
						strokeWidth: sw
					}),
					placed.map(({ seg, dash, start }) => {
						const active = hovered === seg.key;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
							className: clsx(UsageStatsPanel_module_css_default.donutSeg, hovered !== null && !active && UsageStatsPanel_module_css_default.donutDim),
							cx,
							cy: cx,
							r,
							fill: "none",
							stroke: seg.color,
							strokeDasharray: `${dash} ${circ - dash}`,
							strokeDashoffset: -start,
							transform: `rotate(-90 ${cx} ${cx})`,
							style: {
								strokeWidth: active ? sw * 1.16 : sw,
								transition: "stroke-width 0.12s ease"
							},
							tabIndex: 0,
							role: "img",
							"aria-label": seg.label,
							onMouseEnter: (e) => onHover(seg.key, e.currentTarget),
							onMouseLeave: () => onHover(null),
							onFocus: (e) => onHover(seg.key, e.currentTarget),
							onBlur: () => onHover(null)
						}, seg.key);
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
						className: UsageStatsPanel_module_css_default.donutCenter,
						x: cx,
						y: cx + size * .04,
						textAnchor: "middle",
						children: centerValue
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
						className: UsageStatsPanel_module_css_default.donutLabel,
						x: cx,
						y: cx + size * .13,
						textAnchor: "middle",
						children: centerCaption
					})
				]
			});
		}
		//#endregion
		//#region src/client/SessionUsage.tsx
		/**
		* SessionUsage — the per-session drill-down section of the usage panel: one
		* ranked row per conversation, sized by its token share of the range, opening
		* into that session's own model split.
		*
		* The dimension answers the question the summary cards cannot: WHICH
		* conversation the traffic came from. The host aggregates it server-side (the
		* store keeps a per-session table) and returns up to {@link
		* MAX_SESSIONS_IN_RESPONSE} rows sorted by tokens.
		*
		* LAYOUT: the rows live in a fixed-height scroller, not in a list that grows
		* with the number of conversations. A range with thirty sessions used to push
		* the foot of the panel a full screen down for a section that is a drill-down,
		* not a headline — so the list gets a capped viewport of about six rows and
		* scrolls inside it, exactly like a log pane. Every returned row is rendered
		* (no "other N" fold row): scrolling already reaches them, and folding on top
		* of a scroller would hide rows behind two different gestures.
		*
		* The section CLOSES the panel: it is the deepest drill-down (range →
		* conversation → the models inside it), so it reads as the last step instead of
		* interrupting the model and provider summaries above it.
		*
		* An empty range renders NOTHING — not an empty frame: a section that only
		* ever says "no rows" is noise.
		*/
		/** Toggle one key in an immutable string set — a fresh Set every call, so
		*  React sees a change and unrelated rows keep their own state. */
		function toggleIn$1(set, key) {
			const next = new Set(set);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		}
		function SessionUsage({ sessions, sessionCount, tokens, unknownRequests = 0, t, colorForModel }) {
			const [open, setOpen] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const detailIdBase = (0, react.useId)();
			if (sessions.length === 0) return null;
			const notReturned = Math.max(0, sessionCount - sessions.length);
			const share = (value) => tokens > 0 ? Math.min(100, value / tokens * 100) : 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: UsageStatsPanel_module_css_default.section,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.sectionHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: UsageStatsPanel_module_css_default.sectionTitle,
						children: t("sessionUsage")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: UsageStatsPanel_module_css_default.trendNote,
						children: [t("sessionUsageHint", { n: sessionCount }), unknownRequests > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [" · ", t("unknownRequests", { n: unknownRequests })] })]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: UsageStatsPanel_module_css_default.sessionScroll,
					"data-dsh-usage-panel-plus-glass": "list",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
						className: UsageStatsPanel_module_css_default.sessionList,
						children: [sessions.map((session, rank) => {
							const isOpen = open.has(session.session);
							const detailId = `${detailIdBase}-${rank}`;
							const percent = share(session.tokens);
							const topModel = session.models[0];
							const name = session.title || shortSessionId(session.session);
							const accent = topModel === void 0 || colorForModel === void 0 ? void 0 : colorForModel(topModel.model);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: UsageStatsPanel_module_css_default.sessionItem,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: clsx(UsageStatsPanel_module_css_default.sessionRow, isOpen && UsageStatsPanel_module_css_default.sessionRowOpen),
									title: session.session,
									"aria-expanded": isOpen,
									"aria-controls": isOpen && session.models.length > 0 ? detailId : void 0,
									onClick: () => {
										setOpen((prev) => toggleIn$1(prev, session.session));
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: UsageStatsPanel_module_css_default.modelRank,
											"aria-hidden": "true",
											children: rank + 1
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											className: UsageStatsPanel_module_css_default.sessionSwatch,
											style: accent === void 0 ? void 0 : { background: accent },
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: UsageStatsPanel_module_css_default.sessionMain,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: UsageStatsPanel_module_css_default.sessionTitle,
												children: name
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: UsageStatsPanel_module_css_default.sessionSub,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.sessionModel,
														children: topModel === void 0 ? "—" : `${modelNameOf(topModel.model)} · ${providerOf(topModel.model)}`
													}),
													session.models.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
														className: UsageStatsPanel_module_css_default.sessionMoreModels,
														children: ["+", session.models.length - 1]
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.sessionDot,
														"aria-hidden": "true",
														children: "·"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
														t("requestsShort"),
														" ",
														session.requests
													] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.sessionDot,
														"aria-hidden": "true",
														children: "·"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("turnsShort", { n: session.turns }) }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.sessionDot,
														"aria-hidden": "true",
														children: "·"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
														t("lastActive"),
														" ",
														shortDate(session.lastSeen)
													] })
												]
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: UsageStatsPanel_module_css_default.sessionValues,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: UsageStatsPanel_module_css_default.sessionTokens,
												children: formatCompact(session.tokens)
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: UsageStatsPanel_module_css_default.sessionMeta,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.sessionPct,
														children: formatPercent(percent)
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.sessionDot,
														"aria-hidden": "true",
														children: "·"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
														className: UsageStatsPanel_module_css_default.sessionHitRate,
														title: `${t("hitRateLabel")}: ${t("cacheRateHint")}`,
														"aria-label": `${t("hitRateLabel")} ${cacheRateText(session.cacheHit, session.cacheMiss)}`,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Database, {
															size: 9,
															"aria-hidden": "true"
														}), t("hitRateShort", { rate: cacheRateText(session.cacheHit, session.cacheMiss) })]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: UsageStatsPanel_module_css_default.sessionChevron,
											"aria-hidden": "true",
											children: isOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronDown, { size: 12 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronRight, { size: 12 })
										})
									]
								}), isOpen && session.models.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: UsageStatsPanel_module_css_default.sessionDetail,
									id: detailId,
									"aria-label": t("sessionTopModels"),
									children: session.models.map((model) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
										className: UsageStatsPanel_module_css_default.sessionDetailRow,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
												className: UsageStatsPanel_module_css_default.legendSwatch,
												style: colorForModel === void 0 ? void 0 : { background: colorForModel(model.model) }
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: UsageStatsPanel_module_css_default.sessionDetailId,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: UsageStatsPanel_module_css_default.modelName,
													children: modelNameOf(model.model)
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: UsageStatsPanel_module_css_default.modelProvider,
													children: providerOf(model.model)
												})]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: UsageStatsPanel_module_css_default.modelValues,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: UsageStatsPanel_module_css_default.modelTokens,
													children: formatCompact(model.tokens)
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: UsageStatsPanel_module_css_default.modelPct,
													children: formatPercent(model.percent)
												})]
											})
										]
									}, model.model))
								})]
							}, session.session);
						}), notReturned > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
							className: UsageStatsPanel_module_css_default.sessionTruncated,
							children: t("sessionTruncated", {
								shown: sessions.length,
								total: sessionCount
							})
						})]
					})
				})]
			});
		}
		//#endregion
		//#region src/client/stats-line-state.ts
		/**
		* Client preferences for the conversation bottom-bar (stats line) enhancements,
		* persisted in localStorage as one JSON blob.
		*
		* Three toggles share one blob so a single read covers all of them:
		* - `cachePrecision`: render the cache-hit rate with two decimals (e.g.
		*   "85.25%") instead of the default integer percentage;
		* - `tokenDetail`: add the input (cache miss) row to the usage dialog's
		*   input / cache-read / cache-write / output breakdown;
		* - `streamThroughput`: while a step streams, replace the pill's speed figure
		*   with the live estimate and fall back to the official session figure the
		*   moment it settles.
		*
		* The panel row and the stats line live in two different slot trees but inside
		* the SAME client bundle instance, so a tiny module store keeps them in sync
		* without touching the host or any settings store. Reads are defensive
		* (private mode / quota make storage throw); partial or corrupt blobs fall
		* back to defaults value by value.
		*/
		const STORAGE_KEY = "dsh-usage-panel-plus:stats-line";
		const DEFAULTS = {
			cachePrecision: false,
			tokenDetail: false,
			streamThroughput: false
		};
		function readStored() {
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw === null) return { ...DEFAULTS };
				const parsed = JSON.parse(raw);
				return {
					cachePrecision: parsed.cachePrecision === true,
					tokenDetail: parsed.tokenDetail === true,
					streamThroughput: parsed.streamThroughput === true
				};
			} catch {
				return { ...DEFAULTS };
			}
		}
		let prefs = readStored();
		const listeners = /* @__PURE__ */ new Set();
		function notify() {
			for (const listener of listeners) listener();
		}
		function persist(next) {
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {}
		}
		const statsLineState = {
			get cachePrecision() {
				return prefs.cachePrecision;
			},
			get tokenDetail() {
				return prefs.tokenDetail;
			},
			get streamThroughput() {
				return prefs.streamThroughput;
			},
			setCachePrecision(next) {
				if (next === prefs.cachePrecision) return;
				prefs = {
					...prefs,
					cachePrecision: next
				};
				persist(prefs);
				notify();
			},
			setTokenDetail(next) {
				if (next === prefs.tokenDetail) return;
				prefs = {
					...prefs,
					tokenDetail: next
				};
				persist(prefs);
				notify();
			},
			setStreamThroughput(next) {
				if (next === prefs.streamThroughput) return;
				prefs = {
					...prefs,
					streamThroughput: next
				};
				persist(prefs);
				notify();
			},
			subscribe(listener) {
				listeners.add(listener);
				return () => {
					listeners.delete(listener);
				};
			}
		};
		function samePrefs(left, right) {
			return left.cachePrecision === right.cachePrecision && left.tokenDetail === right.tokenDetail && left.streamThroughput === right.streamThroughput;
		}
		if (typeof window !== "undefined") window.addEventListener("storage", (event) => {
			if (event.key !== STORAGE_KEY) return;
			const next = readStored();
			if (samePrefs(next, prefs)) return;
			prefs = next;
			notify();
		});
		//#endregion
		//#region src/client/UsageStatsPanel.tsx
		/**
		* UsageStatsPanel renders the "usage statistics" panel. One component mounts
		* in two places — the Plugins page's own page for this bundle and the panel's
		* standalone main panel — so it reads the aggregate from the host (via the
		* fenced /usage-panel-plus/api route) and draws every chart by hand in SVG — a
		* GitHub-style activity heatmap, a stacked per-day token trend with a cache
		* hit-rate curve, and two ranked sections (models and providers) that each
		* pair a ring with a detail list.
		* No chart library; colours come from a fixed two-series palette
		* (--dsw-chart-1..10 + the gray --dsw-chart-other for models,
		* --dsw-provider-1..5 + the gray --dsw-provider-other for providers, the
		* reasonix usage-stats palette with a lifted dark variant, defined in this
		* plugin's module css).
		*
		* The panel follows the DSH client conventions: component styles are a CSS
		* Module (hashed class map imported as `css`), interactive atoms use the
		* ui-primitives Button/Input, and every visual value rides the --dsw-alias-*
		* semantic tokens. The functionality replicates the reasonix usage stats
		* feature; the implementation is DSH-native.
		*/
		/** The range chips, in ascending order of span. `all` sits last: it is the
		*  widest window and the only one whose length depends on the store's own
		*  earliest day rather than on today. */
		const RANGE_PRESETS = [
			"today",
			"3",
			"7",
			"14",
			"30",
			"90",
			"all"
		];
		/** How long the rebuild button stays armed without a second press. */
		const REBUILD_ARM_MS = 5e3;
		/** The auto-refresh cadence. One minute is the interval the host's own stats
		*  surfaces use and the slowest rate at which a live session's numbers still
		*  feel current. */
		const AUTO_REFRESH_MS = 6e4;
		/** Where the auto-refresh preference lives. A panel preference, not a profile
		*  setting: it belongs to this reader's browser, and it must survive the panel
		*  unmounting on every navigation. */
		const AUTO_REFRESH_PREF_KEY = "dsh-usage-panel-plus:autoRefresh";
		/** Read the persisted auto-refresh switch. Private-mode browsers throw on the
		*  storage access itself, and the visual-off default is the safe answer there. */
		function readAutoRefreshPref() {
			try {
				return window.localStorage.getItem(AUTO_REFRESH_PREF_KEY) === "1";
			} catch {
				return false;
			}
		}
		/** Persist the auto-refresh switch; a failed write only costs the preference. */
		function writeAutoRefreshPref(on) {
			try {
				window.localStorage.setItem(AUTO_REFRESH_PREF_KEY, on ? "1" : "0");
			} catch {}
		}
		/** The exact session count. The field is absent on a host that predates the
		*  session dimension (and in fixtures written against that wire), so a missing
		*  value reads as zero rather than rendering "undefined" in a card. */
		function sessionCountOf(stats) {
			return typeof stats.sessionCount === "number" && Number.isFinite(stats.sessionCount) ? stats.sessionCount : 0;
		}
		/** The trend chart caps its visible window at 180 days (mirrors reasonix). */
		const TREND_MAX_DAYS = 180;
		/** EVERY model keeps its own row and its own rank colour — there is no "Other"
		*  bucket. An earlier revision folded everything past the top ten into one gray
		*  step; the list scrolls now, so the fold only ever hid rows behind an extra
		*  click and made the ring disagree with the list beside it. The chart palette
		*  still has ten hues, so ranks past ten wrap around it (see
		*  {@link chartSlot}). */
		const OTHER_MODEL = "\0other";
		const OTHER_COLOR = "var(--dsw-chart-other)";
		/** How many distinct hues the chart palette defines. */
		const CHART_HUES = 10;
		/** Number of provider hues in the provider palette. */
		const PROVIDER_HUES = 5;
		const OTHER_PROVIDER = "\0pother";
		const OTHER_PROVIDER_COLOR = "var(--dsw-provider-other)";
		/** Rank → palette slot. Ranks past the palette's end WRAP instead of all
		*  collapsing onto the last hue: with no Other bucket, rank 11 still needs a
		*  colour of its own, and a wrapped hue repeats a neighbour rather than making
		*  every tail row identical. */
		function chartSlot(rank, hues) {
			return rank % hues + 1;
		}
		/** Shared empty key set: one stable identity for a collapsed expand state. */
		const NO_KEYS = /* @__PURE__ */ new Set();
		function UsageStatsPanel({ t }) {
			const [range, setRange] = (0, react.useState)("30");
			const [customFrom, setCustomFrom] = (0, react.useState)("");
			const [customTo, setCustomTo] = (0, react.useState)("");
			const [rebuildArmed, setRebuildArmed] = (0, react.useState)(false);
			const [rebuilding, setRebuilding] = (0, react.useState)(false);
			const rebuildTimer = (0, react.useRef)(null);
			const [stats, setStats] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)("");
			const [updatedAt, setUpdatedAt] = (0, react.useState)(null);
			const [autoRefresh, setAutoRefresh] = (0, react.useState)(readAutoRefreshPref);
			const generationRef = (0, react.useRef)(0);
			const panelRef = (0, react.useRef)(null);
			const heatWindow = (0, react.useMemo)(() => {
				const to = localDay(0);
				return {
					from: localDay(-363),
					to
				};
			}, []);
			const [heatDaily, setHeatDaily] = (0, react.useState)([]);
			const heatGenRef = (0, react.useRef)(0);
			const heatLoadedDayRef = (0, react.useRef)(null);
			const loadHeat = (0, react.useCallback)(async (options) => {
				const today = localDay(0);
				if (options?.noCache !== true && heatLoadedDayRef.current === today) return;
				const generation = ++heatGenRef.current;
				try {
					const res = await fetchRange({
						range: "custom",
						from: heatWindow.from,
						to: heatWindow.to
					});
					if (heatGenRef.current !== generation) return;
					setHeatDaily(res.daily);
					heatLoadedDayRef.current = today;
				} catch (e) {
					console.error("[dsh-usage-panel-plus] heatmap window request failed", e);
				}
			}, [heatWindow.from, heatWindow.to]);
			const load = (0, react.useCallback)(async (options) => {
				if (range === "custom" && (!customFrom || !customTo)) return;
				const req = range === "custom" ? {
					range,
					from: customFrom,
					to: customTo
				} : { range };
				const generation = ++generationRef.current;
				setLoading(true);
				setError("");
				loadHeat({ noCache: options?.noCache });
				try {
					const res = await fetchRangeCached(req, { noCache: options?.noCache });
					if (generationRef.current !== generation) return;
					setStats(res);
					setUpdatedAt(/* @__PURE__ */ new Date());
				} catch (e) {
					if (generationRef.current !== generation) return;
					setError(e instanceof UsageApiError ? e.message : String(e));
				} finally {
					if (generationRef.current === generation) setLoading(false);
				}
			}, [
				range,
				customFrom,
				customTo,
				loadHeat
			]);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			(0, react.useEffect)(() => {
				if (!autoRefresh) return;
				const timer = window.setInterval(() => {
					if (document.visibilityState !== "visible") return;
					load({ noCache: true });
				}, AUTO_REFRESH_MS);
				return () => {
					window.clearInterval(timer);
				};
			}, [autoRefresh, load]);
			const toggleAutoRefresh = (0, react.useCallback)((next) => {
				setAutoRefresh(next);
				writeAutoRefreshPref(next);
			}, []);
			const exportCsv = (0, react.useCallback)(() => {
				if (stats === null) return;
				try {
					const blob = new Blob(["﻿" + buildCsv(stats)], { type: CSV_MIME });
					const url = URL.createObjectURL(blob);
					const link = document.createElement("a");
					link.href = url;
					link.download = csvFileName(stats);
					document.body.appendChild(link);
					link.click();
					link.remove();
					window.setTimeout(() => {
						URL.revokeObjectURL(url);
					}, 0);
				} catch (e) {
					console.error("[dsh-usage-panel-plus] csv export failed", e);
					setError(`${t("exportFailed")}: ${e instanceof Error ? e.message : String(e)}`);
				}
			}, [stats, t]);
			const disarmRebuild = (0, react.useCallback)(() => {
				if (rebuildTimer.current !== null) {
					window.clearTimeout(rebuildTimer.current);
					rebuildTimer.current = null;
				}
				setRebuildArmed(false);
			}, []);
			const armRebuild = (0, react.useCallback)(() => {
				disarmRebuild();
				setRebuildArmed(true);
				rebuildTimer.current = window.setTimeout(() => {
					rebuildTimer.current = null;
					setRebuildArmed(false);
				}, REBUILD_ARM_MS);
			}, [disarmRebuild]);
			const runRebuild = (0, react.useCallback)(async () => {
				disarmRebuild();
				setRebuilding(true);
				setError("");
				try {
					await rebuildStats();
					await load({ noCache: true });
				} catch (e) {
					setError(e instanceof UsageApiError ? e.message : String(e));
				} finally {
					setRebuilding(false);
				}
			}, [disarmRebuild, load]);
			(0, react.useEffect)(() => disarmRebuild, [disarmRebuild]);
			const modelColorMap = (0, react.useMemo)(() => {
				const map = /* @__PURE__ */ new Map();
				(stats?.models ?? []).forEach((m, slot) => {
					map.set(m.model, `var(--dsw-chart-${chartSlot(slot, CHART_HUES)})`);
				});
				return map;
			}, [stats]);
			const colorForModel = (0, react.useCallback)((model) => {
				if (model === OTHER_MODEL) return OTHER_COLOR;
				return modelColorMap.get(model) ?? "var(--dsw-chart-1)";
			}, [modelColorMap]);
			const groupedStats = (0, react.useMemo)(() => {
				if (!stats) return null;
				return {
					models: [...stats.models],
					daily: stats.daily.map((d) => ({
						...d,
						otherByModel: {}
					}))
				};
			}, [stats]);
			const providerColorMap = (0, react.useMemo)(() => {
				const ranked = (stats?.providers ?? []).filter((p) => p.tokens > 0);
				const map = /* @__PURE__ */ new Map();
				ranked.forEach((p, slot) => {
					map.set(p.provider, `var(--dsw-provider-${chartSlot(slot, PROVIDER_HUES)})`);
				});
				return map;
			}, [stats]);
			const colorForProvider = (0, react.useCallback)((provider) => {
				if (provider === OTHER_PROVIDER) return OTHER_PROVIDER_COLOR;
				return providerColorMap.get(provider) ?? "var(--dsw-provider-1)";
			}, [providerColorMap]);
			const groupedProviders = (0, react.useMemo)(() => {
				if (!stats) return null;
				const modelsOf = /* @__PURE__ */ new Map();
				for (const m of stats.models) {
					const list = modelsOf.get(m.provider);
					if (list === void 0) modelsOf.set(m.provider, [m]);
					else list.push(m);
				}
				return stats.providers.filter((p) => p.tokens > 0).map((p) => ({
					...p,
					models: modelsOf.get(p.provider) ?? []
				}));
			}, [stats]);
			const trendDaily = groupedStats?.daily ?? [];
			const trendModels = groupedStats?.models ?? [];
			const rebuildLabel = rebuilding ? `${t("rebuilding")}…` : rebuildArmed ? t("rebuildConfirm") : t("rebuild");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UsageStatsPanel_module_css_default.panel,
				"data-dsh-usage-panel-plus-glass": "panel",
				"aria-busy": loading,
				ref: panelRef,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: UsageStatsPanel_module_css_default.toolbar,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: UsageStatsPanel_module_css_default.group,
								"data-dsh-usage-panel-plus-glass": "group",
								role: "group",
								"aria-label": t("range"),
								children: [RANGE_PRESETS.map((r) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "ghost",
									className: clsx(UsageStatsPanel_module_css_default.segItem, range === r && UsageStatsPanel_module_css_default.segActive),
									"aria-pressed": range === r,
									onClick: () => setRange(r),
									children: t(`rangePreset.${r}`)
								}, r)), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									variant: "ghost",
									className: clsx(UsageStatsPanel_module_css_default.segItem, range === "custom" && UsageStatsPanel_module_css_default.segActive),
									"aria-pressed": range === "custom",
									onClick: () => setRange("custom"),
									children: t("rangeCustom")
								})]
							}),
							range === "custom" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: UsageStatsPanel_module_css_default.customRange,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
										type: "date",
										className: UsageStatsPanel_module_css_default.dateInput,
										value: customFrom,
										max: customTo || void 0,
										onChange: (e) => setCustomFrom(e.target.value),
										"aria-label": t("from")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: UsageStatsPanel_module_css_default.customSep,
										children: "–"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
										type: "date",
										className: UsageStatsPanel_module_css_default.dateInput,
										value: customTo,
										min: customFrom || void 0,
										max: localDay(0),
										onChange: (e) => setCustomTo(e.target.value),
										"aria-label": t("to")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: UsageStatsPanel_module_css_default.actions,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										variant: "outline",
										className: UsageStatsPanel_module_css_default.refresh,
										onClick: () => {
											load({ noCache: true });
										},
										disabled: loading,
										children: t("refresh")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t("exportHint"),
										side: "top",
										portal: true,
										maxWidth: 260,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: "sm",
											variant: "outline",
											className: UsageStatsPanel_module_css_default.exportCsv,
											disabled: stats === null,
											onClick: exportCsv,
											children: t("export")
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t("autoRefreshHint"),
										side: "top",
										portal: true,
										maxWidth: 260,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: "sm",
											variant: "outline",
											className: clsx(UsageStatsPanel_module_css_default.autoToggle, autoRefresh && UsageStatsPanel_module_css_default.autoToggleOn),
											"aria-pressed": autoRefresh,
											onClick: () => {
												toggleAutoRefresh(!autoRefresh);
											},
											children: t("autoRefresh")
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t("rebuildHint"),
										side: "top",
										portal: true,
										maxWidth: 260,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											size: "sm",
											variant: "outline",
											className: clsx(UsageStatsPanel_module_css_default.rebuild, rebuildArmed && UsageStatsPanel_module_css_default.rebuildArmed),
											"aria-pressed": rebuildArmed,
											disabled: rebuilding,
											onClick: () => {
												if (rebuildArmed) runRebuild();
												else armRebuild();
											},
											onBlur: disarmRebuild,
											onKeyDown: (e) => {
												if (e.key === "Escape") disarmRebuild();
											},
											children: rebuildLabel
										})
									})
								]
							})
						]
					}),
					range === "custom" && (!customFrom || !customTo) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.customHint,
						children: t("customIncomplete")
					}),
					loading && stats !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.progressBar,
						role: "presentation"
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.errorBanner,
						role: "alert",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: UsageStatsPanel_module_css_default.errorBannerRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: UsageStatsPanel_module_css_default.errorBannerText,
								children: error
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								variant: "ghost",
								className: UsageStatsPanel_module_css_default.errorRetry,
								onClick: () => {
									load({ noCache: true });
								},
								children: t("retry")
							})]
						})
					}),
					loading && !stats && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: UsageStatsPanel_module_css_default.loading,
						children: [t("loading"), "…"]
					}),
					stats && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCards, {
							stats,
							t
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Heatmap, {
							daily: heatDaily,
							from: heatWindow.from,
							to: heatWindow.to,
							t,
							panelRef
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Deferred, {
							placeholderHeight: 1320,
							rootMarginPx: 240,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DailyTrend, {
									models: trendModels,
									daily: trendDaily,
									granularity: stats?.granularity ?? "day",
									t,
									colorForModel,
									panelRef
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelUsage, {
									models: trendModels,
									t,
									colorForModel,
									panelRef
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderUsage, {
									providers: groupedProviders ?? [],
									t,
									colorForProvider,
									panelRef
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SessionUsage, {
									sessions: stats.sessions ?? [],
									sessionCount: sessionCountOf(stats),
									tokens: stats.tokens,
									unknownRequests: stats.unknownRequests ?? 0,
									t,
									colorForModel
								})
							]
						}),
						stats.to && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: UsageStatsPanel_module_css_default.foot,
							children: [
								t("asOf"),
								" ",
								stats.to,
								updatedAt !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									" · ",
									t("updatedAt"),
									" ",
									clockTime(updatedAt)
								] })
							]
						})
					] }),
					!error && stats && isEmptyRange(stats) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.empty,
						children: t("empty")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.prefGroup,
						"data-dsh-usage-panel-plus-glass": "pref",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatsLineOptions, { t })
					})
				]
			});
		}
		/** A range is empty only when NOTHING was recorded in it: a pure-cache day
		*  (zero input/output but real cache hits) or a failed-call day (requests
		*  but no tokens) both carry real usage and must not read as "no data". */
		function isEmptyRange(stats) {
			return stats.tokens === 0 && stats.cacheHit === 0 && stats.requests === 0 && stats.turns === 0;
		}
		/**
		* One framed preference row: title + subtitle on the left, the switch on the
		* right. The switch mirrors the official DSH switch (role=switch, track +
		* thumb); the shared store keeps each row and its consumer in sync
		* instantly because both run in the same client bundle.
		*/
		function SettingToggle({ title, desc, checked, ariaLabel, onChange }) {
			const descId = (0, react.useId)();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UsageStatsPanel_module_css_default.prefRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.entryOptionText,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.entryOptionTitle,
						children: title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.entryOptionDesc,
						id: descId,
						children: desc
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: UsageStatsPanel_module_css_default.switch,
					role: "switch",
					"aria-checked": checked,
					"aria-label": ariaLabel,
					"aria-describedby": descId,
					onClick: () => {
						onChange(!checked);
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: UsageStatsPanel_module_css_default.switchTrack,
						"data-on": checked || void 0,
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: UsageStatsPanel_module_css_default.switchThumb })
					})
				})]
			});
		}
		/**
		* The three bottom-bar enhancement preferences:
		* "Precise cache hit rate" (two decimals on the usage pill and dialog),
		* "Session token breakdown" (an extra cache-miss row in the usage dialog) and
		* "Streaming throughput" (a live decode-speed estimate while a step streams,
		* replaced by the exact session figure the moment it settles).
		*/
		function StatsLineOptions({ t }) {
			const [cachePrecision, setCachePrecision] = (0, react.useState)(statsLineState.cachePrecision);
			const [tokenDetail, setTokenDetail] = (0, react.useState)(statsLineState.tokenDetail);
			const [streamThroughput, setStreamThroughput] = (0, react.useState)(statsLineState.streamThroughput);
			(0, react.useEffect)(() => statsLineState.subscribe(() => {
				setCachePrecision(statsLineState.cachePrecision);
				setTokenDetail(statsLineState.tokenDetail);
				setStreamThroughput(statsLineState.streamThroughput);
			}), []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingToggle, {
					title: t("cachePrecision"),
					desc: t("cachePrecisionDesc"),
					checked: cachePrecision,
					ariaLabel: t("cachePrecision"),
					onChange: (next) => {
						statsLineState.setCachePrecision(next);
					}
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingToggle, {
					title: t("tokenDetail"),
					desc: t("tokenDetailDesc"),
					checked: tokenDetail,
					ariaLabel: t("tokenDetail"),
					onChange: (next) => {
						statsLineState.setTokenDetail(next);
					}
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingToggle, {
					title: t("streamThroughput"),
					desc: t("streamThroughputDesc"),
					checked: streamThroughput,
					ariaLabel: t("streamThroughput"),
					onChange: (next) => {
						statsLineState.setStreamThroughput(next);
					}
				})
			] });
		}
		function StatCards({ stats, t }) {
			const previous = stats.previous ?? null;
			const sessionCount = sessionCountOf(stats);
			const cards = [
				{
					icon: Coins,
					label: t("tokens"),
					value: formatCompact(stats.tokens),
					hint: t("tokensHint"),
					sub: `${formatTokens(stats.tokens)} ${t("tokensUnit")}`,
					delta: compareChange(stats.tokens, previous?.tokens ?? null)
				},
				{
					icon: MessageSquare,
					label: t("sessions"),
					value: String(sessionCount),
					hint: sessionCount === 0 ? t("noSessions") : t("sessionsHint"),
					sub: t("turnsShort", { n: stats.turns }),
					delta: compareSessions(sessionCount, previous)
				},
				{
					icon: MessagesSquare,
					label: t("requests"),
					value: String(stats.requests),
					delta: compareChange(stats.requests, previous?.requests ?? null)
				},
				{
					icon: Activity,
					label: t("cacheRate"),
					value: cacheRateText(stats.cacheHit, stats.cacheMiss),
					hint: t("cacheRateHint"),
					sub: `${formatCompact(stats.cacheHit)} ${t("cachedTokens")}`,
					delta: compareChange(cacheRate(stats.cacheHit, stats.cacheMiss), previous === null ? null : cacheRate(previous.cacheHit, previous.cacheMiss))
				},
				{
					icon: CalendarDays,
					label: t("activeDays"),
					value: String(stats.activeDays),
					delta: compareChange(stats.activeDays, previous?.activeDays ?? null)
				},
				{
					icon: Cpu,
					label: t("topModel"),
					value: stats.topModel || "—",
					hint: t("topModelHint"),
					modelRef: true
				}
			];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: UsageStatsPanel_module_css_default.cards,
				children: cards.map((c) => {
					const hasDelta = c.delta !== void 0 && c.delta !== null;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: UsageStatsPanel_module_css_default.card,
						"data-dsh-usage-panel-plus-glass": "card",
						title: c.hint,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: UsageStatsPanel_module_css_default.cardHead,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(c.icon, {
									className: UsageStatsPanel_module_css_default.cardIcon,
									size: 14,
									strokeWidth: 2,
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: UsageStatsPanel_module_css_default.cardLabel,
									children: c.label
								})]
							}),
							c.modelRef ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: clsx(UsageStatsPanel_module_css_default.cardValue, UsageStatsPanel_module_css_default.cardValueSm, UsageStatsPanel_module_css_default.cardModelLines),
								children: stats.topModel ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: UsageStatsPanel_module_css_default.modelName,
									children: modelNameOf(stats.topModel)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: UsageStatsPanel_module_css_default.modelProvider,
									children: providerOf(stats.topModel)
								})] }) : "—"
							}) : c.wrap ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: clsx(UsageStatsPanel_module_css_default.cardValue, UsageStatsPanel_module_css_default.cardValueSm, UsageStatsPanel_module_css_default.cardValueWrap),
								children: c.value
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FitText, {
								text: c.value,
								className: clsx(UsageStatsPanel_module_css_default.cardValue, c.sm && UsageStatsPanel_module_css_default.cardValueSm),
								maxSize: c.sm ? 14 : 22
							}),
							(c.sub !== void 0 || hasDelta) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: UsageStatsPanel_module_css_default.cardFoot,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: UsageStatsPanel_module_css_default.cardSub,
									children: c.sub ?? ""
								}), hasDelta && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CompareDelta, {
									change: c.delta,
									t
								})]
							})
						]
					}, c.label);
				})
			});
		}
		/** The period-over-period badge under a card value: an arrow plus the change.
		*  Colours stay neutral — usage going up is neither good nor bad, so the badge
		*  must not editorialize the direction.
		*
		*  A `new` comparison (the previous window held nothing, so there is no ratio to
		*  show) renders NOTHING. It used to print "+ 新增" / "+ New", which is a badge
		*  that states no number: every card whose prior window was empty wore the same
		*  word, so the row of deltas stopped being a column of comparable figures and
		*  became a mix of percentages and prose. The absence of a badge already says
		*  "nothing to compare against", and the hover title still explains it. */
		function CompareDelta({ change, t }) {
			if (change.direction === "new") return null;
			const glyph = change.direction === "up" ? "↑" : change.direction === "down" ? "↓" : "→";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UsageStatsPanel_module_css_default.cardDelta,
				"data-kind": change.direction,
				title: t("comparePrev"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: glyph
					}),
					" ",
					formatPercent(change.percent)
				]
			});
		}
		function FitText({ text, className, maxSize }) {
			const ref = (0, react.useRef)(null);
			const [size, setSize] = (0, react.useState)(maxSize);
			(0, react.useLayoutEffect)(() => {
				const el = ref.current;
				if (!el) return;
				const fit = () => {
					let s = maxSize;
					el.style.fontSize = `${s}px`;
					while (el.scrollWidth > el.clientWidth + 1 && s > 11) {
						s -= .5;
						el.style.fontSize = `${s}px`;
					}
					setSize(s);
				};
				fit();
				const ro = new ResizeObserver(fit);
				ro.observe(el);
				return () => ro.disconnect();
			}, [text, maxSize]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref,
				className,
				style: { fontSize: size },
				children: text
			});
		}
		const HEAT_BASE = 14;
		const HEAT_GAP = 3;
		const HEAT_RX = 3;
		/**
		* Solve the heatmap's geometry for an available width.
		*
		* Two rules, in this order: spend spare width on MORE WEEKS (up to the data
		* window), and only then grow the cells to close the remaining gap. When the
		* window does not fit at the base cell size, trim the earliest weeks and keep
		* the base size.
		*
		* Two off-by-one traps are handled explicitly, because both produce a real
		* overflow at the page's ~900px content width:
		*  - "does it fit" is tested against `totalWeeks` (the laid-out column count,
		*    one more than `cols` when the first week is partial), not `HEAT_WEEKS`;
		*  - the fitting test reserves the trailing gap, so `baseCols` is derived from
		*    `avail - HEAT_GAP` and the rendered width `cols*(size+GAP)+GAP` can never
		*    exceed `avail`.
		*
		* The growth branch runs only when the solved cell size is still at or above
		* the base size; otherwise the window does not truly fit and the trim branch
		* runs. A `max(BASE, size)` fallback would silently render one column too many.
		* @param avail - available width in px.
		* @param startOffset - leading empty cells of the first week (0..6).
		* @returns the cell size, the week count, and the laid-out column count.
		*/
		function heatGeometry(avail, startOffset) {
			const totalWeeks = Math.ceil((364 + startOffset) / 7);
			const baseCols = Math.max(1, Math.floor((avail - HEAT_GAP) / 17));
			if (baseCols >= totalWeeks) {
				const size = (avail - HEAT_GAP) / totalWeeks - HEAT_GAP;
				if (size >= HEAT_BASE) return {
					size,
					cols: 52,
					totalWeeks
				};
			}
			const tracksFor = (c) => Math.max(c, Math.ceil((c * 7 + startOffset) / 7));
			let cols = Math.max(1, Math.min(baseCols, 52));
			while (cols > 1 && tracksFor(cols) > baseCols) cols -= 1;
			const totalCols = tracksFor(cols);
			const size = (avail - HEAT_GAP) / totalCols - HEAT_GAP;
			return {
				size: Math.max(HEAT_BASE, size),
				cols,
				totalWeeks: totalCols
			};
		}
		function Heatmap({ daily, from, to, t, panelRef }) {
			const byDay = (0, react.useMemo)(() => {
				const map = /* @__PURE__ */ new Map();
				for (const d of daily) map.set(d.day, d);
				return map;
			}, [daily]);
			const [tip, setTip] = (0, react.useState)(null);
			const wrapRef = (0, react.useRef)(null);
			const [geom, setGeom] = (0, react.useState)(() => heatGeometry(728, 0));
			(0, react.useEffect)(() => {
				const el = wrapRef.current;
				if (!el) return;
				const update = () => {
					const next = heatGeometry(Math.max(1, el.clientWidth - 2), (indexOfDay(from) + 1) % 7);
					setGeom((prev) => prev.size === next.size && prev.cols === next.cols ? prev : next);
				};
				update();
				const ro = new ResizeObserver(update);
				ro.observe(el);
				return () => ro.disconnect();
			}, [from]);
			const allDays = daysInRange(from, to);
			if (allDays.length === 0) return null;
			const days = allDays.slice(-Math.min(geom.cols * 7, allDays.length));
			const max = Math.max(1, ...days.map((d) => byDay.get(d)?.total ?? 0));
			const rows = 7;
			const startOffset = days[0] ? (indexOfDay(days[0]) + 1) % 7 : 0;
			const weeks = geom.totalWeeks;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: UsageStatsPanel_module_css_default.section,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.sectionHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: UsageStatsPanel_module_css_default.sectionTitle,
						children: t("heatmap")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: UsageStatsPanel_module_css_default.heatLegend,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("heatLess") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
								className: clsx(UsageStatsPanel_module_css_default.heatCell, UsageStatsPanel_module_css_default.heatLevel1),
								style: {
									width: geom.size,
									height: geom.size
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
								className: clsx(UsageStatsPanel_module_css_default.heatCell, UsageStatsPanel_module_css_default.heatLevel2),
								style: {
									width: geom.size,
									height: geom.size
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
								className: clsx(UsageStatsPanel_module_css_default.heatCell, UsageStatsPanel_module_css_default.heatLevel3),
								style: {
									width: geom.size,
									height: geom.size
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
								className: clsx(UsageStatsPanel_module_css_default.heatCell, UsageStatsPanel_module_css_default.heatLevel4),
								style: {
									width: geom.size,
									height: geom.size
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
								className: clsx(UsageStatsPanel_module_css_default.heatCell, UsageStatsPanel_module_css_default.heatLevel5),
								style: {
									width: geom.size,
									height: geom.size
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("heatMore") })
						]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.heatWrap,
					ref: wrapRef,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
						className: UsageStatsPanel_module_css_default.heatmap,
						width: weeks * (geom.size + HEAT_GAP) + HEAT_GAP,
						height: rows * (geom.size + HEAT_GAP) + HEAT_GAP,
						role: "img",
						"aria-label": t("heatmap"),
						children: days.map((day, i) => {
							const col = Math.floor((i + startOffset) / 7);
							const row = (i + startOffset) % 7;
							const rec = byDay.get(day);
							const tokens = rec?.total ?? 0;
							const level = tokens === 0 ? 0 : 1 + Math.floor(tokens / max * 4);
							const x = HEAT_GAP + col * (geom.size + HEAT_GAP);
							const y = HEAT_GAP + row * (geom.size + HEAT_GAP);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
								className: clsx(UsageStatsPanel_module_css_default.heatCell, level === 0 && UsageStatsPanel_module_css_default.heatLevel0, level === 1 && UsageStatsPanel_module_css_default.heatLevel1, level === 2 && UsageStatsPanel_module_css_default.heatLevel2, level === 3 && UsageStatsPanel_module_css_default.heatLevel3, level === 4 && UsageStatsPanel_module_css_default.heatLevel4, level === 5 && UsageStatsPanel_module_css_default.heatLevel5),
								x,
								y,
								width: geom.size,
								height: geom.size,
								rx: HEAT_RX,
								onMouseEnter: (e) => {
									setTip({
										day,
										tokens,
										requests: rec?.requests ?? 0,
										cacheHit: rec?.cacheHit ?? 0,
										cacheMiss: rec?.cacheMiss ?? 0,
										anchor: e.currentTarget
									});
								},
								onMouseLeave: () => setTip(null)
							}, day);
						})
					}), tip && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ChartTip, {
						anchor: tip.anchor,
						panelRef,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: UsageStatsPanel_module_css_default.tipTitle,
								children: tip.day
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								t("tokens"),
								": ",
								formatTokens(tip.tokens)
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								t("requests"),
								": ",
								tip.requests
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								t("cacheHitRate"),
								": ",
								cacheRateText(tip.cacheHit, tip.cacheMiss)
							] })
						]
					})]
				})]
			});
		}
		function DailyTrend({ models, daily, granularity, t, colorForModel, panelRef }) {
			const [tip, setTip] = (0, react.useState)(null);
			const [hover, setHover] = (0, react.useState)(null);
			const wrapRef = (0, react.useRef)(null);
			const W = 720;
			const H = 220;
			const padL = 46;
			const padR = 65;
			const padT = 10;
			const plotH = 184;
			const MIN_PITCH = 4;
			const [view, setView] = (0, react.useState)({
				avail: W,
				trimN: TREND_MAX_DAYS
			});
			(0, react.useEffect)(() => {
				const el = wrapRef.current;
				if (!el || daily.length === 0) return;
				const update = () => {
					const avail = Math.max(1, el.clientWidth);
					const maxN = Math.floor((avail - padL - padR) / MIN_PITCH) + 1;
					const trimN = Math.max(1, Math.min(daily.length, TREND_MAX_DAYS, maxN));
					setView((prev) => prev.avail === avail && prev.trimN === trimN ? prev : {
						avail,
						trimN
					});
				};
				update();
				const ro = new ResizeObserver(update);
				ro.observe(el);
				return () => ro.disconnect();
			}, [daily.length]);
			if (daily.length === 0) return null;
			const visible = daily.slice(-view.trimN);
			const trendCapped = daily.length > view.trimN;
			const n = visible.length;
			const step = n > 1 ? (view.avail - padL - padR) / (n - 1) : Math.max(1, view.avail - padL - padR);
			const barW = Math.max(3, Math.min(30, step * .62));
			const barHalf = barW / 2;
			const plotWUsed = view.avail;
			const maxTotal = Math.max(1, ...visible.map((d) => d.total));
			const ticks = niceTicks(maxTotal, 4);
			const labelEvery = Math.max(1, Math.ceil(46 / step));
			const trendPoints = [];
			const trendPointByDay = /* @__PURE__ */ new Map();
			visible.forEach((d, i) => {
				const rate = cacheRate(d.cacheHit, d.cacheMiss);
				if (rate === null) return;
				const pt = {
					x: padL + barHalf + i * step,
					y: 194 - rate / 100 * plotH
				};
				trendPoints.push(pt);
				trendPointByDay.set(d.day, pt);
			});
			const trendPath = smoothPath(trendPoints);
			const trendTipPt = tip ? trendPointByDay.get(tip.day) : void 0;
			const rateTicks = [
				0,
				25,
				50,
				75,
				100
			];
			const legendModels = modelOrderOf(models, aggregateByModel(daily));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: UsageStatsPanel_module_css_default.section,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.sectionHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: UsageStatsPanel_module_css_default.sectionTitle,
						children: t(granularity === "hour" ? "hourlyTrend" : "dailyTrend")
					}), trendCapped && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: UsageStatsPanel_module_css_default.trendNote,
						children: t("trendLimited").replace("{n}", String(view.trimN))
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.chartWrap,
					ref: wrapRef,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
							className: UsageStatsPanel_module_css_default.chart,
							width: "100%",
							height: H,
							viewBox: `0 0 ${plotWUsed} ${H}`,
							onMouseLeave: () => {
								setTip(null);
								setHover(null);
							},
							children: [
								ticks.map((tk) => {
									const y = 194 - tk / maxTotal * plotH;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
										className: UsageStatsPanel_module_css_default.grid,
										x1: padL,
										y1: y,
										x2: padL + (n - 1) * step + barW,
										y2: y
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
										className: UsageStatsPanel_module_css_default.axis,
										x: 40,
										y: y + 3,
										textAnchor: "end",
										children: formatCompact(tk)
									})] }, tk);
								}),
								visible.map((d, i) => {
									const x = padL + barHalf + i * step - barW / 2;
									const dayOrder = legendModels.filter((m) => d.byModel[m] !== void 0);
									let yBottom = 194;
									const bars = dayOrder.map((model) => {
										const tokens = d.byModel[model];
										const h = tokens / maxTotal * plotH;
										const y = yBottom - h;
										yBottom = y;
										return {
											model,
											tokens,
											x,
											y,
											h,
											color: colorForModel(model),
											dimmed: hover !== null && hover !== model
										};
									});
									const hovered = tip?.day === d.day;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", { children: [
										bars.map((b) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											className: clsx(UsageStatsPanel_module_css_default.bar, b.dimmed && UsageStatsPanel_module_css_default.barDim),
											x: b.x,
											y: b.y,
											width: barW,
											height: b.h,
											fill: b.color,
											style: hovered ? { transform: `scaleX(${(barW + 3) / barW})` } : void 0
										}, `${d.day}-${b.model}`)),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
											className: UsageStatsPanel_module_css_default.barHit,
											x,
											y: padT,
											width: barW,
											height: plotH,
											onMouseEnter: (e) => {
												setTip({
													day: d.day,
													total: d.total,
													byModel: d.byModel,
													otherByModel: d.otherByModel,
													cacheHit: d.cacheHit,
													cacheMiss: d.cacheMiss,
													anchor: e.currentTarget
												});
											},
											onMouseLeave: () => setTip(null)
										}),
										(i % labelEvery === 0 || i === n - 1) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
											className: UsageStatsPanel_module_css_default.axis,
											x: padL + barHalf + i * step,
											y: 212,
											textAnchor: "middle",
											children: bucketAxisLabel(d.day, granularity)
										})
									] }, d.day);
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									className: UsageStatsPanel_module_css_default.trend,
									d: trendPath,
									fill: "none",
									strokeWidth: 2,
									strokeLinejoin: "round",
									strokeLinecap: "round"
								}),
								trendTipPt && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									className: UsageStatsPanel_module_css_default.trendDot,
									cx: trendTipPt.x,
									cy: trendTipPt.y,
									r: 4
								}),
								rateTicks.map((p) => {
									const y = 194 - p / 100 * plotH;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("text", {
										className: clsx(UsageStatsPanel_module_css_default.axis, UsageStatsPanel_module_css_default.axisRate),
										x: padL + (n - 1) * step + barW + 8,
										y: y + 3,
										children: [p, "%"]
									}) }, `rate-${p}`);
								})
							]
						}),
						tip && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ChartTip, {
							anchor: tip.anchor,
							panelRef,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: UsageStatsPanel_module_css_default.tipTitle,
									children: bucketTitle(tip.day, granularity)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									t("total"),
									": ",
									formatTokens(tip.total)
								] }),
								legendModels.filter((m) => tip.byModel[m] !== void 0).map((m) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: UsageStatsPanel_module_css_default.tipRow,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											className: UsageStatsPanel_module_css_default.legendSwatch,
											style: { background: colorForModel(m) }
										}),
										m,
										": ",
										formatTokens(tip.byModel[m])
									]
								}, m)),
								tip.otherByModel && Object.entries(tip.otherByModel).sort((a, b) => b[1] - a[1]).map(([m, v]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: clsx(UsageStatsPanel_module_css_default.tipRow, UsageStatsPanel_module_css_default.tipRowOther),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											className: UsageStatsPanel_module_css_default.legendSwatch,
											style: { background: OTHER_COLOR }
										}),
										m,
										": ",
										formatTokens(v)
									]
								}, m)),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									t("cacheHitRate"),
									": ",
									cacheRateText(tip.cacheHit, tip.cacheMiss)
								] })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: UsageStatsPanel_module_css_default.legend,
							children: [legendModels.map((model) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: UsageStatsPanel_module_css_default.legendItem,
								onMouseEnter: () => setHover(model),
								onMouseLeave: () => setHover(null),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
									className: UsageStatsPanel_module_css_default.legendSwatch,
									style: { background: colorForModel(model) }
								}), model]
							}, model)), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: UsageStatsPanel_module_css_default.legendItem,
								"aria-hidden": "true",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: clsx(UsageStatsPanel_module_css_default.legendSwatch, UsageStatsPanel_module_css_default.legendTrend) }), t("hitRateLegend")]
							})]
						})
					]
				})]
			});
		}
		function ModelUsage({ models, t, colorForModel, panelRef }) {
			const [tip, setTip] = (0, react.useState)(null);
			const [hover, setHover] = (0, react.useState)(null);
			const rowRef = (0, react.useRef)(null);
			const size = useDonutSize(rowRef);
			if (models.length === 0) return null;
			const segments = models.map((m) => ({
				key: m.model,
				tokens: m.tokens,
				color: colorForModel(m.model),
				label: `${m.model}: ${formatTokens(m.tokens)} (${formatPercent(m.percent)})`
			}));
			const total = models.reduce((sum, m) => sum + m.tokens, 0);
			const highlight = (key, anchor) => {
				setHover(key);
				const m = key === null ? void 0 : models.find((x) => x.model === key);
				setTip(m !== void 0 && anchor !== void 0 ? {
					model: m.model,
					tokens: m.tokens,
					percent: m.percent,
					anchor
				} : null);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: UsageStatsPanel_module_css_default.section,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.sectionHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: UsageStatsPanel_module_css_default.sectionTitle,
						children: t("modelUsage")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: UsageStatsPanel_module_css_default.trendNote,
						children: t("modelUsageHint", { n: models.length })
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.models,
					ref: rowRef,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: UsageStatsPanel_module_css_default.donutWrap,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Donut, {
							segments,
							size,
							ariaLabel: t("modelUsage"),
							centerValue: formatCompact(total),
							centerCaption: t("tokens"),
							hovered: hover,
							onHover: highlight
						}), tip && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ChartTip, {
							anchor: tip.anchor,
							panelRef,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: UsageStatsPanel_module_css_default.tipTitle,
									children: tip.model
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									t("total"),
									": ",
									formatTokens(tip.tokens)
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									t("percent"),
									": ",
									formatPercent(tip.percent)
								] })
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.modelScroll,
						"data-dsh-usage-panel-plus-glass": "list",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: UsageStatsPanel_module_css_default.modelList,
							children: models.map((m, rank) => {
								const accent = colorForModel(m.model);
								const percent = Math.min(100, Math.max(0, m.percent));
								const rate = m.cacheHit === void 0 || m.cacheMiss === void 0 ? null : cacheRateText(m.cacheHit, m.cacheMiss);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									className: UsageStatsPanel_module_css_default.modelRow,
									onMouseEnter: () => highlight(m.model),
									onMouseLeave: () => highlight(null),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: UsageStatsPanel_module_css_default.modelRank,
											"aria-hidden": "true",
											children: rank + 1
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											className: UsageStatsPanel_module_css_default.legendSwatch,
											style: { background: accent }
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: UsageStatsPanel_module_css_default.modelId,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: UsageStatsPanel_module_css_default.modelName,
												children: modelNameOf(m.model)
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: UsageStatsPanel_module_css_default.modelMeta,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.modelProvider,
														children: providerOf(m.model)
													}),
													rate !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.modelDot,
														"aria-hidden": "true",
														children: "·"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
														className: UsageStatsPanel_module_css_default.modelHitRate,
														title: `${t("hitRateLabel")}: ${t("cacheRateHint")}`,
														"aria-label": rate === null ? t("hitRateLabel") : `${t("hitRateLabel")} ${rate}`,
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Database, {
															size: 9,
															"aria-hidden": "true"
														}), rate === null ? t("hitRateNone") : t("hitRateShort", { rate })]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: UsageStatsPanel_module_css_default.modelValues,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: UsageStatsPanel_module_css_default.modelTokens,
												children: formatCompact(m.tokens)
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: UsageStatsPanel_module_css_default.modelPct,
												children: formatPercent(percent)
											})]
										})
									]
								}, m.model);
							})
						})
					})]
				})]
			});
		}
		function ProviderUsage({ providers, t, colorForProvider, panelRef }) {
			const [tip, setTip] = (0, react.useState)(null);
			const [hover, setHover] = (0, react.useState)(null);
			const [open, setOpen] = (0, react.useState)(NO_KEYS);
			const rowRef = (0, react.useRef)(null);
			const size = useDonutSize(rowRef);
			if (providers.length === 0) return null;
			const flip = (key) => {
				setOpen((prev) => toggleIn(prev, key));
			};
			const segments = providers.map((p) => ({
				key: p.provider,
				tokens: p.tokens,
				color: colorForProvider(p.provider),
				label: `${p.provider}: ${formatTokens(p.tokens)} (${formatPercent(p.percent)})`
			}));
			const total = providers.reduce((sum, p) => sum + p.tokens, 0);
			const highlight = (key, anchor) => {
				setHover(key);
				const p = key === null ? void 0 : providers.find((x) => x.provider === key);
				setTip(p !== void 0 && anchor !== void 0 ? {
					provider: p.provider,
					tokens: p.tokens,
					percent: p.percent,
					anchor,
					models: p.models
				} : null);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: UsageStatsPanel_module_css_default.section,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.sectionHead,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: UsageStatsPanel_module_css_default.sectionTitle,
						children: t("providerUsage")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: UsageStatsPanel_module_css_default.trendNote,
						children: t("providerUsageHint", { n: providers.length })
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UsageStatsPanel_module_css_default.models,
					ref: rowRef,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: UsageStatsPanel_module_css_default.donutWrap,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Donut, {
							segments,
							size,
							ariaLabel: t("providerUsage"),
							centerValue: formatCompact(total),
							centerCaption: t("tokens"),
							hovered: hover,
							onHover: highlight
						}), tip && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ChartTip, {
							anchor: tip.anchor,
							panelRef,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: UsageStatsPanel_module_css_default.tipTitle,
									children: tip.provider
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									t("total"),
									": ",
									formatTokens(tip.tokens)
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
									t("percent"),
									": ",
									formatPercent(tip.percent)
								] }),
								tip.models.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: UsageStatsPanel_module_css_default.tipBreakdown,
									children: tip.models.map((m) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: clsx(UsageStatsPanel_module_css_default.tipRow, UsageStatsPanel_module_css_default.tipRowOther),
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
												className: UsageStatsPanel_module_css_default.legendSwatch,
												style: { background: colorForProvider(tip.provider) }
											}),
											modelNameOf(m.model),
											": ",
											formatTokens(m.tokens)
										]
									}, m.model))
								})
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: UsageStatsPanel_module_css_default.modelScroll,
						"data-dsh-usage-panel-plus-glass": "list",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: UsageStatsPanel_module_css_default.modelList,
							children: providers.map((p, rank) => {
								const isOpen = open.has(p.provider);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									className: clsx(UsageStatsPanel_module_css_default.modelRow, UsageStatsPanel_module_css_default.modelRowExpandable),
									onMouseEnter: () => highlight(p.provider),
									onMouseLeave: () => highlight(null),
									onClick: () => flip(p.provider),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: UsageStatsPanel_module_css_default.modelRank,
											"aria-hidden": "true",
											children: rank + 1
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											className: UsageStatsPanel_module_css_default.legendSwatch,
											style: { background: colorForProvider(p.provider) }
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: UsageStatsPanel_module_css_default.modelId,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: UsageStatsPanel_module_css_default.modelName,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: UsageStatsPanel_module_css_default.modelToggle,
													onClick: (e) => {
														e.stopPropagation();
														flip(p.provider);
													},
													"aria-expanded": isOpen,
													"aria-label": p.provider,
													children: isOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronDown, { size: 12 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronRight, { size: 12 })
												}), p.provider]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: UsageStatsPanel_module_css_default.modelProvider,
												children: t("providerModels", { n: p.models.length })
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: UsageStatsPanel_module_css_default.modelValues,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: UsageStatsPanel_module_css_default.modelTokens,
												children: formatCompact(p.tokens)
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: UsageStatsPanel_module_css_default.modelPct,
												children: formatPercent(p.percent)
											})]
										})
									]
								}), p.models.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
									className: clsx(UsageStatsPanel_module_css_default.modelOtherWrap, isOpen && UsageStatsPanel_module_css_default.modelOtherOpen),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: UsageStatsPanel_module_css_default.modelOtherList,
										children: p.models.map((m) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
											className: clsx(UsageStatsPanel_module_css_default.modelRow, UsageStatsPanel_module_css_default.modelRowSub),
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
													className: UsageStatsPanel_module_css_default.legendSwatch,
													style: { background: colorForProvider(p.provider) }
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													className: UsageStatsPanel_module_css_default.modelId,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.modelName,
														children: modelNameOf(m.model)
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: UsageStatsPanel_module_css_default.modelValues,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.modelTokens,
														children: formatCompact(m.tokens)
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: UsageStatsPanel_module_css_default.modelPct,
														children: formatPercent(m.percent)
													})]
												})
											]
										}, m.model))
									})
								})] }, p.provider);
							})
						})
					})]
				})]
			});
		}
		/** Toggle one key in an immutable string set (a fresh Set every call, so React
		*  sees a state change and unrelated keys keep their state). */
		function toggleIn(set, key) {
			const next = new Set(set);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		}
		function aggregateByModel(daily) {
			const out = {};
			for (const d of daily) for (const [m, v] of Object.entries(d.byModel)) out[m] = (out[m] ?? 0) + v;
			return out;
		}
		/** The legend model order is the overall usage ranking — every model, no
		*  pinned tail, because every model is a legend entry of its own now. */
		function modelOrderOf(models, dailyAgg) {
			return models.filter((m) => dailyAgg[m.model] !== void 0).map((m) => m.model);
		}
		//#endregion
		//#region src/client/stats-icon.tsx
		/**
		* The "usage statistics" glyph — the lucide BarChart3 icon, used by the
		* sidebar's panel row. Kept as its own module so the path data has a single
		* authority and the SVG stays identical wherever it is rendered.
		*/
		/** The lucide BarChart3 path data (24x24 stroke icon). */
		const STATS_ICON_PATH = "M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3";
		/**
		* Lucide's default weight is 2 on its 24-unit grid, which the sidebar's 16px
		* cell scales to 1.33px — a third heavier than the shipped panel rows, whose
		* glyphs draw on a 16-unit grid at stroke 1 (`ICON_REGULAR_STROKE`). At 1.5
		* the same 16px cell renders exactly 1px, so this row reads at the weight of
		* the Plugins and Schedules rows beside it (issue #12).
		*/
		const ICON_STROKE_WIDTH = 1.5;
		/** The statistics icon as a React element, sized by the sidebar's icon share. */
		function StatsIcon({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className,
				viewBox: "0 0 24 24",
				width: size,
				height: size,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: ICON_STROKE_WIDTH,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: STATS_ICON_PATH })
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* Usage panel dictionaries, registered into the DSH locale service. The keys
		* mirror the reasonix stats locale block (settings.stats.*) plus the PR#7503
		* additions ("Other", 180-day trend note); values are the same Chinese and
		* English copy with the zh-TW variant transliterated.
		*/
		/** The locale namespace this plugin owns. */
		const LOCALE_NS = "usagePanelPlus";
		const en = {
			nav: "Usage statistics",
			back: "Back",
			range: "Time range",
			"rangePreset.today": "Today",
			"rangePreset.3": "3d",
			"rangePreset.7": "7d",
			"rangePreset.14": "14d",
			"rangePreset.30": "30d",
			"rangePreset.90": "90d",
			"rangePreset.all": "All",
			rangeCustom: "Custom",
			from: "From",
			to: "To",
			refresh: "Refresh",
			retry: "Retry",
			customIncomplete: "Pick both dates.",
			rebuild: "Rebuild",
			rebuildConfirm: "Rebuild?",
			rebuilding: "Rebuilding",
			rebuildHint: "Rebuild the statistics from session logs: clear the local cache and replay every session. Use it when the figures look wrong.",
			export: "Export CSV",
			exportHint: "Export this range as CSV: summary, daily, model, provider and session rows.",
			exportFailed: "Export failed",
			autoRefresh: "Auto refresh",
			autoRefreshHint: "Refresh every 60 seconds while this page is visible; paused while it is hidden.",
			updatedAt: "Updated at",
			loading: "Loading",
			tokens: "Token usage",
			tokensUnit: "tokens",
			tokensHint: "Provider-visible total: uncached input + output + cached tokens",
			cachedTokens: "cached",
			hitRateShort: "{rate}",
			hitRateNone: "—",
			hitRateLabel: "Cache hit rate",
			sessions: "Sessions",
			sessionsHint: "Sessions with at least one model call in the range; turns count completed turns only. Sessions whose logs were deleted cannot be reconstructed.",
			turnsShort: "{n} turns",
			requests: "Requests",
			requestsShort: "Requests",
			activeDays: "Active days",
			cacheRate: "Avg cache hit rate",
			cacheRateHint: "Cached input tokens as a share of all input tokens in the range",
			comparePrev: "vs previous period",
			cacheHitRate: "Cache hit rate",
			hitRateLegend: "Cache hit rate",
			topModel: "Top model",
			topModelHint: "Ranked by token volume, not call count",
			heatmap: "Activity heatmap",
			heatLess: "Less",
			heatMore: "More",
			dailyTrend: "Daily token trend",
			hourlyTrend: "Hourly token trend",
			trendLimited: "Showing the latest {n} days",
			sessionUsage: "Session usage",
			sessionUsageHint: "{n} sessions · only conversations whose logs still exist",
			sessionTopModels: "Model breakdown",
			sessionTruncated: "Showing the top {shown} of {total} sessions",
			lastActive: "Last active",
			noSessions: "No sessions recorded in this range.",
			unknownRequests: "{n} requests without model attribution",
			modelUsage: "Model usage",
			modelUsageHint: "{n} models",
			providerUsage: "Provider usage",
			providerUsageHint: "{n} providers · open a row for its models",
			providerModels: "{n} models",
			other: "Other",
			total: "Total",
			percent: "Share",
			asOf: "As of",
			empty: "No usage data in this time range yet. Token usage is recorded from the day the panel is installed, including a one-time scan of your existing sessions.",
			cachePrecision: "Precise cache hit rate",
			cachePrecisionDesc: "Show the cache hit rate with two decimals in the conversation bottom bar.",
			tokenDetail: "Conversation token breakdown",
			tokenDetailDesc: "Show total, cache hit/miss and output tokens in the conversation bottom bar.",
			streamThroughput: "Streaming throughput",
			streamThroughputDesc: "Show an estimated decode speed in the conversation bottom bar while a response streams, then the exact session figure once it settles.",
			"stats.counts": "{turns} turns · {steps} steps",
			"stats.tokensPerSecond": "{throughput} tok/s",
			"stats.cacheHit": "Cache hit {percent}%",
			"stats.cacheMiss": "Cache miss",
			"stats.dialog.title": "Time & speed",
			"stats.dialog.usageTitle": "Token usage",
			"stats.dialog.llmTime": "LLM time",
			"stats.dialog.toolTime": "Tool time",
			"stats.dialog.ttft": "Mean TTFT",
			"stats.dialog.speed": "Decode speed",
			"message.turnUsage.count": "{count} tok",
			"message.turnUsage.cacheHit": "Cache hit",
			"message.turnUsage.input": "Input",
			"message.turnUsage.cacheRead": "Cache read",
			"message.turnUsage.cacheWrite": "Cache write",
			"message.turnUsage.output": "Output"
		};
		const zh = {
			nav: "使用统计",
			back: "返回",
			range: "时间范围",
			"rangePreset.today": "今日",
			"rangePreset.3": "3 天",
			"rangePreset.7": "7 天",
			"rangePreset.14": "14 天",
			"rangePreset.30": "30 天",
			"rangePreset.90": "90 天",
			"rangePreset.all": "全部",
			rangeCustom: "自定义",
			from: "开始日期",
			to: "结束日期",
			refresh: "刷新",
			retry: "重试",
			customIncomplete: "请选择起止日期",
			rebuild: "重建统计",
			rebuildConfirm: "确认重建？",
			rebuilding: "重建中",
			rebuildHint: "按会话日志重建统计：清空本地统计缓存并重放全部会话。数字异常时使用。",
			export: "导出 CSV",
			exportHint: "导出当前时间范围的明细（CSV，含汇总、按天、模型、供应商、会话）。",
			exportFailed: "导出失败",
			autoRefresh: "自动刷新",
			autoRefreshHint: "页面可见时每 60 秒自动刷新一次；页面不可见时暂停。",
			updatedAt: "更新于",
			loading: "加载中",
			tokens: "Tokens 用量",
			tokensUnit: "tokens",
			tokensHint: "服务商总口径：未缓存输入 + 输出 + 缓存命中 token",
			cachedTokens: "缓存命中",
			hitRateShort: "{rate}",
			hitRateNone: "—",
			hitRateLabel: "缓存命中率",
			sessions: "会话数量",
			sessionsHint: "统计范围内有模型调用的会话数；轮次只计已完成的 turn。日志已删除的会话无法还原。",
			turnsShort: "{n} 轮",
			requests: "请求数量",
			requestsShort: "请求",
			activeDays: "活跃天数",
			cacheRate: "平均缓存命中率",
			cacheRateHint: "时间段内缓存命中 token 占输入 token 的比例",
			comparePrev: "较上期",
			cacheHitRate: "缓存命中率",
			hitRateLegend: "缓存命中率",
			topModel: "最常用模型",
			topModelHint: "按 token 用量排序，非调用次数",
			heatmap: "活跃热力图",
			heatLess: "较少",
			heatMore: "较多",
			dailyTrend: "按天 Token 趋势",
			hourlyTrend: "按小时 Token 趋势",
			trendLimited: "仅显示最近 {n} 天",
			sessionUsage: "会话用量",
			sessionUsageHint: "{n} 个会话 · 仅含日志仍存在的会话",
			sessionTopModels: "模型明细",
			sessionTruncated: "仅显示前 {shown} 个会话（共 {total} 个）",
			lastActive: "最后活跃",
			noSessions: "当前时间范围内没有会话记录。",
			unknownRequests: "{n} 个请求未归因到模型",
			modelUsage: "模型用量",
			modelUsageHint: "{n} 个模型",
			providerUsage: "各供应商用量",
			providerUsageHint: "{n} 个供应商 · 展开可见其模型",
			providerModels: "{n} 个模型",
			other: "其他",
			total: "总用量",
			percent: "占比",
			asOf: "统计截至",
			empty: "当前时间范围内暂无用量数据。Token 用量从本面板启用后开始累计，并会一次性回扫已有的历史会话。",
			cachePrecision: "精确缓存命中率",
			cachePrecisionDesc: "在会话底部信息栏以两位小数显示缓存命中率。",
			tokenDetail: "会话 Token 明细",
			tokenDetailDesc: "在会话底部信息栏显示总 Token、命中/未命中缓存与输出明细。",
			streamThroughput: "流式吞吐速度",
			streamThroughputDesc: "输出过程中在会话底部信息栏显示估算的解码速度，输出结束后回到会话累计的精确值。",
			"stats.counts": "{turns} 轮 · {steps} 步",
			"stats.tokensPerSecond": "{throughput} tok/s",
			"stats.cacheHit": "缓存命中 {percent}%",
			"stats.cacheMiss": "未命中缓存",
			"stats.dialog.title": "用时与速度",
			"stats.dialog.usageTitle": "Token 用量",
			"stats.dialog.llmTime": "LLM 用时",
			"stats.dialog.toolTime": "工具用时",
			"stats.dialog.ttft": "首 token 平均",
			"stats.dialog.speed": "解码速度",
			"message.turnUsage.count": "{count} tok",
			"message.turnUsage.cacheHit": "缓存命中",
			"message.turnUsage.input": "输入",
			"message.turnUsage.cacheRead": "缓存读取",
			"message.turnUsage.cacheWrite": "缓存写入",
			"message.turnUsage.output": "输出"
		};
		const zhTW = {
			nav: "使用統計",
			back: "返回",
			range: "時間範圍",
			"rangePreset.today": "今日",
			"rangePreset.3": "3 天",
			"rangePreset.7": "7 天",
			"rangePreset.14": "14 天",
			"rangePreset.30": "30 天",
			"rangePreset.90": "90 天",
			"rangePreset.all": "全部",
			rangeCustom: "自訂",
			from: "開始日期",
			to: "結束日期",
			refresh: "重新整理",
			retry: "重試",
			customIncomplete: "請選擇起止日期",
			rebuild: "重建統計",
			rebuildConfirm: "確認重建？",
			rebuilding: "重建中",
			rebuildHint: "依會話日誌重建統計：清空本機統計快取並重放全部會話。數字異常時使用。",
			export: "匯出 CSV",
			exportHint: "匯出目前時間範圍的明細（CSV，含彙總、每日、模型、供應商、會話）。",
			exportFailed: "匯出失敗",
			autoRefresh: "自動重新整理",
			autoRefreshHint: "頁面可見時每 60 秒自動重新整理一次；頁面不可見時暫停。",
			updatedAt: "更新於",
			loading: "載入中",
			tokens: "Tokens 用量",
			tokensUnit: "tokens",
			tokensHint: "服務商總口徑：未快取輸入 + 輸出 + 快取命中 token",
			cachedTokens: "快取命中",
			hitRateShort: "{rate}",
			hitRateNone: "—",
			hitRateLabel: "快取命中率",
			sessions: "會話數量",
			sessionsHint: "統計範圍內有模型呼叫的會話數；輪次只計已完成的 turn。日誌已刪除的會話無法還原。",
			turnsShort: "{n} 輪",
			requests: "請求數量",
			requestsShort: "請求",
			activeDays: "活躍天數",
			cacheRate: "平均快取命中率",
			cacheRateHint: "時間範圍內快取命中 token 佔輸入 token 的比例",
			comparePrev: "較上期",
			cacheHitRate: "快取命中率",
			hitRateLegend: "快取命中率",
			topModel: "最常用模型",
			topModelHint: "依 token 用量排序，非呼叫次數",
			heatmap: "活躍熱力圖",
			heatLess: "較少",
			heatMore: "較多",
			dailyTrend: "每日 Token 趨勢",
			hourlyTrend: "每小時 Token 趨勢",
			trendLimited: "僅顯示最近 {n} 天",
			sessionUsage: "會話用量",
			sessionUsageHint: "{n} 個會話 · 僅含日誌仍存在的會話",
			sessionTopModels: "模型明細",
			sessionTruncated: "僅顯示前 {shown} 個會話（共 {total} 個）",
			lastActive: "最後活躍",
			noSessions: "目前時間範圍內沒有會話紀錄。",
			unknownRequests: "{n} 個請求未歸因到模型",
			modelUsage: "模型用量",
			modelUsageHint: "{n} 個模型",
			providerUsage: "各供應商用量",
			providerUsageHint: "{n} 個供應商 · 展開可見其模型",
			providerModels: "{n} 個模型",
			other: "其他",
			total: "總用量",
			percent: "佔比",
			asOf: "統計截至",
			empty: "目前時間範圍內尚無用量資料。Token 用量自本面板啟用後開始累計，並會一次掃描既有的歷史會話。",
			cachePrecision: "精確快取命中率",
			cachePrecisionDesc: "在會話底部資訊欄以兩位小數顯示快取命中率。",
			tokenDetail: "會話 Token 明細",
			tokenDetailDesc: "在會話底部資訊欄顯示總 Token、命中/未命中快取與輸出明細。",
			streamThroughput: "串流吞吐速度",
			streamThroughputDesc: "輸出過程中在會話底部資訊欄顯示估算的解碼速度，輸出結束後回到會話累計的精確值。",
			"stats.counts": "{turns} 輪 · {steps} 步",
			"stats.tokensPerSecond": "{throughput} tok/s",
			"stats.cacheHit": "快取命中 {percent}%",
			"stats.cacheMiss": "未命中快取",
			"stats.dialog.title": "用時與速度",
			"stats.dialog.usageTitle": "Token 用量",
			"stats.dialog.llmTime": "LLM 用時",
			"stats.dialog.toolTime": "工具用時",
			"stats.dialog.ttft": "首 token 平均",
			"stats.dialog.speed": "解碼速度",
			"message.turnUsage.count": "{count} tok",
			"message.turnUsage.cacheHit": "快取命中",
			"message.turnUsage.input": "輸入",
			"message.turnUsage.cacheRead": "快取讀取",
			"message.turnUsage.cacheWrite": "快取寫入",
			"message.turnUsage.output": "輸出"
		};
		//#endregion
		//#region src/client/stat-dialog.ts
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
		/** Viewport margin the placement clamp keeps (the Menu portal margin). */
		const PANEL_MARGIN = 12;
		/** Distance between the trigger's top edge and the panel's bottom. */
		const PANEL_GAP = 8;
		/**
		* Unplaced portal panel: hidden but laid out so the clamp measures real
		* dimensions (the `useAnchoredPosition` measure pass).
		*/
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/**
		* One trigger-anchored dialog seat: open state, viewport-clamped placement,
		* outside-close.
		* @param controlled - external open state; when given the seat reads and
		*   writes it instead of owning its own, letting sibling dialogs share one
		*   exclusive slot (the pre-split single-entry row).
		*/
		function useStatDialog(controlled) {
			const [ownOpen, setOwnOpen] = (0, react.useState)(false);
			const open = controlled?.open ?? ownOpen;
			const setOpen = controlled?.setOpen ?? setOwnOpen;
			const rootRef = (0, react.useRef)(null);
			const panelRef = (0, react.useRef)(null);
			const pos = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open,
				anchorRef: rootRef,
				panelRef,
				side: "top",
				gap: PANEL_GAP,
				margin: PANEL_MARGIN
			});
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen, panelRef);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onKeyDown = (e) => {
					if (e.key === "Escape") setOpen(false);
				};
				const onClick = (e) => {
					const target = e.target;
					if (rootRef.current?.contains(target) !== true && panelRef.current?.contains(target) !== true) setOpen(false);
				};
				document.addEventListener("keydown", onKeyDown);
				document.addEventListener("click", onClick, true);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
					document.removeEventListener("click", onClick, true);
				};
			}, [open, setOpen]);
			return {
				open,
				setOpen,
				rootRef,
				panelRef,
				pos
			};
		}
		//#endregion
		//#region src/client/stats-line-core.ts
		/** Sum the three disjoint prompt-side billing buckets (official). */
		function billedInputTokens(usage) {
			return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
		}
		/** Round a cache-read ratio to an integer percentage, ties rounded up (official). */
		function roundedIntegerPercent(cacheReadTokens, denominator) {
			const denominatorQuotient = Math.floor(denominator / 200);
			const denominatorRemainder = denominator % 200;
			let lower = 0;
			let upper = 100;
			while (lower < upper) {
				const candidate = Math.floor((lower + upper + 1) / 2);
				const factor = candidate * 2 - 1;
				if (cacheReadTokens >= factor * denominatorQuotient + Math.ceil(factor * denominatorRemainder / 200)) lower = candidate;
				else upper = candidate - 1;
			}
			return lower;
		}
		/**
		* Display-ready cache-hit share of prompt-side input (official replica):
		* integer text when integer rounding stays below 100, otherwise the minimum
		* decimal precision that still rounds below 100; full hit returns 100, and
		* no billed input returns null.
		*/
		function cacheHitPercent(usage) {
			const denominator = billedInputTokens(usage);
			if (denominator === 0) return null;
			const missedInputTokens = usage.uncachedInputTokens + usage.cacheWriteTokens;
			if (missedInputTokens === 0) return "100";
			const integerPercent = roundedIntegerPercent(usage.cacheReadTokens, denominator);
			if (integerPercent < 100) return String(integerPercent);
			let decimalPlaces = 1;
			let scaledDoubleGap = missedInputTokens * 200;
			const denominatorTens = Math.floor(denominator / 10);
			while (scaledDoubleGap <= denominatorTens) {
				scaledDoubleGap *= 10;
				decimalPlaces += 1;
			}
			const denominatorOnes = denominator % 10;
			let roundedLoss = 5;
			for (let loss = 1; loss < 5; loss += 1) {
				const factor = loss * 2 + 1;
				const threshold = factor * denominatorTens + Math.floor(factor * denominatorOnes / 10);
				if (scaledDoubleGap <= threshold) {
					roundedLoss = loss;
					break;
				}
			}
			return `99.${"9".repeat(decimalPlaces - 1)}${10 - roundedLoss}`;
		}
		/**
		* Plugin readout: the same ratio with exactly two decimals (85.25% → "85.25",
		* full hit → "100.00"); returns the display digits without the percent sign.
		*/
		function cacheHitPercentPrecise(usage) {
			const denominator = billedInputTokens(usage);
			if (denominator === 0) return null;
			if (usage.uncachedInputTokens + usage.cacheWriteTokens === 0) return "100.00";
			const percent = Math.round(usage.cacheReadTokens * 1e4 / denominator) / 100;
			return Math.min(percent, 99.99).toFixed(2);
		}
		/** Plugin readout: the five-item breakdown of one usage sample. */
		function tokenBreakdown(usage) {
			const cacheHit = usage.cacheReadTokens;
			const cacheMiss = usage.uncachedInputTokens + usage.cacheWriteTokens;
			const input = cacheHit + cacheMiss;
			return {
				total: input + usage.outputTokens,
				input,
				cacheHit,
				cacheMiss,
				output: usage.outputTokens
			};
		}
		/** Compact token count: 517 / 12.2K / 517K / 1.2M (official formatTokens).
		*  Named formatTokensCompact (not formatTokens) — the panel's format.ts
		*  exports the exact-thousands-separator formatTokens, and the two must not
		*  be confused across modules. */
		function formatTokensCompact(n) {
			const scaled = (v) => v >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
			if (n < 1e3) return String(n);
			if (n < 1e6) return `${scaled(n / 1e3)}K`;
			return `${scaled(n / 1e6)}M`;
		}
		/** Compact duration: 45.2s under a minute, 2m42s from there on (official). */
		function formatDuration(ms) {
			const s = ms / 1e3;
			if (s < 60) return `${Math.round(s * 10) / 10}s`;
			const whole = Math.round(s);
			return `${Math.floor(whole / 60)}m${whole % 60}s`;
		}
		/** Decode-throughput figure: whole tokens from ten up, one decimal below (official). */
		function formatTokensPerSecond(tps) {
			const clamped = Math.max(0, tps);
			return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10);
		}
		/** Read one assistant node's TTFT, decode wall time and output tokens (official). */
		function assistantStepReading(node) {
			const timing = node.timing;
			return {
				ttftMs: timing !== void 0 && timing.stepStartTime !== null && timing.firstTokenTime !== null ? Math.max(0, timing.firstTokenTime - timing.stepStartTime) : null,
				decodeMs: timing !== void 0 && timing.firstTokenTime !== null ? Math.max(0, timing.completedTime - timing.firstTokenTime) : null,
				outputTokens: usageOutputTokens(node.usage)
			};
		}
		/** Provider-reported completion tokens guarded to finite non-negative numbers (official). */
		function usageOutputTokens(usage) {
			if (typeof usage !== "object" || usage === null) return null;
			const value = usage.outputTokens;
			return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
		}
		/**
		* Fold assistant and tool-result nodes into window-scoped display totals —
		* the fallback for assemblies without the sessionStats projection (official).
		*/
		function deriveStats(nodes) {
			const turns = /* @__PURE__ */ new Set();
			let steps = 0;
			let llmMs = 0;
			let toolMs = 0;
			let ttftMs = 0;
			let ttftSteps = 0;
			let decodeMs = 0;
			let decodeTokens = 0;
			for (const node of nodes) {
				if (node.kind === "tool-result") {
					if (node.callTime !== null) toolMs += Math.max(0, node.time - node.callTime);
					continue;
				}
				if (node.kind !== "assistant") continue;
				turns.add(node.turn);
				steps += 1;
				if (node.timing !== void 0 && node.timing.stepStartTime !== null) llmMs += Math.max(0, node.timing.completedTime - node.timing.stepStartTime);
				const reading = assistantStepReading(node);
				if (reading.ttftMs !== null) {
					ttftMs += reading.ttftMs;
					ttftSteps += 1;
				}
				if (reading.decodeMs !== null && reading.outputTokens !== null) {
					decodeMs += reading.decodeMs;
					decodeTokens += reading.outputTokens;
				}
			}
			return {
				turns: turns.size,
				steps,
				llmMs,
				toolMs,
				ttftMs,
				ttftSteps,
				decodeMs,
				decodeTokens
			};
		}
		/**
		* DeepSeek's published text density (api-docs.deepseek.com, "Token 用量计算"):
		* one Chinese character ≈ 0.6 token, one English character ≈ 0.3 token. Priced
		* per code point with every non-ASCII character taking the denser rate — the
		* conservative side, and the reason this file does not reuse the harness's own
		* four-characters-per-token heuristic, which its README documents as
		* underpricing CJK text.
		*/
		const CJK_TOKENS_PER_CHAR = .6;
		const ASCII_TOKENS_PER_CHAR = .3;
		/**
		* Shortest observable decode window before a live rate is published, in ms
		* (the same floor MiMo-Code's sidebar tps uses). Below it the first chunk's
		* burst would read as hundreds of tok/s; the sampler also publishes its FIRST
		* reading at exactly this mark rather than at the next steady cadence.
		*
		* The floor is a publishing gate, NOT a rejection gate: it is applied after the
		* plausibility check below, so a backlog frame can never dodge that check by
		* arriving early (see {@link StreamingRateSampler.observe}).
		*/
		const MIN_STREAM_WINDOW_MS = 500;
		/**
		* Longest window a live rate may span, in ms. This is the bound the previous
		* cumulative quotient lacked: any artifact inside the window — a frame the UI
		* published late, a retry, a block boundary — leaves the figure within one
		* window instead of distorting the reading for the rest of the step.
		*/
		const MAX_STREAM_WINDOW_MS = 2e3;
		/**
		* Hard cap on windowed observations. A 2 s window holds ≈ 40 samples at the
		* stream's own publication cadence and ≈ 125 at 60 fps, so this only ever bites
		* on a synthetic input (a caller observing far faster than any renderer does);
		* it is a backstop against unbounded growth, not a cadence control.
		*/
		const MAX_WINDOW_SAMPLES = 512;
		/**
		* Highest decoded rate the sampling can resolve, in tokens per ms: 1_500 tok/s.
		* It sits above anything a real stream produces — measured over a real session,
		* the largest single publication carried 265 tokens and the median 9, i.e. a
		* worst observed slope of ≈ 1.08 tok/ms, and DeepSeek's steady output is two
		* orders of magnitude below that — while a window that DID stream that fast is a
		* measurement artifact: the UI published a count the stream produced earlier
		* (a suspended tab returns with the whole backlog in one frame; a busy main
		* thread batches frames the same way). Such a window is re-anchored instead of
		* published, so the figure resumes from the tokens that actually arrive while
		* the row is watching.
		*
		* This check runs before the observation floor on purpose: a backlog frame that
		* lands less than {@link MIN_STREAM_WINDOW_MS} after the previous one used to be
		* answered by "no reading yet", which left its sample in the window and let the
		* NEXT frame publish the backlog as a rate (1_366 tok/s on a 30 tok/s stream).
		*/
		const MAX_SAMPLED_TOKENS_PER_MS = 1.5;
		/**
		* Shortest span the plausibility check may judge, in ms. Two observations can
		* land in the same instant — a step opens and its first block arrives on one
		* frame — and a span that small would turn an ordinary opening chunk into "a
		* rate no provider streams", re-anchoring the window and losing the baseline the
		* whole reading is measured from. Judging against this floor instead still
		* catches what the check exists for: the largest publication a real session
		* produced carried 265 tokens, which is 3 900 tok/s if it lands inside 68 ms.
		*/
		const MIN_SLOPE_SPAN_MS = 50;
		/**
		* Time constant of the published figure, in ms. The weight a new reading gets is
		* its own elapsed time over this constant, so the smoothing is a property of the
		* stream's pace rather than of how often the row happens to render: at the
		* measured cadence (≈ 246 ms between publications) each reading takes about a
		* quarter of the figure and three of them carry most of a step change, while a
		* reading that arrives after a long silence is adopted whole instead of being
		* blended with a stale one.
		*/
		const SMOOTHING_TAU_MS = 1e3;
		/**
		* Band the measured correction stays inside, so one unrepresentative sample
		* (an aborted step, a step that streamed tool JSON only) cannot scale the
		* estimate away from the published density.
		*/
		const MIN_MEASURED_SCALE = .5;
		const MAX_MEASURED_SCALE = 2;
		/**
		* Bounded sliding-window decode-rate estimator for the step currently
		* streaming.
		*
		* Three rules keep the figure honest, and the first two follow from the same
		* mistake the cumulative quotient made — pairing a numerator that covers the
		* whole step with a denominator that starts when the UI first looked:
		*
		* 1. The numerator is the token growth OBSERVED inside the window, never the
		*    step's cumulative estimate. Text produced before the window opened (or
		*    during a frame the UI never published) therefore cannot be charged to it.
		* 2. The window is bounded above as well as below. A rate is a statement about
		*    a span; over an unbounded span it degrades into the step's lifetime
		*    average and any early artifact fades for minutes instead of seconds.
		* 3. The published figure is smoothed, and only a frame that carries growth may
		*    move it. A window average still moves with every publication, and real
		*    publications carry uneven amounts (median 9 tokens, 99th percentile 77 in a
		*    measured session), so an unsmoothed rate jumps by a quarter or more between
		*    adjacent readings; a frame repeating the estimate, on the other hand, says
		*    nothing about the stream and must not age the window either.
		*
		* Every state change happens in `observe`. `ratePerSecond` only reads, which is
		* what lets the row sample during a render it may yet discard: a read that could
		* re-anchor the window would let an abandoned render decide what the next
		* committed one publishes.
		*
		* The window opens at the first observation, so idle time before the first delta
		* stays out of the denominator exactly as the official `decodeMs` keeps
		* first-token latency out of the settled figure. A step change gets a new
		* sampler (a window belongs to one step); a step still running through a change
		* that re-prices its own estimate calls {@link StreamingRateSampler.reset}.
		*/
		var StreamingRateSampler = class {
			/** (time, tokens) observations still inside the window, oldest first. */
			samples = [];
			/**
			* Last published figure, in tokens per second; null until the window first
			* carries a usable span. It is held across a window with nothing in it: while
			* a step streams and produces nothing, the row keeps showing the last rate it
			* could measure, instead of falling back to the session average and reading as
			* a jump for no reason.
			*/
			published = null;
			/** Wall clock of that figure, in ms; its age sets the smoothing weight. */
			publishedAt = 0;
			/**
			* Observe one reading of the step's running token estimate, and advance the
			* published figure.
			* @param tokens - the calibrated output-token estimate right now.
			* @param now - the wall clock at the same instant, in ms.
			*/
			observe(tokens, now) {
				const last = this.samples.at(-1);
				if (last === void 0 || tokens < last.tokens) {
					this.samples = [{
						at: now,
						tokens
					}];
					return;
				}
				if (tokens === last.tokens) return;
				this.samples.push({
					at: now,
					tokens
				});
				while (this.samples.length > 1 && now - this.samples[0].at > MAX_STREAM_WINDOW_MS) this.samples.shift();
				if (this.samples.length >= MAX_WINDOW_SAMPLES) this.samples.splice(0, this.samples.length - MAX_WINDOW_SAMPLES / 2);
				const first = this.samples[0];
				const span = now - first.at;
				const grown = tokens - first.tokens;
				if (grown > Math.max(span, MIN_SLOPE_SPAN_MS) * MAX_SAMPLED_TOKENS_PER_MS) {
					this.samples = [{
						at: now,
						tokens
					}];
					return;
				}
				if (span < MIN_STREAM_WINDOW_MS) return;
				const rate = grown / (span / 1e3);
				if (this.published === null) this.published = rate;
				else {
					const weight = Math.min(1, (now - this.publishedAt) / SMOOTHING_TAU_MS);
					this.published += weight * (rate - this.published);
				}
				this.publishedAt = now;
			}
			/**
			* The figure to display.
			* @returns the smoothed tokens-per-second reading, or null while the sampler
			*   has never measured one — a fresh step, or a window just re-anchored before
			*   it could publish — leaving the caller to show the official session figure.
			*/
			ratePerSecond() {
				return this.published;
			}
			/**
			* Drop the observed window because the step's estimate is priced differently
			* from here on (its measured correction changed). Growth already counted under
			* the old scale must not be measured against the new one. The published figure
			* survives: the step's rate did not change, only the units it is priced in, and
			* falling back to the session average here would be a visible jump.
			*/
			reset() {
				this.samples = [];
			}
		};
		/** Prior tokens for one string under the published density. */
		function priorTokens(text) {
			let tokens = 0;
			for (const character of text) tokens += character.codePointAt(0) <= 127 ? ASCII_TOKENS_PER_CHAR : CJK_TOKENS_PER_CHAR;
			return tokens;
		}
		/**
		* Prior output-token estimate for one step's blocks. Provider `outputTokens`
		* counts every completion token, so reasoning text and tool-call arguments are
		* priced alongside the visible answer — pricing only the answer would make a
		* tool-heavy step read far below its own settled figure.
		*/
		function estimateOutputTokens(blocks) {
			let tokens = 0;
			for (const block of blocks) if (block.kind === "text" || block.kind === "reasoning") tokens += priorTokens(block.text ?? "");
			else if (block.kind === "tool-call") tokens += priorTokens(block.argsRaw ?? "");
			return tokens;
		}
		/**
		* Correction factor from the session's own settled steps: provider-reported
		* output tokens divided by what the published density predicted for the same
		* blocks. The density answers "what does this text cost before anything is
		* known"; this factor carries whatever the live tokenizer does differently, so
		* the estimate converges on the model actually in use. Null while no settled
		* step carries both blocks and usage (the caller falls back to the raw prior).
		*/
		function measuredTokenScale(nodes) {
			let prior = 0;
			let actual = 0;
			for (const node of nodes) {
				if (node.kind !== "assistant") continue;
				const blocks = node.blocks;
				const tokens = usageOutputTokens(node.usage);
				if (blocks === void 0 || tokens === null || tokens <= 0) continue;
				const estimate = estimateOutputTokens(blocks);
				if (estimate <= 0) continue;
				prior += estimate;
				actual += tokens;
			}
			if (prior <= 0) return null;
			return Math.min(MAX_MEASURED_SCALE, Math.max(MIN_MEASURED_SCALE, actual / prior));
		}
		//#endregion
		//#region dsh-css
		const css = ".FQCvMa_root{box-sizing:border-box;width:100%;max-width:var(--dsh-chat-content-width);padding:4px calc(var(--dsh-composer-side-clearance) + 16px) 0px;font-size:var(--dsh-content-font-size-secondary,13px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px));justify-content:center;gap:12px;margin:0 auto;display:flex}.FQCvMa_root[data-dock-row]{width:auto;min-width:0;max-width:100%;margin:0;padding:0}.FQCvMa_anchor{min-width:0;display:inline-flex}.FQCvMa_dockAnchor{font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px))}.FQCvMa_pill{box-sizing:border-box;max-width:100%;color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;white-space:nowrap;background:0 0;border:none;border-radius:24px;align-items:center;gap:6px;padding:1px 8px;display:inline-flex}.FQCvMa_pill svg{flex:none;width:14px;height:14px}button.FQCvMa_pill{cursor:pointer}button.FQCvMa_pill:hover,button.FQCvMa_pill[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.FQCvMa_label{text-overflow:ellipsis;min-width:0;overflow:hidden}.FQCvMa_sep{color:var(--dsw-alias-separator-primary);margin:0 6px}.FQCvMa_speed{min-width:10ch;display:inline-block}.FQCvMa_dialogPanel{z-index:1100;box-sizing:border-box;background:var(--dsw-specific-menu);width:max-content;min-width:min(300px,100vw - 24px);max-width:min(440px,100vw - 24px);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);cursor:default;border:0;border-radius:12px;padding:16px;font-size:12px;line-height:18px;position:fixed}.FQCvMa_dialogTitle{color:var(--dsw-alias-label-primary);justify-content:space-between;gap:16px;margin-bottom:8px;font-weight:500;display:flex}.FQCvMa_dialogTitleRule{border-top:.5px solid var(--dsw-alias-border-l2);margin-bottom:10px}.FQCvMa_dialogTitleValue{font-variant-numeric:tabular-nums}.FQCvMa_dialogTitleLabel{align-items:center;gap:6px;min-width:0;display:inline-flex}.FQCvMa_dialogTitleLabel svg{flex:none;width:14px;height:14px}.FQCvMa_dialogDetails{color:var(--dsw-alias-label-tertiary);grid-template-columns:minmax(76px,auto) minmax(0,1fr);gap:6px 16px;margin:0;display:grid}.FQCvMa_dialogDetails dt,.FQCvMa_dialogDetails dd{min-width:0;margin:0}.FQCvMa_dialogDetails dd{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;text-align:right}";
		const tagId = "dsh-external/dsh-usage-panel-plus/StatsLineEnhanced.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-external/dsh-usage-panel-plus";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var StatsLineEnhanced_module_css_default = {
			"anchor": "FQCvMa_anchor",
			"dialogDetails": "FQCvMa_dialogDetails",
			"dialogPanel": "FQCvMa_dialogPanel",
			"dialogTitle": "FQCvMa_dialogTitle",
			"dialogTitleLabel": "FQCvMa_dialogTitleLabel",
			"dialogTitleRule": "FQCvMa_dialogTitleRule",
			"dialogTitleValue": "FQCvMa_dialogTitleValue",
			"dockAnchor": "FQCvMa_dockAnchor",
			"label": "FQCvMa_label",
			"pill": "FQCvMa_pill",
			"root": "FQCvMa_root",
			"sep": "FQCvMa_sep",
			"speed": "FQCvMa_speed"
		};
		//#endregion
		//#region src/client/StatsLineEnhanced.tsx
		/**
		* The composer-dock takeover: replicates the official ui-chat StatsPills - a
		* gauge pill (turn/step counts + output speed, click opens the time-and-speed
		* dialog) and a database pill (total tokens + cache hit, click opens the
		* token-usage dialog). The official package is not a client-bundle external,
		* so its internals cannot be imported; the replicated pure folds live in
		* stats-line-core (same derivation, covered by the core tests) and the dialog
		* seat in stat-dialog.ts.
		*
		* ONE published build serves BOTH dock contracts, because the host line
		* decides how many entries the row is:
		*  - DSH <= 0.2.0-rc.2 exposes a single `stats` entry, so the whole row is
		*    one registration: `StatsLineEnhanced` (id 'stats', priority -1) renders
		*    the root container the two pills live in and owns their shared exclusive
		*    dialog slot;
		*  - DSH >= 0.2.1-alpha.1 split that entry into `activity` (counts/speed/time)
		*    and `usage` (tokens/cache), so each pill is its own registration at its
		*    own id: `StatsActivityEntry` and `StatsUsageEntry`. There is no row
		*    element any more - the host's `.dock` flex row lays the entries out, and
		*    the anchors carry the tier `.root` used to own (`css.dockAnchor`) - and
		*    each pill owns its dialog state, with mutual exclusion coming from
		*    stat-dialog's capture-phase outside click.
		* Which pair to register is read from the dock's entry ledger in
		* src/client/index.tsx.
		*
		* Two plugin-side readouts ride the same pills: with precise cache hit rate
		* on, the hit figure renders two decimals; with the session token breakdown
		* on, the usage dialog gains the cache-miss row. Both toggles live in
		* stats-line-state.ts (shared with the usage panel) and apply instantly.
		*
		* The third toggle, streaming throughput, replaces the gauge pill's speed
		* figure with a live estimate while a step is still streaming and drops back to
		* the official session figure the moment it settles. That subscription lives in
		* its own child component so stream deltas never re-render the pills. The live
		* figure itself is measured by a bounded sliding window over observed token
		* growth (stats-line-core's StreamingRateSampler): the earlier cumulative
		* quotient charged a whole step's text to a window that had just opened, so a
		* frame published late read as thousands of tok/s and then decayed.
		*
		* Kernel contract (DSH >= 0.1.2-rc.1): the slot's standard session selector
		* is injected as `useChat` over the ui-chat ChatSnapshot; the `legacy.nodes`
		* compatibility projection carries the ConversationNode[] that officially
		* backs the pills, `legacy.partial` the in-flight assistant output, and the
		* durable sessionStats projection stays the primary source.
		*/
		/** The anchor's class list. The pre-split row sets the text tier on `.root`
		*  and the anchor inherits it; a split-mode entry IS a child of the host's
		*  `.dock`, so its anchor declares the tier itself (the official `.anchor`). */
		function anchorClass(dock) {
			return dock ? `${StatsLineEnhanced_module_css_default.anchor} ${StatsLineEnhanced_module_css_default.dockAnchor}` : StatsLineEnhanced_module_css_default.anchor;
		}
		/** The separator + figure shape both speed arms render into the gauge pill.
		*  The figure sits in a width-reserved slot (css.speed): the live reading
		*  changes every second, and a slot that tracked its digits would reflow the
		*  centred row — and with it the counts pill — on every refresh. The slot is
		*  rendered even with no figure at all (an empty session has no official figure
		*  to fall back to until its first step settles), so the row's layout never
		*  depends on whether a number is available. */
		function SpeedFigure({ text }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [text !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: StatsLineEnhanced_module_css_default.sep,
				"aria-hidden": true,
				children: "·"
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: StatsLineEnhanced_module_css_default.speed,
				"data-stats-speed": true,
				children: text
			})] });
		}
		/**
		* Tell the composer row which container the host rendered it in — it has to
		* serve two layouts at once: inside InputBar's flex `.dock` (0.1.6-alpha.2+,
		* beside the resident ContextMeter, which owns the row's centring, 12px gap,
		* top pad and side clearance) or straight in InputBar's own column (through
		* 0.1.6-alpha.1, where this row owns all four). The stylesheet carries both
		* contracts and keys them off `data-dock-row`.
		*
		* The row's parent is NOT that container: the slot renderer wraps every entry
		* in a `display: contents` element (measured against 0.1.6-alpha.2 in a live
		* instance — the wrapper has no box, so its own display axes say nothing about
		* the layout). The nearest ancestor that actually participates in layout is the
		* one to read, so walk up past the wrappers (bounded, in case a host ever
		* stacks several) and take the first real box's axes. Nothing found keeps the
		* row unmarked, i.e. the older contract — the harmless direction.
		*
		* A ref callback, not an effect: this is the one React seam that fires when the
		* row's DOM first exists, and an effect could not be trusted here — the
		* component returns null until the session has steps or tokens, so a mount-time
		* probe would run against no element and never repeat.
		*/
		function markDockContainer(row) {
			if (row === null) return;
			const view = row.ownerDocument.defaultView;
			if (view === null) return;
			let box = row.parentElement;
			for (let depth = 0; box !== null && depth < 8; depth += 1) {
				const style = view.getComputedStyle(box);
				if (style.display !== "contents") {
					row.toggleAttribute("data-dock-row", style.display === "flex" && style.flexDirection === "row");
					return;
				}
				box = box.parentElement;
			}
		}
		/**
		* How often the live reading is recomputed while a step streams. Deltas arrive
		* every delta, and this beat only covers a step that has gone quiet mid-answer,
		* where no frame arrives to advance the window at all. It matches the reference
		* implementation this replicates (MiMo-Code's sidebar tps).
		*/
		const LIVE_SPEED_REFRESH_MS = 1e3;
		/**
		* The gauge pill's speed slot while the streaming-throughput preference is on.
		*
		* It subscribes to `legacy.partial` itself, and mounting is what turns that
		* subscription on — so with the preference off the pills stay entirely out of
		* the per-frame delta path, which is the same care the official StatsPills
		* takes. Until the streaming step has a measurable window the official session
		* figure stays on screen, so the slot is never empty and the handover at
		* settle is a plain value change.
		*
		* One window covers a whole step, across every output kind the accumulator
		* carries — reasoning, answer text, and Tool-call arguments — because the
		* provider bills all three as completion tokens and a step emits them in
		* sequence. Between steps the partial is gone (the step's assistant/message
		* settles it and the next step has not begun), so Tool execution shows the
		* official figure until the next step opens its own window.
		*
		* Sampling happens in a layout effect and the figure it yields is published as
		* state, so no render reads a clock or mutates the window: a render React starts
		* and then discards must not decide what the next committed one displays. The
		* rate itself comes from stats-line-core's StreamingRateSampler — a bounded
		* window over observed token growth, smoothed, and held while nothing arrives.
		*/
		function LiveSpeed({ useChat, scale, fallback, t }) {
			const partial = useChat((s) => s.legacy.partial);
			const key = partial == null ? null : `${partial.turn}:${partial.step}`;
			const tokens = (0, react.useMemo)(() => partial == null ? 0 : estimateOutputTokens(partial.blocks) * scale, [partial, scale]);
			const sampler = (0, react.useRef)(null);
			if (sampler.current === null || sampler.current.key !== key) sampler.current = {
				key,
				rate: new StreamingRateSampler()
			};
			const rate = sampler.current.rate;
			const [published, setPublished] = (0, react.useState)({
				key: null,
				rate: null
			});
			const scaleRef = (0, react.useRef)(scale);
			const [beat, setBeat] = (0, react.useState)(0);
			(0, react.useLayoutEffect)(() => {
				if (scaleRef.current !== scale) {
					scaleRef.current = scale;
					rate.reset();
				}
				rate.observe(tokens, Date.now());
				const next = rate.ratePerSecond();
				setPublished((previous) => previous.key === key && previous.rate === next ? previous : {
					key,
					rate: next
				});
			}, [
				tokens,
				key,
				beat,
				rate,
				scale
			]);
			const streaming = key !== null;
			(0, react.useEffect)(() => {
				if (!streaming) return;
				const handle = setInterval(() => {
					setBeat(Date.now());
				}, LIVE_SPEED_REFRESH_MS);
				return () => {
					clearInterval(handle);
				};
			}, [streaming]);
			const reading = published.key === key ? published.rate : null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SpeedFigure, { text: reading === null ? fallback : t("stats.tokensPerSecond", { throughput: formatTokensPerSecond(reading) }) });
		}
		function TimePill({ stats, t, dialog, useChat, scale, liveSpeed, dock }) {
			const { open, setOpen, rootRef, panelRef, pos } = useStatDialog(dialog);
			const counts = t("stats.counts", {
				turns: stats.turns,
				steps: stats.steps
			});
			const officialTps = stats.decodeMs > 0 ? t("stats.tokensPerSecond", { throughput: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1e3)) }) : null;
			const label = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: StatsLineEnhanced_module_css_default.label,
				children: [counts, liveSpeed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LiveSpeed, {
					useChat,
					scale,
					fallback: officialTps,
					t
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SpeedFigure, { text: officialTps })]
			});
			if (stats.llmMs <= 0 && stats.toolMs <= 0 && stats.ttftSteps <= 0 && stats.decodeMs <= 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: anchorClass(dock),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: StatsLineEnhanced_module_css_default.pill,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGaugeOutlineRegular, {}), label]
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				ref: rootRef,
				className: anchorClass(dock),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: StatsLineEnhanced_module_css_default.pill,
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					"aria-label": officialTps === null ? counts : counts + " · " + officialTps,
					onClick: () => {
						setOpen(!open);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGaugeOutlineRegular, {}), label]
				}), open && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: panelRef,
					className: StatsLineEnhanced_module_css_default.dialogPanel,
					"data-dsh-usage-panel-plus-glass": "dialog",
					role: "dialog",
					"aria-label": t("stats.dialog.title"),
					style: pos ?? MEASURE_STYLE,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: StatsLineEnhanced_module_css_default.dialogTitle,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: StatsLineEnhanced_module_css_default.dialogTitleLabel,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGaugeOutlineRegular, {}), t("stats.dialog.title")]
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: StatsLineEnhanced_module_css_default.dialogTitleRule,
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
							className: StatsLineEnhanced_module_css_default.dialogDetails,
							"data-session-stats-details": true,
							children: [
								stats.llmMs > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("stats.dialog.llmTime") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: formatDuration(stats.llmMs) })] }),
								stats.toolMs > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("stats.dialog.toolTime") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: formatDuration(stats.toolMs) })] }),
								stats.ttftSteps > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("stats.dialog.ttft") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: formatDuration(stats.ttftMs / stats.ttftSteps) })] }),
								stats.decodeMs > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("stats.dialog.speed") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: t("stats.tokensPerSecond", { throughput: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1e3)) }) })] })
							]
						})
					]
				}), document.body)]
			});
		}
		function UsagePill({ usage, t, dialog, cachePrecision, tokenDetail, dock }) {
			const { open, setOpen, rootRef, panelRef, pos } = useStatDialog(dialog);
			const total = billedInputTokens(usage) + usage.outputTokens;
			const totalText = t("message.turnUsage.count", { count: formatTokensCompact(total) });
			const cacheHit = cachePrecision ? cacheHitPercentPrecise(usage) : cacheHitPercent(usage);
			const cacheHitText = cacheHit !== null ? t("stats.cacheHit", { percent: cacheHit }) : null;
			const exactCount = (value) => t("message.turnUsage.count", { count: formatTokens(value) });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				ref: rootRef,
				className: anchorClass(dock),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: StatsLineEnhanced_module_css_default.pill,
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					"aria-label": cacheHitText === null ? totalText : totalText + " · " + cacheHitText,
					onClick: () => {
						setOpen(!open);
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDatabaseOutlineRegular, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: StatsLineEnhanced_module_css_default.label,
						children: [totalText, cacheHitText !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: StatsLineEnhanced_module_css_default.sep,
							"aria-hidden": true,
							children: "·"
						}), cacheHitText] })]
					})]
				}), open && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: panelRef,
					className: StatsLineEnhanced_module_css_default.dialogPanel,
					"data-dsh-usage-panel-plus-glass": "dialog",
					role: "dialog",
					"aria-label": t("stats.dialog.usageTitle"),
					style: pos ?? MEASURE_STYLE,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: StatsLineEnhanced_module_css_default.dialogTitle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: StatsLineEnhanced_module_css_default.dialogTitleLabel,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDatabaseOutlineRegular, {}), t("stats.dialog.usageTitle")]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: StatsLineEnhanced_module_css_default.dialogTitleValue,
								children: exactCount(total)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: StatsLineEnhanced_module_css_default.dialogTitleRule,
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
							className: StatsLineEnhanced_module_css_default.dialogDetails,
							"data-session-stats-usage": true,
							children: [
								cacheHit !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheHit") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: cacheHit + "%" })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.input") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: exactCount(usage.uncachedInputTokens) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheRead") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: exactCount(usage.cacheReadTokens) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.cacheWrite") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: exactCount(usage.cacheWriteTokens) }),
								tokenDetail && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("stats.cacheMiss") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: exactCount(tokenBreakdown(usage).cacheMiss) })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("message.turnUsage.output") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: exactCount(usage.outputTokens) })
							]
						})
					]
				}), document.body)]
			});
		}
		/**
		* The pre-split whole-row entry: DSH <= 0.2.0-rc.2 exposes ONE
		* `conversation.composer.dock` entry (id 'stats'), so this component owns the
		* row container, the host-container marker, and the two pills' shared
		* exclusive dialog slot. On 0.2.1-alpha.1+ the two entries below replace it.
		*/
		const StatsLineEnhanced = (0, react.memo)(function StatsLineEnhanced({ useChat, useProjection, t }) {
			const settledNodes = useChat((s) => s.legacy.nodes);
			const usage = useProjection("tokenUsage");
			const [openPill, setOpenPill] = (0, react.useState)(null);
			const projected = useProjection("sessionStats");
			const stats = (0, react.useMemo)(() => projected ?? deriveStats(settledNodes ?? []), [projected, settledNodes]);
			const [cachePrecision, setCachePrecision] = (0, react.useState)(statsLineState.cachePrecision);
			const [tokenDetail, setTokenDetail] = (0, react.useState)(statsLineState.tokenDetail);
			const [streamThroughput, setStreamThroughput] = (0, react.useState)(statsLineState.streamThroughput);
			(0, react.useEffect)(() => statsLineState.subscribe(() => {
				setCachePrecision(statsLineState.cachePrecision);
				setTokenDetail(statsLineState.tokenDetail);
				setStreamThroughput(statsLineState.streamThroughput);
			}), []);
			const tokenScale = (0, react.useMemo)(() => measuredTokenScale(settledNodes ?? []) ?? 1, [settledNodes]);
			const hasTokens = usage !== void 0 && (billedInputTokens(usage) > 0 || usage.outputTokens > 0);
			if (stats.steps === 0 && !hasTokens) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: markDockContainer,
				className: StatsLineEnhanced_module_css_default.root,
				"data-composer-stats": true,
				children: [stats.steps > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TimePill, {
					stats,
					t,
					useChat,
					scale: tokenScale,
					liveSpeed: streamThroughput,
					dock: false,
					dialog: {
						open: openPill === "time",
						setOpen: (open) => {
							setOpenPill(open ? "time" : null);
						}
					}
				}), hasTokens && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsagePill, {
					usage,
					t,
					dialog: {
						open: openPill === "usage",
						setOpen: (open) => {
							setOpenPill(open ? "usage" : null);
						}
					},
					cachePrecision,
					tokenDetail,
					dock: false
				})]
			});
		});
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
		const StatsActivityEntry = (0, react.memo)(function StatsActivityEntry({ useChat, useProjection, t }) {
			const settledNodes = useChat((s) => s.legacy.nodes);
			const projected = useProjection("sessionStats");
			const stats = (0, react.useMemo)(() => projected ?? deriveStats(settledNodes ?? []), [projected, settledNodes]);
			const [streamThroughput, setStreamThroughput] = (0, react.useState)(statsLineState.streamThroughput);
			(0, react.useEffect)(() => statsLineState.subscribe(() => {
				setStreamThroughput(statsLineState.streamThroughput);
			}), []);
			const tokenScale = (0, react.useMemo)(() => measuredTokenScale(settledNodes ?? []) ?? 1, [settledNodes]);
			if (stats.steps === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TimePill, {
				stats,
				t,
				useChat,
				scale: tokenScale,
				liveSpeed: streamThroughput,
				dock: true
			});
		});
		/**
		* The split-mode `usage` dock entry (DSH >= 0.2.1-alpha.1): the database pill
		* alone, at the official entry's id so priority -1 shadows it. Gated on actual
		* token activity, as the official pill is and as the pre-split row's own
		* `hasTokens` did.
		*/
		const StatsUsageEntry = (0, react.memo)(function StatsUsageEntry({ useProjection, t }) {
			const usage = useProjection("tokenUsage");
			const [cachePrecision, setCachePrecision] = (0, react.useState)(statsLineState.cachePrecision);
			const [tokenDetail, setTokenDetail] = (0, react.useState)(statsLineState.tokenDetail);
			(0, react.useEffect)(() => statsLineState.subscribe(() => {
				setCachePrecision(statsLineState.cachePrecision);
				setTokenDetail(statsLineState.tokenDetail);
			}), []);
			if (!(usage !== void 0 && (billedInputTokens(usage) > 0 || usage.outputTokens > 0))) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsagePill, {
				usage,
				t,
				cachePrecision,
				tokenDetail,
				dock: true
			});
		});
		//#endregion
		//#region src/client/glass.ts
		/** The global key and event name — fixed for the life of the contract. */
		const GLASS_GLOBAL = "__DSH_BACKGROUND_GLASS__";
		const GLASS_EVENT = "dsh-background-glass:ready";
		/**
		* How long to wait for the bridge before giving up and staying opaque. The
		* bridge is published during the background plugin's client apply, so this
		* only has to cover a bundle that is still parsing; a user without that plugin
		* pays this once and never again.
		*/
		const GLASS_READY_TIMEOUT_MS = 1e4;
		/**
		* Resolve the glass bridge, or `null` when the background plugin is absent.
		*
		* Both arrival orders are handled, because DSH loads client bundles in an
		* unspecified order: the global is polled first (the bridge may already be
		* up), then the ready event is awaited (ours may have loaded first). The
		* listener and the timer are torn down on whichever path wins, so a resolved
		* promise never leaves a stray timeout behind.
		*
		* The event fires again after a hot reload of the background plugin; callers
		* that registered once may simply re-register on that signal — this helper
		* deliberately resolves only the first arrival, and the panel's own effect
		* re-runs on reload.
		*
		* @param timeoutMs - how long to wait for the event before resolving `null`.
		* @returns the bridge, or `null` when nothing published one in time.
		*/
		function whenGlassReady(timeoutMs = GLASS_READY_TIMEOUT_MS) {
			if (typeof window === "undefined") return Promise.resolve(null);
			const existing = window[GLASS_GLOBAL];
			if (existing !== void 0) return Promise.resolve(existing);
			return new Promise((resolve) => {
				const onReady = (event) => {
					clearTimeout(timer);
					window.removeEventListener(GLASS_EVENT, onReady);
					resolve(event.detail ?? null);
				};
				const timer = setTimeout(() => {
					window.removeEventListener(GLASS_EVENT, onReady);
					resolve(null);
				}, timeoutMs);
				window.addEventListener(GLASS_EVENT, onReady);
			});
		}
		/**
		* Whether a resolved bridge is the one this helper can drive.
		* @param glass - the value resolved by {@link whenGlassReady}.
		* @returns true when the identity and contract version both match.
		*/
		function isCompatibleGlass(glass) {
			return glass !== null && glass.bridgeId === "deepseek-harness-background" && glass.version === 1;
		}
		//#endregion
		//#region src/client/index.tsx
		/** This bundle's npm package name — the key the Plugins page matches on. */
		const BUNDLE_NAME = "dsh-usage-panel-plus";
		/** The id shared by the sidebar row and the main panel it selects. */
		const PANEL_ID = "usage-panel-plus";
		/** Where the row sits among the global panels: after the shipped ones. */
		const PANEL_ORDER = 30;
		/** The attribute every glass-eligible surface in this bundle carries. The
		*  panel's class names are CSS Module hashes (`[hash]_local`), so a static
		*  selector cannot name them; this attribute is the stable handle the
		*  background plugin's glass registry matches on. The value splits the two
		*  recipes: the panel surfaces take the registry's `fill` mode (the registry
		*  takes their own paints over), while the stat dialogs — the two popovers
		*  under the composer — keep their official menu fill and join the sheet
		*  for the shared sheen + blur chain (`token` mode). */
		const GLASS_ATTR_SELECTOR = "[data-dsh-usage-panel-plus-glass]";
		const GLASS_DIALOG_SELECTOR = "[data-dsh-usage-panel-plus-glass=\"dialog\"]";
		const GLASS_PANEL_SELECTOR = `${GLASS_ATTR_SELECTOR}:not(${GLASS_DIALOG_SELECTOR})`;
		const inject = [
			"slots",
			"locale",
			"layout"
		];
		/** The panel as the Plugins page renders it: the page owns the title, the
		*  icon, and the crumb, so this is the bare panel. */
		function UsageStatsSection(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageStatsPanel, { t: props.t });
		}
		/** The panel as a standalone main panel, wrapped in the same 960px content
		*  column the Plugins page gives it so both entries look identical.
		*
		*  Only this entry carries the back control. The Plugins page entry sits in
		*  the page's own chrome, which already draws a crumb back to the bundle list,
		*  so a second control there would be noise rather than help. */
		function UsageStatsPanelPage(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UsageStatsPanel_module_css_default.page,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: UsageStatsPanel_module_css_default.backRow,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						size: "sm",
						variant: "ghost",
						className: UsageStatsPanel_module_css_default.back,
						onClick: props.goBack,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ArrowLeft, {
							size: 14,
							strokeWidth: 2,
							"aria-hidden": "true"
						}), props.t("back")]
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UsageStatsPanel, { t: props.t })]
			});
		}
		/** The sidebar row's glyph; the sidebar owns the button, the label, and the
		*  selected state around it. */
		function StatsPanelIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatsIcon, { size });
		}
		/** The composer dock slot the bottom-bar takeover shadows. */
		const COMPOSER_DOCK = "conversation.composer.dock";
		/** The pre-split takeover: ONE entry at the official 'stats' id, rendering the
		*  whole row (DSH <= 0.2.0-rc.2). */
		function installStatsRowEntry(ctx) {
			return ctx.slots.register({
				name: COMPOSER_DOCK,
				id: "stats",
				order: 0,
				priority: -1,
				locale: LOCALE_NS
			}, StatsLineEnhanced);
		}
		/** The split takeover: one entry per official pill, each shadowed at its own
		*  id (DSH >= 0.2.1-alpha.1). */
		function installSplitDockEntries(ctx) {
			const offActivity = ctx.slots.register({
				name: COMPOSER_DOCK,
				id: "activity",
				order: 0,
				priority: -1,
				locale: LOCALE_NS
			}, StatsActivityEntry);
			const offUsage = ctx.slots.register({
				name: COMPOSER_DOCK,
				id: "usage",
				order: 1,
				priority: -1,
				locale: LOCALE_NS
			}, StatsUsageEntry);
			return () => {
				offUsage();
				offActivity();
			};
		}
		function apply(ctx) {
			ctx.effect(() => {
				const offZh = ctx.locale.register(LOCALE_NS, "zh", zh);
				const offEn = ctx.locale.register(LOCALE_NS, "en", en);
				const offZhTw = ctx.locale.register(LOCALE_NS, "zh-TW", zhTW);
				return () => {
					offZh();
					offEn();
					offZhTw();
				};
			}, "dsh-usage-panel-plus: dictionaries");
			ctx.effect(() => {
				const unregisters = [];
				let disposed = false;
				whenGlassReady().then((glass) => {
					if (disposed || !isCompatibleGlass(glass)) return;
					unregisters.push(glass.register({
						plugin: BUNDLE_NAME,
						selectors: [GLASS_PANEL_SELECTOR],
						mode: "fill"
					}));
					unregisters.push(glass.register({
						plugin: BUNDLE_NAME,
						selectors: [GLASS_DIALOG_SELECTOR],
						mode: "token"
					}));
				});
				return () => {
					disposed = true;
					for (const off of unregisters) off();
				};
			}, "dsh-usage-panel-plus: frosted-glass surfaces");
			const t = ctx.locale.bind(LOCALE_NS);
			let previousPanelId = null;
			let lastPanelId = ctx.layout.panelInfo.getSnapshot().activePanelId;
			ctx.effect(() => ctx.layout.panelInfo.subscribe(() => {
				const next = ctx.layout.panelInfo.getSnapshot().activePanelId;
				if (next === "usage-panel-plus" && lastPanelId !== "usage-panel-plus") previousPanelId = lastPanelId;
				lastPanelId = next;
			}), "dsh-usage-panel-plus: panel history");
			const goBack = () => {
				if (previousPanelId === null || previousPanelId === "usage-panel-plus") {
					ctx.layout.selectPanel(null);
					return;
				}
				try {
					ctx.layout.selectPanel(previousPanelId);
				} catch {
					ctx.layout.selectPanel(null);
				}
			};
			ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
				name: "plugins.bundle.config",
				key: BUNDLE_NAME,
				locale: LOCALE_NS
			}, UsageStatsSection));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID,
				locale: LOCALE_NS,
				inject: () => ({ goBack })
			}, UsageStatsPanelPage));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: PANEL_ORDER,
				label: () => t("nav"),
				locale: LOCALE_NS
			}, StatsPanelIcon));
			ctx.slots.inject(COMPOSER_DOCK, () => {
				const dockIds = () => new Set(ctx.slots.entries(COMPOSER_DOCK).map((entry) => entry.options.id).filter((id) => id !== void 0));
				let decided = false;
				let installed = null;
				const decide = () => {
					if (decided) return;
					const ids = dockIds();
					const split = ids.has("activity") || ids.has("usage");
					if (!split && !ids.has("stats")) return;
					decided = true;
					installed = split ? installSplitDockEntries(ctx) : installStatsRowEntry(ctx);
				};
				const unsubscribe = ctx.slots.subscribe(COMPOSER_DOCK, decide);
				decide();
				return () => {
					unsubscribe();
					installed?.();
				};
			});
		}
		//#endregion
		exports.BUNDLE_NAME = BUNDLE_NAME;
		exports.PANEL_ID = PANEL_ID;
		exports.StatsPanelIcon = StatsPanelIcon;
		exports.UsageStatsPanelPage = UsageStatsPanelPage;
		exports.UsageStatsSection = UsageStatsSection;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client-registry.js.map