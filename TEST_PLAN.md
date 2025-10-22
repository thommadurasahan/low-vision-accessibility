# Low Vision Accessibility Extension - Test Plan

## 1. Extension Activation & Installation

### 1.1 First-Time Installation
- [ ] **Test**: Install extension from .vsix or marketplace
  - **Expected**: Extension activates on startup (`onStartupFinished`)
  - **Expected**: Font installation prompt appears with three buttons:
    - "Install Font Now"
    - "How to Install"
    - "Don't show again"
  
- [ ] **Test**: Click "Install Font Now"
  - **Expected**: Fonts folder opens in OS file explorer
  - **Expected**: Information message: "Double-click a .ttf file to install the Atkinson Hyperlegible Mono font."
  - **Expected**: Prompt doesn't show again on next activation

- [ ] **Test**: Click "How to Install"
  - **Expected**: Opens https://github.com/thommadurasahan/atkinson-hyperlegible-next-mono in browser
  - **Expected**: Prompt doesn't show again

- [ ] **Test**: Click "Don't show again"
  - **Expected**: Prompt doesn't show on subsequent activations
  - **Expected**: No other action taken

- [ ] **Test**: Dismiss prompt (click X or press Escape)
  - **Expected**: Prompt shows again on next activation

### 1.2 Subsequent Activations
- [ ] **Test**: Restart VS Code after dismissing initial prompt
  - **Expected**: Font installation prompt appears again

- [ ] **Test**: Restart VS Code after clicking any action button
  - **Expected**: Font installation prompt does NOT appear

## 2. Command Palette Commands

### 2.1 Open Accessibility Settings
- [ ] **Test**: Open Command Palette (`Ctrl+Shift+P`)
  - Type "Low Vision: Open Accessibility Settings"
  - **Expected**: Command appears in list
  - **Expected**: Accessibility panel opens in editor area

- [ ] **Test**: Execute command multiple times
  - **Expected**: If panel already open, it focuses/reveals existing panel
  - **Expected**: Only one panel instance exists

### 2.2 Open Fonts Folder
- [ ] **Test**: Open Command Palette
  - Type "Low Vision: Open Fonts Folder"
  - **Expected**: Command appears in list
  - **Expected**: Fonts folder opens in OS file explorer
  - **Expected**: Information message shows: "Double-click a .ttf file to install..."

- [ ] **Test**: Verify fonts folder contents
  - **Expected**: Contains `.ttf` font files from `assets/fonts/`
  - **Expected**: If .ttf file exists, it's revealed/selected in explorer

## 3. Accessibility Panel UI

### 3.1 Panel Layout & Responsiveness
- [ ] **Test**: Open Accessibility panel
  - **Expected**: Panel title: "🔍 Low Vision Accessibility Settings"
  - **Expected**: Subtitle visible
  - **Expected**: Two action buttons visible at top

- [ ] **Test**: Resize panel to narrow width (< 720px)
  - **Expected**: Panel does NOT shrink below 720px minimum width
  - **Expected**: Horizontal scrollbar appears when narrower
  - **Expected**: Content remains readable, not compressed

- [ ] **Test**: Resize panel to very wide width (> 1200px)
  - **Expected**: Content centers with max-width of 1200px
  - **Expected**: Margins on left/right sides

- [ ] **Test**: Check responsive behavior at 768px breakpoint
  - **Expected**: Action buttons stack vertically on narrow screens
  - **Expected**: Control groups adjust layout

### 3.2 Action Buttons
- [ ] **Test**: Verify "Apply Recommended Settings" button appearance
  - **Expected**: Uses prominent extension button styling
  - **Expected**: Matches VS Code Marketplace "Install" button look
  - **Expected**: Background: `--vscode-extensionButton-prominentBackground`
  - **Expected**: Has visible border in high-contrast themes

- [ ] **Test**: Hover over "Apply Recommended Settings"
  - **Expected**: Background changes to hover color
  - **Expected**: Cursor changes to pointer

- [ ] **Test**: Focus "Apply Recommended Settings" (Tab key)
  - **Expected**: Visible focus outline using `--vscode-focusBorder`
  - **Expected**: Outline offset: 2px

