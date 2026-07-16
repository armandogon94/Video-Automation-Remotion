// ESLint 9 flat config — the lint gate made real (GPT-5.6 P0.5, 2026-07-15).
//
// Uses Remotion's official flat-config package. Note: `@remotion/eslint-config`
// (the previous devDependency) is legacy-only ("ESLint <= 8", eslintrc format,
// no flat export); the 4.x flat config ships as the sibling package
// `@remotion/eslint-config-flat` (peer: eslint >=9), which bundles
// typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks, and
// @remotion/eslint-plugin recommended rules.
import {config} from '@remotion/eslint-config-flat';

export default [
	{
		// Global ignores. `npm run lint` targets src/ only, but keep these so a
		// bare `npx eslint .` never wanders into archived engines or artifacts.
		ignores: [
			'node_modules/**',
			'.claude/**',
			'hyperframes/**',
			'output/**',
			'scripts/**',
			'public/**',
			'references/**',
			'docs/**',
			'**/dist/**',
			'**/build/**',
		],
	},
	...config,
];
