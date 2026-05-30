/**
 * MarkdownDocContent — Notion / iA Writer–style faux markdown editor body.
 *
 * Sourced from the Carlos `DYlJ6X2JFIN` frame-02 "I am editing a doc" scene:
 * a single-pane markdown editor with a top breadcrumb, an `EDITANDO` status
 * pill, and lightweight per-token coloring (`#` red, `##` green, `✗` red,
 * `−` muted list dashes) over a near-black body. Optional left-edge orange
 * glow simulates cursor focus.
 *
 * NOT a full markdown renderer — only the editorial signifiers that read on
 * camera. Anything that doesn't decorate (paragraphs, plain text) renders
 * as-is in body color.
 */
import React from "react";
import { FONT_STACKS } from "../../brand";

export type MarkdownDocStatus = "EDITANDO" | "SAVED" | "EDITING";

export interface MarkdownDocContentProps {
  filename: string;
  /** Optional Finder-style path (e.g. `Notion · MARKETING · PLAN.md`). */
  breadcrumb?: string;
  /** Status pill in the top-right (defaults off). */
  status?: MarkdownDocStatus;
  /** Raw markdown body — see file header for which tokens are styled. */
  markdown: string;
  /** When true, draws a faint orange glow on the left edge (cursor focus). */
  cursorGlow?: boolean;
  /** Variant — `dark` (default Carlos look) or `light`. */
  variant?: "light" | "dark";
  /** Padding around the body in px. Default 32. */
  padding?: number;
  /** Body font-size in px. Default 26. */
  fontSize?: number;
}

const THEME = {
  dark: {
    background: "#0E1116",
    breadcrumbBg: "#0B0E12",
    breadcrumbColor: "#8B91A0",
    bodyText: "#E6E6E6",
    h1: "#FF5F57",
    h2: "#3FD771",
    cross: "#FF5F57",
    bullet: "#7A7F88",
    statusPillBg: "#1F2630",
    statusPillText: "#FFB454",
    cursorGlow: "rgba(255, 138, 76, 0.55)",
  },
  light: {
    background: "#FAF7F2",
    breadcrumbBg: "#F1EDE6",
    breadcrumbColor: "#6B6760",
    bodyText: "#1A1A1A",
    h1: "#B33A2A",
    h2: "#1F7A1F",
    cross: "#B33A2A",
    bullet: "#8A8A8A",
    statusPillBg: "#EFE7DA",
    statusPillText: "#B45309",
    cursorGlow: "rgba(212, 145, 60, 0.55)",
  },
} as const;

interface TokenSpan {
  text: string;
  color: string;
  weight: number;
  italic?: boolean;
}

type MarkdownTheme = (typeof THEME)[keyof typeof THEME];

function lineSpans(line: string, theme: MarkdownTheme): TokenSpan[] {
  // H1 / H2 / list dash / inline check & cross
  let trimmed = line;
  let prefixSpan: TokenSpan | null = null;
  let bodyColor = theme.bodyText;

  const h1 = /^# (.+)$/.exec(line);
  const h2 = /^## (.+)$/.exec(line);
  const dash = /^[-−] (.+)$/.exec(line);

  if (h1) {
    return [
      { text: "# ", color: theme.h1, weight: 700 },
      { text: h1[1], color: theme.h1, weight: 700 },
    ];
  }
  if (h2) {
    return [
      { text: "## ", color: theme.h2, weight: 600 },
      { text: h2[1], color: theme.h2, weight: 600 },
    ];
  }
  if (dash) {
    prefixSpan = { text: "− ", color: theme.bullet, weight: 400 };
    trimmed = dash[1];
  }

  // Inline cross / check markers
  const spans: TokenSpan[] = [];
  if (prefixSpan) spans.push(prefixSpan);

  const parts = trimmed.split(/(✗|✓)/);
  for (const part of parts) {
    if (part === "") continue;
    if (part === "✗") {
      spans.push({ text: part, color: theme.cross, weight: 700 });
    } else if (part === "✓") {
      spans.push({ text: part, color: theme.h2, weight: 700 });
    } else {
      spans.push({ text: part, color: bodyColor, weight: 400 });
    }
  }
  return spans;
}

export const MarkdownDocContent: React.FC<MarkdownDocContentProps> = ({
  filename,
  breadcrumb,
  status,
  markdown,
  cursorGlow = true,
  variant = "dark",
  padding = 32,
  fontSize = 26,
}) => {
  const theme = variant === "dark" ? THEME.dark : THEME.light;
  const lines = markdown.split("\n");

  return (
    <div
      style={{
        background: theme.background,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Breadcrumb row */}
      {breadcrumb || filename || status ? (
        <div
          style={{
            background: theme.breadcrumbBg,
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: FONT_STACKS.sans,
            fontSize: 14,
          }}
        >
          <div
            style={{
              color: theme.breadcrumbColor,
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            {breadcrumb ? <span>{breadcrumb}</span> : null}
            {breadcrumb && filename ? <span style={{ opacity: 0.5 }}>›</span> : null}
            {filename ? (
              <span style={{ color: theme.bodyText, fontWeight: 500 }}>
                {filename}
              </span>
            ) : null}
          </div>
          {status ? (
            <span
              style={{
                background: theme.statusPillBg,
                color: theme.statusPillText,
                fontFamily: FONT_STACKS.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                padding: "4px 10px",
                borderRadius: 4,
              }}
            >
              {status}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Cursor-glow on left edge */}
      {cursorGlow ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 80,
            background: `linear-gradient(90deg, ${theme.cursorGlow} 0%, transparent 100%)`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ) : null}

      {/* Body */}
      <div
        style={{
          padding,
          fontFamily: FONT_STACKS.monoCode,
          fontSize,
          lineHeight: 1.55,
          color: theme.bodyText,
          flex: 1,
          position: "relative",
          zIndex: 2,
        }}
      >
        {lines.map((line, i) => {
          const spans = lineSpans(line, theme);
          return (
            <div
              key={i}
              style={{
                whiteSpace: "pre-wrap",
                minHeight: fontSize * 1.55,
              }}
            >
              {spans.map((s, j) => (
                <span
                  key={j}
                  style={{
                    color: s.color,
                    fontWeight: s.weight,
                    fontStyle: s.italic ? "italic" : "normal",
                  }}
                >
                  {s.text}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
