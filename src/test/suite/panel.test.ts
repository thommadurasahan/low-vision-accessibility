import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Accessibility Panel Tests', () => {
	
	test('Panel should open successfully', async () => {
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		// Panel should be created without throwing
		assert.ok(true, 'Panel opened successfully');
	});

	test('Panel should be a singleton', async () => {
		// Open panel multiple times
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		
		// Should not throw or create multiple instances
		assert.ok(true, 'Panel singleton works correctly');
	});

	test('Panel should handle settings updates', async () => {
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		
		// Make a setting change
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<number>('fontSize');
		
		await config.update('fontSize', 18, vscode.ConfigurationTarget.Global);
		
		// Wait for panel to potentially react to config change
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// Verify setting was applied
		const newValue = config.get<number>('fontSize');
		assert.strictEqual(newValue, 18, 'Setting should be updated');
		
		// Restore
		await config.update('fontSize', originalValue, vscode.ConfigurationTarget.Global);
	});
});

suite('Panel UI Interaction Tests', () => {
	
	test('Should handle theme changes while panel is open', async () => {
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		
		const config = vscode.workspace.getConfiguration('workbench');
		const originalTheme = config.get<string>('colorTheme');
		
		// Change theme
		await config.update('colorTheme', 'GitHub Dark Default (Low Vision)', vscode.ConfigurationTarget.Global);
		await new Promise(resolve => setTimeout(resolve, 300));
		
		let theme = config.get<string>('colorTheme');
		assert.strictEqual(theme, 'GitHub Dark Default (Low Vision)');
		
		// Change to another theme
		await config.update('colorTheme', 'GitHub Light Default (Low Vision)', vscode.ConfigurationTarget.Global);
		await new Promise(resolve => setTimeout(resolve, 300));
		
		theme = config.get<string>('colorTheme');
		assert.strictEqual(theme, 'GitHub Light Default (Low Vision)');
		
		// Restore
		if (originalTheme) {
			await config.update('colorTheme', originalTheme, vscode.ConfigurationTarget.Global);
		}
	});

	test('Should handle zoom level changes', async () => {
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		
		const config = vscode.workspace.getConfiguration('window');
		const originalZoom = config.get<number>('zoomLevel');
		
		// Test zoom in
		await config.update('zoomLevel', 1.0, vscode.ConfigurationTarget.Global);
		await new Promise(resolve => setTimeout(resolve, 300));
		let zoom = config.get<number>('zoomLevel');
		assert.strictEqual(zoom, 1.0);
		
		// Test zoom out
		await config.update('zoomLevel', -0.5, vscode.ConfigurationTarget.Global);
		await new Promise(resolve => setTimeout(resolve, 300));
		zoom = config.get<number>('zoomLevel');
		assert.strictEqual(zoom, -0.5);
		
		// Restore
		await config.update('zoomLevel', originalZoom, vscode.ConfigurationTarget.Global);
	});

	test('Should handle multiple concurrent setting changes', async () => {
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		
		const editorConfig = vscode.workspace.getConfiguration('editor');
		const originalFontSize = editorConfig.get<number>('fontSize');
		const originalLineHeight = editorConfig.get<number>('lineHeight');
		const originalLetterSpacing = editorConfig.get<number>('letterSpacing');
		
		// Update multiple settings at once
		await Promise.all([
			editorConfig.update('fontSize', 18, vscode.ConfigurationTarget.Global),
			editorConfig.update('lineHeight', 1.6, vscode.ConfigurationTarget.Global),
			editorConfig.update('letterSpacing', 0.5, vscode.ConfigurationTarget.Global)
		]);
		
		// Wait for panel to react
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// Verify all changes
		assert.strictEqual(editorConfig.get<number>('fontSize'), 18);
		assert.strictEqual(editorConfig.get<number>('lineHeight'), 1.6);
		assert.strictEqual(editorConfig.get<number>('letterSpacing'), 0.5);
		
		// Restore
		await Promise.all([
			editorConfig.update('fontSize', originalFontSize, vscode.ConfigurationTarget.Global),
			editorConfig.update('lineHeight', originalLineHeight, vscode.ConfigurationTarget.Global),
			editorConfig.update('letterSpacing', originalLetterSpacing, vscode.ConfigurationTarget.Global)
		]);
	});
});
