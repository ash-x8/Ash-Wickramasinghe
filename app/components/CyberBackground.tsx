'use client';

import React from 'react';

export const CyberBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Deep Obsidian Gradient */}
      <div className="absolute inset-0 bg-[#0b0f19]" />

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30" />

      {/* Subtle Cyan Glow Orb - Top Left */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00f0ff] opacity-10 rounded-full blur-[120px]" />

      {/* Electric Blue Orb - Center Right */}
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[#3b82f6] opacity-10 rounded-full blur-[140px]" />

      {/* Matrix Green Orb - Bottom Center */}
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-[#00ff66] opacity-5 rounded-full blur-[160px]" />

      {/* Vignette border */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#0b0f19]/80" />

      {/* Scanline subtle effect */}
      <div className="scanline-effect absolute inset-0 opacity-40" />

      {/* Top Left HUD Corner Decoration */}
      <div className="hidden md:block absolute top-20 left-6 w-8 h-8 border-t-2 border-l-2 border-[#00f0ff]/30 pointer-events-none" />
      {/* Top Right HUD Corner Decoration */}
      <div className="hidden md:block absolute top-20 right-6 w-8 h-8 border-t-2 border-r-2 border-[#00f0ff]/30 pointer-events-none" />
      {/* Bottom Left HUD Corner Decoration */}
      <div className="hidden md:block absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#00f0ff]/30 pointer-events-none" />
      {/* Bottom Right HUD Corner Decoration */}
      <div className="hidden md:block absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#00f0ff]/30 pointer-events-none" />
    </div>
  );
};

export default CyberBackground;
