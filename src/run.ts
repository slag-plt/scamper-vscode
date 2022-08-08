import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'
import * as webview from './webview'

export function runProgramCommand(extensionUri: vscode.Uri) {
	return function() {
		const src = vscode.window.activeTextEditor?.document.getText()
		if (src === undefined) {
			vscode.window.showErrorMessage('No source code to run!')
		} else {
			const result = scamper.compileProgram(src)

			const panel = vscode.window.createWebviewPanel(
				'scamper-exploration',
				`Scamper: Output (${vscode.window.activeTextEditor?.document.fileName})`,
				vscode.ViewColumn.Beside,
				{ enableScripts: true })

      let body = ''

			if (result.tag === 'error') {
        body = `Error(s) occurred during compilation:\n${scamper.errorToString(result)}`
			} else { 
        const state: scamper.ProgramState = new scamper.ProgramState(result.value).evaluate()
        body = `${scamper.programToHtml(state.prog)}
				<script>
					renderAllDrawings()
				</script>
				`
      }

			panel.webview.html = webview.emitHTMLDocument(extensionUri, panel.webview, '', body)
		}
	}
}