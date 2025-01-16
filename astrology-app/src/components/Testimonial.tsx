'use client';

import Rating from './Rating';
import Image from 'next/image';

interface TestimonialProps {
  name: string;
  age: number;
  city: string;
  text: string;
  rating: number;
  image: string;
}

export default function Testimonial({ name, age, city, text, rating, image }: TestimonialProps) {
  return (
    <div className="flex flex-col p-6 mx-4 bg-gradient-to-br from-purple-900/40 to-purple-900/20 backdrop-blur-sm rounded-lg shadow-xl min-w-[280px] max-w-[300px] h-[350px] border border-yellow-500/20">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-full object-cover ring-2 ring-yellow-400/50"
          />
        </div>
        <div>
          <h3 className="font-semibold text-yellow-100">{name}</h3>
          <p className="text-sm text-purple-300">{age} years • {city}</p>
          <Rating value={rating} />
        </div>
      </div>
      <p className="text-purple-100 italic leading-relaxed overflow-y-auto scrollbar-thin scrollbar-track-purple-900/20 scrollbar-thumb-yellow-500/20 flex-1">{text}</p>
    </div>
  );
};
