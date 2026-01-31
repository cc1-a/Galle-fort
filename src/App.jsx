import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import GalleFortTour from './components/GalleFortTour';
import MapPreloader from './components/MapPreloader';
import AdminPanel from './pages/AdminPanel';

function MainSite() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // 4s matches the 3.5s preloader zoom + 0.5s settle
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isAppLoading ? (
        <MapPreloader key="loader" />
      ) : (
        <GalleFortTour key="main-site" />
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;