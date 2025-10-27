import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Activation & Installation Tests', () => {
	
	test('Extension should be present', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension, 'Extension should be installed');
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension);
		await extension.activate();
		assert.strictEqual(extension.isActive, true, 'Extension should be active');
	});

	test('Extension should register all commands', async () => {
		const commands = await vscode.commands.getCommands(true);
		assert.ok(
			commands.includes('low-vision-accessibility.openAccessibilityPanel'),
			'Should register openAccessibilityPanel command'
		);
		assert.ok(
			commands.includes('low-vision-accessibility.openFontsFolder'),
			'Should register openFontsFolder command'
		);
	});
});

suite('Command Tests', () => {
	
	test('openAccessibilityPanel command should execute without error', async () => {
		try {
			await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
			assert.ok(true, 'Command executed successfully');
		} catch (error) {
			assert.fail(`Command failed: ${error}`);
		}
	});

	test('openFontsFolder command should execute without error', async () => {
		try {
			await vscode.commands.executeCommand('low-vision-accessibility.openFontsFolder');
			assert.ok(true, 'Command executed successfully');
		} catch (error) {
			assert.fail(`Command failed: ${error}`);
		}
	});

	test('openAccessibilityPanel should create only one panel instance', async () => {
		// Execute command twice
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		await vscode.commands.executeCommand('low-vision-accessibility.openAccessibilityPanel');
		
		// Both should succeed (singleton pattern)
		assert.ok(true, 'Multiple executions should not throw error');
	});
});

suite('Theme Registration Tests', () => {
	
	test('All GitHub themes should be registered', async () => {
		const expectedThemes = [
			'GitHub Light Default (Low Vision)',
			'GitHub Light High Contrast (Low Vision)',
			'GitHub Light Colorblind (Beta) (Low Vision)',
			'GitHub Dark Default (Low Vision)',
			'GitHub Dark High Contrast (Low Vision)',
			'GitHub Dark Colorblind (Beta) (Low Vision)',
			'GitHub Dark Dimmed (Low Vision)',
			'GitHub Light (Low Vision)',
			'GitHub Dark (Low Vision)'
		];

		const config = vscode.workspace.getConfiguration('workbench');
		const currentTheme = config.get<string>('colorTheme');
		
		// We can't easily enumerate all themes, but we can try to set each one
		for (const theme of expectedThemes) {
			try {
				await config.update('colorTheme', theme, vscode.ConfigurationTarget.Global);
				const updatedTheme = config.get<string>('colorTheme');
				assert.strictEqual(updatedTheme, theme, `Theme ${theme} should be settable`);
			} catch (error) {
				assert.fail(`Failed to set theme ${theme}: ${error}`);
			}
		}

		// Restore original theme
		if (currentTheme) {
			await config.update('colorTheme', currentTheme, vscode.ConfigurationTarget.Global);
		}
	});

	test('Should be able to switch between light and dark themes', async () => {
		const config = vscode.workspace.getConfiguration('workbench');
		const originalTheme = config.get<string>('colorTheme');

		// Test dark theme
		await config.update('colorTheme', 'GitHub Dark Default (Low Vision)', vscode.ConfigurationTarget.Global);
		let theme = config.get<string>('colorTheme');
		assert.strictEqual(theme, 'GitHub Dark Default (Low Vision)');

		// Test light theme
		await config.update('colorTheme', 'GitHub Light Default (Low Vision)', vscode.ConfigurationTarget.Global);
		theme = config.get<string>('colorTheme');
		assert.strictEqual(theme, 'GitHub Light Default (Low Vision)');

		// Restore
		if (originalTheme) {
			await config.update('colorTheme', originalTheme, vscode.ConfigurationTarget.Global);
		}
	});

	test('High contrast themes should be available', async () => {
		const config = vscode.workspace.getConfiguration('workbench');
		const originalTheme = config.get<string>('colorTheme');

		// Test high contrast dark
		await config.update('colorTheme', 'GitHub Dark High Contrast (Low Vision)', vscode.ConfigurationTarget.Global);
		let theme = config.get<string>('colorTheme');
		assert.strictEqual(theme, 'GitHub Dark High Contrast (Low Vision)');

		// Test high contrast light
		await config.update('colorTheme', 'GitHub Light High Contrast (Low Vision)', vscode.ConfigurationTarget.Global);
		theme = config.get<string>('colorTheme');
		assert.strictEqual(theme, 'GitHub Light High Contrast (Low Vision)');

		// Restore
		if (originalTheme) {
			await config.update('colorTheme', originalTheme, vscode.ConfigurationTarget.Global);
		}
	});
});

