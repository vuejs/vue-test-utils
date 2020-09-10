## createLocalVue()

- **Arguments:**

  - `{Object} options`
    - `{Function} errorHandler`

- **Returns:**

  - `{Component}`

- **Usage:**

`createLocalVue` returns a Vue class for you to add components, mixins and install plugins without polluting the global Vue class.

The `errorHandler` option can be used to handle uncaught errors during component render function and watchers.

Use it with `options.localVue`:

**Without options:**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import MyPlugin from 'my-plugin'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(MyPlugin)
const wrapper = shallowMount(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallowMount(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

**With the [`errorHandler`](https://vuejs.org/v2/api/#errorHandler) option:**

```js
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const errorHandler = (err, vm, info) => {
  expect(err).toBeInstanceOf(Error)
}

const localVue = createLocalVue({
  errorHandler
})

// Foo throws an error inside a lifecycle hook
const wrapper = shallowMount(Foo, {
  localVue
})
```

- **See also:** [Common Tips](../guides/common-tips.md#applying-global-plugins-and-mixins)
