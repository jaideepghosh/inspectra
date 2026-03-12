import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InspectionProvider } from "@/lib/inspection-context";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Shield } from "lucide-react";
import { Button } from "./components/ui/button.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Show when="signed-in">
        <header className="flex justify-end p-4">
          <UserButton />
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
      </Show>
      <Show when="signed-out">
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground text-center mb-10">
            Inspectra
          </h1>

          <div className="w-full max-w-xs space-y-3">
            <Button
              className="w-full h-14 text-base font-display font-semibold"
              size="lg"
            >
              <SignInButton />
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 text-base font-display border-primary/30 text-primary hover:bg-primary/10 hover:text-white"
              size="lg"
            >
              <SignUpButton />
            </Button>
          </div>
        </div>
      </Show>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
