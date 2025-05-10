
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileProvider } from "@/contexts/ProfileContext";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import LoginPage from "./pages/LoginPage";
import ModerationPage from "./pages/ModerationPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import ExtensionAuthPage from "./pages/ExtensionAuthPage";
import ExtensionAuthCallback from "./pages/ExtensionAuthCallback";
import PrivacyPage from "./pages/PrivacyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ChangelogPage from "./pages/ChangelogPage";
import PricingPage from "./pages/PricingPage";

// Settings pages
import SettingsPage from "./pages/SettingsPage";
import LanguageSettingsPage from "./pages/LanguageSettingsPage";
import AppearanceSettingsPage from "./pages/AppearanceSettingsPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";

// Import AgoraProvider from new location
import { AgoraProvider } from "@/contexts/agora";

// For the Stripe integration
import { loadStripe } from '@stripe/stripe-js';

// Pre-load Stripe to improve performance
loadStripe("pk_test_51RMsRa2eLXgO7GQNGfjlsLK9FnzGNrhVuKPsWnjkswOf5YcPLsOLiuiCjo5CWBAddyynKjs8V480FhZhi7oWYUOP003goPRVuq");

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <ProfileProvider>
            <AgoraProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/room/:roomId" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
                <Route path="/moderation" element={<ProtectedRoute requireModerator><ModerationPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                
                {/* Settings routes */}
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/settings/languages" element={<ProtectedRoute><LanguageSettingsPage /></ProtectedRoute>} />
                <Route path="/settings/appearance" element={<ProtectedRoute><AppearanceSettingsPage /></ProtectedRoute>} />
                <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettingsPage /></ProtectedRoute>} />
                
                {/* Extension authentication routes */}
                <Route path="/auth" element={<ExtensionAuthPage />} />
                <Route path="/auth/callback" element={<ExtensionAuthCallback />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AgoraProvider>
          </ProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
