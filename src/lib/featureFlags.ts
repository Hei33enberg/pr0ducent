/**
 * Feature flags — driven by VITE_FF_* environment variables.
 * Defaults allow the app to run without a .env file.
 */
export const FF = {
  /** Marketplace page visible in nav + routing */
  MARKETPLACE_ENABLED: import.meta.env.VITE_FF_MARKETPLACE !== "false",

  /** Multi-builder Realtime stream overlay in ComparisonCanvas */
  MULTI_BUILDER_STREAM: import.meta.env.VITE_FF_MULTI_BUILDER_STREAM !== "false",

  /** BYOA tab in UserDashboard */
  BYOA_TAB: import.meta.env.VITE_FF_BYOA !== "false",

  /** Dev-only experiment inspector (Ctrl+Shift+D) */
  DEV_INSPECTOR: import.meta.env.DEV,

  /**
   * Bridge Mode: non-native builder surfaces (URL handoff, future bridge adapters).
   * Default off; enable per env when deploying bridge flows.
   */
  BRIDGE_MODE: import.meta.env.VITE_FF_BRIDGE_MODE === "true",

  /**
   * Aggressive bridges (e.g. browser automation). Requires BRIDGE_MODE.
   * Policy: docs/POP-BRIDGE-RISK-POLICY.md
   */
  BRIDGE_AGGRESSIVE: import.meta.env.VITE_FF_BRIDGE_AGGRESSIVE === "true",
} as const;
