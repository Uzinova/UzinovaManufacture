import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminPanel from './pages/AdminPanel.tsx';
import ProductPage from './pages/ProductPage.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import NewsPage from './pages/NewsPage.tsx';
import NewsDetail from './pages/NewsDetail.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import CartPage from './pages/CartPage.tsx';
import OfferSuccessPage from './pages/OfferSuccessPage.tsx';
import PrintingServicePage from './pages/PrintingServicePage.tsx';
import Kompozit from './pages/Kompozit.tsx';
import GroundStation from './pages/GroundStation.tsx';
import ContactPage from './pages/ContactPage.tsx';
import FlightControlPage from './pages/FlightControlPage.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import './index.css';

const AppWrapper = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    return !hasVisited;
  });

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        localStorage.setItem('hasVisited', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  return (
    <StrictMode>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  {showSplash ? (
                    <SplashScreen />
                  ) : (
                    <Routes>
                      <Route path="/" element={<App />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="/products" element={<ProductPage />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/news" element={<NewsPage />} />
                      <Route path="/news/:id" element={<NewsDetail />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/offer-success/:id" element={<OfferSuccessPage />} />
                      <Route path="/3d-model" element={<PrintingServicePage />} />
                      <Route path="/services/composite-manufacturing" element={<Kompozit />} />
                      <Route path="/ground-station" element={<GroundStation />} />
                      <Route path="/flight-control" element={<FlightControlPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                    </Routes>
                  )}
                </div>
              </Router>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<AppWrapper />);
