import { isPlainObject } from 'shared/validators'
import { throwError } from 'shared/util'

export function recursivelySetData(vm, target, data) {
  for (const key in data) {
    const dotIndex = key.indexOf('.')
    if (dotIndex === 0) {
      throwError(`Data key cannot start with a period (evaluating '${key}').`)
    }

    if (dotIndex < 0) {
      const val = data[key]
      const targetVal = target[key]

      if (isPlainObject(val) && isPlainObject(targetVal)) {
        recursivelySetData(vm, targetVal, val)
      } else {
        vm.$set(target, key, val)
      }
    } else {
      const firstKey = key.slice(0, dotIndex)
      const remainingKey = key.slice(dotIndex + 1, key.length)
      const val = { [remainingKey]: data[key] }
      const targetVal = target[firstKey]

      if (isPlainObject(targetVal)) {
        recursivelySetData(vm, targetVal, val)
      } else {
        vm.$set(target, firstKey, data)
      }
    }
  }
}
