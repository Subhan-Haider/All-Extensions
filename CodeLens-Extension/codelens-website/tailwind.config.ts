import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: '#4f46e5', // indigo-600
                    dark: '#4338ca',    // indigo-700
                    light: '#818cf8',   // indigo-400
                },
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
                accent: {
                    blue: '#3b82f6',   // blue-500
                    green: '#22c55e',  // green-500
                    orange: '#f97316', // orange-500
                    red: '#ef4444',    // red-500
                }
            },
            fontFamily: {
                headline: ['var(--font-outfit)', 'sans-serif'],
                body: ['var(--font-outfit)', 'sans-serif'],
                code: ['var(--font-jetbrains-mono)', 'monospace'],
                sans: ['var(--font-outfit)', 'sans-serif'],
            },
            animation: {
                'gradient': 'gradient 8s linear infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
} satisfies Config;
