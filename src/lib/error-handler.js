export default function errorHandler (errorOrString, vm) {
  const error = (typeof errorOrString === 'object')
    ? errorOrString
    : new Error(errorOrString)

  vm._error = error

  throw error
}
