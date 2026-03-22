import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { CalendarDays, ArrowRight, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const { t } = useTranslation();
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
    <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif font-bold tracking-[-0.02em] leading-[1.1] text-foreground inline-flex items-center gap-2" style={{ fontSize: "clamp(2.4rem, 5vw + 0.5rem, 5rem)" }}>
          <Newspaper className="w-6 h-6" />
          {t("blog.title")}
        </h2>
        <button
          onClick={() => navigate("/blog")}
          className="text-xs font-sans font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

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
    </section>
  );
}
