import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StripeCheckoutModal } from "@/components/subscription/StripeCheckoutModal";
import { XCircle, CreditCard } from "lucide-react";

/**
 * Shows a sticky banner if a Stripe `client_secret` is present in the URL
 * allowing the user to quickly resume their payment flow.
 */
export function ResumePaymentBanner() {
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  
  // Detect client_secret in URL only once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cs = params.get("client_secret");
    if (cs) setClientSecret(cs);
  }, []);

  const visible = useMemo(() => Boolean(clientSecret), [clientSecret]);

  const handleDismiss = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("client_secret");
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);
    setClientSecret(null);
  };

  if (!visible) return null;

  return (
    <div className="sticky top-0 z-50 w-full bg-clutsh-navy/80 backdrop-blur border-b border-clutsh-slate/50">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-clutsh-light text-sm">
          <CreditCard className="h-4 w-4 text-clutsh-light" />
          <span>Unfinished checkout detected. You can resume your payment.</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
            Resume payment
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <StripeCheckoutModal 
        open={open} 
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) handleDismiss();
        }}
        initialClientSecret={clientSecret}
      />
    </div>
  );
}
