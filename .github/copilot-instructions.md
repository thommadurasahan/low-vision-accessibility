<!-- .github/copilot-instructions.md -->

# Guidance for AI coding agents — low-vision-accessibility

This file provides actionable instructions for AI assistants working on this VS Code extension for developers with low vision.

## Project Overview

**Goal**: A VS Code extension that combines accessible color themes, Atkinson Hyperlegible font, and a custom settings control panel to improve visibility and productivity for developers with low vision.

**Architecture**:
- **Themes**: 9 GitHub-based themes (light/dark variations with high contrast and colorblind support) in `themes/`, generated from `external/github-vscode-theme` (git submodule pointing to https://github.com/thommadurasahan/github-vscode-theme.git)
- **Fonts**: Atkinson Hyperlegible Next Mono font files copied from `external/atkinson-hyperlegible-next-mono` (git submodule pointing to https://github.com/thommadurasahan/atkinson-hyperlegible-next-mono.git) to `assets/fonts/`
- **Extension Core**: `src/extension.ts` — activation logic, command handlers, font installation prompt (TypeScript compiled to `out/extension.js`)
- **Settings Panel**: `src/panel/AccessibilityPanel.ts` — Webview-based settings control panel with comprehensive accessibility options

## Core Features (Implementation Status)

✅ **Color Theme Pack** — 9 themes registered in `package.json`, JSONs auto-generated via `npm run build:themes`
  - GitHub Light Default, Light High Contrast, Light Colorblind
  - GitHub Dark Default, Dark High Contrast, Dark Colorblind, Dark Dimmed
  - GitHub Light Legacy, GitHub Dark Legacy

✅ **Font Pack** — Atkinson Hyperlegible Next Mono TTF files in `assets/fonts/`, copied via `npm run build:fonts`
  - Font install prompt on first activation
  - Command to open fonts folder for manual installation

✅ **Accessibility Settings Panel** — Fully implemented Webview panel in `src/panel/AccessibilityPanel.ts`
  - **Quick Settings**: 15+ high-impact settings (theme, zoom, font, cursor, terminal)
  - **Other Settings**: 15+ refinement settings (guides, scrollbars, workbench themes, accessibility features)
  - **Apply Recommended Config**: One-click button with optimized low-vision settings
  - **Reset Functionality**: Reset all settings to VS Code defaults
  - **Real-time Updates**: Settings apply immediately with debounced config change listener (300ms)
  - **Singleton Pattern**: Panel reuses existing instance when reopened
  - **Responsive UI**: Clean interface using VS Code CSS variables

✅ **Commands**
  - `low-vision-accessibility.openAccessibilityPanel` — Opens the settings panel
  - `low-vision-accessibility.openFontsFolder` — Reveals fonts folder in file explorer

## Critical Commands & Workflows

### Build & Development
```powershell
npm run compile          # Compile TypeScript (tsc -p ./) → out/
npm run watch            # Watch mode for src/*.ts changes
npm run build:themes     # Generate themes from external/github-vscode-theme
npm run build:fonts      # Copy fonts from external/atkinson-hyperlegible-next-mono
npm run build:all        # Build both themes and fonts
npm run lint             # Run ESLint on src/
npm test                 # Run tests via @vscode/test-cli
```

### Theme Build Pipeline
1. `scripts/build-github-theme.js` runs `npm install` in `external/github-vscode-theme/` (if needed)
2. Executes `npm run build` in that directory → generates `external/github-vscode-theme/themes/*.json`
3. Copies all JSONs to `./themes/` (these are .gitignored; only package.json theme paths are tracked)

### Font Build Pipeline
1. `scripts/build-fonts.js` reads TTF files from `external/atkinson-hyperlegible-next-mono/fonts/ttf/`
2. Copies all .ttf files to `./assets/fonts/` (these are .gitignored but included in .vsix package)
3. Fonts are ready to be referenced in the settings panel via `editor.fontFamily`

### Testing the Extension
Press `F5` in VS Code → opens Extension Development Host with extension loaded. Test commands via Command Palette (`Ctrl+Shift+P`).

## Project Conventions

**Activation**: Extension activates on `onStartupFinished` (see `package.json.activationEvents`). On first activation, shows a one-time prompt to install the Atkinson Hyperlegible Mono font.

**Command Pattern**: All commands start with `low-vision-accessibility.` prefix. Register in `package.json.contributes.commands` AND implement in `src/extension.ts` via `vscode.commands.registerCommand()`.

**Theme Naming**: Follow pattern `GitHub <Variant> (Low Vision)`, e.g., `GitHub Dark High Contrast (Low Vision)`. Map to correct `uiTheme` type (`vs`, `vs-dark`, `hc-light`, `hc-black`).

**Settings Management**: AccessibilityPanel uses `vscode.workspace.getConfiguration()` to read/write settings. All updates target `ConfigurationTarget.Global` (User settings). Panel tracks pending updates to avoid UI flicker during config changes.

**DO NOT** edit `external/github-vscode-theme/` directly — it's a git submodule. Modify `scripts/build-github-theme.js` if theme build needs changes.

## Where to Make Changes

### Add a New Command
1. Add entry to `package.json.contributes.commands` with unique `command` ID and `title`
2. Implement handler in `src/extension.ts` via `vscode.commands.registerCommand()`
3. Push disposable to `context.subscriptions`
4. Run `npm run compile` before testing

### Modify the Settings Panel
The AccessibilityPanel is fully implemented with:
- **Singleton Pattern**: `AccessibilityPanel.createOrShow()` reuses existing panel or creates new one
- **Message Handling**: Webview communicates via `postMessage()` for settings updates
- **Settings Categories**:
  - **Quick Settings**: 15+ high-impact controls (theme, zoom, font family, font size, line height, letter spacing, cursor style, bracket matching, word wrap, minimap, terminal)
  - **Other Settings**: 15+ refinement controls (guides, scrollbars, wrapping indent, suggestions, inlay hints, preferred themes, terminal line height)
- **Debounced Updates**: Config changes trigger UI refresh after 300ms to avoid rapid updates
- **Recommended Preset**: Hardcoded optimal settings for low vision (16px font, block cursor, word wrap on, etc.)
- **Reset Functionality**: Resets settings to VS Code defaults by setting values to `undefined`

To add a new setting:
1. Add control HTML in `_getHtmlForWebview()` method
2. Add setting key to `currentSettings` object in `_sendCurrentSettings()`
3. Handle in `applySetting()` JavaScript function in webview
4. Test that setting applies and persists correctly

### Font Installation Flow
✅ **Implemented**: Font installation prompt appears on first activation
- Uses `context.globalState` to track if prompt has been shown (`lowVision.fontInstallPromptShown`)
- Provides three options:
  1. **Install Font Now**: Opens fonts folder in file explorer with .ttf files
  2. **How to Install**: Opens GitHub repo with font documentation
  3. **Don't show again**: Marks prompt as shown permanently
- Font files are bundled in `assets/fonts/` (TTF format)
- Users can manually trigger prompt via `low-vision-accessibility.openFontsFolder` command
- Panel includes font family selector: "Atkinson Hyperlegible Mono" or "Consolas (Default)"

### Update Themes
- Rebuild themes: `npm run build:themes` (requires network on first run)
- Theme JSON schema: [VS Code Color Theme](https://code.visualstudio.com/api/references/theme-color)
- Do NOT manually edit `themes/*.json` — they are auto-generated

## Dependencies & Integration

**External Theme Repo**: `external/github-vscode-theme` is a git submodule pointing to https://github.com/thommadurasahan/github-vscode-theme.git. Run `git submodule update --init` if folder is empty.

**Font Repo**: `external/atkinson-hyperlegible-next-mono` is a git submodule pointing to https://github.com/thommadurasahan/atkinson-hyperlegible-next-mono.git. Run `git submodule update --init` if folder is empty.

**VS Code APIs**: Extension uses `vscode` module. Key namespaces:
- `vscode.commands` — register commands
- `vscode.workspace.getConfiguration()` — read/write user settings
- `vscode.window.createWebviewPanel()` — create settings UI webview
- `vscode.workspace.onDidChangeConfiguration()` — listen for config changes
- `vscode.workspace.fs` — access file system for fonts
- `vscode.env.openExternal()` — open URLs in browser

## Testing & Debugging

**Run Tests**: `npm test` — uses `@vscode/test-electron` to run `src/test/extension.test.ts`. Current test is a placeholder; add tests for command execution and settings updates.

**Debug**: Use `.vscode/launch.json` → "Run Extension" configuration. Sets breakpoints in `src/extension.ts`.

## Accessibility Compliance Notes

- Ensure all theme contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Webview UI must include ARIA labels for screen reader support
- Font size should default to 14px+ for readability
- Command names should be descriptive for Command Palette discoverability

## Common Pitfalls

- **Missing themes folder**: Run `npm run build:themes` if `themes/*.json` are missing (they're gitignored)
- **Activation event confusion**: Extension activates on startup, not just when command is invoked
- **Forgetting to compile**: Always run `npm run compile` after editing TypeScript before testing
- **Breaking theme schema**: Reference existing theme JSONs in `themes/` for structure

## Files to Inspect for Feature Work

| Feature | Files |
|---------|-------|
| Add/modify commands | `package.json`, `src/extension.ts` |
| Theme generation | `scripts/build-github-theme.js`, `external/github-vscode-theme/` |
| Font copying | `scripts/build-fonts.js`, `external/atkinson-hyperlegible-next-mono/` |
| Settings panel | `src/panel/AccessibilityPanel.ts` |
| Font integration | `assets/fonts/`, `src/extension.ts` (prompt logic) |
| Tests | `src/test/extension.test.ts` |

## Questions to Clarify with Repository Owner

- ✅ Font format decided: TTF files bundled in `assets/fonts/`
- ✅ Webview framework: Vanilla HTML/CSS/JS (no framework dependencies)
- ✅ Recommended settings: Hardcoded in `_applyRecommendedSettings()` method
- Should the extension be published to VS Marketplace or distributed as `.vsix`?
- Are there additional accessibility settings to include in future updates?

---

**Remember**: This extension is designed for accessibility first — prioritize clarity, high contrast, and usability in all implementations.
