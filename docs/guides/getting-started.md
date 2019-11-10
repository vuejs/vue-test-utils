## Getting Started

### Setup

To get a quick taste of using Vue Test Utils, clone our demo repository with basic setup and install the dependencies:

```bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

You will see that the project includes a simple component, `counter.js`:

```js
// counter.js

export default {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

  data() {
    return {
      count: 0
    }
  },

  methods: {
    increment() {
      this.count++
    }
  }
}
```

### Mounting Components

Vue Test Utils tests Vue components by mounting them in isolation, mocking the necessary inputs (props, injections and user events) and asserting the outputs (render result, emitted custom events).

Mounted components are returned inside a [Wrapper](../api/wrapper/), which exposes many convenience methods for manipulating, traversing and querying the underlying Vue component instance.

You can create wrappers using the `mount` method. Let's create a file called `test.js`:

```js
// test.js

// Import the `mount()` method from the test utils
// and the component you want to test
import { mount } from '@vue/test-utils'
import Counter from './counter'

// Now mount the component and you have the wrapper
const wrapper = mount(Counter)

// You can access the actual Vue instance via `wrapper.vm`
const vm = wrapper.vm

// To inspect the wrapper deeper just log it to the console
// and your adventure with the Vue Test Utils begins
console.log(wrapper)
```

### Test rendered HTML output of the component

Now that we have the wrapper, the first thing we can do is to verify that the rendered HTML output of the component matches what is expected.

```js
import { mount } from '@vue/test-utils'
import Counter from './counter'

describe('Counter', () => {
  // Now mount the component and you have the wrapper
  const wrapper = mount(Counter)

  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // it's also easy to check for the existence of elements
  it('has a button', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

Now run the tests with `npm test`. You should see the tests passing.

### Simulating User Interaction

Our counter should increment the count when the user clicks the button. To simulate the behavior, we need to first locate the button with `wrapper.find()`, which returns a **wrapper for the button element**. We can then simulate the click by calling `.trigger()` on the button wrapper:

```js
it('button click should increment the count', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

In order to test that the counter text has updated, we need to learn about `nextTick`.

### Using `nextTick`

Vue batches pending DOM updates and applies them asynchronously to prevent unnecessary re-renders caused by multiple data mutations.

_You can read more about asynchronous updates in the [Vue docs](https://vuejs.org/v2/guide/reactivity.html#Async-Update-Queue)_

We need to use `Vue.nextTick()` to wait until Vue has performed the DOM update after we set a reactive property. In the counter example, setting the `count` property schedules a DOM update to run on the next tick.

We can `await` `Vue.nextTick()` by writing the tests in an async function:

```js
it('button click should increment the count text', async () => {
  expect(wrapper.text()).toContain('0')
  const button = wrapper.find('button')
  button.trigger('click')
  await Vue.nextTick()
  expect(wrapper.text()).toContain('1')
})
```

When you use `nextTick` in your test files, be aware that any errors thrown inside it may not be caught by your test runner as it uses promises internally. There are two approaches to fixing this: either you can set the `done` callback as Vue's global error handler at the start of the test, or you can call `nextTick` without an argument and return it as a promise:

```js
// this will not be caught
it('will time out', done => {
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

// the three following tests will work as expected
it('will catch the error using done', done => {
  Vue.config.errorHandler = done
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

it('will catch the error using a promise', () => {
  return Vue.nextTick().then(function() {
    expect(true).toBe(false)
  })
})

it('will catch the error using async/await', async () => {
  await Vue.nextTick()
  expect(true).toBe(false)
})
```

### What's Next

- Integrate Vue Test Utils into your project by [choosing a test runner](./choosing-a-test-runner.md).
- Learn more about [common techniques when writing tests](./common-tips.md).
