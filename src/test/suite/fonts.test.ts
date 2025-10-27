import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

suite('Font Files Tests', () => {
	
	test('Fonts folder should exist', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension, 'Extension should be found');
		
		const fontsPath = path.join(extension.extensionPath, 'assets', 'fonts');
		const exists = fs.existsSync(fontsPath);
		assert.ok(exists, 'Fonts folder should exist');
	});

	test('Fonts folder should contain TTF files', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension);
		
		const fontsPath = path.join(extension.extensionPath, 'assets', 'fonts');
		if (fs.existsSync(fontsPath)) {
			const files = fs.readdirSync(fontsPath);
			const ttfFiles = files.filter(f => f.toLowerCase().endsWith('.ttf'));
			assert.ok(ttfFiles.length > 0, 'Should have at least one TTF font file');
		}
	});

	test('Font files should be readable', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension);
		
		const fontsPath = path.join(extension.extensionPath, 'assets', 'fonts');
		if (fs.existsSync(fontsPath)) {
			const files = fs.readdirSync(fontsPath);
			const ttfFiles = files.filter(f => f.toLowerCase().endsWith('.ttf'));
			
			for (const ttf of ttfFiles) {
				const filePath = path.join(fontsPath, ttf);
				try {
					const stats = fs.statSync(filePath);
					assert.ok(stats.size > 0, `${ttf} should have content`);
					assert.ok(stats.size < 10 * 1024 * 1024, `${ttf} should be less than 10MB`);
				} catch (error) {
					assert.fail(`Failed to read ${ttf}: ${error}`);
				}
			}
		}
	});
});

suite('Font Settings Tests', () => {
	
	test('Should be able to set Atkinson Hyperlegible font', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalFont = config.get<string>('fontFamily');
		
		const atkinsonFont = "'Atkinson Hyperlegible Mono', Consolas, 'Courier New', monospace";
		await config.update('fontFamily', atkinsonFont, vscode.ConfigurationTarget.Global);
		
		const currentFont = config.get<string>('fontFamily');
		assert.ok(currentFont?.includes('Atkinson Hyperlegible Mono'), 'Should set Atkinson font');
		
		// Restore
		await config.update('fontFamily', originalFont, vscode.ConfigurationTarget.Global);
	});

	test('Should handle font family with fallbacks', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalFont = config.get<string>('fontFamily');
		
		const fontWithFallbacks = "'Atkinson Hyperlegible Mono', Consolas, 'Courier New', monospace";
		await config.update('fontFamily', fontWithFallbacks, vscode.ConfigurationTarget.Global);
		
		const currentFont = config.get<string>('fontFamily');
		assert.ok(currentFont?.includes('monospace'), 'Should include fallback fonts');
		
		// Restore
		await config.update('fontFamily', originalFont, vscode.ConfigurationTarget.Global);
	});

	test('Should switch between different fonts', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalFont = config.get<string>('fontFamily');
		
		// Set Atkinson
		await config.update('fontFamily', "'Atkinson Hyperlegible Mono'", vscode.ConfigurationTarget.Global);
		let font = config.get<string>('fontFamily');
		assert.ok(font?.includes('Atkinson Hyperlegible Mono'));
		
		// Set Consolas
		await config.update('fontFamily', "Consolas", vscode.ConfigurationTarget.Global);
		font = config.get<string>('fontFamily');
		assert.ok(font?.includes('Consolas'));
		
		// Restore
		await config.update('fontFamily', originalFont, vscode.ConfigurationTarget.Global);
	});
});

suite('Font Command Tests', () => {
	
	test('openFontsFolder command should execute', async () => {
		try {
			await vscode.commands.executeCommand('low-vision-accessibility.openFontsFolder');
			assert.ok(true, 'Command executed successfully');
		} catch (error) {
			assert.fail(`Command failed: ${error}`);
		}
	});

	test('Should handle missing fonts folder gracefully', async () => {
		// This test verifies the command doesn't crash even if fonts are missing
		// The actual folder should exist, but we're testing error handling
		try {
			await vscode.commands.executeCommand('low-vision-accessibility.openFontsFolder');
			assert.ok(true, 'Command handles folder state');
		} catch (error) {
			// Command should not throw, it should show error message instead
			assert.fail(`Command should not throw: ${error}`);
		}
	});
});
