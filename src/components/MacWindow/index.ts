/**
 * MacWindow — UI mockup DSL family.
 *
 * Composes a Mac-style window chrome around one of 5 content variants:
 *   - terminal (Carlos zsh / bash mockup)
 *   - browser  (Chrome chrome + Kanban / app body)
 *   - editor   (VS-Code with line numbers + line-highlight glow)
 *   - phone    (iPhone bezel + WhatsApp/iMessage/Telegram body)
 *   - doc      (Notion-style markdown editor)
 *
 * See `MacWindow.tsx` for the top-level wrapper.
 */

export { MacWindow } from "./MacWindow";
export type { MacWindowVariant, MacWindowProps } from "./MacWindow";

export { TrafficLights } from "./TrafficLights";
export type { TrafficLightsProps } from "./TrafficLights";

export { TerminalContent } from "./TerminalContent";
export type {
  TerminalContentProps,
  TerminalLine,
  TerminalLineKind,
  TerminalDecorator,
} from "./TerminalContent";

export { BrowserContent, BrowserKanbanBody } from "./BrowserContent";
export type {
  BrowserContentProps,
  BrowserKanbanBodyProps,
  BrowserKanbanColumn,
  BrowserKanbanTask,
} from "./BrowserContent";

export { EditorContent } from "./EditorContent";
export type {
  EditorContentProps,
  EditorLanguage,
  EditorSideAnnotation,
} from "./EditorContent";

export { PhoneContent } from "./PhoneContent";
export type {
  PhoneContentProps,
  PhoneApp,
  PhoneContact,
  PhoneMessage,
} from "./PhoneContent";

export { MarkdownDocContent } from "./MarkdownDocContent";
export type {
  MarkdownDocContentProps,
  MarkdownDocStatus,
} from "./MarkdownDocContent";
