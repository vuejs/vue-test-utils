// @flow

import { throwError } from 'shared/util'
import Wrapper from './wrapper'

let wrapperInstances: Array<Wrapper>

export function enableAutoDestroy(hook: (() => void) => void) {
  if (wrapperInstances) {
    throwError('enableAutoDestroy cannot be called more than once')
  }

  wrapperInstances = []

  hook(() => {
    wrapperInstances.forEach((wrapper: Wrapper) => {
      // skip child wrappers created by wrapper.find()
      if (wrapper.selector) return

      wrapper.destroy()
    })
    wrapperInstances = []
  })
}

export function trackInstance(wrapper: Wrapper) {
  if (!wrapperInstances) return

  wrapperInstances.push(wrapper)
}
