import React, { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import NGOChat from "./pages/NGOChat";
import NotFound from "./pages/NotFound";
import BackToHome from './components/BackToHome';
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wait from "./pages/Wait";
import AdminSetup from "./pages/AdminSetup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequests from "./pages/AdminRequests";
import AdminCreate from "./pages/AdminCreate";
import NGODashboard from "./pages/NGODashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import IndividualDashboard from "./pages/IndividualDashboard";
import LawyersDirectory from "./pages/LawyersDirectory";
import OCRPage from "./pages/OCRPage";
import DocumentGeneratorPage from "./pages/DocumentGeneratorPage";
import NGODirectoryPage from "./pages/NGODirectoryPage";
import CaseTrackerPage from "./pages/CaseTrackerPage";
import Translator from "./pages/Translator";
import Dictionary from "./pages/Dictionary";

const queryClient = new QueryClient();

const LazyThemeToggle = lazy(() => import("./components/ThemeToggle"));

const PageFallback = () => (
  <div className="min-h-[60vh] w-full flex items-center justify-center bg-background text-foreground">
    <div className="flex items-center gap-3">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="text-sm font-medium">Loading...</span>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent = () => {
  const { pathname } = useLocation();
  const hideGlobalAuth = pathname === '/home' || pathname.startsWith('/admin') || pathname === '/ngo' || pathname === '/lawyer' || pathname === '/individual';
  
  return (
    <>
      <ScrollToTop />
      <header className="w-full px-4 py-3 flex items-center justify-between bg-background border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="mr-0 sm:mr-2">
            <BackToHome />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md flex items-center justify-center bg-primary text-primary-foreground shadow-glow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <path d="M8 12h8M8 8h8M8 16h8" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-foreground m-0">Legislate AI</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="h-9 w-9" />}>
            <LazyThemeToggle />
          </Suspense>
        </div>
      </header>
      <Toaster />
      <Sonner />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<ProtectedRoute roles={["individual"]}><Home /></ProtectedRoute>} />
          <Route path="/ngo-chat/:id" element={<ProtectedRoute roles={["admin", "ngo", "lawyer", "individual"]}><NGOChat /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wait" element={<Wait />} />
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute roles={["admin"]}><AdminRequests /></ProtectedRoute>} />
          <Route path="/admin/create" element={<ProtectedRoute roles={["admin"]}><AdminCreate /></ProtectedRoute>} />
          <Route path="/ngo" element={<ProtectedRoute roles={["ngo"]}><NGODashboard /></ProtectedRoute>} />
          <Route path="/lawyer" element={<ProtectedRoute roles={["lawyer"]}><LawyerDashboard /></ProtectedRoute>} />
          <Route path="/individual" element={<ProtectedRoute roles={["individual"]}><IndividualDashboard /></ProtectedRoute>} />
          <Route path="/lawyers-directory" element={<ProtectedRoute roles={["individual"]}><LawyersDirectory /></ProtectedRoute>} />
          <Route path="/ocr" element={<ProtectedRoute roles={["individual"]}><OCRPage /></ProtectedRoute>} />
          <Route path="/document" element={<ProtectedRoute roles={["individual"]}><DocumentGeneratorPage /></ProtectedRoute>} />
          <Route path="/ngo-directory" element={<ProtectedRoute roles={["individual"]}><NGODirectoryPage /></ProtectedRoute>} />
          <Route path="/case-tracker" element={<ProtectedRoute roles={["individual"]}><CaseTrackerPage /></ProtectedRoute>} />
          <Route path="/translator" element={<ProtectedRoute roles={["individual"]}><Translator /></ProtectedRoute>} />
          <Route path="/dictionary" element={<ProtectedRoute roles={["individual"]}><Dictionary /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
