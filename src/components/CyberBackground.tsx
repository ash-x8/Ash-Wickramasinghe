import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const CyberBackground: React.FC = () => {
  const { isLight } = useTheme();

  if (isLight) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-300">
        {/* Clean Architectural Light Background */}
        <div className="absolute inset-0 bg-[#F8FAFC]" />

        {/* Subtle Architectural Grid */}
        <div 
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px'
          }}
        />

        {/* Warm Gold Aura - Top Left */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#C59B63] opacity-[0.06] rounded-full blur-[140px]" />

        {/* Technical Slate Accent - Center Right */}
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] bg-[#0284C7] opacity-[0.04] rounded-full blur-[160px]" />

        {/* Corner Markers */}
        <div className="hidden lg:block absolute top-20 left-8 w-4 h-4 border-t border-l border-slate-300 pointer-events-none" />
        <div className="hidden lg:block absolute top-20 right-8 w-4 h-4 border-t border-r border-slate-300 pointer-events-none" />
        <div className="hidden lg:block absolute bottom-8 left-8 w-4 h-4 border-b border-l border-slate-300 pointer-events-none" />
        <div className="hidden lg:block absolute bottom-8 right-8 w-4 h-4 border-b border-r border-slate-300 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-300">
      {/* Deep Obsidian Background */}
      <div className="absolute inset-0 bg-[#0A0D14]" />

      {/* Subtle Architectural Grid */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px'
        }}
      />

      {/* Restrained Gold Ambient Aura - Top Left */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#C59B63] opacity-[0.035] rounded-full blur-[140px]" />

      {/* Subtle Cyan Technical Accent - Center Right */}
      <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] bg-[#06B6D4] opacity-[0.025] rounded-full blur-[160px]" />

      {/* Deep Indigo/Slate Grounding Glow - Bottom Center */}
      <div className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] bg-[#1E293B] opacity-[0.06] rounded-full blur-[180px]" />

      {/* Subtle Radial Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10, 13, 20, 0.85) 100%)'
        }}
      />

      {/* Refined Technical Corner Markers */}
      <div className="hidden lg:block absolute top-20 left-8 w-4 h-4 border-t border-l border-white/15 pointer-events-none" />
      <div className="hidden lg:block absolute top-20 right-8 w-4 h-4 border-t border-r border-white/15 pointer-events-none" />
      <div className="hidden lg:block absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/15 pointer-events-none" />
      <div className="hidden lg:block absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/15 pointer-events-none" />
    </div>
  );
};

