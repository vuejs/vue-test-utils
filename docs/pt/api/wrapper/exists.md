## O método exists

Afirma que o `Wrapper` (envolvedor) existe.

Retorna `false` se chamando em um `Wrapper` o qual não existe.

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.exists()).toBe(true)
expect(wrapper.find('does-not-exist').exists()).toBe(false)
```
