// @flow
import config from '../config'

function getStubs (optionStubs) {
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

export default function extractOptions (
  options: Options
): Options {
  return {
    mocks: options.mocks,
    context: options.context,
    provide: options.provide,
    stubs: getStubs(options.stubs),
    attrs: options.attrs,
    listeners: options.listeners,
    slots: options.slots,
    localVue: options.localVue
  }
}
