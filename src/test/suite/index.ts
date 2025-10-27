import * as path from 'path';
import Mocha from 'mocha';
import * as fs from 'fs';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
	const files = fs.readdirSync(dirPath);

	files.forEach((file) => {
		if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
			arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
		} else if (file.endsWith('.test.js')) {
			arrayOfFiles.push(path.join(dirPath, file));
		}
	});

	return arrayOfFiles;
}

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 20000
	});

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		try {
			// Find all test files
			const files = getAllFiles(testsRoot);

			// Add files to the test suite
			files.forEach(f => mocha.addFile(f));

			// Run the mocha test
			mocha.run((failures: number) => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`));
				} else {
					resolve();
				}
			});
		} catch (err) {
			console.error(err);
			reject(err);
		}
	});
}
