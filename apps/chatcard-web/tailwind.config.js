/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cc-bg': '#f6f7fb',
        'cc-surface': '#fdfdfd',
        'cc-surface-soft': '#ffffff',
        'cc-border': '#d7e0ef',
        'cc-ink': '#0f172a',
        'cc-card-base': '#ffffff',
        'cc-violet': '#6366f1',
        'cc-pink': '#ec4899',
        'cc-cyan': '#22d3ee',
        'cc-text': '#0f172a',
        'cc-text-muted': '#475569',
      },
    },
  },
  plugins: [],
}
