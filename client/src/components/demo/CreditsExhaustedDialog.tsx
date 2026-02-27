import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreditsExhaustedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreditsExhaustedDialog({ open, onOpenChange }: CreditsExhaustedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0c0c12] border-white/[0.08] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-display text-lg">Demo Credits Exhausted</DialogTitle>
          <DialogDescription className="text-[#888] text-[13px] leading-relaxed">
            You've used all 10 demo credits for today. Credits reset automatically every 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-[12px] text-[#666]">
            Want unlimited access to all 11 agents with real scanning capabilities?
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="/pricing"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00d4ff] text-[#0a0a0f] text-[13px] font-semibold hover:bg-[#00d4ff]/90 transition-colors"
            >
              View Pricing Plans
            </a>
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg border border-white/[0.08] text-[13px] text-[#888] hover:text-white hover:border-white/[0.15] transition-colors"
            >
              I'll wait for tomorrow
            </button>
          </div>
          <p className="text-[10px] text-[#444] text-center">
            Self-hosted community edition is always free and unlimited.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
