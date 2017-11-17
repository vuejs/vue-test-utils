# hasProp(propriedade, valor)

Verifica se algum wrapper do array possui a `propriedade` com o `valor` no `vm`.

**Nota: o wrapper deve ser uma intância do Vue.**

- **Argumentos:**
  - `{string} propriedade`
  - `{any} valor`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

expect(barArray.hasProp('bar', 10)).toBe(true)
```
