import autoprefixer from 'autoprefixer'

let tailwindcssPlugin;
try {
  const { default: tailwindcss } = await import('@tailwindcss/postcss');
  tailwindcssPlugin = tailwindcss;
} catch (error) {
  console.warn('Failed to load @tailwindcss/postcss, using basic tailwindcss');
  const { default: tailwindcss } = await import('tailwindcss');
  tailwindcssPlugin = tailwindcss;
}

export default {
  plugins: [
    tailwindcssPlugin,
    autoprefixer,
  ],
}
