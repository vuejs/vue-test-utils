export default function deleteMountingOptions (options) {
  delete options.attachToDocument
  delete options.mocks
  delete options.slots
  delete options.localVue
  delete options.stubs
  delete options.context
  delete options.clone
  delete options.attrs
  delete options.listeners
}
