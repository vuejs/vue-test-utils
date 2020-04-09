import {
  isPlainObject,
  isFunctionalComponent,
  isConstructor,
  isDomSelector,
  isHTMLElement
} from './validators'
import { VUE_VERSION } from './consts'
import { compileTemplateForSlots } from './compile-template'
import { throwError, warn } from './util'
import { validateSlots } from './validate-slots'

function vueExtendUnsupportedOption(option) {
  return (
    `options.${option} is not supported for ` +
    `components created with Vue.extend in Vue < 2.3. ` +
    `You can set ${option} to false to mount the component.`
  )
}
// these options aren't supported if Vue is version < 2.3
// for components using Vue.extend. This is due to a bug
// that means the mixins we use to add properties are not applied
// correctly
const UNSUPPORTED_VERSION_OPTIONS = ['mocks', 'stubs', 'localVue']

export function validateOptions(options, component) {
  if (
    options.attachTo &&
    !isHTMLElement(options.attachTo) &&
    !isDomSelector(options.attachTo)
  ) {
    throwError(
      `options.attachTo should be a valid HTMLElement or CSS selector string`
    )
  }
  if ('attachToDocument' in options) {
    warn(
      `options.attachToDocument is deprecated in favor of options.attachTo and will be removed in a future release`
    )
  }
  if (options.parentComponent && !isPlainObject(options.parentComponent)) {
    throwError(
      `options.parentComponent should be a valid Vue component options object`
    )
  }

  if (!isFunctionalComponent(component) && options.context) {
    throwError(
      `mount.context can only be used when mounting a functional component`
    )
  }

  if (options.context && !isPlainObject(options.context)) {
    throwError('mount.context must be an object')
  }

  if (VUE_VERSION < 2.3 && isConstructor(component)) {
    UNSUPPORTED_VERSION_OPTIONS.forEach(option => {
      if (options[option]) {
        throwError(vueExtendUnsupportedOption(option))
      }
    })
  }

  if (options.slots) {
    compileTemplateForSlots(options.slots)
    // validate slots outside of the createSlots function so
    // that we can throw an error without it being caught by
    // the Vue error handler
    // $FlowIgnore
    validateSlots(options.slots)
  }
}
