## O método exists

Afirma que `WrapperArray` existe.

Retorna `false` se for chamado em um `WrapperArray` sem objetos `Wrapper` (envolvedor), ou se qualquer um deles não existir.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.findAll('div').exists()).toBe(true)
expect(wrapper.findAll('does-not-exist').exists()).toBe(false)
```
