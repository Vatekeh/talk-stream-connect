
import { AppHeader } from "@/components/layout/app-header";
import { Pricing } from "@/components/ui/pricing-cards";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-1">
        <Pricing />
      </main>
      
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Clutsh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
