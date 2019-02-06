# Using with Vuex

In this guide, we'll see how to test Vuex in components with Vue Test Utils, and how to approach testing a Vuex store.

## Testing Vuex in components

### Mocking Actions

Let’s look at some code.

This is the component we want to test. It calls Vuex actions.

```html
<template>
  <div class="text-align-center">
    <input type="text" @input="actionInputIfTrue" />
    <button @click="actionClick()">Click</button>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    methods: {
      ...mapActions(['actionClick']),
      actionInputIfTrue: function actionInputIfTrue(event) {
        const inputValue = event.target.value
        if (inputValue === 'input') {
          this.$store.dispatch('actionInput', { inputValue })
        }
      }
    }
  }
</script>
```

For the purposes of this test, we don’t care what the actions do, or what the store looks like. We just need to know that these actions are being fired when they should, and that they are fired with the expected value.

To test this, we need to pass a mock store to Vue when we shallowMount our component.

Instead of passing the store to the base Vue constructor, we can pass it to a - [localVue](../api/options.md#localvue). A localVue is a scoped Vue constructor that we can make changes to without affecting the global Vue constructor.

Let’s see what this looks like:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Actions'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Actions.vue', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn()
    }
    store = new Vuex.Store({
      actions
    })
  })

  it('dispatches "actionInput" when input event value is "input"', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput).toHaveBeenCalled()
  })

  it('does not dispatch "actionInput" when event value is not "input"', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput).not.toHaveBeenCalled()
  })

  it('calls store action "actionClick" when button is clicked', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

What’s happening here? First we tell Vue to use Vuex with the `localVue.use` method. This is just a wrapper around `Vue.use`.

We then make a mock store by calling `new Vuex.Store` with our mock values. We only pass it the actions, since that’s all we care about.

The actions are [jest mock functions](https://jestjs.io/docs/en/mock-functions.html). These mock functions give us methods to assert whether the actions were called or not.

We can then assert in our tests that the action stub was called when expected.

Now the way we define the store might look a bit foreign to you.

We’re using `beforeEach` to ensure we have a clean store before each test. `beforeEach` is a mocha hook that’s called before each test. In our test, we are reassigning the store variables value. If we didn’t do this, the mock functions would need to be automatically reset. It also lets us change the state in our tests, without it affecting later tests.

The most important thing to note in this test is that **we create a mock Vuex store and then pass it to Vue Test Utils**.

Great, so now we can mock actions, let’s look at mocking getters.

### Mocking Getters

```html
<template>
  <div>
    <p v-if="inputValue">{{inputValue}}</p>
    <p v-if="clicks">{{clicks}}</p>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    computed: mapGetters(['clicks', 'inputValue'])
  }
</script>
```

This is a fairly simple component. It renders the result of the getters `clicks` and `inputValue`. Again, we don’t really care about what those getters return – just that their result is being rendered correctly.

Let’s see the test:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Getters from '../../../src/components/Getters'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Getters.vue', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      clicks: () => 2,
      inputValue: () => 'input'
    }

    store = new Vuex.Store({
      getters
    })
  })

  it('Renders "store.getters.inputValue" in first p tag', () => {
    const wrapper = shallowMount(Getters, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Renders "store.getters.clicks" in second p tag', () => {
    const wrapper = shallowMount(Getters, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```

This test is similar to our actions test. We create a mock store before each test, pass it as an option when we call `shallowMount`, and assert that the value returned by our mock getters is being rendered.

This is great, but what if we want to check our getters are returning the correct part of our state?

### Mocking with Modules

[Modules](https://vuex.vuejs.org/guide/modules.html) are useful for separating out our store into manageable chunks. They also export getters. We can use these in our tests.

Let’s look at our component:

```html
<template>
  <div>
    <button @click="moduleActionClick()">Click</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    methods: {
      ...mapActions(['moduleActionClick'])
    },

    computed: mapGetters(['moduleClicks'])
  }
</script>
```

Simple component that includes one action and one getter.

And the test:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import MyComponent from '../../../src/components/MyComponent'
import myModule from '../../../src/store/myModule'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('MyComponent.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      clicks: 2
    }

    actions = {
      moduleActionClick: jest.fn()
    }

    store = new Vuex.Store({
      modules: {
        myModule: {
          state,
          actions,
          getters: myModule.getters
        }
      }
    })
  })

  it('calls store action "moduleActionClick" when button is clicked', () => {
    const wrapper = shallowMount(MyComponent, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('renders "state.clicks" in first p tag', () => {
    const wrapper = shallowMount(MyComponent, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.clicks.toString())
  })
})
```

### Testing a Vuex Store

There are two approaches to testing a Vuex store. The first approach is to unit test the getters, mutations, and actions separately. The second approach is to create a store and test against that. We'll look at both approaches.

To see how to test a Vuex store, we're going to create a simple counter store. The store will have an `increment` mutation and an `evenOrOdd` getter.

```js
// mutations.js
export default {
  increment(state) {
    state.count++
  }
}
```

```js
// getters.js
export default {
  evenOrOdd: state => (state.count % 2 === 0 ? 'even' : 'odd')
}
```

### Testing getters, mutations, and actions separately

Getters, mutations, and actions are all JavaScript functions, so we can test them without using Vue Test Utils and Vuex.

The benefit to testing getters, mutations, and actions separately is that your unit tests are detailed. When they fail, you know exactly what is wrong with your code. The downside is that you will need to mock Vuex functions, like `commit` and `dispatch`. This can lead to a situation where your unit tests pass, but your production code fails because your mocks are incorrect.

We'll create two test files, `mutations.spec.js` and `getters.spec.js`:

First, let's test the `increment` mutations:

```js
// mutations.spec.js

import mutations from './mutations'

test('"increment" increments "state.count" by 1', () => {
  const state = {
    count: 0
  }
  mutations.increment(state)
  expect(state.count).toBe(1)
})
```

Now let's test the `evenOrOdd` getter. We can test it by creating a mock `state`, calling the getter with the `state` and checking it returns the correct value.

```js
// getters.spec.js

import getters from './getters'

test('"evenOrOdd" returns even if "state.count" is even', () => {
  const state = {
    count: 2
  }
  expect(getters.evenOrOdd(state)).toBe('even')
})

test('"evenOrOdd" returns odd if "state.count" is odd', () => {
  const state = {
    count: 1
  }
  expect(getters.evenOrOdd(state)).toBe('odd')
})
```

### Testing a running store

Another approach to testing a Vuex store is to create a running store using the store config.

The benefit of creating a running store instance is we don't have to mock any Vuex functions.

The downside is that when a test breaks, it can be difficult to find where the problem is.

Let's write a test. When we create a store, we'll use `localVue` to avoid polluting the Vue base constructor. The test creates a store using the `store-config.js` export:

```js
// store-config.js

import mutations from './mutations'
import getters from './getters'

export default {
  state: {
    count: 0
  },
  mutations,
  getters
}
```

```js
// store-config.spec.js

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import storeConfig from './store-config'
import { cloneDeep } from 'lodash'

test('increments "count" value when "increment" is commited', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.state.count).toBe(0)
  store.commit('increment')
  expect(store.state.count).toBe(1)
})

test('updates "evenOrOdd" getter when "increment" is commited', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.getters.evenOrOdd).toBe('even')
  store.commit('increment')
  expect(store.getters.evenOrOdd).toBe('odd')
})
```

Notice that we use `cloneDeep` to clone the store config before creating a store with it. This is because Vuex mutates the options object used to create the store. To make sure we have a clean store in each test, we need to clone the `storeConfig` object.

### Resources

- [Example project for testing the components](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [Example project for testing the store](https://github.com/eddyerburgh/testing-vuex-store-example)
- [`localVue`](../api/options.md#localvue)
- [`createLocalVue`](../api/createLocalVue.md)
