/**
 * NumberPrimitives — three HUD-style numeric molecules.
 *
 * Wave-4 cross-creator HIGH-confidence finding (Bilawal V4 #1, "HUD telemetry
 * illusion"): every static-looking info element on screen actually ticks
 * frame-over-frame even when the underlying clip is held. The difference
 * between a screenshot and a heartbeat.
 *
 * Three primitives ship together because they always appear together in
 * Bilawal-style telemetry HUDs:
 *
 *  - <RollingDigitTicker>  — frame-over-frame digit roll with optional jitter
 *  - <DatestampTicker>     — scrubbing date counter (Intl.DateTimeFormat)
 *  - <DODDeltaChip>        — green-up / red-down monospace delta pill
 *
 * All three are deterministic across renders (FNV-1a seeded jitter inside
 * `rollingDigit`) and reuse the shared FONT_STACKS.mono / FONT_STACKS.monoCode
 * stacks so they look identical in Studio and in headless renders.
 */
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_STACKS } from "../brand";
import { rollingDigit, rollingDate } from "../animation/rollingDigit";
import { formatCount } from "../animation/countUp";

// ─────────────────────────────────────────────────────────────────────────────
// 1) RollingDigitTicker
// ─────────────────────────────────────────────────────────────────────────────

export interface RollingDigitTickerProps {
  /** Final value at endSeconds. Required. */
  to: number;
  /** Starting value at startSeconds. Defaults to 0. */
  from?: number;
  /** Wall-clock seconds when ticking begins. Default 0. */
  startSeconds?: number;
  /** Wall-clock seconds when ticking ends. Required. */
  endSeconds: number;
  /** Step interval in frames (default 3). Smaller = faster scroll. */
  stepFrames?: number;
  /** Jitter amplitude in units (default 0 = deterministic). E.g. 2 = ±2 jitter per step. */
  jitterAmplitude?: number;
  /** Deterministic seed for jitter (default 1). */
  seed?: number;
  /** Prefix string (e.g. "$"). */
  prefix?: string;
  /** Suffix string (e.g. " FT", "%", " NM"). */
  suffix?: string;
  /** Thousand-separator (default true). */
  thousands?: boolean;
  /** Decimals to display (default 0). */
  decimals?: number;
  /** Font color (default brand ink). */
  color?: string;
  /** Font size (default 72px). */
  fontSize?: number;
  /** Font weight (default 800). */
  fontWeight?: number;
  /** Font family override. Default FONT_STACKS.monoCode. */
  fontFamily?: string;
  /** Inline-block container style overrides. */
  style?: React.CSSProperties;
  /** Letter-spacing (default 0.02em). */
  letterSpacing?: string;
}

export const RollingDigitTicker: React.FC<RollingDigitTickerProps> = ({
  to,
  from = 0,
  startSeconds = 0,
  endSeconds,
  stepFrames = 3,
  jitterAmplitude = 0,
  seed = 1,
  prefix,
  suffix,
  thousands = true,
  decimals = 0,
  color = "#1A1A1A",
  fontSize = 72,
  fontWeight = 800,
  fontFamily = FONT_STACKS.monoCode,
  style,
  letterSpacing = "0.02em",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const value = rollingDigit({
    frame,
    startFrame: startSeconds * fps,
    endFrame: endSeconds * fps,
    from,
    to,
    stepFrames,
    jitterAmplitude,
    seed,
  });

  const text = formatCount(value, { prefix, suffix, decimals, thousands });

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily,
        fontSize,
        fontWeight,
        color,
        letterSpacing,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "pre",
        lineHeight: 1,
        ...style,
      }}
    >
      {text}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2) DatestampTicker
// ─────────────────────────────────────────────────────────────────────────────

export type DatestampFormat =
  | "MMM DD, YYYY"
  | "MMM DD"
  | "DD MMM"
  | "YYYY-MM-DD";

