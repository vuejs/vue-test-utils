// @flow

import { throwError } from './util'
import { compileToFunctions } from 'vue-template-compiler'

export function validateStubOptions (stubOptions: Array<string> | Object) {
  if (Array.isArray(stubOptions)) {
    if (containsNonStringItem(stubOptions)) {
      throwError('each item in an options.stubs array must be a string')
    }
  } else {
    if (containsInvalidOptions(stubOptions)) {
      throwError('options.stub values must be passed a string or component')
    }

    if (necessaryCompileToFunctionsMissed(stubOptions)) {
      throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined')
    }
  }
}

function containsNonStringItem (array: Array<string>): boolean {
  return array.some(name => typeof name !== 'string')
}

function necessaryCompileToFunctionsMissed (stubOptions: Object): boolean {
  return Object.keys(stubOptions)
    .map(key => stubOptions[key])
    .some(stub => typeof stub === 'string') && !compileToFunctions
}

function containsInvalidOptions (stubOptions: Object): boolean {
  return Object.keys(stubOptions)
    .map(key => stubOptions[key])
    .some(isInvalidStubOption)
}

function isInvalidStubOption (stub): boolean {
  return !['string', 'boolean'].includes(typeof stub) && !isVueComponent(stub)
}

function isVueComponent (cmp) {
  return cmp && (cmp.render || cmp.template || cmp.options)
}
