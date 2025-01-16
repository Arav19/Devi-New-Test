import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'twinkle': 'twinkle 3s infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: {
          light: '#FFD700',
          DEFAULT: '#FDB931',
          dark: '#B8860B',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
  variants: {
    scrollbar: ['rounded']
  }
} satisfies Config;

export default config;
