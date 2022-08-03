import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'

export function runProgramCommand(output: vscode.OutputChannel) {
  return function() {
    const src = vscode.window.activeTextEditor?.document.getText()
    output.clear()
    output.show(true)
    if (src === undefined) {
      output.appendLine('No source code to run!')
    } else {
      const prog = scamper.compileProgram(src)
      if (prog.tag === 'error') {
        output.appendLine(`${scamper.errorToString(prog)}`)
      } else {
        const result = new scamper.ProgramState(prog.value).evaluate()
        result.prog.forEach(s => {
          if (s.tag === 'value') {
            output.appendLine(scamper.expToString(s.value))
          }
        })
      }
    }
  }
}