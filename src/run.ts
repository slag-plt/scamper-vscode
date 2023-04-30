import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'

export function runProgramCommand(scamperVersion: string, _extensionUri: vscode.Uri) {
	return function() {
		const src = vscode.window.activeTextEditor?.document.getText()
		if (src === undefined) {
			vscode.window.showErrorMessage('No source code to run!')
		} else {
			// N.B., this is the full path, so we just need to munge the extension...
			const srcFilename = vscode.window.activeTextEditor!.document.fileName
			const pageFilename = srcFilename.replace('.scm', '.html')
			const uri = vscode.window.activeTextEditor!.document.uri
			const webpage = scamper.makePage(srcFilename, scamperVersion, src)
			console.log(vscode.Uri.file(pageFilename))
			vscode.workspace.fs.writeFile(vscode.Uri.file(pageFilename), Buffer.from(webpage))
			vscode.env.openExternal(vscode.Uri.file(pageFilename))
		}
	}
}