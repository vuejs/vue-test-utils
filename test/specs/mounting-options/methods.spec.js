import { config } from '~vue/test-utils'
import { describeWithMountingMethods } from '~resources/utils'

describeWithMountingMethods('options.methods', mountingMethod => {
  it('prioritize mounting options over config', () => {
    config.methods['val'] = () => 'methodFromConfig'

    const TestComponent = {
      template: `
        <div>{{ val() }}</div>
      `
    }

    const wrapper = mountingMethod(TestComponent, {
      methods: {
        val() {
          return 'methodFromOptions'
        }
      }
    })
    const HTML =
      mountingMethod.name === 'renderToString' ? wrapper : wrapper.html()
    expect(HTML).to.contain('methodFromOptions')
  })
})