- [ ] **Test**: Verify "Reset All Settings" button appearance
  - **Expected**: Secondary button styling
  - **Expected**: Matches VS Code secondary action buttons
  - **Expected**: Has visible border in high-contrast themes

- [ ] **Test**: Click "Apply Recommended Settings"
  - **Expected**: Success message: "✅ Recommended low vision settings applied!"
  - **Expected**: All settings update immediately in panel UI
  - **Expected**: Settings persist to `settings.json`

- [ ] **Test**: Click "Reset All Settings to VS Code Defaults"
  - **Expected**: Success message: "Settings reset to default!"
  - **Expected**: All settings revert to VS Code defaults
  - **Expected**: Panel UI updates to show default values

### 3.3 Section Organization
- [ ] **Test**: Verify "Quick Settings" section exists
  - **Expected**: Section header: "⚡ Quick Settings"
  - **Expected**: Description: "High-impact settings for immediate readability..."
  - **Expected**: Contains 4 groups: Workbench, Window, Text Editor, Features

- [ ] **Test**: Verify "Other Settings" section exists
  - **Expected**: Section header: "🔧 Other Settings"
  - **Expected**: Description: "Additional refinements..."
  - **Expected**: Contains 3 groups: Text Editor, Workbench, Features

## 4. Quick Settings - Controls Testing

### 4.1 Workbench Group

#### Color Theme Dropdown
- [ ] **Test**: Open Color Theme dropdown
  - **Expected**: 12 options visible:
    - VS Code Dark Modern (Default)
    - 4 GitHub Dark themes
    - Separator (disabled)
    - 3 GitHub Light themes
    - Separator (disabled)
    - 4 High Contrast themes (2 VS Code, 2 GitHub)

- [ ] **Test**: Select "GitHub Dark High Contrast (Low Vision)"
  - **Expected**: Theme changes immediately
  - **Expected**: Dropdown stays on selected option (no revert)
  - **Expected**: Settings.json updates: `"workbench.colorTheme": "GitHub Dark High Contrast (Low Vision)"`

- [ ] **Test**: Select "Default High Contrast"
  - **Expected**: VS Code switches to high contrast theme
  - **Expected**: Buttons show visible borders
  - **Expected**: Focus indicators clearly visible

### 4.2 Window Group

#### Zoom Level Slider
- [ ] **Test**: Drag zoom level slider from 0 to 2
  - **Expected**: Range value updates live during drag: "2.0"
  - **Expected**: VS Code window zooms in real-time
  - **Expected**: Slider stays at new position when released
  - **Expected**: Settings persist after 300ms debounce

- [ ] **Test**: Change zoom to -1.5
  - **Expected**: Window zooms out
  - **Expected**: Range value shows: "-1.5"

- [ ] **Test**: Rapidly drag slider back and forth
  - **Expected**: No flickering or position resets
  - **Expected**: Debounce prevents excessive updates

### 4.3 Text Editor Group

#### Font Family Dropdown
- [ ] **Test**: Select "Atkinson Hyperlegible Mono (Recommended)"
  - **Expected**: Dropdown stays on selected option (no revert)
  - **Expected**: Editor font changes to Atkinson Hyperlegible Mono
  - **Expected**: Settings.json: `"editor.fontFamily": "'Atkinson Hyperlegible Mono', Consolas, 'Courier New', monospace"`

- [ ] **Test**: Select "Consolas (Default)"
  - **Expected**: Dropdown stays on selected option
  - **Expected**: Editor reverts to Consolas font

- [ ] **Test**: Change font family directly in VS Code Settings UI
  - **Expected**: Panel dropdown updates automatically within 300ms

#### Font Size Slider
- [ ] **Test**: Drag font size slider from 14 to 20
  - **Expected**: Range value updates live: "20px"
  - **Expected**: Slider stays at 20 when released (no revert)
  - **Expected**: Editor font size changes
  - **Expected**: Settings.json: `"editor.fontSize": 20`

- [ ] **Test**: Set font size to 12 (minimum)
  - **Expected**: Slider goes to leftmost position
  - **Expected**: Value shows: "12px"

- [ ] **Test**: Set font size to 24 (maximum)
  - **Expected**: Slider goes to rightmost position
  - **Expected**: Value shows: "24px"

