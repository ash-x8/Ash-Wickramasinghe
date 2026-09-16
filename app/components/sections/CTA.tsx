'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
  const email = 'hello@ash-wickramasinghe.site';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="mx-auto max-w-3xl text-center"
    >
      <div className="glass space-y-8 p-8 sm:p-12 md:p-16">
        <h2 className="gradient-text text-4xl font-bold md:text-5xl">Let&apos;s Build Something Amazing</h2>
        <p className="text-lg leading-relaxed text-gray-300">
          I create thoughtful design systems, content workflows, and digital experiences for modern brands and portfolios.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/contact" className="rounded-lg bg-gradient-to-r from-brand-accent to-brand-cyan px-8 py-4 text-center font-semibold text-white transition-all hover:scale-105 hover:shadow-glow-blue">
            Start a Conversation
          </Link>
          <a href={`mailto:${email}`} className="rounded-lg border border-brand-cyan px-8 py-4 text-center font-semibold text-brand-cyan transition-all hover:bg-brand-cyan/10 hover:scale-105">
            Send an Email
          </a>
        </div>
      </div>
    </motion.div>
  );
}
