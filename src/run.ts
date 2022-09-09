import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'
import * as webview from './webview'

let currentPanel: vscode.WebviewPanel | undefined = undefined

export function runProgramCommand(extensionUri: vscode.Uri) {
	return function() {
		const src = vscode.window.activeTextEditor?.document.getText()
		if (src === undefined) {
			vscode.window.showErrorMessage('No source code to run!')
		} else {
			if (currentPanel !== undefined) {
				currentPanel.dispose()
			}
			currentPanel = vscode.window.createWebviewPanel(
				'scamper-exploration',
				`Scamper: Output`,
				vscode.ViewColumn.Beside,
				{ enableScripts: true })

      let body = `<pre class="scamper-output language-racket">${src}</pre>`
			currentPanel.webview.html = webview.emitHTMLDocument(extensionUri, currentPanel.webview, '', body)
		}
	}
}