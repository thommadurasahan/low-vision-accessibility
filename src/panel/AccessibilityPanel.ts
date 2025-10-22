import * as vscode from 'vscode';

/**
 * Manages the Accessibility Settings Panel webview
 */
export class AccessibilityPanel {
    public static currentPanel: AccessibilityPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    private _configUpdateTimer: NodeJS.Timeout | undefined;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Listen for configuration changes and update the webview (with debounce)
        vscode.workspace.onDidChangeConfiguration(e => {
            // Check if any of the accessibility-related settings changed
            if (e.affectsConfiguration('editor') || 
                e.affectsConfiguration('workbench') || 
                e.affectsConfiguration('window') ||
                e.affectsConfiguration('terminal') ||
                e.affectsConfiguration('accessibility') ||
                e.affectsConfiguration('audioCues')) {
                
                // Debounce to avoid rapid updates while dragging sliders
                if (this._configUpdateTimer) {
                    clearTimeout(this._configUpdateTimer);
                }
                this._configUpdateTimer = setTimeout(() => {
                    this._sendCurrentSettings();
                }, 300); // Wait 300ms after the last change for config to settle
            }
        }, null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'applySettings':
                        await this._applySettings(message.settings);
                        return;
                    case 'resetSettings':
                        this._resetSettings(message.settingKeys);
                        return;
                    case 'applyRecommended':
                        this._applyRecommendedSettings();
                        return;
                    case 'getCurrentSettings':
                        this._sendCurrentSettings();
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (AccessibilityPanel.currentPanel) {
            AccessibilityPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'lowVisionAccessibility',
            'Low Vision Accessibility Settings',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri],
                retainContextWhenHidden: true
            }
        );

        AccessibilityPanel.currentPanel = new AccessibilityPanel(panel, extensionUri);
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private async _applySettings(settings: { [key: string]: any }) {
        const config = vscode.workspace.getConfiguration();
        
        for (const [key, value] of Object.entries(settings)) {
            try {
                // Update in Global (User) settings
                await config.update(key, value, vscode.ConfigurationTarget.Global);
                
                // Log the update for debugging
                console.log(`Updated ${key} to ${value}`);
                
                // Verify the setting was applied
                const newValue = config.get(key);
                console.log(`Verified ${key} is now: ${newValue}`);
                
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to update ${key}: ${error}`);
                console.error(`Error updating ${key}:`, error);
            }
        }
        
        vscode.window.showInformationMessage('Settings applied successfully!');
        // Settings will be refreshed automatically via onDidChangeConfiguration listener
    }

    private _resetSettings(settingKeys: string[]) {
        const config = vscode.workspace.getConfiguration();
        
        for (const key of settingKeys) {
            try {
                config.update(key, undefined, vscode.ConfigurationTarget.Global);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to reset ${key}: ${error}`);
            }
        }
        
        vscode.window.showInformationMessage('Settings reset to default!');
        // Refresh the current settings display
        this._sendCurrentSettings();
    }

    private _applyRecommendedSettings() {
        const recommendedSettings = {
            // Text Editor

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

            "editor.guides.indentation": true,
            "editor.guides.bracketPairs": 'active',
            "editor.smoothScrolling": true,
            "editor.wrappingIndent": 'same',
            "editor.inlayHints.enabled": 'off',
            "editor.parameterHints.enabled": true,
            "editor.hover.enabled": true,

            // Features

            'terminal.integrated.cursorStyle': 'block',

            "terminal.integrated.cursorBlinking": true,
            "accessibility.signals.enabled": true,
            "audioCues.lineHasError": 'on',
            "audioCues.lineHasBreakpoint": 'on',
            "audioCues.taskCompleted": 'on',
            "audioCues.taskFailed": 'on'
        };

        const config = vscode.workspace.getConfiguration();
        
        for (const [key, value] of Object.entries(recommendedSettings)) {
            try {
                config.update(key, value, vscode.ConfigurationTarget.Global);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to update ${key}: ${error}`);
            }
        }
        
        vscode.window.showInformationMessage('✅ Recommended low vision settings applied!');
        // Refresh the current settings display
        this._sendCurrentSettings();
    }

    private _sendCurrentSettings() {
        const config = vscode.workspace.getConfiguration();
        
        // Log current font size from different scopes for debugging
        const globalFontSize = config.inspect('editor.fontSize')?.globalValue;
        const workspaceFontSize = config.inspect('editor.fontSize')?.workspaceValue;
        const effectiveFontSize = config.get('editor.fontSize');
        
        console.log('Font Size Settings:');
        console.log(`  Global: ${globalFontSize}`);
        console.log(`  Workspace: ${workspaceFontSize}`);
        console.log(`  Effective: ${effectiveFontSize}`);
        
        const currentSettings = {
            // Quick Settings - Workbench
            'workbench.colorTheme': config.get('workbench.colorTheme'),
            
            // Quick Settings - Window
            'window.zoomLevel': config.get('window.zoomLevel'),
            
            // Quick Settings - Text Editor
            'editor.fontFamily': config.get('editor.fontFamily'),
            'editor.fontSize': config.get('editor.fontSize'),
            'editor.lineHeight': config.get('editor.lineHeight'),
            'editor.letterSpacing': config.get('editor.letterSpacing'),
            'editor.mouseWheelZoom': config.get('editor.mouseWheelZoom'),
            'editor.cursorStyle': config.get('editor.cursorStyle'),
            'editor.cursorBlinking': config.get('editor.cursorBlinking'),
            'editor.matchBrackets': config.get('editor.matchBrackets'),
            'editor.bracketPairColorization.enabled': config.get('editor.bracketPairColorization.enabled'),
            'editor.wordWrap': config.get('editor.wordWrap'),
            'editor.accessibilitySupport': config.get('editor.accessibilitySupport'),
            'editor.minimap.enabled': config.get('editor.minimap.enabled'),
            
            // Quick Settings - Features
            'terminal.integrated.fontSize': config.get('terminal.integrated.fontSize'),
            'terminal.integrated.cursorStyle': config.get('terminal.integrated.cursorStyle'),
            
            // Other Settings - Text Editor
            'editor.guides.indentation': config.get('editor.guides.indentation'),
            'editor.guides.bracketPairs': config.get('editor.guides.bracketPairs'),
            'editor.smoothScrolling': config.get('editor.smoothScrolling'),
            'editor.scrollbar.verticalScrollbarSize': config.get('editor.scrollbar.verticalScrollbarSize'),
            'editor.scrollbar.horizontalScrollbarSize': config.get('editor.scrollbar.horizontalScrollbarSize'),
            'editor.wrappingIndent': config.get('editor.wrappingIndent'),
            'editor.suggestFontSize': config.get('editor.suggestFontSize'),
            'editor.suggestLineHeight': config.get('editor.suggestLineHeight'),
            'editor.inlayHints.enabled': config.get('editor.inlayHints.enabled'),
            'editor.parameterHints.enabled': config.get('editor.parameterHints.enabled'),
            'editor.hover.enabled': config.get('editor.hover.enabled'),
            
            // Other Settings - Workbench
            'workbench.preferredDarkColorTheme': config.get('workbench.preferredDarkColorTheme'),
            'workbench.preferredLightColorTheme': config.get('workbench.preferredLightColorTheme'),
            'workbench.preferredHighContrastColorTheme': config.get('workbench.preferredHighContrastColorTheme'),
            
            // Other Settings - Features
            'terminal.integrated.lineHeight': config.get('terminal.integrated.lineHeight'),
            'terminal.integrated.cursorBlinking': config.get('terminal.integrated.cursorBlinking')
        };

        this._panel.webview.postMessage({
            command: 'updateSettings',
            settings: currentSettings
        });
    }

    public dispose() {
        AccessibilityPanel.currentPanel = undefined;

        // Clear the debounce timer if it exists
        if (this._configUpdateTimer) {
            clearTimeout(this._configUpdateTimer);
        }

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Vision Accessibility Settings</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }

        .container {
            max-width: 1200px;
            /* Enforce a minimum readable width; below this, horizontal scrolling will appear */
            min-width: 300px;
            margin: 0 auto;
        }

        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-foreground);
        }

        .subtitle {
            color: var(--vscode-descriptionForeground);
            margin-bottom: 24px;
            font-size: 14px;
        }

        .action-bar {
            display: flex;
            gap: 12px;
            margin-bottom: 32px;
            padding: 16px;
            background-color: var(--vscode-editor-background);
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border);
        }

        .btn {
            padding: 6px 14px;
            min-height: 28px;
            border: 1px solid var(--vscode-button-border, transparent);
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        /* Primary button styled like Marketplace Install */
        .btn-primary {
            background-color: var(--vscode-extensionButton-prominentBackground, var(--vscode-button-background));
            color: var(--vscode-extensionButton-prominentForeground, var(--vscode-button-foreground));
            border-color: var(--vscode-button-border, transparent);
        }

        .btn-primary:hover {
            background-color: var(--vscode-extensionButton-prominentHoverBackground, var(--vscode-button-hoverBackground));
        }

        .btn-primary:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: 2px;
        }

        /* Secondary button similar to Uninstall/Manage */
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border-color: var(--vscode-button-border, transparent);
        }

        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .btn-secondary:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: 2px;
        }

        .section {
            margin-bottom: 40px;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--vscode-panel-border);
        }

        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: var(--vscode-foreground);
        }

        .section-description {
            color: var(--vscode-descriptionForeground);
            font-size: 13px;
            margin-top: 4px;
        }

        .group {
            margin-bottom: 32px;
            padding: 20px;
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
        }

        .group-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: var(--vscode-foreground);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .group-icon {
            font-size: 18px;
        }

        .setting-item {
            margin-bottom: 20px;
            padding: 16px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
        }

        .setting-item:last-child {
            margin-bottom: 0;
        }

        .setting-header {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 8px;
            row-gap: 2px;
            column-gap: 12px;
            min-width: 0;
            word-break: break-word;
            /* Responsive: allow spans to wrap and shrink */
        }
        }

        .setting-label {
            font-weight: 500;
            color: var(--vscode-foreground);
            font-size: 14px;
        }

        .setting-key {
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
        }

        .setting-description {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 12px;
        }

        .recommended-badge {
            display: inline-block;
            background-color: var(--vscode-charts-green);
            color: var(--vscode-editor-background);
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 3px;
            font-weight: 600;
            margin-left: 8px;
        }

        .control-group {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        input[type="text"],
        input[type="number"],
        select {
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 13px;
            font-family: var(--vscode-font-family);
            flex: 1;
            min-width: 200px;
            cursor: pointer;
        }

        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: -1px;
        }

        input[type="range"] {
            flex: 1;
            height: 6px;
            cursor: pointer;
        }

        .range-container {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
        }

        .range-value {
            min-width: 50px;
            text-align: center;
            font-weight: 500;
            color: var(--vscode-foreground);
        }

        .info-icon {
            cursor: help;
            color: var(--vscode-descriptionForeground);
            font-size: 16px;
        }

        @media (max-width: 768px) {
            .action-bar {
                flex-direction: column;
            }

            .control-group {
                flex-direction: column;
                align-items: stretch;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Low Vision Accessibility Settings</h1>
        <p class="subtitle">Customize Visual Studio Code for optimal readability and comfort.</p>

        <div class="action-bar">
            <button class="btn btn-primary" onclick="applyRecommended()">
                ✨ Apply Recommended Settings
            </button>
            <button class="btn btn-secondary" onclick="resetAllSettings()">
                🔄 Reset All Settings to VS Code Defaults
            </button>
        </div>

        <!-- QUICK SETTINGS -->
        <div class="section">
            <div class="section-header">
                <div>
                    <div class="section-title">⚡ Quick Settings</div>
                    <div class="section-description">
                        High-impact settings for immediate readability and visual comfort.
                    </div>
                </div>
            </div>

            <!-- Workbench Group -->
            <div class="group">
                <div class="group-title">
                    <span class="group-icon">🎨</span>
                    Workbench
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Color Theme</span>
                        <span class="setting-key">workbench.colorTheme</span>
                    </div>
                    <div class="setting-description">You can try-out different themes including GitHub themes. High contrast and Colorblind-friendly options also available.</div>
                    <div class="control-group">
                        <select id="workbench.colorTheme" onchange="applySetting('workbench.colorTheme', this.value)">
                            <option value="Default Dark Modern">VS Code Dark Modern (Default)</option>
                            <option value="GitHub Dark Default (Low Vision)">GitHub Dark Default</option>
                            <option value="GitHub Dark Colorblind (Beta) (Low Vision)">GitHub Dark Colorblind</option>
                            <option value="GitHub Dark Dimmed (Low Vision)">GitHub Dark Dimmed</option>
                            <option value="GitHub Dark (Low Vision)">GitHub Dark Legacy</option>
                            <option disabled>────────────────────</option>
                            <option value="GitHub Light Default (Low Vision)">GitHub Light Default</option>
                            <option value="GitHub Light Colorblind (Beta) (Low Vision)">GitHub Light Colorblind</option>
                            <option value="GitHub Light (Low Vision)">GitHub Light Legacy</option>
                            <option disabled>────────────────────</option>
                            <option value="Default High Contrast">VS Code Derk High Contrast</option>
                            <option value="Default High Contrast Light">VS Code Light High Contrast</option>
                            <option value="GitHub Dark High Contrast (Low Vision)">GitHub Dark High Contrast</option>
                            <option value="GitHub Light High Contrast (Low Vision)">GitHub Light High Contrast</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Window Group -->
            <div class="group">
                <div class="group-title">
                    <span class="group-icon">🪟</span>
                    Window
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Zoom Level</span>
                        <span class="setting-key">window.zoomLevel</span>
                    </div>
                    <div class="setting-description">Zoom the entire VS Code interface. (Default: 0.0)</div>
                    <div class="range-container">
                        <input type="range" id="window.zoomLevel" min="-3" max="5" step="0.5" value="0" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('window.zoomLevel', parseFloat(this.value))">
                        <span class="range-value" id="window.zoomLevel-value">0</span>
                    </div>
                </div>
            </div>

            <!-- Text Editor Group -->
            <div class="group">
                <div class="group-title">
                    <span class="group-icon">📝</span>
                    Text Editor
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Font Family</span>
                        <span class="setting-key">editor.fontFamily</span>
                    </div>
                    <div class="setting-description">Use Atkinson Hyperlegible Mono for better readability.</div>
                    <div class="control-group">
                        <select id="editor.fontFamily" onchange="applySetting('editor.fontFamily', this.value)">
                            <option value="'Atkinson Hyperlegible Mono', Consolas, 'Courier New', monospace">Atkinson Hyperlegible Mono (Recommended)</option>
                            <option value="Consolas, 'Courier New', monospace">Consolas (Default)</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Font Size</span>
                        <span class="setting-key">editor.fontSize</span>
                    </div>
                    <div class="setting-description">Increase font size for better readability. (Default: 14px & Recommended: 16px)</div>
                    <div class="range-container">
                        <input type="range" id="editor.fontSize" min="12" max="24" step="1" value="14" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.fontSize', parseInt(this.value))">
                        <span class="range-value" id="editor.fontSize-value">14px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Line Height</span>
                        <span class="setting-key">editor.lineHeight</span>
                    </div>
                    <div class="setting-description">Default: 0 = Auto compute based on font size. 0 < value < 8 = Multiply by font size. 8 < value = Actual values in pixels.</div>
                    <div class="control-group">
                        <input type="number" id="editor.lineHeight" min="0" max="150" value="0" 
                               onchange="applySetting('editor.lineHeight', parseFloat(this.value) || 0)">
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Letter Spacing</span>
                        <span class="setting-key">editor.letterSpacing</span>
                    </div>
                    <div class="setting-description">Space between characters in pixels. (Default: 0px)</div>
                    <div class="range-container">
                        <input type="range" id="editor.letterSpacing" min="0" max="2" step="0.1" value="0" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.letterSpacing', parseFloat(this.value))">
                        <span class="range-value" id="editor.letterSpacing-value">0px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Mouse Wheel Zoom</span>
                        <span class="setting-key">editor.mouseWheelZoom</span>
                    </div>
                    <div class="setting-description">Zoom text with Ctrl + Mouse Wheel.</div>
                    <div class="control-group">
                        <select id="editor.mouseWheelZoom" onchange="applySetting('editor.mouseWheelZoom', this.value === 'true')">
                            <option value="true">Enabled (Recommended)</option>
                            <option value="false">Disabled (Default)</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Cursor Style</span>
                        <span class="setting-key">editor.cursorStyle</span>
                    </div>
                    <div class="setting-description">Block cursor is more visible.</div>
                    <div class="control-group">
                        <select id="editor.cursorStyle" onchange="applySetting('editor.cursorStyle', this.value)">
                            <option value="line">Line (Default)</option>
                            <option value="block">Block (Recommended)</option>
                            <option value="underline">Underline</option>
                            <option value="line-thin">Line Thin</option>
                            <option value="block-outline">Block Outline</option>
                            <option value="underline-thin">Underline Thin</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Cursor Blinking</span>
                        <span class="setting-key">editor.cursorBlinking</span>
                    </div>
                    <div class="setting-description">Solid cursor is easier to locate.</div>
                    <div class="control-group">
                        <select id="editor.cursorBlinking" onchange="applySetting('editor.cursorBlinking', this.value)">
                            <option value="blink">Blink (Default)</option>
                            <option value="smooth">Smooth</option>
                            <option value="phase">Phase</option>
                            <option value="expand">Expand</option>
                            <option value="solid">Solid (Recommended)</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Match Brackets</span>
                        <span class="setting-key">editor.matchBrackets</span>
                    </div>
                    <div class="setting-description">Highlight matching brackets.</div>
                    <div class="control-group">
                        <select id="editor.matchBrackets" onchange="applySetting('editor.matchBrackets', this.value)">
                            <option value="always">Always (Default & Recommended)</option>
                            <option value="never">Never</option>
                            <option value="near">Near Cursor</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Bracket Pair Colorization</span>
                        <span class="setting-key">editor.bracketPairColorization.enabled</span>
                    </div>
                    <div class="setting-description">Color matching brackets for easier identification.</div>
                    <div class="control-group">
                        <select id="editor.bracketPairColorization.enabled" onchange="applySetting('editor.bracketPairColorization.enabled', this.value === 'true')">
                            <option value="true">Enabled (Default & Recommended)</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Word Wrap</span>
                        <span class="setting-key">editor.wordWrap</span>
                    </div>
                    <div class="setting-description">Wrap long lines to avoid horizontal scrolling.</div>
                    <div class="control-group">
                        <select id="editor.wordWrap" onchange="applySetting('editor.wordWrap', this.value)">
                            <option value="off">Off (Default) - Lines will never wrap.</option>
                            <option value="on">On (Recommended) - Lines will wrap at the viewport width.</option>
                            <option value="wordWrapColumn">At Column - Lines will wrap at "Editor: Word Wrap Column".</option>
                            <option value="bounded">Bounded - lines will wrap at minimum of viewport and "Editor: Word wrap Column."</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Accessibility Support</span>
                        <span class="setting-key">editor.accessibilitySupport</span>
                    </div>
                    <div class="setting-description">Optimize VS Code for screen readers and accessibility.</div>
                    <div class="control-group">
                        <select id="editor.accessibilitySupport" onchange="applySetting('editor.accessibilitySupport', this.value)">
                            <option value="auto">Auto (Default) - Use platform APIs to detect when a Screen Reader is attached.</option>
                            <option value="on">On (Recommended) - Optimize for usage with a Screen Reader.</option>
                            <option value="off">Off - Assume a Screen reader is not attached.</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Minimap</span>
                        <span class="setting-key">editor.minimap.enabled</span>
                    </div>
                    <div class="setting-description">Disable inaccessible minimap.</div>
                    <div class="control-group">
                        <select id="editor.minimap.enabled" onchange="applySetting('editor.minimap.enabled', this.value === 'true')">
                            <option value="true">Enabled (Default)</option>
                            <option value="false">Disabled (Recommended)</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Features Group -->
            <div class="group">
                <div class="group-title">
                    <span class="group-icon">⚙️</span>
                    Features
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Terminal Font Size</span>
                        <span class="setting-key">terminal.integrated.fontSize</span>
                    </div>
                    <div class="setting-description">Control terminal font size in pixels. (Default: 14px & Recommended: 16px)</div>
                    <div class="range-container">
                        <input type="range" id="terminal.integrated.fontSize" min="12" max="24" step="1" value="14" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('terminal.integrated.fontSize', parseInt(this.value))">
                        <span class="range-value" id="terminal.integrated.fontSize-value">14px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Terminal Cursor Style</span>
                        <span class="setting-key">terminal.integrated.cursorStyle</span>
                    </div>
                    <div class="setting-description">Control terminal cursor style when terminal is focused.</div>
                    <div class="control-group">
                        <select id="terminal.integrated.cursorStyle" onchange="applySetting('terminal.integrated.cursorStyle', this.value)">
                            <option value="block">Block (Default & Recommended)</option>
                            <option value="line">Line</option>
                            <option value="underline">Underline</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <!-- OTHER SETTINGS -->
        <div class="section">
            <div class="section-header">
                <div>
                    <div class="section-title">🔧 Other Settings</div>
                    <div class="section-description">
                        Additional refinements for comfort and workflow optimization.
                    </div>
                </div>
            </div>

            <!-- Text Editor Group -->
            <div class="group">
                <div class="group-title">
                    <span class="group-icon">📝</span>
                    Text Editor
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Indentation Guides</span>
                        <span class="setting-key">editor.guides.indentation</span>
                    </div>
                    <div class="setting-description">Show vertical lines for indentation levels.</div>
                    <div class="control-group">
                        <select id="editor.guides.indentation" onchange="applySetting('editor.guides.indentation', this.value === 'true')">
                            <option value="true">Enabled (Default & Recommended)</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Bracket Pair Guides</span>
                        <span class="setting-key">editor.guides.bracketPairs</span>
                    </div>
                    <div class="setting-description">Show guides for bracket pairs.</div>
                    <div class="control-group">
                        <select id="editor.guides.bracketPairs" onchange="applySetting('editor.guides.bracketPairs', this.value)">
                            <option value="true">True - Enables bracket pair guides</option>
                            <option value="active">Active (Recommended) - Enables bracket pair guides only for the active bracket pair.</option>
                            <option value="false">False (Defalut) - Disables bracket pair guides.</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Smooth Scrolling</span>
                        <span class="setting-key">editor.smoothScrolling</span>
                    </div>
                    <div class="setting-description">Animate scrolling for smoother motion.</div>
                    <div class="control-group">
                        <select id="editor.smoothScrolling" onchange="applySetting('editor.smoothScrolling', this.value === 'true')">
                            <option value="true">Enabled (Recommended)</option>
                            <option value="false">Disabled (Default)</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Vertical Scrollbar Size</span>
                        <span class="setting-key">editor.scrollbar.verticalScrollbarSize</span>
                    </div>
                    <div class="setting-description">Width of vertical scrollbar. (Default: 14px)</div>
                    <div class="range-container">
                        <input type="range" id="editor.scrollbar.verticalScrollbarSize" min="10" max="30" step="2" value="14" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.scrollbar.verticalScrollbarSize', parseInt(this.value))">
                        <span class="range-value" id="editor.scrollbar.verticalScrollbarSize-value">14px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Horizontal Scrollbar Size</span>
                        <span class="setting-key">editor.scrollbar.horizontalScrollbarSize</span>
                    </div>
                    <div class="setting-description">Height of horizontal scrollbar. (Default: 12px)</div>
                    <div class="range-container">
                        <input type="range" id="editor.scrollbar.horizontalScrollbarSize" min="10" max="30" step="2" value="12" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.scrollbar.horizontalScrollbarSize', parseInt(this.value))">
                        <span class="range-value" id="editor.scrollbar.horizontalScrollbarSize-value">12px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Wrapping Indent</span>
                        <span class="setting-key">editor.wrappingIndent</span>
                    </div>
                    <div class="setting-description">How wrapped lines are indented.</div>
                    <div class="control-group">
                        <select id="editor.wrappingIndent" onchange="applySetting('editor.wrappingIndent', this.value)">
                            <option value="none">None - No indentation. Wrapped lines began at column 1.</option>
                            <option value="same">Same as Line (Default) - Wrapped lines get the same indentation as the parent.</option>
                            <option value="indent">Add Indent - Wrapped lines get + 1 indentation toward the parent.</option>
                            <option value="deepIndent">Deep Indent - Wrapped lines get +2 indentation toward the parent.</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Suggest Font Size</span>
                        <span class="setting-key">editor.suggestFontSize</span>
                    </div>
                    <div class="setting-description">Font size for suggestions. (Defualt: Auto = 0 = Editor font size)</div>
                    <div class="range-container">
                        <input type="range" id="editor.suggestFontSize" min="0" max="24" step="1" value="0" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.suggestFontSize', parseInt(this.value))">
                        <span class="range-value" id="editor.suggestFontSize-value">0</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Suggest Line Height</span>
                        <span class="setting-key">editor.suggestLineHeight</span>
                    </div>
                    <div class="setting-description">Line height for suggestions. (Default: Auto = 0 = Editor line height)</div>
                    <div class="range-container">
                        <input type="range" id="editor.suggestLineHeight" min="0" max="8" step="0.1" value="0" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.suggestLineHeight', parseInt(this.value))">
                        <span class="range-value" id="editor.suggestLineHeight-value">0</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Inlay Hints</span>
                        <span class="setting-key">editor.inlayHints.enabled</span>
                    </div>
                    <div class="setting-description">Show inline type hints and parameter names.</div>
                    <div class="control-group">
                        <select id="editor.inlayHints.enabled" onchange="applySetting('editor.inlayHints.enabled', this.value)">
                            <option value="on">On (Default) - Inlay hints are enabled.</option>
                            <option value="onUnlessPressed">Hide on Ctrl+Alt - Inlay hints are showing by default and hide when holding Ctrl+Alt.</option>                            
                            <option value="offUnlessPressed">Show on Ctrl+Alt - Inlay hints are hidden by default and show when holding Ctrl+Alt.</option>
                            <option value="off">Off (Recommended) - Inlay hints are disabled.</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Parameter Hints</span>
                        <span class="setting-key">editor.parameterHints.enabled</span>
                    </div>
                    <div class="setting-description">Show parameter hints while typin.g</div>
                    <div class="control-group">
                        <select id="editor.parameterHints.enabled" onchange="applySetting('editor.parameterHints.enabled', this.value === 'true')">
                            <option value="true">Enabled (Default & Recommended)</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Hover</span>
                        <span class="setting-key">editor.hover.enabled</span>
                    </div>
                    <div class="setting-description">Show hover information.</div>
                    <div class="control-group">
                        <select id="editor.hover.enabled" onchange="applySetting('editor.hover.enabled', this.value === 'true')">
                            <option value="true">Enable (Default & Recommended)</option>
                            <option value="false">Disabled</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Workbench Group -->
            <div class="group">
                <div class="group-title">
                    <span class="group-icon">🎨</span>
                    Workbench
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Preferred Dark Theme</span>
                        <span class="setting-key">workbench.preferredDarkColorTheme</span>
                    </div>
                    <div class="setting-description">Default theme for dark mode.</div>
                    <div class="control-group">
                        <select id="workbench.preferredDarkColorTheme" onchange="applySetting('workbench.preferredDarkColorTheme', this.value)">
                            <option value="Default Dark Modern">VS Code Dark Modern (Default)</option>
                            <option value="GitHub Dark Default (Low Vision)">GitHub Dark Default</option>
                            <option value="GitHub Dark Colorblind (Beta) (Low Vision)">GitHub Dark Colorblind</option>
                            <option value="GitHub Dark Dimmed (Low Vision)">GitHub Dark Dimmed</option>
                            <option value="GitHub Dark (Low Vision)">GitHub Dark Legacy</option>
                            <option disabled>────────────────────</option>
                            <option value="Default High Contrast">VS Code Derk High Contrast</option>
                            <option value="GitHub Dark High Contrast (Low Vision)">GitHub Dark High Contrast</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Preferred Light Theme</span>
                        <span class="setting-key">workbench.preferredLightColorTheme</span>
                    </div>
                    <div class="setting-description">Default theme for light mode.</div>
                    <div class="control-group">
                        <select id="workbench.preferredLightColorTheme" onchange="applySetting('workbench.preferredLightColorTheme', this.value)">
                            <option value="Default Light Modern">VS Code Light Modern (Default)</option>
                            <option value="GitHub Light Default (Low Vision)">GitHub Light Default</option>
                            <option value="GitHub Light Colorblind (Beta) (Low Vision)">GitHub Light Colorblind</option>
                            <option value="GitHub Light (Low Vision)">GitHub Light Legacy</option>
                            <option disabled>────────────────────</option>
                            <option value="Default High Contrast Light">VS Code Light High Contrast</option>
                            <option value="GitHub Light High Contrast (Low Vision)">GitHub Light High Contrast</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Preferred High Contrast Theme</span>
                        <span class="setting-key">workbench.preferredHighContrastColorTheme</span>
                    </div>
                    <div class="setting-description">Default theme for high contrast mode.</div>
                    <div class="control-group">
                        <select id="workbench.preferredHighContrastColorTheme" onchange="applySetting('workbench.preferredHighContrastColorTheme', this.value)">
                            <option value="Default High Contrast">VS Code Derk High Contrast (Default)</option>
                            <option value="Default High Contrast Light">VS Code Light High Contrast</option>
                            <option value="GitHub Dark High Contrast (Low Vision)">GitHub Dark High Contrast</option>    
                            <option value="GitHub Light High Contrast (Low Vision)">GitHub Light High Contrast</option>                            
                        </select>
                    </div>
                </div>
            </div>

            <!-- Features Group -->
            <div class="group">
                <div class="group-title">
                    <span class="group-icon">⚙️</span>
                    Features
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Terminal Line Height</span>
                        <span class="setting-key">terminal.integrated.lineHeight</span>
                    </div>
                    <div class="setting-description">This number is mutiplied by the terminal font size to get the actual line height in pixels. (Default: 1.0)</div>
                    <div class="range-container">
                        <input type="range" id="terminal.integrated.lineHeight" min="1" max="2" step="0.1" value="1" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('terminal.integrated.lineHeight', parseFloat(this.value))">
                        <span class="range-value" id="terminal.integrated.lineHeight-value">1.0</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Terminal Cursor Blinking</span>
                        <span class="setting-key">terminal.integrated.cursorBlinking</span>
                    </div>
                    <div class="setting-description">Terminal cursor blinking style.</div>
                    <div class="control-group">
                        <select id="terminal.integrated.cursorBlinking" onchange="applySetting('terminal.integrated.cursorBlinking', this.value === 'true')">
                            <option value="true">Enabled (Recomended)</option>
                            <option value="false">Disabled (Default)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        // Track settings we just sent to VS Code to avoid UI reverting to stale values
        const pendingUpdates = {};

        // Request current settings on load
        window.addEventListener('load', () => {
            vscode.postMessage({ command: 'getCurrentSettings' });
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateSettings') {
                updateUIWithSettings(message.settings);
            }
        });

        function updateUIWithSettings(settings) {
            for (const [key, value] of Object.entries(settings)) {
                // If we have a pending update for this key and the incoming value
                // doesn't match it yet, skip updating the control to avoid flicker
                if (Object.prototype.hasOwnProperty.call(pendingUpdates, key)) {
                    if (pendingUpdates[key] !== value) {
                        // Stale (older) value received; wait for the next update
                        continue;
                    } else {
                        // Values now match; clear the pending state and proceed to update UI
                        delete pendingUpdates[key];
                    }
                }
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'range') {
                        // For range inputs, properly handle numeric values including 0
                        element.value = (value !== null && value !== undefined) ? value : 0;
                        updateRangeValue(element);
                    } else if (element.type === 'number') {
                        // For number inputs
                        element.value = value !== null && value !== undefined ? value : '';
                    } else if (element.tagName === 'SELECT' && (value === true || value === false)) {
                        // For boolean dropdowns
                        element.value = value.toString();
                    } else if (element.tagName === 'SELECT') {
                        // For string dropdowns (e.g., editor.fontFamily), set exact value when available
                        element.value = value ?? '';
                    } else {
                        element.value = value || '';
                    }
                }
            }
        }

        function applySetting(key, value) {
            const settings = { [key]: value };
            // Mark this setting as pending so incoming stale update messages don't override UI
            pendingUpdates[key] = value;
            vscode.postMessage({
                command: 'applySettings',
                settings: settings
            });
        }

        function applyRecommended() {
            vscode.postMessage({ command: 'applyRecommended' });
        }

        function resetAllSettings() {
            const allSettings = [
                // Quick Settings
                'workbench.colorTheme',
                'window.zoomLevel',
                'editor.fontFamily',
                'editor.fontSize',
                'editor.lineHeight',
                'editor.letterSpacing',
                'editor.mouseWheelZoom',
                'editor.cursorStyle',
                'editor.cursorBlinking',
                'editor.matchBrackets',
                'editor.bracketPairColorization.enabled',
                'editor.wordWrap',
                'editor.accessibilitySupport',
                'editor.minimap.enabled',
                'terminal.integrated.fontSize',
                'terminal.integrated.cursorStyle',
                // Other Settings
                'editor.guides.indentation',
                'editor.guides.bracketPairs',
                'editor.smoothScrolling',
                'editor.scrollbar.verticalScrollbarSize',
                'editor.scrollbar.horizontalScrollbarSize',
                'editor.wrappingIndent',
                'editor.suggestFontSize',
                'editor.suggestLineHeight',
                'editor.inlayHints.enabled',
                'editor.parameterHints.enabled',
                'editor.hover.enabled',
                'workbench.preferredDarkColorTheme',
                'workbench.preferredLightColorTheme',
                'workbench.preferredHighContrastColorTheme',
                'terminal.integrated.lineHeight',
                'terminal.integrated.cursorBlinking'
            ];
            vscode.postMessage({
                command: 'resetSettings',
                settingKeys: allSettings
            });
        }

        function updateRangeValue(element) {
            const valueSpan = document.getElementById(element.id + '-value');
            if (valueSpan) {
                let value = parseFloat(element.value);
                let displayValue = value;
                
                // Special formatting for specific settings
                if (element.id.includes('FontSize') || element.id.includes('ScrollbarSize')) {
                    displayValue = value === 0 ? 'Auto' : value + 'px';
                } else if (element.id.includes('LineHeight')) {
                    displayValue = value === 0 ? 'Auto' : value.toFixed(1);
                } else if (element.id.includes('LetterSpacing')) {
                    displayValue = value + 'px';
                } else if (element.id === 'window.zoomLevel') {
                    displayValue = value.toFixed(1);
                }
                
                valueSpan.textContent = displayValue;
            }
        }
    </script>
</body>
</html>`;
    }
}
