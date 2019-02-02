## Common Tips

### Knowing What to Test

For UI components, we don't recommend aiming for complete line-based coverage, because it leads to too much focus on the internal implementation details of the components and could result in brittle tests.

Instead, we recommend writing tests that assert your component's public interface, and treat its internals as a black box. A single test case would assert that some input (user interaction or change of props) provided to the component results in the expected output (render result or emitted custom events).

For example, for the `Counter` component which increments a display counter by 1 each time a button is clicked, its test case would simulate the click and assert that the rendered output has increased by 1. The test doesn't care about how the `Counter` increments the value, it only cares about the input and the output.

The benefit of this approach is that as long as your component's public interface remains the same, your tests will pass no matter how the component's internal implementation changes over time.

This topic is discussed with more details in a [great presentation by Matt O'Connell](https://www.youtube.com/watch?v=OIpfWTThrK8).

### Shallow Rendering

In unit tests, we typically want to focus on the component being tested as an isolated unit and avoid indirectly asserting the behavior of its child components.

In addition, for components that contain many child components, the entire rendered tree can get really big. Repeatedly rendering all child components could slow down our tests.

Vue Test Utils allows you to mount a component without rendering its child components (by stubbing them) with the `shallowMount` method:

```js
import { shallowMount } from '@vue/test-utils'

const wrapper = shallowMount(Component)
wrapper.vm // the mounted Vue instance
```

### Asserting Emitted Events

Each mounted wrapper automatically records all events emitted by the underlying Vue instance. You can retrieve the recorded events using the `wrapper.emitted()` method:

```js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
`wrapper.emitted()` returns the following object:
{
  foo: [[], [123]]
}
*/
```

You can then make assertions based on these data:

```js
// assert event has been emitted
expect(wrapper.emitted().foo).toBeTruthy()

// assert event count
expect(wrapper.emitted().foo.length).toBe(2)

// assert event payload
expect(wrapper.emitted().foo[1]).toEqual([123])
```

You can also get an Array of the events in their emit order by calling [`wrapper.emittedByOrder()`](../api/wrapper/emittedByOrder.md).

### Emitting Event from Child Component

You can emit a custom event from a child component by accessing the instance.

**Component under test**

```html
<template>
  <div>
    <child-component @custom="onCustom" />
    <p v-if="emitted">Emitted!</p>
  </div>
</template>

<script>
  import ChildComponent from './ChildComponent'

  export default {
    name: 'ParentComponent',
    components: { ChildComponent },
    data() {
      return {
        emitted: false
      }
    },
    methods: {
      onCustom() {
        this.emitted = true
      }
    }
  }
</script>
```

**Test**

```js
import { shallowMount } from '@vue/test-utils'
import ParentComponent from '@/components/ParentComponent'
import ChildComponent from '@/components/ChildComponent'

describe('ParentComponent', () => {
  it("displays 'Emitted!' when custom event is emitted", () => {
    const wrapper = shallowMount(ParentComponent)
    wrapper.find(ChildComponent).vm.$emit('custom')
    expect(wrapper.html()).toContain('Emitted!')
  })
})
```

### Manipulating Component State

You can directly manipulate the state of the component using the `setData` or `setProps` method on the wrapper:

```js
wrapper.setData({ count: 10 })

wrapper.setProps({ foo: 'bar' })
```

### Mocking Props

You can pass props to the component using Vue's built-in `propsData` option:

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

You can also update the props of an already-mounted component with the `wrapper.setProps({})` method.

_For a full list of options, please see the [mount options section](../api/options.md) of the docs._

### Applying Global Plugins and Mixins

Some of the components may rely on features injected by a global plugin or mixin, for example `vuex` and `vue-router`.

If you are writing tests for components in a specific app, you can setup the same global plugins and mixins once in the entry of your tests. But in some cases, for example testing a generic component suite that may get shared across different apps, it's better to test your components in a more isolated setup, without polluting the global `Vue` constructor. We can use the [`createLocalVue`](../api/createLocalVue.md) method to achieve that:

```js
import { createLocalVue } from '@vue/test-utils'

// create an extended `Vue` constructor
const localVue = createLocalVue()

// install plugins as normal
localVue.use(MyPlugin)

// pass the `localVue` to the mount options
mount(Component, {
  localVue
})
```

**Note some plugins, like Vue Router, add read-only properties to the global Vue constructor. This makes it impossible to reinstall the plugin on a `localVue` constructor, or add mocks for these read-only properties**

### Mocking Injections

Another strategy for injected props is simply mocking them. You can do that with the `mocks` option:

```js
import { mount } from '@vue/test-utils'

const $route = {
  path: '/',
  hash: '',
  params: { id: '123' },
  query: { q: 'hello' }
}

mount(Component, {
  mocks: {
    // adds mocked `$route` object to the Vue instance
    // before mounting component
    $route
  }
})
```

### Stubbing components

You can override components that are registered globally or locally by using the `stubs` option:

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  // Will resolve globally-registered-component with
  // empty stub
  stubs: ['globally-registered-component']
})
```

### Dealing with Routing

Since routing by definition has to do with the overall structure of the application and involves multiple components, it is best tested via integration or end-to-end tests. For individual components that rely on `vue-router` features, you can mock them using the techniques mentioned above.

### Detecting styles

Your test can only detect inline styles when running in `jsdom`.
