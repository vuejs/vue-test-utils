import { compileToFunctions } from 'vue-template-compiler'
import ComponentWithProps from '~resources/components/component-with-props.vue'
import {
  describeWithShallowAndMount,
  functionalSFCsSupported
} from '~resources/utils'
import { itSkipIf } from 'conditional-specs'

describeWithShallowAndMount('props', mountingMethod => {
  it('returns true if wrapper has prop', () => {
    const prop1 = {}
    const prop2 = 'string val'
    const wrapper = mountingMethod(ComponentWithProps, {
      propsData: { prop1, prop2 }
    })
    expect(wrapper.props()).toEqual({ prop1: {}, prop2: 'string val' })
  })

  it('returns an empty object if wrapper does not have props', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mountingMethod(compiled)
    expect(wrapper.props()).toEqual({})
  })

  it('should update after setProps', async () => {
    const prop1 = {}
    const prop2 = 'val1'
    const wrapper = mountingMethod(ComponentWithProps, {
      propsData: { prop1, prop2 }
    })

    expect(wrapper.props()).toEqual({ prop1: {}, prop2: 'val1' })
    // setProps
    await wrapper.setProps({ prop2: 'val2' })
    expect(wrapper.vm.prop2).toEqual('val2') // pass
    expect(wrapper.props()).toEqual({ prop1: {}, prop2: 'val2' }) // fail
  })

  it('returns default props', () => {
    const TestComponent = {
      render: () => {},
      props: {
        message: {
          default: () => 'hello'
        }
      }
    }
    const wrapper = mountingMethod(TestComponent)
    expect(wrapper.props().message).toEqual('hello')
  })

  itSkipIf(
    !functionalSFCsSupported,
    'works correctly a functional component',
    () => {
      const FunctionalComponent = {
        render: h => h('div'),
        functional: true,
        props: ['prop1']
      }
      const TestComponent = {
        template: '<div><functional-component /></div>',
        components: { FunctionalComponent }
      }
      const prop1 = 'some prop'
      const wrapper = mountingMethod(TestComponent, {
        propsData: {
          prop1
        }
      })
      if (mountingMethod.name === 'mount') {
        const message =
          '[vue-test-utils]: wrapper.props() cannot be called on a mounted functional component.'
        const fn = () => wrapper.find(FunctionalComponent).props()
        expect(fn).toThrow(message)
      }
    }
  )

  it('throws an error if called on a non vm wrapper', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const p = mountingMethod(compiled)
      .findAll('p')
      .at(0)
    const message =
      '[vue-test-utils]: wrapper.props() must be called on a Vue instance'
    const fn = () => p.props()
    expect(fn).toThrow(message)
  })

  it('returns the given prop if a key is provided', () => {
    const prop1 = {}
    const prop2 = 'string val'
    const wrapper = mountingMethod(ComponentWithProps, {
      propsData: { prop1, prop2 }
    })
    expect(wrapper.props('prop1')).toEqual({})
    expect(wrapper.props('prop2')).toEqual('string val')
  })

  it('returns undefined if the given key is not found', () => {
    const prop1 = {}
    const prop2 = 'string val'
    const wrapper = mountingMethod(ComponentWithProps, {
      propsData: { prop1, prop2 }
    })
    expect(wrapper.props('propNotHere')).toEqual(undefined)
  })
})
