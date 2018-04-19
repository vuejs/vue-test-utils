// @flow

import { camelize, capitalize, hyphenate, throwError } from './util'
import { compileToFunctions } from 'vue-template-compiler'

export function validateStubOptions (stubOptions: Array<string> | Object, components: any) {
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

    if (containsTemplateWithCircularReference(stubOptions, components)) {
      throwError('options.stub cannot contain a circular reference')
    }
  }
}

function containsNonStringItem (array: Array<any>) {
  return array.some(name => typeof name !== 'string')
}

function necessaryCompileToFunctionsMissed (stubOptions) {
  return Object
    .keys(stubOptions)
    .map(key => stubOptions[key])
    .some(stub => typeof stub === 'string') && !compileToFunctions
}

function containsInvalidOptions (stubOptions) {
  return Object
    .keys(stubOptions)
    .map(key => stubOptions[key])
    .some(isInvalidStubOption)
}

function containsTemplateWithCircularReference (stubOptions, components) {
  return Object.keys(stubOptions)
    .filter(stubName => typeof stubOptions[stubName] === 'string' && components[stubName])
    .some(stubName => {
      const name = components[stubName].name
      const stubValue = stubOptions[stubName]
      return [hyphenate(name), capitalize(name), camelize(name)].some(name => stubValue.includes(name))
    })
}

function isInvalidStubOption (stub) {
  return !['string', 'boolean'].includes(typeof stub) && !isVueComponent(stub)
}

function isVueComponent (cmp: any) {
  return cmp && (cmp.render || cmp.template || cmp.options)
}
