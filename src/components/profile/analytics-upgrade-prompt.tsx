
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AnalyticsUpgradePrompt() {
  const { createSubscription } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    // Navigate to pricing page to show plans first
    navigate("/pricing");
  };

  const handleTrial = () => {
    // Start subscription creation process
    createSubscription();
  };

  return (
    <Card className="w-full border-clutsh-slate bg-clutsh-navy overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-clutsh-purple/20 blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-clutsh-purple/10 blur-3xl -z-0"></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-clutsh-light">
          <Lock size={18} className="text-clutsh-purple" />
          Premium Analytics
        </CardTitle>
        <CardDescription className="text-clutsh-muted">
          Upgrade to Clutsh Pro to unlock your full analytics dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-clutsh-steel/10 border border-clutsh-slate/30 rounded-lg p-4">
              <h3 className="font-medium text-clutsh-light mb-1">Activity Patterns</h3>
              <p className="text-sm text-clutsh-muted">Understand when you're most vulnerable</p>
            </div>
            
            <div className="bg-clutsh-steel/10 border border-clutsh-slate/30 rounded-lg p-4">
              <h3 className="font-medium text-clutsh-light mb-1">Triggers & Insights</h3>
              <p className="text-sm text-clutsh-muted">Identify what leads to relapses</p>
            </div>
            
            <div className="bg-clutsh-steel/10 border border-clutsh-slate/30 rounded-lg p-4">
              <h3 className="font-medium text-clutsh-light mb-1">Progress Tracking</h3>
              <p className="text-sm text-clutsh-muted">Monitor improvements over time</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button 
              onClick={handleTrial} 
              className="bg-clutsh-purple hover:bg-clutsh-purple/80 text-white flex-1"
            >
              Start 30-Day Free Trial
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleUpgrade} 
              className="border-clutsh-slate text-clutsh-light hover:bg-clutsh-steel/20 flex-1"
            >
              View Plans <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
