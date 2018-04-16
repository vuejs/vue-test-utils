// @flow

function getOptions (key, options, config) {
  if (options ||
    (config[key] && Object.keys(config[key]).length > 0)) {
    if (Array.isArray(options)) {
      return [
        ...options,
        ...Object.keys(config[key] || {})]
    } else {
      return {
        ...config[key],
        ...options
      }
    }
  }
}

export function mergeOptions (
  options: Options,
  config: Options
): Options {
  return {
    ...options,
    stubs: getOptions('stubs', options.stubs, config),
    mocks: getOptions('mocks', options.mocks, config),
    methods: getOptions('methods', options.methods, config)
  }
}