#### Line Height Number Input
- [ ] **Test**: Enter "1.6" in line height field
  - **Expected**: Input accepts decimal values
  - **Expected**: Line height changes in editor
  - **Expected**: Settings.json: `"editor.lineHeight": 1.6`

- [ ] **Test**: Enter "0" (auto)
  - **Expected**: Line height auto-calculates based on font size

- [ ] **Test**: Enter value > 8 (e.g., "20")
  - **Expected**: Treats as pixel value (20px line height)

- [ ] **Test**: Enter value between 0 and 8 (e.g., "1.5")
  - **Expected**: Treats as multiplier (1.5 × font size)

#### Letter Spacing Slider
- [ ] **Test**: Drag letter spacing slider to 0.5
  - **Expected**: Value updates: "0.5px"
  - **Expected**: Letter spacing changes in editor

- [ ] **Test**: Set to 0
  - **Expected**: Value shows: "0px"
  - **Expected**: Default spacing restored

#### Boolean Dropdowns (Mouse Wheel Zoom, Bracket Pair Colorization, Minimap)
- [ ] **Test**: Change Mouse Wheel Zoom to "Enabled"
  - **Expected**: Dropdown stays on "Enabled"
  - **Expected**: Ctrl+MouseWheel zooms editor
  - **Expected**: Settings.json: `"editor.mouseWheelZoom": true`

- [ ] **Test**: Change to "Disabled"
  - **Expected**: Dropdown switches to "Disabled"
  - **Expected**: Settings.json: `"editor.mouseWheelZoom": false`

- [ ] **Test**: Toggle Minimap between Enabled/Disabled
  - **Expected**: Minimap shows/hides immediately
  - **Expected**: Dropdown reflects current state

#### String Dropdowns (Cursor Style, Cursor Blinking, Match Brackets, etc.)
- [ ] **Test**: Change Cursor Style to "Block (Recommended)"
  - **Expected**: Dropdown stays on selection
  - **Expected**: Editor cursor changes to block shape

- [ ] **Test**: Change Cursor Blinking to "Solid (Recommended)"
  - **Expected**: Cursor stops blinking
  - **Expected**: Dropdown shows "Solid (Recommended)"

- [ ] **Test**: Change Word Wrap to "On (Recommended)"
  - **Expected**: Long lines wrap in editor
  - **Expected**: Dropdown shows full description

### 4.4 Features Group

#### Terminal Font Size Slider
- [ ] **Test**: Change terminal font size to 18
  - **Expected**: Value updates: "18px"
  - **Expected**: Terminal text resizes
  - **Expected**: Settings persist

#### Terminal Cursor Style Dropdown
- [ ] **Test**: Change to "Line"
  - **Expected**: Terminal cursor changes to line style
  - **Expected**: Dropdown stays on selection

## 5. Other Settings - Controls Testing

### 5.1 Text Editor Group

#### Indentation Guides, Bracket Pair Guides, Smooth Scrolling
- [ ] **Test**: Toggle each boolean dropdown
  - **Expected**: Visual changes appear in editor
  - **Expected**: Dropdowns don't revert
  - **Expected**: Settings persist

#### Scrollbar Size Sliders
- [ ] **Test**: Increase vertical scrollbar size to 24px
  - **Expected**: Scrollbar becomes wider
  - **Expected**: Value shows: "24px"

- [ ] **Test**: Set to 10px (minimum)
  - **Expected**: Scrollbar becomes thinner

#### Suggest Font Size Slider
- [ ] **Test**: Set to 0
  - **Expected**: Value shows: "Auto"
  - **Expected**: Suggestion font matches editor font

- [ ] **Test**: Set to 16
  - **Expected**: Value shows: "16px"
  - **Expected**: Autocomplete suggestions use 16px font

#### Inlay Hints Dropdown
- [ ] **Test**: Select each option
  - "On (Default)"
  - "Hide on Ctrl+Alt"
  - "Show on Ctrl+Alt"
  - "Off"
  - **Expected**: Inlay hints behavior changes accordingly

### 5.2 Workbench Group

#### Preferred Theme Dropdowns
- [ ] **Test**: Set Preferred Dark Theme to "GitHub Dark High Contrast"
  - **Expected**: When switching to dark mode, this theme activates

