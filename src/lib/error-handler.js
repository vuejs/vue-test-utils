function errorMessage (message, info) {
  if (info) {
    return `${message} : additional info ${info}`
  }

  return message
}

export default function errorHandler (errorOrString, vm, info) {
  const error = (typeof errorOrString === 'object')
    ? errorOrString
    : new Error(errorOrString)

  error.message = errorMessage(error.message, info)
  vm._error = error

  throw error
}
