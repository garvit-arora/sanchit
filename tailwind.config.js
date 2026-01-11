/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0a0a0a", // Cyber Black
                surface: "#121212",
                primary: "#eab308", // Cyber Yellow
                secondary: "#d946ef", // Electric Purple
                accent: "#22c55e", // Neon Green
                muted: "#27272a",
                text: "#ffffff",
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            animation: {
                'bounce-short': 'bounce 0.8s infinite',
                'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
}
