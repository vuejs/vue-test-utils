# is(selector)

Verifica se algum wrapper do Array possui o [seletor](../selectors.md) no seu `vm`.

- **Argumentos:**
  - `{String|Component} selector`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.find('div')

expect(divArray.is('div')).toBe(true)
```
