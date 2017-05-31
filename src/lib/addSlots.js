function addSlots (vm, slots) {
  Object.keys(slots).forEach((key) => {
    const slotsObj = slots[key]
    if (!(Array.isArray(slots[key])) && !(slotsObj !== null && typeof slotsObj === 'object')) {
      throw new Error('slots[key] must be a Component or an array of Components')
    }
    const isArray = Array.isArray(slotsObj)
    if (isArray) {
      Object.keys(slotsObj).forEach((objKey) => {
        if (Array.isArray(vm.$slots[key])) {
          vm.$slots[key].push(vm.$createElement(slotsObj[objKey]))
        } else {
          vm.$slots[key] = [vm.$createElement(slotsObj[objKey])] // eslint-disable-line no-param-reassign,max-len
        }
      })
    } else if (Array.isArray(vm.$slots[key])) {
      vm.$slots[key].push(vm.$createElement(slotsObj))
    } else {
      vm.$slots[key] = [vm.$createElement(slotsObj)] // eslint-disable-line no-param-reassign,max-len
    }
  })
}

export default addSlots
