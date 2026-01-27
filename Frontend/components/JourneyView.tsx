'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface JourneyViewProps {
  token: string;
}

export default function JourneyView({ token }: JourneyViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [journeyData, setJourneyData] = useState<JourneyStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(1);

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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          💕
        </motion.div>
      </div>
    );
  }

  const currentData = journeyData[currentStep];

  const handleNext = () => {
    if (currentStep < journeyData.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div
      className="min-h-screen transition-colors duration-700"
      style={{ backgroundColor: currentData.theme.background }}
    >
      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col"
          >
            <div className="relative h-[60vh] w-full overflow-hidden">
              <img
                src={currentData.image_url}
                alt={currentData.phase}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              
              <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
                {journeyData.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-1 flex-1 rounded-full transition-all"
                    style={{
                      backgroundColor: idx === currentStep ? currentData.theme.accent : 'rgba(255,255,255,0.3)'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h2
                    className="text-3xl font-bold mb-2"
                    style={{ color: currentData.theme.text }}
                  >
                    {currentData.phase}
                  </h2>
                  <p
                    className="text-sm font-medium"
                    style={{ color: currentData.theme.accent }}
                  >
                    {currentData.date}
                  </p>
                </div>
                <p
                  className="text-lg leading-relaxed"
                  style={{ color: currentData.theme.text }}
                >
                  {currentData.caption}
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex-1 py-3 rounded-xl font-semibold disabled:opacity-30 transition-all"
                  style={{
                    backgroundColor: currentData.theme.accent,
                    color: 'white'
                  }}
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep === journeyData.length - 1}
                  className="flex-1 py-3 rounded-xl font-semibold disabled:opacity-30 transition-all shadow-lg"
                  style={{
                    backgroundColor: currentData.theme.accent,
                    color: 'white'
                  }}
                >
                  {currentStep === journeyData.length - 1 ? '💕' : 'Next →'}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full flex"
          >
            <div className="w-1/2 relative overflow-hidden">
              <img
                src={currentData.image_url}
                alt={currentData.phase}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-1/2 flex flex-col justify-center p-16 space-y-8">
              <div className="flex gap-2">
                {journeyData.map((_, idx) => (
                  <div
                    key={idx}
                    className="h-2 flex-1 rounded-full transition-all cursor-pointer hover:scale-105"
                    onClick={() => {
                      setDirection(idx > currentStep ? 1 : -1);
                      setCurrentStep(idx);
                    }}
                    style={{
                      backgroundColor: idx === currentStep ? currentData.theme.accent : 'rgba(0,0,0,0.1)'
                    }}
                  />
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <h2
                    className="text-5xl font-bold mb-3"
                    style={{ color: currentData.theme.text }}
                  >
                    {currentData.phase}
                  </h2>
                  <p
                    className="text-xl font-medium"
                    style={{ color: currentData.theme.accent }}
                  >
                    {currentData.date}
                  </p>
                </div>
                <p
                  className="text-2xl leading-relaxed"
                  style={{ color: currentData.theme.text }}
                >
                  {currentData.caption}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="px-8 py-4 rounded-xl font-semibold disabled:opacity-30 transition-all hover:scale-105"
                  style={{
                    backgroundColor: currentData.theme.accent,
                    color: 'white'
                  }}
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep === journeyData.length - 1}
                  className="flex-1 py-4 rounded-xl font-semibold disabled:opacity-30 transition-all shadow-lg hover:scale-105"
                  style={{
                    backgroundColor: currentData.theme.accent,
                    color: 'white'
                  }}
                >
                  {currentStep === journeyData.length - 1 ? 'Forever 💕' : 'Next →'}
                </button>
              </div>

              <p className="text-sm opacity-60" style={{ color: currentData.theme.text }}>
                Step {currentStep + 1} of {journeyData.length}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}