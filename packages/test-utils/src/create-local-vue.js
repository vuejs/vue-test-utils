// @flow

import _createLocalVue from 'shared/create-local-vue'

function createLocalVue(config: VueConfig = {}): Component {
  return _createLocalVue(undefined, config)
}

export default createLocalVue
