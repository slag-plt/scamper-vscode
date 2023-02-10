import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'
import { radioGroupTemplate } from '@microsoft/fast-foundation'
import { echar, Exp, Stmt } from 'scamper-lang/dist/lang'

/**
 * since the evaluated programstate is a promise we need to access it inside an 
 * async function
 * This function evaluates the expressions and return each inlay hint in an array 
 * @param src 
 * @param document 
 * @returns InlayHints[]
 */
async function getEvaluated(src: string, document: vscode.TextDocument): Promise<vscode.InlayHint[]>{
  const output: vscode.ProviderResult<vscode.InlayHint[]> = []
  const program = scamper.compileProgram(src)
  const prog = program.tag === 'ok' ? program.value : null
  const  resultProg =  new scamper.ProgramState(prog!).evaluate()
  let evaluated: Stmt[]
  const t = await resultProg.then((x) => {
    if (x.isFullyEvaluated()){
      evaluated = x.prog
    }
    
  })
   
  
  prog?.forEach((statement, index) => {
    let holdState = evaluated[index] //this is the statement that is being evaluated
    
    switch (statement.tag) {
      case 'define': {
        switch (holdState.tag) {
          case "error": {
            const error = "error"
            const errors = holdState.range
            let position= new vscode.Position(errors.end.line, errors.end.column)
            const label = [new vscode.InlayHintLabelPart(" --> "+ error)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          default: {
            break
          }
        }
        break
      }
      case 'import': {
        switch (holdState.tag) {
          case "error": {
            const error = "error"
            const errors = holdState.range
            let position= new vscode.Position(errors.end.line, errors.end.column)
            const label = [new vscode.InlayHintLabelPart( " --> "+error)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          default: {
            break
          }
        }
        break
      }
      case 'struct': {
        switch (holdState.tag) {
          case "error": {
            const error = "error"
            const errors = holdState.range
            let position= new vscode.Position(errors.end.line, errors.end.column)
            const label = [new vscode.InlayHintLabelPart( " --> "+error)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          default: {
            break
          }
        }
        break
      }
      case 'exp': {
        switch (holdState.tag) {
          case 'value':{
            const pos = statement.value.range.end
            //using the unevaluated expression to get the position
            const column = pos.column >= scamper.expToString(0, statement.value, false).length? pos.column: scamper.expToString(0, statement.value, false).length
            const position = new vscode.Position(pos.line, column)//deal with offset in column
            holdState
            const expStr =  holdState.output? holdState.output : 'void'
            const label = [new vscode.InlayHintLabelPart(" --> "+expStr)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          case "error": {
            const error = "error!!" // accessing the evaluated error statement leads to loss of all errors in the list i don't know why yet
            const errors = statement.range
            let position= new vscode.Position(errors.end.line, errors.end.column+1)
            const label = [new vscode.InlayHintLabelPart(" --> "+ error)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          default: {
            const expStr =  scamper.expToString(0, statement.value, false)
            const posH = src.indexOf(expStr) + expStr.length
            const label = [new vscode.InlayHintLabelPart(" --> "+"exp not evaluated "+expStr)]
            const hint = new vscode.InlayHint(document.positionAt(posH), label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
        }
        break
      }
      case 'testcase': {
        switch (holdState.tag) {
          case 'testresult':{
            const pos = statement.actual.range.end
            const position = new vscode.Position(pos.line, pos.column)
            const bool = holdState.passed? "True" : "False"
            const label = [new vscode.InlayHintLabelPart(" --> "+bool)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          case "error": {
            const error = "error!!!"
            const errors = statement.range
            let position= new vscode.Position(errors.end.line, errors.end.column)
            const label = [new vscode.InlayHintLabelPart(" --> "+ error)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          default: {
            break
          }
        }
        break
      }
    }
  })
  
  return output
}

/**
 * main function that creates the provider for inlayhints using the getEvaluated function
 */
export class mkInlayHints implements vscode.InlayHintsProvider<vscode.InlayHint>{
  provideInlayHints(document: vscode.TextDocument, _range: vscode.Range, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.InlayHint[]> {
    const src = document.getText()
    const output: vscode.ProviderResult<vscode.InlayHint[]> = getEvaluated(src, document) //this is the evaluated program
    
    return output
  }
}