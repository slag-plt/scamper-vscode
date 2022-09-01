import * as scamper from 'scamper-lang'
import * as vscode from 'vscode'

const commonStyleDecl: string = `<style>
  body {
    color: var(--vscode-editor-foreground);
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
  }

  .scamper-output {
    margin-bottom: 2em;
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
    white-space: pre-wrap;
    padding: 1em;
  }

  #input {
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
    width: 100%;
    height: 10%;
  }
</style>`

export function getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

export function emitHTMLDocument (extensionUri: vscode.Uri, webview: vscode.Webview, head: string, body: string) {
  const toolkitUri = getUri(webview, extensionUri, [
    "node_modules",
    "@vscode",
    "webview-ui-toolkit",
    "dist",
    "toolkit.min.js",
  ])

  const scamperBundleUri = getUri(webview, extensionUri, [
    'node_modules',
    'scamper-lang',
    'dist',
    'web',
    'bundle.js'
  ])

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="module" src="${toolkitUri}"></script>
    ${commonStyleDecl}
    ${head}
  </head>
  <body>
    ${body}
    <script src="${scamperBundleUri}"></script>
    <script>
      replaceCodeWidgets()
    </script>
  </body>
  </html>`
}
