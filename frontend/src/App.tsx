import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Creators from "./pages/Creators";
import CreatorChannel from "./pages/CreatorChannel";
import Favorites from "./pages/Favorites";
import VideoAnalyzer from "./pages/VideoAnalyzer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Wrapper Component
const ProtectedLayoutRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#030303]">
      <AppSidebar />
      <div className="flex-1 flex flex-col w-full lg:ml-56 overflow-hidden">
        <main className="flex-1 p-6 lg:p-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// App Routes Component
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Home Route - with sidebar when authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedLayoutRoute>
              <Index />
            </ProtectedLayoutRoute>
          ) : (
            <Index />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes - wrapped with ProtectedLayoutRoute */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayoutRoute>
            <Dashboard />
          </ProtectedLayoutRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedLayoutRoute>
            <Categories />
          </ProtectedLayoutRoute>
        }
      />
      <Route
        path="/creators"
        element={
          <ProtectedLayoutRoute>
            <Creators />
          </ProtectedLayoutRoute>
        }
      />
      <Route
        path="/creators/:channelId"
        element={
          <ProtectedLayoutRoute>
            <CreatorChannel />
          </ProtectedLayoutRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedLayoutRoute>
            <Favorites />
          </ProtectedLayoutRoute>
        }
      />
      <Route
        path="/video-analyzer"
        element={
          <ProtectedLayoutRoute>
            <VideoAnalyzer />
          </ProtectedLayoutRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
