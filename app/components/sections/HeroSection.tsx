'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const roles = ['Full-Stack Developer', 'React Specialist', 'TypeScript Enthusiast', 'Tech Innovator'];

export default function HeroSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 md:px-8 pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <span className="px-4 py-2 rounded-full bg-brand-accent bg-opacity-10 border border-brand-accent border-opacity-30 text-brand-accent text-sm font-medium">
                👋 Welcome to my portfolio
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block text-white">Ash Wickramasinghe</span>
              <span className="block gradient-text">Full-Stack Developer</span>
            </h1>

            <div className="h-12 mb-6 flex items-center">
              <motion.span
                key={currentRole}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-xl text-brand-cyan font-medium"
              >
                {roles[currentRole]}
              </motion.span>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
              Crafting ultra-modern, high-performance web applications with cutting-edge technologies. Specialized in React, Next.js, TypeScript, and Firebase.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/projects"
                className="px-8 py-4 bg-gradient-to-r from-brand-accent to-brand-cyan text-white font-semibold rounded-lg hover:shadow-glow-blue transition-all duration-300 hover:scale-105"
              >
                View My Work
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border border-brand-cyan text-brand-cyan font-semibold rounded-lg hover:bg-brand-cyan hover:bg-opacity-10 transition-all duration-300 hover:scale-105"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>

          {/* Right - Profile Image with Skeleton */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              {/* Skeleton Loader */}
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-slate via-brand-slate to-transparent rounded-3xl animate-shimmer opacity-100" />
              )}

              {/* Glassmorphism Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-accent via-brand-cyan to-brand-purple opacity-20 rounded-3xl blur-2xl" />

              {/* Image */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white border-opacity-20 backdrop-blur-sm">
                <Image
                  src="/ash_cyber_portrait.png"
                  alt="Ash Wickramasinghe"
                  fill
                  className="object-cover"
                  priority
                  onLoadingComplete={() => setIsLoading(false)}
                />
              </div>

              {/* Glow Effect */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-4 bg-gradient-to-r from-brand-accent via-brand-cyan to-brand-purple rounded-3xl blur-3xl -z-10 opacity-30"
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
