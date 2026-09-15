import React from 'react';

interface CyberCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'green' | 'blue';
  highlightHeader?: string;
  onClick?: () => void;
}

export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  className = "",
  glowColor = 'cyan',
  highlightHeader,
  onClick
}) => {
  const glowBorderClass = 
    glowColor === 'green' 
      ? 'border-[#00ff66]/30 hover:border-[#00ff66] hover:shadow-[0_0_20px_rgba(0,255,102,0.2)]'
      : glowColor === 'blue'
      ? 'border-[#3b82f6]/30 hover:border-[#3b82f6] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
      : 'border-[#00f0ff]/30 hover:border-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]';

  return (
    <div 
      onClick={onClick}
      className={`relative bg-[#111827]/80 backdrop-blur-md border rounded-lg transition-all duration-300 group ${glowBorderClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Corner Bracket Accents */}
      <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[#00f0ff] pointer-events-none" />
      <div className="absolute -top-[1px] -right-[1px] w-2.5 h-2.5 border-t-2 border-r-2 border-[#00f0ff] pointer-events-none" />
      <div className="absolute -bottom-[1px] -left-[1px] w-2.5 h-2.5 border-b-2 border-l-2 border-[#00f0ff] pointer-events-none" />
      <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[#00f0ff] pointer-events-none" />

      {highlightHeader && (
        <div className="px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#0c121d]">
          <span className="text-[#00f0ff] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
            {highlightHeader}
          </span>
          <span className="text-[10px] text-slate-600">SECURE_BLOCK</span>
        </div>
      )}

      {children}
    </div>
  );
};
