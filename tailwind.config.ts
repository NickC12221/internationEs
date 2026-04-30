// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#c9a96e',
          light: '#e8d5b0',
          dark: '#9d7a47',
        },
      },
      aspectRatio: {
        portrait: '3 / 4',
      },
    },
  },
  plugins: [],
}

export default config
