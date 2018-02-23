import shallow from './shallow'
import mount from './mount'
import renderToString from './renderToString'
import createLocalVue from './create-local-vue'
import TransitionStub from './components/TransitionStub'
import TransitionGroupStub from './components/TransitionGroupStub'
import RouterLinkStub from './components/RouterLinkStub'
import config from './config'

export default {
  createLocalVue,
  config,
  mount,
  shallow,
  renderToString,
  TransitionStub,
  TransitionGroupStub,
  RouterLinkStub
}
