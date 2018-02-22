# setProps(props)

- **Arguments:**
  - `{Object} props`

- **Usage:**

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>Sets `Wrapper` `vm` props and forces update.</p>

**Note the Wrapper must contain a Vue instance.**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
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
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})

expect(wrapper.vm.foo).toBe('bar')
```
