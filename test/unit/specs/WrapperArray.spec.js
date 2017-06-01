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
    const message = 'find cannot be called on more than 1 item, use at(i) to access the item'
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
