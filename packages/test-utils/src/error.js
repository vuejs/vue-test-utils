import { warn } from 'shared/util'
import { findAllInstances, findAllParentInstances } from './find'

function errorHandler(errorOrString, vm, info) {
  const error =
    typeof errorOrString === 'object' ? errorOrString : new Error(errorOrString)

  // If a user defined errorHandler was register via createLocalVue
  // find and call the user defined errorHandler
  const instancedErrorHandlers = findAllParentInstances(vm)
    .filter(
      _vm =>
        _vm &&
        _vm.$options &&
        _vm.$options.localVue &&
        _vm.$options.localVue.config &&
        _vm.$options.localVue.config.errorHandler
    )
    .map(_vm => _vm.$options.localVue.config.errorHandler)

  if (vm) {
    vm._error = error
  }

  if (!instancedErrorHandlers.length) {
    throw error
  }
  // should be one error handler, as only once can be registered with local vue
  // regardless, if more exist (for whatever reason), invoke the other user defined error handlers
  instancedErrorHandlers.forEach(instancedErrorHandler => {
    instancedErrorHandler(error, vm, info)
  })
}

export function throwIfInstancesThrew(vm) {
  const instancesWithError = findAllInstances(vm).filter(_vm => _vm._error)

  if (instancesWithError.length > 0) {
    throw instancesWithError[0]._error
  }
}

let hasWarned = false

// Vue swallows errors thrown by instances, even if the global error handler
// throws. In order to throw in the test, we add an _error property to an
// instance when it throws. Then we loop through the instances with
// throwIfInstancesThrew and throw an error in the test context if any
// instances threw.
export function addGlobalErrorHandler(_Vue) {
  const existingErrorHandler = _Vue.config.errorHandler

  if (existingErrorHandler === errorHandler) {
    return
  }

  if (_Vue.config.errorHandler && !hasWarned) {
    warn(
      `Global error handler detected (Vue.config.errorHandler). \n` +
        `Vue Test Utils sets a custom error handler to throw errors ` +
        `thrown by instances. If you want this behavior in ` +
        `your tests, you must remove the global error handler.`
    )
    hasWarned = true
  } else {
    _Vue.config.errorHandler = errorHandler
  }
}
