/**
 * Feature Flags — sterowane zmiennymi środowiskowymi VITE_FF_*.
 * Domyślne wartości pozwalają na działanie bez konfiguracji .env.
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
} as const;
