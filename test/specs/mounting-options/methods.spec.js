import { config } from '~vue/test-utils'
import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('options.methods', mountingMethod => {
  let configMethodsSave

  beforeEach(() => {
    configMethodsSave = config.methods
    config.methods = {}
  })

  afterEach(() => {
    config.methods = configMethodsSave
  })

  it('prioritize mounting options over config', () => {
    config.methods['val'] = () => 'methodFromConfig'

    const TestComponent = {
      template: `<div>{{ val() }}</div>`
    }

    const wrapper = mountingMethod(TestComponent, {
      methods: {
        val() {
          return 'methodFromOptions'
        }
      }
    })

    expect(wrapper.html()).to.contain('methodFromOptions')
  })
})
