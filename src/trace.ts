import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'

function getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

export function traceProgramCommand(extensionUri: vscode.Uri) {
	return function() {
		console.log(extensionUri)
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

			const toolkitUri = getUri(panel.webview, extensionUri, [
				"node_modules",
				"@vscode",
				"webview-ui-toolkit",
				"dist",
				"toolkit.js", // A toolkit.min.js file is also available
			]);
			console.log(toolkitUri)

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
				} else if (msg.command === 'reset') {
					trace.resetProg()
				}
				panel.webview.postMessage({
					step: trace.currentStep(),
					value: trace.currentState().toString()
				})
			})

			panel.webview.html = `<!DOCTYPE html>
				<html lang="en">
				<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
					body {
						color: var(--vscode-editor-foreground);
						font-family: var(--vscode-editor-font-family);
						font-size: var(--vscode-editor-font-size);
					}
					#panel {
						display: flex;
						height: 100%;
					}

					#controls {
						display: flex;
						justify-content: center;
						flex-direction: column;
					}

					#controls vscode-button {
						width: 100px;
						margin: 0 auto;
					}

					#step {
						text-align: center;
					}

					#display {
						padding: 10px;
						flex-grow: 1;
						flex-direction: column; 
					}

					#program {
						border: 1px solid var(--vscode-editor-foreground);
						flex-grow: 1;
					}

					#input {
						font-family: var(--vscode-editor-font-family);
						font-size: var(--vscode-editor-font-size);
						width: 100%;
					}
				</style>
				<script type="module" src="${toolkitUri}"></script>
				</head>
				<body>
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
							<vscode-text-area id="input">Additional Statements</vscode-text-area>
						</form>
					</div>
				</div>
				<script>
					const vscode = acquireVsCodeApi();

					window.addEventListener('message', event => {
						const state = event.data;
						document.getElementById('step').innerText = 'Step ' + state.step;
						document.getElementById('program').innerText = state.value;
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

					vscode.postMessage({ command: 'init' });
				</script>
				</body>
				</html>`
		}
	}
}