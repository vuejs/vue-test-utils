# Introduction to unit tests

Unit testing is the process of writing automatic tests for units of code. In Vue, components are our units. 

Vue Test Utils is geared towards testing Vue components. Let's look at a quick overview.

## Writing unit tests with Vue Test Utils

The process of unit testing Vue components with Vue Test Utils is to mount a component in memory. Mounting a component is a bit like setting the component running. The `mount` and `shallow` methods returns a `Wrapper` object that contains the mounted component, and helper methods to perform assertions on the component and to traverse the render tree.

```js
import { mount } from 'vue-test-utils'

const wrapper = mount(Component) // returns a Wrapper containing a mounted Component instance
wrapper.text() // returns text of mounted component inside Wrapper
wrapper.vm // the mounted Vue instance
```

`shallow` stubs the children of a component before it mounts it:

```js
import { shallow } from 'vue-test-utils'

const wrapper = shallow(Component) // returns a Wrapper containing a mounted Component instance
wrapper.vm // the mounted Vue instance
```

Often, you'll need to pass data to the Component. For example, you might need to pass props to a component. You can do this with mount options:

```js
import { mount } from 'vue-test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

*For a full list of options, please see the mount options section of the docs.*

Vue follows a pattern of injecting properties. Normally this is done in a main.js file that creates the Vue instance. This won't be run when you're unit testing, so you'll often need to add properties to the Vue instance yourself. You can do that with the `intercept` option.

```js
import { mount } from 'vue-test-utils'

const $store = {
  getters:
}
mount(Component, {
  intercept: {
    $store // adds the $store object to the Vue instance before mounting component
  }
})
```

# Testing single file components

Most Vue tests will be testing single file components (SFCs). These files require precompilation before they can be run in Node or in the browser.

The two recommended ways are to test with a Jest preprocessor, or use Webpack.

You can learn how to test SFCs by reading these guides:

- [Testing SFCs with Jest]()

## Knowing what to test

It's impossible to say exactly what you should test and what you shouldn't, but there are some general rules you can follow.

You should write test for custom logic inside Vue components. The best way to test the logic of component is to make sure an input creates the expected output. 

For example, imagine we have a Counter component that increments a display counter by 1 each time a button is clicked. The test should perform the click and assert that the counter increased by 1. This ensures that your test is not implementation specific. You can rewrite the logic of the test, and as long as clicking a button still updates the counter text, the test will pass.

## Resourcs

- [Getting started with Jest]()
- [Testing SFCs with Jest]()

