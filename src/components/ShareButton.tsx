import { copy } from "@/lib/copy";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Link, Check, Globe, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShareButtonProps {
  experimentId: string;
  isPublic: boolean;
  isOwner: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
}

export function ShareButton({ experimentId, isPublic, isOwner, onVisibilityChange }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);
  const shareUrl = `${window.location.origin}/experiment/${experimentId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(copy["share.linkCopied"]);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePublic = async () => {
    setToggling(true);
    const { error } = await supabase
      .from("experiments")
      .update({ is_public: !isPublic })
      .eq("id", experimentId);

    if (error) {
      toast.error(copy["share.visibilityError"]);
    } else {
      onVisibilityChange?.(!isPublic);
      toast.success(!isPublic ? copy["share.nowPublic"] : copy["share.nowPrivate"]);
    }
    setToggling(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-4" align="end">
        {isOwner && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-sans">
              {isPublic ? (
                <Globe className="w-4 h-4 text-success" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-foreground">{isPublic ? copy["share.public"] : copy["share.private"]}</span>
            </div>
            <Switch checked={isPublic} onCheckedChange={handleTogglePublic} disabled={toggling} />
          </div>
        )}
        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 text-xs bg-muted rounded-md px-3 py-2 text-muted-foreground border border-border font-sans"
          />
          <Button size="sm" variant="secondary" onClick={handleCopy} className="shrink-0">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
          </Button>
        </div>
        {!isPublic && isOwner && (
          <p className="text-[11px] text-muted-foreground font-sans">
            {copy["share.enablePublic"]}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