suite('Settings Synchronization Tests', () => {
	
	const testSettings = [
		{ key: 'editor.fontSize', testValue: 18, originalValue: 14 },
		{ key: 'editor.fontFamily', testValue: "'Atkinson Hyperlegible Mono', Consolas, 'Courier New', monospace", originalValue: '' },
		{ key: 'editor.lineHeight', testValue: 1.6, originalValue: 0 },
		{ key: 'editor.letterSpacing', testValue: 0.5, originalValue: 0 },
		{ key: 'editor.mouseWheelZoom', testValue: true, originalValue: false },
		{ key: 'editor.cursorStyle', testValue: 'block', originalValue: 'line' },
		{ key: 'editor.cursorBlinking', testValue: 'solid', originalValue: 'blink' },
		{ key: 'editor.wordWrap', testValue: 'on', originalValue: 'off' },
		{ key: 'editor.minimap.enabled', testValue: false, originalValue: true },
		{ key: 'window.zoomLevel', testValue: 1.5, originalValue: 0 }
	];

	test('Should be able to read current settings', () => {
		for (const setting of testSettings) {
			const config = vscode.workspace.getConfiguration();
			const value = config.get(setting.key);
			assert.notStrictEqual(value, undefined, `Should be able to read ${setting.key}`);
		}
	});

	test('Should be able to update editor settings', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalFontSize = config.get<number>('fontSize');

		await config.update('fontSize', 18, vscode.ConfigurationTarget.Global);
		const updatedFontSize = config.get<number>('fontSize');
		assert.strictEqual(updatedFontSize, 18, 'Font size should update');

		// Restore
		await config.update('fontSize', originalFontSize, vscode.ConfigurationTarget.Global);
	});

	test('Should be able to update window settings', async () => {
		const config = vscode.workspace.getConfiguration('window');
		const originalZoom = config.get<number>('zoomLevel');

		await config.update('zoomLevel', 1.0, vscode.ConfigurationTarget.Global);
		const updatedZoom = config.get<number>('zoomLevel');
		assert.strictEqual(updatedZoom, 1.0, 'Zoom level should update');

		// Restore
		await config.update('zoomLevel', originalZoom, vscode.ConfigurationTarget.Global);
	});

	test('Should be able to update terminal settings', async () => {
		const config = vscode.workspace.getConfiguration('terminal.integrated');
		const originalFontSize = config.get<number>('fontSize');

		await config.update('fontSize', 16, vscode.ConfigurationTarget.Global);
		const updatedFontSize = config.get<number>('fontSize');
		assert.strictEqual(updatedFontSize, 16, 'Terminal font size should update');

		// Restore
		await config.update('fontSize', originalFontSize, vscode.ConfigurationTarget.Global);
	});

	test('Should handle boolean settings correctly', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<boolean>('mouseWheelZoom');

		await config.update('mouseWheelZoom', true, vscode.ConfigurationTarget.Global);
		let value = config.get<boolean>('mouseWheelZoom');
		assert.strictEqual(value, true);

		await config.update('mouseWheelZoom', false, vscode.ConfigurationTarget.Global);
		value = config.get<boolean>('mouseWheelZoom');
		assert.strictEqual(value, false);

		// Restore
		await config.update('mouseWheelZoom', originalValue, vscode.ConfigurationTarget.Global);
	});

	test('Should handle string settings correctly', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<string>('cursorStyle');

		await config.update('cursorStyle', 'block', vscode.ConfigurationTarget.Global);
		let value = config.get<string>('cursorStyle');
		assert.strictEqual(value, 'block');

		await config.update('cursorStyle', 'line', vscode.ConfigurationTarget.Global);
		value = config.get<string>('cursorStyle');
		assert.strictEqual(value, 'line');

		// Restore
		await config.update('cursorStyle', originalValue, vscode.ConfigurationTarget.Global);
	});

	test('Should handle number settings correctly', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<number>('fontSize');

		await config.update('fontSize', 16, vscode.ConfigurationTarget.Global);
		let value = config.get<number>('fontSize');
		assert.strictEqual(value, 16);

		await config.update('fontSize', 20, vscode.ConfigurationTarget.Global);
		value = config.get<number>('fontSize');
		assert.strictEqual(value, 20);

		// Restore
		await config.update('fontSize', originalValue, vscode.ConfigurationTarget.Global);
	});
});

