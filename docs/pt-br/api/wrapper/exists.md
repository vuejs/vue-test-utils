# exists()

Verifica se o `Wrapper` ou o `WrapperArray` existe.

Retorna `false` se chamado com um `Wrapper` ou `WrapperArray` vazio.

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)

expect(wrapper.exists()).toBe(true)
expect(wrapper.find('nao-existe').exists()).toBe(false)
expect(wrapper.findAll('div').exists()).toBe(true)
expect(wrapper.findAll('nao-existe').exists()).toBe(false)
```
