import * as vscode from 'vscode'
import { runProgramCommand } from './run'
import { traceProgramCommand } from './trace'
import { mkDiagnosticsCallback } from './diagnostics'

export function activate(context: vscode.ExtensionContext) {
	console.log(context.extensionUri)
  const programOutputChannel = vscode.window.createOutputChannel('Scamper')
	context.subscriptions.push(vscode.commands.registerCommand('scamper.runProgram', runProgramCommand(programOutputChannel)))
	context.subscriptions.push(vscode.commands.registerCommand('scamper.traceProgram', traceProgramCommand(context.extensionUri)))

	const diagnostics = vscode.languages.createDiagnosticCollection('scm');
	vscode.workspace.onDidChangeTextDocument(mkDiagnosticsCallback(diagnostics))
	context.subscriptions.push(diagnostics)

	console.log('scamper-vscode extension loaded!')
}

// this method is called when your extension is deactivated
export function deactivate() { }
