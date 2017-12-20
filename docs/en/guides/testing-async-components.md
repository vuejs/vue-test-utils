# Testing Asynchronous Components

> An example project will be made available.

To simplify testing, `vue-test-utils` applies updates _synchronously_. However, there are some techniques you need to be aware ofwhen testing a component with asynchronous behavior such as callbacks or promises.

One common cases is components that use `watch`, which updates asynchronously. Below in an example of a component that renders some content based on a boolean value, which is updated using a watcher:

``` js
<template>
  <div>
    <input v-model="text" />
    <button v-if="showButton">Submit</button>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        text: '',
        showButton: false
      }
    },

    watch: {
      text () {
        this.showButton = true
      }
    }
  }
</script>

This component conditionally renders a submit button, based on whether the user entered some text. Let's see how we might test this:

``` js
import { shallow } from 'vue-test-utils'
import Foo from './Foo'

describe('Foo', () => {
  it('renders a button async when the user enters text', () => {
    expect.assertions(2)
    const wrapper = shallow(Foo)

    wrapper.find('input').element.value = 'Value'
    wrapper.find('input').trigger('input')

    expect(wrapper.vm.showButton).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })
})
```

The above test fails - however, when you test it by hand in a browser, it seems fine!  The reason the test is failing is because properties inside of `watch` are updated asynchronously. In this test, the assertion occurs before `nextTick()` is called, so the `button` is still not visible.

Most unit test libraries provide a callback to let the runner know when the test is complete. Jest and Karma both use `done()`. We can use this, in combination with `nextTick()`, to test the component.


``` js
import { shallow } from 'vue-test-utils'
import Foo from './Foo'

describe('Foo', () => {
  it('renders a button async when the user enters text', (done) => {
    expect.assertions(2)
    const wrapper = mount(Foo)

    wrapper.find('input').element.value = 'Value'
    wrapper.find('input').trigger('input')

    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.showButton).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
      done()
    })
  })
})
```

Now the test passes! 

Another common asynchronous behavior is API calls and Vuex actions. The following examples shows how to test a method that makes an API call. This example is using Jest to run the test and to mock the HTTP library `axios`.

The implementation of the `axios` mock looks like this:

``` js
export default {
  get: () => new Promise(resolve => { 
    resolve({ data: 'value' }) 
  })
}
```

The below component makes an API call when a button is clicked, then assigns the response to `value`.
```
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

This test currently fails, because the assertion is called before the promise resolves. One solution is to use the npm package, `flush-promises`. which immediately resolve any unresolved promises. This test is also asynchronous, so like the previous example, we need to let the test runner know to wait before making any assertions. If you are using Jest, there are a few options, such as passing a `done()` callback, as shown above. 

Another is to prepend the test with the ES7 'async' keyword. We can now use the the ES7 `await` keyword with `flushPromises()`, to immediately resolve the API call.

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

