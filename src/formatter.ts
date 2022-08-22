import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'

export class DocFormatter implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(document: vscode.TextDocument, 
                                   _options: vscode.FormattingOptions,
                                   _token: vscode.CancellationToken): vscode.TextEdit[] {
      const original = document.getText()
      const formatted = scamper.Formatter.format(original)
      return [new vscode.TextEdit(new vscode.Range(0, 0, document.lineCount, 0), formatted)]
    }
}