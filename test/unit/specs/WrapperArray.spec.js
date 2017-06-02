import WrapperArray from '../../../src/WrapperArray'

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
    const message = 'find cannot be called on 0 items'
    expect(() => wrapperArray.find()).to.throw(Error, message)
  })

  it('throws error if find is called when there is more than 1 item in wrapper array', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    const message = 'find must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.find()).to.throw(Error, message)
  })

  it('find calls find on wrapper if there is only 1 in array', () => {
    const wrapper = { find: sinon.stub() }
    const selector = 'selector'
    const wrapperArray = new WrapperArray([wrapper])
    wrapperArray.find(selector)
    expect(wrapper.find.calledWith(selector)).to.equal(true)
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
    const message = 'html cannot be called on 0 items'
    expect(() => wrapperArray.html()).to.throw(Error, message)
  })

  it('html throws error if called when there is more than 1 item in wrapper array', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    const message = 'html must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.html()).to.throw(Error, message)
  })

  it('html calls html on wrapper if there is only 1 in array', () => {
    const wrapper = { html: sinon.stub() }
    const wrapperArray = new WrapperArray([wrapper])
    wrapperArray.html()
    expect(wrapper.html.called).to.equal(true)
  })

  it('name throws error if called when there are 0 items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = 'name cannot be called on 0 items'
    expect(() => wrapperArray.name()).to.throw(Error, message)
  })

  it('name throws error if called when there is more than 1 item in wrapper array', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    const message = 'name must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.name()).to.throw(Error, message)
  })

  it('name calls name on wrapper if there is only 1 in array', () => {
    const wrapper = { name: sinon.stub() }
    const wrapperArray = new WrapperArray([wrapper])
    wrapperArray.name()
    expect(wrapper.name.called).to.equal(true)
  })

  it('text throws error if called when there are 0 items in wrapper array', () => {
    const wrapperArray = new WrapperArray()
    const message = 'text cannot be called on 0 items'
    expect(() => wrapperArray.text()).to.throw(Error, message)
  })

  it('text throws error if called when there is more than 1 item in wrapper array', () => {
    const wrapperArray = new WrapperArray([1, 2, 3])
    const message = 'text must be called on a single wrapper, use at(i) to access a wrapper'
    expect(() => wrapperArray.text()).to.throw(Error, message)
  })

  it('text calls text on wrapper if there is only 1 in array', () => {
    const wrapper = { text: sinon.stub() }
    const wrapperArray = new WrapperArray([wrapper])
    wrapperArray.text()
    expect(wrapper.text.called).to.equal(true)
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
    const selector = {}
    const wrapperArray = new WrapperArray([{ trigger }, { trigger }])
    wrapperArray.trigger(selector)
    expect(trigger.calledTwice).to.equal(true)
    expect(trigger.calledWith(selector)).to.equal(true)
  })
})
