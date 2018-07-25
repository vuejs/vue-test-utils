// @flow

function getOption (option, config?: Object): any {
  if (option || (config && Object.keys(config).length > 0)) {
    if (option instanceof Function) {
      return option
    } else if (Array.isArray(option)) {
      return [...option, ...Object.keys(config || {})]
    } else if (config instanceof Function) {
      throw new Error(`Config can't be a Function.`)
    } else {
      return {
        ...config,
        ...option
      }
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
    logModifiedComponents: config.logModifiedComponents,
    stubs: getOption(options.stubs, config.stubs),
    mocks,
    methods,
    provide,
    sync: !!(options.sync || options.sync === undefined)
  }
}