- [ ] **Test**: Set Preferred Light Theme
  - **Expected**: When switching to light mode, this theme activates

- [ ] **Test**: Set Preferred High Contrast Theme
  - **Expected**: When switching to HC mode, this theme activates

### 5.3 Features Group

#### Terminal Line Height Slider
- [ ] **Test**: Adjust terminal line height to 1.5
  - **Expected**: Terminal line spacing increases
  - **Expected**: Value shows: "1.5"

#### Terminal Cursor Blinking Dropdown
- [ ] **Test**: Toggle between Enabled/Disabled
  - **Expected**: Terminal cursor starts/stops blinking

## 6. Settings Synchronization

### 6.1 Panel → VS Code Settings
- [ ] **Test**: Change any setting in panel
  - **Expected**: Open Settings UI (`Ctrl+,`) and search for that setting
  - **Expected**: Setting value matches what was set in panel

- [ ] **Test**: Change multiple settings, then open `settings.json`
  - **Expected**: All changed settings appear in JSON file
  - **Expected**: Values are correct types (string, number, boolean)

### 6.2 VS Code Settings → Panel
- [ ] **Test**: With panel open, change `editor.fontSize` in Settings UI
  - **Expected**: Panel slider updates within 300ms
  - **Expected**: Range value updates

- [ ] **Test**: Edit `settings.json` directly (e.g., set `"editor.fontSize": 22`)
  - **Expected**: Panel updates automatically
  - **Expected**: Slider position and value reflect new setting

- [ ] **Test**: Change boolean setting in Settings UI
  - **Expected**: Panel dropdown updates to match

### 6.3 Pending Updates Protection
- [ ] **Test**: Drag font size slider and immediately check settings.json
  - **Expected**: Slider doesn't revert even if settings.json briefly shows old value
  - **Expected**: After 300ms, settings.json shows new value
  - **Expected**: Slider stays at new position throughout

- [ ] **Test**: Rapidly change font family dropdown multiple times
  - **Expected**: Dropdown stays on last selected option
  - **Expected**: No flickering back to previous options

## 7. Theme Compatibility

### 7.1 Default Dark Modern
- [ ] **Test**: Switch to Default Dark Modern theme
  - **Expected**: Panel background matches theme
  - **Expected**: Text readable with good contrast
  - **Expected**: Buttons use theme colors
  - **Expected**: Borders visible but subtle

### 7.2 Default High Contrast
- [ ] **Test**: Switch to Default High Contrast theme
  - **Expected**: Panel has high contrast background
  - **Expected**: All text clearly visible
  - **Expected**: Buttons have thick, visible borders
  - **Expected**: Focus indicators very prominent
  - **Expected**: Input borders clearly visible

### 7.3 Default High Contrast Light
- [ ] **Test**: Switch to Default High Contrast Light theme
  - **Expected**: Light background with high contrast text
  - **Expected**: Buttons have visible borders
  - **Expected**: All controls clearly distinguishable

### 7.4 GitHub Themes (9 variations)
- [ ] **Test**: Test with GitHub Dark Default
  - **Expected**: Panel adapts to GitHub theme colors
  - **Expected**: Consistent with VS Code UI

- [ ] **Test**: Test with GitHub Light Default
  - **Expected**: Light theme colors applied
  - **Expected**: Good readability

- [ ] **Test**: Test with GitHub Dark High Contrast
  - **Expected**: Extra high contrast
  - **Expected**: Borders more prominent

### 7.5 Custom Themes
- [ ] **Test**: Install and activate a third-party theme
  - **Expected**: Panel uses theme's CSS variables
  - **Expected**: Falls back gracefully if variables missing

## 8. Recommended Settings Preset

