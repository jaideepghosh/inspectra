import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InspectionProvider } from "@/lib/inspection-context";
import { useAuth0 } from "@auth0/auth0-react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Shield } from "lucide-react";
import { Button } from "./components/ui/button.tsx";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isAuthenticated ? (
          <>
            <header className="flex justify-end p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              >
                Log out
              </Button>
            </header>
            <InspectionProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </InspectionProvider>
          </>
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-slide-up">
            <h1 className="text-2xl font-display font-bold text-foreground text-center mb-10">
              <img src="/logo.png" width={200} />
            </h1>

            <div className="w-full max-w-xs space-y-3">
              <Button
                className="w-full h-14 text-base font-display font-semibold"
                size="lg"
                onClick={() => loginWithRedirect()}
              >
                SIGN IN
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-base font-display border-primary/30 text-primary hover:bg-primary/10 hover:text-white"
                size="lg"
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: { screen_hint: "signup" },
                  })
                }
              >
                SIGN UP
              </Button>
            </div>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
