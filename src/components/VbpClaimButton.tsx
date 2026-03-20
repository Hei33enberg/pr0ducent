import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

type Props = {
  toolName: string;
  /** Full claim URL from builder (VBP) or handoff URL stored on builder_results.chat_url */
  claimUrl: string | null | undefined;
  className?: string;
};

/**
 * Primary CTA to continue in the builder (claim / handoff). Wire referral tracking separately.
 */
export function VbpClaimButton({ toolName, claimUrl, className }: Props) {
  if (!claimUrl?.trim()) return null;

  return (
    <Button variant="default" size="sm" className={className} asChild>
      <a href={claimUrl} target="_blank" rel="noopener noreferrer">
        Continue in {toolName}
        <ArrowUpRight className="h-4 w-4 ml-1" />
      </a>
    </Button>
  );
}
