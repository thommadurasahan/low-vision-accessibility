<!-- .github/copilot-instructions.md -->

# Guidance for AI coding agents — low-vision-accessibility

This file provides actionable instructions for AI assistants working on this VS Code extension for developers with low vision.

## Project Overview

**Goal**: A VS Code extension that combines accessible color themes, Atkinson Hyperlegible font, and a custom settings control panel to improve visibility and productivity for developers with low vision.

**Architecture**:
- **Themes**: 9 GitHub-based themes (light/dark variations with high contrast and colorblind support) in `themes/`, generated from `external/github-vscode-theme` (git submodule)
- **Extension Core**: `src/extension.ts` — activation logic, command handlers (TypeScript compiled to `out/extension.js`)
- **Planned Features**: Custom Webview settings panel (not yet implemented), font bundling (not yet added)

## Core Features (Implementation Status)

✅ **Color Theme Pack** — 9 themes registered in `package.json`, JSONs auto-generated via `npm run build:themes`
⚠️ **Font Pack** — NOT YET IMPLEMENTED. Plan: bundle Atkinson Hyperlegible Next Mono in `assets/fonts/`, apply via settings panel
⚠️ **Accessibility Settings Panel** — Stub command exists (`openAccessibilityPanel`), needs Webview implementation in `src/panel/AccessibilityPanel.ts`

## Critical Commands & Workflows

### Build & Development
```powershell
npm run compile          # Compile TypeScript (tsc -p ./) → out/
npm run watch            # Watch mode for src/*.ts changes
npm run build:themes     # Generate themes from external/github-vscode-theme
npm run lint             # Run ESLint on src/
npm test                 # Run tests via @vscode/test-cli
```

### Theme Build Pipeline
1. `scripts/build-github-theme.js` runs `npm install` in `external/github-vscode-theme/` (if needed)
2. Executes `npm run build` in that directory → generates `external/github-vscode-theme/themes/*.json`
3. Copies all JSONs to `./themes/` (these are .gitignored; only package.json theme paths are tracked)

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

### Implement the Settings Panel (TODO)
- Create `src/panel/AccessibilityPanel.ts` as a Webview
- Use `vscode.window.createWebviewPanel()` in the `openAccessibilityPanel` command handler
- Panel should allow:
  - Theme preview/switcher (cycle through `workbench.colorTheme`)
  - Font size, line height, letter spacing adjustments (update `editor.*` settings)
  - Toggle minimap, cursor blinking, etc. (update `editor.*` and `workbench.*` settings)
  - "Apply Recommended Config" preset button (bulk update settings)

### Add Font Support (TODO)
1. Download Atkinson Hyperlegible Next Mono from https://github.com/googlefonts/atkinson-hyperlegible-next-mono
2. Place font files in `assets/fonts/`
3. Update `package.json` to include `assets/` in `.vscodeignore` exclusions (if needed)
4. In settings panel, set `editor.fontFamily` to `'Atkinson Hyperlegible Next Mono'` when user selects font
5. Provide toggle to restore original font

### Update Themes
- Rebuild themes: `npm run build:themes` (requires network on first run)
- Theme JSON schema: [VS Code Color Theme](https://code.visualstudio.com/api/references/theme-color)
- Do NOT manually edit `themes/*.json` — they are auto-generated

## Dependencies & Integration

**External Theme Repo**: `external/github-vscode-theme` is a git submodule. Run `git submodule update --init` if folder is empty.

**Font Source**: https://github.com/googlefonts/atkinson-hyperlegible-next-mono (NOT YET INTEGRATED)

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
