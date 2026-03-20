import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { PageFrame } from "@/components/PageFrame";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/Footer";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  language: string;
  published_at: string;
  created_at: string;
}

export default function Blog() {
  const { t, locale: language } = useTranslation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, category, tags, language, published_at, created_at")
        .eq("status", "published")
        .eq("language", language)
        .order("published_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    }
    fetchPosts();
  }, [language]);

  const categories = ["all", "blog", "comparison", "social_twitter", "social_linkedin"];
  const filtered = activeCategory === "all" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
      <div className="px-4 sm:px-8 lg:px-12 py-12 sm:py-16 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
          {t("blog.title")}
        </h1>
        <p className="text-muted-foreground font-sans text-lg mb-8">
          {t("blog.subtitle")}
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-sans transition-colors ${
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat === "all" ? t("blog.all") : cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground font-sans text-center py-20">
            {t("blog.empty")}
          </p>
        ) : (
          <div className="space-y-8">
            {filtered.map((post) => (
              <article
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="group cursor-pointer border-b border-border/50 pb-8 last:border-0"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs font-sans">
                    {post.category}
                  </Badge>
                  {post.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground font-sans">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-serif text-2xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-muted-foreground font-sans line-clamp-2">
                  {post.excerpt}
                </p>
                <time className="text-xs text-muted-foreground font-sans mt-2 block">
                  {new Date(post.published_at || post.created_at).toLocaleDateString()}
                </time>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </PageFrame>
  );
}
