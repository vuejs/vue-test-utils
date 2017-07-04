# Getting Started

Get up and running on with the official `vue-test-utils` is straight forward.
Use either `npm` or `yarn` to install the package:

```shell
# npm
$ npm install --save vue-test-utils

# yarn
$ yarn add vue-test-utils
```

Let's test a simple Vue component like a counter:

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
    increment() {
      this.count++
    }
  }
}

```

We have a bunch of nice things we could test here, so let's see what `vue-test-utils` can do for you. The general concept of interacting with a your Vue component through the utils is a wrapper, with a lot of useful helpers under its belt.

**1. How to Wrap a component**

```js
// Import the mount() method from the test utils
// and the component you want to test

import { mount } from 'vue-test-utils'
import Counter from './counter'

// Now mount the component and there you have your wrapper
const wrapper = mount(Counter)
```

So that was quite easy to do right, so let's start with our first spec.
Maybe you are curious about how the rendered HTML output of the component looks like.

**2. Test rendered HTML output of the component**

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

**3. Component data**

Changing the data of the component can be quite useful for efficient testing.

```js

describe('Data interactions', () => {
  beforeEach(() => {
    wrapper.setData({count: 10})
  })

  it('should be set to 10', () => {
    // Get the current data of the Component with the data() method
    expect(wrapper.data().count).to.equal(10)
  })
})

```

**4. Interactions**

This section will introduce two important functions.
`find()` to find an HTML element inside you components HTML output and `trigger()` will allow for firing general events.

```js

describe('Trigger an event', () => {
  it('button should increment the count', () => {
    expect(wrapper.data().count).to.equal(0)
    let button = wrapper.find('button')
    button.trigger('click')
    expect(wrapper.data().count).to.equal(1)
  })
})

```

**5. Handle async DOM updates**

As you probably know, Vue updates the DOM based on an internal `tick` to prevent unnecessary rerenders if a bunch of data gets changed. That's why `Vue.nextTick(...)` allows you to verify that DOM changes have been applied correctly. Luckily this is handled for you by the `.html()` method.

```js

describe('DOM updates', () => {
  it('html() should account for async DOM updates', () => {
    expect(wrapper.html()).to.equal('<div>0<button>Increment</button></div>')
    wrapper.setData({ count: 23 })
    expect(wrapper.html()).to.equal('<div>23<button>Increment</button></div>')
  })
})

```

## What Next

Of course there is a lot more discover for you in `vue-test-utils` and it's recommended to go through the list of the [provided API](SUMMARY.md)

The `vue-test-utils` aim to play nice with your testrunner, should you run into any issues though, you'll find the official repository here: [vue-test-utils](https://github.com/vuejs/vue-test-utils)
