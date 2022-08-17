import * as vscode from 'vscode'
import { DocProvider } from './docs'
import { traceProgramCommand } from './exploration'
import { mkDiagnosticsCallback } from './diagnostics'
import { runProgramCommand } from './run'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('scamper.traceProgram', traceProgramCommand(context.extensionUri)))

  context.subscriptions.push(vscode.commands.registerCommand('scamper.runProgram', runProgramCommand(context.extensionUri)))

  const diagnostics = vscode.languages.createDiagnosticCollection('scm');
  vscode.workspace.onDidChangeTextDocument(mkDiagnosticsCallback(diagnostics))
  context.subscriptions.push(diagnostics)

  context.subscriptions.push(vscode.window.registerWebviewViewProvider('scamper-libs', new DocProvider(context.extensionUri)))

  console.log('scamper-vscode extension loaded!')
}

// this method is called when your extension is deactivated
export function deactivate() { }
