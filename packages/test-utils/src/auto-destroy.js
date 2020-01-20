// @flow

import { throwError } from 'shared/util'
import Wrapper from './wrapper'

let isEnabled = false
const wrapperInstances = []

export function resetAutoDestroyState() {
  isEnabled = false
  wrapperInstances.length = 0
}

export function enableAutoDestroy(hook: (() => void) => void) {
  if (isEnabled) {
    throwError('enableAutoDestroy cannot be called more than once')
  }

  isEnabled = true

  hook(() => {
    wrapperInstances.forEach((wrapper: Wrapper) => {
      // skip child wrappers created by wrapper.find()
      if (wrapper.selector) return

      wrapper.destroy()
    })

    wrapperInstances.length = 0
  })
}

export function trackInstance(wrapper: Wrapper) {
  if (!isEnabled) return

  wrapperInstances.push(wrapper)
}
