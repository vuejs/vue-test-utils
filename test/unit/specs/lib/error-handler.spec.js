import { errorHandler } from '../../../../src/lib/error-handler'

describe('errorHandler', () => {
  const errorString = 'errorString'
  const info = 'additional info provided by vue'

  describe('with Error thrown', () => {
    const error = new Error(errorString)

    it('rethrows error', () => {
      expect(() => errorHandler(error)).to.throw().with.property('message', errorString)
    })

    it('rethrown error contains vue info when provided', () => {
      expect(() => errorHandler(error, {}, info)).to.throw().that.satisfies(function(err) {
        const errorMessage = err.message

        return errorMessage.includes(errorString) && errorMessage.includes(info)
      });
    })
  })

  describe('with not Error object thrown', () => {
    const error = errorString

    it('throws error with string', () => {
      expect(() => errorHandler(error)).to.throw().with.property('message', errorString)
    })

    it('throws error with string and appends info when provided', () => {
      expect(() => errorHandler(error, {}, info)).to.throw().that.satisfies(function(err) {
        const errorMessage = err.message;

        return errorMessage.includes(errorString) && errorMessage.includes(info)
      });
    })
  })
})
