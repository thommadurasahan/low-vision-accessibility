<!-- .github/copilot-instructions.md -->

# Guidance for AI coding agents — low-vision-accessibility

This file provides actionable instructions for AI assistants working on this VS Code extension for developers with low vision.

## Project Overview

**Goal**: A VS Code extension that combines accessible color themes, Atkinson Hyperlegible font, and a custom settings control panel to improve visibility and productivity for developers with low vision.

**Architecture**:
- **Themes**: 9 GitHub-based themes (light/dark variations with high contrast and colorblind support) in `themes/`, generated from `external/github-vscode-theme` (git submodule pointing to https://github.com/thommadurasahan/github-vscode-theme.git)
- **Fonts**: Atkinson Hyperlegible Next Mono font files copied from `external/atkinson-hyperlegible-next-mono` (git submodule pointing to https://github.com/thommadurasahan/atkinson-hyperlegible-next-mono.git) to `assets/fonts/`
- **Extension Core**: `src/extension.ts` — activation logic, command handlers (TypeScript compiled to `out/extension.js`)
- **Planned Features**: Custom Webview settings panel (not yet implemented)

## Core Features (Implementation Status)

✅ **Color Theme Pack** — 9 themes registered in `package.json`, JSONs auto-generated via `npm run build:themes`
✅ **Font Pack** — Atkinson Hyperlegible Next Mono TTF files in `assets/fonts/`, copied via `npm run build:fonts`
✅ **Accessibility Settings Panel** — Webview panel implemented in `src/panel/AccessibilityPanel.ts` with Quick Settings and Other Settings sections

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

**Activation**: Extension activates on `onStartupFinished` (see `package.json.activationEvents`). The `openAccessibilityPanel` command is registered but shows a placeholder message.

**Command Pattern**: All commands start with `low-vision-accessibility.` prefix. Register in `package.json.contributes.commands` AND implement in `src/extension.ts` via `vscode.commands.registerCommand()`.

**Theme Naming**: Follow pattern `GitHub <Variant> (Low Vision)`, e.g., `GitHub Dark High Contrast (Low Vision)`. Map to correct `uiTheme` type (`vs`, `vs-dark`, `hc-light`, `hc-black`).

**DO NOT** edit `external/github-vscode-theme/` directly — it's a git submodule. Modify `scripts/build-github-theme.js` if theme build needs changes.

## Where to Make Changes

### Add a New Command
1. Add entry to `package.json.contributes.commands` with unique `command` ID and `title`
2. Implement handler in `src/extension.ts` via `vscode.commands.registerCommand()`
3. Push disposable to `context.subscriptions`
4. Run `npm run compile` before testing

### Implement the Settings Panel (COMPLETED ✅)
- ✅ Created `src/panel/AccessibilityPanel.ts` as a Webview
- ✅ Integrated with `extension.ts` via `openAccessibilityPanel` command
- Panel features:
  - **Quick Settings**: High-impact settings (theme, zoom, font, editor basics, terminal)
  - **Other Settings**: Additional refinements (guides, scrollbars, workbench preferences, accessibility features)
  - **Grouped Controls**: Organized by Workbench, Window, Text Editor, and Features
  - **Apply Recommended Config** button: One-click setup for low vision users
  - **Reset Buttons**: Separate reset for Quick Settings and Other Settings
  - **Real-time Updates**: Settings apply immediately via VS Code API
  - **Responsive UI**: Clean, high-contrast interface following VS Code design

### Add Font Support (TODO)
1. ✅ Font files already available in `assets/fonts/` (run `npm run build:fonts` to copy)
2. In settings panel, set `editor.fontFamily` to `'Atkinson Hyperlegible Mono'` when user selects font
3. Provide toggle to restore original font
4. Note: VS Code will automatically find and use fonts from the extension's assets folder once installed

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
- `vscode.window.createWebviewPanel()` — for settings UI (to be implemented)

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
| Settings panel | `src/panel/AccessibilityPanel.ts` (TO BE CREATED) |
| Font integration | `assets/fonts/` (TO BE CREATED), settings panel logic |
| Tests | `src/test/extension.test.ts` |

## Questions to Clarify with Repository Owner

- Should Atkinson Hyperlegible font be bundled as WOFF2 or TTF? Any licensing considerations?
- Preferred Webview framework (vanilla HTML/CSS/JS vs. React/Svelte)?
- Should "Recommended Settings" preset be configurable or hardcoded?
- Publish as `.vsix` locally or to VS Marketplace?

---

**Remember**: This extension is designed for accessibility first — prioritize clarity, high contrast, and usability in all implementations.
