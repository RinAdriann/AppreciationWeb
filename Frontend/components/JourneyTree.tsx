'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getJourneyData } from '@/lib/api';

interface JourneyStep {
  id: number;
  phase: string;
  date: string;
  image_url: string;
  caption: string;
  theme: {
    background: string;
    text: string;
    accent: string;
  };
}

interface JourneyTreeProps {
  token: string;
}

export default function JourneyTree({ token }: JourneyTreeProps) {
  const [journeyData, setJourneyData] = useState<JourneyStep[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getJourneyData(token);
        setJourneyData(data);
      } catch (error) {
        console.error('Error fetching journey:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          🌸
        </motion.div>
      </div>
    );
  }

  // Split data into sections of 4
  const sections = [];
  for (let i = 0; i < journeyData.length; i += 4) {
    sections.push(journeyData.slice(i, i + 4));
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 overflow-x-hidden"
    >
      {/* Sakura Tree Top */}
      <TreeTop scrollProgress={scrollYProgress} />

      {/* Tree Trunk Container */}
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        {/* Center Trunk */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-pink-300 via-purple-300 to-pink-200 transform -translate-x-1/2 rounded-full shadow-lg" />

        {/* Tree Sections */}
        {sections.map((section, sectionIndex) => (
          <TreeSection
            key={sectionIndex}
            branches={section}
            sectionIndex={sectionIndex}
          />
        ))}

        {/* Tree Root */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mt-32 pb-20"
        >
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-2xl font-semibold text-purple-800">
            November 1st, 2025
          </p>
          <p className="text-lg text-purple-600 mt-2">
            Where Our Story Began
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Sakura Tree Top Component
function TreeTop({ scrollProgress }: { scrollProgress: any }) {
  const y = useTransform(scrollProgress, [0, 0.3], [0, 100]);
  const opacity = useTransform(scrollProgress, [0, 0.2], [1, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      className="sticky top-0 z-10 flex flex-col items-center justify-center min-h-screen pointer-events-none"
    >
      {/* Sakura Petals Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0,
              opacity: 0.8
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: 360,
              opacity: 0
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear'
            }}
          >
            🌸
          </motion.div>
        ))}
      </div>

      {/* Main Tree Crown */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, type: 'spring' }}
        className="relative z-10"
      >
        <div className="text-9xl mb-8 filter drop-shadow-2xl">
          🌸
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-8"
        >
          To Our Future Endeavors
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-xl md:text-2xl text-center text-purple-600 mt-4 font-light italic"
        >
          A Journey of Love, Growing Together
        </motion.p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity }}
        className="absolute bottom-20 text-purple-400"
      >
        <div className="text-sm mb-2 text-center">Scroll to explore our journey</div>
        <div className="text-3xl text-center">↓</div>
      </motion.div>
    </motion.div>
  );
}

// Tree Section Component (4 branches)
function TreeSection({ branches, sectionIndex }: { branches: JourneyStep[], sectionIndex: number }) {
  return (
    <div className="relative mb-40">
      {/* Section Marker on Trunk */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className="absolute left-1/2 top-0 w-6 h-6 bg-pink-400 rounded-full transform -translate-x-1/2 shadow-lg z-10 border-4 border-white"
      />

      {/* Branches */}
      <div className="space-y-24 pt-12">
        {branches.map((branch, index) => (
          <TreeBranch
            key={branch.id}
            branch={branch}
            side={index % 2 === 0 ? 'left' : 'right'}
            delay={index * 0.2}
          />
        ))}
      </div>
    </div>
  );
}

// Individual Branch Component
function TreeBranch({ 
  branch, 
  side, 
  delay 
}: { 
  branch: JourneyStep, 
  side: 'left' | 'right',
  delay: number 
}) {
  const isLeft = side === 'left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className={`relative w-full ${isLeft ? 'md:w-5/12' : 'md:w-5/12'} ${isLeft ? 'md:ml-auto md:pr-20' : 'md:pl-20'} px-6 md:px-0`}
    >
      {/* Branch Line */}
      <div
        className={`absolute top-1/2 ${isLeft ? 'right-full mr-4' : 'left-full ml-4'} w-16 md:w-24 h-1 bg-gradient-to-${isLeft ? 'r' : 'l'} from-pink-300 to-transparent`}
        style={{ transform: 'translateY(-50%)' }}
      />

      {/* Card Container */}
      <motion.div
        whileHover={{ scale: 1.05, y: -10 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="rounded-3xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm p-6"
        style={{ borderColor: branch.theme.accent, borderWidth: 3 }}
      >
        {/* Image Container - 3:4 Aspect Ratio */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-4">
          <div className="aspect-[3/4] w-full">
            <img
              src={branch.image_url}
              alt={branch.phase}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Image Overlay */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-white text-sm font-medium">{branch.date}</p>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h3 
            className="text-2xl font-bold"
            style={{ color: branch.theme.accent }}
          >
            {branch.phase}
          </h3>
          <p 
            className="text-base leading-relaxed"
            style={{ color: branch.theme.text }}
          >
            {branch.caption}
          </p>
        </div>

        {/* Decorative Element */}
        <div className="mt-4 flex justify-center">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-2xl opacity-30"
          >
            🌸
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}