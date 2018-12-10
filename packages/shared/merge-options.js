// @flow
import { normalizeStubs } from './normalize'

function getOption (option, config?: Object): any {
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

export function mergeOptions (options: Options, config: Config): Options {
  const mocks = (getOption(options.mocks, config.mocks): Object)
  const methods = (
    (getOption(options.methods, config.methods)): { [key: string]: Function })
  const provide = ((getOption(options.provide, config.provide)): Object)
  return {
    ...options,
    stubs: getOption(normalizeStubs(options.stubs), config.stubs),
    mocks,
    methods,
    provide,
    sync: !!(options.sync || options.sync === undefined)
  }
}
