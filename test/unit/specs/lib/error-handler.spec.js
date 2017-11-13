import errorHandler from '../../../../src/lib/error-handler'

const errorString = 'errorString'
const errorObject = new Error(errorString)

describe('errorHandler', () => {
  it('throws error', () => {
    expect(() => errorHandler(errorObject, {})).to.throw().with.property('message', errorString)
  })

  it('throws error with vue info when provided', () => {
    expect(() => errorHandler(errorObject, {})).to.throw().that.satisfies(function (err) {
      return err.message.includes(errorString)
    })
  })

  it('sets vm_error to the error that is thrown', () => {
    const vm = {}
    expect(() => errorHandler(errorObject, vm)).to.throw().that.satisfies(function (err) {
      return err === vm._error
    })
  })

  it('throws error with string', () => {
    expect(() => errorHandler(errorString, {})).to.throw().with.property('message', errorString)
  })

  it('sets vm_error to the error that is thrown', () => {
    const vm = {}

    expect(() => errorHandler(errorObject, vm)).to.throw().that.satisfies(function (err) {
      return err === vm._error
    })
  })
})
