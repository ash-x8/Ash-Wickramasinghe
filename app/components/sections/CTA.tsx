'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto text-center"
    >
      <div className="glass p-12 md:p-16 space-y-8">
        <h2 className="text-4xl md:text-5xl font-bold gradient-text">Let's Build Something Amazing</h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          I'm always interested in hearing about new projects and opportunities. Whether you have a question or just want to say hello, feel free to reach out!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="px-8 py-4 bg-gradient-to-r from-brand-accent to-brand-cyan text-white font-semibold rounded-lg hover:shadow-glow-blue transition-all duration-300 hover:scale-105 text-center"
          >
            Start a Conversation
          </Link>
          <a
            href="mailto:contact@example.com"
            className="px-8 py-4 border border-brand-cyan text-brand-cyan font-semibold rounded-lg hover:bg-brand-cyan hover:bg-opacity-10 transition-all duration-300 hover:scale-105 text-center"
          >
            Send an Email
          </a>
        </div>
      </div>
    </motion.div>
  );
}
