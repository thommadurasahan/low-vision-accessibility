# Low Vision Accessibility Extension - Design & Development Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Design](#architecture-design)
3. [Development Phases](#development-phases)
4. [Component Workflows](#component-workflows)
5. [Build System](#build-system)
6. [Extension Lifecycle](#extension-lifecycle)
7. [Technical Implementation Details](#technical-implementation-details)

---

## Overview

The **Low Vision Accessibility Extension** is a VS Code extension designed to enhance accessibility for developers with low vision. It combines:
- **9 High-Contrast Color Themes** (GitHub-based)
- **Atkinson Hyperlegible Mono Font** (optimized for readability)
- **Comprehensive Settings Panel** (Webview-based UI for easy configuration)

### Design Principles

1. **Accessibility First**: All features prioritize clarity, contrast, and usability
2. **Non-Intrusive**: Activates on startup but doesn't interfere with workflow
3. **Modular Architecture**: Themes, fonts, and settings are independently maintainable
4. **User-Friendly**: Provides recommended presets with one-click application

---

## Architecture Design

### High-Level Architecture

```plantuml
@startuml
!theme plain

package "VS Code Extension Host" {
  [Extension Entry Point\n(extension.ts)]
}

package "Core Components" {
  [Command Registry]
  [AccessibilityPanel\n(Webview)]
  [State Management]
}

package "External Assets" {
  [GitHub Theme Submodule]
  [Font Submodule]
}

package "Build Pipeline" {
  [Theme Builder\n(build-github-theme.js)]
  [Font Copier\n(build-fonts.js)]
}

package "Bundled Resources" {
  [themes/*.json]
  [assets/fonts/*.ttf]
}

package "VS Code APIs" {
  [Workspace Configuration]
  [Webview API]
  [File System]
  [Commands API]
}

[Extension Entry Point\n(extension.ts)] --> [Command Registry]
[Extension Entry Point\n(extension.ts)] --> [State Management]
[Command Registry] --> [AccessibilityPanel\n(Webview)]
[AccessibilityPanel\n(Webview)] --> [Workspace Configuration] : Read/Write Settings
[GitHub Theme Submodule] --> [Theme Builder\n(build-github-theme.js)]
[Font Submodule] --> [Font Copier\n(build-fonts.js)]
[Theme Builder\n(build-github-theme.js)] --> [themes/*.json]
[Font Copier\n(build-fonts.js)] --> [assets/fonts/*.ttf]
[themes/*.json] --> [VS Code APIs] : Theme Contributions
[assets/fonts/*.ttf] --> [AccessibilityPanel\n(Webview)] : Font References

@enduml
```

### Component Breakdown

| Component | Purpose | Technology |
|-----------|---------|------------|
| `extension.ts` | Extension activation, command registration, font installation prompt | TypeScript + VS Code API |
| `AccessibilityPanel.ts` | Webview-based settings UI with real-time config management | TypeScript + Webview API |
| `build-github-theme.js` | Automated theme generation from git submodule | Node.js Script |
| `build-fonts.js` | Font file copying from submodule to extension | Node.js Script |
| `themes/*.json` | Color theme definitions (9 variants) | JSON (VS Code Theme Format) |
| `assets/fonts/*.ttf` | Atkinson Hyperlegible Mono font files | TrueType Fonts |

---

## Development Phases

### Phase 1: Project Initialization & Setup

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FFFFFE
skinparam activity {
  BackgroundColor #E3F2FD
  BorderColor #1976D2
  FontColor #000000
  FontSize 13
}

start
:Create VS Code Extension Scaffold;
:Initialize Git Repository;
:Setup TypeScript Configuration;
:Define Extension Manifest (package.json);
:Add Git Submodules;
note right
  - external/github-vscode-theme
  - external/atkinson-hyperlegible-next-mono
end note
:Create Build Scripts;
:Configure ESLint & Testing;
stop

@enduml
```

**Key Activities:**
1. **Scaffolding**: Used VS Code's `yo code` generator to create base structure
2. **Configuration**: Set up `tsconfig.json` for TypeScript compilation
3. **Dependencies**: Added `@types/vscode` and testing packages
4. **Submodules**: Linked external repositories for themes and fonts
5. **Package.json**: Defined activation events, commands, and theme contributions

### Phase 2: Theme Integration

```plantuml
@startuml
!theme plain
skinparam activity {
  BackgroundColor #FFF3E0
  BorderColor #F57C00
}

start
:Initialize GitHub Theme Submodule;
:Create build-github-theme.js Script;
:Install Dependencies in Submodule;
:Run Theme Build Command;
:Copy Generated JSON Files;
note right
  Copies from:
  external/github-vscode-theme/themes/
  
  To:
  ./themes/
end note
:Register Themes in package.json;
:Test Theme Activation;
stop

@enduml
```

**Technical Details:**

The theme build script (`scripts/build-github-theme.js`) performs:
```javascript
// 1. Dependency Check & Installation
if (!fs.existsSync(path.join(repoPath, "node_modules"))) {
    run("npm ci", repoPath);  // Uses lockfile for reproducibility
}

// 2. Theme Compilation
run("npm run build", repoPath);  // Generates JSON from source

// 3. File Copy
copyThemes(distPath, outputPath);  // Moves to extension themes/
```

**Theme Registration Pattern:**
```json
{
  "label": "GitHub Dark High Contrast (Low Vision)",
  "uiTheme": "hc-black",  // Maps to VS Code theme type
  "path": "./themes/dark-high-contrast.json"
}
```

### Phase 3: Font Integration

```plantuml
@startuml
!theme plain
skinparam activity {
  BackgroundColor #E8F5E9
  BorderColor #388E3C
}

start
:Initialize Font Submodule;
:Create build-fonts.js Script;
:Locate TTF Files in Submodule;
note right
  Path: external/atkinson-hyperlegible-next-mono/
        fonts/ttf/*.ttf
end note
:Copy Font Files to assets/fonts/;
:Implement Font Installation Prompt;
:Create Command to Open Fonts Folder;
:Test Font Detection & Display;
stop

@enduml
```

**Font Workflow:**

1. **Build-Time**: Fonts copied via `npm run build:fonts`
2. **Runtime**: Extension prompts user to install fonts on first activation
3. **User Action**: Double-click .ttf files in OS to install system-wide
4. **Configuration**: Settings panel allows selecting "Atkinson Hyperlegible Mono"

### Phase 4: Accessibility Settings Panel Development

This was the most complex phase, implementing a full-featured Webview UI.

```plantuml
@startuml
!theme plain

package "AccessibilityPanel Architecture" {
  
  rectangle "TypeScript Backend" {
    [AccessibilityPanel Class]
    [Singleton Pattern Management]
    [Message Handler]
    [Configuration Manager]
  }
  
  rectangle "Webview Frontend" {
    [HTML UI Generator]
    [JavaScript Controller]
    [CSS Styling (VS Code Variables)]
  }
  
  rectangle "VS Code APIs" {
    [Workspace Configuration]
    [Webview Panel API]
    [Configuration Change Listener]
  }
  
  [AccessibilityPanel Class] --> [Singleton Pattern Management]
  [AccessibilityPanel Class] --> [Message Handler]
  [AccessibilityPanel Class] --> [Configuration Manager]
  
  [Message Handler] --> [HTML UI Generator] : postMessage()
  [JavaScript Controller] --> [Message Handler] : vscode.postMessage()
  
  [Configuration Manager] --> [Workspace Configuration] : get/update settings
  [Configuration Change Listener] --> [Message Handler] : Notify UI of changes
  
  [HTML UI Generator] --> [CSS Styling (VS Code Variables)]
}

@enduml
```

**Panel Features Implementation:**

| Feature | Implementation Approach |
|---------|------------------------|
| **Singleton Pattern** | `AccessibilityPanel.createOrShow()` reuses existing panel instance |
| **Real-time Updates** | `onDidChangeConfiguration` listener with 300ms debounce |
| **Settings Categories** | Quick Settings (15+) + Other Settings (15+) grouped by functionality |
| **Recommended Preset** | Hardcoded optimal low-vision settings applied via one button |
| **Reset Functionality** | Sets all settings to `undefined` to restore VS Code defaults |
| **Bidirectional Sync** | UI → Config → UI feedback loop prevents stale state |

**Settings Management Flow:**

```plantuml
@startuml
!theme plain
skinparam sequence {
  ParticipantBackgroundColor #E3F2FD
  ParticipantBorderColor #1976D2
  ArrowColor #1976D2
}

actor User
participant "Webview UI" as UI
participant "Panel Backend" as Panel
participant "VS Code Config API" as Config
participant "Config Listener" as Listener

User -> UI: Change Setting (e.g., font size slider)
UI -> Panel: postMessage({ command: 'applySettings', settings: {...} })
Panel -> Config: workspace.getConfiguration().update(key, value, Global)
Config -> Config: Write to settings.json
Config -> Listener: onDidChangeConfiguration event
Listener -> Listener: Wait 300ms (debounce)
Listener -> Panel: _sendCurrentSettings()
Panel -> Config: Read all current settings
Config --> Panel: Return current values
Panel -> UI: postMessage({ command: 'updateSettings', settings: {...} })
UI -> UI: Update UI controls with latest values
UI --> User: UI reflects new setting

@enduml
```

**Key Design Decision: Debouncing**

To prevent UI flicker when dragging sliders, a 300ms debounce timer delays UI refreshes:
```typescript
vscode.workspace.onDidChangeConfiguration(e => {
    if (this._configUpdateTimer) {
        clearTimeout(this._configUpdateTimer);
    }
    this._configUpdateTimer = setTimeout(() => {
        this._sendCurrentSettings();
    }, 300);
});
```

### Phase 5: Command Registration & Extension Activation

```plantuml
@startuml
!theme plain
skinparam activity {
  BackgroundColor #F3E5F5
  BorderColor #7B1FA2
}

start
:VS Code Starts Up;
:Trigger: onStartupFinished;
:Extension.activate() Called;
fork
  :Register Command:\nopenAccessibilityPanel;
fork again
  :Register Command:\nopenFontsFolder;
fork again
  :Check Global State:\nfontInstallPromptShown;
  if (Already Shown?) then (yes)
    :Skip Prompt;
  else (no)
    :Show Font Install Prompt;
    note right
      Options:
      1. Install Font Now
      2. How to Install
      3. Don't show again
    end note
  endif
end fork
:Extension Ready;
:Wait for User Commands;
stop

@enduml
```

**Activation Flow Details:**

```typescript
export function activate(context: vscode.ExtensionContext) {
    // 1. Register Commands
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'low-vision-accessibility.openAccessibilityPanel',
            () => AccessibilityPanel.createOrShow(context.extensionUri)
        )
    );
    
    // 2. Font Installation Prompt (One-time)
    maybePromptForFontInstall(context);
}
```

---

## Component Workflows

### 1. Extension Activation & Command Execution

```plantuml
@startuml
!theme plain

actor User
participant "VS Code" as VSC
participant "Extension Host" as EH
participant "extension.ts" as EXT
participant "AccessibilityPanel" as Panel

VSC -> EH: Startup Complete
EH -> EXT: activate()
EXT -> EXT: Register Commands
EXT -> EXT: Check Font Prompt State
alt Font Prompt Not Shown
    EXT -> User: Show Font Install Dialog
    User -> EXT: Select Option
    alt Install Font Now
        EXT -> VSC: revealFileInOS(fontsDir)
    else How to Install
        EXT -> VSC: openExternal(GitHub URL)
    else Don't Show Again
        EXT -> EXT: Update Global State
    end
end

... Later ...

User -> VSC: Command Palette:\n"Low Vision: Open Accessibility Settings"
VSC -> EXT: Execute Command
EXT -> Panel: createOrShow(extensionUri)
alt Panel Already Exists
    Panel -> VSC: panel.reveal()
else Create New Panel
    Panel -> Panel: new AccessibilityPanel()
    Panel -> Panel: _getHtmlForWebview()
    Panel -> VSC: createWebviewPanel()
end
Panel --> User: Display Settings UI

@enduml
```

### 2. Settings Application Workflow

```plantuml
@startuml
!theme plain

actor User
participant "Webview UI" as UI
participant "JS Controller" as JS
participant "Panel Backend" as Backend
participant "Config API" as Config

User -> UI: Click "Apply Recommended Settings"
UI -> JS: applyRecommended()
JS -> Backend: postMessage({ command: 'applyRecommended' })
Backend -> Backend: _applyRecommendedSettings()
loop For Each Recommended Setting
    Backend -> Config: config.update(key, value, Global)
    Config -> Config: Write to settings.json
end
Backend -> UI: showInformationMessage("✅ Settings Applied!")
Config -> Backend: onDidChangeConfiguration (debounced)
Backend -> Config: Read updated settings
Config --> Backend: Return current values
Backend -> UI: postMessage({ command: 'updateSettings', settings })
UI -> UI: Update all UI controls
UI --> User: Display updated state

@enduml
```

### 3. Theme Build Pipeline

```plantuml
@startuml
!theme plain
skinparam sequence {
  ParticipantBackgroundColor #FFF3E0
  ParticipantBorderColor #F57C00
}

actor Developer
participant "npm script" as NPM
participant "build-github-theme.js" as Build
participant "Git Submodule" as Submodule
participant "Submodule Build" as SubBuild
participant "File System" as FS

Developer -> NPM: npm run build:themes
NPM -> Build: node scripts/build-github-theme.js
Build -> Build: Check if node_modules exists

alt node_modules Missing
    Build -> Submodule: npm ci (in submodule dir)
    Submodule -> Submodule: Install dependencies
end

Build -> Submodule: npm run build
Submodule -> SubBuild: Execute build script
SubBuild -> SubBuild: Generate theme JSONs from source
SubBuild -> FS: Write to themes/*.json

Build -> FS: Read files from\nexternal/github-vscode-theme/themes/
Build -> FS: Copy to ./themes/
FS --> Build: Confirm copy

Build --> NPM: ✅ Build Complete
NPM --> Developer: Success message

@enduml
```

---

## Build System

### Build Process Overview

```plantuml
@startuml
!theme plain
skinparam activity {
  BackgroundColor #E0F7FA
  BorderColor #00796B
}

start

partition "npm run build:all" {
  fork
    :Build Themes;
    partition "build:themes" {
      :Check submodule dependencies;
      :Run npm build in submodule;
      :Copy theme JSONs;
    }
  fork again
    :Build Fonts;
    partition "build:fonts" {
      :Locate TTF files;
      :Copy to assets/fonts/;
    }
  end fork
}

partition "npm run compile" {
  :TypeScript Compilation;
  :Generate out/extension.js;
  :Generate out/panel/AccessibilityPanel.js;
}

partition "Package Extension" {
  :Include compiled JS;
  :Include themes/*.json;
  :Include assets/fonts/*.ttf;
  :Generate .vsix package;
}

stop

@enduml
```

### Build Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run compile` | Compile TypeScript to JavaScript | `out/extension.js`, `out/panel/AccessibilityPanel.js` |
| `npm run watch` | Continuous compilation on file changes | Live updates in `out/` |
| `npm run build:themes` | Generate theme files from submodule | `themes/*.json` |
| `npm run build:fonts` | Copy font files from submodule | `assets/fonts/*.ttf` |
| `npm run build:all` | Build both themes and fonts | Combined output |
| `npm run lint` | Run ESLint on source files | Error/warning reports |
| `npm test` | Execute extension tests | Test results |

### Dependency Graph

```plantuml
@startuml
!theme plain

package "Development Dependencies" {
  [TypeScript Compiler]
  [ESLint]
  [@types/vscode]
  [@vscode/test-electron]
}

package "Git Submodules" {
  [github-vscode-theme]
  [atkinson-hyperlegible-next-mono]
}

package "Build Scripts" {
  [build-github-theme.js]
  [build-fonts.js]
}

package "Source Code" {
  [extension.ts]
  [AccessibilityPanel.ts]
}

package "Build Output" {
  [out/extension.js]
  [themes/*.json]
  [assets/fonts/*.ttf]
}

[TypeScript Compiler] --> [extension.ts]
[TypeScript Compiler] --> [AccessibilityPanel.ts]
[extension.ts] --> [out/extension.js]
[AccessibilityPanel.ts] --> [out/extension.js]

[github-vscode-theme] --> [build-github-theme.js]
[build-github-theme.js] --> [themes/*.json]

[atkinson-hyperlegible-next-mono] --> [build-fonts.js]
[build-fonts.js] --> [assets/fonts/*.ttf]

@enduml
```

---

## Extension Lifecycle

### Complete Lifecycle Flow

```plantuml
@startuml
!theme plain
skinparam state {
  BackgroundColor #E8EAF6
  BorderColor #3F51B5
  FontColor #000000
}

[*] --> ExtensionInstalled : User installs extension

ExtensionInstalled --> Inactive : Installation complete

Inactive --> Activating : VS Code startup\n(onStartupFinished)

state Activating {
  [*] --> RegisterCommands
  RegisterCommands --> CheckFontPrompt
  CheckFontPrompt --> ShowPrompt : First activation
  CheckFontPrompt --> SkipPrompt : Already shown
  ShowPrompt --> Activated
  SkipPrompt --> Activated
}

Activating --> Activated : activate() completes

state Activated {
  [*] --> Idle
  Idle --> ExecutingCommand : User invokes command
  
  state ExecutingCommand {
    [*] --> OpenPanel : openAccessibilityPanel
    [*] --> OpenFonts : openFontsFolder
    OpenPanel --> [*]
    OpenFonts --> [*]
  }
  
  ExecutingCommand --> Idle : Command completes
  
  Idle --> PanelActive : Panel opened
  
  state PanelActive {
    [*] --> DisplayingUI
    DisplayingUI --> ApplyingSettings : User changes settings
    DisplayingUI --> ListeningForChanges : Config changed externally
    ApplyingSettings --> DisplayingUI : Settings applied
    ListeningForChanges --> DisplayingUI : UI updated
  }
  
  PanelActive --> Idle : Panel closed
}

Activated --> Deactivating : VS Code shutdown

Deactivating --> [*] : deactivate() completes

@enduml
```

### State Transitions

| State | Trigger | Next State | Actions |
|-------|---------|------------|---------|
| **Installed** | VS Code Startup | Activating | Load extension code |
| **Activating** | `activate()` called | Activated | Register commands, show font prompt |
| **Activated** | User command | Executing | Process command logic |
| **Panel Active** | Settings changed | Panel Active | Update config, refresh UI |
| **Deactivating** | VS Code Shutdown | Inactive | Dispose resources |

---

## Technical Implementation Details

### 1. Singleton Pattern Implementation

**Purpose**: Ensure only one AccessibilityPanel instance exists at a time.

```typescript
export class AccessibilityPanel {
    public static currentPanel: AccessibilityPanel | undefined;
    
    public static createOrShow(extensionUri: vscode.Uri) {
        if (AccessibilityPanel.currentPanel) {
            // Reuse existing panel
            AccessibilityPanel.currentPanel._panel.reveal();
            return;
        }
        
        // Create new panel
        const panel = vscode.window.createWebviewPanel(
            'lowVisionAccessibility',
            'Low Vision Accessibility Settings',
            vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );
        
        AccessibilityPanel.currentPanel = new AccessibilityPanel(panel, extensionUri);
    }
}
```

**Benefits**:
- Prevents multiple panels from conflicting
- Maintains state across panel reveals
- Reduces resource usage

### 2. Configuration Management Strategy

**Challenge**: Keep UI in sync with VS Code settings while avoiding race conditions.

**Solution**: Pending Updates Tracking

```typescript
// In Webview JavaScript
const pendingUpdates = {};

function applySetting(key, value) {
    pendingUpdates[key] = value;  // Mark as pending
    vscode.postMessage({
        command: 'applySettings',
        settings: { [key]: value }
    });
}

function updateUIWithSettings(settings) {
    for (const [key, value] of Object.entries(settings)) {
        if (pendingUpdates.hasOwnProperty(key)) {
            if (pendingUpdates[key] !== value) {
                continue;  // Skip stale value
            }
            delete pendingUpdates[key];  // Value matched, clear pending
        }
        // Update UI control
    }
}
```

**Flow Diagram**:

```plantuml
@startuml
!theme plain

start
:User Changes Setting in UI;
:Mark Setting as Pending;
:Send Update to Backend;
:Backend Writes to Config;
:Config Triggers Change Event;
:Backend Reads All Settings;
:Backend Sends Settings to UI;
if (Value Matches Pending?) then (yes)
  :Clear Pending State;
  :Update UI Control;
else (no - stale value)
  :Skip UI Update;
  :Wait for Next Update;
endif
stop

@enduml
```

### 3. Webview Security & Resource Management

**Security Measures**:
- Content Security Policy enforced by VS Code
- No external script loading
- All resources loaded from extension URI

**Resource Management**:
```typescript
private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    
    // Dispose on panel close
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    
    // Clean up config listener
    vscode.workspace.onDidChangeConfiguration(
        e => { /* ... */ },
        null,
        this._disposables  // Auto-disposed with panel
    );
}

public dispose() {
    AccessibilityPanel.currentPanel = undefined;
    
    if (this._configUpdateTimer) {
        clearTimeout(this._configUpdateTimer);
    }
    
    this._panel.dispose();
    
    while (this._disposables.length) {
        this._disposables.pop()?.dispose();
    }
}
```

### 4. CSS Theming Integration

**Strategy**: Use VS Code CSS variables for seamless theme integration.

```css
body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-foreground);
    background-color: var(--vscode-editor-background);
}

