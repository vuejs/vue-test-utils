import {
  describeWithShallowAndMount,
  isRunningPhantomJS,
  vueVersion
} from '~resources/utils'
import { itSkipIf, itDoNotRunIf } from 'conditional-specs'

describeWithShallowAndMount('options.watch', mountingMethod => {
  it('overrides a default watch handler', async () => {
    const TestComponent = {
      props: ['someProp'],
      template: '<div>{{ foo }}</div>',
      data() {
        return {
          foo: 'bar'
        }
      },
      watch: {
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
