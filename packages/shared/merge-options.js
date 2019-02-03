// @flow
import { normalizeStubs, normalizeProvide } from './normalize'
import { isPlainObject } from './validators'

function getOption(option, config?: Object): any {
  if (option === false) {
    return false
  }
  if (option || (config && Object.keys(config).length > 0)) {
    if (option instanceof Function) {
      return option
    }
    if (config instanceof Function) {
      throw new Error(`Config can't be a Function.`)
    }
    return {
      ...config,
      ...option
    }
  }
}

function getStubs(stubs, configStubs): Object {
  const normalizedStubs = normalizeStubs(stubs)
  const mergedStubs = getOption(normalizedStubs, configStubs)
  return isPlainObject(mergedStubs) ? mergedStubs : {}
}

export function mergeOptions(
  options: Options,
  config: Config
): NormalizedOptions {
  const mocks = (getOption(options.mocks, config.mocks): Object)
  const methods = (getOption(options.methods, config.methods): {
    [key: string]: Function
  })
  const provide = (getOption(options.provide, config.provide): Object)
  const stubs = (getStubs(options.stubs, config.stubs): Object)
  // $FlowIgnore We know that stubs will be an object
  return {
    ...options,
    provide: normalizeProvide(provide),
    stubs,
    mocks,
    methods,
    sync: !!(options.sync || options.sync === undefined)
  }
}
