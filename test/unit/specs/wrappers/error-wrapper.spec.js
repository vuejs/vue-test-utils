import ErrorWrapper from '../../../../src/wrappers/error-wrapper'

describe('ErrorWrapper', () => {
  it('at throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call at() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.at()).to.throw().with.property('message', message)
  })

  it('contains throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call contains() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.contains()).to.throw().with.property('message', message)
  })

  it('emitted throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call emitted() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.emitted()).to.throw().with.property('message', message)
  })

  it('emittedByOrder throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call emittedByOrder() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.emittedByOrder()).to.throw().with.property('message', message)
  })

  it('hasAttribute throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call hasAttribute() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.hasAttribute()).to.throw().with.property('message', message)
  })

  it('hasClass throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call hasClass() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.hasClass()).to.throw().with.property('message', message)
  })

  it('hasProp throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call hasProp() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.hasProp()).to.throw().with.property('message', message)
  })

  it('hasStyle throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call hasStyle() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.hasStyle()).to.throw().with.property('message', message)
  })

  it('findAll throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call findAll() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.findAll()).to.throw().with.property('message', message)
  })

  it('find throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call find() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.find()).to.throw().with.property('message', message)
  })

  it('html throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call html() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.html()).to.throw().with.property('message', message)
  })

  it('is throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call is() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.is()).to.throw().with.property('message', message)
  })

  it('isEmpty throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call isEmpty() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.isEmpty()).to.throw().with.property('message', message)
  })

  it('isVueInstance throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call isVueInstance() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.isVueInstance()).to.throw().with.property('message', message)
  })

  it('name throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call name() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.name()).to.throw().with.property('message', message)
  })

  it('text throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call text() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.text()).to.throw().with.property('message', message)
  })

  it('setComputed throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call setComputed() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.setComputed()).to.throw().with.property('message', message)
  })

  it('setData throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call setData() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.setData()).to.throw().with.property('message', message)
  })

  it('setMethods throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call setMethods() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.setMethods()).to.throw().with.property('message', message)
  })

  it('setProps throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call setProps() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.setProps()).to.throw().with.property('message', message)
  })

  it('trigger throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call trigger() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.trigger()).to.throw().with.property('message', message)
  })

  it('update throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call update() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.update()).to.throw().with.property('message', message)
  })

  it('destroy throws error when called', () => {
    const selector = 'div'
    const message = `[vue-test-utils]: find did not return ${selector}, cannot call destroy() on empty Wrapper`
    const error = new ErrorWrapper(selector)
    expect(() => error.destroy()).to.throw().with.property('message', message)
  })
})
