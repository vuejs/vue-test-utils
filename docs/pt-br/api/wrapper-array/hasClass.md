# hasClass(className)

Verifica se algum wrapper do Array contém uma classe com o nome `className` no elemento do DOM.

- **Argumentos:**
  - `{String} className`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.hasClass('bar')).toBe(true)
```