### 8.1 Apply Recommended Settings
- [ ] **Test**: Click "Apply Recommended Settings" button
  - **Expected**: Following settings applied:
    - Font Family: Atkinson Hyperlegible Mono
    - Font Size: 16
    - Mouse Wheel Zoom: true
    - Cursor Style: block
    - Cursor Blinking: solid
    - Match Brackets: always
    - Bracket Pair Colorization: true
    - Word Wrap: on
    - Accessibility Support: on
    - Minimap: false
    - Indentation Guides: true
    - Bracket Pair Guides: active
    - Smooth Scrolling: true
    - Wrapping Indent: same
    - Suggest Font Size: 16
    - Inlay Hints: off
    - Parameter Hints: true
    - Hover: true
    - Terminal Font Size: 16
    - Terminal Cursor Style: block
    - Terminal Cursor Blinking: true
    - Accessibility Signals: true
    - Audio Cues (all): on

- [ ] **Test**: Verify all UI controls update after applying preset
  - **Expected**: All dropdowns, sliders, inputs show recommended values
  - **Expected**: No controls left in previous state

- [ ] **Test**: Apply preset, then manually change one setting
  - **Expected**: Only changed setting updates
  - **Expected**: Other recommended settings remain

## 9. Reset Functionality

### 9.1 Reset All Settings
- [ ] **Test**: Change 5+ settings, then click "Reset All Settings"
  - **Expected**: Success message appears
  - **Expected**: All settings revert to VS Code defaults
  - **Expected**: Panel controls update to show default values
  - **Expected**: Settings removed from `settings.json` (or set to undefined)

- [ ] **Test**: Reset after applying recommended settings
  - **Expected**: All 20+ settings reset
  - **Expected**: Editor appearance returns to default look

## 10. Edge Cases & Error Handling

### 10.1 Invalid Input Values
- [ ] **Test**: Enter negative number in Line Height input
  - **Expected**: Input rejects or clamps to minimum (0)

- [ ] **Test**: Enter very large number (e.g., 999)
  - **Expected**: Input accepts but VS Code may clamp to reasonable limit

- [ ] **Test**: Enter non-numeric text in number input
  - **Expected**: Input validation prevents or shows error

### 10.2 Missing Font Files
- [ ] **Test**: Delete `assets/fonts/` folder, run "Open Fonts Folder" command
  - **Expected**: Error message: "Could not open the fonts folder..."
  - **Expected**: No crash or undefined behavior

### 10.3 Rapid Setting Changes
- [ ] **Test**: Rapidly click between different themes
  - **Expected**: Theme changes smoothly
  - **Expected**: No race conditions or flicker

- [ ] **Test**: Drag multiple sliders simultaneously (if possible with accessibility tools)
  - **Expected**: Each slider updates independently
  - **Expected**: No value conflicts

### 10.4 Panel State Persistence
- [ ] **Test**: Change settings, close panel, reopen panel
  - **Expected**: Panel shows current VS Code settings
  - **Expected**: Not stale values from before closing

- [ ] **Test**: Open panel, change theme externally, check panel
  - **Expected**: Panel reflects new theme colors immediately

### 10.5 Multiple Workspace Windows
- [ ] **Test**: Open two VS Code windows, open panel in both
  - **Expected**: Each panel operates independently
  - **Expected**: Settings changes apply globally (user settings)
  - **Expected**: Both panels sync to same settings values

### 10.6 Extension Development Host Quirks
- [ ] **Test**: Run extension in debug mode (F5)
  - **Expected**: Font install prompt appears in Extension Development Host
  - **Expected**: Settings changes affect main VS Code window (user settings)
  - **Expected**: Extension Host may not reflect theme/font changes (expected limitation)

## 11. Accessibility Features

### 11.1 Keyboard Navigation
- [ ] **Test**: Tab through all controls
  - **Expected**: Focus visible on each control
  - **Expected**: Focus order logical (top to bottom, left to right)
  - **Expected**: Focus indicators prominent in high contrast

- [ ] **Test**: Use arrow keys on sliders
  - **Expected**: Sliders respond to left/right arrows
  - **Expected**: Step by defined increment

- [ ] **Test**: Use Space/Enter on dropdowns
  - **Expected**: Dropdowns open/close
  - **Expected**: Arrow keys navigate options

### 11.2 Screen Reader Support
- [ ] **Test**: Enable screen reader (NVDA, JAWS, VoiceOver)
  - **Expected**: Button labels announced
  - **Expected**: Dropdown current value announced
  - **Expected**: Slider values announced
  - **Expected**: Section headings navigable

