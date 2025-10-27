import { defineConfig } from '@vscode/test-cli';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	files: 'out/test/**/*.test.js',
	workspaceFolder: path.resolve(__dirname),
	launchArgs: [
		`--user-data-dir=${path.join(__dirname, '.vscode-test', 'user-data')}`,
		'--disable-extensions',
		'--skip-release-notes',
		'--skip-welcome'
	],
	mocha: {
		ui: 'tdd',
		timeout: 20000
	}
});
