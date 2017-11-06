import errorHandler from '../../../../src/lib/error-handler'

describe('errorHandler', () => {
  const errorString = 'errorString'
  const info = 'additional info provided by vue'
  const errorObject = new Error(errorString)

  it('when error object: rethrows error', () => {
    expect(() => errorHandler(errorObject)).to.throw().with.property('message', errorString)
  })

  it('when error object: rethrown error contains vue info when provided', () => {
    expect(() => errorHandler(errorObject, {}, info)).to.throw().that.satisfies(function (err) {
      const errorMessage = err.message

      return errorMessage.includes(errorString) && errorMessage.includes(info)
    })
  })

  it('when error string: throws error with string', () => {
    expect(() => errorHandler(errorString)).to.throw().with.property('message', errorString)
  })

  it('throws error with string and appends info when provided', () => {
    expect(() => errorHandler(errorString, {}, info)).to.throw().that.satisfies(function (err) {
      const errorMessage = err.message

      return errorMessage.includes(errorString) && errorMessage.includes(info)
    })
  })
})
