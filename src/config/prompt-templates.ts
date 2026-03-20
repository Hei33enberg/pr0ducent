import { ShoppingCart, BarChart3, Palette, ClipboardList, Store, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PromptTemplate {
  id: string;
  label: string;
  icon: LucideIcon;
  prompt: string;
  tags: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "ecommerce",
    label: "Online Store",
    icon: ShoppingCart,
    prompt: "Build an e-commerce store with product catalog, shopping cart, checkout flow with Stripe payments, user accounts, and order history dashboard.",
    tags: ["e-commerce"],
  },
  {
    id: "saas-dashboard",
    label: "Analytics Panel",
    icon: BarChart3,
    prompt: "Create a SaaS analytics dashboard with user authentication, team management, usage metrics charts, billing page, and role-based access control.",
    tags: ["saas"],
  },
  {
    id: "portfolio",
    label: "Dev Portfolio",
    icon: Palette,
    prompt: "Design a modern developer portfolio with project showcase, blog section, contact form, dark/light mode, and smooth scroll animations.",
    tags: ["portfolio"],
  },
  {
    id: "project-mgmt",
    label: "Task Board",
    icon: ClipboardList,
    prompt: "Build a project management tool with Kanban boards, task assignments, team chat, file uploads, deadline tracking, and notification system.",
    tags: ["internal-tool"],
  },
  {
    id: "marketplace",
    label: "Buyer–Seller Platform",
    icon: Store,
    prompt: "Create a two-sided marketplace with seller profiles, product listings, search and filters, messaging between buyers and sellers, and review system.",
    tags: ["marketplace"],
  },
  {
    id: "mobile-app",
    label: "Fitness Tracker",
    icon: Smartphone,
    prompt: "Build a fitness tracking mobile app with workout logging, progress charts, social feed, achievement badges, and push notifications.",
    tags: ["mobile"],
  },
];

export const DEMO_TEMPLATE = PROMPT_TEMPLATES[0];
