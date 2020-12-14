## setProps

- **Arguments:**

  - `{Object} props`

- **Usage:**

Sets `Wrapper` `vm` props and forces update.

::: warning
`setProps` could be called only for top-level component, mounted by `mount` or `shallowMount`
:::

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setProps demo', async () => {
  const wrapper = mount(Foo)

  await wrapper.setProps({ foo: 'bar' })

  expect(wrapper.vm.foo).toBe('bar')
})
```

You can also pass a `propsData` object, which will initialize the Vue instance with passed values.

```js
// Foo.vue
export default {
  props: {
    foo: {
      type: String,
      required: true
    }
  }
}
```

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})

expect(wrapper.vm.foo).toBe('bar')
```
