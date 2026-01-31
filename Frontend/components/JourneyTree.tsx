'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { getJourneyData } from '@/lib/api';
import SectionSplitter from './SectionSplitter';

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

  // Auto-scroll to bottom on load
  useEffect(() => {
    if (!loading && containerRef.current) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [loading]);

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

  // REVERSE the journey data first so newest is at top
  const reversedData = [...journeyData].reverse();

  // Split reversed data into sections of 4
  const sections = [];
  for (let i = 0; i < reversedData.length; i += 4) {
    sections.push(reversedData.slice(i, i + 4));
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 overflow-x-hidden relative"
    >
      {/* Falling Sakura Petals - Full Page */}
      <FallingSakuraPetals />

      {/* Tree Trunk Container */}
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        
        {/* Sakura Tree Top */}
        <TreeTop />

        {/* Center Trunk */}
        <div 
          className="absolute left-1/2 w-2 bg-gradient-to-b from-pink-300 via-purple-300 to-pink-200 transform -translate-x-1/2 rounded-full shadow-lg"
          style={{
            top: '400px',
            bottom: '360px'
          }}
        />

        {/* Tree Sections WITH SPLITTERS */}
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Add Section Splitter BEFORE each section (except first) */}
            <TreeSection
              branches={section}
              sectionIndex={sectionIndex}
            />

            {sectionIndex < sections.length - 1 && (
              <SectionSplitter 
                sectionIndex={sectionIndex}
                totalSections={sections.length} 
              />
            )}

          </div>
        ))}

        {/* Tree Root */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-32 pt-20"
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

// Falling Sakura Petals - Full Page Coverage
function FallingSakuraPetals() {
  const petalCount = 30;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {[...Array(petalCount)].map((_, i) => {
        const startX = Math.random() * 100;
        const duration = Math.random() * 15 + 15;
        const delay = Math.random() * 10;
        const size = Math.random() * 1.5 + 1;

        return (
          <motion.div
            key={i}
            className="absolute text-pink-400"
            style={{
              left: `${startX}%`,
              fontSize: `${size}rem`,
            }}
            initial={{ 
              y: -100,
              x: 0,
              rotate: 0,
              opacity: 0.7
            }}
            animate={{
              y: '100vh',
              x: [0, 30, -20, 40, 0],
              rotate: [0, 180, 360, 540],
              opacity: [0.7, 0.9, 0.7, 0.5, 0]
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: 'linear',
              x: {
                duration: duration / 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              },
              rotate: {
                duration: duration,
                repeat: Infinity,
                ease: 'linear'
              }
            }}
          >
            🌸
          </motion.div>
        );
      })}
    </div>
  );
}

// Sakura Tree Top Component
function TreeTop() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, type: 'spring' }}
      className="relative z-20 flex flex-col items-center justify-center py-20 mb-20"
    >
      {/* Placeholder for custom tree top image */}
      <div className="relative">
        {/* TODO: Replace with custom tree top image */}
        {/* <img src="/images/tree-top.png" alt="Tree Top" className="w-full max-w-md" /> */}
        
        {/* Temporary placeholder */}
        <div className="text-9xl mb-8 filter drop-shadow-2xl">
          🌸
        </div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 1 }}
        className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-8"
      >
        To Our Future Endeavors
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 1 }}
        className="text-lg md:text-2xl text-center text-purple-600 mt-4 font-light italic"
      >
        A Journey of Love, Growing Together
      </motion.p>
    </motion.div>
  );
}

// Tree Section Component (4 branches)
function TreeSection({ branches, sectionIndex }: { branches: JourneyStep[], sectionIndex: number }) {
  return (
    <div className="relative mb-40">

      {/* Branches */}
      <div className="space-y-24 pt-12">
        {branches.map((branch, index) => (
          <TreeBranch
            key={branch.id}
            branch={branch}
            side={index % 2 === 0 ? 'left' : 'right'}
            delay={index * 0.1}
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
      initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay }}
      className={`relative flex ${isLeft ? 'justify-start' : 'justify-end'} z-20`}
    >
      {/* Branch Line - Placeholder for custom branch graphic */}
      <div
        className={`absolute top-1/2 ${isLeft ? 'left-1/2' : 'right-1/2'} w-20 md:w-32 h-1 bg-gradient-to-${isLeft ? 'l' : 'r'} from-pink-300 to-transparent`}
        style={{ transform: 'translateY(-50%)' }}
      />
      {/* TODO: Replace with custom branch image */}
      {/* <img 
        src="/images/branch.png" 
        alt="Branch"
        className={`absolute top-1/2 ${isLeft ? 'left-1/2' : 'right-1/2'} transform -translate-y-1/2 ${isLeft ? '' : 'scale-x-[-1]'}`}
      /> */}

      {/* Branch Content */}
      <motion.div
        whileHover={{ scale: 1.05, y: -10 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`relative w-full ${isLeft ? 'md:w-5/12 md:pr-40' : 'md:w-5/12 md:pl-40'} px-6 md:px-0`}
      >
        <div 
          className="rounded-3xl overflow-hidden shadow-2xl bg-white/90 backdrop-blur-sm p-4 md:p-6"
          style={{ borderColor: branch.theme.accent, borderWidth: 3 }}
        >
          {/* Image Container - 3:4 Aspect Ratio */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-4">
            <div className="aspect-[3/4] w-full max-w-xs mx-auto md:max-w-none">
              <img
                src={branch.image_url}
                alt={branch.phase}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm font-medium drop-shadow-lg">
                {branch.date}
              </p>
            </div>
          </div>

          {/* Text Content - Keep original colors */}
          <div className="space-y-3">
            <h3 
              className="text-xl md:text-2xl font-bold"
              style={{ color: branch.theme.accent }}
            >
              {branch.phase}
            </h3>
            <p 
              className="text-sm md:text-base leading-relaxed"
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
        </div>
      </motion.div>
    </motion.div>
  );
}