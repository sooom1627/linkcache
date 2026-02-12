/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        main: "#1e293b",
        mainHover: "#334155",
        mainDark: "#0f172a",
        accent: "#ea580c", // orange-600
        accentMuted: "#f97316", // orange-500
        surface: "#ffffff",
        surfaceMuted: "#f1f5f9", // slate-100
        surfaceMutedActive: "#e2e8f0", // slate-200（secondary ボタン enabled）
        surfaceMutedActivePressed: "#cbd5e1", // slate-300（secondary ボタン pressed）
        border: "#e2e8f0", // slate-200（ボーダー・区切り）
        danger: "#ef4444",
        dangerDisabled: "#fca5a5", // red-300
        textMuted: "#64748b", // slate-500（補足・ドメイン等）
      },
    },
  },
  plugins: [],
};
