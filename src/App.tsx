import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { DateRangeProvider } from "./contexts/DateRangeContext";
import { EcomCreateProvider } from "./pages/ecom/EcomCreateContext";
import CampaignCreateEntry from "./pages/ecom/CampaignCreateEntry";
import FlowAiView from "./pages/ecom/FlowAiView";
import FlowHistoryView from "./pages/ecom/FlowHistoryView";
import FlowManualView from "./pages/ecom/FlowManualView";
import ReviewPushView from "./pages/ecom/ReviewPushView";
import HeldBatchView from "./pages/ecom/HeldBatchView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DateRangeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <EcomCreateProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/ecom/campaigns/create" element={<><Index /><CampaignCreateEntry /></>} />
              <Route path="/ecom/campaigns/create/ai" element={<FlowAiView />} />
              <Route path="/ecom/campaigns/create/copy" element={<FlowHistoryView />} />
              <Route path="/ecom/campaigns/create/manual" element={<FlowManualView />} />
              <Route path="/ecom/campaigns/create/review" element={<ReviewPushView />} />
              <Route path="/ecom/campaigns/create/held" element={<HeldBatchView />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EcomCreateProvider>
        </BrowserRouter>
      </DateRangeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
