'use client';

interface GoldenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline';
  children: React.ReactNode;
  width?: string;
  height?: string;
}

export default function GoldenButton({ 
  children, 
  variant = 'solid',
  className = '',
  width,
  height,
  ...props 
}: GoldenButtonProps) {
  const baseStyles = `relative rounded-full font-medium transition-all duration-300 
    ${width || 'px-8'} ${height || 'py-3'}`;
  
  const variants = {
    solid: `bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] text-purple-950
      before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r 
      before:from-transparent before:via-white/40 before:to-transparent
      before:bg-[length:300%_100%] before:animate-[flow_8s_ease-in-out_infinite]
      hover:shadow-[0_0_20px_rgba(253,185,49,0.5)]`,
    outline: `bg-transparent text-[#FDB931] border-2 border-[#FDB931]
      before:absolute before:inset-[-2px] before:rounded-full before:bg-gradient-to-r 
      before:from-transparent before:via-[#FDB931]/50 before:to-transparent
      before:bg-[length:300%_100%] before:animate-[flow_8s_ease-in-out_infinite]
      hover:text-[#FFD700] hover:border-[#FFD700]`
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} overflow-hidden ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}