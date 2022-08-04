import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'

export function mkDiagnosticsCallback(diagnostics: vscode.DiagnosticCollection) {
  return function(event: vscode.TextDocumentChangeEvent) {
    const doc = event.document
    if (doc.languageId === 'scamper') {
      const src = doc.getText()
      const result = scamper.compileProgram(src)
      diagnostics.clear()
      let errors: vscode.Diagnostic[] = []
      if (result.tag === 'error') {
        const details = result.details	
        details.forEach(err => {
          errors.push({
            range: err.range
              ? new vscode.Range(
                err.range.start.line,
                err.range.start.column,
                err.range.end.line,
                err.range.end.column+1)
              : new vscode.Range(0, 0, 0, 0),
            message: err.message,
            severity: vscode.DiagnosticSeverity.Error,
            source: 'scamper'
          })
        })
      }
      diagnostics.set(doc.uri, errors)
    }
  }
}