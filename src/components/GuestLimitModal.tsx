import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";

interface GuestLimitModalProps {
  open: boolean;
  onClose: () => void;
}

const GUEST_LIMIT = 3;

export function getGuestExperimentCount(): number {
  try {
    return parseInt(localStorage.getItem("promptlab_guest_count") || "0", 10);
  } catch {
    return 0;
  }
}

export function incrementGuestCount() {
  const count = getGuestExperimentCount() + 1;
  localStorage.setItem("promptlab_guest_count", String(count));
  return count;
}

export function isGuestLimitReached(): boolean {
  return getGuestExperimentCount() >= GUEST_LIMIT;
}

export function GuestLimitModal({ open, onClose }: GuestLimitModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Limit osiągnięty
          </DialogTitle>
          <DialogDescription>
            Wykorzystano {GUEST_LIMIT} darmowe eksperymenty. Zarejestruj się, aby kontynuować bez ograniczeń!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Button className="w-full" onClick={() => navigate("/auth")}>
            <Sparkles className="w-4 h-4 mr-2" />
            Załóż darmowe konto
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            Kontynuuj przeglądanie
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
