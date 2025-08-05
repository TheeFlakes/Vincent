import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

let tailwindcssPlugin;
try {
	const tailwindcss = await import('@tailwindcss/vite');
	tailwindcssPlugin = tailwindcss.default();
	console.log('✓ @tailwindcss/vite loaded successfully');
} catch (error) {
	console.warn('⚠ Failed to load @tailwindcss/vite, falling back to PostCSS:', error instanceof Error ? error.message : String(error));
	tailwindcssPlugin = null;
}

export default defineConfig({
	plugins: [tailwindcssPlugin, sveltekit()].filter(Boolean),
	css: {
		postcss: tailwindcssPlugin ? undefined : './postcss.config.js'
	},
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
		include: ['pocketbase', 'paystack'],
		exclude: ['lightningcss']
	},
	ssr: {
		noExternal: ['lightningcss']
	}
});
