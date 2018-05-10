// @flow

function getOptions (key, options, config) {
  if (options ||
    (config[key] && Object.keys(config[key]).length > 0)) {
    if (options instanceof Function) {
      return options
    } else if (Array.isArray(options)) {
      return [
        ...options,
        ...Object.keys(config[key] || {})]
    } else if (!(config[key] instanceof Function)) {
      return {
        ...config[key],
        ...options
      }
    } else {
      throw new Error(`Config can't be a Function.`)
    }
  }
}

export function mergeOptions (
  options: Options,
  config: Options
): Options {
  return {
    ...options,
    logModifiedComponents: config.logModifiedComponents,
    stubs: getOptions('stubs', options.stubs, config),
    mocks: getOptions('mocks', options.mocks, config),
    methods: getOptions('methods', options.methods, config),
    provide: getOptions('provide', options.provide, config)
  }
}

