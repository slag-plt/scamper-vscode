import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'

const styleDecl: string = `<style>
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
    justify-content: start;
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
    padding: 5px;
    height: 90vh;
    flex-grow: 1;
    flex-direction: column; 
  }

  #program {
    border: 1px solid var(--vscode-editor-foreground);
    overflow-x: scroll;
    overflow-y: scroll;
    width: 100%;
    height: 90%;
  }

  #input {
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
    width: 100%;
    height: 10%;
  }
</style>`

function getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

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

			const toolkitUri = getUri(panel.webview, extensionUri, [
				"node_modules",
				"@vscode",
				"webview-ui-toolkit",
				"dist",
				"toolkit.js", // A toolkit.min.js file is also available
			]);

      let body = ''

			if (result.tag === 'error') {
        body = `Error(s) occurred during compilation:\n${scamper.errorToString(result)}`
			} else { 
        const state: scamper.ProgramState = new scamper.ProgramState(result.value).evaluate()
        body = scamper.programToHtml(state.prog)
      }

			panel.webview.html = `<!DOCTYPE html>
				<html lang="en">
				<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<script type="module" src="${toolkitUri}"></script>
        ${styleDecl}
        ${scamper.emitSupportScript()}
				</head>
				<body>
          ${body}
				</body>
				</html>`
		}
	}
}