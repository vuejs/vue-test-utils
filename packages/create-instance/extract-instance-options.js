// @flow

const MOUNTING_OPTIONS = [
  'attachToDocument',
  'mocks',
  'slots',
  'localVue',
  'stubs',
  'context',
  'clone',
  'attrs',
  'listeners',
  'propsData',
  'logModifiedComponents',
  'sync'
]

export default function extractInstanceOptions (
  options: Object
): Object {
  const instanceOptions = {
    ...options,
    _vueTestUtilsRootExtendOptions: true
  }
  MOUNTING_OPTIONS.forEach(mountingOption => {
    delete instanceOptions[mountingOption]
  })
  return instanceOptions
}
