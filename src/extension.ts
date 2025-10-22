// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AccessibilityPanel } from './panel/AccessibilityPanel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "low-vision-accessibility" is now active!');

	// Register the command to open the accessibility panel
	const openPanelCommand = vscode.commands.registerCommand(
		'low-vision-accessibility.openAccessibilityPanel', 
		() => {
			AccessibilityPanel.createOrShow(context.extensionUri);
		}
	);

	context.subscriptions.push(openPanelCommand);

	// Show a one-time prompt guiding the user to install the Atkinson Hyperlegible Mono font
	maybePromptForFontInstall(context).catch(err => console.error('Font prompt error', err));
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function maybePromptForFontInstall(context: vscode.ExtensionContext) {
	const PROMPT_KEY = 'lowVision.fontInstallPromptShown';
	const alreadyShown = context.globalState.get<boolean>(PROMPT_KEY, false);
	if (alreadyShown) {
		return;
	}

	const result = await vscode.window.showInformationMessage(
		'For the best readability, install the Atkinson Hyperlegible Mono font on your system. The font files are bundled with this extension.',
		'Install Font Now',
		'How to Install',
		"Don't show again"
	);

	// Decide what to do based on user choice
	if (!result) {
		// Dismissed – show again next time
		return;
	}

	if (result === "Don't show again") {
		await context.globalState.update(PROMPT_KEY, true);
		return;
	}

	if (result === 'How to Install') {
		// Open the upstream font project page with instructions
		await vscode.env.openExternal(vscode.Uri.parse('https://github.com/thommadurasahan/atkinson-hyperlegible-next-mono'));
		await context.globalState.update(PROMPT_KEY, true);
		return;
	}

	if (result === 'Install Font Now') {
		try {
			const fontsDir = vscode.Uri.joinPath(context.extensionUri, 'assets', 'fonts');
			// Try to reveal the first TTF file for a clearer install action
			let revealUri: vscode.Uri | undefined;
			try {
				const entries = await vscode.workspace.fs.readDirectory(fontsDir);
				const ttf = entries.find(([name, type]) => type === vscode.FileType.File && name.toLowerCase().endsWith('.ttf'));
				if (ttf) {
					revealUri = vscode.Uri.joinPath(fontsDir, ttf[0]);
				}
			} catch {
				// ignore and fallback to folder reveal
			}

			await vscode.commands.executeCommand('revealFileInOS', revealUri ?? fontsDir);
			vscode.window.showInformationMessage('In the folder that opened, double-click a .ttf file to install the font in your OS.');
			await context.globalState.update(PROMPT_KEY, true);
		} catch (err) {
			console.error('Failed to reveal fonts folder', err);
			vscode.window.showErrorMessage('Could not open the fonts folder. Please check the extension installation.');
		}
	}
}
