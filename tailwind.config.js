/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "tag-color-red": '#FF0000',
        "tag-color-green": '#00FF00',
        "tag-color.blue": '#0000FF',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  variants: {
    extend: {
      textColor: ['responsive', 'hover', 'focus', 'peer-focus', 'peer-hover'],
    },
  },
  safelist: [
    'bg-red-50', 'bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50', 'bg-orange-50', 'bg-pink-50', 'bg-white',
    'ring-red-500/10', 'ring-blue-500/10', 'ring-green-500/10', 'ring-yellow-500/10', 'ring-purple-500/10', 'ring-orange-500/10', 'ring-pink-500/10',
    'bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-orange-100', 'bg-pink-100',
    {
      pattern: /(bg|border|ring|text)-(red|green|blue|yellow|pink|purple|orange|gray|lime)-[1-7](00|0)/,
      variants: ['hover', 'focus'],
    }
  ],
  plugins: [],
};
