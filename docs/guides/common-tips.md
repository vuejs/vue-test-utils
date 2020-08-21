## Common Tips

### Knowing What to Test

For UI components, we don't recommend aiming for complete line-based coverage, because it leads to too much focus on the internal implementation details of the components and could result in brittle tests.

Instead, we recommend writing tests that assert your component's public interface, and treat its internals as a black box. A single test case would assert that some input (user interaction or change of props) provided to the component results in the expected output (render result or emitted custom events).

For example, imagine a `Counter` component which increments a display counter by 1 each time a button is clicked. Its test case would simulate the click and assert that the rendered output has increased by 1. The test should not care about how the `Counter` increments the value – it only cares about the input and the output.

The benefit of this approach is that as long as your component's public interface remains the same, your tests will pass no matter how the component's internal implementation changes over time.

This topic is discussed with more details in a [great presentation by Matt O'Connell](https://www.youtube.com/watch?v=OIpfWTThrK8).

### Shallow mounting

Sometimes, mounting a whole component with all its all dependencies might become slow or cumbersome. For example, components that contain many child components.

Vue Test Utils allows you to mount a component without rendering its child components (by stubbing them) with the [`shallowMount`](../api/#shallowmount) method.

```js
import { shallowMount } from '@vue/test-utils'
import Component from '../Component.vue'

const wrapper = shallowMount(Component)
```

Like [mount](../api/#mount), it creates a [Wrapper](../api/wrapper) that contains the mounted and rendered Vue component, but with stubbed child components.

Notice that using `shallowMount` will make the component under testing different from the component you run in your application – some of its parts won't be rendered! This is why it is not the suggested way of testing components unless you face performance issues or need to simplify test arrangements.

### Lifecycle Hooks

<div class="vueschool" style="margin-top:1em;"><a href="https://vueschool.io/lessons/learn-how-to-test-vuejs-lifecycle-methods?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn how to use Vue Test Utils to test Vue.js Lifecycle Hooks with Vue School">Learn how to test lifecycle methods and intervals with Vue School</a></div>

When using either the `mount` or `shallowMount` methods, you can expect your component to respond to all lifecycle events. However, it is important to note that `beforeDestroy` and `destroyed` _will not be triggered_ unless the component is manually destroyed using `Wrapper.destroy()`.

Additionally, the component will not be automatically destroyed at the end of each spec, and it is up to the user to stub or manually clean up tasks that will continue to run (`setInterval` or `setTimeout`, for example) before the end of each spec.

### Writing asynchronous tests (new)

By default, Vue batches updates to run asynchronously (on the next "tick"). This is to prevent unnecessary DOM re-renders, and watcher computations ([see the docs](https://vuejs.org/v2/guide/reactivity.html#Async-Update-Queue) for more details).

This means that you **must** wait for updates to run after you change a reactive property. You can do that by awaiting mutation methods like `trigger`:

```js
it('updates text', async () => {
  const wrapper = mount(Component)
  await wrapper.trigger('click')
  expect(wrapper.text()).toContain('updated')
  await wrapper.trigger('click')
  wrapper.text().toContain('some different text')
})

// Or if you're without async/await
it('render text', done => {
  const wrapper = mount(TestComponent)
  wrapper.trigger('click').then(() => {
    expect(wrapper.text()).toContain('updated')
    wrapper.trigger('click').then(() => {
      expect(wrapper.text()).toContain('some different text')
      done()
    })
  })
})
```

Learn more in the [Testing Asynchronous Behavior](../guides/README.md#testing-asynchronous-behavior)

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
import { mount } from '@vue/test-utils'
import ParentComponent from '@/components/ParentComponent'
import ChildComponent from '@/components/ChildComponent'

describe('ParentComponent', () => {
  it("displays 'Emitted!' when custom event is emitted", () => {
    const wrapper = mount(ParentComponent)
    wrapper.findComponent(ChildComponent).vm.$emit('custom')
    expect(wrapper.html()).toContain('Emitted!')
  })
})
```

### Manipulating Component State

You can directly manipulate the state of the component using the `setData` or `setProps` method on the wrapper:

```js
it('manipulates state', async () => {
  await wrapper.setData({ count: 10 })

  await wrapper.setProps({ foo: 'bar' })
})
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

### Mocking Transitions

Although calling `await Vue.nextTick()` works well for most use cases, there are some situations where additional workarounds are required. These issues will be solved before the `vue-test-utils` library moves out of beta. One such example is unit testing components with the `<transition>` wrapper provided by Vue.

```vue
<template>
  <div>
    <transition>
      <p v-if="show">Foo</p>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true
    }
  }
}
</script>
```

You might want to write a test that verifies that Foo is shown, then when `show` is set to `false`, Foo is no longer rendered. Such a test could be written as follows:

```js
test('should render Foo, then hide it', async () => {
  const wrapper = mount(Foo)
  expect(wrapper.text()).toMatch(/Foo/)

  await wrapper.setData({
    show: false
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

In practice, although we are calling and awaiting `setData` to ensure the DOM is updated, this test fails. This is an ongoing issue related to how Vue implements the `<transition>` component, that we would like to solve before version 1.0. For now, there are some workarounds:

#### Using a `transitionStub` helper

```js
const transitionStub = () => ({
  render: function(h) {
    return this.$options._renderChildren
  }
})

test('should render Foo, then hide it', async () => {
  const wrapper = mount(Foo, {
    stubs: {
      transition: transitionStub()
    }
  })
  expect(wrapper.text()).toMatch(/Foo/)

  await wrapper.setData({
    show: false
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

This overrides the default behavior of the `<transition>` component and renders the children as soon as the relevant boolean condition changes, as opposed to applying CSS classes, which is how Vue's `<transition>` component works.

#### Avoid `setData`

Another alternative is to simply avoid using `setData` by writing two tests, with the required setup performed using `mount` or `shallowMount` options:

```js
test('should render Foo', async () => {
  const wrapper = mount(Foo, {
    data() {
      return {
        show: true
      }
    }
  })

  expect(wrapper.text()).toMatch(/Foo/)
})

test('should not render Foo', async () => {
  const wrapper = mount(Foo, {
    data() {
      return {
        show: false
      }
    }
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

### Applying Global Plugins and Mixins

Some of the components may rely on features injected by a global plugin or mixin, for example `vuex` and `vue-router`.

If you are writing tests for components in a specific app, you can setup the same global plugins and mixins once in the entry of your tests. But in some cases, for example testing a generic component suite that may get shared across different apps, it's better to test your components in a more isolated setup, without polluting the global `Vue` constructor. We can use the [`createLocalVue`](../api/createLocalVue.md) method to achieve that:

```js
import { createLocalVue, mount } from '@vue/test-utils'

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
