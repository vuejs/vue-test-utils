function errorMessage (msg, info) {
  if (info) {
    return `${msg} : additional info ${info}`
  }

  return msg
}

export default function errorHandler (err, _vm, info) {
  if ((typeof err === 'object') && err.message) {
    if (info) {
      err.message = errorMessage(err.message, info)
    }

    throw err
  }

  throw new Error(errorMessage(err, info))
}
