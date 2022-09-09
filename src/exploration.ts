import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'
import * as webview from './webview'

let currentPanel: vscode.WebviewPanel | undefined = undefined

export function traceProgramCommand(extensionUri: vscode.Uri) {
	return function() {
		const src = vscode.window.activeTextEditor?.document.getText()
		if (src === undefined) {
			vscode.window.showErrorMessage('No source code to run!')
		}
		if (currentPanel !== undefined) {
			currentPanel.dispose()
		}
		currentPanel = vscode.window.createWebviewPanel(
			'scamper-exploration',
			`Scamper: Program Explorer`,
			vscode.ViewColumn.Beside,
			{ enableScripts: true })

		const body = `
			<div id="panel" class='scamper-exploration'>
				<div id="controls">
					<vscode-button appearance="primary" class="step-forward">Step (→)</vscode-button>
					<vscode-button appearance="primary" class="step-backward">Step (←)</vscode-button>
					<vscode-button appearance="secondary" class="stmt-forward">Stmt (→)</vscode-button>
					<vscode-button appearance="secondary" class="stmt-backward">Stmt (←)</vscode-button>
					<vscode-button appearance="secondary" class="eval">Evaluate</vscode-button>
					<vscode-button appearance="secondary" class="reset">Reset</vscode-button>
					<span id="step" class="step-counter">Step</span>
				</div>
				<div id="display">
					<pre id="program" class="program language-racket">${src}</pre>
					<form id="repl-form">
						<vscode-text-area id="input" class="add-statement-input" placeholder="(+ 1 1)">Additional Statements</vscode-text-area>
					</form>
					<vscode-button appearance="primary" id="add" class="add-statement">Add</vscode-button>
				</div>
			</div>`

			currentPanel.webview.html = webview.emitHTMLDocument(extensionUri, currentPanel.webview, '', body)
	}
}