import shallowMount from './shallow-mount'
import mount from './mount'
import { enableAutoDestroy, resetAutoDestroyState } from './auto-destroy'
import createLocalVue from './create-local-vue'
import RouterLinkStub from './components/RouterLinkStub'
import createWrapper from './create-wrapper'
import Wrapper from './wrapper'
import WrapperArray from './wrapper-array'
import ErrorWrapper from './error-wrapper'
import config from './config'
import { warn } from 'shared/util'

function shallow(component, options) {
  warn(
    `shallow has been renamed to shallowMount. shallow ` +
      `will be removed in 1.0.0, use shallowMount instead`
  )
  return shallowMount(component, options)
}

export {
  createLocalVue,
  createWrapper,
  config,
  enableAutoDestroy,
  mount,
  resetAutoDestroyState,
  shallow,
  shallowMount,
  RouterLinkStub,
  Wrapper,
  WrapperArray,
  ErrorWrapper
}
