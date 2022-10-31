import { marked } from 'marked'
import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'

import * as webview from './webview'

function libToHTML(lib: string): string {
  const env = lib === 'Prelude' ? scamper.preludeEnv : scamper.internalLibs.get(lib)!
  return `
    <vscode-button style="width: 100%;" appearance="primary" class="binding">${lib}</vscode-button>
    <div style="display: none;" class="description">
      ${Array.from(env.items()).map(b => entryToHTML(b[0], b[1])).join('\n')}
    </div>
  `
}

function entryToHTML(name: string, entry: scamper.Lang.EnvEntry): string {
  return `
    <vscode-button style="width: 100%;" appearance="secondary" class="binding">${webview.sanitize(name)}</vscode-button>
    <div style="display: none;" class="description">${entry.doc ? marked(entry.doc.docToMarkdown()) : '<em>No documentation available</em>'}</div> 
  `
}

export class DocProvider implements vscode.WebviewViewProvider {

  view?: vscode.WebviewView
  
  constructor(public extensionUri: vscode.Uri) { }

  resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void {
    this.view = webviewView
    this.view.webview.options = {
			enableScripts: true,
			localResourceRoots: [ this.extensionUri ]
		};
    const body = ['Prelude'].concat(Array.from(scamper.internalLibs.keys())).map(libToHTML).join('<vscode-divider></vscode-divider>')
    const script = `
      <script>
        const bindings = Array.from(document.getElementsByClassName("binding"))
        bindings.forEach(b => {
          b.addEventListener('click', () => {
            const content = b.nextElementSibling
            if (content.style.display == "block") {
              content.style.display = "none"
            } else {
              content.style.display = "block"
            }
          })
        })
      </script>
    `
    this.view.webview.html = webview.emitHTMLDocument(this.extensionUri, this.view.webview, '', [body, script].join('\n'))
  }
}