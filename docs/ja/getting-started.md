# Getting Started

Getting up and running with the official `vue-test-utils` package is straight forward.
Use either `npm` or `yarn` to install the package:

```shell
# npm
$ npm install --save vue-test-utils

# yarn
$ yarn add vue-test-utils
```

**Notice:** To test Vue components and to make use of the `vue-test-utils` run the specs in a browser with a testrunner like [Karma](https://karma-runner.github.io/1.0/index.html) or node based runners that support virtual DOMs like `jsDOM` (e.g.: [jest](https://facebook.github.io/jest/), [ava](https://github.com/avajs/ava))

Let's test a simple Vue component like a counter to get a feeling for how to use these utils.


```js
// counter.js

export default {
  template: `
    <div>
      {{ count }}
      <button @click="increment">Increment</button>
    </div>
  `,

  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}

```

This component is very basic in it's capabilities and scope,
but never the less it allows for things we could test here. The general concept of interacting with a Vue component through the `vue-test-utils` is using a wrapper. This wrapper comes with a lot of useful helpers under its belt that should make writing even complex specs a breeze. But let's start simple:

### How to wrap a component

As mentioned above, the wrapper is the core element that allows for efficient interaction with a component. The flow goes as following:

```js
// Import the mount() method from the test utils
// and the component you want to test

import { mount } from 'vue-test-utils'
import Counter from './counter'

// Now mount the component and you have the wrapper
const wrapper = mount(Counter)

// To inspect the wrapper deeper just log it to the console
// and your adventure with the vue-test-utils begins
console.log(wrapper)
```

We already took the first hurdle, and luckily it was an easy one. So, let's put the wrapper to good use.


### Test rendered HTML output of the component

As a first spec it would be nice to verify that the rendered HTML output of the component looks like expected.

```js
// For getting the html output, the wrapper provides
// a html() method for you.

describe('Counter', () => {
  it('renders the correct markup', () => {
    expect(wrapper.html()).to.equal('<div>0<button>Increment</button></div>')
  })

  // it's also easy to check for the existence of elements
  it('has a button', () => {
    expect(wrapper.contains('button')).to.equal(true)
  })
})
```

That was easy as well, so let's step up the game.

### Component data

Changing the data of the component can be quite useful for efficient testing. The method `setData({...})` is meant for changing the data on the instance. You can interact with the instance directly using the `vm` key. As Vue automatically sets all data values and computed properties as getters on the root instance, we can access those values straight away.
It may be useful to change the data accordingly for a whole group of specs, so `beforeEach()` could be a good place for that:

```js

describe('Data interactions', () => {
  beforeEach(() => {
    wrapper.setData({ count: 10 })
  })

  it('should be set to 10', () => {
    expect(wrapper.vm.count).to.equal(10)
  })
})

```

### Interactions

This section will introduce two important methods of the wrapper object.
`find()` to find an HTML element inside your component's HTML output and `trigger()` will allow for firing general events.

```js

describe('Trigger an event', () => {
  it('button should increment the count', () => {
    expect(wrapper.vm.count).to.equal(0)
    const button = wrapper.find('button')
    button.trigger('click')
    expect(wrapper.vm.count).to.equal(1)
  })
})

```

### Handle async DOM updates

Vue updates the DOM based on an internal `tick` to prevent unnecessary rerenders if a bunch of data gets changed. That's why `Vue.nextTick(...)` allows you to verify that DOM changes have been applied correctly and to pass in a callback to run right after that. Luckily `vue-test-utils` got you covered here as well. The `update()` method will enforce a rerender. Using `html()` afterwards will return the updated DOM.

```js

describe('DOM updates', () => {
  it('html() should account for async DOM updates', () => {
    expect(wrapper.html()).to.equal('<div>0<button>Increment</button></div>')
    wrapper.setData({ count: 23 })
    wrapper.update()
    expect(wrapper.html()).to.equal('<div>23<button>Increment</button></div>')
  })
})

```

## What Next

Of course there is a lot more  to discover for you in `vue-test-utils` and it's recommended to go through the list of the [provided API](SUMMARY.md) to get a good oversight.

The `vue-test-utils` aim to play nice with various testrunners, should you run into any issues though, the official repository can be found here: [vue-test-utils](https://github.com/vuejs/vue-test-utils)
