import { ShoppingCart, BarChart3, Palette, ClipboardList, Store, Smartphone, MessageSquare, Users, Bot, Share2, CalendarDays, GraduationCap, Home, UtensilsCrossed, Briefcase, Ticket, Receipt, Heart, Globe } from "lucide-react";
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
  {
    id: "chat-app",
    label: "Team Chat",
    icon: MessageSquare,
    prompt: "Build a real-time team chat application with channels, direct messages, file sharing, user presence indicators, and message search.",
    tags: ["saas"],
  },
  {
    id: "crm",
    label: "CRM Portal",
    icon: Users,
    prompt: "Build a CRM with contact management, deal pipeline, email integration, activity timeline, reporting dashboard, and team collaboration features.",
    tags: ["saas"],
  },
  {
    id: "ai-chatbot",
    label: "AI Chatbot",
    icon: Bot,
    prompt: "Create an AI chatbot platform with conversation history, multiple AI model support, prompt templates, usage analytics, and API key management.",
    tags: ["ai"],
  },
  {
    id: "social-dashboard",
    label: "Social Dashboard",
    icon: Share2,
    prompt: "Build a social media management dashboard with multi-platform posting, content calendar, engagement analytics, and audience insights.",
    tags: ["saas"],
  },
  {
    id: "booking",
    label: "Booking App",
    icon: CalendarDays,
    prompt: "Create a booking and scheduling platform with calendar view, appointment management, payment processing, email reminders, and client portal.",
    tags: ["saas"],
  },
  {
    id: "lms",
    label: "Learning Platform",
    icon: GraduationCap,
    prompt: "Build a learning management system with course creation, video lessons, quizzes, student progress tracking, certificates, and discussion forums.",
    tags: ["education"],
  },
  {
    id: "real-estate",
    label: "Property Listings",
    icon: Home,
    prompt: "Create a real estate listing platform with property search, map integration, virtual tours, agent profiles, mortgage calculator, and saved searches.",
    tags: ["marketplace"],
  },
  {
    id: "food-ordering",
    label: "Food Ordering",
    icon: UtensilsCrossed,
    prompt: "Build a restaurant ordering system with menu management, cart, online payments, order tracking, delivery status, and restaurant dashboard.",
    tags: ["e-commerce"],
  },
  {
    id: "hr-tool",
    label: "HR Platform",
    icon: Briefcase,
    prompt: "Create an HR management tool with employee directory, leave management, performance reviews, onboarding workflows, and payroll integration.",
    tags: ["internal-tool"],
  },
  {
    id: "event-mgmt",
    label: "Event Manager",
    icon: Ticket,
    prompt: "Build an event management platform with event creation, ticket sales, attendee registration, check-in system, and post-event analytics.",
    tags: ["saas"],
  },
  {
    id: "invoicing",
    label: "Invoice Tool",
    icon: Receipt,
    prompt: "Create an invoicing and billing application with invoice generation, payment tracking, client management, recurring invoices, and financial reports.",
    tags: ["saas"],
  },
  {
    id: "wellness",
    label: "Wellness App",
    icon: Heart,
    prompt: "Build a health and wellness app with habit tracking, meditation timer, mood journal, sleep analysis, and personalized wellness plans.",
    tags: ["mobile"],
  },
  {
    id: "community",
    label: "Community Forum",
    icon: Globe,
    prompt: "Create a community forum with threaded discussions, user profiles, reputation system, content moderation, categories, and search functionality.",
    tags: ["social"],
  },
];
