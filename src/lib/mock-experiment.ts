import { BUILDER_TOOLS, getToolById } from "@/config/tools";
import type { Experiment, ExperimentRun, EditorialScores, AccountModel } from "@/types/experiment";

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const MOCK_DESCRIPTIONS: Record<string, string> = {
  lovable: "Generated a complete full-stack React application with Supabase backend, authentication, and responsive UI. Clean component architecture with TypeScript throughout.",
  replit: "Built a Node.js application with Express backend and SQLite database. Includes basic CRUD operations and a functional frontend.",
  v0: "Created polished React UI components with shadcn/ui styling. Excellent visual design but limited backend functionality.",
  cursor: "Generated well-structured codebase with clean architecture. Requires manual setup for deployment and hosting.",
  base44: "Produced a database-driven business application with admin panel and data management features.",
  antigravity: "Created a mobile-responsive prototype with smooth animations and modern design patterns.",
  build0: "Deployed a functional Next.js application with Prisma ORM and basic API routes.",
  orchids: "Built a visually stunning interface with rich animations and micro-interactions.",
  floot: "Generated an enterprise-grade application with workflow automation and API integrations.",
  bolt: "Created a full-stack application in the browser with live preview and instant deployment.",
};

const MOCK_PROS: Record<string, string[]> = {
  lovable: ["Fastest time to working prototype", "Full backend included", "One-click deployment", "Beautiful default UI"],
  replit: ["Multi-language support", "Collaborative editing", "Always-on hosting"],
  v0: ["Exceptional UI quality", "shadcn/ui components", "Fast iteration cycles"],
  cursor: ["Full code control", "Git integration", "Professional-grade output"],
  base44: ["Database-first approach", "Admin panel included", "Business logic focus"],
  antigravity: ["Mobile-first design", "Smooth animations", "Quick prototyping"],
  build0: ["Zero configuration needed", "Instant deployment", "Template library"],
  orchids: ["Stunning visuals", "Animation quality", "Design system included"],
  floot: ["Enterprise features", "Workflow automation", "API management"],
  bolt: ["In-browser development", "No local setup", "Full-stack capable"],
};

const MOCK_CONS: Record<string, string[]> = {
  lovable: ["React/TypeScript only", "Supabase-specific backend"],
  replit: ["Slower generation time", "Basic UI defaults"],
  v0: ["Frontend-only focus", "Limited backend support"],
  cursor: ["Requires local setup", "Steeper learning curve"],
  base44: ["Less UI polish", "Limited customization"],
  antigravity: ["Newer platform", "Smaller community"],
  build0: ["Template-dependent", "Less flexibility"],
  orchids: ["Style over substance", "Limited backend"],
  floot: ["Slower generation", "Complex configuration"],
  bolt: ["Browser-dependent", "Resource-intensive"],
};

// Mock build steps for animation
export const MOCK_BUILD_STEPS: Record<string, string[]> = {
  lovable: ["Analyzing prompt…", "Scaffolding React app…", "Setting up Supabase…", "Generating components…", "Applying Tailwind styles…", "Running type checks…", "Deploying…"],
  replit: ["Creating workspace…", "Installing dependencies…", "Generating Express server…", "Building frontend…", "Running tests…"],
  v0: ["Parsing design intent…", "Generating UI components…", "Applying shadcn/ui…", "Optimizing layout…"],
  cursor: ["Analyzing codebase…", "Planning architecture…", "Writing modules…", "Generating tests…", "Formatting code…"],
  base44: ["Designing schema…", "Building data models…", "Creating admin panel…", "Generating API…"],
  antigravity: ["Creating wireframe…", "Building components…", "Adding animations…", "Mobile optimization…"],
  build0: ["Selecting template…", "Customizing layout…", "Configuring Prisma…", "Deploying…"],
  orchids: ["Designing UI system…", "Crafting animations…", "Building components…", "Adding transitions…"],
  floot: ["Planning workflow…", "Creating API routes…", "Setting up integrations…", "Deploying to AWS…"],
  bolt: ["Booting WebContainer…", "Installing packages…", "Generating code…", "Starting dev server…"],
};

