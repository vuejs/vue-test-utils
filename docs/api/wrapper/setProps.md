## setProps

- **Arguments:**

  - `{Object} props`

- **Usage:**

Sets `Wrapper` `vm` props and forces update.

**Note the Wrapper must contain a Vue instance.**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
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
