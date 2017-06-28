import { compileToFunctions } from 'vue-template-compiler'
import shallow from '~src/shallow'
import mount from '~src/mount'
import VueWrapper from '~src/VueWrapper'
import Component from '~resources/components/component.vue'
import ComponentWithChildComponent from '~resources/components/component-with-child-component.vue'
import ComponentWithNestedChildren from '~resources/components/component-with-nested-children.vue'

describe('shallow', () => {
  it('returns new VueWrapper of Vue instance if no options are passed', () => {
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = shallow(compiled)
    expect(wrapper).to.be.instanceOf(VueWrapper)
    expect(wrapper.vm).to.be.an('object')
  })

  it('returns new VueWrapper of Vue instance with all children stubbed', () => {
    const wrapper = shallow(ComponentWithNestedChildren)
    expect(wrapper).to.be.instanceOf(VueWrapper)
    expect(wrapper.findAll(Component).length).to.equal(0)
    expect(wrapper.findAll(ComponentWithChildComponent).length).to.equal(1)
  })

  it('returns new VueWrapper of Vue instance with all children stubbed', () => {
    const wrapper = shallow(ComponentWithNestedChildren)
    expect(wrapper).to.be.instanceOf(VueWrapper)
    expect(wrapper.findAll(Component).length).to.equal(0)
    expect(wrapper.findAll(ComponentWithChildComponent).length).to.equal(1)
  })

  it('does not modify component directly', () => {
    const wrapper = shallow(ComponentWithNestedChildren)
    expect(wrapper.findAll(Component).length).to.equal(0)
    const mountedWrapper = mount(ComponentWithNestedChildren)
    expect(mountedWrapper.findAll(Component).length).to.equal(1)
  })

  it('does not call stubbed children lifecycle hooks', () => {
    const time = sinon.stub(console, 'time')
    shallow(ComponentWithNestedChildren)
    expect(time.called).to.equal(false)
    time.restore()
  })
})

