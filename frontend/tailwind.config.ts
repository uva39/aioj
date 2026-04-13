import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 티어 색상 (solved.ac 스타일)
        tier: {
          iron: "#818181",
          bronze: "#ad5600",
          silver: "#435f7a",
          gold: "#ec9a00",
          platinum: "#27e2a4",
          diamond: "#00b4fc",
          ruby: "#ff0062",
        },
        // 채점 결과 색상
        verdict: {
          ac: "#00c853",
          wa: "#ef5350",
          tle: "#ffa726",
          ie: "#ab47bc",
          re: "#ef9a9a",
          mle: "#ffa726",
          pending: "#78909c",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Menlo", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
