import * as scamper from 'scamper-lang'
import * as vscode from 'vscode'

// HACK: '<?' turns into a comment. It looks like whenever we inject
// code into a page to be picked up by Scamper, we need to escape
// this sequence with appropriate HTML entities. Scamper does this
// internally as it manipulates the DOM, but we also need to do this
// whenever we initially inject a page with code. Need to figure out
// why this happens and how to inject code in an appropriate fashion.
// Maybe this means fully escaping all special HTML entities, not
// just this combination?
export const sanitize = (s: string): string => s.replace('<?', '&lt;?')

const commonStyleDecl: string = `<style>
  body {
    color: var(--vscode-editor-foreground);
    font-family: var(--vscode-editor-font-family);
    font-size: var(--vscode-editor-font-size);
  }

  .language-racket {
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

export function registerFSHandler(webview: vscode.Webview) {
  webview.onDidReceiveMessage(async (message) => {
    if (message.command === 'fs-read') {
      if (vscode.workspace.workspaceFolders === undefined) {
        webview.postMessage({ command: 'fs-read-result', data: undefined })
      } else {
        // N.B., for now only support _one_ workspace folder!
        const path = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, message.data)
        const text = await vscode.workspace.openTextDocument(path).then(doc => doc.getText(), _ => undefined)
        webview.postMessage({ command: 'fs-read-result', data: text })
      }
    }
  })
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

  return sanitize(`<!DOCTYPE html>
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
      (function() {
        const vscode = acquireVsCodeApi()

        class Provider {
          read(path) {
            return new Promise((resolve, reject) => {
              vscode.postMessage({
                command: 'fs-read',
                data: path
              })
              window.addEventListener('message', event => {
                const message = event.data
                if (message.command === 'fs-read-result') {
                  if (message.data !== undefined) {
                    resolve(ok(message.data))
                  } else {
                    reject()
                  }
                }
              })
            })
          }

          write(path, data) {
            throw new Error('Not implemented!')
          }
        }

        registerFs('', new Provider())
        replaceCodeWidgets()
      })()
    </script>
  </body>
  </html>`)
}
