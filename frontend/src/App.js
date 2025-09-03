import React from "react";
import Toaster from "./components/ui/Toaster.js"
import { Toaster as Sonner } from "./components/ui/sonner.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.js";
import NotFound from "./pages/NotFound.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
}

export default App;
