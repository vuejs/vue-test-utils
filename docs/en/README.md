# `vue-test-utils`

`vue-test-utils` is the official test utility library for Vue.js.

It provides methods that make it easier to traverse, query and assert your Vue components' output in unit tests.

## Introduction

`vue-test-utils` tests Vue components by mounting them in isolation, mocking the necessary inputs (props, injections and user events) and asserting the outputs (render result, emitted custom events).

### Mounting Components

The `mount` method returns a [Wrapper](./api/wrapper.md) object that contains the mounted component, and helper methods to perform assertions on the component and to traverse the render tree.

```js
import { mount } from 'vue-test-utils'

const wrapper = mount(Component) // returns a Wrapper containing a mounted Component instance
wrapper.text() // returns text of mounted component inside Wrapper
wrapper.vm // the mounted Vue instance
```

If we were testing a counter component that increments its count on a button click, the test would look like this:

```js
import { mount } from 'vue-test-utils'
import Counter from './Counter.vue'

const wrapper = mount(Counter)
wrapper.find('button').trigger('click')
expect(wrapper.text()).toContain('1')
```

### Stubbing Child Components with `shallow`

For components that contain many child components, the entire rendered tree can get really big. But in unit tests, we typically want to focus on the component being tested as a unit and avoid indirectly asserting the behavior of its child components. Also, repeatedly rendering all child components could slow down our tests. To mount a component without rendering its child components, we can use the `shallow` method which stubs the child components:

```js
import { shallow } from 'vue-test-utils'

const wrapper = shallow(Component) // returns a Wrapper containing a mounted Component instance
wrapper.vm // the mounted Vue instance
```

### Mocking Props

You can pass props to the component using Vue's built-in `propsData` option:

```js
import { mount } from 'vue-test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

*For a full list of options, please see the [mount options section](./api/options.md) of the docs.*

### Mocking Injections

Some Vue plugins such as Vue Router and Vuex auto-injects properties into all child components from the root instance. Since in unit tests we are mounting the component directly without a root instance, we may need to mock these injections. You can do that with the `intercept` option.

```js
import { mount } from 'vue-test-utils'

const $store = {
  getters: {}
}
mount(Component, {
  intercept: {
    $store // adds the mocked $store object to the Vue instance before mounting component
  }
})
```

Note you can also directly inject real Vuex stores or router instances when mounting the component. See [Using with Vuex](./guides/using-with-vuex.md) and [Using with Vue Router](./guides/using-with-vue-router.md) for more details.

## Testing Single-File Components

Single-file Vue components (SFCs) require pre-compilation before they can be run in Node or in the browser. There are two recommended ways to perform the compilation: with a Jest preprocessor, or directly use webpack.

The `jest-vue` preprocessor supports basic SFC functionalities, but currently does not handle style blocks or custom blocks, which are only supported in `vue-loader`. If you rely on these features or other webpack-specific configurations, you will need to use a webpack + `vue-loader` based setup.

Read the following guides for different setups:

- [Testing SFCs with Jest](./guides/testing-SFCs-with-jest.md)
- [Testing SFCs with Mocha + webpack](./guides/testing-SFCs-with-mocha-webpack.md)

### Knowing What to Test

For UI components, we don't recommend aiming for complete line-based coverage, because it leads to too much focus on the internal implementation details of the components and could result in brittle tests.

Instead, we recommend writing tests that assert your component's public interface, and treat its internals as a black box. A single test case would assert that some input (user interaction or change of props) provided to the component results in the expected output (render result or emitted custom events).

For example, imagine we have a `Counter` component that increments a display counter by 1 each time a button is clicked. Its test case would simulate the click and assert that the rendered output has increased by 1. The test doesn't care about how the Counter increments the value, it only cares about the input and the output.

The benefit of this approach is that as long as your component's public interface remains the same, your tests will pass no matter how the component's internal implementation changes over time.

This topic is discussed with more details in a [great presentation by Matt O'Connell](http://slides.com/mattoconnell/deck#/).
