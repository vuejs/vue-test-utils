# Testing Asynchronous Behavior

To simplify testing, `vue-test-utils` applies updates _synchronously_. However, there are some techniques you need to be aware of when testing a component with asynchronous behavior such as callbacks or promises.

One of the most common asynchronous behaviors is API calls and Vuex actions. The following examples shows how to test a method that makes an API call. This example is using Jest to run the test and to mock the HTTP library `axios`.

The implementation of the `axios` mock looks like this:

``` js
export default {
  get: () => new Promise(resolve => { 
    resolve({ data: 'value' }) 
  })
}
```

The below component makes an API call when a button is clicked, then assigns the response to `value`.

``` js
<template>
  <button @click="fetchResults" />
</template>

<script>
  import axios from 'axios'
  export default {
    data () {
      return {
        value: null
      }
    },

    methods: {
      async fetchResults () {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
  }
</script>
```
A test can be written like this:

``` js
import { shallow } from 'vue-test-utils'
import Foo from './Foo'
jest.mock('axios')

test('Foo', () => {
  it('fetches async when a button is clicked', () => {
    const wrapper = shallow(Foo)
    wrapper.find('button').trigger('click')
    expect(wrapper.vm.value).toEqual('value')
  })
})
```

This test currently fails, because the assertion is called before the promise resolves. One solution is to use the npm package, `flush-promises`. which immediately resolve any unresolved promises. This test is also asynchronous, so like the previous example, we need to let the test runner know to wait before making any assertions. 

If you are using Jest, there are a few options, such as passing a `done` callback, as shown above. Another is to prepend the test with the ES7 'async' keyword. We can now use the the ES7 `await` keyword with `flushPromises`, to immediately resolve the API call.

The updated test looks like this:

``` js
import { shallow } from 'vue-test-utils'
import flushPromises from 'flush-promises'
import Foo from './Foo'
jest.mock('axios')

test('Foo', () => {
  it('fetches async when a button is clicked', () => {
    const wrapper = shallow(Foo)
    wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.vm.value).toEqual('value')
  })
})
```

This same technique can be applied to Vuex actions, which return a promise by default.

