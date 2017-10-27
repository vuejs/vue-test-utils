# setProps(props)

- **Принимает:**
  - `{Object} props`

- **Использование:**

Sets `Wrapper` `vm` props and forces update.

**Обратите внимание, что `Wrapper` должен содержать экземпляр Vue.**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.vm.foo).to.equal('bar')
```

You can also pass a `propsData` object, which will initialize the Vue instance with passed values.

``` js
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

``` js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})

expect(wrapper.vm.foo).to.equal('bar')
```