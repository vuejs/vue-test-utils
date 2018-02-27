# isEmpty()

Verifica se algum wrapper do Array não tem um elemento filho.

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.isEmpty()).toBe(true)
```
