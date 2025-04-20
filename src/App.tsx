
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";
import LoginPage from "./pages/LoginPage";
import ModerationPage from "./pages/ModerationPage";
import ProfilePage from "./pages/ProfilePage";
import SurveyPage from "./pages/SurveyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/survey" element={<ProtectedRoute><SurveyPage /></ProtectedRoute>} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <RequireSurvey>
                    <HomePage />
                  </RequireSurvey>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/room/:roomId" 
              element={
                <ProtectedRoute>
                  <RequireSurvey>
                    <RoomPage />
                  </RequireSurvey>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/moderation" 
              element={
                <ProtectedRoute requireModerator>
                  <RequireSurvey>
                    <ModerationPage />
                  </RequireSurvey>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <RequireSurvey>
                    <ProfilePage />
                  </RequireSurvey>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
