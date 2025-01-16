'use client';

import { useState } from 'react';
import GoldenButton from '@/components/GoldenButton';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const mailtoLink = `mailto:Admin@askdevi.com?subject=Contact from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(formData.message)}`;
    window.location.href = mailtoLink;
  };

  return (
    <section className="py-24 px-8 relative bg-purple-900/20">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">
            Contact Us
          </span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-yellow-100 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-yellow-500/20 text-white 
                focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-yellow-100 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-yellow-500/20 text-white 
                focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-yellow-100 mb-2">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-yellow-500/20 text-white 
                focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          <div className="text-center">
            <GoldenButton variant="solid" type="submit">
              Send Message
            </GoldenButton>
          </div>
        </form>
      </div>
    </section>
  );
}