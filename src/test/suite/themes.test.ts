import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { sleep } from './testUtils';

suite('Theme File Tests', () => {
	
	const expectedThemeFiles = [
		'light-default.json',
		'light-high-contrast.json',
		'light-colorblind.json',
		'dark-default.json',
		'dark-high-contrast.json',
		'dark-colorblind.json',
		'dark-dimmed.json',
		'light.json',
		'dark.json'
	];

	test('All theme files should exist', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension, 'Extension should be found');
		
		const themesPath = path.join(extension.extensionPath, 'themes');
		
		for (const themeFile of expectedThemeFiles) {
			const filePath = path.join(themesPath, themeFile);
			const exists = fs.existsSync(filePath);
			assert.ok(exists, `Theme file ${themeFile} should exist`);
		}
	});

	test('Theme files should be valid JSON', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension);
		
		const themesPath = path.join(extension.extensionPath, 'themes');
		
		for (const themeFile of expectedThemeFiles) {
			const filePath = path.join(themesPath, themeFile);
			if (fs.existsSync(filePath)) {
				const content = fs.readFileSync(filePath, 'utf-8');
				try {
					JSON.parse(content);
					assert.ok(true, `${themeFile} is valid JSON`);
				} catch (error) {
					assert.fail(`${themeFile} is not valid JSON: ${error}`);
				}
			}
		}
	});

	test('Theme files should have required structure', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension);
		
		const themesPath = path.join(extension.extensionPath, 'themes');
		
		for (const themeFile of expectedThemeFiles) {
			const filePath = path.join(themesPath, themeFile);
			if (fs.existsSync(filePath)) {
				const content = fs.readFileSync(filePath, 'utf-8');
				const theme = JSON.parse(content);
				
				// Check for required properties
				assert.ok('colors' in theme || 'tokenColors' in theme, 
					`${themeFile} should have colors or tokenColors`);
			}
		}
	});

	test('Dark themes should have dark base colors', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension);
		
		const themesPath = path.join(extension.extensionPath, 'themes');
		const darkThemes = expectedThemeFiles.filter(f => f.startsWith('dark'));
		
		for (const themeFile of darkThemes) {
			const filePath = path.join(themesPath, themeFile);
			if (fs.existsSync(filePath)) {
				const content = fs.readFileSync(filePath, 'utf-8');
				const theme = JSON.parse(content);
				
				if (theme.colors && theme.colors['editor.background']) {
					const bgColor = theme.colors['editor.background'];
					// Dark themes should have dark backgrounds (hex values starting with #0, #1, #2, etc.)
					assert.ok(
						bgColor.match(/^#[0-3]/i) !== null,
						`${themeFile} should have a dark background color, got ${bgColor}`
					);
				}
			}
		}
	});

	test('Light themes should have light base colors', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension);
		
		const themesPath = path.join(extension.extensionPath, 'themes');
		const lightThemes = expectedThemeFiles.filter(f => f.startsWith('light'));
		
		for (const themeFile of lightThemes) {
			const filePath = path.join(themesPath, themeFile);
			if (fs.existsSync(filePath)) {
				const content = fs.readFileSync(filePath, 'utf-8');
				const theme = JSON.parse(content);
				
				if (theme.colors && theme.colors['editor.background']) {
					const bgColor = theme.colors['editor.background'];
					// Light themes should have light backgrounds (hex values starting with #e, #f, etc.)
					assert.ok(
						bgColor.match(/^#[e-f]/i) !== null,
						`${themeFile} should have a light background color, got ${bgColor}`
					);
				}
			}
		}
	});
});

suite('Theme Switching Tests', () => {

	test('Should handle theme switching without errors', async () => {
		const config = vscode.workspace.getConfiguration('workbench');
		const originalTheme = config.get<string>('colorTheme');
		
		try {
			// Switch between contrasting themes rapidly
			await config.update('colorTheme', 'GitHub Dark Default (Low Vision)', vscode.ConfigurationTarget.Global);
			await sleep(100);
			await config.update('colorTheme', 'GitHub Light Default (Low Vision)', vscode.ConfigurationTarget.Global);
			await sleep(100);
			await config.update('colorTheme', 'GitHub Dark High Contrast (Low Vision)', vscode.ConfigurationTarget.Global);
			await sleep(100);
			await config.update('colorTheme', 'GitHub Light High Contrast (Low Vision)', vscode.ConfigurationTarget.Global);
			
			assert.ok(true, 'Theme switching completed without errors');
		} finally {
			// Restore
			if (originalTheme) {
				await config.update('colorTheme', originalTheme, vscode.ConfigurationTarget.Global);
			}
		}
	});
});
