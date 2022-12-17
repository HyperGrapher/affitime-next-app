/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1070px",
      xl: "1280px",
      "2xl": "1536px",
    },
    // minWidth: {
    //   'vw': '100vw',
    //   '1/3': '33%',
    //   '1/2': '50%',
    //   'full': '100%',
    //   'fit': 'fit-content',
    //   'max': 'max-content',
    //   'min': 'min-content',
    //   '0': '0px',
    // }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
};
