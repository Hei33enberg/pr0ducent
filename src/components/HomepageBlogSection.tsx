import { copy } from "@/lib/copy";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  published_at: string | null;
  category: string | null;
  tags: string[] | null;
}

export function HomepageBlogSection() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, excerpt, slug, published_at, category, tags")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setPosts(data);
      });
  }, []);

  if (posts.length === 0) return null;

  const featured = posts[0];
  const rest = posts.slice(1, 6);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
      <header className="text-center mb-10 max-w-3xl mx-auto">
        <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
          {copy["blog.eyebrow"]}
        </p>
        <h2
          className="font-serif font-bold tracking-[-0.02em] leading-[1.05] text-foreground"
          style={{ fontSize: "clamp(2.75rem, 5vw + 0.75rem, 5rem)" }}
        >
          {copy["blog.title"]}
        </h2>
        <p className="text-base text-muted-foreground font-sans mt-4">
          {copy["blog.subtitle"]}
        </p>
        <button
          type="button"
          onClick={() => navigate("/blog")}
          className="mt-6 text-xs font-sans font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mx-auto"
        >
          {copy["blog.viewAll"]} <ArrowRight className="w-3 h-3" />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        {/* Featured post */}
        <button
          onClick={() => navigate(`/blog/${featured.slug}`)}
          className="glass-card rounded-xl p-6 text-left space-y-3 hover:scale-[1.01] transition-transform"
        >
          {featured.category && (
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-accent">
              {featured.category}
            </span>
          )}
          <h3 className="text-lg md:text-xl font-serif font-bold text-foreground leading-tight">
            {featured.title}
          </h3>
          {featured.excerpt && (
            <p className="text-sm text-muted-foreground font-sans line-clamp-3">
              {featured.excerpt}
            </p>
          )}
          {featured.published_at && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
              <CalendarDays className="w-3 h-3" />
              {new Date(featured.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          )}
        </button>

        {/* Recent posts list */}
        <div className="space-y-2">
          {rest.map((post) => (
            <button
              key={post.id}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="glass-card rounded-lg p-3 w-full text-left hover:scale-[1.01] transition-transform"
            >
              <h4 className="text-xs font-serif font-bold text-foreground leading-tight line-clamp-2">
                {post.title}
              </h4>
              {post.published_at && (
                <span className="text-[10px] text-muted-foreground font-sans">
                  {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      </motion.div>
    </section>
  );
}
