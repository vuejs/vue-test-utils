# Testing Asynchronous Components

> An example project will be made available.

To simplify testing, `vue-test-utils` applies updates _synchronously_. However, there are some techniques you need to be aware ofwhen testing a component with asynchronous behavior such as callbacks or promises.

One common cases is componentst that use `watch`, which updates asynchronously. Below in an example of a component that renders some content based on a boolean value, which is updated using a watcher:

``` js
import { shallow  } from 'vue-test-utils'
import Component from './Component'
import flushPromises from 'flush-promises'

describe('Component', () => {
  it('renders content conditionally using a watcher',  () => {
    const wrapper = shallow(Click)

    wrapper.find('input').element.value = 'Value'
    wrapper.find('input').trigger('input')

    expect(wrapper.findAll('#changed')).toHaveLength(1)
  })
})

``` js
import { shallow  } from 'vue-test-utils'
import Click from './Click'
import flushPromises from 'flush-promises'

describe('test', () => {
  it('works',  async () => {
    const wrapper = shallow(Click)

    wrapper.find('input').element.value = 'Value'
    wrapper.find('input').trigger('input')
    await flushPromises()

    expect(wrapper.findAll('#changed')).toHaveLength(1)
  })
})

describe('test', () => {
  it('works',  async () => {
    const wrapper = shallow(Click)

    wrapper.find('input').element.value = 'Value'
    wrapper.find('input').trigger('input')

    expect(wrapper.find('#updated').text()).toEqual('true')
  })
})
```
