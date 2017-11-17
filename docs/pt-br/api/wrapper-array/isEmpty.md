# isEmpty()

Verifica se algum embrulho do array não tem um elemento filho.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.isEmpty()).toBe(true)
```
