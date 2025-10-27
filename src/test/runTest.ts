import * as path from 'path';
import { runTests } from '@vscode/test-electron';
import * as fs from 'fs';
import * as os from 'os';

async function main() {
	try {
		// WORKAROUND for Windows usernames with spaces:
		// Create a junction point without spaces if on Windows and path has spaces
		let extensionDevelopmentPath = path.resolve(__dirname, '../../');
		const isWindows = process.platform === 'win32';
		const hasSpaces = extensionDevelopmentPath.includes(' ');
		
		if (isWindows && hasSpaces) {
			// Use a junction point at C:\ root to avoid space issues
			const junctionPath = 'C:\\vscode-test-lvaccess';
			console.log(`Using junction path: ${junctionPath} -> ${extensionDevelopmentPath}`);
			extensionDevelopmentPath = junctionPath;
		}

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(extensionDevelopmentPath, 'out', 'test', 'suite', 'index');

		// Use TEMP directory to avoid issues with spaces in username
		const tempDir = os.tmpdir();
		const testDataDir = path.join(tempDir, 'vscode-test-data-' + Date.now());
		const userDataDir = path.join(testDataDir, 'user-data');
		const extensionsDir = path.join(testDataDir, 'extensions');
		const crashpadDir = path.join(testDataDir, 'crashpad');
		const logsDir = path.join(testDataDir, 'logs');

		// Ensure directories exist
		[testDataDir, userDataDir, extensionsDir, crashpadDir, logsDir].forEach(dir => {
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}
		});

		console.log('Extension Development Path:', extensionDevelopmentPath);
		console.log('Extension Tests Path:', extensionTestsPath);
		console.log('Test Data Dir:', testDataDir);

		// Set environment variables to override default paths
		process.env.VSCODE_LOGS = logsDir;
		process.env.VSCODE_CRASH_DIR = crashpadDir;
		process.env.TMPDIR = tempDir;
		process.env.TMP = tempDir;
		process.env.TEMP = tempDir;

		// Download VS Code, unzip it and run the integration test
		const exitCode = await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [
				`--user-data-dir=${userDataDir}`,
				`--extensions-dir=${extensionsDir}`,
				`--crash-reporter-directory=${crashpadDir}`,
				'--disable-extensions',
				'--disable-workspace-trust',
				'--disable-crash-reporter',
				'--skip-release-notes',
				'--skip-welcome',
				'--no-sandbox'
			]
		});

		// Clean up temp directory
		try {
			fs.rmSync(testDataDir, { recursive: true, force: true });
		} catch (cleanupErr) {
			console.warn('Failed to clean up test data directory:', cleanupErr);
		}

		process.exit(exitCode);
	} catch (err) {
		console.error('Failed to run tests:', err);
		process.exit(1);
	}
}

main();
