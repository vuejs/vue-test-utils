import WrapperArray from '../../../../src/wrappers/wrapper-array'

describe('WrapperArray', () => {
  it('returns class with length equal to lenght of wrappers passed in constructor', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    expect(wrapperArray.length).to.equal(3)
  })

  it('returns wrapper at index 0 when at(0) is called', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    expect(wrapperArray.at(0)).to.equal(1)
  })

  it('throws error if find is called when there are no items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = '[vue-test-utils]: find cannot be called on 0 items'
    expect(() => wrapperArray.find()).to.throw().with.property('message', message)
  })

  it('throws error if find is called when there are items in wrapper array', () => {
    const wrapperArray = new WrapperArray([1])
    const message = '[vue-test-utils]: find must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.find()).to.throw().with.property('message', message)
  })

  it('emitted throws error if wrapper is not empty', () => {
    const wrapperArray = new WrapperArray([])
    const message = '[vue-test-utils]: emitted cannot be called on 0 items'
    expect(() => wrapperArray.emitted()).to.throw().with.property('message', message)
  })

  it('emitted throws error if wrapper is empty', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    const message = '[vue-test-utils]: emitted must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.emitted()).to.throw().with.property('message', message)
  })

  it('emittedByOrder throws error if wrapper is not empty', () => {
    const wrapperArray = new WrapperArray([])
    const message = '[vue-test-utils]: emittedByOrder cannot be called on 0 items'
    expect(() => wrapperArray.emittedByOrder()).to.throw().with.property('message', message)
  })

  it('emittedByOrder throws error if wrapper is empty', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    const message = '[vue-test-utils]: emittedByOrder must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.emittedByOrder()).to.throw().with.property('message', message)
  })

  it('findAll throws error if wrapper is  empty', () => {
    const wrapperArray = new WrapperArray([])
    const message = '[vue-test-utils]: findAll cannot be called on 0 items'
    expect(() => wrapperArray.findAll()).to.throw().with.property('message', message)
  })

  it('findAll throws error if wrapper is not empty', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    const message = '[vue-test-utils]: findAll must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.findAll()).to.throw().with.property('message', message)
  })

  it('attributes throws error if called when there are 0 items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = '[vue-test-utils]: attributes cannot be called on 0 items'
    expect(() => wrapperArray.attributes()).to.throw().with.property('message', message)
  })

  it('attributes throws error if called when there are items in wrapper array', () => {
    const wrapperArray = new WrapperArray([1])
    const message = '[vue-test-utils]: attributes must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.attributes()).to.throw().with.property('message', message)
  })

  it('classes throws error if called when there are 0 items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = '[vue-test-utils]: classes cannot be called on 0 items'
    expect(() => wrapperArray.classes()).to.throw().with.property('message', message)
  })

  it('classes throws error if called when there are items in wrapper array', () => {
    const wrapperArray = new WrapperArray([1])
    const message = '[vue-test-utils]: classes must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.classes()).to.throw().with.property('message', message)
  })

  it('contains returns true if every wrapper.contains() returns true', () => {
    const selector = 'selector'
    const contains = sinon.stub()
    contains.withArgs(selector).returns(true)
    const wrapperArray = new WrapperArray([{ contains }, { contains }])
    expect(wrapperArray.contains(selector)).to.equal(true)
  })

  it('contains returns false if not every wrapper.contains() returns true', () => {
    const wrapperArray = new WrapperArray([{ contains: () => true }, { contains: () => false }])
    expect(wrapperArray.contains()).to.equal(false)
  })

  it('exists returns true if length is greater then 0', () => {
    const wrapperArray = new WrapperArray([{}])
    expect(wrapperArray.exists()).to.equal(true)
  })

  it('exists returns false if length is 0', () => {
    const wrapperArray = new WrapperArray([])
    expect(wrapperArray.exists()).to.equal(false)
  })

  it('hasAttribute returns true if every wrapper.hasAttribute() returns true', () => {
    const attribute = 'attribute'
    const value = 'value'
    const hasAttribute = sinon.stub()
    hasAttribute.withArgs(attribute, value).returns(true)
    const wrapperArray = new WrapperArray([{ hasAttribute }, { hasAttribute }])
    expect(wrapperArray.hasAttribute(attribute, value)).to.equal(true)
  })

  it('hasAttribute returns false if not every wrapper.hasAttribute() returns true', () => {
    const wrapperArray = new WrapperArray([{ hasAttribute: () => true }, { hasAttribute: () => false }])
    expect(wrapperArray.hasAttribute('attribute', 'value')).to.equal(false)
  })

  it('hasClass returns true if every wrapper.hasClass() returns true', () => {
    const className = 'class'
    const hasClass = sinon.stub()
    hasClass.withArgs(className).returns(true)
    const wrapperArray = new WrapperArray([{ hasClass }, { hasClass }])
    expect(wrapperArray.hasClass(className)).to.equal(true)
  })

  it('hasClass returns false if not every wrapper.hasClass() returns true', () => {
    const wrapperArray = new WrapperArray([{ hasClass: () => true }, { hasClass: () => false }])
    expect(wrapperArray.hasClass('class')).to.equal(false)
  })

  it('hasProp returns true if every wrapper.hasProp() returns true', () => {
    const prop = 'prop'
    const value = 'value'
    const hasProp = sinon.stub()
    hasProp.withArgs(prop, value).returns(true)
    const wrapperArray = new WrapperArray([{ hasProp }, { hasProp }])
    expect(wrapperArray.hasProp(prop, value)).to.equal(true)
  })

  it('hasProp returns false if not every wrapper.hasProp() returns true', () => {
    const wrapperArray = new WrapperArray([{ hasProp: () => true }, { hasProp: () => false }])
    expect(wrapperArray.hasProp('prop', 'value')).to.equal(false)
  })

  it('hasStyle returns true if every wrapper.hasStyle() returns true', () => {
    const style = 'style'
    const value = 'value'
    const hasStyle = sinon.stub()
    hasStyle.withArgs(style, value).returns(true)
    const wrapperArray = new WrapperArray([{ hasStyle }, { hasStyle }])
    expect(wrapperArray.hasStyle(style, value)).to.equal(true)
  })

  it('hasStyle returns false if not every wrapper.hasStyle() returns true', () => {
    const wrapperArray = new WrapperArray([{ hasStyle: () => true }, { hasStyle: () => false }])
    expect(wrapperArray.hasStyle('style', 'value')).to.equal(false)
  })

  it('is returns true if every wrapper.is() returns true', () => {
    const selector = 'selector'
    const is = sinon.stub()
    is.withArgs(selector).returns(true)
    const wrapperArray = new WrapperArray([{ is }, { is }])
    expect(wrapperArray.is(selector)).to.equal(true)
  })

  it('is returns false if not every wrapper.is() returns true', () => {
    const wrapperArray = new WrapperArray([{ is: () => true }, { is: () => false }])
    expect(wrapperArray.is('selector')).to.equal(false)
  })

  it('isEmpty returns true if every wrapper.isEmpty() returns true', () => {
    const wrapperArray = new WrapperArray([{ isEmpty: () => true }, { isEmpty: () => true }])
    expect(wrapperArray.isEmpty()).to.equal(true)
  })

  it('isEmpty returns false if not every wrapper.isEmpty() returns true', () => {
    const wrapperArray = new WrapperArray([{ isEmpty: () => true }, { isEmpty: () => false }])
    expect(wrapperArray.isEmpty()).to.equal(false)
  })

  it('isVueInstance returns true if every wrapper.isVueInstance() returns true', () => {
    const wrapperArray = new WrapperArray([{ isVueInstance: () => true }, { isVueInstance: () => true }])
    expect(wrapperArray.isVueInstance()).to.equal(true)
  })

  it('isVueInstance returns false if not every wrapper.isVueInstance() returns true', () => {
    const wrapperArray = new WrapperArray([{ isVueInstance: () => true }, { isVueInstance: () => false }])
    expect(wrapperArray.isVueInstance()).to.equal(false)
  })

  it('html throws error if called when there are 0 items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = '[vue-test-utils]: html cannot be called on 0 items'
    expect(() => wrapperArray.html()).to.throw().with.property('message', message)
  })

  it('html throws error if called when there are items in wrapper array', () => {
    const wrapperArray = new WrapperArray([1])
    const message = '[vue-test-utils]: html must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.html()).to.throw().with.property('message', message)
  })

  it('name throws error if called when there are 0 items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = '[vue-test-utils]: name cannot be called on 0 items'
    expect(() => wrapperArray.name()).to.throw().with.property('message', message)
  })

  it('name throws error if called when there are items in wrapper array', () => {
    const wrapperArray = new WrapperArray([1])
    const message = '[vue-test-utils]: name must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.name()).to.throw().with.property('message', message)
  })

  it('props throws error if called when there are 0 items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = '[vue-test-utils]: props cannot be called on 0 items'
    expect(() => wrapperArray.props()).to.throw().with.property('message', message)
  })

  it('props throws error if called when there are items in wrapper array', () => {
    const wrapperArray = new WrapperArray([1])
    const message = '[vue-test-utils]: props must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.props()).to.throw().with.property('message', message)
  })

  it('text throws error if called when there are 0 items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = '[vue-test-utils]: text cannot be called on 0 items'
    expect(() => wrapperArray.text()).to.throw().with.property('message', message)
  })

  it('text throws error if called when there are items in wrapper array', () => {
    const wrapperArray = new WrapperArray([1])
    const message = '[vue-test-utils]: text must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.text()).to.throw().with.property('message', message)
  })

  it('setComputed calls setMethods on each wrapper', () => {
    const setComputed = sinon.stub()
    const computed = {}
    const wrapperArray = new WrapperArray([{ setComputed }, { setComputed }])
    wrapperArray.setComputed(computed)
    expect(setComputed.calledTwice).to.equal(true)
    expect(setComputed.calledWith(computed)).to.equal(true)
  })

  it('setMethods calls setMethods on each wrapper', () => {
    const setMethods = sinon.stub()
    const methods = {}
    const wrapperArray = new WrapperArray([{ setMethods }, { setMethods }])
    wrapperArray.setMethods(methods)
    expect(setMethods.calledTwice).to.equal(true)
    expect(setMethods.calledWith(methods)).to.equal(true)
  })

  it('setData calls setData on each wrapper', () => {
    const setData = sinon.stub()
    const data = {}
    const wrapperArray = new WrapperArray([{ setData }, { setData }])
    wrapperArray.setData(data)
    expect(setData.calledTwice).to.equal(true)
    expect(setData.calledWith(data)).to.equal(true)
  })

  it('setProps calls setProps on each wrapper', () => {
    const setProps = sinon.stub()
    const props = {}
    const wrapperArray = new WrapperArray([{ setProps }, { setProps }])
    wrapperArray.setProps(props)
    expect(setProps.calledTwice).to.equal(true)
    expect(setProps.calledWith(props)).to.equal(true)
  })

  it('trigger calls trigger on each wrapper', () => {
    const trigger = sinon.stub()
    const event = 'click'
    const options = {}
    const wrapperArray = new WrapperArray([{ trigger }, { trigger }])
    wrapperArray.trigger(event, options)
    expect(trigger.calledTwice).to.equal(true)
    expect(trigger.calledWith(event, options)).to.equal(true)
  })

  it('update calls update on each wrapper', () => {
    const update = sinon.stub()
    const wrapperArray = new WrapperArray([{ update }, { update }])
    wrapperArray.update()
    expect(update.calledTwice).to.equal(true)
  })

  it('destroy calls destroy on each wrapper', () => {
    const destroy = sinon.stub()
    const wrapperArray = new WrapperArray([{ destroy }, { destroy }])
    wrapperArray.destroy()
    expect(destroy.calledTwice).to.equal(true)
  })
})
