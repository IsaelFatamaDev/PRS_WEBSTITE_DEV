/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts,css,scss,js,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Colores personalizados para el tema
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
  // Forzar la generación de todas las clases base
  safelist: [
    // Colores de fondo
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-800', 'bg-gray-900',
    'bg-blue-50', 'bg-blue-600', 'bg-blue-700', 'bg-green-50', 'bg-green-600',
    'bg-red-50', 'bg-red-600', 'bg-yellow-50', 'bg-yellow-600',
    // Colores de texto
    'text-white', 'text-gray-900', 'text-gray-700', 'text-gray-600', 'text-gray-500',
    'text-blue-600', 'text-green-600', 'text-red-600', 'text-yellow-600',
    // Tamaños
    'w-4', 'w-5', 'w-6', 'w-8', 'w-12', 'w-16', 'w-full',
    'h-4', 'h-5', 'h-6', 'h-8', 'h-12', 'h-16', 'h-full', 'h-screen',
    // Espaciado
    'p-2', 'p-3', 'p-4', 'p-6', 'px-3', 'px-4', 'px-6', 'py-2', 'py-3', 'py-4',
    'm-2', 'm-3', 'm-4', 'mx-auto', 'mb-2', 'mb-4', 'mb-6', 'mt-2', 'mt-4', 'mt-6',
    // Flexbox y Grid
    'flex', 'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    'items-center', 'justify-center', 'justify-between', 'space-x-2', 'space-x-3', 'space-y-4',
    // Bordes y sombras
    'border', 'border-gray-300', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-full',
    'shadow', 'shadow-lg',
    // Estados
    'hover:bg-blue-700', 'hover:bg-gray-50', 'focus:ring-2', 'focus:ring-blue-500',
    'disabled:opacity-50', 'transition-colors', 'duration-200'
  ]
}
