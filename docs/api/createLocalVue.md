## createLocalVue()

- **Returns:**

  - `{Component}`

- **Usage:**

`createLocalVue` returns a Vue class for you to add components, mixins and install plugins without polluting the global Vue class.

Use it with `options.localVue`:

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

- **See also:** [Common Tips](../guides/common-tips.md#applying-global-plugins-and-mixins)
