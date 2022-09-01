import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'
import * as webview from './webview'

export function runProgramCommand(extensionUri: vscode.Uri) {
	return function() {
		const src = vscode.window.activeTextEditor?.document.getText()
		if (src === undefined) {
			vscode.window.showErrorMessage('No source code to run!')
		} else {
			// const result = scamper.compileProgram(src)

			const panel = vscode.window.createWebviewPanel(
				'scamper-exploration',
				`Scamper: Output`,
				vscode.ViewColumn.Beside,
				{ enableScripts: true })

      let body = `<div class="scamper-output" id="program">${src}</div>`

			panel.webview.html = webview.emitHTMLDocument(extensionUri, panel.webview, '', body)
		}
	}
}