# contains(selector)

Verifica se cada wrapper do Array contém correspondência do seletor informado.

Use qualquer [seletor](../selectors.md) válido.

- **Argumentos:**
  - `{String|Component} selector`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
