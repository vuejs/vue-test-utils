import ErrorWrapper from '../../../../src/wrappers/error-wrapper'

describe('ErrorWrapper', () => {
  it('at throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call at() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.at()).to.throw(Error, message)
  })

  it('contains throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call contains() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.contains()).to.throw(Error, message)
  })

  it('hasAttribute throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call hasAttribute() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.hasAttribute()).to.throw(Error, message)
  })

  it('hasClass throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call hasClass() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.hasClass()).to.throw(Error, message)
  })

  it('hasProp throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call hasProp() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.hasProp()).to.throw(Error, message)
  })

  it('hasStyle throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call hasStyle() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.hasStyle()).to.throw(Error, message)
  })

  it('findAll throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call findAll() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.findAll()).to.throw(Error, message)
  })

  it('find throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call find() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.find()).to.throw(Error, message)
  })

  it('html throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call html() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.html()).to.throw(Error, message)
  })

  it('is throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call is() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.is()).to.throw(Error, message)
  })

  it('isEmpty throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call isEmpty() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.isEmpty()).to.throw(Error, message)
  })

  it('isVueInstance throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call isVueInstance() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.isVueInstance()).to.throw(Error, message)
  })

  it('name throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call name() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.name()).to.throw(Error, message)
  })

  it('text throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call text() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.text()).to.throw(Error, message)
  })

  it('setData throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call setData() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.setData()).to.throw(Error, message)
  })

  it('setProps throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call setProps() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.setProps()).to.throw(Error, message)
  })

  it('trigger throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call trigger() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.trigger()).to.throw(Error, message)
  })

  it('update throws error when called', () => {
    const selector = 'div'
    const message = `find did not return ${selector}, cannot call update() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.update()).to.throw(Error, message)
  })
})
