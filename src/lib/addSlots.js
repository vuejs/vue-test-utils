import { compileToFunctions } from 'vue-template-compiler'

function addSlotToVm (vm, slotName, slotValue) {
  if (Array.isArray(vm.$slots[slotName])) {
    if (typeof slotValue === 'string') {
      vm.$slots[slotName].push(vm.$createElement(compileToFunctions(slotValue)))
    } else {
      vm.$slots[slotName].push(vm.$createElement(slotValue))
    }
  } else {
    if (typeof slotValue === 'string') {
      vm.$slots[slotName] = [vm.$createElement(compileToFunctions(slotValue))]
    } else {
      vm.$slots[slotName] = [vm.$createElement(slotValue)] // eslint-disable-line no-param-reassign,max-len
    }
  }
}

function addSlots (vm, slots) {
  Object.keys(slots).forEach((key) => {
    if (!(Array.isArray(slots[key])) &&
        !(slots[key] !== null && typeof slots[key] === 'object') &&
        typeof slots[key] !== 'string') {
      throw new Error('slots[key] must be a Component, string or an array of Components')
    }
    const isArray = Array.isArray(slots[key])

    if (isArray) {
      slots[key].forEach((slotValue) => {
        addSlotToVm(vm, key, slotValue)
      })
    } else {
      addSlotToVm(vm, key, slots[key])
    }
  })
}

export default addSlots
