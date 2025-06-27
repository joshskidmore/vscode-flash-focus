import * as vscode from 'vscode';

let pendingFlash: ReturnType<typeof setTimeout> | undefined;

const areaDecoration = vscode.window.createTextEditorDecorationType({
  isWholeLine: true,
  borderWidth: '0 0 0 10px',
  borderStyle: 'solid',
  borderColor: new vscode.ThemeColor('editor.selectionHighlightBorder'),
  backgroundColor: new vscode.ThemeColor('editor.selectionHighlightBackground')
});

function flashAroundCursor(durationMs = vscode.workspace.getConfiguration('flashFocus').get<number>('duration', 600)) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const line = editor.selection.active.line;
  const from = Math.max(0, line - 3);
  const to = Math.min(editor.document.lineCount - 1, line + 3);
  const areaRange = new vscode.Range(from, 0, to + 1, 0);

  // editor.setDecorations(areaDecoration, [areaRange]);
  const range = new vscode.Range(line, 0, line, 100);
  editor.setDecorations(areaDecoration, [range]);

  setTimeout(() => {
    editor.setDecorations(areaDecoration, []);
  }, durationMs);
}

export function activate(context: vscode.ExtensionContext) {
  const navigateWithFlash = async (command: string) => {
    if (pendingFlash) {
      clearTimeout(pendingFlash);
      pendingFlash = undefined;
    }

    await vscode.commands.executeCommand(command);

    const activationDelay = vscode.workspace.getConfiguration('flashFocus').get<number>('activationDelay', 100);

    pendingFlash = setTimeout(() => {
      flashAroundCursor();
      pendingFlash = undefined;
    }, activationDelay);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand('flashFocus.focusLeft', () =>
      navigateWithFlash('workbench.action.navigateLeft')),

    vscode.commands.registerCommand('flashFocus.focusRight', () =>
      navigateWithFlash('workbench.action.navigateRight')),

    vscode.commands.registerCommand('flashFocus.focusDown', () =>
      navigateWithFlash('workbench.action.navigateDown')),

    vscode.commands.registerCommand('flashFocus.focusUp', () =>
      navigateWithFlash('workbench.action.navigateUp')),
  );
}

export function deactivate() { }
