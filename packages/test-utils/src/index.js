import shallowMount from './shallow-mount'
import mount from './mount'
import createLocalVue from './create-local-vue'
import TransitionStub from './components/TransitionStub'
import TransitionGroupStub from './components/TransitionGroupStub'
import RouterLinkStub from './components/RouterLinkStub'
import config from './config'
import { warn } from 'shared/util'

function shallow (component, options) {
  warn('shallow has been renamed to shallowMount and will be deprecated in 1.0.0')
  return shallowMount(component, options)
}

export default {
  createLocalVue,
  config,
  mount,
  shallow,
  shallowMount,
  TransitionStub,
  TransitionGroupStub,
  RouterLinkStub
}