### 11.3 High Contrast Mode
- [ ] **Test**: All controls visible in high contrast
  - **Expected**: Borders on all inputs
  - **Expected**: Focus states very clear
  - **Expected**: No invisible text or controls

## 12. Performance

### 12.1 Panel Load Time
- [ ] **Test**: Measure time to open panel
  - **Expected**: Panel opens < 500ms
  - **Expected**: No lag or delay

### 12.2 Setting Change Performance
- [ ] **Test**: Drag slider rapidly
  - **Expected**: UI remains responsive
  - **Expected**: No stuttering

- [ ] **Test**: Change theme multiple times quickly
  - **Expected**: Theme changes smoothly
  - **Expected**: No memory leaks

### 12.3 Debounce Effectiveness
- [ ] **Test**: Change setting, immediately check config updates
  - **Expected**: 300ms debounce prevents excessive file writes
  - **Expected**: Final value correctly saved

## 13. Regression Testing

### 13.1 Previously Fixed Issues
- [ ] **Test**: Font size slider position resets (Issue: fixed with pending updates)
  - **Expected**: Slider stays at new position when released
  - **Expected**: No revert to old value

- [ ] **Test**: Font family dropdown resets (Issue: fixed with pending updates)
  - **Expected**: Dropdown stays on selected font
  - **Expected**: No flicker back to previous option

- [ ] **Test**: Number input (Line Height) doesn't sync (Issue: fixed with type check)
  - **Expected**: Input value updates when setting changes externally

## 14. Documentation & User Experience

### 14.1 Tooltips & Descriptions
- [ ] **Test**: Read all setting descriptions
  - **Expected**: Clear, concise explanations
  - **Expected**: Mention default and recommended values
  - **Expected**: No typos or grammar errors

### 14.2 Visual Feedback
- [ ] **Test**: Apply settings
  - **Expected**: Success toast notification appears
  - **Expected**: Message clearly states what happened

- [ ] **Test**: Reset settings
  - **Expected**: Confirmation feedback
  - **Expected**: Clear indication of action completed

### 14.3 Help Resources
- [ ] **Test**: Font install "How to Install" link
  - **Expected**: Opens GitHub repo in browser
  - **Expected**: Page contains font installation instructions

## Test Execution Summary

**Total Test Cases**: ~150+

**Categories**:
- Extension Activation: 8 tests
- Commands: 4 tests
- UI Layout: 10 tests
- Quick Settings Controls: 35 tests
- Other Settings Controls: 20 tests
- Settings Sync: 12 tests
- Theme Compatibility: 10 tests
- Recommended Preset: 5 tests
- Reset: 4 tests
- Edge Cases: 10 tests
- Accessibility: 8 tests
- Performance: 5 tests
- Regression: 3 tests
- UX: 6 tests

**Priority Levels**:
- **P0 (Critical)**: Settings sync, no data loss, basic functionality
- **P1 (High)**: All controls work, theme compatibility, accessibility
- **P2 (Medium)**: Performance, edge cases, error handling
- **P3 (Low)**: Polish, rare edge cases

## Test Environment Requirements

### Required VS Code Versions
- [ ] VS Code Stable (latest)
- [ ] VS Code Insiders (optional)
- [ ] Minimum supported: 1.104.0

### Operating Systems
- [ ] Windows 11
- [ ] Windows 10
- [ ] macOS (latest)
- [ ] Linux (Ubuntu/Fedora)

### Themes to Test
- [ ] Default Dark Modern
- [ ] Default Light Modern
- [ ] Default High Contrast
- [ ] Default High Contrast Light
- [ ] All 9 GitHub Low Vision themes

### Accessibility Tools
- [ ] Screen reader (NVDA/JAWS/VoiceOver)
- [ ] High contrast OS settings
- [ ] Keyboard-only navigation

## Automated Testing Opportunities

### Unit Tests (Future)
- Setting value validation
- CSS variable fallback logic
- Pending updates state management

### Integration Tests (Future)
- Command registration
- Panel creation/disposal
- Configuration API calls

### E2E Tests (Future)
- Full user workflows
- Settings synchronization
- Multi-window scenarios

---

**Test Plan Version**: 1.0  
**Last Updated**: 2025-10-22  
**Status**: Ready for execution
