import * as vscode from 'vscode';

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait until a configuration key equals the expected value or timeout.
 * Pass full dotted key, e.g. 'editor.fontSize'.
 */
export async function waitForConfig<T>(fullKey: string, expected: T, timeoutMs = 3000, intervalMs = 100): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const actual = vscode.workspace.getConfiguration().get<T>(fullKey);
        if (deepEqual(actual, expected)) {
            return true;
        }
        await sleep(intervalMs);
    }
    return false;
}

function deepEqual(a: any, b: any): boolean {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return a === b;
    }
}
