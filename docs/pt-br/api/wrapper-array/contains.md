# contains(seletor)

Verifica se cada embrulho do array contém correspondência do seletor informado.

Use qualquer [seletor](../selectors.md) válido.

- **Argumentos:**
  - `{string|Component} seletor`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
