/**
 * BrowserContent — body of a MacWindow when variant === "browser".
 *
 * Renders a thin secondary toolbar with back/forward/refresh stubs and a
 * rounded URL pill, followed by a body slot (children). Used for the Carlos
 * `DYOAxVOp2nu` frame-05 "browser + Kanban" look: chrome reads as Chrome,
 * body is the actual app demo.
 *
 * Comes with a `BrowserKanbanBody` sub-component that renders a generic
 * 3-column Kanban grid — enough to sell the "this is a real product UI"
 * read in the V/O moment, without pretending to be a working app.
 */
import React from "react";
import { FONT_STACKS } from "../../brand";

export interface BrowserContentProps {
  /** URL to display in the rounded pill (e.g. `app.armandointeligencia.com/board`). */
  url: string;
  /** Body content — typically <BrowserKanbanBody /> or a custom child. */
  children?: React.ReactNode;
  /** Body background. Default near-white. */
  background?: string;
  /** Padding around the body content in px. Default 24. */
  padding?: number;
  /** Toolbar height in px. Default 48. */
  toolbarHeight?: number;
  /** Visual variant — matches the parent MacWindow palette mode. */
  variant?: "light" | "dark";
}

export const BrowserContent: React.FC<BrowserContentProps> = ({
  url,
  children,
  background,
  padding = 24,
  toolbarHeight = 48,
  variant = "light",
}) => {
  const bodyBg = background ?? (variant === "dark" ? "#13161B" : "#FFFFFF");
  const toolbarBg = variant === "dark" ? "#1B1F25" : "#F7F7F7";
  const toolbarBorder =
    variant === "dark" ? "1px solid #0E1116" : "1px solid #E6E6E6";
  const pillBg = variant === "dark" ? "#0E1116" : "#FFFFFF";
  const pillBorder =
    variant === "dark" ? "1px solid #2A2F36" : "1px solid #DCDCDC";
  const pillColor = variant === "dark" ? "#C8C8C8" : "#3A3A3A";
  const navButtonColor = variant === "dark" ? "#6A6F77" : "#8A8A8A";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: bodyBg,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        overflow: "hidden",
        flex: 1,
      }}
    >
      {/* Secondary toolbar — nav buttons + URL pill */}
      <div
        style={{
          height: toolbarHeight,
          minHeight: toolbarHeight,
          background: toolbarBg,
          borderBottom: toolbarBorder,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 12,
          fontFamily: FONT_STACKS.sans,
        }}
      >
        {/* Nav button stubs — back / forward / refresh */}
        <span style={{ color: navButtonColor, fontSize: 18, fontWeight: 400 }}>
          ‹
        </span>
        <span style={{ color: navButtonColor, fontSize: 18, fontWeight: 400 }}>
          ›
        </span>
        <span style={{ color: navButtonColor, fontSize: 14, fontWeight: 400 }}>
          ⟳
        </span>

        {/* URL pill */}
        <div
          style={{
            flex: 1,
            height: 30,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            background: pillBg,
            border: pillBorder,
            borderRadius: 6,
            color: pillColor,
            fontSize: 13,
            fontFamily: FONT_STACKS.sans,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ opacity: 0.6, marginRight: 6 }}>🔒</span>
          {url}
        </div>
      </div>

      {/* Body content slot */}
      <div style={{ flex: 1, padding, boxSizing: "border-box" }}>
        {children}
      </div>
    </div>
  );
};

// ─── BrowserKanbanBody ───────────────────────────────────────────────────────

export interface BrowserKanbanTask {
  /** Card title. */
  title: string;
  /** Optional sub-label (e.g. assignee, priority). */
  meta?: string;
  /** Optional accent stripe color (e.g. priority red). */
  accent?: string;
}

export interface BrowserKanbanColumn {
  title: string;
  tasks: BrowserKanbanTask[];
}

export interface BrowserKanbanBodyProps {
  columns: BrowserKanbanColumn[];
  /** Matches parent MacWindow palette mode. */
  variant?: "light" | "dark";
  /** Gap between columns in px. Default 16. */
  columnGap?: number;
}

export const BrowserKanbanBody: React.FC<BrowserKanbanBodyProps> = ({
  columns,
  variant = "light",
  columnGap = 16,
}) => {
  const columnBg = variant === "dark" ? "#1B1F25" : "#F2F3F5";
  const cardBg = variant === "dark" ? "#0E1116" : "#FFFFFF";
  const cardBorder =
    variant === "dark" ? "1px solid #2A2F36" : "1px solid #E0E2E6";
  const titleColor = variant === "dark" ? "#C8C8C8" : "#3A3A3A";
  const cardTitleColor = variant === "dark" ? "#F1ECE1" : "#1A1A1A";
  const metaColor = variant === "dark" ? "#7A7F88" : "#8A8A8A";

  return (
    <div
      style={{
        display: "flex",
        gap: columnGap,
        height: "100%",
        fontFamily: FONT_STACKS.sans,
      }}
    >
      {columns.map((col, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: columnBg,
            borderRadius: 8,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              color: titleColor,
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 4,
            }}
          >
            {col.title}
          </div>
          {col.tasks.map((task, j) => (
            <div
              key={j}
              style={{
                background: cardBg,
                border: cardBorder,
                borderLeft: task.accent
                  ? `3px solid ${task.accent}`
                  : cardBorder,
                borderRadius: 6,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  color: cardTitleColor,
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.35,
                }}
              >
                {task.title}
              </div>
              {task.meta ? (
                <div
                  style={{
                    color: metaColor,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {task.meta}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
