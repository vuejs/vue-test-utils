// @flow

import _createLocalVue from 'shared/create-local-vue'

/**
 * Returns a local vue instance to add components, mixins and install plugins without polluting the global Vue class
 * @param {VueConfig} config
 * @returns {Component}
 */
function createLocalVue(config: VueConfig = {}): Component {
  return _createLocalVue(undefined, config)
}

export default createLocalVue
