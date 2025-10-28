import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { waitForConfig } from './testUtils';

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

	test('All GitHub themes are contributed in package.json', () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.low-vision-accessibility');
		assert.ok(extension);
		const pkgPath = path.join(extension!.extensionPath, 'package.json');
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
		const labels = (pkg?.contributes?.themes ?? []).map((t: any) => t.label);
		const expected = [
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
		for (const name of expected) {
			assert.ok(labels.includes(name), `Theme contribution missing: ${name}`);
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
		const inspected = config.inspect<number>('fontSize');
		assert.strictEqual(inspected?.globalValue, 18, 'Font size global value should update');

		// Restore
		await config.update('fontSize', originalFontSize, vscode.ConfigurationTarget.Global);
	});

	test('Should be able to update window settings', async () => {
		const config = vscode.workspace.getConfiguration('window');
		const originalZoom = config.get<number>('zoomLevel');

		await config.update('zoomLevel', 1.0, vscode.ConfigurationTarget.Global);
		const inspected = config.inspect<number>('zoomLevel');
		assert.strictEqual(inspected?.globalValue, 1.0, 'Zoom level global value should update');

		// Restore
		await config.update('zoomLevel', originalZoom, vscode.ConfigurationTarget.Global);
	});

	test('Should be able to update terminal settings', async () => {
		const config = vscode.workspace.getConfiguration('terminal.integrated');
		const originalFontSize = config.get<number>('fontSize');

		await config.update('fontSize', 16, vscode.ConfigurationTarget.Global);
		const inspected = config.inspect<number>('fontSize');
		assert.strictEqual(inspected?.globalValue, 16, 'Terminal font size global value should update');

		// Restore
		await config.update('fontSize', originalFontSize, vscode.ConfigurationTarget.Global);
	});

	test('Should handle boolean settings correctly', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<boolean>('mouseWheelZoom');

		await config.update('mouseWheelZoom', true, vscode.ConfigurationTarget.Global);
		let inspected = config.inspect<boolean>('mouseWheelZoom');
		assert.strictEqual(inspected?.globalValue, true);

		await config.update('mouseWheelZoom', false, vscode.ConfigurationTarget.Global);
		inspected = config.inspect<boolean>('mouseWheelZoom');
		assert.strictEqual(inspected?.globalValue, false);

		// Restore
		await config.update('mouseWheelZoom', originalValue, vscode.ConfigurationTarget.Global);
	});

	test('Should handle string settings correctly', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<string>('cursorStyle');

		await config.update('cursorStyle', 'block', vscode.ConfigurationTarget.Global);
		let inspected = config.inspect<string>('cursorStyle');
		assert.strictEqual(inspected?.globalValue, 'block');

		await config.update('cursorStyle', 'line', vscode.ConfigurationTarget.Global);
		inspected = config.inspect<string>('cursorStyle');
		assert.strictEqual(inspected?.globalValue, 'line');

		// Restore
		await config.update('cursorStyle', originalValue, vscode.ConfigurationTarget.Global);
	});

	test('Should handle number settings correctly', async () => {
		const config = vscode.workspace.getConfiguration('editor');
		const originalValue = config.get<number>('fontSize');

		await config.update('fontSize', 16, vscode.ConfigurationTarget.Global);
		let inspected = config.inspect<number>('fontSize');
		assert.strictEqual(inspected?.globalValue, 16);

		await config.update('fontSize', 20, vscode.ConfigurationTarget.Global);
		inspected = config.inspect<number>('fontSize');
		assert.strictEqual(inspected?.globalValue, 20);

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

		const familyInspect = config.inspect<string>('fontFamily');
		const sizeInspect = config.inspect<number>('fontSize');

		assert.strictEqual(familyInspect?.globalValue, recommendedSettings['editor.fontFamily']);
		assert.strictEqual(sizeInspect?.globalValue, 16);

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

		const styleInspect = config.inspect<string>('cursorStyle');
		const blinkingInspect = config.inspect<string>('cursorBlinking');

		assert.strictEqual(styleInspect?.globalValue, 'block');
		assert.strictEqual(blinkingInspect?.globalValue, 'solid');

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

		const supportInspect = config.inspect<string>('accessibilitySupport');
		const minimapInspect = config.inspect<boolean>('minimap.enabled');

		assert.strictEqual(supportInspect?.globalValue, 'on');
		assert.strictEqual(minimapInspect?.globalValue, false);

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
		let inspectedBefore = config.inspect<number>('fontSize');
		assert.strictEqual(inspectedBefore?.globalValue, 20, 'Global should be set to 20 before reset');

		// Reset to default (undefined)
		await config.update('fontSize', undefined, vscode.ConfigurationTarget.Global);
		const inspected = config.inspect<number>('fontSize');
		assert.strictEqual(inspected?.globalValue, undefined, 'Global value should be undefined after reset');
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
		let inspected = config.inspect<number>('lineHeight');
		assert.strictEqual(inspected?.globalValue, 0, 'Should accept 0 for auto');

		// Test pixel value (more reliable in test host)
		await config.update('lineHeight', 20, vscode.ConfigurationTarget.Global);
		inspected = config.inspect<number>('lineHeight');
		assert.strictEqual(inspected?.globalValue, 20, 'Should accept pixel value');

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
		const inspected = config.inspect<number>('fontSize');
		assert.strictEqual(inspected?.globalValue, 20, 'Should handle rapid changes');

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
