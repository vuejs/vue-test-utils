import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import mount from '~src/mount'

function listenersNotSupported () {
  const version = Number(`${Vue.version.split('.')[0]}.${Vue.version.split('.')[1]}`)
  return version <= 2.3
}

describe('mount.listeners', () => {
  it('handles inherit listeners', () => {
    if (listenersNotSupported()) return
    const aListener = () => {}
    const wrapper = mount(compileToFunctions('<p :id="aListener" />'), {
      listeners: {
        aListener
      }
    })
    console.info(123)

    expect(wrapper.vm.$listeners.aListener).to.equal(aListener)
    wrapper.update()
    expect(wrapper.vm.$listeners.aListener).to.equal(aListener)
  })

  it('defines listeners as empty object even when not passed', () => {
    const wrapper = mount(compileToFunctions('<p />'))
    expect(wrapper.vm.$listeners).to.deep.equal({})
  })
})