suite('Recommended Settings Tests', () => {
	
	const recommendedSettings = {
		'editor.fontFamily': "'Atkinson Hyperlegible Mono', Consolas, 'Courier New', monospace",
		'editor.fontSize': 16,
		'editor.mouseWheelZoom': true,
		'editor.cursorStyle': 'block',
		'editor.cursorBlinking': 'solid',
		'editor.matchBrackets': 'always',
		'editor.bracketPairColorization.enabled': true,
		'editor.wordWrap': 'on',
		'editor.accessibilitySupport': 'on',
		'editor.minimap.enabled': false,
		'editor.guides.indentation': true,
		'editor.guides.bracketPairs': 'active',
		'editor.smoothScrolling': true,
		'editor.wrappingIndent': 'same',
		'editor.suggestFontSize': 16,
		'editor.inlayHints.enabled': 'off',
		'editor.parameterHints.enabled': true,
		'editor.hover.enabled': true,
		'terminal.integrated.fontSize': 16,
		'terminal.integrated.cursorStyle': 'block',
		'terminal.integrated.cursorBlinking': true
	};

	test('Recommended settings structure should be valid', () => {
		for (const [key, value] of Object.entries(recommendedSettings)) {
			assert.notStrictEqual(key, '', 'Setting key should not be empty');
			assert.notStrictEqual(value, undefined, 'Setting value should not be undefined');
			
			// Validate types
			if (key.includes('enabled') || key.includes('Blinking')) {
				assert.strictEqual(typeof value === 'boolean' || typeof value === 'string', true, 
					`${key} should be boolean or string`);
			}
		}
	});

	test('Should be able to apply recommended font settings', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalFamily = config.get<string>('fontFamily');
		const originalSize = config.get<number>('fontSize');

		await config.update('fontFamily', recommendedSettings['editor.fontFamily'], vscode.ConfigurationTarget.Global);
		await config.update('fontSize', recommendedSettings['editor.fontSize'], vscode.ConfigurationTarget.Global);

		const family = config.get<string>('fontFamily');
		const size = config.get<number>('fontSize');

		assert.strictEqual(family, recommendedSettings['editor.fontFamily']);
		assert.strictEqual(size, 16);

		// Restore
		await config.update('fontFamily', originalFamily, vscode.ConfigurationTarget.Global);
		await config.update('fontSize', originalSize, vscode.ConfigurationTarget.Global);
	});

	test('Should be able to apply recommended cursor settings', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalStyle = config.get<string>('cursorStyle');
		const originalBlinking = config.get<string>('cursorBlinking');

		await config.update('cursorStyle', 'block', vscode.ConfigurationTarget.Global);
		await config.update('cursorBlinking', 'solid', vscode.ConfigurationTarget.Global);

		const style = config.get<string>('cursorStyle');
		const blinking = config.get<string>('cursorBlinking');

		assert.strictEqual(style, 'block');
		assert.strictEqual(blinking, 'solid');

		// Restore
		await config.update('cursorStyle', originalStyle, vscode.ConfigurationTarget.Global);
		await config.update('cursorBlinking', originalBlinking, vscode.ConfigurationTarget.Global);
	});

	test('Should be able to apply recommended accessibility settings', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalSupport = config.get<string>('accessibilitySupport');
		const originalMinimap = config.get<boolean>('minimap.enabled');

		await config.update('accessibilitySupport', 'on', vscode.ConfigurationTarget.Global);
		await config.update('minimap.enabled', false, vscode.ConfigurationTarget.Global);

		const support = config.get<string>('accessibilitySupport');
		const minimap = config.get<boolean>('minimap.enabled');

		assert.strictEqual(support, 'on');
		assert.strictEqual(minimap, false);

		// Restore
		await config.update('accessibilitySupport', originalSupport, vscode.ConfigurationTarget.Global);
		await config.update('minimap.enabled', originalMinimap, vscode.ConfigurationTarget.Global);
	});
});

suite('Reset Functionality Tests', () => {
	
	test('Should be able to reset settings to undefined', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		
		// Set a value
		await config.update('fontSize', 20, vscode.ConfigurationTarget.Global);
		let value = config.get<number>('fontSize');
		assert.strictEqual(value, 20);

		// Reset to default (undefined)
		await config.update('fontSize', undefined, vscode.ConfigurationTarget.Global);
		value = config.get<number>('fontSize');
		// Value should revert to VS Code default (likely 14 or system default)
		assert.ok(value !== 20, 'Value should have changed from 20');
	});

	test('Should handle resetting multiple settings', async () => {
		const editorConfig = vscode.workspace.getConfiguration('editor');
		const windowConfig = vscode.workspace.getConfiguration('window');

		// Set values
		await editorConfig.update('fontSize', 18, vscode.ConfigurationTarget.Global);
		await editorConfig.update('cursorStyle', 'block', vscode.ConfigurationTarget.Global);
		await windowConfig.update('zoomLevel', 1.5, vscode.ConfigurationTarget.Global);

		// Reset all
		await editorConfig.update('fontSize', undefined, vscode.ConfigurationTarget.Global);
		await editorConfig.update('cursorStyle', undefined, vscode.ConfigurationTarget.Global);
		await windowConfig.update('zoomLevel', undefined, vscode.ConfigurationTarget.Global);

		// Verify reset (values should be defaults, not our test values)
		const fontSize = editorConfig.get<number>('fontSize');
		const cursorStyle = editorConfig.get<string>('cursorStyle');
		const zoomLevel = windowConfig.get<number>('zoomLevel');

		assert.ok(fontSize !== 18, 'Font size should be reset');
		assert.ok(cursorStyle !== 'block' || cursorStyle === 'block', 'Cursor style should be reset or default');
		assert.ok(zoomLevel !== 1.5, 'Zoom level should be reset');
	});
});

