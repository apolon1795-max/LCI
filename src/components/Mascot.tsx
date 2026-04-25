import { CSSProperties } from 'react';

export const Mascot = ({ className, style }: { className?: string, style?: CSSProperties }) => {
  return (
    <img 
      src="https://i.postimg.cc/ydy6JzXt/20260418-1432-Image-Generation-remix-01kpg2a8mjfbq908m08tsdg4hr.png" 
      alt="Маскот LCI" 
      className={`object-contain mix-blend-multiply ${className || ''}`} 
      style={style}
      referrerPolicy="no-referrer"
      fetchPriority="high"
      loading="eager"
    />
  );
};
