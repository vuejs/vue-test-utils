## Getting Started

<div class="vueschool"><a href="https://vueschool.io/lessons/installing-vue-test-utils?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn how to get started with Vue Test Utils, Jest, and testing Vue Components with Vue School">Learn how to get started with Vue Test Utils, Jest, and testing Vue Components</a></div>

### What is Vue Test Utils?

Vue Test Utils (VTU) is a set of utility functions aimed to simplify testing Vue.js components. It provides some methods to **mount** and **interact** with Vue components in an isolated manner.

Let's see an example:

```js
// Import the `mount()` method from Vue Test Utils
import { mount } from '@vue/test-utils'

// The component to test
const MessageComponent = {
  template: '<p>{{ msg }}</p>',
  props: ['msg']
}

test('displays message', () => {
  // mount() returns a wrapped Vue component we can interact with
  const wrapper = mount(MessageComponent, {
    propsData: {
      msg: 'Hello world'
    }
  })

  // Assert the rendered text of the component
  expect(wrapper.text()).toContain('Hello world')
})
```

Mounted components are returned inside a [Wrapper](../api/wrapper/), which exposes methods for querying and interacting with the component under testing.

### Simulating User Interaction

Let's imagine a counter component that increments when user clicks the button:

```js
const Counter = {
  template: `
    <div>
      <button @click="count++">Add up</button>
      <p>Total clicks: {{ count }}</p>
    </div>
  `,
  data() {
    return { count: 0 }
  }
}
```

To simulate the behavior, we need to first locate the button with `wrapper.find()`, which returns a **wrapper for the button element**. We can then simulate the click by calling `.trigger()` on the button wrapper:

```js
test('increments counter value on click', async () => {
  const wrapper = mount(Counter)
  const button = wrapper.find('button')
  const text = wrapper.find('p')

  expect(text.text()).toContain('Total clicks: 0')

  await button.trigger('click')

  expect(text.text()).toContain('Total clicks: 1')
})
```

Notice how the test must be `async` and that `trigger` needs to be awaited. Check out the [Testing Asynchronous Behavior](./README.md#testing-asynchronous-behavior) guide to understand why this is needed and other things to consider when testing asynchronous scenarios.

### What's Next

Check out our [common tips when writing tests](./README.md#knowing-what-to-test).

Alternatively, you can explore the [full API](../api/).
