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
    const output: vscode.ProviderResult<vscode.InlayHint[]> = []

    const program = scamper.compileProgram(src)
    const prog = program.tag === 'ok' ? program.value : null
    const  resultProg = new scamper.ProgramState(prog!).evaluate()
    // const resultTrace = resultProg.then((x) => { new scamper.ProgramTrace(x)})
    // async function getInlayHints() {
    // const hold = new scamper.ProgramTrace(resultProg)
    //what happened to testcase
    prog?.statements.forEach((statement) => {
      switch (statement.tag) {
        case 'define':{
          break
        }
        case 'import': {
          break
        }
        case 'struct': {
          break
        }
        case 'exp': {
          // resultProg.
          // let holdState: Exp| null
          // let str = "here"

          // const hProg = resultProg.then((x)=>{
          //   const trace = new scamper.ProgramTrace(x)
          //   x.stepExp(statement.value).then((val)=>{
          //     val.tag === 'ok' ? str = scamper.expToString(0, val.value, false) : null
          //   })
            
          //   //can't seem to get the evaluated value out
          
          // })
          const expStr =  scamper.expToString(0, statement.value, false)
          const posH = src.indexOf(expStr) + expStr.length
          const label = [new vscode.InlayHintLabelPart(expStr)]
          const hint = new vscode.InlayHint(document.positionAt(posH), label)
          output.push(hint)
          // why cant i get the right expToString function
          break
        }
        case 'imported': {
          break
        }
        case 'error': {
          break
        }
        case 'binding': {
          break
        }
        case 'value': {
          // pos is just indexed not the position if the expression or it is a column value
          const expStr = scamper.expToString(0, statement.value, false)
          const pos = src.indexOf(expStr) + expStr.length
          const label = [new vscode.InlayHintLabelPart(expStr)]
          // const pos = index
          // const label = [new vscode.InlayHintLabelPart(scamper.expToString(0, statement.value, false))]
          const hint = new vscode.InlayHint(document.positionAt(pos), label)
          output.push(hint)
          
          break
        }
        case 'testcase': {
          break
        }
      }
    })

    const defineHint = [new vscode.InlayHintLabelPart('function definition: ')]
    //binary operations
   
    // const holdAdd = getAllIndexOf(src, "+")
    // holdAdd.forEach((element) => {
    //   const expected = getExpected(src, element, "+")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })

    // const holdMinus = getAllIndexOf(src, "-")
    // holdMinus.forEach((element) => {
    //   const expected = getExpected(src, element, "-")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })

    // const holdTimes = getAllIndexOf(src, "*")
    // holdTimes.forEach((element) => {
    //   const expected = getExpected(src, element, "*")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })

    // const holdDiv = getAllIndexOf(src, "/")
    // holdDiv.forEach((element) => {
    //   const expected = getExpected(src, element, "/")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })

    // const holdMod = getAllIndexOf(src, "modulo")
    // holdMod.forEach((element) => {
    //   const expected = getExpected(src, element, "modulo")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })

    // const holdLess = getAllIndexOf(src, "<")
    // holdLess.forEach((element) => {
    //   const expected = getExpected(src, element, "<")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })

    // const holdGr = getAllIndexOf(src, ">")
    // holdGr.forEach((element) => {
    //   const expected = getExpected(src, element, ">")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })

    // const holdLessEq = getAllIndexOf(src, "<=")
    // holdLessEq.forEach((element) => {
    //   const expected = getExpected(src, element, "<=")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })
    
    // const holdGrEq = getAllIndexOf(src, ">=")
    // holdGrEq.forEach((element) => {
    //   const expected = getExpected(src, element, ">=")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   output.push(hint)
    // })
    
    // const holdNot = getAllIndexOf(src, "not")
    // holdNot.forEach((element) => {
    //   const expected = getExpectedBool(src, element, "not")
    //   const poshold = document.positionAt(element + expected.len!)
    //   const hold = [new vscode.InlayHintLabelPart(expected.str)]
    //   const hint = new vscode.InlayHint(poshold, hold)
    //   hint.paddingRight = true
    //   output.push(hint)
    // })


    // output.push(new vscode.InlayHint(pos, defineHint))
    return output
  }
  // return function(event: vscode.TextDocumentChangeEvent){
  //   const doc = event.document
  //   if (doc.languageId === 'scamper') {
  //     const src = doc.getText()
  //     const pos = new vscode.Position(0, 0)
  //     const hint = new vscode.InlayHint(pos, 'string: hints available here')
  //     const hints = [hint]
  //     const provider = new InlayHintsProvider(hints)
  //     vscode.languages.registerInlayHintsProvider('scamper',
  //   }
  // }
}