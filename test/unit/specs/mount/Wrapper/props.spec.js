import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'
import ComponentWithProps from '~resources/components/component-with-props.vue'

describe('props', () => {
  it('returns true if wrapper has prop', () => {
    const prop1 = {}
    const prop2 = 'string val'
    const wrapper = mount(ComponentWithProps, {
      propsData: { prop1, prop2 }
    })
    expect(wrapper.props()).to.eql({ prop1: {}, prop2: 'string val' })
  })

  it('returns an empty object if wrapper does not have props', () => {
    const compiled = compileToFunctions('<div />')
    const wrapper = mount(compiled)
    expect(wrapper.props()).to.eql({})
  })

  it('throws an error if called on a non vm wrapper', () => {
    const compiled = compileToFunctions('<div><p /></div>')
    const p = mount(compiled).findAll('p').at(0)
    const message = '[vue-test-utils]: wrapper.props() must be called on a Vue instance'
    const fn = () => p.props()
    expect(fn).to.throw().with.property('message', message)
  })
})
