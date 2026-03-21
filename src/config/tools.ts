export interface BuilderTool {
  id: string;
  name: string;
  logoUrl: string;
  featured: boolean;
  strengths: string[];
  description: string;
  mockDelayRange: [number, number]; // seconds
  stack: string;
  hosting: string;
  pricing: string;
  category: string;
  referralUrl?: string;
  /** Overlay from `builder_integration_config` when catalog is merged (POP onboarding). */
  integrationEnabled?: boolean;
  integrationTier?: number;
  circuitState?: string;
  circuitOpenedAt?: string | null;
  integrationType?: string | null;
}

export const BUILDER_TOOLS: BuilderTool[] = [
  {
    id: "lovable",
    name: "Lovable",
    logoUrl: "https://lovable.dev/favicon.ico",
    featured: true,
    strengths: ["Full-stack generation", "Supabase integration", "Live preview", "One-click deploy"],
    description: "AI-powered full-stack web app builder with instant preview and deployment.",
    mockDelayRange: [8, 18],
    stack: "React + TypeScript + Tailwind + Supabase",
    hosting: "Lovable Cloud (auto-scaling)",
    pricing: "Free tier + $20/mo Pro",
    category: "Full-stack builder",
  },
  {
    id: "replit",
    name: "Replit",
    logoUrl: "https://www.google.com/s2/favicons?domain=replit.com&sz=64",
    featured: false,
    strengths: ["Multi-language", "Collaborative IDE", "Always-on hosting"],
    description: "Cloud IDE with AI agent for building and deploying apps.",
    mockDelayRange: [12, 25],
    stack: "Node.js + Express + SQLite",
    hosting: "Replit Deployments",
    pricing: "Free tier + $25/mo Hacker",
    category: "Cloud IDE",
  },
  {
    id: "v0",
    name: "Vercel v0",
    logoUrl: "https://www.google.com/s2/favicons?domain=v0.dev&sz=64",
    featured: false,
    strengths: ["UI components", "shadcn/ui native", "Quick iteration"],
    description: "AI-powered UI generation by Vercel, optimized for React components.",
    mockDelayRange: [5, 12],
    stack: "Next.js + TypeScript + Tailwind",
    hosting: "Vercel Edge Network",
    pricing: "Free tier + $20/mo Premium",
    category: "UI generator",
  },
  {
    id: "cursor",
    name: "Cursor",
    logoUrl: "https://www.google.com/s2/favicons?domain=cursor.sh&sz=64",
    featured: false,
    strengths: ["Code-level control", "Multi-file editing", "Git integration"],
    description: "AI-powered code editor for professional developers.",
    mockDelayRange: [15, 30],
    stack: "Any (user-defined)",
    hosting: "Self-hosted",
    pricing: "Free tier + $20/mo Pro",
    category: "Code editor",
  },
  {
    id: "base44",
    name: "Base44",
    logoUrl: "https://www.google.com/s2/favicons?domain=base44.com&sz=64",
    featured: false,
    strengths: ["Business apps", "Database-first", "No-code friendly"],
    description: "AI app builder focused on business applications and databases.",
    mockDelayRange: [10, 22],
    stack: "React + Python + PostgreSQL",
    hosting: "Base44 Cloud",
    pricing: "Free tier + $29/mo",
    category: "Business app builder",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    logoUrl: "https://www.google.com/s2/favicons?domain=antigravity.dev&sz=64",
    featured: false,
    strengths: ["Rapid prototyping", "Design-to-code", "Mobile-first"],
    description: "AI design-to-code platform for rapid prototyping.",
    mockDelayRange: [8, 20],
    stack: "React Native + TypeScript",
    hosting: "Antigravity Cloud",
    pricing: "Free beta",
    category: "Mobile builder",
  },
  {
    id: "build0",
    name: "Build0",
    logoUrl: "https://www.google.com/s2/favicons?domain=build0.dev&sz=64",
    featured: false,
    strengths: ["Zero-config", "Instant deploy", "Template library"],
    description: "Zero-configuration AI app builder with instant deployments.",
    mockDelayRange: [6, 15],
    stack: "Next.js + Prisma + PostgreSQL",
    hosting: "Build0 Infrastructure",
    pricing: "Free tier + $15/mo",
    category: "Full-stack builder",
  },
  {
    id: "orchids",
    name: "Orchids",
    logoUrl: "https://www.google.com/s2/favicons?domain=orchids.dev&sz=64",
    featured: false,
    strengths: ["Beautiful UI", "Animation-rich", "Design systems"],
    description: "AI builder focused on beautiful, animation-rich interfaces.",
    mockDelayRange: [10, 24],
    stack: "React + Framer Motion + Tailwind",
    hosting: "Orchids CDN",
    pricing: "Free tier + $19/mo",
    category: "Design-focused builder",
  },
  {
    id: "floot",
    name: "Floot",
    logoUrl: "https://www.google.com/s2/favicons?domain=floot.ai&sz=64",
    featured: false,
    strengths: ["API integration", "Workflow automation", "Enterprise ready"],
    description: "Enterprise-grade AI app builder with workflow automation.",
    mockDelayRange: [14, 28],
    stack: "Next.js + tRPC + PostgreSQL",
    hosting: "AWS (managed)",
    pricing: "From $49/mo",
    category: "Enterprise builder",
  },
  {
    id: "bolt",
    name: "Bolt.new",
    logoUrl: "https://www.google.com/s2/favicons?domain=bolt.new&sz=64",
    featured: false,
    strengths: ["In-browser dev", "WebContainer", "Full-stack"],
    description: "AI-powered full-stack development environment in the browser.",
    mockDelayRange: [7, 16],
    stack: "Any (WebContainer)",
    hosting: "Bolt Cloud",
    pricing: "Free tier + $20/mo Pro",
    category: "In-browser IDE",
  },
];

export const getToolById = (id: string) => BUILDER_TOOLS.find((t) => t.id === id);
