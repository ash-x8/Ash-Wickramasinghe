'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiGithub, FiLinkedin, FiMail, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com/ash-x8', label: 'GitHub' },
    { icon: FiLinkedin, href: 'https://linkedin.com/in/ash-wickramasinghe', label: 'LinkedIn' },
    { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FiMail, href: 'mailto:contact@example.com', label: 'Email' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="border-t border-white border-opacity-10 bg-gradient-to-t from-brand-slate to-brand-dark py-12 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-2">ASH</h3>
            <p className="text-gray-400 text-sm">Full-Stack Developer | Tech Enthusiast | Problem Solver</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-brand-cyan transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-brand-cyan transition-colors">About</Link></li>
              <li><Link href="/projects" className="hover:text-brand-cyan transition-colors">Projects</Link></li>
              <li><Link href="/cv" className="hover:text-brand-cyan transition-colors">Resume</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-brand-cyan hover:scale-110 transition-all duration-300"
                    aria-label={link.label}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white border-opacity-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; 2024 Ash Wickramasinghe. All rights reserved.</p>
            <p>Crafted with React, Next.js, and Framer Motion</p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
