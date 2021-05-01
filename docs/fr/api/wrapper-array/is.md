## is

Affirmer que chaque `Wrapper` dans le noeud DOM `WrapperArray` ou `vm` correspond à [selector](../selectors.md).

- **Arguments:**

  - `{string|Component} selector`

- **Retours:** `{boolean}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.is('div')).toBe(true)
```