// Mock gradient colors per builder for preview placeholders
export const MOCK_PREVIEW_GRADIENTS: Record<string, string> = {
  lovable: "from-rose-500/20 via-purple-500/20 to-indigo-500/20",
  replit: "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
  v0: "from-zinc-900/30 via-zinc-700/20 to-zinc-500/10",
  cursor: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
  base44: "from-blue-500/20 via-indigo-500/20 to-violet-500/20",
  antigravity: "from-pink-500/20 via-fuchsia-500/20 to-purple-500/20",
  build0: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
  orchids: "from-pink-400/20 via-rose-400/20 to-red-400/20",
  floot: "from-slate-500/20 via-gray-500/20 to-zinc-500/20",
  bolt: "from-yellow-500/20 via-orange-500/20 to-red-500/20",
};

function generateScores(toolId: string): EditorialScores {
  const base: Record<string, EditorialScores> = {
    lovable:      { uiQuality: 92, backendLogic: 88, speed: 95, easeOfEditing: 90 },
    replit:       { uiQuality: 68, backendLogic: 82, speed: 60, easeOfEditing: 75 },
    v0:           { uiQuality: 96, backendLogic: 35, speed: 90, easeOfEditing: 85 },
    cursor:       { uiQuality: 78, backendLogic: 90, speed: 55, easeOfEditing: 65 },
    base44:       { uiQuality: 60, backendLogic: 85, speed: 70, easeOfEditing: 72 },
    antigravity:  { uiQuality: 82, backendLogic: 55, speed: 78, easeOfEditing: 80 },
    build0:       { uiQuality: 74, backendLogic: 72, speed: 85, easeOfEditing: 82 },
    orchids:      { uiQuality: 94, backendLogic: 40, speed: 65, easeOfEditing: 70 },
    floot:        { uiQuality: 65, backendLogic: 88, speed: 50, easeOfEditing: 58 },
    bolt:         { uiQuality: 80, backendLogic: 78, speed: 82, easeOfEditing: 76 },
  };
  const scores = base[toolId] || { uiQuality: 70, backendLogic: 70, speed: 70, easeOfEditing: 70 };
  return {
    uiQuality: Math.min(100, Math.max(0, scores.uiQuality + randomBetween(-5, 5))),
    backendLogic: Math.min(100, Math.max(0, scores.backendLogic + randomBetween(-5, 5))),
    speed: Math.min(100, Math.max(0, scores.speed + randomBetween(-5, 5))),
    easeOfEditing: Math.min(100, Math.max(0, scores.easeOfEditing + randomBetween(-5, 5))),
  };
}

export function createMockExperiment(
  prompt: string,
  selectedToolIds: string[],
  accountModel: AccountModel
): Experiment {
  const runs: ExperimentRun[] = selectedToolIds.map((toolId) => {
    const tool = getToolById(toolId);
    const delay = tool
      ? randomBetween(tool.mockDelayRange[0], tool.mockDelayRange[1])
      : randomBetween(8, 20);

    return {
      toolId,
      status: "queued",
      startedAt: Date.now(),
      timeToFirstPrototype: delay,
      description: MOCK_DESCRIPTIONS[toolId] || "Generated a functional application prototype.",
      scores: generateScores(toolId),
      pros: MOCK_PROS[toolId] || ["Functional output", "Quick generation"],
      cons: MOCK_CONS[toolId] || ["Limited customization"],
    };
  });

  return {
    id: crypto.randomUUID(),
    prompt,
    selectedTools: selectedToolIds,
    accountModel,
    createdAt: Date.now(),
    runs,
  };
}

export function loadExperiments(): Experiment[] {
  try {
    const stored = localStorage.getItem("promptlab_experiments");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveExperiment(experiment: Experiment) {
  const experiments = loadExperiments();
  const idx = experiments.findIndex((e) => e.id === experiment.id);
  if (idx >= 0) {
    experiments[idx] = experiment;
  } else {
    experiments.unshift(experiment);
  }
  localStorage.setItem("promptlab_experiments", JSON.stringify(experiments));
}

export function deleteLocalExperiment(id: string) {
  const experiments = loadExperiments().filter((e) => e.id !== id);
  localStorage.setItem("promptlab_experiments", JSON.stringify(experiments));
}
