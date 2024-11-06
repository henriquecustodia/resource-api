/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  daisyui: {
    themes: ["dark"],
  },
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
