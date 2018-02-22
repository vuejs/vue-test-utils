# isVueInstance()

Verifica se algum wrapper do Array é uma instância do Vue.

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

expect(barArray.isVueInstance()).toBe(true)
```
