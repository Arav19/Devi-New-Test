import Image from 'next/image';

export default function HeaderImage() {
  return (
    <div className="w-[53px] h-[43px] relative rounded-lg shadow-[0px_2px_4px_rgba(0,0,0,0.08)]">
      <Image
        src="/devi-logo.png"
        alt="Devi Logo"
        fill
        className="object-cover rounded-lg"
        priority
      />
    </div>
  );
}