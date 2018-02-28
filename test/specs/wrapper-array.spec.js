import { mount } from '~vue/test-utils'
import { compileToFunctions } from 'vue-template-compiler'

describe('WrapperArray', () => {
  function getWrapperArray (wrappers) {
    const compiled = compileToFunctions('<div><p>1</p><p>2</p><p>3</p></div>')
    const wrapper = mount(compiled)
    const wrapperArray = wrapper.findAll('p')
    expect(wrapperArray.constructor.name).to.equal('WrapperArray')
    if (wrappers) {
      wrapperArray.wrappers = wrappers
      wrapperArray.length = wrappers.length
    }
    return wrapperArray
  }

  it('returns class with length equal to length of wrappers passed in constructor', () => {
    const wrapperArray = getWrapperArray()
    expect(wrapperArray.length).to.equal(3)
  })

  it('returns wrapper at index 0 when at(0) is called', () => {
    const wrapperArray = getWrapperArray()
    expect(wrapperArray.at(0).text()).to.equal('1')
  })

  it('returns filtered wrapper when filter is called', () => {
    const wrapperArray = getWrapperArray()
    expect(wrapperArray.filter(w => {
      return w.text() !== '2'
    }).length).to.equal(2)
  })

  const methods = ['at', 'attributes', 'classes', 'contains', 'emitted', 'emittedByOrder', 'hasAttribute',
    'hasClass', 'hasProp', 'hasStyle', 'find', 'findAll', 'html', 'text', 'is', 'isEmpty', 'isVueInstance',
    'name', 'props', 'setComputed', 'setMethods', 'setData', 'setProps', 'trigger', 'update', 'destroy']
  methods.forEach((method) => {
    it(`throws error if ${method} is called when there are no items in wrapper array`, () => {
      if (method === 'at') {
        return
      }
      const wrapperArray = getWrapperArray()
      wrapperArray.wrappers = []
      const message = `[vue-test-utils]: ${method} cannot be called on 0 items`
      expect(() => wrapperArray[method]()).to.throw().with.property('message', message)
    })

    it(`${method} throws error if called when there are items in wrapper array`, () => {
      if (['at', 'contains', 'hasAttribute', 'hasClass', 'hasProp', 'hasStyle', 'is', 'isEmpty', 'isVueInstance',
        'setComputed', 'setMethods', 'setData', 'setProps', 'trigger', 'update', 'destroy'].includes(method)) {
        return
      }
      const wrapperArray = getWrapperArray()
      wrapperArray.wrappers = [1, 2, 3]
      const message = `[vue-test-utils]: ${method} must be called on a single wrapper, use at(i) to access a wrapper`
      expect(() => wrapperArray[method]()).to.throw().with.property('message', message)
    })
  })

  it('exists returns true if it has every existing wrappers', () => {
    const wrapperArray = getWrapperArray()
    wrapperArray.wrappers.forEach((w) => {
      expect(w.exists()).to.equal(true)
    })
    expect(wrapperArray.exists()).to.equal(true)
  })

  it('exists returns false if it does not have existing wrappers', () => {
    const wrapperArray = getWrapperArray([])
    expect(wrapperArray.exists()).to.equal(false)
  })

  it('exists returns false if it has not existing wrappers', () => {
    const wrapper1 = {
      exists () {
        return true
      }
    }
    const wrapper2 = {
      exists () {
        return false
      }
    }
    const wrapperArray = getWrapperArray([wrapper1, wrapper2])
    expect(wrapperArray.exists()).to.equal(false)
  })

  it('contains returns true if every wrapper.contains() returns true', () => {
    const selector = 'selector'
    const contains = sinon.stub()
    contains.withArgs(selector).returns(true)
    const wrapperArray = getWrapperArray([{ contains }, { contains }])
    expect(wrapperArray.contains(selector)).to.equal(true)
  })

  it('contains returns false if not every wrapper.contains() returns true', () => {
    const wrapperArray = getWrapperArray([{ contains: () => true }, { contains: () => false }])
    expect(wrapperArray.contains()).to.equal(false)
  })

  it('hasAttribute returns true if every wrapper.hasAttribute() returns true', () => {
    const attribute = 'attribute'
    const value = 'value'
    const hasAttribute = sinon.stub()
    hasAttribute.withArgs(attribute, value).returns(true)
    const wrapperArray = getWrapperArray([{ hasAttribute }, { hasAttribute }])
    expect(wrapperArray.hasAttribute(attribute, value)).to.equal(true)
  })

  it('hasAttribute returns false if not every wrapper.hasAttribute() returns true', () => {
    const wrapperArray = getWrapperArray([{ hasAttribute: () => true }, { hasAttribute: () => false }])
    expect(wrapperArray.hasAttribute('attribute', 'value')).to.equal(false)
  })

  it('hasClass returns true if every wrapper.hasClass() returns true', () => {
    const className = 'class'
    const hasClass = sinon.stub()
    hasClass.withArgs(className).returns(true)
    const wrapperArray = getWrapperArray([{ hasClass }, { hasClass }])
    expect(wrapperArray.hasClass(className)).to.equal(true)
  })

  it('hasClass returns false if not every wrapper.hasClass() returns true', () => {
    const wrapperArray = getWrapperArray([{ hasClass: () => true }, { hasClass: () => false }])
    expect(wrapperArray.hasClass('class')).to.equal(false)
  })

  it('hasProp returns true if every wrapper.hasProp() returns true', () => {
    const prop = 'prop'
    const value = 'value'
    const hasProp = sinon.stub()
    hasProp.withArgs(prop, value).returns(true)
    const wrapperArray = getWrapperArray([{ hasProp }, { hasProp }])
    expect(wrapperArray.hasProp(prop, value)).to.equal(true)
  })

  it('hasProp returns false if not every wrapper.hasProp() returns true', () => {
    const wrapperArray = getWrapperArray([{ hasProp: () => true }, { hasProp: () => false }])
    expect(wrapperArray.hasProp('prop', 'value')).to.equal(false)
  })

  it('hasStyle returns true if every wrapper.hasStyle() returns true', () => {
    const style = 'style'
    const value = 'value'
    const hasStyle = sinon.stub()
    hasStyle.withArgs(style, value).returns(true)
    const wrapperArray = getWrapperArray([{ hasStyle }, { hasStyle }])
    expect(wrapperArray.hasStyle(style, value)).to.equal(true)
  })

  it('hasStyle returns false if not every wrapper.hasStyle() returns true', () => {
    const wrapperArray = getWrapperArray([{ hasStyle: () => true }, { hasStyle: () => false }])
    expect(wrapperArray.hasStyle('style', 'value')).to.equal(false)
  })

  it('is returns true if every wrapper.is() returns true', () => {
    const selector = 'selector'
    const is = sinon.stub()
    is.withArgs(selector).returns(true)
    const wrapperArray = getWrapperArray([{ is }, { is }])
    expect(wrapperArray.is(selector)).to.equal(true)
  })

  it('is returns false if not every wrapper.is() returns true', () => {
    const wrapperArray = getWrapperArray([{ is: () => true }, { is: () => false }])
    expect(wrapperArray.is('selector')).to.equal(false)
  })

  it('isEmpty returns true if every wrapper.isEmpty() returns true', () => {
    const wrapperArray = getWrapperArray([{ isEmpty: () => true }, { isEmpty: () => true }])
    expect(wrapperArray.isEmpty()).to.equal(true)
  })

  it('isEmpty returns false if not every wrapper.isEmpty() returns true', () => {
    const wrapperArray = getWrapperArray([{ isEmpty: () => true }, { isEmpty: () => false }])
    expect(wrapperArray.isEmpty()).to.equal(false)
  })

  it('isVueInstance returns true if every wrapper.isVueInstance() returns true', () => {
    const wrapperArray = getWrapperArray([{ isVueInstance: () => true }, { isVueInstance: () => true }])
    expect(wrapperArray.isVueInstance()).to.equal(true)
  })

  it('isVueInstance returns false if not every wrapper.isVueInstance() returns true', () => {
    const wrapperArray = getWrapperArray([{ isVueInstance: () => true }, { isVueInstance: () => false }])
    expect(wrapperArray.isVueInstance()).to.equal(false)
  })

  it('setComputed calls setMethods on each wrapper', () => {
    const setComputed = sinon.stub()
    const computed = {}
    const wrapperArray = getWrapperArray([{ setComputed }, { setComputed }])
    wrapperArray.setComputed(computed)
    expect(setComputed.calledTwice).to.equal(true)
    expect(setComputed.calledWith(computed)).to.equal(true)
  })

  it('setMethods calls setMethods on each wrapper', () => {
    const setMethods = sinon.stub()
    const methods = {}
    const wrapperArray = getWrapperArray([{ setMethods }, { setMethods }])
    wrapperArray.setMethods(methods)
    expect(setMethods.calledTwice).to.equal(true)
    expect(setMethods.calledWith(methods)).to.equal(true)
  })

  it('setData calls setData on each wrapper', () => {
    const setData = sinon.stub()
    const data = {}
    const wrapperArray = getWrapperArray([{ setData }, { setData }])
    wrapperArray.setData(data)
    expect(setData.calledTwice).to.equal(true)
    expect(setData.calledWith(data)).to.equal(true)
  })

  it('setProps calls setProps on each wrapper', () => {
    const setProps = sinon.stub()
    const props = {}
    const wrapperArray = getWrapperArray([{ setProps }, { setProps }])
    wrapperArray.setProps(props)
    expect(setProps.calledTwice).to.equal(true)
    expect(setProps.calledWith(props)).to.equal(true)
  })

  it('trigger calls trigger on each wrapper', () => {
    const trigger = sinon.stub()
    const event = 'click'
    const options = {}
    const wrapperArray = getWrapperArray([{ trigger }, { trigger }])
    wrapperArray.trigger(event, options)
    expect(trigger.calledTwice).to.equal(true)
    expect(trigger.calledWith(event, options)).to.equal(true)
  })

  it('update calls update on each wrapper', () => {
    const update = sinon.stub()
    const wrapperArray = getWrapperArray([{ update }, { update }])
    wrapperArray.update()
    expect(update.calledTwice).to.equal(true)
  })

  it('destroy calls destroy on each wrapper', () => {
    const destroy = sinon.stub()
    const wrapperArray = getWrapperArray([{ destroy }, { destroy }])
    wrapperArray.destroy()
    expect(destroy.calledTwice).to.equal(true)
  })
})
