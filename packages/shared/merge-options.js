// @flow

function getStubs (optionStubs, config) {
  if (optionStubs || Object.keys(config.stubs).length > 0) {
    if (Array.isArray(optionStubs)) {
      return [...optionStubs, ...Object.keys(config.stubs)]
    } else {
      return {
        ...config.stubs,
        ...optionStubs
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
    stubs: getStubs(options.stubs, config)
  }
}
