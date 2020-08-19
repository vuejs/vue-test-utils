import { Wrapper, WrapperArray } from 'packages/test-utils/src'
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
      }).toThrow(message)
    })
  })

  it('returns class with length equal to length of wrappers passed in constructor', () => {
    const wrapperArray = getWrapperArray()
    expect(wrapperArray.length).toEqual(3)
  })

  it('returns wrapper at index 0 when at(0) is called', () => {
    const wrapperArray = getWrapperArray()
    expect(wrapperArray.at(0).text()).toEqual('1')
  })

  it('returns filtered wrapper when filter is called', () => {
    const wrapperArray = getWrapperArray()
    expect(
      wrapperArray.filter(w => {
        return w.text() !== '2'
      }).length
    ).toEqual(2)
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
    'destroy'
  ]
  methods.forEach(method => {
    it(`throws error if ${method} is called when there are no items in wrapper array`, () => {
      if (method === 'at') {
        return
      }
      const wrapperArray = getWrapperArray([])
      const message = `[vue-test-utils]: ${method} cannot be called on 0 items`
      expect(() => wrapperArray[method]()).toThrow(message)
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
          'destroy'
        ].includes(method)
      ) {
        return
      }
      const wrapperArray = getWrapperArray([1, 2, 3])
      const message = `[vue-test-utils]: ${method} must be called on a single wrapper, use at(i) to access a wrapper`
      expect(() => wrapperArray[method]()).toThrow(message)
    })
  })

  it('exists returns true if it has every existing wrappers', () => {
    const wrapperArray = getWrapperArray()
    wrapperArray.wrappers.forEach(w => {
      expect(w.exists()).toEqual(true)
    })
    expect(wrapperArray.exists()).toEqual(true)
  })

  it('exists returns false if it does not have existing wrappers', () => {
    const wrapperArray = getWrapperArray([])
    expect(wrapperArray.exists()).toEqual(false)
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
    expect(wrapperArray.exists()).toEqual(false)
  })

  it('contains returns true if every wrapper.contains() returns true', () => {
    const selector = 'selector'
    const contains = jest.fn(() => true)
    const wrapperArray = getWrapperArray([{ contains }, { contains }])
    expect(wrapperArray.contains(selector)).toEqual(true)
  })

  it('contains returns false if not every wrapper.contains() returns true', () => {
    const wrapperArray = getWrapperArray([
      { contains: () => true },
      { contains: () => false }
    ])
    expect(wrapperArray.contains()).toEqual(false)
  })

  it('is returns true if every wrapper.is() returns true', () => {
    const selector = 'selector'
    const is = jest.fn(() => true)
    const wrapperArray = getWrapperArray([{ is }, { is }])
    expect(wrapperArray.is(selector)).toEqual(true)
  })

  it('is returns false if not every wrapper.is() returns true', () => {
    const wrapperArray = getWrapperArray([
      { is: () => true },
      { is: () => false }
    ])
    expect(wrapperArray.is('selector')).toEqual(false)
  })

  it('isEmpty returns true if every wrapper.isEmpty() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isEmpty: () => true },
      { isEmpty: () => true }
    ])
    expect(wrapperArray.isEmpty()).toEqual(true)
  })

  it('isEmpty returns false if not every wrapper.isEmpty() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isEmpty: () => true },
      { isEmpty: () => false }
    ])
    expect(wrapperArray.isEmpty()).toEqual(false)
  })

  it('isVisible returns true if every wrapper.isVisible() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isVisible: () => true },
      { isVisible: () => true }
    ])
    expect(wrapperArray.isVisible()).toEqual(true)
  })

  it('isVisible returns false if not every wrapper.isVisible() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isVisible: () => true },
      { isVisible: () => false }
    ])
    expect(wrapperArray.isVisible()).toEqual(false)
  })

  it('isVueInstance returns true if every wrapper.isVueInstance() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isVueInstance: () => true },
      { isVueInstance: () => true }
    ])
    expect(wrapperArray.isVueInstance()).toEqual(true)
  })

  it('isVueInstance returns false if not every wrapper.isVueInstance() returns true', () => {
    const wrapperArray = getWrapperArray([
      { isVueInstance: () => true },
      { isVueInstance: () => false }
    ])
    expect(wrapperArray.isVueInstance()).toEqual(false)
  })

  it('setMethods calls setMethods on each wrapper', () => {
    const setMethods = jest.fn()
    const methods = {}
    const wrapperArray = getWrapperArray([{ setMethods }, { setMethods }])
    wrapperArray.setMethods(methods)
    expect(setMethods).toHaveBeenCalledTimes(2)
    expect(setMethods).toHaveBeenCalledWith(methods)
  })

  it('setData calls setData on each wrapper', async () => {
    const setData = jest.fn().mockResolvedValue()
    const data = {}
    const wrapperArray = getWrapperArray([{ setData }, { setData }])
    await wrapperArray.setData(data)
    expect(setData).toHaveBeenCalledTimes(2)
    expect(setData).toHaveBeenCalledWith(data)
  })

  it('setProps calls setProps on each wrapper', async () => {
    const setProps = jest.fn().mockResolvedValue()
    const props = {}
    const wrapperArray = getWrapperArray([{ setProps }, { setProps }])
    await wrapperArray.setProps(props)
    expect(setProps).toHaveBeenCalledTimes(2)
    expect(setProps).toHaveBeenCalledWith(props)
  })

  it('setValue calls setValue on each wrapper', async () => {
    const setValue = jest.fn().mockResolvedValue()
    const value = {}
    const wrapperArray = getWrapperArray([{ setValue }, { setValue }])
    await wrapperArray.setValue(value)
    expect(setValue).toHaveBeenCalledTimes(2)
    expect(setValue).toHaveBeenCalledWith(value)
  })

  it('setChecked calls setChecked on each wrapper', async () => {
    const setChecked = jest.fn().mockResolvedValue()
    const wrapperArray = getWrapperArray([{ setChecked }, { setChecked }])
    await wrapperArray.setChecked()
    expect(setChecked).toHaveBeenCalledTimes(2)
    expect(setChecked).toHaveBeenCalledWith(true)
  })

  it('trigger calls trigger on each wrapper', async () => {
    const trigger = jest.fn().mockResolvedValue()
    const event = 'click'
    const options = {}
    const wrapperArray = getWrapperArray([{ trigger }, { trigger }])
    await wrapperArray.trigger(event, options)
    expect(trigger).toHaveBeenCalledTimes(2)
    expect(trigger).toHaveBeenCalledWith(event, options)
  })

  it('destroy calls destroy on each wrapper', () => {
    const destroy = jest.fn()
    const wrapperArray = getWrapperArray([{ destroy }, { destroy }])
    wrapperArray.destroy()
    expect(destroy).toHaveBeenCalledTimes(2)
  })
})
