import { CSSProperties } from 'react';

export const Mascot = ({ className, style }: { className?: string, style?: CSSProperties }) => {
  return (
    <img 
      src="/lci-mascot.png"
      alt="Маскот LCI" 
      className={`object-contain mix-blend-multiply ${className || ''}`} 
      style={style}
      referrerPolicy="no-referrer"
      fetchPriority="high"
      loading="eager"
    />
  );
};
