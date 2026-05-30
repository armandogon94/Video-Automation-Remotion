/**
 * MacWindow — the top-level UI-mockup wrapper, the single highest-leverage
 * primitive in Wave-4 per `docs/critiques/wave-4/carloscuamatzin-consensus.md`.
 *
 * Composes:
 *   - `TrafficLights` — red/yellow/green dots + optional centered title
 *   - one of `{TerminalContent, BrowserContent, EditorContent, PhoneContent,
 *     MarkdownDocContent}` based on the `variant` prop
 *
 * The `paletteMode` prop adapts colors (cream / dark / warm-black / true-black
 * / paper). Drop shadow tints to match the palette accent so the window reads
 * as part of the brand rather than a stock UI screenshot.
 *
 * For `variant: "phone"` the macOS chrome is suppressed — the iPhone bezel
 * IS the window. For every other variant we render the chrome card.
 */
import React from "react";
import { getPalette, isDarkPalette, type PaletteMode } from "../../brand";
import { TrafficLights } from "./TrafficLights";
import {
  TerminalContent,
  type TerminalContentProps,
} from "./TerminalContent";
import { BrowserContent, type BrowserContentProps } from "./BrowserContent";
import { EditorContent, type EditorContentProps } from "./EditorContent";
import { PhoneContent, type PhoneContentProps } from "./PhoneContent";
import {
  MarkdownDocContent,
  type MarkdownDocContentProps,
} from "./MarkdownDocContent";

export type MacWindowVariant =
  | "terminal"
  | "browser"
  | "editor"
  | "phone"
  | "doc";

/**
 * Discriminated-union prop shape. Pick exactly one of the
 * `{variant}Props` keys that matches the chosen `variant`.
 */
export interface MacWindowProps {
  variant: MacWindowVariant;
  /** Outer width in px. Default 960. */
  width?: number;
  /** Outer height in px. Default 600. */
  height?: number;
  /** Optional title-bar string (e.g. `~/projects/aif — zsh`). */
  titleBar?: string;
  /** Optional subtitle appended after the title (e.g. `— bash`). */
  titleBarSubtitle?: string;
  /** Palette mode — adapts chrome + shadow tint. Default `cream`. */
  paletteMode?: PaletteMode;
  /** Optional override slot. When provided, replaces the variant body entirely. */
  children?: React.ReactNode;

  // ── Per-variant props (use the one matching `variant`)
  terminalProps?: Omit<TerminalContentProps, "frame" | "fps"> & {
    frame: number;
    fps: number;
  };
  browserProps?: BrowserContentProps;
  editorProps?: EditorContentProps;
  phoneProps?: Omit<PhoneContentProps, "paletteMode"> & {
    paletteMode?: PaletteMode;
  };
  docProps?: MarkdownDocContentProps;
}

function variantToVariantFlag(
  mode: PaletteMode,
): "light" | "dark" {
  return isDarkPalette(mode) ? "dark" : "light";
}

export const MacWindow: React.FC<MacWindowProps> = ({
  variant,
  width = 960,
  height = 600,
  titleBar,
  titleBarSubtitle,
  paletteMode = "cream",
  children,
  terminalProps,
  browserProps,
  editorProps,
  phoneProps,
  docProps,
}) => {
  const palette = getPalette(paletteMode);
  const isDark = isDarkPalette(paletteMode);
  const chromeVariant = variantToVariantFlag(paletteMode);

  // Phone variant is its own bezel — bypass macOS chrome entirely.
  if (variant === "phone") {
    if (children) {
      return (
        <div style={{ width, height, position: "relative" }}>{children}</div>
      );
    }
    if (!phoneProps) {
      throw new Error(
        "MacWindow: phoneProps is required when variant === 'phone'.",
      );
    }
    const { paletteMode: phonePalette, ...rest } = phoneProps;
    return (
      <PhoneContent
        {...rest}
        paletteMode={phonePalette ?? paletteMode}
        width={rest.width ?? Math.min(width, 420)}
        height={rest.height ?? Math.min(height, 880)}
      />
    );
  }

  // Shared shadow — amber-tinted on dark palettes, warm-red on cream.
  const dropShadow = isDark
    ? `0 8px 28px ${palette.accentShadow}`
    : `0 8px 28px rgba(179, 58, 42, 0.10)`;

  // Card background: very dark grey on dark palettes, white-ish on cream.
  const cardBg = isDark ? "#0E1116" : "#FFFFFF";

  const body = (() => {
    if (children) return children;
    switch (variant) {
      case "terminal":
        if (!terminalProps) {
          throw new Error(
            "MacWindow: terminalProps is required when variant === 'terminal'.",
          );
        }
        return <TerminalContent {...terminalProps} />;
      case "browser":
        if (!browserProps) {
          throw new Error(
            "MacWindow: browserProps is required when variant === 'browser'.",
          );
        }
        return (
          <BrowserContent
            {...browserProps}
            variant={browserProps.variant ?? chromeVariant}
          />
        );
      case "editor":
        if (!editorProps) {
          throw new Error(
            "MacWindow: editorProps is required when variant === 'editor'.",
          );
        }
        return (
          <EditorContent
            {...editorProps}
            variant={editorProps.variant ?? chromeVariant}
          />
        );
      case "doc":
        if (!docProps) {
          throw new Error(
            "MacWindow: docProps is required when variant === 'doc'.",
          );
        }
        return (
          <MarkdownDocContent
            {...docProps}
            variant={docProps.variant ?? chromeVariant}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <div
      style={{
        width,
        height,
        background: cardBg,
        borderRadius: 14,
        boxShadow: dropShadow,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <TrafficLights
        title={titleBar}
        subtitle={titleBarSubtitle}
        variant={chromeVariant}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {body}
      </div>
    </div>
  );
};
