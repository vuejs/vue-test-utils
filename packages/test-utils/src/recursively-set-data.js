import { isPlainObject } from 'shared/validators'

export function recursivelySetData (vm, target, obj) {
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    if (isPlainObject(val)) {
      recursivelySetData(vm, target[key], val)
    } else {
      vm.$set(target, key, val)
    }
  })
}
