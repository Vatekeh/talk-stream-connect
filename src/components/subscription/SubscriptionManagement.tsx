
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { CreditCard, Calendar, CheckCircle, Shield } from "lucide-react";

export const SubscriptionManagement = () => {
  const { 
    isSubscribed, 
    isTrialing, 
    subscriptionStatus, 
    trialEnd, 
    currentPeriodEnd,
    createSubscription,
    manageSubscription
  } = useAuth();
  
  // Format dates for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="bg-clutsh-steel border-clutsh-slate">
      <CardHeader>
        <CardTitle className="text-clutsh-light flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Subscription Management
        </CardTitle>
        <CardDescription className="text-clutsh-muted">
          Manage your Clutsh subscription and billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Status */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-clutsh-light">Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-clutsh-navy border border-clutsh-slate">
              <div className={`rounded-full p-2 ${isSubscribed || isTrialing ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-clutsh-light">Subscription Status</div>
                <div className="text-xs text-clutsh-muted capitalize mt-1">
                  {subscriptionStatus || 'None'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-clutsh-navy border border-clutsh-slate">
              <div className="rounded-full p-2 bg-amber-500/20 text-amber-500">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-clutsh-light">
                  {isTrialing ? 'Trial Ends' : 'Next Billing Date'}
                </div>
                <div className="text-xs text-clutsh-muted mt-1">
                  {isTrialing 
                    ? formatDate(trialEnd)
                    : formatDate(currentPeriodEnd)
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subscription Details */}
        {(isSubscribed || isTrialing) && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-clutsh-light">Plan Details</h3>
            <div className="p-4 rounded-lg bg-clutsh-navy border border-clutsh-slate">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-clutsh-light">
                    Premium Plan
                  </div>
                  <div className="text-xs text-clutsh-muted mt-1">
                    $19.99 per month
                  </div>
                </div>
                {isTrialing && (
                  <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded">
                    Free Trial
                  </span>
                )}
                {isSubscribed && !isTrialing && (
                  <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="pt-4">
          {!isSubscribed && !isTrialing ? (
            <Button 
              className="w-full bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel"
              onClick={createSubscription}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Start 30-Day Free Trial
            </Button>
          ) : (
            <Button 
              className="w-full bg-clutsh-slate text-clutsh-light hover:bg-clutsh-steel"
              onClick={manageSubscription}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
