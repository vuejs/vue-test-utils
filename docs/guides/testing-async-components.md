## Testing Asynchronous Behavior

There are two types of asynchronous behavior you will encounter in your tests:

1. Updates applied by Vue
2. Asynchronous behavior outside of Vue

## Updates applied by Vue

Vue batches pending DOM updates and applies them asynchronously to prevent unnecessary re-renders caused by multiple data mutations.

_You can read more about asynchronous updates in the [Vue docs](https://vuejs.org/v2/guide/reactivity.html#Async-Update-Queue)_

In practice, this means you have to use `Vue.nextTick()` to wait until Vue has performed updates after you set a reactive property.

The easiest way to use `Vue.nextTick()` is to write your tests in an async function:

```js
it('button click should increment the count text', async () => {
  expect(wrapper.text()).toContain('0')
  const button = wrapper.find('button')
  button.trigger('click')
  await Vue.nextTick()
  expect(wrapper.text()).toContain('1')
})
```

## Asynchronous behavior outside of Vue

One of the most common asynchronous behaviors outside of Vue is API calls in Vuex actions. The following examples shows how to test a method that makes an API call. This example uses Jest to run the test and to mock the HTTP library `axios`. More about Jest manual mocks can be found [here](https://jestjs.io/docs/en/manual-mocks.html#content).

The implementation of the `axios` mock looks like this:

```js
export default {
  get: () => Promise.resolve({ data: 'value' })
}
```

The below component makes an API call when a button is clicked, then assigns the response to `value`.

```html
<template>
  <button @click="fetchResults" />
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        value: null
      }
    },

    methods: {
      async fetchResults() {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
  }
</script>
```

A test can be written like this:

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  expect(wrapper.vm.value).toBe('value')
})
```

This test currently fails because the assertion is called before the promise in `fetchResults` resolves. Most unit test libraries provide a callback to let the runner know when the test is complete. Jest and Mocha both use `done`. We can use `done` in combination with `$nextTick` or `setTimeout` to ensure any promises are settled before the assertion is made.

```js
it('fetches async when a button is clicked', done => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  wrapper.vm.$nextTick(() => {
    expect(wrapper.vm.value).toBe('value')
    done()
  })
})
```

The reason `setTimeout` allows the test to pass is because the microtask queue where promise callbacks are processed runs before the task queue, where `setTimeout` callbacks are processed. This means by the time the `setTimeout` callback runs, any promise callbacks on the microtask queue will have been executed. `$nextTick` on the other hand schedules a microtask, but since the microtask queue is processed first-in-first-out that also guarantees the promise callback has been executed by the time the assertion is made. See [here](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) for a more detailed explanation.

Another solution is to use an `async` function and the npm package `flush-promises`. `flush-promises` flushes all pending resolved promise handlers. You can `await` the call of `flushPromises` to flush pending promises and improve the readability of your test.

The updated test looks like this:

```js
import { shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', async () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.vm.value).toBe('value')
})
```

This same technique can be applied to Vuex actions, which return a promise by default.
