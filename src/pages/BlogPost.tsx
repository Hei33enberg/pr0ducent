import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageFrame } from "@/components/PageFrame";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface FullBlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  language: string;
  seo_title: string;
  seo_description: string;
  published_at: string;
  created_at: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<FullBlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      setPost(data);
      setLoading(false);
    }
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = post.seo_title || post.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", post.seo_description || post.excerpt || "");
    }
  }, [post]);

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner-narrow py-12 sm:py-16">
          <button
            onClick={() => navigate("/blog")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </button>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-[400px] w-full mt-8" />
            </div>
          ) : !post ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-sans text-lg">Post not found.</p>
            </div>
          ) : (
            <article>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-xs font-sans">{post.category}</Badge>
                {post.tags?.map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground font-sans">#{tag}</span>
                ))}
              </div>

              <h1
                className="font-serif font-bold tracking-[-0.02em] text-foreground mb-4 leading-tight"
                style={{ fontSize: "clamp(2rem, 3.5vw + 0.8rem, 3.5rem)" }}
              >
                {post.title}
              </h1>

              <time className="text-sm text-muted-foreground font-sans block mb-10">
                {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>

              <div
                className="prose prose-lg max-w-none font-sans
                  prose-headings:font-serif prose-headings:text-foreground
                  prose-p:text-muted-foreground prose-a:text-primary
                  prose-strong:text-foreground prose-code:text-primary
                  prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
              />

              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    headline: post.title,
                    description: post.seo_description || post.excerpt,
                    datePublished: post.published_at || post.created_at,
                    author: { "@type": "Organization", name: "pr0ducent", url: "https://pr0ducent.lovable.app" },
                    publisher: { "@type": "Organization", name: "pr0ducent" },
                  }),
                }}
              />
            </article>
          )}
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
}

function markdownToHtml(md: string): string {
  if (!md) return "";
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hulo])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}
