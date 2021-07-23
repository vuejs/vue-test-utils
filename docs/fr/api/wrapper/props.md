## props

Retourne l'objet props `Wrapper` `vm`. Si `key` est fourni, la valeur pour `key` sera retournée.

**Note : le Wrapper doit contenir une instance de Vue.**

- **Arguments:**

  - `{string} key` **facultatif**

- **Retours:** `{[prop: string]: any} | any`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    bar: 'baz'
  }
})
expect(wrapper.props().bar).toBe('baz')
expect(wrapper.props('bar')).toBe('baz')
```
