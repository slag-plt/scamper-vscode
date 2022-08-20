import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'
import * as webview from './webview'

export function traceProgramCommand(extensionUri: vscode.Uri) {
	return function() {
		const src = vscode.window.activeTextEditor?.document.getText()
		if (src === undefined) {
			vscode.window.showErrorMessage('No source code to run!')
		} else {
			const result = scamper.compileProgram(src)
			if (result.tag === 'error') {
				vscode.window.showErrorMessage('Please fix any errors in your code before tracing!')
				return
			} 
			const trace: scamper.ProgramTrace = new scamper.ProgramTrace(new scamper.ProgramState(result.value))
			const panel = vscode.window.createWebviewPanel(
				'scamper-exploration',
				`Scamper: Program Exploration (${vscode.window.activeTextEditor?.document.fileName})`,
				vscode.ViewColumn.Beside,
				{ enableScripts: true })

			panel.webview.onDidReceiveMessage(msg => {
				if (msg.command === 'init') {
					// TODO: Nothing to do?
				} else if (msg.command === 'stepF') {
					trace.stepForward()
				} else if (msg.command === 'stepB') {
					trace.stepBackward()
				} else if (msg.command === 'stmtF') {
					trace.evalNextStmt()
				} else if (msg.command === 'stmtB') {
					trace.revertPrevStmt()
				} else if (msg.command === 'eval') {
					trace.evaluateProg()
				} else if (msg.command === 'add') {
					trace.addStmt(msg.value)
					trace.evaluateProg()
				} else if (msg.command === 'reset') {
					trace.resetProg()
				}
				panel.webview.postMessage({
					step: trace.currentStep(),
					value: scamper.programToHtml(trace.currentState().prog, true)
				})
			})

			const body = `
				<div id="panel">
					<div id="controls">
						<vscode-button appearance="primary" id="stepF">Step (→)</vscode-button>
						<vscode-button appearance="primary" id="stepB">Step (←)</vscode-button>
						<vscode-button appearance="secondary" id="stmtF">Stmt (→)</vscode-button>
						<vscode-button appearance="secondary" id="stmtB">Stmt (←)</vscode-button>
						<vscode-button appearance="secondary" id="eval">Evaluate</vscode-button>
						<vscode-button appearance="secondary" id="reset">Reset</vscode-button>
						<span id="step">Step</span>
					</div>
					<div id="display">
						<div id="program">Code</div>
						<form id="repl-form">
							<vscode-text-area id="input" placeholder="(+ 1 1)">Additional Statements</vscode-text-area>
						</form>
						<vscode-button appearance="primary" id="add">Add</vscode-button>
					</div>
				</div>
				<script>
					const vscode = acquireVsCodeApi();

					window.addEventListener('message', event => {
						const state = event.data
						document.getElementById('step').innerText = 'Step ' + state.step
						document.getElementById('program').innerHTML = state.value
						emitWidgets()
					});

					document.getElementById('stepF').onclick = () => {
						vscode.postMessage({ command: 'stepF' });
					}

					document.getElementById('stepB').onclick = () => {
						vscode.postMessage({ command: 'stepB' });
					}

					document.getElementById('stmtF').onclick = () => {
						vscode.postMessage({ command: 'stmtF' });
					}

					document.getElementById('stmtB').onclick = () => {
						vscode.postMessage({ command: 'stmtB' });
					}

					document.getElementById('eval').onclick = () => {
						vscode.postMessage({ command: 'eval' });
					}

					document.getElementById('reset').onclick = () => {
						vscode.postMessage({ command: 'reset' });
					}

					document.getElementById('add').onclick = () => {
						if (input.value.length > 0) {
							const input = document.getElementById('input')
							vscode.postMessage({ command: 'add', value: input.value })
							input.value = ""
						}
					}

					vscode.postMessage({ command: 'init' });
				</script>
				</body>
				</html>`

			panel.webview.html = webview.emitHTMLDocument(extensionUri, panel.webview, '', body)
		}
	}
}