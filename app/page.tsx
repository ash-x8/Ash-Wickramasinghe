'use client';

import { motion } from 'framer-motion';
import HeroSection from './components/sections/HeroSection';
import FeaturedProjects from './components/sections/FeaturedProjects';
import TechStack from './components/sections/TechStack';
import CTA from './components/sections/CTA';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Projects */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Featured Work</h2>
            <p className="text-gray-300 text-lg">Showcasing my latest projects and innovations</p>
          </motion.div>
          <FeaturedProjects />
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 md:py-32 px-4 md:px-8 bg-gradient-to-b from-transparent via-brand-slate via-opacity-20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <TechStack />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <CTA />
      </section>
    </div>
  );
}
