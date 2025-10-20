import * as vscode from 'vscode';

/**
 * Manages the Accessibility Settings Panel webview
 */
export class AccessibilityPanel {
    public static currentPanel: AccessibilityPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'applySettings':
                        this._applySettings(message.settings);
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

    private _applySettings(settings: { [key: string]: any }) {
        const config = vscode.workspace.getConfiguration();
        
        for (const [key, value] of Object.entries(settings)) {
            try {
                config.update(key, value, vscode.ConfigurationTarget.Global);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to update ${key}: ${error}`);
            }
        }
        
        vscode.window.showInformationMessage('Settings applied successfully!');
        // Refresh the current settings display
        this._sendCurrentSettings();
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
            // Workbench
            'workbench.colorTheme': 'GitHub Dark High Contrast (Low Vision)',
            
            // Window
            'window.zoomLevel': 1,
            
            // Text Editor
            'editor.fontFamily': "'Atkinson Hyperlegible Mono', Consolas, 'Courier New', monospace",
            'editor.fontSize': 16,
            'editor.lineHeight': 1.6,
            'editor.letterSpacing': 0.5,
            'editor.mouseWheelZoom': true,
            'editor.cursorStyle': 'block',
            'editor.cursorBlinking': 'solid',
            'editor.matchBrackets': 'always',
            'editor.bracketPairColorization.enabled': true,
            'editor.wordWrap': 'on',
            'editor.accessibilitySupport': 'on',
            'editor.minimap.enabled': false,
            
            // Terminal
            'terminal.integrated.fontSize': 16,
            'terminal.integrated.cursorStyle': 'block'
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
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border);
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .btn-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
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
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
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
        }

        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus {
            outline: 1px solid var(--vscode-focusBorder);
            outline-offset: -1px;
        }

        input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
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
        <p class="subtitle">Customize Visual Studio Code for optimal readability and comfort</p>

        <div class="action-bar">
            <button class="btn btn-primary" onclick="applyRecommended()">
                ✨ Apply Recommended Settings
            </button>
            <button class="btn btn-secondary" onclick="resetAllQuickSettings()">
                🔄 Reset Quick Settings
            </button>
            <button class="btn btn-secondary" onclick="resetAllOtherSettings()">
                🔄 Reset Other Settings
            </button>
        </div>

        <!-- QUICK SETTINGS -->
        <div class="section">
            <div class="section-header">
                <div>
                    <div class="section-title">⚡ Quick Settings</div>
                    <div class="section-description">
                        High-impact settings for immediate readability and visual comfort
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
                        <span class="setting-label">Color Theme<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">workbench.colorTheme</span>
                    </div>
                    <div class="setting-description">Choose a high-contrast theme optimized for low vision</div>
                    <div class="control-group">
                        <select id="workbench.colorTheme" onchange="applySetting('workbench.colorTheme', this.value)">
                            <option value="GitHub Light Default (Low Vision)">GitHub Light Default</option>
                            <option value="GitHub Light High Contrast (Low Vision)">GitHub Light High Contrast</option>
                            <option value="GitHub Light Colorblind (Beta) (Low Vision)">GitHub Light Colorblind</option>
                            <option value="GitHub Dark Default (Low Vision)">GitHub Dark Default</option>
                            <option value="GitHub Dark High Contrast (Low Vision)">GitHub Dark High Contrast</option>
                            <option value="GitHub Dark Colorblind (Beta) (Low Vision)">GitHub Dark Colorblind</option>
                            <option value="GitHub Dark Dimmed (Low Vision)">GitHub Dark Dimmed</option>
                            <option value="GitHub Light (Low Vision)">GitHub Light (Legacy)</option>
                            <option value="GitHub Dark (Low Vision)">GitHub Dark (Legacy)</option>
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
                        <span class="setting-label">Zoom Level<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">window.zoomLevel</span>
                    </div>
                    <div class="setting-description">Zoom the entire VS Code interface</div>
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
                        <span class="setting-label">Font Family<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.fontFamily</span>
                    </div>
                    <div class="setting-description">Use Atkinson Hyperlegible Mono for better readability</div>
                    <div class="control-group">
                        <select id="editor.fontFamily" onchange="applySetting('editor.fontFamily', this.value)">
                            <option value="'Atkinson Hyperlegible Mono', Consolas, 'Courier New', monospace">Atkinson Hyperlegible Mono (Recommended)</option>
                            <option value="Consolas, 'Courier New', monospace">System Default</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Font Size<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.fontSize</span>
                    </div>
                    <div class="setting-description">Larger font size for better readability (recommended: 16px)</div>
                    <div class="range-container">
                        <input type="range" id="editor.fontSize" min="12" max="24" step="1" value="14" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.fontSize', parseInt(this.value))">
                        <span class="range-value" id="editor.fontSize-value">14px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Line Height<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.lineHeight</span>
                    </div>
                    <div class="setting-description">Space between lines (recommended: 1.6)</div>
                    <div class="range-container">
                        <input type="range" id="editor.lineHeight" min="1" max="2.5" step="0.1" value="0" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.lineHeight', parseFloat(this.value) || 0)">
                        <span class="range-value" id="editor.lineHeight-value">Auto</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Letter Spacing<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.letterSpacing</span>
                    </div>
                    <div class="setting-description">Space between characters (recommended: 0.5px)</div>
                    <div class="range-container">
                        <input type="range" id="editor.letterSpacing" min="0" max="2" step="0.1" value="0" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.letterSpacing', parseFloat(this.value))">
                        <span class="range-value" id="editor.letterSpacing-value">0px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Mouse Wheel Zoom<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.mouseWheelZoom</span>
                    </div>
                    <div class="setting-description">Zoom text with Ctrl+MouseWheel</div>
                    <div class="control-group">
                        <input type="checkbox" id="editor.mouseWheelZoom" onchange="applySetting('editor.mouseWheelZoom', this.checked)">
                        <label for="editor.mouseWheelZoom">Enable</label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Cursor Style<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.cursorStyle</span>
                    </div>
                    <div class="setting-description">Block cursor is more visible</div>
                    <div class="control-group">
                        <select id="editor.cursorStyle" onchange="applySetting('editor.cursorStyle', this.value)">
                            <option value="line">Line</option>
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
                        <span class="setting-label">Cursor Blinking<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.cursorBlinking</span>
                    </div>
                    <div class="setting-description">Solid cursor is easier to locate</div>
                    <div class="control-group">
                        <select id="editor.cursorBlinking" onchange="applySetting('editor.cursorBlinking', this.value)">
                            <option value="blink">Blink</option>
                            <option value="smooth">Smooth</option>
                            <option value="phase">Phase</option>
                            <option value="expand">Expand</option>
                            <option value="solid">Solid (Recommended)</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Match Brackets<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.matchBrackets</span>
                    </div>
                    <div class="setting-description">Highlight matching brackets</div>
                    <div class="control-group">
                        <select id="editor.matchBrackets" onchange="applySetting('editor.matchBrackets', this.value)">
                            <option value="never">Never</option>
                            <option value="near">Near Cursor</option>
                            <option value="always">Always (Recommended)</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Bracket Pair Colorization<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.bracketPairColorization.enabled</span>
                    </div>
                    <div class="setting-description">Color matching brackets for easier identification</div>
                    <div class="control-group">
                        <input type="checkbox" id="editor.bracketPairColorization.enabled" onchange="applySetting('editor.bracketPairColorization.enabled', this.checked)">
                        <label for="editor.bracketPairColorization.enabled">Enable</label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Word Wrap<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.wordWrap</span>
                    </div>
                    <div class="setting-description">Wrap long lines to avoid horizontal scrolling</div>
                    <div class="control-group">
                        <select id="editor.wordWrap" onchange="applySetting('editor.wordWrap', this.value)">
                            <option value="off">Off</option>
                            <option value="on">On (Recommended)</option>
                            <option value="wordWrapColumn">At Column</option>
                            <option value="bounded">Bounded</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Accessibility Support<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.accessibilitySupport</span>
                    </div>
                    <div class="setting-description">Optimize for screen readers and accessibility</div>
                    <div class="control-group">
                        <select id="editor.accessibilitySupport" onchange="applySetting('editor.accessibilitySupport', this.value)">
                            <option value="auto">Auto</option>
                            <option value="on">On (Recommended)</option>
                            <option value="off">Off</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Minimap<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">editor.minimap.enabled</span>
                    </div>
                    <div class="setting-description">Disable minimap for cleaner interface</div>
                    <div class="control-group">
                        <input type="checkbox" id="editor.minimap.enabled" onchange="applySetting('editor.minimap.enabled', this.checked)">
                        <label for="editor.minimap.enabled">Enable</label>
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
                        <span class="setting-label">Terminal Font Size<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">terminal.integrated.fontSize</span>
                    </div>
                    <div class="setting-description">Terminal font size (recommended: 16px)</div>
                    <div class="range-container">
                        <input type="range" id="terminal.integrated.fontSize" min="12" max="24" step="1" value="14" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('terminal.integrated.fontSize', parseInt(this.value))">
                        <span class="range-value" id="terminal.integrated.fontSize-value">14px</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Terminal Cursor Style<span class="recommended-badge">RECOMMENDED</span></span>
                        <span class="setting-key">terminal.integrated.cursorStyle</span>
                    </div>
                    <div class="setting-description">Terminal cursor style</div>
                    <div class="control-group">
                        <select id="terminal.integrated.cursorStyle" onchange="applySetting('terminal.integrated.cursorStyle', this.value)">
                            <option value="line">Line</option>
                            <option value="block">Block (Recommended)</option>
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
                        Additional refinements for comfort and workflow optimization
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
                    <div class="setting-description">Show vertical lines for indentation levels</div>
                    <div class="control-group">
                        <input type="checkbox" id="editor.guides.indentation" onchange="applySetting('editor.guides.indentation', this.checked)">
                        <label for="editor.guides.indentation">Enable</label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Bracket Pair Guides</span>
                        <span class="setting-key">editor.guides.bracketPairs</span>
                    </div>
                    <div class="setting-description">Show guides for bracket pairs</div>
                    <div class="control-group">
                        <select id="editor.guides.bracketPairs" onchange="applySetting('editor.guides.bracketPairs', this.value)">
                            <option value="false">Off</option>
                            <option value="active">Active Only</option>
                            <option value="true">Always</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Smooth Scrolling</span>
                        <span class="setting-key">editor.smoothScrolling</span>
                    </div>
                    <div class="setting-description">Animate scrolling for smoother motion</div>
                    <div class="control-group">
                        <input type="checkbox" id="editor.smoothScrolling" onchange="applySetting('editor.smoothScrolling', this.checked)">
                        <label for="editor.smoothScrolling">Enable</label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Vertical Scrollbar Size</span>
                        <span class="setting-key">editor.scrollbar.verticalScrollbarSize</span>
                    </div>
                    <div class="setting-description">Width of vertical scrollbar (default: 14px)</div>
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
                    <div class="setting-description">Height of horizontal scrollbar (default: 12px)</div>
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
                    <div class="setting-description">How wrapped lines are indented</div>
                    <div class="control-group">
                        <select id="editor.wrappingIndent" onchange="applySetting('editor.wrappingIndent', this.value)">
                            <option value="none">None</option>
                            <option value="same">Same as Line</option>
                            <option value="indent">Add Indent</option>
                            <option value="deepIndent">Deep Indent</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Suggest Font Size</span>
                        <span class="setting-key">editor.suggestFontSize</span>
                    </div>
                    <div class="setting-description">Font size for suggestions (0 = editor font size)</div>
                    <div class="range-container">
                        <input type="range" id="editor.suggestFontSize" min="0" max="24" step="1" value="0" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.suggestFontSize', parseInt(this.value))">
                        <span class="range-value" id="editor.suggestFontSize-value">Auto</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Suggest Line Height</span>
                        <span class="setting-key">editor.suggestLineHeight</span>
                    </div>
                    <div class="setting-description">Line height for suggestions (0 = editor line height)</div>
                    <div class="range-container">
                        <input type="range" id="editor.suggestLineHeight" min="0" max="40" step="2" value="0" 
                               oninput="updateRangeValue(this)" 
                               onchange="applySetting('editor.suggestLineHeight', parseInt(this.value))">
                        <span class="range-value" id="editor.suggestLineHeight-value">Auto</span>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Inlay Hints</span>
                        <span class="setting-key">editor.inlayHints.enabled</span>
                    </div>
                    <div class="setting-description">Show inline type hints and parameter names</div>
                    <div class="control-group">
                        <select id="editor.inlayHints.enabled" onchange="applySetting('editor.inlayHints.enabled', this.value)">
                            <option value="on">On</option>
                            <option value="off">Off</option>
                            <option value="offUnlessPressed">Show on Ctrl+Alt</option>
                            <option value="onUnlessPressed">Hide on Ctrl+Alt</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Parameter Hints</span>
                        <span class="setting-key">editor.parameterHints.enabled</span>
                    </div>
                    <div class="setting-description">Show parameter hints while typing</div>
                    <div class="control-group">
                        <input type="checkbox" id="editor.parameterHints.enabled" onchange="applySetting('editor.parameterHints.enabled', this.checked)">
                        <label for="editor.parameterHints.enabled">Enable</label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Hover</span>
                        <span class="setting-key">editor.hover.enabled</span>
                    </div>
                    <div class="setting-description">Show hover information</div>
                    <div class="control-group">
                        <input type="checkbox" id="editor.hover.enabled" onchange="applySetting('editor.hover.enabled', this.checked)">
                        <label for="editor.hover.enabled">Enable</label>
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
                    <div class="setting-description">Default theme for dark mode</div>
                    <div class="control-group">
                        <select id="workbench.preferredDarkColorTheme" onchange="applySetting('workbench.preferredDarkColorTheme', this.value)">
                            <option value="">System Default</option>
                            <option value="GitHub Dark Default (Low Vision)">GitHub Dark Default</option>
                            <option value="GitHub Dark High Contrast (Low Vision)">GitHub Dark High Contrast</option>
                            <option value="GitHub Dark Colorblind (Beta) (Low Vision)">GitHub Dark Colorblind</option>
                            <option value="GitHub Dark Dimmed (Low Vision)">GitHub Dark Dimmed</option>
                            <option value="GitHub Dark (Low Vision)">GitHub Dark (Legacy)</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Preferred Light Theme</span>
                        <span class="setting-key">workbench.preferredLightColorTheme</span>
                    </div>
                    <div class="setting-description">Default theme for light mode</div>
                    <div class="control-group">
                        <select id="workbench.preferredLightColorTheme" onchange="applySetting('workbench.preferredLightColorTheme', this.value)">
                            <option value="">System Default</option>
                            <option value="GitHub Light Default (Low Vision)">GitHub Light Default</option>
                            <option value="GitHub Light High Contrast (Low Vision)">GitHub Light High Contrast</option>
                            <option value="GitHub Light Colorblind (Beta) (Low Vision)">GitHub Light Colorblind</option>
                            <option value="GitHub Light (Low Vision)">GitHub Light (Legacy)</option>
                        </select>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-header">
                        <span class="setting-label">Preferred High Contrast Theme</span>
                        <span class="setting-key">workbench.preferredHighContrastColorTheme</span>
                    </div>
                    <div class="setting-description">Default theme for high contrast mode</div>
                    <div class="control-group">
                        <select id="workbench.preferredHighContrastColorTheme" onchange="applySetting('workbench.preferredHighContrastColorTheme', this.value)">
                            <option value="">System Default</option>
                            <option value="GitHub Light High Contrast (Low Vision)">GitHub Light High Contrast</option>
                            <option value="GitHub Dark High Contrast (Low Vision)">GitHub Dark High Contrast</option>
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
                    <div class="setting-description">Line height in terminal (1.0 = normal)</div>
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
                    <div class="setting-description">Terminal cursor blinking style</div>
                    <div class="control-group">
                        <input type="checkbox" id="terminal.integrated.cursorBlinking" onchange="applySetting('terminal.integrated.cursorBlinking', this.checked)">
                        <label for="terminal.integrated.cursorBlinking">Enable</label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

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
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value || false;
                    } else if (element.type === 'range') {
                        element.value = value || 0;
                        updateRangeValue(element);
                    } else {
                        element.value = value || '';
                    }
                }
            }
        }

        function applySetting(key, value) {
            const settings = { [key]: value };
            vscode.postMessage({
                command: 'applySettings',
                settings: settings
            });
        }

        function applyRecommended() {
            vscode.postMessage({ command: 'applyRecommended' });
        }

        function resetAllQuickSettings() {
            const quickSettings = [
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
                'terminal.integrated.cursorStyle'
            ];
            
            vscode.postMessage({
                command: 'resetSettings',
                settingKeys: quickSettings
            });
        }

        function resetAllOtherSettings() {
            const otherSettings = [
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
                settingKeys: otherSettings
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
