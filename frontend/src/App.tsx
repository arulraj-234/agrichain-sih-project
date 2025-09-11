import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainDashboard from "./components/main-dashboard";
import ProductTrackingPage from "./components/product-tracking-page";
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="farming-ui-theme">
      <Router>
        <Routes>
          {/* Main Dashboard Route */}
          <Route path="/" element={<MainDashboard />} />
          
          {/* Public Product Tracking Route - No authentication required */}
          <Route path="/track/:productId" element={<ProductTrackingPage />} />
          
          {/* Catch-all route - redirect to main dashboard */}
          <Route path="*" element={<MainDashboard />} />
        </Routes>
        
        {/* Toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}
