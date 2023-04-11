import { isPlainObject } from 'shared/validators'
import { keys } from 'shared/util'

export function recursivelySetData(vm, target, data) {
  keys(data).forEach(key => {
    const val = data[key]
    const targetVal = target[key]

    if (
      isPlainObject(val) &&
      isPlainObject(targetVal) &&
      keys(val).length > 0
    ) {
      recursivelySetData(vm, targetVal, val)
    } else {
      vm.$set(target, key, val)
    }
  })
}
