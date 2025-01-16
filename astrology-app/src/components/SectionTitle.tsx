'use client';
interface SectionTitleProps {
  children: React.ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="text-4xl font-bold text-center mb-12 relative">
      <span className="bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] bg-clip-text text-transparent 
        drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
        {children}
      </span>
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 
        bg-gradient-to-r from-transparent via-[#FDB931] to-transparent"></div>
    </h2>
  );
};
