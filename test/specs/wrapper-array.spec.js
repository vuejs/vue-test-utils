import { Wrapper, WrapperArray } from '~vue/test-utils'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('WrapperArray', mountingMethod => {
  function getWrapperArray(wrappers) {
    if (!wrappers) {
      wrappers = [1, 2, 3].map(v => {
        const p = document.createElement('p')
        p.textContent = v
        return new Wrapper(p)
      })
    }
    return new WrapperArray(wrappers)
  }

  ;['wrappers', 'length'].forEach(property => {
    it(`has the ${property} property which is read-only`, () => {
      const wrapperArray = getWrapperArray()
      const message = `[vue-test-utils]: wrapperArray.${property} is read-only`
      expect(() => {
        wrapperArray[property] = 'foo'
      })
        .to.throw()
        .with.property('message', message)
    })
  })

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
    expect(
      wrapperArray.filter(w => {
        return w.text() !== '2'
      }).length
    ).to.equal(2)
  })

  const methods = [
    'at',
    'attributes',
    'classes',
    'contains',
    'emitted',
    'emittedByOrder',
    'find',
    'findAll',
    'html',
    'text',
    'is',
    'isEmpty',
    'isVisible',
    'isVueInstance',
    'name',
    'props',
    'setChecked',
    'setMethods',
    'setData',
    'setProps',
    'setSelected',
    'setValue',
    'trigger',
    'update',
    'destroy'
  ]
  methods.forEach(method => {
    it(`throws error if ${method} is called when there are no items in wrapper array`, () => {
      if (method === 'at') {
        return
      }
      const wrapperArray = getWrapperArray([])
      const message = `[vue-test-utils]: ${method} cannot be called on 0 items`
      expect(() => wrapperArray[method]())
        .to.throw()
        .with.property('message', message)
    })

    it(`${method} throws error if called when there are items in wrapper array`, () => {
      if (
        [
          'at',
          'contains',
          'is',
          'isEmpty',
          'isVisible',
          'isVueInstance',
          'setChecked',
          'setMethods',
          'setData',
          'setProps',
          'setValue',
          'trigger',
          'update',
          'destroy'
        ].includes(method)
      ) {
        return
      }
      const wrapperArray = getWrapperArray([1, 2, 3])
      const message = `[vue-test-utils]: ${method} must be called on a single wrapper, use at(i) to access a wrapper`
      expect(() => wrapperArray[method]())
        .to.throw()
        .with.property('message', message)
    })
  })

  it('exists returns true if it has every existing wrappers', () => {
    const wrapperArray = getWrapperArray()
    wrapperArray.wrappers.forEach(w => {
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
      exists() {
        return true
      }
    }
    const wrapper2 = {
      exists() {
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
    const wrapperArray = getWrapperArray([
      { contains: () => true },
      { contains: () => false }
    ])
    expect(wrapperArray.contains()).to.equal(false)
  })

  it('is returns true if every wrapper.is() returns true', () => {
    const selector = 'selector'
    const is = sinon.stub()
    is.withArgs(selector).returns(true)
    const wrapperArray = getWrapperArray([{ is }, { is }])
    expect(wrapperArray.is(selector)).to.equal(true)
  })

  it('is returns false if not every wrapper.is() returns true', () => {
    const wrapperArray = getWrapperArray([
      { is: () => true },
      { is: () => false }
    ])
    expect(wrapperArray.is('selector')).to.equal(false)
  })

  it('isEmpty returns true if every wrapper.isEmpty() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isEmpty: () => true },
      { isEmpty: () => true }
    ])
    expect(wrapperArray.isEmpty()).to.equal(true)
  })

  it('isEmpty returns false if not every wrapper.isEmpty() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isEmpty: () => true },
      { isEmpty: () => false }
    ])
    expect(wrapperArray.isEmpty()).to.equal(false)
  })

  it('isVisible returns true if every wrapper.isVisible() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isVisible: () => true },
      { isVisible: () => true }
    ])
    expect(wrapperArray.isVisible()).to.equal(true)
  })

  it('isVisible returns false if not every wrapper.isVisible() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isVisible: () => true },
      { isVisible: () => false }
    ])
    expect(wrapperArray.isVisible()).to.equal(false)
  })

  it('isVueInstance returns true if every wrapper.isVueInstance() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isVueInstance: () => true },
      { isVueInstance: () => true }
    ])
    expect(wrapperArray.isVueInstance()).to.equal(true)
  })

  it('isVueInstance returns false if not every wrapper.isVueInstance() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isVueInstance: () => true },
      { isVueInstance: () => false }
    ])
    expect(wrapperArray.isVueInstance()).to.equal(false)
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

  it('destroy calls destroy on each wrapper', () => {
    const destroy = sinon.stub()
    const wrapperArray = getWrapperArray([{ destroy }, { destroy }])
    wrapperArray.destroy()
    expect(destroy.calledTwice).to.equal(true)
  })
})