export interface DatestampTickerProps {
  fromIso: string; // "2026-02-25"
  toIso: string; // "2026-04-08"
  startSeconds?: number;
  endSeconds: number;
  /** Date format: "MMM DD, YYYY" | "MMM DD" | "DD MMM" | "YYYY-MM-DD". Default "MMM DD, YYYY". */
  format?: DatestampFormat;
  locale?: string; // default "en-US"
  uppercase?: boolean; // default true
  letterSpacing?: string; // default "0.18em"
  color?: string;
  fontSize?: number; // default 28
  fontFamily?: string; // default FONT_STACKS.mono
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatDatestamp(
  date: Date,
  format: DatestampFormat,
  locale: string,
): string {
  // Use Intl.DateTimeFormat for the month abbreviation so the locale flag
  // matters (es-MX -> "ene", en-US -> "Jan"). Day + year we control directly
  // for layout-stable padding.
  const monthShort = new Intl.DateTimeFormat(locale, { month: "short" })
    .format(date)
    .replace(/\.$/, ""); // some locales suffix with "."
  const day = pad2(date.getDate());
  const year = date.getFullYear();

  switch (format) {
    case "MMM DD":
      return `${monthShort} ${day}`;
    case "DD MMM":
      return `${day} ${monthShort}`;
    case "YYYY-MM-DD":
      return `${year}-${pad2(date.getMonth() + 1)}-${day}`;
    case "MMM DD, YYYY":
    default:
      return `${monthShort} ${day}, ${year}`;
  }
}

export const DatestampTicker: React.FC<DatestampTickerProps> = ({
  fromIso,
  toIso,
  startSeconds = 0,
  endSeconds,
  format = "MMM DD, YYYY",
  locale = "en-US",
  uppercase = true,
  letterSpacing = "0.18em",
  color = "#1A1A1A",
  fontSize = 28,
  fontFamily = FONT_STACKS.mono,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const date = rollingDate({
    frame,
    startFrame: startSeconds * fps,
    endFrame: endSeconds * fps,
    fromIso,
    toIso,
  });

  const rendered = formatDatestamp(date, format, locale);
  const text = uppercase ? rendered.toUpperCase() : rendered;

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily,
        fontSize,
        fontWeight: 500,
        color,
        letterSpacing,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "pre",
        lineHeight: 1,
      }}
    >
      {text}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3) DODDeltaChip
// ─────────────────────────────────────────────────────────────────────────────

export interface DODDeltaChipProps {
  /** Numeric delta value, signed. Positive = green ▲, negative = red ▼. */
  value: number;
  /** Suffix unit (default "%"). */
  suffix?: string;
  /** Show " DOD" trailing label (default true — Bilawal pattern). */
  showDODLabel?: boolean;
  /** Decimals (default 2). */
  decimals?: number;
  /** Color overrides. */
  positiveColor?: string; // default #3FCB7E
  negativeColor?: string; // default #E07A6B
  /** Optional border (default thin matching color). */
  bordered?: boolean;
  fontSize?: number; // default 24
}

export const DODDeltaChip: React.FC<DODDeltaChipProps> = ({
  value,
  suffix = "%",
  showDODLabel = true,
  decimals = 2,
  positiveColor = "#3FCB7E",
  negativeColor = "#E07A6B",
  bordered = true,
  fontSize = 24,
}) => {
  const isPositive = value >= 0;
  const color = isPositive ? positiveColor : negativeColor;
  const arrow = isPositive ? "▲" : "▼"; // ▲ / ▼
  const sign = isPositive ? "+" : "-";
  const magnitude = Math.abs(value).toFixed(decimals);
  const label = showDODLabel ? " DOD" : "";

  // Translucent tint of the foreground color for the pill background.
  // Using rgba-from-hex would require parsing; instead lean on the
  // semi-transparent overlay trick: the foreground color at low opacity over
  // whatever the parent paper is.
  const background = `${color}1A`; // append alpha hex (~10%)

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35em",
        padding: "0.3em 0.7em",
        borderRadius: "999px",
        border: bordered ? `1px solid ${color}` : "1px solid transparent",
        background,
        color,
        fontFamily: FONT_STACKS.mono,
        fontWeight: 700,
        fontSize,
        letterSpacing: "0.04em",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: "0.85em", lineHeight: 1 }}>{arrow}</span>
      <span>{`${sign}${magnitude}${suffix}${label}`}</span>
    </span>
  );
};
