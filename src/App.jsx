import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import GalleFortTour from './components/GalleFortTour';
import MapPreloader from './components/MapPreloader';

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // 4s matches the 3.5s preloader zoom + 0.5s settle
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <HelmetProvider>
      <AnimatePresence mode="wait">
        {isAppLoading ? (
          <MapPreloader key="loader" />
        ) : (
          <GalleFortTour key="main-site" />
        )}
      </AnimatePresence>
    </HelmetProvider>
  );
}

export default App;