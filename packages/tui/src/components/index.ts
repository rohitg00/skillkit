/**
 * Components module for SkillKit TUI
 */

// Existing components
export { AgentGrid } from './AgentGrid.js';
export { StatsCard } from './StatsCard.js';
export { Header } from './Header.js';
export { Sidebar } from './Sidebar.js';
export { RightSidebar } from './RightSidebar.js';
export { BottomStatusBar } from './BottomStatusBar.js';
export { StatusBar } from './StatusBar.js';
export { SkillList } from './SkillList.js';
export { SearchInput } from './SearchInput.js';
export { Spinner } from './Spinner.js';
export { ProgressBar } from './ProgressBar.js';
export { FeatureList, FEATURES, type Feature } from './FeatureList.js';
export { Splash } from './Splash.js';

// New components (Phase 1.3)
export { SelectList, type SelectListItem } from './SelectList.js';
export { DetailPane, type DetailField } from './DetailPane.js';
export { SplitPane, ThreePaneLayout } from './SplitPane.js';
export { EmptyState, LoadingState, ErrorState } from './EmptyState.js';
export {
  StatusIndicator,
  InlineStatus,
  StatusBadge,
  type StatusType,
} from './StatusIndicator.js';
export { CodeBlock, InlineCode } from './CodeBlock.js';
export { FormField, TextAreaField, SelectField } from './FormField.js';
export { ErrorBoundary, Try } from './ErrorBoundary.js';
export {
  Button,
  ButtonGroup,
  IconButton,
  type ButtonVariant,
  type ButtonSize,
} from './Button.js';
export {
  Clickable,
  ClickableText,
  ClickableRow,
  InteractiveArea,
} from './Clickable.js';
export {
  HoverHighlight,
  HighlightableListItem,
  FocusRing,
  PressEffect,
} from './HoverHighlight.js';
export {
  AnimatedText,
  CountUpText,
  BlinkingText,
  PulsingText,
} from './AnimatedText.js';
export { TabBar, VerticalTabBar, type Tab } from './TabBar.js';
export {
  Breadcrumb,
  PathBreadcrumb,
  NavigationTrail,
  type BreadcrumbItem,
} from './Breadcrumb.js';
