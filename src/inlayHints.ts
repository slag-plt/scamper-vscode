import * as vscode from 'vscode'
import * as scamper from 'scamper-lang'
import { radioGroupTemplate } from '@microsoft/fast-foundation'
import { echar, Exp, Stmt } from 'scamper-lang/dist/lang'

/**
 * These functions are really riding on the users coding method
 * ex: for binary operations thecode ex pects a space after + or not 
 * 
*/




function getAllIndexOf(str: string, s:string): number[] {
  let strCopy = str.slice()
  const result: number[] = []
  let index = strCopy.indexOf(s)
  while (index >= 0) {
    result.push(index+ (s.length) + 1)
    // strCopy = strCopy.slice(index +1, s.length)
    index = strCopy.indexOf(s, index + 1)
  }
  return result
}

type lenStr = {
  len: number ,
  str: string
}

function getExpectedBool (str: string, index: number, operation: string): lenStr {
  const strCopy = str.slice(index)
  const reg = /\#t/ || /\#f/
  const values = strCopy.match(reg)
  const len = 0
  let out : lenStr = {
    len: len,
    str: 'didnt find '
  }
  if (values) {
    const x = values[0].split(' ')[0]
    const y = values[0].split(' ')[1]
    out.len = values[0].length + 1
   
    switch(operation){
      
      case 'not': {
        const value = x === '#t' ? '#f' : '#t'
        out.str = `: !${x} = ${value}`
        return out
      }
      default: {
        out.str = 'binary operation not supported'
        return out
      }
    }
    
  } else {
    return out
  }
}


/**
 * 
 * @param str Only works for single step expressions
 * @param index where to start looking for numbers so doesn't take expressions before it
 * @param operation which opereation are we dealing with
 * @returns 
 */
