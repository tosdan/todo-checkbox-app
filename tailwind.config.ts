import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,ts}',
    './projects/**/*.{html,ts}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
