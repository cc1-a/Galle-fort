import React from 'react';
import { motion } from 'framer-motion';

const TARGET_X = 71.8; 
const TARGET_Y = 53.0 
const FINAL_ZOOM = 5; // Reduced further to ensure zero pixelation

const MapPreloader = () => {
  const finalX = (50 - TARGET_X) * FINAL_ZOOM;
  const finalY = (50 - TARGET_Y) * FINAL_ZOOM;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[500] bg-[#020617] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#0891B208_0%,_transparent_70%)]" />

      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          initial={{ scale: 1, x: "0%", y: "0%" }}
          animate={{ scale: FINAL_ZOOM, x: `${finalX}%`, y: `${finalY}%` }}
          transition={{ duration: 3.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full h-full pointer-events-none flex items-center justify-center"
        >
          <img 
            src="/world.svg" 
            alt="Global Navigation" 
            className="w-full h-auto min-w-full opacity-40"
            style={{ 
              filter: 'invert(1) sepia(1) saturate(3) hue-rotate(160deg) brightness(0.8)',
              imageRendering: 'smooth' 
            }}
          />

          <div className="absolute flex items-center justify-center" style={{ left: `${TARGET_X}%`, top: `${TARGET_Y}%` }}>
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.5 }}
                className="w-[8px] h-[8px] bg-[#0891B2] rounded-full shadow-[0_0_20px_#0891B2] z-10"
            />
            {[1, 2].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute border border-[#0891B2]/40 rounded-full"
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{ width: [0, 150], height: [0, 150], opacity: [0.6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 2.2 + (ring * 0.5), ease: "easeOut" }}
                />
            ))}
          </div>
        </motion.div>

        <div className="absolute inset-0 flex flex-col items-center justify-between py-20 pointer-events-none z-50">
          <div className="flex flex-col items-center">
             <div className="w-[1px] h-12 bg-[#0891B2]/40" />
             <p className="text-[#0891B2] font-mono text-[8px] tracking-[1.2em] mt-4 ml-[1.2em]">GPS STABLE</p>
          </div>
          <div className="text-center px-6">
            <h2 className="text-white text-3xl font-[950] tracking-[0.4em] uppercase mb-4">GALLE <span className="text-[#0891B2]">WALK</span></h2>
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#0891B2] to-transparent mx-auto mb-6" />
            <div className="flex items-center justify-center gap-6 text-[#0891B2] font-mono text-[9px] tracking-widest opacity-60">
               <span>6.0535° N</span><span className="w-1 h-1 bg-white/20 rounded-full" /><span>80.2210° E</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MapPreloader;