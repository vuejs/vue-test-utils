// @flow
import { normalizeStubs, normalizeProvide } from './normalize'
import { warn } from 'shared/util'

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
  const normalizedConfigStubs = normalizeStubs(configStubs)
  return getOption(normalizedStubs, normalizedConfigStubs)
}

export function mergeOptions(
  options: Options,
  config: Config
): NormalizedOptions {
  const mocks = (getOption(options.mocks, config.mocks): Object)
  const methods = (getOption(options.methods, config.methods): {
    [key: string]: Function
  })

  if (config.methods && Object.keys(config.methods).length) {
    warn(
      `config.methods has been deprecated. It will be removed in a future release`
    )
  }

  const provide = (getOption(options.provide, config.provide): Object)
  const stubs = (getStubs(options.stubs, config.stubs): Object)
  // $FlowIgnore
  return {
    ...options,
    provide: normalizeProvide(provide),
    stubs,
    mocks,
    methods
  }
}
