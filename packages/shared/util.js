// @flow

export function throwError (msg: string) {
  throw new Error(`[vue-test-utils]: ${msg}`)
}

export function warn (msg: string) {
  console.error(`[vue-test-utils]: ${msg}`)
}

export function camelize (str: string): string {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

export function capitalize (str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function hyphenate (str: string): string {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}
