import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('options.watch', mountingMethod => {
  it('overrides a default watch handler', async () => {
    const TestComponent = {
      props: ['someProp', 'anotherProp'],
      template: '<div>{{ foo }}</div>',
      data() {
        return {
          foo: 'bar'
        }
      },
      watch: {
        anotherProp: {
          handler() {
            // placeholder
          }
        },
        someProp: {
          handler() {
            this.foo = 'updated-bar'
          }
        }
      }
    }
    const wrapper = mountingMethod(TestComponent, {
      watch: {
        someProp: {
          handler() {
            // do nothing
          }
        }
      }
    })

    wrapper.setProps({ someProp: 'some-new-val' })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).to.equal('bar')
  })
})
