# is(seletor)

Verifica se algum wrapper do Array possui o [seletor](../selectors.md) no seu `vm`.

- **Argumentos:**
  - `{string|Component} seletor`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.find('div')

expect(divArray.is('div')).toBe(true)
```
