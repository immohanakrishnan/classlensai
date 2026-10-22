import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#19332f',
        sage: '#9fbbb0',
        cream: '#f7f5ef',
        coral: '#e97d68',
        moss: '#547a6c'
      },
      boxShadow: { soft: '0 20px 60px rgba(27, 50, 45, .08)' }
    }
  },
  plugins: []
};

export default config;