.btn-primary {
    background-color: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
}

input[type="text"] {
    border: 1px solid var(--vscode-input-border);
    background-color: var(--vscode-input-background);
}
```

**Benefits**:
- Panel automatically adapts to user's chosen theme
- Maintains VS Code's visual consistency
- No hardcoded colors

### 5. Font Installation Workflow

```plantuml
@startuml
!theme plain

actor User
participant Extension
participant GlobalState
participant FileSystem
participant OS

Extension -> GlobalState: Check 'fontInstallPromptShown'
alt First Activation
    Extension -> User: Show Dialog:\n"Install Atkinson Hyperlegible Mono?"
    User -> Extension: Select Option
    
    alt Install Font Now
        Extension -> FileSystem: Get fonts directory URI
        FileSystem --> Extension: assets/fonts/*.ttf
        Extension -> FileSystem: Find first .ttf file
        Extension -> OS: revealFileInOS(font.ttf)
        OS -> User: Open file explorer with font selected
        User -> OS: Double-click .ttf file
        OS -> OS: Install font system-wide
        Extension -> GlobalState: Set 'fontInstallPromptShown' = true
    else How to Install
        Extension -> OS: openExternal(GitHub URL)
        OS -> User: Open browser with instructions
        Extension -> GlobalState: Set 'fontInstallPromptShown' = true
    else Don't Show Again
        Extension -> GlobalState: Set 'fontInstallPromptShown' = true
    end
else Already Shown
    Extension -> Extension: Skip prompt
end

@enduml
```

---

## Recommended Settings Configuration

The extension provides a carefully curated set of low-vision optimized settings:

### Recommended Preset Values

| Setting | Value | Rationale |
|---------|-------|-----------|
| `editor.fontFamily` | Atkinson Hyperlegible Mono | Designed for low vision readability |
| `editor.fontSize` | 16px | Larger than default (14px) for better visibility |
| `editor.mouseWheelZoom` | true | Quick zoom adjustment capability |
| `editor.cursorStyle` | block | More visible than line cursor |
| `editor.cursorBlinking` | solid | Easier to locate non-blinking cursor |
| `editor.matchBrackets` | always | Visual aid for code structure |
| `editor.bracketPairColorization.enabled` | true | Color-coded bracket matching |
| `editor.wordWrap` | on | Eliminates horizontal scrolling |
| `editor.minimap.enabled` | false | Removes low-contrast minimap |
| `terminal.integrated.cursorStyle` | block | Consistent with editor cursor |

---

## Testing Strategy

### Testing Workflow

```plantuml
@startuml
!theme plain
skinparam activity {
  BackgroundColor #FFF9C4
  BorderColor #F57F17
}

start

:Developer Makes Code Changes;

partition "Local Testing" {
  :Press F5 (Launch Extension Host);
  :Extension Loads in Debug Mode;
  :Test Commands Manually;
  :Verify UI Behavior;
  :Check Console for Errors;
}

if (Issues Found?) then (yes)
  :Debug & Fix;
  backward:Rebuild;
else (no)
  :Continue;
endif

partition "Automated Tests" {
  :Run npm test;
  :Execute extension.test.ts;
  :Verify Command Registration;
  :Check Extension Activation;
}

if (Tests Pass?) then (yes)
  :Proceed to Commit;
else (no)
  :Fix Test Failures;
  backward:Rebuild;
endif

:Commit Changes;
:Update Documentation;
stop

@enduml
```

### Test Coverage Areas

| Area | Test Method | Status |
|------|-------------|--------|
| Extension Activation | Unit test | ✅ Implemented |
| Command Registration | Unit test | ✅ Implemented |
| Theme Loading | Manual testing | ✅ Verified |
| Font Installation | Manual testing | ✅ Verified |
| Settings Panel UI | Manual testing | ✅ Verified |
| Configuration Updates | Integration test | 🟡 Partial |
| Webview Communication | Integration test | 🟡 Partial |

---

## Deployment Process

### Package & Distribution

```plantuml
@startuml
!theme plain

start

:Finalize Code Changes;
:Update CHANGELOG.md;
:Increment Version in package.json;

partition "Build Process" {
  :npm run build:all;
  :npm run compile;
  :npm run lint;
  :npm test;
}

if (All Steps Successful?) then (yes)
  :vsce package;
  note right
    Generates .vsix file
    containing all assets
  end note
else (no)
  :Fix Issues;
  stop
endif

:Review .vsix Contents;

partition "Distribution" {
  fork
    :Publish to VS Code Marketplace;
  fork again
    :Distribute .vsix Directly;
  fork again
    :Upload to GitHub Releases;
  end fork
}

:Users Install Extension;
stop

@enduml
```

---

## Future Enhancements

### Planned Features

1. **Voice Command Integration**: Add voice-controlled settings changes
2. **Profile Management**: Save and load custom accessibility profiles
3. **Auto-Adjustment**: Detect time of day and adjust themes automatically
4. **Screen Reader Optimization**: Enhanced ARIA labels and screen reader support
5. **Custom Theme Editor**: Allow users to create their own high-contrast themes
6. **Workspace-Specific Settings**: Different configurations per project
7. **Telemetry (Opt-in)**: Collect anonymous usage data to improve accessibility

### Architecture Evolution

```plantuml
@startuml
!theme plain

package "Current Architecture (v0.0.1)" {
  [Extension Core]
  [Accessibility Panel]
  [Themes (9 variants)]
  [Font Pack]
}

package "Future Architecture (v1.0+)" {
  [Extension Core v2]
  [Accessibility Panel v2]
  [Profile Manager] 
  [Theme Editor]
  [Voice Commands]
  [Screen Reader Bridge]
  [Themes (9+ variants)]
  [Font Pack]
  [Telemetry Module]
}

[Extension Core] --> [Extension Core v2] : Evolution
[Accessibility Panel] --> [Accessibility Panel v2] : Enhanced UI
[Extension Core v2] --> [Profile Manager]
[Extension Core v2] --> [Voice Commands]
[Accessibility Panel v2] --> [Theme Editor]
[Screen Reader Bridge] --> [Accessibility Panel v2]

@enduml
```

---

## Conclusion

The **Low Vision Accessibility Extension** demonstrates a comprehensive approach to building accessible developer tools. Key achievements include:

✅ **Modular Architecture**: Themes, fonts, and settings are independently maintainable  
✅ **Automated Build Pipeline**: Submodule-based asset generation  
✅ **Robust State Management**: Singleton pattern with debounced updates  
✅ **User-Friendly Design**: One-click recommended settings and reset functionality  
✅ **Seamless Integration**: Uses VS Code APIs for native look and feel  

This documentation provides a complete reference for understanding, maintaining, and extending the extension's functionality.

---

## Appendix: Key Files Reference

| File Path | Purpose | Lines of Code |
|-----------|---------|---------------|
| `src/extension.ts` | Extension activation and command handlers | ~120 |
| `src/panel/AccessibilityPanel.ts` | Webview-based settings panel | ~650 |
| `scripts/build-github-theme.js` | Theme build automation | ~50 |
| `scripts/build-fonts.js` | Font copy automation | ~35 |
| `package.json` | Extension manifest and configuration | ~80 |
| `tsconfig.json` | TypeScript compiler configuration | ~20 |
| `.github/copilot-instructions.md` | AI assistant guidance | ~400 |

**Total Extension Code**: ~1,355 lines (excluding submodules and generated files)

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Author**: Development Team  
**License**: MIT (or as specified in project root)
