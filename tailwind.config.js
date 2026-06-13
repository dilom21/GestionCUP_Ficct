import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                'pulse-mic': {
                    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
                    '50%': { transform: 'scale(1.15)', opacity: '0.8' },
                },
                wave: {
                    '0%': { transform: 'scaleY(0.5)' },
                    '50%': { transform: 'scaleY(1.5)' },
                    '100%': { transform: 'scaleY(0.5)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
            },
            animation: {
                'pulse-mic': 'pulse-mic 1.5s ease-in-out infinite',
                wave: 'wave 0.8s ease-in-out infinite',
                'slide-up': 'slide-up 0.3s ease-out',
            },
        },
    },

    plugins: [forms],
};
