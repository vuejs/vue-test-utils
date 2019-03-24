import { isPlainObject } from 'shared/validators'
import { throwError } from 'shared/util'

export function recursivelySetData(vm, target, data) {
  for (const key in data) {
    let val
    let targetVal

    const dotIndex = key.indexOf('.')
    if (dotIndex === 0) {
      throwError(`Data key cannot start with a period (evaluating '${key}').`)
    }

    if (dotIndex < 0) {
      val = data[key]
      targetVal = target[key]
    } else {
      const firstKey = key.slice(0, dotIndex)
      const remainingKey = key.slice(dotIndex + 1, key.length)

      val = { [remainingKey]: data[key] }
      targetVal = target[firstKey]
    }

    if (isPlainObject(val) && isPlainObject(targetVal)) {
      recursivelySetData(vm, targetVal, val)
    } else {
      vm.$set(target, key, val)
    }
  }
}
