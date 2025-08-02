import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		rollupOptions: {
			external: [],
			output: {
				manualChunks: undefined
			}
		},
		target: 'esnext',
		minify: 'esbuild'
	},
	optimizeDeps: {
		include: ['@stripe/stripe-js', 'pocketbase', 'stripe']
	}
});
