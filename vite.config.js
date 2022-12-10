import path from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';

export default {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'~': path.resolve('./src')
		}
	}
};