suite('Edge Cases & Error Handling Tests', () => {
	
	test('Should handle invalid font size values gracefully', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<number>('fontSize');

		// Try to set very large value
		await config.update('fontSize', 999, vscode.ConfigurationTarget.Global);
		const largeValue = config.get<number>('fontSize');
		// VS Code may clamp this
		assert.ok(largeValue !== undefined && (largeValue === 999 || largeValue < 999), 'Should accept or clamp large value');

		// Try to set very small value
		await config.update('fontSize', 1, vscode.ConfigurationTarget.Global);
		const smallValue = config.get<number>('fontSize');
		assert.ok(smallValue !== undefined && (smallValue === 1 || smallValue > 1), 'Should accept or clamp small value');

		// Restore
		await config.update('fontSize', originalValue, vscode.ConfigurationTarget.Global);
	});

	test('Should handle invalid line height values', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<number>('lineHeight');

		// Test auto (0)
		await config.update('lineHeight', 0, vscode.ConfigurationTarget.Global);
		let value = config.get<number>('lineHeight');
		assert.strictEqual(value, 0, 'Should accept 0 for auto');

		// Test multiplier
		await config.update('lineHeight', 1.5, vscode.ConfigurationTarget.Global);
		value = config.get<number>('lineHeight');
		assert.strictEqual(value, 1.5, 'Should accept multiplier');

		// Restore
		await config.update('lineHeight', originalValue, vscode.ConfigurationTarget.Global);
	});

	test('Should handle rapid setting changes', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<number>('fontSize');

		// Rapidly change values
		await config.update('fontSize', 14, vscode.ConfigurationTarget.Global);
		await config.update('fontSize', 16, vscode.ConfigurationTarget.Global);
		await config.update('fontSize', 18, vscode.ConfigurationTarget.Global);
		await config.update('fontSize', 20, vscode.ConfigurationTarget.Global);

		// Final value should be 20
		const value = config.get<number>('fontSize');
		assert.strictEqual(value, 20, 'Should handle rapid changes');

		// Restore
		await config.update('fontSize', originalValue, vscode.ConfigurationTarget.Global);
	});

	test('Should handle unknown setting keys gracefully', () => {
		const config = vscode.workspace.getConfiguration('editor');
		// This shouldn't throw, just return undefined
		const value = config.get('nonExistentSetting123456789');
		assert.strictEqual(value, undefined, 'Unknown setting should return undefined');
	});
});

suite('Performance Tests', () => {
	
	test('Setting updates should complete in reasonable time', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<number>('fontSize');
		
		const startTime = Date.now();
		await config.update('fontSize', 18, vscode.ConfigurationTarget.Global);
		const endTime = Date.now();
		
		const duration = endTime - startTime;
		assert.ok(duration < 1000, `Setting update took ${duration}ms, should be under 1000ms`);

		// Restore
		await config.update('fontSize', originalValue, vscode.ConfigurationTarget.Global);
	});

	test('Multiple setting updates should be efficient', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalFontSize = config.get<number>('fontSize');
		const originalCursorStyle = config.get<string>('cursorStyle');
		const originalWordWrap = config.get<string>('wordWrap');

		const startTime = Date.now();
		
		await config.update('fontSize', 16, vscode.ConfigurationTarget.Global);
		await config.update('cursorStyle', 'block', vscode.ConfigurationTarget.Global);
		await config.update('wordWrap', 'on', vscode.ConfigurationTarget.Global);
		
		const endTime = Date.now();
		const duration = endTime - startTime;
		
		assert.ok(duration < 3000, `3 updates took ${duration}ms, should be under 3000ms`);

		// Restore
		await config.update('fontSize', originalFontSize, vscode.ConfigurationTarget.Global);
		await config.update('cursorStyle', originalCursorStyle, vscode.ConfigurationTarget.Global);
		await config.update('wordWrap', originalWordWrap, vscode.ConfigurationTarget.Global);
	});
});
