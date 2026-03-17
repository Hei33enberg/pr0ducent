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
  },
  {
    id: "replit",
    name: "Replit",
    logoUrl: "https://replit.com/public/images/sm-og-image.png",
    featured: false,
    strengths: ["Multi-language", "Collaborative IDE", "Always-on hosting"],
    description: "Cloud IDE with AI agent for building and deploying apps.",
    mockDelayRange: [12, 25],
    stack: "Node.js + Express + SQLite",
    hosting: "Replit Deployments",
  },
  {
    id: "v0",
    name: "Vercel v0",
    logoUrl: "https://v0.dev/favicon.ico",
    featured: false,
    strengths: ["UI components", "shadcn/ui native", "Quick iteration"],
    description: "AI-powered UI generation by Vercel, optimized for React components.",
    mockDelayRange: [5, 12],
    stack: "Next.js + TypeScript + Tailwind",
    hosting: "Vercel Edge Network",
  },
  {
    id: "cursor",
    name: "Cursor",
    logoUrl: "https://cursor.sh/favicon.ico",
    featured: false,
    strengths: ["Code-level control", "Multi-file editing", "Git integration"],
    description: "AI-powered code editor for professional developers.",
    mockDelayRange: [15, 30],
    stack: "Any (user-defined)",
    hosting: "Self-hosted",
  },
  {
    id: "base44",
    name: "Base44",
    logoUrl: "https://www.base44.com/favicon.ico",
    featured: false,
    strengths: ["Business apps", "Database-first", "No-code friendly"],
    description: "AI app builder focused on business applications and databases.",
    mockDelayRange: [10, 22],
    stack: "React + Python + PostgreSQL",
    hosting: "Base44 Cloud",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    logoUrl: "",
    featured: false,
    strengths: ["Rapid prototyping", "Design-to-code", "Mobile-first"],
    description: "AI design-to-code platform for rapid prototyping.",
    mockDelayRange: [8, 20],
    stack: "React Native + TypeScript",
    hosting: "Antigravity Cloud",
  },
  {
    id: "build0",
    name: "Build0",
    logoUrl: "",
    featured: false,
    strengths: ["Zero-config", "Instant deploy", "Template library"],
    description: "Zero-configuration AI app builder with instant deployments.",
    mockDelayRange: [6, 15],
    stack: "Next.js + Prisma + PostgreSQL",
    hosting: "Build0 Infrastructure",
  },
  {
    id: "orchids",
    name: "Orchids",
    logoUrl: "",
    featured: false,
    strengths: ["Beautiful UI", "Animation-rich", "Design systems"],
    description: "AI builder focused on beautiful, animation-rich interfaces.",
    mockDelayRange: [10, 24],
    stack: "React + Framer Motion + Tailwind",
    hosting: "Orchids CDN",
  },
  {
    id: "floot",
    name: "Floot",
    logoUrl: "",
    featured: false,
    strengths: ["API integration", "Workflow automation", "Enterprise ready"],
    description: "Enterprise-grade AI app builder with workflow automation.",
    mockDelayRange: [14, 28],
    stack: "Next.js + tRPC + PostgreSQL",
    hosting: "AWS (managed)",
  },
  {
    id: "bolt",
    name: "Bolt.new",
    logoUrl: "https://bolt.new/favicon.ico",
    featured: false,
    strengths: ["In-browser dev", "WebContainer", "Full-stack"],
    description: "AI-powered full-stack development environment in the browser.",
    mockDelayRange: [7, 16],
    stack: "Any (WebContainer)",
    hosting: "Bolt Cloud",
  },
];

export const getToolById = (id: string) => BUILDER_TOOLS.find((t) => t.id === id);
