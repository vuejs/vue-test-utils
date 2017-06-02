import { compileToFunctions } from 'vue-template-compiler'

function addSlots (vm, slots) {
  Object.keys(slots).forEach((key) => {
    const slotsObj = slots[key]
    if (!(Array.isArray(slots[key])) &&
        !(slotsObj !== null && typeof slotsObj === 'object') &&
        typeof slots[key] !== 'string') {
      throw new Error('slots[key] must be a Component, string or an array of Components')
    }
    const isArray = Array.isArray(slotsObj)

    if (isArray) {
      Object.keys(slotsObj).forEach((objKey) => {
        if (Array.isArray(vm.$slots[key])) {
          if (typeof slotsObj[objKey] === 'string') {
            vm.$slots[key].push(vm.$createElement(compileToFunctions(slotsObj[objKey])))
          } else {
            vm.$slots[key].push(vm.$createElement(slotsObj[objKey]))
          }
        } else {
          if (typeof slotsObj[objKey] === 'string') {
            vm.$slots[key] = [vm.$createElement(compileToFunctions(slotsObj[objKey]))]
          } else {
            vm.$slots[key] = [vm.$createElement(slotsObj[objKey])] // eslint-disable-line no-param-reassign,max-len
          }
        }
      })
    } else if (Array.isArray(vm.$slots[key])) {
      if (typeof slotsObj === 'string') {
        vm.$slots[key].push(vm.$createElement(compileToFunctions(slotsObj)))
      } else {
        vm.$slots[key].push(vm.$createElement(slotsObj))
      }
    } else {
      if (typeof slotsObj === 'string') {
        vm.$slots[key] = [vm.$createElement(compileToFunctions(slotsObj))]
      } else {
        vm.$slots[key] = [vm.$createElement(slotsObj)] // eslint-disable-line no-param-reassign,max-len
      }
    }
  })
}

export default addSlots
