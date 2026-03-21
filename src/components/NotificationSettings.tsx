import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Subscription {
  id?: string;
  tool_ids: string[];
  notify_changelog: boolean;
  notify_pricing: boolean;
  notify_blog: boolean;
}

export function NotificationSettings() {
  const { tools } = useBuilderCatalog();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [sub, setSub] = useState<Subscription>({
    tool_ids: [],
    notify_changelog: true,
    notify_pricing: true,
    notify_blog: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const { data } = await supabase
        .from("notification_subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (data) setSub(data as Subscription);
      setLoading(false);
    }
    fetch();
  }, [user]);

  const save = async (updates: Partial<Subscription>) => {
    if (!user) return;
    const newSub = { ...sub, ...updates };
    setSub(newSub);

    const { error } = await supabase.from("notification_subscriptions").upsert(
      {
        user_id: user.id,
        tool_ids: newSub.tool_ids,
        notify_changelog: newSub.notify_changelog,
        notify_pricing: newSub.notify_pricing,
        notify_blog: newSub.notify_blog,
      },
      { onConflict: "user_id" }
    );

    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Preferences saved");
    }
  };

  const toggleTool = (toolId: string) => {
    const newIds = sub.tool_ids.includes(toolId)
      ? sub.tool_ids.filter((id) => id !== toolId)
      : [...sub.tool_ids, toolId];
    save({ tool_ids: newIds });
  };

  if (!user || loading) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
          {t("notifications.alertTypes")}
        </h3>
        <div className="space-y-3 mt-3">
          <label className="flex items-center justify-between">
            <span className="text-sm font-sans text-foreground">{t("notifications.changelog")}</span>
            <Switch
              checked={sub.notify_changelog}
              onCheckedChange={(v) => save({ notify_changelog: v })}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm font-sans text-foreground">{t("notifications.pricing")}</span>
            <Switch
              checked={sub.notify_pricing}
              onCheckedChange={(v) => save({ notify_pricing: v })}
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm font-sans text-foreground">{t("notifications.blogPosts")}</span>
            <Switch
              checked={sub.notify_blog}
              onCheckedChange={(v) => save({ notify_blog: v })}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
          {t("notifications.watchBuilders")}
        </h3>
        <p className="text-xs text-muted-foreground font-sans mb-3">
          {t("notifications.watchHint")}
        </p>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans transition-colors ${
                sub.tool_ids.includes(tool.id)
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