function getExpected (str: string, index: number, operation: string): lenStr {
  const strCopy = str.slice(index)
  const reg = /\d+\.*\d*\s\d+\.*\d*/
  const values = strCopy.match(reg)
  const len = 0
  let out : lenStr = {
    len: len,
    str: ''
  }
  if (values) {
    out.len = values[0].length + 1
    const x = values[0].split(' ')[0]
    const y =values[0].split(' ')[1]
    
    if (isNaN(parseFloat(x)) || isNaN(parseFloat(y))) {
      return out
    } else {
      switch(operation){
        case '+': {
          const value = parseFloat(x) + parseFloat(y)
          out.str = `: ${x} + ${y} = ${value}`
          return out
        }
        case '-': {
          const value = parseFloat(x) - parseFloat(y)
          out.str = `: ${x} - ${y} = ${value}`
          return out
        }
        case '*': {
          const value = parseFloat(x) * parseFloat(y)
          out.str = `: ${x} * ${y} = ${value}`
          return out
        }
        case '/': {
          const value = parseFloat(x) / parseFloat(y)
          out.str = `: ${x} / ${y} = ${value}`
          return out
        }
        case 'modulo': {
          const value = parseFloat(x) % parseFloat(y)
          out.str = `: ${x} % ${y} = ${value}`
          return out
        }
        case '<': {
          const value = parseFloat(x) < parseFloat(y) ? '#t' : '#f'
          out.str = `: ${x} < ${y} = ${value}`
          return out
        }
        case '>': {
          const value = parseFloat(x) > parseFloat(y) ? '#t' : '#f'
          out.str = `: ${x} > ${y} = ${value}`
          return out
        }
        case '<=': {
          const value = parseFloat(x) <= parseFloat(y) ? '#t' : '#f'
          out.str = `: ${x} <= ${y} = ${value}`
          return out
        }
        case '>=': {
          const value = parseFloat(x) >= parseFloat(y) ? '#t' : '#f'
          out.str = `: ${x} >= ${y} = ${value}`
          return out
        }
        case '=': {
          const value = parseFloat(x) === parseFloat(y) ? '#t' : '#f'
          out.str = `: ${x} === ${y} = ${value}`
          return out
        }
        default: {
          out.str = 'binary operation not supported'
          return out
        }
      }
    }
  } else {
    return out
  }
}



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
            const error = ""
            const errors = holdState.errors
            let position: vscode.Position
            holdState.errors.forEach((err, i) => {
              error + err.message
              position = new vscode.Position(errors[i].range!.end.line, errors[i].range!.end.column)
              const label = [new vscode.InlayHintLabelPart( error)]
              const hint = new vscode.InlayHint(position, label)
              hint.paddingLeft = true
              output.push(hint) 
            })
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
            const error = ""
            const errors = holdState.errors
            let position: vscode.Position
            holdState.errors.forEach((err, i) => {
              error + err.message
              position = new vscode.Position(errors[i].range!.end.line, errors[i].range!.end.column)
              const label = [new vscode.InlayHintLabelPart( error)]
              const hint = new vscode.InlayHint(position, label)
              hint.paddingLeft = true
              output.push(hint) 
            })
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
            const error = ""
            const errors = holdState.errors
            let position: vscode.Position
            holdState.errors.forEach((err, i) => {
              error + err.message
              position = new vscode.Position(errors[i].range!.end.line, errors[i].range!.end.column)
              const label = [new vscode.InlayHintLabelPart( error)]
              const hint = new vscode.InlayHint(position, label)
              hint.paddingLeft = true
              output.push(hint) 
            })
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
            const expStr =  holdState.output ? holdState.output : 'void'
            const label = [new vscode.InlayHintLabelPart(expStr)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          case "error": {
            const error = ""
            const errors = holdState.errors
            let position: vscode.Position
            errors.forEach((err, i) => {
              error + err.message
              position = new vscode.Position(errors[i].range!.end.line, errors[i].range!.end.column)
              const label = [new vscode.InlayHintLabelPart( error)]
              const hint = new vscode.InlayHint(position, label)
              hint.paddingLeft = true
              output.push(hint) 
            })
            break
          }
          default: {
            const expStr =  scamper.expToString(0, statement.value, false)
            const posH = src.indexOf(expStr) + expStr.length
            const label = [new vscode.InlayHintLabelPart("exp not evaluated "+expStr)]
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
            const label = [new vscode.InlayHintLabelPart(bool)]
            const hint = new vscode.InlayHint(position, label)
            hint.paddingLeft = true
            output.push(hint)
            break
          }
          case "error": {
            const error = ""
            const errors = holdState.errors
            let position: vscode.Position
            holdState.errors.forEach((err, i) => {
              error + err.message
              position = new vscode.Position(errors[i].range!.end.line, errors[i].range!.end.column)
              const label = [new vscode.InlayHintLabelPart( error)]
              const hint = new vscode.InlayHint(position, label)
              hint.paddingLeft = true
              output.push(hint) 
            })
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
  // const cursorHint: vscode.ProviderResult<vscode.InlayHint[]> = []
  // const editor = vscode.window.activeTextEditor;
  // const position = editor?.selection.active;

  // output.forEach((hint) => {
  //   if (hint.position == position){
  //     cursorHint.push(hint)
  //     return cursorHint
  //   }
  //   return cursorHint
  // } 
  // )
  return output
}
/**
 * for defines I want to get all defined functions index get their names and save their parameters if they have any
 * then where ever the function gets called I want to show the parameters
 * issue as of now is that I'll be expecting the user to type the parameters in the next line 
 * if not the function will have no parameters
 */

export class mkInlayHints implements vscode.InlayHintsProvider<vscode.InlayHint>{
  provideInlayHints(document: vscode.TextDocument, _range: vscode.Range, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.InlayHint[]> {
    const src = document.getText()
    const pos = document.positionAt(src.indexOf("define")-1)
    const output: vscode.ProviderResult<vscode.InlayHint[]> = getEvaluated(src, document) //this is the evaluated program
    

    return output
  }
  
}