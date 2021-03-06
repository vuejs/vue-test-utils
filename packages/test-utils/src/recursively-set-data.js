import { isPlainObject } from 'shared/validators'

export function recursivelySetData(vm, target, data) {
  Object.keys(data).forEach(key => {
    const val = data[key]
    const targetVal = target[key]

    if (
      isPlainObject(val) &&
      isPlainObject(targetVal) &&
      Object.keys(val).length > 0
    ) {
      recursivelySetData(vm, targetVal, val)
    } else {
      vm.$set(target, key, val)
    }
  })
}
