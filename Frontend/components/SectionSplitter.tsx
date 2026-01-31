'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface SectionSplitterProps {
  sectionIndex: number;
  totalSections: number; // ← Add this
}

export default function SectionSplitter({ sectionIndex, totalSections }: SectionSplitterProps) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Calculate chapter number from BOTTOM (reverse order)
  const chapterNumber = totalSections - sectionIndex;

  // Theme colors that loop every 4 sections (still uses sectionIndex for color rotation)
  const themes = [
    { 
      bg: 'linear-gradient(135deg, #FFF5F7 0%, #FFE5EB 100%)', // Light pink
      glow: '#ff9db5'
    },
    { 
      bg: 'linear-gradient(135deg, #FFE5EB 0%, #FFD1DC 100%)', // Soft rose
      glow: '#ff85a8'
    },
    { 
      bg: 'linear-gradient(135deg, #FFD1DC 0%, #FFB3C6 100%)', // Warm pink
      glow: '#ff6b9d'
    },
    { 
      bg: 'linear-gradient(135deg, #FFB3C6 0%, #FF9DB5 100%)', // Deep pink
      glow: '#ff4d8a'
    }
  ];

  const currentTheme = themes[sectionIndex % 4];

  // Generate sparkles on hover
  const generateSparkles = () => {
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 150
    }));
    setSparkles(newSparkles);
    
    setTimeout(() => setSparkles([]), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative my-32 flex justify-center items-center"
    >
      {/* Background Gradient Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-20 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: currentTheme.bg,
          padding: '3rem 6rem',
        }}
      >
        {/* Animated Border Glow */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-50"
          style={{
            boxShadow: `0 0 30px ${currentTheme.glow}, inset 0 0 20px ${currentTheme.glow}33`
          }}
        />

        {/* Heart Container with Interactions */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          onHoverStart={generateSparkles}
          className="relative cursor-pointer"
        >
          {/* Main Heart with Pulse Animation */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl md:text-9xl filter drop-shadow-2xl"
            style={{
              filter: `drop-shadow(0 0 20px ${currentTheme.glow})`
            }}
          >
            💞
          </motion.div>

          {/* Rotating Glow Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div 
              className="w-32 h-32 rounded-full opacity-30"
              style={{
                background: `radial-gradient(circle, ${currentTheme.glow}66 0%, transparent 70%)`
              }}
            />
          </motion.div>

          {/* Sparkles on Hover */}
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              initial={{ 
                x: 0, 
                y: 0, 
                opacity: 1, 
                scale: 0 
              }}
              animate={{ 
                x: sparkle.x, 
                y: sparkle.y, 
                opacity: 0, 
                scale: 1.5,
                rotate: 360
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 text-3xl"
              style={{ 
                filter: `drop-shadow(0 0 10px ${currentTheme.glow})`
              }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>

        {/* Decorative Lines */}
        <div className="flex items-center justify-center mt-6 gap-4">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 rounded-full"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${currentTheme.glow}, transparent)`
            }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="text-2xl"
          >
            ◆
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 rounded-full"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${currentTheme.glow}, transparent)`
            }}
          />
        </div>

        {/* Chapter Number - NOW COUNTS FROM BOTTOM! */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4 text-purple-600 font-semibold text-sm tracking-widest"
        >
          CHAPTER {chapterNumber}
        </motion.p>
      </motion.div>

      {/* Floating Particles Around Splitter */}
      <FloatingParticles color={currentTheme.glow} />
    </motion.div>
  );
}

// Floating Particles Component
function FloatingParticles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: color,
            left: `${20 + i * 15}%`,
            top: '50%',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}